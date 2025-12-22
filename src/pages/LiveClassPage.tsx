import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom'; // [FIX] Removed 'Navigate'
import { MeetingProvider, MeetingConsumer, useMeeting, useParticipant } from '@videosdk.live/react-sdk';
import { useAuth } from '../context/AuthContext';
import ParticipantView from '../components/ParticipantView';
import MeetingControls from '../components/MeetingControls';
import Whiteboard, { type WhiteboardRef } from '../components/Whiteboard';
import ChatPanel from '../components/ChatPanel';
import toast from 'react-hot-toast';
import { Users, Presentation, MonitorOff, MessageSquare } from 'lucide-react';

// --- DEBUG COMPONENT ---
const MeetingStatusListener = () => {
    useMeeting({
        onMeetingJoined: () => { console.log("✅ SDK Joined"); toast.success("You are Live!"); },
        onError: (data) => { console.error("❌ SDK ERROR:", data); toast.error(`Connection Failed: ${data.message}`); }
    });
    return null; 
};

// --- STUDENT LIST ITEM ---
const StudentListItem = ({ participantId }: { participantId: string }) => {
    const { displayName } = useParticipant(participantId);
    return (
        <div className="flex items-center gap-3 p-3 border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
            <div className="w-8 h-8 rounded-full bg-blue-900/50 flex items-center justify-center text-blue-200 text-xs font-bold border border-blue-800">
                {displayName?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <span className="text-gray-300 text-sm truncate">{displayName || "Student"}</span>
            <span className="ml-auto w-2 h-2 rounded-full bg-green-500"></span>
        </div>
    );
};

// --- CAMERA VIEW HELPER ---
const ClassroomCameraView = () => {
    const { localParticipant } = useMeeting();
    if (!localParticipant?.id) return <div className="text-white">Initializing...</div>;
    return <ParticipantView participantId={localParticipant.id} />;
};

// --- SIDEBAR WITH TABS (STUDENTS / CHAT) ---
const ClassroomSidebar = () => {
    const { participants, localParticipant } = useMeeting();
    const studentIds = [...participants.keys()].filter(id => id !== localParticipant?.id);
    const [activeTab, setActiveTab] = useState<'students' | 'chat'>('chat');

    return (
        <div className="w-80 bg-gray-900 border-l border-gray-800 flex flex-col">
            <div className="flex border-b border-gray-800">
                <button 
                    onClick={() => setActiveTab('students')}
                    className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                        activeTab === 'students' 
                        ? 'text-white border-b-2 border-blue-500 bg-gray-800/50' 
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                >
                    <Users size={16} />
                    Students <span className="text-xs bg-gray-700 px-1.5 rounded-full">{studentIds.length}</span>
                </button>
                <button 
                    onClick={() => setActiveTab('chat')}
                    className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                        activeTab === 'chat' 
                        ? 'text-white border-b-2 border-blue-500 bg-gray-800/50' 
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                >
                    <MessageSquare size={16} />
                    Chat
                </button>
            </div>

            <div className="flex-1 overflow-hidden relative bg-gray-900">
                {activeTab === 'students' ? (
                    <div className="absolute inset-0 overflow-y-auto custom-scrollbar">
                        {studentIds.length > 0 ? (
                            studentIds.map(id => <StudentListItem key={id} participantId={id} />)
                        ) : (
                            <div className="flex flex-col items-center justify-center h-40 text-gray-500 text-sm p-4 text-center">
                                <p>No students yet.</p>
                                <p className="text-xs mt-1">They will appear here when they join.</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="absolute inset-0">
                         <ChatPanel />
                    </div>
                )}
            </div>
        </div>
    );
};

// --- MAIN LOGIC WRAPPER ---
const LiveClassLogic = ({ liveLectureId }: { liveLectureId: number }) => {
    const { 
        enableWebcam, 
        disableWebcam, 
        enableScreenShare, 
        disableScreenShare, 
        presenterId, 
        localParticipant 
    } = useMeeting();

    const [isWhiteboardActive, setIsWhiteboardActive] = useState(false);
    const whiteboardRef = useRef<WhiteboardRef>(null);

    // ============================================================
    // [FIX 1] AUTO-PIN INSTRUCTOR (Passed "CAM" type)
    // ============================================================
    useEffect(() => {
        if (localParticipant) {
            localParticipant.pin("CAM"); // <--- Specifying "CAM" fixes the error
            console.log("📍 Instructor automatically pinned for recording.");
        }
    }, [localParticipant]);

    const isScreenShareActive = presenterId === localParticipant?.id;

    // --- WHITEBOARD TOGGLE ---
    const handleWhiteboardToggle = async () => {
        if (isScreenShareActive) {
            toast.error("Please stop Screen Share first");
            return;
        }

        if (isWhiteboardActive) {
            // STOP Whiteboard -> START Camera
            setIsWhiteboardActive(false);
            disableWebcam(); 
            setTimeout(() => { 
                enableWebcam(); 
                // [FIX 2] Pin Camera
                localParticipant?.pin("CAM"); 
                toast("Switched to Camera"); 
            }, 500);
        } else {
            // START Whiteboard -> STOP Camera
            setIsWhiteboardActive(true);
            setTimeout(async () => {
                const stream = whiteboardRef.current?.getStream();
                if (stream?.getVideoTracks()[0]) {
                    disableWebcam();
                    setTimeout(() => {
                        enableWebcam(stream);
                        // [FIX 3] Whiteboard is streamed as a Camera track, so we pin "CAM"
                        localParticipant?.pin("CAM");
                        toast.success("Whiteboard Active");
                    }, 500);
                } else {
                    toast.error("Failed to capture whiteboard");
                    setIsWhiteboardActive(false);
                }
            }, 100);
        }
    };

    // --- SCREEN SHARE TOGGLE ---
    const handleScreenShareToggle = async () => {
        if (isWhiteboardActive) {
            toast.error("Please close Whiteboard first");
            return;
        }

        if (isScreenShareActive) {
            // STOP Screen Share -> START Camera
            disableScreenShare();
            setTimeout(() => {
                enableWebcam(); 
                // [FIX 4] Pin Camera
                localParticipant?.pin("CAM"); 
                toast("Switched to Camera");
            }, 1000); 
        } else {
            // START Screen Share -> STOP Camera
            disableWebcam();
            
            setTimeout(() => {
                enableScreenShare();
                // [FIX 5] Pin Screen Share
                localParticipant?.pin("SHARE"); 
            }, 500);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-black">
            <MeetingStatusListener />
            
            <div className="flex flex-1 overflow-hidden bg-black">
                <div className="flex-1 flex flex-col p-4 relative">
                    <div className="absolute top-4 left-4 z-10 bg-red-600 px-3 py-1 rounded text-white text-xs font-bold flex items-center gap-2 shadow-lg">
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                        LIVE
                    </div>

                    {!isScreenShareActive && (
                        <button 
                            onClick={handleWhiteboardToggle}
                            className="absolute top-4 right-4 z-20 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg transition-colors border border-gray-600"
                        >
                            {isWhiteboardActive ? <MonitorOff size={18}/> : <Presentation size={18}/>}
                            {isWhiteboardActive ? "Close Whiteboard" : "Open Whiteboard"}
                        </button>
                    )}

                     <div className="flex-1 bg-gray-900 rounded-xl overflow-hidden border border-gray-800 relative shadow-2xl flex items-center justify-center">
                        <div className="w-full h-full" style={{ display: isWhiteboardActive ? 'block' : 'none' }}>
                            <Whiteboard ref={whiteboardRef} />
                        </div>
                        <div className="w-full h-full" style={{ display: !isWhiteboardActive ? 'block' : 'none' }}>
                             <ClassroomCameraView />
                        </div>
                     </div>
                </div>
                <ClassroomSidebar />
            </div>

            <MeetingControls 
                liveLectureId={liveLectureId} 
                isWhiteboardActive={isWhiteboardActive}
                onScreenShareClick={handleScreenShareToggle} 
                isScreenShareActive={isScreenShareActive}   
            />
        </div>
    );
};

// --- PAGE WRAPPER ---
const LiveClassPage = () => {
    const { user } = useAuth();
    const location = useLocation();
    const [sessionData, setSessionData] = useState<{roomId: string, token: string, liveLectureId: number} | null>(null);

    useEffect(() => {
        const navState = location.state;
        const storedState = localStorage.getItem('active_live_class');
        if (navState?.roomId) {
            setSessionData(navState);
            localStorage.setItem('active_live_class', JSON.stringify(navState));
        } else if (storedState) {
            setSessionData(JSON.parse(storedState));
        }
    }, [location.state]);

    if (!sessionData || !user) return <div className="bg-black text-white h-screen flex items-center justify-center">Loading...</div>;

    return (
        <MeetingProvider
            config={{
                meetingId: sessionData.roomId,
                micEnabled: true,
                webcamEnabled: true,
                name: user.fullName,
                mode: "SEND_AND_RECV",
                debugMode: true,
            }}
            token={sessionData.token}
            joinWithoutUserInteraction={true}
        >
            <MeetingConsumer>
                {() => <LiveClassLogic liveLectureId={sessionData.liveLectureId} />}
            </MeetingConsumer>
        </MeetingProvider>
    );
};

export default LiveClassPage;