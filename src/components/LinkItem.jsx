import { useState } from 'react';
import LinkForm from './LinkForm';

function LinkItem({ link, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const handleClick = () => {
    window.open(link.url, '_blank');
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(link.id);
  };

  const handleSave = (data) => {
    onUpdate(link.id, data);
    setIsEditing(false);
  };

  const truncateUrl = (url) => {
    try {
      const parsed = new URL(url);
      const display = parsed.hostname + parsed.pathname;
      return display.length > 35 ? display.substring(0, 35) + '...' : display;
    } catch {
      return url.length > 35 ? url.substring(0, 35) + '...' : url;
    }
  };

  if (isEditing) {
    return (
      <div className="link-item link-item-editing">
        <LinkForm
          link={link}
          onSave={handleSave}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div
      className="link-item"
      onClick={handleClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="link-item-content">
        <div className="link-item-name">{link.name}</div>
        <div className="link-item-url">{truncateUrl(link.url)}</div>
        {link.tags.length > 0 && (
          <div className="link-item-tags">
            {link.tags.map(tag => (
              <span key={tag} className="link-tag">{tag}</span>
            ))}
          </div>
        )}
      </div>
      {showActions && (
        <div className="link-item-actions">
          <button className="link-action-btn" onClick={handleEdit} title="Edit">
            ✎
          </button>
          <button className="link-action-btn link-action-delete" onClick={handleDelete} title="Delete">
            ×
          </button>
        </div>
      )}
    </div>
  );
}

export default LinkItem;
