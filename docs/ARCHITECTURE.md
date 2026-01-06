# OpenCode Config Protection - Architecture

## System Overview

This is an 11-layer defense system that prevents AI corruption, enforces official schemas, and ensures type safety across critical configuration files.

```
┌─────────────────────────────────────────────────────────────┐
│ Layer 1: Official Schema Extraction                          │
│ (OpenCode, Docker, NPM, Zsh official specs)                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Layer 2: Field Registry                                      │
│ (Naming conventions, types, ranges, allowed values)          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Layer 3: Global Write Guard                                  │
│ (fs.writeFileSync() interceptor - blocks direct writes)     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Layer 4: Config Managers                                     │
│ (Type-safe getters/setters per config file)                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Layer 5: Template Validation                                 │
│ (Reject unknown fields - AI hallucinations)                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Layer 6: Schema Validation (ZOD)                            │
│ (Type checking, range validation, enum validation)          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Layer 7: Backup Creation                                     │
│ (Timestamped backups before every write)                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Layer 8: Safe Disk Write                                     │
│ (fs.writeFileSync with validated data only)                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Layer 9: Git Pre-Commit Hook                                 │
│ (Validates configs before commit)                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Layer 10: Audit Logging                                      │
│ (Full traceability of all changes)                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Layer 11: Auto-Recovery                                      │
│ (Detects corruption, recovers from backups)                 │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Schema Definitions (`src/schemas/all-schemas.ts`)

**Purpose:** Define ZOD schemas for each config file with strict validation rules

**Files Covered:**
- `opencode.json` - LLM configuration
- `.zshrc` - Zsh shell configuration
- `.zshenv` - Zsh environment variables
- `docker-compose.yml` - Docker service definitions
- `package.json` - NPM package metadata

**Key Features:**
- `.strict()` enforcement - rejects unknown fields
- Type coercion prevention - `"true"` ≠ `true`
- Range validation - temperatures 0-2, timeouts 100-600000ms
- Enum validation - only official model names allowed
- Pattern matching - UPPERCASE_SNAKE_CASE enforcement

### 2. Field Registry (`src/schemas/field-registry.ts`)

**Purpose:** Comprehensive field rules with naming conventions and validation hints

**Structure:**
```typescript
interface FieldRule {
  fieldName: string;          // Official field name
  fileType: string;           // Config file type
  type: string;               // 'string' | 'boolean' | 'number' | etc
  allowedValues?: any[];      // For enums
  namingConvention?: string;  // UPPERCASE_SNAKE_CASE, camelCase, etc
  singularOrPlural?: string;  // 'singular' | 'plural'
  booleanOnly?: boolean;      // true => no '"true"' strings
  integerOnly?: boolean;      // true => 4000 not 4000.5
  validExamples?: any[];      // What's correct
  invalidExamples?: string[]; // What's wrong
  officialReference?: string; // Link to official docs
}
```

**Used by:** Config managers for field-level validation

### 3. Write Guard (`src/universal-write-guard.ts`)

**Purpose:** Global interception of filesystem writes to protected files

**How it works:**
```typescript
// INTERCEPTS fs.writeFileSync()
fs.writeFileSync = function(filePath, data) {
  if (PROTECTED_FILES[fileName]) {
    throw new Error("Use ConfigManager instead!");
  }
  return originalWriteFileSync(filePath, data);
}
```

**Protected Files:**
- `opencode.json` → OpencodeConfigManager
- `.zshrc` → ZshConfigManager
- `.zshenv` → ZshConfigManager
- (etc.)

**Benefits:**
- Prevents AI from bypassing managers
- Forces all writes through validation
- Ensures consistency

### 4. Base Config Manager (`src/config-managers/base-manager.ts`)

**Purpose:** Abstract base class for all config file managers

**Core Methods:**
```typescript
load()              // Load from disk, validate
setField(key, val)  // Set field with type checking
save()              // Full validation before write
validate()          // Schema + template validation
getConfig()         // Get immutable config snapshot
```

**Backup System:**
- Auto-creates timestamped backups in `.backups/` directory
- Before every write
- Auto-prunes to keep latest 10
- Auto-recovery on validation failure

**Audit Logging:**
```typescript
auditLog = [
  {
    timestamp: "2026-01-06T05:00:00Z",
    operation: "set",
    field: "model",
    value: "gpt-4",
    source: "config-manager"
  }
]
```

### 5. Config Managers (Specific)

#### OpencodeConfigManager

```typescript
const mgr = new OpencodeConfigManager('~/.config/opencode/opencode.json');

// Type-safe setters
mgr.setModel('gpt-4');           // Enum validated
mgr.setTemperature(0.7);        // Range validated (0-2)
mgr.setTools({ write: true });  // Boolean validated, no 'tool'
mgr.setMcpServer('browser', {   // Server name validated
  command: 'python server.py',
  args: ['--port', '8000']
});

mgr.save();  // All validations run
```

#### ZshConfigManager

```typescript
const mgr = new ZshConfigManager('~/.zshrc');

mgr.addAlias('gp', 'git push');              // lowercase only
mgr.addExport('EDITOR', 'vim');              // UPPERCASE only
mgr.addPlugin('git');                        // Plural field
mgr.setTheme('robbyrussell');                // Singular field

mgr.save();
```

## Validation Flow

### When Setting a Field

```
User Code
  ↓
ConfigManager.setField(key, value)
  ↓
1. Check field exists in TEMPLATE
   ↓
2. Get FieldRule from registry
   ↓
3. validateFieldValue(key, value)
   ├─ Type check (boolean not "true")
   ├─ Range check (0 <= temp <= 2)
   ├─ Enum check (gpt-4 is allowed model)
   ├─ Pattern check (UPPERCASE_SNAKE_CASE)
   └─ Naming check (singular vs plural)
   ↓
