// Official Schema Sources
// These are the authoritative documentation links for each config type

export const SCHEMA_SOURCES = {
  "opencode.json": {
    official_doc: "https://docs.opencode.dev/config",
    schema_version: "1.0.0",
    last_updated: "2026-01-06",
    maintainer: "Opencode official",
    description: "OpenCode LLM configuration and settings"
  },

  ".zshrc": {
    official_doc: "https://zsh.sourceforge.io/Doc/Release/Shell-Grammar.html",
    schema_version: "5.9",
    last_updated: "2025-12-01",
    maintainer: "ZSH official",
    description: "Zsh shell configuration and functions"
  },

  ".zshenv": {
    official_doc: "https://zsh.sourceforge.io/Doc/Release/Files.html",
    schema_version: "5.9",
    last_updated: "2025-12-01",
    maintainer: "ZSH official",
    description: "Zsh environment variables"
  },

  "docker-compose.yml": {
    official_doc: "https://docs.docker.com/compose/compose-file/",
    schema_version: "3.9",
    last_updated: "2025-11-15",
    maintainer: "Docker official",
    description: "Docker Compose service definitions"
  },

  "package.json": {
    official_doc: "https://docs.npmjs.com/cli/v10/configuring-npm/package-json",
    schema_version: "npm-v10",
    last_updated: "2025-12-01",
    maintainer: "NPM official",
    description: "NPM package metadata and configuration"
  },

  "warp-settings.yaml": {
    official_doc: "https://docs.warp.dev/features/customization",
    schema_version: "0.5.0",
    last_updated: "2025-11-20",
    maintainer: "Warp official",
    description: "Warp terminal settings and preferences"
  },

  "raycast-settings.json": {
    official_doc: "https://manual.raycast.com",
    schema_version: "1.0",
    last_updated: "2025-11-15",
    maintainer: "Raycast official",
    description: "Raycast launcher configuration"
  }
};

// Get docs link for a config file
export function getDocLink(fileType: string): string | undefined {
  return SCHEMA_SOURCES[fileType as keyof typeof SCHEMA_SOURCES]?.official_doc;
}

// Get schema version for a config file
export function getSchemaVersion(fileType: string): string | undefined {
  return SCHEMA_SOURCES[fileType as keyof typeof SCHEMA_SOURCES]?.schema_version;
}
