import React, { useEffect, useState } from 'react';
import {
  Activity,
  HeartPulse,
  Stethoscope,
  AlertCircle,
  Salad,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar,
} from 'recharts';

export function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/admin-analytics')
      .then(res => res.json())
      .then(data => {
        setAnalyticsData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching analytics data:', err);
        setLoading(false);
      });
  }, []);

  const colorMap = {
    primary: { bg: 'bg-blue-100', text: 'text-blue-600' },
    success: { bg: 'bg-green-100', text: 'text-green-600' },
    danger: { bg: 'bg-red-100', text: 'text-red-600' },
    warning: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
  };

  if (loading) {
    return <p>Loading analytics...</p>;
  }

  // Stats cards mapping
  const stats = [
    { label: 'Risk Cases Detected', value: analyticsData?.risk_cases, icon: AlertCircle, color: 'danger' },
    { label: 'Total Providers', value: analyticsData?.total_providers, icon: HeartPulse, color: 'primary' },
    { label: 'Total Appointments', value: analyticsData?.total_appointments, icon: Stethoscope, color: 'success' },
    { label: 'Total Reports', value: analyticsData?.total_reports, icon: Salad, color: 'warning' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Maternal Health Analytics</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div key={index} className="rounded-lg bg-white p-6 shadow-soft">
            <div className="flex items-center">
              <div className={`${colorMap[stat.color].bg} rounded-full p-3`}>
                <stat.icon className={`h-6 w-6 ${colorMap[stat.color].text}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{stat.value ?? '-'}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Risk Case Trends */}
      <div className="rounded-lg bg-white p-6 shadow-soft">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Risk Cases Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={(analyticsData?.risk_case_trends || []).map(item => ({
            date: item.period ? new Date(item.period).toLocaleDateString() : 'N/A',
            count: item.total
          }))}>
            <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#ef4444" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Provider Completion Rates */}
      <div className="rounded-lg bg-white p-6 shadow-soft">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Provider Completion Rates</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={(analyticsData?.provider_stats || []).map(item => ({
            provider: item.name,
            completion_rate: item.completion_rate
          }))}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="provider" />
            <YAxis unit="%" />
            <Tooltip formatter={(value) => `${value}%`} />
            <Bar dataKey="completion_rate" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Activity */}
      <div className="rounded-lg bg-white p-6 shadow-soft">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Recent Activity</h3>
        <div className="space-y-4">
          {[
            { title: `Last Provider Joined: ${analyticsData?.last_provider?.name ?? '-'}`, time: analyticsData?.last_provider?.joined ?? '-' },
            { title: `Last Report by: ${analyticsData?.last_report?.provider ?? '-'}`, time: analyticsData?.last_report?.time ?? '-' },
            { title: `Last Appointment by: ${analyticsData?.last_appointment?.provider ?? '-'}`, time: analyticsData?.last_appointment?.time ?? '-' },
          ].map((activity, idx) => (
            <div key={idx} className="flex items-center justify-between border-b pb-4">
              <div>
                <p className="font-medium text-gray-900">{activity.title}</p>
                <p className="text-sm text-gray-600">{activity.time}</p>
              </div>
              <Activity className="h-5 w-5 text-primary" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
