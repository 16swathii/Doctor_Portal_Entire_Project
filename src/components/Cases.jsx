import { useState } from 'react';

const mockCases = [
  {
    id: 'HB-2024-00412', match: 96,
    title: 'Anterior STEMI, elevated troponin — 52M',
    desc: 'Primary PCI, LAD stenting. Troponin I 18.4. Discharged day 9 on DAPT.',
    hospital: 'Fortis Escorts, Delhi', date: 'Nov 2023', source: 'Internal',
    tags: ['STEMI', 'PCI', 'I21.0'],
    timeline: [
      { event: 'Admitted — chest pain, diaphoresis', time: 'Day 0 · Emergency' },
      { event: 'ECG: ST elevation V1–V4 · Troponin I 18.4', time: 'Day 0 · Labs' },
      { event: 'Primary PCI — LAD stenting', time: 'Day 0 · Intervention' },
      { event: 'Discharged on DAPT + statin', time: 'Day 9 · Discharge' }
    ]
  },
  {
    id: 'HB-2023-07891', match: 91,
    title: 'Anterior STEMI, diabetic comorbidity — 48M',
    desc: 'Thrombolysis + rescue PCI. HbA1c 9.1. Extended stay.',
    hospital: 'Kokilaben, Mumbai', date: 'Aug 2023', source: 'Internal',
    tags: ['STEMI', 'T2DM', 'I21.0'],
    timeline: [
      { event: 'Admitted — acute chest pain', time: 'Day 0' },
      { event: 'Thrombolysis initiated', time: 'Day 0' },
      { event: 'Rescue PCI', time: 'Day 1' },
      { event: 'Discharged', time: 'Day 13' }
    ]
  },
  {
    id: 'HB-2023-05321', match: 87,
    title: 'Hypothyroidism with cardiac complications — 45F',
    desc: 'TSH elevated at 12.4. Started levothyroxine. Cardiac monitoring done.',
    hospital: 'Apollo, Bangalore', date: 'Jun 2023', source: 'Internal',
    tags: ['Hypothyroidism', 'Cardiac', 'E03.9'],
    timeline: [
      { event: 'Admitted — fatigue, palpitations', time: 'Day 0' },
      { event: 'TSH: 12.4 · ECG: Bradycardia', time: 'Day 0 · Labs' },
      { event: 'Levothyroxine started', time: 'Day 1' },
      { event: 'Discharged with follow-up plan', time: 'Day 5' }
    ]
  }
];

export default function Cases() {
  const [search, setSearch]   = useState('');
  const [selected, setSelected] = useState(null);

  const filtered = mockCases.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  const detail = mockCases.find(c => c.id === selected);

  return (
    <div>
      {/* Search */}
      <div className="search-wrapper" style={{ marginBottom: 20 }}>
        <span className="search-icon">🔍</span>
        <input
          className="form-input search-input"
          placeholder="Search by symptoms, diagnosis, ICD code..."
          value={search}
          onChange={e => { setSearch(e.target.value); setSelected(null); }}
        />
      </div>

      {/* Filter chips */}
      <div className="filters">
        {['All', 'STEMI', 'Diabetes', 'Thyroid', 'Cardiology'].map((f, i) => (
          <div
            key={f}
            className={`filter-chip ${i === 0 ? 'active' : ''}`}
            onClick={() => setSearch(f === 'All' ? '' : f)}
          >
            {f}
          </div>
        ))}
      </div>

      {/* Count */}
      <div style={{ margin: '16px 0', fontSize: 13, color: 'var(--text-light)' }}>
        {filtered.length} similar case{filtered.length !== 1 ? 's' : ''} found
      </div>

      {/* Results */}
      <div className="results">
        {filtered.map(c => (
          <div
            className="result-item"
            key={c.id}
            onClick={() => setSelected(c.id)}
          >
            <div className="result-header">
              <div>
                <span className="result-id">{c.id}</span>
                <span
                  className={`pill pill-${c.match >= 90 ? 'success' : 'warning'}`}
                  style={{ marginLeft: 8 }}
                >
                  {c.match}% match
                </span>
              </div>
              <span className="pill pill-info">{c.source}</span>
            </div>
            <div className="result-title">{c.title}</div>
            <div className="result-desc">{c.desc}</div>
            <div className="result-meta">{c.hospital} · {c.date}</div>
            <div className="result-tags">
              {c.tags.map(t => <span className="tag" key={t}>{t}</span>)}
            </div>
          </div>
        ))}
      </div>

      {/* Case Detail Panel */}
      {detail && (
        <div className="case-detail">
          <div className="case-detail-header">
            <div>
              <div className="case-detail-title">{detail.title}</div>
              <div className="case-detail-subtitle">
                {detail.hospital} · {detail.date}
              </div>
            </div>
            <button className="close-btn" onClick={() => setSelected(null)}>×</button>
          </div>

          <div className="stats-grid">
            {[
              ['Similarity',      `${detail.match}%`],
              ['Outcome',         'Recovered'],
              ['Length of Stay',  '9 days'],
              ['Treatment',       'Primary PCI'],
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
                  {i < detail.timeline.length - 1 && (
                    <div className="timeline-line"></div>
                  )}
                </div>
                <div className="timeline-content">
                  <div className="timeline-event">{e.event}</div>
                  <div className="timeline-time">{e.time}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="btn-group">
            <button className="btn btn-secondary">Export</button>
          </div>
        </div>
      )}
    </div>
  );
}