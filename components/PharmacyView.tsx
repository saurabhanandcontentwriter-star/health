import React, { useState, useMemo, useEffect } from 'react';
import { Medicine, MedicineOrder, User, Address } from '../types';
import { ShoppingBagIcon, ArchiveIcon, TruckIcon, CheckCircleIcon, PlusCircleIcon, MinusCircleIcon, Trash2Icon, RupeeIcon, QrCodeIcon, HomeIcon, CheckCircleIcon as CheckIcon, SearchIcon } from './IconComponents';
import { generateQrCode } from '../services/qrService';
import * as db from '../services/dbService';
import AddressEditor from './AddressEditor';


const GST_RATE = 0.18; // 18% GST
const PROTECT_PROMISE_FEE = 9;
const DELIVERY_FEE = 0; // Free delivery for now

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
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
        if (addresses.length > 0 && !selectedAddressId) {
            setSelectedAddressId(addresses[0].id);
        }
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
            setCart({});
            setViewState('shopping');
            showNotification(result.message, 'success');
            setOrderJustPlaced(true);
        } catch (err: any) {
            setShowPaymentModal(false);
            showNotification(err.message || "Failed to place order.", 'error');
        }
    };

    const renderShoppingView = () => (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
            <div className="lg:col-span-2">
                <div className="relative mb-4">
                     <input
                        type="text"
                        placeholder="Search for medicines..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    />
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {filteredMedicines.map(med => (
                        <div key={med.id} className="bg-white p-4 rounded-lg shadow-md border flex items-start space-x-4">
                            <img src={med.imageUrl} alt={med.name} className="w-24 h-24 object-cover rounded-md flex-shrink-0"/>
                            <div className="flex-grow">
                                <h3 className="font-semibold text-gray-800">{med.name}</h3>
                                <p className="text-sm text-gray-500">{med.description}</p>
                                <div className="mt-2 flex items-center">
                                    <span className="font-bold text-teal-600 text-lg">{formatCurrency(med.price)}</span>
                                    <span className="text-sm text-gray-500 line-through ml-2">{formatCurrency(med.mrp)}</span>
                                </div>
                            </div>
                            <div className="flex-shrink-0 self-center">
                                {cart[med.id] ? (
                                    <div className="flex items-center space-x-2">
                                        <button onClick={() => handleUpdateQuantity(med.id, cart[med.id] - 1)} className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"><MinusCircleIcon className="w-5 h-5 text-gray-600"/></button>
                                        <span className="font-bold w-6 text-center">{cart[med.id]}</span>
                                        <button onClick={() => handleUpdateQuantity(med.id, cart[med.id] + 1)} className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"><PlusCircleIcon className="w-5 h-5 text-gray-600"/></button>
                                    </div>
                                ) : (
                                    <button onClick={() => handleAddToCart(med)} className="px-4 py-1.5 bg-teal-100 text-teal-700 text-sm font-semibold rounded-lg hover:bg-teal-200">Add</button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="lg:col-span-1 lg:sticky lg:top-28 self-start">
                <div className="bg-white p-4 rounded-xl shadow-lg border">
                    <h3 className="text-xl font-bold mb-4">Your Cart ({cartDetails.totalItems} items)</h3>
                    {cartDetails.items.length > 0 ? (
                    <>
                        <div className="space-y-3 max-h-48 overflow-y-auto pr-2 mb-4">
                            {cartDetails.items.map(item => (
                                <div key={item.id} className="flex justify-between items-center text-sm">
                                    <span className="flex-grow pr-2">{item.name}</span>
                                    <span className="font-semibold w-10 text-center">x {item.quantity}</span>
                                    <span className="font-bold w-20 text-right">{formatCurrency(item.price * item.quantity)}</span>
                                </div>
                            ))}
                        </div>
                        <div className="border-t pt-4 space-y-1 text-sm">
                            <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(cartDetails.subtotal)}</span></div>
                            <div className="flex justify-between text-green-600"><span>Savings</span><span>-{formatCurrency(cartDetails.savings)}</span></div>
                        </div>
                        <button onClick={handleProceedToCheckout} className="mt-4 w-full py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700">
                           Proceed to Checkout
                        </button>
                    </>
                    ) : (
                        <p className="text-gray-500 text-center py-8">Your cart is empty.</p>
                    )}
                </div>
            </div>
        </div>
    );

    const renderCheckoutView = () => {
        const isEditing = editingAddressId !== null || isAddingNewAddress;
        return (
            <div className="max-w-4xl mx-auto">
                <button onClick={() => setViewState('shopping')} className="text-teal-600 font-semibold mb-4">&larr; Back to Shopping</button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-xl font-bold mb-4">Select Delivery Address</h3>
                        <div className="space-y-3">
                            {addresses.map(addr => (
                                editingAddressId === addr.id ? (
                                    <AddressEditor key={addr.id} user={user} address={addr}
                                        onSave={() => { setEditingAddressId(null); onDataRefresh(); }}
                                        onCancel={() => setEditingAddressId(null)}
                                        onDelete={() => { if(window.confirm('Are you sure?')) { db.deleteAddress(addr.id); setEditingAddressId(null); onDataRefresh(); }}}
                                    />
                                ) : (
                                <div key={addr.id} className={`p-3 rounded-lg border cursor-pointer relative ${selectedAddressId === addr.id ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`} onClick={() => !isEditing && setSelectedAddressId(addr.id)}>
                                     <div className="flex items-start">
                                        <input type="radio" name="address" checked={selectedAddressId === addr.id} readOnly disabled={isEditing} className="mt-1"/>
                                        <div className="ml-3 text-sm">
                                            <p className="font-semibold">{addr.fullName} ({addr.type})</p>
                                            <p className="text-gray-600">{addr.addressLine1}, {addr.city} - {addr.pincode}</p>
                                        </div>
                                    </div>
                                    {!isEditing && <button onClick={(e) => { e.stopPropagation(); setEditingAddressId(addr.id) }} className="absolute top-2 right-2 text-xs font-semibold text-blue-600 hover:underline">Edit</button>}
                                </div>
                                )
                            ))}
                            {isAddingNewAddress ? (
                                <AddressEditor user={user} onSave={() => { setIsAddingNewAddress(false); onDataRefresh(); }} onCancel={() => setIsAddingNewAddress(false)} />
                            ) : ( !isEditing &&
                                <button onClick={() => setIsAddingNewAddress(true)} className="flex items-center justify-center w-full p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">
                                    <PlusCircleIcon className="w-5 h-5 mr-2" /> Add a New Address
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-lg border self-start">
                        <h3 className="text-xl font-bold mb-4">Order Summary</h3>
                         <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span>Subtotal ({cartDetails.totalItems} items)</span><span>{formatCurrency(cartDetails.subtotal)}</span></div>
                            <div className="flex justify-between"><span>GST (18%)</span><span>+ {formatCurrency(cartDetails.gst)}</span></div>
                            <div className="flex justify-between"><span>Delivery Fee</span><span className="text-green-600">FREE</span></div>
                             <div className="flex justify-between items-center text-xs p-2 bg-gray-50 rounded-md">
                                <div>
                                    <p className="font-semibold text-gray-800">BHC Protect Promise</p>
                                    <p className="text-gray-500">Secure packaging & timely delivery</p>
                                </div>
                                <span className="font-semibold">+ {formatCurrency(PROTECT_PROMISE_FEE)}</span>
                            </div>
                         </div>
                         <div className="border-t my-4"></div>
                         <div className="flex justify-between font-bold text-lg">
                            <span>Total Payable</span>
                            <span>{formatCurrency(cartDetails.totalPayable)}</span>
                         </div>
                         <div className="text-center mt-4 p-2 bg-green-50 text-green-700 rounded-md text-sm font-semibold">
                            You are saving {formatCurrency(cartDetails.savings)} on this order!
                         </div>
                         <button onClick={() => setShowPaymentModal(true)} className="mt-4 w-full py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 disabled:bg-gray-400" disabled={!selectedAddressId || isEditing}>
                            Place Order & Pay
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    
    const renderOrdersView = () => (
        <div className="space-y-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-700">Your Medicine Orders</h2>
            {orders.length > 0 ? (
                orders.map(order => (
                     <div key={order.id} className="bg-white p-6 rounded-xl shadow-lg border">
                        <div className="flex flex-col md:flex-row justify-between md:items-start border-b pb-4 mb-4">
                            <div>
                                <h3 className="font-bold text-lg text-gray-800">Order #{order.id}</h3>
                                <p className="text-sm text-gray-500">Placed on {new Date(order.orderDate).toLocaleDateString()}</p>
                            </div>
                            <div className="font-bold text-lg text-teal-600 mt-2 md:mt-0">{formatCurrency(order.totalAmount)}</div>
                        </div>
                        <OrderTracker status={order.status} />
                         <div className="mt-4 pt-4 border-t">
                            <button onClick={() => setExpandedOrderId(prevId => prevId === order.id ? null : order.id)} className="font-semibold text-teal-600 text-sm">
                                {expandedOrderId === order.id ? 'Hide Details' : 'View Details'}
                            </button>
                            {expandedOrderId === order.id && (
                                <div className="text-sm mt-2 space-y-2 animate-fade-in-fast">
                                    <p><span className="font-semibold">Items:</span> {order.items.map(i => `${i.quantity}x ${i.medicineName}`).join(', ')}</p>
                                    <p><span className="font-semibold">Deliver to:</span> {order.deliveryAddress.addressLine1}, {order.deliveryAddress.city}</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center py-16 px-4 bg-white rounded-xl shadow-lg">
                    <ArchiveIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900">No Orders Found</h3>
                    <p className="mt-1 text-sm text-gray-500">You haven't placed any orders yet.</p>
                </div>
            )}
        </div>
    );
    
    return (
        <div className="space-y-6">
            {notification && (
                <div className={`fixed top-24 right-8 z-50 p-4 rounded-lg shadow-lg text-white ${notification.type === 'success' ? 'bg-teal-600' : 'bg-red-600'}`}>
                    {notification.message}
                </div>
            )}
            
            {showPaymentModal && <PaymentModal totalAmount={cartDetails.totalPayable} onClose={() => setShowPaymentModal(false)} onConfirm={handleConfirmAndPlaceOrder} />}

            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-800">Online Pharmacy</h1>
                <div className="bg-white p-1 rounded-lg shadow-sm border">
                    <nav className="flex items-center space-x-1">
                        <button onClick={() => setActiveTab('shop')} className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'shop' ? 'bg-teal-600 text-white' : 'text-gray-600 hover:bg-teal-100'}`}>
                            <ShoppingBagIcon className="w-5 h-5 mr-2" /> Shop Medicines
                        </button>
                        <button onClick={() => setActiveTab('orders')} className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'orders' ? 'bg-teal-600 text-white' : 'text-gray-600 hover:bg-teal-100'}`}>
                            <ArchiveIcon className="w-5 h-5 mr-2" /> My Orders
                        </button>
                    </nav>
                </div>
            </div>

            {activeTab === 'shop' && (
                viewState === 'shopping' ? renderShoppingView() : renderCheckoutView()
            )}
            {activeTab === 'orders' && renderOrdersView()}
        </div>
    );
};

export default PharmacyView;
