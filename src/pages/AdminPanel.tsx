import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db, collection, onSnapshot, FirebaseUser, logOut, getDocs } from '../firebase';
import { UserProfile, Project } from '../types';
import { Link } from 'react-router-dom';
import { LogOut, User, LayoutDashboard, FileText, BarChart3, Trash2, Check, X, MessageCircle, TrendingUp, Users, Clock, CheckCircle2, Layout, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import ChatSystem from '../components/ChatSystem';
import { updateProject, deleteAllProjects, deleteAllUsers, getSystemSettings, updateSystemSettings } from '../services/database';
import { APP_NAME, HYPHENATED_NAME } from '../constants';
import { SystemSettings, Attachment, Message as ChatMessage } from '../types';
import Papa from 'papaparse';

import { ADMIN_EMAIL } from '../constants';

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
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const isUserAdmin = profile?.role === 'admin' || user.email === ADMIN_EMAIL;

  if (!isUserAdmin) {
    return (
      <div className="min-h-screen bg-[#4A5D4E] flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-[#5E7162] rounded-[3rem] p-12 border border-red-500/20 shadow-2xl">
          <h2 className="text-4xl font-black tracking-tighter mb-6 uppercase italic text-red-500">Access Denied</h2>
          <p className="text-white/60 mb-10 text-lg font-bold">You do not have administrative privileges to access this panel.</p>
          <Link to="/dashboard" className="inline-block bg-[#E6FF00] text-[#4A5D4E] px-12 py-5 rounded-full font-black text-xl uppercase italic hover:scale-[1.05] active:scale-[0.95] transition-all">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  useEffect(() => {
    const unsubscribeProjects = onSnapshot(collection(db, 'projects'), (snapshot) => {
      setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project)));
    }, (error) => {
      console.error("Admin Projects Snapshot Error:", error);
    });
    const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile)));
    }, (error) => {
      console.error("Admin Users Snapshot Error:", error);
    });
    
    getSystemSettings().then(settings => {
      if (settings) setSystemSettings(settings);
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

  const handleDownloadDescription = (project: Project, format: 'pdf' | 'txt') => {
    const content = `
WebbyLaunch Project Details
EST 2020
--------------------------------------------------

1. PROJECT OVERVIEW (BUSINESS)
Project Number: ${project.id}
Project Name: ${project.websiteName || 'Not Provided'}
Project Phone: ${project.businessNumber || 'Not Provided'}
Project Email: ${project.userEmail || 'Not Provided'}
Project Address: ${project.businessLocation || 'Not Provided'}

2. UI CONFIGURATION
Primary Color: ${project.primaryColor || 'Not Provided'}
Secondary Color: ${project.secondaryColor || 'Not Provided'}
Logo: ${project.logoUrl || 'No Logo Uploaded'}
Documents: ${project.documentsUrl || 'No Documents Uploaded'}

3. DESCRIPTION
Business Name: ${project.businessName || 'Not Provided'}
Description Content: ${project.description || 'Not Provided'}

4. USER PERSONAL DETAILS
Name: ${project.userName || 'Not Provided'}
Email: ${project.userEmail || 'Not Provided'}
Phone: ${project.userPhone || 'Not Provided'}

--------------------------------------------------
Generated on: ${new Date().toLocaleString()}
`;

    if (format === 'txt') {
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Project_${project.id}_Description.txt`;
      link.click();
      URL.revokeObjectURL(url);
    } else {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(22);
      doc.setTextColor(74, 93, 78); // #4A5D4E
      doc.text('WebbyLaunch Project Details', 20, 20);
      doc.setFontSize(12);
      doc.text('EST 2020', 20, 28);
      
      doc.setDrawColor(230, 255, 0); // #E6FF00
      doc.setLineWidth(1);
      doc.line(20, 32, 190, 32);

      // Section 1: Project Overview
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('1. PROJECT OVERVIEW (BUSINESS)', 20, 45);
      doc.setFontSize(10);
      doc.text(`Project Number: ${project.id}`, 25, 55);
      doc.text(`Project Name: ${project.websiteName || 'Not Provided'}`, 25, 62);
      doc.text(`Project Phone: ${project.businessNumber || 'Not Provided'}`, 25, 69);
      doc.text(`Project Email: ${project.userEmail || 'Not Provided'}`, 25, 76);
      doc.text(`Project Address: ${project.businessLocation || 'Not Provided'}`, 25, 83);

      // Section 2: UI Configuration
      doc.setFontSize(16);
      doc.text('2. UI CONFIGURATION', 20, 98);
      doc.setFontSize(10);
      doc.text(`Primary Color: ${project.primaryColor || 'Not Provided'}`, 25, 108);
      doc.text(`Secondary Color: ${project.secondaryColor || 'Not Provided'}`, 25, 115);
      doc.text(`Logo: ${project.logoUrl ? 'Uploaded' : 'No Logo Uploaded'}`, 25, 122);
      if (project.logoUrl) {
        doc.setFontSize(8);
        doc.setTextColor(0, 0, 255);
        doc.text(`Logo URL: ${project.logoUrl}`, 25, 128);
        doc.setTextColor(0, 0, 0);
      }
      doc.setFontSize(10);
      doc.text(`Documents: ${project.documentsUrl ? 'Uploaded' : 'No Documents Uploaded'}`, 25, 135);
      if (project.documentsUrl) {
        doc.setFontSize(8);
        doc.setTextColor(0, 0, 255);
        doc.text(`Docs URL: ${project.documentsUrl}`, 25, 141);
        doc.setTextColor(0, 0, 0);
      }

      // Section 3: Description
      doc.setFontSize(16);
      doc.text('3. DESCRIPTION', 20, 155);
      doc.setFontSize(10);
      doc.text(`Business Name: ${project.businessName || 'Not Provided'}`, 25, 165);
      const splitDescription = doc.splitTextToSize(`Description Content: ${project.description || 'Not Provided'}`, 160);
      doc.text(splitDescription, 25, 172);

      // Section 4: User Personal Details
      const descriptionHeight = splitDescription.length * 5;
      const userSectionY = 172 + descriptionHeight + 10;
      doc.setFontSize(16);
      doc.text('4. USER PERSONAL DETAILS', 20, userSectionY);
      doc.setFontSize(10);
      doc.text(`Name: ${project.userName || 'Not Provided'}`, 25, userSectionY + 10);
      doc.text(`Email: ${project.userEmail || 'Not Provided'}`, 25, userSectionY + 17);
      doc.text(`Phone: ${project.userPhone || 'Not Provided'}`, 25, userSectionY + 24);

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 280);

      doc.save(`Project_${project.id}_Description.pdf`);
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

  const handleUpdatePaymentStatus = async (projectId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'paid' ? 'pending' : 'paid';
      await updateProject(projectId, { paymentStatus: newStatus });
    } catch (error) {
      console.error("Error updating payment status:", error);
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
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <div className="text-[10px] font-bold text-[#E6FF00] uppercase tracking-widest">{p.businessType}</div>
                    <div className="px-2 py-0.5 bg-white/10 rounded text-[8px] font-black text-white/60 uppercase tracking-widest border border-white/5">
                      Template: {p.templateId}
                    </div>
                  </div>
                  <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                    {p.userName} • {p.userEmail} • {p.businessPhone || p.businessNumber}
                  </div>
                  <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">
                    {p.city}, {p.state} • {p.pincode}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <button 
                      onClick={() => handleUpdatePaymentStatus(p.id, p.paymentStatus || 'pending')}
                      className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border transition-all ${
                        p.paymentStatus === 'paid' 
                          ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                          : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                      }`}
                    >
                      Payment: {p.paymentStatus || 'pending'}
                    </button>
                    <div className="px-2 py-0.5 bg-white/10 rounded text-[8px] font-black text-white/60 uppercase tracking-widest border border-white/5">
                      Plan: {p.plan || 'N/A'}
                    </div>
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
        <h2 className="text-6xl font-bold tracking-tighter text-white uppercase italic">Active Operations</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.filter(p => ['Accepted', 'Development Started', 'Completed'].includes(p.status) && !p.isDeleted).map((p) => (
          <div key={p.id} className="bg-[#5E7162]/30 backdrop-blur-md p-8 rounded-[2rem] border border-white/10 group hover:border-[#E6FF00]/30 transition-all relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#E6FF00]/5 rounded-full blur-3xl"></div>
            
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div>
                <h3 className="text-3xl font-bold tracking-tighter text-white mb-1 uppercase italic">{p.businessName}</h3>
                <div className="flex items-center gap-3">
                  <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{p.userName} • {p.userEmail}</div>
                  <button 
                    onClick={() => handleUpdatePaymentStatus(p.id, p.paymentStatus || 'pending')}
                    className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border transition-all ${
                      p.paymentStatus === 'paid' 
                        ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                        : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                    }`}
                  >
                    {p.paymentStatus || 'pending'}
                  </button>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="px-3 py-1 bg-[#E6FF00]/10 rounded-full text-[8px] font-black text-[#E6FF00] uppercase tracking-widest border border-[#E6FF00]/20">
                    {p.status}
                  </div>
                  <div className="text-[8px] font-bold text-white/30 uppercase tracking-widest">
                    {p.businessPhone || p.businessNumber} • {p.city}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="relative group/download">
                  <button 
                    className="p-4 bg-white/5 rounded-full text-[#E6FF00] hover:bg-[#E6FF00] hover:text-black transition-all shadow-lg"
                    title="Download Description"
                  >
                    <Download size={20} />
                  </button>
                  <div className="absolute bottom-full right-0 mb-2 hidden group-hover/download:flex flex-col bg-[#5E7162] border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50 min-w-[140px]">
                    <button 
                      onClick={() => handleDownloadDescription(p, 'pdf')}
                      className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 text-left"
                    >
                      PDF Format
                    </button>
                    <button 
                      onClick={() => handleDownloadDescription(p, 'txt')}
                      className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 text-left border-t border-white/5"
                    >
                      Text Format
                    </button>
                  </div>
                </div>
                <button 
                  onClick={() => { setSelectedProject(p); setShowChat(true); }}
                  className="p-4 bg-white/5 rounded-full text-white hover:bg-[#E6FF00] hover:text-black transition-all shadow-lg"
                  title="Project Chat"
                >
                  <MessageCircle size={20} />
                </button>
              </div>
            </div>
            
            <div className="mb-10 relative z-10">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-3">
                <span>Current Progress</span>
                <span className="text-[#E6FF00]">{p.progress}%</span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${p.progress}%` }}
                  className="h-full bg-[#E6FF00] rounded-full shadow-[0_0_10px_rgba(230,255,0,0.3)]" 
                />
              </div>
            </div>

            <div className="flex gap-3 relative z-10">
              <button 
                onClick={() => { setSelectedProject(p); setNewProgress(p.progress); setShowProgressModal(true); }}
                className="flex-1 bg-white text-black py-4 rounded-full font-black hover:scale-[1.02] active:scale-[0.98] transition-all text-[10px] uppercase tracking-widest shadow-xl"
              >
                Update Progress
              </button>
              <button 
                onClick={() => { setSelectedProject(p); setShowRejectModal(true); }}
                className="px-6 border border-red-500/30 text-red-400 py-4 rounded-full font-black hover:bg-red-500 hover:text-white transition-all text-[10px] uppercase tracking-widest"
              >
                Terminate
              </button>
            </div>
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
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-[#E6FF00] uppercase tracking-[0.3em]">Communications</span>
          <h2 className="text-6xl font-bold tracking-tighter text-white">MESSAGE CENTER</h2>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => downloadMessageReport('csv')}
            className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2"
          >
            <Download size={14} /> CSV Report
          </button>
          <button 
            onClick={() => downloadMessageReport('pdf')}
            className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2"
          >
            <Download size={14} /> PDF Report
          </button>
        </div>
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
      await deleteAllUsers();
      setShowResetModal(false);
      setActiveTab('dashboard');
    } catch (error) {
      console.error("Reset failed:", error);
    } finally {
      setIsResetting(false);
    }
  };

  const handleUpdateSettings = async (updates: Partial<SystemSettings>) => {
    if (!systemSettings) return;
    setIsSavingSettings(true);
    try {
      const newSettings = { ...systemSettings, ...updates };
      await updateSystemSettings(updates);
      setSystemSettings(newSettings);
    } catch (error) {
      console.error("Failed to update settings:", error);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const downloadMessageReport = async (type: 'csv' | 'pdf') => {
    const allMessages: any[] = [];
    
    for (const project of projects) {
      const msgsSnap = await getDocs(collection(db, 'projects', project.id, 'messages'));
      msgsSnap.forEach(doc => {
        const data = doc.data();
        allMessages.push({
          type: 'Project',
          context: project.businessName,
          sender: data.senderName,
          text: data.text,
          date: data.createdAt?.toDate?.()?.toLocaleString() || 'N/A',
          attachments: data.attachments?.map((a: any) => a.name).join(', ') || 'None'
        });
      });
    }

    if (type === 'csv') {
      const csv = Papa.unparse(allMessages);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Message_Report_${new Date().toISOString()}.csv`;
      link.click();
    } else {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text('Message Report', 20, 20);
      doc.setFontSize(10);
      
      let y = 30;
      allMessages.forEach((m, i) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.text(`${m.date} - ${m.sender} (${m.type}: ${m.context})`, 20, y);
        const splitText = doc.splitTextToSize(m.text || '[No Text]', 160);
        doc.text(splitText, 25, y + 5);
        y += 10 + (splitText.length * 5);
      });
      
      doc.save(`Message_Report_${new Date().toISOString()}.pdf`);
    }
  };

  const renderSystem = () => (
    <div className="space-y-12">
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-bold text-[#E6FF00] uppercase tracking-[0.3em]">Configuration</span>
        <h2 className="text-6xl font-bold tracking-tighter text-white">SYSTEM SETTINGS</h2>
      </div>

      {systemSettings && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-[#5E7162]/30 backdrop-blur-md p-10 rounded-[3rem] border border-white/10">
            <h3 className="text-2xl font-bold text-white tracking-tight mb-8">Required Registration Fields</h3>
            <div className="space-y-4">
              {Object.entries(systemSettings.requiredFields).map(([field, isRequired]) => (
                <div key={field} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                  <span className="text-xs font-bold text-white/60 uppercase tracking-widest">{field.replace(/([A-Z])/g, ' $1')}</span>
                  <button 
                    onClick={() => handleUpdateSettings({
                      requiredFields: { ...systemSettings.requiredFields, [field as keyof SystemSettings['requiredFields']]: !isRequired }
                    })}
                    className={`w-12 h-6 rounded-full transition-all relative ${isRequired ? 'bg-[#E6FF00]' : 'bg-white/10'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isRequired ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-[#5E7162]/30 backdrop-blur-md p-10 rounded-[3rem] border border-white/10">
              <h3 className="text-2xl font-bold text-white tracking-tight mb-8">Notifications</h3>
              <div className="space-y-4">
                {Object.entries(systemSettings.notifications).map(([key, enabled]) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                    <span className="text-xs font-bold text-white/60 uppercase tracking-widest">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <button 
                      onClick={() => handleUpdateSettings({
                        notifications: { ...systemSettings.notifications, [key as keyof SystemSettings['notifications']]: !enabled }
                      })}
                      className={`w-12 h-6 rounded-full transition-all relative ${enabled ? 'bg-[#E6FF00]' : 'bg-white/10'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${enabled ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-red-500/10 backdrop-blur-md p-10 rounded-[3rem] border border-red-500/20">
              <h3 className="text-2xl font-bold text-white tracking-tight mb-4">Danger Zone</h3>
              <div className="space-y-4">
                <button 
                  onClick={() => setShowResetModal(true)}
                  className="w-full py-5 bg-red-600 text-white rounded-full font-bold uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
                >
                  Wipe All Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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
                <ChatSystem 
                  projectId={selectedProject.id} 
                  profile={profile} 
                  currentUser={user} 
                  onClose={() => setShowChat(false)} 
                  recipientUser={{ uid: selectedProject.userId, displayName: selectedProject.userName }}
                />
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
                <ChatSystem 
                  isDirect 
                  recipientUser={selectedUser as any} 
                  profile={profile} 
                  currentUser={user} 
                  onClose={() => setShowDirectChat(false)}
                />
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
