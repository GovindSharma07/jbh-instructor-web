import { useState } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { MeetingProvider, MeetingConsumer, useMeeting } from '@videosdk.live/react-sdk';
import { useAuth } from '../context/AuthContext';
import ParticipantView from '../components/ParticipantView';
import MeetingControls from '../components/MeetingControls';

// The Inner Component (Actual Video Grid)
const VideoGrid = () => {
    const { participants } = useMeeting();
    const { user } = useAuth();

    // Filter participants (My video + Students)
    const participantIds = [...participants.keys()];

    return (
        <div className="flex flex-col h-screen bg-black">
            {/* Header */}
            <div className="h-14 bg-gray-900 flex items-center px-4 justify-between border-b border-gray-800">
                <h1 className="text-white font-medium">Live Class</h1>
                <div className="text-gray-400 text-sm">Instructor: {user?.fullName}</div>
            </div>

            {/* Main Video Area */}
            <div className="flex-1 p-4 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
                    {participantIds.map((participantId) => (
                        <ParticipantView key={participantId} participantId={participantId} />
                    ))}
                </div>
            </div>

            {/* Bottom Bar */}
            <MeetingControls />
        </div>
    );
};

// The Wrapper (Initializes the SDK)
const LiveClassPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  const roomId = location.state?.roomId;
  const token = location.state?.token; 
  const liveLectureId = location.state?.liveLectureId; 

  if (!roomId || !user) {
    return <Navigate to="/dashboard/schedule" />;
  }

  const authToken = token || "YOUR_TEMPORARY_JWT_TOKEN"; 

  return (
    <MeetingProvider
      // 1. Config Object (Only holds Meeting settings)
      config={{
        meetingId: roomId,
        micEnabled: true,
        webcamEnabled: true,
        name: user.fullName,
        debugMode: false,
      }}
      // 2. Auth Token
      token={authToken}
      
      // 3. THIS IS WHERE IT BELONGS (Top-level prop)
      joinWithoutUserInteraction={true} 
    >
      <MeetingConsumer>
        {() => (
           <div className="flex flex-col h-screen bg-black">
             {/* ... Header and VideoGrid ... */}
             <VideoGrid /> 
             
             {/* Pass the ID to controls */}
             <MeetingControls liveLectureId={liveLectureId} />
           </div>
        )}
      </MeetingConsumer>
    </MeetingProvider>
  );
};

export default LiveClassPage;