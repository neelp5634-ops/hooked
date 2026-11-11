import { StoreProvider, useStore } from './store';
import { useRoute } from './router';
import { downloadFile } from './lib/backup';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Content from './pages/Content';
import DataPage from './pages/DataPage';
import ClientDetail from './pages/ClientDetail';
import { btnDanger, btnGhost } from './components/ui';

function Recovery() {
  const { corrupt, resolveCorrupt } = useStore();
  if (!corrupt) return null;
  return (
    <div className="mx-auto mt-16 max-w-lg rounded-xl border border-red-200 bg-white p-6 shadow">
      <h1 className="text-xl font-bold">Saved data could not be read</h1>
      <p className="mt-2 text-sm text-slate-600">Nothing has been changed or deleted. Download a copy first, then choose how to continue.</p>
      <ul className="mt-3 list-disc pl-5 text-xs text-red-700">{corrupt.errors.slice(0, 5).map((e) => <li key={e}>{e}</li>)}</ul>
      <div className="mt-5 flex flex-wrap gap-2">
        <button className={btnGhost} onClick={() => downloadFile('hookd-flow-unreadable-data.txt', corrupt.raw, 'text/plain')}>Download raw data</button>
        <button className={btnGhost} onClick={() => window.location.reload()}>Try again</button>
        <button className={btnDanger} onClick={resolveCorrupt}>Start fresh (a copy is kept in this browser)</button>
      </div>
    </div>
  );
}

function Routes() {
  const route = useRoute();
  const { corrupt } = useStore();
  if (corrupt) return <Recovery />;
  const m = /^\/clients\/(.+)$/.exec(route);
  return (
    <Layout route={route}>
      {m ? <ClientDetail id={decodeURIComponent(m[1])} /> : route.startsWith('/clients') ? <Clients /> : route === '/content' ? <Content /> : route === '/data' ? <DataPage /> : <Dashboard />}
    </Layout>
  );
}

export default function App() { return <StoreProvider><Routes /></StoreProvider>; }
