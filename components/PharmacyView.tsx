import React, { useState, useMemo, useEffect } from 'react';
import { Medicine, MedicineOrder, User, Address } from '../types';
import { ShoppingBagIcon, ArchiveIcon, TruckIcon, CheckCircleIcon, PlusCircleIcon, MinusCircleIcon, Trash2Icon, RupeeIcon, QrCodeIcon, HomeIcon, CheckCircleIcon as CheckIcon, SearchIcon } from './IconComponents';
import { generateQrCode } from '../services/qrService';
import * as db from '../services/dbService';


const GST_RATE = 0.18; // 18% GST
const PROTECT_PROMISE_FEE = 9;
const DELIVERY_FEE = 0; // Free delivery for now

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


const OrderTracker: React.FC<{ status: MedicineOrder['status'] }> = ({ status }) => {
    const statuses: MedicineOrder['status'][] = ['Processing', 'Shipped', 'Delivered'];
    const currentStatusIndex = statuses.indexOf(status);

    return (
        <div className="w-full">
            <div className="flex justify-between">
                {statuses.map((s, index) => (
                    <div key={s} className="flex-1 text-center">
                        <div className={`mx-auto h-8 w-8 rounded-full flex items-center justify-center border-2 ${index <= currentStatusIndex ? 'bg-teal-600 border-teal-600 text-white' : 'bg-gray-100 border-gray-300 text-gray-400'}`}>
                            {index === 0 && <ArchiveIcon className="h-4 w-4" />}
                            {index === 1 && <TruckIcon className="h-4 w-4" />}
                            {index === 2 && <CheckCircleIcon className="h-4 w-4" />}
                        </div>
                        <p className={`text-xs mt-1 ${index <= currentStatusIndex ? 'font-semibold text-teal-700' : 'text-gray-500'}`}>{s}</p>
                    </div>
                ))}
            </div>
            <div className="flex items-center mt-[-20px] px-8">
                {statuses.slice(0, -1).map((s, index) => (
                    <div key={`line-${s}`} className={`flex-1 h-1 rounded ${index < currentStatusIndex ? 'bg-teal-600' : 'bg-gray-300'}`}></div>
                ))}
            </div>
        </div>
    );
};

interface PaymentModalProps {
    totalAmount: number;
    onClose: () => void;
    onConfirm: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ totalAmount, onClose, onConfirm }) => {
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const generate = async () => {
            setIsLoading(true);
            setError('');
            try {
                const url = await generateQrCode(totalAmount.toFixed(2));
                setQrCodeUrl(url);
            } catch (err: any) {
                setError(err.message || 'Failed to generate QR code.');
            } finally {
                setIsLoading(false);
            }
        };
        generate();
    }, [totalAmount]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md transform transition-all text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Complete Your Payment</h2>
                <p className="text-gray-600 mb-4">Pay <span className="font-bold">{formatCurrency(totalAmount)}</span> to confirm your medicine order.</p>

                <div className="p-4 my-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 h-64 w-64 flex items-center justify-center mx-auto">
                    {isLoading && <p>Generating QR Code...</p>}
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    {qrCodeUrl && !error && (
                        <img src={qrCodeUrl} alt="Payment QR Code" className="w-56 h-56 object-contain" />
                    )}
                     {!isLoading && !qrCodeUrl && !error && <QrCodeIcon className="h-12 w-12 text-gray-400" />}
                </div>
                 <p className="text-xs text-gray-500">Scan with any UPI app (GPay, PhonePe, Paytm, etc.)</p>

                <div className="flex justify-center space-x-4 pt-6 w-full">
                    <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors">
                        Cancel
                    </button>
                    <button type="button" onClick={onConfirm} disabled={isLoading || !!error} className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors disabled:bg-teal-400 disabled:cursor-not-allowed">
                        I've Paid, Confirm Order
                    </button>
                </div>
            </div>
        </div>
    );
};

interface PharmacyViewProps {
  medicines: Medicine[];
  orders: MedicineOrder[];
  addresses: Address[];
  onPlaceOrder: (userId: number, cart: { [medicineId: number]: number }, address: Address, deliveryFee: number, promiseFee: number) => { message: string };
  user: User;
  onDataRefresh: () => void;
}

