import { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useBackup } from '../hooks/useBackup';

const BoardContext = createContext();

const STORAGE_KEY = 'trello-clone-data';

const initialState = {
  boards: [],
  currentBoard: null,
};

function validateState(data) {
  if (!data || typeof data !== 'object') return false;
  if (!Array.isArray(data.boards)) return false;
  return true;
}

function isTrelloExport(data) {
  return (
    data &&
    typeof data === 'object' &&
    typeof data.name === 'string' &&
    Array.isArray(data.lists) &&
    Array.isArray(data.cards) &&
    !Array.isArray(data.boards)
  );
}

function convertTrelloExport(data) {
  const labelById = {};
  for (const label of data.labels || []) {
    labelById[label.id] = label.color;
  }

  const checklistsByCardId = {};
  for (const cl of data.checklists || []) {
    if (!checklistsByCardId[cl.idCard]) checklistsByCardId[cl.idCard] = [];
    for (const item of cl.checkItems || []) {
      checklistsByCardId[cl.idCard].push({
        id: uuidv4(),
        text: item.name,
        completed: item.state === 'complete',
      });
    }
  }

  const openLists = (data.lists || [])
    .filter((l) => !l.closed)
    .sort((a, b) => a.pos - b.pos);

  const cardsByListId = {};
  for (const card of data.cards || []) {
    if (card.closed) continue;
    if (!cardsByListId[card.idList]) cardsByListId[card.idList] = [];
    cardsByListId[card.idList].push(card);
  }
  for (const listId of Object.keys(cardsByListId)) {
    cardsByListId[listId].sort((a, b) => a.pos - b.pos);
  }

  const lists = openLists.map((list) => ({
    id: uuidv4(),
    title: list.name,
    cards: (cardsByListId[list.id] || []).map((card) => ({
      id: uuidv4(),
      title: card.name,
      description: card.desc || '',
      createdAt: card.dateLastActivity || new Date().toISOString(),
      labels: (card.idLabels || []).map((lid) => labelById[lid]).filter(Boolean),
      checklist: checklistsByCardId[card.id] || [],
    })),
  }));

  const board = {
    id: uuidv4(),
    title: data.name,
    createdAt: new Date().toISOString(),
    lists,
  };

  return { boards: [board], currentBoard: null };
}

function loadFromStorage() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return initialState;

    const parsed = JSON.parse(data);
    if (!validateState(parsed)) {
      console.warn('Invalid localStorage data, using defaults');
      return initialState;
    }
    return parsed;
  } catch {
    return initialState;
  }
}

