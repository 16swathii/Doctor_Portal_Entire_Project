import { useEffect, useState } from 'react';
import { supabase } from '../supabase';

export default function Dashboard({ doctor }) {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading]             = useState(true);

  useEffect(() => {
    if (doctor?.id) fetchDashboard();
  }, [doctor]);

  async function fetchDashboard() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .eq('doctor_id', doctor.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConsultations(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Get unique patients from consultations by abha_id
  const uniquePatients = [
    ...new Map(consultations.map(c => [c.abha_id, c])).values()
  ];

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="dashboard">

      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div>
          <h2 className="welcome-title">
            Good {getGreeting()}, {doctor?.name || 'Doctor'} 👋
          </h2>
          <p className="welcome-sub">
            {doctor?.specialisation} · {doctor?.hospital}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-value">{uniquePatients.length}</div>
          <div className="stat-label">Unique Patients</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-value">{consultations.length}</div>
          <div className="stat-label">Total Consultations</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-value">
            {new Date().toLocaleDateString('en-IN', {
              day: 'numeric', month: 'short'
            })}
          </div>
          <div className="stat-label">Today</div>
        </div>
      </div>

      <div className="dashboard-body">

        {/* Patients who visited */}
        <div className="dash-section">
          <div className="dash-section-title">
            Patients Who Visited ({uniquePatients.length})
          </div>
          {uniquePatients.length === 0 ? (
            <div className="empty-state">No patients yet.</div>
          ) : (
            <div className="patient-list">
              {uniquePatients.map(p => (
                <div className="patient-card" key={p.abha_id}>
                  <div className="patient-avatar">
                    {p.patient_name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="patient-info">
                    <div className="patient-name">{p.patient_name}</div>
                    <div className="patient-meta">
                      ABHA: {p.abha_id}
                    </div>
                    <div className="patient-meta">
                      Last visit: {p.visit_date} · {p.visit_type}
                    </div>
                  </div>
                  <span className="pill pill-success">Active</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Consultations */}
        <div className="dash-section">
          <div className="dash-section-title">
            Recent Consultations ({consultations.length})
          </div>
          {consultations.length === 0 ? (
            <div className="empty-state">No consultations yet.</div>
          ) : (
            <div className="consult-list">
              {consultations.slice(0, 5).map(c => (
                <div className="consult-card" key={c.id}>
                  <div className="consult-header">
                    <div className="consult-name">{c.patient_name}</div>
                    <span className="pill pill-info">{c.visit_type}</span>
                  </div>
                  <div className="consult-complaint">{c.chief_complaint}</div>
                  <div className="consult-date">
                    {c.visit_date} · {
                      (c.files?.length > 0)
                        ? `${c.files.length} file(s) attached`
                        : 'No files'
                    }
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}