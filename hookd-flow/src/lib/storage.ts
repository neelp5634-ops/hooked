import { DATA_VERSION, EMPTY_DATA, type AppData } from '../types';
import { validateData } from './validate';
import { buildSampleData } from './seed';

export const STORAGE_KEY = 'hookd-flow:v1';

export type LoadResult =
  | { status: 'ok'; data: AppData }
  | { status: 'corrupt'; raw: string; errors: string[] }
  | { status: 'unavailable'; data: AppData };

/**
 * Key missing  -> first launch: seed sample data.
 * Key present  -> use it exactly as stored (an intentionally cleared app stores empty data, so samples never return).
 * Unreadable   -> report 'corrupt' and do NOT overwrite; the raw text stays in localStorage.
 */
export function loadState(): LoadResult {
  let raw: string | null;
  try { raw = localStorage.getItem(STORAGE_KEY); } catch { return { status: 'unavailable', data: buildSampleData() }; }
  if (raw === null) return { status: 'ok', data: buildSampleData() };
  try {
    const parsed = JSON.parse(raw) as { version?: unknown; data?: unknown };
    if (parsed.version !== DATA_VERSION) return { status: 'corrupt', raw, errors: [`Unsupported data version: ${String(parsed.version)}.`] };
    const result = validateData(parsed.data);
    return result.ok ? { status: 'ok', data: result.data } : { status: 'corrupt', raw, errors: result.errors };
  } catch {
    return { status: 'corrupt', raw, errors: ['Saved data is not valid JSON.'] };
  }
}

export function saveState(data: AppData): boolean {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: DATA_VERSION, data })); return true; } catch { return false; }
}

/** Keeps a copy of unreadable data under a separate key before the user chooses to reset. */
export function preserveCorrupt(raw: string): string {
  const key = `${STORAGE_KEY}:corrupt-${Date.now()}`;
  try { localStorage.setItem(key, raw); } catch { /* storage full: caller still offers a download */ }
  return key;
}

export const clearAllData = (): boolean => saveState(EMPTY_DATA);
