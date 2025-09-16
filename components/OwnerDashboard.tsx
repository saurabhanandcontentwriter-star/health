

import React, { useState, useMemo } from 'react';
import { Doctor, Appointment, AuthLog, PharmaCompany, UserSession, MedicineOrder, Medicine, LabTestBooking, DeliveryBoy, User, LabTest } from '../types';
import { RupeeIcon, QrCodeIcon, ActivityIcon, StethoscopeIcon, UserPlusIcon, PillIcon, HourglassIcon, SendIcon, PlusCircleIcon, XCircleIcon, CheckCircleIcon, EditIcon, Trash2Icon, TruckIcon, RefundIcon, ShoppingBagIcon, BeakerIcon, TestTubeIcon } from './IconComponents';
import { generateQrCode } from '../services/qrService';
import * as db from '../services/dbService';
import DoctorForm from './AddDoctorForm';
import MedicineForm from './AddMedicineForm';
import PatientsView from './PatientsView';
import { CONSULTATION_FEE } from '../utils/constants';
import LabTestForm from './AddLabTestForm';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  darkColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, darkColor }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg flex items-center space-x-4">
    <div className={`p-3 rounded-full ${color} ${darkColor}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
      <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{value}</p>
    </div>
  </div>
);

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
};

const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds} sec`;
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) {
        return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m ${seconds % 60}s`;
};


interface AssignDeliveryModalProps {
    orderId: number;
    orderType: 'medicine' | 'lab';
    onClose: () => void;
    onAssign: (orderType: 'medicine' | 'lab', orderId: number, deliveryBoy: DeliveryBoy) => void;
}

const AssignDeliveryModal: React.FC<AssignDeliveryModalProps> = ({ orderId, orderType, onClose, onAssign }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!name.trim() || !/^\d{10}$/.test(phone)) {
            setError('Please enter a valid name and 10-digit phone number.');
            return;
        }
        onAssign(orderType, orderId, { name, phone });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-sm">
                <h3 className="text-lg font-bold mb-4">Assign {orderType === 'medicine' ? 'Delivery Person' : 'Phlebotomist'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="db-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                        <input id="db-name" type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" required />
                    </div>
                    <div>
                        <label htmlFor="db-phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                        <input id="db-phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" required />
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div className="flex justify-end space-x-2 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-teal-600 text-white rounded-md">Assign</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const RevenueChart: React.FC<{ data: { month: string; revenue: number }[] }> = ({ data }) => {
    const [tooltip, setTooltip] = useState<{ x: number, y: number, month: string, revenue: number } | null>(null);
    const svgRef = React.useRef<SVGSVGElement>(null);

    const PADDING = 50;
    const SVG_WIDTH = 800;
    const SVG_HEIGHT = 400;

    const maxRevenue = Math.max(...data.map(d => d.revenue), 0);
    const yAxisMax = maxRevenue > 0 ? Math.ceil(maxRevenue / 1000) * 1000 : 5000;

    const getCoords = (monthIndex: number, revenue: number) => {
        const x = PADDING + (monthIndex / (data.length - 1)) * (SVG_WIDTH - 2 * PADDING);
        const y = SVG_HEIGHT - PADDING - (revenue / yAxisMax) * (SVG_HEIGHT - 2 * PADDING);
        return { x, y };
    };

    const linePath = data
        .map((d, i) => {
            const { x, y } = getCoords(i, d.revenue);
            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
        })
        .join(' ');

    const yAxisLabels = Array.from({ length: 6 }, (_, i) => {
        const value = (yAxisMax / 5) * i;
        const y = SVG_HEIGHT - PADDING - (i / 5) * (SVG_HEIGHT - 2 * PADDING);
        return { value, y };
    });

    const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
        if (!svgRef.current) return;
        const svgRect = svgRef.current.getBoundingClientRect();
        const svgX = e.clientX - svgRect.left;
        
        const index = Math.round(((svgX - PADDING) / (SVG_WIDTH - 2 * PADDING)) * (data.length - 1));
        
        if(index >= 0 && index < data.length) {
            const pointData = data[index];
            const { x, y } = getCoords(index, pointData.revenue);
            setTooltip({ x, y, ...pointData });
        }
    };
    
    return (
        <div className="relative">
            <svg
                ref={svgRef}
                viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setTooltip(null)}
                className="w-full h-auto"
            >
                {/* Y-axis grid lines and labels */}
                {yAxisLabels.map(({ value, y }) => (
                    <g key={value}>
                        <line x1={PADDING} y1={y} x2={SVG_WIDTH - PADDING} y2={y} className="stroke-gray-200 dark:stroke-gray-700" strokeWidth="1" strokeDasharray="3,3" />
                        <text x={PADDING - 10} y={y + 5} textAnchor="end" className="fill-gray-500 dark:fill-gray-400 text-xs">
                            {`₹${(value / 1000)}k`}
                        </text>
                    </g>
                ))}

                {/* X-axis labels */}
                {data.map((d, i) => {
                    const { x } = getCoords(i, 0);
                    const showLabel = data.length <= 12 || i % 2 === 0;
                    if (!showLabel) return null;
                    return (
                        <text key={d.month} x={x} y={SVG_HEIGHT - PADDING + 20} textAnchor="middle" className="fill-gray-500 dark:fill-gray-400 text-xs">
                            {d.month}
                        </text>
                    );
                })}
                
                {/* Line and Area */}
                <path d={linePath} className="stroke-teal-500 fill-none" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
                <path d={`${linePath} L ${SVG_WIDTH - PADDING} ${SVG_HEIGHT - PADDING} L ${PADDING} ${SVG_HEIGHT - PADDING} Z`} className="fill-teal-500/10" />

                {/* Tooltip elements */}
                {tooltip && (
                    <g>
                        <line x1={tooltip.x} y1={PADDING} x2={tooltip.x} y2={SVG_HEIGHT - PADDING} className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="1" strokeDasharray="3,3" />
                        <circle cx={tooltip.x} cy={tooltip.y} r="6" className="fill-teal-500 stroke-white dark:stroke-gray-800" strokeWidth="2" />
                    </g>
                )}
            </svg>
            {tooltip && (
                <div 
                    className="absolute p-2 text-xs bg-gray-800 dark:bg-gray-900 text-white rounded-md shadow-lg pointer-events-none transition-transform duration-100"
                    style={{ 
                        left: `${(tooltip.x / SVG_WIDTH) * 100}%`, 
                        top: `${(tooltip.y / SVG_HEIGHT) * 100}%`,
                        transform: `translate(-50%, -120%)`
                    }}
                >
                    <div className="font-bold">{tooltip.month}</div>
                    <div>{formatCurrency(tooltip.revenue)}</div>
                </div>
            )}
        </div>
    );
};


// --- Sub-components for each tab ---
interface OverviewViewProps {
    appointments: Appointment[];
    doctors: Doctor[];
    sessions: UserSession[];
    allMedicineOrders: MedicineOrder[];
    allLabTestBookings: LabTestBooking[];
}
const OverviewView: React.FC<OverviewViewProps> = 
({ appointments, doctors, sessions, allMedicineOrders, allLabTestBookings }) => {
    const [qrAmount, setQrAmount] = useState('500');
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [qrError, setQrError] = useState('');

    const [transferStep, setTransferStep] = useState<'details' | 'otp' | 'success'>('details');
    const [transferAmount, setTransferAmount] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
    const [ifscCode, setIfscCode] = useState('');
    const [otp, setOtp] = useState('');
    const [generatedOtp, setGeneratedOtp] = useState('');
    const [transferError, setTransferError] = useState('');

    const [refundStep, setRefundStep] = useState<'details' | 'otp' | 'success'>('details');
    const [refundOrderId, setRefundOrderId] = useState('');
    const [refundAmount, setRefundAmount] = useState('');
    const [refundUpiId, setRefundUpiId] = useState('');
    const [refundReason, setRefundReason] = useState('');
    const [refundOtp, setRefundOtp] = useState('');
    const [generatedRefundOtp, setGeneratedRefundOtp] = useState('');
    const [refundError, setRefundError] = useState('');

    const totalAppointmentRevenue = appointments.length * CONSULTATION_FEE;
    const totalMedicineRevenue = allMedicineOrders.reduce((sum, order) => sum + order.subtotal, 0);
    const totalLabRevenue = allLabTestBookings.filter(b => b.status !== 'Cancelled').reduce((sum, booking) => sum + booking.subtotal, 0);
    const totalRevenue = totalAppointmentRevenue + totalMedicineRevenue + totalLabRevenue;
    
    const revenueChartData = useMemo(() => {
        const months: { month: string, revenue: number }[] = [];
        const today = new Date();

        for (let i = 11; i >= 0; i--) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthLabel = date.toLocaleString('default', { month: 'short', year: '2-digit' });
            months.push({ month: monthLabel, revenue: 0 });
        }
        
        appointments.forEach(appt => {
            const apptDate = new Date(appt.appointment_date);
            const monthLabel = apptDate.toLocaleString('default', { month: 'short', year: '2-digit' });
            const monthData = months.find(m => m.month === monthLabel);
            if (monthData) {
                monthData.revenue += CONSULTATION_FEE;
            }
        });

        allMedicineOrders.forEach(order => {
            const orderDate = new Date(order.orderDate);
            const monthLabel = orderDate.toLocaleString('default', { month: 'short', year: '2-digit' });
            const monthData = months.find(m => m.month === monthLabel);
            if (monthData) {
                monthData.revenue += order.totalAmount;
            }
        });

        allLabTestBookings.forEach(booking => {
            if (booking.status !== 'Cancelled') {
                const bookingDate = new Date(booking.bookingDate);
                const monthLabel = bookingDate.toLocaleString('default', { month: 'short', year: '2-digit' });
                const monthData = months.find(m => m.month === monthLabel);
                if (monthData) {
                    monthData.revenue += booking.totalAmount;
                }
            }
        });

        return months;
    }, [appointments, allMedicineOrders, allLabTestBookings]);


    const handleGenerateQrCode = async () => {
        setQrError('');
        setIsGenerating(true);
        try {
            const url = await generateQrCode(qrAmount);
            setQrCodeUrl(url);
        } catch (err: any) {
            setQrError(err.message || 'Failed to generate QR code.');
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleInitiateTransfer = (e: React.FormEvent) => {
        e.preventDefault();
        setTransferError('');
        if (!transferAmount || Number(transferAmount) <= 0) {
            setTransferError('Please enter a valid transfer amount.'); return;
        }
        if (accountNumber.length < 9 || accountNumber.length > 18) {
            setTransferError('Please enter a valid account number.'); return;
        }
        if (accountNumber !== confirmAccountNumber) {
            setTransferError('Account numbers do not match.'); return;
        }
        if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode)) {
            setTransferError('Please enter a valid IFSC code.'); return;
        }
        const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOtp(newOtp);
        setTransferStep('otp');
    };

    const handleConfirmTransfer = (e: React.FormEvent) => {
        e.preventDefault();
        setTransferError('');
        if (otp !== generatedOtp) {
            setTransferError('Invalid OTP. Please try again.'); return;
        }
        setTransferStep('success');
    };

    const resetTransfer = () => {
        setTransferStep('details');
        setTransferAmount('');
        setAccountNumber('');
        setConfirmAccountNumber('');
        setIfscCode('');
        setOtp('');
        setGeneratedOtp('');
        setTransferError('');
    }

    const handleInitiateRefund = (e: React.FormEvent) => {
        e.preventDefault();
        setRefundError('');
        if (!refundOrderId || !refundAmount || Number(refundAmount) <= 0 || !refundUpiId) {
            setRefundError('Please fill all required fields with valid data.'); return;
        }
        if (!/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(refundUpiId)) {
            setRefundError('Please enter a valid UPI ID (e.g., user@bank).'); return;
        }
        const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedRefundOtp(newOtp);
        setRefundStep('otp');
    };

    const handleConfirmRefund = (e: React.FormEvent) => {
        e.preventDefault();
        setRefundError('');
        if (refundOtp !== generatedRefundOtp) {
            setRefundError('Invalid OTP. Please try again.'); return;
        }
        setRefundStep('success');
    };

    const resetRefund = () => {
        setRefundStep('details');
        setRefundOrderId('');
        setRefundAmount('');
        setRefundUpiId('');
        setRefundReason('');
        setRefundOtp('');
        setGeneratedRefundOtp('');
        setRefundError('');
    }

    const inputClasses = "w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white";

    return (
        <div className="space-y-8">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Doctors" value={doctors.length} icon={<StethoscopeIcon className="h-6 w-6 text-indigo-800"/>} color="bg-indigo-100" darkColor="dark:bg-indigo-900/50" />
                <StatCard title="Total Appointments" value={appointments.length} icon={<ActivityIcon className="h-6 w-6 text-blue-800"/>} color="bg-blue-100" darkColor="dark:bg-blue-900/50" />
                <StatCard title="Total Revenue" value={formatCurrency(totalRevenue)} icon={<RupeeIcon className="h-6 w-6 text-green-800"/>} color="bg-green-100" darkColor="dark:bg-green-900/50" />
                <StatCard title="Active Sessions" value={sessions.length} icon={<HourglassIcon className="h-6 w-6 text-yellow-800"/>} color="bg-yellow-100" darkColor="dark:bg-yellow-900/50" />
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Monthly Revenue Trend (Last 12 Months)</h3>
                <RevenueChart data={revenueChartData} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                    <div className="flex items-center mb-4">
                        <QrCodeIcon className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                        <h3 className="ml-3 text-xl font-bold text-gray-800 dark:text-gray-100">Generate Payment QR</h3>
                    </div>
                    <div className="flex items-center space-x-2">
                        <input type="number" value={qrAmount} onChange={e => setQrAmount(e.target.value)} className="flex-grow p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Amount in INR"/>
                        <button onClick={handleGenerateQrCode} disabled={isGenerating} className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:bg-teal-400">
                            {isGenerating ? 'Generating...' : 'Generate'}
                        </button>
                    </div>
                    {qrError && (
                        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-lg flex items-center text-sm text-red-700 dark:text-red-300">
                            <XCircleIcon className="w-5 h-5 mr-3 flex-shrink-0" />
                            <span>{qrError}</span>
                        </div>
                    )}
                    {qrCodeUrl && <img src={qrCodeUrl} alt="Generated QR Code" className="mx-auto mt-4 w-48 h-48 bg-white p-2 rounded-md"/>}
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                    <div className="flex items-center mb-4">
                        <SendIcon className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                        <h3 className="ml-3 text-xl font-bold text-gray-800 dark:text-gray-100">Transfer Funds to Bank</h3>
                    </div>
                    {transferStep === 'details' && (
                        <form onSubmit={handleInitiateTransfer} className="space-y-4">
                            <input type="number" value={transferAmount} onChange={e => setTransferAmount(e.target.value)} placeholder="Amount (₹)" className={inputClasses} required />
                            <input type="text" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} placeholder="Account Number" className={inputClasses} required />
                            <input type="text" value={confirmAccountNumber} onChange={e => setConfirmAccountNumber(e.target.value)} placeholder="Confirm Account Number" className={inputClasses} required />
                            <input type="text" value={ifscCode} onChange={e => setIfscCode(e.target.value.toUpperCase())} placeholder="IFSC Code" className={inputClasses} required />
                            {transferError && (
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-lg flex items-center text-sm text-red-700 dark:text-red-300">
                                    <XCircleIcon className="w-5 h-5 mr-3 flex-shrink-0" />
                                    <span>{transferError}</span>
                                </div>
                            )}
                            <button type="submit" className="w-full py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700">Transfer</button>
                        </form>
                    )}
                    {transferStep === 'otp' && (
                        <form onSubmit={handleConfirmTransfer} className="space-y-4">
                            <p className="text-sm dark:text-gray-300">Transferring <span className="font-bold">{formatCurrency(Number(transferAmount))}</span> to A/C ending in <span className="font-mono">{accountNumber.slice(-4)}</span></p>
                            <div className="p-2 bg-yellow-100 text-yellow-800 text-center rounded-md"><p>Simulated OTP: <span className="font-bold">{generatedOtp}</span></p></div>
                            <input type="text" value={otp} onChange={e => setOtp(e.target.value)} placeholder="Enter 6-digit OTP" className={inputClasses} required />
                            {transferError && (
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-lg flex items-center text-sm text-red-700 dark:text-red-300">
                                    <XCircleIcon className="w-5 h-5 mr-3 flex-shrink-0" />
                                    <span>{transferError}</span>
                                </div>
                            )}
                            <button type="submit" className="w-full py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700">Confirm Transfer</button>
                        </form>
                    )}
                    {transferStep === 'success' && (
                        <div className="text-center space-y-4">
                            <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto" />
                            <h4 className="font-bold text-lg">Transfer Successful!</h4>
                            <p className="text-sm">Transaction ID: <span className="font-mono">TXN{Date.now()}</span></p>
                            <button onClick={resetTransfer} className="w-full py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500">New Transfer</button>
                        </div>
                    )}
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                    <div className="flex items-center mb-4">
                        <RefundIcon className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                        <h3 className="ml-3 text-xl font-bold text-gray-800 dark:text-gray-100">Initiate Refund</h3>
                    </div>
                    {refundStep === 'details' && (
                        <form onSubmit={handleInitiateRefund} className="space-y-4">
                            <input type="text" value={refundOrderId} onChange={e => setRefundOrderId(e.target.value)} placeholder="Order/Booking ID" className={inputClasses} required />
                            <input type="number" value={refundAmount} onChange={e => setRefundAmount(e.target.value)} placeholder="Amount (₹)" className={inputClasses} required />
                            <input type="text" value={refundUpiId} onChange={e => setRefundUpiId(e.target.value)} placeholder="Customer UPI ID" className={inputClasses} required />
                            <textarea value={refundReason} onChange={e => setRefundReason(e.target.value)} placeholder="Reason for refund (optional)" rows={2} className={inputClasses} />
                            {refundError && (
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-lg flex items-center text-sm text-red-700 dark:text-red-300">
                                    <XCircleIcon className="w-5 h-5 mr-3 flex-shrink-0" />
                                    <span>{refundError}</span>
                                </div>
                            )}
                            <button type="submit" className="w-full py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700">Initiate</button>
                        </form>
                    )}
                    {refundStep === 'otp' && (
                        <form onSubmit={handleConfirmRefund} className="space-y-4">
                            <p className="text-sm dark:text-gray-300">Refunding <span className="font-bold">{formatCurrency(Number(refundAmount))}</span> to <span className="font-mono">{refundUpiId}</span></p>
                            <div className="p-2 bg-yellow-100 text-yellow-800 text-center rounded-md"><p>Simulated OTP: <span className="font-bold">{generatedRefundOtp}</span></p></div>
                            <input type="text" value={refundOtp} onChange={e => setRefundOtp(e.target.value)} placeholder="Enter 6-digit OTP" className={inputClasses} required />
                            {refundError && (
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-lg flex items-center text-sm text-red-700 dark:text-red-300">
                                    <XCircleIcon className="w-5 h-5 mr-3 flex-shrink-0" />
                                    <span>{refundError}</span>
                                </div>
                            )}
                            <button type="submit" className="w-full py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700">Confirm Refund</button>
                        </form>
                    )}
                    {refundStep === 'success' && (
                        <div className="text-center space-y-4">
                            <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto" />
                            <h4 className="font-bold text-lg">Refund Initiated!</h4>
                            <p className="text-sm">Transaction ID: <span className="font-mono">REF{Date.now()}</span></p>
                            <button onClick={resetRefund} className="w-full py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500">New Refund</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

interface MedicineOrdersViewProps {
    allMedicineOrders: MedicineOrder[];
    refreshData: () => void;
}
const MedicineOrdersView: React.FC<MedicineOrdersViewProps> = ({ allMedicineOrders, refreshData }) => {
    const [assignModal, setAssignModal] = useState<{ isOpen: boolean; orderId: number | null }>({ isOpen: false, orderId: null });
    const [error, setError] = useState<string | null>(null);

    const handleUpdateStatus = (orderId: number, newStatus: MedicineOrder['status']) => {
        setError(null);
        try {
            db.updateMedicineOrderStatus(orderId, newStatus);
            refreshData();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Could not update status.");
        }
    };

    const handleAssignDelivery = (orderType: 'medicine' | 'lab', orderId: number, deliveryBoy: DeliveryBoy) => {
        setError(null);
        try {
            db.assignDeliveryInfo(orderType, orderId, deliveryBoy);
            setAssignModal({ isOpen: false, orderId: null });
            refreshData();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to assign delivery person.');
            setAssignModal({ isOpen: false, orderId: null });
        }
    };

    return (
        <>
            {assignModal.isOpen && (
                <AssignDeliveryModal 
                    orderId={assignModal.orderId!}
                    orderType="medicine"
                    onClose={() => setAssignModal({ isOpen: false, orderId: null })}
                    onAssign={handleAssignDelivery}
                />
            )}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                <div className="flex items-center mb-4">
                    <ShoppingBagIcon className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                    <h3 className="ml-3 text-xl font-bold text-gray-800 dark:text-gray-100">Medicine Orders</h3>
                </div>
                {error && (
                    <div className="my-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-lg flex items-center text-sm text-red-700 dark:text-red-300">
                        <XCircleIcon className="w-5 h-5 mr-3 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}
                <div className="overflow-x-auto max-h-[60vh]">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Order Details</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Customer</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Delivery Person</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {allMedicineOrders.map(order => (
                                <tr key={order.id} className="dark:hover:bg-gray-700/50">
                                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                                        <p className="font-bold">Med Order #{order.id}</p>
                                        <p className="text-xs text-gray-500">{order.items.length} item(s)</p>
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm">{order.deliveryAddress.fullName}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                                        <select value={order.status} onChange={(e) => handleUpdateStatus(order.id, e.target.value as MedicineOrder['status'])} className="p-1 border rounded-md dark:bg-gray-600 dark:border-gray-500">
                                            <option>Processing</option><option>Shipped</option><option>Delivered</option>
                                        </select>
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                                        {order.deliveryBoy ? (
                                            <div>
                                                <p>{order.deliveryBoy.name}</p>
                                                <p className="text-xs text-gray-500">{order.deliveryBoy.phone}</p>
                                            </div>
                                        ) : order.status !== 'Delivered' ? (
                                            <button onClick={() => setAssignModal({ isOpen: true, orderId: order.id })} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-md hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-900">Assign</button>
                                        ) : (
                                            <span className="text-xs text-gray-500 dark:text-gray-400">-</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

interface TestBookingsViewProps {
    allLabTestBookings: LabTestBooking[];
    refreshData: () => void;
}
const TestBookingsView: React.FC<TestBookingsViewProps> = ({ allLabTestBookings, refreshData }) => {
    const [assignModal, setAssignModal] = useState<{ isOpen: boolean; orderId: number | null }>({ isOpen: false, orderId: null });
    const [error, setError] = useState<string | null>(null);
  
    const handleUpdateStatus = (bookingId: number, newStatus: LabTestBooking['status']) => {
        setError(null);
        try {
            db.updateLabTestBookingStatus(bookingId, newStatus);
            refreshData();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Could not update the booking status.");
        }
    };
  
    const handleAssignDelivery = (orderType: 'medicine' | 'lab', orderId: number, deliveryBoy: DeliveryBoy) => {
        setError(null);
        try {
            db.assignDeliveryInfo(orderType, orderId, deliveryBoy);
            setAssignModal({ isOpen: false, orderId: null });
            refreshData();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to assign phlebotomist.');
            setAssignModal({ isOpen: false, orderId: null });
        }
    };

    return (
        <>
            {assignModal.isOpen && (
                <AssignDeliveryModal 
                    orderId={assignModal.orderId!}
                    orderType="lab"
                    onClose={() => setAssignModal({ isOpen: false, orderId: null })}
                    onAssign={handleAssignDelivery}
                />
            )}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                <div className="flex items-center mb-4">
                    <BeakerIcon className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                    <h3 className="ml-3 text-xl font-bold text-gray-800 dark:text-gray-100">Lab Test Bookings</h3>
                </div>
                {error && (
                    <div className="my-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-lg flex items-center text-sm text-red-700 dark:text-red-300">
                        <XCircleIcon className="w-5 h-5 mr-3 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}
                <div className="overflow-x-auto max-h-[60vh]">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Booking Details</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Patient</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Phlebotomist</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                           {allLabTestBookings.map(booking => (
                                <tr key={booking.id} className="dark:hover:bg-gray-700/50">
                                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                                        <p className="font-bold">Lab Test #{booking.id}</p>
                                        <p className="text-xs text-gray-500">{booking.testName}</p>
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm">{booking.patientName}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                                        <select value={booking.status} onChange={(e) => handleUpdateStatus(booking.id, e.target.value as LabTestBooking['status'])} className="p-1 border rounded-md dark:bg-gray-600 dark:border-gray-500">
                                            <option>Booked</option><option>Sample Collected</option><option>Report Ready</option><option>Cancelled</option>
                                        </select>
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                                        {booking.deliveryBoy ? (
                                            <div>
                                                <p>{booking.deliveryBoy.name}</p>
                                                <p className="text-xs text-gray-500">{booking.deliveryBoy.phone}</p>
                                            </div>
                                        ) : booking.status !== 'Cancelled' ? (
                                            <button onClick={() => setAssignModal({ isOpen: true, orderId: booking.id })} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-md hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-900">Assign</button>
                                        ) : (
                                            <span className="text-xs text-gray-500 dark:text-gray-400">-</span>
                                        )}
                                    </td>
                                </tr>
                           ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

interface DoctorsViewProps {
    doctors: Doctor[];
    refreshData: () => void;
}
const DoctorsView: React.FC<DoctorsViewProps> = ({ doctors, refreshData }) => {
    const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
    const [isDoctorFormOpen, setIsDoctorFormOpen] = useState(false);

    const handleDeleteDoctor = (id: number) => {
        if (window.confirm('Are you sure you want to delete this doctor? This action cannot be undone.')) {
            db.deleteDoctor(id);
            refreshData();
        }
    };

    return (
        <>
        {isDoctorFormOpen && (
            <DoctorForm 
                doctorToEdit={editingDoctor} 
                onSuccess={() => { setIsDoctorFormOpen(false); setEditingDoctor(null); refreshData(); }}
                onClose={() => { setIsDoctorFormOpen(false); setEditingDoctor(null); }}
            />
        )}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                    <UserPlusIcon className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                    <h3 className="ml-3 text-xl font-bold text-gray-800 dark:text-gray-100">Doctor Management</h3>
                </div>
                <button onClick={() => { setEditingDoctor(null); setIsDoctorFormOpen(true); }} className="flex items-center px-3 py-1.5 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700"><PlusCircleIcon className="w-5 h-5 mr-1"/>Add Doctor</button>
            </div>
            <div className="overflow-x-auto max-h-96">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Name</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Specialty</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {doctors.map(doc => (
                            <tr key={doc.id} className="dark:hover:bg-gray-700/50">
                                <td className="px-4 py-2 whitespace-nowrap text-sm">{doc.name}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">{doc.specialty}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm space-x-2">
                                    <button onClick={() => { setEditingDoctor(doc); setIsDoctorFormOpen(true); }} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"><EditIcon className="w-4 h-4"/></button>
                                    <button onClick={() => handleDeleteDoctor(doc.id)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"><Trash2Icon className="w-4 h-4"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
        </>
    );
};

interface MedicinesViewProps {
    medicines: Medicine[];
    refreshData: () => void;
}
const MedicinesView: React.FC<MedicinesViewProps> = ({ medicines, refreshData }) => {
    const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
    const [isMedicineFormOpen, setIsMedicineFormOpen] = useState(false);

    const handleDeleteMedicine = (id: number) => {
        if (window.confirm('Are you sure you want to delete this medicine? This action cannot be undone.')) {
            db.deleteMedicine(id);
            refreshData();
        }
    };
    
    return (
        <>
        {isMedicineFormOpen && (
            <MedicineForm
                medicineToEdit={editingMedicine}
                onSuccess={() => { setIsMedicineFormOpen(false); setEditingMedicine(null); refreshData(); }}
                onClose={() => { setIsMedicineFormOpen(false); setEditingMedicine(null); }}
            />
        )}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
                <PillIcon className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                <h3 className="ml-3 text-xl font-bold text-gray-800 dark:text-gray-100">Medicine Inventory</h3>
            </div>
            <button onClick={() => { setEditingMedicine(null); setIsMedicineFormOpen(true); }} className="flex items-center px-3 py-1.5 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700"><PlusCircleIcon className="w-5 h-5 mr-1"/>Add Medicine</button>
            </div>
            <div className="overflow-x-auto max-h-96">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                    <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Name</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Price</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {medicines.map(med => (
                        <tr key={med.id} className="dark:hover:bg-gray-700/50">
                            <td className="px-4 py-2 whitespace-nowrap text-sm">{med.name}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm">{formatCurrency(med.price)}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm space-x-2">
                                <button onClick={() => { setEditingMedicine(med); setIsMedicineFormOpen(true); }} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"><EditIcon className="w-4 h-4"/></button>
                                <button onClick={() => handleDeleteMedicine(med.id)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"><Trash2Icon className="w-4 h-4"/></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>
        </div>
        </>
    );
};

interface LabTestsManagementViewProps {
    labTests: LabTest[];
    refreshData: () => void;
}
const LabTestsManagementView: React.FC<LabTestsManagementViewProps> = ({ labTests, refreshData }) => {
    const [editingTest, setEditingTest] = useState<LabTest | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const handleDeleteTest = (id: number) => {
        if (window.confirm('Are you sure you want to delete this lab test? This action is permanent.')) {
            db.deleteLabTest(id);
            refreshData();
        }
    };
    
    return (
        <>
        {isFormOpen && (
            <LabTestForm
                testToEdit={editingTest}
                onSuccess={() => { setIsFormOpen(false); setEditingTest(null); refreshData(); }}
                onClose={() => { setIsFormOpen(false); setEditingTest(null); }}
            />
        )}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                    <TestTubeIcon className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                    <h3 className="ml-3 text-xl font-bold text-gray-800 dark:text-gray-100">Lab Test Management</h3>
                </div>
                <button onClick={() => { setEditingTest(null); setIsFormOpen(true); }} className="flex items-center px-3 py-1.5 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700"><PlusCircleIcon className="w-5 h-5 mr-1"/>Add Lab Test</button>
            </div>
            <div className="overflow-x-auto max-h-96">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Name</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Price</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">MRP</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {labTests.map(test => (
                            <tr key={test.id} className="dark:hover:bg-gray-700/50">
                                <td className="px-4 py-2 whitespace-nowrap text-sm">{test.name}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">{formatCurrency(test.price)}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">{formatCurrency(test.mrp)}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm space-x-2">
                                    <button onClick={() => { setEditingTest(test); setIsFormOpen(true); }} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"><EditIcon className="w-4 h-4"/></button>
                                    <button onClick={() => handleDeleteTest(test.id)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"><Trash2Icon className="w-4 h-4"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
        </>
    );
};

interface AppointmentsViewProps {
    appointments: Appointment[];
    refreshData: () => void;
}
const AppointmentsView: React.FC<AppointmentsViewProps> = ({ appointments, refreshData }) => {
    const [error, setError] = useState<string | null>(null);
    const sortedAppointments = [...appointments].sort((a, b) => {
         const dateA = new Date(a.appointment_date).getTime();
         const dateB = new Date(b.appointment_date).getTime();
         return dateB - dateA;
    });

    const handleUpdateStatus = (appointmentId: number, newStatus: Appointment['status']) => {
        setError(null);
        try {
            db.updateAppointmentStatus(appointmentId, newStatus);
            refreshData();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Could not update the appointment status.");
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
             <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">All Appointments</h3>
            {error && (
                <div className="my-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-lg flex items-center text-sm text-red-700 dark:text-red-300">
                    <XCircleIcon className="w-5 h-5 mr-3 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}
            <div className="overflow-x-auto max-h-[60vh]">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Patient</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Doctor</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date & Time</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Booked On</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {sortedAppointments.map((appt) => (
                            <tr key={appt.id} className="dark:hover:bg-gray-700/50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{appt.patient_name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{appt.doctor_name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                    {new Date(appt.appointment_date + 'T00:00:00').toLocaleDateString()} at {appt.appointment_time}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <select
                                        value={appt.status}
                                        onChange={(e) => handleUpdateStatus(appt.id, e.target.value as Appointment['status'])}
                                        className="p-1 border rounded-md dark:bg-gray-600 dark:border-gray-500 focus:ring-teal-500 focus:border-teal-500"
                                    >
                                        <option>Scheduled</option>
                                        <option>Completed</option>
                                        <option>Cancelled</option>
                                        <option>No-Show</option>
                                    </select>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(appt.created_at).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

interface LogsViewProps {
    authLogs: AuthLog[];
    sessions: UserSession[];
}
const LogsView: React.FC<LogsViewProps> = ({ authLogs, sessions }) => {
    return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                <div className="flex items-center mb-4">
                    <ActivityIcon className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                    <h3 className="ml-3 text-xl font-bold text-gray-800 dark:text-gray-100">User Activity Log</h3>
                </div>
                <div className="overflow-x-auto max-h-96">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Action</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {authLogs.map((log, index) => (
                                <tr key={`auth-${index}`} className="dark:hover:bg-gray-700/50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{log.userName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${log.action === 'login' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{log.action}</span></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(log.timestamp).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                 <div className="flex items-center mb-4">
                    <ActivityIcon className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                    <h3 className="ml-3 text-xl font-bold text-gray-800 dark:text-gray-100">User Session Tracking</h3>
                </div>
                 <div className="overflow-x-auto max-h-96">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Duration</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">End Time</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {sessions.map((session) => (
                                <tr key={`session-${session.id}`} className="dark:hover:bg-gray-700/50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{session.userName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{formatDuration(session.duration)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(session.endTime).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

interface OwnerDashboardProps {
  activeTab: string;
  users: User[];
  doctors: Doctor[];
  appointments: Appointment[];
  authLogs: AuthLog[];
  pharmaCompanies: PharmaCompany[];
  sessions: UserSession[];
  allMedicineOrders: MedicineOrder[];
  medicines: Medicine[];
  allLabTestBookings: LabTestBooking[];
  labTests: LabTest[];
  refreshData: () => void;
}

const OwnerDashboard: React.FC<OwnerDashboardProps> = (props) => {
  const { activeTab } = props;

  const renderContent = () => {
    switch(activeTab) {
      case 'medicineOrders':
        return <MedicineOrdersView {...props} />;
      case 'testBookings':
        return <TestBookingsView {...props} />;
      case 'users':
        return <PatientsView
            users={props.users}
            appointments={props.appointments}
            medicineOrders={props.allMedicineOrders}
            labTestBookings={props.allLabTestBookings}
        />;
      case 'doctors':
        return <DoctorsView {...props} />;
      case 'medicines':
        return <MedicinesView {...props} />;
      case 'labTests':
        return <LabTestsManagementView {...props} />;
      case 'appointments':
        return <AppointmentsView {...props} />;
      case 'logs':
        return <LogsView {...props} />;
      case 'overview':
      default:
        return <OverviewView {...props} />;
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Owner Dashboard</h1>
      {renderContent()}
    </div>
  );
};

export default OwnerDashboard;