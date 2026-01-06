// Zsh Config Manager

import { BaseConfigManager } from './base-manager';
import { ZshrcSchema, ZshenvSchema } from '../schemas/all-schemas';
import { getFieldRule, validateFieldAgainstRule } from '../schemas/field-registry';

const ZSHRC_TEMPLATE = {
  exports: true,
  aliases: true,
  functions: true,
  plugins: true,
  theme: true,
  paths: true
};

const ZSHENV_TEMPLATE = {
  PATH: true,
  EDITOR: true,
  SHELL: true,
  PAGER: true,
  NODE_PATH: true,
  NPM_TOKEN: true,
  GITHUB_TOKEN: true
};

export class ZshConfigManager extends BaseConfigManager {
  private isZshrc: boolean;

  constructor(filePath: string, isZshrc: boolean = true) {
    const schema = isZshrc ? ZshrcSchema : ZshenvSchema;
    const template = isZshrc ? ZSHRC_TEMPLATE : ZSHENV_TEMPLATE;
    super(filePath, schema, template);
    this.isZshrc = isZshrc;
  }

  addAlias(name: string, command: string): void {
    if (!/^[a-z0-9_]+$/.test(name)) {
      throw new Error(`Alias name must be lowercase alphanumeric, got: "${name}"`);
    }
    if (!this.config.aliases) {
      this.config.aliases = {};
    }
    if (name in this.config.aliases) {
      console.warn(`⚠️  Alias "${name}" already exists, overwriting`);
    }
    this.config.aliases[name] = command;
    this.auditLog.push({
      timestamp: new Date().toISOString(),
      operation: 'add-alias',
      aliasName: name,
      source: 'config-manager'
    });
  }

  addExport(name: string, value: string): void {
    if (!/^[A-Z][A-Z0-9_]*$/.test(name)) {
      throw new Error(`Export name must be UPPERCASE_SNAKE_CASE, got: "${name}"`);
    }
    if (!this.config.exports) {
      this.config.exports = {};
    }
    if (name in this.config.exports) {
      console.warn(`⚠️  Export "${name}" already exists, overwriting`);
    }
    this.config.exports[name] = value;
  }

  addPlugin(pluginName: string): void {
    if (!this.config.plugins) {
      this.config.plugins = [];
    }
    if (this.config.plugins.includes(pluginName)) {
      console.warn(`⚠️  Plugin "${pluginName}" already added`);
      return;
    }
    this.config.plugins.push(pluginName);
  }

  setTheme(themeName: string): void {
    this.config.theme = themeName;
  }

  protected validateFieldValue(key: any, value: any): void {
    const fileType = this.isZshrc ? '.zshrc' : '.zshenv';
    const rule = getFieldRule(fileType, String(key));
    if (!rule) {
      throw new Error(`Unknown field: ${String(key)}`);
    }
    const validation = validateFieldAgainstRule(rule, value);
    if (!validation.valid) {
      throw new Error(`Invalid value for "${String(key)}": ${validation.errors[0]}`);
    }
  }

  protected getDocLink(): string {
    return 'https://zsh.sourceforge.io/Doc/Release/';
  }
}
