import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { HealthMetricsChart } from '../../components/health/HealthMetricsChart';
import { Bell } from 'lucide-react';
import { PatientHealthMetrics } from '../../components/health/PatientHealthMetrics';

export function PatientDetails() {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');

  useEffect(() => {
    async function fetchPatient() {
      try {
        const response = await fetch(`http://localhost:8000/api/patient-details/${id}/`);
        if (!response.ok) throw new Error('Failed to fetch patient data');
        const data = await response.json();
        console.log(data);
        setPatient(data);
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchPatient();
  }, [id]);

  const handleSendNotification = async () => {
    if (!notificationMessage || !patient) return;

    const user = localStorage.getItem('user');
    const providerId = user ? JSON.parse(user).id : null;

    if (!providerId) {
      console.error('Provider ID not found in localStorage');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/send-notification/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: patient.id,
          provider: providerId,
          message: notificationMessage,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send notification');
      }

      console.log('Notification sent successfully');
      setNotificationMessage('');
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!patient) return <div>No patient found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">{patient.name}</h2>
        <Button variant="secondary" onClick={handleSendNotification}>
          <Bell className="mr-2 h-4 w-4" />
          Send Notification
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow-soft">
          <h3 className="mb-4 text-lg font-semibold">Patient Information</h3>
          <div className="space-y-4">
            <div><p className="text-sm font-medium text-gray-500">Email</p><p className="text-gray-900">{patient.email}</p></div>
            <div><p className="text-sm font-medium text-gray-500">Phone</p><p className="text-gray-900">{patient.phone}</p></div>
            <div><p className="text-sm font-medium text-gray-500">Due Date</p><p className="text-gray-900">{patient.dueDate !== 'None' ? new Date(patient.dueDate).toLocaleDateString() : 'N/A'}</p></div>
            <div><p className="text-sm font-medium text-gray-500">Blood Type</p><p className="text-gray-900">{patient.bloodType || 'N/A'}</p></div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-soft">
          <h3 className="mb-4 text-lg font-semibold">Medical History</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Conditions</p>
              <ul className="mt-1 list-inside list-disc">
                {patient.medicalHistory?.conditions?.length > 0 ? (
                  patient.medicalHistory.conditions.map((c: string, i: number) => (
                    <li key={i} className="text-gray-900">{c}</li>
                  ))
                ) : (
                  <li className="text-gray-500">None</li>
                )}
              </ul>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Medications</p>
              <ul className="mt-1 list-inside list-disc">
                {patient.medicalHistory?.medications?.length > 0 ? (
                  patient.medicalHistory.medications.map((m: string, i: number) => (
                    <li key={i} className="text-gray-900">{m}</li>
                  ))
                ) : (
                  <li className="text-gray-500">None</li>
                )}
              </ul>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Allergies</p>
              <ul className="mt-1 list-inside list-disc">
                {patient.medicalHistory?.allergies?.length > 0 ? (
                  patient.medicalHistory.allergies.map((a: string, i: number) => (
                    <li key={i} className="text-gray-900">{a}</li>
                  ))
                ) : (
                  <li className="text-gray-500">None</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {patient.patient_metrics?.length > 0 && (
        <div className="rounded-lg bg-white p-6 shadow-soft">
          <h3 className="mb-4 text-lg font-semibold">Health Metrics</h3>
          <PatientHealthMetrics metrics={patient.patient_metrics} />
        </div>
      )}

      <div className="rounded-lg bg-white p-6 shadow-soft">
        <h3 className="mb-4 text-lg font-semibold">Send Notification</h3>
        <div className="space-y-4">
          <textarea
            value={notificationMessage}
            onChange={(e) => setNotificationMessage(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            rows={3}
            placeholder="Type your message here..."
          />
          <Button onClick={handleSendNotification} className="w-full">
            <Bell className="mr-2 h-4 w-4" />
            Send Notification
          </Button>
        </div>
      </div>
    </div>
  );
}
