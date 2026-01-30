import { createContext, useContext, useReducer, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const LinksContext = createContext();

const LINKS_STORAGE_KEY = 'trello-clone-links';

const initialState = {
  links: [],
};

function validateState(data) {
  if (!data || typeof data !== 'object') return false;
  if (!Array.isArray(data.links)) return false;
  return true;
}

function loadLinksFromStorage() {
  try {
    const data = localStorage.getItem(LINKS_STORAGE_KEY);
    if (!data) return initialState;

    const parsed = JSON.parse(data);
    if (!validateState(parsed)) {
      console.warn('Invalid links localStorage data, using defaults');
      return initialState;
    }
    return parsed;
  } catch {
    return initialState;
  }
}

function saveLinksToStorage(state) {
  localStorage.setItem(LINKS_STORAGE_KEY, JSON.stringify(state));
}

function linksReducer(state, action) {
  let newState;

  switch (action.type) {
    case 'LOAD_LINKS':
      return action.payload;

    case 'ADD_LINK':
      newState = {
        ...state,
        links: [...state.links, {
          id: uuidv4(),
          name: action.payload.name,
          url: action.payload.url,
          tags: action.payload.tags || [],
          createdAt: new Date().toISOString(),
        }],
      };
      break;

    case 'UPDATE_LINK':
      newState = {
        ...state,
        links: state.links.map(link =>
          link.id === action.payload.id
            ? { ...link, ...action.payload.updates }
            : link
        ),
      };
      break;

    case 'DELETE_LINK':
      newState = {
        ...state,
        links: state.links.filter(link => link.id !== action.payload.id),
      };
      break;

    default:
      return state;
  }

  saveLinksToStorage(newState);
  return newState;
}

export function LinksProvider({ children }) {
  const [state, dispatch] = useReducer(linksReducer, initialState);

  useEffect(() => {
    const savedData = loadLinksFromStorage();
    dispatch({ type: 'LOAD_LINKS', payload: savedData });
  }, []);

  return (
    <LinksContext.Provider value={{ state, dispatch }}>
      {children}
    </LinksContext.Provider>
  );
}

export function useLinks() {
  const context = useContext(LinksContext);
  if (!context) {
    throw new Error('useLinks must be used within a LinksProvider');
  }
  return context;
}
