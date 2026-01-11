import DOMPurify from 'dompurify';

export default function RichTextDisplay({ content, onClick, placeholder }) {
  const isEmpty = !content || content === '<p></p>' || content.trim() === '';

  const sanitizedContent = content ? DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em', 's', 'ul', 'ol', 'li', 'a', 'br'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  }) : '';

  const handleClick = (e) => {
    // Allow links to work normally
    if (e.target.tagName === 'A') {
      return;
    }
    onClick();
  };

  return (
    <div className="rich-text-display" onClick={handleClick}>
      {isEmpty ? (
        <span className="display-placeholder">{placeholder}</span>
      ) : (
        <div
          className="prose"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />
      )}
    </div>
  );
}
