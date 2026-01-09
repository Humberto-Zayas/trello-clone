import { useState } from 'react';
import { BoardProvider } from './context/BoardContext';
import BoardList from './components/BoardList';
import BoardView from './components/BoardView';
import './App.css';

function App() {
  const [currentBoardId, setCurrentBoardId] = useState(null);

  return (
    <BoardProvider>
      <div className="app">
        {currentBoardId ? (
          <BoardView
            boardId={currentBoardId}
            onBack={() => setCurrentBoardId(null)}
          />
        ) : (
          <BoardList onSelectBoard={setCurrentBoardId} />
        )}
      </div>
    </BoardProvider>
  );
}

export default App;
