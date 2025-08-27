
import React, { useState, useMemo } from 'react';
import { User, Appointment, MedicineOrder } from '../types';
import { SearchIcon, StethoscopeIcon, RupeeIcon, ShoppingBagIcon, FileTextIcon } from './IconComponents';

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
            <div className="bg-gray-50 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b bg-white">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">{patient.firstName} {patient.lastName}</h2>
                            <p className="text-gray-600">{patient.phone} {patient.email && `• ${patient.email}`}</p>
                        </div>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl font-light">&times;</button>
                    </div>
                </div>
                <div className="p-6 overflow-y-auto space-y-6">
                    {/* Appointments History */}
                    <div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-3">Appointment History ({appointments.length})</h3>
                        <div className="bg-white p-4 rounded-lg shadow-md border">
                            {appointments.length > 0 ? (
                                <ul className="divide-y divide-gray-200">
                                    {appointments.map(appt => (
                                        <li key={appt.id} className="py-3">
                                            <p className="font-semibold text-gray-800">Dr. {appt.doctor_name}</p>
                                            <p className="text-sm text-gray-600">Time: {appt.appointment_time} on {new Date(appt.created_at).toLocaleDateString()}</p>
                                            {appt.symptoms && <p className="text-sm text-gray-500 mt-1">Symptoms: <span className="italic">"{appt.symptoms}"</span></p>}
                                        </li>
                                    ))}
                                </ul>
                            ) : <p className="text-gray-500 text-center py-4">No appointment history.</p>}
                        </div>
                    </div>

                    {/* Medicine Order History */}
                    <div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-3">Medicine Order History ({medicineOrders.length})</h3>
                        <div className="bg-white p-4 rounded-lg shadow-md border">
                            {medicineOrders.length > 0 ? (
                                <ul className="divide-y divide-gray-200">
                                    {medicineOrders.map(order => (
                                        <li key={order.id} className="py-3">
                                            <div className="flex justify-between items-center">
                                                <p className="font-semibold text-gray-800">Order #{order.id} <span className="font-normal text-gray-600 text-sm ml-2">({new Date(order.orderDate).toLocaleDateString()})</span></p>
                                                <p className="font-bold text-teal-600">{formatCurrency(order.totalAmount)}</p>
                                            </div>
                                            <ul className="list-disc list-inside text-sm text-gray-600 mt-2 pl-2">
                                                {order.items.map(item => <li key={item.medicineId}>{item.quantity} x {item.medicineName}</li>)}
                                            </ul>
                                        </li>
                                    ))}
                                </ul>
                            ) : <p className="text-gray-500 text-center py-4">No medicine order history.</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


const PatientsView: React.FC<{ users: User[], appointments: Appointment[], medicineOrders: MedicineOrder[] }> = ({ users, appointments, medicineOrders }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPatient, setSelectedPatient] = useState<User | null>(null);

    const getPatientStats = useMemo(() => {
        const statsMap = new Map<number, { appointmentCount: number; orderCount: number; totalRevenue: number; }>();

        // Pre-calculate stats for all patients
        users.forEach(user => {
            if (user.role === 'patient') {
                const appointmentsForPatient = appointments.filter(a => a.userId === user.id);
                const ordersForPatient = medicineOrders.filter(o => o.userId === user.id);

                const appointmentRevenue = appointmentsForPatient.length * 500; // Assuming 500 per appointment
                const orderRevenue = ordersForPatient.reduce((sum, order) => sum + order.totalAmount, 0);
                const totalRevenue = appointmentRevenue + orderRevenue;
                
                statsMap.set(user.id, {
                    appointmentCount: appointmentsForPatient.length,
                    orderCount: ordersForPatient.length,
                    totalRevenue
                });
            }
        });
        return (patientId: number) => statsMap.get(patientId) || { appointmentCount: 0, orderCount: 0, totalRevenue: 0 };
    }, [users, appointments, medicineOrders]);


    const filteredPatients = useMemo(() => {
        return users
            .filter(u => u.role === 'patient')
            .filter(p =>
                p.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.phone.includes(searchTerm)
            ).sort((a,b) => a.firstName.localeCompare(b.firstName));
    }, [users, searchTerm]);

    const handleCloseModal = () => setSelectedPatient(null);

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Patient Management</h3>
            <div className="relative mb-4">
                <input
                    type="text"
                    placeholder="Search patients by name or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                />
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>

            <div className="overflow-x-auto max-h-[60vh]">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Details</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity Summary</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Income</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredPatients.length > 0 ? filteredPatients.map(patient => {
                            const stats = getPatientStats(patient.id);
                            return (
                                <tr key={patient.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-medium text-gray-900">{patient.firstName} {patient.lastName}</div>
                                        <div className="text-sm text-gray-500">{patient.phone}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        <div className="flex items-center"><StethoscopeIcon className="w-4 h-4 mr-2 text-blue-500"/>{stats.appointmentCount} Appointments</div>
                                        <div className="flex items-center mt-1"><ShoppingBagIcon className="w-4 h-4 mr-2 text-green-500"/>{stats.orderCount} Medicine Orders</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-teal-700">
                                        {formatCurrency(stats.totalRevenue)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => setSelectedPatient(patient)} className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-gray-700 bg-white rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
                                            <FileTextIcon className="w-4 h-4 mr-2"/> View Details
                                        </button>
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan={4} className="text-center py-10 text-gray-500">
                                    No patients found matching your search.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {selectedPatient && (
                <PatientDetailModal
                    patient={selectedPatient}
                    appointments={appointments.filter(a => a.userId === selectedPatient.id)}
                    medicineOrders={medicineOrders.filter(o => o.userId === selectedPatient.id)}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
}

export default PatientsView;