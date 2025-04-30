import { useEffect, useState } from 'react';
import { Calendar, Clock } from 'lucide-react';

// Component for patients to view only the appointments scheduled by their healthcare provider
export function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState(null);

  // Get the current user (patient) ID from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const patient_id = user.id;

  // Fetch appointments created by provider for this patient
  const fetchAppointments = async () => {
    try {

      const res = await fetch(`http://localhost:8000/api/patient-appointments/?user_id=${patient_id}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setAppointments(data.data || []);
    } catch (err) {
      console.error('Error fetching provider appointments:', err);
      setError('Unable to load appointments');
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Your Appointments</h2>

      {error && <p className="text-red-600">{error}</p>}

      <div className="rounded-lg bg-white p-6 shadow-soft">
        <h3 className="mb-4 text-lg font-semibold">Upcoming Appointments</h3>
        <div className="space-y-4">
          {appointments.length > 0 ? (
            appointments.map((appointment, index) => (
              <div key={index} className="rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <span className="font-medium">
                      {new Date(appointment.date).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="text-sm text-gray-600 capitalize">
                    {appointment.status}
                  </span>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  <Clock className="inline mr-2 h-4 w-4" />
                  {appointment.time}
                  <div>Type: {appointment.type.replace('_', ' ')}</div>
                  {appointment.notes && <div>Notes: {appointment.notes}</div>}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">No upcoming appointments</p>
          )}
        </div>
      </div>
    </div>
  );
}
