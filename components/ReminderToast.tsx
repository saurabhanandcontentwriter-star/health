
import React, { useEffect } from 'react';
import { Appointment } from '../types';
import { ClockIcon, XIcon } from './IconComponents';

interface ReminderToastProps {
    appointment: Appointment;
    onDismiss: (id: number) => void;
}

const ReminderToast: React.FC<ReminderToastProps> = ({ appointment, onDismiss }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss(appointment.id);
        }, 10000); // Auto-dismiss after 10 seconds

        return () => clearTimeout(timer);
    }, [appointment.id, onDismiss]);
    
    const isToday = new Date().toISOString().split('T')[0] === appointment.appointment_date;
    const reminderText = isToday 
        ? `at ${appointment.appointment_time} today.`
        : `at ${appointment.appointment_time} tomorrow.`;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-4 w-full max-w-sm border-l-4 border-teal-500 animate-slide-in-right" role="alert" aria-live="assertive">
            <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                    <ClockIcon className="h-6 w-6 text-teal-500" />
                </div>
                <div className="ml-3 flex-1">
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100">Appointment Reminder</p>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                        You have an upcoming appointment with <span className="font-semibold">{appointment.doctor_name}</span> {reminderText}
                    </p>
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                    <button onClick={() => onDismiss(appointment.id)} className="inline-flex text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-300">
                        <span className="sr-only">Close</span>
                        <XIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReminderToast;
