import axiosClient from './axiosClient';

export interface ScheduleItem {
  schedule_id: number;
  course_id: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
  schedule_type: 'recurring' | 'one-time';
  course: {
    title: string;
    thumbnail_url?: string;
  };
}

export const lmsService = {
  getSchedule: async () => {
    const response = await axiosClient.get('/lms/instructor/schedule');
    // FIX: Return .schedule instead of the whole object
    return response.data.schedule; 
  },

  startClass: async (scheduleId: number, topic: string) => {
    const response = await axiosClient.post('/lms/instructor/start-class', {
      scheduleId,
      topic
    });
    return response.data;
  },

  endClass: async (liveLectureId: number) => {
    // Matches backend route: POST /api/lms/instructor/end-class
    const response = await axiosClient.post('/lms/instructor/end-class', {
      liveLectureId
    });
    return response.data;
  }
};