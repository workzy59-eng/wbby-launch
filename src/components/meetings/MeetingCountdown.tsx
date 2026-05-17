import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Video, Share2, Calendar } from 'lucide-react';
import { format, differenceInSeconds, parseISO } from 'date-fns';
import { Meeting, UserProfile } from '../../types';
import { generateGoogleCalendarUrl, generateOutlookCalendarUrl, downloadIcsFile } from '../../services/calendarUtils';
import { toast } from 'react-hot-toast';

interface MeetingCountdownProps {
  meeting: Meeting;
  profile?: UserProfile;
  onJoin?: () => void;
}

export const MeetingCountdown: React.FC<MeetingCountdownProps> = ({ meeting, profile, onJoin }) => {
  const { date, time, title, meetingLink: link } = meeting;
  const startTime = `${date}T${time}`;
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isReady, setIsReady] = useState(false);
  const [showSyncOptions, setShowSyncOptions] = useState(false);

  useEffect(() => {
    const targetDate = new Date(startTime);
    
    const calculateTime = () => {
      const diff = differenceInSeconds(targetDate, new Date());
      setTimeLeft(Math.max(0, diff));
      
      // Ready to join 5 minutes before (300 seconds)
      setIsReady(diff <= 300 && diff >= -3600); // Allow joining up to 1 hour after start
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  const d = Math.floor(timeLeft / 86400);
  const h = Math.floor((timeLeft % 86400) / 3600);
  const m = Math.floor((timeLeft % 3600) / 60);
  const s = timeLeft % 60;

  if (timeLeft === 0 && !isReady) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black border border-[#c7c42a]/30 p-8 md:p-12 rounded-[3.5rem] flex flex-col items-center gap-8 text-center relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-[#c7c42a]/20">
        <motion.div 
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: timeLeft, ease: "linear" }}
          className="h-full bg-[#c7c42a]"
        />
      </div>

      <div className="space-y-4">
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#c7c42a]">Next Sync In</p>
        <div className="flex gap-4 font-mono text-3xl md:text-6xl font-black italic tracking-tighter text-[#c7c42a]">
          {d > 0 && (
            <>
              <div className="flex flex-col items-center">
                <span>{d.toString().padStart(2, '0')}</span>
                <span className="text-[8px] uppercase tracking-widest mt-2 opacity-40">days</span>
              </div>
              <span className="animate-pulse">:</span>
            </>
          )}
          <div className="flex flex-col items-center">
            <span>{h.toString().padStart(2, '0')}</span>
            <span className="text-[8px] uppercase tracking-widest mt-2 opacity-40">hrs</span>
          </div>
          <span className="animate-pulse">:</span>
          <div className="flex flex-col items-center">
            <span>{m.toString().padStart(2, '0')}</span>
            <span className="text-[8px] uppercase tracking-widest mt-2 opacity-40">min</span>
          </div>
          <span className="animate-pulse">:</span>
          <div className="flex flex-col items-center">
            <span>{s.toString().padStart(2, '0')}</span>
            <span className="text-[8px] uppercase tracking-widest mt-2 opacity-40">sec</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-black uppercase italic text-white tracking-widest">{title}</h3>
        <p className="text-[10px] font-bold uppercase text-white/40 tracking-widest">
          {format(new Date(startTime), 'MMMM dd | hh:mm a')}
        </p>
      </div>

      <div className="flex flex-col items-center gap-4 w-full max-w-xs">
        {isReady ? (
          <a 
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onJoin}
            className="w-full py-5 bg-[#c7c42a] text-black rounded-2xl text-xs font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-[0_0_40px_rgba(199,196,42,0.3)]"
          >
            <Video size={18} />
            Join Now
          </a>
        ) : (
          <div className="w-full py-5 bg-white/5 border border-white/10 text-white/20 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 cursor-not-allowed">
            <Clock size={16} />
            Waiting for Signal
          </div>
        )}
        
        {timeLeft > 300 && (
          <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">
            Access link activates 5 min prior
          </p>
        )}

        <div className="pt-6 border-t border-white/5 w-full flex flex-col items-center gap-4">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#c7c42a]/60">
            {profile?.googleCalendarEnabled ? '✓ Auto-Synced to Google' : 'Sync To Device Calendar'}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {!profile?.googleCalendarEnabled && (
              <>
                <button 
                  onClick={() => {
                    toast.loading('Opening Google Calendar...', { duration: 2000 });
                    const attendees = [meeting.clientEmail, meeting.developerEmail].filter(Boolean) as string[];
                    window.open(generateGoogleCalendarUrl(meeting, attendees), '_blank');
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-500/10 hover:bg-blue-500 border border-blue-500/30 rounded-xl text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-white transition-all group"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 group-hover:bg-white" />
                  Google
                </button>
                <button 
                  onClick={() => {
                    toast.loading('Opening Outlook...', { duration: 2000 });
                    const attendees = [meeting.clientEmail, meeting.developerEmail].filter(Boolean) as string[];
                    window.open(generateOutlookCalendarUrl(meeting, attendees), '_blank');
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-400/10 hover:bg-blue-400 border border-blue-400/30 rounded-xl text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-white transition-all group"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 group-hover:bg-white" />
                  Outlook
                </button>
              </>
            )}
            <button 
              onClick={() => {
                toast.success('Downloading .ics file...');
                const attendees = [meeting.clientEmail, meeting.developerEmail].filter(Boolean) as string[];
                downloadIcsFile(meeting, attendees);
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-green-500/10 hover:bg-green-500 border border-green-500/30 rounded-xl text-[10px] font-black uppercase tracking-widest text-green-400 hover:text-white transition-all group"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 group-hover:bg-white" />
              {profile?.googleCalendarEnabled ? 'Update/Download .ICS' : 'Apple / ICS'}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
