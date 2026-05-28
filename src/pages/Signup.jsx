import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ALLOWED_DOMAINS = [
  'gmail.com', 'yahoo.com', 'outlook.com',
  'hotmail.com', 'icloud.com', 'rediffmail.com',
];

function isAllowedEmail(email) {
  const domain = email.split('@')[1]?.toLowerCase();
  return ALLOWED_DOMAINS.includes(domain);
}

export default function Signup() {
  const { signup }  = useAuth();
  const navigate    = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    specialisation: '', licenseNo: '', hospital: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState(false);

  const update = (field, val) => setForm(f => ({ ...f, [field]: val }));

  async function handleSignup() {
    setError('');

    if (!form.name || !form.email || !form.password ||
        !form.specialisation || !form.licenseNo || !form.hospital) {
      setError('Please fill in all fields.');
      return;
    }

    if (!isAllowedEmail(form.email)) {
      setError(`Allowed domains: ${ALLOWED_DOMAINS.join(', ')}`);
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await signup(form);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // ── Success screen ───────────────────────
  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-box">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>
            <h2 className="auth-title">Check your email!</h2>
            <p style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 24, lineHeight: 1.6 }}>
              We sent a confirmation link to <strong>{form.email}</strong>.<br />
              Click the link to activate your account.<br /><br />
              Check your spam folder if you don't see it.
            </p>
            <button className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => navigate('/login')}>
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-box">
        <div className="auth-logo">
          <div className="logo-icon"></div>
          Doctor Portal
        </div>
        <h2 className="auth-title">Create your account</h2>
        <p className="auth-sub">Fill in your details to register</p>

        {error && <div className="auth-error">{error}</div>}

        <div className="form-group" style={{ marginBottom: 14 }}>
          <label className="form-label">Full Name</label>
          <input className="form-input" placeholder="Dr. Firstname Lastname"
            value={form.name} onChange={e => update('name', e.target.value)} />
        </div>

        <div className="form-group" style={{ marginBottom: 14 }}>
          <label className="form-label">Email</label>
          <input className="form-input" type="email" placeholder="doctor@gmail.com"
            value={form.email} onChange={e => update('email', e.target.value)} />
        </div>

        <div className="form-group" style={{ marginBottom: 14 }}>
          <label className="form-label">Password</label>
          <input className="form-input" type="password" placeholder="Min 6 characters"
            value={form.password} onChange={e => update('password', e.target.value)} />
        </div>

        <div className="form-group" style={{ marginBottom: 14 }}>
          <label className="form-label">Specialisation</label>
          <select className="form-select"
            value={form.specialisation} onChange={e => update('specialisation', e.target.value)}>
            <option value="">Select specialisation</option>
            <option>Cardiology</option>
            <option>Neurology</option>
            <option>Orthopedics</option>
            <option>Pediatrics</option>
            <option>Dermatology</option>
            <option>General Medicine</option>
            <option>Gynecology</option>
            <option>Psychiatry</option>
            <option>Oncology</option>
            <option>ENT</option>
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: 14 }}>
          <label className="form-label">Medical License No.</label>
          <input className="form-input" placeholder="e.g. MCI-123456"
            value={form.licenseNo} onChange={e => update('licenseNo', e.target.value)} />
        </div>

        <div className="form-group" style={{ marginBottom: 20 }}>
          <label className="form-label">Hospital / Clinic</label>
          <input className="form-input" placeholder="e.g. Apollo Hospitals, Bangalore"
            value={form.hospital} onChange={e => update('hospital', e.target.value)} />
        </div>

        <button
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center', marginBottom: 14 }}
          onClick={handleSignup}
          disabled={loading}
        >
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>

        <p className="auth-switch">
          Already have an account?{' '}
          <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}