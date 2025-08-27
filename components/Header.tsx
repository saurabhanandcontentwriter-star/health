
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';
import { ShoppingBagIcon, TestTubeIcon, StethoscopeIcon, FileTextIcon } from './IconComponents';
import WeatherWidget from './WeatherWidget';

interface HeaderProps {
  currentView: string;
  setCurrentView: (view: 'search' | 'dashboard' | 'ownerDashboard' | 'pharmacy' | 'labTests' | 'appointmentHistory') => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView }) => {
  const { user, logout } = useAuth();
  const navButtonClasses = "px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center";
  const activeClasses = "bg-teal-600 text-white shadow-md";
  const inactiveClasses = "text-gray-600 hover:bg-teal-100 hover:text-teal-700";

  return (
    <header className="bg-white shadow-md sticky top-0 z-10">
      <WeatherWidget />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <Logo className="h-12" />
          </div>
          {user && (
            <div className="flex items-center space-x-4">
               {user.role !== 'patient' && <span className="text-xs capitalize text-gray-500 hidden sm:block">({user.role})</span>}
              <nav className="flex items-center space-x-2">
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
                {user.role === 'owner' && (
                   <button
                      onClick={() => setCurrentView('ownerDashboard')}
                      className={`${navButtonClasses} ${currentView === 'ownerDashboard' ? activeClasses : inactiveClasses}`}
                    >
                      Dashboard
                    </button>
                )}
                {user.role === 'admin' && (
                  <button
                    onClick={() => setCurrentView('dashboard')}
                    className={`${navButtonClasses} ${currentView === 'dashboard' ? activeClasses : inactiveClasses}`}
                  >
                    Dashboard
                  </button>
                )}
              </nav>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
