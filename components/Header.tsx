
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';
import { ShoppingBagIcon, TestTubeIcon, StethoscopeIcon, FileTextIcon, UserIcon, ChevronDownIcon, ArchiveIcon, LogOutIcon, HomeIcon, TruckIcon, PillIcon, UsersIcon, CalendarIcon, ActivityIcon, BeakerIcon, MenuIcon, XIcon } from './IconComponents';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
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
  
  const mobileNavButtonClasses = "w-full text-left px-4 py-3 rounded-md text-base transition-colors flex items-center";
  const mobileActiveClasses = "bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-200";
  const mobileInactiveClasses = "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700";


  return (
    <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-40 transition-colors duration-300">
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
                        <HomeIcon className="w-4 h-4 mr-2" /> Home
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
                            <HomeIcon className="w-4 h-4 mr-2" /> Overview
                        </button>
                        <button onClick={() => setCurrentView('search')} className={`${navButtonClasses} ${currentView === 'search' ? activeClasses : inactiveClasses}`}>
                            <UsersIcon className="w-4 h-4 mr-2" /> Patient View
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
                        <button onClick={() => setCurrentView('search')} className={`${navButtonClasses} ${currentView === 'search' ? activeClasses : inactiveClasses}`}>
                            <UsersIcon className="w-4 h-4 mr-2" /> Patient View
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

              <div className="hidden lg:flex items-center space-x-2">
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
              
              {/* Mobile Menu Button */}
              <div className="lg:hidden">
                  <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                      <MenuIcon className="w-6 h-6"/>
                  </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && user && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" onClick={() => setIsMobileMenuOpen(false)}></div>
            <div className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white dark:bg-gray-800 shadow-xl animate-slide-in-right">
                <div className="p-4 flex justify-between items-center border-b dark:border-gray-700">
                    <Logo className="h-10" />
                    <div className="flex items-center space-x-2">
                        <ThemeToggle />
                        <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-600 dark:text-gray-300">
                            <XIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
                <nav className="p-4 flex flex-col h-full">
                    <div className="space-y-2 overflow-y-auto">
                         {user.role === 'patient' && (
                            <>
                                <button onClick={() => { setCurrentView('search'); setIsMobileMenuOpen(false); }} className={`${mobileNavButtonClasses} ${currentView === 'search' ? mobileActiveClasses : mobileInactiveClasses}`}><HomeIcon className="w-5 h-5 mr-3" /> Home</button>
                                <button onClick={() => { setCurrentView('appointmentHistory'); setIsMobileMenuOpen(false); }} className={`${mobileNavButtonClasses} ${currentView === 'appointmentHistory' ? mobileActiveClasses : mobileInactiveClasses}`}><FileTextIcon className="w-5 h-5 mr-3" /> My Appointments</button>
                                <button onClick={() => { setCurrentView('labTests'); setIsMobileMenuOpen(false); }} className={`${mobileNavButtonClasses} ${currentView === 'labTests' ? mobileActiveClasses : mobileInactiveClasses}`}><TestTubeIcon className="w-5 h-5 mr-3" /> Lab Tests</button>
                                <button onClick={() => { setCurrentView('pharmacy'); setIsMobileMenuOpen(false); }} className={`${mobileNavButtonClasses} ${currentView === 'pharmacy' ? mobileActiveClasses : mobileInactiveClasses}`}><ShoppingBagIcon className="w-5 h-5 mr-3" /> Pharmacy</button>
                            </>
                        )}
                        {user.role === 'admin' && (
                            <>
                                <button onClick={() => { setCurrentView('search'); setIsMobileMenuOpen(false); }} className={`${mobileNavButtonClasses} ${currentView === 'search' ? mobileActiveClasses : mobileInactiveClasses}`}><UsersIcon className="w-5 h-5 mr-3" /> Patient View</button>
                                <button onClick={() => { setCurrentView('dashboard'); setActiveDashboardTab('overview'); setIsMobileMenuOpen(false); }} className={`${mobileNavButtonClasses} ${currentView === 'dashboard' ? mobileActiveClasses : mobileInactiveClasses}`}><ActivityIcon className="w-5 h-5 mr-3"/> Admin Panel</button>
                                
                                <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                                    <h3 className="px-4 mb-2 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 tracking-wider">Dashboard Sections</h3>
                                    <div className="space-y-1">
                                        <button onClick={() => { setCurrentView('dashboard'); setActiveDashboardTab('overview'); setIsMobileMenuOpen(false); }} className={`${mobileNavButtonClasses} ${currentView === 'dashboard' && activeDashboardTab === 'overview' ? mobileActiveClasses : mobileInactiveClasses}`}><HomeIcon className="w-5 h-5 mr-3"/> Overview</button>
                                        <button onClick={() => { setCurrentView('dashboard'); setActiveDashboardTab('medicineOrders'); setIsMobileMenuOpen(false); }} className={`${mobileNavButtonClasses} ${currentView === 'dashboard' && activeDashboardTab === 'medicineOrders' ? mobileActiveClasses : mobileInactiveClasses}`}><ShoppingBagIcon className="w-5 h-5 mr-3"/> Medicine Orders</button>
                                        <button onClick={() => { setCurrentView('dashboard'); setActiveDashboardTab('testBookings'); setIsMobileMenuOpen(false); }} className={`${mobileNavButtonClasses} ${currentView === 'dashboard' && activeDashboardTab === 'testBookings' ? mobileActiveClasses : mobileInactiveClasses}`}><BeakerIcon className="w-5 h-5 mr-3"/> Test Bookings</button>
                                        <button onClick={() => { setCurrentView('dashboard'); setActiveDashboardTab('patients'); setIsMobileMenuOpen(false); }} className={`${mobileNavButtonClasses} ${currentView === 'dashboard' && activeDashboardTab === 'patients' ? mobileActiveClasses : mobileInactiveClasses}`}><UsersIcon className="w-5 h-5 mr-3"/> Patients</button>
                                        <button onClick={() => { setCurrentView('dashboard'); setActiveDashboardTab('doctors'); setIsMobileMenuOpen(false); }} className={`${mobileNavButtonClasses} ${currentView === 'dashboard' && activeDashboardTab === 'doctors' ? mobileActiveClasses : mobileInactiveClasses}`}><StethoscopeIcon className="w-5 h-5 mr-3"/> Doctors</button>
                                        <button onClick={() => { setCurrentView('dashboard'); setActiveDashboardTab('medicines'); setIsMobileMenuOpen(false); }} className={`${mobileNavButtonClasses} ${currentView === 'dashboard' && activeDashboardTab === 'medicines' ? mobileActiveClasses : mobileInactiveClasses}`}><PillIcon className="w-5 h-5 mr-3"/> Medicines</button>
                                        <button onClick={() => { setCurrentView('dashboard'); setActiveDashboardTab('labTests'); setIsMobileMenuOpen(false); }} className={`${mobileNavButtonClasses} ${currentView === 'dashboard' && activeDashboardTab === 'labTests' ? mobileActiveClasses : mobileInactiveClasses}`}><TestTubeIcon className="w-5 h-5 mr-3"/> Lab Tests</button>
                                        <button onClick={() => { setCurrentView('dashboard'); setActiveDashboardTab('appointments'); setIsMobileMenuOpen(false); }} className={`${mobileNavButtonClasses} ${currentView === 'dashboard' && activeDashboardTab === 'appointments' ? mobileActiveClasses : mobileInactiveClasses}`}><CalendarIcon className="w-5 h-5 mr-3"/> Appointments</button>
                                        <button onClick={() => { setCurrentView('dashboard'); setActiveDashboardTab('logs'); setIsMobileMenuOpen(false); }} className={`${mobileNavButtonClasses} ${currentView === 'dashboard' && activeDashboardTab === 'logs' ? mobileActiveClasses : mobileInactiveClasses}`}><ActivityIcon className="w-5 h-5 mr-3"/> System Logs</button>
                                    </div>
                                </div>
                            </>
                        )}
                        {user.role === 'owner' && (
                             <>
                                <button onClick={() => { setCurrentView('search'); setIsMobileMenuOpen(false); }} className={`${mobileNavButtonClasses} ${currentView === 'search' ? mobileActiveClasses : mobileInactiveClasses}`}><UsersIcon className="w-5 h-5 mr-3" /> Patient View</button>
                                <button onClick={() => { setCurrentView('ownerDashboard'); setActiveDashboardTab('overview'); setIsMobileMenuOpen(false); }} className={`${mobileNavButtonClasses} ${currentView === 'ownerDashboard' ? mobileActiveClasses : mobileInactiveClasses}`}><ActivityIcon className="w-5 h-5 mr-3"/> Admin Panel</button>
                                
                                <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                                    <h3 className="px-4 mb-2 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 tracking-wider">Dashboard Sections</h3>
                                    <div className="space-y-1">
                                        <button onClick={() => { setCurrentView('ownerDashboard'); setActiveDashboardTab('overview'); setIsMobileMenuOpen(false); }} className={`${mobileNavButtonClasses} ${currentView === 'ownerDashboard' && activeDashboardTab === 'overview' ? mobileActiveClasses : mobileInactiveClasses}`}><HomeIcon className="w-5 h-5 mr-3"/> Overview</button>
                                        <button onClick={() => { setCurrentView('ownerDashboard'); setActiveDashboardTab('medicineOrders'); setIsMobileMenuOpen(false); }} className={`${mobileNavButtonClasses} ${currentView === 'ownerDashboard' && activeDashboardTab === 'medicineOrders' ? mobileActiveClasses : mobileInactiveClasses}`}><ShoppingBagIcon className="w-5 h-5 mr-3"/> Medicine Orders</button>
                                        <button onClick={() => { setCurrentView('ownerDashboard'); setActiveDashboardTab('testBookings'); setIsMobileMenuOpen(false); }} className={`${mobileNavButtonClasses} ${currentView === 'ownerDashboard' && activeDashboardTab === 'testBookings' ? mobileActiveClasses : mobileInactiveClasses}`}><BeakerIcon className="w-5 h-5 mr-3"/> Test Bookings</button>
                                        <button onClick={() => { setCurrentView('ownerDashboard'); setActiveDashboardTab('users'); setIsMobileMenuOpen(false); }} className={`${mobileNavButtonClasses} ${currentView === 'ownerDashboard' && activeDashboardTab === 'users' ? mobileActiveClasses : mobileInactiveClasses}`}><UsersIcon className="w-5 h-5 mr-3"/> Patients</button>
                                        <button onClick={() => { setCurrentView('ownerDashboard'); setActiveDashboardTab('doctors'); setIsMobileMenuOpen(false); }} className={`${mobileNavButtonClasses} ${currentView === 'ownerDashboard' && activeDashboardTab === 'doctors' ? mobileActiveClasses : mobileInactiveClasses}`}><StethoscopeIcon className="w-5 h-5 mr-3"/> Doctors</button>
                                        <button onClick={() => { setCurrentView('ownerDashboard'); setActiveDashboardTab('medicines'); setIsMobileMenuOpen(false); }} className={`${mobileNavButtonClasses} ${currentView === 'ownerDashboard' && activeDashboardTab === 'medicines' ? mobileActiveClasses : mobileInactiveClasses}`}><PillIcon className="w-5 h-5 mr-3"/> Medicines</button>
                                        <button onClick={() => { setCurrentView('ownerDashboard'); setActiveDashboardTab('labTests'); setIsMobileMenuOpen(false); }} className={`${mobileNavButtonClasses} ${currentView === 'ownerDashboard' && activeDashboardTab === 'labTests' ? mobileActiveClasses : mobileInactiveClasses}`}><TestTubeIcon className="w-5 h-5 mr-3"/> Lab Tests</button>
                                        <button onClick={() => { setCurrentView('ownerDashboard'); setActiveDashboardTab('appointments'); setIsMobileMenuOpen(false); }} className={`${mobileNavButtonClasses} ${currentView === 'ownerDashboard' && activeDashboardTab === 'appointments' ? mobileActiveClasses : mobileInactiveClasses}`}><CalendarIcon className="w-5 h-5 mr-3"/> Appointments</button>
                                        <button onClick={() => { setCurrentView('ownerDashboard'); setActiveDashboardTab('logs'); setIsMobileMenuOpen(false); }} className={`${mobileNavButtonClasses} ${currentView === 'ownerDashboard' && activeDashboardTab === 'logs' ? mobileActiveClasses : mobileInactiveClasses}`}><ActivityIcon className="w-5 h-5 mr-3"/> System Logs</button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                    <div className="mt-auto pt-4 border-t dark:border-gray-700 space-y-2">
                        <button onClick={() => { setCurrentView('profile'); setIsMobileMenuOpen(false); }} className={`${mobileNavButtonClasses} ${currentView === 'profile' ? mobileActiveClasses : mobileInactiveClasses}`}><UserIcon className="w-5 h-5 mr-3" /> My Profile</button>
                        <button onClick={() => { setCurrentView('orderHistory'); setIsMobileMenuOpen(false); }} className={`${mobileNavButtonClasses} ${currentView === 'orderHistory' ? mobileActiveClasses : mobileInactiveClasses}`}><ArchiveIcon className="w-5 h-5 mr-3" /> Order History</button>
                        <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-md text-base flex items-center text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"><LogOutIcon className="w-5 h-5 mr-3" /> Logout</button>
                    </div>
                </nav>
            </div>
        </div>
      )}

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
