// Config Manager Factory

import { OpencodeConfigManager } from './opencode-manager';
import { ZshConfigManager } from './zsh-manager';

const MANAGERS: Record<string, any> = {
  'opencode.json': OpencodeConfigManager,
  '.zshrc': ZshConfigManager,
  '.zshenv': ZshConfigManager
};

export function getConfigManager(filePath: string) {
  const fileName = filePath.split('/').pop() || filePath;
  const ManagerClass = MANAGERS[fileName];

  if (!ManagerClass) {
    throw new Error(
      `Unknown config file: ${fileName}\n` +
      `Supported files: ${Object.keys(MANAGERS).join(', ')}`
    );
  }

  return new ManagerClass(filePath);
}

export { OpencodeConfigManager, ZshConfigManager };
