import React, { useEffect, useState } from 'react';
import { Meeting } from '../../types';
import { toast } from 'react-hot-toast';
import { differenceInMinutes, parseISO } from 'date-fns';
import { Video, Bell } from 'lucide-react';

interface MeetingReminderProps {
  meetings: Meeting[];
}

export const MeetingReminder: React.FC<MeetingReminderProps> = ({ meetings }) => {
  const [notifiedMeetings, setNotifiedMeetings] = useState<Set<string>>(new Set());

  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      
      meetings.forEach(meeting => {
        if (meeting.status !== 'Accepted' && meeting.status !== 'Pending') return;
        
        const meetingTime = parseISO(`${meeting.date}T${meeting.time}`);
        const diff = differenceInMinutes(meetingTime, now);
        
        // 1 hour reminder
        if (diff === 60 && !notifiedMeetings.has(`${meeting.id}-60`)) {
          toast((t) => (
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#6366F1] rounded-full flex items-center justify-center text-white">
                <Bell size={20} />
              </div>
              <div>
                <p className="font-black text-xs uppercase tracking-widest">Meeting in 1 hour</p>
                <p className="text-[10px] text-white/60 uppercase">{meeting.title}</p>
              </div>
            </div>
          ), { duration: 5000 });
          setNotifiedMeetings(prev => new Set(prev).add(`${meeting.id}-60`));
        }
        
        // 10 minute reminder
        if (diff === 10 && !notifiedMeetings.has(`${meeting.id}-10`)) {
          toast((t) => (
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#6366F1] rounded-full flex items-center justify-center text-white">
                <Video size={20} />
              </div>
              <div>
                <p className="font-black text-xs uppercase tracking-widest">Meeting starting soon!</p>
                <p className="text-[10px] text-white/60 uppercase">Join in 10 minutes</p>
              </div>
            </div>
          ), { duration: 8000 });
          setNotifiedMeetings(prev => new Set(prev).add(`${meeting.id}-10`));
        }
      });
    };

    const interval = setInterval(checkReminders, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [meetings, notifiedMeetings]);

  return null;
};
