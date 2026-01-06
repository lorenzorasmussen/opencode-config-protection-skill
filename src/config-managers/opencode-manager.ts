// OpenCode Config Manager

import { BaseConfigManager } from './base-manager';
import { OpencodeConfigSchema } from '../schemas/all-schemas';
import { getFieldRule, validateFieldAgainstRule } from '../schemas/field-registry';

const OPENCODE_TEMPLATE = {
  model: true,
  temperature: true,
  mcp: true,
  tools: true,
  timeout: true,
  maxTokens: true
};

export class OpencodeConfigManager extends BaseConfigManager {
  constructor(filePath: string = '~/.config/opencode/opencode.json') {
    super(filePath, OpencodeConfigSchema, OPENCODE_TEMPLATE);
  }

  setModel(model: 'opencode/glm-4.7' | 'gpt-4' | 'claude-3-opus'): void {
    const rule = getFieldRule('opencode.json', 'model');
    if (rule) {
      const validation = validateFieldAgainstRule(rule, model);
      if (!validation.valid) {
        throw new Error(`Invalid model: ${validation.errors.join(', ')}`);
      }
    }
    this.setField('model', model);
  }

  setTemperature(temp: number): void {
    const rule = getFieldRule('opencode.json', 'temperature');
    if (rule) {
      const validation = validateFieldAgainstRule(rule, temp);
      if (!validation.valid) {
        throw new Error(`Invalid temperature: ${validation.errors.join(', ')}`);
      }
    }
    this.setField('temperature', temp);
  }

  setTools(tools: { write: boolean; read: boolean; execute: boolean }): void {
    for (const [key, value] of Object.entries(tools)) {
      if (typeof value !== 'boolean') {
        throw new Error(`tools.${key} must be boolean true/false, not "${value}"`);
      }
    }
    this.setField('tools', tools);
  }

  setMcpServer(serverName: string, config: { command: string; args?: string[]; env?: Record<string, string> }): void {
    if (!this.config.mcp) {
      this.config.mcp = { servers: {} };
    }
    if (!/^[a-z0-9-]+$/.test(serverName)) {
      throw new Error(`Server name must be lowercase alphanumeric + hyphens, got: "${serverName}"`);
    }
    if (typeof config.command !== 'string' || !config.command.trim()) {
      throw new Error('Server command required and must be string');
    }
    this.config.mcp.servers[serverName] = config;
    this.auditLog.push({
      timestamp: new Date().toISOString(),
      operation: 'add-mcp-server',
      serverName,
      source: 'config-manager'
    });
  }

  protected validateFieldValue(key: any, value: any): void {
    const rule = getFieldRule('opencode.json', String(key));
    if (!rule) {
      throw new Error(`Unknown field: ${String(key)}`);
    }
    const validation = validateFieldAgainstRule(rule, value);
    if (!validation.valid) {
      console.error(`❌ Invalid value for "${String(key)}"`);
      console.error(`   Errors: ${validation.errors.join('; ')}`);
      throw new Error(`Invalid value for "${String(key)}": ${validation.errors[0]}`);
    }
  }

  protected getDocLink(): string {
    return 'https://docs.opencode.dev/config';
  }
}
