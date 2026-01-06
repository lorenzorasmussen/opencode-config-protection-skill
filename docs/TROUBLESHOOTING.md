# Troubleshooting Guide

## Common Issues and Solutions

### 1. Invalid Field Error

**Error Message:**
```
❌ Invalid field: "mcpServers"
Official fields: model, temperature, mcp, tools, timeout, maxTokens
```

**Cause:** The field name doesn't match the official schema. This is often an AI hallucination.

**Solution:**
1. Identify the intended field (e.g., "mcpServers" should be "mcp")
2. Check the official fields list in the error message
3. Use the correct field name
4. Retry

**Common Mappings:**
- `mcpServers` → `mcp`
- `tool` → `tools`
- `plugin` → `plugins`
- `theme` → `theme` (singular, not "themes")
- `service` → `services`
- `network` → `networks`
- `volume` → `volumes`

---

### 2. Type Mismatch Error

**Error Message:**
```
❌ Field must be boolean (true/false), not "true"
Valid: { write: true }
Invalid: { write: 'true' }
```

**Cause:** Value type doesn't match the expected type.

**Common Type Mistakes:**

| Wrong | Right | Reason |
|-------|-------|--------|
| `"true"` | `true` | Strings are not booleans |
| `"0.7"` | `0.7` | Strings are not numbers |
| `["git"]` | `{"git": "..."}` | Array vs object |
| `"git npm"` | `["git", "npm"]` | String vs array |
| `{write: true}` | `{write: true, read: true}` | Incomplete object |

**Solution:**
1. Check the error message for the expected type
2. Look at "VALID EXAMPLES" in the error
3. Update the value to the correct type
4. Retry

---

### 3. Value Out of Range

**Error Message:**
```
❌ Field "temperature" must be >= 0 and <= 2
Provided: 2.5
```

**Cause:** Numeric value is outside the allowed range.

**Common Range Errors:**

| Field | Min | Max | Common Mistake |
|-------|-----|-----|----------------|
| `temperature` | 0 | 2 | Providing 2.5 or -0.1 |
| `timeout` | 100 | 600000 | Providing 50 or 700000 |
| `maxTokens` | 1 | 128000 | Providing 0 or 200000 |

**Solution:**
1. Check the error for the valid range
2. Adjust your value to be within the range
3. Common fix: temperature → clamp between 0 and 2
4. Retry

---

### 4. Invalid Enum Value

**Error Message:**
```
❌ Field "model" must be one of:
   - opencode/glm-4.7
   - gpt-4
   - claude-3-opus

Provided: "claude3"
```

**Cause:** Value is not in the list of allowed values.

**Common Enum Mistakes:**

| Field | Wrong | Right | |
|-------|-------|-------|---|
| `model` | `gpt4` | `gpt-4` | Missing hyphen |
| `model` | `GPT-4` | `gpt-4` | Wrong case |
| `model` | `claude3` | `claude-3-opus` | Incomplete name |
| `model` | `gpt-4-turbo` | `gpt-4` | Not officially supported |

**Solution:**
1. Copy a value from the "VALID EXAMPLES" section
2. Make sure the case is exact (case-sensitive)
3. Verify format matches exactly
4. Retry

---

### 5. Pattern Mismatch (Naming Convention)

**Error Message:**
```
❌ Export name must be UPPERCASE_SNAKE_CASE
Provided: "editor"
Valid: "EDITOR"
```

**Cause:** Field name doesn't follow the required naming convention.

**Naming Conventions:**

| Convention | Examples | Used For |
|------------|----------|----------|
| `UPPERCASE_SNAKE_CASE` | `PATH`, `NODE_PATH`, `EDITOR` | Environment variables |
| `camelCase` | `devDependencies`, `maxTokens` | JSON config keys |
| `lowercase_snake_case` | `my_alias`, `cd_project` | Shell aliases and functions |
| `lowercase-hyphen` | `git-plugin`, `browser-server` | Docker service/plugin names |

**Solution:**
1. Identify the required convention from the error
2. Convert the name to the correct format
3. Examples above show the format
4. Retry

---

### 6. Singular vs Plural Error

**Error Message:**
```
❌ Field must be plural "plugins", not singular "plugin"
```

**Cause:** Using singular when field should be plural, or vice versa.

**Common Singular/Plural Mistakes:**

| Wrong | Right | Type |
|-------|-------|------|
| `plugin` | `plugins` | Array of multiple items |
| `theme` | `theme` | Single item (wait, this is singular!) |
| `service` | `services` | Multiple services |
| `network` | `networks` | Multiple networks |
| `tool` | `tools` | Multiple tools |
| `mcpServer` | `mcp.servers` | Multiple servers |

