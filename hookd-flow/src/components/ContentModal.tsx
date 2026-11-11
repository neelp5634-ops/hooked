import { useState, type FormEvent } from 'react';
import { Wand2 } from 'lucide-react';
import { CONTENT_STATUSES, FORMATS, PLATFORMS, type ContentFormat, type ContentItem, type ContentStatus, type Platform } from '../types';
import { useStore } from '../store';
import { newId } from '../lib/id';
import { generateBrief } from '../lib/brief';
import { isValidISO, todayISO } from '../lib/dates';
import { Field, Modal, btnGhost, btnPrimary, inputCls } from './ui';

export default function ContentModal({ item, clientId, onClose }: { item?: ContentItem; clientId?: string; onClose: () => void }) {
  const { data, dispatch } = useStore();
  const [f, setF] = useState({
    title: item?.title ?? '', clientId: item?.clientId ?? clientId ?? '', platform: (item?.platform ?? 'Instagram') as Platform, format: (item?.format ?? 'Reel') as ContentFormat,
    pillar: item?.pillar ?? '', hook: item?.hook ?? '', caption: item?.caption ?? '', date: item?.date ?? todayISO(), status: (item?.status ?? 'Idea') as ContentStatus
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [note, setNote] = useState('');
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }));
  const opts = <T extends string>(list: readonly T[]) => list.map((o) => <option key={o}>{o}</option>);

  const generate = () => {
    const c = data.clients.find((x) => x.id === f.clientId);
    if (!c) { setNote('Choose a client first so the helper can use their industry, audience and goals.'); return; }
    const b = generateBrief({ businessName: c.businessName, industry: c.industry, audience: c.audience, goals: c.goals, pillar: f.pillar });
    setF((p) => ({ ...p, hook: b.hook, caption: `Outline:\n${b.outline.map((o, i) => `${i + 1}. ${o}`).join('\n')}\n\nCall to action: ${b.cta}` }));
    setNote('Draft generated from templates. Edit the hook and brief below as needed.');
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!f.title.trim()) err.title = 'Title is required.';
    if (!f.clientId) err.clientId = 'Choose a client.';
    if (!isValidISO(f.date)) err.date = 'Choose a valid date.';
    setErrors(err);
    if (Object.keys(err).length) return;
    dispatch({ type: 'saveContent', item: { ...(item ?? {}), id: item?.id ?? newId(), ...f, title: f.title.trim() } });
    onClose();
  };

  return (
    <Modal title={item ? 'Edit content' : 'New content'} onClose={onClose}>
      <form onSubmit={submit} noValidate className="space-y-3">
        <Field label="Title *" error={errors.title}><input className={inputCls} value={f.title} onChange={(e) => set('title', e.target.value)} /></Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Client *" error={errors.clientId}>
            <select className={inputCls} value={f.clientId} onChange={(e) => set('clientId', e.target.value)}><option value="">Select a client</option>{data.clients.map((c) => <option key={c.id} value={c.id}>{c.businessName}</option>)}</select>
          </Field>
          <Field label="Scheduled date *" error={errors.date}><input type="date" className={inputCls} value={f.date} onChange={(e) => set('date', e.target.value)} /></Field>
          <Field label="Platform"><select className={inputCls} value={f.platform} onChange={(e) => set('platform', e.target.value as Platform)}>{opts(PLATFORMS)}</select></Field>
          <Field label="Format"><select className={inputCls} value={f.format} onChange={(e) => set('format', e.target.value as ContentFormat)}>{opts(FORMATS)}</select></Field>
          <Field label="Content pillar"><input className={inputCls} placeholder="e.g. Education, Social proof" value={f.pillar} onChange={(e) => set('pillar', e.target.value)} /></Field>
          <Field label="Status"><select className={inputCls} value={f.status} onChange={(e) => set('status', e.target.value as ContentStatus)}>{opts(CONTENT_STATUSES)}</select></Field>
        </div>
        <div className="rounded-lg bg-brand-50 p-3">
          <button type="button" className={btnGhost} onClick={generate}><Wand2 size={14} />Template-based brief helper</button>
          <p className="mt-1 text-xs text-slate-600">Uses simple local templates (not AI) with the client's industry, audience, goals and your pillar. It replaces the hook and brief fields.</p>
          {note && <p role="status" className="mt-1 text-xs font-medium text-brand-700">{note}</p>}
        </div>
        <Field label="Hook"><input className={inputCls} value={f.hook} onChange={(e) => set('hook', e.target.value)} /></Field>
        <Field label="Caption or brief"><textarea rows={5} className={inputCls} value={f.caption} onChange={(e) => set('caption', e.target.value)} /></Field>
        <div className="flex justify-end gap-2 pt-2"><button type="button" className={btnGhost} onClick={onClose}>Cancel</button><button type="submit" className={btnPrimary}>{item ? 'Save changes' : 'Create content'}</button></div>
      </form>
    </Modal>
  );
}
