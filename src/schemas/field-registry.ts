// Comprehensive Field Rules for All Configs

export interface FieldRule {
  fieldName: string;
  fileType: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'enum';
  allowedValues?: any[];
  min?: number;
  max?: number;
  pattern?: RegExp;
  namingConvention?: 'UPPERCASE_SNAKE_CASE' | 'lowercase_snake_case' | 'camelCase' | 'PascalCase' | 'lowercase';
  singularOrPlural?: 'singular' | 'plural' | 'either';
  booleanOnly?: boolean;
  stringOnly?: boolean;
  integerOnly?: boolean;
  required: boolean;
  officialReference?: string;
  description: string;
  invalidExamples?: string[];
  validExamples?: any[];
}

export const FIELD_RULES: FieldRule[] = [
  // ════════════════════════════════════════════════════════════════
  // OPENCODE.JSON FIELDS
  // ════════════════════════════════════════════════════════════════
  {
    fieldName: 'model',
    fileType: 'opencode.json',
    type: 'enum',
    required: true,
    allowedValues: ['opencode/glm-4.7', 'opencode/glm-4.6', 'gpt-4', 'claude-3-opus'],
    stringOnly: true,
    description: 'LLM model identifier',
    validExamples: ['opencode/glm-4.7', 'gpt-4'],
    invalidExamples: ['GPT-4', 'gpt4', 'opencode/glm-47', 'claude3'],
    officialReference: 'https://docs.opencode.dev/config#model'
  },
  {
    fieldName: 'temperature',
    fileType: 'opencode.json',
    type: 'number',
    required: false,
    min: 0,
    max: 2,
    integerOnly: false,
    description: 'Creativity/randomness of responses',
    validExamples: [0, 0.5, 0.7, 1.5, 2],
    invalidExamples: [2.5, -0.1, '0.7'],
    officialReference: 'https://docs.opencode.dev/config#temperature'
  },
  {
    fieldName: 'mcp',
    fileType: 'opencode.json',
    type: 'object',
    required: false,
    singularOrPlural: 'singular',
    description: 'Model Context Protocol configuration',
    validExamples: [{ servers: { browser: { command: 'node' } } }],
    invalidExamples: [{ mcpServers: {} }, { mcp_servers: {} }, { MCP: {} }],
    officialReference: 'https://docs.opencode.dev/config#mcp'
  },
  {
    fieldName: 'tools',
    fileType: 'opencode.json',
    type: 'object',
    required: false,
    singularOrPlural: 'plural',
    description: 'Tool permissions',
    validExamples: [{ write: true, read: true, execute: false }],
    invalidExamples: [{ tool: { write: true } }, { tools: { write: 'true' } }, { tools: { write: 1 } }],
    officialReference: 'https://docs.opencode.dev/config#tools'
  },
  {
    fieldName: 'write',
    fileType: 'opencode.json',
    type: 'boolean',
    booleanOnly: true,
    required: false,
    description: 'Can write files',
    validExamples: [true, false],
    invalidExamples: ['true', 'false', 1, 0, 'yes', 'no'],
    officialReference: 'https://docs.opencode.dev/config#tools-write'
  },
  // ════════════════════════════════════════════════════════════════
  // ZSH FIELDS
  // ════════════════════════════════════════════════════════════════
  {
    fieldName: 'plugins',
    fileType: '.zshrc',
    type: 'array',
    required: false,
    singularOrPlural: 'plural',
    description: 'Zsh plugins to load',
    validExamples: [['git', 'npm', 'zsh-autosuggestions']],
    invalidExamples: [{ plugin: ['git'] }, 'git npm'],
    officialReference: 'https://zsh.sourceforge.io/Doc/Release/Shell-Grammar.html'
  },
  {
    fieldName: 'theme',
    fileType: '.zshrc',
    type: 'string',
    required: false,
    singularOrPlural: 'singular',
    description: 'Zsh theme name',
    validExamples: ['robbyrussell', 'agnoster', 'dracula'],
    invalidExamples: [{ themes: 'robbyrussell' }, ['robbyrussell']],
    officialReference: 'https://zsh.sourceforge.io'
  },
  {
    fieldName: 'PATH',
    fileType: '.zshenv',
    type: 'string',
    required: false,
    namingConvention: 'UPPERCASE_SNAKE_CASE',
    description: 'Shell PATH',
    validExamples: ['/usr/local/bin:/usr/bin:/bin'],
    invalidExamples: ['/usr/local/bin', 123, true],
    officialReference: 'https://zsh.sourceforge.io/Doc/Release/Files.html'
  },
  {
    fieldName: 'EDITOR',
    fileType: '.zshenv',
    type: 'string',
    required: false,
    namingConvention: 'UPPERCASE_SNAKE_CASE',
    description: 'Default editor',
    validExamples: ['vim', 'nano', 'code'],
    invalidExamples: ['Vim', 'NANO', 'Code'],
    officialReference: 'https://zsh.sourceforge.io/Doc/Release/Files.html'
  },
  // ════════════════════════════════════════════════════════════════
  // DOCKER COMPOSE FIELDS
  // ════════════════════════════════════════════════════════════════
  {
    fieldName: 'services',
    fileType: 'docker-compose.yml',
    type: 'object',
    required: true,
    singularOrPlural: 'plural',
    description: 'Docker services',
    validExamples: [{ api: { image: 'node:18' }, db: { image: 'postgres:15' } }],
    invalidExamples: [{ service: { image: 'node' } }, { Service: { image: 'node' } }],
    officialReference: 'https://docs.docker.com/compose/compose-file/#services'
  },
  {
    fieldName: 'version',
    fileType: 'docker-compose.yml',
    type: 'string',
    required: true,
    singularOrPlural: 'singular',
    pattern: /^\d+\.\d+$/,
    description: 'Compose file version',
    validExamples: ['3.9', '3.8'],
    invalidExamples: ['3', 3.9, ['3.9']],
    officialReference: 'https://docs.docker.com/compose/compose-file/'
  },
  // ════════════════════════════════════════════════════════════════
  // PACKAGE.JSON FIELDS
  // ════════════════════════════════════════════════════════════════
  {
    fieldName: 'dependencies',
    fileType: 'package.json',
    type: 'object',
    required: false,
    singularOrPlural: 'plural',
    description: 'Production dependencies',
    validExamples: [{ express: '^4.18.0', zod: '^3.22.0' }],
    invalidExamples: [{ dependency: { express: '^4.18.0' } }, 'express@4.18.0'],
    officialReference: 'https://docs.npmjs.com/cli/configuring-npm/package-json#dependencies'
  },
  {
    fieldName: 'devDependencies',
    fileType: 'package.json',
    type: 'object',
    required: false,
    namingConvention: 'camelCase',
    singularOrPlural: 'plural',
    description: 'Development dependencies',
    validExamples: [{ typescript: '^5.0.0', eslint: '^8.0.0' }],
    invalidExamples: [{ dev_dependencies: {} }, { devdependencies: {} }, { DevDependencies: {} }],
    officialReference: 'https://docs.npmjs.com/cli/configuring-npm/package-json#devdependencies'
  },
  {
    fieldName: 'keywords',
    fileType: 'package.json',
    type: 'array',
    required: false,
    singularOrPlural: 'plural',
    description: 'Package keywords',
    validExamples: [['cli', 'tool', 'ai']],
    invalidExamples: [{ keyword: ['cli'] }, 'cli tool'],
    officialReference: 'https://docs.npmjs.com/cli/configuring-npm/package-json#keywords'
  }
];

