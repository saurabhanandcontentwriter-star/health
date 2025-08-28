
import React, { useState, useMemo } from 'react';
import { Doctor } from '../types';
import { StethoscopeIcon, MapPinIcon, ClockIcon, VideoIcon } from './IconComponents';
import { generateTimeSlots } from '../utils/timeUtils';

interface DoctorCardProps {
  doctor: Doctor;
  onBook: (doctor: Doctor, slot: string) => void;
  onVideoCall: (doctor: Doctor) => void;
}

const DoctorCard: React.FC<DoctorCardProps> = ({ doctor, onBook, onVideoCall }) => {
  const [showAllSlots, setShowAllSlots] = useState(false);
  const slots = useMemo(() => generateTimeSlots(doctor.available_time), [doctor.available_time]);

  const SLOTS_TO_SHOW = 4;
  const visibleSlots = showAllSlots ? slots : slots.slice(0, SLOTS_TO_SHOW);

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
        <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Book a Slot</h4>
            <button
                onClick={() => onVideoCall(doctor)}
                className="flex items-center px-3 py-1.5 bg-green-100 text-green-800 text-sm font-semibold rounded-lg hover:bg-green-200 transition-colors dark:bg-green-900/50 dark:text-green-300 dark:hover:bg-green-900"
                aria-label={`Start video call with ${doctor.name}`}
            >
                <VideoIcon className="w-4 h-4 mr-2" />
                Video Call
            </button>
        </div>
        {slots.length > 0 ? (
          <div className="flex flex-wrap gap-2 items-center">
            {visibleSlots.map(slot => (
              <button
                key={slot}
                onClick={() => onBook(doctor, slot)}
                className="px-3 py-1.5 border border-teal-200 bg-teal-50 text-teal-700 rounded-md text-sm font-medium hover:bg-teal-100 hover:border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 transition-colors dark:bg-gray-700 dark:text-teal-300 dark:border-gray-600 dark:hover:bg-gray-600"
                aria-label={`Book appointment at ${slot}`}
              >
                {slot}
              </button>
            ))}
            {slots.length > SLOTS_TO_SHOW && (
              <button
                onClick={() => setShowAllSlots(!showAllSlots)}
                className="px-3 py-1.5 text-teal-600 rounded-md text-sm font-semibold hover:text-teal-800 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:text-teal-400 dark:hover:text-teal-300"
              >
                {showAllSlots ? 'Show Less' : `+${slots.length - SLOTS_TO_SHOW} more`}
              </button>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">No time slots available for booking.</p>
        )}
      </div>
    </div>
  );
};

export default DoctorCard;
