import { DATA_VERSION, type AppData } from '../types';
import { validateData, type ValidationResult } from './validate';

export const BACKUP_APP = 'hookd-flow';

export function createBackupJSON(data: AppData): string {
  return JSON.stringify({ app: BACKUP_APP, version: DATA_VERSION, exportedAt: new Date().toISOString(), data }, null, 2);
}

/** Parses and validates a backup file's text. Never touches saved data. */
export function parseBackup(text: string): ValidationResult {
  let parsed: unknown;
  try { parsed = JSON.parse(text); } catch { return { ok: false, errors: ['This file is not valid JSON.'] }; }
  if (typeof parsed !== 'object' || parsed === null) return { ok: false, errors: ['Backup must be a JSON object.'] };
  const p = parsed as { app?: unknown; version?: unknown; data?: unknown };
  if (p.app !== BACKUP_APP) return { ok: false, errors: ['This is not a HOOKD Flow backup file.'] };
  if (p.version !== DATA_VERSION) return { ok: false, errors: [`Unsupported backup version: ${String(p.version)}.`] };
  return validateData(p.data);
}

export function downloadFile(filename: string, content: string, mime: string) {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const a = document.createElement('a');
  a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}
