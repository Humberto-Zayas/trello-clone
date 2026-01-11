import { useState } from 'react';
import { useBoard } from '../context/BoardContext';
import List from './List';
import CardModal from './CardModal';

export default function BoardView({ boardId, onBack }) {
  const { state, dispatch } = useBoard();
  const [newListTitle, setNewListTitle] = useState('');
  const [showListForm, setShowListForm] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [boardTitle, setBoardTitle] = useState('');
  const [selectedCard, setSelectedCard] = useState(null);
  const [draggedCard, setDraggedCard] = useState(null);
  const [draggedList, setDraggedList] = useState(null);

  const board = state.boards.find(b => b.id === boardId);

  if (!board) {
    return <div>Board not found</div>;
  }

  const handleAddList = (e) => {
    e.preventDefault();
    if (newListTitle.trim()) {
      dispatch({
        type: 'ADD_LIST',
        payload: { boardId, title: newListTitle.trim() },
      });
      setNewListTitle('');
      setShowListForm(false);
    }
  };

  const handleTitleClick = () => {
    setBoardTitle(board.title);
    setEditingTitle(true);
  };

  const handleTitleSave = () => {
    if (boardTitle.trim() && boardTitle !== board.title) {
      dispatch({
        type: 'UPDATE_BOARD_TITLE',
        payload: { boardId, title: boardTitle.trim() },
      });
    }
    setEditingTitle(false);
  };

  const handleDragStart = (cardId, listId, index) => {
    setDraggedCard({ cardId, listId, index });
  };

  const handleDrop = (destListId, destIndex) => {
    if (draggedCard) {
      dispatch({
        type: 'MOVE_CARD',
        payload: {
          boardId,
          sourceListId: draggedCard.listId,
          destListId,
          sourceIndex: draggedCard.index,
          destIndex,
        },
      });
      setDraggedCard(null);
    }
  };

  const handleListDragStart = (index) => {
    setDraggedList(index);
  };

  const handleListDrop = (destIndex) => {
    if (draggedList !== null && draggedList !== destIndex) {
      dispatch({
        type: 'MOVE_LIST',
        payload: {
          boardId,
          sourceIndex: draggedList,
          destIndex,
        },
      });
    }
    setDraggedList(null);
  };

  const openCard = (card, listId) => {
    setSelectedCard({ cardId: card.id, listId });
  };

  // Look up current card from state to ensure fresh data
  const getSelectedCard = () => {
    if (!selectedCard) return null;
    const list = board.lists.find(l => l.id === selectedCard.listId);
    if (!list) return null;
    const card = list.cards.find(c => c.id === selectedCard.cardId);
    return card ? { ...card, listId: selectedCard.listId } : null;
  };

  const currentCard = getSelectedCard();

  return (
    <div className="board-view">
      <header className="board-header">
        <button onClick={onBack} className="back-btn">
          ← Back
        </button>
        {editingTitle ? (
          <input
            type="text"
            value={boardTitle}
            onChange={(e) => setBoardTitle(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
            className="board-title-input"
            autoFocus
          />
        ) : (
          <h1 onClick={handleTitleClick} className="board-title">
            {board.title}
          </h1>
        )}
      </header>

      <div className="lists-container">
        {board.lists.map((list, index) => (
          <List
            key={list.id}
            list={list}
            index={index}
            boardId={boardId}
            onCardClick={openCard}
            onDragStart={handleDragStart}
            onDrop={handleDrop}
            isDragging={draggedCard !== null}
            onListDragStart={handleListDragStart}
            onListDrop={handleListDrop}
            isListDragging={draggedList !== null}
          />
        ))}

        <div className="add-list">
          {showListForm ? (
            <form onSubmit={handleAddList} className="add-list-form">
              <input
                type="text"
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
                placeholder="List title..."
                autoFocus
              />
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Add</button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => { setShowListForm(false); setNewListTitle(''); }}
                >
                  ×
                </button>
              </div>
            </form>
          ) : (
            <button
              className="add-list-btn"
              onClick={() => setShowListForm(true)}
            >
              + Add list
            </button>
          )}
        </div>
      </div>

      {currentCard && (
        <CardModal
          card={currentCard}
          boardId={boardId}
          listId={currentCard.listId}
          onClose={() => setSelectedCard(null)}
        />
      )}
    </div>
  );
}
