import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CameraIcon, RefreshCwIcon, CheckCircleIcon } from './IconComponents';

interface FaceScanModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCapture: (imageBase64: string) => void;
}

const FaceScanModal: React.FC<FaceScanModalProps> = ({ isOpen, onClose, onCapture }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const stopStream = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    }, [stream]);

    useEffect(() => {
        if (isOpen) {
            setCapturedImage(null);
            setError(null);
            
            navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
                .then(mediaStream => {
                    setStream(mediaStream);
                    if (videoRef.current) {
                        videoRef.current.srcObject = mediaStream;
                    }
                })
                .catch(err => {
                    console.error("Error accessing camera:", err);
                    setError("Could not access the camera. Please check your browser permissions.");
                });
        } else {
            stopStream();
        }

        return () => {
            stopStream();
        };
    }, [isOpen, stopStream]);

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d')?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            const dataUrl = canvas.toDataURL('image/jpeg');
            setCapturedImage(dataUrl);
            stopStream();
        }
    };

    const handleRetake = () => {
        setCapturedImage(null);
        setError(null);
        // Restart the stream effect
        if (isOpen) {
            navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
                .then(mediaStream => {
                    setStream(mediaStream);
                    if (videoRef.current) {
                        videoRef.current.srcObject = mediaStream;
                    }
                });
        }
    };
    
    const handleConfirm = () => {
        if (capturedImage) {
            onCapture(capturedImage);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-[100] p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg transform transition-all text-center p-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">AI Wellness Scan</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Position your face in the frame and hold still. This is a general wellness check, not a medical diagnosis.</p>
                
                <div className="relative w-full aspect-square bg-gray-900 rounded-lg overflow-hidden mb-4 border-4 border-gray-200 dark:border-gray-600">
                    {error ? (
                        <div className="flex items-center justify-center h-full text-red-500 p-4">{error}</div>
                    ) : (
                        <>
                            <video ref={videoRef} autoPlay playsInline className={`w-full h-full object-cover transform -scale-x-100 ${capturedImage ? 'hidden' : 'block'}`} />
                            {capturedImage && <img src={capturedImage} alt="Captured face" className="w-full h-full object-cover transform -scale-x-100" />}
                            <canvas ref={canvasRef} className="hidden" />
                        </>
                    )}
                </div>

                {error ? (
                     <button onClick={onClose} className="w-full px-6 py-3 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors">
                        Close
                    </button>
                ) : capturedImage ? (
                    <div className="flex justify-center space-x-4">
                        <button onClick={handleRetake} className="flex-1 inline-flex items-center justify-center px-4 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500">
                            <RefreshCwIcon className="w-5 h-5 mr-2" /> Retake
                        </button>
                        <button onClick={handleConfirm} className="flex-1 inline-flex items-center justify-center px-4 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors">
                            <CheckCircleIcon className="w-5 h-5 mr-2" /> Use Photo
                        </button>
                    </div>
                ) : (
                    <button onClick={handleCapture} disabled={!stream} className="w-full inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400">
                        <CameraIcon className="w-6 h-6 mr-2" /> Capture
                    </button>
                )}
            </div>
        </div>
    );
};

export default FaceScanModal;