import React, { useState, useEffect } from 'react';
import { LabTest, Address, User, LabTestBookingIn } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { generateQrCode } from '../services/qrService';
import * as db from '../services/dbService';
import { QrCodeIcon, PlusCircleIcon, Trash2Icon, CheckCircleIcon as CheckIcon, XCircleIcon, XIcon } from './IconComponents';
import { GST_RATE } from '../utils/constants';
import AddressEditor from './AddressEditor';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
};

interface LabTestBookingModalProps {
    test: LabTest;
    addresses: Address[];
    user: User;
    onClose: () => void;
    onBook: (data: LabTestBookingIn) => { message: string };
    onDataRefresh: () => void;
}

const LabTestBookingModal: React.FC<LabTestBookingModalProps> = ({ test, addresses, user, onClose, onBook, onDataRefresh }) => {
    const [step, setStep] = useState<'details' | 'payment' | 'confirmed'>('details');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Details state
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
    const [selectedSlot, setSelectedSlot] = useState('');
    const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
    const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
    
    // Payment state
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    
    const availableSlots = ["Now", "Morning (8 AM - 10 AM)", "Afternoon (12 PM - 2 PM)", "Evening (4 PM - 6 PM)"];

    useEffect(() => {
        if (addresses.length > 0 && !selectedAddressId) {
            setSelectedAddressId(addresses[0].id);
        }
    }, [addresses, selectedAddressId]);
    
    const handleProceedToPayment = async () => {
        setError('');
        if (!selectedAddressId) {
            setError('Please select an address for sample collection.'); return;
        }
        if (!selectedSlot) {
            setError('Please select a time slot.'); return;
        }
        
        setIsLoading(true);
        try {
            const totalAmount = test.price * (1 + GST_RATE);
            const url = await generateQrCode(totalAmount.toFixed(2));
            setQrCodeUrl(url);
            setStep('payment');
        } catch (err: any) {
            setError(err.message || 'Could not generate QR code.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleConfirmBooking = () => {
        const selectedAddress = addresses.find(a => a.id === selectedAddressId);
        if (!selectedAddress || !selectedSlot) {
            setError("Something went wrong. Please go back and re-select details.");
            return;
        }
        
        setIsLoading(true);
        setError('');
        try {
            onBook({
                userId: user.id,
                patientName: `${user.firstName} ${user.lastName}`,
                testId: test.id,
                slot: selectedSlot,
                address: selectedAddress
            });
            setStep('confirmed');
        } catch (err: any) {
            setError(err.message || "Failed to book the test. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const renderDetailsForm = () => {
        const isEditing = editingAddressId !== null || isAddingNewAddress;
        const subtotal = test.price;
        const gst = subtotal * GST_RATE;
        const totalAmount = subtotal + gst;

        return (
            <>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Book Lab Test</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">For <span className="font-semibold text-teal-600 dark:text-teal-400">{test.name}</span></p>

                <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                    {/* Address Selection */}
                    <div>
                        <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100 mb-2">1. Select Address for Home Sample Collection</h3>
                        <div className="space-y-3">
                            {addresses.map(address => (
                                editingAddressId === address.id ? (
                                    <AddressEditor key={address.id} user={user} address={address}
                                        onSave={() => { setEditingAddressId(null); onDataRefresh(); }}
                                        onCancel={() => setEditingAddressId(null)}
                                        onDelete={() => { if (window.confirm('Are you sure?')) { db.deleteAddress(address.id); setEditingAddressId(null); onDataRefresh(); }}}
                                    />
                                ) : (
                                <div key={address.id} className={`p-3 rounded-lg border cursor-pointer relative ${selectedAddressId === address.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600'}`} onClick={() => !isEditing && setSelectedAddressId(address.id)}>
                                    <div className="flex items-start">
                                        <input type="radio" name="address" checked={selectedAddressId === address.id} readOnly disabled={isEditing} className="mt-1"/>
                                        <div className="ml-3 text-sm">
                                            <p className="font-semibold text-gray-800 dark:text-gray-100">{address.fullName}</p>
                                            <p className="text-gray-600 dark:text-gray-300">{address.addressLine1}, {address.city} - {address.pincode}</p>
                                        </div>
                                    </div>
                                    {!isEditing && (
                                        <div className="absolute top-2 right-2">
                                            <button onClick={(e) => { e.stopPropagation(); setEditingAddressId(address.id); }} className="text-xs font-semibold text-blue-600 hover:underline">Edit</button>
                                        </div>
                                    )}
                                </div>
                                )
                            ))}
                            {isAddingNewAddress ? (
                                <AddressEditor user={user} onSave={() => { setIsAddingNewAddress(false); onDataRefresh(); }} onCancel={() => setIsAddingNewAddress(false)} />
                            ) : (
                                !isEditing && (
                                    <button onClick={() => setIsAddingNewAddress(true)} className="flex items-center justify-center w-full p-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <PlusCircleIcon className="w-5 h-5 mr-2" /> Add a New Address
                                    </button>
                                )
                            )}
                        </div>
                    </div>
                    {/* Slot Selection */}
                    <div>
                        <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100 mb-2">2. Select Time Slot</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {availableSlots.map(slot => (
                                <button key={slot} onClick={() => setSelectedSlot(slot)} className={`p-3 rounded-lg border text-sm text-left ${selectedSlot === slot ? 'bg-teal-600 text-white border-teal-600' : 'bg-white dark:bg-gray-800 dark:border-gray-600 hover:bg-teal-50 dark:hover:bg-gray-700'}`}>
                                    {slot}
                                </button>
                            ))}
                        </div>
                    </div>
                    {/* Summary */}
                     <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-100">Price Summary</h4>
                        <div className="space-y-1 mt-2 text-sm">
                            <div className="flex justify-between text-gray-700 dark:text-gray-300">
                                <span>Test Price:</span>
                                <span>{formatCurrency(subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-gray-700 dark:text-gray-300">
                                <span>GST ({GST_RATE * 100}%):</span>
                                <span>+ {formatCurrency(gst)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-gray-800 dark:text-gray-100 border-t border-gray-300 dark:border-gray-500 mt-2 pt-2">
                                <span>Total Payable:</span>
                                <span>{formatCurrency(totalAmount)}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                {error && (
                    <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-lg flex items-center justify-between text-sm text-red-700 dark:text-red-300">
                        <div className="flex items-center">
                            <XCircleIcon className="w-5 h-5 mr-3 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                        <button type="button" onClick={() => setError('')} className="p-1 -mr-1 rounded-full text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50" aria-label="Dismiss error">
                            <XIcon className="w-4 h-4" />
                        </button>
                    </div>
                )}

                <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700 mt-6">
                  <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500">Cancel</button>
                  <button type="button" onClick={handleProceedToPayment} disabled={isLoading || isEditing} className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:bg-teal-400 disabled:cursor-not-allowed">
                    {isLoading ? 'Processing...' : 'Proceed to Payment'}
                  </button>
                </div>
            </>
        );
    };
    
    const renderPaymentStep = () => {
        const totalAmount = test.price * (1 + GST_RATE);
        return (
            <div className="flex flex-col items-center text-center">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Complete Your Payment</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Pay <span className="font-bold">{formatCurrency(totalAmount)}</span> to confirm your booking for {test.name}.</p>
                <div className="p-4 my-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 h-64 w-64 flex items-center justify-center">
                {qrCodeUrl ? <img src={qrCodeUrl} alt="Payment QR Code" className="w-56 h-56 object-contain" /> : <p className="text-red-500">{error || "Generating QR..."}</p> }
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Scan with any UPI app</p>
                <div className="flex justify-center space-x-4 pt-6 w-full">
                    <button type="button" onClick={() => setStep('details')} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500">Back</button>
                    <button type="button" onClick={handleConfirmBooking} disabled={isLoading || !qrCodeUrl} className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:bg-teal-400">
                        {isLoading ? 'Confirming...' : "I've Paid, Confirm"}
                    </button>
                </div>
                {error && qrCodeUrl && (
                    <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-lg flex items-center justify-between text-sm text-red-700 dark:text-red-300 w-full">
                        <div className="flex items-center">
                            <XCircleIcon className="w-5 h-5 mr-3 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                         <button type="button" onClick={() => setError('')} className="p-1 -mr-1 rounded-full text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50" aria-label="Dismiss error">
                            <XIcon className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        );
    };
    
    const renderConfirmedStep = () => {
      const handleDownloadReceipt = () => {
        const subtotal = test.price;
        const gst = subtotal * GST_RATE;
        const totalAmount = subtotal + gst;
        const selectedAddress = addresses.find(a => a.id === selectedAddressId);
        
        const receiptContent = `
          <html>
            <head>
              <title>Lab Test Receipt #${new Date().getTime()}</title>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 2rem; background-color: #f9fafb; }
                .container { max-width: 600px; margin: auto; background: white; border: 1px solid #e5e7eb; padding: 2.5rem; border-radius: 0.75rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06); }
                h1 { text-align: center; color: #0d9488; margin-bottom: 0.5rem; }
                .header-sub { text-align: center; color: #6b7280; margin-top:0; margin-bottom: 2rem; }
                .details, .pricing { margin: 2rem 0; }
                .details p, .pricing div { display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid #f3f4f6; }
                .details p:last-child, .pricing div:last-child { border-bottom: none; }
                .details p strong, .pricing strong { color: #111827; }
                .total { font-weight: bold; font-size: 1.2rem; color: #0d9488; border-top: 2px solid #0d9488; margin-top: 0.5rem; }
                .paid-stamp { text-align: center; font-size: 2rem; font-weight: bold; color: #16a34a; border: 5px solid #16a34a; padding: 0.5rem 1rem; margin-top: 2.5rem; transform: rotate(-10deg); opacity: 0.7; border-radius: 0.5rem; display: inline-block; }
                .stamp-container { text-align: center; }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>Lab Test Receipt</h1>
                <p class="header-sub">Bihar Health Connect</p>
                <div class="details">
                  <p><strong>Patient Name:</strong> <span>${user.firstName} ${user.lastName}</span></p>
                  <p><strong>Test Name:</strong> <span>${test.name}</span></p>
                  <p><strong>Collection Slot:</strong> <span>${selectedSlot}</span></p>
                  <p><strong>Collection Address:</strong> <span>${selectedAddress?.addressLine1}, ${selectedAddress?.city} - ${selectedAddress?.pincode}</span></p>
                </div>
                <div class="pricing">
                  <div><span>Test Price:</span> <span>${formatCurrency(subtotal)}</span></div>
                  <div><span>GST (${GST_RATE * 100}%):</span> <span>+ ${formatCurrency(gst)}</span></div>
                  <div class="total"><strong>Total Paid:</strong> <strong>${formatCurrency(totalAmount)}</strong></div>
                </div>
                <div class="stamp-container">
                   <div class="paid-stamp">PAID</div>
                </div>
              </div>
            </body>
          </html>
        `;
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(receiptContent);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
        } else {
            alert('Please allow popups to print the receipt.');
        }
      };

      return (
          <div className="text-center py-8">
              <CheckIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-4">Test Booked Successfully!</h3>
              <p className="text-gray-700 dark:text-gray-300">Your booking for <span className="font-semibold text-teal-700 dark:text-teal-400">{test.name}</span> is confirmed.</p>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Our phlebotomist will visit for sample collection during your selected slot.</p>
              <div className="flex justify-center space-x-4 mt-8">
                  <button onClick={handleDownloadReceipt} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                      Download Receipt
                  </button>
                  <button onClick={onClose} className="px-8 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700">Close</button>
              </div>
          </div>
      );
    };


    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-8 w-full max-w-2xl transform transition-all">
                {step === 'details' && renderDetailsForm()}
                {step === 'payment' && renderPaymentStep()}
                {step === 'confirmed' && renderConfirmedStep()}
            </div>
        </div>
    );
};

export default LabTestBookingModal;