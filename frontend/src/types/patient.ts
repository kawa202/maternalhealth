export interface Patient {
  id: string;
  name: string;
  email: string;
  dateOfBirth: string;
  phone: string;
  address: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  dueDate: string;
  bloodType: string;
  medicalHistory: {
    conditions: string[];
    medications: string[];
    allergies: string[];
  };
  status: 'active' | 'inactive';
  lastVisit: string;
  nextAppointment?: string;
}

export interface Notification {
  id: string;
  patientId: string;
  providerId: string;
  title: string;
  message: string;
  type: 'appointment' | 'report' | 'alert';
  status: 'unread' | 'read';
  createdAt: string;
}