

import React from 'react';
import { Doctor } from '../types';
import { StethoscopeIcon, MapPinIcon, ClockIcon, VideoIcon, CalendarIcon } from './IconComponents';

interface DoctorCardProps {
  doctor: Doctor;
  onViewAvailability: (doctor: Doctor) => void;
  onVideoCall: (doctor: Doctor) => void;
}

const DoctorCard: React.FC<DoctorCardProps> = ({ doctor, onViewAvailability, onVideoCall }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 dark:border dark:border-gray-700 dark:hover:border-teal-500 flex flex-col">
      <div className="p-6 flex-grow">
        <div className="flex items-start justify-between">
            <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{doctor.name}</h3>
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

      <div className="px-6 pb-6 pt-4 bg-gray-50/70 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700">
        <div className="grid grid-cols-2 gap-4">
            <button
                onClick={() => onViewAvailability(doctor)}
                className="w-full flex items-center justify-center px-4 py-2.5 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 shadow-md transition-colors"
                aria-label={`Check availability for ${doctor.name}`}
            >
                <CalendarIcon className="w-4 h-4 mr-2" />
                Book Slot
            </button>
            <button
                onClick={() => onVideoCall(doctor)}
                className="w-full flex items-center justify-center px-4 py-2.5 bg-green-100 text-green-800 font-semibold rounded-lg hover:bg-green-200 transition-colors dark:bg-green-900/50 dark:text-green-300 dark:hover:bg-green-900"
                aria-label={`Start video call with ${doctor.name}`}
            >
                <VideoIcon className="w-4 h-4 mr-2" />
                Video Call
            </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorCard;