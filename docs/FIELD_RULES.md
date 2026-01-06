# Complete Field Rules Reference

This document lists every field, validation rule, and constraint for all supported config files.

## opencode.json

### model
- **Type:** Enum (string only)
- **Required:** Yes
- **Allowed Values:** `opencode/glm-4.7`, `opencode/glm-4.6`, `gpt-4`, `gpt-4-turbo`, `claude-3-opus`, `claude-3-sonnet`, `claude-3-haiku`
- **Naming Convention:** lowercase (no UPPERCASE)
- **Case Sensitive:** Yes
- **Official Reference:** https://docs.opencode.dev/config#model
- **Description:** LLM model to use for code generation

✅ Valid Examples:
```json
{ "model": "opencode/glm-4.7" }
{ "model": "gpt-4" }
{ "model": "claude-3-opus" }
```

❌ Invalid Examples:
```json
{ "model": "GPT-4" }           // Wrong case
{ "model": "gpt4" }            // Wrong format
{ "model": "gpt-4-turbo" }     // Might not be officially supported
{ "model": "gpt-4.0" }         // Wrong format
{ "model": 123 }               // Number, not string
```

### temperature
- **Type:** Number (float)
- **Required:** No (default: 0.7)
- **Range:** 0 ≤ temperature ≤ 2
- **Integer Only:** No (0.5 is valid)
- **Description:** Creativity/randomness level. 0=deterministic, 2=very random
- **Official Reference:** https://docs.opencode.dev/config#temperature

✅ Valid Examples:
```json
{ "temperature": 0 }
{ "temperature": 0.7 }
{ "temperature": 1.5 }
{ "temperature": 2 }
```

❌ Invalid Examples:
```json
{ "temperature": "0.7" }       // String, not number
{ "temperature": -0.1 }        // Below minimum
{ "temperature": 2.5 }         // Above maximum
{ "temperature": true }        // Boolean, not number
```

### mcp
- **Type:** Object
- **Required:** No
- **Field Name:** MUST be `mcp` (SINGULAR), NOT `mcpServers` or `mcp_servers`
- **Singular/Plural:** SINGULAR
- **Contains:**
  - `servers` (object, plural) - Map of server name → config
    - Server names: lowercase alphanumeric + hyphens
    - Each server has:
      - `command` (string, required) - Executable command
      - `args` (array, optional) - Command arguments
      - `env` (object, optional) - Environment variables

✅ Valid Example:
```json
{
  "mcp": {
    "servers": {
      "browser": {
        "command": "python",
        "args": ["-m", "server"],
        "env": { "TIMEOUT": "5000" }
      },
      "file-system": {
        "command": "node",
        "args": ["/usr/local/bin/fs-server.js"]
      }
    }
  }
}
```

❌ Invalid Examples:
```json
{ "mcpServers": { } }          // Wrong field name (should be "mcp")
{ "mcp_servers": { } }         // Wrong field name
{ "MCP": { } }                 // Wrong case
{ "mcp": [ ] }                 // Should be object, not array
{ "mcp": { "Server": { } } }   // Server name must be lowercase
```

### tools
- **Type:** Object with boolean values
- **Required:** No
- **Field Name:** MUST be `tools` (PLURAL), NOT `tool`
- **Singular/Plural:** PLURAL
- **Allowed Keys:** `write`, `read`, `execute`, `browse`
- **Value Type:** BOOLEAN ONLY (true/false, NOT "true"/"false")
- **Official Reference:** https://docs.opencode.dev/config#tools

✅ Valid Examples:
```json
{ "tools": { "write": true, "read": true, "execute": false } }
{ "tools": { "write": false } }
{ "tools": { "browse": true } }
```

❌ Invalid Examples:
```json
{ "tool": { "write": true } }        // Wrong name (should be "tools")
{ "tools": { "write": "true" } }    // String "true", not boolean
{ "tools": { "write": 1 } }         // Number, not boolean
{ "tools": { "WRITE": true } }      // Key must be lowercase
```

### timeout
- **Type:** Integer (milliseconds)
- **Required:** No
- **Range:** 100 ≤ timeout ≤ 600000
- **Integer Only:** Yes (no decimals)
- **Description:** Request timeout in milliseconds

✅ Valid Examples:
```json
{ "timeout": 100 }
{ "timeout": 5000 }
{ "timeout": 600000 }
```

❌ Invalid Examples:
```json
{ "timeout": "5000" }          // String, not number
{ "timeout": 5000.5 }          // Decimal, not integer
{ "timeout": 50 }              // Below minimum (100)
{ "timeout": 700000 }          // Above maximum (600000)
```

### maxTokens
- **Type:** Integer
- **Required:** No
- **Range:** 1 ≤ maxTokens ≤ 128000
- **Integer Only:** Yes
- **Description:** Maximum tokens in response

✅ Valid Examples:
```json
{ "maxTokens": 1024 }
{ "maxTokens": 4000 }
{ "maxTokens": 128000 }
```

❌ Invalid Examples:
```json
{ "maxTokens": "4000" }        // String
{ "maxTokens": 4000.5 }        // Decimal
{ "maxTokens": 0 }             // Below minimum
{ "maxTokens": 200000 }        // Above maximum
```

