// Embedded mode detection and configuration
// When Hunt is embedded inside Hub via iframe, Hub passes apiBase via URL param

interface EmbeddedConfig {
  isEmbedded: boolean;
  apiBase: string | null;
}

let cachedConfig: EmbeddedConfig | null = null;

export function getEmbeddedConfig(): EmbeddedConfig {
  if (cachedConfig) return cachedConfig;

  const params = new URLSearchParams(window.location.search);
  const embedParam = params.get("embed");
  const apiBaseParam = params.get("apiBase");
  
  const isEmbedded = embedParam === "1" || embedParam === "true";
  const apiBase = apiBaseParam || null;
  
  cachedConfig = { isEmbedded, apiBase };
  
  console.log("[HUNT] EmbeddedConfig:", cachedConfig);
  
  return cachedConfig;
}

export function isEmbeddedMode(): boolean {
  return getEmbeddedConfig().isEmbedded;
}

export function getSubmitUrl(): string {
  const config = getEmbeddedConfig();
  
  if (config.isEmbedded && config.apiBase) {
    // When embedded, submit to Hub's endpoint
    return `${config.apiBase}/api/proposals/submit`;
  }
  
  // When standalone, submit to own endpoint
  return "/api/proposals/submit";
}
