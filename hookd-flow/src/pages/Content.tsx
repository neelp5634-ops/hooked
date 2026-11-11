import { useMemo, useState } from 'react';
import { LayoutGrid, Pencil, Plus, Table2, Trash2 } from 'lucide-react';
import { useStore } from '../store';
import { CONTENT_STATUSES, PLATFORMS, type ContentItem, type ContentStatus } from '../types';
import { formatDate, isOverdue } from '../lib/dates';
import ContentModal from '../components/ContentModal';
import { ConfirmDialog, EmptyState, btnGhost, btnPrimary, inputCls } from '../components/ui';

export default function Content() {
  const { data, dispatch } = useStore();
  const [view, setView] = useState<'table' | 'board'>('table');
  const [fc, setFc] = useState(''); const [fp, setFp] = useState(''); const [fs, setFs] = useState(''); const [from, setFrom] = useState(''); const [to, setTo] = useState('');
  const [editing, setEditing] = useState<ContentItem | 'new' | null>(null);
  const [deleting, setDeleting] = useState<ContentItem | null>(null);
  const clientName = (id: string) => data.clients.find((c) => c.id === id)?.businessName ?? 'Unknown';
  const list = useMemo(() => data.content
    .filter((c) => (!fc || c.clientId === fc) && (!fp || c.platform === fp) && (!fs || c.status === fs) && (!from || c.date >= from) && (!to || c.date <= to))
    .sort((a, b) => a.date.localeCompare(b.date)), [data.content, fc, fp, fs, from, to]);
  const setStatus = (i: ContentItem, status: ContentStatus) => dispatch({ type: 'saveContent', item: { ...i, status } });
  const StatusSelect = ({ i }: { i: ContentItem }) => (
    <select aria-label={`Status for ${i.title}`} className={`${inputCls} py-1`} value={i.status} onChange={(e) => setStatus(i, e.target.value as ContentStatus)}>{CONTENT_STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
  );
  const Actions = ({ i }: { i: ContentItem }) => (
    <span className="flex gap-1">
      <button aria-label={`Edit ${i.title}`} className="rounded p-1.5 text-slate-500 hover:bg-slate-100" onClick={() => setEditing(i)}><Pencil size={14} /></button>
      <button aria-label={`Delete ${i.title}`} className="rounded p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600" onClick={() => setDeleting(i)}><Trash2 size={14} /></button>
    </span>
  );
  const Due = ({ i }: { i: ContentItem }) => <>{formatDate(i.date)}{isOverdue(i.date, i.status) && <span className="ml-1 rounded bg-red-100 px-1.5 text-xs font-medium text-red-700">Overdue</span>}</>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Content planner</h1>
        <div className="flex gap-2">
          <div role="group" aria-label="View" className="flex overflow-hidden rounded-lg border border-slate-300">
            {([['table', Table2, 'Table'], ['board', LayoutGrid, 'Board']] as const).map(([v, Icon, label]) => (
              <button key={v} aria-pressed={view === v} onClick={() => setView(v)} className={`flex items-center gap-1 px-3 py-2 text-sm ${view === v ? 'bg-brand-600 text-white' : 'bg-white hover:bg-slate-100'}`}><Icon size={14} />{label}</button>
            ))}
          </div>
          <button className={btnPrimary} onClick={() => setEditing('new')} disabled={data.clients.length === 0}><Plus size={16} />New content</button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-5">
        <select aria-label="Filter by client" className={inputCls} value={fc} onChange={(e) => setFc(e.target.value)}><option value="">All clients</option>{data.clients.map((c) => <option key={c.id} value={c.id}>{c.businessName}</option>)}</select>
        <select aria-label="Filter by platform" className={inputCls} value={fp} onChange={(e) => setFp(e.target.value)}><option value="">All platforms</option>{PLATFORMS.map((p) => <option key={p}>{p}</option>)}</select>
        <select aria-label="Filter by status" className={inputCls} value={fs} onChange={(e) => setFs(e.target.value)}><option value="">All statuses</option>{CONTENT_STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
        <input type="date" aria-label="From date" className={inputCls} value={from} onChange={(e) => setFrom(e.target.value)} />
        <input type="date" aria-label="To date" className={inputCls} value={to} onChange={(e) => setTo(e.target.value)} />
      </div>
      {(fc || fp || fs || from || to) && <button className={btnGhost} onClick={() => { setFc(''); setFp(''); setFs(''); setFrom(''); setTo(''); }}>Clear filters</button>}
      {data.clients.length === 0 ? <EmptyState title="Add a client first" text="Content is linked to clients."><a className={btnPrimary} href="#/clients">Go to clients</a></EmptyState>
        : list.length === 0 ? <EmptyState title="No content found" text="Create content or adjust your filters." />
        : view === 'table' ? (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr>{['Title', 'Client', 'Platform', 'Date', 'Status', ''].map((h) => <th key={h} scope="col" className="px-3 py-2">{h}</th>)}</tr></thead>
              <tbody className="divide-y">{list.map((i) => (
                <tr key={i.id}><td className="px-3 py-2 font-medium">{i.title}<span className="block text-xs font-normal text-slate-500">{i.format}{i.pillar && ` · ${i.pillar}`}</span></td>
                  <td className="px-3 py-2">{clientName(i.clientId)}</td><td className="px-3 py-2">{i.platform}</td><td className="px-3 py-2"><Due i={i} /></td>
                  <td className="px-3 py-2"><StatusSelect i={i} /></td><td className="px-3 py-2"><Actions i={i} /></td></tr>
              ))}</tbody>
            </table>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {CONTENT_STATUSES.map((s) => (
              <section key={s} aria-label={s} className="rounded-xl bg-slate-100 p-2">
                <h2 className="mb-2 flex items-center justify-between px-1 text-sm font-semibold">{s}<span className="text-xs text-slate-500">{list.filter((i) => i.status === s).length}</span></h2>
                <ul className="space-y-2">{list.filter((i) => i.status === s).map((i) => (
                  <li key={i.id} className="space-y-1 rounded-lg bg-white p-3 text-sm shadow-sm">
                    <p className="font-medium">{i.title}</p><p className="text-xs text-slate-500">{clientName(i.clientId)} · {i.platform}</p><p className="text-xs"><Due i={i} /></p>
                    <div className="flex items-center gap-1"><StatusSelect i={i} /><Actions i={i} /></div>
                  </li>))}</ul>
              </section>
            ))}
          </div>
        )}
      {editing && <ContentModal item={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)} />}
      {deleting && <ConfirmDialog title="Delete content?" confirmLabel="Delete" onClose={() => setDeleting(null)} onConfirm={() => { dispatch({ type: 'deleteContent', id: deleting.id }); setDeleting(null); }}>"{deleting.title}" will be permanently deleted.</ConfirmDialog>}
    </div>
  );
}
