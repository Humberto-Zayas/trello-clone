import { useState, useEffect } from 'react';

function LinkForm({ link, onSave, onCancel }) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (link) {
      setName(link.name);
      setUrl(link.url);
      setTagsInput(link.tags.join(', '));
    }
  }, [link]);

  const validateUrl = (urlString) => {
    try {
      const parsed = new URL(urlString);
      return parsed.protocol === 'https:' || parsed.protocol === 'http:';
    } catch {
      return false;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const trimmedName = name.trim();
    const trimmedUrl = url.trim();

    if (!trimmedName) {
      setError('Name is required');
      return;
    }

    if (!trimmedUrl) {
      setError('URL is required');
      return;
    }

    if (!validateUrl(trimmedUrl)) {
      setError('Please enter a valid URL (e.g., https://example.com)');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag.length > 0);

    onSave({
      name: trimmedName,
      url: trimmedUrl,
      tags,
    });

    if (!link) {
      setName('');
      setUrl('');
      setTagsInput('');
    }
  };

  return (
    <form className="link-form" onSubmit={handleSubmit}>
      {error && <div className="link-form-error">{error}</div>}
      <input
        type="text"
        placeholder="Link name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="link-form-input"
        autoFocus
      />
      <input
        type="text"
        placeholder="https://example.com"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="link-form-input"
      />
      <input
        type="text"
        placeholder="Tags (comma-separated)"
        value={tagsInput}
        onChange={(e) => setTagsInput(e.target.value)}
        className="link-form-input"
      />
      <div className="link-form-actions">
        <button type="submit" className="btn btn-primary">
          {link ? 'Save' : 'Add Link'}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

export default LinkForm;
