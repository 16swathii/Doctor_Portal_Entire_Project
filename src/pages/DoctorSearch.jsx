import { useState } from 'react';
import { supabase } from '../supabase';

export default function DoctorSearch() {
  const [search, setSearch] = useState('');
  const [doctor, setDoctor] = useState(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!search.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const { data, error } = await supabase
        .from('doctor_patient_summary')
        .select('*')
        .ilike('doctor_name', `%${search}%`);
      if (error) throw error;
      if (data && data.length > 0) {
        setDoctor({
          name: data[0].doctor_name,
          email: data[0].doctor_email,
          specialisation: data[0].specialisation,
          hospital: data[0].hospital,
          license_no: data[0].license_no,
        });
        setPatients(data.filter(d => d.patient_name));
      } else {
        setDoctor(null);
        setPatients([]);
      }
    } catch (err) {
      console.log('Error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Search bar */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 16 }}>
          Doctor Patient Search
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            className="form-input"
            style={{ maxWidth: 400 }}
            placeholder="Enter doctor name..."
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

      {!loading && searched && !doctor && (
        <div style={{ color: '#737373', padding: 20 }}>
          No doctor found with that name.
        </div>
      )}

      {!loading && doctor && (
        <>
          {/* Doctor info at top right */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'start',
            marginBottom: 24,
            background: 'white',
            border: '1px solid #e7e5e4',
            borderRadius: 8,
            padding: 20,
          }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
                Patient Records
              </div>
              <div style={{ fontSize: 13, color: '#737373' }}>
                {patients.length} consultation{patients.length !== 1 ? 's' : ''} found
              </div>
            </div>
            {/* Doctor card at top right */}
            <div style={{
              background: '#fef3c7',
              border: '1px solid #fde68a',
              borderRadius: 8,
              padding: '12px 20px',
              textAlign: 'right',
              minWidth: 220,
            }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#78350f' }}>
                {doctor.name}
              </div>
              <div style={{ fontSize: 12, color: '#92400e', marginTop: 2 }}>
                {doctor.specialisation}
              </div>
              <div style={{ fontSize: 12, color: '#92400e' }}>
                {doctor.hospital}
              </div>
              <div style={{ fontSize: 11, color: '#a16207', marginTop: 4 }}>
                Licence: {doctor.license_no}
              </div>
              <div style={{ fontSize: 11, color: '#a16207' }}>
                {doctor.email}
              </div>
            </div>
          </div>

          {/* Patients table */}
          {patients.length === 0 ? (
            <div style={{ color: '#737373', padding: 20 }}>
              No patient records found for this doctor.
            </div>
          ) : (
            <div style={{
              background: 'white',
              border: '1px solid #e7e5e4',
              borderRadius: 8,
              overflow: 'hidden',
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#fafaf9', borderBottom: '1px solid #e7e5e4' }}>
                    {['#', 'Patient ID', 'Patient Name', 'Visit Date', 'Visit Type', 'Chief Complaint', 'Clinical Notes'].map(h => (
                      <th key={h} style={{
                        padding: '12px 16px',
                        fontSize: 12,
                        fontWeight: 600,
                        color: '#737373',
                        textAlign: 'left',
                        textTransform: 'uppercase',
                        letterSpacing: '0.3px',
                        whiteSpace: 'nowrap',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {patients.map((p, i) => (
                    <tr key={i} style={{
                      borderBottom: '1px solid #e7e5e4',
                      transition: 'background 0.15s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fafaf9'}
                      onMouseLeave={e => e.currentTarget.style.background = 'white'}
                    >
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#a3a3a3' }}>{i + 1}</td>
                      <td style={{ padding: '12px 16px', fontSize: 12, color: '#a3a3a3', fontFamily: 'monospace' }}>
                        {p.patient_id || 'N/A'}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#171717' }}>
                        {p.patient_name}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#737373' }}>
                        {p.visit_date || 'N/A'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          fontSize: 11, fontWeight: 500,
                          padding: '3px 8px', borderRadius: 12,
                          background: '#dbeafe', color: '#1e40af'
                        }}>
                          {p.visit_type}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#737373', maxWidth: 200 }}>
                        {p.chief_complaint || 'N/A'}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#737373', maxWidth: 250 }}>
                        <div style={{
                          whiteSpace: 'nowrap', overflow: 'hidden',
                          textOverflow: 'ellipsis', maxWidth: 200
                        }}>
                          {p.clinical_notes || 'N/A'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}