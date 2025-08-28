

import React, { useState, useMemo, useEffect } from 'react';
import { Medicine, MedicineOrder, User, Address } from '../types';
import { ShoppingBagIcon, ArchiveIcon, PlusCircleIcon, MinusCircleIcon, Trash2Icon, HomeIcon, CheckCircleIcon as CheckIcon, SearchIcon } from './IconComponents';
import { generateQrCode } from '../services/qrService';
import * as db from '../services/dbService';
import AddressEditor from './AddressEditor';
import { MedicineOrderTracker } from './OrderTrackers';


const GST_RATE = 0.18; // 18% GST
const PROTECT_PROMISE_FEE = 9;
const DELIVERY_FEE = 0; // Free delivery for now

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
};

const MedicineCard: React.FC<{ medicine: Medicine, onAddToCart: () => void }> = ({ medicine, onAddToCart }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <img src={medicine.imageUrl} alt={medicine.name} className="h-40 w-full object-cover" />
      <div className="p-4 flex-grow flex flex-col">
        <h3 className="text-md font-bold text-gray-800 dark:text-gray-100">{medicine.name}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex-grow">{medicine.description}</p>
      </div>
       <div className="px-4 pb-4 pt-2 bg-gray-50/70 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center">
              <div>
                <span className="text-xl font-bold text-teal-600 dark:text-teal-400">{formatCurrency(medicine.price)}</span>
                <span className="text-sm text-gray-500 line-through ml-2">{formatCurrency(medicine.mrp)}</span>
              </div>
              <button onClick={onAddToCart} className="px-4 py-2 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700 transition-colors shadow-md">
                Add
              </button>
          </div>
      </div>
    </div>
);


