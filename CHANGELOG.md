# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

---

## [1.4.0] - 2026-03-09

### Added
- **Auto-backup to local folder** — click "Set backup folder" on the board dashboard to pick a folder on your computer. The app silently writes `trello-backup.json` to that folder on every state change. No manual steps required after initial setup.
- Folder permission is persisted in IndexedDB so it survives page refreshes and browser restarts (Chrome/Edge only — uses the File System Access API).
- To restore from a backup, use the existing Import button and select `trello-backup.json` from your backup folder.

---

## [1.3.0] - 2026-03-08

### Added
- GitHub issue and pull request templates (bug report, feature request, PR)

### Fixed
- Blocked `javascript:` protocol in the rich text link editor and link manager to prevent XSS

### Improved
- Trello import now handles a wider range of Trello board export formats

---

## [1.2.0] - 2026-01-30

### Added
- **Link manager** — slide-out drawer (🔗 button) to save, search, and filter bookmarks by name and tag

---

## [1.1.0] - 2026-01-20

### Added
- **Export card as JSON or Markdown** — export individual card data from the card detail modal for use outside the app
- **WYSIWYG rich text editor** for card descriptions (Tiptap) — bold, italic, strikethrough, headings H1–H6, bullet/numbered lists, hyperlinks
- Draggable lists — reorder columns within a board via drag and drop
- Click-away to save when editing card and list titles
- Keyboard shortcuts: `Enter` to submit, `Shift+Enter` for newline in card input, `Escape` to cancel/close

### Fixed
- Checklist stale data issue when switching between cards

---

## [1.0.0] - 2026-01-08

### Added
- Initial release
- Create and manage multiple boards, lists, and cards
- Drag and drop cards between lists and reorder boards
- Color labels (6 colors) per card
- Checklists with progress bar
- Import from Trello board JSON export
- Export/import full app state as JSON
- localStorage persistence with JSON validation on load
