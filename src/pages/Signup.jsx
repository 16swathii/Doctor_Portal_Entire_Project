import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", email: "", password: "",
    specialisation: "", licenseNo: "", hospital: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.licenseNo) {
      setError("Please fill all required fields.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      await signup(form);
      navigate("/portal");
    } catch (err) {
      if (err.message.includes("already registered"))
        setError("This email is already registered. Please log in.");
      else
        setError(err.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">🩺 Doctor Portal</div>
        <h2 className="auth-title">Create your account</h2>
        <p className="auth-sub">Register to access the clinical portal</p>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={submit}>
          <label>Full name *</label>
          <input name="name" placeholder="Dr. Vedasree Reddy" onChange={handle} />
          <label>Email *</label>
          <input name="email" type="email" placeholder="doctor@hospital.in" onChange={handle} />
          <label>Password *</label>
          <input name="password" type="password" placeholder="Min 6 characters" onChange={handle} />
          <label>Specialisation</label>
          <select name="specialisation" onChange={handle}>
            <option value="">Select...</option>
            <option>Cardiology</option>
            <option>Internal Medicine</option>
            <option>General Practice</option>
            <option>Neurology</option>
            <option>Orthopaedics</option>
          </select>
          <label>Medical licence number *</label>
          <input name="licenseNo" placeholder="MCI-XXXXXX" onChange={handle} />
          <label>Hospital / clinic</label>
          <input name="hospital" placeholder="e.g. Apollo Hospitals, Bangalore" onChange={handle} />
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Creating account..." : "Create account →"}
          </button>
        </form>
        <p className="auth-switch">
          Already registered? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}