const CartView: React.FC<{
    cart: { [key: number]: number },
    medicines: Medicine[],
    onUpdateCart: (medicineId: number, quantity: number) => void,
    onCheckout: () => void
}> = ({ cart, medicines, onUpdateCart, onCheckout }) => {
    
    const cartItems = Object.keys(cart).map(id => {
        const medicine = medicines.find(m => m.id === Number(id));
        return { medicine, quantity: cart[Number(id)] };
    }).filter(item => item.medicine);

    const subtotal = cartItems.reduce((sum, item) => sum + (item.medicine!.price * item.quantity), 0);
    const totalMrp = cartItems.reduce((sum, item) => sum + (item.medicine!.mrp * item.quantity), 0);
    const savings = totalMrp - subtotal;
    const gst = subtotal * GST_RATE;
    const totalAmount = subtotal + gst + DELIVERY_FEE + PROTECT_PROMISE_FEE;

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Your Cart</h2>
            {cartItems.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                        {cartItems.map(({ medicine, quantity }) => (
                            <div key={medicine!.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <div className="flex items-center">
                                    <img src={medicine!.imageUrl} alt={medicine!.name} className="w-16 h-16 rounded-md object-cover mr-4" />
                                    <div>
                                        <p className="font-semibold text-gray-800 dark:text-gray-100">{medicine!.name}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">{formatCurrency(medicine!.price)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => onUpdateCart(medicine!.id, Math.max(0, quantity - 1))} className="p-1 rounded-full bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">
                                        {quantity === 1 ? <Trash2Icon className="w-5 h-5 text-red-600 dark:text-red-400"/> : <MinusCircleIcon className="w-5 h-5"/>}
                                    </button>
                                    <span className="font-bold w-6 text-center">{quantity}</span>
                                    <button onClick={() => onUpdateCart(medicine!.id, quantity + 1)} className="p-1 rounded-full bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">
                                        <PlusCircleIcon className="w-5 h-5"/>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="lg:col-span-1 bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                        <h3 className="font-bold mb-4 text-gray-800 dark:text-gray-100">Bill Details</h3>
                        <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                           <div className="flex justify-between"><span>Subtotal</span> <span>{formatCurrency(subtotal)}</span></div>
                           <div className="flex justify-between"><span>GST ({GST_RATE*100}%)</span> <span>+ {formatCurrency(gst)}</span></div>
                           <div className="flex justify-between"><span>Delivery Fee</span> <span className="text-green-600 dark:text-green-400">FREE</span></div>
                           <div className="flex justify-between"><span>Protect Promise Fee</span> <span>+ {formatCurrency(PROTECT_PROMISE_FEE)}</span></div>
                           <div className="flex justify-between text-green-600 dark:text-green-400 font-semibold border-t border-dashed border-gray-300 dark:border-gray-500 pt-2 mt-2"><span>Your Savings</span> <span>{formatCurrency(savings)}</span></div>
                        </div>
                        <div className="flex justify-between font-bold text-lg mt-4 pt-2 border-t border-gray-300 dark:border-gray-500 text-gray-800 dark:text-gray-100">
                            <span>Total Amount</span>
                            <span>{formatCurrency(totalAmount)}</span>
                        </div>
                         <button onClick={onCheckout} className="w-full mt-6 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 shadow-lg">
                            Proceed to Checkout
                        </button>
                    </div>
                </div>
            ) : (
                <div className="text-center py-12">
                    <ShoppingBagIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Your cart is empty.</p>
                </div>
            )}
        </div>
    );
};

const CheckoutView: React.FC<{
    cart: { [key: number]: number },
    medicines: Medicine[],
    user: User,
    addresses: Address[],
    onBackToCart: () => void,
    onPlaceOrder: (userId: number, cart: { [medicineId: number]: number }, address: Address, deliveryFee: number, promiseFee: number) => { message: string },
    onDataRefresh: () => void
}> = ({ cart, medicines, user, addresses, onBackToCart, onPlaceOrder, onDataRefresh }) => {
    
    const [step, setStep] = useState<'address' | 'payment' | 'confirmed'>('address');
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
    const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const cartItems = Object.keys(cart).map(id => {
        const medicine = medicines.find(m => m.id === Number(id));
        return { medicine, quantity: cart[Number(id)] };
    }).filter(item => item.medicine);

    const subtotal = cartItems.reduce((sum, item) => sum + (item.medicine!.price * item.quantity), 0);
    const gst = subtotal * GST_RATE;
    const totalAmount = subtotal + gst + DELIVERY_FEE + PROTECT_PROMISE_FEE;

    useEffect(() => {
        if (addresses.length > 0 && !selectedAddressId) {
            setSelectedAddressId(addresses[0].id);
        } else if (addresses.length === 0) {
            setIsAddingNewAddress(true);
        }
    }, [addresses, selectedAddressId]);
    
    const handleProceedToPayment = async () => {
        setError('');
        if (!selectedAddressId) {
            setError('Please select or add a delivery address.'); return;
        }
        setIsLoading(true);
        try {
            const url = await generateQrCode(totalAmount.toFixed(2));
            setQrCodeUrl(url);
            setStep('payment');
        } catch (err: any) {
            setError(err.message || 'Could not generate QR code.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleConfirmOrder = () => {
        const selectedAddress = addresses.find(a => a.id === selectedAddressId);
        if (!selectedAddress) {
            setError("Address not found. Please go back and re-select."); return;
        }
        setIsLoading(true);
        setError('');
        try {
            onPlaceOrder(user.id, cart, selectedAddress, DELIVERY_FEE, PROTECT_PROMISE_FEE);
            setStep('confirmed');
        } catch (err: any) {
             setError(err.message || 'Failed to place order.');
        } finally {
             setIsLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            {step === 'address' && (
                 <>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Select Delivery Address</h2>
                    <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
                        {addresses.map(address => (
                            <div key={address.id} className={`p-4 rounded-lg border cursor-pointer flex items-start ${selectedAddressId === address.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600'}`} onClick={() => setSelectedAddressId(address.id)}>
                                <input type="radio" name="address" checked={selectedAddressId === address.id} readOnly className="mt-1"/>
                                <div className="ml-4 text-sm">
                                    <p className="font-semibold text-gray-800 dark:text-gray-100 flex items-center">
                                        <span className={`px-2 py-0.5 rounded-full text-xs mr-2 ${address.type === 'Home' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300'}`}>{address.type}</span>
                                        {address.fullName}
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-300 mt-1">{address.addressLine1}, {address.addressLine2}, {address.city} - {address.pincode}</p>
                                    <p className="text-gray-600 dark:text-gray-300">Phone: {address.phone}</p>
                                </div>
                            </div>
                        ))}
                        {isAddingNewAddress ? (
                            <AddressEditor user={user} onSave={() => { setIsAddingNewAddress(false); onDataRefresh(); }} onCancel={() => setIsAddingNewAddress(false)} />
                        ) : (
                             <button onClick={() => setIsAddingNewAddress(true)} className="flex items-center justify-center w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <PlusCircleIcon className="w-5 h-5 mr-2" /> Add New Address
                            </button>
                        )}
                    </div>
                    <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
                        <button onClick={onBackToCart} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500">Back to Cart</button>
                        <button onClick={handleProceedToPayment} disabled={isLoading || isAddingNewAddress} className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:bg-teal-400">
                           {isLoading ? 'Processing...' : 'Proceed to Payment'}
                        </button>
                    </div>
                 </>
            )}
            {step === 'payment' && (
                <div className="flex flex-col items-center text-center">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Complete Your Payment</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Pay <span className="font-bold">{formatCurrency(totalAmount)}</span> to confirm your order.</p>
                     <div className="p-4 my-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 h-64 w-64 flex items-center justify-center">
                        {qrCodeUrl ? <img src={qrCodeUrl} alt="Payment QR Code" className="w-56 h-56 object-contain" /> : <p className="text-red-500">{error || "Generating QR..."}</p> }
                    </div>
                     <p className="text-xs text-gray-500 dark:text-gray-400">Scan with any UPI app</p>
                    <div className="flex justify-center space-x-4 pt-6 w-full">
                        <button type="button" onClick={() => setStep('address')} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500">Back</button>
                        <button type="button" onClick={handleConfirmOrder} disabled={isLoading || !qrCodeUrl} className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:bg-teal-400">
                            {isLoading ? 'Confirming...' : "I've Paid, Confirm"}
                        </button>
                    </div>
                </div>
            )}
             {step === 'confirmed' && (
                <div className="text-center py-8">
                    <CheckIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-4">Order Placed Successfully!</h3>
                    <p className="text-gray-700 dark:text-gray-300">Your order will be delivered to your selected address soon.</p>
                    <button onClick={onBackToCart} className="mt-8 px-8 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700">Continue Shopping</button>
                </div>
            )}
        </div>
    );
};


const PharmacyView: React.FC<{
    medicines: Medicine[],
    orders: MedicineOrder[],
    user: User,
    addresses: Address[],
    onPlaceOrder: (userId: number, cart: { [medicineId: number]: number }, address: Address, deliveryFee: number, promiseFee: number) => { message: string },
    onDataRefresh: () => void
}> = ({ medicines, orders, user, addresses, onPlaceOrder, onDataRefresh }) => {
    
    const [activeTab, setActiveTab] = useState<'browse' | 'cart' | 'checkout' | 'orders'>('browse');
    const [searchTerm, setSearchTerm] = useState('');
    const [cart, setCart] = useState<{ [key: number]: number }>({});
    const [notification, setNotification] = useState<string | null>(null);

    const filteredMedicines = useMemo(() => {
        return medicines.filter(med => med.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [medicines, searchTerm]);

    const cartCount = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);

    const showNotification = (message: string) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 3000);
    };

    const handleUpdateCart = (medicineId: number, quantity: number) => {
        setCart(prev => {
            const newCart = { ...prev };
            if (quantity <= 0) {
                delete newCart[medicineId];
            } else {
                newCart[medicineId] = quantity;
            }
            return newCart;
        });
    };

    const handleAddToCart = (medicineId: number) => {
        handleUpdateCart(medicineId, (cart[medicineId] || 0) + 1);
        const medicine = medicines.find(m => m.id === medicineId);
        showNotification(`${medicine?.name || 'Item'} added to cart!`);
    };
    
    const handlePlaceOrderAndReset = (userId: number, cartData: { [medicineId: number]: number }, address: Address, deliveryFee: number, promiseFee: number) => {
        try {
            const result = onPlaceOrder(userId, cartData, address, deliveryFee, promiseFee);
            setCart({});
            return result;
        } catch(err) {
            console.error(err);
            throw err;
        }
    };
    
    const handleBackToCart = () => {
        if (cartCount > 0) {
            setActiveTab('cart');
        } else {
            setActiveTab('browse');
        }
    };


    return (
        <div className="space-y-6">
            {notification && (
                <div className="fixed top-24 right-8 z-50 p-4 rounded-lg shadow-lg bg-teal-600 text-white animate-slide-in-right">
                    {notification}
                </div>
            )}
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Pharmacy</h1>
                 <div className="bg-white dark:bg-gray-800 p-1 rounded-lg shadow-sm border dark:border-gray-700">
                    <nav className="flex items-center space-x-1">
                        <button onClick={() => setActiveTab('browse')} className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'browse' ? 'bg-teal-600 text-white' : 'text-gray-600 hover:bg-teal-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
                            <ShoppingBagIcon className="w-5 h-5 mr-2" /> Browse
                        </button>
                         <button onClick={() => setActiveTab('cart')} className={`relative flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'cart' || activeTab === 'checkout' ? 'bg-teal-600 text-white' : 'text-gray-600 hover:bg-teal-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
                            <ShoppingBagIcon className="w-5 h-5 mr-2" /> Cart
                            {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{cartCount}</span>}
                        </button>
                        <button onClick={() => setActiveTab('orders')} className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'orders' ? 'bg-teal-600 text-white' : 'text-gray-600 hover:bg-teal-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
                           <ArchiveIcon className="w-5 h-5 mr-2" /> My Orders
                        </button>
                    </nav>
                </div>
            </div>
            
            {activeTab === 'browse' && (
                <>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search for medicines and health products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {filteredMedicines.map(med => (
                            <MedicineCard key={med.id} medicine={med} onAddToCart={() => handleAddToCart(med.id)} />
                        ))}
                    </div>
                </>
            )}
            
            {activeTab === 'cart' && <CartView cart={cart} medicines={medicines} onUpdateCart={handleUpdateCart} onCheckout={() => setActiveTab('checkout')} />}
            
            {activeTab === 'checkout' && <CheckoutView cart={cart} medicines={medicines} user={user} addresses={addresses} onBackToCart={handleBackToCart} onPlaceOrder={handlePlaceOrderAndReset} onDataRefresh={onDataRefresh} />}

            {activeTab === 'orders' && (
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-100">Your Past Orders</h2>
                    {orders.length > 0 ? (
                        orders.map(order => (
                             <div key={order.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                                <div className="flex flex-col md:flex-row justify-between md:items-start border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">Order #{order.id}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Placed on {new Date(order.orderDate).toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-lg md:text-xl font-bold text-teal-600 dark:text-teal-400 mt-2 md:mt-0">{formatCurrency(order.totalAmount)}</div>
                                </div>
                                
                                <div className="mb-6">
                                    <MedicineOrderTracker status={order.status} />
                                </div>
                                 <div className="text-sm">
                                    <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Items</h4>
                                     <ul className="space-y-1 list-disc list-inside text-gray-600 dark:text-gray-300">
                                        {order.items.map(item => <li key={item.medicineId}>{item.quantity} x {item.medicineName}</li>)}
                                    </ul>
                                </div>
                             </div>
                        ))
                    ) : (
                         <div className="text-center py-16 px-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                            <ArchiveIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">No Orders Found</h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">You haven't placed any orders yet.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};


export default PharmacyView;