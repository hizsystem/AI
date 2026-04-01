import { put, list } from "@vercel/blob";
import type { ClientConfig } from "@/data/client-config";
import { DEFAULT_CLIENT_CONFIGS } from "@/data/client-configs";

function configBlobPath(slug: string): string {
  return `config/clients/${slug}.json`;
}

const CONFIG_CACHE: Record<string, ClientConfig> = {};

export async function getClientConfig(
  slug: string
): Promise<ClientConfig | null> {
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
          const config = (await res.json()) as ClientConfig;
          CONFIG_CACHE[slug] = config;
          return config;
        }
      }
    } catch (e) {
      console.error("Config blob read error:", e);
    }
  }

  // Fallback to hardcoded defaults
  const fallback = DEFAULT_CLIENT_CONFIGS.find((c) => c.slug === slug) ?? null;
  if (fallback) CONFIG_CACHE[slug] = fallback;
  return fallback;
}

export async function listClientConfigs(): Promise<ClientConfig[]> {
  const configs = new Map<string, ClientConfig>();

  // Start with hardcoded defaults
  for (const c of DEFAULT_CLIENT_CONFIGS) {
    configs.set(c.slug, c);
  }

  // Overlay with Blob configs (may add new clients or override defaults)
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
            const config = (await res.json()) as ClientConfig;
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

export async function saveClientConfig(config: ClientConfig): Promise<void> {
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