function saveToStorage(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function boardReducer(state, action) {
  let newState;

  switch (action.type) {
    case 'LOAD_DATA':
      return action.payload;

    case 'MERGE_BOARDS':
      return {
        ...state,
        boards: [...state.boards, ...action.payload.boards],
      };

    case 'ADD_BOARD':
      newState = {
        ...state,
        boards: [...state.boards, {
          id: uuidv4(),
          title: action.payload.title,
          lists: [],
          createdAt: new Date().toISOString(),
        }],
      };
      break;

    case 'DELETE_BOARD':
      newState = {
        ...state,
        boards: state.boards.filter(b => b.id !== action.payload.boardId),
        currentBoard: state.currentBoard === action.payload.boardId ? null : state.currentBoard,
      };
      break;

    case 'SET_CURRENT_BOARD':
      newState = { ...state, currentBoard: action.payload.boardId };
      break;

    case 'UPDATE_BOARD_TITLE':
      newState = {
        ...state,
        boards: state.boards.map(b =>
          b.id === action.payload.boardId
            ? { ...b, title: action.payload.title }
            : b
        ),
      };
      break;

    case 'ADD_LIST':
      newState = {
        ...state,
        boards: state.boards.map(b =>
          b.id === action.payload.boardId
            ? {
                ...b,
                lists: [...b.lists, {
                  id: uuidv4(),
                  title: action.payload.title,
                  cards: [],
                }],
              }
            : b
        ),
      };
      break;

    case 'DELETE_LIST':
      newState = {
        ...state,
        boards: state.boards.map(b =>
          b.id === action.payload.boardId
            ? { ...b, lists: b.lists.filter(l => l.id !== action.payload.listId) }
            : b
        ),
      };
      break;

    case 'UPDATE_LIST_TITLE':
      newState = {
        ...state,
        boards: state.boards.map(b =>
          b.id === action.payload.boardId
            ? {
                ...b,
                lists: b.lists.map(l =>
                  l.id === action.payload.listId
                    ? { ...l, title: action.payload.title }
                    : l
                ),
              }
            : b
        ),
      };
      break;

    case 'ADD_CARD':
      newState = {
        ...state,
        boards: state.boards.map(b =>
          b.id === action.payload.boardId
            ? {
                ...b,
                lists: b.lists.map(l =>
                  l.id === action.payload.listId
                    ? {
                        ...l,
                        cards: [...l.cards, {
                          id: uuidv4(),
                          title: action.payload.title,
                          description: '',
                          labels: [],
                          checklist: [],
                          createdAt: new Date().toISOString(),
                        }],
                      }
                    : l
                ),
              }
            : b
        ),
      };
      break;

    case 'DELETE_CARD':
      newState = {
        ...state,
        boards: state.boards.map(b =>
          b.id === action.payload.boardId
            ? {
                ...b,
                lists: b.lists.map(l =>
                  l.id === action.payload.listId
                    ? { ...l, cards: l.cards.filter(c => c.id !== action.payload.cardId) }
                    : l
                ),
              }
            : b
        ),
      };
      break;

    case 'UPDATE_CARD':
      newState = {
        ...state,
        boards: state.boards.map(b =>
          b.id === action.payload.boardId
            ? {
                ...b,
                lists: b.lists.map(l =>
                  l.id === action.payload.listId
                    ? {
                        ...l,
                        cards: l.cards.map(c =>
                          c.id === action.payload.cardId
                            ? { ...c, ...action.payload.updates }
                            : c
                        ),
                      }
                    : l
                ),
              }
            : b
        ),
      };
      break;

    case 'MOVE_CARD':
      const { boardId, sourceListId, destListId, sourceIndex, destIndex } = action.payload;
      newState = {
        ...state,
        boards: state.boards.map(b => {
          if (b.id !== boardId) return b;

          const newLists = b.lists.map(l => ({ ...l, cards: [...l.cards] }));
          const sourceList = newLists.find(l => l.id === sourceListId);
          const destList = newLists.find(l => l.id === destListId);

          const [movedCard] = sourceList.cards.splice(sourceIndex, 1);
          destList.cards.splice(destIndex, 0, movedCard);

          return { ...b, lists: newLists };
        }),
      };
      break;

    case 'MOVE_LIST':
      const { boardId: bid, sourceIndex: srcIdx, destIndex: dstIdx } = action.payload;
      newState = {
        ...state,
        boards: state.boards.map(b => {
          if (b.id !== bid) return b;
          const newLists = [...b.lists];
          const [movedList] = newLists.splice(srcIdx, 1);
          newLists.splice(dstIdx, 0, movedList);
          return { ...b, lists: newLists };
        }),
      };
      break;

    case 'MOVE_BOARD':
      const { sourceIndex: boardSrcIdx, destIndex: boardDstIdx } = action.payload;
      const newBoards = [...state.boards];
      const [movedBoard] = newBoards.splice(boardSrcIdx, 1);
      newBoards.splice(boardDstIdx, 0, movedBoard);
      newState = { ...state, boards: newBoards };
      break;

    case 'ADD_CHECKLIST_ITEM':
      newState = {
        ...state,
        boards: state.boards.map(b =>
          b.id === action.payload.boardId
            ? {
                ...b,
                lists: b.lists.map(l =>
                  l.id === action.payload.listId
                    ? {
                        ...l,
                        cards: l.cards.map(c =>
                          c.id === action.payload.cardId
                            ? {
                                ...c,
                                checklist: [...c.checklist, {
                                  id: uuidv4(),
                                  text: action.payload.text,
                                  completed: false,
                                }],
                              }
                            : c
                        ),
                      }
                    : l
                ),
              }
            : b
        ),
      };
      break;

    case 'TOGGLE_CHECKLIST_ITEM':
      newState = {
        ...state,
        boards: state.boards.map(b =>
          b.id === action.payload.boardId
            ? {
                ...b,
                lists: b.lists.map(l =>
                  l.id === action.payload.listId
                    ? {
                        ...l,
                        cards: l.cards.map(c =>
                          c.id === action.payload.cardId
                            ? {
                                ...c,
                                checklist: c.checklist.map(item =>
                                  item.id === action.payload.itemId
                                    ? { ...item, completed: !item.completed }
                                    : item
                                ),
                              }
                            : c
                        ),
                      }
                    : l
                ),
              }
            : b
        ),
      };
      break;

    case 'DELETE_CHECKLIST_ITEM':
      newState = {
        ...state,
        boards: state.boards.map(b =>
          b.id === action.payload.boardId
            ? {
                ...b,
                lists: b.lists.map(l =>
                  l.id === action.payload.listId
                    ? {
                        ...l,
                        cards: l.cards.map(c =>
                          c.id === action.payload.cardId
                            ? {
                                ...c,
                                checklist: c.checklist.filter(item => item.id !== action.payload.itemId),
                              }
                            : c
                        ),
                      }
                    : l
                ),
              }
            : b
        ),
      };
      break;

    case 'UPDATE_CHECKLIST_ITEM':
      newState = {
        ...state,
        boards: state.boards.map(b =>
          b.id === action.payload.boardId
            ? {
                ...b,
                lists: b.lists.map(l =>
                  l.id === action.payload.listId
                    ? {
                        ...l,
                        cards: l.cards.map(c =>
                          c.id === action.payload.cardId
                            ? {
                                ...c,
                                checklist: c.checklist.map(item =>
                                  item.id === action.payload.itemId
                                    ? { ...item, text: action.payload.text }
                                    : item
                                ),
                              }
                            : c
                        ),
                      }
                    : l
                ),
              }
            : b
        ),
      };
      break;

    case 'TOGGLE_LABEL':
      newState = {
        ...state,
        boards: state.boards.map(b =>
          b.id === action.payload.boardId
            ? {
                ...b,
                lists: b.lists.map(l =>
                  l.id === action.payload.listId
                    ? {
                        ...l,
                        cards: l.cards.map(c =>
                          c.id === action.payload.cardId
                            ? {
                                ...c,
                                labels: c.labels.includes(action.payload.label)
                                  ? c.labels.filter(l => l !== action.payload.label)
                                  : [...c.labels, action.payload.label],
                              }
                            : c
                        ),
                      }
                    : l
                ),
              }
            : b
        ),
      };
      break;

    default:
      return state;
  }

  saveToStorage(newState);
  return newState;
}

export function BoardProvider({ children }) {
  const [state, dispatch] = useReducer(boardReducer, initialState);
  const { isSupported, hasFolder, folderName, lastSaved, setBackupFolder, backup, clearBackupFolder } = useBackup();
  const loadedRef = useRef(false);

  useEffect(() => {
    const savedData = loadFromStorage();
    dispatch({ type: 'LOAD_DATA', payload: savedData });
    loadedRef.current = true;
  }, []);

  // Auto-backup whenever state changes, but only after initial load
  useEffect(() => {
    if (!loadedRef.current) return;
    backup(state);
  }, [state, backup]);

  const exportData = () => {
    const dataStr = JSON.stringify(state, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'trello-backup.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        let data = JSON.parse(e.target.result);
        if (isTrelloExport(data)) {
          data = convertTrelloExport(data);
        }
        if (!validateState(data)) {
          alert('Invalid data format: missing or invalid boards array');
          return;
        }
        dispatch({ type: 'MERGE_BOARDS', payload: data });
        saveToStorage({ ...state, boards: [...state.boards, ...data.boards] });
      } catch (err) {
        alert('Invalid file format');
      }
    };
    reader.readAsText(file);
  };

  return (
    <BoardContext.Provider value={{
      state, dispatch, exportData, importData,
      autoBackup: { isSupported, hasFolder, folderName, lastSaved, setBackupFolder, clearBackupFolder },
    }}>
      {children}
    </BoardContext.Provider>
  );
}

export function useBoard() {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error('useBoard must be used within a BoardProvider');
  }
  return context;
}
