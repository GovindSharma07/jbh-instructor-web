import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { lmsService } from '../api/lmsService';
import type { ScheduleItem } from '../api/lmsService';
import { Calendar, Clock, Video, BookOpen, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const SchedulePage = () => {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Track which specific class is currently starting (for button loading state)
  const [startingClassId, setStartingClassId] = useState<number | null>(null);
  
  const navigate = useNavigate();

  // Fetch data on mount
  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    try {
      const data = await lmsService.getSchedule();
      setSchedule(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load schedule", error);
      toast.error("Could not load schedule.");
    } finally {
      setLoading(false);
    }
  };

  // Helper to format time safely (Handles UTC to Local conversion)
  const formatTime = (timeValue: string) => {
    if (!timeValue) return "--:--";
    try {
      // Create date object (Auto-converts UTC to Local Time)
      const date = new Date(timeValue.includes("T") ? timeValue : `2000-01-01T${timeValue}`);
      
      if (isNaN(date.getTime())) return timeValue; 

      return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      }).format(date);
    } catch (e) {
      return timeValue;
    }
  };

  // Handle "Start Class" Click
  const handleStartClass = async (classItem: ScheduleItem) => {
    // Prevent double clicks
    if (startingClassId) return;

    setStartingClassId(classItem.schedule_id);
    toast.loading(`Starting ${classItem.course.title}...`);
    
    try {
     const result = await lmsService.startClass(classItem.schedule_id, "Live Session");
    
     toast.dismiss();
     toast.success("Class Started Successfully!");

     // [CRITICAL FIX]: You MUST pass the token here. 
     // The LiveClassPage expects { roomId, token, liveLectureId }
     navigate('/live', { 
       state: { 
         roomId: result.roomId,
         token: result.token,         // <--- ADDED THIS (Vital for VideoSDK)
         liveLectureId: result.liveLectureId
       } 
     });

    } catch (error: any) {
      toast.dismiss();
      console.error("Start class error:", error);
      toast.error(error.response?.data?.message || "Failed to start class");
    } finally {
      setStartingClassId(null);
    }
  };

  if (loading) {
    return (
        <div className="flex h-64 items-center justify-center text-gray-500 gap-2">
            <Loader2 className="animate-spin" /> Loading your schedule...
        </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Schedule</h1>
        <p className="text-gray-500">Manage your upcoming classes and live sessions.</p>
      </div>

      {schedule.length === 0 ? (
        <div className="bg-white p-12 rounded-xl text-center border border-dashed border-gray-300">
          <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-900">No classes scheduled</h3>
          <p className="text-gray-500">You don't have any classes assigned for today.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {schedule.map((item) => (
            <div key={item.schedule_id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
              
              {/* Card Header / Image */}
              <div className="h-28 bg-gray-800 relative group">
                 {item.course.thumbnail_url ? (
                   <img 
                     src={item.course.thumbnail_url} 
                     alt={item.course.title}
                     className="w-full h-full object-cover opacity-60 group-hover:opacity-50 transition-opacity"
                   />
                 ) : (
                    <div className="w-full h-full bg-gradient-to-r from-blue-900 to-gray-900 opacity-90" />
                 )}
                 <div className="absolute bottom-3 left-4 right-4">
                    <h3 className="text-white font-bold text-lg leading-tight drop-shadow-md truncate">
                        {item.course.title}
                    </h3>
                 </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center gap-2 text-gray-700 mb-2">
                  <Clock size={16} className="text-blue-600" />
                  <span className="text-sm font-semibold">
                    {formatTime(item.start_time)} - {formatTime(item.end_time)}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-6">
                  <BookOpen size={16} />
                  <span className="capitalize">{item.schedule_type} Class</span>
                </div>

                <div className="mt-auto">
                    <button
                    onClick={() => handleStartClass(item)}
                    disabled={startingClassId !== null}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-all ${
                        startingClassId === item.schedule_id 
                            ? 'bg-blue-800 text-white cursor-wait'
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow hover:shadow-lg'
                    }`}
                    >
                    {startingClassId === item.schedule_id ? (
                        <>
                            <Loader2 size={18} className="animate-spin" /> Starting...
                        </>
                    ) : (
                        <>
                            <Video size={18} /> Start Live Class
                        </>
                    )}
                    </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SchedulePage;