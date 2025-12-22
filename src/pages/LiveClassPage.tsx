import { useEffect, useState } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { MeetingProvider, MeetingConsumer, useMeeting } from '@videosdk.live/react-sdk';
import { useAuth } from '../context/AuthContext';
import ParticipantView from '../components/ParticipantView';
import MeetingControls from '../components/MeetingControls';
import toast from 'react-hot-toast';

// --- DEBUG COMPONENT TO CATCH SDK ERRORS ---
const MeetingStatusListener = () => {
    useMeeting({
        onMeetingJoined: () => {
            console.log("✅ SDK: Successfully Joined Meeting!");
            toast.success("Connected to Class");
        },
        onMeetingLeft: () => {
            console.log("⚠️ SDK: Left Meeting");
        },
        onError: (data) => {
            console.error("❌ SDK ERROR:", data);
            toast.error(`Connection Failed: ${data.message} (Code: ${data.code})`);
        }
    });
    return null; 
};

// --- VIDEO GRID COMPONENT ---
const VideoGrid = () => {
    const { participants, localParticipant } = useMeeting();
    const { user } = useAuth();
    const participantIds = [...participants.keys()];

    return (
        <div className="flex flex-col flex-1 bg-black overflow-hidden">
            <div className="h-14 bg-gray-900 flex items-center px-4 justify-between border-b border-gray-800 shrink-0">
                <h1 className="text-white font-medium">Live Class</h1>
                <div className="text-gray-400 text-sm">Instructor: {user?.fullName}</div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
                    {participantIds.map((participantId) => (
                        <ParticipantView key={participantId} participantId={participantId} />
                    ))}
                </div>
                {participantIds.length === 0 && (
                    <div className="text-gray-500 text-center mt-10">
                        Connecting to room...
                    </div>
                )}
            </div>
        </div>
    );
};

// --- MAIN PAGE COMPONENT ---
const LiveClassPage = () => {
    const { user } = useAuth();
    const location = useLocation();
    
    // State to hold the active session data (either from Nav or Storage)
    const [sessionData, setSessionData] = useState<{roomId: string, token: string, liveLectureId: number} | null>(null);
    const [permissionGranted, setPermissionGranted] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    // 1. Handle Session Persistence (Fix for Refresh Issue)
    useEffect(() => {
        const navState = location.state;
        const storedState = localStorage.getItem('active_live_class');

        if (navState?.roomId && navState?.token) {
            // Case A: Fresh Navigation -> Save to Storage
            console.log("🆕 New Session Detected, Saving to Storage");
            const newData = {
                roomId: navState.roomId,
                token: navState.token,
                liveLectureId: navState.liveLectureId
            };
            localStorage.setItem('active_live_class', JSON.stringify(newData));
            setSessionData(newData);
        } else if (storedState) {
            // Case B: Page Refresh -> Restore from Storage
            console.log("🔄 Page Refreshed, Restoring Session from Storage");
            setSessionData(JSON.parse(storedState));
        } else {
            // Case C: No Data -> Redirect
            console.error("❌ No Session Data found. Redirecting.");
        }
    }, [location.state]);

    // 2. Request Permissions
    const requestMediaPermissions = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            stream.getTracks().forEach(track => track.stop());
            setPermissionGranted(true);
            setErrorMsg("");
        } catch (err: any) {
            console.error("Permission denied:", err);
            setPermissionGranted(false);
            setErrorMsg(err.message || "Camera/Mic Permission Denied");
        }
    };

    useEffect(() => {
        requestMediaPermissions();
    }, []);

    // 3. Clear Storage when component unmounts (Optional: or keep it to allow rejoin)
    // We generally keep it in case of accidental tab close, but you can clear it explicitly on "End Class".

    // Loading State while checking storage
    if (!sessionData) {
        // Only redirect if we checked everything and found nothing
        if (sessionData === null && !location.state && !localStorage.getItem('active_live_class')) {
             return <Navigate to="/dashboard" replace />;
        }
        return <div className="bg-black h-screen text-white flex items-center justify-center">Loading Session...</div>;
    }

    if (!user) return <Navigate to="/dashboard" />;

    if (!permissionGranted) {
        return (
            <div className="h-screen bg-black flex flex-col items-center justify-center text-white">
                <h2 className="text-xl font-bold mb-4">Camera & Mic Permission Required</h2>
                <p className="text-red-500 mb-6 bg-gray-800 p-4 rounded">{errorMsg || "Waiting for access..."}</p>
                <button onClick={requestMediaPermissions} className="bg-blue-600 px-6 py-2 rounded">
                    Request Access
                </button>
            </div>
        );
    }

    return (
        <MeetingProvider
            config={{
                meetingId: sessionData.roomId,
                micEnabled: true,
                webcamEnabled: true,
                name: user.fullName,
                debugMode: true, 
            }}
            token={sessionData.token}
            joinWithoutUserInteraction={true}
        >
            <MeetingConsumer>
                {() => (
                   <div className="flex flex-col h-screen bg-black">
                     <MeetingStatusListener />
                     <div className="flex-1 overflow-hidden">
                        <VideoGrid /> 
                     </div>
                     {/* Pass the ID to controls */}
                     <MeetingControls liveLectureId={sessionData.liveLectureId} />
                   </div>
                )}
            </MeetingConsumer>
        </MeetingProvider>
    );
};

export default LiveClassPage;