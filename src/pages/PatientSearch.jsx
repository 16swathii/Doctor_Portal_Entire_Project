import { useState } from 'react';
import { supabase } from '../supabase';

export default function PatientSearch() {
  const [search, setSearch] = useState('');
  const [consultations, setConsultations] = useState([]);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!search.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const { data, error } = await supabase
        .from('consultations')
        .select('*, doctors(name, email, specialisation, hospital)')
        .ilike('abha_id', `%${search}%`)
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (data && data.length > 0) {
        setPatient({
          name: data[0].patient_name,
          id: data[0].abha_id,
        });
        setConsultations(data);
      } else {
        setPatient(null);
        setConsultations([]);
      }
    } catch (err) {
      console.log('Error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (name) => {
    if (!name) return '📄';
    if (name.match(/\.(jpg|jpeg|png|gif|webp)$/i)) return '🖼️';
    if (name.match(/\.pdf$/i)) return '📕';
    if (name.match(/\.(doc|docx)$/i)) return '📝';
    if (name.match(/\.(xls|xlsx|csv)$/i)) return '📊';
    return '📄';
  };

  const isImage = (name) => name?.match(/\.(jpg|jpeg|png|gif|webp)$/i);

  return (
    <div>
      {/* Search bar */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 4 }}>
          Patient Record Search
        </div>
        <div style={{ fontSize: 13, color: '#737373', marginBottom: 16 }}>
          Enter patient ID to view all consultation records and uploaded files
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            className="form-input"
            style={{ maxWidth: 400 }}
            placeholder="Enter Patient ID e.g. 43-7821-5566-9021"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
          <button className="btn btn-primary" onClick={handleSearch}>
            Search
          </button>
        </div>
      </div>

      {loading && (
        <div style={{ color: '#737373', padding: 20 }}>Searching...</div>
      )}

      {!loading && searched && !patient && (
        <div style={{ color: '#737373', padding: 20, textAlign: 'center' }}>
          No patient found with that ID.
        </div>
      )}

      {!loading && patient && (
        <>
          {/* Patient info header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'white',
            border: '1px solid #e7e5e4',
            borderRadius: 8,
            padding: 20,
            marginBottom: 20,
          }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{patient.name}</div>
              <div style={{ fontSize: 12, color: '#737373', marginTop: 2 }}>
                Patient ID: {patient.id}
              </div>
              <div style={{ fontSize: 12, color: '#737373' }}>
                {consultations.length} consultation{consultations.length !== 1 ? 's' : ''} on record
              </div>
            </div>
            <span className="pill pill-success" style={{ fontSize: 13, padding: '6px 14px' }}>
              Active
            </span>
          </div>

          {/* Consultations */}
          {consultations.map((c, i) => (
            <div key={c.id} style={{
              background: 'white',
              border: '1px solid #e7e5e4',
              borderRadius: 8,
              padding: 24,
              marginBottom: 16,
            }}>
              {/* Consultation header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'start',
                marginBottom: 16,
                paddingBottom: 16,
                borderBottom: '1px solid #e7e5e4'
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>
                    Consultation #{consultations.length - i}
                  </div>
                  <div style={{ fontSize: 12, color: '#737373', marginTop: 2 }}>
                    {c.visit_date} • {c.doctor_name}
                    {c.doctors?.specialisation ? ` — ${c.doctors.specialisation}` : ''}
                  </div>
                </div>
                <span className="pill pill-info">{c.visit_type}</span>
              </div>

              {/* Details grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 12,
                marginBottom: 16
              }}>
                {[
                  ['Chief Complaint', c.chief_complaint],
                  ['Referring Doctor', c.referring_doctor || 'None'],
                  ['Doctor', c.doctor_name],
                  ['Hospital', c.doctors?.hospital || 'N/A'],
                ].map(([label, val]) => (
                  <div key={label} style={{
                    background: '#fafaf9',
                    padding: 12,
                    borderRadius: 6,
                    border: '1px solid #e7e5e4'
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#737373', textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: 4 }}>
                      {label}
                    </div>
                    <div style={{ fontSize: 13, color: '#171717' }}>{val || 'N/A'}</div>
                  </div>
                ))}
              </div>

              {/* Clinical notes */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#737373', textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: 8 }}>
                  Clinical Notes
                </div>
                <div style={{
                  background: '#fafaf9',
                  border: '1px solid #e7e5e4',
                  borderRadius: 6,
                  padding: 14,
                  fontSize: 13,
                  color: '#171717',
                  lineHeight: 1.7
                }}>
                  {c.clinical_notes || 'No notes provided'}
                </div>
              </div>

              {/* Files & Images */}
              {c.files && c.files.length > 0 && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#737373', textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: 10 }}>
                    Uploaded Reports & Files ({c.files.length})
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {c.files.map((file, fi) => (
                      <div key={fi}>
                        {isImage(file.name) ? (
                          // Show image preview
                          <a href={file.url} target="_blank" rel="noreferrer">
                            <div style={{
                              border: '1px solid #e7e5e4',
                              borderRadius: 8,
                              overflow: 'hidden',
                              width: 120,
                              cursor: 'pointer'
                            }}>
                              <img
                                src={file.url}
                                alt={file.name}
                                style={{ width: '100%', height: 90, objectFit: 'cover' }}
                              />
                              <div style={{
                                padding: '6px 8px',
                                fontSize: 11,
                                color: '#737373',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}>
                                {file.name}
                              </div>
                            </div>
                          </a>
                        ) : (
                          // Show file download link
                          <a href={file.url} target="_blank" rel="noreferrer"
                            style={{ textDecoration: 'none' }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              padding: '10px 14px',
                              background: '#f0fdf4',
                              border: '1px solid #bbf7d0',
                              borderRadius: 8,
                              cursor: 'pointer',
                              transition: 'background 0.15s'
                            }}>
                              <span style={{ fontSize: 20 }}>{getFileIcon(file.name)}</span>
                              <div>
                                <div style={{ fontSize: 12, fontWeight: 600, color: '#171717' }}>
                                  {file.name}
                                </div>
                                <div style={{ fontSize: 11, color: '#16a34a' }}>
                                  Click to view
                                </div>
                              </div>
                            </div>
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(!c.files || c.files.length === 0) && (
                <div style={{ fontSize: 12, color: '#a3a3a3' }}>
                  No files uploaded for this consultation
                </div>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
}