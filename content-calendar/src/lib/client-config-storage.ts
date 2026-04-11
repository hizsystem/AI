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
          const blobConfig = await res.json();
          // Skip old ClientConfig format — fall through to hardcoded
          if (blobConfig.channels && Array.isArray(blobConfig.channels)) {
          const hardcoded = DEFAULT_PROJECT_CONFIGS.find((c) => c.slug === slug);
          if (hardcoded) {
            const blobChs = blobConfig.channels || [];
            const allBlobDisabled = blobChs.length > 0 && blobChs.every((c: any) => c.enabled === false);
            const mergedChannels = hardcoded.channels.map((baseCh) => {
              if (allBlobDisabled) return baseCh;
              const blobCh = blobChs.find((c: any) => c.type === baseCh.type);
              if (!blobCh) return baseCh;
              // Merge blob channel onto base, preserving critical base fields as fallback
              return {
                ...baseCh,
                enabled: blobCh.enabled ?? baseCh.enabled,
                blocks: Array.isArray(blobCh.blocks) && blobCh.blocks.length > 0 ? blobCh.blocks : baseCh.blocks,
                defaultCategories: blobCh.defaultCategories || baseCh.defaultCategories,
                defaultHashtags: blobCh.defaultHashtags || baseCh.defaultHashtags,
                defaultMentions: blobCh.defaultMentions || baseCh.defaultMentions,
                calendarClientPrefix: blobCh.calendarClientPrefix || baseCh.calendarClientPrefix,
                storeId: blobCh.storeId || baseCh.storeId,
              };
            });
            for (const blobCh of blobConfig.channels || []) {
              if (!mergedChannels.some((c: any) => c.type === blobCh.type)) {
                mergedChannels.push(blobCh);
              }
            }
            const merged = {
              ...hardcoded,
              name: blobConfig.name || hardcoded.name,
              emoji: blobConfig.emoji ?? hardcoded.emoji,
              brandColor: blobConfig.brandColor || hardcoded.brandColor,
              status: blobConfig.status || hardcoded.status,
              finance: blobConfig.finance || hardcoded.finance,
              accessToken: blobConfig.accessToken ?? hardcoded.accessToken,
              clientEditable: blobConfig.clientEditable ?? hardcoded.clientEditable,
              channels: mergedChannels,
            };
            CONFIG_CACHE[slug] = merged;
            return merged;
          }
          CONFIG_CACHE[slug] = blobConfig as ProjectConfig;
          return blobConfig as ProjectConfig;
          }
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

  // Overlay with Blob configs — merge onto hardcoded defaults to preserve channel details
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
            const blobConfig = await res.json();
            // Skip old ClientConfig format entirely (has tabs, no channels)
            if (!blobConfig.channels || !Array.isArray(blobConfig.channels)) continue;
            // Merge: use hardcoded as base, overlay blob for basic fields,
            // but keep hardcoded channel details (calendarClientPrefix etc.)
            const base = configs.get(blobConfig.slug);
            if (base) {
              // Guard: if ALL Blob channels are disabled, it's likely a bug save — ignore
              const blobChannels = blobConfig.channels || [];
              const allBlobDisabled = blobChannels.length > 0 && blobChannels.every((c: any) => c.enabled === false);

              const mergedChannels = base.channels.map((baseCh) => {
                if (allBlobDisabled) return baseCh; // Keep hardcoded state
                const blobCh = blobChannels.find((c: any) => c.type === baseCh.type);
                if (!blobCh) return baseCh;
              // Merge blob channel onto base, preserving critical base fields as fallback
              return {
                ...baseCh,
                enabled: blobCh.enabled ?? baseCh.enabled,
                blocks: Array.isArray(blobCh.blocks) && blobCh.blocks.length > 0 ? blobCh.blocks : baseCh.blocks,
                defaultCategories: blobCh.defaultCategories || baseCh.defaultCategories,
                defaultHashtags: blobCh.defaultHashtags || baseCh.defaultHashtags,
                defaultMentions: blobCh.defaultMentions || baseCh.defaultMentions,
                calendarClientPrefix: blobCh.calendarClientPrefix || baseCh.calendarClientPrefix,
                storeId: blobCh.storeId || baseCh.storeId,
              };
              });
              // Add any new channels from Blob that aren't in hardcoded
              for (const blobCh of blobConfig.channels || []) {
                if (!mergedChannels.some((c: any) => c.type === blobCh.type)) {
                  mergedChannels.push(blobCh);
                }
              }
              configs.set(blobConfig.slug, {
                ...base,
                name: blobConfig.name || base.name,
                emoji: blobConfig.emoji ?? base.emoji,
                brandColor: blobConfig.brandColor || base.brandColor,
                status: blobConfig.status || base.status,
                finance: blobConfig.finance || base.finance,
                accessToken: blobConfig.accessToken ?? base.accessToken,
                clientEditable: blobConfig.clientEditable ?? base.clientEditable,
                channels: mergedChannels,
                brands: base.brands,
              });
            } else {
              // New project from Blob (not in hardcoded defaults)
              const cfg = blobConfig as ProjectConfig;
              cfg.channels = cfg.channels || [];
              configs.set(cfg.slug, cfg);
            }
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
