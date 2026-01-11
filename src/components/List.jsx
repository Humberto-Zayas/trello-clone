import { useState } from 'react';
import { useBoard } from '../context/BoardContext';
import Card from './Card';

export default function List({ list, boardId, onCardClick, onDragStart, onDrop, isDragging }) {
  const { dispatch } = useBoard();
  const [newCardTitle, setNewCardTitle] = useState('');
  const [showCardForm, setShowCardForm] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [listTitle, setListTitle] = useState('');
  const [dropIndex, setDropIndex] = useState(null);

  const handleAddCard = (e) => {
    e.preventDefault();
    if (newCardTitle.trim()) {
      dispatch({
        type: 'ADD_CARD',
        payload: { boardId, listId: list.id, title: newCardTitle.trim() },
      });
      setNewCardTitle('');
      setShowCardForm(false);
    }
  };

  const handleDeleteList = () => {
    if (confirm('Delete this list?')) {
      dispatch({ type: 'DELETE_LIST', payload: { boardId, listId: list.id } });
    }
  };

  const handleTitleClick = () => {
    setListTitle(list.title);
    setEditingTitle(true);
  };

  const handleTitleSave = () => {
    if (listTitle.trim() && listTitle !== list.title) {
      dispatch({
        type: 'UPDATE_LIST_TITLE',
        payload: { boardId, listId: list.id, title: listTitle.trim() },
      });
    }
    setEditingTitle(false);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    setDropIndex(index);
  };

  const handleDragLeave = () => {
    setDropIndex(null);
  };

  const handleDropOnList = (e, index) => {
    e.preventDefault();
    onDrop(list.id, index);
    setDropIndex(null);
  };

  return (
    <div className="list">
      <div className="list-header">
        {editingTitle ? (
          <input
            type="text"
            value={listTitle}
            onChange={(e) => setListTitle(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
            className="list-title-input"
            autoFocus
          />
        ) : (
          <h3 onClick={handleTitleClick} className="list-title">
            {list.title}
          </h3>
        )}
        <button className="delete-btn" onClick={handleDeleteList}>×</button>
      </div>

      <div
        className="cards-container"
        onDragOver={(e) => handleDragOver(e, list.cards.length)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDropOnList(e, list.cards.length)}
      >
        {list.cards.map((card, index) => (
          <div key={card.id}>
            {dropIndex === index && isDragging && (
              <div className="drop-indicator" />
            )}
            <div
              onDragOver={(e) => { e.stopPropagation(); handleDragOver(e, index); }}
              onDrop={(e) => { e.stopPropagation(); handleDropOnList(e, index); }}
            >
              <Card
                card={card}
                listId={list.id}
                index={index}
                onClick={() => onCardClick(card, list.id)}
                onDragStart={onDragStart}
              />
            </div>
          </div>
        ))}
        {dropIndex === list.cards.length && isDragging && (
          <div className="drop-indicator" />
        )}
      </div>

      {showCardForm ? (
        <form onSubmit={handleAddCard} className="add-card-form">
          <textarea
            value={newCardTitle}
            onChange={(e) => setNewCardTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAddCard(e);
              }
            }}
            placeholder="Enter card title..."
            autoFocus
            rows={3}
          />
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Add Card</button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => { setShowCardForm(false); setNewCardTitle(''); }}
            >
              ×
            </button>
          </div>
        </form>
      ) : (
        <button
          className="add-card-btn"
          onClick={() => setShowCardForm(true)}
        >
          + Add card
        </button>
      )}
    </div>
  );
}
