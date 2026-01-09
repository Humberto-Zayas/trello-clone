# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start Vite dev server on port 5173 (strictPort enabled)
npm run build    # Production build to dist/
npm run lint     # ESLint check
npm run preview  # Preview production build
```

## Architecture

This is a React + Vite Trello clone using Context + useReducer for state management (no Redux). All data persists to localStorage under key `'trello-clone-data'`.

### Data Model

```
State
├── boards[]
│   ├── id, title, createdAt
│   └── lists[]
│       ├── id, title
│       └── cards[]
│           ├── id, title, description, createdAt
│           ├── labels[] (color strings)
│           └── checklist[] (id, text, completed)
└── currentBoard (UUID | null)
```

### Component Hierarchy

```
App (manages currentBoardId locally)
├── BoardList (grid of boards, export/import)
└── BoardView (single board)
    ├── List[] (vertical card containers)
    │   └── Card[] (draggable items)
    └── CardModal (detail overlay for selected card)
```

### State Management

- **Context Provider:** `src/context/BoardContext.jsx` - exports `BoardProvider`, `useBoard`
- **Actions:** 18 reducer actions (ADD_BOARD, ADD_LIST, ADD_CARD, MOVE_CARD, UPDATE_CARD, TOGGLE_LABEL, etc.)
- **Persistence:** Auto-saves to localStorage after every dispatch
- **Import/Export:** `exportData()` downloads JSON, `importData(file)` loads from file

### Key Patterns

- **Navigation:** App-level `currentBoardId` state toggles between BoardList and BoardView (no router)
- **Drag & Drop:** HTML5 drag API managed in BoardView, MOVE_CARD handles reordering
- **Inline Editing:** Titles toggle between span and input on click
- **Labels:** Six colors defined as LABEL_COLORS in Card.jsx and CardModal.jsx
- **Immutable Updates:** Reducer uses nested spread operators for all mutations
