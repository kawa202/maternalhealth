export interface HealthMetric {
  id: string;
  userId: string;
  timestamp: string;
  type: 'heart_rate' | 'blood_pressure' | 'glucose' | 'temperature';
  value: number | string;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
}

export interface HealthReport {
  id: string;
  patientId: string;
  providerId: string;
  date: string;
  metrics: HealthMetric[];
  notes: string;
  recommendations: string;
  nextAppointment?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  providerId: string;
  date: string;
  time: string;
  type: 'checkup' | 'ultrasound' | 'lab_work' | 'emergency';
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

export interface EmergencyContact {
  id: string;
  userId: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  isProvider: boolean;
}