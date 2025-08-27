import React, { useState, useEffect } from 'react';
import { Doctor, Appointment, AuthLog, PharmaCompany, UserSession, MedicineOrder, Medicine, LabTestBooking } from '../types';
import { RupeeIcon, QrCodeIcon, ActivityIcon, StethoscopeIcon, UserPlusIcon, PillIcon, HourglassIcon, SendIcon, RefreshCwIcon, PlusCircleIcon, TestTubeIcon, XCircleIcon, CheckCircleIcon, EditIcon, Trash2Icon } from './IconComponents';
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
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [transferError, setTransferError] = useState('');

  const totalAppointmentRevenue = appointments.length * CONSULTATION_FEE;
  const totalMedicineRevenue = allMedicineOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalLabRevenue = allLabTestBookings.filter(b => b.status !== 'Cancelled').reduce((sum, booking) => sum + booking.totalAmount, 0);
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

  const handleUpdateBookingStatus = (bookingId: number, newStatus: LabTestBooking['status']) => {
      try {
          db.updateLabTestBookingStatus(bookingId, newStatus);
          refreshData();
      } catch (error) {
          console.error("Failed to update status:", error);
          alert("Could not update the booking status.");
      }
  };

  const handleInitiateTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    setTransferError('');
    if (!transferAmount || Number(transferAmount) <= 0) {
        setTransferError('Please enter a valid transfer amount.'); return;
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

  return (
    <div className="space-y-8">
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
      <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Doctors" value={doctors.length} icon={<StethoscopeIcon className="h-6 w-6 text-indigo-800"/>} color="bg-indigo-100" />
          <StatCard title="Total Appointments" value={appointments.length} icon={<ActivityIcon className="h-6 w-6 text-blue-800"/>} color="bg-blue-100" />
          <StatCard title="Total Revenue" value={formatCurrency(totalRevenue)} icon={<RupeeIcon className="h-6 w-6 text-green-800"/>} color="bg-green-100" />
          <StatCard title="Active Sessions" value={sessions.length} icon={<HourglassIcon className="h-6 w-6 text-yellow-800"/>} color="bg-yellow-100" />
      </div>

      {/* Tools Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center mb-4">
                <QrCodeIcon className="h-6 w-6 text-teal-600" />
                <h3 className="ml-3 text-xl font-bold text-gray-800">Generate Payment QR</h3>
            </div>
            <div className="flex items-center space-x-2">
                <input type="number" value={qrAmount} onChange={e => setQrAmount(e.target.value)} className="flex-grow p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500" placeholder="Amount in INR"/>
                <button onClick={handleGenerateQrCode} disabled={isGenerating} className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:bg-teal-400">
                    {isGenerating ? 'Generating...' : 'Generate'}
                </button>
            </div>
            {qrError && <p className="text-red-500 text-sm mt-2">{qrError}</p>}
            {qrCodeUrl && <img src={qrCodeUrl} alt="Generated QR Code" className="mx-auto mt-4 w-48 h-48"/>}
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center mb-4">
                <SendIcon className="h-6 w-6 text-teal-600" />
                <h3 className="ml-3 text-xl font-bold text-gray-800">Transfer Funds to Bank</h3>
            </div>
            {transferStep === 'details' && (
                <form onSubmit={handleInitiateTransfer} className="space-y-4">
                     <input type="number" value={transferAmount} onChange={e => setTransferAmount(e.target.value)} placeholder="Amount (₹)" className="w-full p-2 border rounded-md" required />
                     <input type="text" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} placeholder="Account Number" className="w-full p-2 border rounded-md" required />
                     <input type="text" value={confirmAccountNumber} onChange={e => setConfirmAccountNumber(e.target.value)} placeholder="Confirm Account Number" className="w-full p-2 border rounded-md" required />
                     <input type="text" value={ifscCode} onChange={e => setIfscCode(e.target.value.toUpperCase())} placeholder="IFSC Code" className="w-full p-2 border rounded-md" required />
                     {transferError && <p className="text-red-500 text-sm">{transferError}</p>}
                     <button type="submit" className="w-full py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700">Transfer</button>
                </form>
            )}
            {transferStep === 'otp' && (
                <form onSubmit={handleConfirmTransfer} className="space-y-4">
                    <p className="text-sm">Transferring <span className="font-bold">{formatCurrency(Number(transferAmount))}</span> to A/C ending in <span className="font-mono">{accountNumber.slice(-4)}</span></p>
                    <div className="p-2 bg-yellow-100 text-yellow-800 text-center rounded-md"><p>Simulated OTP: <span className="font-bold">{generatedOtp}</span></p></div>
                    <input type="text" value={otp} onChange={e => setOtp(e.target.value)} placeholder="Enter 6-digit OTP" className="w-full p-2 border rounded-md" required />
                     {transferError && <p className="text-red-500 text-sm">{transferError}</p>}
                    <button type="submit" className="w-full py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700">Confirm Transfer</button>
                </form>
            )}
             {transferStep === 'success' && (
                <div className="text-center space-y-4">
                    <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto" />
                    <h4 className="font-bold text-lg">Transfer Successful!</h4>
                    <p className="text-sm">Transaction ID: <span className="font-mono">TXN{Date.now()}</span></p>
                    <button onClick={resetTransfer} className="w-full py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">New Transfer</button>
                </div>
            )}
        </div>
      </div>

      {/* Management Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Doctor Management */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                    <UserPlusIcon className="h-6 w-6 text-teal-600" />
                    <h3 className="ml-3 text-xl font-bold text-gray-800">Doctor Management</h3>
                </div>
                <button onClick={() => { setEditingDoctor(null); setIsDoctorFormOpen(true); }} className="flex items-center px-3 py-1.5 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700"><PlusCircleIcon className="w-5 h-5 mr-1"/>Add Doctor</button>
            </div>
            <div className="overflow-x-auto max-h-96">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Specialty</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {doctors.map(doc => (
                            <tr key={doc.id}>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">{doc.name}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">{doc.specialty}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm space-x-2">
                                    <button onClick={() => { setEditingDoctor(doc); setIsDoctorFormOpen(true); }} className="text-blue-600 hover:text-blue-800"><EditIcon className="w-4 h-4"/></button>
                                    <button onClick={() => handleDeleteDoctor(doc.id)} className="text-red-600 hover:text-red-800"><Trash2Icon className="w-4 h-4"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Medicine Management */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
             <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                    <PillIcon className="h-6 w-6 text-teal-600" />
                    <h3 className="ml-3 text-xl font-bold text-gray-800">Medicine Inventory</h3>
                </div>
                <button onClick={() => { setEditingMedicine(null); setIsMedicineFormOpen(true); }} className="flex items-center px-3 py-1.5 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700"><PlusCircleIcon className="w-5 h-5 mr-1"/>Add Medicine</button>
            </div>
            <div className="overflow-x-auto max-h-96">
                <table className="min-w-full divide-y divide-gray-200">
                     <thead className="bg-gray-50 sticky top-0">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {medicines.map(med => (
                            <tr key={med.id}>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">{med.name}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">{formatCurrency(med.price)}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm space-x-2">
                                    <button onClick={() => { setEditingMedicine(med); setIsMedicineFormOpen(true); }} className="text-blue-600 hover:text-blue-800"><EditIcon className="w-4 h-4"/></button>
                                    <button onClick={() => handleDeleteMedicine(med.id)} className="text-red-600 hover:text-red-800"><Trash2Icon className="w-4 h-4"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
      
      {/* Lab Test Management */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center mb-4">
                <TestTubeIcon className="h-6 w-6 text-teal-600" />
                <h3 className="ml-3 text-xl font-bold text-gray-800">Lab Test Bookings Management</h3>
            </div>
            <div className="overflow-x-auto max-h-96">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Test</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {allLabTestBookings.map(booking => (
                            <tr key={booking.id}>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">{booking.patientName}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">{booking.testName}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">{new Date(booking.bookingDate).toLocaleDateString()}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">
                                    <select 
                                        value={booking.status} 
                                        onChange={(e) => handleUpdateBookingStatus(booking.id, e.target.value as LabTestBooking['status'])}
                                        className="p-1 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                    >
                                        <option>Booked</option>
                                        <option>Sample Collected</option>
                                        <option>Report Ready</option>
                                        <option>Cancelled</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
