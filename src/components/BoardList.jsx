import { useState, useRef } from 'react';
import { useBoard } from '../context/BoardContext';

export default function BoardList({ onSelectBoard }) {
  const { state, dispatch, exportData, importData, autoBackup } = useBoard();
  const { isSupported, hasFolder, folderName, lastSaved, setBackupFolder, clearBackupFolder } = autoBackup;
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [showForm, setShowForm] = useState(false);
  const draggedBoardIdx = useRef(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);

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

  const handleDragStart = (e, index) => {
    draggedBoardIdx.current = index;
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.classList.add('dragging');
  };

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove('dragging');
    draggedBoardIdx.current = null;
    setDragOverIdx(null);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedBoardIdx.current === null || draggedBoardIdx.current === index) return;
    setDragOverIdx(index);
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    if (draggedBoardIdx.current === null || draggedBoardIdx.current === index) return;
    dispatch({
      type: 'MOVE_BOARD',
      payload: { sourceIndex: draggedBoardIdx.current, destIndex: index },
    });
    draggedBoardIdx.current = null;
    setDragOverIdx(null);
  };

  return (
    <div className="board-list-container">
      <header className="board-list-header">
        <h1>My Boards</h1>
        <div className="header-actions">
          {isSupported && (
            <div className="backup-status">
              {hasFolder ? (
                <>
                  <span className="backup-info">
                    Auto-backup: <strong>{folderName}</strong>
                    {lastSaved && (
                      <span className="backup-time"> · Saved {lastSaved.toLocaleTimeString()}</span>
                    )}
                  </span>
                  <button onClick={clearBackupFolder} className="btn btn-secondary btn-sm">
                    Clear
                  </button>
                </>
              ) : (
                <button onClick={setBackupFolder} className="btn btn-secondary">
                  Set backup folder
                </button>
              )}
            </div>
          )}
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
        {state.boards.map((board, index) => (
          <div
            key={board.id}
            className={`board-card${dragOverIdx === index ? ' drag-over' : ''}`}
            onClick={() => onSelectBoard(board.id)}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
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
