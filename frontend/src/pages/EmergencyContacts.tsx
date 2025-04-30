import { Phone, Mail, MessageCircle, Heart } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function EmergencyContacts() {
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
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Emergency Contacts</h2>

      <div className="grid gap-6 md:grid-cols-2">
        {emergencyContacts.map((contact, index) => (
          <div
            key={index}
            className="rounded-lg bg-white p-6 shadow-soft"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {contact.name}
                </h3>
                <p className="text-sm text-gray-600">{contact.role}</p>
              </div>
              <div className="rounded-full bg-primary/10 p-3">
                <contact.icon className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <Button
                variant="secondary"
                className="w-full justify-start"
                onClick={() => window.location.href = `tel:${contact.phone}`}
              >
                <Phone className="mr-2 h-4 w-4" />
                {contact.phone}
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-start"
                onClick={() => window.location.href = `mailto:${contact.email}`}
              >
                <Mail className="mr-2 h-4 w-4" />
                {contact.email}
              </Button>
              <p className="mt-2 text-sm font-medium text-primary">
                {contact.availability}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg bg-primary/10 p-6">
        <h3 className="mb-2 text-lg font-semibold text-primary">
          Emergency Instructions
        </h3>
        <ul className="list-inside list-disc space-y-2 text-gray-700">
          <li>For immediate medical emergencies, dial 911</li>
          <li>Contact your primary care provider for non-urgent concerns</li>
          <li>The 24/7 hotline is available for any pregnancy-related questions</li>
          <li>Keep these numbers saved in your phone for quick access</li>
        </ul>
      </div>
    </div>
  );
}