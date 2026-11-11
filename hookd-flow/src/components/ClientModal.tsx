import { useState, type FormEvent } from 'react';
import { SERVICES, CLIENT_STATUSES, type Client, type ClientStatus } from '../types';
import { useStore } from '../store';
import { newId } from '../lib/id';
import { createDefaultTasks } from '../lib/tasks';
import { EMAIL_RE } from '../lib/validate';
import { go } from '../router';
import { Field, Modal, btnGhost, btnPrimary, inputCls } from './ui';

export default function ClientModal({ client, onClose }: { client?: Client; onClose: () => void }) {
  const { dispatch } = useStore();
  const [f, setF] = useState({
    businessName: client?.businessName ?? '', contactName: client?.contactName ?? '', email: client?.email ?? '', industry: client?.industry ?? '',
    services: client?.services ?? [], goals: client?.goals ?? '', audience: client?.audience ?? '', tone: client?.tone ?? '', notes: client?.notes ?? '',
    status: (client?.status ?? 'Onboarding') as ClientStatus
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }));
  const text = (k: 'businessName' | 'contactName' | 'email' | 'industry' | 'tone') => ({ value: f[k], onChange: (e: { target: { value: string } }) => set(k, e.target.value), className: inputCls });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!f.businessName.trim()) err.businessName = 'Business name is required.';
    if (!f.contactName.trim()) err.contactName = 'Contact name is required.';
    if (!f.email.trim()) err.email = 'Email is required.';
    else if (!EMAIL_RE.test(f.email.trim())) err.email = 'Enter a valid email address, like name@example.com.';
    setErrors(err);
    if (Object.keys(err).length) return;
    const clean = { ...f, businessName: f.businessName.trim(), contactName: f.contactName.trim(), email: f.email.trim() };
    if (client) { dispatch({ type: 'saveClient', client: { ...client, ...clean } }); onClose(); return; }
    const id = newId();
    dispatch({ type: 'saveClient', client: { id, ...clean, createdAt: new Date().toISOString() }, newTasks: createDefaultTasks(id) });
    onClose();
    go(`/clients/${id}`);
  };

  return (
    <Modal title={client ? 'Edit client' : 'New client'} onClose={onClose}>
      <form onSubmit={submit} noValidate className="space-y-3">
        <Field label="Business name *" error={errors.businessName}><input {...text('businessName')} required /></Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Contact name *" error={errors.contactName}><input {...text('contactName')} required /></Field>
          <Field label="Email *" error={errors.email}><input {...text('email')} type="email" required /></Field>
          <Field label="Industry"><input {...text('industry')} /></Field>
          <Field label="Status">
            <select className={inputCls} value={f.status} onChange={(e) => set('status', e.target.value as ClientStatus)}>{CLIENT_STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
          </Field>
        </div>
        <fieldset>
          <legend className="mb-1 text-sm font-medium text-slate-700">Selected services</legend>
          <div className="grid gap-1 sm:grid-cols-2">
            {SERVICES.map((s) => (
              <label key={s} className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="h-4 w-4 accent-violet-600" checked={f.services.includes(s)} onChange={(e) => set('services', e.target.checked ? [...f.services, s] : f.services.filter((x) => x !== s))} />{s}
              </label>
            ))}
          </div>
        </fieldset>
        <Field label="Business goals"><textarea rows={2} className={inputCls} value={f.goals} onChange={(e) => set('goals', e.target.value)} /></Field>
        <Field label="Target audience"><textarea rows={2} className={inputCls} value={f.audience} onChange={(e) => set('audience', e.target.value)} /></Field>
        <Field label="Brand tone"><input {...text('tone')} /></Field>
        <Field label="Notes"><textarea rows={2} className={inputCls} value={f.notes} onChange={(e) => set('notes', e.target.value)} /></Field>
        <p className="text-xs text-slate-500">Do not store passwords or login credentials anywhere in this app.</p>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className={btnGhost} onClick={onClose}>Cancel</button>
          <button type="submit" className={btnPrimary}>{client ? 'Save changes' : 'Create client'}</button>
        </div>
      </form>
    </Modal>
  );
}
