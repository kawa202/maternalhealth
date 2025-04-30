import { useEffect, useState } from 'react';
import { FileText, Download } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { formatDate } from '../lib/utils';

// Component for patients to fetch and view medical reports from Django backend
export function Records() {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const patientId = user.id;

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:8000/api/patient-reports/?user_id=${patientId}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      setReports(json.data || []);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Unable to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientId) fetchReports();
  }, [patientId]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Medical Records</h2>

      <div className="rounded-lg bg-white p-6 shadow-md">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Health Reports</h3>
          <Button variant="secondary" size="sm" onClick={fetchReports} disabled={loading}>
            Refresh
          </Button>
        </div>

        {error && <p className="text-red-600">{error}</p>}
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : (
          <div className="space-y-4">
            {reports.length > 0 ? (
              reports.map((report) => (
                <div key={report.id} className="rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <span className="font-medium">
                        Health Report - {formatDate(new Date(report.created_at))}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => window.open(`http://localhost:8000/api/reports/${report.id}/word/`, '_blank')}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Word
                      </Button>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Provider:</span> {report.provider?.name || 'Unknown'}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Notes:</span> {report.notes}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Recommendations:</span> {report.recommendations}
                    </p>
                    {report.next_appointment && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Next Appointment:</span> {formatDate(new Date(report.next_appointment))}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">No health reports available</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
