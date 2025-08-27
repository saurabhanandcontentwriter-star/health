import React, { useState, useEffect } from 'react';
import { LabTest, Address, User, LabTestBookingIn } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { generateQrCode } from '../services/qrService';
import * as db from '../services/dbService';
import { QrCodeIcon, PlusCircleIcon, Trash2Icon, CheckCircleIcon as CheckIcon } from './IconComponents';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
};

interface AddressEditorProps {
    user: User;
    address?: Address;
    onSave: () => void;
    onCancel: () => void;
    onDelete?: () => void;
}

const AddressEditor: React.FC<AddressEditorProps> = ({ user, address, onSave, onCancel, onDelete }) => {
    const [formData, setFormData] = useState({
        fullName: address?.fullName || `${user.firstName} ${user.lastName}`,
        phone: address?.phone || user.phone,
        addressLine1: address?.addressLine1 || '',
        addressLine2: address?.addressLine2 || '',
        city: address?.city || '',
        state: address?.state || 'Bihar',
        pincode: address?.pincode || '',
        type: address?.type || 'Home' as 'Home' | 'Work',
    });
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!formData.fullName || !formData.phone || !formData.addressLine1 || !formData.city || !formData.state || !formData.pincode) {
            setError('Please fill all required fields.');
            return;
        }
        if (!/^\d{10}$/.test(formData.phone.replace(/[^0-9]/g, ''))) {
             setError('Please enter a valid 10-digit phone number.');
             return;
        }
         if (!/^\d{6}$/.test(formData.pincode)) {
             setError('Please enter a valid 6-digit pincode.');
             return;
        }

        const dataToSave = { ...formData, userId: user.id };

        try {
            if (address) {
                db.updateAddress(address.id, dataToSave);
            } else {
                db.addAddress(dataToSave);
            }
            onSave();
        } catch (err: any) {
            setError(err.message || 'Failed to save address.');
        }
    };

    return (
        <form onSubmit={handleSave} className="p-4 border-2 border-blue-500 rounded-lg bg-white space-y-4">
            <div className="flex justify-between items-center">
                <h4 className="font-semibold text-lg text-gray-800">{address ? 'Edit Address' : 'Add New Address'}</h4>
                {onDelete && (
                    <button type="button" onClick={onDelete} className="text-red-600 hover:text-red-800" aria-label="Delete address">
                        <Trash2Icon className="w-5 h-5" />
                    </button>
                )}
            </div>
             {error && <p className="text-red-600 text-sm text-center bg-red-50 p-2 rounded-md">{error}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500" required />
                </div>
                 <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500" required />
                </div>
            </div>
             <div>
                <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700">Address Line 1</label>
                <input type="text" name="addressLine1" value={formData.addressLine1} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" required placeholder="House No., Building Name"/>
            </div>
             <div>
                <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700">Address Line 2</label>
                <input type="text" name="addressLine2" value={formData.addressLine2} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" placeholder="Road Name, Area, Colony"/>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                    <input type="text" name="city" value={formData.city} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" required />
                </div>
                 <div>
                    <label htmlFor="pincode" className="block text-sm font-medium text-gray-700">Pincode</label>
                    <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" required />
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700">State</label>
                    <input type="text" name="state" value={formData.state} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" required />
                </div>
                 <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700">Address Type</label>
                    <select name="type" value={formData.type} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500">
                        <option>Home</option>
                        <option>Work</option>
                    </select>
                </div>
            </div>
            <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700">Save Address</button>
            </div>
        </form>
    );
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
            const url = await generateQrCode(test.price.toFixed(2));
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
        return (
            <>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Book Lab Test</h2>
                <p className="text-gray-600 mb-6">For <span className="font-semibold text-teal-600">{test.name}</span></p>

                <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                    {/* Address Selection */}
                    <div>
                        <h3 className="font-semibold text-lg text-gray-800 mb-2">1. Select Address for Home Sample Collection</h3>
                        <div className="space-y-3">
                            {addresses.map(address => (
                                editingAddressId === address.id ? (
                                    <AddressEditor key={address.id} user={user} address={address}
                                        onSave={() => { setEditingAddressId(null); onDataRefresh(); }}
                                        onCancel={() => setEditingAddressId(null)}
                                        onDelete={() => { if (window.confirm('Are you sure?')) { db.deleteAddress(address.id); setEditingAddressId(null); onDataRefresh(); }}}
                                    />
                                ) : (
                                <div key={address.id} className={`p-3 rounded-lg border cursor-pointer relative ${selectedAddressId === address.id ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`} onClick={() => !isEditing && setSelectedAddressId(address.id)}>
                                    <div className="flex items-start">
                                        <input type="radio" name="address" checked={selectedAddressId === address.id} readOnly disabled={isEditing} className="mt-1"/>
                                        <div className="ml-3 text-sm">
                                            <p className="font-semibold">{address.fullName}</p>
                                            <p className="text-gray-600">{address.addressLine1}, {address.city} - {address.pincode}</p>
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
                                    <button onClick={() => setIsAddingNewAddress(true)} className="flex items-center justify-center w-full p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">
                                        <PlusCircleIcon className="w-5 h-5 mr-2" /> Add a New Address
                                    </button>
                                )
                            )}
                        </div>
                    </div>
                    {/* Slot Selection */}
                    <div>
                        <h3 className="font-semibold text-lg text-gray-800 mb-2">2. Select Time Slot</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {availableSlots.map(slot => (
                                <button key={slot} onClick={() => setSelectedSlot(slot)} className={`p-3 rounded-lg border text-sm text-left ${selectedSlot === slot ? 'bg-teal-600 text-white border-teal-600' : 'bg-white hover:bg-teal-50'}`}>
                                    {slot}
                                </button>
                            ))}
                        </div>
                    </div>
                    {/* Summary */}
                    <div className="p-4 bg-gray-100 rounded-lg">
                        <h4 className="font-semibold">Price Summary</h4>
                        <div className="flex justify-between mt-2">
                            <span>Test Price:</span>
                            <span className="font-bold">{formatCurrency(test.price)}</span>
                        </div>
                    </div>
                </div>
                
                {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}

                <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 mt-6">
                  <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                  <button type="button" onClick={handleProceedToPayment} disabled={isLoading || isEditing} className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:bg-teal-400 disabled:cursor-not-allowed">
                    {isLoading ? 'Processing...' : 'Proceed to Payment'}
                  </button>
                </div>
            </>
        );
    };
    
    const renderPaymentStep = () => (
         <div className="flex flex-col items-center text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Complete Your Payment</h2>
            <p className="text-gray-600 mb-4">Pay <span className="font-bold">{formatCurrency(test.price)}</span> to confirm your booking for {test.name}.</p>
            <div className="p-4 my-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 h-64 w-64 flex items-center justify-center">
            {qrCodeUrl ? <img src={qrCodeUrl} alt="Payment QR Code" className="w-56 h-56 object-contain" /> : <p className="text-red-500">{error || "Generating QR..."}</p> }
            </div>
            <p className="text-xs text-gray-500">Scan with any UPI app</p>
            <div className="flex justify-center space-x-4 pt-6 w-full">
                <button type="button" onClick={() => setStep('details')} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Back</button>
                <button type="button" onClick={handleConfirmBooking} disabled={isLoading || !qrCodeUrl} className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:bg-teal-400">
                    {isLoading ? 'Confirming...' : "I've Paid, Confirm"}
                </button>
            </div>
            {error && qrCodeUrl && <p className="text-red-500 text-sm mt-4">{error}</p>}
        </div>
    );
    
    const renderConfirmedStep = () => (
        <div className="text-center py-8">
            <CheckIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-green-600 mb-4">Test Booked Successfully!</h3>
            <p className="text-gray-700">Your booking for <span className="font-semibold text-teal-700">{test.name}</span> is confirmed.</p>
            <p className="text-gray-600 mt-2">Our phlebotomist will visit for sample collection during your selected slot.</p>
            <button onClick={onClose} className="mt-8 px-8 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700">Close</button>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-2xl transform transition-all">
                {step === 'details' && renderDetailsForm()}
                {step === 'payment' && renderPaymentStep()}
                {step === 'confirmed' && renderConfirmedStep()}
            </div>
        </div>
    );
};

export default LabTestBookingModal;