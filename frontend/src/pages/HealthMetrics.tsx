import { useEffect, useState } from 'react';
import { useHealthStore } from '../store/health';
import { HealthMetricsChart } from '../components/health/HealthMetricsChart';
import { Button } from '../components/ui/Button';
import { Activity } from 'lucide-react';

export function HealthMetrics() {
  const { metrics, addMetric, setMetrics } = useHealthStore();
  const [userId, setUserId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    age: '',
    systolicBP: '',
    diastolicBP: '',
    bs: '',
    bodyTemp: '',
    heartRate: '',
  });

  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUserId(parsed.id);
      } catch (err) {
        console.error('Error parsing stored user:', err);
      }
    }
  }, []);

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!userId) return;

      try {
        const res = await fetch(`http://localhost:8000/api/get_metrics/${userId}`);
        if (!res.ok) throw new Error('Failed to fetch metrics');
        const data = await res.json();
        console.log(data);

        const formattedMetrics = data.metrics.map((item: any) => ({
          userId,
          timestamp: item.created_at || new Date().toISOString(),
          type: 'health_risk',
          bp: `${item.systolic_bp}/${item.diastolic_bp}`,
          temp: item.body_temp,
          hr: item.heartrate,
          unit: '',
          status: item.predicted_risk,
        }));

        setMetrics(formattedMetrics);
      } catch (error) {
        console.error('Error loading metrics:', error);
      }
    };

    if (userId) fetchMetrics();
  }, [userId, setMetrics]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      user_id: userId,
      age: Number(formData.age),
      systolicBP: Number(formData.systolicBP),
      diastolicBP: Number(formData.diastolicBP),
      bs: Number(formData.bs),
      bodyTemp: Number(formData.bodyTemp),
      heartRate: Number(formData.heartRate),
    };

    try {
      const response = await fetch('http://localhost:8000/api/predict/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.risk === 'high') {
        setAlertMessage('High risk detected');
      } else if (data.risk === 'safe') {
        setAlertMessage('Risk level is safe');
      } else {
        setAlertMessage('Risk assessment unavailable');
      }

      const metricsRes = await fetch(`http://localhost:8000/api/get_metrics/${userId}`);
      const metricsData = await metricsRes.json();

      const formattedMetrics = metricsData.metrics.map((item: any) => ({
        userId,
        timestamp: item.created_at || new Date().toISOString(),
        type: 'health_risk',
        bp: `${item.systolic_bp}/${item.diastolic_bp}`,
        temp: item.body_temp,
        hr: item.heartrate,
        unit: '',
        status: item.predicted_risk,
      }));

      setMetrics(formattedMetrics);

      setFormData({
        age: '',
        systolicBP: '',
        diastolicBP: '',
        bs: '',
        bodyTemp: '',
        heartRate: '',
      });
    } catch (error) {
      console.error('Prediction error:', error);
      setAlertMessage('Error submitting data');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Health Metrics</h2>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow-soft">
          <h3 className="mb-4 text-lg font-semibold">Enter Health Data</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: 'Age', key: 'age', placeholder: 'Enter your age' },
              { label: 'Systolic BP (mmHg)', key: 'systolicBP', placeholder: 'Systolic' },
              { label: 'Diastolic BP (mmHg)', key: 'diastolicBP', placeholder: 'Diastolic' },
              { label: 'Blood Sugar (mg/dL)', key: 'bs', placeholder: 'Blood sugar' },
              { label: 'Body Temperature (°C)', key: 'bodyTemp', placeholder: 'Temperature', step: '0.1' },
              { label: 'Heart Rate (bpm)', key: 'heartRate', placeholder: 'Heart rate' },
            ].map(({ label, key, placeholder, step }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700">{label}</label>
                <input
                  type="number"
                  step={step}
                  value={(formData as any)[key]}
                  onChange={(e) => handleInputChange(key, e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder={placeholder}
                  required
                />
              </div>
            ))}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Activity className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Activity className="mr-2 h-4 w-4" />
                  Submit Data for Prediction
                </>
              )}
            </Button>

            {alertMessage && (
              <div
                className={`mb-4 rounded-md px-4 py-2 text-sm font-medium ${
                  alertMessage.toLowerCase().includes('high')
                    ? 'bg-danger/10 text-danger'
                    : 'bg-success/10 text-success'
                }`}
              >
                {alertMessage}
              </div>
            )}
          </form>
        </div>

        <HealthMetricsChart />
      </div>

      <div className="rounded-lg bg-white p-6 shadow-soft">
        <h3 className="mb-4 text-lg font-semibold">Recent Readings</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">BP</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Temp (°C)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">HR (bpm)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {metrics.map((metric, index) => (
                <tr key={index}>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {new Date(metric.timestamp).toLocaleString()}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {metric.bp}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {metric.temp} °C
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {metric.hr} bpm
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <span
                      className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        metric.status === 'safe'
                          ? 'bg-green-100 text-green-800'
                          : metric.status === 'high'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {metric.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
