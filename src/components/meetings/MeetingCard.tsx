import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Video, 
  ExternalLink, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  MoreVertical,
  Trash2,
  Edit2,
  AlertCircle,
  Download,
  Share2
} from 'lucide-react';
import { Meeting, MeetingStatus } from '../../types';
import { format, isAfter, isBefore, addMinutes, differenceInSeconds } from 'date-fns';
import { generateGoogleCalendarUrl, generateOutlookCalendarUrl, downloadIcsFile } from '../../services/calendarUtils';
import { AnimatePresence } from 'framer-motion';

interface MeetingCardProps {
  meeting: Meeting;
  isAdmin: boolean;
  onStatusUpdate?: (id: string, status: MeetingStatus, message?: string, preferredDate?: string, preferredTime?: string) => void;
  onEdit?: (meeting: Meeting) => void;
  onDelete?: (id: string) => void;
}

export const MeetingCard: React.FC<MeetingCardProps> = ({ 
  meeting, 
  isAdmin, 
  onStatusUpdate,
  onEdit,
  onDelete
}) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isJoinable, setIsJoinable] = useState(false);
  const [showRescheduleInput, setShowRescheduleInput] = useState(false);
  const [rescheduleMsg, setRescheduleMsg] = useState('');
  const [rescheduleDate, setRescheduleDate] = useState(meeting.date);
  const [rescheduleTime, setRescheduleTime] = useState(meeting.time);
  const [showSyncOptions, setShowSyncOptions] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const meetingDateTime = new Date(`${meeting.date}T${meeting.time}`);
      const now = new Date();
      
      const diff = differenceInSeconds(meetingDateTime, now);
      
      if (diff > 0) {
        const days = Math.floor(diff / 86400);
        const hours = Math.floor((diff % 86400) / 3600);
        const mins = Math.floor((diff % 3600) / 60);
        const secs = diff % 60;
        
        let timerStr = '';
        if (days > 0) timerStr += `${days}d `;
        if (hours > 0 || days > 0) timerStr += `${hours}hr `;
        if (mins > 0 || hours > 0 || days > 0) timerStr += `${mins}mins `;
        timerStr += `${secs}sec left`;
        
        setTimeLeft(timerStr);
      } else {
        setTimeLeft('00:00');
      }

      // Joinable 10 mins before and up to 1 hour after
      const joinStartTime = addMinutes(meetingDateTime, -10);
      const joinEndTime = addMinutes(meetingDateTime, 60);
      setIsJoinable(isAfter(now, joinStartTime) && isBefore(now, joinEndTime));
    }, 1000);

    return () => clearInterval(timer);
  }, [meeting.date, meeting.time]);

  const getStatusColor = (status: MeetingStatus) => {
    switch (status) {
      case 'pending': return 'bg-#c7c42a/20 text-#c7c42a border-#c7c42a/30';
      case 'accepted': return 'bg-green-500/20 text-green-500 border-green-500/30';
      case 'declined': return 'bg-red-500/20 text-red-500 border-red-500/30';
      case 'completed': return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      case 'missed': return 'bg-gray-500/20 text-gray-500 border-gray-500/30';
      default: return 'bg-white/10 text-white border-white/20';
    }
  };

  const platformColor = meeting.platform === 'Google Meet' ? 'text-green-400 bg-green-400/10' : 'text-blue-400 bg-blue-400/10';

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 border border-white/10 p-6 rounded-3xl space-y-6 hover:border-[#c7c42a]/30 transition-all group"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-black uppercase italic tracking-tighter">{meeting.title}</h3>
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(meeting.status)}`}>
              {meeting.status}
            </span>
          </div>
          <div className="flex items-center gap-4 text-white/40 text-xs font-medium italic">
            <div className="flex items-center gap-1.5">
              <Calendar size={14} />
              {format(new Date(meeting.date), 'MMM dd, yyyy')}
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={14} />
              {meeting.time}
            </div>
          </div>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2">
            <button 
              onClick={() => onEdit?.(meeting)}
              className="p-2 hover:bg-white/10 rounded-xl text-white/40 hover:text-white transition-all"
            >
              <Edit2 size={16} />
            </button>
            <button 
              onClick={() => onDelete?.(meeting.id)}
              className="p-2 hover:bg-red-500/20 rounded-xl text-white/40 hover:text-red-500 transition-all"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest ${platformColor}`}>
          <Video size={14} />
          {meeting.platform}
        </div>
        
        {meeting.status === 'pending' || meeting.status === 'accepted' ? (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#c7c42a]/10 text-[#c7c42a] rounded-2xl text-[10px] font-black uppercase tracking-widest">
            <AlertCircle size={14} />
            {timeLeft}
          </div>
        ) : null}
      </div>

      {meeting.notes && (
        <p className="text-white/40 text-sm italic leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/5">
          {meeting.notes}
        </p>
      )}

      {meeting.rescheduleMessage && (
        <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-2xl space-y-2">
          <div className="flex justify-between items-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-purple-400">Reschedule Request:</p>
            {meeting.preferredDate && (
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                Suggested: {format(new Date(meeting.preferredDate), 'MMM dd')} @ {meeting.preferredTime}
              </p>
            )}
          </div>
          <p className="text-white/60 text-sm italic">{meeting.rescheduleMessage}</p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 pt-2">
        {isAdmin ? (
          <>
            {meeting.status === 'pending' && (
              <p className="text-xs text-white/40 italic">Waiting for response...</p>
            )}
          </>
        ) : (
          <>
            {meeting.status === 'pending' && !showRescheduleInput && (
              <>
                <button 
                  onClick={() => onStatusUpdate?.(meeting.id, 'accepted')}
                  className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all"
                >
                  <CheckCircle2 size={14} />
                  Accept
                </button>
                <button 
                  onClick={() => onStatusUpdate?.(meeting.id, 'declined')}
                  className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all"
                >
                  <XCircle size={14} />
                  Reject
                </button>
              </>
            )}
          </>
        )}

        {(meeting.status === 'accepted' || (isAdmin && meeting.status === 'pending')) && (
          <div className="flex gap-2 w-full sm:w-auto">
            <button 
              onClick={() => window.open(meeting.meetingLink, '_blank')}
              disabled={!isJoinable && !isAdmin}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                isJoinable || isAdmin 
                  ? 'bg-[#c7c42a] text-black hover:scale-105 shadow-[0_0_20px_rgba(199,196,42,0.2)]' 
                  : 'bg-white/5 text-white/20 cursor-not-allowed'
              }`}
            >
              <Video size={14} />
              Join Meeting
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setShowSyncOptions(!showSyncOptions)}
                className={`p-3 rounded-xl transition-all ${showSyncOptions ? 'bg-[#c7c42a] text-black' : 'bg-white/5 text-white/40 hover:text-white hover:bg-white/10'}`}
                title="Sync to Calendar"
              >
                <Share2 size={16} />
              </button>
              
              <AnimatePresence>
                {showSyncOptions && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute bottom-full mb-2 right-0 bg-[#111] border border-white/10 rounded-2xl p-2 shadow-2xl z-50 min-w-[200px]"
                  >
                    <button 
                      onClick={() => {
                        const attendees = [meeting.clientEmail, meeting.developerEmail].filter(Boolean) as string[];
                        window.open(generateGoogleCalendarUrl(meeting, attendees), '_blank');
                        setShowSyncOptions(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-all text-left"
                    >
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      Google Calendar
                    </button>
                    <button 
                      onClick={() => {
                        const attendees = [meeting.clientEmail, meeting.developerEmail].filter(Boolean) as string[];
                        window.open(generateOutlookCalendarUrl(meeting, attendees), '_blank');
                        setShowSyncOptions(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-all text-left"
                    >
                      <div className="w-2 h-2 rounded-full bg-blue-400" />
                      Outlook / Office
                    </button>
                    <button 
                      onClick={() => {
                        const attendees = [meeting.clientEmail, meeting.developerEmail].filter(Boolean) as string[];
                        downloadIcsFile(meeting, attendees);
                        setShowSyncOptions(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-all text-left"
                    >
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      Download .ICS File
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
