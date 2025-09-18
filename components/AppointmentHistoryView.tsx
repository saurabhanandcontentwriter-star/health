import React, { useState } from 'react';
import { Appointment } from '../types';
import { StethoscopeIcon, ClockIcon, FileTextIcon, RefreshCwIcon, XCircleIcon } from './IconComponents';

interface AppointmentHistoryViewProps {
  appointments: Appointment[];
  onCancelAppointment: (id: number, reason: string) => void;
}

const StatusBadge: React.FC<{ status: Appointment['status'] }> = ({ status }) => {
    const baseClasses = 'px-2 py-1 text-xs font-semibold rounded-full inline-block capitalize';
    const statusMap = {
        Scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
        Completed: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
        Cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
        'No-Show': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    };
    return <span className={`${baseClasses} ${statusMap[status]}`}>{status.replace('-', ' ')}</span>;
};

const CancellationReasonModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
}> = ({ isOpen, onClose, onConfirm }) => {
    const [reason, setReason] = useState('');

    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm(reason);
        setReason('');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-md">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Cancel Appointment</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Please provide a reason for cancellation. This helps us improve our service.</p>
                <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g., Schedule conflict, feeling better..."
                    className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    rows={3}
                />
                <div className="flex justify-end space-x-4 mt-6">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500">
                        Keep Appointment
                    </button>
                    <button onClick={handleConfirm} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                        Confirm Cancellation
                    </button>
                </div>
            </div>
        </div>
    );
};


const AppointmentHistoryView: React.FC<AppointmentHistoryViewProps> = ({ appointments, onCancelAppointment }) => {
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [appointmentToCancel, setAppointmentToCancel] = useState<Appointment | null>(null);

  const sortedAppointments = [...appointments].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const downloadPdf = (base64String: string, fileName: string) => {
    const linkSource = base64String;
    const downloadLink = document.createElement("a");
    downloadLink.href = linkSource;
    downloadLink.download = fileName;
    downloadLink.click();
  }
  
  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
      setNotification({ type, message });
      setTimeout(() => setNotification(null), 4000);
  };
  
  const handleCancelClick = (appointment: Appointment) => {
    setAppointmentToCancel(appointment);
  };
  
  const handleConfirmCancellation = (reason: string) => {
    if (appointmentToCancel) {
        try {
            onCancelAppointment(appointmentToCancel.id, reason);
            showNotification('Appointment cancelled successfully.', 'success');
        } catch (error) {
            console.error("Failed to cancel appointment:", error);
            showNotification('Failed to cancel appointment. Please try again.', 'error');
        } finally {
            setAppointmentToCancel(null);
        }
    }
  };


  return (
    <div className="space-y-6">
       {notification && (
            <div className={`fixed top-24 right-8 z-50 p-4 rounded-lg shadow-lg text-white animate-slide-in-right ${notification.type === 'success' ? 'bg-teal-600' : 'bg-red-600'}`}>
                {notification.message}
            </div>
        )}
        <CancellationReasonModal
            isOpen={!!appointmentToCancel}
            onClose={() => setAppointmentToCancel(null)}
            onConfirm={handleConfirmCancellation}
        />
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Your Appointment History</h1>
      </div>

      {sortedAppointments.length > 0 ? (
        <div className="space-y-6">
          {sortedAppointments.map(appt => (
            <div key={appt.id} className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 animate-slide-in-right transition-opacity ${appt.status === 'Cancelled' || appt.status === 'No-Show' ? 'opacity-60' : ''}`}>
              <div className="flex flex-col md:flex-row justify-between md:items-start border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
                <div>
                  <div className="flex items-center gap-4 mb-2">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Dr. {appt.doctor_name}</h2>
                    <StatusBadge status={appt.status} />
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-400 mt-2 text-sm space-x-4">
                    <div className="flex items-center">
                      <ClockIcon className="w-4 h-4 mr-1.5" />
                      <span>{new Date(appt.appointment_date + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} at {appt.appointment_time}</span>
                    </div>
                    {appt.is_repeat_visit && (
                      <div className="flex items-center bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 px-2 py-0.5 rounded-full text-xs font-semibold">
                        <RefreshCwIcon className="w-4 h-4 mr-1.5" />
                        <span>Repeat Visit</span>
                      </div>
                    )}
                  </div>
                </div>
                 <div className="flex items-center space-x-4 mt-4 md:mt-0 self-start">
                    {appt.report_pdf_base64 && (
                        <button 
                          onClick={() => downloadPdf(appt.report_pdf_base64!, `report_${appt.appointment_date}.pdf`)}
                          className="inline-flex items-center px-4 py-2 bg-teal-100 text-teal-800 text-sm font-semibold rounded-lg hover:bg-teal-200 transition-colors dark:bg-teal-900/50 dark:text-teal-300 dark:hover:bg-teal-900"
                        >
                            <FileTextIcon className="w-5 h-5 mr-2" />
                            Download Report
                        </button>
                    )}
                    {appt.status === 'Scheduled' && (
                        <button
                            onClick={() => handleCancelClick(appt)}
                            className="inline-flex items-center px-4 py-2 bg-red-50 text-red-700 text-sm font-semibold rounded-lg hover:bg-red-100 transition-colors border border-red-700 shadow-sm dark:bg-red-900/20 dark:text-red-300 dark:border-red-600 dark:hover:bg-red-900/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                            <XCircleIcon className="w-5 h-5 mr-2" />
                            Cancel Appointment
                        </button>
                    )}
                 </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Symptoms Reported</h4>
                  <p className="text-gray-600 dark:text-gray-300 italic bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md min-h-[60px]">{appt.symptoms || 'Not provided'}</p>
                </div>
                <div>
                   <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Vitals & Notes</h4>
                   <ul className="space-y-2 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md">
                     <li className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Heart Rate:</span> <span className="font-medium text-gray-800 dark:text-gray-200">{appt.heart_beat_rate ? `${appt.heart_beat_rate} BPM` : 'N/A'}</span></li>
                     <li className="flex justify-between border-t dark:border-gray-600 pt-2"><span className="text-gray-500 dark:text-gray-400">Blood Test Notes:</span> <span className="font-medium text-gray-800 dark:text-gray-200 text-right">{appt.blood_test_notes || 'N/A'}</span></li>
                     <li className="flex justify-between border-t dark:border-gray-600 pt-2"><span className="text-gray-500 dark:text-gray-400">Nutrition Notes:</span> <span className="font-medium text-gray-800 dark:text-gray-200 text-right">{appt.nutrition_notes || 'N/A'}</span></li>
                   </ul>
                </div>
              </div>

              {appt.status === 'Cancelled' && appt.cancellationReason && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Reason for Cancellation</h4>
                    <p className="text-gray-600 dark:text-gray-300 italic bg-red-50 dark:bg-red-900/20 p-3 rounded-md text-sm">"{appt.cancellationReason}"</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <FileTextIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">No Past Appointments</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Your appointment history is empty. Book an appointment to get started.
          </p>
        </div>
      )}
    </div>
  );
};

export default AppointmentHistoryView;
