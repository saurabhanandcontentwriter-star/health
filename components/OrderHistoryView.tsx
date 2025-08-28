import React, { useState } from 'react';
import { MedicineOrder, LabTestBooking } from '../types';
import { MedicineOrderTracker, LabTestBookingTracker } from './OrderTrackers';
import { ArchiveIcon, TestTubeIcon, ShoppingBagIcon } from './IconComponents';

interface OrderHistoryViewProps {
    medicineOrders: MedicineOrder[];
    labTestBookings: LabTestBooking[];
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
};

const OrderHistoryView: React.FC<OrderHistoryViewProps> = ({ medicineOrders, labTestBookings }) => {
    const [activeTab, setActiveTab] = useState<'medicines' | 'labTests'>('medicines');
    
    const sortedMedicineOrders = [...medicineOrders].sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
    const sortedLabTestBookings = [...labTestBookings].sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Order History</h1>

            <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-md border dark:border-gray-700 self-start">
                <nav className="flex items-center space-x-2">
                    <button onClick={() => setActiveTab('medicines')} className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'medicines' ? 'bg-teal-600 text-white' : 'text-gray-600 hover:bg-teal-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
                        <ShoppingBagIcon className="w-5 h-5 mr-2" /> Medicine Orders
                    </button>
                    <button onClick={() => setActiveTab('labTests')} className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'labTests' ? 'bg-teal-600 text-white' : 'text-gray-600 hover:bg-teal-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
                       <TestTubeIcon className="w-5 h-5 mr-2" /> Lab Test Bookings
                    </button>
                </nav>
            </div>

            {activeTab === 'medicines' && (
                <div className="space-y-6">
                    {sortedMedicineOrders.length > 0 ? (
                        sortedMedicineOrders.map(order => (
                            <div key={order.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                                <div className="flex flex-col md:flex-row justify-between md:items-start border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">Order #{order.id}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Placed on {new Date(order.orderDate).toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-lg md:text-xl font-bold text-teal-600 dark:text-teal-400 mt-2 md:mt-0">{formatCurrency(order.totalAmount)}</div>
                                </div>
                                
                                <div className="mb-6">
                                    <MedicineOrderTracker status={order.status} />
                                </div>
                                 <div className="text-sm">
                                    <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Items</h4>
                                     <ul className="space-y-1 list-disc list-inside text-gray-600 dark:text-gray-300">
                                        {order.items.map(item => <li key={item.medicineId}>{item.quantity} x {item.medicineName}</li>)}
                                    </ul>
                                </div>
                            </div>
                        ))
                    ) : (
                         <div className="text-center py-16 px-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                            <ArchiveIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">No Medicine Orders Found</h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">You haven't placed any medicine orders yet.</p>
                        </div>
                    )}
                </div>
            )}
            
            {activeTab === 'labTests' && (
                 <div className="space-y-6">
                    {sortedLabTestBookings.length > 0 ? (
                        sortedLabTestBookings.map(booking => (
                            <div key={booking.id} className={`bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg transition-all ${booking.status === 'Cancelled' ? 'opacity-60 bg-gray-50 dark:bg-gray-800/50' : ''}`}>
                                <div className="flex flex-col md:flex-row justify-between md:items-start border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">{booking.testName}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Booked on {new Date(booking.bookingDate).toLocaleDateString()}</p>
                                    </div>
                                    <div className={`text-lg md:text-xl font-bold mt-2 md:mt-0 ${booking.status === 'Cancelled' ? 'text-gray-500 dark:text-gray-400 line-through' : 'text-teal-600 dark:text-teal-400'}`}>
                                        {formatCurrency(booking.totalAmount)}
                                    </div>
                                </div>
                                
                                {booking.status === 'Cancelled' ? (
                                    <div className="text-center py-4">
                                        <p className="text-red-600 font-bold text-lg">Booking Cancelled</p>
                                    </div>
                                ) : (
                                    <div>
                                        <h4 className="font-semibold text-gray-700 dark:text-gray-200">Booking Status</h4>
                                        <LabTestBookingTracker status={booking.status} />
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                         <div className="text-center py-16 px-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                            <ArchiveIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">No Lab Test Bookings Found</h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">You haven't booked any lab tests yet.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default OrderHistoryView;
