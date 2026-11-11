import { CLIENT_STATUSES, CONTENT_STATUSES, FORMATS, PLATFORMS, type AppData, type Client, type ContentItem, type Task } from '../types';
import { isValidISO } from './dates';

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export type ValidationResult = { ok: true; data: AppData } | { ok: false; errors: string[] };

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

/** Validates untrusted data (backup files, localStorage). Returns a cleaned copy with unknown fields stripped. */
export function validateData(raw: unknown): ValidationResult {
  const errors: string[] = [];
  const err = (m: string) => { if (errors.length < 12) errors.push(m); };
  if (!isObj(raw)) return { ok: false, errors: ['Data must be an object with clients, tasks and content.'] };

  const list = (key: string): unknown[] => {
    const v = raw[key];
    if (!Array.isArray(v)) { err(`"${key}" must be a list.`); return []; }
    return v;
  };
  const text = (o: Record<string, unknown>, k: string, where: string, required = false): string => {
    const v = o[k];
    if (typeof v !== 'string') { err(`${where}: "${k}" must be text.`); return ''; }
    if (required && !v.trim()) err(`${where}: "${k}" is required.`);
    return v;
  };
  const oneOf = <T extends string>(o: Record<string, unknown>, k: string, opts: readonly T[], where: string): T => {
    const v = o[k];
    if (typeof v !== 'string' || !opts.includes(v as T)) { err(`${where}: "${k}" must be one of ${opts.join(', ')}.`); return opts[0]; }
    return v as T;
  };
  const uniqueIds = (items: { id: string }[], label: string) => {
    const seen = new Set<string>();
    for (const i of items) { if (seen.has(i.id)) err(`Duplicate ${label} id "${i.id}".`); seen.add(i.id); }
  };

  const clients: Client[] = list('clients').map((c, i) => {
    const w = `Client #${i + 1}`;
    if (!isObj(c)) { err(`${w} is not an object.`); return null; }
    const email = text(c, 'email', w, true);
    if (email && !EMAIL_RE.test(email)) err(`${w}: email is not valid.`);
    const services = Array.isArray(c.services) && c.services.every((s) => typeof s === 'string') ? (c.services as string[]) : (err(`${w}: "services" must be a list of text.`), []);
    return {
      id: text(c, 'id', w, true), businessName: text(c, 'businessName', w, true), contactName: text(c, 'contactName', w),
      email, industry: text(c, 'industry', w), services, goals: text(c, 'goals', w), audience: text(c, 'audience', w),
      tone: text(c, 'tone', w), notes: text(c, 'notes', w), status: oneOf(c, 'status', CLIENT_STATUSES, w),
      createdAt: text(c, 'createdAt', w), ...(c.isSample === true ? { isSample: true } : {})
    } as Client;
  }).filter((x): x is Client => x !== null);

  const tasks: Task[] = list('tasks').map((t, i) => {
    const w = `Task #${i + 1}`;
    if (!isObj(t)) { err(`${w} is not an object.`); return null; }
    if (typeof t.done !== 'boolean') err(`${w}: "done" must be true or false.`);
    return { id: text(t, 'id', w, true), clientId: text(t, 'clientId', w, true), title: text(t, 'title', w, true), done: t.done === true, createdAt: text(t, 'createdAt', w) };
  }).filter((x): x is Task => x !== null);

  const content: ContentItem[] = list('content').map((c, i) => {
    const w = `Content #${i + 1}`;
    if (!isObj(c)) { err(`${w} is not an object.`); return null; }
    const date = text(c, 'date', w, true);
    if (date && !isValidISO(date)) err(`${w}: date must be a real date in YYYY-MM-DD format.`);
    return {
      id: text(c, 'id', w, true), clientId: text(c, 'clientId', w, true), title: text(c, 'title', w, true),
      platform: oneOf(c, 'platform', PLATFORMS, w), format: oneOf(c, 'format', FORMATS, w), pillar: text(c, 'pillar', w),
      hook: text(c, 'hook', w), caption: text(c, 'caption', w), date, status: oneOf(c, 'status', CONTENT_STATUSES, w),
      ...(c.isSample === true ? { isSample: true } : {})
    } as ContentItem;
  }).filter((x): x is ContentItem => x !== null);

  uniqueIds(clients, 'client'); uniqueIds(tasks, 'task'); uniqueIds(content, 'content');
  const clientIds = new Set(clients.map((c) => c.id));
  tasks.forEach((t) => { if (!clientIds.has(t.clientId)) err(`Task "${t.title}" points to a client that does not exist.`); });
  content.forEach((c) => { if (!clientIds.has(c.clientId)) err(`Content "${c.title}" points to a client that does not exist.`); });

  return errors.length ? { ok: false, errors } : { ok: true, data: { clients, tasks, content } };
}
