// All dates are local calendar dates as YYYY-MM-DD strings. They sort correctly as strings.
const pad = (n: number) => String(n).padStart(2, '0');

export const toLocalISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const todayISO = () => toLocalISO(new Date());

export function isValidISO(s: string): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return false;
  return toLocalISO(new Date(+m[1], +m[2] - 1, +m[3])) === s;
}

export function addDaysISO(iso: string, n: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  return toLocalISO(new Date(y, m - 1, d + n));
}

export const isOverdue = (date: string, status: string, today = todayISO()) => status !== 'Published' && date < today;
export const isWithinNextDays = (date: string, days = 7, today = todayISO()) => date >= today && date <= addDaysISO(today, days);

export function formatDate(iso: string): string {
  if (!isValidISO(iso)) return iso;
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}
