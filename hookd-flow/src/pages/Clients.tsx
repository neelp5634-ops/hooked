import { useMemo, useState } from 'react';
import { Plus, Search, Trash2 } from 'lucide-react';
import { useStore } from '../store';
import { CLIENT_STATUSES } from '../types';
import { progressPercent } from '../lib/tasks';
import ClientModal from '../components/ClientModal';
import { Badge, ConfirmDialog, EmptyState, ProgressBar, SampleTag, btnPrimary, inputCls } from '../components/ui';

export default function Clients() {
  const { data, dispatch } = useStore();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('All');
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return data.clients.filter((c) => (status === 'All' || c.status === status) && (!s || [c.businessName, c.contactName, c.email, c.industry].some((v) => v.toLowerCase().includes(s))));
  }, [data.clients, q, status]);
  const target = data.clients.find((c) => c.id === deleting);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Clients</h1>
        <button className={btnPrimary} onClick={() => setAdding(true)}><Plus size={16} />New client</button>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-2.5 text-slate-400" />
          <input aria-label="Search clients" placeholder="Search by name, email or industry" className={`${inputCls} pl-9`} value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select aria-label="Filter by status" className={`${inputCls} sm:w-44`} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option>All</option>{CLIENT_STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      {data.clients.length === 0 ? (
        <EmptyState title="No clients yet" text="Add your first client to start onboarding."><button className={btnPrimary} onClick={() => setAdding(true)}>Add client</button></EmptyState>
      ) : list.length === 0 ? <EmptyState title="No matches" text="Try a different search or status filter." /> : (
        <ul className="grid gap-3 md:grid-cols-2">
          {list.map((c) => {
            const tasks = data.tasks.filter((t) => t.clientId === c.id);
            return (
              <li key={c.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
                <div className="flex items-start justify-between gap-2">
                  <a href={`#/clients/${c.id}`} className="font-semibold hover:text-brand-600">{c.businessName}{c.isSample && <SampleTag />}</a>
                  <Badge label={c.status} />
                </div>
                <p className="text-sm text-slate-500">{c.contactName} · {c.industry || 'No industry'}</p>
                <div className="mt-3"><ProgressBar percent={progressPercent(tasks)} /><p className="mt-1 text-xs text-slate-500">{tasks.filter((t) => t.done).length}/{tasks.length} tasks done</p></div>
                <div className="mt-3 flex justify-end gap-2">
                  <a href={`#/clients/${c.id}`} className="rounded-lg px-3 py-1.5 text-sm font-medium text-brand-700 hover:bg-brand-50">View</a>
                  <button onClick={() => setDeleting(c.id)} aria-label={`Delete ${c.businessName}`} className="rounded-lg p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600"><Trash2 size={16} /></button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {adding && <ClientModal onClose={() => setAdding(false)} />}
      {target && (
        <ConfirmDialog title={`Delete ${target.businessName}?`} confirmLabel="Delete client" onClose={() => setDeleting(null)} onConfirm={() => { dispatch({ type: 'deleteClient', id: target.id }); setDeleting(null); }}>
          This permanently deletes the client <strong>and all of their onboarding tasks and content</strong>. This cannot be undone.
        </ConfirmDialog>
      )}
    </div>
  );
}
