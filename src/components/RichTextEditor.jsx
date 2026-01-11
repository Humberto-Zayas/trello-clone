import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import EditorToolbar from './EditorToolbar';

export default function RichTextEditor({ content, onChange, onBlur, placeholder }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose',
      },
    },
  });

  const handleBlur = (e) => {
    // Check if focus is moving to toolbar buttons
    const toolbar = e.currentTarget.closest('.rich-text-editor');
    if (toolbar && toolbar.contains(e.relatedTarget)) {
      return;
    }
    onBlur();
  };

  if (!editor) return null;

  return (
    <div className="rich-text-editor">
      <EditorToolbar editor={editor} />
      <div className="editor-content-wrapper" onBlur={handleBlur}>
        <EditorContent editor={editor} />
        {editor.isEmpty && placeholder && (
          <div className="editor-placeholder">{placeholder}</div>
        )}
      </div>
    </div>
  );
}
