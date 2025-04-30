import { ReactNode, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LogOut,
  Bell,
  Settings,
  Layout,
  Users,
  Activity,
  Calendar,
  FileText,
  Home,
  Baby,
  Menu,
  X,
  Phone,
  Mail,
  Heart,
  MessageCircle
} from 'lucide-react';
import { Button } from '../ui/Button';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isContactsOpen, setIsContactsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = '/'; // Redirect to login page
  };

  const menuItems = {
    admin: [
      { icon: Layout, label: 'Dashboard', path: '/dashboard' },
      { icon: Users, label: 'Users', path: '/users' },
      { icon: Activity, label: 'Analytics', path: '/analytics' },
      { icon: Settings, label: 'Settings', path: '/settings' },
    ],
    provider: [
      { icon: Layout, label: 'Dashboard', path: '/dashboard' },
      { icon: Users, label: 'Patients', path: '/patients' },
      { icon: Calendar, label: 'Appointments', path: '/provider-appointments' },
      { icon: FileText, label: 'Reports', path: '/reports' },
    ],
    mother: [
      { icon: Home, label: 'Home', path: '/dashboard' },
      { icon: Activity, label: 'Health Metrics', path: '/metrics' },
      { icon: Calendar, label: 'Appointments', path: '/appointments' },
      { icon: FileText, label: 'Records', path: '/records' },
    ],
  };

  const currentMenu = user?.role ? menuItems[user.role] : [];

  const emergencyContacts = [
    {
      name: 'Dr. Alan Chinyani',
      role: 'Primary Care Provider',
      phone: '+263 773 078 098',
      email: 'dr.alanchinyani@maternalcare.com',
      availability: '24/7 Emergency',
      icon: Heart,
    },
    {
      name: 'Maternal Health Hotline',
      role: 'Emergency Support',
      phone: '+263 781 889 002',
      email: 'support@maternalcare.com',
      availability: '24/7 Support',
      icon: MessageCircle,
    },
    {
      name: 'Hospital Labor & Delivery',
      role: 'Emergency Department',
      phone: '+263 772 872 563',
      email: 'emergency@maternalcare.com',
      availability: 'Always Open',
      icon: Phone,
    },
    {
      name: 'Mental Health Support',
      role: 'Counseling Services',
      phone: '+263 712 329 068',
      email: 'counseling@maternalcare.com',
      availability: '9 AM - 5 PM',
      icon: Heart,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-soft">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo and Mobile Menu Button */}
            <div className="flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary md:hidden"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
              <div className="flex items-center">
                <Baby className="h-8 w-8 text-slate-600" />
                <span className="ml-2 text-xl font-semibold text-slate-800">MaternalCare</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:space-x-4">
              {currentMenu.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-primary/10 hover:text-primary"
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Right side buttons */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsContactsOpen(true)}
                className="rounded-full p-2 text-gray-700 hover:bg-gray-100"
              >
                <Phone className="h-5 w-5" />
              </button>
              <Link to="/notifications" className="rounded-full p-2 text-gray-700 hover:bg-gray-100">
                <Bell className="h-5 w-5" />
              </Link>
              <div className="flex items-center space-x-2">
                {user?.avatar && (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-8 w-8 rounded-full"
                  />
                )}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleLogout}
                  className="hidden md:flex"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="border-t md:hidden bg-gray-100">
          <div className="space-y-1 px-2 pb-3 pt-2">
            {currentMenu.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-primary/10 hover:text-primary"
              >
                <item.icon className="mr-2 h-5 w-5" />
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
      {/* Emergency Contacts Modal */}
      {isContactsOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-end justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setIsContactsOpen(false)}
            ></div>

            <div className="inline-block transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle">
              <div className="absolute right-0 top-0 pr-4 pt-4">
                <button
                  onClick={() => setIsContactsOpen(false)}
                  className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="sm:flex sm:items-start">
                <div className="mt-3 w-full text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <h3 className="text-xl font-semibold leading-6 text-gray-900">
                    Emergency Contacts
                  </h3>
                  <div className="mt-4 space-y-4">
                    {emergencyContacts.map((contact, index) => (
                      <div
                        key={index}
                        className="rounded-lg border border-gray-200 p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {contact.name}
                            </h4>
                            <p className="text-sm text-gray-600">{contact.role}</p>
                          </div>
                          <contact.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="mt-2 space-y-1">
                          <p className="flex items-center text-sm text-gray-600">
                            <Phone className="mr-2 h-4 w-4" />
                            {contact.phone}
                          </p>
                          <p className="flex items-center text-sm text-gray-600">
                            <Mail className="mr-2 h-4 w-4" />
                            {contact.email}
                          </p>
                          <p className="text-sm font-medium text-primary">
                            {contact.availability}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="pt-16">
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
