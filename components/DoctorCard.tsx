


import React from 'react';
import { Doctor } from '../types';
import { StethoscopeIcon, MapPinIcon, ClockIcon } from './IconComponents';

interface DoctorCardProps {
  doctor: Doctor;
  onClick: (doctor: Doctor) => void;
}

const DoctorCard: React.FC<DoctorCardProps> = ({ doctor, onClick }) => {
  return (
    <button
      onClick={() => onClick(doctor)}
      className="w-full text-left bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 dark:border dark:border-gray-700 dark:hover:border-teal-500 flex flex-col focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
      aria-label={`View details for Dr. ${doctor.name}`}
    >
      <div className="p-6 flex-grow">
        <div className="flex items-start justify-between">
            <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Dr. {doctor.name}</h3>
                <div className="flex items-center mt-2">
                    <StethoscopeIcon className="h-5 w-5 text-teal-500" />
                    <p className="ml-2 text-md text-teal-600 dark:text-teal-400 font-medium">{doctor.specialty}</p>
                </div>
            </div>
            <div className="bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200 text-xs font-semibold px-2.5 py-1 rounded-full">
                Available
            </div>
        </div>
        
        <div className="mt-4 border-t border-gray-100 dark:border-gray-700 pt-4 space-y-3">
            <div className="flex items-center text-gray-600 dark:text-gray-400">
                <MapPinIcon className="h-5 w-5 text-gray-400" />
                <p className="ml-2">{doctor.location}</p>
            </div>
            <div className="flex items-center text-gray-600 dark:text-gray-400">
                <ClockIcon className="h-5 w-5 text-gray-400" />
                <p className="ml-2">{doctor.available_time}</p>
            </div>
        </div>
      </div>

      <div className="px-6 pb-4 pt-2 bg-gray-50/70 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700">
        <p className="w-full text-center text-sm font-semibold text-teal-600 dark:text-teal-400">
            View Details & Book
        </p>
      </div>
    </button>
  );
};

export default DoctorCard;