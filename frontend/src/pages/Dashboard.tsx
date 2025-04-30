import React, { useEffect, useState } from 'react';
import { useHealthStore } from '../../store/health';
import { Activity, Calendar, Thermometer, Droplet, Heart } from 'lucide-react';
import { HealthMetricsChart } from '../../components/health/HealthMetricsChart';
import { format } from 'date-fns';

const iconMap = {
  heart_rate: Heart,
  blood_pressure: Droplet,
  glucose: Activity,
  temperature: Thermometer,
};

const colorMap = {
  normal: 'green-500',
  warning: 'yellow-500',
  critical: 'red-500',
};

export function MotherDashboard() {
  const { setMetrics, metrics } = useHealthStore();
  const [appointments, setAppointments] = useState([]);
  const [userId, setUserId] = useState<number | null>(null);

  // Load user ID from localStorage
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
    if (!userId) return;

    const fetchAppointments = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/user-appointments/${userId}`);
        const data = await res.json();
        setAppointments(data);
      } catch (err) {
        console.error('Failed to fetch appointments:', err);
      }
    };

    const fetchMetrics = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/get_metrics/${userId}`);
        const data = await res.json();

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

    fetchAppointments();
    fetchMetrics();
  }, [userId, setMetrics]);

  const getMetric = (type: string) => metrics.find((m) => m.type === type);
  const getMetricStatus = (type: string) => getMetric(type)?.status || 'normal';
  const getMetricValue = (type: string, unit: string = '') =>
    getMetric(type)?.value ? `${getMetric(type)?.value} ${unit}` : 'N/A';

  const stats = [
    {
      type: 'heart_rate',
      label: 'Heart Rate',
      value: getMetricValue('heart_rate', 'bpm'),
    },
    {
      type: 'blood_pressure',
      label: 'Blood Pressure',
      value: getMetricValue('blood_pressure'),
    },
    {
      type: 'glucose',
      label: 'Glucose Level',
      value: getMetricValue('glucose', 'mg/dL'),
    },
    {
      type: 'temperature',
      label: 'Temperature',
      value: getMetricValue('temperature', '°C'),
    },
  ];

  const recentMetrics = [...metrics]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Mother Dashboard</h2>

      {/* Health Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const status = getMetricStatus(stat.type);
          const Icon = iconMap[stat.type] || Activity;
          const colorClass = colorMap[status] || 'gray-400';

          return (
            <div key={index} className="rounded-lg bg-white p-6 shadow-md">
              <div className="flex items-center">
                <div className={`rounded-full bg-${colorClass}/10 p-3`}>
                  <Icon className={`h-6 w-6 text-${colorClass}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="mt-1 text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart + Next Appointment */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <HealthMetricsChart />
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Upcoming Appointment</h3>
          {appointments.length > 0 ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Next Checkup</p>
                <p className="mt-1 text-lg font-medium">
                  {format(new Date(appointments[0].date), 'MMMM d, yyyy - h:mm a')}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-primary" />
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No upcoming appointment</p>
          )}
        </div>
      </div>

      {/* Recent Readings */}
      <div className="rounded-lg bg-white p-6 shadow-md">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Recent Readings</h3>
        <div className="space-y-4">
          {recentMetrics.length > 0 ? (
            recentMetrics.map((metric, index) => (
              <div key={index} className="flex items-center justify-between border-b pb-4">
                <div>
                  <p className="font-medium text-gray-900">BP: {metric.bp}, HR: {metric.hr} bpm, Temp: {metric.temp} °C</p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(metric.timestamp), 'PPpp')}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold leading-5 ${
                    metric.status === 'safe'
                      ? 'bg-green-100 text-green-800'
                      : metric.status === 'high'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {metric.status}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center">No recent readings available</p>
          )}
        </div>
      </div>
    </div>
  );
}