**Rule of Thumb:**
- Plural when the field can contain multiple items (array or object with multiple keys)
- Singular when the field is a single value

**Solution:**
1. Check if the field should hold multiple items
2. Use plural if yes, singular if no
3. The error message tells you which is correct
4. Retry

---

### 7. Protected File Error

**Error Message:**
```
🚫 PROTECTED FILE: Direct write BLOCKED

File: opencode.json
Error: Direct fs.writeFileSync() not allowed

You must use: OpencodeConfigManager
```

**Cause:** Trying to write directly with `fs.writeFileSync()` instead of using a ConfigManager.

**Solution:**

Before (wrong):
```typescript
const config = JSON.parse(fs.readFileSync('opencode.json'));
config.model = 'gpt-4';
fs.writeFileSync('opencode.json', JSON.stringify(config));
```

After (correct):
```typescript
import { getConfigManager } from '~/.config/config-managers';
const mgr = getConfigManager('opencode.json');
mgr.setModel('gpt-4');
mgr.save();  // This validates and writes properly
```

**For each config file:**

| File | Manager | Setup |
|------|---------|-------|
| `opencode.json` | `OpencodeConfigManager` | `new OpencodeConfigManager(filepath)` |
| `.zshrc` | `ZshConfigManager` | `new ZshConfigManager(filepath, true)` |
| `.zshenv` | `ZshConfigManager` | `new ZshConfigManager(filepath, false)` |

---

### 8. File Not Found

**Error Message:**
```
❌ Failed to load opencode.json: ENOENT: no such file or directory
```

**Cause:** Config file doesn't exist at the specified path.

**Solution:**
1. Verify the file path is correct
2. Check if the file exists: `ls -la ~/.config/opencode/opencode.json`
3. Create the file with initial config if it doesn't exist
4. Example initial config:
   ```json
   {
     "model": "gpt-4",
     "temperature": 0.7
   }
   ```
5. Retry

---

### 9. Backup Restoration

**Situation:** Changes were made, validation failed, and you want to restore.

**Solution:**

```typescript
const mgr = getConfigManager('opencode.json');

// List available backups
const backups = mgr.listBackups();
console.log(backups);
// Output: [
//   'backup-2026-01-06T05-00-00Z.json',
//   'backup-2026-01-06T04-55-30Z.json',
//   'backup-2026-01-06T04-50-15Z.json'
// ]

// Restore the latest backup automatically
mgr.restoreLatestBackup();  // Restores most recent

// Config is now restored to the latest valid state
const config = mgr.getConfig();
console.log(config);
```

---

### 10. Audit Log Review

**Situation:** You want to see what changes were made.

**Solution:**

```typescript
const mgr = getConfigManager('opencode.json');
const auditLog = mgr.getAuditLog();

auditLog.forEach(entry => {
  console.log(`[${entry.timestamp}] ${entry.operation}`);
  console.log(`  Field: ${entry.field}`);
  console.log(`  Value: ${entry.value}`);
  console.log(`  Source: ${entry.source}`);
});

// Output:
// [2026-01-06T05:00:00.000Z] set
//   Field: model
//   Value: "gpt-4"
//   Source: config-manager
// [2026-01-06T05:01:15.000Z] set
//   Field: temperature
//   Value: 0.8
//   Source: config-manager
```

---

## Getting Help

### Check the Error Details

Every error includes:
- ✅ **VALID EXAMPLES** - What's correct
- ❌ **INVALID EXAMPLES** - What's wrong
- 📖 **OFFICIAL DOCS** - Link to official spec
- ✅ **HOW TO FIX** - Step-by-step recovery guide

### Official Documentation Links

- OpenCode: https://docs.opencode.dev/config
- Docker Compose: https://docs.docker.com/compose/compose-file/
- NPM package.json: https://docs.npmjs.com/cli/configuring-npm/package-json
- Zsh: https://zsh.sourceforge.io/Doc/Release/

### Debug Mode

Enable detailed logging:

```typescript
const mgr = getConfigManager('opencode.json');

// Get current config
const config = mgr.getConfig();
console.log('Current config:', JSON.stringify(config, null, 2));

// Get audit log
const log = mgr.getAuditLog();
console.log('Audit log:', log);

// List backups
const backups = mgr.listBackups();
console.log('Available backups:', backups);
```

---

**Last Updated:** January 6, 2026
**Version:** 1.0.0
