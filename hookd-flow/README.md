# HOOKD Flow

Open-source client onboarding and content planning for small marketing agencies and freelancers. Runs entirely in your browser: no backend, accounts or API keys.

## The problem
Small agencies often track onboarding steps and content calendars across chats, notes and spreadsheets. HOOKD Flow keeps clients, onboarding checklists and a content plan in one simple local app. It is intended for solo marketers, freelancers and small agencies.

## Features
- Dashboard with metrics calculated from saved data, upcoming content, pending tasks and quick actions
- Client create, view, edit, search, status filter and delete (with a warning that tasks and content are deleted too)
- Onboarding checklist: five default tasks per new client, plus add, edit, complete and delete; progress is completed tasks divided by total (0% when empty)
- Content planner with table and board views, status dropdowns, filters (client, platform, status, date range) and overdue indicators
- Template-based brief helper (see below)
- Fictional sample data on first launch, clearly labelled
- CSV export (clients and content), versioned JSON backup and restore with validation, and clear-all-data with confirmation

## Tech stack
React 18, TypeScript, Vite, Tailwind CSS, Lucide icons, browser localStorage.

## Prerequisites
[Node.js](https://nodejs.org) 18 or newer (includes npm) and Git.

## Install, run, build
```bash
git clone https://github.com/<your-username>/hookd-flow.git
cd hookd-flow
npm install
npm run dev        # opens a local dev server (usually http://localhost:5173)
npm run build      # type-check and production build into dist/
npm run preview    # serve the production build locally
```

## How to use
1. Open **Clients** and choose **New client**. Default onboarding tasks are created automatically.
2. Open a client to tick off, add, edit or delete tasks and watch progress update.
3. Open **Content** to plan posts, change status from the dropdowns, and switch between table and board.
4. Use **Data & backups** to export or restore data.

## Browser storage and privacy
Data is saved only in the current browser's localStorage. It does not sync across devices, and clearing site data or using private browsing can erase it. Nothing is sent to any server. Do not store passwords or credentials in this app: account access is tracked only as a checklist status. If saved data is unreadable, the app does not overwrite it; it offers a raw download first.

## Backups
**Export:** Data & backups -> *JSON backup* downloads a versioned file. **Restore:** Data & backups -> *Choose backup file*. The file is validated (fields, dates, and links between clients, tasks and content) and you must confirm before it replaces saved data. Invalid files are rejected and existing data stays unchanged.

## Brief helper uses templates, not AI
The "Template-based brief helper" fills local text templates using the client's industry, audience, goals and your chosen content pillar. It does not use AI or any network call. Its logic lives in `src/lib/brief.ts` so a real AI integration can replace it later.

## Roadmap (not implemented)
- Authentication
- Shared database storage
- AI-assisted briefs
- n8n integrations

## License
MIT. See [LICENSE](LICENSE). Replace the copyright placeholder with your name before publishing.
