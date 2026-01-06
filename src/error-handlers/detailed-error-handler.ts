// Detailed Error Handler

import { z } from 'zod';
import { getFieldRule } from '../schemas/field-registry';

export interface DetailedError {
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  file: string;
  field?: string;
  value?: any;
  message: string;
  rule?: any;
  suggestions: string[];
  officialDocs?: string;
  validExamples?: any[];
  invalidExamples?: any[];
  recoverySteps: string[];
}

export class DetailedErrorHandler {
  static handleValidationError(error: z.ZodError, filePath: string): DetailedError {
    const issue = error.issues[0];
    const fieldName = issue.path.join('.');
    const rule = getFieldRule(filePath, fieldName);

    return {
      type: 'VALIDATION_ERROR',
      severity: 'high',
      file: filePath,
      field: fieldName,
      message: issue.message,
      rule,
      suggestions: [issue.message],
      officialDocs: rule?.officialReference,
      validExamples: rule?.validExamples,
      invalidExamples: rule?.invalidExamples,
      recoverySteps: [
        `1. Check field "${fieldName}" in ${filePath}`,
        `2. Verify the value matches official spec: ${rule?.officialReference}`,
        `3. Update to a valid value from examples above`,
        `4. Save and retry`
      ]
    };
  }

  static handleProtectedFileError(filePath: string, attemptedValue?: string): DetailedError {
    return {
      type: 'PROTECTED_FILE_ERROR',
      severity: 'critical',
      file: filePath,
      message: `File cannot be written directly using fs.writeFileSync()`,
      suggestions: [
        `Use the appropriate ConfigManager instead of raw fs.writeFileSync()`,
        `Example: const mgr = new OpencodeConfigManager(); mgr.set(...); mgr.save();`
      ],
      recoverySteps: [
        `1. Identify which ConfigManager to use for ${filePath}`,
        `2. Replace direct write with: new [Manager](filepath).set(...).save()`,
        `3. Retry the operation`
      ]
    };
  }

  static printDetailedError(error: DetailedError): void {
    const severity_emoji = {
      critical: '🚫',
      high: '❌',
      medium: '⚠️',
      low: 'ℹ️'
    };

    console.error(`
╔════════════════════════════════════════════════════════════╗
║ ${severity_emoji[error.severity]} ${error.type}
║
║ File: ${error.file}
${error.field ? `║ Field: ${error.field}\n` : ''}${error.value !== undefined ? `║ Value: ${JSON.stringify(error.value)}\n` : ''}║ Message: ${error.message}
║
╠════════════════════════════════════════════════════════════╣
║ 💡 SUGGESTIONS:
${error.suggestions.map(s => `║    ${s}`).join('\n')}
║
╠════════════════════════════════════════════════════════════╣
║ ✅ HOW TO FIX:
${error.recoverySteps.map((step, i) => `║    ${step}`).join('\n')}
║
${error.validExamples ? `║ ✅ VALID EXAMPLES:\n${error.validExamples.map(ex => `║    ${JSON.stringify(ex)}`).join('\n')}\n║\n` : ''}${error.invalidExamples ? `║ ❌ INVALID EXAMPLES:\n${error.invalidExamples.map(ex => `║    ${JSON.stringify(ex)}`).join('\n')}\n║\n` : ''}${error.officialDocs ? `║ 📖 OFFICIAL DOCS:\n║    ${error.officialDocs}\n║\n` : ''}╚════════════════════════════════════════════════════════════╝
    `);
  }
}
