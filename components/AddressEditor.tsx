import React, { useState } from 'react';
import { User, Address } from '../types';
import * as db from '../services/dbService';
import { Trash2Icon } from './IconComponents';

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

export default AddressEditor;
