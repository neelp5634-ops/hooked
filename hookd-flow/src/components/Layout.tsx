import { useState, type ReactNode } from 'react';
import { CalendarDays, HardDrive, LayoutDashboard, Users, Menu, X, Database, Sparkles } from 'lucide-react';
import { useStore } from '../store';
import { go } from '../router';

const NAV = [{ to: '/', label: 'Dashboard', icon: LayoutDashboard }, { to: '/clients', label: 'Clients', icon: Users }, { to: '/content', label: 'Content', icon: CalendarDays }, { to: '/data', label: 'Data & backups', icon: HardDrive }];

export default function Layout({ route, children }: { route: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { data, saveError } = useStore();
  const hasSample = data.clients.some((c) => c.isSample) || data.content.some((c) => c.isSample);
  const active = (to: string) => (to === '/' ? route === '/' : route.startsWith(to));

  const nav = (
    <nav aria-label="Main" className="flex-1 space-y-1 px-3">
      {NAV.map(({ to, label, icon: Icon }) => (
        <a key={to} href={`#${to}`} onClick={() => setOpen(false)} aria-current={active(to) ? 'page' : undefined}
          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${active(to) ? 'bg-brand-600 text-white' : 'text-slate-300 hover:bg-white/10'}`}>
          <Icon size={18} />{label}
        </a>
      ))}
    </nav>
  );
  const side = (
    <div className="flex h-full flex-col bg-navy-900 py-5 text-white">
      <div className="mb-6 flex items-center gap-2 px-6 text-lg font-bold"><Sparkles className="text-brand-500" size={20} />HOOKD Flow</div>
      {nav}
      <p className="mx-4 mt-4 flex gap-2 rounded-lg bg-white/5 p-3 text-xs text-slate-300"><Database size={14} className="mt-0.5 shrink-0" />Saved only in this browser. It does not sync across devices.</p>
    </div>
  );

  return (
    <div className="min-h-screen md:pl-64">
      <aside className="fixed inset-y-0 left-0 hidden w-64 md:block">{side}</aside>
      <header className="sticky top-0 z-30 flex items-center justify-between bg-navy-900 px-4 py-3 text-white md:hidden">
        <button onClick={() => go('/')} className="font-bold">HOOKD Flow</button>
        <button onClick={() => setOpen(true)} aria-label="Open menu" aria-expanded={open} className="rounded-lg p-2 hover:bg-white/10"><Menu /></button>
      </header>
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-64"><button onClick={() => setOpen(false)} aria-label="Close menu" className="absolute right-2 top-3 z-10 rounded-lg p-2 text-white hover:bg-white/10"><X size={18} /></button>{side}</div>
        </div>
      )}
      <main className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
        {hasSample && <p className="mb-4 rounded-lg bg-violet-50 px-4 py-2 text-sm text-violet-800">You are viewing fictional <strong>sample data</strong>. Delete it or clear all data when you are ready to start.</p>}
        {saveError && <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">Your browser blocked saving. Changes will be lost when you close this tab.</p>}
        {children}
      </main>
    </div>
  );
}
