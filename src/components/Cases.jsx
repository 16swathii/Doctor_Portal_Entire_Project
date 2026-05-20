import { useState } from 'react';
import { mockCases } from '../data/mockData';

export default function Cases() {
  const [selected, setSelected] = useState(null);
  const detail = mockCases.find(c => c.id === selected);

  return (
    <div>
      <div className="search-wrapper">
        <span className="search-icon">🔍</span>
        <input className="form-input search-input"
          placeholder="Search by symptoms, diagnosis, ICD code..."
          defaultValue="STEMI anterior wall" />
      </div>
      <div className="filters">
        {['All India', 'Age 40-60', 'Last 5 years', 'Male', 'Female'].map((f, i) => (
          <div key={f} className={`filter-chip ${i < 3 ? 'active' : ''}`}>{f}</div>
        ))}
      </div>
      <div style={{ margin: '16px 0', fontSize: 15, fontWeight: 600 }}>
        3,842 similar cases found
      </div>
      <div className="results">
        {mockCases.map(c => (
          <div className="result-item" key={c.id} onClick={() => setSelected(c.id)}>
            <div className="result-header">
              <div>
                <span className="result-id">{c.id}</span>
                <span className={`pill pill-${c.match >= 90 ? 'success' : 'warning'}`}
                  style={{ marginLeft: 8 }}>{c.match}% match</span>
              </div>
              <span className="pill pill-info">{c.source}</span>
            </div>
            <div className="result-title">{c.title}</div>
            <div className="result-desc">{c.desc}</div>
            <div className="result-meta">{c.hospital} • {c.date}</div>
            <div className="result-tags">
              {c.tags.map(t => <span className="tag" key={t}>{t}</span>)}
            </div>
          </div>
        ))}
      </div>

      {detail && (
        <div className="case-detail">
          <div className="case-detail-header">
            <div>
              <div className="case-detail-title">{detail.title}</div>
              <div className="case-detail-subtitle">{detail.hospital} • {detail.date}</div>
            </div>
            <button className="close-btn" onClick={() => setSelected(null)}>×</button>
          </div>
          <div className="stats-grid">
            {[
              ['Similarity', `${detail.match}%`],
              ['Outcome', 'Recovered'],
              ['Length of Stay', '9 days'],
              ['Treatment', 'Primary PCI'],
            ].map(([label, val]) => (
              <div className="stat-box" key={label}>
                <div className="stat-label">{label}</div>
                <div className="stat-value">{val}</div>
              </div>
            ))}
          </div>
          <div className="section-title">Clinical Timeline</div>
          <div className="timeline">
            {detail.timeline.map((e, i) => (
              <div className="timeline-item" key={i}>
                <div className="timeline-left">
                  <div className="timeline-dot"></div>
                  {i < detail.timeline.length - 1 && <div className="timeline-line"></div>}
                </div>
                <div className="timeline-content">
                  <div className="timeline-event">{e.event}</div>
                  <div className="timeline-time">{e.time}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="btn-group">
            <button className="btn btn-primary">Ask Claude about this case ↗</button>
            <button className="btn btn-secondary">Export (ABDM consent)</button>
          </div>
        </div>
      )}
    </div>
  );
}