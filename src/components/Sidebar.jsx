export default function Sidebar({ activePage, setActivePage }) {
  const items = [
    { key: 'consultation', label: 'Patient consultation' },
    { key: 'records',      label: 'Patient record search' },
    { key: 'cases',        label: 'Similar case search' },
    { key: 'mypatients',   label: 'My patients' },
    { key: 'doctorsearch', label: 'Doctor search' },
    { key: 'patientsearch', label: 'Patient search' },
  ];

  return (
    <div className="sidebar">
      <div className="nav-group">
        <div className="nav-title">Clinical</div>
        {items.map(item => (
          <div
            key={item.key}
            className={`nav-item ${activePage === item.key ? 'active' : ''}`}
            onClick={() => setActivePage(item.key)}
          >
            <div className="nav-dot"></div>
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}