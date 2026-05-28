import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

const VISIT_TYPES = ['OPD consultation', 'Follow-up', 'Emergency', 'Pre-op assessment'];
const SYMPTOMS    = ['Chest pain', 'Fever and cold', 'Thyroid', 'Back pain', 'Pre-surgical evaluation', 'Shortness of breath'];
const AGE_RANGES  = ['0–18', '19–35', '36–50', '51–65', '65+'];

export default function PatientSearch({ doctor }) {
  const [allPatients, setAllPatients] = useState([]);
  const [filtered, setFiltered]       = useState([]);
  const [expanded, setExpanded]       = useState(null);
  const [detailMap, setDetailMap]     = useState({});
  const [loading, setLoading]         = useState(true);

  const [search,    setSearch]    = useState('');
  const [visitType, setVisitType] = useState('');
  const [symptom,   setSymptom]   = useState('');
  const [ageRange,  setAgeRange]  = useState('');

  useEffect(() => { if (doctor?.id) fetchAll(); }, [doctor]);

  async function fetchAll() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .eq('doctor_id', doctor.id)
        .order('created_at', { ascending: false }); // latest created first

      if (error) throw error;

      // Group by abha_id — always keep the latest visit_date per patient
      const patientMap = new Map();
      (data || []).forEach(c => {
        const existing = patientMap.get(c.abha_id);
        if (!existing) {
          patientMap.set(c.abha_id, c);
        } else {
          // Compare dates as strings (works if format is YYYY-MM-DD)
          const newDate      = new Date(c.visit_date);
          const existingDate = new Date(existing.visit_date);
          if (newDate > existingDate) {
            patientMap.set(c.abha_id, c);
          }
        }
      });

      const unique = [...patientMap.values()];
      setAllPatients(unique);
      setFiltered(unique);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Re-filter on any change
  useEffect(() => {
    let result = [...allPatients];

    if (search.trim())
      result = result.filter(p =>
        p.patient_name?.toLowerCase().includes(search.toLowerCase())
      );

    if (visitType)
      result = result.filter(p => p.visit_type === visitType);

    if (symptom)
      result = result.filter(p =>
        p.chief_complaint?.toLowerCase().includes(symptom.toLowerCase())
      );

    if (ageRange) {
      const [min, max] = ageRange === '65+'
        ? [65, 999]
        : ageRange.split('–').map(Number);
      result = result.filter(p => {
        const age = parseInt(p.age || '0');
        return age >= min && age <= max;
      });
    }

    setFiltered(result);
    setExpanded(null);
  }, [search, visitType, symptom, ageRange, allPatients]);

  // Toggle expand — fetch all consultations for this patient
  async function togglePatient(abhaId) {
    if (expanded === abhaId) { setExpanded(null); return; }
    setExpanded(abhaId);
    if (detailMap[abhaId]) return; // already cached

    const { data } = await supabase
      .from('consultations')
      .select('*')
      .eq('doctor_id', doctor.id)
      .eq('abha_id', abhaId)
      .order('visit_date', { ascending: false });

    setDetailMap(prev => ({ ...prev, [abhaId]: data || [] }));
  }

  const activeFilters = [
    visitType && { key: 'visitType', label: visitType },
    symptom   && { key: 'symptom',   label: symptom },
    ageRange  && { key: 'ageRange',  label: `Age: ${ageRange}` },
  ].filter(Boolean);

  function removeFilter(key) {
    if (key === 'visitType') setVisitType('');
    if (key === 'symptom')   setSymptom('');
    if (key === 'ageRange')  setAgeRange('');
  }

  function resetAll() {
    setSearch(''); setVisitType(''); setSymptom(''); setAgeRange('');
  }

  return (
    <div>
      <h2 className="content-title" style={{ marginBottom: 20 }}>My Patients</h2>

      {/* Search Bar — full width */}
      <div className="search-wrapper" style={{ marginBottom: 12, width: '100%' }}>
        <span className="search-icon">🔍</span>
        <input
          className="form-input search-input"
          placeholder="Search by patient name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', maxWidth: '100%' }}
        />
      </div>

      {/* Filter Buttons — small, side by side */}
      <div style={{ display: 'flex', flexDirection: 'row', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <select className="filter-btn" value={visitType} onChange={e => setVisitType(e.target.value)}>
          <option value="">Visit Type ▾</option>
          {VISIT_TYPES.map(v => <option key={v}>{v}</option>)}
        </select>
        <select className="filter-btn" value={symptom} onChange={e => setSymptom(e.target.value)}>
          <option value="">Symptom ▾</option>
          {SYMPTOMS.map(s => <option key={s}>{s}</option>)}
        </select>
        <select className="filter-btn" value={ageRange} onChange={e => setAgeRange(e.target.value)}>
          <option value="">Age Range ▾</option>
          {AGE_RANGES.map(a => <option key={a}>{a}</option>)}
        </select>
        {(visitType || symptom || ageRange || search) && (
          <button className="filter-btn reset-btn" onClick={resetAll}>✕ Reset</button>
        )}
      </div>

      {/* Active Filter Chips */}
      {activeFilters.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
          {activeFilters.map(f => (
            <div key={f.key} className="active-chip">
              {f.label}
              <span onClick={() => removeFilter(f.key)} style={{ cursor: 'pointer', marginLeft: 6 }}>✕</span>
            </div>
          ))}
        </div>
      )}

      {/* Count */}
      <div style={{ marginBottom: 12, fontSize: 13, color: 'var(--text-light)' }}>
        {loading
          ? 'Loading patients...'
          : `Showing ${filtered.length} of ${allPatients.length} patient${allPatients.length !== 1 ? 's' : ''}`
        }
      </div>

      {/* Patient List */}
      {!loading && filtered.length === 0 ? (
        <div className="empty-state">No patients match the selected filters.</div>
      ) : (
        <div className="results">
          {filtered.map(p => {
            const isOpen       = expanded === p.abha_id;
            const consultations = detailMap[p.abha_id] || [];

            return (
              <div key={p.abha_id}>

                {/* Patient Row */}
                <div
                  className={`result-item ${isOpen ? 'result-item-open' : ''}`}
                  onClick={() => togglePatient(p.abha_id)}
                >
                  <div className="result-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div className="patient-avatar">
                        {p.patient_name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="result-title">{p.patient_name}</div>
                        <div className="result-id">
                          ABHA: {p.abha_id} · Age: {p.age ? p.age : 'N/A'}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span className="pill pill-info">{p.visit_type}</span>
                      <span style={{ fontSize: 18, color: 'var(--text-lighter)', fontWeight: 600 }}>
                        {isOpen ? '▲' : '▼'}
                      </span>
                    </div>
                  </div>

                  <div className="result-desc">Complaint: {p.chief_complaint}</div>

                  {/* Last visit date + submitted time */}
                  <div className="result-meta">
                    Last visit: <strong>{p.visit_date}</strong>
                    {p.created_at && (
                      <span style={{ marginLeft: 8, color: 'var(--text-lighter)' }}>
                        · Submitted: {new Date(p.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </span>
                    )}
                    {' · '}
                    {p.files?.length > 0
                      ? `📎 ${p.files.length} file(s)`
                      : 'No files'}
                  </div>
                </div>

                {/* Expanded Detail */}
                {isOpen && (
                  <div className="patient-detail-expand">

                    {/* Stats */}
                    <div className="expand-stats">
                      <div className="expand-stat">
                        <div className="stat-label">Total Visits</div>
                        <div className="expand-stat-value">{consultations.length}</div>
                      </div>
                      <div className="expand-stat">
                        <div className="stat-label">Age</div>
                        <div className="expand-stat-value">{p.age || 'N/A'}</div>
                      </div>
                      <div className="expand-stat">
                        <div className="stat-label">Last Visit</div>
                        <div className="expand-stat-value">{consultations[0]?.visit_date || p.visit_date}</div>
                      </div>
                      <div className="expand-stat">
                        <div className="stat-label">Total Files</div>
                        <div className="expand-stat-value">
                          {consultations.reduce((sum, c) => sum + (c.files?.length || 0), 0)}
                        </div>
                      </div>
                    </div>

                    {/* Consultation Timeline */}
                    <div className="section-title" style={{ marginBottom: 14 }}>
                      Consultation History
                    </div>

                    {consultations.length === 0 ? (
                      <div className="loading">Loading history...</div>
                    ) : (
                      <div className="timeline">
                        {consultations.map((c, i) => (
                          <div className="timeline-item" key={c.id}>
                            <div className="timeline-left">
                              <div className="timeline-dot"></div>
                              {i < consultations.length - 1 && <div className="timeline-line"></div>}
                            </div>
                            <div className="timeline-content">

                              {/* Visit header */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                <div className="timeline-event">{c.visit_date}</div>
                                <span className="pill pill-info">{c.visit_type}</span>
                                {i === 0 && (
                                  <span className="pill pill-success">Latest</span>
                                )}
                              </div>

                              {/* Chief complaint */}
                              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
                                {c.chief_complaint}
                              </div>

                              {/* Clinical notes */}
                              <div className="timeline-time" style={{ marginBottom: 8 }}>
                                {c.clinical_notes}
                              </div>

                              {/* Referring doctor */}
                              {c.referring_doctor && (
                                <div style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 8 }}>
                                  Referred by: {c.referring_doctor}
                                </div>
                              )}

                              {/* Files */}
                              {c.files?.length > 0 ? (
                                <div>
                                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-light)', textTransform: 'uppercase', marginBottom: 6 }}>
                                    Attached Files
                                  </div>
                                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    {c.files.map((f, fi) => (
                                      <a
                                        key={fi}
                                        href={f.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="file-chip"
                                        onClick={e => e.stopPropagation()}
                                      >
                                        📎 {f.name}
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <div style={{ fontSize: 12, color: 'var(--text-lighter)' }}>
                                  No files attached
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}