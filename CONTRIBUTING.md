# Contributing to OpenCode Config Protection

## Development Setup

```bash
# Clone the repo
git clone https://github.com/lorenzorasmussen/opencode-config-protection-skill.git
cd opencode-config-protection-skill

# Install dependencies
npm install

# Build
npm run build

# Test
npm test

# Lint
npm run lint
```

## Adding Support for New Config Files

### 1. Create Schema (`src/schemas/all-schemas.ts`)

```typescript
export const NewConfigSchema = z.object({
  field1: z.string(),
  field2: z.number(),
  // ... fields from official documentation
}).strict();

export const ALL_SCHEMAS = {
  // ...
  'new-config.json': NewConfigSchema
};
```

### 2. Add Field Rules (`src/schemas/field-registry.ts`)

```typescript
export const FIELD_RULES: FieldRule[] = [
  // ...
  {
    fieldName: 'field1',
    fileType: 'new-config.json',
    type: 'string',
    required: true,
    description: '...',
    officialReference: 'https://...',
    validExamples: ['example'],
    invalidExamples: ['bad']
  }
];
```

### 3. Create Manager (`src/config-managers/new-manager.ts`)

```typescript
import { BaseConfigManager } from './base-manager';
import { NewConfigSchema } from '../schemas/all-schemas';

const TEMPLATE = { field1: true, field2: true };

export class NewConfigManager extends BaseConfigManager {
  constructor(filePath: string) {
    super(filePath, NewConfigSchema, TEMPLATE);
  }

  setField1(value: string): void {
    const rule = getFieldRule('new-config.json', 'field1');
    // Validate...
    this.setField('field1', value);
  }

  protected validateFieldValue(key: any, value: any): void {
    const rule = getFieldRule('new-config.json', String(key));
    // Custom validation logic
  }

  protected getDocLink(): string {
    return 'https://official-docs.com';
  }
}
```

### 4. Export Manager (`src/config-managers/index.ts`)

```typescript
import { NewConfigManager } from './new-manager';

const MANAGERS: Record<string, any> = {
  // ...
  'new-config.json': NewConfigManager
};
```

### 5. Update Schema Sources (`src/schemas/schema-sources.ts`)

```typescript
export const SCHEMA_SOURCES = {
  // ...
  'new-config.json': {
    official_doc: 'https://...',
    schema_version: '1.0',
    last_updated: '2026-01-06',
    maintainer: 'Official team',
    description: 'Description'
  }
};
```

### 6. Add Tests

```typescript
import { NewConfigManager } from '../src/config-managers/new-manager';

describe('NewConfigManager', () => {
  test('should validate field1', () => {
    const mgr = new NewConfigManager('test.json');
    expect(() => mgr.setField1('valid')).not.toThrow();
    expect(() => mgr.setField1('invalid')).toThrow();
  });
});
```

## Code Standards

### TypeScript
- Strict mode enabled
- No `any` types without justification
- Interfaces for all objects
- Comments for complex logic

### Error Handling
- Throw detailed, actionable errors
- Include valid examples in errors
- Link to official documentation
- Provide recovery steps

### Testing
- Unit tests for all public methods
- Integration tests for config managers
- Edge case tests
- 95%+ coverage target

## Commit Messages

Follow conventional commits:

```
feat: Add support for new config file
fix: Handle edge case in validation
docs: Update troubleshooting guide
refactor: Simplify schema validation
test: Add tests for X feature
```

## Pull Requests

1. Create feature branch: `git checkout -b feat/my-feature`
2. Make changes with tests
3. Ensure tests pass: `npm test`
4. Ensure lint passes: `npm run lint`
5. Submit PR with description
6. Address review feedback
7. Merge when approved

## Reporting Issues

Include:
- Error message
- Config file type
- Steps to reproduce
- Expected vs actual behavior
- Node version
- OS

---

**Thank you for contributing! 🙏**
