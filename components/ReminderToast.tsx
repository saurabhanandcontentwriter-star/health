

import React, { useEffect } from 'react';
import { XIcon } from './IconComponents';

interface ReminderToastProps {
    reminder: {
        id: string;
        title: string;
        message: string;
        icon: React.ReactNode;
    };
    onDismiss: (id: string) => void;
}

const ReminderToast: React.FC<ReminderToastProps> = ({ reminder, onDismiss }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss(reminder.id);
        }, 10000); // Auto-dismiss after 10 seconds

        return () => clearTimeout(timer);
    }, [reminder.id, onDismiss]);
    
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-4 w-full max-w-sm border-l-4 border-teal-500 animate-slide-in-right" role="alert" aria-live="assertive">
            <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                    {reminder.icon}
                </div>
                <div className="ml-3 flex-1">
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{reminder.title}</p>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: reminder.message }} />
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                    <button onClick={() => onDismiss(reminder.id)} className="inline-flex text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-300">
                        <span className="sr-only">Close</span>
                        <XIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReminderToast;
