import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ClockIcon, MapPinIcon, ThermometerIcon } from './IconComponents';

const WeatherWidget: React.FC = () => {
    const { user } = useAuth();
    const [time, setTime] = useState(new Date());

    // New state for location tracking
    const [location, setLocation] = useState<string | null>(null);
    const [isLocationLoading, setIsLocationLoading] = useState<boolean>(true);
    const [locationError, setLocationError] = useState<string | null>(null);

    // Mocked weather state
    const [temperature, setTemperature] = useState<number | null>(null);

    useEffect(() => {
        const timerId = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);

    useEffect(() => {
        if (!navigator.geolocation) {
            setLocationError("Geolocation not supported.");
            setIsLocationLoading(false);
            setTemperature(32); // Default temp
            return;
        }

        const success = async (position: GeolocationPosition) => {
            const { latitude, longitude } = position.coords;
            try {
                // Using OpenStreetMap's free Nominatim API for reverse geocoding
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                if (!response.ok) throw new Error('Failed to fetch location name.');
                
                const data = await response.json();
                const city = data.address.city || data.address.town || data.address.village || 'Unknown';
                const state = data.address.state || '';
                setLocation(`${city}, ${state}`);
                
                // Mock weather data based on location being found
                const mockTemp = 30 + Math.floor(Math.random() * 5); // Random temp between 30-34
                setTemperature(mockTemp);

            } catch (err) {
                console.error("Error fetching location name:", err);
                setLocationError("Could not determine location.");
                setTemperature(32); // Default temp on error
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
            setTemperature(32); // Default temp
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
        let content;
        if (isLocationLoading) {
            content = <span>Tracking location...</span>;
        } else if (locationError) {
            content = <span title={locationError}>{locationError}</span>;
        } else if (location) {
            content = <span className="font-semibold">{location}</span>;
        } else {
            content = <span>Location Unknown</span>;
        }

        return (
            <div className="flex items-center space-x-2">
                <MapPinIcon className="w-5 h-5" />
                {content}
            </div>
        );
    };

    return (
        <div className="bg-teal-900 text-white text-sm z-20 shadow-inner">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-10">
                <div className="flex items-center space-x-2">
                    {user && <span className="font-semibold hidden sm:inline">{getGreeting()}, {user.firstName}</span>}
                </div>
                <div className="flex items-center space-x-4 md:space-x-6">
                    {renderLocationInfo()}
                    {temperature !== null && (
                        <div className="flex items-center space-x-2">
                            <ThermometerIcon className="w-5 h-5" />
                            <span className="font-semibold bg-blue-600 px-2 py-0.5 rounded-md">{temperature}°C</span>
                        </div>
                    )}
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
