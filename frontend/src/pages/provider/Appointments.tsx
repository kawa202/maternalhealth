import React, { useState, useEffect } from 'react';
import { PlusCircle, CalendarPlus, RefreshCcw, XCircle, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';

// Types
type Patient = { id: number; name: string; phone: string; user_full_name: string };
type Appointment = {
  id: number;
  providerId: number;
  patientId: number;
  patientName: string;
  notes: string;
  time: string;
  type: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'Rescheduled';
};

export default function ProviderAppointments() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [formData, setFormData] = useState({ patientId: 0, notes: '', time: '', type: '' });
  const [showModal, setShowModal] = useState(false);

  const user = localStorage.getItem('user');
  const providerId = user ? JSON.parse(user).id : null;

  const fetchPatients = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/patients/?provider_id=${providerId}`);
      const data = await res.json();
      const list: Patient[] = Array.isArray(data.assigned_patients)
        ? data.assigned_patients
        : data.patients ?? [];
      setPatients(list);
    } catch (err) {
      console.error('Failed to load patients', err);
    }
  };

  const fetchAppointments = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/appointments/?provider_id=${providerId}`);
      const data = await res.json();
      console.log("appointments",data);
      setAppointments(Array.isArray(data) ? data : data.appointments ?? []);
    } catch (err) {
      console.error('Failed to load appointments', err);
    }
  };

  useEffect(() => {
    fetchPatients();
    fetchAppointments();
  }, []);

  const handleSchedule = async () => {
    if (!providerId) {
      alert('No provider logged in');
      return;
    }
    if (!formData.patientId || !formData.notes || !formData.time || !formData.type) {
      alert('Please fill all fields');
      return;
    }
    try {
      const payload = { ...formData, providerId };
      const res = await fetch('http://localhost:8000/api/appointments/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Network response was not ok');
      setFormData({ patientId: 0, notes: '', time: '', type: '' });
      setShowModal(false);
      fetchAppointments();
    } catch (err) {
      console.error('Failed to schedule', err);
      alert('Could not schedule appointment');
    }
  };

  const updateStatus = async (id: number, status: Appointment['status']) => {
    try {
      const res = await fetch(`http://localhost:8000/api/appointments/${id}/status/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      setAppointments(prev => prev.map(a => (a.id === id ? { ...a, status } : a)));
    } catch (err) {
      console.error('Status update failed', err);
    }
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Appointments</h2>
        <Button onClick={() => setShowModal(true)} className="flex items-center gap-2">
          <PlusCircle className="w-4 h-4" /> Schedule Appointment
        </Button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 h-full">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">New Appointment</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm">Patient</label>
                <select
                  className="w-full border px-2 py-1"
                  value={formData.patientId}
                  onChange={e => {
                    const id = Number(e.target.value);
                    setFormData({
                      ...formData,
                      patientId: id
                    });
                  }}
                >
                  <option value={0}>Select patient</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.user_id}>{p.user_full_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm">Notes</label>
                <textarea
                  className="w-full border px-2 py-1"
                  rows={3}
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm">Time</label>
                <input
                  type="datetime-local"
                  className="w-full border px-2 py-1"
                  value={formData.time}
                  onChange={e => setFormData({ ...formData, time: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm">Type</label>
                <select
                  className="w-full border px-2 py-1"
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="">Select</option>
                  <option value="Checkup">Checkup</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button onClick={handleSchedule} className="flex items-center gap-1">
                  <CalendarPlus className="w-4 h-4" /> Book
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left text-sm text-gray-600">
              {['Patient', 'Time', 'Type', 'Status', 'Actions'].map(h => (
                <th key={h} className="p-2">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {appointments.map(a => (
              <tr key={a.id} className="border-b hover:bg-gray-50">
                <td className="p-2">{a.patient}</td>
                <td className="p-2">{new Date(a.time).toLocaleString()}</td>
                <td className="p-2">{a.type}</td>
                <td className="p-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    a.status === 'Scheduled' ? 'bg-blue-100 text-blue-700' :
                    a.status === 'Completed' ? 'bg-green-100 text-green-700' :
                    a.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>{a.status}</span>
                </td>
                <td className="p-2 space-x-1">
                  <Button size="xs" onClick={() => updateStatus(a.id, 'Rescheduled')}><RefreshCcw className="w-4 h-4" /></Button>
                  <Button size="xs" variant="destructive" onClick={() => updateStatus(a.id, 'Cancelled')}><XCircle className="w-4 h-4" /></Button>
                  <Button size="xs" variant="default" onClick={() => updateStatus(a.id, 'Completed')}><CheckCircle className="w-4 h-4" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
