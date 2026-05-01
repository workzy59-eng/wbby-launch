import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Video, ExternalLink } from 'lucide-react';
import { format, differenceInSeconds, parseISO } from 'date-fns';

interface MeetingCountdownProps {
  startTime: string; // ISO string or combined date/time
  title: string;
  link: string;
  onJoin?: () => void;
}

export const MeetingCountdown: React.FC<MeetingCountdownProps> = ({ startTime, title, link, onJoin }) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isReady, setIsReady] = useState(false);

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

  const h = Math.floor(timeLeft / 3600);
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
        <div className="flex gap-4 font-mono text-4xl md:text-7xl font-black italic tracking-tighter text-[#c7c42a]">
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
      </div>
    </motion.div>
  );
};
