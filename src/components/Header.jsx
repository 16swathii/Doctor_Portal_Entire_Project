import { supabase } from '../supabase';

export default function Header({ doctor }) {
  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = '/'; // redirect to login
  }

  return (
    <div className="header">
      <div className="logo">
        <div className="logo-icon"></div>
        Doctor Portal
      </div>
      <div className="header-spacer"></div>
      <div className="user-section">
        <span className="user-name">{doctor?.name || 'Doctor'}</span>
        <div className="avatar">
          {doctor?.name?.charAt(0).toUpperCase() || 'D'}
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Log out
        </button>
      </div>
    </div>
  );
}