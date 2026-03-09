# Kanban Board — Trello Clone

A fully-featured, open-source Kanban board built with React 19 and Vite. No backend, no accounts — everything lives in your browser's localStorage. Drag cards between lists, write rich descriptions, manage checklists, import from real Trello boards, and save useful links in a built-in link manager.

---

## Features

### Boards, Lists & Cards
- Create and manage multiple boards
- Add and reorder lists (columns) within each board
- Add cards to lists with full detail editing
- Drag and drop cards between lists, reorder lists, and reorder boards — all with a visual drop indicator
- Inline title editing on boards, lists, and cards — click to edit, Enter or click away to save

### Card Detail
- **Rich text descriptions** via a WYSIWYG editor (Tiptap) — bold, italic, strikethrough, headings (H1–H6), bullet/numbered lists, and hyperlinks
- **Color labels** — 6 colors (red, orange, yellow, green, blue, purple) toggleable per card
- **Checklists** — add, edit, check off, and delete items; progress bar shows completion percentage
- **Export a card** as JSON or Markdown for use outside the app

### Import / Export
- **Export all data** — downloads the full app state as a JSON backup file
- **Import app backup** — load a previously exported JSON file; boards are merged (not overwritten)
- **Import from Trello** — paste in a native Trello board JSON export and it converts automatically: lists, cards, checklists, labels, and card descriptions all come through
- **Auto-backup to folder** (Chrome/Edge only) — click "Set backup folder" on the dashboard to pick a local folder; the app then silently writes `trello-backup.json` to that folder on every change. Folder permission is remembered across sessions via IndexedDB. To restore, use Import and select the file from your backup folder.

### Link Manager
- Slide-out drawer (🔗 button) to save, search, and filter bookmarks
- Add links with a name, URL, and comma-separated tags
- Filter by tag or search by name

### Data & Privacy
- All data is stored **only in your browser's localStorage** — nothing is sent anywhere
- Two localStorage keys: `trello-clone-data` (boards) and `trello-clone-links` (links)
- The auto-backup folder handle is stored in **IndexedDB** (browser-local, never leaves your machine)

---

## Getting Started

**Requirements:** Node.js 18+

```bash
# 1. Clone the repo
git clone https://github.com/Humberto-Zayas/trello-clone.git
cd trello-clone

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

The app runs at **http://localhost:5170** (strict port — will fail if the port is taken).

### Other Commands

```bash
npm run build    # Production build → dist/
npm run preview  # Preview the production build locally
npm run lint     # Run ESLint
```

---

## Tech Stack

| Purpose | Library |
|---|---|
| UI Framework | React 19 |
| Build Tool | Vite 7 |
| Rich Text Editor | Tiptap 3 (StarterKit + Link extension) |
| HTML Sanitization | DOMPurify |
| ID Generation | uuid v13 |
| Styling | Plain CSS (no framework) |

---

## Project Structure

```
src/
├── main.jsx                  # App entry point
├── App.jsx                   # Root — handles board navigation (no router)
├── App.css                   # All styles
├── context/
│   ├── BoardContext.jsx      # Board state (useReducer) + localStorage persistence
│   └── LinksContext.jsx      # Links state (useReducer) + localStorage persistence
├── hooks/
│   └── useBackup.js          # File System Access API auto-backup (IndexedDB handle persistence)
└── components/
    ├── BoardList.jsx         # Dashboard: grid of boards with drag/drop + import/export
    ├── BoardView.jsx         # Single board: lists, drag/drop orchestration
    ├── List.jsx              # Column component
    ├── Card.jsx              # Draggable card preview (labels, checklist badge)
    ├── CardModal.jsx         # Full card detail overlay
    ├── RichTextEditor.jsx    # Tiptap editor wrapper
    ├── EditorToolbar.jsx     # Formatting toolbar
    ├── RichTextDisplay.jsx   # Sanitized HTML renderer
    ├── LinksDrawer.jsx       # Slide-out link manager panel
    ├── LinkForm.jsx          # Add/edit link form
    └── LinkItem.jsx          # Individual link row
