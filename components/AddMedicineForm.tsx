
import React, { useState, useEffect } from 'react';
import { Medicine, MedicineIn } from '../types';
import * as db from '../services/dbService';
import { PillIcon } from './IconComponents';

interface MedicineFormProps {
    medicineToEdit?: Medicine | null;
    onSuccess: () => void;
    onClose: () => void;
}

const MedicineForm: React.FC<MedicineFormProps> = ({ medicineToEdit, onSuccess, onClose }) => {
    const [name, setName] = useState('');
    const [mrp, setMrp] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const isEditMode = !!medicineToEdit;

    useEffect(() => {
        if (isEditMode && medicineToEdit) {
            setName(medicineToEdit.name);
            setMrp(String(medicineToEdit.mrp));
            setPrice(String(medicineToEdit.price));
            setDescription(medicineToEdit.description);
            setImageUrl(medicineToEdit.imageUrl);
        }
    }, [medicineToEdit, isEditMode]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!name || !mrp || !price || !description) {
            setError('All fields except Image URL are required.');
            return;
        }
        if (isNaN(Number(mrp)) || isNaN(Number(price))) {
            setError('MRP and Price must be valid numbers.');
            return;
        }

        setIsLoading(true);

        try {
            if (isEditMode && medicineToEdit) {
                const updatedMedicineData: Medicine = {
                    ...medicineToEdit,
                    name,
                    mrp: Number(mrp),
                    price: Number(price),
                    description,
                    imageUrl: imageUrl || `https://placehold.co/300x200?text=${encodeURIComponent(name)}`,
                };
                db.updateMedicine(updatedMedicineData);
            } else {
                const newMedicineData: MedicineIn = {
                    name,
                    mrp: Number(mrp),
                    price: Number(price),
                    description,
                    imageUrl: imageUrl || `https://placehold.co/300x200?text=${encodeURIComponent(name)}`,
                };
                db.addMedicine(newMedicineData);
            }
            setIsLoading(false);
            onSuccess();
        } catch (err: any) {
            setError(err.message || `Failed to ${isEditMode ? 'update' : 'add'} medicine.`);
            setIsLoading(false);
        }
    };

    const inputClasses = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-8 w-full max-w-lg transform transition-all max-h-[90vh] overflow-y-auto">
                <div className="flex items-center mb-6">
                    <PillIcon className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                    <h2 className="ml-3 text-2xl font-bold text-gray-800 dark:text-gray-100">{isEditMode ? 'Edit Medicine' : 'Add New Medicine'}</h2>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="med-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Medicine Name</label>
                        <input type="text" id="med-name" value={name} onChange={(e) => setName(e.target.value)}
                            className={inputClasses}
                            placeholder="e.g., Paracetamol 500mg" required
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="med-mrp" className="block text-sm font-medium text-gray-700 dark:text-gray-300">MRP (₹)</label>
                            <input type="number" step="0.01" id="med-mrp" value={mrp} onChange={(e) => setMrp(e.target.value)}
                                className={inputClasses}
                                placeholder="e.g., 30.00" required
                            />
                        </div>
                        <div>
                            <label htmlFor="med-price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Selling Price (₹)</label>
                            <input type="number" step="0.01" id="med-price" value={price} onChange={(e) => setPrice(e.target.value)}
                                className={inputClasses}
                                placeholder="e.g., 25.50" required
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="med-desc" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                        <textarea id="med-desc" value={description} onChange={(e) => setDescription(e.target.value)}
                            rows={3} className={inputClasses}
                            placeholder="e.g., For fever and pain relief. 10 tablets." required
                        />
                    </div>
                     <div>
                        <label htmlFor="med-image" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Image URL (Optional)</label>
                        <input type="text" id="med-image" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
                            className={inputClasses}
                            placeholder="https://example.com/image.png"
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500">
                            Cancel
                        </button>
                        <button type="submit" disabled={isLoading} className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:bg-teal-400">
                            {isLoading ? (isEditMode ? 'Saving...' : 'Adding...') : (isEditMode ? 'Save Changes' : 'Add Medicine')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MedicineForm;
