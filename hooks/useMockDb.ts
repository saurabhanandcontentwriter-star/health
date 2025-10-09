import { useState, useEffect } from 'react';
import { Doctor, Patient, Appointment } from '../types';

const doctorsData: Doctor[] = [
    {
        id: 'doc1',
        name: 'Dr. Anjali Sharma',
        specialization: 'Cardiologist',
        experience: 15,
        qualifications: 'MD, FACC',
        location: 'Patna',
        availability: { 'Monday': ['10:00', '14:00'], 'Wednesday': ['09:00', '13:00'] },
        rating: 4.8,
        reviews: 120,
        image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2070&auto=format&fit=crop',
        bio: 'Dr. Anjali Sharma is a leading cardiologist in Bihar with over 15 years of experience in treating heart conditions.'
    },
    {
        id: 'doc2',
        name: 'Dr. Rajeev Verma',
        specialization: 'Dermatologist',
        experience: 10,
        qualifications: 'MBBS, MD',
        location: 'Gaya',
        availability: { 'Tuesday': ['11:00', '15:00'], 'Friday': ['10:00', '14:00'] },
        rating: 4.9,
        reviews: 95,
        image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=2070&auto=format&fit=crop',
        bio: 'Dr. Rajeev Verma is a renowned dermatologist known for his expertise in cosmetic and clinical dermatology.'
    },
    {
        id: 'doc3',
        name: 'Dr. Priya Singh',
        specialization: 'Pediatrician',
        experience: 12,
        qualifications: 'MBBS, DCH',
        location: 'Muzaffarpur',
        availability: { 'Monday': ['09:00', '12:00'], 'Thursday': ['14:00', '17:00'] },
        rating: 4.7,
        reviews: 150,
        image: 'https://images.unsplash.com/photo-1622253692010-333f2da60710?q=80&w=1964&auto=format&fit=crop',
        bio: 'Dr. Priya Singh is a compassionate pediatrician dedicated to providing the best care for children.'
    },
    {
        id: 'doc4',
        name: 'Dr. Sameer Gupta',
        specialization: 'Orthopedic Surgeon',
        experience: 20,
        qualifications: 'MS (Orthopedics)',
        location: 'Patna',
        availability: { 'Tuesday': ['10:00', '13:00'], 'Saturday': ['09:00', '12:00'] },
        rating: 4.9,
        reviews: 200,
        image: 'https://plus.unsplash.com/premium_photo-1661764878654-3d0fc6eef519?q=80&w=2070&auto=format&fit=crop',
        bio: 'Dr. Sameer Gupta is a highly experienced orthopedic surgeon specializing in joint replacement and sports injuries.'
    },
];

const patientsData: Patient[] = [
    { id: 'pat1', name: 'Rohan Kumar', email: 'rohan@test.com', phone: '1234567890', role: 'patient' },
];

const appointmentsData: Appointment[] = [
    { id: 'apt1', patientId: 'pat1', doctorId: 'doc1', date: '2024-08-10', time: '10:00', reason: 'Chest pain', status: 'upcoming' },
];


export const useMockDb = () => {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);

    useEffect(() => {
        // Simulate fetching data
        setDoctors(doctorsData);
        setPatients(patientsData);
        setAppointments(appointmentsData);
    }, []);

    return { doctors, patients, appointments };
};
