import React from 'react';
import { MedicineOrder, LabTestBooking } from '../types';
import { ArchiveIcon, TruckIcon, CheckCircleIcon, PhoneOffIcon } from './IconComponents';

export const MedicineOrderTracker: React.FC<{ order: MedicineOrder }> = ({ order }) => {
    const statuses: MedicineOrder['status'][] = ['Processing', 'Shipped', 'Delivered'];
    const currentStatusIndex = statuses.indexOf(order.status);

    return (
        <div className="w-full">
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
            {order.deliveryBoy && (
                <div className="mt-4 p-3 bg-teal-50 dark:bg-teal-900/50 rounded-lg text-sm text-center">
                    Delivery by <span className="font-bold text-teal-800 dark:text-teal-300">{order.deliveryBoy.name}</span> ({order.deliveryBoy.phone})
                </div>
            )}
             <div className="mt-4 text-xs space-y-2">
                <p className="font-semibold text-gray-600 dark:text-gray-300">Tracking History:</p>
                {order.trackingHistory.map((entry, index) => (
                    <div key={index} className="flex items-start">
                        <div className="font-mono text-gray-500 dark:text-gray-400 mr-3">{new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        <div className="text-gray-700 dark:text-gray-200">
                            <span className="font-medium">{entry.status}</span>
                            {entry.notes && <span className="text-gray-500 dark:text-gray-400 italic"> - {entry.notes}</span>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const LabTestBookingTracker: React.FC<{ booking: LabTestBooking }> = ({ booking }) => {
    const statuses: LabTestBooking['status'][] = ['Booked', 'Sample Collected', 'Report Ready'];
    const currentStatusIndex = statuses.indexOf(booking.status);

    return (
        <div className="w-full my-4">
            <div className="w-full">
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
            {booking.deliveryBoy && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/50 rounded-lg text-sm text-center">
                    Phlebotomist: <span className="font-bold text-blue-800 dark:text-blue-300">{booking.deliveryBoy.name}</span> ({booking.deliveryBoy.phone})
                </div>
            )}
             <div className="mt-4 text-xs space-y-2">
                <p className="font-semibold text-gray-600 dark:text-gray-300">Tracking History:</p>
                {booking.trackingHistory.map((entry, index) => (
                    <div key={index} className="flex items-start">
                        <div className="font-mono text-gray-500 dark:text-gray-400 mr-3">{new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        <div className="text-gray-700 dark:text-gray-200">
                            <span className="font-medium">{entry.status}</span>
                             {entry.notes && <span className="text-gray-500 dark:text-gray-400 italic"> - {entry.notes}</span>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};