---

## .zshrc

### plugins
- **Type:** Array of strings
- **Required:** No
- **Singular/Plural:** PLURAL (must be `plugins`, not `plugin`)
- **Description:** Zsh plugins to load

✅ Valid:
```json
{ "plugins": ["git", "npm", "zsh-autosuggestions"] }
```

❌ Invalid:
```json
{ "plugin": ["git"] }            // Should be "plugins"
{ "plugins": "git npm" }         // Should be array
```

### theme
- **Type:** String
- **Required:** No
- **Singular/Plural:** SINGULAR (must be `theme`, not `themes`)
- **Description:** Zsh theme name

✅ Valid:
```json
{ "theme": "robbyrussell" }
{ "theme": "agnoster" }
```

❌ Invalid:
```json
{ "themes": "robbyrussell" }    // Should be singular
{ "theme": ["robbyrussell"] }   // Should be string, not array
```

### aliases
- **Type:** Object (string keys → string values)
- **Required:** No
- **Key Naming:** lowercase_snake_case
- **Value Type:** String (shell command)
- **Description:** Shell aliases

✅ Valid:
```json
{
  "aliases": {
    "gp": "git push",
    "gb": "git branch",
    "cd_project": "cd ~/projects/my-project"
  }
}
```

❌ Invalid:
```json
{ "aliases": { "GP": "git push" } }     // Key must be lowercase
{ "aliases": { "gp-main": "..." } }    // Key must use underscore
{ "aliases": { "gpMain": "..." } }     // Key must be snake_case
```

### functions
- **Type:** Object (string keys → string values)
- **Required:** No
- **Key Naming:** lowercase_snake_case
- **Value Type:** String (shell function body)
- **Description:** Shell functions

### exports (when in .zshrc)
- **Type:** Object
- **Key Naming:** UPPERCASE_SNAKE_CASE
- **Value Type:** String

### paths
- **Type:** Array of strings
- **Singular/Plural:** PLURAL

---

## .zshenv

All fields are environment variables. Field names MUST be UPPERCASE_SNAKE_CASE.

### PATH
- **Type:** String
- **Naming:** UPPERCASE (must be `PATH`, not `path`)
- **Value:** Colon-separated list of directories

### EDITOR
- **Type:** String
- **Naming:** UPPERCASE (must be `EDITOR`, not `Editor` or `editor`)
- **Value:** Editor command (e.g., `vim`, `nano`, `code`)

### NODE_PATH, NPM_TOKEN, GITHUB_TOKEN, etc.
- **Type:** String
- **Naming:** UPPERCASE_SNAKE_CASE (all uppercase, underscores between words)
- **Not Allowed:** camelCase, lowercase, dashes

---

## docker-compose.yml

### version
- **Type:** String
- **Format:** X.Y (e.g., "3.9", "3.8")
- **Pattern:** `^\d+\.\d+$`
- **Required:** Yes

### services
- **Type:** Object
- **Singular/Plural:** PLURAL (must be `services`, not `service`)
- **Key Naming:** lowercase alphanumeric + underscores/hyphens
- **Required:** Yes

### networks (optional)
- **Type:** Object
- **Singular/Plural:** PLURAL (must be `networks`, not `network`)

### volumes (optional)
- **Type:** Object
- **Singular/Plural:** PLURAL (must be `volumes`, not `volume`)

---

## package.json

### dependencies
- **Type:** Object
- **Singular/Plural:** PLURAL
- **Keys:** Package names (lowercase, hyphens allowed)
- **Values:** Version specifiers

### devDependencies
- **Type:** Object
- **Naming Convention:** camelCase (must be `devDependencies`, not `dev_dependencies`)
- **Singular/Plural:** PLURAL

### scripts
- **Type:** Object
- **Singular/Plural:** PLURAL
- **Keys:** Script names
- **Values:** Shell commands

### keywords
- **Type:** Array of strings
- **Singular/Plural:** PLURAL (must be `keywords`, not `keyword`)

### name
- **Type:** String
- **Format:** lowercase alphanumeric + hyphens
- **Pattern:** `^[a-z0-9-]+$`

### version
- **Type:** String
- **Format:** Semantic versioning (X.Y.Z)
- **Pattern:** `^\d+\.\d+\.\d+`

---

## Quick Reference: Common Mistakes

| Mistake | Correct | Issue |
|---------|---------|-------|
| `mcpServers` | `mcp` | Field name should be singular |
| `tools.write: "true"` | `tools.write: true` | Must be boolean, not string |
| `plugins` (singular) | `plugins` | Field must be plural |
| `theme` (singular) | `theme` | Field must be singular |
| `path` | `PATH` | Env var must be UPPERCASE |
| `WRITE` | `write` | Config keys must be lowercase |
| `temperature: "0.7"` | `temperature: 0.7` | Must be number, not string |
| `maxTokens: 4000.5` | `maxTokens: 4000` | Must be integer |
| `gpt4` | `gpt-4` | Model name format |
| `service: {...}` | `services: {...}` | Docker field must be plural |

---

**Last Updated:** January 6, 2026
**Version:** 1.0.0
