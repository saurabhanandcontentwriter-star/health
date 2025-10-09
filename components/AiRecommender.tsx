import React, { useState } from 'react';
import { getDoctorRecommendations } from '../services/geminiService';
import { useMockDb } from '../hooks/useMockDb';
import { Doctor } from '../types';
import { DoctorCard } from './DoctorCard';

export const AiRecommender: React.FC = () => {
    const [symptoms, setSymptoms] = useState('');
    const [loading, setLoading] = useState(false);
    const [recommendations, setRecommendations] = useState<{ doctor: Doctor; reason: string }[]>([]);
    const [error, setError] = useState<string | null>(null);

    const { doctors } = useMockDb();

    const handleGetRecommendations = async () => {
        if (!symptoms.trim()) {
            setError("Please enter your symptoms.");
            return;
        }
        setLoading(true);
        setError(null);
        setRecommendations([]);

        try {
            const recommendedDoctorIds = await getDoctorRecommendations(symptoms, doctors);
            const recommendedDoctors = recommendedDoctorIds
                .map(rec => {
                    const doctor = doctors.find(d => d.id === rec.doctorId);
                    return doctor ? { doctor, reason: rec.reason } : null;
                })
                .filter((item): item is { doctor: Doctor; reason: string } => item !== null);

            if (recommendedDoctors.length === 0 && recommendedDoctorIds.length > 0) {
                 setError("Could not find the recommended doctors in our database. Please try again.");
            } else if (recommendedDoctorIds.length === 0) {
                setError("Sorry, we couldn't find a suitable doctor for your symptoms. Please try describing them differently.");
            }
            
            setRecommendations(recommendedDoctors);
        } catch (e) {
            console.error(e);
            setError("An unexpected error occurred. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-2xl mx-auto my-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">AI Doctor Recommender</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
                Describe your symptoms, and our AI will suggest the most suitable doctors for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
                <textarea
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder="e.g., 'I have a high fever, a sore throat, and a headache.'"
                    className="flex-grow p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    rows={3}
                    aria-label="Symptoms input"
                />
                <button
                    onClick={handleGetRecommendations}
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
                >
                    {loading ? (
                        <div className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Searching...
                        </div>
                    ) : "Find a Doctor"}
                </button>
            </div>

            {error && <p className="text-red-500 text-center mb-4">{error}</p>}

            {recommendations.length > 0 && (
                <div className="mt-6">
                    <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Our Recommendations for You:</h3>
                    <div className="space-y-4">
                        {recommendations.map(({ doctor, reason }) => (
                            <div key={doctor.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                <DoctorCard doctor={doctor} />
                                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 italic border-l-4 border-blue-500 pl-3">
                                    <strong className="font-semibold text-gray-800 dark:text-white">Reason:</strong> {reason}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
