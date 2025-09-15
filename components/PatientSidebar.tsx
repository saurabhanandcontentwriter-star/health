import React from 'react';
import { UserIcon, FileTextIcon, HomeIcon, ClipboardCheckIcon, TestTubeIcon } from './IconComponents';

interface PatientSidebarProps {
    activeView: string;
    setCurrentView: (view: 'profile' | 'appointmentHistory' | 'orderHistory' | 'search') => void;
    activeOrderHistoryTab: 'medicines' | 'labTests';
    setActiveOrderHistoryTab: (tab: 'medicines' | 'labTests') => void;
}

const PatientSidebar: React.FC<PatientSidebarProps> = ({ activeView, setCurrentView, activeOrderHistoryTab, setActiveOrderHistoryTab }) => {
    
    const navItems = [
        { name: 'My Profile', view: 'profile', icon: UserIcon, tab: null },
        { name: 'My Appointments', view: 'appointmentHistory', icon: FileTextIcon, tab: null },
        { name: 'Medicine Orders', view: 'orderHistory', icon: ClipboardCheckIcon, tab: 'medicines' },
        { name: 'Test Bookings', view: 'orderHistory', icon: TestTubeIcon, tab: 'testBookings' },
    ];
    
    const NavLink: React.FC<{ name: string, view: string, tab: string | null, icon: React.FC<{className?: string}> }> = ({ name, view, tab, icon: Icon }) => {
        const isActive = activeView === view && (view !== 'orderHistory' || activeOrderHistoryTab === tab);
        return (
            <button 
                onClick={() => {
                    setCurrentView(view as any);
                    if (tab) {
                        setActiveOrderHistoryTab(tab as 'medicines' | 'labTests');
                    }
                }}
                className={`w-full flex items-center group px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive 
                        ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-200' 
                        : 'text-gray-600 hover:bg-gray-100/50 dark:text-gray-400 dark:hover:bg-gray-700/50'
                }`}
            >
                <Icon className={`w-5 h-5 mr-3 transition-colors ${
                    isActive ? 'text-teal-600 dark:text-teal-300' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                }`} />
                <span>{name}</span>
            </button>
        );
    }

    return (
        <aside className="hidden lg:flex flex-col w-64 h-[calc(100vh-7.5rem)] fixed top-[7.5rem] left-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 z-30">
            <div className="flex-grow overflow-y-auto space-y-1 pr-2">
                {navItems.map(item => (
                    <NavLink key={item.view + (item.tab || '')} name={item.name} view={item.view} tab={item.tab} icon={item.icon} />
                ))}
            </div>
            <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                <button 
                    onClick={() => setCurrentView('search')}
                    className="w-full flex items-center group px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100/50 dark:text-gray-400 dark:hover:bg-gray-700/50"
                >
                    <HomeIcon className="w-5 h-5 mr-3 text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-300" />
                    <span>Back to Home</span>
                </button>
            </div>
        </aside>
    );
};

export default PatientSidebar;
