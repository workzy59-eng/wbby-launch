import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
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
  AlertCircle
} from 'lucide-react';
import { Meeting, MeetingStatus } from '../../types';
import { format, isAfter, isBefore, addMinutes, differenceInSeconds } from 'date-fns';

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

  useEffect(() => {
    const timer = setInterval(() => {
      const meetingDateTime = new Date(`${meeting.date}T${meeting.time}`);
      const now = new Date();
      
      const diff = differenceInSeconds(meetingDateTime, now);
      
      if (diff > 0) {
        const hours = Math.floor(diff / 3600);
        const mins = Math.floor((diff % 3600) / 60);
        const secs = diff % 60;
        
        if (hours > 24) {
          setTimeLeft(`${Math.floor(hours / 24)}d left`);
        } else if (hours > 0) {
          setTimeLeft(`${hours}h ${mins}m left`);
        } else {
          // Stopwatch style MM:SS
          setTimeLeft(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
        }
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
      case 'Pending': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      case 'Accepted': return 'bg-green-500/20 text-green-500 border-green-500/30';
      case 'Rejected': return 'bg-red-500/20 text-red-500 border-red-500/30';
      case 'Reschedule Requested': return 'bg-purple-500/20 text-purple-500 border-purple-500/30';
      case 'Completed': return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      case 'Missed': return 'bg-gray-500/20 text-gray-500 border-gray-500/30';
      default: return 'bg-white/10 text-white border-white/20';
    }
  };

  const platformColor = meeting.platform === 'Google Meet' ? 'text-green-400 bg-green-400/10' : 'text-blue-400 bg-blue-400/10';

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 border border-white/10 p-6 rounded-3xl space-y-6 hover:border-[#E6FF00]/30 transition-all group"
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
        
        {meeting.status === 'Pending' || meeting.status === 'Accepted' ? (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#E6FF00]/10 text-[#E6FF00] rounded-2xl text-[10px] font-black uppercase tracking-widest">
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
            {meeting.status === 'Pending' && (
              <p className="text-xs text-white/40 italic">Waiting for client response...</p>
            )}
            {meeting.status === 'Reschedule Requested' && (
              <button 
                onClick={() => onEdit?.(meeting)}
                className="flex items-center gap-2 px-6 py-3 bg-[#E6FF00] text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all"
              >
                Update Schedule
              </button>
            )}
          </>
        ) : (
          <>
            {meeting.status === 'Pending' && !showRescheduleInput && (
              <>
                <button 
                  onClick={() => onStatusUpdate?.(meeting.id, 'Accepted')}
                  className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all"
                >
                  <CheckCircle2 size={14} />
                  Accept
                </button>
                <button 
                  onClick={() => onStatusUpdate?.(meeting.id, 'Rejected')}
                  className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all"
                >
                  <XCircle size={14} />
                  Reject
                </button>
                <button 
                  onClick={() => setShowRescheduleInput(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all"
                >
                  <RefreshCw size={14} />
                  Reschedule
                </button>
              </>
            )}

            {showRescheduleInput && (
              <div className="w-full space-y-4 bg-black/40 border border-white/10 rounded-3xl p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">Preferred Date</label>
                    <input 
                      type="date"
                      value={rescheduleDate}
                      onChange={(e) => setRescheduleDate(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-[#E6FF00]/50 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">Preferred Time</label>
                    <input 
                      type="time"
                      value={rescheduleTime}
                      onChange={(e) => setRescheduleTime(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-[#E6FF00]/50 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">Message</label>
                  <textarea 
                    value={rescheduleMsg}
                    onChange={(e) => setRescheduleMsg(e.target.value)}
                    placeholder="Why do you want to reschedule?"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#E6FF00]/50 transition-all resize-none"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      onStatusUpdate?.(meeting.id, 'Reschedule Requested', rescheduleMsg, rescheduleDate, rescheduleTime);
                      setShowRescheduleInput(false);
                    }}
                    disabled={!rescheduleMsg.trim() || !rescheduleDate || !rescheduleTime}
                    className="flex-1 py-3 bg-purple-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all disabled:opacity-50"
                  >
                    Send Request
                  </button>
                  <button 
                    onClick={() => setShowRescheduleInput(false)}
                    className="px-6 py-3 bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {(meeting.status === 'Accepted' || (isAdmin && meeting.status === 'Pending')) && (
          <div className="flex gap-2 w-full sm:w-auto">
            <button 
              onClick={() => window.open(meeting.meetingLink, '_blank')}
              disabled={!isJoinable && !isAdmin}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                isJoinable || isAdmin 
                  ? 'bg-[#E6FF00] text-black hover:scale-105 shadow-[0_0_20px_rgba(230,255,0,0.2)]' 
                  : 'bg-white/5 text-white/20 cursor-not-allowed'
              }`}
            >
              <Video size={14} />
              Join Meeting
            </button>
            
            <button 
              onClick={() => {
                const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(meeting.title)}&dates=${meeting.date.replace(/-/g, '')}T${meeting.time.replace(/:/g, '')}00Z/${meeting.date.replace(/-/g, '')}T${meeting.time.replace(/:/g, '')}00Z&details=${encodeURIComponent(meeting.notes || '')}&location=${encodeURIComponent(meeting.meetingLink)}`;
                window.open(url, '_blank');
              }}
              className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-white/40 hover:text-white transition-all"
              title="Add to Google Calendar"
            >
              <Calendar size={16} />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};
