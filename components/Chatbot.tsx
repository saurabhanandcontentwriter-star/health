import React, { useState, useEffect, useRef } from 'react';
import { startChat, generateContentWithImage } from '../services/geminiService';
import type { Chat, GenerateContentResponse } from '@google/genai';
import { Doctor, LabTest, Message, Appointment, LabTestBooking } from '../types';
import { MinimizeIcon, SendIcon, BotIcon, StethoscopeIcon, MapPinIcon, PlusIcon, PaperclipIcon, ImageIcon, CameraIcon, XIcon, FileTextIcon, CalendarIcon } from './IconComponents';
import FaceScanModal from './FaceScanModal';

const fileToBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
});

const formatTimestamp = (isoString: string): string => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
};


interface ChatbotProps {
    doctors: Doctor[];
    labTests: LabTest[];
    appointments: Appointment[];
    labTestBookings: LabTestBooking[];
    onShowAvailability: (doctor: Doctor) => void;
    onBookLabTest: (test: LabTest) => void;
    setCurrentView: (view: 'search' | 'dashboard' | 'ownerDashboard' | 'pharmacy' | 'labTests') => void;
    onStartVideoCall: (doctor: Doctor) => void;
    onViewDoctorDetails: (doctor: Doctor) => void;
    newMessage?: Message | null;
    onNewMessageConsumed: () => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ doctors, labTests, appointments, labTestBookings, onShowAvailability, onBookLabTest, setCurrentView, onStartVideoCall, onViewDoctorDetails, newMessage, onNewMessageConsumed }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatRef = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [copiedMessageIndex, setCopiedMessageIndex] = useState<number | null>(null);

    const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [showFaceScan, setShowFaceScan] = useState(false);
    
    const [language, setLanguage] = useState<'en' | 'hi' | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setSelectedFile(event.target.files[0]);
            setShowAttachmentOptions(false);
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        if (imageInputRef.current) imageInputRef.current.value = "";
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);
    
    useEffect(() => {
        if (newMessage) {
            const messageWithTimestamp: Message = {
                ...newMessage,
                timestamp: newMessage.timestamp || new Date().toISOString()
            };
            setMessages(prev => [...prev, messageWithTimestamp]);
            if (!isOpen) {
                setIsOpen(true);
            }
            onNewMessageConsumed();
        }
    }, [newMessage, onNewMessageConsumed, isOpen]);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    useEffect(() => {
        if (isOpen && !chatRef.current && language) {
            const chatSession = startChat(appointments, labTestBookings, language);
            if(chatSession) {
                chatRef.current = chatSession;
                if(messages.length === 0) {
                    const greeting = getGreeting();
                    const welcomeText = language === 'en'
                        ? `${greeting}! Welcome to BHC. I can help find doctors, book lab tests, analyze health reports, or perform a wellness face scan. How can I help?`
                        : `${greeting === 'Good Morning' ? 'सुप्रभात' : greeting === 'Good Afternoon' ? 'शुभ दोपहर' : 'शुभ संध्या'}! BHC में आपका स्वागत है। मैं डॉक्टर खोजने, लैब टेस्ट बुक करने, स्वास्थ्य रिपोर्ट का विश्लेषण करने या वेलनेस फेस स्कैन करने में मदद कर सकता हूँ। मैं आपकी कैसे मदद कर सकता हूँ?`;

                    setMessages([{ 
                        role: 'model', 
                        text: welcomeText,
                        timestamp: new Date().toISOString()
                    }]);
                }
            } else {
                 if(messages.length === 0) {
                    setMessages([{ 
                        role: 'model', 
                        text: "Sorry, the AI assistant is currently unavailable. Please ensure the API key is configured correctly.",
                        timestamp: new Date().toISOString()
                    }]);
                }
            }
        }
    }, [isOpen, language, messages.length, appointments, labTestBookings]);

    const handleCopyMessage = (text: string, index: number) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedMessageIndex(index);
            setTimeout(() => setCopiedMessageIndex(null), 2000);
        }).catch(err => {
            console.error('Failed to copy text:', err);
        });
    };

    const handleFaceScanCapture = async (imageBase64: string) => {
        setShowFaceScan(false);
        const userMessage: Message = { role: 'user', text: '[Wellness face scan attached]', timestamp: new Date().toISOString() };
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            const prompt = "Analyze this image of a person's face for general, visible wellness indicators. Focus on aspects like skin health, signs of fatigue, and overall appearance. Do not provide any medical diagnosis or specific advice. Frame your response as general observations and recommend consulting a doctor for any health concerns.";
            const pureBase64 = imageBase64.split(',')[1]; 
            const response = await generateContentWithImage(prompt, pureBase64, 'image/jpeg');
            setMessages(prev => [...prev, { role: 'model', text: response.text, timestamp: new Date().toISOString() }]);
        } catch (error) {
            console.error("Error analyzing face scan:", error);
            const errorMessage = error instanceof Error ? error.message : "Sorry, I couldn't analyze the image. Please try again.";
            setMessages(prev => [...prev, { role: 'model', text: errorMessage, timestamp: new Date().toISOString() }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedInput = inputValue.trim();
        const attachedFile = selectedFile;
        if ((!trimmedInput && !attachedFile) || isLoading) return;

        const userMessageText = attachedFile 
            ? `[File: ${attachedFile.name}] ${trimmedInput}` 
            : trimmedInput;
        const userMessage: Message = { role: 'user', text: userMessageText, timestamp: new Date().toISOString() };
        
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setSelectedFile(null);
        if (imageInputRef.current) imageInputRef.current.value = "";
        if (fileInputRef.current) fileInputRef.current.value = "";
        setIsLoading(true);

        try {
            if (attachedFile) {
                const base64 = await fileToBase64(attachedFile);
                const pureBase64 = base64.split(',')[1];
                const mimeType = attachedFile.type;
                
                let prompt;
                if (mimeType === 'application/pdf') {
                    prompt = trimmedInput || `This is a medical report. Please analyze it and provide a concise summary of the key findings. Highlight any values that are outside of normal ranges. IMPORTANT: Do not provide a medical diagnosis or treatment advice.`;
                } else {
                    prompt = trimmedInput || `Please analyze this image. If it's a health-related image (like a skin condition or X-ray), describe what you see objectively.`;
                }
                
                const response = await generateContentWithImage(prompt, pureBase64, mimeType);
                setMessages(prev => [...prev, { role: 'model', text: response.text, timestamp: new Date().toISOString() }]);

            } else if(chatRef.current) {
                const response: GenerateContentResponse = await chatRef.current.sendMessage({ message: trimmedInput });
                const modelResponseText = response.text.trim();
                
                const searchCommand = 'SEARCH_DOCTORS:';
                const bookTestCommand = 'BOOK_LAB_TEST:';
                const videoCallCommand = 'START_VIDEO_CALL:';
                const pharmacyCommand = 'GO_TO_PHARMACY:';
                const faceScanCommand = 'SCAN_FACE:';
                
                if (modelResponseText.includes(searchCommand)) {
                    try {
                        const payload = modelResponseText.substring(modelResponseText.indexOf(searchCommand) + searchCommand.length);
                        const jsonStart = payload.indexOf('{');
                        const jsonEnd = payload.lastIndexOf('}');
                        if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) {
                           throw new Error("Malformed SEARCH_DOCTORS command: missing or invalid JSON object.");
                        }
                        const jsonString = payload.substring(jsonStart, jsonEnd + 1);
                        const searchParams = JSON.parse(jsonString);

                        const filteredDoctors = doctors.filter(doc => {
                             const specialtyMatch = searchParams.specialty ? doc.specialty.toLowerCase().includes(searchParams.specialty.toLowerCase()) : true;
                             const locationMatch = searchParams.location ? doc.location.toLowerCase().includes(searchParams.location.toLowerCase()) : true;
                             return specialtyMatch && locationMatch;
                        });

                        const botText = filteredDoctors.length > 0
                            ? `I found ${filteredDoctors.length} doctor(s) matching your criteria. You can view their details or book an appointment directly.`
                            : `Sorry, I couldn't find any doctors for "${searchParams.specialty || 'any specialty'}" in "${searchParams.location || 'any location'}".`;
                        
                        const newBotMessage: Message = {
                            role: 'model',
                            text: botText,
                            doctors: filteredDoctors.length > 0 ? filteredDoctors : undefined,
                            timestamp: new Date().toISOString()
                        };
                        setMessages(prev => [...prev, newBotMessage]);
                    } catch (parseError) {
                        console.error("Failed to parse SEARCH_DOCTORS command:", parseError, "--- Original text:", modelResponseText);
                        setMessages(prev => [...prev, { role: 'model', text: "I tried to search for doctors but couldn't understand the details. Could you please specify the specialty and location again?", timestamp: new Date().toISOString() }]);
                    }
                } else if (modelResponseText.includes(bookTestCommand)) {
                    try {
                        const payload = modelResponseText.substring(modelResponseText.indexOf(bookTestCommand) + bookTestCommand.length);
                        const jsonStart = payload.indexOf('{');
                        const jsonEnd = payload.lastIndexOf('}');
                         if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) {
                           throw new Error("Malformed BOOK_LAB_TEST command: missing or invalid JSON object.");
                        }
                        const jsonString = payload.substring(jsonStart, jsonEnd + 1);
                        const { testName } = JSON.parse(jsonString);

                        if (!testName || typeof testName !== 'string') {
                            throw new Error("Invalid 'testName' in BOOK_LAB_TEST command.");
                        }

                        const foundTest = labTests.find(test => test.name.toLowerCase().includes(testName.toLowerCase()));
                        if (foundTest) {
                            const newBotMessage: Message = {
                                role: 'model',
                                text: `Here is the information for the "${foundTest.name}" test. You can book it directly from here.`,
                                labTests: [foundTest],
                                timestamp: new Date().toISOString()
                            };
                            setMessages(prev => [...prev, newBotMessage]);
                        } else {
                            setMessages(prev => [...prev, { role: 'model', text: `I'm sorry, I couldn't find a lab test called "${testName}".`, timestamp: new Date().toISOString() }]);
                        }
                    } catch (parseError) {
                        console.error("Failed to parse BOOK_LAB_TEST command:", parseError, "--- Original text:", modelResponseText);
                        setMessages(prev => [...prev, { role: 'model', text: "I tried to book a lab test but couldn't identify which one. Could you please specify the test name again?", timestamp: new Date().toISOString() }]);
                    }
                } else if (modelResponseText.includes(videoCallCommand)) {
                    try {
                        const payload = modelResponseText.substring(modelResponseText.indexOf(videoCallCommand) + videoCallCommand.length);
                        const { specialty } = JSON.parse(payload);
                        let doctorToCall = doctors.find(d => d.specialty.toLowerCase() === specialty.toLowerCase());
                        if (!doctorToCall && doctors.length > 0) {
                            doctorToCall = doctors[0]; // Fallback to the first doctor
                        }

                        if(doctorToCall) {
                            onStartVideoCall(doctorToCall);
                            setMessages(prev => [...prev, { role: 'model', text: `Connecting you with Dr. ${doctorToCall.name} for a video call...`, timestamp: new Date().toISOString() }]);
                            setIsOpen(false);
                        } else {
                             setMessages(prev => [...prev, { role: 'model', text: "Sorry, no doctors are available for a video call right now.", timestamp: new Date().toISOString() }]);
                        }
                    } catch (e) {
                         setMessages(prev => [...prev, { role: 'model', text: "I couldn't start a video call. Please try asking again.", timestamp: new Date().toISOString() }]);
                    }
                } else if (modelResponseText.includes(pharmacyCommand)) {
                    setCurrentView('pharmacy');
                    setMessages(prev => [...prev, { role: 'model', text: "I've taken you to our pharmacy.", timestamp: new Date().toISOString() }]);
                    setIsOpen(false);
                } else if (modelResponseText.includes(faceScanCommand)) {
                    setShowFaceScan(true);
                } else {
                     setMessages(prev => [...prev, { role: 'model', text: modelResponseText, timestamp: new Date().toISOString() }]);
                }
            }
        } catch (error) {
            console.error("Error sending message:", error);
            const errorMessage = error instanceof Error ? error.message : "Sorry, something went wrong. Please try again.";
            setMessages(prev => [...prev, { role: 'model', text: errorMessage, timestamp: new Date().toISOString() }]);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleOpen = () => {
        setIsOpen(prev => !prev);
    };

    const handleLanguageSelect = (lang: 'en' | 'hi') => {
        setLanguage(lang);
    };

    const handleClose = () => {
        setIsOpen(false);
        // Reset chat
        chatRef.current = null;
        setMessages([]);
        setLanguage(null);
    };
    
    return (
        <>
            <FaceScanModal
                isOpen={showFaceScan}
                onClose={() => setShowFaceScan(false)}
                onCapture={handleFaceScanCapture}
            />
            {!isOpen && (
                <button
                    onClick={toggleOpen}
                    className="fixed bottom-6 right-6 bg-teal-600 text-white p-4 rounded-full shadow-lg hover:bg-teal-700 transition-transform transform hover:scale-110 z-50 animate-fade-in"
                    aria-label="Open AI Chat"
                >
                    <BotIcon className="w-6 h-6" />
                </button>
            )}

            {isOpen && (
                <div className="fixed bottom-24 right-6 w-full max-w-sm h-[70vh] max-h-[600px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200 dark:border-gray-700 animate-slide-in">
                    <header className="bg-teal-600 text-white p-4 rounded-t-2xl flex justify-between items-center">
                        <h3 className="font-bold text-lg">BHC AI Assistant</h3>
                        <div className="flex items-center space-x-2">
                            <button onClick={toggleOpen} aria-label="Minimize Chat">
                                <MinimizeIcon className="w-6 h-6" />
                            </button>
                             <button onClick={handleClose} aria-label="Close and Reset Chat">
                                <XIcon className="w-6 h-6" />
                            </button>
                        </div>
                    </header>
                    {language ? (
                        <>
                            <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900">
                                <div className="space-y-4">
                                    {messages.map((msg, index) => (
                                        <div key={index} className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            {msg.role === 'model' && (
                                                <img src="https://i.imgur.com/A42A42M.png" alt="BHC Assistant" className="w-8 h-8 rounded-full object-cover flex-shrink-0 self-start mt-1"/>
                                            )}
                                            <div className={`flex flex-col gap-1 w-full max-w-[320px] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                                <div 
                                                    className={`relative flex flex-col p-0 rounded-2xl transition-all ${msg.role === 'user' ? 'bg-blue-500 rounded-br-none' : 'bg-gray-200 dark:bg-gray-700 rounded-bl-none'}`}
                                                >
                                                    <div 
                                                        className="cursor-pointer active:scale-95"
                                                        onClick={() => handleCopyMessage(msg.text, index)}
                                                        title="Click to copy message"
                                                        role="button"
                                                        tabIndex={0}
                                                    >
                                                        {copiedMessageIndex === index && (
                                                            <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-0.5 rounded-md animate-fade-in-fast">
                                                                Copied!
                                                            </div>
                                                        )}
                                                        
                                                        <p className={`text-sm p-3 ${msg.role === 'user' ? 'text-white' : 'text-gray-800 dark:text-gray-100'}`} style={{ whiteSpace: 'pre-wrap' }}>
                                                            {msg.text}
                                                        </p>
                                                    </div>
                                                
                                                    {msg.doctors && (
                                                        <div className="space-y-2 p-2">
                                                            {msg.doctors.map(doc => (
                                                                <div key={doc.id} className="w-full text-left bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-3">
                                                                    <div className="flex items-start space-x-3">
                                                                        <img src={doc.imageUrl} alt={doc.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                                                                        <div className="flex-grow text-left">
                                                                            <p className="font-bold text-gray-800 dark:text-gray-100">{doc.name}</p>
                                                                            <div className="flex items-center text-xs text-teal-600 dark:text-teal-400 mt-1">
                                                                                <StethoscopeIcon className="w-3 h-3 mr-1.5"/> {doc.specialty}
                                                                            </div>
                                                                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                                                <MapPinIcon className="w-3 h-3 mr-1.5"/> {doc.location}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                                                                        <button onClick={(e) => { e.stopPropagation(); onViewDoctorDetails(doc); }} className="flex items-center justify-center text-xs font-semibold px-2 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md">
                                                                            <FileTextIcon className="w-4 h-4 mr-1.5" /> Details
                                                                        </button>
                                                                        <button onClick={(e) => { e.stopPropagation(); onShowAvailability(doc); setIsOpen(false); }} className="flex items-center justify-center text-xs font-semibold px-2 py-1.5 bg-teal-600 text-white hover:bg-teal-700 rounded-md">
                                                                            <CalendarIcon className="w-4 h-4 mr-1.5" /> Book
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {msg.labTests && (
                                                        <div className="space-y-2 p-2">
                                                            {msg.labTests.map(test => (
                                                                <div key={test.id} className="w-full text-left bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-3 flex justify-between items-center">
                                                                    <div>
                                                                        <p className="font-bold text-gray-800 dark:text-gray-100">{test.name}</p>
                                                                        <p className="text-sm font-semibold text-teal-600 dark:text-teal-400 mt-1">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(test.price)}</p>
                                                                    </div>
                                                                    <button onClick={() => onBookLabTest(test)} className="px-4 py-2 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700 transition-colors shadow-md">
                                                                        Book Now
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="text-xs text-gray-400 px-1">
                                                    {formatTimestamp(msg.timestamp || '')}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                     {isLoading && (
                                        <div className="flex items-end gap-2 justify-start">
                                            <img src="https://i.imgur.com/A42A42M.png" alt="BHC Assistant" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                                            <div className="max-w-[80%] p-3 rounded-2xl bg-gray-200 dark:bg-gray-700 text-gray-800 rounded-bl-none">
                                                <div className="flex items-center space-x-1">
                                                    <span className="w-2 h-2 bg-teal-500 rounded-full animate-bounce delay-0"></span>
                                                    <span className="w-2 h-2 bg-teal-500 rounded-full animate-bounce delay-150"></span>
                                                    <span className="w-2 h-2 bg-teal-500 rounded-full animate-bounce delay-300"></span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>
                            </div>
                             <div className="p-2 text-center text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
                                {language === 'en' 
                                    ? 'AI assistant is not a medical professional. Always consult a qualified doctor for medical advice.'
                                    : 'एआई सहायक एक चिकित्सा पेशेवर नहीं है। चिकित्सीय सलाह के लिए हमेशा एक योग्य डॉक्टर से सलाह लें।'
                                }
                            </div>
                            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center bg-white dark:bg-gray-800 rounded-b-2xl relative">
                                <input type="file" ref={imageInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="application/pdf" />

                                <div className="flex items-center gap-2">
                                    {showAttachmentOptions && (
                                        <div className="flex items-center gap-2 animate-fade-in-fast" >
                                             <button type="button" onClick={() => { setShowFaceScan(true); setShowAttachmentOptions(false); }} className="p-2 text-gray-500 hover:text-teal-600 rounded-full hover:bg-gray-100 dark:text-gray-400 dark:hover:text-teal-400 dark:hover:bg-gray-700" aria-label="Scan face">
                                                <CameraIcon className="w-6 h-6" />
                                            </button>
                                            <button type="button" onClick={() => imageInputRef.current?.click()} className="p-2 text-gray-500 hover:text-teal-600 rounded-full hover:bg-gray-100 dark:text-gray-400 dark:hover:text-teal-400 dark:hover:bg-gray-700" aria-label="Attach image">
                                                <ImageIcon className="w-6 h-6" />
                                            </button>
                                            <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-500 hover:text-teal-600 rounded-full hover:bg-gray-100 dark:text-gray-400 dark:hover:text-teal-400 dark:hover:bg-gray-700" aria-label="Attach file">
                                                <PaperclipIcon className="w-6 h-6" />
                                            </button>
                                        </div>
                                    )}
                                     <button type="button" onClick={() => setShowAttachmentOptions(!showAttachmentOptions)} className={`p-2 rounded-full transition-all duration-300 ${showAttachmentOptions ? 'bg-teal-100 text-teal-600 rotate-45 dark:bg-teal-900 dark:text-teal-300' : 'text-gray-500 hover:text-teal-600 dark:text-gray-400 dark:hover:text-teal-400'}`}>
                                        <PlusIcon className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="flex-1 mx-2 relative">
                                    {selectedFile && (
                                        <div className="absolute bottom-full left-0 w-full bg-gray-100 dark:bg-gray-700 p-2 rounded-t-lg text-sm text-gray-700 dark:text-gray-300 flex justify-between items-center animate-fade-in-fast">
                                            <span>{selectedFile.name}</span>
                                            <button type="button" onClick={handleRemoveFile} className="text-red-500 hover:text-red-700">&times;</button>
                                        </div>
                                    )}
                                    <input
                                        type="text"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        placeholder={language === 'en' ? "Type a message..." : "एक संदेश लिखें..."}
                                        className="w-full px-4 py-2 bg-gray-100 rounded-full border border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                                        disabled={isLoading}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                handleSendMessage(e);
                                            }
                                        }}
                                    />
                                </div>

                                <button type="submit" disabled={(!inputValue.trim() && !selectedFile) || isLoading} className="bg-teal-600 text-white p-3 rounded-full shadow-sm hover:bg-teal-700 disabled:bg-teal-300 disabled:cursor-not-allowed transition-colors">
                                    <SendIcon className="w-5 h-5" />
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Choose your language</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">अपनी भाषा चुनें</p>
                            <div className="space-y-3 w-full max-w-xs">
                                <button
                                    onClick={() => handleLanguageSelect('en')}
                                    className="w-full px-4 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors"
                                >
                                    English
                                </button>
                                <button
                                    onClick={() => handleLanguageSelect('hi')}
                                    className="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    हिन्दी (Hindi)
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
            <style>{`
                @keyframes slide-in {
                    from { transform: translateY(30px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-slide-in { animation: slide-in 0.5s ease-out forwards; }

                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
                .animate-fade-in-fast { animation: fade-in 0.3s ease-out forwards; }

                .delay-150 { animation-delay: 150ms; }
                .delay-300 { animation-delay: 300ms; }
            `}</style>
        </>
    );
};

export default Chatbot;