import { useState } from 'react';
import { useBoard } from '../context/BoardContext';

const LABELS = [
  { name: 'red', color: '#ef4444' },
  { name: 'orange', color: '#f97316' },
  { name: 'yellow', color: '#eab308' },
  { name: 'green', color: '#22c55e' },
  { name: 'blue', color: '#3b82f6' },
  { name: 'purple', color: '#a855f7' },
];

export default function CardModal({ card, boardId, listId, onClose }) {
  const { dispatch } = useBoard();
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [editingItemId, setEditingItemId] = useState(null);
  const [editingItemText, setEditingItemText] = useState('');

  const handleTitleBlur = () => {
    if (title.trim() && title !== card.title) {
      dispatch({
        type: 'UPDATE_CARD',
        payload: { boardId, listId, cardId: card.id, updates: { title: title.trim() } },
      });
    }
  };

  const handleDescriptionBlur = () => {
    if (description !== card.description) {
      dispatch({
        type: 'UPDATE_CARD',
        payload: { boardId, listId, cardId: card.id, updates: { description } },
      });
    }
  };

  const handleAddChecklistItem = (e) => {
    e.preventDefault();
    if (newChecklistItem.trim()) {
      dispatch({
        type: 'ADD_CHECKLIST_ITEM',
        payload: { boardId, listId, cardId: card.id, text: newChecklistItem.trim() },
      });
      setNewChecklistItem('');
    }
  };

  const handleToggleChecklistItem = (itemId) => {
    dispatch({
      type: 'TOGGLE_CHECKLIST_ITEM',
      payload: { boardId, listId, cardId: card.id, itemId },
    });
  };

  const handleDeleteChecklistItem = (itemId) => {
    dispatch({
      type: 'DELETE_CHECKLIST_ITEM',
      payload: { boardId, listId, cardId: card.id, itemId },
    });
  };

  const handleEditChecklistItem = (item) => {
    setEditingItemId(item.id);
    setEditingItemText(item.text);
  };

  const handleSaveChecklistItem = () => {
    if (editingItemText.trim() && editingItemId) {
      dispatch({
        type: 'UPDATE_CHECKLIST_ITEM',
        payload: { boardId, listId, cardId: card.id, itemId: editingItemId, text: editingItemText.trim() },
      });
    }
    setEditingItemId(null);
    setEditingItemText('');
  };

  const handleToggleLabel = (label) => {
    dispatch({
      type: 'TOGGLE_LABEL',
      payload: { boardId, listId, cardId: card.id, label },
    });
  };

  const handleDeleteCard = () => {
    if (confirm('Delete this card?')) {
      dispatch({ type: 'DELETE_CARD', payload: { boardId, listId, cardId: card.id } });
      onClose();
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const completedCount = card.checklist.filter(item => item.completed).length;
  const totalCount = card.checklist.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>×</button>

        <div className="modal-header">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            className="modal-title-input"
          />
        </div>

        <div className="modal-content">
          <section className="modal-section">
            <h4>Labels</h4>
            <div className="labels-container">
              {LABELS.map(label => (
                <button
                  key={label.name}
                  className={`label-btn ${card.labels.includes(label.name) ? 'active' : ''}`}
                  style={{ backgroundColor: label.color }}
                  onClick={() => handleToggleLabel(label.name)}
                >
                  {card.labels.includes(label.name) && '✓'}
                </button>
              ))}
            </div>
          </section>

          <section className="modal-section">
            <h4>Description</h4>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleDescriptionBlur}
              placeholder="Add a description..."
              rows={4}
              className="description-input"
            />
          </section>

          <section className="modal-section">
            <h4>Checklist</h4>
            {totalCount > 0 && (
              <div className="checklist-progress">
                <span>{Math.round(progressPercent)}%</span>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}
            <div className="checklist">
              {card.checklist.map(item => (
                <div key={item.id} className="checklist-item">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => handleToggleChecklistItem(item.id)}
                  />
                  {editingItemId === item.id ? (
                    <input
                      type="text"
                      value={editingItemText}
                      onChange={(e) => setEditingItemText(e.target.value)}
                      onBlur={handleSaveChecklistItem}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveChecklistItem()}
                      className="checklist-item-input"
                      autoFocus
                    />
                  ) : (
                    <span
                      className={item.completed ? 'completed' : ''}
                      onClick={() => handleEditChecklistItem(item)}
                    >
                      {item.text}
                    </span>
                  )}
                  <button
                    className="delete-btn small"
                    onClick={() => handleDeleteChecklistItem(item.id)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <form onSubmit={handleAddChecklistItem} className="add-checklist-form">
              <input
                type="text"
                value={newChecklistItem}
                onChange={(e) => setNewChecklistItem(e.target.value)}
                placeholder="Add item..."
              />
              <button type="submit" className="btn btn-primary">Add</button>
            </form>
          </section>
        </div>

        <div className="modal-footer">
          <button className="btn btn-danger" onClick={handleDeleteCard}>
            Delete Card
          </button>
        </div>
      </div>
    </div>
  );
}
