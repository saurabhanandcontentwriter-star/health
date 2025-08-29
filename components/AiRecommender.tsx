import React, { useState } from 'react';
import { recommendDoctorSpecialty } from '../services/geminiService';
import { SparklesIcon, XCircleIcon } from './IconComponents';

interface AiRecommenderProps {
  onRecommendation: (specialty: string) => void;
}

const AiRecommender: React.FC<AiRecommenderProps> = ({ onRecommendation }) => {
  const [symptoms, setSymptoms] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [recommendation, setRecommendation] = useState<{ specialty: string; reasoning: string } | null>(null);

  const handleRecommendation = async () => {
    if (!symptoms.trim()) {
      setError('Please enter your symptoms to get a recommendation.');
      return;
    }
    setIsLoading(true);
    setError('');
    setRecommendation(null);
    try {
      const result = await recommendDoctorSpecialty(symptoms);
      setRecommendation(result);
      onRecommendation(result.specialty);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-gray-800 dark:to-gray-800/50 p-6 rounded-xl border border-teal-200 dark:border-gray-700">
      <div className="flex items-center">
        <SparklesIcon className="h-6 w-6 text-teal-500" />
        <h3 className="ml-2 text-lg font-semibold text-gray-800 dark:text-gray-100">Don't know which doctor to see?</h3>
      </div>
      <p className="text-gray-600 dark:text-gray-400 mt-1 mb-4 text-sm">Describe your symptoms and our AI will suggest a specialty.</p>
      
      <div className="space-y-3">
        <textarea
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          placeholder="e.g., 'I have a persistent cough and a slight fever for three days.'"
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
          rows={3}
          disabled={isLoading}
        />
        <button
          onClick={handleRecommendation}
          disabled={isLoading}
          className="w-full flex items-center justify-center px-4 py-2.5 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 disabled:bg-teal-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Getting Recommendation...
            </>
          ) : "Get AI Recommendation"}
        </button>
      </div>

      {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-lg flex items-center text-sm text-red-700 dark:text-red-300">
              <XCircleIcon className="w-5 h-5 mr-3 flex-shrink-0" />
              <span>{error}</span>
          </div>
      )}
      
      {recommendation && (
        <div className="mt-4 p-4 bg-teal-100 border border-teal-200 rounded-md dark:bg-teal-900/50 dark:border-teal-800">
          <p className="font-semibold text-teal-800 dark:text-teal-200">
            Recommended Specialty: <span className="font-bold">{recommendation.specialty}</span>
          </p>
          <p className="text-teal-700 dark:text-teal-300 text-sm mt-1">{recommendation.reasoning}</p>
        </div>
      )}
    </div>
  );
};

export default AiRecommender;