import React, { useState, useMemo } from 'react';
import { Doctor } from '../types';
import { StethoscopeIcon, MapPinIcon, ClockIcon, VideoIcon, CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from './IconComponents';
import { generateTimeSlots } from '../utils/timeUtils';

interface DoctorDetailModalProps {
  doctor: Doctor;
  onClose: () => void;
  onSelectSlot: (date: string, slot: string) => void;
  onVideoCall: (doctor: Doctor) => void;
}

const DoctorDetailModal: React.FC<DoctorDetailModalProps> = ({ doctor, onClose, onSelectSlot, onVideoCall }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [weekStartDate, setWeekStartDate] = useState(today);
    const [selectedDate, setSelectedDate] = useState<Date | null>(today);

    const weekDays = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(weekStartDate);
        date.setDate(date.getDate() + i);
        return date;
    });

    const timeSlots = useMemo(() => {
        if (!selectedDate) return [];
        return generateTimeSlots(doctor.available_time);
    }, [selectedDate, doctor.available_time]);

    const handlePrevWeek = () => {
        const newDate = new Date(weekStartDate);
        newDate.setDate(newDate.getDate() - 7);
        if (newDate >= today) {
            setWeekStartDate(newDate);
            setSelectedDate(null);
        }
    };

    const handleNextWeek = () => {
        const newDate = new Date(weekStartDate);
        newDate.setDate(newDate.getDate() + 7);
        setWeekStartDate(newDate);
        setSelectedDate(null);
    };
    
    const handleDateClick = (day: Date) => {
        if (day < today) return;
        setSelectedDate(day);
    }
    
    const handleSlotClick = (slot: string) => {
        if (selectedDate) {
            const yyyy = selectedDate.getFullYear();
            const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const dd = String(selectedDate.getDate()).padStart(2, '0');
            onSelectSlot(`${yyyy}-${mm}-${dd}`, slot);
        }
    }

    const dayShortNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];


  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 animate-fade-in-fast" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-xl transform transition-all flex flex-col md:flex-row" 
        onClick={e => e.stopPropagation()}
      >
        <div className="md:w-1/3">
          <img 
            src={doctor.imageUrl.replace('100x100', '400x400')}
            alt={doctor.name} 
            className="w-full h-48 md:h-full object-cover rounded-t-xl md:rounded-l-xl md:rounded-t-none" 
          />
        </div>
        <div className="p-6 flex-grow md:w-2/3 max-h-[80vh] overflow-y-auto">
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
                <h3 className="font-semibold text-lg text-gray-700 dark:text-gray-200 mb-4 flex items-center">
                    <CalendarIcon className="w-5 h-5 mr-2" />
                    Book an Appointment
                </h3>
                 <div className="flex justify-between items-center mb-2">
                    <button onClick={handlePrevWeek} disabled={weekStartDate.getTime() <= today.getTime()} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">
                        <ChevronLeftIcon className="w-5 h-5" />
                    </button>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        {weekStartDate.toLocaleDateString('default', { month: 'short', day: 'numeric' })} - {weekDays[6].toLocaleDateString('default', { month: 'short', day: 'numeric' })}
                    </p>
                    <button onClick={handleNextWeek} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                        <ChevronRightIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-sm mb-4">
                    {weekDays.map(day => {
                        const isSelected = selectedDate?.getTime() === day.getTime();
                        const isPast = day < today;
                        return (
                            <div key={day.toISOString()}>
                                <p className="text-xs text-gray-400">{dayShortNames[day.getDay()]}</p>
                                <button
                                    onClick={() => handleDateClick(day)}
                                    disabled={isPast}
                                    className={`w-9 h-9 mt-1 rounded-full text-sm transition-colors mx-auto flex items-center justify-center
                                        ${isPast ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : ''}
                                        ${!isPast ? 'hover:bg-teal-100 dark:hover:bg-gray-700' : ''}
                                        ${isSelected ? 'bg-teal-600 text-white font-bold' : 'text-gray-700 dark:text-gray-200'}
                                    `}
                                >
                                    {day.getDate()}
                                </button>
                            </div>
                        )
                    })}
                </div>
                
                {selectedDate && (
                    <div className="animate-fade-in-fast">
                        <h4 className="font-semibold text-gray-600 dark:text-gray-300 text-sm mb-2">
                            Available slots for {selectedDate.toLocaleDateString('default', { weekday: 'long', day: 'numeric' })}:
                        </h4>
                        <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                            {timeSlots.length > 0 ? timeSlots.map(slot => (
                                <button 
                                    key={slot}
                                    onClick={() => handleSlotClick(slot)}
                                    className="px-4 py-2 border border-teal-200 bg-teal-50 text-teal-700 rounded-md text-sm font-medium hover:bg-teal-100 hover:border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 transition-colors dark:bg-gray-700 dark:text-teal-300 dark:border-gray-600 dark:hover:bg-gray-600"
                                >
                                    {slot}
                                </button>
                            )) : (
                                <p className="text-sm text-gray-500 dark:text-gray-400 italic p-2">No slots available.</p>
                            )}
                        </div>
                    </div>
                )}
                
                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                    <button
                        onClick={() => onVideoCall(doctor)}
                        className="w-full flex items-center justify-center px-4 py-2.5 bg-green-100 text-green-800 font-semibold rounded-lg hover:bg-green-200 transition-colors dark:bg-green-900/50 dark:text-green-300 dark:hover:bg-green-900"
                    >
                        <VideoIcon className="w-4 h-4 mr-2" />
                        Start Instant Video Call
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
