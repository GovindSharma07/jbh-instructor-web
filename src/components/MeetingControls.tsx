import { useMeeting } from '@videosdk.live/react-sdk';
import { Mic, MicOff, Video, VideoOff, PhoneOff, MonitorUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { lmsService } from '../api/lmsService'; 
import toast from 'react-hot-toast';

interface Props {
  liveLectureId?: number; 
  isWhiteboardActive?: boolean;
  onScreenShareClick: () => void; // New Callback
  isScreenShareActive: boolean;   // New Prop
}

const MeetingControls = ({ 
    liveLectureId, 
    isWhiteboardActive = false, 
    onScreenShareClick, 
    isScreenShareActive 
}: Props) => {
    
  const { toggleMic, toggleWebcam, leave, end, localMicOn, localWebcamOn } = useMeeting();
  const navigate = useNavigate();

  const handleEndClass = async () => {
    const confirm = window.confirm("Are you sure you want to end the class? This will disconnect all students.");
    if (!confirm) return;

    if (liveLectureId) {
      try {
        toast.loading("Ending class...");
        await lmsService.endClass(liveLectureId);
        toast.dismiss();
        toast.success("Class Ended Successfully");
      } catch (error) {
        console.error("Failed to mark class as ended in backend", error);
        toast.error("Error ending class in database, but closing video room.");
      }
    }

    if (end) end(); else leave();
    navigate('/dashboard');
  };

  return (
    <div className="h-16 bg-gray-900 border-t border-gray-800 flex items-center justify-center gap-4 px-4">
      
      {/* Mic Button */}
      <button 
        onClick={() => toggleMic()} 
        className={`p-3 rounded-full transition-colors ${
            localMicOn ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white'
        }`}
        title="Toggle Microphone"
      >
         {localMicOn ? <Mic size={20} /> : <MicOff size={20} />}
      </button>

      {/* Camera Button */}
      <button 
        onClick={() => {
            if (!isWhiteboardActive && !isScreenShareActive) toggleWebcam();
        }} 
        disabled={isWhiteboardActive || isScreenShareActive}
        className={`p-3 rounded-full transition-colors ${
            (isWhiteboardActive || isScreenShareActive)
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-50'
                : localWebcamOn 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'bg-red-500 hover:bg-red-600 text-white'
        }`}
        title="Toggle Camera"
      >
         {localWebcamOn ? <Video size={20} /> : <VideoOff size={20} />}
      </button>

      {/* Screen Share Button */}
      <button 
        onClick={onScreenShareClick}
        disabled={isWhiteboardActive}
        className={`p-3 rounded-full transition-colors ${
            isWhiteboardActive
             ? 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-50'
             : isScreenShareActive 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-gray-700 hover:bg-gray-600 text-white'
        }`}
        title="Share Screen"
      >
         <MonitorUp size={20} />
      </button>

      {/* End Class */}
      <button
        onClick={handleEndClass} 
        className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white px-6 flex items-center gap-2 transition-colors"
      >
        <PhoneOff size={20} />
        <span className="font-medium">End Class</span>
      </button>
    </div>
  );
};

export default MeetingControls;