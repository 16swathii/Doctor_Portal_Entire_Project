import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase';

export default function MyPatients() {
  const { doctor } = useAuth();
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fetchConsultations = async () => {
      try {
        const { data, error } = await supabase
          .from('consultations')
          .select('*')
          .eq('doctor_id', doctor.id)
          .order('created_at', { ascending: false });
        if (error) throw error;
        setConsultations(data || []);
      } catch (err) {
        console.log('Error:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchConsultations();
  }, [doctor]);

  const filtered = consultations.filter(c =>
    c.patient_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.abha_id?.toLowerCase().includes(search.toLowerCase()) ||
    c.chief_complaint?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 4 }}>My Patients</div>
        <div style={{ fontSize: 13, color: '#737373' }}>
          Consultations submitted by {doctor?.name}
        </div>
      </div>

      <div className="search-wrapper">
        <span className="search-icon">🔍</span>
        <input
          className="form-input search-input"
          placeholder="Search by patient name, ID, or complaint..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div style={{ padding: 40, color: '#737373' }}>Loading patients...</div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: 40, color: '#737373', textAlign: 'center' }}>
          No consultations found.
        </div>
      ) : (
        <div className="results">
          {filtered.map(c => (
            <div
              className="result-item"
              key={c.id}
              onClick={() => setSelected(selected?.id === c.id ? null : c)}
            >
              <div className="result-header">
                <div>
                  <div className="result-title">{c.patient_name || 'Unknown'}</div>
                  <div className="result-id">Patient ID: {c.abha_id || 'N/A'}</div>
                </div>
                <span className="pill pill-info">{c.visit_type}</span>
              </div>
              <div className="result-desc">
                Chief complaint: {c.chief_complaint || 'N/A'}
              </div>
              <div className="result-meta">
                Visit date: {c.visit_date || 'N/A'} •
                {c.referring_doctor ? ` Referred by: ${c.referring_doctor}` : ' No referral'}
              </div>

              {selected?.id === c.id && (
                <div style={{
                  marginTop: 16, padding: 16,
                  background: '#f8fafc', borderRadius: 6,
                  border: '1px solid #e7e5e4'
                }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>
                    Full consultation details
                  </div>
                  {[
                    ['Patient name', c.patient_name],
                    ['Patient ID', c.abha_id],
                    ['Visit date', c.visit_date],
                    ['Visit type', c.visit_type],
                    ['Chief complaint', c.chief_complaint],
                    ['Referring doctor', c.referring_doctor || 'None'],
                    ['Submitted by', c.doctor_name],
                  ].map(([label, val]) => (
                    <div className="review-row" key={label}>
                      <div className="review-label">{label}</div>
                      <div className="review-value">{val || 'N/A'}</div>
                    </div>
                  ))}
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#737373', marginBottom: 6 }}>
                      CLINICAL NOTES
                    </div>
                    <div style={{
                      fontSize: 13, color: '#171717',
                      background: 'white', padding: 12,
                      borderRadius: 6, border: '1px solid #e7e5e4',
                      lineHeight: 1.6
                    }}>
                      {c.clinical_notes || 'No notes provided'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}