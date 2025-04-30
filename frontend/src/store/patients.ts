import { create } from 'zustand';
import { Patient, Notification } from '../types/patient';

interface PatientsState {
  patients: Patient[];
  notifications: Notification[];
  addPatient: (patient: Omit<Patient, 'id'>) => void;
  updatePatient: (id: string, patient: Partial<Patient>) => void;
  sendNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markNotificationAsRead: (id: string) => void;
}

// Mock data
const mockPatients: Patient[] = [
  {
    id: '1',
    name: 'Emily Parker',
    email: 'emily@example.com',
    dateOfBirth: '1990-05-15',
    phone: '+1 (555) 123-4567',
    address: '123 Main St, Anytown, USA',
    emergencyContact: {
      name: 'John Parker',
      phone: '+1 (555) 987-6543',
      relationship: 'Spouse',
    },
    dueDate: '2024-08-15',
    bloodType: 'A+',
    medicalHistory: {
      conditions: ['Gestational diabetes'],
      medications: ['Prenatal vitamins'],
      allergies: ['Penicillin'],
    },
    status: 'active',
    lastVisit: '2024-02-15',
    nextAppointment: '2024-03-15',
  },
  {
    id: '2',
    name: 'Sarah Thompson',
    email: 'sarah@example.com',
    dateOfBirth: '1988-09-20',
    phone: '+1 (555) 234-5678',
    address: '456 Oak Ave, Anytown, USA',
    emergencyContact: {
      name: 'Mike Thompson',
      phone: '+1 (555) 876-5432',
      relationship: 'Spouse',
    },
    dueDate: '2024-07-01',
    bloodType: 'O+',
    medicalHistory: {
      conditions: ['Hypertension'],
      medications: ['Prenatal vitamins', 'Blood pressure medication'],
      allergies: [],
    },
    status: 'active',
    lastVisit: '2024-02-10',
    nextAppointment: '2024-03-10',
  },
];

export const usePatientsStore = create<PatientsState>((set) => ({
  patients: mockPatients,
  notifications: [],
  addPatient: (patient) =>
    set((state) => ({
      patients: [...state.patients, { ...patient, id: crypto.randomUUID() }],
    })),
  updatePatient: (id, updates) =>
    set((state) => ({
      patients: state.patients.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    })),
  sendNotification: (notification) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        {
          ...notification,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          status: 'unread',
        },
      ],
    })),
  markNotificationAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, status: 'read' } : n
      ),
    })),
}));