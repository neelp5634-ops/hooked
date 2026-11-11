import type { AppData } from '../types';

/** RFC 4180 escaping, plus a leading apostrophe on cells that spreadsheets would run as formulas. */
export function csvCell(value: unknown): string {
  let s = value === null || value === undefined ? '' : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function toCSV(header: string[], rows: unknown[][]): string {
  return '\uFEFF' + [header, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n') + '\r\n';
}

export function clientsCSV({ clients, tasks }: AppData): string {
  return toCSV(
    ['Business name', 'Contact name', 'Email', 'Industry', 'Services', 'Goals', 'Audience', 'Brand tone', 'Notes', 'Status', 'Tasks done', 'Tasks total'],
    clients.map((c) => {
      const t = tasks.filter((x) => x.clientId === c.id);
      return [c.businessName, c.contactName, c.email, c.industry, c.services.join('; '), c.goals, c.audience, c.tone, c.notes, c.status, t.filter((x) => x.done).length, t.length];
    })
  );
}

export function contentCSV({ clients, content }: AppData): string {
  const name = new Map(clients.map((c) => [c.id, c.businessName]));
  return toCSV(
    ['Title', 'Client', 'Platform', 'Format', 'Pillar', 'Hook', 'Caption or brief', 'Scheduled date', 'Status'],
    content.map((c) => [c.title, name.get(c.clientId) ?? '', c.platform, c.format, c.pillar, c.hook, c.caption, c.date, c.status])
  );
}
