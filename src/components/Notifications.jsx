import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export default function Notifications({ doctor }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [open, setOpen]                   = useState(false);

  useEffect(() => {
    if (doctor?.id) {
      fetchNotifications();

      // Real-time listener — new notification appears instantly
      const channel = supabase
        .channel('notifications')
        .on('postgres_changes', {
          event:  'INSERT',
          schema: 'public',
          table:  'notifications',
          filter: `doctor_id=eq.${doctor.id}`
        }, (payload) => {
          setNotifications(prev => [payload.new, ...prev]);
          setUnreadCount(prev => prev + 1);
        })
        .subscribe();

      return () => supabase.removeChannel(channel);
    }
  }, [doctor]);

  async function fetchNotifications() {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('doctor_id', doctor.id)
      .order('created_at', { ascending: false })
      .limit(20);

    setNotifications(data || []);
    setUnreadCount((data || []).filter(n => !n.is_read).length);
  }

  async function markAllRead() {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('doctor_id', doctor.id)
      .eq('is_read', false);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  }

  async function markRead(id) {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, is_read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Bell Icon */}
      <button className="notif-bell" onClick={() => setOpen(!open)}>
        🔔
        {unreadCount > 0 && (
          <span className="notif-badge">{unreadCount}</span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="notif-dropdown">
          <div className="notif-header">
            <span style={{ fontWeight: 600, fontSize: 14 }}>
              Notifications
            </span>
            {unreadCount > 0 && (
              <span className="notif-mark-read" onClick={markAllRead}>
                Mark all read
              </span>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="notif-empty">No notifications yet</div>
          ) : (
            notifications.map(n => (
              <div
                key={n.id}
                className={`notif-item ${!n.is_read ? 'notif-unread' : ''}`}
                onClick={() => !n.is_read && markRead(n.id)}
              >
                <div className="notif-title">{n.title}</div>
                <div className="notif-message">{n.message}</div>
                <div className="notif-time">
                  {new Date(n.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Backdrop to close */}
      {open && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 99 }}
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  );
}