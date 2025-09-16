import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import * as db from '../services/dbService';
import Logo from './Logo';
import { RefreshCwIcon, XCircleIcon } from './IconComponents';


const LoginForm: React.FC<{ isAdmin?: boolean }> = ({ isAdmin = false }) => {
    const { login } = useAuth();
    const [phone, setPhone] = useState(isAdmin ? '1111111111' : '');
    const [otp, setOtp] = useState('');
    const [generatedOtp, setGeneratedOtp] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState<'entry' | 'otp'>('entry');
    const [captcha, setCaptcha] = useState({ question: '', answer: 0 });
    const [captchaInput, setCaptchaInput] = useState('');

    const generateCaptcha = useCallback(() => {
        const num1 = Math.floor(Math.random() * 10) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        setCaptcha({
            question: `${num1} + ${num2}`,
            answer: num1 + num2
        });
        setCaptchaInput('');
    }, []);

    useEffect(() => {
        generateCaptcha();
    }, [generateCaptcha]);

    useEffect(() => {
        if (step === 'otp' && generatedOtp) {
            setOtp(generatedOtp);
        }
    }, [step, generatedOtp]);

    const handleGetOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // --- Phone Number Verification Step ---
        // Before generating an OTP, we verify the phone number against several checks.

        // 1. Validate input format and captcha
        if (!/^\d{10}$/.test(phone)) {
            setError('Please enter a valid 10-digit phone number.');
            return;
        }

        if (parseInt(captchaInput, 10) !== captcha.answer) {
            setError('Incorrect captcha answer. Please try again.');
            generateCaptcha();
            return;
        }

        setIsLoading(true);
        
        // 2. Check if the user exists in the database
        const user = db.getUserByPhone(phone);

        if (!user) {
            setError(isAdmin ? 'No admin or owner account found with this number.' : 'Account does not exist. Please create an account.');
            setIsLoading(false);
            return;
        }

        // 3. For admin portal, ensure the user has the correct role
        if (isAdmin && user.role === 'patient') {
            setError('This phone number does not belong to an admin or owner account.');
            setIsLoading(false);
            return;
        }
        
        // If all checks pass, proceed to simulate OTP generation
        const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOtp(newOtp);
        setStep('otp');
        setIsLoading(false);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (otp !== generatedOtp) {
            setError('Invalid OTP. Please try again.');
            return;
        }
        setIsLoading(true);
        try {
            await login(phone);
        } catch (err: any) {
            setError(err.message || "An unknown error occurred.");
            setIsLoading(false);
        }
    };
    
    if (step === 'entry') {
        return (
            <form onSubmit={handleGetOtp} className="space-y-6">
                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                    <input type="tel" id="phone" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Enter your 10-digit phone number" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" required />
                </div>

                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-1 dark:bg-gray-700 dark:border-gray-600">
                    <label htmlFor="captcha-login" className="block text-xs font-medium text-gray-700 dark:text-gray-300">Security Check</label>
                    <div className="flex items-center space-x-2">
                        <span className="p-2 bg-gray-200 text-gray-800 rounded-md font-mono text-sm dark:bg-gray-600 dark:text-gray-200">{captcha.question} = ?</span>
                        <input
                            type="number"
                            id="captcha-login"
                            value={captchaInput}
                            onChange={e => setCaptchaInput(e.target.value)}
                            className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm w-20 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                            placeholder="Answer"
                            required
                        />
                        <button type="button" onClick={generateCaptcha} className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" aria-label="Refresh captcha">
                            <RefreshCwIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-lg flex items-center text-sm text-red-700 dark:text-red-300">
                        <XCircleIcon className="w-5 h-5 mr-3 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-teal-400 disabled:cursor-not-allowed">
                    {isLoading ? 'Sending OTP...' : 'Get OTP'}
                </button>
            </form>
        );
    }

    return (
        <form onSubmit={handleLogin} className="space-y-6">
            <div>
                <label htmlFor="phone-display" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                <input type="tel" id="phone-display" value={phone} className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300" disabled />
            </div>
            <div className="p-3 bg-blue-100 border-l-4 border-blue-400 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-500/50 text-center">
                <p className="text-sm">For simulation, the OTP has been auto-filled.</p>
                <p className="text-xs">In a real app, you would receive this via SMS.</p>
            </div>
             <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Enter OTP</label>
                <input type="text" id="otp" value={otp} onChange={e => setOtp(e.target.value)} placeholder="Enter the 6-digit OTP" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" required />
            </div>

            {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-lg flex items-center text-sm text-red-700 dark:text-red-300">
                    <XCircleIcon className="w-5 h-5 mr-3 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-teal-400 disabled:cursor-not-allowed">
                {isLoading ? 'Verifying...' : 'Verify & Sign In'}
            </button>
            <button type="button" onClick={() => { setStep('entry'); setError(''); }} className="w-full text-center text-sm text-gray-600 hover:text-teal-600 dark:text-gray-400 dark:hover:text-teal-500">
                Change phone number
            </button>
        </form>
    );
};

