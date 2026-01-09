const LABEL_COLORS = {
  red: '#ef4444',
  orange: '#f97316',
  yellow: '#eab308',
  green: '#22c55e',
  blue: '#3b82f6',
  purple: '#a855f7',
};

export default function Card({ card, listId, index, onClick, onDragStart }) {
  const completedCount = card.checklist.filter(item => item.completed).length;
  const totalCount = card.checklist.length;

  const handleDragStart = (e) => {
    e.dataTransfer.effectAllowed = 'move';
    onDragStart(card.id, listId, index);
  };

  return (
    <div
      className="card"
      draggable
      onDragStart={handleDragStart}
      onClick={onClick}
    >
      {card.labels.length > 0 && (
        <div className="card-labels">
          {card.labels.map(label => (
            <span
              key={label}
              className="card-label"
              style={{ backgroundColor: LABEL_COLORS[label] }}
            />
          ))}
        </div>
      )}
      <p className="card-title">{card.title}</p>
      <div className="card-badges">
        {card.description && (
          <span className="badge" title="Has description">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
              <path d="M4 5h16v2H4V5zm0 4h16v2H4V9zm0 4h10v2H4v-2z"/>
            </svg>
          </span>
        )}
        {totalCount > 0 && (
          <span className={`badge ${completedCount === totalCount ? 'badge-complete' : ''}`}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
            </svg>
            {completedCount}/{totalCount}
          </span>
        )}
      </div>
    </div>
  );
}
