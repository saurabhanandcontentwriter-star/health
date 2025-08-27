import React, { useState } from 'react';

interface PermissionGateProps {
    onAllow: () => void;
}

const PermissionItem: React.FC<{ label: string, isChecked: boolean, onToggle: () => void }> = ({ label, isChecked, onToggle }) => (
    <div className="flex items-center">
        <input
            id={label}
            type="checkbox"
            checked={isChecked}
            onChange={onToggle}
            className="h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
        />
        <label htmlFor={label} className="ml-3 block text-md text-gray-700">
            {label}
        </label>
    </div>
);


const PermissionGate: React.FC<PermissionGateProps> = ({ onAllow }) => {
    const [permissions, setPermissions] = useState({
        camera: true,
        microphone: true,
        location: true,
    });

    const handleToggle = (permission: keyof typeof permissions) => {
        setPermissions(prev => ({ ...prev, [permission]: !prev[permission] }));
    };

    const handleAllow = () => {
        // In a real app, you might trigger browser permission prompts here.
        // For this simulation, we'll just save the consent and proceed.
        localStorage.setItem('permissions-granted', 'true');
        onAllow();
    };

    return (
        <div className="min-h-screen bg-gray-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800 text-center mb-6">
                    Allow this app to request access to:
                </h2>
                
                <div className="space-y-4 mb-8 pl-4">
                    <PermissionItem 
                        label="Camera" 
                        isChecked={permissions.camera} 
                        onToggle={() => handleToggle('camera')}
                    />
                    <PermissionItem 
                        label="Microphone" 
                        isChecked={permissions.microphone} 
                        onToggle={() => handleToggle('microphone')}
                    />
                     <PermissionItem 
                        label="Location" 
                        isChecked={permissions.location} 
                        onToggle={() => handleToggle('location')}
                    />
                </div>

                <button
                    onClick={handleAllow}
                    className="w-full bg-teal-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-teal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                    Allow
                </button>

                <p className="text-center text-sm text-gray-500 mt-6">
                    The app may not work properly without these permissions.
                </p>
            </div>
        </div>
    );
};

export default PermissionGate;