4. Valid? → Store in config object
5. Invalid? → Throw detailed error
  ↓
config[key] = value  ✅
auditLog.push({...}) 📝
```

### When Saving

```
ConfigManager.save()
  ↓
1. validateAgainstTemplate(config)
   └─ Reject unknown fields (AI hallucinations)
   ↓
2. schema.parse(config)  // ZOD validation
   ├─ Type coercion check
   ├─ Range validation
   ├─ Enum validation
   ├─ Pattern matching
   └─ Object structure validation
   ↓
3. All valid? → Continue
   Invalid? → Restore backup + throw error
   ↓
4. createBackup()
   └─ Copy config to .backups/backup-{timestamp}.json
   ↓
5. fs.writeFileSync(filePath, JSON.stringify(config))
   ↓
6. auditLog.save()  // Optional: persist audit trail
```

## Error Handling

### Detailed Error Handler

```typescript
DetailedErrorHandler.handleValidationError(zodError, filePath)
  ↓ Returns DetailedError with:
    - type: "VALIDATION_ERROR"
    - severity: "high"
    - field: "model"
    - message: error message
    - rule: FieldRule with context
    - suggestions: specific fix suggestions
    - validExamples: what's correct
    - invalidExamples: what's wrong
    - officialDocs: link to official spec
    - recoverySteps: step-by-step fix guide
```

**Printed Format:**
```
┌─────────────────────────────────────────────────────────────┐
│ ❌ VALIDATION_ERROR
│
│ File: opencode.json
│ Field: model
│ Value: "claude3"
│ Message: Must be one of: opencode/glm-4.7, gpt-4, claude-3-opus
│
├─────────────────────────────────────────────────────────────┤
│ 💡 SUGGESTIONS:
│    Check official model names
│
├─────────────────────────────────────────────────────────────┤
│ ✅ HOW TO FIX:
│    1. Check field "model" in opencode.json
│    2. Verify the value matches official spec
│    3. Update to a valid value from examples
│    4. Save and retry
│
│ ✅ VALID EXAMPLES:
│    "opencode/glm-4.7"
│    "gpt-4"
│    "claude-3-opus"
│
│ ❌ INVALID EXAMPLES:
│    "claude3"        (incomplete)
│    "GPT-4"         (wrong case)
│    "gpt-4-turbo"   (not in official list)
│
│ 📖 OFFICIAL DOCS:
│    https://docs.opencode.dev/config#model
└─────────────────────────────────────────────────────────────┘
```

## Data Flow Examples

### Example 1: Valid Update

```typescript
const mgr = new OpencodeConfigManager('opencode.json');

// Load
mgr.load()  // Reads disk, validates
// config = { model: 'gpt-4', temperature: 0.7, ... }

// Modify
mgr.setTemperature(0.8);  // Validates: 0 <= 0.8 <= 2 ✅
// config = { model: 'gpt-4', temperature: 0.8, ... }

// Save
mgr.save();  // All validations pass ✅
// 1. Validate template
// 2. Validate schema with ZOD
// 3. Create backup
// 4. Write to disk
```

### Example 2: Type Mismatch (Caught)

```typescript
const mgr = new OpencodeConfigManager('opencode.json');
mgr.setTools({ write: 'true' });  // String, not boolean!

// Error:
// ❌ Field must be boolean (true/false), not "true"
// Valid: { write: true }
// Invalid: { write: 'true' }

// Recovery: mgr.setTools({ write: true }); mgr.save();
```

### Example 3: Hallucinated Field (Caught)

```typescript
const mgr = new OpencodeConfigManager('opencode.json');

// User/AI tries to add made-up field
config.mcpServers = {}; // Wrong! Should be 'mcp' singular

mgr.save();  // During template validation:
// ❌ Invalid field: "mcpServers"
// Official fields: model, temperature, mcp, tools, timeout, maxTokens
// See: https://docs.opencode.dev/config
```

### Example 4: Direct fs.writeFileSync (Caught)

```typescript
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('opencode.json'));
config.model = 'invalid-model';
fs.writeFileSync('opencode.json', JSON.stringify(config));

// Error: PROTECTED_FILE_ERROR
// ❌ File cannot be written directly using fs.writeFileSync()
// You must use OpencodeConfigManager

// Fix:
// const mgr = new OpencodeConfigManager('opencode.json');
// mgr.setModel('gpt-4');
// mgr.save();
```

## Recovery and Backup System

### Automatic Backups

Every time `.save()` is called:

```
opencode.json → .backups/backup-2026-01-06T05-00-00Z.json
             → .backups/backup-2026-01-06T04-55-30Z.json
             → .backups/backup-2026-01-06T04-50-15Z.json
```

### Auto-Recovery

If validation fails during save:

```typescript
try {
  mgr.save();  // Validation fails
} catch (err) {
  // Automatically:
  // 1. Detect backup exists
  // 2. Restore latest backup
  // 3. Reload config
  // 4. Throw error with recovery info
}
```

### Manual Recovery

```typescript
const mgr = new OpencodeConfigManager('opencode.json');
mgr.listBackups();  // ['backup-2026-01-06T05-00-00Z.json', ...]
mgr.restoreLatestBackup();  // Or manual restore from backup
```

## Security Considerations

1. **No Runtime Eval** - No `eval()` or `Function()` used
2. **ZOD Validation** - Type-safe at runtime
3. **Immutable Snapshots** - `getConfig()` returns frozen object
4. **Write Guard** - Prevents fs.writeFileSync bypass
5. **Audit Trail** - Full traceability of changes
6. **Backup Retention** - Can recover from corruption
7. **Official Specs Only** - Schema from official documentation

---

**Last Updated:** January 6, 2026
**Version:** 1.0.0
