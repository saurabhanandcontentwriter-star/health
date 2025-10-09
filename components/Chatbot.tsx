import React, { useState, useRef, useEffect } from 'react';
import { useMockDb } from '../hooks/useMockDb';
import { getChatbotResponseStream, getDoctorRecommendations, analyzeUserIntent } from '../services/geminiService';
import { Doctor } from '../types';
import { DoctorCard } from './DoctorCard';
import { SendIcon, BotIcon } from './IconComponents';

interface Message {
    id: number;
    text?: string;
    recommendations?: { doctor: Doctor; reason: string }[];
    isUser: boolean;
}

export const Chatbot: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, text: "Hello! I'm your health assistant from Bihar Health Connect. How can I help you today?", isUser: false }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { doctors } = useMockDb();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async () => {
        if (input.trim() === '' || isLoading) return;

        const userMessage: Message = { id: Date.now(), text: input, isUser: true };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Step 1: Analyze intent
            const intent = await analyzeUserIntent(input);

            if (intent.isRecommendationRequest && intent.symptoms) {
                // Step 2a: It's a recommendation request
                const thinkingMessage: Message = { id: Date.now() + 1, text: "I see you're describing some symptoms. Let me find a suitable doctor for you...", isUser: false };
                setMessages(prev => [...prev, thinkingMessage]);

                const recommendations = await getDoctorRecommendations(intent.symptoms, doctors);
                const recommendedDoctors = recommendations
                    .map(rec => {
                        const doctor = doctors.find(d => d.id === rec.doctorId);
                        return doctor ? { doctor, reason: rec.reason } : null;
                    })
                    .filter((item): item is { doctor: Doctor; reason: string } => item !== null);

                if (recommendedDoctors.length > 0) {
                    const recommendationMessage: Message = {
                        id: Date.now() + 2,
                        recommendations: recommendedDoctors,
                        text: "Based on your symptoms, here are some doctors I recommend:",
                        isUser: false
                    };
                    setMessages(prev => [...prev.filter(m => m.id !== thinkingMessage.id), recommendationMessage]);
                } else {
                     const noResultsMessage: Message = { id: Date.now() + 2, text: "I'm sorry, I couldn't find a suitable doctor for those symptoms. You could try the 'AI Doctor Recommender' feature for a more detailed search.", isUser: false };
                     setMessages(prev => [...prev.filter(m => m.id !== thinkingMessage.id), noResultsMessage]);
                }
            } else {
                // Step 2b: It's a general query
                const history = messages.map(msg => ({
                    role: msg.isUser ? 'user' : 'model',
                    parts: [{ text: msg.text || '' }]
                }));
                
                const stream = await getChatbotResponseStream(history, input);
                let botReply = '';
                const botMessageId = Date.now() + 1;

                setMessages(prev => [...prev, { id: botMessageId, text: '...', isUser: false }]);

                for await (const chunk of stream) {
                    botReply += chunk.text;
                    setMessages(prev => prev.map(m => m.id === botMessageId ? { ...m, text: botReply } : m));
                }
            }
        } catch (error) {
            console.error("Chatbot error:", error);
            const errorMessage: Message = { id: Date.now() + 1, text: "Sorry, something went wrong. Please try again.", isUser: false };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="fixed bottom-4 right-4 w-96">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col h-[500px]">
                <div className="bg-blue-600 text-white p-3 rounded-t-lg flex items-center">
                    <BotIcon className="w-6 h-6 mr-2" />
                    <h3 className="font-bold text-lg">Health Assistant</h3>
                </div>
                <div className="flex-1 p-4 overflow-y-auto">
                    <div className="flex flex-col gap-3">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                                <div className={`p-3 rounded-lg max-w-xs ${msg.isUser ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                                   {msg.text && <p className="text-sm">{msg.text}</p>}
                                   {msg.recommendations && (
                                        <div className="space-y-3 mt-2">
                                            {msg.recommendations.map(({doctor, reason}) => (
                                                <div key={doctor.id} className="bg-white dark:bg-gray-800 rounded-lg p-2 shadow-inner">
                                                     <DoctorCard doctor={doctor} />
                                                     <p className="mt-2 text-xs text-gray-700 dark:text-gray-300 italic border-l-2 border-blue-500 pl-2">
                                                        <strong>Reason:</strong> {reason}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                   )}
                                </div>
                            </div>
                        ))}
                         <div ref={messagesEndRef} />
                    </div>
                </div>
                <div className="p-3 border-t dark:border-gray-700">
                    <div className="flex items-center">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Type your message..."
                            className="flex-1 px-3 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                            disabled={isLoading}
                        />
                        <button onClick={handleSend} disabled={isLoading} className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 disabled:bg-blue-300">
                            <SendIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
