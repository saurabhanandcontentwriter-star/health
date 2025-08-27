import React, { useState } from 'react';
import { LabTest, LabTestBooking, User, Address, LabTestBookingIn } from '../types';
import LabTestCard from './LabTestCard';
import LabTestBookingModal from './LabTestBookingModal';
import { TestTubeIcon, ArchiveIcon, CheckCircleIcon, XCircleIcon } from './IconComponents';
import * as db from '../services/dbService';


interface LabTestsViewProps {
  tests: LabTest[];
  bookings: LabTestBooking[];
  user: User;
  addresses: Address[];
  onBookTest: (data: LabTestBookingIn) => { message: string };
  onDataRefresh: () => void;
}

const BookingStatusTracker: React.FC<{ status: LabTestBooking['status'] }> = ({ status }) => {
    const statuses: LabTestBooking['status'][] = ['Booked', 'Sample Collected', 'Report Ready'];
    const currentStatusIndex = statuses.indexOf(status);

    return (
        <div className="w-full my-4">
            <div className="flex justify-between">
                {statuses.map((s, index) => (
                    <div key={s} className="flex-1 text-center">
                        <div className={`mx-auto h-8 w-8 rounded-full flex items-center justify-center border-2 ${index <= currentStatusIndex ? 'bg-teal-600 border-teal-600 text-white' : 'bg-gray-100 border-gray-300 text-gray-400'}`}>
                           <CheckCircleIcon className="h-4 w-4" />
                        </div>
                        <p className={`text-xs mt-1 ${index <= currentStatusIndex ? 'font-semibold text-teal-700' : 'text-gray-500'}`}>{s}</p>
                    </div>
                ))}
            </div>
            <div className="flex items-center mt-[-20px] px-8 sm:px-16">
                 <div className={`flex-1 h-1 rounded ${currentStatusIndex > 0 ? 'bg-teal-600' : 'bg-gray-300'}`}></div>
                 <div className={`flex-1 h-1 rounded ${currentStatusIndex > 1 ? 'bg-teal-600' : 'bg-gray-300'}`}></div>
            </div>
        </div>
    );
};


const LabTestsView: React.FC<LabTestsViewProps> = ({ tests, bookings, user, addresses, onBookTest, onDataRefresh }) => {
    const [activeTab, setActiveTab] = useState<'browse' | 'bookings'>('browse');
    const [selectedTest, setSelectedTest] = useState<LabTest | null>(null);
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const handleBookClick = (test: LabTest) => {
        setSelectedTest(test);
    };

    const handleCloseModal = () => {
        setSelectedTest(null);
    };

    const handleBookAndNotify = (data: LabTestBookingIn) => {
        try {
            const result = onBookTest(data);
            showNotification(result.message, 'success');
            return result;
        } catch (err: any) {
            showNotification(err.message || "Failed to book test.", 'error');
            throw err;
        }
    };

    const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 4000);
    };
    
    const handleCancelBooking = (bookingId: number) => {
        if (window.confirm("Are you sure you want to cancel this booking?")) {
            try {
                db.updateLabTestBookingStatus(bookingId, 'Cancelled');
                onDataRefresh();
                showNotification("Booking cancelled successfully.", "success");
            } catch (error) {
                console.error("Failed to cancel booking:", error);
                showNotification("Could not cancel booking. Please try again.", "error");
            }
        }
    };

    return (
        <div className="space-y-6">
            {notification && (
                <div className={`fixed top-24 right-8 z-50 p-4 rounded-lg shadow-lg text-white ${notification.type === 'success' ? 'bg-teal-600' : 'bg-red-600'}`}>
                    {notification.message}
                </div>
            )}
            
            {selectedTest && (
                <LabTestBookingModal
                    test={selectedTest}
                    addresses={addresses}
                    user={user}
                    onClose={handleCloseModal}
                    onBook={handleBookAndNotify}
                    onDataRefresh={onDataRefresh}
                />
            )}

            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-800">Lab Tests & Health Packages</h1>
                <div className="bg-white p-1 rounded-lg shadow-sm border">
                    <nav className="flex items-center space-x-1">
                        <button onClick={() => setActiveTab('browse')} className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'browse' ? 'bg-teal-600 text-white' : 'text-gray-600 hover:bg-teal-100'}`}>
                            <TestTubeIcon className="w-5 h-5 mr-2" /> Browse Tests
                        </button>
                        <button onClick={() => setActiveTab('bookings')} className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'bookings' ? 'bg-teal-600 text-white' : 'text-gray-600 hover:bg-teal-100'}`}>
                            <ArchiveIcon className="w-5 h-5 mr-2" /> My Bookings
                        </button>
                    </nav>
                </div>
            </div>

            {activeTab === 'browse' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tests.map(test => (
                        <LabTestCard key={test.id} test={test} onBook={handleBookClick} />
                    ))}
                </div>
            )}

            {activeTab === 'bookings' && (
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-700">Your Lab Test Bookings</h2>
                    {bookings.length > 0 ? (
                        bookings.map(booking => (
                            <div key={booking.id} className={`bg-white p-6 rounded-xl shadow-lg transition-all ${booking.status === 'Cancelled' ? 'opacity-60 bg-gray-50' : ''}`}>
                                <div className="flex flex-col md:flex-row justify-between md:items-start border-b border-gray-200 pb-4 mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-800">{booking.testName}</h3>
                                        <p className="text-sm text-gray-500">Booked on {new Date(booking.bookingDate).toLocaleDateString()}</p>
                                        <p className="text-sm text-gray-500">Slot: {booking.slot}</p>
                                    </div>
                                    <div className={`text-lg md:text-xl font-bold mt-2 md:mt-0 ${booking.status === 'Cancelled' ? 'text-gray-500 line-through' : 'text-teal-600'}`}>
                                        Amount Paid: {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(booking.totalAmount)}
                                    </div>
                                </div>
                                
                                {booking.status === 'Cancelled' ? (
                                    <div className="text-center py-4">
                                        <p className="text-red-600 font-bold text-lg">Booking Cancelled</p>
                                    </div>
                                ) : (
                                    <div>
                                        <h4 className="font-semibold text-gray-700">Booking Status</h4>
                                        <BookingStatusTracker status={booking.status} />
                                    </div>
                                )}

                                {booking.status === 'Booked' && (
                                    <div className="mt-4 pt-4 border-t border-gray-200 text-right">
                                        <button 
                                            onClick={() => handleCancelBooking(booking.id)}
                                            className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                                        >
                                            <XCircleIcon className="w-5 h-5 mr-2" />
                                            Cancel Booking
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                         <div className="text-center py-16 px-4 bg-white rounded-xl shadow-lg">
                            <ArchiveIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-lg font-medium text-gray-900">No Bookings Found</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                You haven't booked any lab tests yet.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default LabTestsView;