const PharmacyView: React.FC<PharmacyViewProps> = ({ medicines, orders, addresses, onPlaceOrder, user, onDataRefresh }) => {
    const [activeTab, setActiveTab] = useState('shop');
    const [viewState, setViewState] = useState<'shopping' | 'checkout'>('shopping');
    const [cart, setCart] = useState<{ [medicineId: string]: number }>({});
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [orderJustPlaced, setOrderJustPlaced] = useState(false);
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
    const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
    const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedMedicineId, setExpandedMedicineId] = useState<number | null>(null);
    const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

    const handleToggleExpand = (medicineId: number) => {
        setExpandedMedicineId(prevId => (prevId === medicineId ? null : medicineId));
    };

    const filteredMedicines = useMemo(() => {
        return medicines.filter(medicine =>
            medicine.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [medicines, searchTerm]);

    useEffect(() => {
        // Pre-select the first address if one isn't already selected
        if (addresses.length > 0 && !selectedAddressId) {
            setSelectedAddressId(addresses[0].id);
        }
        // If the selected address was deleted, reset selection
        if (selectedAddressId && !addresses.find(a => a.id === selectedAddressId)) {
            setSelectedAddressId(addresses.length > 0 ? addresses[0].id : null);
        }
    }, [addresses, selectedAddressId]);
    
    useEffect(() => {
        if (orderJustPlaced) {
            setActiveTab('orders');
            setOrderJustPlaced(false);
        }
    }, [orders, orderJustPlaced]);

    const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleAddToCart = (medicine: Medicine) => {
        setCart(prevCart => {
            const newCart = { ...prevCart };
            newCart[medicine.id] = (newCart[medicine.id] || 0) + 1;
            return newCart;
        });
        showNotification(`${medicine.name} added to cart.`);
    };

    const handleUpdateQuantity = (medicineId: number, quantity: number) => {
        setCart(prevCart => {
            const newCart = { ...prevCart };
            if (quantity > 0) {
                newCart[medicineId] = quantity;
            } else {
                delete newCart[medicineId];
            }
            return newCart;
        });
    };

    const cartDetails = useMemo(() => {
        const items = Object.entries(cart).map(([id, quantity]) => {
            const medicine = medicines.find(m => m.id === Number(id));
            if (!medicine) return null;
            return { ...medicine, quantity };
        }).filter((item): item is (Medicine & { quantity: number }) => item !== null);

        const subtotal = items.reduce((sum, item) => sum + (item.price! * item.quantity), 0);
        const totalMrp = items.reduce((sum, item) => sum + (item.mrp! * item.quantity), 0);
        const savings = totalMrp - subtotal;
        const gst = subtotal * GST_RATE;
        const totalPayable = subtotal + gst + PROTECT_PROMISE_FEE + DELIVERY_FEE;
        const totalItems = Object.values(cart).reduce((sum, q) => sum + q, 0);

        return { items, subtotal, totalMrp, savings, totalPayable, totalItems, gst };
    }, [cart, medicines]);

    const handleProceedToCheckout = () => {
        if (cartDetails.items.length === 0) {
            showNotification("Your cart is empty.", 'error');
            return;
        }
        setViewState('checkout');
    }

    const handleConfirmAndPlaceOrder = () => {
        const selectedAddress = addresses.find(a => a.id === selectedAddressId);
        if (!selectedAddress) {
            showNotification("Please select a delivery address.", 'error');
            return;
        }
        try {
            const result = onPlaceOrder(user.id, cart, selectedAddress, DELIVERY_FEE, PROTECT_PROMISE_FEE);
            setShowPaymentModal(false);
            showNotification(result.message, 'success');
            setCart({});
            setViewState('shopping');
            setOrderJustPlaced(true);
        } catch(err: any) {
            setShowPaymentModal(false);
            showNotification(err.message || "Failed to place order.", 'error');
        }
    };
    
    const renderCheckoutView = () => {
        const selectedAddress = addresses.find(a => a.id === selectedAddressId);
        const isEditing = editingAddressId !== null || isAddingNewAddress;

        return (
            <div>
                 <button onClick={() => setViewState('shopping')} className="mb-4 text-teal-600 font-semibold hover:text-teal-800">
                    &larr; Back to Shop
                </button>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Login Info */}
                        <div className="bg-white p-4 rounded-lg shadow-md border">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                    <span className="bg-gray-200 text-gray-700 font-bold text-sm rounded-full h-6 w-6 flex items-center justify-center mr-3">1</span>
                                    <h3 className="text-lg font-semibold text-gray-500">LOGIN</h3>
                                    <CheckIcon className="w-5 h-5 text-teal-500 ml-2" />
                                </div>
                            </div>
                            <p className="ml-9 mt-1 text-gray-700">{user.firstName} {user.lastName} <span className="text-gray-500 ml-2">{user.phone}</span></p>
                        </div>

                        {/* Delivery Address */}
                        <div className="bg-white p-4 rounded-lg shadow-md border border-blue-500">
                             <div className="flex items-center">
                                <span className="bg-blue-600 text-white font-bold text-sm rounded-full h-6 w-6 flex items-center justify-center mr-3">2</span>
                                <h3 className="text-lg font-semibold text-gray-800">DELIVERY ADDRESS</h3>
                            </div>
                            <div className="pl-9 mt-4 space-y-4">
                                {addresses.map(address => (
                                    editingAddressId === address.id ? (
                                        <AddressEditor 
                                            key={address.id}
                                            user={user}
                                            address={address}
                                            onSave={() => { setEditingAddressId(null); onDataRefresh(); }}
                                            onCancel={() => setEditingAddressId(null)}
                                            onDelete={() => {
                                                if (window.confirm('Are you sure you want to delete this address?')) {
                                                    db.deleteAddress(address.id);
                                                    setEditingAddressId(null);
                                                    onDataRefresh();
                                                }
                                            }}
                                        />
                                    ) : (
                                    <div key={address.id} className={`p-4 rounded-lg border cursor-pointer relative ${selectedAddressId === address.id ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`} onClick={() => !isEditing && setSelectedAddressId(address.id)}>
                                        <div className="flex items-start">
                                            <input type="radio" name="address" checked={selectedAddressId === address.id} readOnly disabled={isEditing} className="mt-1"/>
                                            <div className="ml-3">
                                                <div className="flex items-center">
                                                    <p className="font-semibold">{address.fullName}</p>
                                                    <span className="text-xs text-gray-500 bg-gray-200 rounded-full px-2 py-0.5 ml-3">{address.type}</span>
                                                </div>
                                                <p className="text-sm text-gray-600">{address.addressLine1}, {address.addressLine2}</p>
                                                <p className="text-sm text-gray-600">{address.city}, {address.state} - {address.pincode}</p>
                                                <p className="text-sm text-gray-600 mt-1">Phone: {address.phone}</p>
                                            </div>
                                        </div>
                                        {!isEditing && (
                                            <div className="absolute top-4 right-4">
                                                <button onClick={(e) => { e.stopPropagation(); setEditingAddressId(address.id); }} className="text-sm font-semibold text-blue-600 hover:underline">Edit</button>
                                            </div>
                                        )}
                                    </div>
                                    )
                                ))}

                                {isAddingNewAddress ? (
                                    <AddressEditor
                                        user={user}
                                        onSave={() => { setIsAddingNewAddress(false); onDataRefresh(); }}
                                        onCancel={() => setIsAddingNewAddress(false)}
                                    />
                                ) : (
                                    !isEditing && (
                                        <button onClick={() => setIsAddingNewAddress(true)} className="flex items-center justify-center w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-800 transition-colors">
                                            <PlusCircleIcon className="w-5 h-5 mr-2" />
                                            Add a New Address
                                        </button>
                                    )
                                )}

                                {selectedAddress && !isEditing && (
                                     <button onClick={() => setShowPaymentModal(true)} disabled={isEditing} className="bg-orange-500 text-white font-bold py-3 px-8 rounded-md shadow-md hover:bg-orange-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
                                        DELIVER HERE
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                    {/* Price Details */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 bg-white p-4 rounded-lg shadow-md border">
                            <h3 className="text-sm font-bold text-gray-500 uppercase pb-2 border-b">Price Details</h3>
                            <div className="space-y-3 mt-4">
                                <div className="flex justify-between"><span>Price ({cartDetails.totalItems} items)</span><span>{formatCurrency(cartDetails.subtotal)}</span></div>
                                <div className="flex justify-between"><span>GST (18%)</span><span>{formatCurrency(cartDetails.gst)}</span></div>
                                <div className="flex justify-between"><span>Protect Promise Fee</span><span>{formatCurrency(PROTECT_PROMISE_FEE)}</span></div>
                                <div className="flex justify-between font-bold text-lg border-t border-b py-3 my-2 border-dashed"><span>Total Payable</span><span>{formatCurrency(cartDetails.totalPayable)}</span></div>
                            </div>
                            {cartDetails.savings > 0 &&
                                <p className="text-green-600 font-semibold mt-4">Your Total Savings on this order {formatCurrency(cartDetails.savings)}</p>
                            }
                        </div>
                    </div>
                </div>
            </div>
        )
    };

    return (
        <div className="space-y-6">
            {notification && (
                <div className={`fixed top-24 right-8 z-50 p-4 rounded-lg shadow-lg text-white ${notification.type === 'success' ? 'bg-teal-600' : 'bg-red-600'}`}>
                    {notification.message}
                </div>
            )}
            {showPaymentModal && (
                <PaymentModal 
                    totalAmount={cartDetails.totalPayable}
                    onClose={() => setShowPaymentModal(false)}
                    onConfirm={handleConfirmAndPlaceOrder}
                />
            )}

            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-800">Online Pharmacy</h1>
                <div className="bg-white p-1 rounded-lg shadow-sm border">
                    <nav className="flex items-center space-x-1">
                        <button onClick={() => setActiveTab('shop')} className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'shop' ? 'bg-teal-600 text-white' : 'text-gray-600 hover:bg-teal-100'}`}>
                            <ShoppingBagIcon className="w-5 h-5 mr-2" /> Shop
                        </button>
                        <button onClick={() => setActiveTab('orders')} className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'orders' ? 'bg-teal-600 text-white' : 'text-gray-600 hover:bg-teal-100'}`}>
                            <ArchiveIcon className="w-5 h-5 mr-2" /> My Orders
                        </button>
                    </nav>
                </div>
            </div>

            {activeTab === 'shop' && viewState === 'shopping' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <h2 className="text-2xl font-bold text-gray-700">Medicines & Supplies</h2>
                             <div className="relative sm:w-72">
                                <input
                                    type="text"
                                    placeholder="Search medicines by name..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                                <SearchIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {filteredMedicines.length > 0 ? (
                                filteredMedicines.map(medicine => {
                                    const isExpanded = expandedMedicineId === medicine.id;
                                    return (
                                        <div key={medicine.id} className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                                            {/* Clickable Header */}
                                            <div onClick={() => handleToggleExpand(medicine.id)} className="cursor-pointer">
                                                <img src={medicine.imageUrl} alt={medicine.name} className="h-40 w-full object-cover" />
                                                <div className="p-4">
                                                    <div className="flex justify-between items-start">
                                                        <h3 className="text-lg font-bold text-gray-800 pr-2">{medicine.name}</h3>
                                                        <svg className={`w-6 h-6 text-gray-400 transform transition-transform duration-300 flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </div>
                                                    <span className="text-xl font-semibold text-teal-600">{formatCurrency(medicine.price)}</span>
                                                </div>
                                            </div>
                                            
                                            {/* Expandable Details */}
                                            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-96' : 'max-h-0'}`}>
                                                <div className="px-4 pb-4">
                                                    <p className="text-sm text-gray-600 mt-2 pt-2 border-t border-gray-100">{medicine.description}</p>
                                                    <div className="flex justify-between items-center mt-4">
                                                         <div>
                                                            <span className="text-sm text-gray-500">MRP: </span>
                                                            <span className="text-sm text-gray-500 line-through">{formatCurrency(medicine.mrp)}</span>
                                                        </div>
                                                        <button 
                                                            onClick={() => handleAddToCart(medicine)} 
                                                            className="px-4 py-2 bg-teal-100 text-teal-800 text-sm font-semibold rounded-lg hover:bg-teal-200 transition-colors">
                                                            Add to Cart
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            ) : (
                                <div className="md:col-span-2 text-center py-16 px-4 bg-gray-50 rounded-xl">
                                    <ShoppingBagIcon className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-lg font-medium text-gray-900">No Medicines Found</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Your search for "{searchTerm}" did not match any medicines.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 bg-white p-6 rounded-xl shadow-lg">
                            <h2 className="text-2xl font-bold text-gray-700 mb-4">Your Cart ({cartDetails.totalItems})</h2>
                            {cartDetails.items.length > 0 ? (
                                <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
                                    {cartDetails.items.map(item => (
                                        <div key={item.id} className="flex items-center space-x-3">
                                            <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                                            <div className="flex-grow">
                                                <p className="font-semibold text-gray-800">{item.name}</p>
                                                <p className="text-sm text-gray-500">{formatCurrency(item.price!)}</p>
                                                <div className="flex items-center space-x-2 mt-1">
                                                    <button onClick={() => handleUpdateQuantity(item.id!, item.quantity - 1)} className="text-gray-500 hover:text-teal-600"><MinusCircleIcon className="w-5 h-5" /></button>
                                                    <span className="font-bold text-teal-700 w-6 text-center">{item.quantity}</span>
                                                    <button onClick={() => handleUpdateQuantity(item.id!, item.quantity + 1)} className="text-gray-500 hover:text-teal-600"><PlusCircleIcon className="w-5 h-5" /></button>
                                                </div>
                                            </div>
                                            <p className="font-bold">{formatCurrency(item.price! * item.quantity)}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10">
                                    <ShoppingBagIcon className="w-12 h-12 mx-auto text-gray-300" />
                                    <p className="mt-2 text-gray-500">Your cart is empty.</p>
                                </div>
                            )}
                            {cartDetails.items.length > 0 && (
                                <>
                                    <div className="border-t border-gray-200 mt-4 pt-4 space-y-2">
                                        <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatCurrency(cartDetails.subtotal)}</span></div>
                                        {cartDetails.savings > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>- {formatCurrency(cartDetails.savings)}</span></div>}
                                        <div className="flex justify-between font-bold text-lg text-gray-800"><span>To Pay</span><span>{formatCurrency(cartDetails.subtotal)}</span></div>
                                    </div>
                                    <button 
                                      onClick={handleProceedToCheckout}
                                      className="mt-6 w-full bg-teal-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-700 transition-colors disabled:bg-teal-400"
                                      disabled={cartDetails.items.length === 0}
                                    >
                                        Proceed to Checkout
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
            
            {activeTab === 'shop' && viewState === 'checkout' && renderCheckoutView()}

            {activeTab === 'orders' && (
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-700">Order History</h2>
                    {orders.length > 0 ? (
                        orders.map(order => {
                             const isExpanded = expandedOrderId === order.id;
                             return (
                                <div key={order.id} className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300">
                                    <div 
                                        className="p-6 cursor-pointer hover:bg-gray-50"
                                        onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                                        aria-expanded={isExpanded}
                                        aria-controls={`order-details-${order.id}`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-lg text-gray-800">Order #{order.id}</h3>
                                                <p className="text-sm text-gray-500">Placed on {new Date(order.orderDate).toLocaleDateString()}</p>
                                                <p className="text-sm text-gray-500 mt-1">{order.items.reduce((sum, i) => sum + i.quantity, 0)} items</p>
                                            </div>
                                            <div className="text-right flex items-center">
                                                 <div className="text-lg md:text-xl font-bold text-teal-600 mr-4">{formatCurrency(order.totalAmount)}</div>
                                                 <svg className={`w-6 h-6 text-gray-400 transform transition-transform duration-300 flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <OrderTracker status={order.status} />
                                        </div>
                                    </div>
                                    
                                    <div 
                                        id={`order-details-${order.id}`}
                                        className={`transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[1000px]' : 'max-h-0'}`}
                                    >
                                        <div className="px-6 pb-6 pt-4 border-t border-gray-200 bg-gray-50/50">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                                <div>
                                                     <h4 className="font-semibold text-gray-700 mb-2">Items</h4>
                                                     <div className="space-y-2">
                                                        {order.items.map(item => (
                                                            <div key={item.medicineId} className="flex justify-between text-sm">
                                                                <span className="text-gray-600">{item.quantity} x {item.medicineName}</span>
                                                                <span className="text-gray-800">{formatCurrency(item.price * item.quantity)}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                     <h4 className="font-semibold text-gray-700 mb-2">Delivery Address</h4>
                                                     <div className="text-sm text-gray-600 bg-white p-3 rounded-md border">
                                                        <p className="font-medium">{order.deliveryAddress.fullName}</p>
                                                        <p>{order.deliveryAddress.addressLine1}, {order.deliveryAddress.addressLine2}</p>
                                                        <p>{order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}</p>
                                                        <p>Phone: {order.deliveryAddress.phone}</p>
                                                     </div>
                                                </div>
                                                <div className="md:col-span-2">
                                                    <h4 className="font-semibold text-gray-700 mb-2">Price Breakdown</h4>
                                                    <div className="text-sm bg-white p-3 rounded-md border space-y-2">
                                                        <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
                                                        <div className="flex justify-between text-green-600"><span>Savings</span><span>- {formatCurrency(order.savings)}</span></div>
                                                        <div className="flex justify-between"><span>GST</span><span>+ {formatCurrency(order.gst)}</span></div>
                                                        <div className="flex justify-between"><span>Delivery Fee</span><span>+ {formatCurrency(order.deliveryFee)}</span></div>
                                                        <div className="flex justify-between font-bold text-base border-t pt-2 mt-2"><span>Total Paid</span><span>{formatCurrency(order.totalAmount)}</span></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    ) : (
                         <div className="text-center py-16 px-4 bg-white rounded-xl shadow-lg">
                            <ArchiveIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-lg font-medium text-gray-900">No Orders Found</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                You haven't placed any medicine orders yet.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PharmacyView;