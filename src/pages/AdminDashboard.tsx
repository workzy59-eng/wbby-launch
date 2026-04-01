import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FirebaseUser } from '../firebase';
import { UserProfile, LeaveRequest, Attendance, Project } from '../types';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  MessageSquare, 
  Settings, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle,
  User,
  ChevronRight,
  Search,
  Calendar as CalendarIcon,
  Filter,
  Mail,
  Phone,
  ArrowUpRight,
  RefreshCcw,
  MapPin
} from 'lucide-react';
import { 
  getProfiles, 
  updateProfile, 
  getProjectsAsync, 
  getAllLeaveRequests, 
  updateLeaveRequest,
  getAllAttendance,
  sendDirectMessage
} from '../services/database';
import { generateDeveloperWarning } from '../services/geminiService';
import ChatSystem from '../components/ChatSystem';

interface AdminDashboardProps {
  user: FirebaseUser | null;
  profile: UserProfile | null;
}

type Tab = 'overview' | 'clients' | 'developers' | 'projects' | 'leaves' | 'attendance' | 'messages';

export default function AdminDashboard({ user, profile }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChatUser, setSelectedChatUser] = useState<UserProfile | null>(null);
  const [isGeneratingWarning, setIsGeneratingWarning] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [allProfiles, allProjects, allLeaves, allAttendance] = await Promise.all([
          getProfiles(),
          getProjectsAsync(),
          getAllLeaveRequests(),
          getAllAttendance()
        ]);
        setProfiles(allProfiles);
        setProjects(allProjects);
        setLeaveRequests(allLeaves);
        setAttendance(allAttendance);
      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleApproveDeveloper = async (userId: string) => {
    await updateProfile(userId, { status: 'approved' });
    setProfiles(prev => prev.map(p => p.uid === userId ? { ...p, status: 'approved' } : p));
  };

  const handleDeclineDeveloper = async (userId: string) => {
    await updateProfile(userId, { status: 'declined' });
    setProfiles(prev => prev.map(p => p.uid === userId ? { ...p, status: 'declined' } : p));
    // Mock email sending
    console.log(`Sending email to developer: "Sorry, you are not in."`);
  };

  const handleLeaveAction = async (requestId: string, status: 'approved' | 'declined') => {
    await updateLeaveRequest(requestId, status);
    setLeaveRequests(prev => prev.map(r => r.id === requestId ? { ...r, status } : r));
  };

  const handleGenerateWarning = async (dev: UserProfile) => {
    if (!dev.absences || dev.absences < 1) return;
    
    setIsGeneratingWarning(dev.uid);
    try {
      const warningText = await generateDeveloperWarning(dev.displayName || 'Developer', dev.absences);
      if (warningText) {
        await sendDirectMessage(dev.uid, {
          senderId: user?.uid || '',
          senderName: 'System Admin',
          text: `⚠️ OFFICIAL WARNING: ${warningText}`,
        });
        alert(`Warning sent to ${dev.displayName}`);
      }
    } catch (error) {
      console.error('Error sending warning:', error);
    } finally {
      setIsGeneratingWarning(null);
    }
  };

  const filteredDevelopers = profiles.filter(p => 
    p.role === 'developer' && 
    (p.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
     p.devRole?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Total Clients', value: profiles.filter(p => p.role === 'client').length, icon: User, color: 'blue' },
                { label: 'Total Developers', value: profiles.filter(p => p.role === 'developer').length, icon: Users, color: 'green' },
                { label: 'Active Projects', value: projects.length, icon: Briefcase, color: 'purple' },
                { label: 'Pending Leaves', value: leaveRequests.filter(r => r.status === 'pending').length, icon: Clock, color: 'yellow' },
              ].map((stat, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className={`p-3 bg-${stat.color}-500/10 rounded-2xl text-${stat.color}-400`}>
                      <stat.icon size={24} />
                    </div>
                    <ArrowUpRight size={16} className="text-white/20" />
                  </div>
                  <div>
                    <div className="text-4xl font-black text-white tracking-tighter">{stat.value}</div>
                    <div className="text-xs font-bold text-white/40 uppercase tracking-widest">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10">
                <h3 className="text-2xl font-black text-white uppercase italic mb-8">Pending Developer Requests</h3>
                <div className="space-y-4">
                  {profiles.filter(p => p.role === 'developer' && p.status === 'pending').map((dev, idx) => (
                    <div key={idx} className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#E6FF00] rounded-xl flex items-center justify-center text-black font-black italic">
                          {dev.displayName?.[0]}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white uppercase italic">{dev.displayName}</div>
                          <div className="text-[10px] font-black text-white/20 uppercase tracking-widest">{dev.devRole} • {dev.experience} Years Exp</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleDeclineDeveloper(dev.uid)}
                          className="p-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                        >
                          <XCircle size={18} />
                        </button>
                        <button 
                          onClick={() => handleApproveDeveloper(dev.uid)}
                          className="p-3 bg-green-500/10 text-green-400 rounded-xl hover:bg-green-500 hover:text-white transition-all"
                        >
                          <CheckCircle2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {profiles.filter(p => p.role === 'developer' && p.status === 'pending').length === 0 && (
                    <div className="text-center py-12 text-white/20 font-black uppercase tracking-widest italic">No pending requests</div>
                  )}
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10">
                <h3 className="text-2xl font-black text-white uppercase italic mb-8">Pending Leave Requests</h3>
                <div className="space-y-4">
                  {leaveRequests.filter(r => r.status === 'pending').map((req, idx) => (
                    <div key={idx} className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5">
                      <div>
                        <div className="text-sm font-bold text-white uppercase italic">{req.userName}</div>
                        <div className="text-[10px] font-black text-white/20 uppercase tracking-widest">{req.startDate} to {req.endDate}</div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleLeaveAction(req.id!, 'declined')}
                          className="p-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                        >
                          <XCircle size={18} />
                        </button>
                        <button 
                          onClick={() => handleLeaveAction(req.id!, 'approved')}
                          className="p-3 bg-green-500/10 text-green-400 rounded-xl hover:bg-green-500 hover:text-white transition-all"
                        >
                          <CheckCircle2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {leaveRequests.filter(r => r.status === 'pending').length === 0 && (
                    <div className="text-center py-12 text-white/20 font-black uppercase tracking-widest italic">No pending leaves</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      case 'developers':
        return (
          <div className="space-y-8">
            <div className="flex justify-between items-center bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                <input 
                  type="text" 
                  placeholder="Search developers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent pl-12 pr-4 py-2 text-white font-bold uppercase tracking-widest outline-none"
                />
              </div>
              <button className="flex items-center gap-2 px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-white/60 font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                <Filter size={16} />
                <span>Filter</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredDevelopers.map((dev, idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 rounded-[2rem] p-8 space-y-6 group hover:border-[#E6FF00]/40 transition-all">
                  <div className="flex justify-between items-start">
                    <div className="w-16 h-16 bg-[#E6FF00] rounded-2xl flex items-center justify-center text-black font-black text-2xl italic shadow-[0_0_20px_rgba(230,255,0,0.1)]">
                      {dev.displayName?.[0]}
                    </div>
                    <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      dev.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                      dev.status === 'declined' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {dev.status}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-white uppercase italic tracking-tighter">{dev.displayName}</h4>
                    <p className="text-xs font-bold text-white/40 uppercase tracking-widest">{dev.devRole}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                    <div className="space-y-1">
                      <div className="text-[8px] font-black text-white/20 uppercase tracking-widest">Experience</div>
                      <div className="text-xs font-bold text-white uppercase">{dev.experience} Years</div>
                    </div>
                    <div className="space-y-1 text-right">
                      <div className="text-[8px] font-black text-white/20 uppercase tracking-widest">Absences</div>
                      <div className={`text-xs font-bold uppercase ${dev.absences && dev.absences > 3 ? 'text-red-400' : 'text-white'}`}>
                        {dev.absences || 0} Days
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <button className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-white/60 font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all">View Profile</button>
                    <button 
                      onClick={() => setSelectedChatUser(dev)}
                      className="p-3 bg-[#E6FF00]/10 text-[#E6FF00] rounded-xl hover:bg-[#E6FF00] hover:text-black transition-all"
                    >
                      <Mail size={16} />
                    </button>
                    {dev.absences && dev.absences > 0 && (
                      <button 
                        onClick={() => handleGenerateWarning(dev)}
                        disabled={isGeneratingWarning === dev.uid}
                        className="p-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                        title="Generate AI Warning"
                      >
                        <AlertTriangle size={16} className={isGeneratingWarning === dev.uid ? 'animate-pulse' : ''} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'attendance':
        return (
          <div className="space-y-8">
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10">
              <h3 className="text-2xl font-black text-white uppercase italic mb-8">Developer Attendance Tracking</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="px-6 py-4 text-[10px] font-black text-white/20 uppercase tracking-widest">Developer</th>
                      <th className="px-6 py-4 text-[10px] font-black text-white/20 uppercase tracking-widest">Role</th>
                      <th className="px-6 py-4 text-[10px] font-black text-white/20 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-[10px] font-black text-white/20 uppercase tracking-widest">Last Check-in</th>
                      <th className="px-6 py-4 text-[10px] font-black text-white/20 uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profiles.filter(p => p.role === 'developer' && p.status === 'approved').map((dev, idx) => (
                      <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-all group">
                        <td className="px-6 py-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#E6FF00] rounded-lg flex items-center justify-center text-black font-black italic text-sm">
                              {dev.displayName?.[0]}
                            </div>
                            <span className="font-bold text-white uppercase italic">{dev.displayName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{dev.devRole}</span>
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                            <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">Present</span>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Today, 09:00 AM</span>
                        </td>
                        <td className="px-6 py-6">
                          <button className="p-2 bg-white/5 border border-white/10 rounded-lg text-white/40 hover:text-[#E6FF00] hover:border-[#E6FF00]/40 transition-all">
                            <CalendarIcon size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case 'messages':
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10">
                <h3 className="text-2xl font-black text-white uppercase italic mb-8">Clients</h3>
                <div className="space-y-4">
                  {profiles.filter(p => p.role === 'client').map((client, idx) => (
                    <div key={idx} className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 font-black italic">
                          {client.displayName?.[0]}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white uppercase italic">{client.displayName}</div>
                          <div className="text-[10px] font-black text-white/20 uppercase tracking-widest">{client.email}</div>
                        </div>
                      </div>
                      <button 
                        onClick={() => setSelectedChatUser(client)}
                        className="p-3 bg-[#E6FF00]/10 text-[#E6FF00] rounded-xl hover:bg-[#E6FF00] hover:text-black transition-all"
                      >
                        <MessageSquare size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10">
                <h3 className="text-2xl font-black text-white uppercase italic mb-8">Developers</h3>
                <div className="space-y-4">
                  {profiles.filter(p => p.role === 'developer' && p.status === 'approved').map((dev, idx) => (
                    <div key={idx} className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#E6FF00] rounded-xl flex items-center justify-center text-black font-black italic">
                          {dev.displayName?.[0]}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white uppercase italic">{dev.displayName}</div>
                          <div className="text-[10px] font-black text-white/20 uppercase tracking-widest">{dev.devRole}</div>
                        </div>
                      </div>
                      <button 
                        onClick={() => setSelectedChatUser(dev)}
                        className="p-3 bg-[#E6FF00]/10 text-[#E6FF00] rounded-xl hover:bg-[#E6FF00] hover:text-black transition-all"
                      >
                        <MessageSquare size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#4A5D4E] font-sans selection:bg-[#E6FF00] selection:text-black">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-full w-80 bg-white/5 backdrop-blur-2xl border-r border-white/10 z-40 p-10 flex flex-col">
        <div className="text-2xl font-black tracking-tighter text-white uppercase italic mb-12">
          Webby<span className="text-[#E6FF00]">Launch</span>
        </div>

        <nav className="flex-1 space-y-2">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'clients', label: 'Clients', icon: User },
            { id: 'developers', label: 'Developers', icon: Users },
            { id: 'projects', label: 'Projects', icon: Briefcase },
            { id: 'leaves', label: 'Leaves', icon: Clock },
            { id: 'attendance', label: 'Attendance', icon: CalendarIcon },
            { id: 'messages', label: 'Messages', icon: MessageSquare },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black uppercase italic text-xs tracking-widest transition-all ${
                activeTab === tab.id 
                  ? 'bg-[#E6FF00] text-black shadow-[0_0_20px_rgba(230,255,0,0.1)]' 
                  : 'text-white/40 hover:bg-white/5 hover:text-white'
              }`}
            >
              <tab.icon size={18} />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto p-6 bg-white/5 rounded-2xl border border-white/5">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
              <Settings size={20} />
            </div>
            <div className="flex-1">
              <div className="text-[10px] font-black text-white uppercase tracking-widest">Admin Panel</div>
              <div className="text-[8px] font-black text-white/20 uppercase tracking-widest">v2.4.0</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="pl-80 min-h-screen">
        <header className="px-12 py-10 flex justify-between items-center border-b border-white/5">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">
              {activeTab.replace('-', ' ')}
            </h2>
            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">
              Admin Control Center / {profile?.displayName}
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-sm font-black text-white uppercase italic">System Admin</div>
              <div className="text-[10px] font-black text-[#E6FF00] uppercase tracking-widest">Online</div>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-[#E6FF00] flex items-center justify-center text-black font-black text-xl italic shadow-[0_0_20px_rgba(230,255,0,0.2)]">
              A
            </div>
          </div>
        </header>

        <div className="p-12 max-w-7xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="animate-spin text-[#E6FF00]" size={48} />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {renderTabContent()}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </main>

      <AnimatePresence>
        {selectedChatUser && user && (
          <ChatSystem 
            isDirect={true}
            recipientUser={{ uid: selectedChatUser.uid, displayName: selectedChatUser.displayName || 'User' }}
            profile={profile}
            currentUser={user}
            onClose={() => setSelectedChatUser(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function Loader2({ className, size }: { className?: string; size?: number }) {
  return <RefreshCcw className={className} size={size} />;
}
