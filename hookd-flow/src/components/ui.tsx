import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

export const inputCls = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm transition focus:border-brand-500 disabled:opacity-60';
export const btnPrimary = 'inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700';
export const btnGhost = 'inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100';
export const btnDanger = 'inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700';

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.querySelector<HTMLElement>('input,textarea,select')?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeRef.current(); };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); prev?.focus(); };
  }, []);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 sm:items-center sm:p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div ref={ref} role="dialog" aria-modal="true" aria-label={title} className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} aria-label="Close dialog" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function ConfirmDialog({ title, confirmLabel, onConfirm, onClose, children }: { title: string; confirmLabel: string; onConfirm: () => void; onClose: () => void; children: ReactNode }) {
  return (
    <Modal title={title} onClose={onClose}>
      <div className="text-sm text-slate-600">{children}</div>
      <div className="mt-5 flex justify-end gap-2">
        <button className={btnGhost} onClick={onClose}>Cancel</button>
        <button className={btnDanger} onClick={onConfirm}>{confirmLabel}</button>
      </div>
    </Modal>
  );
}

export function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      {children}
      {error && <span role="alert" className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}

const badgeColors: Record<string, string> = { Onboarding: 'bg-amber-100 text-amber-800', Active: 'bg-emerald-100 text-emerald-800', Paused: 'bg-slate-200 text-slate-700', Idea: 'bg-slate-100 text-slate-700', Draft: 'bg-sky-100 text-sky-800', 'In Review': 'bg-amber-100 text-amber-800', Approved: 'bg-emerald-100 text-emerald-800', Published: 'bg-brand-100 text-brand-700' };
export const Badge = ({ label }: { label: string }) => <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeColors[label] ?? 'bg-slate-100'}`}>{label}</span>;
export const SampleTag = () => <span className="ml-2 rounded bg-violet-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-600">Sample</span>;

export function ProgressBar({ percent }: { percent: number }) {
  return (
    <div role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label="Onboarding progress" className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
      <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${percent}%` }} />
    </div>
  );
}

export const EmptyState = ({ title, text, children }: { title: string; text: string; children?: ReactNode }) => (
  <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
    <p className="font-medium">{title}</p><p className="mt-1 text-sm text-slate-500">{text}</p>{children && <div className="mt-4">{children}</div>}
  </div>
);
