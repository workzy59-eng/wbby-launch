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
  Award,
  Settings2,
  XCircle,
  Download,
  User as UserIcon,
  FileText
} from 'lucide-react';
import { FirebaseUser, auth } from '../firebase';
import { UserProfile, Project, Attendance } from '../types';
import { 
  getProjects, 
  updateProject, 
  getUserProfile, 
  getAdmins, 
  getPayments, 
  updateUserProfile, 
  getClients, 
  getUnassignedProjects, 
  sendMessage, 
  acceptProject, 
  getNotifications, 
  markNotificationAsRead, 
  punchIn, 
  punchOut, 
  getUnreadMessageCount,
  getDeveloperAttendanceStatus,
  getDeveloperStats,
  createNotification,
  getAttendance
} from '../services/database';
import { formatDate } from '../lib/utils';
import { Loader } from '../components/ui/loader';
import MessagesModule from '../components/MessagesModule';
import { MeetingList } from '../components/meetings/MeetingList';
import { Bell, Info } from 'lucide-react';

import BottomNav from '../components/BottomNav';

interface DeveloperDashboardProps {
  user: FirebaseUser | null;
  profile: UserProfile | null;
}

type Tab = 'dashboard' | 'projects' | 'pool' | 'chat' | 'analytics' | 'earnings' | 'settings' | 'attendance';

