import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Users,
  Calendar,
  Activity,
  AlertTriangle,
  Clock
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer
} from 'recharts';

export function ProviderDashboard() {
  const [stats, setStats] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [visitTypes, setVisitTypes] = useState([]);
  const [appointmentStatus, setAppointmentStatus] = useState([]);
  const [weekSchedule, setWeekSchedule] = useState({});

  const COLORS = ['#3b82f6', '#10b981', '#ef4444'];
  const STATUS_COLORS = {
    Completed: '#10b981',
    Rescheduled: '#f59e0b',
    Cancelled: '#ef4444',
    Scheduled: '#3b82f6'
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const user = localStorage.getItem('user');
        const userId = user ? JSON.parse(user).id : null;
  
        if (!userId) throw new Error('User not found');
  
        const res = await axios.get(`http://localhost:8000/api/provider_stats/?provider_id=${userId}`);
        const data = res.data;

        // Summary stats with original semantic colors
        setStats([
          { label: 'Active Patients', value: data.total_patients, icon: Users, color: 'primary' },
          { label: "Today's Appointments", value: data.today_appointments, icon: Calendar, color: 'success' },
          { label: 'Pending Reports', value: data.total_reports, icon: Activity, color: 'warning' },
          { label: 'Critical Cases', value: data.total_critical, icon: AlertTriangle, color: 'danger' },
        ]);

        // Upcoming Appointments
        setUpcomingAppointments(data.upcoming_appointments || []);

        // Visit Types from appointments_by_type
        setVisitTypes(
          Object.entries(data.appointments_by_type || {}).map(([name, value]) => ({ name, value }))
        );

        // Appointment Status from appointments_by_status
        setAppointmentStatus(
          Object.entries(data.appointments_by_status || {}).map(([status, value]) => ({ status, value }))
        );

        // Weekly schedule from weekly_summary
        const weekData = {};
        if (data.weekly_summary) {
          Object.entries(data.weekly_summary).forEach(([date, count]) => {
            const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
            weekData[dayName] = `${count} appointment${count !== 1 ? 's' : ''}`;
          });
        }
        setWeekSchedule(weekData);
      } catch (err) {
        console.error("Error fetching provider stats:", err);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Provider Dashboard</h2>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div key={index} className="rounded-lg bg-white p-6 shadow-soft">
            <div className="flex items-center">
              <div className={`rounded-full bg-${stat.color}/10 p-3`}>
                <stat.icon className={`h-6 w-6 text-${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upcoming Appointments */}
      <div className="rounded-lg bg-white p-6 shadow-soft">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Upcoming Appointments</h3>
        <ul className="divide-y text-sm text-gray-800">
          {upcomingAppointments.map((appt, idx) => (
            <li key={idx} className="flex justify-between py-2">
              <div>
                <p className="font-medium">{appt.patient}</p>
                <p className="text-xs text-gray-500">{appt.type}</p>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="mr-1 h-4 w-4 text-gray-400" />
                {new Date(appt.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Appointments Overview Charts */}
      <div className="rounded-lg bg-white p-6 shadow-soft">
        <h3 className="mb-6 text-lg font-semibold text-gray-900">Appointments Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Visit Types</h4>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={visitTypes} dataKey="value" nameKey="name" outerRadius={80} label>
                  {visitTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Appointment Status</h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={appointmentStatus} layout="vertical" margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" allowDecimals={false} />
                <YAxis dataKey="status" type="category" />
                <Tooltip />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {appointmentStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Weekly Schedule */}
      <div className="rounded-lg bg-white p-6 shadow-soft">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">This Week's Appointment Schedule</h3>
        <ul className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-800">
          {Object.entries(weekSchedule).map(([day, schedule], idx) => (
            <li key={idx} className="rounded border p-3 bg-gray-50">
              <p className="font-medium">{day}</p>
              <p className="text-gray-600">{schedule}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Recent Activity (static) */}
      <div className="rounded-lg bg-white p-6 shadow-soft">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <p className="font-medium text-gray-900">Patient appointment scheduled</p>
              <p className="text-sm text-gray-600">Today at 9:30 AM</p>
            </div>
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <p className="font-medium text-gray-900">Report submitted</p>
              <p className="text-sm text-gray-600">Yesterday at 2:15 PM</p>
            </div>
            <Activity className="h-5 w-5 text-success" />
          </div>
        </div>
      </div>
    </div>
  );
}
