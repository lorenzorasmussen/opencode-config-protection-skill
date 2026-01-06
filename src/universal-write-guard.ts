// Global Write Guard - Intercepts fs.writeFileSync for protected files

import fs from 'fs';
import path from 'path';

const PROTECTED_FILES: Record<string, { requireManager: boolean; manager: string; errorMessage: string }> = {
  'opencode.json': {
    requireManager: true,
    manager: 'OpencodeConfigManager',
    errorMessage: 'opencode.json must be modified via OpencodeConfigManager'
  },
  '.zshrc': {
    requireManager: true,
    manager: 'ZshConfigManager',
    errorMessage: '.zshrc must be modified via ZshConfigManager'
  },
  '.zshenv': {
    requireManager: true,
    manager: 'ZshConfigManager',
    errorMessage: '.zshenv must be modified via ZshConfigManager'
  }
};

// INTERCEPT fs.writeFileSync
const originalWriteFileSync = fs.writeFileSync;
fs.writeFileSync = function (filePath: string | Buffer | URL, data: string | NodeJS.ArrayBufferView, options?: fs.WriteFileOptions): any {
  const fileName = path.basename(String(filePath));
  const protected_ = PROTECTED_FILES[fileName as keyof typeof PROTECTED_FILES];

  if (protected_?.requireManager) {
    const error = new Error(`
╔════════════════════════════════════════════════════════════╗
║ 🚫 PROTECTED FILE: Direct write BLOCKED                    ║
║                                                             ║
║ File: ${fileName}
║ Error: ${protected_.errorMessage}
║                                                             ║
║ You tried: fs.writeFileSync('${fileName}', ...)
║                                                             ║
║ You must use: ${protected_.manager}
║                                                             ║
║ Example:
║   import { ${protected_.manager} } from
║     '~/.config/config-managers';
║                                                             ║
║   const mgr = new ${protected_.manager}('${fileName}');
║   mgr.set('key', value);
║   mgr.save();  // ← Only way to write
║                                                             ║
║ This prevents AI from bypassing validation.
╚════════════════════════════════════════════════════════════╝
    `);
    error.name = 'PROTECTED_FILE_ERROR';
    throw error;
  }

  return originalWriteFileSync.call(this, filePath, data, options);
};

// INTERCEPT fs.appendFileSync
const originalAppendFileSync = fs.appendFileSync;
fs.appendFileSync = function (filePath: string | Buffer | URL, data: string | NodeJS.ArrayBufferView, options?: fs.WriteFileOptions): any {
  const fileName = path.basename(String(filePath));
  const protected_ = PROTECTED_FILES[fileName as keyof typeof PROTECTED_FILES];

  if (protected_?.requireManager) {
    throw new Error(`Cannot append to ${fileName}. Must use ${protected_.manager}.`);
  }

  return originalAppendFileSync.call(this, filePath, data, options);
};

console.log('✅ Write guard loaded - protected files:', Object.keys(PROTECTED_FILES));
