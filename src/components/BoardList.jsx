import { useState } from 'react';
import { useBoard } from '../context/BoardContext';

export default function BoardList({ onSelectBoard }) {
  const { state, dispatch, exportData, importData } = useBoard();
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleAddBoard = (e) => {
    e.preventDefault();
    if (newBoardTitle.trim()) {
      dispatch({ type: 'ADD_BOARD', payload: { title: newBoardTitle.trim() } });
      setNewBoardTitle('');
      setShowForm(false);
    }
  };

  const handleDeleteBoard = (e, boardId) => {
    e.stopPropagation();
    if (confirm('Delete this board?')) {
      dispatch({ type: 'DELETE_BOARD', payload: { boardId } });
    }
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (file) {
      importData(file);
      e.target.value = '';
    }
  };

  return (
    <div className="board-list-container">
      <header className="board-list-header">
        <h1>My Boards</h1>
        <div className="header-actions">
          <button onClick={exportData} className="btn btn-secondary">
            Export Data
          </button>
          <label className="btn btn-secondary">
            Import Data
            <input type="file" accept=".json" onChange={handleImport} hidden />
          </label>
        </div>
      </header>

      <div className="boards-grid">
        {state.boards.map(board => (
          <div
            key={board.id}
            className="board-card"
            onClick={() => onSelectBoard(board.id)}
          >
            <h3>{board.title}</h3>
            <p>{board.lists.length} list{board.lists.length !== 1 ? 's' : ''}</p>
            <button
              className="delete-btn"
              onClick={(e) => handleDeleteBoard(e, board.id)}
            >
              ×
            </button>
          </div>
        ))}

        {showForm ? (
          <form className="new-board-form" onSubmit={handleAddBoard}>
            <input
              type="text"
              value={newBoardTitle}
              onChange={(e) => setNewBoardTitle(e.target.value)}
              placeholder="Board title..."
              autoFocus
            />
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">Add</button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => { setShowForm(false); setNewBoardTitle(''); }}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="board-card new-board" onClick={() => setShowForm(true)}>
            <span>+ Create new board</span>
          </div>
        )}
      </div>
    </div>
  );
}
