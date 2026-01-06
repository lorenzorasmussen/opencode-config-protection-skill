// OpenCode Config Protection Skill - Main Export

export { getConfigManager } from './config-managers';
export { ALL_SCHEMAS, OpencodeConfigSchema, ZshrcSchema, ZshenvSchema, DockerComposeSchema, PackageJsonSchema } from './schemas/all-schemas';
export { FIELD_RULES, getFieldRule, getFileRules, validateFieldAgainstRule } from './schemas/field-registry';
export { SCHEMA_SOURCES } from './schemas/schema-sources';
export { BaseConfigManager } from './config-managers/base-manager';
export { OpencodeConfigManager } from './config-managers/opencode-manager';
export { ZshConfigManager } from './config-managers/zsh-manager';
export { DetailedErrorHandler } from './error-handlers/detailed-error-handler';

console.log('✅ OpenCode Config Protection Skill loaded');
