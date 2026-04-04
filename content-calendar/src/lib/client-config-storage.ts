import { put, list } from "@vercel/blob";
import type { ProjectConfig, ClientConfig } from "@/data/client-config";
import { toClientConfig } from "@/data/client-config";
import { DEFAULT_PROJECT_CONFIGS } from "@/data/client-configs";

function configBlobPath(slug: string): string {
  return `config/clients/${slug}.json`;
}

const CONFIG_CACHE: Record<string, ProjectConfig> = {};

// ─── ProjectConfig API ───

export async function getProjectConfig(
  slug: string
): Promise<ProjectConfig | null> {
  if (CONFIG_CACHE[slug]) return CONFIG_CACHE[slug];

  // Try Blob first
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const path = configBlobPath(slug);
      const { blobs } = await list({ prefix: path, limit: 1 });
      if (blobs.length > 0) {
        const res = await fetch(blobs[0].url + `?t=${Date.now()}`, {
          cache: "no-store",
        });
        if (res.ok) {
          const config = (await res.json()) as ProjectConfig;
          CONFIG_CACHE[slug] = config;
          return config;
        }
      }
    } catch (e) {
      console.error("Config blob read error:", e);
    }
  }

  // Fallback to hardcoded defaults
  const fallback =
    DEFAULT_PROJECT_CONFIGS.find((c) => c.slug === slug) ?? null;
  if (fallback) CONFIG_CACHE[slug] = fallback;
  return fallback;
}

export async function listProjectConfigs(): Promise<ProjectConfig[]> {
  const configs = new Map<string, ProjectConfig>();

  // Start with hardcoded defaults
  for (const c of DEFAULT_PROJECT_CONFIGS) {
    configs.set(c.slug, c);
  }

  // Overlay with Blob configs
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { blobs } = await list({ prefix: "config/clients/", limit: 100 });
      for (const blob of blobs) {
        const match = blob.pathname.match(/config\/clients\/(.+)\.json$/);
        if (!match) continue;
        try {
          const res = await fetch(blob.url + `?t=${Date.now()}`, {
            cache: "no-store",
          });
          if (res.ok) {
            const config = (await res.json()) as ProjectConfig;
            configs.set(config.slug, config);
          }
        } catch {
          // skip invalid configs
        }
      }
    } catch (e) {
      console.error("Config blob list error:", e);
    }
  }

  return Array.from(configs.values());
}

export async function saveProjectConfig(
  config: ProjectConfig
): Promise<void> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return;

  const path = configBlobPath(config.slug);
  await put(path, JSON.stringify(config), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });

  CONFIG_CACHE[config.slug] = config;
}

// ─── Legacy compat (used by existing components) ───

export async function getClientConfig(
  slug: string
): Promise<ClientConfig | null> {
  const project = await getProjectConfig(slug);
  return project ? toClientConfig(project) : null;
}

export async function listClientConfigs(): Promise<ClientConfig[]> {
  const projects = await listProjectConfigs();
  return projects.map(toClientConfig);
}

export async function saveClientConfig(config: ClientConfig): Promise<void> {
  // Legacy: convert to minimal ProjectConfig and save
  const existing = await getProjectConfig(config.slug);
  if (existing) {
    await saveProjectConfig({ ...existing, name: config.name });
  }
}