const SignupForm: React.FC = () => {
    const { signup } = useAuth();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [generatedOtp, setGeneratedOtp] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState<'entry' | 'otp'>('entry');
    const [captcha, setCaptcha] = useState({ question: '', answer: 0 });
    const [captchaInput, setCaptchaInput] = useState('');

    const generateCaptcha = useCallback(() => {
        const num1 = Math.floor(Math.random() * 10) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        setCaptcha({
            question: `${num1} + ${num2}`,
            answer: num1 + num2
        });
        setCaptchaInput('');
    }, []);

    useEffect(() => {
        generateCaptcha();
    }, [generateCaptcha]);

    useEffect(() => {
        if (step === 'otp' && generatedOtp) {
            setOtp(generatedOtp);
        }
    }, [step, generatedOtp]);


    const handleGetOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!firstName || !lastName || !/^\d{10}$/.test(phone)) {
            setError('Please fill all required fields and enter a valid 10-digit phone number.');
            return;
        }
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Please enter a valid email address.');
            return;
        }
        if (parseInt(captchaInput, 10) !== captcha.answer) {
            setError('Incorrect captcha answer. Please try again.');
            generateCaptcha();
            return;
        }

        setIsLoading(true);

        if (db.checkUserExists(phone)) {
            setError('A user with this phone number already exists. Please sign in.');
            setIsLoading(false);
            return;
        }

        const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOtp(newOtp);
        setStep('otp');
        setIsLoading(false);
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (otp !== generatedOtp) {
            setError('Invalid OTP. Please try again.');
            return;
        }
        setIsLoading(true);
        try {
            await signup(firstName, lastName, phone, email);
        } catch (err: any) {
            setError(err.message || "An unknown error occurred.");
            setIsLoading(false);
        }
    };

    if (step === 'entry') {
        return (
            <form onSubmit={handleGetOtp} className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
                        <input type="text" id="firstName" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="e.g., Amit" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" required />
                    </div>
                    <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
                        <input type="text" id="lastName" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="e.g., Kumar" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" required />
                    </div>
                 </div>
                 <div>
                    <label htmlFor="signup-phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                    <input type="tel" id="signup-phone" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Enter your 10-digit phone number" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" required />
                </div>
                <div>
                    <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address (Optional)</label>
                    <input type="email" id="signup-email" value={email} onChange={e => setEmail(e.target.value)} placeholder="e.g., amit.k@example.com" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" />
                </div>

                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-1 dark:bg-gray-700 dark:border-gray-600">
                    <label htmlFor="captcha-signup" className="block text-xs font-medium text-gray-700 dark:text-gray-300">Security Check</label>
                    <div className="flex items-center space-x-2">
                        <span className="p-2 bg-gray-200 text-gray-800 rounded-md font-mono text-sm dark:bg-gray-600 dark:text-gray-200">{captcha.question} = ?</span>
                        <input
                            type="number"
                            id="captcha-signup"
                            value={captchaInput}
                            onChange={e => setCaptchaInput(e.target.value)}
                            className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm w-20 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                            placeholder="Answer"
                            required
                        />
                        <button type="button" onClick={generateCaptcha} className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" aria-label="Refresh captcha">
                            <RefreshCwIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-lg flex items-center text-sm text-red-700 dark:text-red-300">
                        <XCircleIcon className="w-5 h-5 mr-3 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-teal-400 disabled:cursor-not-allowed">
                    {isLoading ? 'Sending OTP...' : 'Get OTP'}
                </button>
            </form>
        );
    }

     return (
        <form onSubmit={handleSignup} className="space-y-6">
            <div className="p-3 bg-blue-100 border-l-4 border-blue-400 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-500/50 text-center">
                <p className="text-sm">For simulation, the OTP has been auto-filled.</p>
                <p className="text-xs">In a real app, you would receive this via SMS.</p>
            </div>
             <div>
                <label htmlFor="otp-signup" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Enter OTP</label>
                <input type="text" id="otp-signup" value={otp} onChange={e => setOtp(e.target.value)} placeholder="Enter the 6-digit OTP" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" required />
            </div>

            {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-lg flex items-center text-sm text-red-700 dark:text-red-300">
                    <XCircleIcon className="w-5 h-5 mr-3 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-teal-400 disabled:cursor-not-allowed">
                {isLoading ? 'Creating Account...' : 'Verify & Create Account'}
            </button>
             <button type="button" onClick={() => { setStep('entry'); setError(''); }} className="w-full text-center text-sm text-gray-600 hover:text-teal-600 dark:text-gray-400 dark:hover:text-teal-500">
                Go back & edit details
            </button>
        </form>
    );
}

const PatientPortal: React.FC = () => {
    const [view, setView] = useState<'login' | 'signup'>('login');
    return (
        <>
            <div className="mb-6">
                <div className="flex border-b border-gray-200 dark:border-gray-600">
                    <button
                        onClick={() => setView('login')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${view === 'login' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                    >
                        Sign In
                    </button>
                    <button
                        onClick={() => setView('signup')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${view === 'signup' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                    >
                        Create Account
                    </button>
                </div>
            </div>
            {view === 'login' ? <LoginForm /> : <SignupForm />}
        </>
    );
};

const LoginPage: React.FC = () => {
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center items-center py-8 px-4">
      <div className="max-w-md w-full mx-auto">
        <div className="flex justify-center mb-6">
            <Logo className="h-20" />
        </div>
        <h2 className="text-center text-3xl font-bold text-gray-800 dark:text-gray-100">
          {isAdminLogin ? 'Admin Portal' : 'Welcome'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          {isAdminLogin ? 'Sign in to manage the Bihar Health Connect dashboard.' : 'Sign in to find and book appointments.'}
        </p>
      </div>

      <div className="max-w-md w-full mx-auto mt-8 bg-white p-8 border border-gray-200 rounded-xl shadow-lg dark:bg-gray-800 dark:border-gray-700">
        {isAdminLogin ? <LoginForm isAdmin={true} /> : <PatientPortal />}
      </div>
       <div className="max-w-md w-full text-center mt-6">
        <button 
          onClick={() => setIsAdminLogin(!isAdminLogin)} 
          className="text-sm font-medium text-teal-600 hover:text-teal-700 dark:hover:text-teal-500 hover:underline focus:outline-none"
        >
            {isAdminLogin ? 'Switch to Patient Sign In' : 'Clinic Administrator Sign In'}
        </button>
      </div>
    </div>
  );
};

export default LoginPage;