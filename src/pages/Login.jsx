import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabase';

const ALLOWED_DOMAINS = [
  'gmail.com', 'yahoo.com', 'outlook.com',
  'hotmail.com', 'icloud.com', 'rediffmail.com',
];

function isAllowedEmail(email) {
  const domain = email.split('@')[1]?.toLowerCase();
  return ALLOWED_DOMAINS.includes(domain);
}

export default function Login() {
  const navigate                = useNavigate();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  async function handleLogin() {
    setError('');

    if (!email || !password) { setError('Please enter email and password.'); return; }
    if (!isAllowedEmail(email)) { setError(`Allowed domains: ${ALLOWED_DOMAINS.join(', ')}`); return; }

    setLoading(true);
    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email:    email.trim(),
        password: password.trim(),
      });

      if (loginError) {
        if (loginError.message.toLowerCase().includes('email not confirmed')) {
          setError('Please confirm your email first. Check your inbox.');
        } else {
          setError('Invalid email or password.');
        }
        return;
      }

      if (data?.user) {
        // No setTimeout — onAuthStateChange handles doctor load, then navigate
        navigate('/portal', { replace: true });
      }

    } catch (err) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-box">
        <div className="auth-logo">
          <div className="logo-icon"></div>
          Doctor Portal
        </div>
        <h2 className="auth-title">Welcome back</h2>
        <p className="auth-sub">Log in to your doctor account</p>

        {error && <div className="auth-error">{error}</div>}

        <div className="form-group" style={{ marginBottom: 14 }}>
          <label className="form-label">Email</label>
          <input className="form-input" type="email" placeholder="doctor@gmail.com"
            value={email} onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()} />
        </div>

        <div className="form-group" style={{ marginBottom: 20 }}>
          <label className="form-label">Password</label>
          <input className="form-input" type="password" placeholder="Enter your password"
            value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()} />
        </div>

        <button className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center', marginBottom: 14 }}
          onClick={handleLogin} disabled={loading}>
          {loading ? 'Logging in...' : 'Log In'}
        </button>

        <p className="auth-switch">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}