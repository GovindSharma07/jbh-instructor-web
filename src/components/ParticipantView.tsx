import { useEffect, useRef } from 'react';
import { useParticipant } from '@videosdk.live/react-sdk';

interface Props {
  participantId: string;
}

const ParticipantView = ({ participantId }: Props) => {
  const webcamRef = useRef<HTMLVideoElement>(null);
  const micRef = useRef<HTMLAudioElement>(null);

  // Destructure Screen Share properties
  const { 
      webcamStream, 
      micStream, 
      screenShareStream, 
      webcamOn, 
      micOn, 
      screenShareOn, 
      isLocal 
  } = useParticipant(participantId);

  // --- AUDIO HANDLING ---
  useEffect(() => {
    if (micRef.current) {
      if (micOn && micStream) {
        const mediaStream = new MediaStream();
        mediaStream.addTrack(micStream.track);
        micRef.current.srcObject = mediaStream;
        micRef.current.play().catch((err) => console.error("Mic error", err));
      } else {
        micRef.current.srcObject = null;
      }
    }
  }, [micStream, micOn]);

  // --- VIDEO HANDLING (Prioritize Screen Share) ---
  useEffect(() => {
    if (webcamRef.current) {
        // CASE 1: Screen Share is Active
        if (screenShareOn && screenShareStream) {
            const mediaStream = new MediaStream();
            mediaStream.addTrack(screenShareStream.track);
            webcamRef.current.srcObject = mediaStream;
            webcamRef.current.play().catch((err) => console.error("Screen Share error", err));
        } 
        // CASE 2: Webcam is Active
        else if (webcamOn && webcamStream) {
            const mediaStream = new MediaStream();
            mediaStream.addTrack(webcamStream.track);
            webcamRef.current.srcObject = mediaStream;
            webcamRef.current.play().catch((err) => console.error("Webcam error", err));
        } 
        // CASE 3: No Video
        else {
            webcamRef.current.srcObject = null;
        }
    }
  }, [webcamStream, webcamOn, screenShareStream, screenShareOn]);

  return (
    <div className="w-full h-full bg-black relative flex items-center justify-center">
      <audio ref={micRef} autoPlay muted={isLocal} />

      {(webcamOn || screenShareOn) ? (
        <video
          ref={webcamRef}
          autoPlay
          playsInline
          muted={isLocal} 
          style={{ 
             width: "100%", 
             height: "100%", 
             objectFit: "contain",
             // Mirror ONLY if it's the Local Webcam (don't mirror screen share!)
             transform: (isLocal && webcamOn && !screenShareOn) ? "scaleX(-1)" : "none" 
          }}
        />
      ) : (
        <div className="flex flex-col items-center justify-center text-gray-500">
            <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center mb-4">
                <span className="text-4xl">📷</span>
            </div>
            <p>Camera is off</p>
        </div>
      )}
      
      {!micOn && (
          <div className="absolute top-4 right-4 bg-red-600/90 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
              <span>Muted</span>
          </div>
      )}
    </div>
  );
};

export default ParticipantView;