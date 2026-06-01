import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase';

const initialForm = {
  abhaId: '', patientName: '', age: '',
  visitDate: '', visitType: 'OPD consultation',
  referringDoctorId: '', referringDoctorName: '',
  chiefComplaint: '', clinicalNotes: ''
};

export default function Consultation() {
  const { doctor } = useAuth();
  const [step, setStep]         = useState(1);
  const [form, setForm]         = useState(initialForm);
  const [files, setFiles]       = useState([]);
  const [uploading, setUploading] = useState(false);

  // Doctor search for referring doctor
  const [doctorSearch, setDoctorSearch]   = useState('');
  const [doctorResults, setDoctorResults] = useState([]);
  const [searching, setSearching]         = useState(false);

  const update = (field, val) => setForm(f => ({ ...f, [field]: val }));

  // Search doctors by name
  useEffect(() => {
    if (doctorSearch.length < 2) { setDoctorResults([]); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      const { data } = await supabase
        .from('doctors')
        .select('id, name, email, specialisation, hospital')
        .ilike('name', `%${doctorSearch}%`)
        .neq('id', doctor.id) // exclude self
        .limit(5);
      setDoctorResults(data || []);
      setSearching(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [doctorSearch]);

  function selectReferringDoctor(d) {
    setForm(f => ({
      ...f,
      referringDoctorId:   d.id,
      referringDoctorName: d.name,
    }));
    setDoctorSearch(d.name);
    setDoctorResults([]);
  }

  function clearReferring() {
    setForm(f => ({ ...f, referringDoctorId: '', referringDoctorName: '' }));
    setDoctorSearch('');
    setDoctorResults([]);
  }

  const handleFileChange = (e) => setFiles([...e.target.files]);

  const submit = async () => {
    try {
      setUploading(true);
      const fileURLs = [];

      for (const file of files) {
        const filePath = `${doctor.id}/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('consultation-files')
          .upload(filePath, file);
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('consultation-files')
          .getPublicUrl(filePath);
        fileURLs.push({ name: file.name, url: urlData.publicUrl });
      }

      // Save consultation
      const { error } = await supabase.from('consultations').insert({
        doctor_id:              doctor.id,
        doctor_name:            doctor.name,
        abha_id:                form.abhaId,
        patient_name:           form.patientName,
        age:                    form.age,
        visit_date:             form.visitDate,
        visit_type:             form.visitType,
        referring_doctor:       form.referringDoctorName,
        referred_to_doctor_id:  form.referringDoctorId || null,
        chief_complaint:        form.chiefComplaint,
        clinical_notes:         form.clinicalNotes,
        files:                  fileURLs,
        created_at:             new Date().toISOString()
      });
      if (error) throw error;

      // Send notification to referred doctor if selected
      if (form.referringDoctorId) {
        await supabase.from('notifications').insert({
          doctor_id: form.referringDoctorId,
          title:     '📋 New Patient Referral',
          message:   `Dr. ${doctor.name} has referred patient ${form.patientName} to you. Chief complaint: ${form.chiefComplaint}.`,
          is_read:   false,
        });
      }

      alert('Consultation saved successfully!');
      setStep(1);
      setForm(initialForm);
      setFiles([]);
      setDoctorSearch('');
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const steps = ['Patient details', 'Clinical notes', 'Upload documents', 'Review & submit'];

  return (
    <div>
      {/* Step indicators */}
      <div className="steps-container">
        {steps.map((label, i) => {
          const num   = i + 1;
          const state = num < step ? 'completed' : num === step ? 'active' : 'pending';
          return (
            <div key={num} style={{ display: 'flex', alignItems: 'center' }}>
              <div className={`step ${state}`}>
                <div className="step-circle">{num}</div>
                <span>{label}</span>
              </div>
              {i < steps.length - 1 && <div className="step-line"></div>}
            </div>
          );
        })}
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div className="content-box">
          <h2 className="content-title">Patient consultation — step 1</h2>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Patient ID (ABHA)</label>
              <input className="form-input" placeholder="43-7821-5566-9021"
                value={form.abhaId} onChange={e => update('abhaId', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Patient name</label>
              <input className="form-input" placeholder="Full name"
                value={form.patientName} onChange={e => update('patientName', e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Age</label>
              <input className="form-input" placeholder="e.g. 45" type="number"
                value={form.age} onChange={e => update('age', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Visit date</label>
              <input type="date" className="form-input"
                value={form.visitDate} onChange={e => update('visitDate', e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Visit type</label>
              <select className="form-select" value={form.visitType}
                onChange={e => update('visitType', e.target.value)}>
                <option>OPD consultation</option>
                <option>Follow-up</option>
                <option>Emergency</option>
                <option>Pre-op assessment</option>
              </select>
            </div>

            {/* Referring Doctor — searchable */}
            <div className="form-group" style={{ position: 'relative' }}>
              <label className="form-label">
                Referring doctor (optional)
                {form.referringDoctorId && (
                  <span
                    onClick={clearReferring}
                    style={{ marginLeft: 8, color: '#dc2626', cursor: 'pointer', fontSize: 11 }}
                  >✕ Clear</span>
                )}
              </label>
              <input
                className="form-input"
                placeholder="Search doctor by name..."
                value={doctorSearch}
                onChange={e => {
                  setDoctorSearch(e.target.value);
                  if (!e.target.value) clearReferring();
                }}
                disabled={!!form.referringDoctorId}
              />
              {/* Search results dropdown */}
              {doctorResults.length > 0 && (
                <div className="doctor-dropdown">
                  {searching && (
                    <div className="doctor-dropdown-item" style={{ color: 'var(--text-lighter)' }}>
                      Searching...
                    </div>
                  )}
                  {doctorResults.map(d => (
                    <div
                      key={d.id}
                      className="doctor-dropdown-item"
                      onClick={() => selectReferringDoctor(d)}
                    >
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{d.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-light)' }}>
                        {d.specialisation} · {d.hospital}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {/* Selected doctor badge */}
              {form.referringDoctorId && (
                <div className="referring-badge">
                  ✅ {form.referringDoctorName} will be notified
                </div>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full">
              <label className="form-label">Chief complaint</label>
              <input className="form-input" placeholder="e.g. Chest pain, shortness of breath"
                value={form.chiefComplaint} onChange={e => update('chiefComplaint', e.target.value)} />
            </div>
          </div>
          <div className="btn-group">
            <button className="btn btn-primary" onClick={() => setStep(2)}>Next →</button>
          </div>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="content-box">
          <h2 className="content-title">Patient consultation — step 2</h2>
          <div className="form-group">
            <label className="form-label">Clinical notes</label>
            <textarea className="form-textarea"
              placeholder="Enter detailed clinical notes, examination findings, diagnosis, and treatment plan..."
              value={form.clinicalNotes} onChange={e => update('clinicalNotes', e.target.value)} />
          </div>
          <div className="btn-group">
            <button className="btn btn-primary" onClick={() => setStep(3)}>Next →</button>
            <button className="btn btn-secondary" onClick={() => setStep(1)}>← Back</button>
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div className="content-box">
          <h2 className="content-title">Patient consultation — step 3</h2>
          <div className="upload-area"
            onClick={() => document.getElementById('fileInput').click()}>
            <div className="upload-icon">📄</div>
            <div className="upload-text">Click to upload or drag files here</div>
            <div className="upload-hint">Prescriptions, lab reports, imaging (PDF, JPG, PNG, DICOM)</div>
            {files.length > 0 && (
              <div style={{ marginTop: 12, fontSize: 13, color: '#14b8a6' }}>
                ✅ {files.length} file(s): {Array.from(files).map(f => f.name).join(', ')}
              </div>
            )}
          </div>
          <input id="fileInput" type="file" multiple
            accept=".pdf,.jpg,.jpeg,.png,.dcm"
            style={{ display: 'none' }}
            onChange={handleFileChange} />
          <div className="btn-group">
            <button className="btn btn-primary" onClick={() => setStep(4)}>Next →</button>
            <button className="btn btn-secondary" onClick={() => setStep(2)}>← Back</button>
          </div>
        </div>
      )}

      {/* Step 4 */}
      {step === 4 && (
        <div className="content-box">
          <h2 className="content-title">Patient consultation — step 4</h2>
          <div className="review-panel">
            <div className="review-panel-title">Review consultation details</div>
            {[
              ['Patient ID',        form.abhaId],
              ['Patient name',      form.patientName],
              ['Age',               form.age],
              ['Visit date',        form.visitDate],
              ['Visit type',        form.visitType],
              ['Referring doctor',  form.referringDoctorName || 'None'],
              ['Chief complaint',   form.chiefComplaint],
              ['Files',             files.length > 0 ? `${files.length} file(s)` : 'No files'],
            ].map(([label, val]) => (
              <div className="review-row" key={label}>
                <div className="review-label">{label}</div>
                <div className="review-value">{val || 'Not provided'}</div>
              </div>
            ))}
          </div>
          {form.referringDoctorId && (
            <div className="info-box">
              🔔 A notification will be sent to <strong>{form.referringDoctorName}</strong> about this referral.
            </div>
          )}
          <div className="info-box">
            ℹ️ Files will be uploaded securely to cloud storage.
          </div>
          <div className="btn-group">
            <button className="btn btn-primary" onClick={submit} disabled={uploading}>
              {uploading ? 'Uploading & saving...' : 'Submit consultation'}
            </button>
            <button className="btn btn-secondary" onClick={() => setStep(3)}>← Back</button>
          </div>
        </div>
      )}
    </div>
  );
}