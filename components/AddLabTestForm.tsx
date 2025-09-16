import React, { useState, useEffect } from 'react';
import { LabTest, LabTestIn } from '../types';
import * as db from '../services/dbService';
import { TestTubeIcon, XCircleIcon, XIcon } from './IconComponents';

interface LabTestFormProps {
    testToEdit?: LabTest | null;
    onSuccess: () => void;
    onClose: () => void;
}

const LabTestForm: React.FC<LabTestFormProps> = ({ testToEdit, onSuccess, onClose }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [mrp, setMrp] = useState('');
    const [preparations, setPreparations] = useState('');
    const [includes, setIncludes] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const isEditMode = !!testToEdit;

    useEffect(() => {
        if (isEditMode && testToEdit) {
            setName(testToEdit.name);
            setDescription(testToEdit.description);
            setPrice(String(testToEdit.price));
            setMrp(String(testToEdit.mrp));
            setPreparations(testToEdit.preparations);
            setIncludes(testToEdit.includes.join(', '));
            setImageUrl(testToEdit.imageUrl);
        }
    }, [testToEdit, isEditMode]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!name || !price || !mrp || !description || !preparations || !includes) {
            setError('All fields except Image URL are required.');
            return;
        }

        const priceNum = Number(price);
        const mrpNum = Number(mrp);

        if (isNaN(priceNum) || isNaN(mrpNum)) {
            setError('MRP and Price must be valid numbers.');
            return;
        }

        if (priceNum > mrpNum) {
            setError('Selling price cannot be greater than MRP.');
            return;
        }

        setIsLoading(true);
        const includesArray = includes.split(',').map(s => s.trim()).filter(Boolean);

        try {
            if (isEditMode && testToEdit) {
                const updatedTestData: LabTest = {
                    ...testToEdit,
                    name,
                    description,
                    price: priceNum,
                    mrp: mrpNum,
                    preparations,
                    includes: includesArray,
                    imageUrl: imageUrl || `https://placehold.co/300x200?text=${encodeURIComponent(name.substring(0, 10))}`
                };
                db.updateLabTest(updatedTestData);
            } else {
                const newTestData: LabTestIn = {
                    name,
                    description,
                    price: priceNum,
                    mrp: mrpNum,
                    preparations,
                    includes: includesArray,
                    imageUrl: imageUrl || `https://placehold.co/300x200?text=${encodeURIComponent(name.substring(0, 10))}`
                };
                db.addLabTest(newTestData);
            }
            setIsLoading(false);
            onSuccess();
        } catch (err: any) {
            setError(err.message || `Failed to ${isEditMode ? 'update' : 'add'} lab test.`);
            setIsLoading(false);
        }
    };

    const inputClasses = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-8 w-full max-w-lg transform transition-all max-h-[90vh] overflow-y-auto">
                <div className="flex items-center mb-6">
                    <TestTubeIcon className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                    <h2 className="ml-3 text-2xl font-bold text-gray-800 dark:text-gray-100">{isEditMode ? 'Edit Lab Test' : 'Add New Lab Test'}</h2>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Test Name" className={inputClasses} required />
                    <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" rows={2} className={inputClasses} required />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="number" step="0.01" value={mrp} onChange={e => setMrp(e.target.value)} placeholder="MRP (₹)" className={inputClasses} required />
                        <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} placeholder="Selling Price (₹)" className={inputClasses} required />
                    </div>
                    <textarea value={preparations} onChange={e => setPreparations(e.target.value)} placeholder="Preparation Instructions" rows={2} className={inputClasses} required />
                    <textarea value={includes} onChange={e => setIncludes(e.target.value)} placeholder="Included Parameters (comma-separated)" rows={2} className={inputClasses} required />
                    <input type="text" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="Image URL (Optional)" className={inputClasses} />
                    
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
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500">
                            Cancel
                        </button>
                        <button type="submit" disabled={isLoading} className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:bg-teal-400">
                            {isLoading ? (isEditMode ? 'Saving...' : 'Adding...') : (isEditMode ? 'Save Changes' : 'Add Test')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LabTestForm;