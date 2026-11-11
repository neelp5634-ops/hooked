import { useState, type FormEvent } from 'react';
import { ArrowLeft, Check, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useStore } from '../store';
import { newId } from '../lib/id';
import { progressPercent } from '../lib/tasks';
import { formatDate, isOverdue } from '../lib/dates';
import { go } from '../router';
import ClientModal from '../components/ClientModal';
import { Badge, ConfirmDialog, EmptyState, ProgressBar, SampleTag, btnGhost, btnPrimary, inputCls } from '../components/ui';

function Info({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt><dd className="mt-0.5 whitespace-pre-wrap text-sm">{value || '—'}</dd></div>;
}

export default function ClientDetail({ id }: { id: string }) {
  const { data, dispatch } = useStore();
  const client = data.clients.find((c) => c.id === id);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [taskError, setTaskError] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  if (!client) return <EmptyState title="Client not found" text="It may have been deleted."><a className={btnPrimary} href="#/clients">Back to clients</a></EmptyState>;
  const tasks = data.tasks.filter((t) => t.clientId === id);
  const content = data.content.filter((c) => c.clientId === id).sort((a, b) => a.date.localeCompare(b.date));
  const pct = progressPercent(tasks);

  const addTask = (e: FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) { setTaskError('Enter a task title.'); return; }
    dispatch({ type: 'saveTask', task: { id: newId(), clientId: id, title: newTitle.trim(), done: false, createdAt: new Date().toISOString() } });
    setNewTitle(''); setTaskError('');
  };
  const saveEdit = (e: FormEvent) => {
    e.preventDefault();
    const t = tasks.find((x) => x.id === editId);
    if (t && editTitle.trim()) dispatch({ type: 'saveTask', task: { ...t, title: editTitle.trim() } });
    if (editTitle.trim()) setEditId(null);
  };

  return (
    <div className="space-y-6">
      <a href="#/clients" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600"><ArrowLeft size={14} />All clients</a>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><h1 className="text-2xl font-bold">{client.businessName}{client.isSample && <SampleTag />}</h1><p className="text-sm text-slate-500">{client.contactName} · <a className="hover:text-brand-600" href={`mailto:${client.email}`}>{client.email}</a></p></div>
        <div className="flex items-center gap-2"><Badge label={client.status} />
          <button className={btnGhost} onClick={() => setEditing(true)}><Pencil size={14} />Edit</button>
          <button className={btnGhost} onClick={() => setDeleting(true)}><Trash2 size={14} />Delete</button></div>
      </div>
      <section aria-labelledby="prof" className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 id="prof" className="mb-3 font-semibold">Profile</h2>
        <dl className="grid gap-4 sm:grid-cols-2">
          <Info label="Industry" value={client.industry} /><Info label="Services" value={client.services.join(', ')} />
          <Info label="Business goals" value={client.goals} /><Info label="Target audience" value={client.audience} />
          <Info label="Brand tone" value={client.tone} /><Info label="Notes" value={client.notes} />
        </dl>
      </section>
      <section aria-labelledby="chk" className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-2 flex items-center justify-between"><h2 id="chk" className="font-semibold">Onboarding checklist</h2><span className="text-sm text-slate-500">{pct}% complete</span></div>
        <ProgressBar percent={pct} />
        <p className="mt-2 text-xs text-slate-500">Track account access as a status only. Never store passwords here.</p>
        {tasks.length === 0 ? <p className="mt-4 text-sm text-slate-500">No tasks yet. Add one below.</p> : (
          <ul className="mt-3 divide-y">
            {tasks.map((t) => (
              <li key={t.id} className="flex items-center gap-3 py-2">
                {editId === t.id ? (
                  <form onSubmit={saveEdit} className="flex flex-1 gap-2">
                    <input aria-label="Task title" className={inputCls} value={editTitle} onChange={(e) => setEditTitle(e.target.value)} autoFocus />
                    <button type="submit" aria-label="Save task" className={btnPrimary}><Check size={14} /></button>
                    <button type="button" aria-label="Cancel edit" className={btnGhost} onClick={() => setEditId(null)}><X size={14} /></button>
                  </form>
                ) : (<>
                  <input type="checkbox" id={`t-${t.id}`} className="h-4 w-4 accent-violet-600" checked={t.done} onChange={() => dispatch({ type: 'saveTask', task: { ...t, done: !t.done } })} />
                  <label htmlFor={`t-${t.id}`} className={`flex-1 text-sm ${t.done ? 'text-slate-400 line-through' : ''}`}>{t.title}</label>
                  <button aria-label={`Edit task: ${t.title}`} className="rounded p-1.5 text-slate-500 hover:bg-slate-100" onClick={() => { setEditId(t.id); setEditTitle(t.title); }}><Pencil size={14} /></button>
                  <button aria-label={`Delete task: ${t.title}`} className="rounded p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600" onClick={() => dispatch({ type: 'deleteTask', id: t.id })}><Trash2 size={14} /></button>
                </>)}
              </li>
            ))}
          </ul>
        )}
        <form onSubmit={addTask} className="mt-3 flex gap-2" noValidate>
          <input aria-label="New task title" placeholder="Add a task" className={inputCls} value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
          <button type="submit" className={btnPrimary}><Plus size={16} />Add</button>
        </form>
        {taskError && <p role="alert" className="mt-1 text-xs text-red-600">{taskError}</p>}
      </section>
      <section aria-labelledby="cnt" className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 id="cnt" className="mb-3 font-semibold">Content</h2>
        {content.length === 0 ? <p className="text-sm text-slate-500">No content planned for this client yet.</p> : (
          <ul className="divide-y">
            {content.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                <div><p className="font-medium">{c.title}</p><p className="text-xs text-slate-500">{c.platform} · {c.format} · {formatDate(c.date)}{isOverdue(c.date, c.status) && <span className="ml-2 font-medium text-red-600">Overdue</span>}</p></div><Badge label={c.status} />
              </li>
            ))}
          </ul>
        )}
      </section>
      {editing && <ClientModal client={client} onClose={() => setEditing(false)} />}
      {deleting && (
        <ConfirmDialog title={`Delete ${client.businessName}?`} confirmLabel="Delete client" onClose={() => setDeleting(false)} onConfirm={() => { dispatch({ type: 'deleteClient', id }); go('/clients'); }}>
          This permanently deletes the client <strong>and their {tasks.length} onboarding task(s) and {content.length} content item(s)</strong>. This cannot be undone.
        </ConfirmDialog>
      )}
    </div>
  );
}
