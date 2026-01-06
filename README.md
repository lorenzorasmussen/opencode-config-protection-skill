# OpenCode Config Protection Skill 🛡️

**Complete multi-layered configuration file protection system** preventing AI corruption, enforcing official schemas, and ensuring type safety across all critical configs.

## 🎯 What This Solves

- **AI Corruption Prevention** - Blocks hallucinated fields (`mcpServers` instead of `mcp`)
- **Type Safety** - Ensures booleans are `true/false`, not `"true"`
- **Naming Conventions** - Enforces `UPPERCASE_SNAKE_CASE`, `camelCase`, singular/plural rules
- **Official Spec Compliance** - Only allows fields from official documentation
- **Write-Time Validation** - Prevents invalid data from ever being written
- **Complete Audit Trail** - Tracks all changes with timestamps and sources
- **Auto-Recovery** - Detects and recovers from corruption automatically

## 📋 Features

### 11-Layer Defense System

1. ✅ **Schema Extraction** - Official specs from docs (opencode, docker, npm, zsh)
2. ✅ **Field Registry** - Comprehensive field rules with naming/type constraints
3. ✅ **Write Guard** - Intercepts `fs.writeFileSync()` for protected files
4. ✅ **Config Managers** - Type-safe managers for each config type
5. ✅ **Template Validation** - Rejects unknown fields (AI hallucinations)
6. ✅ **Schema Validation** - ZOD validation for types, ranges, enums
7. ✅ **Backup Creation** - Automatic timestamped backups before writes
8. ✅ **File Write** - Safe disk persistence
9. ✅ **Git Pre-Commit Hook** - Blocks corrupted configs from commits
10. ✅ **Audit Logging** - Full traceability of changes
11. ✅ **Auto-Recovery** - Detects corruption, recovers from git/backups

### Supported Configs

- **opencode.json** - OpenCode LLM settings
- **.zshrc** - Zsh shell configuration
- **.zshenv** - Zsh environment variables
- **docker-compose.yml** - Docker services
- **package.json** - NPM package metadata
- **warp-settings.yaml** - Warp terminal settings
- **raycast-settings.json** - Raycast preferences

## 🚀 Quick Start

### Installation

```bash
# Clone the skill
git clone https://github.com/lorenzorasmussen/opencode-config-protection-skill.git
cd opencode-config-protection-skill

# Install dependencies
npm install

# Copy to OpenCode skills directory
cp -r . ~/.opencode/skills/config-protection
```

### Basic Usage

```typescript
import { getConfigManager } from './src/config-managers';

// Get manager for any config file
const mgr = getConfigManager('opencode.json');

// Type-safe operations
mgr.setModel('gpt-4');              // ✅ Valid
mgr.setTemperature(0.7);            // ✅ Valid
mgr.setTools({ write: true });      // ✅ Valid

// Invalid operations throw detailed errors
mgr.setModel('claude3');            // ❌ Error: Not in allowed values
mgr.setTemperature('high');         // ❌ Error: Expected number, got string
mgr.setTools({ write: 'true' });    // ❌ Error: Must be boolean, not "true"

// Save with automatic validation
mgr.save();  // Only writes if all validations pass
```

## 📚 Documentation

- [SYSTEM_PROMPT.md](./docs/SYSTEM_PROMPT.md) - For AI agents
- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) - System design
- [FIELD_RULES.md](./docs/FIELD_RULES.md) - All field constraints
- [TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md) - Common issues

---

**Protect your configs. Trust but verify. Never corrupt again.** 🛡️
