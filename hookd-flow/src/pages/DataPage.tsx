import { useRef, useState, type ChangeEvent } from 'react';
import { Download, Trash2, Upload } from 'lucide-react';
import { useStore } from '../store';
import { EMPTY_DATA, type AppData } from '../types';
import { createBackupJSON, downloadFile, parseBackup } from '../lib/backup';
import { clientsCSV, contentCSV } from '../lib/csv';
import { todayISO } from '../lib/dates';
import { ConfirmDialog, btnDanger, btnGhost } from '../components/ui';

export default function DataPage() {
  const { data, dispatch } = useStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<AppData | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [msg, setMsg] = useState('');
  const [clearing, setClearing] = useState(false);
  const d = todayISO();

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setMsg(''); setErrors([]);
    const r = parseBackup(await file.text());
    if (r.ok) setPending(r.data); else setErrors(r.errors);
  };
  const Card = ({ title, children }: { title: string; children: React.ReactNode }) => <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="mb-2 font-semibold">{title}</h2>{children}</section>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Data &amp; backups</h1>
      <p className="rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-800">Your data is saved only in this browser and does not sync across devices. Clearing browser data will erase it, so export a backup regularly.</p>
      <Card title="Export">
        <div className="flex flex-wrap gap-2">
          <button className={btnGhost} onClick={() => downloadFile(`hookd-clients-${d}.csv`, clientsCSV(data), 'text/csv')}><Download size={14} />Clients CSV</button>
          <button className={btnGhost} onClick={() => downloadFile(`hookd-content-${d}.csv`, contentCSV(data), 'text/csv')}><Download size={14} />Content CSV</button>
          <button className={btnGhost} onClick={() => downloadFile(`hookd-flow-backup-${d}.json`, createBackupJSON(data), 'application/json')}><Download size={14} />JSON backup</button>
        </div>
      </Card>
      <Card title="Restore from JSON backup">
        <input ref={fileRef} type="file" accept="application/json,.json" className="sr-only" onChange={onFile} aria-label="Choose backup file" tabIndex={-1} />
        <button className={btnGhost} onClick={() => fileRef.current?.click()}><Upload size={14} />Choose backup file</button>
        {msg && <p role="status" className="mt-2 text-sm text-emerald-700">{msg}</p>}
        {errors.length > 0 && <div role="alert" className="mt-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><p className="font-medium">This backup was rejected. Your existing data is unchanged.</p><ul className="list-disc pl-5">{errors.map((e) => <li key={e}>{e}</li>)}</ul></div>}
      </Card>
      <Card title="Clear all data"><p className="mb-2 text-sm text-slate-600">Deletes every client, task and content item, including sample data. Sample data will not come back.</p><button className={btnDanger} onClick={() => setClearing(true)}><Trash2 size={14} />Clear all data</button></Card>
      {pending && <ConfirmDialog title="Replace saved data?" confirmLabel="Replace with backup" onClose={() => setPending(null)} onConfirm={() => { dispatch({ type: 'replace', data: pending }); setMsg(`Restored ${pending.clients.length} clients, ${pending.tasks.length} tasks and ${pending.content.length} content items.`); setPending(null); }}>This backup contains {pending.clients.length} clients, {pending.tasks.length} tasks and {pending.content.length} content items. It will <strong>replace</strong> everything currently saved.</ConfirmDialog>}
      {clearing && <ConfirmDialog title="Clear all data?" confirmLabel="Clear everything" onClose={() => setClearing(false)} onConfirm={() => { dispatch({ type: 'replace', data: EMPTY_DATA }); setClearing(false); setMsg('All data cleared.'); }}>This permanently deletes all clients, tasks and content in this browser. Export a backup first if you might need it.</ConfirmDialog>}
    </div>
  );
}
