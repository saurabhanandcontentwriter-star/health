import React, { useState, useMemo } from 'react';
import { User, Appointment, MedicineOrder } from '../types';
import { SearchIcon, StethoscopeIcon, RupeeIcon, ShoppingBagIcon, FileTextIcon } from './IconComponents';
import { CONSULTATION_FEE } from '../utils/constants';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
};

interface PatientDetailModalProps {
    patient: User;
    appointments: Appointment[];
    medicineOrders: MedicineOrder[];
    onClose: () => void;
}

const PatientDetailModal: React.FC<PatientDetailModalProps> = ({ patient, appointments, medicineOrders, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{patient.firstName} {patient.lastName}</h2>
                            <p className="text-gray-600 dark:text-gray-400">{patient.phone} {patient.email && `• ${patient.email}`}</p>
                        </div>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 text-3xl font-light">&times;</button>
                    </div>
                </div>
                <div className="p-6 overflow-y-auto space-y-6">
                    {/* Appointments History */}
                    <div>
                        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-3">Appointment History ({appointments.length})</h3>
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border dark:border-gray-700">
                            {appointments.length > 0 ? (
                                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {appointments.map(appt => (
                                        <li key={appt.id} className="py-3">
                                            <p className="font-semibold text-gray-800 dark:text-gray-100">Dr. {appt.doctor_name}</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{new Date(appt.appointment_date + 'T00:00:00').toLocaleDateString()} at {appt.appointment_time}</p>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-center text-gray-500 dark:text-gray-400 py-4">No appointments found.</p>
                            )}
                        </div>
                    </div>

                    {/* Medicine Order History */}
                    <div>
                        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-3">Medicine Order History ({medicineOrders.length})</h3>
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border dark:border-gray-700">
                            {medicineOrders.length > 0 ? (
                                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {medicineOrders.map(order => (
                                        <li key={order.id} className="py-3">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="font-semibold text-gray-800 dark:text-gray-100">Order #{order.id}</p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">{new Date(order.orderDate).toLocaleDateString()}</p>
                                                </div>
                                                <p className="font-semibold text-gray-800 dark:text-gray-100">{formatCurrency(order.totalAmount)}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-center text-gray-500 dark:text-gray-400 py-4">No medicine orders found.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


interface PatientsViewProps {
    users: User[];
    appointments: Appointment[];
    medicineOrders: MedicineOrder[];
}

const PatientsView: React.FC<PatientsViewProps> = ({ users, appointments, medicineOrders }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);

    const patientData = useMemo(() => {
        const patients = users.filter(u => u.role === 'patient');

        return patients.map(patient => {
            const patientAppointments = appointments.filter(a => a.userId === patient.id);
            const patientOrders = medicineOrders.filter(o => o.userId === patient.id);

            const appointmentIncome = patientAppointments.length * CONSULTATION_FEE;
            // CORRECTED: Use subtotal for consistent, pre-tax revenue calculation
            const medicineIncome = patientOrders.reduce((sum, order) => sum + order.subtotal, 0);
            const totalIncome = appointmentIncome + medicineIncome;

            return {
                ...patient,
                appointmentCount: patientAppointments.length,
                orderCount: patientOrders.length,
                totalIncome,
                appointments: patientAppointments,
                medicineOrders: patientOrders
            };
        }).sort((a, b) => b.totalIncome - a.totalIncome);

    }, [users, appointments, medicineOrders]);
    
    const selectedPatientDetails = useMemo(() => {
        if (!selectedPatientId) return null;
        return patientData.find(p => p.id === selectedPatientId);
    }, [selectedPatientId, patientData]);

    const filteredPatients = useMemo(() => {
        return patientData.filter(p =>
            `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.phone.includes(searchTerm)
        );
    }, [patientData, searchTerm]);

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
             <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Patient Management</h3>
                <div className="relative w-full md:w-1/3">
                    <input
                        type="text"
                        placeholder="Search by name or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
            </div>
            <div className="overflow-x-auto max-h-[60vh]">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Patient Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Contact</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total Income</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Details</th>
                        </tr>
                    </thead>
                     <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredPatients.map((patient) => (
                             <tr key={patient.id} className="dark:hover:bg-gray-700/50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{patient.firstName} {patient.lastName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{patient.phone}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800 dark:text-gray-100">{formatCurrency(patient.totalIncome)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <button onClick={() => setSelectedPatientId(patient.id)} className="text-teal-600 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300 font-semibold">
                                        View History
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedPatientDetails && (
                <PatientDetailModal 
                    patient={selectedPatientDetails}
                    appointments={selectedPatientDetails.appointments}
                    medicineOrders={selectedPatientDetails.medicineOrders}
                    onClose={() => setSelectedPatientId(null)}
                />
            )}
        </div>
    );
};

export default PatientsView;
