

export interface User {
    id: number;
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
    role: 'patient' | 'admin' | 'owner';
}

export interface Doctor {
  id: number;
  name: string;
  specialty: string;
  location: string;
  available_time: string;
  imageUrl: string;
}

export interface Appointment {
  id: number;
  userId: number;
  patient_name: string;
  doctor_id: number;
  doctor_name: string;
  appointment_date: string; // YYYY-MM-DD
  appointment_time: string;
  created_at: string; // ISO string
  is_repeat_visit: boolean;
  heart_beat_rate: number | null;
  symptoms: string;
  blood_test_notes: string;
  nutrition_notes: string;
  report_pdf_base64?: string;
}

export interface DoctorIn {
  name: string;
  specialty: string;
  location: string;
  available_time: string;
  imageUrl: string;
}

export interface AppointmentIn {
  userId: number;
  patient_name: string;
  doctor_id: number;
  appointment_date: string; // YYYY-MM-DD
  appointment_time: string;
  is_repeat_visit: boolean;
  heart_beat_rate: string;
  symptoms: string;
  blood_test_notes: string;
  nutrition_notes: string;
  report_pdf_file?: File | null;
}

export interface AuthLog {
  userName: string;
  userPhone: string;
  role: 'patient' | 'admin' | 'owner';
  action: 'login' | 'logout';
  timestamp: string;
  location: string;
}

export interface PharmaCompany {
  id: number;
  name: string;
  location: string;
}

export interface UserSession {
  id: number;
  userId: number;
  userName: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  duration: number;  // in seconds
}

export interface Address {
  id: number;
  userId: number;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  type: 'Home' | 'Work';
}

export interface Medicine {
  id: number;
  name: string;
  mrp: number;
  price: number;
  description: string;
  imageUrl: string;
}

export interface DeliveryBoy {
    name: string;
    phone: string;
}

export interface TrackingEntry {
    status: string;
    timestamp: string; // ISO string
    notes?: string;
}

export interface MedicineOrder {
  id: number;
  userId: number;
  items: { 
    medicineId: number;
    medicineName: string;
    quantity: number; 
    price: number;
    mrp: number;
  }[];
  deliveryAddress: Address;
  subtotal: number;
  savings: number;
  gst: number;
  deliveryFee: number;
  totalAmount: number;
  status: 'Processing' | 'Shipped' | 'Delivered';
  orderDate: string; // ISO string
  deliveryBoy: DeliveryBoy | null;
  trackingHistory: TrackingEntry[];
}

export interface MedicineIn {
  name: string;
  mrp: number;
  price: number;
  description: string;
  imageUrl: string;
}

export interface LabTest {
    id: number;
    name: string;
    description: string;
    price: number;
    mrp: number;
    preparations: string;
    includes: string[];
    imageUrl: string;
}

export interface LabTestBooking {
    id: number;
    userId: number;
    patientName: string;
    testId: number;
    testName: string;
    bookingDate: string; // ISO string
    slot: string;
    address: Address;
    totalAmount: number;
    status: 'Booked' | 'Sample Collected' | 'Report Ready' | 'Cancelled';
    deliveryBoy: DeliveryBoy | null; // Represents the phlebotomist
    trackingHistory: TrackingEntry[];
}

export interface LabTestBookingIn {
    userId: number;
    patientName: string;
    testId: number;
    slot: string;
    address: Address;
}

export interface Message {
    role: 'user' | 'model';
    text: string;
    timestamp?: string; // ISO string for when the message was created
    doctors?: Doctor[];
    videoCallWith?: Doctor;
}