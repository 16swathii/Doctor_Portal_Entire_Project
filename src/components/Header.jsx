import { supabase } from '../supabase';
import Notifications from './Notifications';

export default function Header({ doctor }) {
  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = '/';
  }

  return (
    <div className="header">
      <div className="logo">
        <div className="logo-icon"></div>
        Doctor Portal
      </div>
      <div className="header-spacer"></div>
      <div className="user-section">
        {/* Notification Bell */}
        <Notifications doctor={doctor} />

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