import React, { useEffect, useMemo, useRef } from 'react';
import { useParticipant } from '@videosdk.live/react-sdk';
import { MicOff } from 'lucide-react';

interface Props {
  participantId: string;
}

const ParticipantView = ({ participantId }: Props) => {
  const webcamRef = useRef<HTMLVideoElement>(null);
  const micRef = useRef<HTMLAudioElement>(null);

  // 1. Get participant properties from the hook
  const { 
    displayName, 
    webcamStream, 
    micStream, 
    webcamOn, 
    micOn, 
    isLocal 
  } = useParticipant(participantId);

  // 2. Play Audio (Mic)
  useEffect(() => {
    if (micRef.current) {
      if (micOn && micStream) {
        const mediaStream = new MediaStream();
        mediaStream.addTrack(micStream.track);
        micRef.current.srcObject = mediaStream;
        micRef.current.play().catch((err) => console.error("Mic play error", err));
      } else {
        micRef.current.srcObject = null;
      }
    }
  }, [micStream, micOn]);

  // 3. Play Video (Webcam)
  useEffect(() => {
    if (webcamRef.current) {
      if (webcamOn && webcamStream) {
        const mediaStream = new MediaStream();
        mediaStream.addTrack(webcamStream.track);
        webcamRef.current.srcObject = mediaStream;
        webcamRef.current.play().catch((err) => console.error("Video play error", err));
      } else {
        webcamRef.current.srcObject = null;
      }
    }
  }, [webcamStream, webcamOn]);

  return (
    <div className="relative w-full h-64 bg-gray-800 rounded-lg overflow-hidden border border-gray-700 shadow-md">
      {/* --- AUDIO TAG (Required to hear others) --- */}
      <audio ref={micRef} autoPlay muted={isLocal} />

      {/* --- VIDEO AREA --- */}
      {webcamOn ? (
        <video
          ref={webcamRef}
          autoPlay
          playsInline
          muted={isLocal} // Mute local video to prevent echo/feedback loop
          className="w-full h-full object-cover"
        />
      ) : (
        /* Fallback avatar when camera is off */
        <div className="w-full h-full flex items-center justify-center bg-gray-900">
          <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
            {displayName?.charAt(0)?.toUpperCase() || "?"}
          </div>
        </div>
      )}

      {/* --- OVERLAYS --- */}
      <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-white text-sm flex items-center gap-2">
        <span>{displayName || "Participant"} {isLocal ? "(You)" : ""}</span>
        {!micOn && <MicOff size={14} className="text-red-400" />}
      </div>
      
      {/* Indicator for Instructor/Host (Optional styling) */}
      <div className="absolute top-2 right-2">
        <span className="text-xs bg-gray-700/80 text-gray-300 px-1.5 py-0.5 rounded">
            {isLocal ? "Local" : "Remote"}
        </span>
      </div>
    </div>
  );
};

export default ParticipantView;