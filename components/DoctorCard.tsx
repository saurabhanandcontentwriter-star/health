import React from 'react';
import { Doctor } from '../types';

interface DoctorCardProps {
    doctor: Doctor;
    onBookAppointment?: (doctor: Doctor) => void;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({ doctor, onBookAppointment }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col md:flex-row items-start gap-4 p-4 w-full">
            <img 
                src={doctor.image} 
                alt={`Dr. ${doctor.name}`}
                className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-blue-100 dark:border-blue-800"
            />
            <div className="flex-grow">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">{doctor.name}</h3>
                <p className="text-blue-600 dark:text-blue-400 font-semibold">{doctor.specialization}</p>
                <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{doctor.qualifications}</p>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{doctor.experience} years of experience</p>
                <div className="flex items-center mt-2">
                    <span className="text-yellow-500">{'★'.repeat(Math.round(doctor.rating))}{'☆'.repeat(5 - Math.round(doctor.rating))}</span>
                    <span className="text-gray-600 dark:text-gray-400 text-sm ml-2">({doctor.reviews} reviews)</span>
                </div>
                 {onBookAppointment && (
                    <button 
                        onClick={() => onBookAppointment(doctor)}
                        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-700 transition-colors"
                    >
                        Book Appointment
                    </button>
                 )}
            </div>
        </div>
    );
};
