import React, { useEffect, useState } from 'react';
import {
  Activity,
  Users,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

export function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/admin-stats')  // Replace with your actual endpoint
      .then((res) => res.json())
      .then((data) => {
        setDashboardData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching dashboard data:', err);
        setLoading(false);
      });
  }, []);

  const colorMap = {
    primary: { bg: 'bg-blue-100', text: 'text-blue-600' },
    warning: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
    danger: { bg: 'bg-red-100', text: 'text-red-600' },
    success: { bg: 'bg-green-100', text: 'text-green-600' },
  };

  if (loading) {
    return <p>Loading dashboard...</p>;
  }

  const stats = [
    { label: 'Total Patients', value: dashboardData.total_patients, icon: Users, color: 'primary' },
    { label: 'Pending Appointments', value: dashboardData.pending_appointments, icon: Calendar, color: 'warning' },
    { label: 'Critical Alerts', value: dashboardData.critical_alerts, icon: AlertTriangle, color: 'danger' },
    { label: 'Total Providers', value: dashboardData.total_providers, icon: Users, color: 'success' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>

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
                <p className="mt-1 text-2xl font-semibold text-gray-900">
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Appointment Trends */}
      <div className="rounded-lg bg-white p-6 shadow-soft">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Appointment Trends Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dashboardData.appointment_trends.map(item => ({
            date: item.period ? new Date(item.period).toLocaleDateString() : 'Unknown',
            count: item.total
          }))}>
            <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#0ea5e9" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Activity */}
      <div className="rounded-lg bg-white p-6 shadow-soft">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <p className="font-medium text-gray-900">New patient registered</p>
              <p className="text-sm text-gray-600">{dashboardData.last_patient.joined}</p>
            </div>
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <p className="font-medium text-gray-900">Provider added</p>
              <p className="text-sm text-gray-600">{dashboardData.last_provider.joined}</p>
            </div>
            <Activity className="h-5 w-5 text-success" />
          </div>
        </div>
      </div>
    </div>
  );
}
