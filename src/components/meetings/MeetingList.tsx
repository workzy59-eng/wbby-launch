import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  Video,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  History
} from 'lucide-react';
import { Meeting, MeetingStatus, UserProfile, MeetingRequest } from '../../types';
import { MeetingCard } from './MeetingCard';
import { MeetingForm } from './MeetingForm';
import { RequestMeetingForm } from './RequestMeetingForm';
import { MeetingCountdown } from './MeetingCountdown';
import { 
  subscribeToMeetings, 
  createMeeting, 
  updateMeeting, 
  deleteMeeting,
  acceptMeeting,
  declineMeeting,
  detectPlatform
} from '../../services/meetingService';
import { toast } from 'react-hot-toast';
import { isAfter, isBefore, parseISO, startOfDay, endOfDay, format } from 'date-fns';

interface MeetingListProps {
  user: any;
  profile: UserProfile;
  allClients?: UserProfile[]; // Only for admin
}

export const MeetingList: React.FC<MeetingListProps> = ({ user, profile, allClients = [] }) => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | undefined>();
  const [filter, setFilter] = useState<MeetingStatus | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<'upcoming' | 'past' | 'requests'>('upcoming');

  const isAdmin = profile?.role === 'admin';
  const isDev = profile?.role === 'developer';
  const isManager = isAdmin || isDev;

  useEffect(() => {
    const unsubMeetings = subscribeToMeetings(profile?.role as 'admin' | 'client' | 'developer', user.uid, (data) => {
      setMeetings(data);
      setLoading(false);
    });

    return () => {
      unsubMeetings();
    };
  }, [user.uid, profile?.role]);

  const handleCreateMeeting = async (data: any) => {
    try {
      if (editingMeeting) {
        await updateMeeting(editingMeeting.id, data);
        toast.success('Meeting updated successfully!');
      } else {
        await createMeeting({
          ...data,
          adminId: user.uid
        });
        toast.success('Meeting scheduled successfully!');
      }
      setShowForm(false);
      setEditingMeeting(undefined);
    } catch (error) {
      console.error(error);
      toast.error('Failed to schedule meeting');
    }
  };

  const handleStatusUpdate = async (id: string, status: MeetingStatus, message?: string, preferredDate?: string, preferredTime?: string) => {
    try {
      await updateMeeting(id, { 
        status, 
        ...(message && { rescheduleMessage: message }),
        ...(preferredDate && { preferredDate }),
        ...(preferredTime && { preferredTime })
      });
      toast.success(`Meeting ${status.toLowerCase()}`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to update status');
    }
  };

  const handleRequestAction = async (request: any, action: 'accept' | 'reject' | 'suggest', response?: string, date?: string, time?: string) => {
    // Legacy support or internal handling
    toast.info('Meeting processing...');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this meeting?')) {
      try {
        await deleteMeeting(id);
        toast.success('Meeting deleted');
      } catch (error) {
        console.error(error);
        toast.error('Failed to delete meeting');
      }
    }
  };

  const now = new Date();
  
  // High contrast countdown logic
  const upcomingMeeting = meetings.find(m => 
    m.status === 'accepted' && 
    isAfter(new Date(`${m.date}T${m.time}`), now)
  );

  const pendingRequests = meetings.filter(m => 
    m.status === 'pending' && 
    m.requestedBy !== user.uid && // Show requests from others
    isAfter(new Date(`${m.date}T${m.time}`), now)
  );

  const myRequests = meetings.filter(m => 
    m.status === 'pending' && 
    m.requestedBy === user.uid
  );

  const history = meetings.filter(m => 
    m.status === 'completed' || 
    m.status === 'declined' || 
    isBefore(new Date(`${m.date}T${m.time}`), now)
  );

  const handleAccept = async (id: string) => {
    try {
      await acceptMeeting(id, user.uid);
      toast.success('Meeting Confirmed! Link will activate 5m before start.');
    } catch (error) {
      toast.error('Failed to accept meeting');
    }
  };

  const handleDecline = async (id: string) => {
    try {
      await declineMeeting(id);
      toast.success('Meeting Declined');
    } catch (error) {
      toast.error('Failed to decline meeting');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-48 bg-white/5 rounded-3xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
      {/* LEFT: Active Queue & Actions (Industrial Zone) */}
      <div className="xl:col-span-8 space-y-10">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">Active Queue</h2>
          <button 
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#c7c42a] text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_20px_rgba(199,196,42,0.2)]"
          >
            <Plus size={16} />
            Initialize Request
          </button>
        </div>

        {upcomingMeeting ? (
          <MeetingCountdown 
            startTime={`${upcomingMeeting.date}T${upcomingMeeting.time}`}
            title={upcomingMeeting.title}
            link={upcomingMeeting.meetingLink}
          />
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-[3.5rem] p-20 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-white/10">
              <Clock size={40} />
            </div>
            <p className="text-xl font-black uppercase italic tracking-tighter text-white/20">No active sync detected</p>
          </div>
        )}

        <div className="space-y-6">
          <h3 className="text-sm font-black uppercase tracking-[0.4em] text-white/40">Incoming Requests</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingRequests.map(m => (
              <motion.div 
                key={m.id}
                layout
                className="bg-[#111] border border-white/5 p-6 rounded-3xl space-y-4 hover:border-[#c7c42a]/30 transition-all"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[8px] font-black uppercase text-[#c7c42a] tracking-widest mb-1">Confirmation Required</p>
                    <h4 className="text-lg font-black italic uppercase text-white tracking-tight">{m.title}</h4>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-mono text-white/60">{m.date}</p>
                    <p className="text-xs font-mono text-white/40">{m.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <button 
                    onClick={() => handleAccept(m.id)}
                    className="flex-1 py-3 bg-[#c7c42a] text-black rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all"
                  >
                    Confirm
                  </button>
                  <button 
                    onClick={() => handleDecline(m.id)}
                    className="flex-1 py-3 bg-white/5 text-white/40 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-500/10 hover:text-red-500 transition-all"
                  >
                    Decline
                  </button>
                </div>
              </motion.div>
            ))}
            {pendingRequests.length === 0 && (
              <div className="col-span-2 py-10 border border-dashed border-white/5 rounded-3xl flex items-center justify-center">
                <p className="text-[10px] font-bold uppercase text-white/10 tracking-widest italic">No pending validation</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT: History & Internal Log */}
      <div className="xl:col-span-4 space-y-10">
        <div className="space-y-6">
          <h2 className="text-sm font-black uppercase tracking-[0.4em] text-white/40 flex items-center gap-3">
            <History size={16} /> History Log
          </h2>
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {history.map(m => (
              <div key={m.id} className="p-5 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between opacity-60 hover:opacity-100 transition-opacity">
                <div>
                  <h5 className="text-[10px] font-black uppercase text-white tracking-widest mb-1">{m.title}</h5>
                  <p className="text-[10px] font-mono text-white/20 uppercase tracking-tighter">{m.date} | {m.time}</p>
                </div>
                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                  m.status === 'completed' ? 'bg-green-500/10 text-green-500' : 
                  m.status === 'declined' ? 'bg-red-500/10 text-red-500' : 'bg-white/5 text-white/20'
                }`}>
                  {m.status}
                </span>
              </div>
            ))}
            {history.length === 0 && (
              <p className="text-[10px] text-white/10 italic text-center py-10">No records found</p>
            )}
          </div>
        </div>

        <div className="bg-[#c7c42a]/5 border border-[#c7c42a]/10 p-8 rounded-[2.5rem] space-y-4">
          <div className="flex items-center gap-3 text-[#c7c42a]">
            <AlertCircle size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest">Protocol Rules</span>
          </div>
          <ul className="space-y-3">
            {[
              "Double-Opt-In required for all syncs.",
              "Access links activate 5m prior to start.",
              "Declined meetings move to history log.",
              "System alerts sent via EmailJS on accept."
            ].map((rule, i) => (
              <li key={i} className="text-[10px] text-white/40 leading-relaxed flex items-start gap-2">
                <span className="text-[#c7c42a]">0{i+1}.</span>
                {rule}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <MeetingForm 
            clients={allClients}
            isAdmin={isManager}
            currentUserId={user.uid}
            initialData={editingMeeting}
            onClose={() => {
              setShowForm(false);
              setEditingMeeting(undefined);
            }}
            onSubmit={handleCreateMeeting}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
