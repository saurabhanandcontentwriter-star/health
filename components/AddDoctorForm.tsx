import React, { useState, useEffect } from 'react';
import { Doctor, DoctorIn } from '../types';
import * as db from '../services/dbService';
import { UserPlusIcon } from './IconComponents';

interface DoctorFormProps {
    doctorToEdit?: Doctor | null;
    onSuccess: () => void;
    onClose: () => void;
}

const DoctorForm: React.FC<DoctorFormProps> = ({ doctorToEdit, onSuccess, onClose }) => {
    const [name, setName] = useState('');
    const [specialty, setSpecialty] = useState('');
    const [location, setLocation] = useState('');
    const [availableTime, setAvailableTime] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const isEditMode = !!doctorToEdit;

    useEffect(() => {
        if (isEditMode && doctorToEdit) {
            setName(doctorToEdit.name);
            setSpecialty(doctorToEdit.specialty);
            setLocation(doctorToEdit.location);
            setAvailableTime(doctorToEdit.available_time);
            setImageUrl(doctorToEdit.imageUrl);
        }
    }, [doctorToEdit, isEditMode]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!name || !specialty || !location || !availableTime) {
            setError('All fields except Image URL are required.');
            return;
        }
        
        setIsLoading(true);
        
        try {
            if (isEditMode && doctorToEdit) {
                const updatedDoctorData: Doctor = {
                    ...doctorToEdit,
                    name,
                    specialty,
                    location,
                    available_time: availableTime,
                    imageUrl: imageUrl || `https://placehold.co/100x100?text=${name.substring(0,2).toUpperCase()}`
                };
                db.updateDoctor(updatedDoctorData);
            } else {
                const newDoctorData: DoctorIn = {
                    name,
                    specialty,
                    location,
                    available_time: availableTime,
                    imageUrl: imageUrl || `https://placehold.co/100x100?text=${name.substring(0,2).toUpperCase()}`
                };
                db.addDoctor(newDoctorData);
            }
            setIsLoading(false);
            onSuccess();
        } catch (err: any) {
            setError(err.message || `Failed to ${isEditMode ? 'update' : 'add'} doctor.`);
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-lg transform transition-all max-h-[90vh] overflow-y-auto">
                <div className="flex items-center mb-6">
                    <UserPlusIcon className="h-6 w-6 text-teal-600" />
                    <h2 className="ml-3 text-2xl font-bold text-gray-800">{isEditMode ? 'Edit Doctor' : 'Add New Doctor'}</h2>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Doctor's Name</label>
                        <input
                            type="text" id="name" value={name} onChange={(e) => setName(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                            placeholder="e.g., Dr. Ramesh Kumar" required
                        />
                    </div>
                    <div>
                        <label htmlFor="specialty" className="block text-sm font-medium text-gray-700">Specialty</label>
                        <input
                            type="text" id="specialty" value={specialty} onChange={(e) => setSpecialty(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                            placeholder="e.g., General Physician" required
                        />
                    </div>
                     <div>
                        <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">Image URL (Optional)</label>
                        <input
                            type="text" id="imageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                            placeholder="https://example.com/doctor.png"
                        />
                    </div>
                    <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
                        <input
                            type="text" id="location" value={location} onChange={(e) => setLocation(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                            placeholder="e.g., Patna" required
                        />
                    </div>
                    <div>
                        <label htmlFor="availableTime" className="block text-sm font-medium text-gray-700">Available Time</label>
                        <input
                            type="text" id="availableTime" value={availableTime} onChange={(e) => setAvailableTime(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                            placeholder="e.g., 10:00 AM - 1:00 PM" required
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={isLoading} className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors disabled:bg-teal-400 disabled:cursor-not-allowed">
                            {isLoading ? (isEditMode ? 'Saving...' : 'Adding...') : (isEditMode ? 'Save Changes' : 'Add Doctor')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DoctorForm;
