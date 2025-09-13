import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Medicine, MedicineOrder, User, Address } from '../types';
import { ShoppingBagIcon, ArchiveIcon, PlusCircleIcon, MinusCircleIcon, Trash2Icon, HomeIcon, CheckCircleIcon as CheckIcon, SearchIcon, HeartIcon, FileTextIcon } from './IconComponents';
import { generateQrCode } from '../services/qrService';
import * as db from '../services/dbService';
import AddressEditor from './AddressEditor';
import { MedicineOrderTracker } from './OrderTrackers';
import { GST_RATE } from '../utils/constants';


const PROTECT_PROMISE_FEE = 9;
const DELIVERY_FEE = 0; // Free delivery for now

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
};

const MedicineCard: React.FC<{ 
    medicine: Medicine, 
    onAddToCart: () => void,
    isWishlisted: boolean,
    onToggleWishlist: () => void
}> = ({ medicine, onAddToCart, isWishlisted, onToggleWishlist }) => (
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
              <div className="flex items-center space-x-2">
                <button 
                  onClick={onToggleWishlist} 
                  className="p-2 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                  aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <HeartIcon className="w-6 h-6" filled={isWishlisted} />
                </button>
                <button onClick={onAddToCart} className="px-4 py-2 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700 transition-colors shadow-md">
                  Add
                </button>
              </div>
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
    onPlaceOrder: (userId: number, cart: { [medicineId: number]: number }, address: Address, deliveryFee: number, promiseFee: number) => MedicineOrder,
    onDataRefresh: () => void
}> = ({ cart, medicines, user, addresses, onBackToCart, onPlaceOrder, onDataRefresh }) => {
    
    const [step, setStep] = useState<'address' | 'payment' | 'confirmed'>('address');
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
    const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [lastOrder, setLastOrder] = useState<MedicineOrder | null>(null);

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
            const newOrder = onPlaceOrder(user.id, cart, selectedAddress, DELIVERY_FEE, PROTECT_PROMISE_FEE);
            setLastOrder(newOrder);
            setStep('confirmed');
        } catch (err: any) {
             setError(err.message || 'Failed to place order.');
        } finally {
             setIsLoading(false);
        }
    };

    const handleDownloadReceipt = () => {
        if (!lastOrder) return;
        
        const order = lastOrder;
        const { deliveryAddress: addr } = order;
        const itemsHtml = order.items.map(item => `
            <tr>
            <td>${item.quantity} x ${item.medicineName}</td>
            <td class="text-right">${formatCurrency(item.price)}</td>
            <td class="text-right">${formatCurrency(item.price * item.quantity)}</td>
            </tr>
        `).join('');

        const receiptContent = `
            <html>
            <head>
                <title>Order Receipt #${order.id}</title>
                <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 2rem; background-color: #f9fafb; }
                .container { max-width: 800px; margin: auto; background: white; border: 1px solid #e5e7eb; padding: 2.5rem; border-radius: 0.75rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06); }
                h1 { text-align: center; color: #0d9488; margin-bottom: 0.5rem; }
                .header-sub { text-align: center; color: #6b7280; margin-top:0; margin-bottom: 2rem; }
                .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin: 2rem 0; }
                .details-grid > div > strong { display: block; margin-bottom: 0.5rem; color: #374151; }
                .details-grid p { margin: 0; }
                .pricing div { display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid #f3f4f6; }
                .pricing strong { color: #111827; }
                .address { line-height: 1.6; color: #4b5563; }
                table { width: 100%; border-collapse: collapse; margin: 2rem 0; }
                th, td { text-align: left; padding: 0.75rem; border-bottom: 1px solid #f3f4f6; }
                th { background-color: #f9fafb; font-weight: 600; color: #374151; }
                td { color: #4b5563; }
                .text-right { text-align: right; }
                .total { font-weight: bold; font-size: 1.2rem; color: #0d9488; border-top: 2px solid #0d9488; margin-top: 0.5rem; }
                .paid-stamp { text-align: center; font-size: 2rem; font-weight: bold; color: #16a34a; border: 5px solid #16a34a; padding: 0.5rem 1rem; margin-top: 2.5rem; transform: rotate(-10deg); opacity: 0.7; border-radius: 0.5rem; display: inline-block; }
                .stamp-container { text-align: center; }
                </style>
            </head>
            <body>
                <div class="container">
                <h1>Order Receipt</h1>
                <p class="header-sub">Bihar Health Connect</p>
                
                <div class="details-grid">
                    <div>
                        <strong>Billed To:</strong>
                        <p class="address">
                            ${addr.fullName}<br>
                            ${addr.addressLine1}<br>
                            ${addr.addressLine2 ? addr.addressLine2 + '<br>' : ''}
                            ${addr.city}, ${addr.state} - ${addr.pincode}<br>
                            Phone: ${addr.phone}
                        </p>
                    </div>
                    <div>
                        <strong>Order Details:</strong>
                        <p class="address">
                            <strong>Order ID:</strong> #${order.id}<br>
                            <strong>Order Date:</strong> ${new Date(order.orderDate).toLocaleDateString()}<br>
                            <strong>Status:</strong> ${order.status}
                        </p>
                    </div>
                </div>
                
                <table>
                    <thead>
                    <tr>
                        <th>Item</th>
                        <th class="text-right">Price</th>
                        <th class="text-right">Total</th>
                    </tr>
                    </thead>
                    <tbody>
                    ${itemsHtml}
                    </tbody>
                </table>

                <div class="pricing">
                    <div><span>Subtotal:</span> <span>${formatCurrency(order.subtotal)}</span></div>
                    ${order.savings > 0 ? `<div><span style="color: #16a34a;">Savings:</span> <span style="color: #16a34a;">- ${formatCurrency(order.savings)}</span></div>` : ''}
                    <div><span>GST:</span> <span>+ ${formatCurrency(order.gst)}</span></div>
                    <div><span>Delivery Fee:</span> <span>+ ${formatCurrency(order.deliveryFee)}</span></div>
                    <div class="total"><strong>Total Paid:</strong> <strong>${formatCurrency(order.totalAmount)}</strong></div>
                </div>

                <div class="stamp-container">
                    <div class="paid-stamp">PAID</div>
                </div>
                </div>
            </body>
            </html>
        `;

        const blob = new Blob([receiptContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pharmacy-receipt-${order.id}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
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
                    <div className="flex justify-center space-x-4 mt-8">
                        <button onClick={handleDownloadReceipt} className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                            <FileTextIcon className="w-5 h-5 mr-2"/> Download Receipt
                        </button>
                        <button onClick={onBackToCart} className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">Continue Shopping</button>
                    </div>
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
    onPlaceOrder: (userId: number, cart: { [medicineId: number]: number }, address: Address, deliveryFee: number, promiseFee: number) => MedicineOrder,
    onDataRefresh: () => void
}> = ({ medicines, orders, user, addresses, onPlaceOrder, onDataRefresh }) => {
    
    const [activeTab, setActiveTab] = useState<'browse' | 'cart' | 'checkout' | 'orders' | 'wishlist'>('browse');
    const [searchTerm, setSearchTerm] = useState('');
    const [cart, setCart] = useState<{ [key: number]: number }>({});
    const [wishlist, setWishlist] = useState<number[]>([]);
    const [notification, setNotification] = useState<string | null>(null);

    const refreshWishlist = useCallback(() => {
        if (user) {
            setWishlist(db.getWishlist(user.id));
        }
    }, [user]);

    useEffect(() => {
        refreshWishlist();
    }, [refreshWishlist]);

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

    const handleToggleWishlist = (medicineId: number) => {
        if (!user) return;
        const medicine = medicines.find(m => m.id === medicineId);
        if (db.isMedicineInWishlist(user.id, medicineId)) {
            db.removeFromWishlist(user.id, medicineId);
            showNotification(`${medicine?.name || 'Item'} removed from wishlist!`);
        } else {
            db.addToWishlist(user.id, medicineId);
            showNotification(`${medicine?.name || 'Item'} added to wishlist!`);
        }
        refreshWishlist();
    };
    
    const handlePlaceOrderAndReset = (userId: number, cartData: { [medicineId: number]: number }, address: Address, deliveryFee: number, promiseFee: number) => {
        try {
            const newOrder = onPlaceOrder(userId, cartData, address, deliveryFee, promiseFee);
            setCart({});
            return newOrder;
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
                        <button onClick={() => setActiveTab('wishlist')} className={`relative flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'wishlist' ? 'bg-teal-600 text-white' : 'text-gray-600 hover:bg-teal-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
                            <HeartIcon className="w-5 h-5 mr-2" /> My Wishlist
                            {wishlist.length > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{wishlist.length}</span>}
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
                            <MedicineCard 
                                key={med.id} 
                                medicine={med} 
                                onAddToCart={() => handleAddToCart(med.id)} 
                                isWishlisted={wishlist.includes(med.id)}
                                onToggleWishlist={() => handleToggleWishlist(med.id)}
                            />
                        ))}
                    </div>
                </>
            )}
            
            {activeTab === 'wishlist' && (
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-100">Your Wishlist</h2>
                    {wishlist.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {medicines
                                .filter(med => wishlist.includes(med.id))
                                .map(med => (
                                    <MedicineCard
                                        key={med.id}
                                        medicine={med}
                                        onAddToCart={() => handleAddToCart(med.id)}
                                        isWishlisted={true}
                                        onToggleWishlist={() => handleToggleWishlist(med.id)}
                                    />
                                ))}
                        </div>
                    ) : (
                         <div className="text-center py-16 px-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                            <HeartIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">Your Wishlist is Empty</h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Add items by clicking the heart icon on any product.</p>
                        </div>
                    )}
                </div>
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
                                    <MedicineOrderTracker order={order} />
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