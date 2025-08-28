import React from 'react';
import { MedicineOrder, LabTestBooking } from '../types';
import { ArchiveIcon, TruckIcon, CheckCircleIcon } from './IconComponents';

export const MedicineOrderTracker: React.FC<{ status: MedicineOrder['status'] }> = ({ status }) => {
    const statuses: MedicineOrder['status'][] = ['Processing', 'Shipped', 'Delivered'];
    const currentStatusIndex = statuses.indexOf(status);

    return (
        <div className="w-full">
            <div className="flex justify-between">
                {statuses.map((s, index) => (
                    <div key={s} className="flex-1 text-center">
                        <div className={`mx-auto h-8 w-8 rounded-full flex items-center justify-center border-2 ${index <= currentStatusIndex ? 'bg-teal-600 border-teal-600 text-white' : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-400'}`}>
                            {index === 0 && <ArchiveIcon className="h-4 w-4" />}
                            {index === 1 && <TruckIcon className="h-4 w-4" />}
                            {index === 2 && <CheckCircleIcon className="h-4 w-4" />}
                        </div>
                        <p className={`text-xs mt-1 ${index <= currentStatusIndex ? 'font-semibold text-teal-700 dark:text-teal-400' : 'text-gray-500 dark:text-gray-400'}`}>{s}</p>
                    </div>
                ))}
            </div>
            <div className="flex items-center mt-[-20px] px-8 sm:px-16">
                 <div className={`flex-1 h-1 rounded ${currentStatusIndex > 0 ? 'bg-teal-600' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                 <div className={`flex-1 h-1 rounded ${currentStatusIndex > 1 ? 'bg-teal-600' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
            </div>
        </div>
    );
};

export const LabTestBookingTracker: React.FC<{ status: LabTestBooking['status'] }> = ({ status }) => {
    const statuses: LabTestBooking['status'][] = ['Booked', 'Sample Collected', 'Report Ready'];
    const currentStatusIndex = statuses.indexOf(status);

    return (
        <div className="w-full my-4">
            <div className="flex justify-between">
                {statuses.map((s, index) => (
                    <div key={s} className="flex-1 text-center">
                        <div className={`mx-auto h-8 w-8 rounded-full flex items-center justify-center border-2 ${index <= currentStatusIndex ? 'bg-teal-600 border-teal-600 text-white' : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-400'}`}>
                           <CheckCircleIcon className="h-4 w-4" />
                        </div>
                        <p className={`text-xs mt-1 ${index <= currentStatusIndex ? 'font-semibold text-teal-700 dark:text-teal-400' : 'text-gray-500 dark:text-gray-400'}`}>{s}</p>
                    </div>
                ))}
            </div>
            <div className="flex items-center mt-[-20px] px-8 sm:px-16">
                 <div className={`flex-1 h-1 rounded ${currentStatusIndex > 0 ? 'bg-teal-600' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                 <div className={`flex-1 h-1 rounded ${currentStatusIndex > 1 ? 'bg-teal-600' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
            </div>
        </div>
    );
};
