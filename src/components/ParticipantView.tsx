import { useEffect, useMemo, useRef } from 'react';
import { useParticipant } from '@videosdk.live/react-sdk';
import { MicOff } from 'lucide-react';

interface Props {
  participantId: string;
}

const ParticipantView = ({ participantId }: Props) => {
  const micRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null); // 1. Create Ref for Video
  
  const { webcamStream, micStream, webcamOn, micOn, isLocal, displayName } =
    useParticipant(participantId);

  // --- Audio Logic ---
  useEffect(() => {
    if (micRef.current) {
      if (micOn && micStream) {
        const mediaStream = new MediaStream();
        mediaStream.addTrack(micStream.track);
        micRef.current.srcObject = mediaStream;
        micRef.current.play().catch((err) => console.error("Audio play error", err));
      } else {
        micRef.current.srcObject = null;
      }
    }
  }, [micStream, micOn]);

  // --- Video Logic ---
  const videoStream = useMemo(() => {
    if (webcamOn && webcamStream) {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(webcamStream.track);
      return mediaStream;
    }
    return null;
  }, [webcamStream, webcamOn]);

  // 2. Attach Stream to Video Element
  useEffect(() => {
    if (videoRef.current) {
      if (webcamOn && videoStream) {
        videoRef.current.srcObject = videoStream;
        videoRef.current.play().catch((err) => console.error("Video play error", err));
      } else {
        videoRef.current.srcObject = null;
      }
    }
  }, [videoStream, webcamOn]);

  return (
    <div className="relative bg-gray-800 rounded-lg overflow-hidden aspect-video flex items-center justify-center group">
      
      {/* Audio Element */}
      <audio ref={micRef} autoPlay playsInline muted={isLocal} />

      {/* 3. Native Video Element (Replaces ReactPlayer) */}
      {webcamOn && videoStream ? (
        <video 
          ref={videoRef}
          autoPlay 
          playsInline 
          muted={true} // Always mute the video track element to avoid echo/autoplay issues (audio is handled above)
          className="w-full h-full object-cover"
        />
      ) : (
        // Fallback Avatar
        <div className="h-20 w-20 rounded-full bg-gray-600 flex items-center justify-center text-white text-2xl font-bold">
          {displayName?.charAt(0)?.toUpperCase() || "?"}
        </div>
      )}

      {/* Name Label */}
      <div className="absolute bottom-3 left-3 bg-black/50 px-3 py-1 rounded text-white text-sm backdrop-blur-sm flex items-center gap-2">
        <span>{displayName} {isLocal && "(You)"}</span>
        {!micOn && <MicOff size={14} className="text-red-400" />}
      </div>
    </div>
  );
};

export default ParticipantView;