import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';
import { ShoppingBagIcon, TestTubeIcon, StethoscopeIcon, FileTextIcon, UserIcon, ChevronDownIcon, LogOutIcon, LogInIcon, HomeIcon, TruckIcon, PillIcon, UsersIcon, CalendarIcon, ActivityIcon, BeakerIcon, MenuIcon, XIcon, BellIcon, ClockIcon, ClipboardCheckIcon } from './IconComponents';
import WeatherWidget from './WeatherWidget';
import ThemeToggle from './ThemeToggle';
import { Appointment } from '../types';


interface HeaderProps {
  currentView: string;
  setCurrentView: (view: 'search' | 'dashboard' | 'ownerDashboard' | 'pharmacy' | 'labTests' | 'appointmentHistory' | 'profile' | 'orderHistory') => void;
  activeDashboardTab: string;
  setActiveDashboardTab: (tab: string) => void;
  notifications: Appointment[];
  onDismissNotification: (id: number) => void;
  onDismissAllNotifications: () => void;
  activeOrderHistoryTab: 'medicines' | 'labTests';
  setActiveOrderHistoryTab: (tab: 'medicines' | 'labTests') => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView, activeDashboardTab, setActiveDashboardTab, notifications, onDismissNotification, onDismissAllNotifications, activeOrderHistoryTab, setActiveOrderHistoryTab }) => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  const menuRef = useRef<HTMLDivElement>(null);
  const desktopNotificationRef = useRef<HTMLDivElement>(null);
  const mobileNotificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) {
        setIsMenuOpen(false);
      }
      if (
        isNotificationsOpen &&
        desktopNotificationRef.current && !desktopNotificationRef.current.contains(target) &&
        mobileNotificationRef.current && !mobileNotificationRef.current.contains(target)
      ) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isNotificationsOpen]);
  
  const mobileNavButtonClasses = "w-full text-left px-4 py-3 rounded-md text-base transition-colors flex items-center";
  const mobileActiveClasses = "bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-200";
  const mobileInactiveClasses = "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700";

  const navButtonClasses = "px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center";
  const activeClasses = "bg-teal-600 text-white shadow-md";
  const inactiveClasses = "text-gray-600 hover:bg-teal-100 hover:text-teal-700 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white";

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
                        <FileTextIcon className="w-4 h-4 mr-2" /> Appointments
                      </button>
                      <button
                        onClick={() => { setCurrentView('orderHistory'); setActiveOrderHistoryTab('medicines'); }}
                        className={`${navButtonClasses} ${currentView === 'orderHistory' && activeOrderHistoryTab === 'medicines' ? activeClasses : inactiveClasses}`}
                      >
                        <ShoppingBagIcon className="w-4 h-4 mr-2" /> Medicine Orders
                      </button>
                      <button
                        onClick={() => { setCurrentView('orderHistory'); setActiveOrderHistoryTab('labTests'); }}
                        className={`${navButtonClasses} ${currentView === 'orderHistory' && activeOrderHistoryTab === 'labTests' ? activeClasses : inactiveClasses}`}
                      >
                        <TestTubeIcon className="w-4 h-4 mr-2" /> Test Bookings
                      </button>
                       <button
                        onClick={() => setCurrentView('labTests')}
                        className={`${navButtonClasses} ${currentView === 'labTests' ? activeClasses : inactiveClasses}`}
                      >
                        <BeakerIcon className="w-4 h-4 mr-2" /> Book a Test
                      </button>
                       <button
                        onClick={() => setCurrentView('pharmacy')}
                        className={`${navButtonClasses} ${currentView === 'pharmacy' ? activeClasses : inactiveClasses}`}
                      >
                        <PillIcon className="w-4 h-4 mr-2" /> Pharmacy
                      </button>
                    </>
                ) : null}
              </nav>

              <div className="hidden lg:flex items-center space-x-2">
                <ThemeToggle />
                
                {/* Notification Bell */}
                <div className="relative" ref={desktopNotificationRef}>
                    <button 
                        onClick={() => setIsNotificationsOpen(o => !o)} 
                        className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full relative"
                        aria-label={notifications.length > 0 ? `View ${notifications.length} new notifications` : 'View notifications'}
                    >
                        <BellIcon className="w-6 h-6"/>
                        {notifications.length > 0 && (
                            <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-800"></span>
                        )}
                    </button>
                    {isNotificationsOpen && (
                        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg z-20 border dark:border-gray-700 animate-fade-in-fast">
                            <div className="p-3 border-b dark:border-gray-700 flex justify-between items-center">
                                <h3 className="font-semibold text-gray-800 dark:text-gray-100">Notifications</h3>
                                {notifications.length > 0 && (
                                    <button 
                                      onClick={() => { onDismissAllNotifications(); setIsNotificationsOpen(false); }} 
                                      className="text-xs font-medium text-teal-600 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300"
                                      aria-label="Dismiss all notifications"
                                    >
                                        Dismiss all
                                    </button>
                                )}
                            </div>
                            <div className="max-h-80 overflow-y-auto">
                                {notifications.length > 0 ? (
                                    notifications.map(appt => (
                                        <div key={appt.id} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-start space-x-3">
                                            <div className="flex-shrink-0 pt-1">
                                                <ClipboardCheckIcon className="w-5 h-5 text-teal-500"/>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-700 dark:text-gray-200">
                                                    Reminder: Appointment with <span className="font-semibold">{appt.doctor_name}</span> at {appt.appointment_time}.
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                                                    <ClockIcon className="w-3 h-3 mr-1"/>
                                                    {new Date(appt.appointment_date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                                                </p>
                                            </div>
                                            <button onClick={() => onDismissNotification(appt.id)} className="p-1 -mr-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                                <XIcon className="w-4 h-4"/>
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-6">No new notifications.</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Mobile Menu Button */}
                <div className="lg:hidden flex items-center">
                   {/* Mobile Notification Bell */}
                    <div className="relative" ref={mobileNotificationRef}>
                        <button onClick={() => setIsNotificationsOpen(o => !o)} className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full relative" aria-label={`View ${notifications.length} notifications`}>
                            <BellIcon className="w-6 h-6"/>
                            {notifications.length > 0 && (
                                <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-800"></span>
                            )}
                        </button>
                         {isNotificationsOpen && (
                            <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-md shadow-lg z-20 border dark:border-gray-700">
                                <div className="p-3 border-b dark:border-gray-700 flex justify-between items-center">
                                    <h3 className="font-semibold text-gray-800 dark:text-gray-100">Notifications</h3>
                                    {notifications.length > 0 && (
                                        <button 
                                          onClick={() => { onDismissAllNotifications(); setIsNotificationsOpen(false); }} 
                                          className="text-xs font-medium text-teal-600 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300"
                                          aria-label="Dismiss all notifications"
                                        >
                                            Dismiss all
                                        </button>
                                    )}
                                </div>
                                <div className="max-h-60 overflow-y-auto">
                                    {notifications.length > 0 ? (
                                        notifications.map(appt => (
                                            <div key={appt.id} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-start space-x-3">
                                                <div className="flex-shrink-0 pt-1">
                                                    <ClipboardCheckIcon className="w-5 h-5 text-teal-500"/>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm text-gray-700 dark:text-gray-200">
                                                        Reminder: Appt with <span className="font-semibold">{appt.doctor_name}</span> at {appt.appointment_time}.
                                                    </p>
                                                </div>
                                                <button onClick={() => onDismissNotification(appt.id)} className="p-1 -mr-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                                    <XIcon className="w-4 h-4"/>
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-6">No notifications.</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                  <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <span className="sr-only">Open main menu</span>
                    {isMobileMenuOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
                  </button>
                </div>

                 <div className="hidden lg:flex items-center space-x-4" ref={menuRef}>
                  <div className="relative">
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                      {user.profileImageUrl ? (
                        <img className="h-8 w-8 rounded-full object-cover" src={user.profileImageUrl} alt="User profile" />
                      ) : (
                         <span className="h-8 w-8 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-600 dark:text-teal-300 flex items-center justify-center font-bold text-sm">
                            {`${user.firstName.charAt(0)}${user.lastName.charAt(0)}`}
                         </span>
                      )}
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden md:inline">{user.firstName} {user.lastName}</span>
                      <ChevronDownIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </button>
                    {isMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border dark:border-gray-700">
                        <div className="py-1">
                          <button onClick={() => { setCurrentView('profile'); setIsMenuOpen(false); }} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"><UserIcon className="w-4 h-4 mr-2" /> My Profile</button>
                           {(user.role === 'admin' || user.role === 'owner') && (
                                <>
                                <button onClick={() => { setCurrentView(user.role === 'admin' ? 'dashboard' : 'ownerDashboard'); setActiveDashboardTab('overview'); setIsMenuOpen(false); }} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"><ActivityIcon className="w-4 h-4 mr-2" /> Dashboard</button>
                                </>
                            )}
                          <button onClick={logout} className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/50"><LogOutIcon className="w-4 h-4 mr-2" /> Logout</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}
          {!user && (
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <button onClick={() => {}} className={`${navButtonClasses} ${inactiveClasses}`}>
                <LogInIcon className="w-4 h-4 mr-2" /> Sign In
              </button>
            </div>
          )}
        </div>
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 space-y-2 border-t border-gray-200 dark:border-gray-700">
            {user.role === 'patient' && (
                <>
                    <button onClick={() => { setCurrentView('search'); setIsMobileMenuOpen(false); }} className={`${mobileNavButtonClasses} ${currentView === 'search' ? mobileActiveClasses : mobileInactiveClasses}`}><HomeIcon className="w-5 h-5 mr-3"/>Home</button>
                    <button onClick={() => { setCurrentView('appointmentHistory'); setIsMobileMenuOpen(false); }} className={`${mobileNavButtonClasses} ${currentView === 'appointmentHistory' ? mobileActiveClasses : mobileInactiveClasses}`}><FileTextIcon className="w-5 h-5 mr-3"/>My Appointments</button>
                    <button onClick={() => { setCurrentView('orderHistory'); setActiveOrderHistoryTab('medicines'); setIsMobileMenuOpen(false); }} className={`${mobileNavButtonClasses} ${currentView === 'orderHistory' && activeOrderHistoryTab === 'medicines' ? mobileActiveClasses : mobileInactiveClasses}`}><ShoppingBagIcon className="w-5 h-5 mr-3"/>Medicine Orders</button>
                    <button onClick={() => { setCurrentView('orderHistory'); setActiveOrderHistoryTab('labTests'); setIsMobileMenuOpen(false); }} className={`${mobileNavButtonClasses} ${currentView === 'orderHistory' && activeOrderHistoryTab === 'labTests' ? mobileActiveClasses : mobileInactiveClasses}`}><TestTubeIcon className="w-5 h-5 mr-3"/>Test Bookings</button>
                    <button onClick={() => { setCurrentView('pharmacy'); setIsMobileMenuOpen(false); }} className={`${mobileNavButtonClasses} ${currentView === 'pharmacy' ? mobileActiveClasses : mobileInactiveClasses}`}><PillIcon className="w-5 h-5 mr-3"/>Pharmacy</button>
                    <button onClick={() => { setCurrentView('labTests'); setIsMobileMenuOpen(false); }} className={`${mobileNavButtonClasses} ${currentView === 'labTests' ? mobileActiveClasses : mobileInactiveClasses}`}><BeakerIcon className="w-5 h-5 mr-3"/>Book a Lab Test</button>
                </>
            )}
             {(user.role === 'admin' || user.role === 'owner') && (
                 <button onClick={() => { setCurrentView(user.role === 'admin' ? 'dashboard' : 'ownerDashboard'); setIsMobileMenuOpen(false); }} className={`${mobileNavButtonClasses} ${currentView.includes('Dashboard') ? mobileActiveClasses : mobileInactiveClasses}`}><ActivityIcon className="w-5 h-5 mr-3"/>Dashboard</button>
            )}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                <button onClick={() => { setCurrentView('profile'); setIsMobileMenuOpen(false); }} className={`${mobileNavButtonClasses} ${currentView === 'profile' ? mobileActiveClasses : mobileInactiveClasses}`}><UserIcon className="w-5 h-5 mr-3"/>My Profile</button>
                <button onClick={logout} className={`${mobileNavButtonClasses} text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/50`}><LogOutIcon className="w-5 h-5 mr-3"/>Logout</button>
                <div className="px-4 py-2"><ThemeToggle /></div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;