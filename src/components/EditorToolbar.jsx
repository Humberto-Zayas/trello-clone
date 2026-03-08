import { useState } from 'react';

export default function EditorToolbar({ editor }) {
  const [showHeadingMenu, setShowHeadingMenu] = useState(false);

  if (!editor) return null;

  const handleLinkClick = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL:', previousUrl || 'https://');

    if (url === null) return; // Cancelled

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      try {
        const parsed = new URL(url);
        if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
          alert('Only http:// and https:// links are allowed.');
          return;
        }
      } catch {
        alert('Please enter a valid URL (e.g., https://example.com)');
        return;
      }
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  };

  const headingLevels = [1, 2, 3, 4, 5, 6];
  const currentHeading = headingLevels.find(level =>
    editor.isActive('heading', { level })
  );

  return (
    <div className="editor-toolbar">
      <div className="toolbar-group">
        <div className="heading-dropdown">
          <button
            type="button"
            className="toolbar-btn heading-trigger"
            onClick={() => setShowHeadingMenu(!showHeadingMenu)}
          >
            {currentHeading ? `H${currentHeading}` : 'Normal'}
            <span className="dropdown-arrow">▾</span>
          </button>
          {showHeadingMenu && (
            <div className="heading-menu">
              <button
                type="button"
                className={`heading-option ${!currentHeading ? 'active' : ''}`}
                onClick={() => {
                  editor.chain().focus().setParagraph().run();
                  setShowHeadingMenu(false);
                }}
              >
                Normal
              </button>
              {headingLevels.map(level => (
                <button
                  key={level}
                  type="button"
                  className={`heading-option ${editor.isActive('heading', { level }) ? 'active' : ''}`}
                  onClick={() => {
                    editor.chain().focus().toggleHeading({ level }).run();
                    setShowHeadingMenu(false);
                  }}
                >
                  Heading {level}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-group">
        <button
          type="button"
          className={`toolbar-btn ${editor.isActive('bold') ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold (Ctrl+B)"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          className={`toolbar-btn ${editor.isActive('italic') ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic (Ctrl+I)"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          className={`toolbar-btn ${editor.isActive('strike') ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          title="Strikethrough"
        >
          <s>S</s>
        </button>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-group">
        <button
          type="button"
          className={`toolbar-btn ${editor.isActive('bulletList') ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Bullet List"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M4 6h2v2H4V6zm4 0h12v2H8V6zM4 11h2v2H4v-2zm4 0h12v2H8v-2zm-4 5h2v2H4v-2zm4 0h12v2H8v-2z"/>
          </svg>
        </button>
        <button
          type="button"
          className={`toolbar-btn ${editor.isActive('orderedList') ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Numbered List"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M3 5v1h1V4H3v1zm2 1h14V4H5v2zm-2 4v1h1V8H3v1h1V8H3v1zm2 1h14V8H5v2zm-1 3v1h2v1H4v1h3v-4H5v1h1zm1 3h14v-2H5v2z"/>
          </svg>
        </button>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-group">
        <button
          type="button"
          className={`toolbar-btn ${editor.isActive('link') ? 'active' : ''}`}
          onClick={handleLinkClick}
          title="Add Link"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
