import React, { useState, useEffect } from 'react';
import { generateQrCode } from '../services/qrService';
import { QrCodeIcon, CreditCardIcon, AtSignIcon, XCircleIcon, XIcon } from './IconComponents';

interface PaymentOptionsProps {
    totalAmount: number;
    onPaymentSuccess: () => void;
    onBack: () => void;
    isLoading: boolean; // Loading for the final confirmation after payment
    itemName: string;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
};

const PaymentOptions: React.FC<PaymentOptionsProps> = ({ totalAmount, onPaymentSuccess, onBack, isLoading, itemName }) => {
    const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card' | 'qr'>('upi');
    const [isSimulatingPayment, setIsSimulatingPayment] = useState(false);
    const [error, setError] = useState('');

    // Form states
    const [upiId, setUpiId] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCvv, setCardCvv] = useState('');
    const [qrCodeUrl, setQrCodeUrl] = useState('');

    useEffect(() => {
        if (selectedMethod === 'qr' && !qrCodeUrl) {
            const generate = async () => {
                try {
                    const url = await generateQrCode(totalAmount.toFixed(2));
                    setQrCodeUrl(url);
                } catch (err) {
                    setError('Could not generate QR code.');
                }
            };
            generate();
        }
    }, [selectedMethod, qrCodeUrl, totalAmount]);

    const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
        setCardNumber(value.trim());
    };

    const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 2) {
            value = value.slice(0, 2) + ' / ' + value.slice(2);
        }
        setCardExpiry(value.slice(0, 7));
    };

    const validateAndPay = () => {
        setError('');
        if (selectedMethod === 'upi') {
            if (!/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(upiId)) {
                setError('Please enter a valid UPI ID (e.g., user@bank).');
                return;
            }
        } else if (selectedMethod === 'card') {
            if (cardNumber.replace(/\s/g, '').length !== 16) {
                setError('Please enter a valid 16-digit card number.');
                return;
            }
            if (!/^(0[1-9]|1[0-2])\s\/\s\d{2}$/.test(cardExpiry)) {
                setError('Please enter a valid expiry date (MM / YY).');
                return;
            }
            if (cardCvv.length < 3 || cardCvv.length > 4) {
                setError('Please enter a valid CVV.');
                return;
            }
        } else if (selectedMethod === 'qr') {
             // For QR, the "payment" is simulated by clicking the button which calls onPaymentSuccess
            onPaymentSuccess();
            return;
        }

        // Simulate payment processing for UPI and Card
        setIsSimulatingPayment(true);
        setTimeout(() => {
            setIsSimulatingPayment(false);
            onPaymentSuccess();
        }, 1500);
    };
    
    const PaymentButton: React.FC<{ onClick: () => void, text: string }> = ({ onClick, text }) => (
        <button
            type="button"
            onClick={onClick}
            disabled={isLoading || isSimulatingPayment}
            className="w-full mt-6 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 shadow-lg disabled:bg-teal-400 disabled:cursor-not-allowed transition-colors"
        >
            {isSimulatingPayment ? 'Processing...' : isLoading ? 'Confirming...' : text}
        </button>
    );

    const paymentTabs = [
        { id: 'upi', name: 'UPI', icon: AtSignIcon },
        { id: 'card', name: 'Card', icon: CreditCardIcon },
        { id: 'qr', name: 'QR Code', icon: QrCodeIcon },
    ];

    const inputClasses = "w-full p-3 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-teal-500 focus:border-teal-500";

    return (
        <div className="flex flex-col items-center text-center">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Complete Your Payment</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">to confirm your {itemName}.</p>

             <div className="w-full max-w-sm my-4 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <div className="flex justify-between font-bold text-lg text-gray-800 dark:text-gray-100">
                    <span>Total Payable:</span>
                    <span className="text-teal-600 dark:text-teal-400">{formatCurrency(totalAmount)}</span>
                </div>
            </div>

            <div className="w-full max-w-sm bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-1 flex space-x-1 mb-4">
                {paymentTabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setSelectedMethod(tab.id as any)}
                        className={`flex-1 flex items-center justify-center p-2 rounded-md text-sm font-medium transition-colors ${selectedMethod === tab.id ? 'bg-teal-600 text-white shadow' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}
                    >
                        <tab.icon className="w-5 h-5 mr-2" /> {tab.name}
                    </button>
                ))}
            </div>

            <div className="w-full max-w-sm text-left">
                {error && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-lg flex items-center justify-between text-sm text-red-700 dark:text-red-300">
                        <div className="flex items-center">
                            <XCircleIcon className="w-5 h-5 mr-3 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                         <button type="button" onClick={() => setError('')} className="p-1 -mr-1 rounded-full text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50" aria-label="Dismiss error">
                            <XIcon className="w-4 h-4" />
                        </button>
                    </div>
                )}
                
                {selectedMethod === 'upi' && (
                    <div className="space-y-4 animate-fade-in-fast">
                        <input type="text" value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="Enter your UPI ID" className={inputClasses} />
                        <PaymentButton onClick={validateAndPay} text={`Pay ${formatCurrency(totalAmount)}`} />
                    </div>
                )}

                {selectedMethod === 'card' && (
                     <div className="space-y-4 animate-fade-in-fast">
                        <input type="text" value={cardNumber} onChange={handleCardNumberChange} placeholder="Card Number" className={inputClasses} maxLength={19} />
                        <div className="grid grid-cols-2 gap-4">
                            <input type="text" value={cardExpiry} onChange={handleExpiryChange} placeholder="MM / YY" className={inputClasses} maxLength={7} />
                            <input type="text" value={cardCvv} onChange={e => setCardCvv(e.target.value.replace(/\D/g, ''))} placeholder="CVV" className={inputClasses} maxLength={4} />
                        </div>
                        <PaymentButton onClick={validateAndPay} text={`Pay ${formatCurrency(totalAmount)}`} />
                    </div>
                )}
                
                {selectedMethod === 'qr' && (
                     <div className="flex flex-col items-center animate-fade-in-fast">
                        <div className="p-4 my-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 h-64 w-64 flex items-center justify-center">
                            {qrCodeUrl ? <img src={qrCodeUrl} alt="Payment QR Code" className="w-56 h-56 object-contain" /> : <p>{error || "Generating QR..."}</p>}
                        </div>
                         <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Scan with any UPI app</p>
                        <PaymentButton onClick={validateAndPay} text="I've Paid, Confirm" />
                    </div>
                )}
            </div>

            <div className="mt-6">
                 <button type="button" onClick={onBack} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500">
                    Back
                </button>
            </div>
        </div>
    );
};

export default PaymentOptions;
