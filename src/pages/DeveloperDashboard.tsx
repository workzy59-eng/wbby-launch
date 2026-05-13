import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, FirebaseUser, logOut } from '../firebase';
import { UserProfile, Project } from '../types';
import { 
  Bell,
  LogOut, 
  User, 
  MessageCircle, 
  X, 
  LayoutDashboard, 
  Briefcase,
  Settings, 
  Check, 
  Clock, 
  Zap,
  Activity,
  Shield,
  Video,
  FileText,
  Search,
  Filter
} from 'lucide-react';
import ChatSystem from '../components/ChatSystem';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { toast } from 'react-hot-toast';
import { APP_NAME } from '../constants';
import BottomNav from '../components/BottomNav';
import { getUnreadMessageCount, getUserProfile, getNotifications, markNotificationAsRead } from '../services/database';
import { formatDate } from '../lib/utils';

interface DeveloperDashboardProps {
  user: FirebaseUser;
  profile: UserProfile | null;
}

export default function DeveloperDashboard({ user, profile }: DeveloperDashboardProps) {
  return (
    <ErrorBoundary>
      <DeveloperDashboardContent user={user} profile={profile} />
    </ErrorBoundary>
  );
}

function DeveloperDashboardContent({ user, profile }: DeveloperDashboardProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'messages' | 'vault' | 'settings'>('overview');
  const [projects, setProjects] = useState<Project[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Fetch assigned projects
    const q = query(
      collection(db, 'projects'), 
      where('developerId', '==', user.uid)
    );

    const unsubscribeProjects = onSnapshot(q, (snapshot) => {
      const projectsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
      setProjects(projectsData);
      setLoading(false);
    });

    const unsubscribeNotifications = getNotifications(user.uid, setNotifications);
    const unsubscribeUnread = getUnreadMessageCount(user.uid, setUnreadCount);

    return () => {
      unsubscribeProjects();
      unsubscribeNotifications();
      unsubscribeUnread();
    };
  }, [user]);

  const stats = {
    active: projects.filter(p => p.status === 'Development Started' || p.status === 'assigned').length,
    completed: projects.filter(p => p.status === 'Completed').length,
    pending: projects.filter(p => p.status === 'pending').length
  };

  const renderOverview = () => (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-[#c7c42a]/10 rounded-2xl flex items-center justify-center text-[#c7c42a]">
              <Activity size={24} />
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest text-white/60">Active Missions</h3>
          </div>
          <p className="text-5xl font-black text-white italic">{stats.active}</p>
        </div>
        <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500">
              <Check size={24} />
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest text-white/60">Success Rate</h3>
          </div>
          <p className="text-5xl font-black text-white italic">{stats.completed}</p>
        </div>
        <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500">
              <Clock size={24} />
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest text-white/60">Pending Intake</h3>
          </div>
          <p className="text-5xl font-black text-white italic">{stats.pending}</p>
        </div>
      </div>

      <div className="bg-white/5 rounded-[3rem] border border-white/10 overflow-hidden">
        <div className="p-10 border-b border-white/5 flex justify-between items-center">
          <h3 className="text-2xl font-black uppercase italic tracking-tighter">Current Deployment Queue</h3>
          <div className="flex gap-2">
            <div className="bg-green-500/10 text-green-500 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 animate-pulse rounded-full" />
              Live Intel
            </div>
          </div>
        </div>
        <div className="p-10">
          {projects.length > 0 ? (
            <div className="space-y-6">
              {projects.map(project => (
                <div key={project.id} className="bg-white/5 p-8 rounded-[2rem] border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:bg-white/10 transition-all cursor-pointer group">
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-[#c7c42a] uppercase tracking-widest">{project.businessType}</span>
                    <h4 className="text-xl font-black text-white uppercase italic tracking-tight">{project.businessName}</h4>
                    <div className="flex items-center gap-4 text-xs font-bold text-white/40 uppercase tracking-widest">
                      <span className="flex items-center gap-2"><User size={14} /> {project.userName}</span>
                      <span className="flex items-center gap-2 text-[#c7c42a]"><Shield size={14} /> {project.plan}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 w-full md:w-auto">
                    <div className="flex-1 md:flex-none">
                      <div className="flex justify-between text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">
                        <span>Progress</span>
                        <span>{project.progress}%</span>
                      </div>
                      <div className="w-32 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-[#c7c42a]" style={{ width: `${project.progress}%` }} />
                      </div>
                    </div>
                    <button className="p-4 bg-white/5 rounded-2xl text-white/60 hover:text-[#c7c42a] hover:bg-[#c7c42a]/10 transition-all">
                      <ArrowRight size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center space-y-4">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/10">
                <Briefcase size={40} />
              </div>
              <p className="text-white/40 text-sm font-black uppercase italic tracking-widest">No active deployments found at this time.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const primaryColor = '#c7c42a';

  return (
    <div className="min-h-screen bg-black font-sans flex flex-col lg:flex-row text-white selection:bg-[#c7c42a] selection:text-black">
      {/* Sidebar Navigation */}
      <aside className="fixed left-0 top-0 bottom-0 w-24 bg-[#0a0a0a] border-r border-white/5 flex flex-col items-center py-8 gap-10 z-40 hidden lg:flex">
        <div className="w-14 h-14 bg-black rounded-2xl flex flex-col items-center justify-center shadow-xl border border-white/10 group overflow-hidden cursor-pointer">
          <div className="absolute inset-0 bg-[#c7c42a]/0 group-hover:bg-[#c7c42a]/10 transition-colors" />
          <span className="text-white font-black text-2xl italic tracking-tighter relative z-10">W</span>
        </div>

        <nav className="flex-1 flex flex-col gap-5">
          {[
            { id: 'overview', icon: LayoutDashboard, label: 'Ops' },
            { id: 'tasks', icon: Briefcase, label: 'Tasks' },
            { id: 'messages', icon: MessageCircle, label: 'Signals' },
            { id: 'vault', icon: Zap, label: 'Intel' },
            { id: 'settings', icon: Settings, label: 'Auth' },
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-14 h-14 rounded-2xl transition-all duration-300 relative group flex items-center justify-center ${
                activeTab === tab.id 
                  ? 'text-black shadow-lg scale-110' 
                  : 'text-white/20 hover:text-white hover:bg-white/5'
              }`}
              style={activeTab === tab.id ? { backgroundColor: primaryColor } : {}}
              title={tab.label}
            >
              <tab.icon size={22} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
              {tab.id === 'messages' && unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-lg animate-pulse border-2 border-black">
                  {unreadCount}
                </span>
              )}
              <div className="absolute left-full ml-4 px-3 py-2 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                {tab.label}
              </div>
            </button>
          ))}
        </nav>

        <div className="mt-auto pb-4">
          <button 
            onClick={() => logOut()} 
            className="w-14 h-14 rounded-2xl text-white/20 hover:text-red-500 hover:bg-red-500/10 transition-all group flex items-center justify-center"
            title="Logout"
          >
            <LogOut size={22} className="group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        <header className="p-8 md:p-12 border-b border-white/5 flex items-center justify-between sticky top-0 bg-black/80 backdrop-blur-xl z-20">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-[#c7c42a] uppercase tracking-[0.4em] italic">Engineering Terminal</span>
            <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none">
              {activeTab === 'overview' ? 'MISSION STATUS' : activeTab.toUpperCase()}
            </h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs font-black text-white italic uppercase tracking-tight">{profile?.displayName || 'Unit 01'}</span>
              <span className="text-[10px] font-black text-[#c7c42a] uppercase tracking-widest opacity-60 italic">{profile?.role || 'Developer'}</span>
            </div>
            <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-[#c7c42a]">
              <Shield size={24} />
            </div>
          </div>
        </header>

        <div className="flex-1 p-8 md:p-20 max-w-7xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'overview' && renderOverview()}
              {activeTab === 'messages' && (
                <div className="h-[70vh] bg-white/5 rounded-[3rem] border border-white/10 overflow-hidden">
                  <ChatSystem 
                    profile={profile} 
                    currentUser={user} 
                    onClose={() => setActiveTab('overview')} 
                  />
                </div>
              )}
              {activeTab === 'tasks' && (
                <div className="py-20 text-center opacity-40 uppercase font-black italic tracking-widest">
                  Detailed task breakdown coming in next update.
                </div>
              )}
              {activeTab === 'vault' && (
                <div className="py-20 text-center opacity-40 uppercase font-black italic tracking-widest">
                  Media vault access restricted to active deployments.
                </div>
              )}
              {activeTab === 'settings' && (
                <div className="max-w-2xl mx-auto py-20">
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-10">Credential Maintenance</h3>
                  <div className="space-y-6">
                    <div className="p-8 bg-white/5 border border-white/5 rounded-3xl space-y-4">
                      <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest border-b border-white/5 pb-4">
                        <span className="text-white/40">Registered Identity</span>
                        <span className="text-white">{user.email}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest border-b border-white/5 pb-4">
                        <span className="text-white/40">Unit Rank</span>
                        <span className="text-[#c7c42a]">{profile?.devRole || profile?.role || 'Developer'}</span>
                      </div>
                    </div>
                    <Link to="/settings" className="block w-full py-5 bg-white text-black text-center rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-[#c7c42a] transition-all">
                      Full Account Configuration
                    </Link>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <BottomNav userId={user.uid} role="developer" onOpenMessages={() => setActiveTab('messages')} />
      </main>
    </div>
  );
}

function ArrowRight({ size }: { size: number }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  );
}
