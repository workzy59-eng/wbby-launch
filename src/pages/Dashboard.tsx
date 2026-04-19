import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FirebaseUser, logOut } from '../firebase';
import { UserProfile, Project } from '../types';
import { LogOut, User, MessageCircle, X, LayoutDashboard, FolderKanban, Settings, Check, ArrowRight, Layout, Clock, CheckCircle2, Download, FileText, Image as ImageIcon, PartyPopper, Video, CreditCard, ShieldCheck, AlertCircle, Mail } from 'lucide-react';
import ChatSystem from '../components/ChatSystem';
import MessagesModule from '../components/MessagesModule';
import { MeetingList } from '../components/meetings/MeetingList';
import { MeetingReminder } from '../components/meetings/MeetingReminder';
import { subscribeToMeetings } from '../services/meetingService';
import { Meeting } from '../types';
import { getProjects, updateProject, getProfiles, getDirectMessages, getConversations } from '../services/database';
import { formatDate } from '../lib/utils';
import { APP_NAME, HYPHENATED_NAME } from '../constants';
import InvoiceSystem from '../components/InvoiceSystem';

interface DashboardProps {
  user: FirebaseUser;
  profile: UserProfile | null;
}

export default function Dashboard({ user, profile }: DashboardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isSuccess = searchParams.get('success') === 'true';
  const [showSuccessMessage, setShowSuccessMessage] = useState(isSuccess);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'messages' | 'settings' | 'meetings' | 'payments'>('dashboard');
  const [billingType, setBillingType] = useState<'one-time' | 'subscription'>('one-time');
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const [showDirectChat, setShowDirectChat] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [adminProfile, setAdminProfile] = useState<UserProfile | null>(null);
  const [expandedBox, setExpandedBox] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [totalUsersCount, setTotalUsersCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [meetings, setMeetings] = useState<Meeting[]>([]);

  const hasAcceptedProject = projects.some(p => p.status !== 'Waiting for Review' && p.status !== 'Rejected');

  const statusSteps = selectedProject?.status === 'Rejected' 
    ? ["Waiting for Review", "Under Review", "Declined"]
    : ["Waiting for Review", "Under Review", "Accepted", "Development Started", "Completed"];
  
  const currentStepIndex = selectedProject 
    ? statusSteps.indexOf(selectedProject.status === 'Rejected' ? 'Declined' : selectedProject.status) 
    : -1;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { getProfiles, getUserProfile } = await import('../services/database');
        
        if (profile?.role === 'admin') {
          const profilesList = await getProfiles();
          setTotalUsersCount(profilesList.length);
          const admin = profilesList.find(p => p.role === 'admin');
          if (admin) setAdminProfile(admin);
        } else {
          // Clients don't need to see total users count
          // They just need a reference to the main admin for support
          // If you have a specific admin UID, use it here.
          // For now, we'll keep it empty or set a placeholder
        }
      } catch (err) {
        console.warn("Permission denied for listing users. Stats skipped.");
      }
    };
    fetchStats();
  }, [profile]);

  // Separate effect for unread counts to avoid nested listeners
  const [convUnread, setConvUnread] = useState(0);
  const [projectUnread, setProjectUnread] = useState(0);

  useEffect(() => {
    setUnreadCount(convUnread + projectUnread);
  }, [convUnread, projectUnread]);

  useEffect(() => {
    const unsubConvs = getConversations(user.uid, (convs) => {
      let count = 0;
      convs.forEach(conv => {
        if (conv.unreadCount && conv.unreadCount[user.uid]) {
          count += conv.unreadCount[user.uid];
        }
      });
      setConvUnread(count);
    });

    const unsubProjects = getProjects((projectsData) => {
      let count = 0;
      projectsData.forEach(p => {
        if (p.unreadCount && p.unreadCount[user.uid]) {
          count += p.unreadCount[user.uid];
        }
      });
      setProjectUnread(count);
    }, user.uid);

    return () => {
      unsubConvs();
      unsubProjects();
    };
  }, [user.uid]);

  useEffect(() => {
    if (adminProfile) {
      const unsubMessages = getDirectMessages(user.uid, adminProfile.uid, (msgs) => {
        setMessages(msgs);
      });
      return () => unsubMessages();
    }
  }, [user.uid, adminProfile]);

  useEffect(() => {
    const unsubscribe = getProjects((projectsData) => {
      setProjects(projectsData as Project[]);
      if (projectsData.length > 0 && !selectedProject) {
        setSelectedProject(projectsData[0] as Project);
      }
    }, user.uid);
    return () => unsubscribe();
  }, [user.uid]);

  useEffect(() => {
    if (!profile) return;
    const unsubscribe = subscribeToMeetings(profile?.role as 'admin' | 'client', user.uid, (data) => {
      setMeetings(data);
    });
    return () => unsubscribe();
  }, [user.uid, profile?.role]);

  const handleCancelProject = async () => {
    if (selectedProject) {
      await updateProject(selectedProject.id, { isDeleted: true });
      setShowCancelModal(false);
      setSelectedProject(null);
    }
  };

  // Removed old statusSteps and currentStepIndex from here

  const primaryColor = '#c7c42a';

  return (
    <div className="min-h-screen bg-black font-sans text-white selection:bg-[#c7c42a] selection:text-black">
      <MeetingReminder meetings={meetings} />
      {/* Sidebar Navigation */}
      <aside className="fixed left-0 top-0 bottom-0 w-24 bg-black/20 backdrop-blur-3xl border-r border-white/5 flex flex-col items-center py-10 gap-10 z-40 hidden lg:flex">
        <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center shadow-xl">
          <span className="text-white font-black text-xl italic tracking-tighter">Q</span>
        </div>
        <nav className="flex-1 flex flex-col gap-6">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'messages', icon: MessageCircle, label: unreadCount > 0 ? `Messages (${unreadCount})` : 'Messages' },
            { id: 'meetings', icon: Video, label: 'Meetings' },
            { id: 'payments', icon: CreditCard, label: 'Payments' },
            { id: 'settings', icon: Settings, label: 'Settings', link: '/settings' },
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => tab.link ? navigate(tab.link) : setActiveTab(tab.id as any)}
              className={`p-4 rounded-2xl transition-all duration-300 relative group ${
                activeTab === tab.id 
                  ? 'text-black shadow-lg scale-110' 
                  : 'text-white/30 hover:text-white hover:bg-white/5'
              }`}
              style={activeTab === tab.id ? { backgroundColor: primaryColor } : {}}
              title={tab.label}
            >
              <tab.icon size={24} />
              {tab.id === 'messages' && unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
          {profile?.role === 'admin' && (
            <Link 
              to="/admin"
              className="p-4 rounded-2xl text-white/30 hover:text-[#c7c42a] hover:bg-white/5 transition-all"
            >
              <LayoutDashboard size={24} />
            </Link>
          )}
        </nav>
        <button onClick={() => logOut()} className="p-4 rounded-2xl text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all">
          <LogOut size={24} />
        </button>
      </aside>

      <AnimatePresence>
        {showSuccessMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className="fixed top-10 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-6"
          >
            <div 
              className="text-black p-6 rounded-[2rem] shadow-2xl flex items-center gap-6 border border-white/20"
              style={{ backgroundColor: primaryColor }}
            >
              <div className="w-16 h-16 bg-black/10 rounded-2xl flex items-center justify-center shrink-0">
                <PartyPopper size={32} className="animate-bounce" />
              </div>
              <div>
                <h4 className="text-xl font-black uppercase italic tracking-tighter">Payment Successful!</h4>
                <p className="text-sm font-bold opacity-70">Your project has been submitted and is now waiting for review.</p>
              </div>
              <button onClick={() => setShowSuccessMessage(false)} className="p-2 hover:bg-black/5 rounded-full transition-all">
                <X size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="lg:hidden bg-black/20 backdrop-blur-xl px-6 py-6 border-b border-white/5 sticky top-0 z-40">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-sm italic">Q</span>
            </div>
            <div className="text-xl font-black tracking-tighter uppercase italic">{APP_NAME}</div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => logOut()} className="text-white/50 hover:text-red-400 transition-all">
              <LogOut size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-around items-center z-40">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Home' },
            { id: 'messages', icon: MessageCircle, label: unreadCount > 0 ? `Chat (${unreadCount})` : 'Chat' },
            { id: 'meetings', icon: Video, label: 'Meetings' },
            { id: 'settings', icon: Settings, label: 'Settings' },
          ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => tab.id === 'settings' ? navigate('/settings') : setActiveTab(tab.id as any)}
            className={`flex flex-col items-center gap-1 transition-all relative ${
              activeTab === tab.id 
                ? 'text-black' 
                : 'text-gray-400'
            }`}
          >
            <div className="relative">
              <tab.icon size={20} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
              {tab.id === 'messages' && unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-lg">
                  {unreadCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest">{tab.label}</span>
          </button>
        ))}
      </nav>

      <main className="lg:ml-24 min-h-screen pb-24 lg:pb-0">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12 space-y-10">
          {/* Subscription Warning */}
          {selectedProject?.subscriptionStatus === 'suspended' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-500 text-white p-8 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 border border-white/20 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-black/10 rounded-full blur-3xl -mr-32 -mt-32" />
              <div className="flex items-center gap-8 text-center md:text-left relative z-10">
                <div className="w-20 h-20 bg-black/10 rounded-3xl flex items-center justify-center shrink-0">
                  <AlertCircle size={40} className="animate-pulse" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black uppercase italic tracking-tighter">Account Suspended</h3>
                  <p className="text-white/70 text-sm font-medium italic max-w-xl">Your website has been temporarily paused due to non-payment. Please update your payment to restore service immediately.</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveTab('payments')}
                className="bg-white text-black px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.05] transition-all shrink-0 relative z-10 shadow-xl"
              >
                Pay Now
              </button>
            </motion.div>
          )}

          {selectedProject?.subscriptionStatus === 'past_due' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-#c7c42a text-black p-8 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 border border-black/10 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-black/5 rounded-full blur-3xl -mr-32 -mt-32" />
              <div className="flex items-center gap-8 text-center md:text-left relative z-10">
                <div className="w-20 h-20 bg-black/10 rounded-3xl flex items-center justify-center shrink-0">
                  <Clock size={40} className="animate-bounce" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black uppercase italic tracking-tighter">Payment Overdue</h3>
                  <p className="text-black/60 text-sm font-medium italic max-w-xl">Your payment is overdue. Please pay within 48 hours to avoid service interruption and potential suspension.</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveTab('payments')}
                className="bg-black text-white px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.05] transition-all shrink-0 relative z-10 shadow-xl"
              >
                Resolve Now
              </button>
            </motion.div>
          )}

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 mb-4"
              >
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: primaryColor }} />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: primaryColor }}>Client Dashboard</span>
              </motion.div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-[0.85]">
                Welcome back,<br />
                <span style={{ color: primaryColor }}>{profile?.displayName?.split(' ')[0] || 'User'}</span>
              </h1>
            </div>
            <div className="flex flex-col items-end gap-4">
              <div className="flex items-center gap-4">
              {adminProfile && (
                <button 
                  onClick={() => setShowDirectChat(true)}
                  className="flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl hover:bg-white/10 transition-all group"
                  style={{ color: primaryColor, borderColor: primaryColor + '40' }}
                >
                  <MessageCircle size={18} className="group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Chat with Admin</span>
                </button>
              )}
                <div className="flex flex-col items-end gap-1">
                  <div className="text-[10px] font-black uppercase tracking-widest text-white/30">System Status</div>
                  <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">All Systems Operational</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "circOut" }}
            >
              {activeTab === 'messages' ? (
                <MessagesModule 
                  currentUser={user}
                  profile={profile}
                  onClose={() => setActiveTab('dashboard')}
                  fullScreen={false}
                  projects={projects}
                />
              ) : activeTab === 'meetings' ? (
                <div className="space-y-12">
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#c7c42a]">Scheduling</span>
                    <h2 className="text-6xl font-black tracking-tighter uppercase italic text-white leading-none">Your Meetings</h2>
                  </div>
                  <MeetingList user={user} profile={profile!} />
                </div>
              ) : activeTab === 'settings' ? (
                <div className="bg-black/20 backdrop-blur-3xl rounded-[3rem] p-16 border border-white/5 shadow-2xl text-center space-y-8">
                  <div className="w-24 h-24 bg-[#c7c42a] rounded-full flex items-center justify-center text-black mx-auto shadow-[0_0_50px_rgba(199,196,42,0.2)]">
                    <Settings size={48} />
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-5xl font-black tracking-tighter uppercase italic text-[#c7c42a]">Professional Settings</h2>
                    <p className="text-white/50 text-xl max-w-md mx-auto font-medium italic">Manage your profile, business details, and platform controls in our new dedicated settings portal.</p>
                  </div>
                  <div className="pt-8">
                    <Link 
                      to="/settings" 
                      className="inline-block bg-[#c7c42a] text-black px-12 py-5 rounded-full font-black text-xl uppercase italic hover:scale-[1.05] active:scale-[0.95] transition-all shadow-[0_0_30px_rgba(199,196,42,0.2)]"
                    >
                      Open Settings Portal
                    </Link>
                  </div>
                </div>
              ) : activeTab === 'payments' ? (
                <div className="space-y-10">
                  <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                    <div className="space-y-4">
                      <h2 className="text-xs font-black text-[#c7c42a] uppercase tracking-[0.4em]">Billing & Subscription</h2>
                      <h3 className="text-6xl font-black tracking-tighter uppercase italic text-white leading-none">Your Payments</h3>
                    </div>
                    
                    {/* Billing Toggle */}
                    <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/10">
                      <button 
                        onClick={() => setBillingType('one-time')}
                        className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${billingType === 'one-time' ? 'text-black' : 'text-white/40 hover:text-white'}`}
                        style={billingType === 'one-time' ? { backgroundColor: primaryColor } : {}}
                      >
                        One-Time
                      </button>
                      <button 
                        onClick={() => setBillingType('subscription')}
                        className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${billingType === 'subscription' ? 'text-black' : 'text-white/40 hover:text-white'}`}
                        style={billingType === 'subscription' ? { backgroundColor: primaryColor } : {}}
                      >
                        Monthly
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Active Plan Card */}
                    <div className="bg-white/5 border border-white/10 p-10 rounded-[3rem] space-y-8 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-[#c7c42a]/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-[#c7c42a]/10 transition-all" />
                      
                      <div className="flex justify-between items-start relative z-10">
                        <div className="space-y-1">
                          <div className="text-[10px] font-black uppercase tracking-widest text-[#c7c42a]">Current Plan</div>
                          <h4 className="text-3xl font-black uppercase italic tracking-tighter">
                            {selectedProject?.plan || 'Basic'} {billingType === 'one-time' ? '(One-Time)' : '(Subscription)'}
                          </h4>
                        </div>
                        <div className="px-4 py-1.5 bg-[#c7c42a]/10 border border-[#c7c42a]/20 rounded-full text-[10px] font-black uppercase tracking-widest text-[#c7c42a]">
                          Active
                        </div>
                      </div>

                      <div className="space-y-4 relative z-10">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-white/40 font-bold uppercase tracking-widest">
                            {billingType === 'one-time' ? 'Total Cost' : 'Monthly Cost'}
                          </span>
                          <span className="text-white font-black italic">
                            {billingType === 'one-time' ? (
                              selectedProject?.plan === 'Standard' ? '₹15,000' : selectedProject?.plan === 'Pro' ? '₹30,000' : '₹5,000'
                            ) : (
                              selectedProject?.plan === 'Standard' ? '₹5,999' : selectedProject?.plan === 'Premium' ? '₹9,999' : '₹999'
                            )}/-
                          </span>
                        </div>
                        {billingType === 'subscription' && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-white/40 font-bold uppercase tracking-widest">Next Billing Date</span>
                            <span className="text-white font-black italic">May 15, 2026</span>
                          </div>
                        )}
                      </div>

                      <div className="pt-4 relative z-10">
                        <button 
                          onClick={() => selectedProject && setShowInvoice(true)}
                          disabled={!selectedProject}
                          className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                          <FileText size={16} />
                          View Latest Invoice
                        </button>
                      </div>
                    </div>

                    {/* Payment Status Card */}
                    <div className="bg-white/5 border border-white/10 p-10 rounded-[3rem] space-y-8 flex flex-col justify-center text-center">
                      <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mx-auto">
                        <ShieldCheck size={40} />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-2xl font-black uppercase italic tracking-tighter">Payment Verified</h4>
                        <p className="text-white/40 text-xs font-medium italic">Your subscription is in good standing. No action required.</p>
                      </div>
                      <div className="pt-4">
                        <button className="text-[10px] font-black uppercase tracking-widest text-[#c7c42a] hover:underline">
                          Update Payment Method
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Transaction History */}
                  <div className="bg-white/5 border border-white/10 rounded-[3rem] overflow-hidden">
                    <div className="p-8 border-b border-white/5">
                      <h4 className="text-xs font-black uppercase tracking-widest text-white/40">Transaction History</h4>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="text-[10px] font-black uppercase tracking-widest text-white/20 border-b border-white/5">
                            <th className="px-8 py-6">Date</th>
                            <th className="px-8 py-6">Description</th>
                            <th className="px-8 py-6">Amount</th>
                            <th className="px-8 py-6">Status</th>
                            <th className="px-8 py-6">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {[
                            { date: 'Apr 15, 2026', desc: `${selectedProject?.plan || 'Basic'} - Monthly Subscription`, amount: `₹${selectedProject?.plan === 'Standard' ? '5,999' : selectedProject?.plan === 'Premium' ? '9,999' : '999'}`, status: 'Paid' },
                            { date: 'Mar 15, 2026', desc: `${selectedProject?.plan || 'Basic'} - Setup Fee + 1st Month`, amount: `₹${selectedProject?.plan === 'Standard' ? '8,998' : selectedProject?.plan === 'Premium' ? '14,998' : '2,998'}`, status: 'Paid' },
                          ].map((tx, i) => (
                            <tr key={i} className="group hover:bg-white/5 transition-all">
                              <td className="px-8 py-6 text-xs font-bold text-white/60">{tx.date}</td>
                              <td className="px-8 py-6 text-xs font-black uppercase italic tracking-tighter">{tx.desc}</td>
                              <td className="px-8 py-6 text-xs font-black text-[#c7c42a] italic">{tx.amount}</td>
                              <td className="px-8 py-6">
                                <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-[8px] font-black uppercase tracking-widest border border-green-500/20">
                                  {tx.status}
                                </span>
                              </td>
                              <td className="px-8 py-6">
                                <button className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-all">
                                  <Download size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-10">
                  {/* Stats Grid - 4 Boxes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { id: 'projects', label: 'Active Project', value: projects.filter(p => p.status === 'Development Started').length, icon: FolderKanban, color: 'text-[#c7c42a]', bg: 'bg-[#c7c42a]/10', items: projects.filter(p => p.status === 'Development Started').map(p => p.businessName) },
                      { id: 'pending', label: 'Pending Requests', value: projects.filter(p => p.status === 'Waiting for Review' || p.status === 'Under Review').length, icon: Clock, color: 'text-[#c7c42a]', bg: 'bg-[#c7c42a]/10', items: projects.filter(p => p.status === 'Waiting for Review' || p.status === 'Under Review').map(p => p.businessName) },
                      { id: 'completed', label: 'Completed Projects', value: projects.filter(p => p.status === 'Completed').length, icon: CheckCircle2, color: 'text-[#c7c42a]', bg: 'bg-[#c7c42a]/10', items: projects.filter(p => p.status === 'Completed').map(p => p.businessName) },
                      { id: 'price', label: 'Plan Price', value: '1499/month', icon: PartyPopper, color: 'text-[#c7c42a]', bg: 'bg-[#c7c42a]/10', items: ['Basic Plan'] },
                    ].map((stat, i) => (
                      <div key={stat.id} className="relative">
                        <motion.button 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          onClick={() => setExpandedBox(expandedBox === stat.id ? null : stat.id)}
                          className={`w-full bg-black/20 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-white/5 shadow-xl group hover:border-[#c7c42a]/30 transition-all text-left ${expandedBox === stat.id ? 'ring-2 ring-[#c7c42a]/50' : ''}`}
                        >
                          <div className="flex justify-between items-start mb-6">
                            <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform`}>
                              <stat.icon size={24} />
                            </div>
                            <div className="text-4xl font-black italic tracking-tighter">{stat.value}</div>
                          </div>
                          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{stat.label}</div>
                        </motion.button>

                        <AnimatePresence>
                          {expandedBox === stat.id && (
                            <motion.div
                              initial={{ opacity: 0, y: 10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 10, scale: 0.95 }}
                              className="absolute top-full left-0 right-0 mt-4 z-30 bg-[#rgba(255,255,255,0.05)] border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden"
                            >
                              <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                {stat.items.length > 0 ? stat.items.map((item, idx) => (
                                  <div key={idx} className="p-3 bg-white/5 rounded-xl border border-white/5 text-[10px] font-bold uppercase tracking-widest text-white/70 truncate">
                                    {item}
                                  </div>
                                )) : (
                                  <div className="text-center py-4 text-[10px] font-bold uppercase tracking-widest text-white/20">
                                    No items found
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>

                  {projects.length === 0 ? (
                    <div className="bg-black/20 backdrop-blur-3xl rounded-[3rem] p-16 text-center border border-white/5 shadow-2xl">
                      <h2 className="text-5xl font-black tracking-tighter mb-6 uppercase italic text-[#c7c42a]">No projects yet</h2>
                      <p className="text-white/60 mb-10 text-xl">Start your first project to see it here.</p>
                      <Link to="/onboarding" className="inline-block bg-[#c7c42a] text-black px-12 py-5 rounded-full font-black text-xl uppercase italic hover:scale-[1.05] active:scale-[0.95] transition-all shadow-[0_0_30px_rgba(199,196,42,0.2)]">
                        Start Your Project
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                      {/* Project List */}
                      <div className="lg:col-span-1 space-y-6">
                        <div className="flex items-center justify-between px-4">
                          <h2 className="text-xs font-black text-white/50 uppercase tracking-widest">Your Projects</h2>
                          <Link to="/onboarding" className="text-[10px] font-black uppercase tracking-widest text-[#c7c42a] hover:underline">New +</Link>
                        </div>
                        <div className="space-y-4">
                          {projects.map((p) => (
                            <div 
                              key={p.id}
                              onClick={() => setSelectedProject(p)}
                              className={`w-full p-8 rounded-[2.5rem] text-left transition-all border duration-300 ${
                                selectedProject?.id === p.id 
                                  ? 'text-black shadow-xl scale-[1.02]' 
                                  : 'bg-black/20 border-white/5 text-white hover:border-white/20'
                              }`}
                              style={selectedProject?.id === p.id ? { backgroundColor: primaryColor, borderColor: primaryColor } : {}}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="font-black text-2xl uppercase italic tracking-tighter">{p.businessName}</h3>
                                <div className={`w-2 h-2 rounded-full ${
                                  p.status === 'active' ? 'bg-blue-500' :
                                  p.status === 'completed' ? 'bg-green-500' :
                                  p.status === 'rejected' ? 'bg-red-500' :
                                  'bg-#c7c42a'
                                }`} />
                              </div>
                              <p className={`text-sm mb-4 font-bold ${selectedProject?.id === p.id ? 'text-black/70' : 'text-white/50'}`}>{p.businessType}</p>
                              <div className="flex items-center justify-between">
                                <div className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                  selectedProject?.id === p.id ? 'bg-black' : 'bg-white/10 text-white'
                                }`}
                                style={selectedProject?.id === p.id ? { color: primaryColor } : {}}
                                >
                                  {p.status}
                                </div>
                                <span className={`text-xs font-black italic ${selectedProject?.id === p.id ? 'text-black' : 'text-white'}`}>{p.progress}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Project Details */}
                      <div className="lg:col-span-2 space-y-8">
                        {selectedProject && (
                          <motion.div 
                            key={selectedProject.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-black/20 backdrop-blur-3xl rounded-[3rem] p-10 lg:p-16 border border-white/5 shadow-2xl relative overflow-hidden"
                          >
                            {/* Atmospheric Glow */}
                            <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#c7c42a] rounded-full blur-[120px] opacity-10"></div>

                            <div className="flex justify-between items-start mb-16 relative z-10">
                              <div>
                                <h2 className="text-6xl font-black tracking-tighter mb-4 uppercase italic text-[#c7c42a]">Project Status</h2>
                                <p className="text-2xl text-white/70 font-black uppercase italic tracking-tighter">{selectedProject.businessName}</p>
                                <div className="mt-2 text-[10px] font-bold text-white/40 uppercase tracking-widest flex flex-wrap gap-x-4 gap-y-1">
                                  <span>{selectedProject.businessType}</span>
                                  <span>{selectedProject.businessPhone || selectedProject.businessNumber}</span>
                                  <span>{selectedProject.city}, {selectedProject.state} • {selectedProject.pincode}</span>
                                </div>
                                <div className="mt-6 flex flex-wrap gap-4">
                                  <button 
                                    onClick={() => {
                                      const el = document.getElementById('dev-phase');
                                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                    className="flex items-center gap-2 bg-[#c7c42a]/10 border border-[#c7c42a]/20 px-6 py-3 rounded-xl text-[#c7c42a] hover:bg-[#c7c42a] hover:text-black transition-all group"
                                  >
                                    <Clock size={16} className="group-hover:scale-110 transition-transform" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">View Full Process</span>
                                  </button>
                                </div>
                              </div>

                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16 relative z-10">
                              <div className="space-y-6">
                                <h3 className="text-xs font-black text-white/40 uppercase tracking-widest">Selected Template</h3>
                                <div className="p-6 bg-white/5 rounded-3xl border border-white/5 flex items-center justify-between">
                                  <div>
                                    <div className="text-xl font-black uppercase italic text-[#c7c42a]">
                                      {selectedProject.templateId === 'food-court' ? 'Food Court' : 
                                       selectedProject.templateId === 'autos' ? 'Global Autos' : 
                                       selectedProject.templateId === 'clothing' ? 'Wearism Fashion' : 
                                       selectedProject.templateId === 'ai-custom' ? 'AI Custom Design' : 'Standard Template'}
                                    </div>
                                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">
                                      {selectedProject.templateId === 'ai-custom' ? 'Custom Solution' : 'Premium Theme'}
                                    </p>
                                  </div>
                                  {['food-court', 'autos', 'clothing'].includes(selectedProject.templateId) && (
                                    <Link 
                                      to={`/portfolio/${selectedProject.templateId === 'food-court' ? 'food-court' : selectedProject.templateId === 'autos' ? 'autos' : 'clothing'}`}
                                      className="bg-white/5 hover:bg-[#c7c42a] hover:text-black p-3 rounded-xl transition-all"
                                    >
                                      <ArrowRight size={20} />
                                    </Link>
                                  )}
                                </div>
                              </div>
                              <div className="space-y-6">
                                <h3 className="text-xs font-black text-white/40 uppercase tracking-widest">Project Details</h3>
                                <div className="p-6 bg-white/5 rounded-3xl border border-white/5 text-center">
                                  <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Project information is being processed</p>
                                </div>
                              </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="space-y-12 mb-16 relative z-10">
                              <div className="flex justify-between items-center overflow-x-auto pb-6 gap-6 no-scrollbar">
                                {statusSteps.map((step, i) => (
                                  <div key={step} className="flex flex-col items-center min-w-[120px] text-center gap-4">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                                      i < currentStepIndex 
                                        ? 'bg-[#c7c42a] border-[#c7c42a] text-black' 
                                        : i === currentStepIndex
                                          ? step === 'Declined' ? 'bg-red-500 border-red-500 text-white' : 'bg-[#c7c42a] border-[#c7c42a] text-black'
                                          : 'bg-transparent border-white/20 text-white/20'
                                    }`}>
                                      {i < currentStepIndex ? <Check size={24} /> : step === 'Declined' ? <X size={24} /> : <span className="font-black text-lg">{i + 1}</span>}
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${
                                      i <= currentStepIndex ? step === 'Declined' ? 'text-red-500' : 'text-[#c7c42a]' : 'text-white/20'
                                    }`}>
                                      {step}
                                    </span>
                                  </div>
                                ))}
                              </div>
                              
                              <div className="space-y-6">
                                <div className="flex justify-between items-end">
                                  <span className="text-2xl font-black uppercase italic text-[#c7c42a]">Progress: {selectedProject.progress}%</span>
                                  <span className="text-xs font-black text-white/40 uppercase tracking-widest">Est. Completion: {formatDate(selectedProject.estimatedCompletion)}</span>
                                </div>
                                <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${selectedProject.progress}%` }}
                                    className="h-full bg-[#c7c42a] rounded-full shadow-[0_0_15px_rgba(199,196,42,0.5)]"
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="flex justify-between items-center pt-10 border-t border-white/5 relative z-10">
                              <div className="text-sm">
                                {selectedProject.status === 'Rejected' && (
                                  <p className="text-red-400 font-black uppercase italic">Reason: {selectedProject.rejectionReason}</p>
                                )}
                              </div>
                              <button 
                                onClick={() => setShowCancelModal(true)}
                                className="text-white/30 hover:text-red-400 font-black text-xs uppercase tracking-widest transition-all"
                              >
                                Cancel Project
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </div>

                      <div id="dev-phase" className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
                        <div className="bg-white/5 p-10 rounded-[3rem] border border-white/5">
                          <h3 className="text-xl font-black uppercase italic tracking-tighter mb-6">Development Phase</h3>
                          <div className="space-y-6">
                            {[
                              { step: '01', title: 'Consultation', desc: 'Initial project planning and scope definition.', done: true },
                              { step: '02', title: 'Design Mockup', desc: 'Visual layout and user experience planning.', done: true },
                              { step: '03', title: 'Development', desc: 'Core functionality and template integration.', done: false },
                              { step: '04', title: 'Launch', desc: 'Final testing and production deployment.', done: false },
                            ].map((phase, i) => (
                              <div key={i} className="flex gap-6 items-start">
                                <div className={`text-xl font-black italic ${phase.done ? 'text-[#c7c42a]' : 'text-white/20'}`}>{phase.step}</div>
                                <div>
                                  <h4 className={`font-black uppercase italic tracking-tighter ${phase.done ? 'text-white' : 'text-white/40'}`}>{phase.title}</h4>
                                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{phase.desc}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="bg-[#c7c42a] p-10 rounded-[3rem] text-black flex flex-col justify-between shadow-[0_0_40px_rgba(199,196,42,0.1)]">
                          <div>
                            <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-4 leading-none">Need help with<br />your plan?</h3>
                            <p className="font-bold uppercase tracking-widest text-[10px] opacity-60 mb-8">Our experts are ready to assist you in building the perfect web presence.</p>
                          </div>
                          {adminProfile ? (
                            <button 
                              onClick={() => setShowDirectChat(true)}
                              className="bg-black text-white w-full py-5 rounded-2xl font-black uppercase italic hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                            >
                              <MessageCircle size={20} /> Chat with Admin
                            </button>
                          ) : (
                            <button 
                              onClick={() => window.location.href = "mailto:webbylaunch@gmail.com?subject=Project Inquiry&body=Hi WebbyLaunch, I need help with my project."}
                              className="bg-black text-white w-full py-5 rounded-2xl font-black uppercase italic hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                            >
                              <Mail size={20} /> Email Us
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>



      <AnimatePresence>
        {showDirectChat && adminProfile && (
          <ChatSystem 
            isDirect={true}
            recipientUser={{ uid: adminProfile.uid, displayName: adminProfile.displayName || 'System Admin' }}
            profile={profile}
            currentUser={user}
            onClose={() => setShowDirectChat(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showInvoice && selectedProject && (
          <InvoiceSystem 
            project={selectedProject}
            profile={profile}
            onClose={() => setShowInvoice(false)}
          />
        )}
      </AnimatePresence>

      {/* Cancel Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md" 
              onClick={() => setShowCancelModal(false)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-black rounded-[3rem] p-12 max-w-md w-full text-center shadow-2xl border border-[#c7c42a]/10"
            >
              <h3 className="text-4xl font-black tracking-tighter mb-6 uppercase italic text-[#c7c42a]">Cancel Project?</h3>
              <p className="text-white/60 mb-10 text-lg font-bold">Are you sure you want to cancel this project?</p>
              <div className="flex flex-col gap-4">
                <button onClick={handleCancelProject} className="w-full bg-red-500 text-white py-5 rounded-full font-black text-xl uppercase italic hover:bg-red-600 transition-all">
                  Yes, Cancel
                </button>
                <button onClick={() => setShowCancelModal(false)} className="w-full bg-white/5 text-white py-5 rounded-full font-black text-xl uppercase italic hover:bg-white/10 transition-all">
                  No, Keep It
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
