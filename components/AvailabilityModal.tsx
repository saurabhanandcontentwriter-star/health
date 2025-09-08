import React, { useState, useMemo } from 'react';
import { Doctor } from '../types';
import { generateTimeSlots } from '../utils/timeUtils';
import { ChevronLeftIcon, ChevronRightIcon, ClockIcon } from './IconComponents';

interface AvailabilityModalProps {
    doctor: Doctor;
    onClose: () => void;
    onSelectSlot: (date: string, slot: string) => void;
}

const AvailabilityModal: React.FC<AvailabilityModalProps> = ({ doctor, onClose, onSelectSlot }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const daysInMonth = Array.from({ length: lastDayOfMonth.getDate() }, (_, i) => 
        new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1)
    );

    const paddingDays = Array.from({ length: firstDayOfMonth.getDay() });

    const timeSlots = useMemo(() => {
        if (!selectedDate) return [];
        return generateTimeSlots(doctor.available_time);
    }, [selectedDate, doctor.available_time]);

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
        setSelectedDate(null);
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
        setSelectedDate(null);
    };
    
    const handleDateClick = (day: Date) => {
        if (day < today) return; // Cannot select past dates
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

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-lg md:max-w-xl lg:max-w-2xl transform transition-all" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Select Date & Time</h2>
                        <p className="text-gray-600 dark:text-gray-400">for Dr. {doctor.name}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 text-3xl font-light">&times;</button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Calendar View */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                                <ChevronLeftIcon className="w-5 h-5" />
                            </button>
                            <h3 className="font-semibold text-lg text-gray-700 dark:text-gray-200">
                                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </h3>
                            <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                                <ChevronRightIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-center text-sm">
                            {weekDays.map(day => <div key={day} className="font-medium text-gray-500 dark:text-gray-400 p-2">{day}</div>)}
                            {paddingDays.map((_, index) => <div key={`pad-${index}`} className="p-2"></div>)}
                            {daysInMonth.map(day => {
                                const isToday = day.getTime() === today.getTime();
                                const isSelected = selectedDate?.getTime() === day.getTime();
                                const isPast = day < today;
                                
                                return (
                                    <button 
                                        key={day.toString()}
                                        onClick={() => handleDateClick(day)}
                                        disabled={isPast}
                                        className={`w-10 h-10 rounded-full transition-colors mx-auto flex items-center justify-center
                                            ${isPast ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : ''}
                                            ${!isPast ? 'hover:bg-teal-100 dark:hover:bg-gray-700' : ''}
                                            ${isToday && !isSelected ? 'font-bold text-teal-600' : ''}
                                            ${isSelected ? 'bg-teal-600 text-white font-bold' : ''}
                                        `}
                                    >
                                        {day.getDate()}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    {/* Time Slot View */}
                    <div className="lg:border-l lg:pl-6 dark:border-gray-700">
                        <h3 className="font-semibold text-lg text-gray-700 dark:text-gray-200 mb-4 flex items-center">
                            <ClockIcon className="w-5 h-5 mr-2" />
                            Available Slots
                        </h3>
                        {selectedDate ? (
                            <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto">
                               {timeSlots.length > 0 ? timeSlots.map(slot => (
                                   <button 
                                     key={slot}
                                     onClick={() => handleSlotClick(slot)}
                                     className="px-4 py-2 border border-teal-200 bg-teal-50 text-teal-700 rounded-md text-sm font-medium hover:bg-teal-100 hover:border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 transition-colors dark:bg-gray-700 dark:text-teal-300 dark:border-gray-600 dark:hover:bg-gray-600"
                                   >
                                       {slot}
                                   </button>
                               )) : (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 italic p-2">No slots available for this day.</p>
                               )}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <p className="text-gray-500 dark:text-gray-400">Please select a date from the calendar.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AvailabilityModal;