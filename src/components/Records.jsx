import { mockPatients } from '../data/mockData';

export default function Records() {
  return (
    <div>
      <div className="search-wrapper">
        <span className="search-icon">🔍</span>
        <input className="form-input search-input"
          placeholder="Search by Patient ID, patient name, or registration number..." />
      </div>
      <div className="filters">
        {['All records', 'Recent visits', 'My patients', 'ID linked'].map((f, i) => (
          <div key={f} className={`filter-chip ${i === 0 ? 'active' : ''}`}>{f}</div>
        ))}
      </div>
      <div className="results">
        {mockPatients.map(p => (
          <div className="result-item" key={p.id}>
            <div className="result-header">
              <div>
                <div className="result-title">{p.name}</div>
                <div className="result-id">Patient ID: {p.abhaId} • {p.id}</div>
              </div>
              <span className="pill pill-success">Active</span>
            </div>
            <div className="result-desc">{p.age} • {p.gender} • Last visit: {p.lastVisit}</div>
            <div className="result-meta">Department: {p.dept} • {p.doctor}</div>
            <div className="result-tags">
              {p.tags.map(t => <span className="tag" key={t}>{t}</span>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}