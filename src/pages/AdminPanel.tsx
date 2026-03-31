import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db, collection, onSnapshot, FirebaseUser, logOut } from '../firebase';
import { UserProfile, Project } from '../types';
import { Link } from 'react-router-dom';
import { LogOut, User, LayoutDashboard, FileText, BarChart3, Trash2, Check, X, MessageCircle, TrendingUp, Users, Clock, CheckCircle2, Layout } from 'lucide-react';
import ChatSystem from '../components/ChatSystem';
import { updateProject, deleteAllProjects } from '../services/database';
import { APP_NAME, HYPHENATED_NAME } from '../constants';

interface AdminPanelProps {
  user: FirebaseUser;
  profile: UserProfile | null;
}

export default function AdminPanel({ user, profile }: AdminPanelProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'requests' | 'active' | 'analytics' | 'messages' | 'recycle' | 'system'>('dashboard');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [newProgress, setNewProgress] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [showDirectChat, setShowDirectChat] = useState(false);

  useEffect(() => {
    const unsubscribeProjects = onSnapshot(collection(db, 'projects'), (snapshot) => {
      setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project)));
    });
    const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile)));
    });
    return () => {
      unsubscribeProjects();
      unsubscribeUsers();
    };
  }, []);

  const handleAccept = async (projectId: string) => {
    try {
      await updateProject(projectId, { 
        status: 'Accepted',
        progress: 10,
        estimatedCompletion: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
      });
      // Auto action: Development Started
      setTimeout(async () => {
        await updateProject(projectId, { 
          status: 'Development Started',
          progress: 20
        });
      }, 2000);
    } catch (error) {
      console.error("Error accepting project:", error);
    }
  };

  const handleUpdateProgress = async () => {
    if (selectedProject) {
      try {
        const status = newProgress === 100 ? 'Completed' : 'Development Started';
        await updateProject(selectedProject.id, { 
          progress: newProgress,
          status: status
        });
        setShowProgressModal(false);
        setSelectedProject(null);
      } catch (error) {
        console.error("Error updating progress:", error);
      }
    }
  };

  const handleReject = async () => {
    if (selectedProject && rejectionReason.trim()) {
      try {
        await updateProject(selectedProject.id, { 
          status: 'Rejected',
          rejectionReason: rejectionReason
        });
        setShowRejectModal(false);
        setRejectionReason('');
        setSelectedProject(null);
      } catch (error) {
        console.error("Error rejecting project:", error);
      }
    }
  };

  const handleRestore = async (projectId: string) => {
    try {
      await updateProject(projectId, { isDeleted: false });
    } catch (error) {
      console.error("Error restoring project:", error);
    }
  };

  const stats = {
    totalUsers: users.length,
    activeProjects: projects.filter(p => !p.isDeleted && ['Accepted', 'Development Started'].includes(p.status)).length,
    pendingRequests: projects.filter(p => p.status === 'Waiting for Review' && !p.isDeleted).length,
    completedProjects: projects.filter(p => p.status === 'Completed' && !p.isDeleted).length,
  };

  const renderDashboard = () => (
    <div className="space-y-12">
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-bold text-[#E6FF00] uppercase tracking-[0.3em]">Overview</span>
        <h2 className="text-6xl font-bold tracking-tighter text-white">COMMAND CENTER</h2>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-[#E6FF00]' },
          { label: 'Active Projects', value: stats.activeProjects, icon: TrendingUp, color: 'text-[#E6FF00]' },
          { label: 'Pending Requests', value: stats.pendingRequests, icon: Clock, color: 'text-[#E6FF00]' },
          { label: 'Completed Projects', value: stats.completedProjects, icon: CheckCircle2, color: 'text-[#E6FF00]' },
        ].map((stat, i) => (
          <div key={i} className="bg-[#5E7162]/30 backdrop-blur-md p-8 rounded-[2rem] border border-white/10 group hover:border-[#E6FF00]/30 transition-all">
            <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
              <stat.icon size={24} className={stat.color} />
            </div>
            <div className="text-4xl font-bold mb-1 text-white tabular-nums">{stat.value}</div>
            <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#5E7162]/30 backdrop-blur-md p-8 rounded-[2rem] border border-white/10">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-white">Recent Activity</h3>
            <span className="text-[10px] font-bold text-[#E6FF00] uppercase tracking-widest">Live Feed</span>
          </div>
          <div className="space-y-4">
            {projects.slice(0, 5).map((p, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#E6FF00]/10 flex items-center justify-center">
                    <FileText size={16} className="text-[#E6FF00]" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{p.businessName}</div>
                    <div className="text-[10px] text-white/40 uppercase tracking-wider">{p.status}</div>
                  </div>
                </div>
                <div className="text-[10px] font-bold text-white/20">JUST NOW</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#5E7162]/30 backdrop-blur-md p-8 rounded-[2rem] border border-white/10">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-white">System Health</h3>
            <span className="text-[10px] font-bold text-[#E6FF00] uppercase tracking-widest">Stable</span>
          </div>
          <div className="space-y-6">
            {[
              { label: 'Server Load', value: 24 },
              { label: 'Database Sync', value: 98 },
              { label: 'API Latency', value: 12 },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">
                  <span>{item.label}</span>
                  <span>{item.value}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${item.value}%` }}
                    className="h-full bg-[#E6FF00]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderRequests = () => (
    <div className="space-y-12">
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-bold text-[#E6FF00] uppercase tracking-[0.3em]">Incoming</span>
        <h2 className="text-6xl font-bold tracking-tighter text-white">PROJECT REQUESTS</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.filter(p => p.status === 'Waiting for Review' && !p.isDeleted).map((p) => (
          <div key={p.id} className="bg-[#5E7162]/30 backdrop-blur-md p-8 rounded-[2rem] border border-white/10 flex flex-col h-full group hover:border-[#E6FF00]/30 transition-all">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-3xl font-bold tracking-tighter text-white mb-1">{p.businessName}</h3>
                <div className="flex items-center gap-2">
                  <div className="text-[10px] font-bold text-[#E6FF00] uppercase tracking-widest">{p.businessType}</div>
                  <div className="px-2 py-0.5 bg-white/10 rounded text-[8px] font-black text-white/60 uppercase tracking-widest border border-white/5">
                    Template: {p.templateId}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => { setSelectedProject(p); setShowChat(true); }}
                className="p-4 bg-white/5 rounded-full text-white hover:bg-[#E6FF00] hover:text-black transition-all"
              >
                <MessageCircle size={20} />
              </button>
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-10 flex-1">{p.description}</p>
            <div className="flex gap-3">
              <button 
                onClick={() => handleAccept(p.id)}
                className="flex-1 bg-[#E6FF00] text-black py-4 rounded-full font-bold hover:scale-[1.02] active:scale-[0.98] transition-all text-xs uppercase tracking-widest"
              >
                Accept Project
              </button>
              <button 
                onClick={() => { setSelectedProject(p); setShowRejectModal(true); }}
                className="flex-1 border border-white/10 text-white py-4 rounded-full font-bold hover:bg-white/5 transition-all text-xs uppercase tracking-widest"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
        {projects.filter(p => p.status === 'Waiting for Review' && !p.isDeleted).length === 0 && (
          <div className="col-span-full py-32 text-center">
            <div className="text-white/20 text-sm font-bold uppercase tracking-[0.5em]">No pending requests</div>
          </div>
        )}
      </div>
    </div>
  );

  const renderActiveProjects = () => (
    <div className="space-y-12">
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-bold text-[#E6FF00] uppercase tracking-[0.3em]">In Progress</span>
        <h2 className="text-6xl font-bold tracking-tighter text-white">ACTIVE OPERATIONS</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.filter(p => ['Accepted', 'Development Started', 'Completed'].includes(p.status) && !p.isDeleted).map((p) => (
          <div key={p.id} className="bg-[#5E7162]/30 backdrop-blur-md p-8 rounded-[2rem] border border-white/10 group hover:border-[#E6FF00]/30 transition-all">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-3xl font-bold tracking-tighter text-white mb-1">{p.businessName}</h3>
                <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{p.userName} • {p.userEmail}</div>
                <div className="mt-2 inline-block px-3 py-1 bg-[#E6FF00]/10 rounded-full text-[8px] font-black text-[#E6FF00] uppercase tracking-widest border border-[#E6FF00]/20">
                  Template: {p.templateId}
                </div>
              </div>
              <button 
                onClick={() => { setSelectedProject(p); setShowChat(true); }}
                className="p-4 bg-white/5 rounded-full text-white hover:bg-[#E6FF00] hover:text-black transition-all"
              >
                <MessageCircle size={20} />
              </button>
            </div>
            
            <div className="mb-10">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-3">
                <span>Progress</span>
                <span className="text-[#E6FF00]">{p.progress}%</span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${p.progress}%` }}
                  className="h-full bg-[#E6FF00]" 
                />
              </div>
            </div>

            <button 
              onClick={() => { setSelectedProject(p); setNewProgress(p.progress); setShowProgressModal(true); }}
              className="w-full bg-white text-black py-4 rounded-full font-bold hover:scale-[1.02] active:scale-[0.98] transition-all text-xs uppercase tracking-widest"
            >
              Update Progress
            </button>
          </div>
        ))}
        {projects.filter(p => ['Accepted', 'Development Started', 'Completed'].includes(p.status) && !p.isDeleted).length === 0 && (
          <div className="col-span-full py-32 text-center">
            <div className="text-white/20 text-sm font-bold uppercase tracking-[0.5em]">No active projects</div>
          </div>
        )}
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-12">
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-bold text-[#E6FF00] uppercase tracking-[0.3em]">Data</span>
        <h2 className="text-6xl font-bold tracking-tighter text-white">USER METRICS</h2>
      </div>

      <div className="bg-[#5E7162]/30 backdrop-blur-md p-10 rounded-[3rem] border border-white/10">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h3 className="text-2xl font-bold text-white tracking-tight">Platform Engagement</h3>
            <p className="text-xs text-white/40 uppercase tracking-widest mt-1">Daily Active Users</p>
          </div>
          <div className="text-[10px] font-bold text-[#E6FF00] border border-[#E6FF00]/20 px-4 py-2 rounded-full uppercase tracking-widest">Last 7 Days</div>
        </div>
        <div className="h-80 flex items-end justify-between gap-4">
          {[40, 60, 30, 80, 50, 90, 70].map((h, i) => (
            <div key={i} className="flex-1 bg-white/5 rounded-t-2xl relative group">
              <motion.div 
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                className="w-full bg-[#E6FF00] rounded-t-2xl absolute bottom-0 transition-all group-hover:brightness-125"
              />
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all text-[10px] font-bold text-[#E6FF00] tabular-nums">
                {h * 10}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-8 text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => <span key={d}>{d}</span>)}
        </div>
      </div>
    </div>
  );

  const renderRecycleBin = () => (
    <div className="space-y-12">
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-bold text-[#E6FF00] uppercase tracking-[0.3em]">Archive</span>
        <h2 className="text-6xl font-bold tracking-tighter text-white">RECYCLE BIN</h2>
      </div>

      <div className="space-y-4">
        {projects.filter(p => p.isDeleted).map((p) => (
          <div key={p.id} className="bg-[#5E7162]/30 backdrop-blur-md p-8 rounded-[2rem] border border-white/10 flex items-center justify-between group hover:border-[#E6FF00]/30 transition-all">
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight mb-1">{p.businessName}</h3>
              <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Deleted Project • {p.businessType}</div>
            </div>
            <button 
              onClick={() => handleRestore(p.id)}
              className="px-8 py-3 bg-white text-black rounded-full text-[10px] font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
            >
              Restore
            </button>
          </div>
        ))}
        {projects.filter(p => p.isDeleted).length === 0 && (
          <div className="py-32 text-center">
            <div className="text-white/20 text-sm font-bold uppercase tracking-[0.5em]">Recycle bin is empty</div>
          </div>
        )}
      </div>
    </div>
  );

  const renderMessages = () => (
    <div className="space-y-12">
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-bold text-[#E6FF00] uppercase tracking-[0.3em]">Communications</span>
        <h2 className="text-6xl font-bold tracking-tighter text-white">DIRECT MESSAGES</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.filter(u => u.uid !== user.uid).map((u) => (
          <UserCard key={u.uid} u={u} onOpenChat={() => { setSelectedUser(u); setShowDirectChat(true); }} />
        ))}
      </div>
    </div>
  );

  const handleResetDatabase = async () => {
    setIsResetting(true);
    try {
      await deleteAllProjects();
      setShowResetModal(false);
      setActiveTab('dashboard');
    } catch (error) {
      console.error("Reset failed:", error);
    } finally {
      setIsResetting(false);
    }
  };

  const renderSystem = () => (
    <div className="space-y-12">
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-bold text-red-500 uppercase tracking-[0.3em]">Danger Zone</span>
        <h2 className="text-6xl font-bold tracking-tighter text-white">SYSTEM SETTINGS</h2>
      </div>

      <div className="bg-red-500/10 backdrop-blur-md p-10 rounded-[3rem] border border-red-500/20">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <h3 className="text-2xl font-bold text-white tracking-tight">Reset Database</h3>
            <p className="text-sm text-white/40 mt-2 max-w-md">
              This action will permanently delete all projects and their associated messages. This cannot be undone.
            </p>
          </div>
          <button 
            onClick={() => setShowResetModal(true)}
            className="px-10 py-5 bg-red-600 text-white rounded-full font-bold uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
          >
            Wipe All Projects
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#4A5D4E] font-sans flex flex-col md:flex-row text-white selection:bg-[#E6FF00] selection:text-black">
      {/* Sidebar */}
      <aside className="w-full md:w-80 bg-[#4A5D4E] border-r border-white/5 flex flex-col sticky top-0 h-screen z-20">
        <div className="p-10 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="px-2 py-0.5 bg-[#E6FF00] rounded flex items-center justify-center">
              <span className="text-black font-black text-[8px] tracking-tighter">{HYPHENATED_NAME}</span>
            </div>
            <div className="text-2xl font-bold tracking-tighter text-white">{APP_NAME}</div>
          </div>
          <div className="text-[10px] font-bold text-[#E6FF00] uppercase tracking-[0.4em] mt-2">Admin Panel</div>
        </div>
        <nav className="flex-1 p-6 space-y-3">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'requests', label: 'Requests', icon: FileText },
            { id: 'active', label: 'Active Projects', icon: Check },
            { id: 'messages', label: 'Messages', icon: MessageCircle },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'recycle', label: 'Recycle Bin', icon: Trash2 },
            { id: 'system', label: 'System', icon: TrendingUp },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${
                activeTab === item.id 
                  ? 'bg-[#E6FF00] text-black shadow-[0_0_30px_rgba(230,255,0,0.2)]' 
                  : 'text-white/40 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
          <Link
            to="/dashboard"
            className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest text-white/40 hover:bg-white/5 hover:text-white transition-all"
          >
            <Layout size={18} />
            User Dashboard
          </Link>
        </nav>
        <div className="p-6 border-t border-white/5">
          <button onClick={() => logOut()} className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest text-red-400 hover:bg-red-400/10 transition-all">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 md:p-16 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'requests' && renderRequests()}
            {activeTab === 'active' && renderActiveProjects()}
            {activeTab === 'analytics' && renderAnalytics()}
            {activeTab === 'messages' && renderMessages()}
            {activeTab === 'recycle' && renderRecycleBin()}
            {activeTab === 'system' && renderSystem()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Reset Modal */}
      <AnimatePresence>
        {showResetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl" 
              onClick={() => !isResetting && setShowResetModal(false)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-[#2A2A2A] rounded-[3rem] p-12 max-w-md w-full text-center shadow-2xl border border-red-500/20"
            >
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
                <Trash2 size={40} className="text-red-500" />
              </div>
              <h3 className="text-4xl font-bold tracking-tighter text-white mb-4">Are you sure?</h3>
              <p className="text-white/60 text-sm leading-relaxed mb-10">
                This will permanently delete <span className="text-white font-bold">ALL project data</span> and messages. This action is irreversible.
              </p>
              
              <div className="flex flex-col gap-4">
                <button 
                  onClick={handleResetDatabase}
                  disabled={isResetting}
                  className="w-full bg-red-600 text-white py-5 rounded-full font-bold uppercase tracking-widest hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
                >
                  {isResetting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Wiping Data...
                    </>
                  ) : 'Yes, Delete Everything'}
                </button>
                <button 
                  onClick={() => setShowResetModal(false)}
                  disabled={isResetting}
                  className="w-full bg-white/5 text-white py-5 rounded-full font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reject Modal */}
      <AnimatePresence>
        {showRejectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md" 
              onClick={() => setShowRejectModal(false)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-[#5E7162] rounded-[3rem] p-12 max-w-md w-full shadow-2xl border border-white/10"
            >
              <h3 className="text-4xl font-bold tracking-tighter text-white mb-2">Reject Project</h3>
              <p className="text-white/40 text-sm font-bold uppercase tracking-widest mb-8">Specify Reason</p>
              <textarea 
                className="w-full p-6 rounded-3xl bg-black/20 border border-white/10 text-white focus:outline-none focus:border-[#E6FF00]/50 h-40 mb-8 resize-none placeholder:text-white/20"
                placeholder="Reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
              <div className="flex flex-col gap-4">
                <button onClick={handleReject} className="w-full bg-[#E6FF00] text-black py-5 rounded-full font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all">
                  Confirm Rejection
                </button>
                <button onClick={() => setShowRejectModal(false)} className="w-full bg-white/5 text-white py-5 rounded-full font-bold uppercase tracking-widest hover:bg-white/10 transition-all">
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Progress Modal */}
      <AnimatePresence>
        {showProgressModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md" 
              onClick={() => setShowProgressModal(false)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-[#5E7162] rounded-[3rem] p-12 max-w-md w-full text-center shadow-2xl border border-white/10"
            >
              <h3 className="text-4xl font-bold tracking-tighter text-white mb-2">Update Status</h3>
              <p className="text-white/40 text-sm font-bold uppercase tracking-widest mb-10">{selectedProject?.businessName}</p>
              
              <div className="relative mb-12">
                <input 
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  className="w-full h-2 bg-black/20 rounded-full appearance-none cursor-pointer accent-[#E6FF00]"
                  value={newProgress}
                  onChange={(e) => setNewProgress(parseInt(e.target.value))}
                />
                <div className="text-7xl font-bold text-white mt-8 tabular-nums">{newProgress}%</div>
              </div>

              <div className="flex flex-col gap-4">
                <button onClick={handleUpdateProgress} className="w-full bg-[#E6FF00] text-black py-5 rounded-full font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all">
                  Save Progress
                </button>
                <button onClick={() => setShowProgressModal(false)} className="w-full bg-white/5 text-white py-5 rounded-full font-bold uppercase tracking-widest hover:bg-white/10 transition-all">
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Chat Sidebar (Admin View) */}
      <AnimatePresence>
        {showChat && selectedProject && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md" 
              onClick={() => setShowChat(false)} 
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-xl bg-[#4A5D4E] h-full shadow-2xl flex flex-col border-l border-white/5"
            >
              <div className="p-10 border-b border-white/5 flex justify-between items-center">
                <div>
                  <h2 className="text-4xl font-bold tracking-tighter text-white">PROJECT CHAT</h2>
                  <div className="text-[10px] font-bold text-[#E6FF00] uppercase tracking-[0.4em] mt-2">{selectedProject.businessName}</div>
                </div>
                <button onClick={() => setShowChat(false)} className="p-4 hover:bg-white/5 rounded-full text-white transition-all">
                  <X size={24} />
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <ChatSystem projectId={selectedProject.id} user={user} profile={profile} currentUser={user} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Direct Chat Sidebar (Admin View) */}
      <AnimatePresence>
        {showDirectChat && selectedUser && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md" 
              onClick={() => setShowDirectChat(false)} 
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-xl bg-[#4A5D4E] h-full shadow-2xl flex flex-col border-l border-white/5"
            >
              <div className="p-10 border-b border-white/5 flex justify-between items-center">
                <div>
                  <h2 className="text-4xl font-bold tracking-tighter text-white">DIRECT CHAT</h2>
                  <div className="text-[10px] font-bold text-[#E6FF00] uppercase tracking-[0.4em] mt-2">{selectedUser.displayName}</div>
                </div>
                <button onClick={() => setShowDirectChat(false)} className="p-4 hover:bg-white/5 rounded-full text-white transition-all">
                  <X size={24} />
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                {/* For admin, the "user" prop to ChatSystem should be the user they are chatting with if we want to use the same collection path */}
                {/* Wait, ChatSystem uses user.uid to determine the path. So if admin is chatting with User A, the path should be direct_messages/UserA/messages */}
                <ChatSystem isDirect user={selectedUser as any} profile={profile} currentUser={user} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface UserCardProps {
  u: UserProfile;
  onOpenChat: () => void;
}

const UserCard: React.FC<UserCardProps> = ({ u, onOpenChat }) => {
  const [msgCount, setMsgCount] = useState(0);

  useEffect(() => {
    const q = collection(db, 'direct_messages', u.uid, 'messages');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMsgCount(snapshot.size);
    });
    return () => unsubscribe();
  }, [u.uid]);

  const isSideOcean = u.displayName?.toLowerCase().includes('side ocean');
  let displayName = u.displayName || 'User';
  
  if (isSideOcean) {
    if (msgCount > 1) {
      displayName = `side ocean (${msgCount - 1})`;
    } else {
      displayName = `side ocean`;
    }
  }

  return (
    <div className="bg-[#5E7162]/30 backdrop-blur-md p-8 rounded-[3rem] border border-white/10 group hover:border-[#E6FF00]/30 transition-all flex flex-col">
      <div className="flex items-center gap-6 mb-8">
        <div className="w-16 h-16 rounded-full bg-[#E6FF00]/10 flex items-center justify-center text-[#E6FF00] text-2xl font-black italic border border-[#E6FF00]/20">
          {u.displayName?.[0] || 'U'}
        </div>
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight">{displayName}</h3>
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{u.email}</p>
        </div>
      </div>
      <button 
        onClick={onOpenChat}
        className="w-full bg-[#E6FF00] text-black py-4 rounded-full font-bold uppercase tracking-widest text-[10px] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
      >
        <MessageCircle size={16} />
        Open Chat
      </button>
    </div>
  );
}
