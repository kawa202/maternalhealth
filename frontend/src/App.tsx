import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { LoginForm } from "./components/auth/LoginForm";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { ProviderDashboard } from "./pages/provider/ProviderDashboard";
import { MotherDashboard } from "./pages/mother/MotherDashboard";
import { HealthMetrics } from "./pages/HealthMetrics";
import { Appointments } from "./pages/Appointments";
import { Records } from "./pages/Records";
import { EmergencyContacts } from "./pages/EmergencyContacts";
import { Patients } from "./pages/provider/Patients";
import { PatientDetails } from "./pages/provider/PatientDetails";

import { Reports } from "./pages/provider/Reports";
import LandingPage from "./pages/LandingPage";
import { Link } from "react-router-dom";
import { Baby } from "lucide-react";
import { RegisterForm } from "./pages/RegisterForm";
import Users from "./pages/admin/Users";
import ProviderAppointments from "./pages/provider/Appointments";
import { Notifications } from "./components/notifications/Notifications";
import { AnalyticsPage } from "./pages/admin/Analytics";
import { SettingsPage } from "./pages/admin/Settings";

function App() {
  const user = localStorage.getItem('user');
  console.log("routes",user);
  const isAuthenticated = !!user; // Check if user exists

  return (
    <Router>
      <Routes>
        {/* Always accessible */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginFormWrapper />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/notifications" element={
          <DashboardLayout>
            <Notifications />
          </DashboardLayout>} />
          <Route path="/users" element={
            <DashboardLayout>
              <Users />
             </DashboardLayout>} />

          <Route path="/admin-dashboard" element={
            <DashboardLayout>
              <AdminDashboard />
            </DashboardLayout>}/>

            <Route path="/analytics" element={
            <DashboardLayout>
              <AnalyticsPage />
            </DashboardLayout>}/>
            <Route path="/settings" element={
            <DashboardLayout>
              <SettingsPage />
            </DashboardLayout>}/>
       
        

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              
              <DashboardLayout>
                
                {user && JSON.parse(user).role === 'admin' ? (
                  
                  <AdminDashboard />
                ) : user && JSON.parse(user).role === 'provider' ? (
                  <ProviderDashboard />
                ) : user && JSON.parse(user).role === 'mother' ? (
                  <MotherDashboard />
                ) : (
                  <Navigate to="/" replace />
                )}
              </DashboardLayout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        
        <Route path="/provider-dashboard" element={
        <DashboardLayout>
          <AdminDashboard />
        </DashboardLayout>}/>
        <Route path="/appointments" element={
        <DashboardLayout>
          <Appointments />
        </DashboardLayout>}/>

        {/* Role-specific routes */}
        <Route
          path="/metrics"
          element={
            isAuthenticated && JSON.parse(user).role === 'mother' ? (
              <DashboardLayout>
                <HealthMetrics />
              </DashboardLayout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route path="/provider-appointments" element={
          <DashboardLayout>
            <ProviderAppointments/>
          </DashboardLayout>}/>
        <Route
          path="/appointments"
          element={
            isAuthenticated && JSON.parse(user).role === 'mother' ? (
              <DashboardLayout>
                <Appointments />
              </DashboardLayout>
            ) : isAuthenticated && JSON.parse(user).role === 'provider' ? (
              <DashboardLayout>
                <ProviderAppointments />
              </DashboardLayout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/records"
          element={
            isAuthenticated && JSON.parse(user).role === 'mother' ? (
              <DashboardLayout>
                <Records />
              </DashboardLayout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/contacts"
          element={
            isAuthenticated && JSON.parse(user).role === 'mother' ? (
              <DashboardLayout>
                <EmergencyContacts />
              </DashboardLayout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/patients"
          element={
            isAuthenticated && JSON.parse(user).role === 'provider' ? (
              <DashboardLayout>
                <Patients />
              </DashboardLayout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/patients/:id"
          element={
            isAuthenticated && JSON.parse(user).role === 'provider' ? (
              <DashboardLayout>
                <PatientDetails />
              </DashboardLayout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/reports"
          element={
            isAuthenticated && JSON.parse(user).role === 'provider' ? (
              <DashboardLayout>
                <Reports />
              </DashboardLayout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}

// Wrap LoginForm in a layout for styling
function LoginFormWrapper() {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="flex justify-center items-center h-full">
              <div className="flex items-center space-x-2">
                <Baby className="h-8 w-8 text-slate-600" />
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">MaternalCare</h1>
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-600">Sign in to access your dashboard</p>
          </div>
          <div className="mt-8 bg-white px-6 py-8 shadow-soft sm:rounded-lg sm:px-10">
            <LoginForm />
            <div className="mt-6 text-sm text-center text-gray-600">
              Don’t have an account?{" "}
              <Link to="/register" className="text-indigo-600 hover:text-indigo-800 font-medium">
                Sign up here
              </Link>
            </div>

            <div className="mt-2 text-sm text-center">
              <Link to="/forgot-password" className="text-gray-500 hover:text-gray-700">Forgot your password?</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