// Helper: Get rule for field
export function getFieldRule(fileType: string, fieldName: string): FieldRule | undefined {
  return FIELD_RULES.find(rule => rule.fileType === fileType && rule.fieldName === fieldName);
}

// Helper: Get all rules for file
export function getFileRules(fileType: string): FieldRule[] {
  return FIELD_RULES.filter(rule => rule.fileType === fileType);
}

// Helper: Validate field against rules
export function validateFieldAgainstRule(
  rule: FieldRule,
  value: any
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Type checks
  if (rule.type === 'string' && typeof value !== 'string') errors.push(`Expected string, got ${typeof value}`);
  if (rule.type === 'number' && typeof value !== 'number') errors.push(`Expected number, got ${typeof value}`);
  if (rule.type === 'boolean' && typeof value !== 'boolean') errors.push(`Expected boolean, got ${typeof value}`);
  if (rule.type === 'array' && !Array.isArray(value)) errors.push(`Expected array, got ${typeof value}`);

  // Boolean-only check
  if (rule.booleanOnly && typeof value !== 'boolean') errors.push(`Field must be boolean (true/false), not "${value}"`);

  // Range checks
  if (rule.min !== undefined && value < rule.min) errors.push(`Must be >= ${rule.min}`);
  if (rule.max !== undefined && value > rule.max) errors.push(`Must be <= ${rule.max}`);

  // Enum check
  if (rule.type === 'enum' && !rule.allowedValues?.includes(value)) {
    errors.push(`Must be one of: ${rule.allowedValues?.join(', ')}`);
  }

  // Pattern check
  if (rule.pattern && !rule.pattern.test(value)) errors.push(`Must match pattern: ${rule.pattern}`);

  return { valid: errors.length === 0, errors };
}
