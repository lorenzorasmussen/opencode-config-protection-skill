# CONFIG FILE MANAGEMENT - MANDATORY FOR ALL OPERATIONS

## RULE 1: ONLY Import From Official Source

```typescript
import { getConfigManager } from '~/.config/config-managers';
// This is the ONLY way to modify config files
```

## RULE 2: Use Type-Safe Setters

✅ CORRECT - Using typed methods:
```typescript
const mgr = getConfigManager('opencode.json');
mgr.setModel('gpt-4');           // Type-checked
mgr.setTemperature(0.7);         // Range validated
mgr.setTools({ write: true });   // Boolean validated
mgr.save();                       // Full validation before write
```

❌ WRONG - Direct object manipulation:
```typescript
const config = JSON.parse(fs.readFileSync('opencode.json'));
config.model = 'gpt-4';
config.mcpServers = {};          // ← Hallucination! Wrong field name
config.tools.write = 'true';     // ← Type error! Should be boolean
fs.writeFileSync('opencode.json', JSON.stringify(config));
```

## RULE 3: Know Official Fields For Each File

### opencode.json (Official Fields ONLY)
- model (enum: "opencode/glm-4.7", "gpt-4", "claude-3-opus")
- temperature (number: 0-2)
- mcp (object with servers, singular NOT "mcpServers")
- tools (object with booleans, singular NOT "tool")
- timeout (integer: 100-600000)
- maxTokens (integer: 1-128000)

NOT allowed (AI hallucinations):
- ❌ mcpServers (wrong field name, should be "mcp")
- ❌ capabilities (made-up field)
- ❌ features (made-up field)
- ❌ tool (wrong singularity, should be "tools")
- ❌ settings (wrong field)

### .zshrc / .zshenv (Official Fields ONLY)
- plugins (array, PLURAL)
- theme (string, SINGULAR)
- PATH (string, UPPERCASE_SNAKE_CASE)
- EDITOR (string, UPPERCASE_SNAKE_CASE)
- aliases (object, lowercase keys)
- functions (object, snake_case keys)

NOT allowed:
- ❌ plugin (wrong singularity, should be "plugins")
- ❌ themes (wrong singularity, should be "theme")
- ❌ path (wrong casing, should be "PATH")
- ❌ Editor (wrong casing, should be "EDITOR")

### docker-compose.yml
- version (string, X.Y format)
- services (object, PLURAL)
- networks (object, PLURAL)
- volumes (object, PLURAL)

NOT allowed:
- ❌ service (wrong singularity, should be "services")
- ❌ network (wrong singularity, should be "networks")
- ❌ volume (wrong singularity, should be "volumes")

## RULE 4: Field Naming Conventions

🔒 UPPERCASE_SNAKE_CASE (Environment Variables)
- Correct: PATH, EDITOR, NODE_PATH, NPM_TOKEN
- Wrong: path, Editor, nodeEnv, npm_token

🔒 camelCase (npm package.json)
- Correct: devDependencies, scripts, engines
- Wrong: dev_dependencies, DevDependencies, devdependencies

🔒 lowercase_snake_case (Shell aliases, functions)
- Correct: my_alias, user_function, cd_project
- Wrong: myAlias, UserFunction, cd-project

## RULE 5: Type Rules (NO DEVIATIONS)

🔒 Boolean MUST be true/false, NOT "true"/"false"
- Correct: { write: true }
- Wrong: { write: "true" }
- Why: Strings break validation

🔒 Numbers MUST be numeric, NOT string
- Correct: { temperature: 0.7, timeout: 5000 }
- Wrong: { temperature: "0.7", timeout: "5000" }

🔒 Integer MUST be whole number, NOT decimal
- Correct: { maxTokens: 4000 }
- Wrong: { maxTokens: 4000.5 }

🔒 String MUST be string, NOT number
- Correct: { model: "gpt-4" }
- Wrong: { model: gpt-4 } (unquoted)

🔒 Array MUST be array, NOT object or string
- Correct: { plugins: ["git", "npm"] }
- Wrong: { plugins: "git npm" }
- Wrong: { plugins: { name: "git" } }

🔒 Enum MUST be from allowed list ONLY
- Allowed: ["opencode/glm-4.7", "gpt-4", "claude-3-opus"]
- Wrong: ["gpt-4-turbo"] (not in list)
- Wrong: ["GPT-4"] (case-sensitive, must be lowercase)

## RULE 6: Singular vs Plural (MANDATORY)

Plural (multiple items possible):
- plugins, services, ports, volumes, networks, dependencies, keywords

Singular (one item only):
- theme, model, version, EDITOR

❌ DO NOT GUESS - Check official schema

## RULE 7: If You Get an Error

If you see:
```
❌ Invalid field: "mcpServers"
   Official fields: model, temperature, mcp, tools
```

Then:
1. Remove the invalid field
2. Use the correct field from the list
3. Check the example below the error
4. Retry

If you see:
```
❌ Field must be boolean (true/false), not "true"
```

Then:
1. Change the value from "true" to true (remove quotes)
2. Retry

## RULE 8: Testing Your Changes

BEFORE asking for approval:
```typescript
import { getConfigManager } from '~/.config/config-managers';

try {
  const mgr = getConfigManager('opencode.json');
  mgr.setModel('gpt-4');
  mgr.save();
  console.log('✅ Configuration valid and saved');
} catch (err) {
  console.error('❌ Error:', err.message);
  // Fix the error and retry
}
```

If it throws an error, FIX IT before considering the task complete.

## RULE 9: NO Shortcuts or Workarounds

These are BLOCKED and will fail:
- ❌ fs.writeFileSync() - Use ConfigManager instead
- ❌ JSON.parse() + modify + stringify - Use ConfigManager instead
- ❌ Manual field additions - Use ConfigManager instead
- ❌ Making up new fields - Not allowed, use official fields only

## RULE 10: Reference Official Docs

If unsure about a field:
- opencode.json: https://docs.opencode.dev/config
- docker-compose.yml: https://docs.docker.com/compose/compose-file/
- package.json: https://docs.npmjs.com/cli/configuring-npm/package-json
- .zshrc / .zshenv: https://zsh.sourceforge.io/

DO NOT INVENT FIELDS. Check the docs first.

---

## SUMMARY

✅ USE: ConfigManager with typed setters
✅ USE: Only official fields from schema
✅ USE: Correct naming conventions (UPPERCASE, camelCase, etc.)
✅ USE: Correct types (boolean not "true", numbers not strings, etc.)
✅ USE: Singular/plural rules
✅ CHECK: Official docs if unsure

❌ DON'T: Use fs.writeFileSync() directly
❌ DON'T: Make up new fields
❌ DON'T: Use wrong types or naming
❌ DON'T: Guess at field names
❌ DON'T: Ignore validation errors

If you follow these rules, config files will NEVER corrupt.
