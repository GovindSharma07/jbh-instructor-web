import React from 'react';
import { useMeeting } from '@videosdk.live/react-sdk';
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { lmsService } from '../api/lmsService'; // Import Service
import toast from 'react-hot-toast';

interface Props {
  liveLectureId?: number; // Accept the ID
}

const MeetingControls = ({ liveLectureId }: Props) => {
  const { toggleMic, toggleWebcam, leave, localMicOn, localWebcamOn } = useMeeting();
  const navigate = useNavigate();

  const handleEndClass = async () => {
    // 1. Tell Backend to close the class
    if (liveLectureId) {
      try {
        toast.loading("Ending class...");
        await lmsService.endClass(liveLectureId);
        toast.dismiss();
        toast.success("Class Ended Successfully");
      } catch (error) {
        console.error("Failed to mark class as ended", error);
        // We continue to leave anyway so the instructor isn't stuck
      }
    }

    // 2. Disconnect from VideoSDK
    leave();
    
    // 3. Go back to Dashboard
    navigate('/dashboard');
  };

  return (
    <div className="h-16 bg-gray-900 border-t border-gray-800 flex items-center justify-center gap-4 px-4">
      {/* Mic & Camera Buttons (Keep existing) */}
      <button onClick={() => toggleMic()} className="...">
         {localMicOn ? <Mic /> : <MicOff />}
      </button>
      <button onClick={() => toggleWebcam()} className="...">
         {localWebcamOn ? <Video /> : <VideoOff />}
      </button>

      {/* END CLASS BUTTON */}
      <button
        onClick={handleEndClass} // <--- Call the new function
        className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white px-6 flex items-center gap-2"
      >
        <PhoneOff size={20} />
        <span className="font-medium">End Class</span>
      </button>
    </div>
  );
};

export default MeetingControls;