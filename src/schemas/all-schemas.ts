// Complete ZOD Schemas for All Config Files
import { z } from 'zod';

// ════════════════════════════════════════════════════════════════
// OPENCODE.JSON SCHEMA
// ════════════════════════════════════════════════════════════════

export const OpencodeConfigSchema = z.object({
  model: z.enum([
    'opencode/glm-4.7',
    'opencode/glm-4.6',
    'gpt-4',
    'gpt-4-turbo',
    'claude-3-opus',
    'claude-3-sonnet',
    'claude-3-haiku'
  ]).describe('LLM model to use (must be from official list)'),

  temperature: z.number()
    .min(0, 'Must be >= 0')
    .max(2, 'Must be <= 2')
    .optional()
    .default(0.7)
    .describe('Creativity level: 0=deterministic, 2=random'),

  mcp: z.object({
    servers: z.record(
      z.string().regex(/^[a-z0-9-]+$/, 'Server name must be lowercase alphanumeric + hyphens'),
      z.object({
        command: z.string().min(1, 'Command required').describe('Executable command'),
        args: z.array(z.string()).optional().describe('Command arguments'),
        env: z.record(z.string()).optional().describe('Environment variables')
      })
    ).describe('Model Context Protocol servers')
  }).optional().describe('MCP configuration (field must be singular "mcp", NOT "mcpServers")'),

  tools: z.object({
    write: z.boolean().describe('Can write files'),
    read: z.boolean().describe('Can read files'),
    execute: z.boolean().describe('Can execute shell commands'),
    browse: z.boolean().optional().describe('Can browse websites (optional)')
  }).optional().describe('Tool permissions (field must be singular "tools", NOT "tool")'),

  timeout: z.number()
    .int('Must be integer milliseconds')
    .min(100, 'Minimum 100ms')
    .max(600000, 'Maximum 10 minutes')
    .optional()
    .describe('Request timeout in milliseconds'),

  maxTokens: z.number()
    .int('Must be integer')
    .min(1, 'Minimum 1 token')
    .max(128000, 'Maximum model limit')
    .optional()
    .describe('Maximum tokens in response')
}).strict().describe('Official Opencode configuration schema');

// ════════════════════════════════════════════════════════════════
// ZSH CONFIGURATION SCHEMA (.zshrc)
// ════════════════════════════════════════════════════════════════

export const ZshrcSchema = z.object({
  exports: z.record(
    z.string().regex(/^[A-Z][A-Z0-9_]*$/, 'Env vars must be UPPERCASE_SNAKE_CASE'),
    z.string()
  ).optional().describe('Environment variables (keys must be UPPERCASE)'),

  aliases: z.record(
    z.string().regex(/^[a-z0-9_][a-z0-9_]*$/, 'Alias names must be lowercase'),
    z.string()
  ).optional().describe('Shell aliases'),

  functions: z.record(
    z.string().regex(/^[a-z_][a-z0-9_]*$/, 'Function names must be snake_case'),
    z.string()
  ).optional().describe('Shell functions'),

  plugins: z.array(z.string())
    .optional()
    .describe('Zsh plugins (field must be plural "plugins")'),

  theme: z.string()
    .optional()
    .describe('Zsh theme name'),

  paths: z.array(z.string())
    .optional()
    .describe('Shell PATH entries (field must be plural "paths")')
}).strict().describe('Zsh configuration schema');

// ════════════════════════════════════════════════════════════════
// ZSH ENVIRONMENT SCHEMA (.zshenv)
// ════════════════════════════════════════════════════════════════

export const ZshenvSchema = z.object({
  PATH: z.string().optional(),
  EDITOR: z.string().optional(),
  SHELL: z.string().optional(),
  PAGER: z.string().optional(),
  LANG: z.string().optional(),
  LC_ALL: z.string().optional(),
  NODE_PATH: z.string().optional(),
  NPM_TOKEN: z.string().optional(),
  GITHUB_TOKEN: z.string().optional()
}).strict().describe('Zsh environment variables (all keys UPPERCASE_SNAKE_CASE)');

// ════════════════════════════════════════════════════════════════
// DOCKER COMPOSE SCHEMA
// ════════════════════════════════════════════════════════════════

export const DockerComposeSchema = z.object({
  version: z.string()
    .regex(/^\d+\.\d+$/, 'Version must be X.Y format')
    .describe('Docker Compose version'),

  services: z.record(
    z.string().regex(/^[a-z0-9_-]+$/, 'Service names must be lowercase alphanumeric'),
    z.object({
      image: z.string().describe('Docker image'),
      ports: z.array(z.string()).optional().describe('Port mappings (plural)'),
      volumes: z.array(z.string()).optional().describe('Volume mounts (plural)'),
      environment: z.record(z.string()).optional().describe('Environment variables'),
      depends_on: z.array(z.string()).optional().describe('Service dependencies (plural)'),
      networks: z.array(z.string()).optional().describe('Networks (plural)')
    })
  ).describe('Services (field must be plural "services")'),

  networks: z.record(
    z.object({
      driver: z.string().optional(),
      ipam: z.object({
        config: z.array(z.object({ subnet: z.string() })).optional()
      }).optional()
    })
  ).optional().describe('Networks (field must be plural "networks")'),

  volumes: z.record(
    z.object({ driver: z.string().optional() })
  ).optional().describe('Named volumes (field must be plural "volumes")')
}).strict().describe('Docker Compose schema');

// ════════════════════════════════════════════════════════════════
// PACKAGE.JSON SCHEMA
// ════════════════════════════════════════════════════════════════

export const PackageJsonSchema = z.object({
  name: z.string()
    .regex(/^[a-z0-9-]+$/, 'Package name must be lowercase with hyphens')
    .describe('Package name'),

  version: z.string()
    .regex(/^\d+\.\d+\.\d+/, 'Version must be semver')
    .describe('Semantic version'),

  description: z.string().optional(),

  scripts: z.record(z.string())
    .optional()
    .describe('npm scripts (plural "scripts")'),

  dependencies: z.record(z.string())
    .optional()
    .describe('Production dependencies (plural)'),

  devDependencies: z.record(z.string())
    .optional()
    .describe('Development dependencies (camelCase)'),

  engines: z.object({
    node: z.string().optional(),
    npm: z.string().optional()
  }).optional().describe('Engine requirements (plural)'),

  keywords: z.array(z.string())
    .optional()
    .describe('Keywords (plural)')
}).strict().describe('Package.json schema');

// ════════════════════════════════════════════════════════════════
// EXPORT ALL SCHEMAS
// ════════════════════════════════════════════════════════════════

export const ALL_SCHEMAS = {
  'opencode.json': OpencodeConfigSchema,
  '.zshrc': ZshrcSchema,
  '.zshenv': ZshenvSchema,
  'docker-compose.yml': DockerComposeSchema,
  'package.json': PackageJsonSchema
};

export type OpencodeConfig = z.infer<typeof OpencodeConfigSchema>;
export type ZshrcConfig = z.infer<typeof ZshrcSchema>;
export type ZshenvConfig = z.infer<typeof ZshenvSchema>;
export type DockerComposeConfig = z.infer<typeof DockerComposeSchema>;
export type PackageJsonConfig = z.infer<typeof PackageJsonSchema>;
