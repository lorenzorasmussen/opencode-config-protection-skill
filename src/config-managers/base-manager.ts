// Abstract Base Manager for All Config Types

import fs from 'fs';
import path from 'path';
import { z } from 'zod';

export abstract class BaseConfigManager {
  protected filePath: string;
  protected config: any;
  protected schema: z.ZodSchema;
  protected backupDir: string;
  protected template: any;
  protected auditLog: any[] = [];

  constructor(filePath: string, schema: z.ZodSchema, template: any) {
    this.filePath = filePath;
    this.schema = schema;
    this.template = template;
    this.backupDir = `${filePath}.backups`;

    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }

    this.load();
  }

  protected load(): void {
    try {
      const raw = JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
      this.validateAgainstTemplate(raw);
      this.config = this.schema.parse(raw);
      console.log(`✅ Loaded: ${path.basename(this.filePath)}`);
    } catch (err) {
      console.error(`❌ Failed to load ${this.filePath}`);
      throw err;
    }
  }

  protected validateAgainstTemplate(obj: any): void {
    const allowedFields = Object.keys(this.template);
    const providedFields = Object.keys(obj);

    for (const field of providedFields) {
      if (!allowedFields.includes(field)) {
        throw new Error(
          `❌ Invalid field: "${field}"\n` +
          `Official fields: ${allowedFields.join(', ')}\n` +
          `See: ${this.getDocLink()}`
        );
      }
    }
  }

  protected setField<K extends keyof any>(key: K, value: any): void {
    if (!(key in this.template)) {
      const allowedFields = Object.keys(this.template);
      throw new Error(
        `❌ Field "${String(key)}" not official\n` +
        `Official fields: ${allowedFields.join(', ')}`
      );
    }

    this.validateFieldValue(key, value);
    (this.config as any)[key] = value;
    this.auditLog.push({
      timestamp: new Date().toISOString(),
      operation: 'set',
      field: String(key),
      value: JSON.stringify(value),
      source: 'config-manager'
    });
  }

  protected abstract validateFieldValue(key: any, value: any): void;
  protected abstract getDocLink(): string;

  save(): void {
    try {
      this.validateAgainstTemplate(this.config);
      this.schema.parse(this.config);
      this.createBackup();
      fs.writeFileSync(this.filePath, JSON.stringify(this.config, null, 2));
      console.log(`✅ Saved: ${path.basename(this.filePath)}`);
    } catch (err) {
      console.error(`❌ Save failed, restoring from backup...`);
      this.restoreLatestBackup();
      throw err;
    }
  }

  protected createBackup(): void {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = `${this.backupDir}/backup-${timestamp}.json`;
    fs.copyFileSync(this.filePath, backupPath);
    this.pruneOldBackups(10);
  }

  protected pruneOldBackups(maxKeep: number): void {
    const backups = fs.readdirSync(this.backupDir).sort().reverse();
    for (let i = maxKeep; i < backups.length; i++) {
      fs.unlinkSync(`${this.backupDir}/${backups[i]}`);
    }
  }

  protected restoreLatestBackup(): void {
    const backups = fs.readdirSync(this.backupDir).sort().reverse();
    if (backups.length === 0) throw new Error('No backup available');
    const latestBackup = `${this.backupDir}/${backups[0]}`;
    fs.copyFileSync(latestBackup, this.filePath);
    this.load();
  }

  getConfig(): Readonly<any> {
    return Object.freeze({ ...this.config });
  }

  getAuditLog(): any[] {
    return [...this.auditLog];
  }

  listBackups(): string[] {
    return fs.readdirSync(this.backupDir).sort().reverse();
  }
}
