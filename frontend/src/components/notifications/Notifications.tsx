import React, { useEffect, useState } from 'react';
import { Calendar, FileText, Bell } from 'lucide-react';
import { Button } from '../ui/Button';
import { formatDate } from '../../lib/utils';

export function Notifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user.id;
  const userRole = user.role;  // ✅ get user role too

  const iconMap: Record<string, React.ElementType> = {
    appointment: Calendar,
    report: FileText,
    alert: Bell,
  };

  // Fetch notifications for this user
  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:8000/api/notifications/?user_id=${userId}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      console.log(json.notifications);
      setNotifications(Array.isArray(json.notifications) ? json.notifications : []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchNotifications();
  }, [userId]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>

      <div className="rounded-lg bg-white p-6 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Recent Notifications</h3>
          <Button size="sm" variant="secondary" onClick={fetchNotifications} disabled={loading}>
            Refresh
          </Button>
        </div>

        {error && <p className="text-red-600 mb-4">{error}</p>}
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : notifications.length > 0 ? (
          <ul className="space-y-4">
            {notifications.map((note) => {
              const Icon = iconMap[note.type] || Bell;
              return (
                <li key={note.id} className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg">
                  <Icon className="h-6 w-6 text-primary mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">{note.title}</h4>
                      <span className="text-sm text-gray-500">
                        {formatDate(new Date(note.timestamp))}
                      </span>
                    </div>

                    {/* ✅ Show name only if role is provider or admin */}
                    {['provider', 'admin'].includes(userRole) && note.name && (
                      <p className="mt-1 text-sm text-gray-700">
                        <span className="font-medium">User:</span> {note.name}
                      </p>
                    )}

                    {/* ✅ Show details if present */}
                    {note.details && Object.keys(note.details).length > 0 && (
                      <div className="mt-2 text-sm text-gray-600">
                        {Object.entries(note.details).map(([key, val]) => (
                          <div key={key}>
                            <span className="font-medium capitalize">{key.replace('_', ' ')}:</span> {val}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-center text-gray-500">No notifications</p>
        )}
      </div>
    </div>
  );
}
