import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Address } from '../types';
import * as db from '../services/dbService';
import { UserIcon, PlusCircleIcon, EditIcon, Trash2Icon } from './IconComponents';
import AddressEditor from './AddressEditor';


interface UserProfileProps {
    user: User;
    addresses: Address[];
    onDataRefresh: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user: initialUser, addresses, onDataRefresh }) => {
    const { user, refreshAuth } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Partial<User>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Address Management State
    const [isAddingAddress, setIsAddingAddress] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email || '',
            });
        }
    }, [user]);

    if (!user) {
        return <div>Loading user profile...</div>;
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.firstName || !formData.lastName) {
            setError('First and last name cannot be empty.');
            return;
        }
        setIsLoading(true);
        setError('');
        setSuccess('');
        try {
            const updatedUser: User = {
                ...user,
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
            };
            db.updateUser(updatedUser);
            refreshAuth(); // Refresh context
            setSuccess('Profile updated successfully!');
            setIsEditing(false);
        } catch (err) {
            setError('Failed to update profile. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveAddress = () => {
        onDataRefresh();
        setIsAddingAddress(false);
        setEditingAddress(null);
    };

    const handleCancelAddress = () => {
        setIsAddingAddress(false);
        setEditingAddress(null);
    };

    const handleDeleteAddress = (id: number) => {
        if (window.confirm("Are you sure you want to delete this address?")) {
            db.deleteAddress(id);
            onDataRefresh();
        }
    };

    const inputClasses = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400";
    const readOnlyClasses = "mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm dark:bg-gray-600 dark:border-gray-500 dark:text-gray-300";

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8">
                <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                    <div className="flex-shrink-0">
                        <div className="w-32 h-32 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center text-teal-600 dark:text-teal-300">
                            <UserIcon className="w-20 h-20" />
                        </div>
                    </div>
                    <div className="flex-grow w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                                {isEditing ? 'Edit Profile' : 'My Profile'}
                            </h1>
                            {!isEditing && (
                                <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700 transition-colors">
                                    Edit Profile
                                </button>
                            )}
                        </div>

                        {success && <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 rounded-md text-sm">{success}</div>}
                        {error && <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 rounded-md text-sm">{error}</div>}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
                                    <input type="text" id="firstName" name="firstName" value={formData.firstName || ''} onChange={handleChange} className={isEditing ? inputClasses : readOnlyClasses} readOnly={!isEditing} required />
                                </div>
                                <div>
                                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
                                    <input type="text" id="lastName" name="lastName" value={formData.lastName || ''} onChange={handleChange} className={isEditing ? inputClasses : readOnlyClasses} readOnly={!isEditing} required />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number (Cannot be changed)</label>
                                <input type="tel" id="phone" name="phone" value={user.phone} className={readOnlyClasses} readOnly />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                                <input type="email" id="email" name="email" value={formData.email || ''} onChange={handleChange} className={isEditing ? inputClasses : readOnlyClasses} readOnly={!isEditing} />
                            </div>
                            {isEditing && (
                                <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700 mt-6">
                                    <button type="button" onClick={() => { setIsEditing(false); setError(''); setSuccess(''); }} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={isLoading} className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors disabled:bg-teal-400 disabled:cursor-not-allowed">
                                        {isLoading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>

             {/* Address Management Section */}
            <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">My Addresses</h2>
                     {!isAddingAddress && !editingAddress && (
                        <button onClick={() => { setIsAddingAddress(true); setEditingAddress(null); }} className="flex items-center px-4 py-2 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700 transition-colors">
                            <PlusCircleIcon className="w-5 h-5 mr-2" /> Add New Address
                        </button>
                    )}
                </div>

                <div className="space-y-4">
                    {addresses.map(address => (
                        <div key={address.id} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border dark:border-gray-600">
                             {editingAddress?.id === address.id ? (
                                <AddressEditor
                                    user={user}
                                    address={address}
                                    onSave={handleSaveAddress}
                                    onCancel={handleCancelAddress}
                                />
                            ) : (
                                <div className="flex justify-between items-start">
                                    <div className="text-sm">
                                        <p className="font-semibold text-gray-800 dark:text-gray-100 flex items-center">
                                            <span className={`px-2 py-0.5 rounded-full text-xs mr-2 ${address.type === 'Home' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300'}`}>{address.type}</span>
                                            {address.fullName}
                                        </p>
                                        <p className="text-gray-600 dark:text-gray-300 mt-1">{address.addressLine1}, {address.addressLine2}, {address.city} - {address.pincode}</p>
                                        <p className="text-gray-600 dark:text-gray-300">Phone: {address.phone}</p>
                                    </div>
                                    <div className="flex space-x-2 flex-shrink-0 ml-4">
                                        <button onClick={() => setEditingAddress(address)} className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-full" aria-label="Edit address">
                                            <EditIcon className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDeleteAddress(address.id)} className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full" aria-label="Delete address">
                                            <Trash2Icon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {isAddingAddress && (
                        <AddressEditor
                            user={user}
                            onSave={handleSaveAddress}
                            onCancel={handleCancelAddress}
                        />
                    )}

                    {addresses.length === 0 && !isAddingAddress && (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-4">You have no saved addresses.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfile;