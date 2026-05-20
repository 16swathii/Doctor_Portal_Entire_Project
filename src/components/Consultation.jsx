import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase';

const initialForm = {
  abhaId: '', patientName: '', visitDate: '',
  visitType: 'OPD consultation', referringDoctor: '',
  chiefComplaint: '', clinicalNotes: ''
};

export default function Consultation() {
  const { doctor } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const update = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
  };

  const submit = async () => {
    try {
      setUploading(true);
      const fileURLs = [];

      // Upload each file to Supabase Storage
      for (const file of files) {
        const filePath = `${doctor.id}/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('consultation-files')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('consultation-files')
          .getPublicUrl(filePath);

        fileURLs.push({
          name: file.name,
          url: urlData.publicUrl
        });
      }

      // Save consultation + file URLs to Firestore
      const { error } = await supabase.from('consultations').insert({
        doctor_id: doctor.id,
        doctor_name: doctor.name,
        abha_id: form.abhaId,
        patient_name: form.patientName,
        visit_date: form.visitDate,
        visit_type: form.visitType,
        referring_doctor: form.referringDoctor,
        chief_complaint: form.chiefComplaint,
        clinical_notes: form.clinicalNotes,
        files: fileURLs,
        created_at: new Date().toISOString()
      });

      if (error) throw error;

      alert('Consultation and files saved successfully!');
      setStep(1);
      setForm(initialForm);
      setFiles([]);
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const steps = ['Patient details', 'Clinical notes', 'Upload documents', 'Review & submit'];

  return (
    <div>
      <div className="steps-container">
        {steps.map((label, i) => {
          const num = i + 1;
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

      {step === 1 && (
        <div className="content-box">
          <h2 className="content-title">Patient consultation — step 1</h2>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Patient ID</label>
              <input className="form-input" placeholder="43-7821-5566-9021 or HB-PAT-XXXXX"
                value={form.abhaId} onChange={e => update('abhaId', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Patient name</label>
              <input className="form-input" placeholder="Auto-filled from Patient ID"
                value={form.patientName} onChange={e => update('patientName', e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Visit date</label>
              <input type="date" className="form-input"
                value={form.visitDate} onChange={e => update('visitDate', e.target.value)} />
            </div>
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
          </div>
          <div className="form-row">
            <div className="form-group full">
              <label className="form-label">Referring doctor (if any)</label>
              <input className="form-input" placeholder="Optional"
                value={form.referringDoctor} onChange={e => update('referringDoctor', e.target.value)} />
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
                ✓ {files.length} file(s) selected: {Array.from(files).map(f => f.name).join(', ')}
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

      {step === 4 && (
        <div className="content-box">
          <h2 className="content-title">Patient consultation — step 4</h2>
          <div className="review-panel">
            <div className="review-panel-title">Review consultation details</div>
            {[
              ['Patient ID', form.abhaId],
              ['Patient name', form.patientName],
              ['Visit date', form.visitDate],
              ['Visit type', form.visitType],
              ['Chief complaint', form.chiefComplaint],
              ['Files', files.length > 0 ? `${files.length} file(s) selected` : 'No files'],
            ].map(([label, val]) => (
              <div className="review-row" key={label}>
                <div className="review-label">{label}</div>
                <div className="review-value">{val || 'Not provided'}</div>
              </div>
            ))}
          </div>
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