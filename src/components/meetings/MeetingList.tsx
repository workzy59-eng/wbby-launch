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
import { 
  subscribeToMeetings, 
  createMeeting, 
  updateMeeting, 
  deleteMeeting,
  subscribeToMeetingRequests,
  updateMeetingRequest,
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
  const [requests, setRequests] = useState<MeetingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | undefined>();
  const [filter, setFilter] = useState<MeetingStatus | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<'upcoming' | 'past' | 'requests'>('upcoming');

  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    const unsubMeetings = subscribeToMeetings(profile?.role as 'admin' | 'client', user.uid, (data) => {
      setMeetings(data);
      setLoading(false);
    });

    const unsubRequests = subscribeToMeetingRequests(profile?.role as 'admin' | 'client', user.uid, (data) => {
      setRequests(data);
    });

    return () => {
      unsubMeetings();
      unsubRequests();
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

  const handleRequestAction = async (request: MeetingRequest, action: 'accept' | 'reject' | 'suggest', response?: string, date?: string, time?: string) => {
    try {
      if (action === 'accept') {
        const meetingLink = prompt('Enter Meeting Link (Google Meet/Zoom):', 'https://meet.google.com/new');
        if (!meetingLink || !meetingLink.startsWith('http')) {
          toast.error('A valid meeting link is required to schedule a meeting.');
          return;
        }

        // Create actual meeting
        await createMeeting({
          title: 'Consultation Call',
          clientId: request.clientId,
          adminId: user.uid,
          date: date || request.preferredDate,
          time: time || request.preferredTime,
          meetingLink: meetingLink,
          platform: detectPlatform(meetingLink) || 'Google Meet',
          status: 'Accepted',
          notes: request.message
        });
        await updateMeetingRequest(request.id, { status: 'accepted', adminResponse: 'Accepted and scheduled.' });
        toast.success('Request accepted and meeting scheduled!');
      } else if (action === 'reject') {
        await updateMeetingRequest(request.id, { status: 'rejected', adminResponse: response });
        toast.success('Request rejected');
      } else {
        await updateMeetingRequest(request.id, { 
          status: 'suggested', 
          adminResponse: response,
          suggestedDate: date,
          suggestedTime: time
        });
        toast.success('New time suggested');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to process request');
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
              view === 'upcoming' ? 'bg-[#c7c42a] text-black' : 'text-white/40 hover:text-white'
            }`}
          >
            Upcoming
          </button>
          <button 
            onClick={() => setView('past')}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              view === 'past' ? 'bg-[#c7c42a] text-black' : 'text-white/40 hover:text-white'
            }`}
          >
            Past
          </button>
          <button 
            onClick={() => setView('requests')}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all relative ${
              view === 'requests' ? 'bg-[#c7c42a] text-black' : 'text-white/40 hover:text-white'
            }`}
          >
            Requests
            {requests.filter(r => r.status === 'pending').length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] flex items-center justify-center rounded-full animate-pulse">
                {requests.filter(r => r.status === 'pending').length}
              </span>
            )}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#c7c42a] transition-colors" size={16} />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search meetings..."
              className="bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-3 text-sm text-white outline-none focus:border-[#c7c42a]/50 transition-all w-full md:w-64"
            />
          </div>

          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="bg-white/5 border border-white/10 rounded-2xl px-6 py-3 text-sm text-white outline-none focus:border-[#c7c42a]/50 transition-all appearance-none"
          >
            <option value="All" className="bg-[#0A0A0A]">All Status</option>
            <option value="Pending" className="bg-[#0A0A0A]">Pending</option>
            <option value="Accepted" className="bg-[#0A0A0A]">Accepted</option>
            <option value="Reschedule Requested" className="bg-[#0A0A0A]">Reschedule</option>
            <option value="Completed" className="bg-[#0A0A0A]">Completed</option>
          </select>

          {!isAdmin && (
            <button 
              onClick={() => setShowRequestForm(true)}
              className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
            >
              <Plus size={16} />
              Request Meeting
            </button>
          )}

          {isAdmin && (
            <button 
              onClick={() => {
                setEditingMeeting(undefined);
                setShowForm(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-[#c7c42a] text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_20px_rgba(199,196,42,0.2)]"
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
          className="relative overflow-hidden bg-[#c7c42a] p-8 rounded-[2.5rem] group cursor-pointer"
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
                <span className="px-3 py-1 bg-black text-[#c7c42a] rounded-full text-[8px] font-black uppercase tracking-widest">
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
      {view !== 'requests' ? (
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
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {requests.length > 0 ? (
              requests.map(request => (
                <motion.div
                  key={request.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-6 hover:border-[#c7c42a]/30 transition-all group"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                        request.status === 'pending' ? 'bg-#c7c42a/10 text-#c7c42a' :
                        request.status === 'accepted' ? 'bg-green-500/10 text-green-500' :
                        request.status === 'rejected' ? 'bg-red-500/10 text-red-500' :
                        'bg-blue-500/10 text-blue-500'
                      }`}>
                        {request.status}
                      </span>
                      <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Meeting Request</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Requested On</p>
                      <p className="text-sm font-black text-white italic tracking-tighter">
                        {format(new Date(request.preferredDate), 'MMM dd')} @ {request.preferredTime}
                      </p>
                    </div>
                  </div>

                  {request.message && (
                    <div className="bg-black/20 rounded-2xl p-4 border border-white/5">
                      <p className="text-white/60 text-xs leading-relaxed italic">"{request.message}"</p>
                    </div>
                  )}

                  {request.adminResponse && (
                    <div className="bg-[#c7c42a]/5 rounded-2xl p-4 border border-[#c7c42a]/10">
                      <p className="text-[#c7c42a] text-[10px] font-black uppercase tracking-widest mb-1">Admin Response</p>
                      <p className="text-white/80 text-xs leading-relaxed">{request.adminResponse}</p>
                      {request.status === 'suggested' && (
                        <p className="text-[#c7c42a] text-xs font-black mt-2">
                          Suggested: {format(new Date(request.suggestedDate!), 'MMM dd')} @ {request.suggestedTime}
                        </p>
                      )}
                    </div>
                  )}

                  {isAdmin && request.status === 'pending' && (
                    <div className="flex items-center gap-3 pt-4">
                      <button
                        onClick={() => handleRequestAction(request, 'accept')}
                        className="flex-1 bg-[#c7c42a] text-black py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt('Reason for rejection:');
                          if (reason) handleRequestAction(request, 'reject', reason);
                        }}
                        className="flex-1 bg-red-500/10 text-red-500 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => {
                          const date = prompt('Suggested Date (YYYY-MM-DD):');
                          const time = prompt('Suggested Time (HH:mm):');
                          const msg = prompt('Message:');
                          if (date && time) handleRequestAction(request, 'suggest', msg || '', date, time);
                        }}
                        className="flex-1 bg-white/5 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                      >
                        Suggest
                      </button>
                    </div>
                  )}
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center text-white/20">
                <p className="text-xs font-black uppercase tracking-widest">No meeting requests yet</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}

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

      <RequestMeetingForm
        isOpen={showRequestForm}
        onClose={() => setShowRequestForm(false)}
        clientId={user.uid}
      />
    </div>
  );
};
