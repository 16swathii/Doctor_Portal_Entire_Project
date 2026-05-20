import { useAuth } from "../context/AuthContext";

export default function Header({ onLogout }) {
  const { doctor } = useAuth();

  // Get initials from name
  const initials = doctor?.name
    ? doctor.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'DR';

  return (
    <div className="header">
      <div className="logo">
        <div className="logo-icon"></div>
        Doctor Portal
      </div>
      <div className="header-spacer"></div>
      <div className="user-section">
        <span className="user-name">{doctor?.name || 'Doctor'}</span>
        <div className="avatar">{initials}</div>
        <button className="logout-btn" onClick={onLogout}>Log out</button>
      </div>
    </div>
  );
}