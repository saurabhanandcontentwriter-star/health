import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';
import { ShoppingBagIcon, TestTubeIcon, StethoscopeIcon, FileTextIcon, UserIcon, ChevronDownIcon, ArchiveIcon, LogOutIcon, HomeIcon, TruckIcon, PillIcon, UsersIcon, CalendarIcon, ActivityIcon, BeakerIcon } from './IconComponents';
import WeatherWidget from './WeatherWidget';
import ThemeToggle from './ThemeToggle';

interface HeaderProps {
  currentView: string;
  setCurrentView: (view: 'search' | 'dashboard' | 'ownerDashboard' | 'pharmacy' | 'labTests' | 'appointmentHistory' | 'profile' | 'orderHistory') => void;
  activeDashboardTab: string;
  setActiveDashboardTab: (tab: string) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView, activeDashboardTab, setActiveDashboardTab }) => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const menuRef = useRef<HTMLDivElement>(null);

  const navButtonClasses = "px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center";
  const activeClasses = "bg-teal-600 text-white shadow-md";
  const inactiveClasses = "text-gray-600 hover:bg-teal-100 hover:text-teal-700 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-10 transition-colors duration-300">
      <WeatherWidget />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <Logo className="h-12" />
          </div>
          {user && (
            <div className="flex items-center space-x-2 sm:space-x-4">
              <nav className="hidden lg:flex items-center space-x-2">
                {user.role === 'patient' ? (
                    <>
                      <button
                        onClick={() => setCurrentView('search')}
                        className={`${navButtonClasses} ${currentView === 'search' ? activeClasses : inactiveClasses}`}
                      >
                        <StethoscopeIcon className="w-4 h-4 mr-2" /> Find a Doctor
                      </button>
                       <button
                        onClick={() => setCurrentView('appointmentHistory')}
                        className={`${navButtonClasses} ${currentView === 'appointmentHistory' ? activeClasses : inactiveClasses}`}
                      >
                        <FileTextIcon className="w-4 h-4 mr-2" /> My Appointments
                      </button>
                       <button
                        onClick={() => setCurrentView('labTests')}
                        className={`${navButtonClasses} ${currentView === 'labTests' ? activeClasses : inactiveClasses}`}
                      >
                        <TestTubeIcon className="w-4 h-4 mr-2" /> Lab Tests
                      </button>
                       <button
                        onClick={() => setCurrentView('pharmacy')}
                        className={`${navButtonClasses} ${currentView === 'pharmacy' ? activeClasses : inactiveClasses}`}
                      >
                        <ShoppingBagIcon className="w-4 h-4 mr-2" /> Pharmacy
                      </button>
                    </>
                ) : user.role === 'admin' ? (
                     <>
                        <button onClick={() => { setCurrentView('dashboard'); setActiveDashboardTab('overview'); }} className={`${navButtonClasses} ${currentView === 'dashboard' && activeDashboardTab === 'overview' ? activeClasses : inactiveClasses}`}>
                            <HomeIcon className="w-4 h-4 mr-2" /> Dashboard
                        </button>
                        <button onClick={() => { setCurrentView('dashboard'); setActiveDashboardTab('medicineOrders'); }} className={`${navButtonClasses} ${currentView === 'dashboard' && activeDashboardTab === 'medicineOrders' ? activeClasses : inactiveClasses}`}>
                            <ShoppingBagIcon className="w-4 h-4 mr-2" /> Medicine Orders
                        </button>
                        <button onClick={() => { setCurrentView('dashboard'); setActiveDashboardTab('testBookings'); }} className={`${navButtonClasses} ${currentView === 'dashboard' && activeDashboardTab === 'testBookings' ? activeClasses : inactiveClasses}`}>
                            <BeakerIcon className="w-4 h-4 mr-2" /> Test Bookings
                        </button>
                         <button onClick={() => { setCurrentView('dashboard'); setActiveDashboardTab('patients'); }} className={`${navButtonClasses} ${currentView === 'dashboard' && activeDashboardTab === 'patients' ? activeClasses : inactiveClasses}`}>
                            <UsersIcon className="w-4 h-4 mr-2" /> Patients
                        </button>
                        <button onClick={() => { setCurrentView('dashboard'); setActiveDashboardTab('doctors'); }} className={`${navButtonClasses} ${currentView === 'dashboard' && activeDashboardTab === 'doctors' ? activeClasses : inactiveClasses}`}>
                            <StethoscopeIcon className="w-4 h-4 mr-2" /> Doctors
                        </button>
                        <button onClick={() => { setCurrentView('dashboard'); setActiveDashboardTab('medicines'); }} className={`${navButtonClasses} ${currentView === 'dashboard' && activeDashboardTab === 'medicines' ? activeClasses : inactiveClasses}`}>
                            <PillIcon className="w-4 h-4 mr-2" /> Medicines
                        </button>
                        <button onClick={() => { setCurrentView('dashboard'); setActiveDashboardTab('labTests'); }} className={`${navButtonClasses} ${currentView === 'dashboard' && activeDashboardTab === 'labTests' ? activeClasses : inactiveClasses}`}>
                            <TestTubeIcon className="w-4 h-4 mr-2" /> Lab Tests
                        </button>
                        <button onClick={() => { setCurrentView('dashboard'); setActiveDashboardTab('appointments'); }} className={`${navButtonClasses} ${currentView === 'dashboard' && activeDashboardTab === 'appointments' ? activeClasses : inactiveClasses}`}>
                            <CalendarIcon className="w-4 h-4 mr-2" /> Appointments
                        </button>
                        <button onClick={() => { setCurrentView('dashboard'); setActiveDashboardTab('logs'); }} className={`${navButtonClasses} ${currentView === 'dashboard' && activeDashboardTab === 'logs' ? activeClasses : inactiveClasses}`}>
                            <ActivityIcon className="w-4 h-4 mr-2" /> System Logs
                        </button>
                    </>
                ) : user.role === 'owner' ? (
                     <>
                        <button onClick={() => { setCurrentView('ownerDashboard'); setActiveDashboardTab('overview'); }} className={`${navButtonClasses} ${currentView === 'ownerDashboard' && activeDashboardTab === 'overview' ? activeClasses : inactiveClasses}`}>
                             <HomeIcon className="w-4 h-4 mr-2" /> Overview
                        </button>
                        <button onClick={() => { setCurrentView('ownerDashboard'); setActiveDashboardTab('medicineOrders'); }} className={`${navButtonClasses} ${currentView === 'ownerDashboard' && activeDashboardTab === 'medicineOrders' ? activeClasses : inactiveClasses}`}>
                            <ShoppingBagIcon className="w-4 h-4 mr-2" /> Medicine Orders
                        </button>
                        <button onClick={() => { setCurrentView('ownerDashboard'); setActiveDashboardTab('testBookings'); }} className={`${navButtonClasses} ${currentView === 'ownerDashboard' && activeDashboardTab === 'testBookings' ? activeClasses : inactiveClasses}`}>
                            <BeakerIcon className="w-4 h-4 mr-2" /> Test Bookings
                        </button>
                        <button onClick={() => { setCurrentView('ownerDashboard'); setActiveDashboardTab('users'); }} className={`${navButtonClasses} ${currentView === 'ownerDashboard' && activeDashboardTab === 'users' ? activeClasses : inactiveClasses}`}>
                             <UsersIcon className="w-4 h-4 mr-2" /> Patients
                        </button>
                        <button onClick={() => { setCurrentView('ownerDashboard'); setActiveDashboardTab('doctors'); }} className={`${navButtonClasses} ${currentView === 'ownerDashboard' && activeDashboardTab === 'doctors' ? activeClasses : inactiveClasses}`}>
                             <StethoscopeIcon className="w-4 h-4 mr-2" /> Doctors
                        </button>
                        <button onClick={() => { setCurrentView('ownerDashboard'); setActiveDashboardTab('medicines'); }} className={`${navButtonClasses} ${currentView === 'ownerDashboard' && activeDashboardTab === 'medicines' ? activeClasses : inactiveClasses}`}>
                            <PillIcon className="w-4 h-4 mr-2" /> Medicines
                        </button>
                        <button onClick={() => { setCurrentView('ownerDashboard'); setActiveDashboardTab('labTests'); }} className={`${navButtonClasses} ${currentView === 'ownerDashboard' && activeDashboardTab === 'labTests' ? activeClasses : inactiveClasses}`}>
                            <TestTubeIcon className="w-4 h-4 mr-2" /> Lab Tests
                        </button>
                        <button onClick={() => { setCurrentView('ownerDashboard'); setActiveDashboardTab('appointments'); }} className={`${navButtonClasses} ${currentView === 'ownerDashboard' && activeDashboardTab === 'appointments' ? activeClasses : inactiveClasses}`}>
                             <CalendarIcon className="w-4 h-4 mr-2" /> Appointments
                        </button>
                        <button onClick={() => { setCurrentView('ownerDashboard'); setActiveDashboardTab('logs'); }} className={`${navButtonClasses} ${currentView === 'ownerDashboard' && activeDashboardTab === 'logs' ? activeClasses : inactiveClasses}`}>
                             <ActivityIcon className="w-4 h-4 mr-2" /> System Logs
                        </button>
                    </>
                ) : null}
              </nav>
              <ThemeToggle />
              
              <div className="relative" ref={menuRef}>
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center space-x-2 pr-2 pl-1.5 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                    {user.profileImageUrl ? (
                        <img src={user.profileImageUrl} alt="Profile" className="w-7 h-7 rounded-full object-cover" />
                    ) : (
                        <div className="w-7 h-7 bg-teal-200 dark:bg-teal-900 rounded-full flex items-center justify-center text-teal-700 dark:text-teal-200">
                           <UserIcon className="w-5 h-5" />
                        </div>
                    )}
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200 hidden sm:block">
                      {user.role === 'patient' ? user.firstName : user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                    <ChevronDownIcon className={`w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-20 border dark:border-gray-700 animate-fade-in-fast">
                        <button
                            onClick={() => { setCurrentView('profile'); setIsMenuOpen(false); }}
                            className={`flex items-center w-full text-left px-4 py-2 text-sm ${currentView === 'profile' ? 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-200' : 'text-gray-700 dark:text-gray-300'} hover:bg-gray-100 dark:hover:bg-gray-700`}
                        >
                            <UserIcon className="w-4 h-4 mr-3" />
                            My Profile
                        </button>
                         <button
                            onClick={() => { setCurrentView('orderHistory'); setIsMenuOpen(false); }}
                            className={`flex items-center w-full text-left px-4 py-2 text-sm ${currentView === 'orderHistory' ? 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-200' : 'text-gray-700 dark:text-gray-300'} hover:bg-gray-100 dark:hover:bg-gray-700`}
                        >
                            <ArchiveIcon className="w-4 h-4 mr-3" />
                            Order History
                        </button>
                        <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                        <button
                            onClick={() => { logout(); setIsMenuOpen(false); }}
                            className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                            <LogOutIcon className="w-4 h-4 mr-3" />
                            Logout
                        </button>
                    </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
       <style>{`
            @keyframes fade-in-fast {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in-fast { animation: fade-in-fast 0.2s ease-out forwards; }
        `}</style>
    </header>
  );
};

export default Header;
