import { useState } from 'react';
import { CalendarClock, ListChecks, Plus, UserPlus, Users } from 'lucide-react';
import { useStore } from '../store';
import { formatDate, isWithinNextDays } from '../lib/dates';
import ClientModal from '../components/ClientModal';
import { Badge, EmptyState, btnGhost, btnPrimary } from '../components/ui';

export default function Dashboard() {
  const { data } = useStore();
  const [adding, setAdding] = useState(false);
  const name = (id: string) => data.clients.find((c) => c.id === id)?.businessName ?? 'Unknown';
  const pending = data.tasks.filter((t) => !t.done);
  const upcoming = data.content.filter((c) => isWithinNextDays(c.date, 7)).sort((a, b) => a.date.localeCompare(b.date));
  const metrics = [
    { label: 'Total clients', value: data.clients.length, icon: Users },
    { label: 'Onboarding now', value: data.clients.filter((c) => c.status === 'Onboarding').length, icon: UserPlus },
    { label: 'Incomplete tasks', value: pending.length, icon: ListChecks },
    { label: 'Content in next 7 days', value: upcoming.length, icon: CalendarClock }
  ];
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-2"><a className={btnGhost} href="#/content"><CalendarClock size={16} />Plan content</a><button className={btnPrimary} onClick={() => setAdding(true)}><Plus size={16} />New client</button></div>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {metrics.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <Icon size={18} className="text-brand-600" /><p className="mt-2 text-2xl font-bold">{value}</p><p className="text-xs text-slate-500">{label}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="up">
          <h2 id="up" className="mb-2 font-semibold">Upcoming content</h2>
          {upcoming.length === 0 ? <EmptyState title="Nothing scheduled" text="No content is scheduled in the next 7 days." /> : (
            <ul className="divide-y rounded-xl border border-slate-200 bg-white">
              {upcoming.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-3 p-3 text-sm">
                  <div><p className="font-medium">{c.title}</p><p className="text-xs text-slate-500">{name(c.clientId)} · {c.platform} · {formatDate(c.date)}</p></div><Badge label={c.status} />
                </li>
              ))}
            </ul>
          )}
        </section>
        <section aria-labelledby="pt">
          <h2 id="pt" className="mb-2 font-semibold">Pending onboarding tasks</h2>
          {pending.length === 0 ? <EmptyState title="All caught up" text="Every onboarding task is complete." /> : (
            <ul className="divide-y rounded-xl border border-slate-200 bg-white">
              {pending.slice(0, 8).map((t) => (
                <li key={t.id} className="p-3 text-sm"><a className="font-medium hover:text-brand-600" href={`#/clients/${t.clientId}`}>{t.title}</a><p className="text-xs text-slate-500">{name(t.clientId)}</p></li>
              ))}
            </ul>
          )}
        </section>
      </div>
      {adding && <ClientModal onClose={() => setAdding(false)} />}
    </div>
  );
}
