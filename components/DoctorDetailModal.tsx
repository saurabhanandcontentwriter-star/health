import React from 'react';
import { Doctor } from '../types';
import { StethoscopeIcon, MapPinIcon, ClockIcon, VideoIcon, CalendarIcon } from './IconComponents';

interface DoctorDetailModalProps {
  doctor: Doctor;
  onClose: () => void;
  onBookSlot: (doctor: Doctor) => void;
  onVideoCall: (doctor: Doctor) => void;
}

const DoctorDetailModal: React.FC<DoctorDetailModalProps> = ({ doctor, onClose, onBookSlot, onVideoCall }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 animate-fade-in-fast" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg transform transition-all flex flex-col md:flex-row" 
        onClick={e => e.stopPropagation()}
      >
        <div className="md:w-1/3">
          <img 
            src={doctor.imageUrl.replace('100x100', '400x400')}
            alt={doctor.name} 
            className="w-full h-48 md:h-full object-cover rounded-t-xl md:rounded-l-xl md:rounded-t-none" 
          />
        </div>
        <div className="p-6 flex-grow flex flex-col justify-between md:w-2/3">
          <div>
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{doctor.name}</h2>
                    <div className="flex items-center mt-2 text-md text-teal-600 dark:text-teal-400 font-medium">
                        <StethoscopeIcon className="h-5 w-5 mr-2" />
                        <p>{doctor.specialty}</p>
                    </div>
                </div>
                 <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 text-3xl font-light -mt-2 -mr-2">&times;</button>
            </div>

            <div className="mt-4 border-t border-gray-100 dark:border-gray-700 pt-4 space-y-3">
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <MapPinIcon className="h-5 w-5 mr-2 text-gray-400" />
                    <p>{doctor.location}</p>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <ClockIcon className="h-5 w-5 mr-2 text-gray-400" />
                    <p>{doctor.available_time}</p>
                </div>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
            <div className="grid grid-cols-2 gap-4">
                <button
                    onClick={() => onBookSlot(doctor)}
                    className="w-full flex items-center justify-center px-4 py-2.5 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 shadow-md transition-colors"
                >
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    Book Slot
                </button>
                <button
                    onClick={() => onVideoCall(doctor)}
                    className="w-full flex items-center justify-center px-4 py-2.5 bg-green-100 text-green-800 font-semibold rounded-lg hover:bg-green-200 transition-colors dark:bg-green-900/50 dark:text-green-300 dark:hover:bg-green-900"
                >
                    <VideoIcon className="w-4 h-4 mr-2" />
                    Video Call
                </button>
            </div>
          </div>
        </div>
      </div>
       <style>{`
            @keyframes fade-in-fast {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            .animate-fade-in-fast { animation: fade-in-fast 0.2s ease-out forwards; }
        `}</style>
    </div>
  );
};

export default DoctorDetailModal;
