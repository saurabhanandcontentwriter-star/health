export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  experience: number;
  qualifications: string;
  location: string;
  availability: { [day: string]: string[] };
  rating: number;
  reviews: number;
  image: string;
  bio: string;
}

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'patient';
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  role: 'admin';
}

export interface Owner {
  id: string;
  name: string;
  email: string;
  role: 'owner';
}

export type User = Patient | Admin | Owner | null;

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  reason: string;
  status: 'upcoming' | 'completed' | 'cancelled';
}
