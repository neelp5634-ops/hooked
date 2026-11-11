import { createContext, useContext, useEffect, useReducer, useState, type Dispatch, type ReactNode } from 'react';
import { EMPTY_DATA, type AppData, type Client, type ContentItem, type Task } from './types';
import { loadState, preserveCorrupt, saveState } from './lib/storage';

export type Action =
  | { type: 'replace'; data: AppData }
  | { type: 'saveClient'; client: Client; newTasks?: Task[] }
  | { type: 'deleteClient'; id: string }
  | { type: 'saveTask'; task: Task }
  | { type: 'deleteTask'; id: string }
  | { type: 'saveContent'; item: ContentItem }
  | { type: 'deleteContent'; id: string };

const upsert = <T extends { id: string }>(list: T[], item: T) => (list.some((x) => x.id === item.id) ? list.map((x) => (x.id === item.id ? item : x)) : [...list, item]);

function reducer(s: AppData, a: Action): AppData {
  switch (a.type) {
    case 'replace': return a.data;
    case 'saveClient': return { ...s, clients: upsert(s.clients, a.client), tasks: a.newTasks ? [...s.tasks, ...a.newTasks] : s.tasks };
    case 'deleteClient': return { clients: s.clients.filter((c) => c.id !== a.id), tasks: s.tasks.filter((t) => t.clientId !== a.id), content: s.content.filter((c) => c.clientId !== a.id) };
    case 'saveTask': return { ...s, tasks: upsert(s.tasks, a.task) };
    case 'deleteTask': return { ...s, tasks: s.tasks.filter((t) => t.id !== a.id) };
    case 'saveContent': return { ...s, content: upsert(s.content, a.item) };
    case 'deleteContent': return { ...s, content: s.content.filter((c) => c.id !== a.id) };
  }
}

interface Ctx { data: AppData; dispatch: Dispatch<Action>; saveError: boolean; corrupt: { raw: string; errors: string[] } | null; resolveCorrupt: () => void }
const StoreContext = createContext<Ctx | null>(null);
export const useStore = () => { const c = useContext(StoreContext); if (!c) throw new Error('useStore outside provider'); return c; };

export function StoreProvider({ children }: { children: ReactNode }) {
  const [init] = useState(loadState);
  const [data, dispatch] = useReducer(reducer, init.status === 'corrupt' ? EMPTY_DATA : init.data);
  const [corrupt, setCorrupt] = useState(init.status === 'corrupt' ? { raw: init.raw, errors: init.errors } : null);
  const [saveError, setSaveError] = useState(init.status === 'unavailable');

  // Never write while unreadable data is waiting for the user's decision.
  useEffect(() => { if (!corrupt) setSaveError(!saveState(data)); }, [data, corrupt]);

  const resolveCorrupt = () => { if (corrupt) preserveCorrupt(corrupt.raw); setCorrupt(null); dispatch({ type: 'replace', data: EMPTY_DATA }); };
  return <StoreContext.Provider value={{ data, dispatch, saveError, corrupt, resolveCorrupt }}>{children}</StoreContext.Provider>;
}
