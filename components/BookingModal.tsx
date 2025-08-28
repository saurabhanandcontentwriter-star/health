
import React, { useState, useEffect } from 'react';
import { Doctor, AppointmentIn } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { FileTextIcon, QrCodeIcon } from './IconComponents';
import { generateQrCode } from '../services/qrService';
import { CONSULTATION_FEE, GST_RATE } from '../utils/constants';

interface BookingModalProps {
  doctor: Doctor;
  selectedSlot: string;
  onClose: () => void;
  onBook: (data: AppointmentIn) => Promise<void>;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
};

const BookingModal: React.FC<BookingModalProps> = ({ doctor, selectedSlot, onClose, onBook }) => {
  const { user } = useAuth();
  
  // Form state
  const [patientName, setPatientName] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState(selectedSlot);
  const [isRepeatVisit, setIsRepeatVisit] = useState(false);
  const [heartBeatRate, setHeartBeatRate] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [bloodTestNotes, setBloodTestNotes] = useState('');
  const [nutritionNotes, setNutritionNotes] = useState('');
  const [reportPdf, setReportPdf] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');

  // Modal flow state
  const [step, setStep] = useState<'details' | 'payment' | 'confirmed'>('details');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // QR Code state
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (user) {
      setPatientName(`${user.firstName} ${user.lastName}`);
    }
    setAppointmentDate(today);
  }, [user, today]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setFileError('Invalid file type. Please upload a PDF.');
        setReportPdf(null);
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setFileError('File is too large. Maximum size is 5MB.');
        setReportPdf(null);
        return;
      }
      setFileError('');
      setReportPdf(file);
    }
  };

  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName || !appointmentTime || !appointmentDate) {
      setError('Please fill in all required appointment details.');
      return;
    }
    setError('');
    setIsLoading(true);
    
    try {
        const totalAmount = CONSULTATION_FEE * (1 + GST_RATE);
        const url = await generateQrCode(String(totalAmount));
        setQrCodeUrl(url);
        setStep('payment');
    } catch (err: any) {
        setError(err.message || 'Could not generate QR code. Please try again.');
    } finally {
        setIsLoading(false);
    }
  };

  const handleConfirmBooking = async () => {
    setIsLoading(true);
    setError(''); // Clear previous errors
    if (!user) {
        setError("User not found. Please log in again.");
        setIsLoading(false);
        return;
    }
    try {
        await onBook({
          userId: user.id,
          patient_name: patientName,
          doctor_id: doctor.id,
          appointment_date: appointmentDate,
          appointment_time: appointmentTime,
          is_repeat_visit: isRepeatVisit,
          heart_beat_rate: heartBeatRate,
          symptoms: symptoms,
          blood_test_notes: bloodTestNotes,
          nutrition_notes: nutritionNotes,
          report_pdf_file: reportPdf,
        });
        setStep('confirmed');
    } catch (err) {
        setError("Failed to book appointment. Please try again.");
    } finally {
        setIsLoading(false);
    }
  };

  const renderDetailsForm = () => (
    <>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Book Appointment</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">with <span className="font-semibold text-teal-600 dark:text-teal-400">Dr. {doctor.name}</span></p>
      <form onSubmit={handleProceedToPayment} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
        <div>
          <label htmlFor="patientName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Patient's Name</label>
          <input
            type="text"
            id="patientName"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="e.g., John Doe"
            required
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="appointmentDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Appointment Date</label>
              <input
                type="date"
                id="appointmentDate"
                value={appointmentDate}
                min={today}
                onChange={(e) => setAppointmentDate(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            <div>
              <label htmlFor="appointmentTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Appointment Time</label>
              <input
                type="text"
                id="appointmentTime"
                value={appointmentTime}
                className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none sm:text-sm dark:bg-gray-600 dark:border-gray-500 dark:text-gray-300"
                readOnly
                required
              />
            </div>
        </div>


        <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-4">Additional Patient Information (Optional)</h3>
            <div className="space-y-4">
                <div className="relative flex items-start">
                    <div className="flex items-center h-5">
                        <input id="is_repeat_visit" name="is_repeat_visit" type="checkbox" checked={isRepeatVisit} onChange={(e) => setIsRepeatVisit(e.target.checked)} className="focus:ring-teal-500 h-4 w-4 text-teal-600 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"/>
                    </div>
                    <div className="ml-3 text-sm">
                        <label htmlFor="is_repeat_visit" className="font-medium text-gray-700 dark:text-gray-300">This is a repeat visit</label>
                    </div>
                </div>
                <div>
                    <label htmlFor="heartBeatRate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Heart Beat Rate (BPM)</label>
                    <input type="number" id="heartBeatRate" value={heartBeatRate} onChange={(e) => setHeartBeatRate(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="e.g., 72"/>
                </div>
                <div>
                    <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Symptoms</label>
                    <textarea id="symptoms" value={symptoms} onChange={(e) => setSymptoms(e.target.value)} rows={2} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="e.g., Describe your symptoms briefly"/>
                </div>
                <div>
                    <label htmlFor="bloodTestNotes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Blood Test Notes</label>
                    <textarea id="bloodTestNotes" value={bloodTestNotes} onChange={(e) => setBloodTestNotes(e.target.value)} rows={2} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="e.g., Mention any recent blood tests"/>
                </div>
                <div>
                    <label htmlFor="nutritionNotes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nutrition Notes</label>
                    <textarea id="nutritionNotes" value={nutritionNotes} onChange={(e) => setNutritionNotes(e.target.value)} rows={2} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="e.g., Any dietary restrictions or habits"/>
                </div>
                <div>
                    <label htmlFor="reportUpload" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Upload Report</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md dark:border-gray-600">
                        <div className="space-y-1 text-center">
                            <FileTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="flex text-sm text-gray-600 dark:text-gray-400">
                                <label htmlFor="reportUpload" className="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-teal-600 hover:text-teal-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-teal-500 dark:text-teal-400 dark:hover:text-teal-300">
                                    <span>Upload a file</span>
                                    <input id="reportUpload" name="reportUpload" type="file" className="sr-only" onChange={handleFileChange} accept="application/pdf" />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">PDF up to 5MB</p>
                        </div>
                    </div>
                    {reportPdf && !fileError && (
                        <div className="mt-2 text-sm text-gray-700 dark:text-gray-300 flex items-center justify-between bg-gray-100 dark:bg-gray-600 p-2 rounded-md">
                            <span>Selected: <span className="font-medium">{reportPdf.name}</span></span>
                            <button type="button" onClick={() => { setReportPdf(null); (document.getElementById('reportUpload') as HTMLInputElement).value = ''; }} className="ml-2 text-red-600 hover:text-red-800 font-bold text-lg">&times;</button>
                        </div>
                    )}
                    {fileError && <p className="text-red-500 text-sm mt-1">{fileError}</p>}
                </div>
            </div>
        </div>
        
        {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}

        <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700 mt-6">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500">
            Cancel
          </button>
          <button type="submit" disabled={isLoading} className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors disabled:bg-teal-400 disabled:cursor-not-allowed">
            {isLoading ? 'Processing...' : 'Proceed to Payment'}
          </button>
        </div>
      </form>
    </>
  );

  const renderPaymentStep = () => {
    const gst = CONSULTATION_FEE * GST_RATE;
    const totalAmount = CONSULTATION_FEE + gst;
    
    return (
        <div className="flex flex-col items-center text-center">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Complete Your Payment</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">to confirm your appointment with Dr. {doctor.name}.</p>
            
            <div className="w-full max-w-xs my-4 space-y-2 text-left bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">Consultation Fee:</span>
                    <span className="font-medium text-gray-800 dark:text-gray-100">{formatCurrency(CONSULTATION_FEE)}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">GST ({GST_RATE * 100}%):</span>
                    <span className="font-medium text-gray-800 dark:text-gray-100">+ {formatCurrency(gst)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t border-gray-300 dark:border-gray-500 pt-2 mt-2">
                    <span className="text-gray-800 dark:text-gray-100">Total Payable:</span>
                    <span className="text-teal-600 dark:text-teal-400">{formatCurrency(totalAmount)}</span>
                </div>
            </div>
            
            <div className="p-4 my-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 h-64 w-64 flex items-center justify-center">
            {qrCodeUrl ? (
                <img src={qrCodeUrl} alt="Payment QR Code" className="w-56 h-56 object-contain rounded" />
            ) : (
                <div className="flex flex-col items-center justify-center text-center p-4">
                    <QrCodeIcon className="h-12 w-12 text-gray-400" />
                    <p className="text-red-500 text-sm">{error || "Something went wrong generating the QR Code."}</p>
                </div>
            )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Scan with any UPI app (GPay, PhonePe, Paytm, etc.)</p>
            
            {error && !qrCodeUrl && <p className="text-red-500 text-sm mt-4">{error}</p>}
            
            <div className="flex justify-center space-x-4 pt-6 w-full">
                <button type="button" onClick={() => { setError(''); setStep('details'); }} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500">
                Back
                </button>
                <button type="button" onClick={handleConfirmBooking} disabled={isLoading || !qrCodeUrl} className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors disabled:bg-teal-400 disabled:cursor-not-allowed">
                {isLoading ? 'Confirming...' : "I've Paid, Confirm"}
                </button>
            </div>
            {error && qrCodeUrl && <p className="text-red-500 text-sm mt-4">{error}</p>}
        </div>
    );
  };

  const renderConfirmedStep = () => (
    <div className="text-center">
      <h3 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-4">Appointment Confirmed!</h3>
      <p className="text-gray-700 dark:text-gray-300">Your appointment with <span className="font-semibold text-teal-700 dark:text-teal-400">Dr. {doctor.name}</span> for <span className="font-semibold text-teal-700 dark:text-teal-400">{new Date(appointmentDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {appointmentTime}</span> is booked.</p>
      <p className="text-gray-600 dark:text-gray-400 mt-2">A confirmation SMS has been sent to your registered mobile number.</p>
      <button onClick={onClose} className="mt-6 px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors">
        Close
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-8 w-full max-w-lg transform transition-all">
        {step === 'details' && renderDetailsForm()}
        {step === 'payment' && renderPaymentStep()}
        {step === 'confirmed' && renderConfirmedStep()}
      </div>
    </div>
  );
};

export default BookingModal;