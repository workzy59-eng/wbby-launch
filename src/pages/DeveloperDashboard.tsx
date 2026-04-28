import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  LayoutDashboard, 
  Briefcase, 
  MessageSquare, 
  DollarSign, 
  Settings as SettingsIcon,
  LogOut,
  CheckCircle2,
  Clock,
  ExternalLink,
  Globe,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Menu,
  X,
  Plus,
  Wallet,
  Video,
  Award
} from 'lucide-react';
import { FirebaseUser, auth } from '../firebase';
import { UserProfile, Project } from '../types';
import { getProjects, updateProject, getUserProfile, getAdmins, getPayments, updateUserProfile, getClients, getUnassignedProjects } from '../services/database';
import { formatDate } from '../lib/utils';
import { Loader } from '../components/ui/loader';
import MessagesModule from '../components/MessagesModule';
import { MeetingList } from '../components/meetings/MeetingList';

interface DeveloperDashboardProps {
  user: FirebaseUser | null;
  profile: UserProfile | null;
}

type Tab = 'dashboard' | 'projects' | 'pool' | 'chat' | 'meetings' | 'earnings' | 'settings';

export default function DeveloperDashboard({ user, profile }: DeveloperDashboardProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [unassignedProjects, setUnassignedProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<UserProfile[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showAcceptPopup, setShowAcceptPopup] = useState<string | null>(null);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [paymentLinkBasic, setPaymentLinkBasic] = useState('');
  const [paymentLinkPremium, setPaymentLinkPremium] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeveloperWelcome, setShowDeveloperWelcome] = useState(false);
  const [settingsData, setSettingsData] = useState({
    emailNotifications: true,
    pushNotifications: true,
    theme: 'dark',
    upiId: '',
    skills: '',
    paymentLinks: {
      oneTime: { basic: '', standard: '', premium: '' },
      subscription: { basic: '', standard: '', premium: '' }
    }
  });

  useEffect(() => {
    const devEmails = ['aither2029@gmail.com', 'sain17296174@gmail.com', 'workzy59@gmail.com'];
    if (user?.email && devEmails.includes(user.email.toLowerCase())) {
      const hasSeen = localStorage.getItem(`dev_welcome_${user.uid}`);
      if (!hasSeen) {
        setShowDeveloperWelcome(true);
      }
    }
  }, [user]);

  const handleCloseWelcome = () => {
    if (user) {
      localStorage.setItem(`dev_welcome_${user.uid}`, 'true');
    }
    setShowDeveloperWelcome(false);
  };

  useEffect(() => {
    if (!loading && profile && profile.role !== 'developer') {
      navigate('/');
    }
  }, [profile, loading, navigate]);

  useEffect(() => {
    if (!user?.uid) return;

    const unsubProjects = getProjects((projs) => {
      setProjects(projs);
      setLoading(false);
    }, user.uid, 'developer');

    const unsubUnassigned = getUnassignedProjects((projs) => {
      setUnassignedProjects(projs);
    });

    const fetchPayments = async () => {
      try {
        const [pays, profiles] = await Promise.all([
          getPayments(user.uid),
          getClients()
        ]);
        setPayments(pays);
        setClients(profiles);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchPayments();

    return () => {
      unsubProjects();
      unsubUnassigned();
    };
  }, [user?.uid]);

  // Sync settings when profile updates
  useEffect(() => {
    if (profile) {
      setSettingsData({
        upiId: profile.paymentDetails?.upiId || '',
        skills: profile.devRole || '',
        paymentLinks: (profile as any).paymentLinks || { 
          oneTime: { basic: '', standard: '', premium: '' }, 
          subscription: { basic: '', standard: '', premium: '' } 
        },
        emailNotifications: true,
        pushNotifications: true,
        theme: 'dark'
      });
    }
  }, [profile]);

  // Timer logic for 3h deadline
  const [timeLeft, setTimeLeft] = useState<Record<string, string>>({});
  
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const newTimeLeft: Record<string, string> = {};
      
      projects.forEach(p => {
        const currentStatus = p.status?.toLowerCase();
        if (currentStatus === 'pending' || currentStatus === 'assigned') {
          // Robust timestamp conversion
          let startTimeMs = 0;
            if (p.createdAt && typeof p.createdAt === 'object') {
                if ('toDate' in p.createdAt) {
                  startTimeMs = (p.createdAt as any).toDate().getTime();
                } else if ((p.createdAt as any) instanceof Date) {
                  startTimeMs = (p.createdAt as Date).getTime();
                }
            } else if (p.createdAt) {
                startTimeMs = new Date(p.createdAt as any).getTime();
            } else {
                startTimeMs = now;
            }

          const deadline = startTimeMs + (3 * 60 * 60 * 1000);
          const diff = deadline - now;
          
          if (diff <= 0) {
            newTimeLeft[p.id] = 'DELAYED';
            // Update status in DB if needed (to keep it persistent)
            if ((currentStatus === 'assigned' || currentStatus === 'pending') && p.status !== 'delayed') {
              updateProject(p.id, { status: 'delayed' });
            }
          } else {
            const h = Math.floor(diff / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);
            newTimeLeft[p.id] = `${h}h ${m}m ${s}s`;
          }
        }
      });
      setTimeLeft(newTimeLeft);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [projects]);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/auth');
  };

  const handleAcceptProject = async (projectId: string) => {
    if (!websiteUrl) {
      toast.error('Website URL is required');
      return;
    }
    setIsSubmitting(true);
    try {
      await updateProject(projectId, {
        status: 'in-progress',
        websiteUrl,
        paymentLinkBasic,
        paymentLinkPremium,
        startedAt: new Date().toISOString(),
        progress: 10
      });
      toast.success('Project accepted!');
      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, status: 'in-progress', websiteUrl, paymentLinkBasic, paymentLinkPremium, progress: 10 } : p));
      setShowAcceptPopup(null);
      setWebsiteUrl('');
      setPaymentLinkBasic('');
      setPaymentLinkPremium('');
    } catch (error) {
      toast.error('Failed to accept project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProgress = async (projectId: string, progress: number) => {
    try {
      await updateProject(projectId, { progress });
      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, progress } : p));
      toast.success(`Progress updated to ${progress}%`);
    } catch (error) {
      toast.error('Failed to update progress');
    }
  };

  const stats = useMemo(() => {
    const total = projects.length;
    const completed = projects.filter(p => p.status?.toLowerCase() === 'completed').length;
    const active = projects.filter(p => ['development started', 'in-progress', 'assigned', 'pending', 'delayed', 'accepted', 'under review'].includes(p.status?.toLowerCase() || '')).length;
    
    const totalEarned = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + (p.amount || 0), 0);
    
    return { total, completed, pending: active, pool: unassignedProjects.length, earnings: totalEarned };
  }, [projects, payments, unassignedProjects]);

  if (loading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <Loader size={48} />
      </div>
    );
  }

  const NavItem = ({ tab, icon: Icon, label }: { tab: Tab, icon: any, label: string }) => (
    <button
      onClick={() => {
        setActiveTab(tab);
        setIsSidebarOpen(false);
      }}
      className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-bold uppercase italic text-xs tracking-widest transition-all ${
        activeTab === tab 
          ? 'bg-[#c7c42a] text-black shadow-lg shadow-[#c7c42a]/20' 
          : 'text-white/40 hover:bg-white/5 hover:text-white'
      }`}
    >
      <Icon size={18} />
      <span>{label}</span>
    </button>
  );

  return (
    <>
      <AnimatePresence>
        {showDeveloperWelcome && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-3xl"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-2xl bg-[#0a0a0a] rounded-[3rem] border border-[#c7c42a]/20 overflow-hidden relative shadow-[0_0_100px_rgba(199,196,42,0.1)]"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,_#c7c42a15,_transparent_70%)]" />
              
              <div className="p-12 relative z-10 text-center">
                <div className="w-24 h-24 bg-[#c7c42a]/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-[#c7c42a]/20">
                  <Award size={48} className="text-[#c7c42a]" />
                </div>
                
                <h2 className="text-5xl font-bold text-white tracking-tighter mb-4 italic uppercase leading-none">Welcome Aboard,<br/>Special Agent.</h2>
                <p className="text-white/60 text-lg leading-relaxed mb-10 max-w-md mx-auto">
                  Your developer credentials have been verified. Access to the internal dashboard and project pool is now authorized.
                </p>

                <div className="grid grid-cols-3 gap-4 mb-12">
                  {[
                    { label: 'Direct Chat', icon: MessageSquare },
                    { label: 'Project Pool', icon: Briefcase },
                    { label: 'Fast Payouts', icon: Wallet }
                  ].map((feat, i) => (
                    <div key={i} className="bg-white/5 p-4 rounded-3xl border border-white/5">
                      <feat.icon size={20} className="text-[#c7c42a] mx-auto mb-2" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{feat.label}</span>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={handleCloseWelcome}
                  className="w-full bg-[#c7c42a] text-black py-6 rounded-full font-black text-sm uppercase tracking-[0.3em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(199,196,42,0.3)]"
                >
                  Enter Dashboard
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-screen flex flex-col md:flex-row bg-[#050505] text-white overflow-hidden font-sans">
      
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-72 flex-col bg-[#111] border-r border-white/5 p-8 space-y-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#c7c42a] rounded-xl flex items-center justify-center text-black font-black text-xl italic italic">W</div>
          <h1 className="text-xl font-black italic uppercase tracking-tighter">WebbyLaunch</h1>
        </div>

        <nav className="flex-1 flex flex-col gap-2">
          <NavItem tab="dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem tab="pool" icon={Plus} label="New Jobs" />
          <NavItem tab="projects" icon={Briefcase} label="Projects" />
          <NavItem tab="chat" icon={MessageSquare} label="Chat" />
          <NavItem tab="meetings" icon={Video} label="Meetings" />
          <NavItem tab="earnings" icon={DollarSign} label="Earnings" />
          <NavItem tab="settings" icon={SettingsIcon} label="Settings" />
        </nav>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-4 px-6 py-4 rounded-2xl font-bold uppercase italic text-xs tracking-widest text-red-500 hover:bg-red-500/10 transition-all mt-auto"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Header */}
        <header className="p-6 md:p-8 border-b border-white/5 flex items-center justify-between bg-[#111]/50 backdrop-blur-xl z-20">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 text-white/40" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <div>
              <h2 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter">
                {activeTab === 'dashboard' ? `Welcome, ${profile?.displayName || 'Dev'}` : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">System Status: Active</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <button 
              onClick={handleLogout}
              className="md:hidden p-3 bg-red-500/10 text-red-500 rounded-xl"
            >
              <LogOut size={18} />
            </button>
            <div className="hidden md:flex items-center gap-4">
               <div className="text-right">
                  <p className="text-xs font-black uppercase italic text-white">{profile?.displayName}</p>
                  <p className="text-[10px] font-bold uppercase text-white/40">Level 1 Developer</p>
               </div>
               <div className="w-12 h-12 rounded-2xl bg-[#c7c42a]/10 border border-[#c7c42a]/20 flex items-center justify-center text-[#c7c42a]">
                  <TrendingUp size={20} />
               </div>
            </div>
          </div>
        </header>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 pb-32 md:pb-10 custom-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-10"
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
                  {[
                    { label: 'Total', value: stats.total, color: 'text-white' },
                    { label: 'Completed', value: stats.completed, color: 'text-green-500' },
                    { label: 'Active', value: stats.pending, color: 'text-[#c7c42a]' },
                    { label: 'New Jobs', value: stats.pool, color: 'text-[#c7c42a]' },
                    { label: 'Earnings', value: `₹${stats.earnings.toLocaleString()}`, color: 'text-[#c7c42a]' }
                  ].map((stat, i) => (
                    <div 
                      key={i} 
                      className={`bg-white/5 border border-white/10 rounded-[2rem] p-6 md:p-8 space-y-2 ${stat.label === 'New Jobs' ? 'cursor-pointer hover:border-[#c7c42a]/50' : ''}`}
                      onClick={() => stat.label === 'New Jobs' ? setActiveTab('pool') : null}
                    >
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">{stat.label}</p>
                      <h3 className={`text-2xl md:text-3xl font-black italic ${stat.color}`}>{stat.value}</h3>
                    </div>
                  ))}
                </div>

                {/* Important Projects (Assignments) */}
                <div className="space-y-6">
                  <h3 className="text-lg font-black italic uppercase tracking-widest text-[#c7c42a]">Active Projects</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {projects.map(p => (
                      <div key={p.id} className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-6 relative overflow-hidden group">
                        {/* Background Decoration */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#c7c42a]/5 rounded-full blur-3xl group-hover:bg-[#c7c42a]/10 transition-all" />
                        
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <h4 className="text-xl font-black italic uppercase tracking-tighter text-white">{p.businessName}</h4>
                            <p className="text-[10px] font-bold uppercase text-white/40">{p.userName || 'Private Client'}</p>
                          </div>
                          <div className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                            p.status?.toLowerCase() === 'completed' ? 'bg-green-500/10 text-green-500' :
                            p.status?.toLowerCase() === 'in-progress' ? 'bg-blue-500/10 text-blue-400' :
                            'bg-[#c7c42a]/10 text-[#c7c42a] animate-pulse'
                          }`}>
                            {p.status}
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-3">
                          <div className="flex justify-between text-[8px] font-black uppercase tracking-widest">
                            <span className="text-white/40">Development Progress</span>
                            <span className="text-[#c7c42a]">{p.progress || 0}%</span>
                          </div>
                          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${p.progress || 0}%` }}
                              className="h-full bg-[#c7c42a] shadow-[0_0_15px_rgba(199,196,42,0.5)]"
                            />
                          </div>
                        </div>

                        {/* Deadline Timer */}
                        {(p.status?.toLowerCase() === 'pending' || p.status?.toLowerCase() === 'assigned') && (
                          <div className="flex items-center gap-3 p-4 bg-black/40 rounded-2xl border border-white/5">
                            <Clock size={16} className={timeLeft[p.id] === 'DELAYED' ? 'text-red-500' : 'text-[#c7c42a]'} />
                            <div className="flex-1">
                              <p className="text-[8px] font-black uppercase text-white/40">Accept Deadline</p>
                              <p className={`text-xs font-black italic ${timeLeft[p.id] === 'DELAYED' ? 'text-red-500' : 'text-white'}`}>
                                {timeLeft[p.id] || 'Loading...'}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="pt-2">
                          {p.status?.toLowerCase() === 'pending' || p.status?.toLowerCase() === 'assigned' ? (
                            <button 
                              onClick={() => setShowAcceptPopup(p.id)}
                              className="w-full py-4 bg-[#c7c42a] text-black font-black uppercase italic text-xs tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#c7c42a]/10"
                            >
                              Accept Project
                            </button>
                          ) : (
                            <div className="flex gap-2">
                              {p.websiteUrl && (
                                <a 
                                  href={p.websiteUrl} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="flex-1 py-4 bg-white/5 border border-white/10 text-white font-black uppercase italic text-[10px] tracking-widest rounded-2xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
                                >
                                  View Site <Globe size={14} />
                                </a>
                              )}
                              <button 
                                onClick={() => setActiveTab('projects')}
                                className="flex-1 py-4 bg-white/5 border border-white/10 text-white font-black uppercase italic text-[10px] tracking-widest rounded-2xl hover:bg-white/10 transition-all"
                              >
                                Manage
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {projects.length === 0 && (
                      <div className="col-span-full py-20 flex flex-col items-center justify-center space-y-4 border-2 border-dashed border-white/5 rounded-[3rem]">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-white/20">
                          <Briefcase size={32} />
                        </div>
                        <p className="text-sm font-bold uppercase italic text-white/20 tracking-widest">No active projects assigned</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'pool' && (
              <motion.div 
                key="pool"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-10"
              >
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#c7c42a]">Opportunity Hub</span>
                  <h2 className="text-6xl font-black tracking-tighter uppercase italic text-white leading-none">Job Pool</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {unassignedProjects.map(p => (
                    <div key={p.id} className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-6 group">
                      <div className="space-y-2">
                        <h4 className="text-xl font-black italic uppercase tracking-tighter text-white">{p.businessName}</h4>
                        <div className="flex items-center gap-2">
                           <span className="px-3 py-1 bg-white/5 rounded-lg text-[8px] font-black uppercase tracking-widest text-white/40">{p.businessType}</span>
                           <span className="px-3 py-1 bg-[#c7c42a]/10 rounded-lg text-[8px] font-black uppercase tracking-widest text-[#c7c42a]">{p.plan}</span>
                        </div>
                      </div>
                      <p className="text-xs font-medium text-white/60 line-clamp-3 leading-relaxed italic">
                        {p.description || 'No description provided.'}
                      </p>
                      
                      <button 
                        onClick={async () => {
                          if (confirm('Claim this project? You will be responsible for its delivery.')) {
                            try {
                              await updateProject(p.id, { 
                                developerId: user?.uid,
                                assignedTo: user?.uid,
                                assignedAt: new Date().toISOString(),
                                status: 'Assigned'
                              });
                              toast.success('Project claimed successfully!');
                              setActiveTab('projects');
                            } catch (e) {
                              toast.error('Failed to claim project');
                            }
                          }
                        }}
                        className="w-full py-4 bg-white text-black font-black uppercase italic text-xs tracking-widest rounded-2xl hover:bg-[#c7c42a] transition-all"
                      >
                        Claim Project
                      </button>
                    </div>
                  ))}
                  {unassignedProjects.length === 0 && (
                     <div className="col-span-full py-20 flex flex-col items-center justify-center space-y-4 border-2 border-dashed border-white/5 rounded-[3rem]">
                        <p className="text-sm font-bold uppercase italic text-white/20 tracking-widest">No new projects available in the pool</p>
                      </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'projects' && (
              <motion.div 
                key="projects"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-10"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter">My Roadmap</h3>
                  <div className="px-4 py-2 bg-[#c7c42a]/10 border border-[#c7c42a]/20 rounded-xl text-[#c7c42a] text-[10px] font-black uppercase tracking-widest">
                    {projects.length} Total Projects
                  </div>
                </div>

                <div className="space-y-6">
                  {projects.map(p => (
                    <div key={p.id} className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-10">
                      <div className="flex flex-col md:flex-row justify-between gap-8">
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-[#c7c42a] rounded-2xl flex items-center justify-center text-black font-black text-xl italic">
                              {p.businessName?.[0]}
                            </div>
                            <div>
                              <h4 className="text-2xl font-black italic uppercase tracking-tighter text-white">{p.businessName}</h4>
                              <p className="text-xs font-bold uppercase text-white/40 tracking-widest">{p.userName || 'WebbyLaunch Client'}</p>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-3">
                            <div className="px-4 py-2 bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/60">
                              Status: <span className="text-[#c7c42a] ml-1">{p.status}</span>
                            </div>
                            <div className="px-4 py-2 bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/60">
                              Assigned: {formatDate(p.createdAt)}
                            </div>
                            {p.websiteUrl && (
                               <a href={p.websiteUrl} target="_blank" rel="noreferrer" className="px-4 py-2 bg-[#c7c42a]/10 text-[#c7c42a] border border-[#c7c42a]/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#c7c42a] hover:text-black transition-all flex items-center gap-2">
                                  Live URL <ExternalLink size={12} />
                               </a>
                            )}
                          </div>
                        </div>

                        <div className="w-full md:w-80 space-y-6">
                           <div className="space-y-2">
                              <div className="flex justify-between items-center px-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">Set Progress</label>
                                <span className="text-lg font-black italic text-[#c7c42a]">{p.progress || 0}%</span>
                              </div>
                              <input 
                                type="range" 
                                min="0" 
                                max="100" 
                                step="5"
                                value={p.progress || 0}
                                onChange={(e) => handleUpdateProgress(p.id, parseInt(e.target.value))}
                                className="w-full accent-[#c7c42a] h-2 bg-white/5 rounded-full appearance-none cursor-pointer"
                              />
                           </div>

                           <div className="grid grid-cols-2 gap-3">
                              <button 
                                onClick={() => {
                                  if (confirm('Complete project?')) {
                                    updateProject(p.id, { status: 'completed', progress: 100 });
                                    toast.success('Project Completed!');
                                  }
                                }}
                                className="py-4 bg-green-500/10 border border-green-500/20 text-green-500 rounded-2xl font-black uppercase italic text-[10px] tracking-widest hover:bg-green-500 hover:text-white transition-all flex items-center justify-center gap-2"
                              >
                                Complete <CheckCircle2 size={16} />
                              </button>
                              <button 
                                onClick={() => setActiveTab('chat')}
                                className="py-4 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-2xl font-black uppercase italic text-[10px] tracking-widest hover:bg-blue-500 hover:text-white transition-all flex items-center justify-center gap-2"
                              >
                                Contact Client
                              </button>
                           </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'chat' && (
              <motion.div 
                key="chat"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-[calc(100vh-250px)] bg-[#111] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl"
              >
                {user && <MessagesModule currentUser={user} profile={profile} onClose={() => setActiveTab('dashboard')} />}
              </motion.div>
            )}

            {activeTab === 'meetings' && (
              <motion.div 
                key="meetings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-10"
              >
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#c7c42a]">Scheduling</span>
                  <h2 className="text-6xl font-black tracking-tighter uppercase italic text-white leading-none">Developer Meetings</h2>
                </div>
                <MeetingList user={user!} profile={profile!} allClients={clients} />
              </motion.div>
            )}

            {activeTab === 'earnings' && (
              <motion.div 
                key="earnings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-10"
              >
                {/* Earnings Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-[#c7c42a] rounded-[2.5rem] p-10 text-black shadow-[0_0_50px_rgba(199,196,42,0.2)]">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60 italic mb-2">Total Earned</p>
                    <h3 className="text-4xl font-black italic">₹{stats.earnings.toLocaleString()}</h3>
                    <div className="mt-8 pt-8 border-t border-black/10 flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase italic tracking-widest opacity-60">Verified Lifetime</span>
                      <TrendingUp size={24} />
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">In Queue / Processing</p>
                    <h3 className="text-4xl font-black italic text-white">
                      ₹{payments.filter(p => !p.status || p.status === 'pending').reduce((sum, p) => sum + (p.amount || 0), 0).toLocaleString()}
                    </h3>
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest italic pt-4 leading-relaxed">Payments are processed every Monday for completed missions.</p>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 space-y-2 flex flex-col justify-center items-center text-center">
                    <div className="w-14 h-14 bg-[#c7c42a]/10 rounded-full flex items-center justify-center text-[#c7c42a] mb-4">
                      <Wallet size={24} />
                    </div>
                    <h4 className="text-sm font-black uppercase italic tracking-tighter">Settlement Hub</h4>
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-1 mb-4">Current: {profile?.paymentDetails?.upiId || 'Not Configured'}</p>
                    <button 
                      onClick={() => setActiveTab('settings')}
                      className="px-8 py-3 bg-white/10 rounded-xl text-[10px] font-black uppercase italic tracking-widest hover:bg-[#c7c42a] hover:text-black transition-all"
                    >
                      Update Bank Info
                    </button>
                  </div>
                </div>

                {/* Detailed Earnings Log */}
                <div className="bg-[#0A0A0A] border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl">
                   <div className="p-10 border-b border-white/5 flex justify-between items-center bg-white/5">
                      <div>
                        <h4 className="text-xl font-black uppercase italic tracking-tighter">Earnings Ledger</h4>
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Chronological list of all settled missions</p>
                      </div>
                      <div className="flex gap-2">
                         <span className="px-4 py-2 bg-white/5 rounded-full text-[10px] font-black uppercase tracking-widest">{payments.length} Records</span>
                      </div>
                   </div>
                   <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="text-[10px] font-black uppercase tracking-widest text-white/20 border-b border-white/5 bg-white/[0.02]">
                            <th className="px-10 py-6">Date</th>
                            <th className="px-10 py-6">Mission / Project</th>
                            <th className="px-10 py-6">Amount</th>
                            <th className="px-10 py-6">Method</th>
                            <th className="px-10 py-6">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 transition-all">
                          {payments.length > 0 ? payments.map((pay, i) => (
                            <tr key={i} className="group hover:bg-white/5 transition-all">
                              <td className="px-10 py-8 text-xs font-bold text-white/40">{pay.createdAt ? new Date(pay.createdAt.seconds * 1000).toLocaleDateString() : 'Recent'}</td>
                              <td className="px-10 py-8">
                                <div className="space-y-1">
                                  <p className="text-sm font-black uppercase italic tracking-tighter">Project #{pay.projectId?.slice(-6).toUpperCase() || 'UNKNOWN'}</p>
                                  <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Base Compensation</p>
                                </div>
                              </td>
                              <td className="px-10 py-8 text-sm font-black italic text-[#c7c42a]">₹{pay.amount?.toLocaleString()}</td>
                              <td className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-white/40">{pay.method || 'UPI Settlement'}</td>
                              <td className="px-10 py-8">
                                <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                                  pay.status === 'paid' 
                                    ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                                    : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                }`}>
                                  {pay.status || 'Pending'}
                                </span>
                              </td>
                            </tr>
                          )) : (
                            <tr>
                              <td colSpan={5} className="px-10 py-20 text-center">
                                <div className="flex flex-col items-center gap-4 opacity-20">
                                  <DollarSign size={48} />
                                  <p className="text-sm font-black uppercase tracking-widest">No earnings data detected in the ledger.</p>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                   </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div 
                key="settings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-3xl mx-auto space-y-10"
              >
                 <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 space-y-8">
                    <div className="flex items-center gap-6 pb-8 border-b border-white/5">
                        <div className="w-20 h-20 bg-[#c7c42a] rounded-[2.5rem] flex items-center justify-center text-black font-black text-3xl italic">
                          {profile?.displayName?.[0]}
                        </div>
                        <div>
                          <h4 className="text-2xl font-black italic uppercase tracking-tighter text-white">{profile?.displayName}</h4>
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 italic">Engineering Access: Certified</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-4">
                          <h5 className="text-xs font-black uppercase tracking-widest text-[#c7c42a] italic">Payment Settlement</h5>
                          <div className="space-y-3">
                             <div className="relative">
                                <p className="text-[8px] font-black uppercase text-white/40 mb-1 ml-2">UPI ID</p>
                                <input 
                                  type="text" 
                                  placeholder="yourname@okaxis" 
                                  value={settingsData.upiId}
                                  onChange={(e) => setSettingsData({ ...settingsData, upiId: e.target.value })}
                                  className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-xs font-bold text-white outline-none focus:border-[#c7c42a] transition-all font-mono" 
                                />
                             </div>
                          </div>
                       </div>

                       <div className="space-y-4">
                          <h5 className="text-xs font-black uppercase tracking-widest text-[#c7c42a] italic">Skills & Craft</h5>
                          <div className="space-y-3">
                             <div className="relative">
                                <p className="text-[8px] font-black uppercase text-white/40 mb-1 ml-2">Primary Domain</p>
                                <input 
                                  type="text" 
                                  value={settingsData.skills}
                                  onChange={(e) => setSettingsData({ ...settingsData, skills: e.target.value })}
                                  placeholder="React, Node.js, Firebase..."
                                  className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-xs font-bold text-white outline-none focus:border-[#c7c42a] transition-all" 
                                />
                             </div>
                          </div>
                       </div>
                    </div>

                    <button 
                      onClick={async () => {
                        if (!user?.uid) return;
                        setIsSubmitting(true);
                        try {
                          await updateUserProfile(user.uid, {
                            paymentDetails: {
                              ...profile?.paymentDetails,
                              upiId: settingsData.upiId
                            },
                            devRole: settingsData.skills
                          });
                          toast.success('System preferences updated');
                        } catch (error) {
                          toast.error('Failed to update settings');
                        } finally {
                          setIsSubmitting(false);
                        }
                      }}
                      disabled={isSubmitting}
                      className="w-full py-5 bg-white text-black font-black uppercase italic text-xs tracking-widest rounded-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? 'Syncing...' : 'Save System Preferences'}
                    </button>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[#111]/90 backdrop-blur-2xl border-t border-white/5 px-4 py-3 flex items-center justify-between z-50">
          {[
            { tab: 'dashboard' as Tab, icon: LayoutDashboard, label: 'Home' },
            { tab: 'projects' as Tab, icon: Briefcase, label: 'Projects' },
            { tab: 'chat' as Tab, icon: MessageSquare, label: 'Chat' },
            { tab: 'meetings' as Tab, icon: Video, label: 'Meets' },
            { tab: 'earnings' as Tab, icon: DollarSign, label: 'Pay' },
            { tab: 'settings' as Tab, icon: SettingsIcon, label: 'Settings' }
          ].map((item) => (
            <button 
              key={item.tab}
              onClick={() => setActiveTab(item.tab)}
              className={`flex flex-col items-center gap-1 transition-all ${activeTab === item.tab ? 'text-[#c7c42a]' : 'text-white/20'}`}
            >
              <item.icon size={20} strokeWidth={activeTab === item.tab ? 2.5 : 2} />
              <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Mobile Overlay Menu */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl md:hidden"
            >
              <div className="flex flex-col h-full p-10">
                <div className="flex justify-between items-center mb-16">
                   <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#c7c42a] rounded-xl flex items-center justify-center text-black font-black text-xl italic italic">W</div>
                    <h1 className="text-xl font-black italic uppercase tracking-tighter">WebbyLaunch</h1>
                  </div>
                  <button className="p-3 bg-white/5 rounded-2xl text-white/40" onClick={() => setIsSidebarOpen(false)}>
                    <X size={24} />
                  </button>
                </div>

                <div className="flex flex-col gap-4">
                  <NavItem tab="dashboard" icon={LayoutDashboard} label="Dashboard" />
                  <NavItem tab="projects" icon={Briefcase} label="Projects" />
                  <NavItem tab="chat" icon={MessageSquare} label="Chat" />
                  <NavItem tab="meetings" icon={Video} label="Meetings" />
                  <NavItem tab="earnings" icon={DollarSign} label="Earnings" />
                  <NavItem tab="settings" icon={SettingsIcon} label="Settings" />
                  
                  <div className="pt-10 mt-10 border-t border-white/5">
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-4 px-6 py-5 rounded-2xl font-bold uppercase italic text-xs tracking-widest text-red-500 bg-red-500/5 hover:bg-red-500/10 transition-all"
                    >
                      <LogOut size={18} />
                      <span>Logout Account</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Accept Project Popup */}
      <AnimatePresence>
        {showAcceptPopup && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-3xl"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="max-w-md w-full bg-[#111] border border-white/10 rounded-[3rem] p-10 space-y-8 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-[#c7c42a]" />
              
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-[#c7c42a]/10 rounded-3xl flex items-center justify-center mx-auto text-[#c7c42a] shadow-2xl">
                  <Globe size={40} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Accept Assignment</h3>
                  <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] italic">Mission Critical Infrastructure Setup</p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-xs font-bold text-white/60 text-center uppercase tracking-widest leading-relaxed">
                  Enter delivery details. Note: Domain charges are not included and must be communicated separately.
                </p>
                
                <div className="space-y-2">
                  <label className="text-[8px] font-black text-[#c7c42a] uppercase tracking-[0.3em] ml-4">Deployment URL</label>
                  <div className="relative">
                    <Globe className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                    <input 
                      type="url" 
                      required
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      placeholder="https://example.com"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-16 pr-6 py-5 text-white font-bold outline-none focus:border-[#c7c42a] transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[8px] font-black text-[#c7c42a] uppercase tracking-[0.3em] ml-4">Basic Payment Link</label>
                  <div className="relative">
                    <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                    <input 
                      type="url" 
                      value={paymentLinkBasic}
                      onChange={(e) => setPaymentLinkBasic(e.target.value)}
                      placeholder="Razorpay/Stripe Link"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-16 pr-6 py-5 text-white font-bold outline-none focus:border-[#c7c42a] transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[8px] font-black text-[#c7c42a] uppercase tracking-[0.3em] ml-4">Premium Payment Link</label>
                  <div className="relative">
                    <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                    <input 
                      type="url" 
                      value={paymentLinkPremium}
                      onChange={(e) => setPaymentLinkPremium(e.target.value)}
                      placeholder="Razorpay/Stripe Link"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-16 pr-6 py-5 text-white font-bold outline-none focus:border-[#c7c42a] transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => {
                    setShowAcceptPopup(null);
                    setWebsiteUrl('');
                  }} 
                  className="flex-1 py-4 rounded-2xl border border-white/10 text-white font-black uppercase italic text-xs tracking-widest hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleAcceptProject(showAcceptPopup)}
                  disabled={isSubmitting || !websiteUrl}
                  className="flex-1 py-4 rounded-2xl bg-[#c7c42a] text-black font-black uppercase italic text-xs tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#c7c42a]/20 disabled:opacity-50"
                >
                  {isSubmitting ? 'Processing...' : 'Accept Mission'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
    </>
  );
}
