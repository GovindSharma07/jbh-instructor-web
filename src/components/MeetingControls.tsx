import React from 'react';
import { useMeeting } from '@videosdk.live/react-sdk';
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { lmsService } from '../api/lmsService'; 
import toast from 'react-hot-toast';

interface Props {
  liveLectureId?: number; 
}

const MeetingControls = ({ liveLectureId }: Props) => {
  // [FIX] Destructure 'end' method to close room for everyone
  const { toggleMic, toggleWebcam, leave, end, localMicOn, localWebcamOn } = useMeeting();
  const navigate = useNavigate();

  const handleEndClass = async () => {
    // 1. Confirm intention
    const confirm = window.confirm("Are you sure you want to end the class? This will disconnect all students.");
    if (!confirm) return;

    // 2. Notify Backend to mark class as ended in DB
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
    } else {
       console.warn("No liveLectureId provided to controls - Backend not updated.");
    }

    // 3. Terminate Video Room for EVERYONE
    // 'end()' kicks all participants. 'leave()' only removes you.
    if (end) {
      end();
    } else {
      leave(); // Fallback if user doesn't have moderator permissions
    }
    
    // 4. Redirect
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
      >
         {localMicOn ? <Mic size={20} /> : <MicOff size={20} />}
      </button>

      {/* Camera Button */}
      <button 
        onClick={() => toggleWebcam()} 
        className={`p-3 rounded-full transition-colors ${
            localWebcamOn ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white'
        }`}
      >
         {localWebcamOn ? <Video size={20} /> : <VideoOff size={20} />}
      </button>

      {/* END CLASS BUTTON */}
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