export default function DeveloperDashboard({ user, profile }: DeveloperDashboardProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [unassignedProjects, setUnassignedProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<UserProfile[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showAcceptPopup, setShowAcceptPopup] = useState<string | null>(null);
  const [showRejectPopup, setShowRejectPopup] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [domainPrice, setDomainPrice] = useState<number>(0);
  const [paymentLinkBasic, setPaymentLinkBasic] = useState('');
  const [paymentLinkPremium, setPaymentLinkPremium] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedProjectForDrawer, setSelectedProjectForDrawer] = useState<Project | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showDeveloperWelcome, setShowDeveloperWelcome] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [settingsData, setSettingsData] = useState({
    emailNotifications: true,
    pushNotifications: true,
    theme: 'dark',
    upiId: '',
    skills: '',
    paymentLinks: {
      oneTime: { basic: '', standard: '', premium: '' }
    }
  });
  const [isPunchedIn, setIsPunchedIn] = useState(false);
  const [punchInTime, setPunchInTime] = useState<any>(null);
  const [punchOutTimer, setPunchOutTimer] = useState<string | null>(null);
  const [devStats, setDevStats] = useState({ completedCount: 0, activeCount: 0, totalHours: 0, totalPayout: 0 });
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [totalHours, setTotalHours] = useState(0);
  const [isSuspended, setIsSuspended] = useState(false);
  const [isStickyOpen, setIsStickyOpen] = useState(false);
  const [stickyNotes, setStickyNotes] = useState(profile?.notes || '');

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = getUnreadMessageCount(user.uid, setUnreadCount);
    
    // Real-time attendance status
    const unsubAttendance = getDeveloperAttendanceStatus(user.uid, (data) => {
      setIsPunchedIn(data.isPunchedIn);
      setPunchInTime(data.punchIn);
    });
    getDeveloperStats(user.uid).then(setDevStats);
    
    // Fetch detailed attendance for calendar
    getAttendance(user.uid).then(data => {
      setAttendance(data as Attendance[]);
      // Calculate total hours from attendance
      const total = (data as Attendance[]).reduce((acc, curr) => acc + (curr.totalHours || 0), 0);
      setTotalHours(total);

      // Check for consecutive absences
      const today = new Date();
      const oneDay = 24 * 60 * 60 * 1000;
      let consecutiveAbsences = 0;
      
      for (let i = 0; i < 3; i++) {
        const checkDate = new Date(today.getTime() - (i * oneDay));
        const record = (data as Attendance[]).find(a => {
          const d = new Date(a.date);
          return d.getDate() === checkDate.getDate() && 
                 d.getMonth() === checkDate.getMonth() && 
                 d.getFullYear() === checkDate.getFullYear();
        });
        if (!record) consecutiveAbsences++;
      }

      if (consecutiveAbsences >= 3) {
        setIsSuspended(true);
      }
    });

    if (profile?.status === 'suspended') {
      setIsSuspended(true);
    }

    return () => {
      unsub?.();
      unsubAttendance?.();
    };
  }, [user?.uid]);

  useEffect(() => {
    const devEmails = ['sain17296174@gmail.com', 'workzy59@gmail.com', 'bharathmath1729@gmail.com', 'aither2029@gmail.com'];
    const adminEmails = ['priyankapudi4u@gmail.com', 'workzy59@gmail.com'];
    if (user?.email && (devEmails.includes(user.email.toLowerCase()) || adminEmails.includes(user.email.toLowerCase()))) {
      const hasSeen = localStorage.getItem(`dev_welcome_${user.uid}`);
      if (!hasSeen) {
        setShowDeveloperWelcome(true);
      }
    }
  }, [user]);

  useEffect(() => {
    if (!isPunchedIn || !punchInTime) {
      setPunchOutTimer(null);
      return;
    }

    const updateTimer = () => {
      const now = new Date().getTime();
      const punchDate = punchInTime.toDate ? punchInTime.toDate().getTime() : new Date(punchInTime).getTime();
      const fiveHoursInMs = 5 * 60 * 60 * 1000;
      const targetTime = punchDate + fiveHoursInMs;
      const diff = targetTime - now;

      if (diff <= 0) {
        setPunchOutTimer(null);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setPunchOutTimer(`${hours}h ${minutes}m ${seconds}s`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [isPunchedIn, punchInTime]);

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

    const unsubNotifications = getNotifications(user.uid, (notifs) => {
      setNotifications(notifs);
    });

    let unsubUnassigned = () => {};
    if (activeTab === 'pool' || activeTab === 'dashboard') {
      unsubUnassigned = getUnassignedProjects((projs) => {
        setUnassignedProjects(projs);
      });
    }

    if (activeTab === 'analytics') {
      // Analytics data fetch logic could go here
    }

    return () => {
      unsubProjects();
      unsubNotifications();
      unsubUnassigned();
    };
  }, [user?.uid, activeTab]);

  // Sync settings when profile updates
  useEffect(() => {
    if (profile) {
      setSettingsData({
        upiId: profile.paymentDetails?.upiId || '',
        skills: profile.devRole || '',
        paymentLinks: (profile as any).paymentLinks || { 
          oneTime: { basic: '', standard: '', premium: '' }
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

  // Financial Intelligence State
  const [tempDomainPrice, setTempDomainPrice] = useState<number>(0);
  const [tempPaymentLink, setTempPaymentLink] = useState('');
  const [isFinancialIntelSaved, setIsFinancialIntelSaved] = useState(false);

  const handleSaveFinancialIntel = async (projectId: string) => {
    setIsSubmitting(true);
    try {
      const project = projects.find(p => p.id === projectId) || unassignedProjects.find(p => p.id === projectId);
      
      await updateProject(projectId, {
        domainPrice: tempDomainPrice,
        paymentLink: tempPaymentLink,
        updatedAt: new Date().toISOString()
      });

      // Send notification to client if domain price is set/updated
      if (project && tempDomainPrice > 0) {
        await createNotification({
          userId: project.userId,
          title: 'Domain Infrastructure Update',
          message: `Your domain price is ₹${tempDomainPrice}. Once the project is completed, we will buy a domain and handover the full site access to you.`,
          type: 'domain_update',
          projectId: projectId,
          severity: 'high'
        });
      }

      setIsFinancialIntelSaved(true);
      toast.success('Financial intel committed to the ledger');
    } catch (error) {
      console.error('Save failed:', error);
      toast.error('Failed to commit financial data');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculatePayout = (plan?: string) => {
    const p = plan?.toLowerCase() || 'basic';
    if (p === 'premium') return 4500;
    if (p === 'standard') return 2250;
    return 1125;
  };

  const getPlanPrice = (plan?: string) => {
    const p = plan?.toLowerCase() || 'basic';
    if (p === 'premium') return 30000;
    if (p === 'standard') return 15000;
    return 7500;
  };

  const handleContact = (project: Project) => {
    const isMobile = /iPhone|Android/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = `tel:${project.userPhone}`;
    } else {
      alert(`Client Intelligence:\nName: ${project.userName}\nPhone: ${project.userPhone}\nEmail: ${project.userEmail}`);
    }
  };

  const openAcceptPopup = (projectId: string) => {
    setTempDomainPrice(0);
    setTempPaymentLink('');
    setIsFinancialIntelSaved(false);
    setShowAcceptPopup(projectId);
  };

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/auth');
  };

  const handleAcceptProject = async (projectId: string) => {
    setIsSubmitting(true);
    try {
      if (!user?.uid) return;
      
      const p = unassignedProjects.find(item => item.id === projectId) || projects.find(item => item.id === projectId);
      if (!p) throw new Error("Project not found");

      await acceptProject(projectId);
      
      // Values are already saved via handleSaveFinancialIntel, 
      // but we ensure status is correct and links matches current plan if not already set
      await updateProject(projectId, {
        status: 'in-progress'
      });

      setActiveTab('projects');
      setShowAcceptPopup(null);
      setWebsiteUrl('');
      setTempDomainPrice(0);
      setTempPaymentLink('');
      setIsFinancialIntelSaved(false);
      toast.success('Mission accepted and infrastructure initialized');
    } catch (error: any) {
      console.error('Acceptance failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadClientDetails = (project: Project) => {
    const details = `
WEBBYLAUNCH MISSION INTELLIGENCE REPORT
=======================================

CLIENT PROFILE
--------------
NAME: ${project.userName || 'N/A'}
EMAIL: ${project.userEmail || 'N/A'}
PHONE: ${project.userPhone || 'N/A'}
COUNTRY: ${project.country || 'INDIA'}

BUSINESS INTEL
--------------
BRAND: ${project.businessName || 'N/A'}
CATEGORY: ${project.businessType || 'N/A'}
CONFIG: ${project.storeType === 'online_store' ? 'ONLINE STORE / SHIPMENT' : 'LOCAL STORE / WALK-IN'}
REGION: ${project.locationState || 'N/A'}
CITY/LOCATION: ${project.city || 'N/A'}
BIZ PHONE: ${project.businessPhone || 'N/A'}
BIZ EMAIL: ${project.businessEmail || 'N/A'}

TECHNICAL SPECIFICATIONS
------------------------
SYSTEM PLAN: ${project.plan?.toUpperCase() || 'BASIC'}
PRIMARY COLOR: ${project.primaryColor || '#C7C42A'}
SECONDARY COLOR: ${project.secondaryColor || '#000000'}
SELECTED DOMAIN: ${project.domain || 'PENDING'}
DOMAIN PREFERENCES: ${project.domainPreferences?.join(', ') || 'N/A'}
FEATURES: ${project.selectedFeatures?.join(', ') || 'DEFAULT STACK'}

MISSION PARAMETERS
------------------
ID: ${project.id}
STATUS: ${project.status}
PROGRESS: ${project.progress}%
CREATED: ${formatDate(project.createdAt)}

DESCRIPTION:
${project.description || 'NO DESCRIPTION PROVIDED.'}
=======================================
PRECISION BUILT BY WEBBYLAUNCH
`.trim();

    const element = document.createElement("a");
    const file = new Blob([details], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${project.businessName}_client_details.txt`;
    document.body.appendChild(element);
    element.click();
    toast.success('Client details downloaded');
  };

  const handleRejectProject = async (projectId: string) => {
    if (!rejectionReason.trim()) {
      toast.error('Rejection reason is required');
      return;
    }
    setIsSubmitting(true);
    try {
      await updateProject(projectId, {
        status: 'pending',
        rejectionReason,
        rejectedAt: new Date().toISOString(),
        developerId: null,
        assignedTo: null
      });
      toast.success('Project returned to pool');
      setProjects(prev => prev.filter(p => p.id !== projectId));
      setShowRejectPopup(null);
      setRejectionReason('');
    } catch (error) {
      toast.error('Failed to reject project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadPrompt = (project: Project) => {
    const blueprintPrompt = `
TITAN AI MISSION BLUEPRINT: ${project.businessName.toUpperCase()}
=======================================================

MISSION OBJECTIVE:
Construct a high-performance ${project.businessType} for a ${project.storeType === 'online_store' ? 'GLOBAL ECOMMERCE' : 'LOCAL SERVICE'} entity.

GEOGRAPHIC FOCUS:
Located in ${project.city || 'N/A'}, ${project.locationState || 'N/A'} (${project.country || 'INDIA'}).

VISUAL PROTOCOL:
- PRIMARY DEPOT: ${project.primaryColor || '#C7C42A'}
- SECONDARY DEPOT: ${project.secondaryColor || '#000000'}
- DESIGN PHILOSOPHY: MODERNS, CLEAN, SHARP EDGES.

FUNCTIONAL REQUIREMENTS:
${project.selectedFeatures?.map(f => `- ${f.toUpperCase()}`).join('\n') || '- CORE SYSTEM ARCHITECTURE'}
- MOBILE FLUIDITY: MANDATORY (100% RESPONSIVE)
- LATENCY TARGET: < 2S LOAD TIME

CORE CONTENT & INTEL:
${project.description || 'NO ADDITIONAL INTEL PROVIDED.'}

INSTRUCTIONS:
Generate source code focusing on performance and visual precision as per the TITAN Design Framework.
=======================================================
AI AGENT PROTOCOL: WEBBYLAUNCH-TITAN-01
`.trim();

    const finalPrompt = project.aiPrompt || blueprintPrompt;
    const element = document.createElement("a");
    const file = new Blob([finalPrompt], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${project.businessName}_ai_blueprint.txt`;
    document.body.appendChild(element);
    element.click();
    toast.success('AI Blueprint downloaded');
  };

  const calculateAttendancePayout = () => {
    const salary = (profile as any)?.salary || 70000; // Default Salary
    const activeDaysInMonth = 22; 
    const presentDays = attendance.length;
    return (salary / activeDaysInMonth) * presentDays;
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
      <span>{label.includes('MESSAGES') && label.includes('(') ? (
        <>
          MESSAGES <span className="text-red-500">{label.split('MESSAGES ')[1]}</span>
        </>
      ) : label}</span>
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
      
        {/* MISSION_FAIL SUSPENSION OVERLAY */}
        {isSuspended && (
          <div className="fixed inset-0 z-[2000] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-10 text-center overflow-hidden">
             <div className="absolute inset-0 bg-red-500/5 animate-pulse" />
             <div className="max-w-2xl text-center space-y-10 relative z-10">
                <div className="inline-block px-6 py-2 bg-red-500/10 border border-red-500/20 rounded-full text-red-500 text-xs font-black uppercase tracking-[0.5em] animate-bounce">
                   Protocol Compromised
                </div>
                <h2 className="text-7xl md:text-9xl font-black italic tracking-tighter uppercase leading-[0.8] text-white">
                   MISSION<br />
                   <span className="text-red-500">FAIL.</span>
                </h2>
                <div className="p-8 bg-white/5 border border-white/10 rounded-[2rem] space-y-4">
                   <p className="text-xl font-black uppercase italic tracking-tight text-white/80">TEMPORARY_SUSPENSION_ACTIVE</p>
                   <p className="text-sm font-bold text-white/40 uppercase tracking-widest leading-relaxed">
                      BIOMETRIC SYNC FAILURE: 3 CONSECUTIVE ABSENCES DETECTED. ALL MISSION ACCESS HAS BEEN REVOKED BY CENTRAL COMMAND.
                   </p>
                </div>
                <div className="flex flex-col md:flex-row gap-4 justify-center">
                   <button 
                     onClick={() => window.location.href = "mailto:webbylaunch@gmail.com?subject=Appeal: Suspension&body=Mission Revocation Appeal for Developer: " + profile?.displayName}
                     className="px-12 py-5 bg-red-500 text-white font-black uppercase italic tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(239,68,68,0.3)]"
                   >
                     [ APPEAL_REVOCATION ]
                   </button>
                   <button 
                     onClick={handleLogout}
                     className="px-12 py-5 bg-white/5 border border-white/10 text-white font-black uppercase italic tracking-widest hover:bg-white hover:text-black transition-all"
                   >
                     [ ABORT_SESSION ]
                   </button>
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/10">MISSION CRITICAL // BIOMETRIC LOCK Alpha-1</p>
             </div>
          </div>
        )}

        {/* DUTY-GATED BLACKOUT OVERLAY */}
        {!isPunchedIn && activeTab !== 'chat' && !isSuspended && (
          <div className="fixed inset-0 z-[1000] bg-black flex flex-col items-center justify-center p-10 text-center">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center"
            >
              <AlertCircle size={100} className="text-[#FFFF00] mb-8 animate-pulse" />
              <h1 className="text-5xl md:text-8xl font-black uppercase italic tracking-tighter text-[#FFFF00] leading-none mb-6">
                DASHBOARD LOCKED
              </h1>
              <p className="text-[#FFFF00]/60 text-xl md:text-2xl font-bold uppercase tracking-widest max-w-2xl balance">
                YOU MUST PUNCH IN TO ACCESS PROJECTS, CLIENT DATA, AND FINANCIAL INTEL.
              </p>
              
              <div className="mt-16 p-10 border-2 border-[#FFFF00]/20 rounded-[4rem] bg-[#FFFF00]/5 backdrop-blur-xl">
                <p className="text-[#FFFF00] text-sm font-black uppercase tracking-[0.4em] mb-10">Security Protocol Alpha-6</p>
                <div className="flex flex-col gap-4">
                  <button 
                    onClick={() => punchIn(user!.uid)}
                    className="px-20 py-8 bg-[#FFFF00] text-black rounded-full font-black uppercase italic text-lg tracking-[0.3em] hover:scale-105 active:scale-95 transition-all shadow-[0_0_60px_rgba(255,255,0,0.4)]"
                  >
                    DEPLOY / PUNCH IN
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="text-[#FFFF00]/40 font-black uppercase italic text-xs tracking-widest hover:text-[#FFFF00] transition-colors"
                  >
                    Abort Session
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-[250px] flex-col bg-black border-r border-[#FFFF00]/10 p-8 space-y-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FFFF00] rounded-xl flex items-center justify-center text-black font-black text-xl italic">W</div>
          <h1 className="text-xl font-black italic uppercase tracking-tighter text-white">WebbyLaunch</h1>
        </div>

        <nav className="flex-1 flex flex-col gap-2">
          <NavItem tab="dashboard" icon={LayoutDashboard} label="Overview" />
          <NavItem tab="projects" icon={Briefcase} label="My Task" />
          <NavItem tab="pool" icon={Plus} label="Pool" />
          <NavItem tab="chat" icon={MessageSquare} label={unreadCount > 0 ? `Messages (${unreadCount})` : 'Messages'} />
          <NavItem tab="attendance" icon={Clock} label="Bio-Log" />
          <NavItem tab="analytics" icon={TrendingUp} label="Analytics" />
          <NavItem tab="earnings" icon={Wallet} label="Payments" />
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
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-3 bg-white/5 border border-white/10 rounded-xl relative hover:bg-white/10 transition-all"
              >
                <Bell size={18} className={notifications.some(n => !n.read) ? 'text-[#c7c42a] animate-pulse' : 'text-white/60'} />
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-[#c7c42a] rounded-full shadow-[0_0_10px_#c7c42a]" />
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute right-0 mt-4 w-80 bg-black border border-[#FFFF00]/20 rounded-3xl shadow-2xl z-50 overflow-hidden"
                  >
                    <div className="p-6 border-b border-[#FFFF00]/10 flex justify-between items-center bg-black">
                      <h3 className="text-sm font-black italic uppercase tracking-widest text-[#FFFF00]">Notifications</h3>
                      <button 
                        onClick={() => notifications.forEach(n => !n.read && markNotificationAsRead(n.id))}
                        className="text-[10px] font-bold uppercase text-[#FFFF00] hover:underline"
                      >
                        Mark all as read
                      </button>
                    </div>
                    <div className="max-h-96 overflow-y-auto custom-scrollbar bg-black">
                      {notifications.length > 0 ? (
                        notifications.map((n) => (
                          <div 
                            key={n.id} 
                            onClick={() => !n.read && markNotificationAsRead(n.id)}
                            className={`p-6 border-b border-[#FFFF00]/5 cursor-pointer hover:bg-[#FFFF00]/5 transition-colors ${!n.read ? 'bg-[#FFFF00]/5' : ''}`}
                          >
                            <p className="text-[10px] font-black uppercase text-[#FFFF00] tracking-widest mb-1">{n.title}</p>
                            <p className="text-xs text-[#FFFF00]/60 leading-relaxed font-medium italic">{n.message}</p>
                            <p className="text-[8px] text-[#FFFF00]/20 uppercase mt-2 font-black tracking-widest">{formatDate(n.createdAt)}</p>
                          </div>
                        ))
                      ) : (
                        <div className="p-10 text-center text-[#FFFF00]/20">
                          <p className="text-xs font-bold uppercase italic italic">No new signals</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

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
            {activeTab === 'chat' ? (
              <div className="h-full -m-6 md:-m-10">
                <MessagesModule 
                  currentUser={user!} 
                  profile={profile} 
                  onClose={() => setActiveTab('dashboard')} 
                />
              </div>
            ) : activeTab === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-10"
              >
                {/* Attendance & Stats Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Attendance Card */}
                  <div className="lg:col-span-1 bg-[#111] border border-white/5 rounded-[2.5rem] p-8 space-y-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#c7c42a]/5 rounded-full blur-3xl" />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Clock size={20} className="text-[#c7c42a]" />
                        <h3 className="text-sm font-black uppercase tracking-widest text-white/40 italic">Activity Center</h3>
                      </div>
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${isPunchedIn ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${isPunchedIn ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                        {isPunchedIn ? 'On Duty' : 'Off Duty'}
                      </div>
                    </div>

                    <div className="space-y-4">
                      {isPunchedIn ? (
                        <div className="space-y-4">
                          <button 
                            onClick={() => punchOut(user!.uid)}
                            disabled={!!punchOutTimer}
                            className={`w-full py-6 rounded-[1.5rem] font-black uppercase italic text-sm tracking-[0.2em] shadow-xl transition-all border-2 ${
                              punchOutTimer 
                                ? 'bg-[#c7c42a]/10 text-[#c7c42a]/40 border-[#c7c42a]/10 cursor-not-allowed' 
                                : 'bg-[#c7c42a] text-black border-[#c7c42a] shadow-[#c7c42a]/20 hover:scale-[1.02] active:scale-[0.98] animate-pulse'
                            }`}
                          >
                            {punchOutTimer ? 'MINIMUM SHIFT ACTIVE' : 'COMPLETE SHIFT / PUNCH OUT'}
                          </button>
                          {punchOutTimer && (
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                              <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Time Remaining until Punch Out</p>
                              <p className="text-xl font-black italic text-[#c7c42a] tabular-nums">{punchOutTimer}</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <button 
                          onClick={() => punchIn(user!.uid)}
                          className="w-full py-6 bg-black text-[#c7c42a] border-2 border-[#c7c42a] rounded-[1.5rem] font-black uppercase italic text-sm tracking-[0.2em] shadow-xl shadow-[#c7c42a]/10 hover:bg-[#c7c42a] hover:text-black transition-all"
                        >
                          PUNCH IN
                        </button>
                      )}
                      
                      <div className="grid grid-cols-2 gap-3 text-center">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                          <p className="text-[8px] font-black uppercase text-white/20 tracking-widest mb-1">Total Hours</p>
                          <p className="text-lg font-black italic">{devStats.totalHours}h</p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                          <p className="text-[8px] font-black uppercase text-white/20 tracking-widest mb-1">Status</p>
                          <p className={`text-lg font-black italic ${isPunchedIn ? 'text-green-500' : 'text-red-500'}`}>{isPunchedIn ? 'Active' : 'Offline'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                    <div className="lg:col-span-2 grid grid-cols-2 gap-4 md:gap-6">
                    {[
                      { label: 'Completed', value: devStats.completedCount, color: 'text-green-500', size: 'text-6xl md:text-[85px]' },
                      { label: 'Active', value: devStats.activeCount, color: 'text-[#c7c42a]', size: 'text-6xl md:text-[85px]' },
                      { label: 'New Jobs', value: stats.pool, color: 'text-[#c7c42a]', size: 'text-5xl md:text-[78px]', onClick: () => setActiveTab('pool') },
                      { label: 'Earnings', value: `₹${devStats.totalPayout.toLocaleString()}`, color: 'text-[#c7c42a]', size: 'text-3xl md:text-[60px] xl:text-[78px]', onClick: () => setActiveTab('earnings') }
                    ].map((stat, i) => (
                      <div 
                        key={i} 
                        className={`bg-white/5 border border-white/10 rounded-[2rem] p-6 md:p-8 flex flex-col justify-between min-h-[200px] ${stat.onClick ? 'cursor-pointer hover:border-[#c7c42a]/50 bg-[#c7c42a]/5 shadow-xl shadow-[#c7c42a]/5' : ''}`}
                        onClick={stat.onClick}
                      >
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">{stat.label}</p>
                        <h3 className={`${stat.size} font-black italic ${stat.color} leading-none mt-4 overflow-hidden text-ellipsis`}>
                          <span className="sr-only">{stat.label} value</span>
                          <span>{stat.value}</span>
                        </h3>
                      </div>
                    ))}
                  </div>
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
                          <button 
                            onClick={() => {
                              setSelectedProjectForDrawer(p);
                              setIsDrawerOpen(true);
                            }}
                            className="p-2 bg-[#FFFF00] text-black rounded hover:scale-110 transition-transform shadow-[0_0_15px_rgba(255,255,0,0.3)] ml-2"
                          >
                            <ChevronRight size={18} />
                          </button>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-3">
                          <div className="flex justify-between text-[8px] font-black uppercase tracking-widest">
                            <span className="text-white/40">Mission Progress</span>
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

                        {/* Pricing & Payout Display */}
                        <div className="p-4 bg-white/[0.03] rounded-2xl border border-white/5 flex items-center justify-between">
                          <div>
                            <p className="text-[8px] font-black uppercase text-white/40 tracking-widest">Project Value</p>
                            <p className="text-lg font-black italic">₹{getPlanPrice(p.plan).toLocaleString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[8px] font-black uppercase text-[#c7c42a] tracking-widest">Your Payout (15%)</p>
                            <p className="text-lg font-black italic text-[#c7c42a]">₹{calculatePayout(p.plan).toLocaleString()}</p>
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

                        <div className="grid grid-cols-2 gap-3">
                           <button 
                             onClick={() => handleDownloadPrompt(p)}
                             className="flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase italic tracking-widest text-[#c7c42a] hover:bg-[#c7c42a] hover:text-black transition-all"
                           >
                             AI Prompt <Download size={14} />
                           </button>
                           <button 
                             onClick={() => handleContact(p)}
                             className="flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase italic tracking-widest text-white/60 hover:bg-white hover:text-black transition-all"
                           >
                             {/iPhone|Android/i.test(navigator.userAgent) ? 'Call' : 'Contact'} <Info size={14} />
                           </button>
                        </div>

                        {/* Actions */}
                        <div className="pt-2 flex gap-3">
                          {p.status?.toLowerCase() === 'pending' || p.status?.toLowerCase() === 'assigned' || !p.developerId ? (
                            <>
                              <button 
                                onClick={() => openAcceptPopup(p.id)}
                                className="flex-1 py-4 bg-[#c7c42a] text-black font-black uppercase italic text-xs tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#c7c42a]/10"
                              >
                                Accept Project
                              </button>
                              {p.developerId && (
                                <button 
                                  onClick={() => setShowRejectPopup(p.id)}
                                  className="px-6 py-4 bg-red-500/10 border border-red-500/20 text-red-500 font-black uppercase italic text-xs tracking-widest rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-xl shadow-red-500/10"
                                >
                                  Reject
                                </button>
                              )}
                            </>
                          ) : (
                            <div className="flex gap-2 w-full">
                              <button 
                                onClick={() => setEditingProject(p)}
                                className="flex-1 py-4 bg-white text-black font-black uppercase italic text-[10px] tracking-widest rounded-2xl transition-all"
                              >
                                Manage Project
                              </button>
                              <button 
                                onClick={() => setActiveTab('chat')}
                                className="flex-1 py-4 bg-blue-600 text-white font-black uppercase italic text-[10px] tracking-widest rounded-2xl hover:bg-blue-500 transition-all"
                              >
                                Messages
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
                        onClick={() => openAcceptPopup(p.id)}
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
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#c7c42a]">Operation Status</span>
                    <h2 className="text-6xl font-black tracking-tighter uppercase italic text-white leading-none">Project Roadmap</h2>
                  </div>
                  <div className="px-6 py-4 bg-[#c7c42a]/10 border border-[#c7c42a]/20 rounded-2xl text-[#c7c42a] text-xs font-black uppercase tracking-widest shadow-xl shadow-[#c7c42a]/5">
                    {projects.length} Total Assignments
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-8">
                  {projects.map(p => (
                    <div key={p.id} className="bg-[#0A0A0A] border border-white/10 rounded-[3rem] p-10 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-[#c7c42a]/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-[#c7c42a]/10 transition-all duration-700" />
                      
                      <div className="flex flex-col lg:flex-row gap-12 relative z-10">
                        {/* Primary Info */}
                        <div className="flex-1 space-y-8">
                          <div className="flex items-center gap-6">
                            <div className="w-20 h-20 bg-[#c7c42a] rounded-[2rem] flex items-center justify-center text-black font-black text-4xl italic shadow-2xl shadow-[#c7c42a]/20">
                              {p.businessName?.[0]}
                            </div>
                            <div>
                              <h4 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-tight">{p.businessName}</h4>
                              <p className="text-sm font-black uppercase text-[#c7c42a] tracking-widest mt-1">{p.businessType || 'Mission Assignment'}</p>
                            </div>
                            <button 
                              onClick={() => {
                                setSelectedProjectForDrawer(p);
                                setIsDrawerOpen(true);
                              }}
                              className="ml-auto p-4 bg-[#FFFF00] text-black rounded hover:scale-110 transition-transform shadow-[0_0_20px_rgba(255,255,0,0.4)]"
                            >
                              <ChevronRight size={24} />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-6 space-y-4">
                               <div className="flex items-center gap-3 text-white/40 uppercase font-black text-[10px] tracking-widest">
                                 <UserIcon size={14} className="text-[#c7c42a]" />
                                 Client Intelligence
                               </div>
                               <div className="space-y-1">
                                 <p className="text-lg font-black italic uppercase">{p.userName || 'Anonymous'}</p>
                                 <p className="text-xs font-bold text-white/20">{p.userEmail}</p>
                               </div>
                            </div>
                            <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-6 space-y-4 relative overflow-hidden">
                               <div className="flex items-center gap-3 text-white/40 uppercase font-black text-[10px] tracking-widest">
                                 <FileText size={14} className="text-[#c7c42a]" />
                                 AI Blueprints
                               </div>
                               <div className="flex items-center justify-between">
                                 <span className="text-xs font-bold text-white/60">Configured Prompt</span>
                                 <button 
                                   onClick={() => handleDownloadPrompt(p)}
                                   className="flex items-center gap-2 px-4 py-2 bg-[#c7c42a]/10 border border-[#c7c42a]/20 rounded-xl text-[10px] font-black uppercase italic tracking-widest text-[#c7c42a] hover:bg-[#c7c42a] hover:text-black transition-all shadow-lg"
                                 >
                                   Download <Download size={12} />
                                 </button>
                               </div>
                            </div>
                          </div>

                          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 space-y-4">
                            <div className="flex justify-between items-center bg-transparent">
                               <div className="flex items-center gap-3 text-white/40 uppercase font-black text-[10px] tracking-widest">
                                 Mission Progress
                               </div>
                               <div className="flex flex-col items-end">
                                 <span className="text-2xl font-black italic text-[#c7c42a]">{p.progress || 0}%</span>
                                 {p.domainPrice && p.domainPrice > 0 && (
                                   <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest mt-1">Domain: ₹{p.domainPrice}</span>
                                 )}
                               </div>
                            </div>
                            <div className="h-4 bg-white/5 rounded-full overflow-hidden shadow-inner p-1">
                               <motion.div 
                                 initial={{ width: 0 }}
                                 animate={{ width: `${p.progress || 0}%` }}
                                 className="h-full bg-[#c7c42a] rounded-full shadow-[0_0_20px_rgba(199,196,42,0.6)] relative overflow-hidden"
                               >
                                 <div className="absolute inset-0 bg-[linear-gradient(90deg,_transparent_0%,_rgba(255,255,255,0.2)_50%,_transparent_100%)] animate-shimmer" />
                               </motion.div>
                            </div>
                          </div>
                        </div>

                        {/* Control Center */}
                        <div className="w-full lg:w-96 space-y-4 flex flex-col justify-center">
                           <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-8 space-y-6">
                              <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 italic ml-2">Quick Command Status</label>
                                <div className="grid grid-cols-1 gap-3">
                                   <div className={`px-6 py-4 rounded-2xl border text-center font-black uppercase italic text-xs tracking-widest ${
                                     p.status?.toLowerCase() === 'completed' 
                                       ? 'bg-green-500/10 border-green-500/20 text-green-500' 
                                       : 'bg-[#c7c42a]/5 border-[#c7c42a]/20 text-[#c7c42a]'
                                   }`}>
                                     {p.status}
                                   </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 gap-3">
                                <button 
                                  onClick={() => setEditingProject(p)}
                                  className="w-full py-5 bg-white text-black rounded-2xl font-black uppercase italic text-xs tracking-widest transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-white/5 flex items-center justify-center gap-3"
                                >
                                  Update Intel <Settings2 size={16} />
                                </button>
                                <button 
                                  onClick={() => {
                                    setActiveTab('chat');
                                    // You might want to pre-select the project in chat
                                  }}
                                  className="w-full py-5 bg-blue-500 text-white rounded-2xl font-black uppercase italic text-xs tracking-widest transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-blue-500/10 flex items-center justify-center gap-3"
                                >
                                  Direct Link <MessageSquare size={16} />
                                </button>
                                {p.websiteUrl && (
                                   <a 
                                    href={p.websiteUrl} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="w-full py-5 bg-white/5 border border-white/10 text-white/60 rounded-2xl font-black uppercase italic text-xs tracking-widest text-center hover:bg-white/10 transition-all flex items-center justify-center gap-3"
                                   >
                                      External Link <ExternalLink size={16} />
                                   </a>
                                )}
                              </div>
                           </div>

                           <div className="px-8 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/20">
                              <span>Mission ID: #{p.id.slice(-8).toUpperCase()}</span>
                              <span>Started: {formatDate(p.createdAt)}</span>
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

            {activeTab === 'analytics' && (
              <motion.div 
                key="analytics"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: 'Intelligence Velocity', value: '4.8/5', sub: '+12% from last epoch' },
                    { label: 'Mission Success Rate', value: '98.2%', sub: '24/25 missions successful' },
                    { label: 'Transmission Volume', value: '1,242', sub: 'Messages exchanged' },
                    { label: 'Compute Efficiency', value: '0.42ms', sub: 'Average response time' }
                  ].map((stat, i) => (
                    <div key={i} className="bg-white/[0.03] border border-white/5 p-8 rounded-[2rem] space-y-2">
                       <p className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">{stat.label}</p>
                       <p className="text-3xl font-black italic">{stat.value}</p>
                       <p className="text-[9px] text-[#FFFF00] font-bold uppercase tracking-widest opacity-60">{stat.sub}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-10 h-96 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <TrendingUp className="mx-auto text-[#FFFF00]/20" size={64} />
                    <p className="text-sm font-black uppercase italic tracking-widest text-white/20">Analytical Visualization Offline</p>
                    <p className="text-[10px] text-white/10 uppercase font-medium max-w-xs mx-auto">Neural insights require specialized clearance level Gamma-9</p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'attendance' && (
              <motion.div 
                key="attendance"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-12"
              >
                 <div className="flex flex-col gap-2">
                   <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FFFF00]">Bio-Sync Protocol</span>
                   <h2 className="text-6xl font-black tracking-tighter uppercase italic text-white leading-none">Attendance Log</h2>
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-1 space-y-6">
                      <div className="p-8 bg-white/5 border border-white/5 rounded-[2.5rem] space-y-8">
                         <div className="flex justify-between items-start">
                            <div className="w-12 h-12 bg-[#FFFF00]/10 rounded-2xl flex items-center justify-center text-[#FFFF00]">
                               <Clock size={24} />
                            </div>
                            <div className="text-right">
                               <p className="text-[10px] font-black uppercase text-white/40 tracking-widest">Protocol uptime</p>
                               <p className="text-2xl font-black italic text-white">98.4%</p>
                            </div>
                         </div>
                         
                         <div className="space-y-4">
                            <div className="flex justify-between items-center p-5 bg-white/[0.03] border border-white/5 rounded-2xl">
                               <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">Days Logged</span>
                               <span className="text-xl font-black italic text-[#FFFF00]">{attendance.length}</span>
                            </div>
                            <div className="flex justify-between items-center p-5 bg-white/[0.03] border border-white/5 rounded-2xl">
                               <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">Total Active (Hrs)</span>
                               <span className="text-xl font-black italic text-[#FFFF00]">{Math.floor(totalHours)}h {Math.floor((totalHours % 1) * 60)}m</span>
                            </div>
                         </div>

                         <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-2xl">
                            <p className="text-[10px] font-black uppercase text-red-500 tracking-[0.2em] mb-2">Safety Lock Status</p>
                            <p className="text-xs font-bold text-white/60 uppercase leading-relaxed italic">3 Consecutive Absences will trigger automatic profile lockout. Maintain active status code.</p>
                         </div>
                      </div>
                    </div>

                    <div className="lg:col-span-2">
                        <div className="p-10 bg-white/5 border border-white/5 rounded-[3rem] space-y-10 min-h-[500px] relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-20 opacity-[0.03] rotate-12">
                               <LayoutDashboard size={300} />
                            </div>
                            <div className="flex justify-between items-center relative z-10">
                              <h3 className="text-2xl font-black uppercase italic tracking-tighter">Mission Calendar</h3>
                              <div className="flex gap-4">
                                 <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500" />
                                    <span className="text-[8px] font-black uppercase text-white/40 tracking-widest italic">Present</span>
                                 </div>
                                 <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-red-500" />
                                    <span className="text-[8px] font-black uppercase text-white/40 tracking-widest italic">Absent</span>
                                 </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-7 gap-4 relative z-10">
                               {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                                 <div key={day} className="text-center text-[10px] font-black uppercase text-white/20 tracking-widest mb-4 italic">{day}</div>
                               ))}
                               {Array.from({ length: 31 }).map((_, i) => {
                                 const dayNum = i + 1;
                                 const attendanceRecord = attendance.find(a => new Date(a.date).getDate() === dayNum);
                                 
                                 return (
                                   <div 
                                      key={i} 
                                      className={`h-24 lg:h-32 border ${attendanceRecord ? 'border-green-500/20 bg-green-500/5' : 'border-white/5 hover:border-red-500/20 hover:bg-red-500/5'} transition-all flex flex-col p-4 relative group cursor-crosshair`}
                                   >
                                      <span className={`text-xs font-black italic ${attendanceRecord ? 'text-green-500' : 'text-white/20'}`}>{dayNum < 10 ? `0${dayNum}` : dayNum}</span>
                                      
                                      {attendanceRecord && (
                                         <div className="mt-auto">
                                            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                                            <p className="text-[8px] font-black uppercase text-green-500/60 tracking-[0.2em] mt-2 italic">Bio-Active</p>
                                         </div>
                                      )}
                                      
                                      {/* Info Overlay */}
                                      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center text-center p-3 z-20">
                                         <p className="text-[8px] font-black uppercase tracking-[0.4em] text-[#FFFF00] italic mb-2">Protocol Intel</p>
                                         {attendanceRecord ? (
                                           <div className="space-y-1">
                                             <p className="text-xs font-black text-white italic">{attendanceRecord.totalHours?.toFixed(1)}h Active</p>
                                             <p className="text-[8px] font-bold text-[#FFFF00] uppercase tracking-widest">In: {attendanceRecord.checkIn ? new Date(attendanceRecord.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</p>
                                           </div>
                                         ) : (
                                           <div className="flex flex-col items-center">
                                              <XCircle size={16} className="text-red-500/40 mb-1" />
                                              <p className="text-[10px] font-black text-red-500/60 italic">Signal Lost</p>
                                           </div>
                                         )}
                                      </div>
                                   </div>
                                 );
                               })}
                            </div>
                            
                            <div className="pt-10 border-t border-white/5 relative z-10">
                               <p className="text-[8px] font-black uppercase tracking-[0.5em] text-white/10 text-center italic">
                                  Sync-Cycle: May 2026 // Distributed Ledger Verification Active
                               </p>
                            </div>
                        </div>
                    </div>
                 </div>
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
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#FFFF00] italic">Core Sync Salary</p>
                    <h3 className="text-4xl font-black italic text-white">
                      ₹{calculateAttendancePayout().toLocaleString()}
                    </h3>
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest italic pt-4 leading-relaxed">Based on {attendance.length}/22 active days sync.</p>
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
                                  value={settingsData.upiId || ''}
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
                                  value={settingsData.skills || ''}
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
            { tab: 'attendance' as Tab, icon: Clock, label: 'Bio' },
            { tab: 'analytics' as Tab, icon: TrendingUp, label: 'Pulse' },
            { tab: 'earnings' as Tab, icon: DollarSign, label: 'Pay' },
            { tab: 'settings' as Tab, icon: SettingsIcon, label: 'User' }
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
                  <NavItem tab="attendance" icon={Clock} label="Bio-Log" />
                  <NavItem tab="analytics" icon={TrendingUp} label="Analytics" />
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

        {/* Global Floating Sticky Note (Module 4) */}
        <div className="fixed bottom-10 right-10 z-[2000] flex flex-col items-end gap-4 pointer-events-none">
           <AnimatePresence>
              {isStickyOpen && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="w-80 bg-black border-2 border-[#FFFF00] shadow-[0_0_100px_rgba(255,255,0,0.2)] overflow-hidden pointer-events-auto"
                >
                   <div className="p-4 bg-[#FFFF00] flex justify-between items-center">
                      <div className="flex items-center gap-2">
                         <FileText size={14} className="text-black" />
                         <h4 className="text-[10px] font-black uppercase italic tracking-widest text-black">Mission Secure Note</h4>
                      </div>
                      <button onClick={() => setIsStickyOpen(false)} className="text-black/60 hover:text-black">
                         <X size={14} />
                      </button>
                   </div>
                   <div className="p-6 space-y-4">
                      <textarea 
                        placeholder="ENTER CRITICAL MISSION INTEL (KEYS, LOGINS, URLS)..."
                        value={stickyNotes}
                        onChange={(e) => {
                          const val = e.target.value;
                          setStickyNotes(val);
                          // Sync to DB (debounced would be better but let's try direct for now)
                          if (user?.uid) {
                             updateUserProfile(user.uid, { notes: val });
                          }
                        }}
                        className="w-full h-64 bg-transparent text-xs font-bold text-[#FFFF00] uppercase italic tracking-[0.15em] outline-none resize-none placeholder:text-[#FFFF00]/10 leading-relaxed font-mono"
                      />
                      <div className="pt-4 border-t border-[#FFFF00]/10 flex justify-between items-center text-[8px] font-black text-[#FFFF00]/40 uppercase tracking-widest">
                         <span className="flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-[#FFFF00] animate-pulse" />
                            Encrypted & Synced
                         </span>
                         <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                   </div>
                </motion.div>
              )}
           </AnimatePresence>
           
           <button 
             onClick={() => setIsStickyOpen(!isStickyOpen)}
             className={`w-16 h-16 bg-black border-2 border-[#FFFF00] flex items-center justify-center text-[#FFFF00] shadow-2xl hover:scale-110 active:scale-95 transition-all pointer-events-auto ${isStickyOpen ? 'rotate-90' : ''}`}
           >
              {isStickyOpen ? <X size={28} /> : <FileText size={28} />}
           </button>
        </div>

        {/* Developer Right-Arrow Control Drawer */}
        <AnimatePresence>
          {isDrawerOpen && selectedProjectForDrawer && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsDrawerOpen(false)}
                className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-md"
              />
              <motion.div 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                className="fixed top-0 right-0 h-full w-full max-w-2xl z-[301] bg-[#5B6D5E] border-l border-black shadow-2xl flex flex-col font-mono overflow-hidden"
              >
                {/* Header - TITAN Design */}
                <div className="p-10 border-b border-black/10 flex items-center justify-between">
                  <div className="space-y-1">
                    <h2 className="text-5xl font-black italic uppercase tracking-tighter text-white leading-none">
                      {selectedProjectForDrawer.businessName || 'TITAN'}
                    </h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/60">Project Details</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => handleDownloadClientDetails(selectedProjectForDrawer)}
                      className="bg-[#D4E157] text-black px-4 py-2 text-[10px] font-black uppercase flex items-center gap-2 hover:bg-[#c7d14d] transition-all"
                    >
                      <Download size={14} /> Details
                    </button>
                    <button 
                      onClick={() => handleDownloadPrompt(selectedProjectForDrawer)}
                      className="bg-[#00E5FF] text-black px-4 py-2 text-[10px] font-black uppercase flex items-center gap-2 hover:bg-[#00d5ed] transition-all"
                    >
                      <Plus size={14} /> AI Prompt
                    </button>
                    <button 
                      onClick={() => setIsDrawerOpen(false)}
                      className="text-white hover:text-black transition-colors"
                    >
                      <X size={24} />
                    </button>
                  </div>
                </div>

                {/* Tabs */}
                <div className="px-10 flex gap-4 mt-6">
                  <button className="bg-[#D4E157] text-black px-8 py-2 text-[10px] font-black uppercase">Overview</button>
                  <button className="bg-transparent text-black/40 px-8 py-2 text-[10px] font-black uppercase hover:text-black">Preview</button>
                </div>

                <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar text-black">
                  <div className="grid grid-cols-2 gap-8">
                    {/* Client Information */}
                    <div className="space-y-4">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 border-b border-black/10 pb-2">Client Information</h3>
                      <div className="grid grid-cols-2 gap-y-3 text-[10px] font-bold">
                        <span className="text-black/40 uppercase">Name</span>
                        <span className="text-right uppercase truncate">{selectedProjectForDrawer.userName || 'N/A'}</span>
                        <span className="text-black/40 uppercase">Email</span>
                        <span className="text-right lowercase truncate">{selectedProjectForDrawer.userEmail || 'N/A'}</span>
                        <span className="text-black/40 uppercase">Phone</span>
                        <span className="text-right uppercase">{selectedProjectForDrawer.userPhone || 'N/A'}</span>
                        <span className="text-black/40 uppercase">Country</span>
                        <span className="text-right uppercase flex items-center justify-end gap-2">
                          {selectedProjectForDrawer.country === 'India' ? '🇮🇳' : selectedProjectForDrawer.country === 'US' ? '🇺🇸' : '🇬🇧'} 
                          {selectedProjectForDrawer.country || 'India'}
                        </span>
                      </div>
                    </div>

                    {/* Business Details */}
                    <div className="space-y-4">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 border-b border-black/10 pb-2">Business Details</h3>
                      <div className="grid grid-cols-2 gap-y-3 text-[10px] font-bold">
                        <span className="text-black/40 uppercase">Business Name</span>
                        <span className="text-right uppercase truncate">{selectedProjectForDrawer.businessName || 'N/A'}</span>
                        <span className="text-black/40 uppercase">Business Phone</span>
                        <span className="text-right uppercase">{selectedProjectForDrawer.businessPhone || 'N/A'}</span>
                        <span className="text-black/40 uppercase">Configuration</span>
                        <span className="text-right uppercase font-black text-[#D4E157]">{selectedProjectForDrawer.storeType === 'online_store' ? 'ONLINE STORE' : 'LOCAL STORE'}</span>
                        <span className="text-black/40 uppercase">Region</span>
                        <span className="text-right uppercase truncate">{selectedProjectForDrawer.locationState || 'N/A'}, {selectedProjectForDrawer.city || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    {/* Project Overview */}
                    <div className="space-y-4 bg-black/5 p-6 border border-black/10 rounded-sm">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 border-b border-black/10 pb-2">Project Overview</h3>
                      <div className="grid grid-cols-2 gap-y-3 text-[10px] font-bold">
                        <span className="text-black/40 uppercase">Type</span>
                        <span className="text-right uppercase">{selectedProjectForDrawer.businessType || 'Website'}</span>
                        <span className="text-black/40 uppercase">Plan</span>
                        <span className="text-right uppercase text-[#D4E157] font-black">{selectedProjectForDrawer.plan || 'N/A'}</span>
                        <span className="text-black/40 uppercase">Status</span>
                        <span className="text-right uppercase">{selectedProjectForDrawer.status || 'Pending'}</span>
                        <span className="text-black/40 uppercase">Progress</span>
                        <span className="text-right uppercase">{selectedProjectForDrawer.progress || 0}%</span>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-4">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 border-b border-black/10 pb-2">Description</h3>
                      <div className="bg-black/10 p-4 h-32 overflow-y-auto custom-scrollbar-slim rounded-sm">
                        <p className="text-[10px] font-bold uppercase leading-relaxed text-black/70 italic">
                          {selectedProjectForDrawer.description || 'No description provided.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    {/* Domain Preferences */}
                    <div className="space-y-4">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 border-b border-black/10 pb-2">Domain Preferences</h3>
                      <div className="grid grid-cols-2 gap-y-3 text-[10px] font-bold">
                        <span className="text-black/40 uppercase">1st Preference</span>
                        <span className="text-right uppercase text-[#D4E157] truncate">{selectedProjectForDrawer.domainPreferences?.[0] || 'N/A'}</span>
                        <span className="text-black/40 uppercase">2nd Preference</span>
                        <span className="text-right uppercase text-[#D4E157] truncate">{selectedProjectForDrawer.domainPreferences?.[1] || 'N/A'}</span>
                        <span className="text-black/40 uppercase">3rd Preference</span>
                        <span className="text-right uppercase text-[#D4E157] truncate">{selectedProjectForDrawer.domainPreferences?.[2] || 'N/A'}</span>
                      </div>
                    </div>

                    {/* Selected Features */}
                    <div className="space-y-4">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 border-b border-black/10 pb-2">Selected Features</h3>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {selectedProjectForDrawer.selectedFeatures && selectedProjectForDrawer.selectedFeatures.length > 0 ? (
                          selectedProjectForDrawer.selectedFeatures.map(f => (
                            <span key={f} className="px-3 py-1 bg-black/10 text-[9px] font-black uppercase border border-white/5">{f}</span>
                          ))
                        ) : (
                          <span className="text-[9px] font-black text-black/40">NO FEATURES SELECTED</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="space-y-4 bg-black/5 p-6 border border-black/10 rounded-sm">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 border-b border-black/10 pb-2">Timeline</h3>
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <p className="text-black/40 text-[8px] font-black uppercase mb-1">Start Date</p>
                        <p className="text-[10px] font-bold uppercase text-[#D4E157]">{formatDate(selectedProjectForDrawer.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-black/40 text-[8px] font-black uppercase mb-1">Deadline</p>
                        <p className="text-[10px] font-bold uppercase text-[#D4E157]">TBD</p>
                      </div>
                      <div>
                        <p className="text-black/40 text-[8px] font-black uppercase mb-1">Last Update</p>
                        <p className="text-[10px] font-bold uppercase text-[#D4E157]">{formatDate(selectedProjectForDrawer.updatedAt)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Internal Notes */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 border-b border-black/10 pb-2">Internal Notes</h3>
                    <div className="bg-[#D4E157]/5 p-6 border border-[#D4E157]/20 rounded-sm">
                      <p className="text-[10px] font-bold uppercase italic text-[#D4E157]/80">
                        {selectedProjectForDrawer.internalNotes || 'No internal notes added by the system or team.'}
                      </p>
                    </div>
                  </div>

                  {/* Files & Assets */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 border-b border-black/10 pb-2">Files & Assets</h3>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-4 bg-black/5 border border-white/5 flex items-center justify-between group cursor-pointer hover:bg-black/10 transition-all">
                          <div className="flex items-center gap-3">
                            <FileText size={16} className="text-black/40" />
                            <span className="text-[10px] font-bold uppercase">Specifications.pdf</span>
                          </div>
                          <Download size={12} className="text-black/20 group-hover:text-black transition-colors" />
                       </div>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-10 border-t border-black/10 grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => {
                      setEditingProject(selectedProjectForDrawer);
                      setIsDrawerOpen(false);
                    }}
                    className="bg-[#D4E157] text-black py-4 text-xs font-black uppercase italic tracking-widest hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    Edit Project
                  </button>
                  <button 
                    onClick={() => setIsDrawerOpen(false)}
                    className="bg-black/20 text-white/60 py-4 text-xs font-black uppercase italic tracking-widest hover:bg-black/30 transition-all font-mono"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </>
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
                  <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Financial Entry</h3>
                  <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] italic">Pre-Acceptance Verification</p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-xs font-bold text-white/60 text-center uppercase tracking-widest leading-relaxed">
                  Enter financial parameters to unlock the 'Accept Mission' command. Intel must be committed to the database first.
                </p>
                
                <div className="space-y-2">
                  <label className="text-[8px] font-black text-[#c7c42a] uppercase tracking-[0.3em] ml-4">Razorpay Payment Link</label>
                  <div className="relative">
                    <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                    <input 
                      type="url" 
                      required
                      value={tempPaymentLink}
                      onChange={(e) => {
                        setTempPaymentLink(e.target.value);
                        setIsFinancialIntelSaved(false);
                      }}
                      placeholder="https://rzp.io/l/..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-16 pr-6 py-5 text-white font-bold outline-none focus:border-[#c7c42a] transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[8px] font-black text-[#c7c42a] uppercase tracking-[0.3em] ml-4">Domain Price (₹)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                    <input 
                      type="number" 
                      value={tempDomainPrice || ''}
                      onChange={(e) => {
                        setTempDomainPrice(parseInt(e.target.value) || 0);
                        setIsFinancialIntelSaved(false);
                      }}
                      placeholder="e.g. 800"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-16 pr-6 py-5 text-white font-bold outline-none focus:border-[#c7c42a] transition-all"
                    />
                  </div>
                </div>
                
                <button 
                  onClick={() => handleSaveFinancialIntel(showAcceptPopup)}
                  disabled={isSubmitting || !tempPaymentLink || tempDomainPrice <= 0}
                  className={`w-full py-4 rounded-2xl font-black uppercase italic text-xs tracking-widest transition-all border ${
                    isFinancialIntelSaved 
                      ? 'bg-green-500/10 border-green-500/20 text-green-500' 
                      : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                  }`}
                >
                  {isSubmitting ? 'Syncing...' : isFinancialIntelSaved ? 'INTELLIGENCE SAVED ✓' : 'SAVE FINANCIAL INTEL'}
                </button>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => {
                    setShowAcceptPopup(null);
                    setTempPaymentLink('');
                    setTempDomainPrice(0);
                    setIsFinancialIntelSaved(false);
                  }} 
                  className="flex-1 py-4 rounded-2xl border border-white/10 text-white font-black uppercase italic text-xs tracking-widest hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleAcceptProject(showAcceptPopup)}
                  disabled={isSubmitting || !isFinancialIntelSaved}
                  className={`flex-1 py-4 rounded-2xl font-black uppercase italic text-xs tracking-widest transition-all shadow-xl ${
                    isFinancialIntelSaved 
                      ? 'bg-[#c7c42a] text-black shadow-[#c7c42a]/20 hover:scale-105 active:scale-95' 
                      : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
                  }`}
                >
                  {isSubmitting ? 'Processing...' : 'Accept Mission'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reject Project Popup */}
      <AnimatePresence>
        {showRejectPopup && (
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
              <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />
              
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto text-red-500 shadow-2xl">
                  <XCircle size={40} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Reject Assignment</h3>
                  <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] italic">Abort Mission Protocol</p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-xs font-bold text-white/60 text-center uppercase tracking-widest leading-relaxed">
                  Provide a detailed reason for rejecting this assignment. This will be shared with the system administrators.
                </p>
                
                <div className="space-y-2">
                  <label className="text-[8px] font-black text-red-500 uppercase tracking-[0.3em] ml-4">Rejection Reason</label>
                  <textarea 
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="e.g. Scope outside of technical domain, Unclear requirements, etc."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white font-bold outline-none focus:border-red-500 transition-all min-h-[150px] resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => {
                    setShowRejectPopup(null);
                    setRejectionReason('');
                  }} 
                  className="flex-1 py-4 rounded-2xl border border-white/10 text-white font-black uppercase italic text-xs tracking-widest hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleRejectProject(showRejectPopup)}
                  disabled={isSubmitting || !rejectionReason.trim()}
                  className="flex-1 py-4 rounded-2xl bg-red-500 text-white font-black uppercase italic text-xs tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-red-500/20 disabled:opacity-50"
                >
                  {isSubmitting ? 'Aborting...' : 'Confirm Rejection'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editingProject && (
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
              
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Edit Project</h3>
                  <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] italic">{editingProject.businessName}</p>
                </div>
                <button onClick={() => setEditingProject(null)} className="p-2 hover:bg-white/5 rounded-xl text-white/20 hover:text-white transition-all">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-[#c7c42a] uppercase tracking-[0.3em] ml-4">Project Status</label>
                  <select 
                    value={editingProject.status || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, status: e.target.value as any })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-[#c7c42a] transition-all"
                  >
                     <option value="pending" className="bg-[#111]">Pending</option>
                     <option value="Under Review" className="bg-[#111]">Under Review</option>
                     <option value="Assigned" className="bg-[#111]">Assigned</option>
                     <option value="Development Started" className="bg-[#111]">Development Started</option>
                     <option value="in-progress" className="bg-[#111]">In Progress</option>
                     <option value="completed" className="bg-[#111]">Completed</option>
                     <option value="rejected" className="bg-[#111]">Rejected</option>
                  </select>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#c7c42a] italic ml-4">Direct Payment link (Specific for this project)</label>
                  <input 
                    type="text"
                    value={editingProject.paymentLink || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, paymentLink: e.target.value })}
                    placeholder="Razorpay/Stripe/Custom Link"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-[#c7c42a] transition-all"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#c7c42a] italic ml-4">Basic Payment Link</label>
                  <input 
                    type="text"
                    value={editingProject.paymentLinkBasic || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, paymentLinkBasic: e.target.value })}
                    placeholder="Razorpay/Stripe Link"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-[#c7c42a] transition-all"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#c7c42a] italic ml-4">Premium Payment Link</label>
                  <input 
                    type="text"
                    value={editingProject.paymentLinkPremium || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, paymentLinkPremium: e.target.value })}
                    placeholder="Razorpay/Stripe Link"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-[#c7c42a] transition-all"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#c7c42a] italic ml-4">Domain Price (₹)</label>
                  <input 
                    type="number"
                    value={editingProject.domainPrice || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, domainPrice: parseInt(e.target.value) || 0 })}
                    placeholder="e.g. 800"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-[#c7c42a] transition-all"
                  />
                </div>

                <div className="space-y-4 bg-white/5 p-6 rounded-2xl border border-white/10">
                   <h4 className="text-[8px] font-black uppercase tracking-[0.3em] text-[#c7c42a] mb-4">Core Intelligence</h4>
                   <div className="space-y-4">
                      <div>
                        <label className="text-[8px] font-bold text-white/40 uppercase ml-2">Business Phone</label>
                        <input 
                          type="text"
                          value={editingProject.businessPhone || ''}
                          onChange={(e) => setEditingProject({ ...editingProject, businessPhone: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white font-bold outline-none focus:border-[#c7c42a]"
                        />
                      </div>
                      <div>
                        <label className="text-[8px] font-bold text-white/40 uppercase ml-2">Store Type</label>
                        <select 
                          value={editingProject.storeType || 'online_store'}
                          onChange={(e) => setEditingProject({ ...editingProject, storeType: e.target.value as any })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white font-bold outline-none focus:border-[#c7c42a]"
                        >
                          <option value="online_store" className="bg-[#111]">Online Store</option>
                          <option value="local_store" className="bg-[#111]">Local Store</option>
                        </select>
                      </div>
                   </div>
                </div>

                {editingProject.paymentStatus === 'verifying' && (
                  <div className="p-6 rounded-2xl bg-[#c7c42a]/10 border border-[#c7c42a]/20 space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#c7c42a] italic text-center">Client claims payment is completed. confirm?</p>
                    <div className="flex gap-2">
                      <button 
                        onClick={async () => {
                          await updateProject(editingProject.id, { paymentStatus: 'paid' });
                          setEditingProject({ ...editingProject, paymentStatus: 'paid' });
                          toast.success('Payment confirmed');
                        }}
                        className="flex-1 py-3 bg-[#c7c42a] text-black rounded-xl text-[10px] font-black uppercase italic tracking-widest hover:scale-105 transition-all"
                      >
                        Yes, Accepted
                      </button>
                      <button 
                        onClick={async () => {
                          await updateProject(editingProject.id, { paymentStatus: 'unpaid' });
                          setEditingProject({ ...editingProject, paymentStatus: 'unpaid' });
                          toast.error('Payment rejected');
                        }}
                        className="flex-1 py-3 border border-white/10 text-white rounded-xl text-[10px] font-black uppercase italic tracking-widest"
                      >
                        No
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex justify-between px-4">
                    <label className="text-[10px] font-black text-[#c7c42a] uppercase tracking-[0.3em]">Progress</label>
                    <span className="text-xs font-black text-[#c7c42a] italic">{editingProject.progress || 0}%</span>
                  </div>
                  <input 
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={editingProject.progress || 0}
                    onChange={(e) => setEditingProject({ ...editingProject, progress: parseInt(e.target.value) })}
                    className="w-full accent-[#c7c42a] h-2 bg-white/5 rounded-full appearance-none cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button 
                  onClick={async () => {
                    if (!editingProject) return;
                    setIsSubmitting(true);
                    try {
                      await updateProject(editingProject.id, {
                        status: editingProject.status,
                        progress: editingProject.progress,
                        websiteUrl: editingProject.websiteUrl,
                        domainPrice: editingProject.domainPrice,
                        paymentLink: editingProject.paymentLink,
                        paymentLinkBasic: editingProject.paymentLinkBasic,
                        paymentLinkPremium: editingProject.paymentLinkPremium,
                        businessPhone: editingProject.businessPhone,
                        storeType: editingProject.storeType,
                        updatedAt: new Date().toISOString()
                      });
                      toast.success('Project details updated');
                      setEditingProject(null);
                    } catch (error) {
                      toast.error('Failed to update project');
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  disabled={isSubmitting}
                  className="w-full py-5 bg-[#c7c42a] text-black font-black uppercase italic text-xs tracking-widest rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-[#c7c42a]/20 disabled:opacity-50"
                >
                  {isSubmitting ? 'Syncing...' : 'Apply System Updates'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav userId={user!.uid} role="developer" onOpenMessages={() => setActiveTab('chat')} />
    </div>
    </>
  );
}
