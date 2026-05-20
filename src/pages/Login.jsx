import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      await login(email, password);
      navigate("/portal");
    } catch (err) {
      if (err.message.includes("Invalid login"))
        setError("Invalid email or password.");
      else
        setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">🩺 Doctor Portal</div>
        <h2 className="auth-title">Welcome back</h2>
        <p className="auth-sub">Log in to your clinical account</p>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={submit}>
          <label>Email</label>
          <input type="email" placeholder="doctor@hospital.in"
            value={email} onChange={e => setEmail(e.target.value)} />
          <label>Password</label>
          <input type="password" placeholder="Your password"
            value={password} onChange={e => setPassword(e.target.value)} />
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Logging in..." : "Log in →"}
          </button>
        </form>
        <p className="auth-switch">
          New here? <Link to="/signup">Create an account</Link>
        </p>
      </div>
    </div>
  );
}