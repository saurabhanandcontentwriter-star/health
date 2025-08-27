

import React, { useState, useEffect } from 'react';
import { Doctor, Appointment, AuthLog, PharmaCompany, UserSession, MedicineOrder, Medicine, LabTestBooking } from '../types';
import { RupeeIcon, QrCodeIcon, ActivityIcon, StethoscopeIcon, UserPlusIcon, PillIcon, HourglassIcon, SendIcon, RefreshCwIcon, PlusCircleIcon, TestTubeIcon, XCircleIcon, CheckCircleIcon, EditIcon, Trash2Icon } from './IconComponents';
import { generateQrCode } from '../services/qrService';
import * as db from '../services/dbService';
import DoctorForm from './AddDoctorForm';
import MedicineForm from './AddMedicineForm';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg flex items-center space-x-4">
    <div className={`p-3 rounded-full ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
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

  // Funds Transfer State
  const [transferStep, setTransferStep] = useState<'details' | 'otp' | 'success'>('details');
  const [transferAmount, setTransferAmount] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [transferError, setTransferError] = useState('');
  const [isTransferLoading, setIsTransferLoading] = useState(false);

  // Captcha state
  const [captcha, setCaptcha] = useState({ question: '', answer: 0 });
  const [captchaInput, setCaptchaInput] = useState('');

  // OTP state
  const [transferOtp, setTransferOtp] = useState('');
  const [otpInput, setOtpInput] = useState('');

  const CONSULTATION_FEE = 500;
  const totalAppointmentRevenue = appointments.length * CONSULTATION_FEE;
  const totalMedicineRevenue = allMedicineOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalLabRevenue = allLabTestBookings.filter(b => b.status !== 'Cancelled').reduce((sum, booking) => sum + booking.totalAmount, 0);
  const totalRevenue = totalAppointmentRevenue + totalMedicineRevenue + totalLabRevenue;
  
  const totalUsageSeconds = sessions.reduce((total, session) => total + session.duration, 0);

  const formatDuration = (seconds: number) => {
      if (seconds < 60) return `${seconds} sec`;
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      if (hours > 0) {
          return `${hours}h ${minutes % 60}m`;
      }
      return `${minutes}m ${seconds % 60}s`;
  };
  
  const handleGenerateClick = async () => {
    setQrError('');
    setIsGenerating(true);
    try {
        const url = await generateQrCode(qrAmount);
        setQrCodeUrl(url);
    } catch(error: any) {
        setQrCodeUrl('');
        setQrError(error.message || 'Failed to generate QR code.');
    } finally {
        setIsGenerating(false);
    }
  };
  
  const isControlsDisabled = isGenerating;
  const buttonText = isGenerating ? 'Generating...' : 'Generate QR Code';
  
  const handleOpenDoctorForm = (doctor: Doctor | null) => {
    setEditingDoctor(doctor);
    setIsDoctorFormOpen(true);
  };
  
  const handleCloseDoctorForm = () => {
    setIsDoctorFormOpen(false);
    setEditingDoctor(null);
  };
  
  const handleDoctorSuccess = () => {
    refreshData();
    handleCloseDoctorForm();
  };

  const handleDeleteDoctor = (id: number) => {
    if (window.confirm("Are you sure you want to delete this doctor? This action cannot be undone.")) {
        db.deleteDoctor(id);
        refreshData();
    }
  };

  const handleOpenMedicineForm = (medicine: Medicine | null) => {
    setEditingMedicine(medicine);
    setIsMedicineFormOpen(true);
  };

  const handleCloseMedicineForm = () => {
    setIsMedicineFormOpen(false);
    setEditingMedicine(null);
  };

  const handleMedicineSuccess = () => {
    refreshData();
    handleCloseMedicineForm();
  };
  
  const handleDeleteMedicine = (id: number) => {
    if (window.confirm("Are you sure you want to delete this medicine? This action cannot be undone.")) {
        db.deleteMedicine(id);
        refreshData();
    }
  };


  // --- Funds Transfer Logic ---
  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    setCaptcha({
        question: `${num1} + ${num2}`,
        answer: num1 + num2
    });
    setCaptchaInput('');
  };

  useEffect(() => {
    if(transferStep === 'details') {
      generateCaptcha();
    }
  }, [transferStep]);

  const handleProceedToOtp = (e: React.FormEvent) => {
      e.preventDefault();
      setTransferError('');

      if (!transferAmount || !accountNumber || !confirmAccountNumber || !ifscCode || Number(transferAmount) <= 0) {
          setTransferError('Please fill in all transfer detail fields.');
          return;
      }
      if (accountNumber !== confirmAccountNumber) {
          setTransferError('Account numbers do not match. Please check again.');
          return;
      }
      if (!/^\d+$/.test(accountNumber)) {
          setTransferError('Please enter a valid beneficiary account number.');
          return;
      }
      if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode.toUpperCase())) {
          setTransferError('Please enter a valid 11-character IFSC code.');
          return;
      }
      if (parseInt(captchaInput) !== captcha.answer) {
          setTransferError('Incorrect captcha. Please try again.');
          generateCaptcha();
          return;
      }

      setIsTransferLoading(true);
      setTimeout(() => {
          const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
          setTransferOtp(newOtp);
          setTransferStep('otp');
          setIsTransferLoading(false);
      }, 1000);
  };

  const handleConfirmTransfer = (e: React.FormEvent) => {
      e.preventDefault();
      setTransferError('');

      if (otpInput !== transferOtp) {
          setTransferError('Invalid OTP. Please try again.');
          return;
      }

      setIsTransferLoading(true);
      setTimeout(() => {
          setTransferStep('success');
          setIsTransferLoading(false);
      }, 1000);
  };
  
  const handleResetTransfer = () => {
      setTransferStep('details');
      setTransferAmount('');
      setAccountNumber('');
      setConfirmAccountNumber('');
      setIfscCode('');
      setTransferError('');
      setOtpInput('');
      setTransferOtp('');
      generateCaptcha();
  };
  // --- End Funds Transfer Logic ---
  
  const handleUpdateStatus = (bookingId: number, newStatus: LabTestBooking['status']) => {
    try {
        db.updateLabTestBookingStatus(bookingId, newStatus);
        refreshData();
    } catch (error) {
        console.error("Failed to update booking status:", error);
        alert("Could not update status. Please try again.");
    }
  };


  const handleRejectBooking = (bookingId: number) => {
    if (window.confirm("Are you sure you want to reject this lab test booking? This action cannot be undone.")) {
        handleUpdateStatus(bookingId, 'Cancelled');
    }
  };


  const renderQrContent = () => {
    if (isGenerating) {
      return (
        <div className="text-center">
          <svg className="animate-spin mx-auto h-8 w-8 text-teal-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-2 text-sm text-gray-500">Generating QR Code...</p>
        </div>
      );
    }
    if (qrError) {
      return (
        <div className="text-center px-4">
          <p className="text-red-600 text-sm">{qrError}</p>
        </div>
      );
    }
    if (qrCodeUrl) {
      return (
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">Scan to pay ₹{qrAmount}</p>
          <img src={qrCodeUrl} alt="Payment QR Code" className="mx-auto w-64 h-64 object-contain" />
        </div>
      );
    }
    return (
      <div className="text-center">
        <QrCodeIcon className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-500">Enter an amount to generate a QR code.</p>
      </div>
    );
  };
  
    const statusColors: Record<LabTestBooking['status'], string> = {
        Booked: 'bg-blue-100 text-blue-800',
        'Sample Collected': 'bg-yellow-100 text-yellow-800',
        'Report Ready': 'bg-green-100 text-green-800',
        Cancelled: 'bg-red-100 text-red-800',
    };

  return (
    <div className="space-y-8">
        {isDoctorFormOpen && (
            <DoctorForm 
                doctorToEdit={editingDoctor}
                onSuccess={handleDoctorSuccess}
                onClose={handleCloseDoctorForm}
            />
        )}
        {isMedicineFormOpen && (
            <MedicineForm
                medicineToEdit={editingMedicine}
                onSuccess={handleMedicineSuccess}
                onClose={handleCloseMedicineForm}
            />
        )}
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <StatCard 
                title="Total Revenue" 
                value={formatCurrency(totalRevenue)}
                icon={<RupeeIcon className="h-6 w-6 text-green-800" />}
                color="bg-green-100"
            />
            <StatCard 
                title="Appointments" 
                value={appointments.length} 
                icon={<StethoscopeIcon className="h-6 w-6 text-blue-800" />}
                color="bg-blue-100"
            />
            <StatCard 
                title="Lab Bookings" 
                value={allLabTestBookings.length}
                icon={<TestTubeIcon className="h-6 w-6 text-cyan-800" />}
                color="bg-cyan-100"
            />
            <StatCard 
                title="Registered Doctors" 
                value={doctors.length} 
                icon={<UserPlusIcon className="h-6 w-6 text-indigo-800" />}
                color="bg-indigo-100"
            />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        <TestTubeIcon className="h-6 w-6 text-teal-600" />
                        <h3 className="ml-3 text-xl font-bold text-gray-800">Lab Test Bookings</h3>
                    </div>
                </div>
                <div className="overflow-x-auto max-h-96">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0">
                            <tr>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Details</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {allLabTestBookings.map((booking) => (
                                <tr key={booking.id}>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{booking.patientName}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div>{booking.testName}</div>
                                        <div className="text-xs">{booking.slot}</div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[booking.status]}`}>
                                            {booking.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                                        <div className="flex items-center space-x-2">
                                            {booking.status === 'Booked' && (
                                                <>
                                                    <button
                                                        onClick={() => handleUpdateStatus(booking.id, 'Sample Collected')}
                                                        className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200"
                                                    >
                                                        <CheckCircleIcon className="w-4 h-4 mr-1" />
                                                        Accept
                                                    </button>
                                                    <button
                                                        onClick={() => handleRejectBooking(booking.id)}
                                                        className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
                                                    >
                                                        <XCircleIcon className="w-4 h-4 mr-1" />
                                                        Reject
                                                    </button>
                                                </>
                                            )}
                                            {booking.status === 'Sample Collected' && (
                                                <button
                                                    onClick={() => handleUpdateStatus(booking.id, 'Report Ready')}
                                                    className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                                                >
                                                    Mark Report Ready
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                             {allLabTestBookings.length === 0 && (
                                <tr><td colSpan={4} className="text-center py-4 text-gray-500">No lab test bookings found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
             <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        <StethoscopeIcon className="h-6 w-6 text-teal-600" />
                        <h3 className="ml-3 text-xl font-bold text-gray-800">Doctor Management</h3>
                    </div>
                    <button onClick={() => handleOpenDoctorForm(null)} className="flex items-center px-3 py-1.5 bg-teal-600 text-white text-xs font-semibold rounded-lg hover:bg-teal-700 transition-colors">
                        <PlusCircleIcon className="w-4 h-4 mr-1" />
                        Add
                    </button>
                </div>
                <div className="overflow-x-auto max-h-96">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0">
                            <tr>
                                <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialty</th>
                                <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {doctors.map((doctor) => (
                                <tr key={doctor.id}>
                                    <td className="px-2 py-2 whitespace-nowrap">
                                        <img src={doctor.imageUrl} alt={doctor.name} className="h-10 w-10 rounded-full object-cover" />
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{doctor.name}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{doctor.specialty}</td>
                                    <td className="px-2 py-3 whitespace-nowrap text-sm">
                                        <div className="flex items-center space-x-2">
                                            <button onClick={() => handleOpenDoctorForm(doctor)} className="text-blue-600 hover:text-blue-800 p-1" aria-label={`Edit ${doctor.name}`}>
                                                <EditIcon className="w-5 h-5" />
                                            </button>
                                            <button onClick={() => handleDeleteDoctor(doctor.id)} className="text-red-600 hover:text-red-800 p-1" aria-label={`Delete ${doctor.name}`}>
                                                <Trash2Icon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg flex flex-col">
                <div className="flex items-center mb-4">
                    <QrCodeIcon className="h-6 w-6 text-teal-600" />
                    <h3 className="ml-3 text-xl font-bold text-gray-800">Payment QR Generator</h3>
                </div>
                <div className="space-y-4 flex-grow flex flex-col">
                    <div>
                        <label htmlFor="qrAmount" className="block text-sm font-medium text-gray-700">Payment Amount (INR)</label>
                        <input 
                            type="number" 
                            id="qrAmount" 
                            value={qrAmount}
                            onChange={(e) => setQrAmount(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-100"
                            disabled={isControlsDisabled}
                            placeholder="e.g., 500"
                        />
                    </div>
                    <button 
                        onClick={handleGenerateClick} 
                        className="w-full bg-teal-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        disabled={isControlsDisabled}
                    >
                        {buttonText}
                    </button>

                    <div className="mt-4 p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 flex-grow flex items-center justify-center h-72">
                        {renderQrContent()}
                    </div>
                </div>
            </div>
            
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg flex flex-col">
                <div className="flex items-center mb-4">
                    <SendIcon className="h-6 w-6 text-teal-600" />
                    <h3 className="ml-3 text-xl font-bold text-gray-800">Initiate Funds Transfer</h3>
                </div>
                <div className="flex-grow">
                    {transferStep === 'success' && (
                        <div className="text-center p-4 flex flex-col items-center justify-center h-full">
                            <div className="bg-green-100 p-4 rounded-full mb-4">
                               <SendIcon className="h-10 w-10 text-green-600" />
                            </div>
                            <h4 className="text-xl font-bold text-gray-800">Transfer Successful!</h4>
                            <p className="text-gray-600 mt-1 max-w-sm">
                                ₹{Number(transferAmount).toLocaleString('en-IN')} has been sent to account ending in ...{accountNumber.slice(-4)}.
                            </p>
                            <button
                                onClick={handleResetTransfer}
                                className="mt-6 w-full max-w-xs bg-teal-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-700 transition-colors"
                            >
                                Make Another Transfer
                            </button>
                        </div>
                    )}

                    {transferStep === 'otp' && (
                        <form onSubmit={handleConfirmTransfer} className="space-y-4">
                            <h4 className="text-lg font-semibold text-gray-800">Confirm Transfer</h4>
                            <p className="text-sm text-gray-600">
                                An OTP has been sent to your registered mobile number for the transfer of <span className="font-bold">₹{Number(transferAmount).toLocaleString('en-IN')}</span> to account number <span className="font-bold">...{accountNumber.slice(-4)}</span>.
                            </p>
                            <div className="p-3 bg-yellow-100 border-l-4 border-yellow-400 text-yellow-700 text-center">
                                <p className="font-bold">Your OTP is: {transferOtp}</p>
                                <p className="text-xs">This is for simulation purposes.</p>
                            </div>
                            <div>
                                <label htmlFor="otp" className="block text-sm font-medium text-gray-700">Enter OTP</label>
                                <input type="text" id="otp" value={otpInput} onChange={e => setOtpInput(e.target.value)} placeholder="Enter the 6-digit OTP" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500" required />
                            </div>
                            {transferError && <p className="text-sm text-red-600 text-center">{transferError}</p>}
                            <div className="flex space-x-4 pt-2">
                                <button type="button" onClick={() => { setTransferStep('details'); setTransferError(''); }} className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                                    Back
                                </button>
                                <button type="submit" disabled={isTransferLoading} className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none disabled:bg-teal-400">
                                    {isTransferLoading ? 'Verifying...' : 'Confirm & Transfer'}
                                </button>
                            </div>
                        </form>
                    )}

                    {transferStep === 'details' && (
                        <form onSubmit={handleProceedToOtp} className="space-y-4">
                            <div>
                                <label htmlFor="transferAmount" className="block text-sm font-medium text-gray-700">Amount to Transfer (INR)</label>
                                <input type="number" id="transferAmount" value={transferAmount} onChange={e => setTransferAmount(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" placeholder="e.g., 10000" required />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700">Beneficiary Account Number</label>
                                    <input type="text" id="accountNumber" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" placeholder="Enter account number" required />
                                </div>
                                <div>
                                    <label htmlFor="confirmAccountNumber" className="block text-sm font-medium text-gray-700">Confirm Account Number</label>
                                    <input type="text" id="confirmAccountNumber" value={confirmAccountNumber} onChange={e => setConfirmAccountNumber(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" placeholder="Re-enter account number" required />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="ifscCode" className="block text-sm font-medium text-gray-700">IFSC Code</label>
                                <input type="text" id="ifscCode" value={ifscCode} onChange={e => setIfscCode(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" placeholder="e.g., HDFC0001234" required />
                            </div>
                            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                <label htmlFor="captcha" className="block text-sm font-medium text-gray-700">Security Check</label>
                                <div className="flex items-center space-x-2 sm:space-x-4 mt-2">
                                    <span className="p-2 bg-gray-200 text-gray-800 rounded-md font-mono text-lg">{captcha.question} = ?</span>
                                    <input type="number" id="captcha" value={captchaInput} onChange={e => setCaptchaInput(e.target.value)} className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm w-24" placeholder="Answer" required />
                                    <button type="button" onClick={generateCaptcha} className="p-2 text-gray-500 hover:text-gray-700" aria-label="Refresh captcha">
                                        <RefreshCwIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            {transferError && <p className="text-sm text-red-600 text-center">{transferError}</p>}
                            <div className="pt-2">
                                <button type="submit" disabled={isTransferLoading} className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none disabled:bg-teal-400">
                                    <SendIcon className="w-5 h-5 mr-2" />
                                    {isTransferLoading ? 'Verifying...' : 'Proceed to OTP'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center justify-between mb-4">
                     <div className="flex items-center">
                        <PillIcon className="h-6 w-6 text-teal-600" />
                        <h3 className="ml-3 text-xl font-bold text-gray-800">Medicine Catalog</h3>
                    </div>
                    <button onClick={() => handleOpenMedicineForm(null)} className="flex items-center px-3 py-1.5 bg-teal-600 text-white text-xs font-semibold rounded-lg hover:bg-teal-700 transition-colors">
                        <PlusCircleIcon className="w-4 h-4 mr-1" />
                        Add
                    </button>
                </div>
                <div className="overflow-x-auto max-h-96">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0">
                            <tr>
                                <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {medicines.map((med) => (
                                <tr key={med.id}>
                                    <td className="px-2 py-2 whitespace-nowrap">
                                        <img src={med.imageUrl} alt={med.name} className="h-10 w-10 rounded-md object-cover" />
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{med.name}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(med.price)}</td>
                                    <td className="px-2 py-3 whitespace-nowrap text-sm">
                                        <div className="flex items-center space-x-2">
                                            <button onClick={() => handleOpenMedicineForm(med)} className="text-blue-600 hover:text-blue-800 p-1" aria-label={`Edit ${med.name}`}>
                                                <EditIcon className="w-5 h-5" />
                                            </button>
                                            <button onClick={() => handleDeleteMedicine(med.id)} className="text-red-600 hover:text-red-800 p-1" aria-label={`Delete ${med.name}`}>
                                                <Trash2Icon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
             <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center mb-4">
                    <ActivityIcon className="h-6 w-6 text-teal-600" />
                    <h3 className="ml-3 text-xl font-bold text-gray-800">User Activity Log</h3>
                </div>
                <div className="overflow-x-auto max-h-96">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {authLogs.length > 0 ? authLogs.map((log, index) => (
                                <tr key={index}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{log.userName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${log.action === 'login' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(log.timestamp).toLocaleString()}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">No activity logs found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
  );
};

export default AdminDashboard;