```

---

## Data Model

```
State
├── boards[]
│   ├── id          (UUID)
│   ├── title       (string)
│   ├── createdAt   (ISO string)
│   └── lists[]
│       ├── id      (UUID)
│       ├── title   (string)
│       └── cards[]
│           ├── id          (UUID)
│           ├── title       (string)
│           ├── description (HTML string)
│           ├── createdAt   (ISO string)
│           ├── labels[]    ("red" | "orange" | "yellow" | "green" | "blue" | "purple")
│           └── checklist[]
│               ├── id        (UUID)
│               ├── text      (string)
│               └── completed (boolean)
└── currentBoard (UUID | null)
```

---

## Importing from Trello

1. In Trello, open your board → **Share** → **Export as JSON** → download the file
2. In this app, click **Import** on the board dashboard
3. Select the downloaded Trello JSON file — it will be detected and converted automatically

The converter maps:
- Trello lists → lists (open only, sorted by position)
- Trello cards → cards (open only, sorted by position)
- Trello checklists and check items → card checklists
- Trello label colors → card labels
- Card descriptions are preserved as-is

Imported boards are **merged** into your existing data — nothing is overwritten.

---

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `Enter` | Submit new card / list / board |
| `Shift + Enter` | New line when adding a card |
| `Escape` | Cancel editing or close modal |

---

## Gotchas & Limitations

### Your data lives only in localStorage
This app has no backend, database, or account system. All board and link data is stored in your browser's localStorage — which means:

- **Clearing your browser data will permanently delete everything.** This includes using "Clear site data", clearing cookies/cache, or any browser privacy tools that wipe storage.
- **Data does not sync between browsers or devices.** What you create in Chrome won't appear in Firefox, and vice versa.
- **Data does not survive a fresh browser profile or incognito session.** Incognito/private windows start with empty storage every time.
- **Reinstalling your OS or browser can wipe localStorage.** Always export a backup before doing anything that might affect browser data.

> **Tip:** Use **Set backup folder** (Chrome/Edge) to automatically save `trello-backup.json` to a local folder on every change — no manual steps needed. On other browsers, use the **Export** button regularly and keep the file somewhere safe. You can re-import it at any time to restore your boards.

### No media attachments
Cards support rich text descriptions (bold, italic, headings, lists, links) but do **not** support:
- Image uploads or embeds
- Video or audio attachments
- File attachments of any kind

If you need to reference an image or file, link to it via URL in the description or save the link in the Link Manager.

### Trello import limitations
When importing a Trello JSON export:
- **Attachments are not imported** — Trello card attachments (images, files) are not carried over
- **Comments are not imported** — Trello card comments have no equivalent in this app
- **Due dates are not imported** — this app does not have a due date field
- **Member assignments are not imported**
- **Archived cards and lists are skipped** — only open (active) content is imported
- **Custom fields are not imported**

### localStorage size limit
Browsers typically cap localStorage at ~5MB per origin. If you have a very large number of boards and cards with long descriptions, you may eventually hit this limit. The app does not currently warn you when you are approaching it. Export backups regularly if you store a lot of data.

### No real-time collaboration
There is no multi-user support. If two people open the app in different browser tabs they each have their own independent copy of the data — changes in one tab are not reflected in another (unless the page is refreshed).

### Deletes are immediate and permanent
Deleting a board, list, or card happens instantly with no undo. There is no recycle bin, no undo stack, and no revision history. If you delete something by accident, the only recovery path is restoring from an exported backup.

### No drag and drop on mobile / touch screens
Drag and drop is implemented using the native HTML5 drag API, which does not fire touch events. Cards, lists, and boards cannot be reordered on phones or tablets. The rest of the app (creating, editing, checking off items) works fine on mobile, but dragging is a desktop-only feature.

### Two tabs = two out-of-sync copies
If you open the app in two browser tabs at the same time, they will not stay in sync. Each tab holds its own React state in memory. Changes you make in one tab are written to localStorage, but the other tab won't pick them up until it reloads. Working in two tabs simultaneously risks one tab overwriting the other's changes.

### Labels are fixed — no custom colors or names
There are exactly 6 label colors (red, orange, yellow, green, blue, purple). You cannot add custom colors, rename labels, or create more than 6. Label names displayed in exports will always be the raw color strings.

### The dev port is strict
The Vite dev server is configured with `strictPort: true` on port **5170**. If that port is already in use, `npm run dev` will exit with an error instead of trying another port. Change the port in `vite.config.js` if needed.

### No schema versioning
There is no migration system. If the data model changes in a future version of the app, data stored in localStorage from an older version may be silently ignored or cause unexpected behavior. Export a backup before pulling major updates.

### Every state change rewrites all of localStorage
On every action (adding a card, checking a checklist item, etc.) the entire app state is serialized and written to localStorage synchronously. This is fine for typical usage, but on very large datasets it could cause minor jank since it blocks the main thread briefly.

---

## Using Your Own Backend

This project is intentionally designed as a **local-first starter**. There is no server, no auth, and no database — which makes it a clean foundation to wire up whatever persistence layer you want.

All data flow goes through two files:

- **`src/context/BoardContext.jsx`** — boards, lists, and cards
- **`src/context/LinksContext.jsx`** — saved links

Both follow the same pattern: `loadFromStorage()` hydrates state on mount, and `saveToStorage()` is called after every reducer action. To swap in a real backend, replace those two functions with API calls and you're done — the reducer, components, and data model stay exactly the same.

### Ideas for persistence backends

| Backend | Good for |
|---|---|
| [Supabase](https://supabase.com) | Postgres + realtime + auth in one hosted service |
| [Firebase Firestore](https://firebase.google.com) | NoSQL, realtime sync, easy auth |
| [PocketBase](https://pocketbase.io) | Self-hosted, single binary, SQLite under the hood |
| [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) | Browser-only but much larger storage than localStorage |
| [Electron](https://www.electronjs.org) | Wrap the app as a desktop app with real filesystem/SQLite access |

### What you'd change

```js
// BoardContext.jsx — current localStorage version
function loadFromStorage() {
  const data = localStorage.getItem('trello-clone-data');
  return data ? JSON.parse(data) : initialState;
}

function saveToStorage(state) {
  localStorage.setItem('trello-clone-data', JSON.stringify(state));
}

// Replace with async API calls, e.g. Supabase:
async function loadFromStorage() {
  const { data } = await supabase.from('boards').select('*');
  return { boards: data, currentBoard: null };
}

async function saveToStorage(state) {
  await supabase.from('boards').upsert(state.boards);
}
```

The reducer is pure and has no side effects — it's completely decoupled from persistence, so you can layer in optimistic updates, loading states, or error handling without touching the reducer logic.

---

## Contributing

Contributions are welcome! Here's how to get involved:

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes and commit: `git commit -m "Add your feature"`
4. Push and open a Pull Request

Please keep PRs focused — one feature or fix per PR. For larger changes, open an issue first to discuss the approach.

---

## License

MIT — see [LICENSE](LICENSE) for details.
