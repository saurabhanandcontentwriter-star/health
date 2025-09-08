import React, { useState, useEffect } from 'react';
import { Doctor, Appointment, AuthLog, PharmaCompany, UserSession, MedicineOrder, Medicine, LabTestBooking, DeliveryBoy } from '../types';
import { RupeeIcon, QrCodeIcon, ActivityIcon, StethoscopeIcon, UserPlusIcon, PillIcon, HourglassIcon, SendIcon, RefreshCwIcon, PlusCircleIcon, TestTubeIcon, XCircleIcon, CheckCircleIcon, EditIcon, Trash2Icon, TruckIcon, RefundIcon } from './IconComponents';
import { generateQrCode } from '../services/qrService';
import * as db from '../services/dbService';
import DoctorForm from './AddDoctorForm';
import MedicineForm from './AddMedicineForm';
import { CONSULTATION_FEE } from '../utils/constants';

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
                <h3 className="text-lg font-bold mb-4">Assign Delivery Person</h3>
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


interface AdminDashboardProps {
  doctors: Doctor[];
  appointments: Appointment[];
  authLogs: AuthLog[];
  pharmaCompanies: PharmaCompany[];
  sessions: UserSession[];
  allMedicineOrders: MedicineOrder[];
  medicines: Medicine[];
  allLabTestBookings: LabTestBooking[];
  refreshData: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ doctors, appointments, authLogs, pharmaCompanies, sessions, allMedicineOrders, medicines, allLabTestBookings, refreshData }) => {
  const [qrAmount, setQrAmount] = useState('500');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [qrError, setQrError] = useState('');
  
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [isDoctorFormOpen, setIsDoctorFormOpen] = useState(false);

  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [isMedicineFormOpen, setIsMedicineFormOpen] = useState(false);

  // Assign Delivery Modal State
  const [assignModal, setAssignModal] = useState<{ isOpen: boolean; orderId: number | null; orderType: 'medicine' | 'lab' | null }>({ isOpen: false, orderId: null, orderType: null });


  // Funds Transfer State
  const [transferStep, setTransferStep] = useState<'details' | 'otp' | 'success'>('details');
  const [transferAmount, setTransferAmount] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [transferError, setTransferError] = useState('');

  // Refund State
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
  
  const handleDeleteDoctor = (id: number) => {
    if (window.confirm('Are you sure you want to delete this doctor? This action cannot be undone.')) {
        db.deleteDoctor(id);
        refreshData();
    }
  };

  const handleDeleteMedicine = (id: number) => {
    if (window.confirm('Are you sure you want to delete this medicine? This action cannot be undone.')) {
        db.deleteMedicine(id);
        refreshData();
    }
  };

  const handleUpdateMedicineStatus = (orderId: number, newStatus: MedicineOrder['status']) => {
      try {
          db.updateMedicineOrderStatus(orderId, newStatus);
          refreshData();
      } catch (error) {
          alert("Could not update status.");
      }
  };

  const handleUpdateBookingStatus = (bookingId: number, newStatus: LabTestBooking['status']) => {
      try {
          db.updateLabTestBookingStatus(bookingId, newStatus);
          refreshData();
      } catch (error) {
          console.error("Failed to update status:", error);
          alert("Could not update the booking status.");
      }
  };

  const handleAssignDelivery = (orderType: 'medicine' | 'lab', orderId: number, deliveryBoy: DeliveryBoy) => {
      try {
          db.assignDeliveryInfo(orderType, orderId, deliveryBoy);
          setAssignModal({ isOpen: false, orderId: null, orderType: null });
          refreshData();
      } catch (error) {
          alert('Failed to assign delivery person.');
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
      {assignModal.isOpen && (
         <AssignDeliveryModal 
            orderId={assignModal.orderId!}
            orderType={assignModal.orderType!}
            onClose={() => setAssignModal({ isOpen: false, orderId: null, orderType: null })}
            onAssign={handleAssignDelivery}
         />
      )}
      {isDoctorFormOpen && (
        <DoctorForm 
            doctorToEdit={editingDoctor} 
            onSuccess={() => { setIsDoctorFormOpen(false); setEditingDoctor(null); refreshData(); }}
            onClose={() => { setIsDoctorFormOpen(false); setEditingDoctor(null); }}
        />
      )}
      {isMedicineFormOpen && (
        <MedicineForm
            medicineToEdit={editingMedicine}
            onSuccess={() => { setIsMedicineFormOpen(false); setEditingMedicine(null); refreshData(); }}
            onClose={() => { setIsMedicineFormOpen(false); setEditingMedicine(null); }}
        />
      )}
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Admin Dashboard</h1>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Doctors" value={doctors.length} icon={<StethoscopeIcon className="h-6 w-6 text-indigo-800"/>} color="bg-indigo-100" darkColor="dark:bg-indigo-900/50" />
          <StatCard title="Total Appointments" value={appointments.length} icon={<ActivityIcon className="h-6 w-6 text-blue-800"/>} color="bg-blue-100" darkColor="dark:bg-blue-900/50" />
          <StatCard title="Total Revenue" value={formatCurrency(totalRevenue)} icon={<RupeeIcon className="h-6 w-6 text-green-800"/>} color="bg-green-100" darkColor="dark:bg-green-900/50" />
          <StatCard title="Active Sessions" value={sessions.length} icon={<HourglassIcon className="h-6 w-6 text-yellow-800"/>} color="bg-yellow-100" darkColor="dark:bg-yellow-900/50" />
      </div>

      {/* Tools Section */}
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
      
      {/* Order Fulfillment */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <div className="flex items-center mb-4">
                <TruckIcon className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                <h3 className="ml-3 text-xl font-bold text-gray-800 dark:text-gray-100">Order Fulfillment</h3>
            </div>
            <div className="overflow-x-auto max-h-[500px]">
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
                        {[...allMedicineOrders, ...allLabTestBookings].sort((a, b) => {
                            const dateA = 'orderDate' in a ? a.orderDate : a.bookingDate;
                            const dateB = 'orderDate' in b ? b.orderDate : b.bookingDate;
                            return new Date(dateB).getTime() - new Date(dateA).getTime();
                        }).map(order => {
                            const isMedicine = 'items' in order;
                            const orderId = order.id;
                            const orderType = isMedicine ? 'medicine' : 'lab';
                            return (
                                <tr key={`${orderType}-${orderId}`} className="dark:hover:bg-gray-700/50">
                                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                                        <p className="font-bold">{isMedicine ? `Med Order #${orderId}` : `Lab Test #${orderId}`}</p>
                                        <p className="text-xs text-gray-500">{isMedicine ? (order as MedicineOrder).items.length : '1'} item(s)</p>
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm">{isMedicine ? (order as MedicineOrder).deliveryAddress.fullName : (order as LabTestBooking).patientName}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                                        {isMedicine ? (
                                            <select value={order.status} onChange={(e) => handleUpdateMedicineStatus(orderId, e.target.value as MedicineOrder['status'])} className="p-1 border rounded-md dark:bg-gray-600">
                                                <option>Processing</option><option>Shipped</option><option>Delivered</option>
                                            </select>
                                        ) : (
                                            <select value={order.status} onChange={(e) => handleUpdateBookingStatus(orderId, e.target.value as LabTestBooking['status'])} className="p-1 border rounded-md dark:bg-gray-600">
                                                <option>Booked</option><option>Sample Collected</option><option>Report Ready</option><option>Cancelled</option>
                                            </select>
                                        )}
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                                        {order.deliveryBoy ? (
                                            <div>
                                                <p>{order.deliveryBoy.name}</p>
                                                <p className="text-xs text-gray-500">{order.deliveryBoy.phone}</p>
                                            </div>
                                        ) : (
                                            <button onClick={() => setAssignModal({ isOpen: true, orderId: orderId, orderType: orderType })} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-md hover:bg-blue-200">Assign</button>
                                        )}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
      </div>


      {/* Management Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Doctor Management */}
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

        {/* Medicine Management */}
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
      </div>
      
    </div>
  );
};

export default AdminDashboard;