export default function Sidebar({ page, onNavigate }) {
  const items = [
    { key: 'consultation',  label: 'Patient Consultation', icon: '📋' },
    { key: 'patients',      label: 'Patient Search',       icon: '🔍' },
    { key: 'cases',         label: 'Similar Case Search',  icon: '🔬' },
  ];

  return (
    <div className="sidebar">
      <div className="nav-group">
        <div className="nav-title">Clinical</div>
        {items.map(item => (
          <div
            key={item.key}
            className={`nav-item ${page === item.key ? 'active' : ''}`}
            onClick={() => onNavigate(item.key)}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}