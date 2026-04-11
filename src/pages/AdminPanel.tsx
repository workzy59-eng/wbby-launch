import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db, collection, onSnapshot, FirebaseUser, logOut, getDocs, addDoc, query, where } from '../firebase';
import { UserProfile, Project, ProjectStatus } from '../types';
import { Link } from 'react-router-dom';
import { 
  LogOut, 
  User, 
  LayoutDashboard, 
  FileText, 
  BarChart3, 
  Trash2, 
  Check, 
  X, 
  MessageCircle, 
  TrendingUp, 
  Users, 
  Clock, 
  CheckCircle2, 
  Layout,
  FolderKanban,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Calendar,
  DollarSign,
  Edit2,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Settings,
  Bell,
  CheckCheck,
  Camera,
  MoreVertical
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import ChatSystem from '../components/ChatSystem';
import { updateProject, deleteAllProjects, deleteAllUsers, getSystemSettings, updateSystemSettings, getConversationId, getProjects, getConversations } from '../services/database';
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
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'requests' | 'active' | 'projects' | 'analytics' | 'messages' | 'recycle' | 'system'>('dashboard');

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showProjectDetailModal, setShowProjectDetailModal] = useState(false);
  const [editingProjectDetails, setEditingProjectDetails] = useState<Project | null>(null);
  const [viewingProject, setViewingProject] = useState<Project | null>(null);
  const [modalTab, setModalTab] = useState<'overview' | 'inputs'>('overview');
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [reasonToShow, setReasonToShow] = useState('');
  const [projectSearch, setProjectSearch] = useState('');
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [userUnreadCounts, setUserUnreadCounts] = useState<Record<string, number>>({});
  const [projectUnreadCounts, setProjectUnreadCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const directTotal = Object.values(userUnreadCounts).reduce((acc, count) => acc + count, 0);
    const projectTotal = Object.values(projectUnreadCounts).reduce((acc, count) => acc + count, 0);
    setUnreadTotal(directTotal + projectTotal);
  }, [userUnreadCounts, projectUnreadCounts]);

  useEffect(() => {
    // Listen to all projects for unread counts
    const unsub = getProjects((projectsData) => {
      const counts: Record<string, number> = {};
      projectsData.forEach(p => {
        if (p.unreadCount && p.unreadCount['admin']) {
          counts[p.id] = p.unreadCount['admin'];
        }
      });
      setProjectUnreadCounts(counts);
    });
    return () => unsub();
  }, []);

  const updateUnreadCount = (userId: string, count: number) => {
    setUserUnreadCounts(prev => ({ ...prev, [userId]: count }));
  };
  const [projectStatusFilter, setProjectStatusFilter] = useState<ProjectStatus | 'all'>('all');
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
      <div className="min-h-screen bg-black flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white/5 backdrop-blur-xl rounded-[3rem] p-12 border border-red-500/20 shadow-2xl">
          <h2 className="text-4xl font-black tracking-tighter mb-6 uppercase italic text-red-500">Access Denied</h2>
          <p className="text-white/60 mb-10 text-lg font-bold">You do not have administrative privileges to access this panel.</p>
          <Link to="/dashboard" className="inline-block bg-white text-black px-12 py-5 rounded-full font-black text-xl uppercase italic hover:scale-[1.05] active:scale-[0.95] transition-all">
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

    const unsubscribeConversations = getConversations(user.uid, (convs) => {
      setConversations(convs);
    });
    
    getSystemSettings().then(settings => {
      if (settings) setSystemSettings(settings);
    });

    return () => {
      unsubscribeProjects();
      unsubscribeUsers();
      unsubscribeConversations();
    };
  }, [user.uid]);

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
          status: status as ProjectStatus
        });
        setShowProgressModal(false);
        setSelectedProject(null);
      } catch (error) {
        console.error("Error updating progress:", error);
      }
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await updateProject(projectId, { isDeleted: true });
      } catch (error) {
        console.error("Error deleting project:", error);
      }
    }
  };

  const handleSaveProject = async (projectData: Partial<Project>) => {
    try {
      if (editingProjectDetails) {
        await updateProject(editingProjectDetails.id, projectData);
      } else {
        const newProject = {
          ...projectData,
          createdAt: new Date().toISOString(),
          status: projectData.status || 'Waiting for Review',
          progress: projectData.progress || 0,
          isLocked: false,
          isDeleted: false
        };
        await addDoc(collection(db, 'projects'), newProject);
      }
      setShowProjectModal(false);
      setEditingProjectDetails(null);
    } catch (error) {
      console.error("Error saving project:", error);
    }
  };

  const handleDownloadDescription = (project: Project, format: 'pdf' | 'txt') => {
    const content = `
QUICWEB Project Details
EST 2026
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
      doc.setTextColor(0, 0, 0);
      doc.text('QUICWEB Project Details', 20, 20);
      doc.setFontSize(12);
      doc.text('EST 2026', 20, 28);
      
      doc.setDrawColor(0, 0, 0);
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
          rejectionReason: rejectionReason,
          isDeleted: true
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
        {projects.filter(p => (p.status === 'Waiting for Review' || p.status === 'Rejected') && !p.isDeleted).map((p) => (
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
                    <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${
                      p.status === 'Rejected' 
                        ? 'bg-red-500/20 text-red-400 border-red-500/30' 
                        : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                    }`}>
                      Status: {p.status}
                    </div>
                    {p.status === 'Rejected' && (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center text-red-500 border border-red-500/30">
                          <X size={12} strokeWidth={3} />
                        </div>
                        <button 
                          onClick={() => { setReasonToShow(p.rejectionReason || 'No reason provided.'); setShowReasonModal(true); }}
                          className="text-[8px] font-black text-red-400 uppercase tracking-widest hover:underline"
                        >
                          View Reason
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => { setViewingProject(p); setShowProjectDetailModal(true); }}
                  className="p-4 bg-white/5 rounded-full text-[#E6FF00] hover:bg-[#E6FF00] hover:text-black transition-all"
                  title="View Details"
                >
                  <ArrowRight size={20} />
                </button>
                <button 
                  onClick={() => { setSelectedProject(p); setShowChat(true); }}
                  className="p-4 bg-white/5 rounded-full text-white hover:bg-[#E6FF00] hover:text-black transition-all"
                >
                  <MessageCircle size={20} />
                </button>
              </div>
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
                <button 
                  onClick={() => { setViewingProject(p); setShowProjectDetailModal(true); }}
                  className="p-4 bg-white/5 rounded-full text-[#E6FF00] hover:bg-[#E6FF00] hover:text-black transition-all shadow-lg"
                  title="View Details"
                >
                  <ArrowRight size={20} />
                </button>
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
            <p className="text-xs text-white/40 uppercase tracking-widest mt-1">Users Visited Per Day</p>
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

  const renderProjectDetails = () => {
    const filteredProjects = projects.filter(p => {
      const matchesSearch = p.businessName.toLowerCase().includes(projectSearch.toLowerCase()) || 
                           p.userName.toLowerCase().includes(projectSearch.toLowerCase());
      const matchesStatus = projectStatusFilter === 'all' || p.status === projectStatusFilter;
      return matchesSearch && matchesStatus && !p.isDeleted;
    });

    return (
      <div className="space-y-12">
        <div className="flex justify-between items-end">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-[#E6FF00] uppercase tracking-[0.3em]">Management</span>
            <h2 className="text-6xl font-bold tracking-tighter text-white uppercase italic">Project Details</h2>
          </div>
          <button 
            onClick={() => { setEditingProjectDetails(null); setShowProjectModal(true); }}
            className="px-8 py-4 bg-[#E6FF00] text-black rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-[0_0_30px_rgba(230,255,0,0.2)]"
          >
            <Plus size={18} />
            Add New Project
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={20} />
            <input 
              type="text" 
              placeholder="Search by project or user name..."
              value={projectSearch}
              onChange={(e) => setProjectSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-16 pr-6 text-white font-bold uppercase tracking-widest outline-none focus:border-[#E6FF00]/50 transition-all placeholder:text-white/10"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={20} />
            <select 
              value={projectStatusFilter}
              onChange={(e) => setProjectStatusFilter(e.target.value as any)}
              className="appearance-none bg-white/5 border border-white/10 rounded-2xl py-5 pl-16 pr-12 text-white font-bold uppercase tracking-widest outline-none focus:border-[#E6FF00]/50 transition-all"
            >
              <option value="all">All Status</option>
              <option value="Waiting for Review">Waiting for Review</option>
              <option value="Under Review">Under Review</option>
              <option value="Accepted">Accepted</option>
              <option value="Development Started">Development Started</option>
              <option value="Completed">Completed</option>
              <option value="Rejected">Rejected</option>
            </select>
            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" size={20} />
          </div>
        </div>

        {/* Projects Table */}
        <div className="bg-[#5E7162]/30 backdrop-blur-md rounded-[3rem] border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="p-8 text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Project</th>
                  <th className="p-8 text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Status</th>
                  <th className="p-8 text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Client</th>
                  <th className="p-8 text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Type & Plan</th>
                  <th className="p-8 text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Timeline</th>
                  <th className="p-8 text-[10px] font-black text-white/40 uppercase tracking-[0.3em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((p) => (
                  <tr key={p.id} className="border-b border-white/5 group hover:bg-white/5 transition-all">
                    <td className="p-8">
                      <div className="flex flex-col">
                        <span className="text-lg font-bold text-white tracking-tight uppercase italic">{p.businessName}</span>
                        <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1 truncate max-w-[200px]">{p.description}</span>
                      </div>
                    </td>
                    <td className="p-8">
                      <div className={`inline-flex px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                        p.status === 'Completed' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                        p.status === 'Development Started' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                        p.status === 'Rejected' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                        'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                      }`}>
                        {p.status}
                      </div>
                    </td>
                    <td className="p-8">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white uppercase">{p.userName}</span>
                        <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1">{p.userEmail}</span>
                      </div>
                    </td>
                    <td className="p-8">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white uppercase italic tracking-tighter">{p.businessType}</span>
                        <span className="text-[10px] font-black text-[#E6FF00] uppercase tracking-widest mt-1">{p.plan || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="p-8">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-[8px] font-bold text-white/40 uppercase tracking-widest">
                          <Calendar size={10} />
                          <span>Start: {p.startDate ? new Date(p.startDate as any).toLocaleDateString() : 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[8px] font-bold text-[#E6FF00] uppercase tracking-widest">
                          <Clock size={10} />
                          <span>End: {p.deadline ? new Date(p.deadline as any).toLocaleDateString() : 'N/A'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-8 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => { setViewingProject(p); setModalTab('overview'); setShowProjectDetailModal(true); }}
                          className="p-3 bg-white/5 rounded-xl text-white/40 hover:bg-[#E6FF00] hover:text-black transition-all"
                          title="View Details"
                        >
                          <ArrowRight size={16} />
                        </button>
                        <button 
                          onClick={() => { setEditingProjectDetails(p); setShowProjectModal(true); }}
                          className="p-3 bg-white/5 rounded-xl text-white/40 hover:bg-[#E6FF00] hover:text-black transition-all"
                          title="Edit Project"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteProject(p.id)}
                          className="p-3 bg-white/5 rounded-xl text-white/40 hover:bg-red-500 hover:text-white transition-all"
                          title="Delete Project"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredProjects.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-32 text-center">
                      <div className="text-white/20 text-sm font-bold uppercase tracking-[0.5em]">No projects found</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

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

  const [userSearch, setUserSearch] = useState('');
  const [messageFilter, setMessageFilter] = useState<'all' | 'unread' | 'favourites'>('all');

  const renderMessages = () => {
    // Filter conversations based on user search
    const filteredConversations = conversations.filter(conv => {
      const otherParticipantId = conv.participants.find((id: string) => id !== user.uid);
      const otherUser = users.find(u => u.uid === otherParticipantId);
      
      const searchMatch = !userSearch || (
        otherUser?.displayName?.toLowerCase().includes(userSearch.toLowerCase()) || 
        otherUser?.email?.toLowerCase().includes(userSearch.toLowerCase())
      );

      if (messageFilter === 'unread') {
        return searchMatch && (conv.unreadCount?.[user.uid] > 0);
      }

      return searchMatch;
    });

    // Sort by last message time
    const sortedConversations = [...filteredConversations].sort((a, b) => {
      const timeA = a.lastMessageAt?.toMillis() || 0;
      const timeB = b.lastMessageAt?.toMillis() || 0;
      return timeB - timeA;
    });

    return (
      <div className="h-full flex flex-col bg-[#0B141A] rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl">
        {/* WhatsApp Header */}
        <div className="p-6 flex items-center justify-between bg-[#202C33]">
          <h2 className="text-2xl font-bold text-[#E9EDEF]">Chats</h2>
          <div className="flex items-center gap-6 text-[#8696A0]">
            <MoreVertical className="cursor-pointer hover:text-white transition-colors" size={24} />
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8696A0]" size={18} />
            <input 
              type="text"
              placeholder="Search or start a new chat"
              className="w-full bg-[#202C33] border-none rounded-xl py-2 pl-12 pr-4 text-sm text-[#E9EDEF] outline-none focus:ring-1 focus:ring-[#00A884] transition-all placeholder:text-[#8696A0]"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="px-3 pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {[
            { id: 'all', label: 'All' },
            { id: 'unread', label: unreadTotal > 0 ? `Unread ${unreadTotal}` : 'Unread' },
            { id: 'favourites', label: 'Favourites' }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setMessageFilter(f.id as any)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                messageFilter === f.id 
                  ? 'bg-[#00A884]/20 text-[#00A884]' 
                  : 'bg-[#202C33] text-[#8696A0] hover:bg-[#2A3942]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#0B141A]">
          {sortedConversations.length > 0 ? (
            sortedConversations.map((conv) => {
              const otherParticipantId = conv.participants.find((id: string) => id !== user.uid);
              const otherUser = users.find(u => u.uid === otherParticipantId);
              
              if (!otherUser) return null;

              return (
                <UserCard 
                  key={conv.id} 
                  u={otherUser} 
                  adminId={user.uid}
                  conversation={conv}
                  onOpenChat={() => { setSelectedUser(otherUser); setShowDirectChat(true); }} 
                  onUnreadUpdate={(count) => updateUnreadCount(otherUser.uid, count)}
                />
              );
            })
          ) : (
            <div className="py-20 text-center space-y-4">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                <MessageCircle className="text-white/10" size={40} />
              </div>
              <p className="text-white/40 text-sm font-bold uppercase tracking-widest">No conversations found</p>
            </div>
          )}
        </div>
      </div>
    );
  };

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
    <div className="space-y-12 pb-20">
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-bold text-[#E6FF00] uppercase tracking-[0.3em]">Configuration</span>
        <h2 className="text-6xl font-bold tracking-tighter text-white uppercase italic">SYSTEM SETTINGS</h2>
        <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-2 italic">Global platform configuration and pricing management.</p>
      </div>
 
      {systemSettings && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column */}
          <div className="space-y-12">
            {/* Pricing Section */}
            <div className="bg-[#5E7162]/30 backdrop-blur-md p-10 rounded-[3rem] border border-white/10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-[#E6FF00]/10 rounded-2xl flex items-center justify-center text-[#E6FF00]">
                  <TrendingUp size={24} />
                </div>
                <h3 className="text-2xl font-bold text-white tracking-tight uppercase italic">Pricing Configuration</h3>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-4 italic">Starter Launch Price</label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[#E6FF00] font-black">$</span>
                    <input 
                      type="number"
                      value={systemSettings.pricing?.starter || 1499}
                      onChange={(e) => handleUpdateSettings({ pricing: { ...systemSettings.pricing!, starter: parseInt(e.target.value) } })}
                      className="w-full p-6 pl-12 rounded-2xl bg-black/20 border border-white/10 text-white focus:outline-none focus:border-[#E6FF00]/50 font-black text-xl"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-4 italic">Pro Growth Price</label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[#E6FF00] font-black">$</span>
                    <input 
                      type="number"
                      value={systemSettings.pricing?.pro || 2999}
                      onChange={(e) => handleUpdateSettings({ pricing: { ...systemSettings.pricing!, pro: parseInt(e.target.value) } })}
                      className="w-full p-6 pl-12 rounded-2xl bg-black/20 border border-white/10 text-white focus:outline-none focus:border-[#E6FF00]/50 font-black text-xl"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-4 italic">Enterprise Price</label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[#E6FF00] font-black">$</span>
                    <input 
                      type="number"
                      value={systemSettings.pricing?.enterprise || 9999}
                      onChange={(e) => handleUpdateSettings({ pricing: { ...systemSettings.pricing!, enterprise: parseInt(e.target.value) } })}
                      className="w-full p-6 pl-12 rounded-2xl bg-black/20 border border-white/10 text-white focus:outline-none focus:border-[#E6FF00]/50 font-black text-xl"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Required Fields */}
            <div className="bg-[#5E7162]/30 backdrop-blur-md p-10 rounded-[3rem] border border-white/10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-[#E6FF00]/10 rounded-2xl flex items-center justify-center text-[#E6FF00]">
                  <FileText size={24} />
                </div>
                <h3 className="text-2xl font-bold text-white tracking-tight uppercase italic">Registration Fields</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(systemSettings.requiredFields).map(([field, isRequired]) => (
                  <div key={field} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                    <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">{field.replace(/([A-Z])/g, ' $1')}</span>
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
          </div>
 
          {/* Right Column */}
          <div className="space-y-12">
            {/* Global Switches */}
            <div className="bg-[#5E7162]/30 backdrop-blur-md p-10 rounded-[3rem] border border-white/10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-[#E6FF00]/10 rounded-2xl flex items-center justify-center text-[#E6FF00]">
                  <Settings size={24} />
                </div>
                <h3 className="text-2xl font-bold text-white tracking-tight uppercase italic">Platform Controls</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5">
                  <div>
                    <span className="text-xs font-black text-white uppercase tracking-widest">Maintenance Mode</span>
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">Locks the platform for all non-admin users.</p>
                  </div>
                  <button 
                    onClick={() => handleUpdateSettings({ maintenanceMode: !systemSettings.maintenanceMode })}
                    className={`w-14 h-7 rounded-full transition-all relative ${systemSettings.maintenanceMode ? 'bg-red-500' : 'bg-white/10'}`}
                  >
                    <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${systemSettings.maintenanceMode ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5">
                  <div>
                    <span className="text-xs font-black text-white uppercase tracking-widest">New Registrations</span>
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">Allow or block new user signups.</p>
                  </div>
                  <button 
                    onClick={() => handleUpdateSettings({ allowNewRegistrations: !systemSettings.allowNewRegistrations })}
                    className={`w-14 h-7 rounded-full transition-all relative ${systemSettings.allowNewRegistrations ? 'bg-[#E6FF00]' : 'bg-white/10'}`}
                  >
                    <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${systemSettings.allowNewRegistrations ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-[#5E7162]/30 backdrop-blur-md p-10 rounded-[3rem] border border-white/10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-[#E6FF00]/10 rounded-2xl flex items-center justify-center text-[#E6FF00]">
                  <Bell size={24} />
                </div>
                <h3 className="text-2xl font-bold text-white tracking-tight uppercase italic">Admin Notifications</h3>
              </div>
              <div className="space-y-4">
                {Object.entries(systemSettings.notifications).map(([key, enabled]) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                    <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">{key.replace(/([A-Z])/g, ' $1')}</span>
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
 
            {/* Danger Zone */}
            <div className="bg-red-500/10 backdrop-blur-md p-10 rounded-[3rem] border border-red-500/20">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-red-500/20 rounded-2xl flex items-center justify-center text-red-500">
                  <Trash2 size={24} />
                </div>
                <h3 className="text-2xl font-bold text-white tracking-tight uppercase italic">Danger Zone</h3>
              </div>
              <p className="text-xs text-white/40 font-bold uppercase tracking-widest mb-8 italic">Actions here are permanent and cannot be undone. Use with extreme caution.</p>
              <button 
                onClick={() => setShowResetModal(true)}
                className="w-full py-6 bg-red-600 text-white rounded-full font-black uppercase italic tracking-[0.2em] hover:bg-red-700 transition-all shadow-2xl shadow-red-600/20"
              >
                Wipe All Platform Data
              </button>
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
        <div className="p-10 border-b border-white/5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="px-2 py-0.5 bg-[#E6FF00] rounded flex items-center justify-center">
                <span className="text-black font-black text-[8px] tracking-tighter">{HYPHENATED_NAME}</span>
              </div>
              <div className="text-2xl font-bold tracking-tighter text-white">{APP_NAME}</div>
            </div>
            <div className="text-[10px] font-bold text-[#E6FF00] uppercase tracking-[0.4em] mt-2">Admin Panel</div>
          </div>
        </div>
        <nav className="flex-1 p-6 space-y-3">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'requests', label: 'Requests', icon: FileText },
            { id: 'active', label: 'Active Projects', icon: Check },
            { id: 'projects', label: 'Project Details', icon: FolderKanban },
            { id: 'messages', label: unreadTotal > 0 ? `Messages (${unreadTotal})` : 'Messages', icon: MessageCircle },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'system', label: 'System Settings', icon: Settings },
            { id: 'recycle', label: 'Recycle Bin', icon: Trash2 },
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
            to="/settings"
            className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest text-white/40 hover:bg-white/5 hover:text-white transition-all"
          >
            <Settings size={18} />
            Platform Settings
          </Link>
          {[
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
            {activeTab === 'projects' && renderProjectDetails()}
            {activeTab === 'analytics' && renderAnalytics()}
            {activeTab === 'messages' && renderMessages()}
            {activeTab === 'notifications' && renderNotifications()}
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
              className="relative w-full max-w-xl bg-[#0F172A] h-full shadow-2xl flex flex-col border-l border-white/5"
            >
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5 backdrop-blur-md">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#E6FF00] to-yellow-600 flex items-center justify-center text-black font-black text-lg">
                      {selectedUser.displayName?.[0] || 'U'}
                    </div>
                    <div className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-[#0F172A] rounded-full ${
                      selectedUser.status === 'online' ? 'bg-green-500' : 'bg-gray-500'
                    }`}></div>
                  </div>
                  <div>
                    <h3 className="font-black text-white uppercase tracking-tight">{selectedUser.displayName}</h3>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${selectedUser.status === 'online' ? 'text-green-400' : 'text-white/30'}`}>
                      {selectedUser.status === 'online' ? 'Active Now' : 'Offline'}
                    </p>
                  </div>
                </div>
                <button onClick={() => setShowDirectChat(false)} className="p-3 hover:bg-white/5 rounded-xl text-white/40 hover:text-white transition-all">
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

      {/* Project Detail Modal */}
      <AnimatePresence>
        {showProjectDetailModal && viewingProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md" 
              onClick={() => setShowProjectDetailModal(false)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-[#5E7162] rounded-[3rem] p-12 max-w-4xl w-full shadow-2xl border border-white/10 overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-start mb-10">
                <div>
                  <h3 className="text-5xl font-bold tracking-tighter text-white uppercase italic">{viewingProject.businessName}</h3>
                  <div className="text-[10px] font-bold text-[#E6FF00] uppercase tracking-[0.4em] mt-2">Project Details</div>
                </div>
                <button onClick={() => setShowProjectDetailModal(false)} className="p-4 hover:bg-white/5 rounded-full text-white transition-all">
                  <X size={24} />
                </button>
              </div>

              {/* Tab Switcher */}
              <div className="flex gap-4 mb-10 border-b border-white/5 pb-4">
                <button 
                  onClick={() => setModalTab('overview')}
                  className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${modalTab === 'overview' ? 'bg-[#E6FF00] text-black' : 'text-white/40 hover:text-white'}`}
                >
                  Overview
                </button>
                <button 
                  onClick={() => setModalTab('inputs')}
                  className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${modalTab === 'inputs' ? 'bg-[#E6FF00] text-black' : 'text-white/40 hover:text-white'}`}
                >
                  User Inputs
                </button>
              </div>

              {modalTab === 'overview' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <section>
                      <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-4 italic">Client Information</h4>
                      <div className="bg-black/20 p-6 rounded-3xl border border-white/5 space-y-4">
                        <div className="flex justify-between">
                          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Name</span>
                          <span className="text-xs font-bold text-white uppercase">{viewingProject.userName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Email</span>
                          <span className="text-xs font-bold text-white uppercase">{viewingProject.userEmail}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Phone</span>
                          <span className="text-xs font-bold text-white uppercase">{viewingProject.userPhone || 'N/A'}</span>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-4 italic">Project Overview</h4>
                      <div className="bg-black/20 p-6 rounded-3xl border border-white/5 space-y-4">
                        <div className="flex justify-between">
                          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Type</span>
                          <span className="text-xs font-bold text-white uppercase">{viewingProject.businessType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Plan</span>
                          <span className="text-xs font-bold text-[#E6FF00] uppercase">{viewingProject.plan || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Status</span>
                          <span className="text-xs font-bold text-white uppercase">{viewingProject.status}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Progress</span>
                          <span className="text-xs font-bold text-white uppercase">{viewingProject.progress}%</span>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-4 italic">Domain Preferences</h4>
                      <div className="bg-[#E6FF00]/5 p-6 rounded-3xl border border-[#E6FF00]/10 space-y-3">
                        {[0, 1, 2].map((idx) => (
                          <div key={idx} className="flex justify-between items-center">
                            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">
                              {idx === 0 ? '1st' : idx === 1 ? '2nd' : '3rd'} Preference
                            </span>
                            <span className={`text-[10px] font-black uppercase italic ${idx === 0 ? 'text-[#E6FF00]' : 'text-white/60'}`}>
                              {viewingProject.domainPreferences?.[idx] || (idx === 0 && viewingProject.domain ? viewingProject.domain : 'N/A')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section>
                      <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-4 italic">Timeline</h4>
                      <div className="bg-black/20 p-6 rounded-3xl border border-white/5 space-y-4">
                        <div className="flex justify-between">
                          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Start Date</span>
                          <span className="text-xs font-bold text-white uppercase">{viewingProject.startDate ? new Date(viewingProject.startDate as any).toLocaleDateString() : 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Deadline</span>
                          <span className="text-xs font-bold text-red-400 uppercase">{viewingProject.deadline ? new Date(viewingProject.deadline as any).toLocaleDateString() : 'N/A'}</span>
                        </div>
                      </div>
                    </section>
                  </div>

                  <div className="space-y-8">
                    <section>
                      <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-4 italic">Business Details</h4>
                      <div className="bg-black/20 p-6 rounded-3xl border border-white/5 space-y-4">
                        <div className="flex justify-between">
                          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Business Name</span>
                          <span className="text-xs font-bold text-white uppercase">{viewingProject.businessName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Business Phone</span>
                          <span className="text-xs font-bold text-white uppercase">{viewingProject.businessPhone || viewingProject.businessNumber || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Location</span>
                          <span className="text-xs font-bold text-white uppercase">{viewingProject.businessLocation || 'N/A'}</span>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-4 italic">Description</h4>
                      <div className="bg-black/20 p-6 rounded-3xl border border-white/5">
                        <p className="text-xs font-medium text-white/70 leading-relaxed">{viewingProject.description}</p>
                      </div>
                    </section>

                    <section>
                      <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-4 italic">Internal Notes</h4>
                      <div className="bg-[#E6FF00]/5 p-6 rounded-3xl border border-[#E6FF00]/10">
                        <p className="text-xs font-medium text-[#E6FF00]/70 leading-relaxed italic">{viewingProject.internalNotes || 'No internal notes added.'}</p>
                      </div>
                    </section>

                    <section>
                      <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-4 italic">Files & Assets</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {viewingProject.logoUrl && (
                          <a href={viewingProject.logoUrl} target="_blank" rel="noreferrer" className="bg-black/20 p-4 rounded-2xl border border-white/5 flex flex-col items-center gap-2 hover:bg-white/5 transition-all">
                            <FileText size={24} className="text-[#E6FF00]" />
                            <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Logo</span>
                          </a>
                        )}
                        {viewingProject.documentsUrl && (
                          <a href={viewingProject.documentsUrl} target="_blank" rel="noreferrer" className="bg-black/20 p-4 rounded-2xl border border-white/5 flex flex-col items-center gap-2 hover:bg-white/5 transition-all">
                            <FileText size={24} className="text-[#00F2FF]" />
                            <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Documents</span>
                          </a>
                        )}
                      </div>
                    </section>
                  </div>
                </div>
              ) : (
                <div className="space-y-12">
                  <section>
                    <h4 className="text-[10px] font-black text-[#E6FF00] uppercase tracking-[0.4em] mb-6 italic">Personal Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-black/30 p-8 rounded-3xl border border-white/5 flex flex-col gap-2">
                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">User Name</span>
                        <span className="text-2xl font-black text-white uppercase italic tracking-tighter">{viewingProject.userName}</span>
                      </div>
                      <div className="bg-black/30 p-8 rounded-3xl border border-white/5 flex flex-col gap-2">
                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">User Phone</span>
                        <span className="text-2xl font-black text-white uppercase italic tracking-tighter">{viewingProject.userPhone || 'Not Provided'}</span>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h4 className="text-[10px] font-black text-[#E6FF00] uppercase tracking-[0.4em] mb-6 italic">Business Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-black/30 p-8 rounded-3xl border border-white/5 flex flex-col gap-2">
                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Business Name</span>
                        <span className="text-2xl font-black text-white uppercase italic tracking-tighter">{viewingProject.businessName}</span>
                      </div>
                      <div className="bg-black/30 p-8 rounded-3xl border border-white/5 flex flex-col gap-2">
                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Business Phone</span>
                        <span className="text-2xl font-black text-white uppercase italic tracking-tighter">{viewingProject.businessPhone || viewingProject.businessNumber || 'Not Provided'}</span>
                      </div>
                      <div className="md:col-span-2 bg-black/30 p-8 rounded-3xl border border-white/5 flex flex-col gap-2">
                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Business Address (Location)</span>
                        <span className="text-2xl font-black text-white uppercase italic tracking-tighter">{viewingProject.businessLocation || 'Not Provided'}</span>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h4 className="text-[10px] font-black text-[#E6FF00] uppercase tracking-[0.4em] mb-6 italic">Domain Preferences</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[0, 1, 2].map((idx) => (
                        <div 
                          key={idx} 
                          className={`p-8 rounded-3xl border transition-all flex flex-col gap-2 ${
                            idx === 0 
                              ? 'bg-[#E6FF00]/10 border-[#E6FF00]/30 shadow-[0_0_30px_rgba(230,255,0,0.1)]' 
                              : 'bg-black/30 border-white/5'
                          }`}
                        >
                          <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                            {idx === 0 ? '1st' : idx === 1 ? '2nd' : '3rd'} Preference
                          </div>
                          <div className={`text-xl font-black uppercase italic tracking-tighter ${idx === 0 ? 'text-[#E6FF00]' : 'text-white'}`}>
                            {viewingProject.domainPreferences?.[idx] || (idx === 0 && viewingProject.domain ? viewingProject.domain : 'N/A')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section>
                    <h4 className="text-[10px] font-black text-[#E6FF00] uppercase tracking-[0.4em] mb-6 italic">User Description</h4>
                    <div className="bg-black/30 p-8 rounded-3xl border border-white/5">
                      <p className="text-sm font-medium text-white/70 leading-relaxed italic">{viewingProject.description}</p>
                    </div>
                  </section>
                </div>
              )}
              
              <div className="mt-12 pt-10 border-t border-white/5 flex gap-4">
                <button 
                  onClick={() => { setEditingProjectDetails(viewingProject); setShowProjectDetailModal(false); setShowProjectModal(true); }}
                  className="flex-1 bg-[#E6FF00] text-black py-5 rounded-full font-black uppercase italic text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl"
                >
                  Edit Project
                </button>
                <button 
                  onClick={() => setShowProjectDetailModal(false)}
                  className="flex-1 bg-white/5 text-white py-5 rounded-full font-black uppercase italic text-sm hover:bg-white/10 transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Project Add/Edit Modal */}
      <AnimatePresence>
        {showProjectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md" 
              onClick={() => setShowProjectModal(false)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-[#5E7162] rounded-[3rem] p-12 max-w-4xl w-full shadow-2xl border border-white/10 overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-start mb-10">
                <div>
                  <h3 className="text-5xl font-bold tracking-tighter text-white uppercase italic">{editingProjectDetails ? 'Edit Project' : 'Add New Project'}</h3>
                  <div className="text-[10px] font-bold text-[#E6FF00] uppercase tracking-[0.4em] mt-2">Configuration</div>
                </div>
                <button onClick={() => setShowProjectModal(false)} className="p-4 hover:bg-white/5 rounded-full text-white transition-all">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const data = Object.fromEntries(formData.entries());
                handleSaveProject(data as any);
              }} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-4 italic">Project Name</label>
                    <input 
                      name="businessName"
                      defaultValue={editingProjectDetails?.businessName}
                      required
                      className="w-full p-6 rounded-2xl bg-black/20 border border-white/10 text-white focus:outline-none focus:border-[#E6FF00]/50 font-bold uppercase tracking-widest"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-4 italic">Client Name</label>
                    <input 
                      name="userName"
                      defaultValue={editingProjectDetails?.userName}
                      required
                      className="w-full p-6 rounded-2xl bg-black/20 border border-white/10 text-white focus:outline-none focus:border-[#E6FF00]/50 font-bold uppercase tracking-widest"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-4 italic">Client Email</label>
                    <input 
                      name="userEmail"
                      type="email"
                      defaultValue={editingProjectDetails?.userEmail}
                      required
                      className="w-full p-6 rounded-2xl bg-black/20 border border-white/10 text-white focus:outline-none focus:border-[#E6FF00]/50 font-bold uppercase tracking-widest"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-4 italic">Project Type</label>
                      <input 
                        name="businessType"
                        defaultValue={editingProjectDetails?.businessType}
                        required
                        className="w-full p-6 rounded-2xl bg-black/20 border border-white/10 text-white focus:outline-none focus:border-[#E6FF00]/50 font-bold uppercase tracking-widest"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-4 italic">Plan</label>
                      <select 
                        name="plan"
                        defaultValue={editingProjectDetails?.plan}
                        className="w-full p-6 rounded-2xl bg-black/20 border border-white/10 text-white focus:outline-none focus:border-[#E6FF00]/50 font-bold uppercase tracking-widest appearance-none"
                      >
                        <option value="Basic">Basic</option>
                        <option value="Standard">Standard</option>
                        <option value="Premium">Premium</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-4 italic">Start Date</label>
                      <input 
                        name="startDate"
                        type="date"
                        defaultValue={editingProjectDetails?.startDate ? new Date(editingProjectDetails.startDate as any).toISOString().split('T')[0] : ''}
                        className="w-full p-6 rounded-2xl bg-black/20 border border-white/10 text-white focus:outline-none focus:border-[#E6FF00]/50 font-bold uppercase tracking-widest"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-4 italic">Deadline</label>
                      <input 
                        name="deadline"
                        type="date"
                        defaultValue={editingProjectDetails?.deadline ? new Date(editingProjectDetails.deadline as any).toISOString().split('T')[0] : ''}
                        className="w-full p-6 rounded-2xl bg-black/20 border border-white/10 text-white focus:outline-none focus:border-[#E6FF00]/50 font-bold uppercase tracking-widest"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-4 italic">Status</label>
                    <select 
                      name="status"
                      defaultValue={editingProjectDetails?.status}
                      className="w-full p-6 rounded-2xl bg-black/20 border border-white/10 text-white focus:outline-none focus:border-[#E6FF00]/50 font-bold uppercase tracking-widest appearance-none"
                    >
                      <option value="Waiting for Review">Waiting for Review</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Accepted">Accepted</option>
                      <option value="Development Started">Development Started</option>
                      <option value="Completed">Completed</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-4 italic">Description</label>
                    <textarea 
                      name="description"
                      defaultValue={editingProjectDetails?.description}
                      className="w-full p-6 rounded-2xl bg-black/20 border border-white/10 text-white focus:outline-none focus:border-[#E6FF00]/50 font-bold uppercase tracking-widest h-32 resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-4 italic">Internal Notes</label>
                    <textarea 
                      name="internalNotes"
                      defaultValue={editingProjectDetails?.internalNotes}
                      className="w-full p-6 rounded-2xl bg-black/20 border border-white/10 text-[#E6FF00] focus:outline-none focus:border-[#E6FF00]/50 font-bold uppercase tracking-widest h-32 resize-none placeholder:text-[#E6FF00]/20"
                      placeholder="Admin only notes..."
                    />
                  </div>
                </div>

                <div className="col-span-full mt-8 flex gap-4">
                  <button type="submit" className="flex-1 bg-[#E6FF00] text-black py-5 rounded-full font-black uppercase italic text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl">
                    {editingProjectDetails ? 'Update Project' : 'Create Project'}
                  </button>
                  <button type="button" onClick={() => setShowProjectModal(false)} className="flex-1 bg-white/5 text-white py-5 rounded-full font-black uppercase italic text-sm hover:bg-white/10 transition-all">
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Rejection Reason Modal */}
      <AnimatePresence>
        {showReasonModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl" 
              onClick={() => setShowReasonModal(false)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-[#5E7162] rounded-[3rem] p-12 max-w-md w-full shadow-2xl border border-red-500/20"
            >
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
                <X size={40} className="text-red-500" strokeWidth={3} />
              </div>
              <h3 className="text-4xl font-bold tracking-tighter text-white text-center mb-4 uppercase italic">Rejection Reason</h3>
              <div className="bg-black/20 p-8 rounded-3xl border border-white/5 mb-10">
                <p className="text-white/70 text-sm leading-relaxed italic text-center">
                  "{reasonToShow}"
                </p>
              </div>
              <button 
                onClick={() => setShowReasonModal(false)}
                className="w-full bg-white/5 text-white py-5 rounded-full font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface UserCardProps {
  u: UserProfile;
  adminId: string;
  conversation: any;
  onOpenChat: () => void;
  onUnreadUpdate: (count: number) => void;
}

const UserCard: React.FC<UserCardProps> = ({ u, adminId, conversation, onOpenChat, onUnreadUpdate }) => {
  const msgCount = conversation.unreadCount?.[adminId] || 0;
  const lastMessage = {
    text: conversation.lastMessage,
    createdAt: conversation.lastMessageAt,
    senderId: conversation.lastSenderId,
    seen: msgCount === 0,
    attachments: conversation.lastMessage?.includes('attachment') || conversation.lastMessage?.includes('image') ? [1] : []
  };

  useEffect(() => {
    onUnreadUpdate(msgCount);
  }, [msgCount]);

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div 
      onClick={onOpenChat}
      className={`
        px-4 py-3 flex items-center gap-4 cursor-pointer transition-all border-b border-white/5
        hover:bg-[#202C33] active:bg-[#2A3942]
      `}
    >
      <div className="relative shrink-0">
        <div className="w-14 h-14 rounded-full overflow-hidden bg-[#6A7175] flex items-center justify-center text-white font-bold text-xl">
          {u.photoURL ? (
            <img src={u.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            u.displayName?.[0] || 'U'
          )}
        </div>
        {u.status === 'online' && (
          <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 border-2 border-[#0B141A] rounded-full bg-[#00A884]"></div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-0.5">
          <h3 className="text-[17px] font-medium text-[#E9EDEF] truncate">
            {u.displayName || 'User'}
          </h3>
          <span className={`text-xs ${msgCount > 0 ? 'text-[#00A884]' : 'text-[#8696A0]'}`}>
            {lastMessage ? formatTime(lastMessage.createdAt) : ''}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 min-w-0 flex-1">
            {lastMessage?.senderId === adminId && (
              <CheckCheck size={16} className={lastMessage.seen ? 'text-[#53BDEB]' : 'text-[#8696A0]'} />
            )}
            {lastMessage?.attachments?.length > 0 && (
              <Camera size={14} className="text-[#8696A0] shrink-0" />
            )}
            <p className={`text-sm truncate ${msgCount > 0 ? 'text-[#E9EDEF] font-medium' : 'text-[#8696A0]'}`}>
              {lastMessage ? lastMessage.text : 'No messages yet...'}
            </p>
          </div>
          
          {msgCount > 0 && (
            <div className="bg-[#00A884] text-[#0B141A] text-xs font-bold min-w-[20px] h-5 flex items-center justify-center px-1.5 rounded-full shrink-0 ml-2">
              {msgCount}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
