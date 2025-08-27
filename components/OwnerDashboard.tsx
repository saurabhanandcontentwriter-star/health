

import React, { useState } from 'react';
import { User, Doctor, Appointment, AuthLog, PharmaCompany, UserSession, MedicineOrder, LabTestBooking } from '../types';
import { UsersIcon, StethoscopeIcon, RupeeIcon, ActivityIcon, HourglassIcon } from './IconComponents';
import PatientsView from './PatientsView';

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

const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds} sec`;
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) {
        return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m ${seconds % 60}s`;
};


interface OwnerDashboardProps {
  users: User[];
  doctors: Doctor[];
  appointments: Appointment[];
  authLogs: AuthLog[];
  pharmaCompanies: PharmaCompany[];
  sessions: UserSession[];
  medicineOrders: MedicineOrder[];
  labTestBookings: LabTestBooking[];
}

type Tab = 'overview' | 'users' | 'doctors' | 'appointments' | 'logs';

const OwnerDashboard: React.FC<OwnerDashboardProps> = (props) => {
    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const { users, doctors, appointments, authLogs, sessions, medicineOrders, labTestBookings } = props;

    const CONSULTATION_FEE = 500;
    const totalAppointmentRevenue = appointments.length * CONSULTATION_FEE;
    const totalMedicineRevenue = medicineOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalLabRevenue = labTestBookings.filter(b => b.status !== 'Cancelled').reduce((sum, booking) => sum + booking.totalAmount, 0);
    const totalRevenue = totalAppointmentRevenue + totalMedicineRevenue + totalLabRevenue;
    
    const roleColors: Record<User['role'], string> = {
        patient: 'bg-blue-100 text-blue-800',
        admin: 'bg-purple-100 text-purple-800',
        owner: 'bg-teal-100 text-teal-800',
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard 
                            title="Total Users" 
                            value={users.length} 
                            icon={<UsersIcon className="h-6 w-6 text-teal-800" />}
                            color="bg-teal-100"
                        />
                        <StatCard 
                            title="Registered Doctors" 
                            value={doctors.length} 
                            icon={<StethoscopeIcon className="h-6 w-6 text-indigo-800" />}
                            color="bg-indigo-100"
                        />
                         <StatCard 
                            title="Total Appointments" 
                            value={appointments.length} 
                            icon={<ActivityIcon className="h-6 w-6 text-blue-800" />}
                            color="bg-blue-100"
                        />
                        <StatCard 
                            title="Total Revenue" 
                            value={`₹ ${totalRevenue.toLocaleString('en-IN')}`} 
                            icon={<RupeeIcon className="h-6 w-6 text-green-800" />}
                            color="bg-green-100"
                        />
                    </div>
                );
            case 'users':
                return (
                   <PatientsView 
                        users={users}
                        appointments={appointments}
                        medicineOrders={medicineOrders}
                   />
                );
            case 'doctors':
                 return (
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <div className="overflow-x-auto max-h-[60vh]">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialty</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Availability</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {doctors.map((doctor) => (
                                        <tr key={doctor.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{doctor.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doctor.specialty}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doctor.location}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doctor.available_time}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'appointments':
                // Sort appointments by date descending for this view
                const sortedAppointments = [...appointments].sort((a, b) => {
                     const dateA = new Date(a.appointment_date).getTime();
                     const dateB = new Date(b.appointment_date).getTime();
                     return dateB - dateA;
                });
                return (
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <div className="overflow-x-auto max-h-[60vh]">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Appointment Date</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booked On</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {sortedAppointments.map((appt) => (
                                        <tr key={appt.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{appt.patient_name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{appt.doctor_name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(appt.appointment_date + 'T00:00:00').toLocaleDateString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{appt.appointment_time}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(appt.created_at).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'logs':
                return (
                     <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
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
                                        {authLogs.map((log, index) => (
                                            <tr key={`auth-${index}`}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{log.userName}</td>
                                                <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${log.action === 'login' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{log.action}</span></td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(log.timestamp).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-lg">
                             <div className="flex items-center mb-4">
                                <HourglassIcon className="h-6 w-6 text-teal-600" />
                                <h3 className="ml-3 text-xl font-bold text-gray-800">User Session Tracking</h3>
                            </div>
                             <div className="overflow-x-auto max-h-96">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50 sticky top-0">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Time</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {sessions.map((session) => (
                                            <tr key={`session-${session.id}`}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{session.userName}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDuration(session.duration)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(session.endTime).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );
        }
    };
    
    const TabButton: React.FC<{tabName: Tab, label: string}> = ({ tabName, label }) => {
        const isActive = activeTab === tabName;
        return (
             <button
                onClick={() => setActiveTab(tabName)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive ? 'bg-teal-600 text-white' : 'text-gray-600 hover:bg-teal-100'
                }`}
            >
                {label}
            </button>
        )
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-800">Owner Super Admin Panel</h1>
            <div className="bg-white p-2 rounded-lg shadow-md">
                <nav className="flex items-center space-x-2">
                   <TabButton tabName="overview" label="Overview" />
                   <TabButton tabName="users" label="Patient Management" />
                   <TabButton tabName="doctors" label="Doctor Management" />
                   <TabButton tabName="appointments" label="Appointments" />
                   <TabButton tabName="logs" label="System Logs" />
                </nav>
            </div>
            <div>
                {renderTabContent()}
            </div>
        </div>
    )
};

export default OwnerDashboard;