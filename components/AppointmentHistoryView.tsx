
import React from 'react';
import { Appointment } from '../types';
import { StethoscopeIcon, ClockIcon, FileTextIcon, RefreshCwIcon } from './IconComponents';

interface AppointmentHistoryViewProps {
  appointments: Appointment[];
}

const AppointmentHistoryView: React.FC<AppointmentHistoryViewProps> = ({ appointments }) => {

  const sortedAppointments = [...appointments].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const downloadPdf = (base64String: string, fileName: string) => {
    const linkSource = base64String;
    const downloadLink = document.createElement("a");
    downloadLink.href = linkSource;
    downloadLink.download = fileName;
    downloadLink.click();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Your Appointment History</h1>
      </div>

      {sortedAppointments.length > 0 ? (
        <div className="space-y-6">
          {sortedAppointments.map(appt => (
            <div key={appt.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 animate-slide-in-right">
              <div className="flex flex-col md:flex-row justify-between md:items-center border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Dr. {appt.doctor_name}</h2>
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
                 {appt.report_pdf_base64 && (
                    <button 
                      onClick={() => downloadPdf(appt.report_pdf_base64!, `report_${appt.appointment_date}.pdf`)}
                      className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 bg-teal-100 text-teal-800 text-sm font-semibold rounded-lg hover:bg-teal-200 transition-colors dark:bg-teal-900/50 dark:text-teal-300 dark:hover:bg-teal-900"
                    >
                        <FileTextIcon className="w-5 h-5 mr-2" />
                        Download Report
                    </button>
                )}
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
