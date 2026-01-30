import { useState } from 'react';
import { BoardProvider } from './context/BoardContext';
import { LinksProvider } from './context/LinksContext';
import BoardList from './components/BoardList';
import BoardView from './components/BoardView';
import LinksDrawer from './components/LinksDrawer';
import './App.css';

function App() {
  const [currentBoardId, setCurrentBoardId] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <BoardProvider>
      <LinksProvider>
        <div className="app">
          {currentBoardId ? (
            <BoardView
              boardId={currentBoardId}
              onBack={() => setCurrentBoardId(null)}
            />
          ) : (
            <BoardList onSelectBoard={setCurrentBoardId} />
          )}

          <button
            className="drawer-toggle-btn"
            onClick={() => setIsDrawerOpen(true)}
            title="Open Links"
          >
            🔗
          </button>

          <LinksDrawer
            isOpen={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
          />
        </div>
      </LinksProvider>
    </BoardProvider>
  );
}

export default App;
