
import React from 'react';
import Logo from './Logo';

interface WelcomeModalProps {
  onClose: () => void;
  userName: string;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ onClose, userName }) => {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 transition-opacity duration-300" 
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-labelledby="welcome-title"
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-md transform transition-all text-center animate-fade-in-up" 
        onClick={(e) => e.stopPropagation()}
      >
        <Logo className="h-24 mx-auto mb-4" />
        <h2 id="welcome-title" className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">Welcome, {userName}!</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          We're glad to have you at Bihar Health Connect. Find doctors, book lab tests, and order medicines with ease.
        </p>
        <button
          onClick={onClose}
          className="px-8 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
        >
          Get Started
        </button>
      </div>
      <style>{`
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default WelcomeModal;
