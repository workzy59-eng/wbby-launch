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
import { db, createNotification, getConversationId } from '../../services/database';
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
  assignedDeveloper?: UserProfile | null;
}

export const MeetingList: React.FC<MeetingListProps> = ({ user, profile, allClients = [], assignedDeveloper }) => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | undefined>();
  const [filter, setFilter] = useState<MeetingStatus | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<'upcoming' | 'past' | 'requests'>('upcoming');

  const isAdmin = profile?.role === 'admin';
  const isDev = profile?.role === 'developer';
  const isClient = profile?.role === 'client';
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
        const meetingData = {
          ...data,
          requestedBy: user.uid,
          ...(profile.role === 'admin' ? { adminId: user.uid } : { developerId: user.uid, adminId: 'SYSTEM' })
        };
        const meetingRef = await createMeeting(meetingData);
        
        // System Notification in Chat
        try {
          const conversationId = getConversationId(user.uid, data.clientId);
          const notificationText = `📅 NEW MEETING SCHEDULED: "${data.title}" on ${data.date} at ${data.time}. Link: ${data.meetingLink}`;
          
          const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
          await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
            text: notificationText,
            senderId: user.uid,
            createdAt: serverTimestamp(),
            status: 'sent',
            seen: false,
            type: 'text'
          });

          // Also a general notification for the client
          await createNotification({
            userId: data.clientId,
            type: 'system',
            title: 'New Meeting Scheduled',
            description: `A meeting "${data.title}" has been scheduled for ${data.date}.`,
            read: false
          });
        } catch (msgErr) {
          console.warn("Notification message failed:", msgErr);
        }

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
    toast('Meeting processing...');
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

  const [tickerNow, setTickerNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setTickerNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const now = tickerNow;
  
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
    (m.status === 'accepted' && isBefore(new Date(`${m.date}T${m.time}`), now))
  );

  const handleAccept = async (id: string, meeting: Meeting) => {
    try {
      await acceptMeeting(id, user.uid);
      
      // System Notification in messages
      try {
        const otherId = meeting.requestedBy === user.uid ? meeting.clientId : meeting.requestedBy;
        const conversationId = getConversationId(user.uid, otherId);
        
        const notificationText = `✅ MEETING ACCEPTED: "${meeting.title}" on ${meeting.date} at ${meeting.time}. Link: ${meeting.meetingLink}`;
        
        const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
        await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
          text: notificationText,
          senderId: user.uid,
          createdAt: serverTimestamp(),
          status: 'sent',
          seen: false,
          type: 'text'
        });

        // Also a general notification
        await createNotification({
          userId: otherId,
          type: 'system',
          title: 'Meeting Accepted',
          description: `Meeting "${meeting.title}" has been accepted.`,
          read: false
        });
      } catch (msgErr) {
         console.warn("Accept notification failed:", msgErr);
      }

      toast.success('Meeting Confirmed!');
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
          {isManager ? (
            <button 
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-6 py-3 bg-[#c7c42a] text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_20px_rgba(199,196,42,0.2)]"
            >
              <Plus size={16} />
              Initialize Meeting
            </button>
          ) : (
            <button 
              onClick={() => setShowRequestForm(true)}
              className="flex items-center gap-2 px-6 py-3 border border-[#c7c42a] text-[#c7c42a] rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#c7c42a] hover:text-black transition-all"
            >
              <Calendar size={16} />
              Request Sync
            </button>
          )}
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

        {/* All Upcoming Meetings */}
        <div className="space-y-6">
          <h3 className="text-sm font-black uppercase tracking-[0.4em] text-white/40">Active Sync Windows</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {meetings.filter(m => m.status === 'accepted' && (isAfter(new Date(`${m.date}T${m.time}`), now) || (new Date().getTime() - new Date(`${m.date}T${m.time}`).getTime() < 3600000))).map(m => {
              const meetTime = new Date(`${m.date}T${m.time}`);
              const diffMs = meetTime.getTime() - tickerNow.getTime();
              const diffMin = diffMs / 60000;
              const isGlowActive = diffMin <= 10 && diffMin >= -60;
              
              let countdownText = '';
              if (diffMs > 0) {
                const totalSecs = Math.floor(diffMs / 1000);
                const hours = Math.floor(totalSecs / 3600);
                const mins = Math.floor((totalSecs % 3600) / 60);
                const secs = totalSecs % 60;
                if (hours > 0) {
                  countdownText = `${hours}H ${mins}M LEFT`;
                } else {
                  countdownText = `${mins}M ${secs}S LEFT`;
                }
              } else if (diffMin >= -60) {
                countdownText = 'SESSION LIVE';
              } else {
                countdownText = 'CONCLUDED';
              }

              return (
                <motion.div 
                  key={m.id}
                  layout
                  className={`p-6 rounded-3xl border transition-all ${
                    isGlowActive 
                      ? 'bg-[#FFFF00]/10 border-[#FFFF00] shadow-[0_0_30px_rgba(255,255,0,0.15)] animate-pulse' 
                      : upcomingMeeting?.id === m.id
                        ? 'bg-[#c7c42a]/10 border-[#c7c42a] shadow-[0_0_30px_rgba(199,196,42,0.1)]' 
                        : 'bg-[#111] border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-lg font-black italic uppercase text-white tracking-tight">{m.title}</h4>
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">
                        {m.clientId === user.uid ? 'Organized with Platform' : 'Client Sync Session'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-[#c7c42a] italic">{format(new Date(`${m.date}T${m.time}`), 'MMM dd')}</p>
                      <p className="text-[10px] font-mono text-white/40">{m.time}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <a 
                        href={m.meetingLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`flex-1 py-3 rounded-xl text-center text-[10px] font-black uppercase tracking-widest transition-all ${
                          isGlowActive 
                            ? 'bg-[#FFFF00] text-black font-black animate-pulse shadow-[0_0_20px_rgba(255,255,0,0.8)] border border-black hover:scale-[1.02]'
                            : 'bg-white/5 hover:bg-white/10 text-white hover:scale-[1.02]'
                        }`}
                      >
                        {isGlowActive ? '⚡ JOIN ACTIVE SESSION ⚡' : 'Join Signal'}
                      </a>
                      {isAdmin && (
                        <button 
                          onClick={() => handleDecline(m.id)}
                          className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                        >
                          <XCircle size={16} />
                        </button>
                      )}
                    </div>
                    <div className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-center border rounded-lg ${
                      isGlowActive
                        ? 'bg-[#FFFF00]/10 border-[#FFFF00] text-[#FFFF00] animate-bounce'
                        : 'bg-black/30 border-white/5 text-white/40'
                    }`}>
                      {countdownText}
                    </div>
                  </div>
                </motion.div>
              );
            })}
            {meetings.filter(m => m.status === 'accepted' && (isAfter(new Date(`${m.date}T${m.time}`), now) || (new Date().getTime() - new Date(`${m.date}T${m.time}`).getTime() < 3600000))).length === 0 && (
              <div className="col-span-2 py-10 border border-dashed border-white/5 rounded-3xl flex items-center justify-center">
                <p className="text-[10px] font-bold uppercase text-white/10 tracking-widest italic">No confirmed windows</p>
              </div>
            )}
          </div>
        </div>

        {myRequests.length > 0 && (
          <div className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-[0.4em] text-white/40">Your Pending Requests</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myRequests.map(m => (
                <motion.div 
                  key={m.id}
                  layout
                  className="bg-[#111]/40 border border-white/5 p-6 rounded-3xl space-y-4"
                >
                  <div className="flex justify-between items-start opacity-60">
                    <div>
                      <p className="text-[8px] font-black uppercase text-white/40 tracking-widest mb-1">Awaiting Response</p>
                      <h4 className="text-lg font-black italic uppercase text-white tracking-tight">{m.title}</h4>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-mono text-white/60">{m.date}</p>
                      <p className="text-xs font-mono text-white/40">{m.time}</p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button 
                      onClick={() => handleDelete(m.id)}
                      className="text-[10px] font-bold text-red-500/60 hover:text-red-500 transition-colors uppercase tracking-widest"
                    >
                      Cancel Request
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
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
                    onClick={() => handleAccept(m.id, m)}
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
                  m.status === 'completed' ? 'bg-[#c7c42a]/10 text-[#c7c42a]' : 
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
        {showRequestForm && (
          <RequestMeetingForm
            isOpen={showRequestForm}
            onClose={() => setShowRequestForm(false)}
            clientId={user.uid}
            developerId={assignedDeveloper?.uid}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
