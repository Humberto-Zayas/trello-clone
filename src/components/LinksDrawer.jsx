import { useState, useMemo } from 'react';
import { useLinks } from '../context/LinksContext';
import LinkItem from './LinkItem';
import LinkForm from './LinkForm';

function LinksDrawer({ isOpen, onClose }) {
  const { state, dispatch } = useLinks();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const allTags = useMemo(() => {
    const tagSet = new Set();
    state.links.forEach(link => {
      link.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [state.links]);

  const filteredLinks = useMemo(() => {
    return state.links.filter(link => {
      const matchesSearch = searchQuery === '' ||
        link.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTag = selectedTag === null ||
        link.tags.includes(selectedTag);
      return matchesSearch && matchesTag;
    });
  }, [state.links, searchQuery, selectedTag]);

  const handleAddLink = (data) => {
    dispatch({
      type: 'ADD_LINK',
      payload: data,
    });
    setShowAddForm(false);
  };

  const handleUpdateLink = (id, updates) => {
    dispatch({
      type: 'UPDATE_LINK',
      payload: { id, updates },
    });
  };

  const handleDeleteLink = (id) => {
    dispatch({
      type: 'DELETE_LINK',
      payload: { id },
    });
  };

  const handleTagClick = (tag) => {
    setSelectedTag(selectedTag === tag ? null : tag);
  };

  return (
    <>
      <div
        className={`drawer-backdrop ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />
      <div className={`links-drawer ${isOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <h2>Links</h2>
          <button className="drawer-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="drawer-search">
          <input
            type="text"
            placeholder="Search links..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="drawer-search-input"
          />
        </div>

        {allTags.length > 0 && (
          <div className="tag-filter">
            {allTags.map(tag => (
              <button
                key={tag}
                className={`tag-filter-chip ${selectedTag === tag ? 'active' : ''}`}
                onClick={() => handleTagClick(tag)}
              >
                {tag}
              </button>
            ))}
            {selectedTag && (
              <button
                className="tag-filter-clear"
                onClick={() => setSelectedTag(null)}
              >
                Clear
              </button>
            )}
          </div>
        )}

        <div className="links-list">
          {filteredLinks.length === 0 ? (
            <div className="links-empty">
              {state.links.length === 0
                ? 'No links saved yet. Add your first link below!'
                : 'No links match your search.'}
            </div>
          ) : (
            filteredLinks.map(link => (
              <LinkItem
                key={link.id}
                link={link}
                onUpdate={handleUpdateLink}
                onDelete={handleDeleteLink}
              />
            ))
          )}
        </div>

        <div className="drawer-footer">
          {showAddForm ? (
            <LinkForm
              onSave={handleAddLink}
              onCancel={() => setShowAddForm(false)}
            />
          ) : (
            <button
              className="btn btn-primary add-link-btn"
              onClick={() => setShowAddForm(true)}
            >
              + Add Link
            </button>
          )}
        </div>
      </div>
    </>
  );
}

export default LinksDrawer;
