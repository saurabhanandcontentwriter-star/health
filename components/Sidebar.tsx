
import React from 'react';
import { User } from '../types';
import { StethoscopeIcon, UserIcon, ArchiveIcon, LogOutIcon, LogInIcon, PillIcon, UsersIcon, CalendarIcon, ActivityIcon, TestTubeIcon, HomeIcon, BeakerIcon, ClipboardCheckIcon, ShoppingBagIcon } from './IconComponents';

interface SidebarProps {
    user: User;
    logout: () => void;
    activeTab: string;
    setActiveTab: (tab: string) => void;
    setCurrentView: (view: 'search' | 'dashboard' | 'ownerDashboard' | 'pharmacy' | 'labTests' | 'appointmentHistory' | 'profile' | 'orderHistory') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, logout, activeTab, setActiveTab, setCurrentView }) => {
    
    const dashboardView = user.role === 'admin' ? 'dashboard' : 'ownerDashboard';

    const navItems = [
        { name: 'Overview', tab: 'overview', icon: HomeIcon, role: ['admin', 'owner'] },
        { name: 'Manage Orders', tab: 'medicineOrders', icon: ClipboardCheckIcon, role: ['admin', 'owner'] },
        { name: 'Order Medicines', view: 'pharmacy', icon: ShoppingBagIcon, role: ['admin', 'owner'] },
        { name: 'Test Bookings', tab: 'testBookings', icon: TestTubeIcon, role: ['admin', 'owner'] },
        { name: 'Patients', tab: 'patients', icon: UsersIcon, role: ['admin'] },
        { name: 'Users', tab: 'users', icon: UsersIcon, role: ['owner'] },
        { name: 'Doctors', tab: 'doctors', icon: StethoscopeIcon, role: ['admin', 'owner'] },
        { name: 'Medicines', tab: 'medicines', icon: PillIcon, role: ['admin', 'owner'] },
        { name: 'Lab Tests', tab: 'labTests', icon: TestTubeIcon, role: ['admin', 'owner'] },
        { name: 'Appointments', tab: 'appointments', icon: CalendarIcon, role: ['admin', 'owner'] },
        { name: 'System Logs', tab: 'logs', icon: ActivityIcon, role: ['admin', 'owner'] },
    ];
    
    return (
        <aside className="hidden lg:flex flex-col w-64 h-[calc(100vh-7.5rem)] fixed top-[7.5rem] left-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 z-30">
            <div className="flex-grow overflow-y-auto space-y-1 pr-2">
                {navItems.filter(item => item.role.includes(user.role)).map(item => {
                    const isActive = item.tab ? activeTab === item.tab : false;
                    const Icon = item.icon;
                    
                    const handleClick = () => {
                        if (item.tab) {
                            setCurrentView(dashboardView);
                            setActiveTab(item.tab);
                        } else if ((item as any).view) {
                            setCurrentView((item as any).view);
                        }
                    };

                    return (
                        <button 
                            key={item.name}
                            onClick={handleClick}
                            className={`w-full flex items-center group px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                isActive 
                                    ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-200' 
                                    : 'text-gray-600 hover:bg-gray-100/50 dark:text-gray-400 dark:hover:bg-gray-700/50'
                            }`}
                        >
                            <Icon className={`w-5 h-5 mr-3 transition-colors ${
                                isActive ? 'text-teal-600 dark:text-teal-300' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                            }`} />
                            <span>{item.name}</span>
                        </button>
                    );
                })}
            </div>
            <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="space-y-1 pb-2">
                    <button 
                        onClick={() => setCurrentView('profile')}
                        className="w-full flex items-center group px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100/50 dark:text-gray-400 dark:hover:bg-gray-700/50"
                    >
                        <UserIcon className="w-5 h-5 mr-3 text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-300" />
                        <span>My Profile</span>
                    </button>
                     <button 
                        onClick={() => setCurrentView('orderHistory')}
                        className="w-full flex items-center group px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100/50 dark:text-gray-400 dark:hover:bg-gray-700/50"
                    >
                        <ArchiveIcon className="w-5 h-5 mr-3 text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-300" />
                        <span>Order History</span>
                    </button>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-600 pt-2 space-y-1">
                    <button 
                        onClick={logout}
                        className="w-full flex items-center group px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100/50 dark:text-gray-400 dark:hover:bg-gray-700/50"
                    >
                        <LogInIcon className="w-5 h-5 mr-3 text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-300" />
                        <span>Switch Account</span>
                    </button>
                    <button 
                        onClick={logout}
                        className="w-full flex items-center group px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                        <LogOutIcon className="w-5 h-5 mr-3" />
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
