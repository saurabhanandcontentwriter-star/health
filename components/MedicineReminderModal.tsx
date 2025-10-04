import React, { useState, useEffect } from 'react';
import { MedicineOrder, MedicineReminder } from '../types';
import * as db from '../services/dbService';
import { PlusCircleIcon, Trash2Icon } from './IconComponents';

interface MedicineReminderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    userId: number;
    order: MedicineOrder;
    item: MedicineOrder['items'][0];
    existingReminder?: MedicineReminder | null;
}

const MedicineReminderModal: React.FC<MedicineReminderModalProps> = ({ isOpen, onClose, onSave, userId, order, item, existingReminder }) => {
    const [times, setTimes] = useState<string[]>(['09:00']);
    const [newTime, setNewTime] = useState('');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [durationDays, setDurationDays] = useState(7);
    const [error, setError] = useState('');

    useEffect(() => {
        if (existingReminder) {
            setTimes(existingReminder.times);
            setStartDate(existingReminder.startDate);
            setDurationDays(existingReminder.durationDays);
        } else {
            // Reset to defaults when opening for a new reminder
            setTimes(['09:00']);
            setStartDate(new Date().toISOString().split('T')[0]);
            setDurationDays(7);
        }
    }, [existingReminder, isOpen]);

    if (!isOpen) return null;

    const handleAddTime = () => {
        if (newTime && !times.includes(newTime)) {
            setTimes([...times, newTime].sort());
            setNewTime('');
        }
    };

    const handleRemoveTime = (timeToRemove: string) => {
        setTimes(times.filter(t => t !== timeToRemove));
    };

    const handleSave = () => {
        setError('');
        if (times.length === 0) {
            setError('Please add at least one reminder time.');
            return;
        }
        if (durationDays <= 0) {
            setError('Duration must be at least 1 day.');
            return;
        }
        
        db.addMedicineReminder({
            userId,
            orderId: order.id,
            medicineId: item.medicineId,
            medicineName: item.medicineName,
            times,
            startDate,
            durationDays,
        });
        onSave();
    };
    
    const handleDelete = () => {
        if (window.confirm("Are you sure you want to delete this reminder?")) {
            db.deleteMedicineReminder(userId, order.id, item.medicineId);
            onSave(); // Refresh data
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Set Reminder</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">For <span className="font-semibold">{item.medicineName}</span></p>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Reminder Times</label>
                        <div className="space-y-2 mt-1">
                            {times.map(time => (
                                <div key={time} className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
                                    <span className="font-mono text-gray-800 dark:text-gray-200">{time}</span>
                                    <button onClick={() => handleRemoveTime(time)} className="text-red-500 hover:text-red-700">
                                        <Trash2Icon className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                            <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)} className="flex-grow p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                            <button onClick={handleAddTime} className="p-2 bg-teal-100 text-teal-700 rounded-full hover:bg-teal-200">
                                <PlusCircleIcon className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
                            <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                        </div>
                        <div>
                             <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Duration (days)</label>
                            <input type="number" id="duration" value={durationDays} onChange={e => setDurationDays(Number(e.target.value))} min="1" className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                        </div>
                    </div>
                </div>

                {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}

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

export default MedicineReminderModal;
