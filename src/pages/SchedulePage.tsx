import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // <--- Import useNavigate
import { lmsService } from '../api/lmsService';
import type { ScheduleItem } from '../api/lmsService';
import { Calendar, Clock, Video, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

const SchedulePage = () => {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate(); // <--- FIXED: Initialize the hook here

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

  // Helper to format time safely
  const formatTime = (timeValue: string) => {
    try {
      // 1. If it's already a simple time string like "10:00" or "14:30"
      if (timeValue.includes(":") && !timeValue.includes("T")) {
        const [hours, minutes] = timeValue.split(':');
        const date = new Date();
        date.setHours(parseInt(hours), parseInt(minutes));
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }

      // 2. If it's a full ISO string (e.g., "2025-12-20T10:00:00Z")
      const date = new Date(timeValue);
      if (isNaN(date.getTime())) return timeValue; // Fallback if parsing fails
      
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return timeValue; // Just return the text if all else fails
    }
  };

  // Handle "Start Class" Click
  const handleStartClass = async (classItem: ScheduleItem) => {
    toast.loading(`Starting ${classItem.course.title}...`);
    
    try {
     const result = await lmsService.startClass(classItem.schedule_id, "Live Session");
    
    navigate('/dashboard/live', { 
      state: { 
        roomId: result.roomId,
        liveLectureId: result.liveLectureId // <--- PASS THIS ID
      } 
    });

    } catch (error: any) {
      toast.dismiss();
      toast.error(error.response?.data?.message || "Failed to start class");
    }
  };

  if (loading) {
    return <div className="p-10 text-center">Loading your schedule...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Schedule</h1>
        <p className="text-gray-500">Manage your upcoming classes and live sessions.</p>
      </div>

      {schedule.length === 0 ? (
        <div className="bg-white p-8 rounded-xl text-center border border-dashed border-gray-300">
          <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-900">No classes scheduled</h3>
          <p className="text-gray-500">You don't have any classes assigned for today.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {schedule.map((item) => (
            <div key={item.schedule_id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              
              <div className="h-24 bg-primary relative">
                 {item.course.thumbnail_url && (
                   <img 
                     src={item.course.thumbnail_url} 
                     alt={item.course.title}
                     className="w-full h-full object-cover opacity-50"
                   />
                 )}
                 <div className="absolute bottom-3 left-4 text-white font-bold text-lg drop-shadow-md">
                   {item.course.title}
                 </div>
              </div>

              <div className="p-5">
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <Clock size={16} className="text-primary" />
                  <span className="text-sm font-medium">
                    {formatTime(item.start_time)} - {formatTime(item.end_time)}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-6">
                  <BookOpen size={16} />
                  <span className="capitalize">{item.schedule_type} Class</span>
                </div>

                <button
                  onClick={() => handleStartClass(item)}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-white py-2.5 rounded-lg hover:bg-opacity-90 transition-colors font-medium cursor-pointer"
                >
                  <Video size={18} />
                  Start Live Class
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SchedulePage;