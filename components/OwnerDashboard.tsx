import React from 'react';
import { User, Doctor, Appointment, AuthLog, PharmaCompany, UserSession, MedicineOrder, LabTestBooking, Medicine, LabTest } from '../types';
import { UsersIcon, StethoscopeIcon, RupeeIcon, ActivityIcon } from './IconComponents';
import PatientsView from './PatientsView';
import { CONSULTATION_FEE } from '../utils/constants';
import { 
    AppointmentsView, 
    DoctorsView, 
    LabTestsManagementView, 
    LogsView, 
    MedicineOrdersView, 
    MedicinesView, 
    TestBookingsView 
} from './AdminDashboard';


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


interface OwnerDashboardProps {
  activeTab: string;
  users: User[];
  doctors: Doctor[];
  appointments: Appointment[];
  authLogs: AuthLog[];
  pharmaCompanies: PharmaCompany[];
  sessions: UserSession[];
  medicineOrders: MedicineOrder[];
  labTestBookings: LabTestBooking[];
  medicines: Medicine[];
  labTests: LabTest[];
  refreshData: () => void;
}

const OwnerDashboard: React.FC<OwnerDashboardProps> = (props) => {
    const { users, doctors, appointments, authLogs, sessions, medicineOrders, labTestBookings, activeTab } = props;

    const totalAppointmentRevenue = appointments.length * CONSULTATION_FEE;
    const totalMedicineRevenue = medicineOrders.reduce((sum, order) => sum + order.subtotal, 0);
    const totalLabRevenue = labTestBookings.filter(b => b.status !== 'Cancelled').reduce((sum, booking) => sum + booking.subtotal, 0);
    const totalRevenue = totalAppointmentRevenue + totalMedicineRevenue + totalLabRevenue;
    
    const renderTabContent = () => {
        switch (activeTab) {
            case 'users':
                return (
                   <PatientsView 
                        users={users}
                        appointments={appointments}
                        medicineOrders={medicineOrders}
                        labTestBookings={labTestBookings}
                   />
                );
            case 'doctors':
                 return <DoctorsView doctors={props.doctors} refreshData={props.refreshData} />;
            case 'appointments':
                return <AppointmentsView appointments={props.appointments} refreshData={props.refreshData} />;
            case 'logs':
                return <LogsView authLogs={props.authLogs} sessions={props.sessions} />;
            case 'medicineOrders':
                return <MedicineOrdersView allMedicineOrders={props.medicineOrders} refreshData={props.refreshData} />;
            case 'testBookings':
                return <TestBookingsView allLabTestBookings={props.labTestBookings} refreshData={props.refreshData} />;
            case 'medicines':
                return <MedicinesView medicines={props.medicines} refreshData={props.refreshData} />;
            case 'labTests':
                return <LabTestsManagementView labTests={props.labTests} refreshData={props.refreshData} />;
            case 'overview':
            default:
                 return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard 
                            title="Total Users" 
                            value={users.length} 
                            icon={<UsersIcon className="h-6 w-6 text-teal-800" />}
                            color="bg-teal-100"
                            darkColor="dark:bg-teal-900/50"
                        />
                        <StatCard 
                            title="Registered Doctors" 
                            value={doctors.length} 
                            icon={<StethoscopeIcon className="h-6 w-6 text-indigo-800" />}
                            color="bg-indigo-100"
                            darkColor="dark:bg-indigo-900/50"
                        />
                         <StatCard 
                            title="Total Appointments" 
                            value={appointments.length} 
                            icon={<ActivityIcon className="h-6 w-6 text-blue-800" />}
                            color="bg-blue-100"
                            darkColor="dark:bg-blue-900/50"
                        />
                        <StatCard 
                            title="Total Revenue" 
                            value={`₹ ${totalRevenue.toLocaleString('en-IN')}`} 
                            icon={<RupeeIcon className="h-6 w-6 text-green-800" />}
                            color="bg-green-100"
                            darkColor="dark:bg-green-900/50"
                        />
                    </div>
                );
        }
    };
    
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Owner Super Admin Panel</h1>
            <div>
                {renderTabContent()}
            </div>
        </div>
    )
};

export default OwnerDashboard;
