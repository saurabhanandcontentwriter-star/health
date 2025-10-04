import React, { useState, useEffect } from 'react';
import { LabTestBooking, LabTestReminder } from '../types';
import * as db from '../services/dbService';

interface LabTestReminderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    userId: number;
    booking: LabTestBooking;
    existingReminder?: LabTestReminder | null;
}

const LabTestReminderModal: React.FC<LabTestReminderModalProps> = ({ isOpen, onClose, onSave, userId, booking, existingReminder }) => {
    const [remindBefore, setRemindBefore] = useState(60);

    useEffect(() => {
        if (existingReminder) {
            setRemindBefore(existingReminder.remindBeforeMinutes);
        } else {
            setRemindBefore(60); // Default to 1 hour
        }
    }, [existingReminder, isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        db.addLabTestReminder({
            userId,
            labTestBookingId: booking.id,
            testName: booking.testName,
            remindBeforeMinutes: remindBefore,
        });
        onSave();
    };

    const handleDelete = () => {
        if (window.confirm("Are you sure you want to delete this reminder?")) {
            db.deleteLabTestReminder(userId, booking.id);
            onSave();
        }
    };
    
    const reminderOptions = [
        { label: '30 minutes before', value: 30 },
        { label: '1 hour before', value: 60 },
        { label: '2 hours before', value: 120 },
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Set Reminder</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">For <span className="font-semibold">{booking.testName}</span></p>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Remind me:</label>
                    {reminderOptions.map(option => (
                        <div key={option.value} className="flex items-center">
                            <input
                                id={`reminder-${option.value}`}
                                type="radio"
                                name="reminder"
                                value={option.value}
                                checked={remindBefore === option.value}
                                onChange={() => setRemindBefore(option.value)}
                                className="h-4 w-4 text-teal-600 border-gray-300 focus:ring-teal-500"
                            />
                            <label htmlFor={`reminder-${option.value}`} className="ml-3 block text-sm text-gray-900 dark:text-gray-200">
                                {option.label}
                            </label>
                        </div>
                    ))}
                </div>

                <div className="flex justify-between items-center mt-6 pt-4 border-t dark:border-gray-700">
                    {existingReminder ? (
                        <button onClick={handleDelete} className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300">
                            Delete Reminder
                        </button>
                    ) : <div></div>}
                    <div className="flex space-x-2">
                        <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-100">Cancel</button>
                        <button onClick={handleSave} className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700">Save Reminder</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LabTestReminderModal;
