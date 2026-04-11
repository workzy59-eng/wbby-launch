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
import { Meeting, MeetingStatus, UserProfile } from '../../types';
import { MeetingCard } from './MeetingCard';
import { MeetingForm } from './MeetingForm';
import { 
  subscribeToMeetings, 
  createMeeting, 
  updateMeeting, 
  deleteMeeting 
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
  const [view, setView] = useState<'upcoming' | 'past'>('upcoming');

  const isAdmin = profile.role === 'admin';

  useEffect(() => {
    const unsubscribe = subscribeToMeetings(profile.role as 'admin' | 'client', user.uid, (data) => {
      setMeetings(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user.uid, profile.role]);

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

  const handleStatusUpdate = async (id: string, status: MeetingStatus, message?: string) => {
    try {
      await updateMeeting(id, { 
        status, 
        ...(message && { rescheduleMessage: message }) 
      });
      toast.success(`Meeting ${status.toLowerCase()}`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to update status');
    }
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
  const filteredMeetings = meetings.filter(m => {
    const meetingDate = parseISO(m.date);
    const meetingDateTime = new Date(`${m.date}T${m.time}`);
    
    // Search filter
    const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         m.notes?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status filter
    const matchesStatus = filter === 'All' || m.status === filter;

    // View filter (Upcoming vs Past)
    const isPast = isBefore(meetingDateTime, now) && (m.status === 'Completed' || m.status === 'Missed' || m.status === 'Rejected');
    const isUpcoming = !isPast;

    if (view === 'upcoming') return isUpcoming && matchesSearch && matchesStatus;
    return isPast && matchesSearch && matchesStatus;
  });

  const nextMeeting = meetings.find(m => 
    (m.status === 'Pending' || m.status === 'Accepted') && 
    isAfter(new Date(`${m.date}T${m.time}`), now)
  );

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
    <div className="space-y-10">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 bg-white/5 p-1 rounded-2xl border border-white/10 w-fit">
          <button 
            onClick={() => setView('upcoming')}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              view === 'upcoming' ? 'bg-[#E6FF00] text-black' : 'text-white/40 hover:text-white'
            }`}
          >
            Upcoming
          </button>
          <button 
            onClick={() => setView('past')}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              view === 'past' ? 'bg-[#E6FF00] text-black' : 'text-white/40 hover:text-white'
            }`}
          >
            Past
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#E6FF00] transition-colors" size={16} />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search meetings..."
              className="bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-3 text-sm text-white outline-none focus:border-[#E6FF00]/50 transition-all w-full md:w-64"
            />
          </div>

          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="bg-white/5 border border-white/10 rounded-2xl px-6 py-3 text-sm text-white outline-none focus:border-[#E6FF00]/50 transition-all appearance-none"
          >
            <option value="All" className="bg-[#0A0A0A]">All Status</option>
            <option value="Pending" className="bg-[#0A0A0A]">Pending</option>
            <option value="Accepted" className="bg-[#0A0A0A]">Accepted</option>
            <option value="Reschedule Requested" className="bg-[#0A0A0A]">Reschedule</option>
            <option value="Completed" className="bg-[#0A0A0A]">Completed</option>
          </select>

          {isAdmin && (
            <button 
              onClick={() => {
                setEditingMeeting(undefined);
                setShowForm(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-[#E6FF00] text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_20px_rgba(230,255,0,0.2)]"
            >
              <Plus size={16} />
              Schedule
            </button>
          )}
        </div>
      </div>

      {/* Next Meeting Highlight */}
      {view === 'upcoming' && nextMeeting && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden bg-[#E6FF00] p-8 rounded-[2.5rem] group cursor-pointer"
          onClick={() => {
            const el = document.getElementById(`meeting-${nextMeeting.id}`);
            el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }}
        >
          <div className="absolute top-0 right-0 p-12 text-black/5 group-hover:scale-110 transition-transform">
            <Video size={120} />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-black text-[#E6FF00] rounded-full text-[8px] font-black uppercase tracking-widest">
                  Next Upcoming
                </span>
                <h3 className="text-3xl font-black text-black uppercase italic tracking-tighter">{nextMeeting.title}</h3>
              </div>
              <div className="flex flex-wrap items-center gap-6 text-black/60 font-black uppercase tracking-widest text-[10px]">
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  {format(new Date(nextMeeting.date), 'MMMM dd, yyyy')}
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  {nextMeeting.time}
                </div>
                <div className="flex items-center gap-2">
                  <Video size={16} />
                  {nextMeeting.platform}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                <p className="text-[10px] font-black uppercase tracking-widest text-black/40">Starts in</p>
                <p className="text-2xl font-black text-black italic tracking-tighter">
                  {format(new Date(`${nextMeeting.date}T${nextMeeting.time}`), 'HH:mm')}
                </p>
              </div>
              <ChevronRight className="text-black group-hover:translate-x-2 transition-transform" size={32} />
            </div>
          </div>
        </motion.div>
      )}

      {/* Meetings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredMeetings.length > 0 ? (
            filteredMeetings.map(meeting => (
              <div key={meeting.id} id={`meeting-${meeting.id}`}>
                <MeetingCard 
                  meeting={meeting}
                  isAdmin={isAdmin}
                  onStatusUpdate={handleStatusUpdate}
                  onEdit={(m) => {
                    setEditingMeeting(m);
                    setShowForm(true);
                  }}
                  onDelete={handleDelete}
                />
              </div>
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full py-20 text-center space-y-4 bg-white/5 border border-white/10 rounded-[2.5rem]"
            >
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/20">
                <Calendar size={32} />
              </div>
              <div className="space-y-1">
                <p className="text-xl font-black uppercase italic tracking-tighter">No meetings found</p>
                <p className="text-white/40 text-sm italic">
                  {view === 'upcoming' ? 'You have no upcoming meetings scheduled.' : 'No past meetings found.'}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <MeetingForm 
            clients={allClients}
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
