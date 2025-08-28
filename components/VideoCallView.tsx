import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { MicIcon, MicOffIcon, VideoIcon, VideoOffIcon, PhoneOffIcon } from './IconComponents';
import { Doctor } from '../types';

interface VideoCallViewProps {
  onEndCall: () => void;
  doctor: Doctor;
}

const VideoCallView: React.FC<VideoCallViewProps> = ({ onEndCall, doctor }) => {
  const { user } = useAuth();
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [error, setError] = useState<{ title: string; message: string } | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const setMediaError = (title: string, message: string) => {
    setError({ title, message });
  };

  useEffect(() => {
    let stream: MediaStream | null = null;
    
    const startMedia = async () => {
      try {
        if (window.location.protocol !== 'https:') {
            setMediaError("Insecure Connection", "A secure (HTTPS) connection is required to use the camera and microphone.");
            return;
        }

        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasCamera = devices.some(device => device.kind === 'videoinput');
        const hasMicrophone = devices.some(device => device.kind === 'audioinput');
        
        if (!hasCamera || !hasMicrophone) {
            let message = "No camera or microphone was found. Please ensure your devices are connected and enabled.";
            if (hasCamera && !hasMicrophone) {
                 message = "No microphone was found. Please connect a microphone to continue.";
            } else if (!hasCamera && hasMicrophone) {
                 message = "No camera was found. Please connect a camera to continue.";
            }
            setMediaError("Device Not Found", message);
            return;
        }

        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        if (remoteVideoRef.current) {
          // In a real app, this would be the remote stream from a peer connection.
          // For simulation, we'll show a placeholder or mirror the local stream.
          // Let's create a placeholder to avoid feedback loop issues.
          const canvas = document.createElement('canvas');
          canvas.width = 640;
          canvas.height = 480;
          const ctx = canvas.getContext('2d');
          if(ctx) {
            ctx.fillStyle = '#1a202c'; // dark gray
            ctx.fillRect(0, 0, 640, 480);
            ctx.fillStyle = 'white';
            ctx.font = '20px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Connecting to Dr. ' + doctor.name + '...', 320, 240);
          }
           const remoteStream = (canvas as any).captureStream();
           remoteVideoRef.current.srcObject = remoteStream;
        }
      } catch (err) {
        console.error("Error accessing media devices.", err);
        
        if (err instanceof Error) {
            switch (err.name) {
                case 'NotAllowedError':
                case 'PermissionDeniedError':
                    setMediaError("Permission Denied", "You denied permission to use the camera and microphone. To use this feature, please grant access in your browser's site settings and reload the page.");
                    break;
                case 'NotFoundError':
                case 'DevicesNotFoundError':
                    setMediaError("Device Not Found", "No camera or microphone was found. Please ensure your devices are connected and enabled.");
                    break;
                case 'NotReadableError':
                case 'TrackStartError':
                    setMediaError("Device In Use", "Your camera or microphone might be in use by another application. Please close other apps and try again.");
                    break;
                default:
                    setMediaError("An Error Occurred", `An unexpected error occurred: ${err.message}. Please try again.`);
                    break;
            }
        } else {
            setMediaError("An Error Occurred", "Could not access camera and microphone. Please check permissions and try again.");
        }
      }
    };

    startMedia();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [doctor.name]);

  const toggleMic = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMicMuted(prev => !prev);
    }
  };

  const toggleCamera = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsCameraOff(prev => !prev);
    }
  };

  const handleEndCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    onEndCall();
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)] bg-red-50 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-red-700 mb-4">{error.title}</h2>
        <p className="text-red-700 text-center max-w-md mb-6">{error.message}</p>
        <button
          onClick={handleEndCall}
          className="px-6 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[calc(100vh-10rem)] bg-gray-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
      {/* Remote Video */}
      <div className="relative flex-grow bg-black">
        <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" muted />
        <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-lg text-sm">
            {doctor.name}
        </div>
      </div>
      
      {/* Local Video Preview */}
      <div className="absolute top-6 right-6 w-48 h-32 md:w-64 md:h-48 bg-gray-800 rounded-lg overflow-hidden shadow-lg border-2 border-gray-700 transition-all duration-300">
        <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover transform -scale-x-100" />
         <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-0.5 rounded-md text-xs">
            {user?.firstName} (You)
        </div>
      </div>

      {/* Call Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-black bg-opacity-30 backdrop-blur-sm">
        <div className="flex justify-center items-center space-x-4">
          <button
            onClick={toggleMic}
            className={`p-3 rounded-full transition-colors ${isMicMuted ? 'bg-red-600 text-white' : 'bg-gray-700 bg-opacity-50 text-white hover:bg-gray-600'}`}
            aria-label={isMicMuted ? 'Unmute Microphone' : 'Mute Microphone'}
          >
            {isMicMuted ? <MicOffIcon className="h-6 w-6" /> : <MicIcon className="h-6 w-6" />}
          </button>
          
          <button
            onClick={toggleCamera}
            className={`p-3 rounded-full transition-colors ${isCameraOff ? 'bg-red-600 text-white' : 'bg-gray-700 bg-opacity-50 text-white hover:bg-gray-600'}`}
            aria-label={isCameraOff ? 'Turn Camera On' : 'Turn Camera Off'}
          >
            {isCameraOff ? <VideoOffIcon className="h-6 w-6" /> : <VideoIcon className="h-6 w-6" />}
          </button>
          
          <button
            onClick={handleEndCall}
            className="p-3 px-6 bg-red-600 text-white rounded-full transition-colors hover:bg-red-700 flex items-center space-x-2"
            aria-label="End Call"
          >
            <PhoneOffIcon className="h-6 w-6" />
            <span className="font-semibold">End Call</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCallView;