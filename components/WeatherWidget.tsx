import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ClockIcon, MapPinIcon, ThermometerIcon, SunIcon } from './IconComponents';

const Spinner: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const WeatherWidget: React.FC = () => {
    const { user } = useAuth();
    const [time, setTime] = useState(new Date());

    const [location, setLocation] = useState<string | null>(null);
    const [isLocationLoading, setIsLocationLoading] = useState<boolean>(true);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [temperature, setTemperature] = useState<number | null>(null);

    useEffect(() => {
        const timerId = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);

    useEffect(() => {
        if (!navigator.geolocation) {
            setLocationError("Geolocation not supported.");
            setIsLocationLoading(false);
            setTemperature(32);
            return;
        }

        const success = async (position: GeolocationPosition) => {
            const { latitude, longitude } = position.coords;
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                if (!response.ok) throw new Error('Failed to fetch location name.');
                
                const data = await response.json();
                const city = data.address.city || data.address.town || data.address.village || 'Unknown';
                const state = data.address.state || '';
                setLocation(`${city}, ${state}`);
                
                const mockTemp = 30 + Math.floor(Math.random() * 5);
                setTemperature(mockTemp);

            } catch (err) {
                console.error("Error fetching location name:", err);
                setLocationError("Could not determine location.");
                setTemperature(32);
            } finally {
                setIsLocationLoading(false);
            }
        };

        const errorCallback = (err: GeolocationPositionError) => {
            let errorMessage = "Location unavailable.";
            if (err.code === err.PERMISSION_DENIED) {
                errorMessage = "Location access denied.";
            }
            setLocationError(errorMessage);
            setIsLocationLoading(false);
            setTemperature(32);
        };

        setIsLocationLoading(true);
        navigator.geolocation.getCurrentPosition(success, errorCallback, { timeout: 10000 });

    }, []);
    
    const formattedTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    const renderLocationInfo = () => {
        if (isLocationLoading) {
            return (
                 <div className="flex items-center space-x-2">
                    <Spinner className="w-4 h-4" />
                    <span className="text-gray-300 dark:text-gray-400 hidden sm:inline">Getting location...</span>
                </div>
            );
        }
        if (locationError) {
            return (
                <div className="flex items-center space-x-2">
                    <MapPinIcon className="w-5 h-5 text-red-400" />
                    <span title={locationError} className="hidden sm:inline">{locationError}</span>
                </div>
            );
        }
        if (location) {
            return (
                <div className="flex items-center space-x-2">
                    <MapPinIcon className="w-5 h-5" />
                    <span className="font-semibold">{location}</span>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-teal-900 text-white dark:bg-gray-900 dark:text-gray-200 text-sm z-20 shadow-inner">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-10">
                <div className="flex items-center space-x-2">
                    {user && (
                        <>
                            <SunIcon className="w-5 h-5 text-yellow-300 hidden sm:block" />
                            <span className="font-semibold hidden sm:inline">{getGreeting()}, {user.firstName}</span>
                        </>
                    )}
                </div>
                <div className="flex items-center space-x-3 md:space-x-4">
                    {renderLocationInfo()}
                    
                    <div className="hidden md:block h-4 w-px bg-teal-700 dark:bg-gray-700"></div>

                    {temperature !== null && (
                        <div className="flex items-center space-x-2">
                            <ThermometerIcon className="w-5 h-5" />
                            <span className="font-semibold">{temperature}°C</span>
                        </div>
                    )}
                    
                    <div className="hidden md:block h-4 w-px bg-teal-700 dark:bg-gray-700"></div>

                    <div className="flex items-center space-x-2">
                        <ClockIcon className="w-5 h-5" />
                        <span className="font-mono tracking-wider">{formattedTime}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WeatherWidget;
