import { useEffect, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { FileText, Download, Send } from 'lucide-react';
import { formatDate } from '../../lib/utils';

export function Reports() {
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [reportData, setReportData] = useState({
    notes: '',
    recommendations: '',
    nextAppointment: '',
  });
  const [reports, setReports] = useState<any[]>([]);

  // Fetch patients
  useEffect(() => {
    async function fetchPatients() {
      try {
        const user = localStorage.getItem('user');
        const userId = user ? JSON.parse(user).id : null;
        if (!userId) throw new Error('User not found');

        const res = await fetch(`http://localhost:8000/api/patients/?provider_id=${userId}`);
        const data = await res.json();
        setPatients(data.assigned_patients || []);
      } catch (err) {
        console.error('Error fetching patients:', err);
        setPatients([]);
      }
    }

    fetchPatients();
  }, []);

  // Fetch reports (reusable function)
  const fetchReports = async () => {
    const user = localStorage.getItem('user');
    const providerId = user ? JSON.parse(user).id : null;
    if (!providerId) return;

    try {
      const res = await fetch(`http://localhost:8000/api/reports/provider/${providerId}/`);
      const data = await res.json();
      setReports(data.reports || []);
    } catch (err) {
      console.error('Error fetching reports:', err);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    const user = localStorage.getItem('user');
    const providerId = user ? JSON.parse(user).id : null;
    if (!providerId) return;

    const payload = {
      patient_id: selectedPatient,
      provider_id: providerId,
      notes: reportData.notes,
      recommendations: reportData.recommendations,
      next_appointment: reportData.nextAppointment || null,
      date: new Date().toISOString(),
    };

    try {
      const res = await fetch('http://localhost:8000/api/send-report/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to submit report');

      // Reset form
      setReportData({ notes: '', recommendations: '', nextAppointment: '' });
      setSelectedPatient('');
      alert('Report submitted successfully!');

      // 🔄 Fetch updated reports
      await fetchReports();
    } catch (err) {
      console.error('Error submitting report:', err);
      alert('Failed to submit report.');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Generate Reports</h2>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Form */}
        <div className="rounded-lg bg-white p-6 shadow-soft">
          <h3 className="mb-4 text-lg font-semibold">New Report</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Patient</label>
              <select
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                required
              >
                <option value="">Select Patient</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.user_full_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                value={reportData.notes}
                onChange={(e) => setReportData({ ...reportData, notes: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                rows={4}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Recommendations</label>
              <textarea
                value={reportData.recommendations}
                onChange={(e) =>
                  setReportData({ ...reportData, recommendations: e.target.value })
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                rows={3}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Next Appointment</label>
              <input
                type="date"
                value={reportData.nextAppointment}
                onChange={(e) =>
                  setReportData({ ...reportData, nextAppointment: e.target.value })
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <Button type="submit" className="w-full">
              <Send className="mr-2 h-4 w-4" />
              Generate and Send Report
            </Button>
          </form>
        </div>

        {/* Reports */}
        <div className="rounded-lg bg-white p-6 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Recent Reports</h3>
          </div>
          <div className="space-y-4">
            {reports.length === 0 ? (
              <p className="text-sm text-gray-500">No reports found.</p>
            ) : (
              reports.map((report) => (
                <div key={report.id} className="rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {report.patient} - {formatDate(report.created_at || '')}
                      </span>
                      <p className="text-sm text-gray-600">{report.notes}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          window.open(`http://localhost:8000/api/reports/${report.id}/word/`, '_blank')
                        }
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Word
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
