import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db, collection, onSnapshot, FirebaseUser, logOut, getDocs, addDoc, query, where, updateDoc, doc, serverTimestamp, orderBy, limit } from '../firebase';
import { UserProfile, Project, ProjectStatus } from '../types';
import { Link } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { DomainSelect } from '../components/DomainSelect';
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
  UserPlus,
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
  MoreVertical,
  Video,
  Download,
  Shield,
  Database,
  Briefcase
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import ChatSystem from '../components/ChatSystem';
import { updateProject, deleteAllProjects, deleteAllUsers, getSystemSettings, updateSystemSettings, getConversationId, getProjects, getConversations, getProjectUnreadNotifications } from '../services/database';
import { APP_NAME, HYPHENATED_NAME } from '../constants';
import { SystemSettings, Attachment, Message as ChatMessage } from '../types';
import { MeetingList } from '../components/meetings/MeetingList';
import Papa from 'papaparse';
import { Monitor, Smartphone, Tablet, ExternalLink, Zap, Mail, MessageSquare } from 'lucide-react';

import BottomNav from '../components/BottomNav';
import { getUnreadMessageCount } from '../services/database';

const WebsitePreview = ({ data, device }: { data: any, device: 'desktop' | 'tablet' | 'mobile' }) => {
  const containerClasses = {
    desktop: 'w-full h-[500px]',
    tablet: 'w-[400px] h-[600px] mx-auto',
    mobile: 'w-[280px] h-[500px] mx-auto',
  };

  return (
    <div className={`bg-white rounded-t-2xl border-x-4 border-t-4 border-gray-800 transition-all duration-500 overflow-hidden shadow-2xl relative ${containerClasses[device]}`}>
      <div className="h-4 bg-gray-800 flex items-center justify-center gap-1 sticky top-0 z-20">
        <div className="w-1 h-1 rounded-full bg-red-500" />
        <div className="w-1 h-1 rounded-full bg-#c7c42a" />
        <div className="w-1 h-1 rounded-full bg-green-500" />
      </div>
      <div className="h-full overflow-y-auto bg-white text-black font-sans no-scrollbar">
        <nav className="p-3 border-b flex justify-between items-center bg-white/90 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-[#c7c42a] rounded flex items-center justify-center text-white font-bold text-[8px]">
              {(data.businessName || 'B')[0]}
            </div>
            <span className="font-bold text-[8px] truncate max-w-[80px]">{data.businessName || 'Business'}</span>
          </div>
          <div className="w-6 h-1 bg-gray-100 rounded" />
        </nav>
        <section className="py-10 px-4 text-center space-y-3" style={{ backgroundColor: data.primaryColor || '#c7c42a' }}>
          <h1 className="text-xl font-black uppercase tracking-tighter leading-none" style={{ color: data.secondaryColor || '#000' }}>
            {data.businessName || 'Business Name'}
          </h1>
          <p className="text-[8px] font-medium opacity-70" style={{ color: data.secondaryColor || '#000' }}>
            {data.description || 'Welcome to our platform.'}
          </p>
          <button className="px-4 py-1.5 rounded-full font-bold text-[7px] uppercase tracking-widest shadow-lg" style={{ backgroundColor: data.secondaryColor || '#000', color: data.primaryColor || '#c7c42a' }}>
            Call Us
          </button>
        </section>

        {/* Portfolio Section */}
        <section className="py-8 px-4 space-y-4 bg-white border-t border-gray-50">
          <div className="space-y-0.5">
             <h2 className="text-[7px] font-black uppercase tracking-[0.3em] text-center text-gray-400">Portfolio</h2>
             <p className="text-sm font-bold text-center tracking-tight italic uppercase">View Our Works</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="aspect-[4/3] bg-gray-50 rounded-xl border border-gray-100 overflow-hidden flex items-center justify-center">
                 <Layout size={14} style={{ color: data.primaryColor }} />
              </div>
            ))}
          </div>
          <div className="flex justify-center">
             <button className="px-4 py-1.5 rounded-full font-bold text-[6px] uppercase tracking-widest shadow-md transition-all hover:shadow-lg active:scale-95 flex items-center gap-1.5" style={{ backgroundColor: data.primaryColor || '#c7c42a', color: data.secondaryColor || '#000000' }}>
                See All Projects <ArrowRight size={8} />
             </button>
          </div>
        </section>

        <section className="p-4 space-y-1 bg-white border-t border-gray-50">
          <h2 className="text-[7px] font-black uppercase tracking-[0.2em] text-center text-gray-400">Features</h2>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {(data.selectedFeatures || []).slice(0, 4).map((f: any, i: number) => (
                <div key={i} className="p-2 bg-gray-50 rounded-lg border border-gray-100 text-center flex flex-col items-center justify-center gap-1">
                   <div className="w-4 h-4 rounded bg-white border border-gray-100 flex items-center justify-center">
                     <Zap size={8} style={{ color: data.primaryColor }} />
                   </div>
                   <div className="text-[6px] font-black uppercase truncate max-w-full">{f}</div>
                </div>
            ))}
          </div>
        </section>
        <footer className="py-6 px-4 bg-gray-900 text-white text-[7px] text-center uppercase tracking-widest opacity-50">
           © 2024 {data.businessName || 'Business'}
        </footer>
      </div>
    </div>
  );
};

import { ADMIN_EMAIL } from '../constants';

interface AdminPanelProps {
  user: FirebaseUser;
  profile: UserProfile | null;
}

export default function AdminPanel({ user, profile }: AdminPanelProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'requests' | 'active' | 'my-tasks' | 'projects' | 'analytics' | 'messages' | 'recycle' | 'system' | 'meetings' | 'clients' | 'developers'>('dashboard');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = getUnreadMessageCount(user.uid, setUnreadCount);
    return () => unsub?.();
  }, [user?.uid]);

  const [developerInvites, setDeveloperInvites] = useState<any[]>([]);

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showProjectDetailModal, setShowProjectDetailModal] = useState(false);
  const [editingProjectDetails, setEditingProjectDetails] = useState<Project | null>(null);
  const [viewingProject, setViewingProject] = useState<Project | null>(null);
  const [modalTab, setModalTab] = useState<'overview' | 'preview'>('overview');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [reasonToShow, setReasonToShow] = useState('');
  const [projectSearch, setProjectSearch] = useState('');
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    name: '',
    email: '',
    code: Math.floor(10000 + Math.random() * 90000).toString(),
    role: 'developer' as 'developer' | 'senior developer',
    experience: '',
    joiningDate: new Date().toISOString().split('T')[0],
    permissions: {
      canChat: true,
      canUpload: true,
      canViewProjects: true
    },
    paymentLinks: {
      oneTime: { basic: '', standard: '', premium: '' }
    }
  });

  const handleCreateInvite = async () => {
    if (!inviteForm.name || !inviteForm.email) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (!user) return;
      const { createDeveloperInvite } = await import('../services/database');
      const inviteData: any = {
        ...inviteForm,
        email: inviteForm.email.toLowerCase(),
        createdBy: user.uid,
        createdAt: new Date(),
        used: false,
        activeProjects: 0
      };

      await createDeveloperInvite(inviteData);
      setIsInviteModalOpen(false);
      setInviteForm({
        name: '',
        email: '',
        code: Math.floor(10000 + Math.random() * 90000).toString(),
        role: 'developer',
        experience: '',
        joiningDate: new Date().toISOString().split('T')[0],
        permissions: {
          canChat: true,
          canUpload: true,
          canViewProjects: true
        },
        paymentLinks: {
          oneTime: { basic: '', standard: '', premium: '' }
        }
      });
      toast.success("Developer invite created! Code: " + inviteData.code);
    } catch (error: any) {
      toast.error(error.message || "Failed to create invite");
    }
  };
  const [userUnreadCounts, setUserUnreadCounts] = useState<Record<string, number>>({});
  const [projectUnreadCounts, setProjectUnreadCounts] = useState<Record<string, number>>({});
  const [devUnreadCounts, setDevUnreadCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const directTotal = Object.values(userUnreadCounts).reduce((acc, count) => acc + count, 0);
    const projectTotal = Object.values(projectUnreadCounts).reduce((acc, count) => acc + count, 0);
    setUnreadTotal(directTotal + projectTotal);
  }, [userUnreadCounts, projectUnreadCounts]);


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
  const [appTab, setAppTab] = useState<'developer' | 'sales' | 'invites'>('developer');
  const [developerStats, setDeveloperStats] = useState<Record<string, any>>({});

  const isUserAdmin = profile?.role === 'admin' || (user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase());

  if (!isUserAdmin) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-[#111] rounded-[3rem] p-12 border border-red-500/20 shadow-2xl">
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
    if (!isUserAdmin) return;
    
    // Global notification listeners - only once on mount/auth change
    const unsubUnread = getProjectUnreadNotifications((projectsData) => {
      const counts: Record<string, number> = {};
      projectsData.forEach(p => {
        if (p.unreadCount && p.unreadCount['admin']) {
          counts[p.id] = p.unreadCount['admin'];
        }
      });
      setProjectUnreadCounts(counts);
    });

    const unsubscribeConversations = getConversations(user.uid, (convs) => {
      setConversations(convs);
    });

    getSystemSettings().then(settings => {
      if (settings) setSystemSettings(settings);
    });

    return () => {
      unsubUnread?.();
      unsubscribeConversations?.();
    };
  }, [user.uid, isUserAdmin]); // NOT dependent on activeTab

  useEffect(() => {
    // Tab-specific data loading
    if (!isUserAdmin) return;
    
    let unsubscribeProjects = () => {};
    let unsubscribeUsers = () => {};
    let unsubscribeDevInvites = () => {};

    if (activeTab === 'dashboard' || activeTab === 'projects' || activeTab === 'recycle' || activeTab === 'developers') {
      const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'), limit(100));
      unsubscribeProjects = onSnapshot(q, (snapshot) => {
        setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project)));
      }, (error) => {
        if (!error.message.includes('Quota')) console.error("Admin Projects Snapshot Error:", error);
      });
    } else if (activeTab === 'requests') {
      const q = query(collection(db, 'projects'), where('developerId', '==', null), where('isDeleted', '==', false), limit(50));
      unsubscribeProjects = onSnapshot(q, (snapshot) => {
        setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project)));
      }, (error) => {
        if (!error.message.includes('Quota')) console.error("Admin Requests Snapshot Error:", error);
      });
    } else if (activeTab === 'active' || activeTab === 'my-tasks') {
      const q = query(collection(db, 'projects'), where('developerId', '!=', null), where('isDeleted', '==', false), limit(50));
      unsubscribeProjects = onSnapshot(q, (snapshot) => {
        setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project)));
      }, (error) => {
        if (!error.message.includes('Quota')) console.error("Admin Active Snapshot Error:", error);
      });
    }

    if (activeTab === 'dashboard' || activeTab === 'clients') {
      const q = query(collection(db, 'users'), where('role', '==', 'client'));
      unsubscribeUsers = onSnapshot(q, (snapshot) => {
        setUsers(snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile)));
      });
    } else if (activeTab === 'developers') {
      const q = query(collection(db, 'users'), where('role', '==', 'developer'));
      unsubscribeUsers = onSnapshot(q, (snapshot) => {
        setUsers(snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile)));
      });
    }

    if (activeTab === 'system' && appTab === 'invites') {
      unsubscribeDevInvites = onSnapshot(collection(db, 'developer_invites'), (snapshot) => {
        setDeveloperInvites(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, (error) => {
        if (!error.message.includes('Quota')) console.error("Admin DevInvites Snapshot Error:", error);
      });
    }

    if (activeTab === 'developers') {
      const devs = users.filter(u => u.role === 'developer');
      const unsubs = devs.map(dev => {
        return getUnreadMessageCount(dev.uid, (count) => {
          setDevUnreadCounts(prev => ({ ...prev, [dev.uid]: count }));
        });
      });

      import('../services/database').then(db => {
        const fetchDevStats = async () => {
          const statsMap: Record<string, any> = {};
          for (const dev of devs) {
            const stats = await db.getDeveloperStats(dev.uid);
            statsMap[dev.uid] = stats;
          }
          setDeveloperStats(statsMap);
        };
        fetchDevStats();
      });

      return () => unsubs.forEach(unsub => unsub?.());
    }

    return () => {
      unsubscribeProjects();
      unsubscribeUsers();
      unsubscribeDevInvites();
    };
  }, [user.uid, isUserAdmin, activeTab, appTab]);

  const handleAccept = async (projectId: string) => {
    try {
      const project = projects.find(p => p.id === projectId);
      await updateProject(projectId, { 
        status: 'Accepted',
        progress: 15,
        acceptedAt: serverTimestamp(),
        developerId: user.uid,
        assignedTo: user.uid,
        estimatedCompletion: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
      });

      // Send automated message from admin
      if (project && project.userId) {
        const { sendDirectMessage } = await import('../services/database');
        await sendDirectMessage(project.userId, {
          senderId: user.uid,
          senderName: 'ADMIN',
          text: `👋 Hi, I've accepted your project ${project.businessName}. I'll leading the development and keep you updated here.`,
          status: 'sent'
        });
      }
      toast.success('Project accepted and assigned to you!');
    } catch (error) {
      console.error("Error accepting project:", error);
      toast.error('Failed to accept project');
    }
  };

  const handleDownloadPrompt = (project: Project) => {
    if (!project.aiPrompt) {
      toast.error('No AI prompt available for this project');
      return;
    }
    const element = document.createElement("a");
    const file = new Blob([project.aiPrompt], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${project.businessName}_prompt.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Prompt downloaded');
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
      // Ensure both internal ID fields are synced
      if (projectData.developerId) {
        projectData.assignedTo = projectData.developerId;
      } else if (projectData.assignedTo) {
        projectData.developerId = projectData.assignedTo;
      }

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
WebbyLaunch Project Details
EST 2026
--------------------------------------------------

1. PROJECT OVERVIEW (BUSINESS)
Project Number: ${project.id}
Project Name: ${project.websiteName || 'Not Provided'}
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
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(22);
      doc.setTextColor(0, 0, 0);
      doc.text('WebbyLaunch Project Details', 20, 20);
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
      doc.text(`Logo: Not Required`, 25, 122);
      doc.text(`Documents: Not Required`, 25, 135);

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

      const pdfBlob = doc.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Project_${project.id}_Description.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
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
    clients: users.filter(u => u.role === 'client').length,
    developers: users.filter(u => u.role === 'developer').length,
    activeProjects: projects.filter(p => !p.isDeleted && ['Accepted', 'Development Started', 'assigned', 'pending'].includes(p.status)).length,
    pendingRequests: projects.filter(p => p.status === 'Waiting for Review' && !p.isDeleted).length,
    completedProjects: projects.filter(p => p.status === 'Completed' && !p.isDeleted).length,
    totalMessages: projects.reduce((acc, p) => acc + (p.unreadCount ? Object.values(p.unreadCount).reduce((a: any, b: any) => a + b, 0) : 0), 0),
    totalRevenue: projects.filter(p => !p.isDeleted && p.paymentStatus === 'paid').reduce((acc, p) => acc + (p.plan === 'Basic' ? 5000 : p.plan === 'Standard' ? 15000 : p.plan === 'Premium' ? 30000 : 0), 0),
  };

  const projectStatusData = [
    { name: 'Pending', value: stats.pendingRequests, color: '#c7c42a' },
    { name: 'Active', value: stats.activeProjects, color: '#00F2FF' },
    { name: 'Completed', value: stats.completedProjects, color: '#22c55e' },
    { name: 'Rejected', value: projects.filter(p => p.status === 'Rejected').length, color: '#ef4444' },
  ].filter(d => d.value > 0);

  const renderDashboard = () => {
    const totalCompleted = projects.filter(p => !p.isDeleted && p.status === 'Completed').length;
    const pendingJobs = projects.filter(p => !p.isDeleted && !p.developerId).length;
    const platformEfficiency = projects.length > 0 ? Math.round((totalCompleted / projects.length) * 100) : 0;

    const messageCount = stats.totalMessages || 0;

    return (
      <div className="space-y-12">
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-black text-[#c7c42a] uppercase tracking-[0.4em]">Operational Intelligence</span>
          <h2 className="text-6xl font-black tracking-tighter text-white uppercase italic">Operations Control</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Platform Speed', value: `${platformEfficiency}%`, icon: Zap, color: 'text-[#c7c42a]' },
            { label: 'Network Signal', value: messageCount, icon: MessageCircle, color: 'text-[#00F2FF]' },
            { label: 'Pending Jobs', value: pendingJobs, icon: Bell, color: 'text-red-500' },
            { label: 'Total Volume', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-green-400' },
          ].map((stat, i) => (
            <div key={i} className="bg-[#111] p-8 rounded-[2rem] border border-white/10 group hover:border-[#c7c42a]/30 transition-all relative overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <stat.icon size={24} className={stat.color} />
                </div>
              </div>
              <div className="text-4xl font-bold mb-1 text-white tabular-nums tracking-tighter italic">{stat.value}</div>
              <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white/5 backdrop-blur-md p-10 rounded-[2.5rem] border border-white/10">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">Active Pulse</h3>
              <div className="flex gap-2">
                <div className="px-4 py-1.5 bg-green-500/10 text-green-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.1)]">Systems Nominal</div>
              </div>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={projects.slice(-7).map((p, i) => ({ name: `P${i}`, val: p.progress || 0 }))}>
                  <defs>
                    <linearGradient id="colorPulse" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#c7c42a" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#c7c42a" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#000', border: '1px solid #ffffff10', borderRadius: '16px' }}
                  />
                  <Area type="monotone" dataKey="val" stroke="#c7c42a" strokeWidth={4} fillOpacity={1} fill="url(#colorPulse)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md p-10 rounded-[2.5rem] border border-white/10">
            <h3 className="text-2xl font-black text-white uppercase italic tracking-tight mb-8">Ecosystem</h3>
            <div className="h-64 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Clients', value: stats.clients, color: '#c7c42a' },
                      { name: 'Devs', value: stats.developers, color: '#00F2FF' }
                    ]}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {[0, 1].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#c7c42a' : '#00F2FF'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center flex-col pt-6 pointer-events-none">
                <span className="text-3xl font-black text-white italic">{stats.totalUsers - 1}</span>
                <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Network</span>
              </div>
            </div>
            <div className="mt-8 space-y-4">
               <div className="flex justify-between items-center text-[10px] font-black uppercase italic tracking-widest">
                  <span className="text-white/40">Partner Devs</span>
                  <span className="text-[#00F2FF]">{stats.developers}</span>
               </div>
               <div className="flex justify-between items-center text-[10px] font-black uppercase italic tracking-widest">
                  <span className="text-white/40">Verified Clients</span>
                  <span className="text-[#c7c42a]">{stats.clients}</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderRequests = () => (
    <div className="space-y-12">
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-bold text-[#c7c42a] uppercase tracking-[0.3em]">Incoming</span>
        <h2 className="text-6xl font-bold tracking-tighter text-white">PROJECT REQUESTS</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.filter(p => !p.developerId && !p.isDeleted).map((p) => (
          <div key={p.id} className="bg-[#111] p-8 rounded-[2rem] border border-white/10 flex flex-col h-full group hover:border-[#c7c42a]/30 transition-all">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-3xl font-bold tracking-tighter text-white mb-1">{p.businessName}</h3>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <div className="text-[10px] font-bold text-[#c7c42a] uppercase tracking-widest">{p.businessType}</div>
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
                          : 'bg-#c7c42a/20 text-#c7c42a border-#c7c42a/30'
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
                        : 'bg-#c7c42a/20 text-#c7c42a border-#c7c42a/30'
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
                  className="p-4 bg-white/5 rounded-full text-[#c7c42a] hover:bg-[#c7c42a] hover:text-black transition-all"
                  title="View Details"
                >
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-10 flex-1">{p.description}</p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button 
                onClick={() => handleDownloadPrompt(p)}
                className="flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase italic tracking-widest text-[#c7c42a] hover:bg-[#c7c42a] hover:text-black transition-all"
              >
                AI Prompt <Download size={14} />
              </button>
              <button 
                onClick={() => handleDownloadDescription(p, 'txt')}
                className="flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase italic tracking-widest text-white/60 hover:bg-white hover:text-black transition-all"
              >
                Details <User size={14} />
              </button>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => { setEditingProjectDetails(p); setShowProjectModal(true); }}
                className="flex-1 bg-[#c7c42a] text-black py-4 rounded-full font-bold hover:scale-[1.02] active:scale-[0.98] transition-all text-xs uppercase tracking-widest"
              >
                Assign Developer
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
        <span className="text-[10px] font-bold text-[#c7c42a] uppercase tracking-[0.3em]">In Progress</span>
        <h2 className="text-6xl font-bold tracking-tighter text-white uppercase italic">Active Operations</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.filter(p => ['Accepted', 'Development Started', 'Completed'].includes(p.status) && !p.isDeleted).map((p) => (
          <div key={p.id} className="bg-[#111] p-8 rounded-[2rem] border border-white/10 group hover:border-[#c7c42a]/30 transition-all relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#c7c42a]/5 rounded-full blur-3xl"></div>
            
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
                        : 'bg-#c7c42a/20 text-#c7c42a border-#c7c42a/30'
                    }`}
                  >
                    {p.paymentStatus || 'pending'}
                  </button>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="px-3 py-1 bg-[#c7c42a]/10 rounded-full text-[8px] font-black text-[#c7c42a] uppercase tracking-widest border border-[#c7c42a]/20">
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
                  className="p-4 bg-white/5 rounded-full text-[#c7c42a] hover:bg-[#c7c42a] hover:text-black transition-all shadow-lg"
                  title="View Details"
                >
                  <ArrowRight size={20} />
                </button>
                <button 
                  onClick={() => { setSelectedProject(p); setShowChat(true); }}
                  className="p-4 bg-white/5 rounded-full text-white hover:bg-[#c7c42a] hover:text-black transition-all shadow-lg"
                  title="Project Chat"
                >
                  <MessageCircle size={20} />
                </button>
              </div>
            </div>
            
            <div className="mb-10 relative z-10">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-3">
                <span>Current Progress</span>
                <span className="text-[#c7c42a]">{p.progress}%</span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${p.progress}%` }}
                  className="h-full bg-[#c7c42a] rounded-full shadow-[0_0_10px_rgba(199, 196, 42,0.3)]" 
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

  const renderClients = () => {
    const clients = users.filter(u => u.role === 'client');
    
    const downloadClientsCSV = () => {
      const data = clients.map(c => ({
        Name: c.displayName,
        Email: c.email,
        Phone: c.phone || 'N/A',
        Role: c.role,
        Joined: c.createdAt ? (typeof (c.createdAt as any).toDate === 'function' ? (c.createdAt as any).toDate().toLocaleDateString() : new Date(c.createdAt as any).toLocaleDateString()) : 'N/A'
      }));
      const csv = Papa.unparse(data);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `webbylaunch_clients_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Clients list downloaded');
    };

    return (
      <div className="space-y-12">
        <div className="flex justify-between items-end">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-[#c7c42a] uppercase tracking-[0.3em]">CRM</span>
            <h2 className="text-6xl font-bold tracking-tighter text-white uppercase italic">Client Base</h2>
          </div>
          <button 
            onClick={downloadClientsCSV}
            className="px-8 py-4 bg-[#c7c42a] text-black rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-[0_0_30px_rgba(199, 196, 42,0.2)]"
          >
            <Download size={18} />
            Export CSV
          </button>
        </div>

        <div className="bg-[#5E7162]/30 backdrop-blur-md rounded-[3rem] border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="p-8 text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Client</th>
                  <th className="p-8 text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Contact Info</th>
                  <th className="p-8 text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Status</th>
                  <th className="p-8 text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Joined</th>
                  <th className="p-8 text-[10px] font-black text-white/40 uppercase tracking-[0.3em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => (
                  <tr key={c.uid} className="border-b border-white/5 hover:bg-white/5 transition-all">
                    <td className="p-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 overflow-hidden">
                          {c.photoURL ? (
                            <img src={c.photoURL} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <User size={20} className="text-white/20" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-lg font-bold text-white uppercase italic tracking-tighter">{c.displayName}</span>
                          <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1">ID: {c.uid.slice(0, 8)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-8">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white">{c.email}</span>
                        <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1">{c.phone || 'No Phone'}</span>
                      </div>
                    </td>
                    <td className="p-8">
                      <span className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full text-[8px] font-black uppercase tracking-widest">
                        Active
                      </span>
                    </td>
                    <td className="p-8">
                      <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                        {c.createdAt ? (typeof (c.createdAt as any).toDate === 'function' ? (c.createdAt as any).toDate().toLocaleDateString() : new Date(c.createdAt as any).toLocaleDateString()) : 'N/A'}
                      </span>
                    </td>
                    <td className="p-8 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => {
                            setSelectedUser(c);
                            setShowDirectChat(true);
                          }}
                          className="p-3 bg-white/5 rounded-xl text-white/40 hover:bg-[#c7c42a] hover:text-black transition-all"
                          title="Message Client"
                        >
                          <MessageCircle size={16} />
                        </button>
                        <button 
                          onClick={() => {
                            const details = `
Client Name: ${c.displayName}
Email: ${c.email}
Phone: ${c.phone || 'N/A'}
Role: ${c.role}
Joined: ${c.createdAt ? (typeof (c.createdAt as any).toDate === 'function' ? (c.createdAt as any).toDate().toLocaleString() : new Date(c.createdAt as any).toLocaleString()) : 'N/A'}
                          `;
                          const blob = new Blob([details], { type: 'text/plain' });
                          const url = URL.createObjectURL(blob);
                          const link = document.createElement('a');
                          link.href = url;
                          link.download = `${c.displayName.replace(/\s+/g, '_')}_details.txt`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          URL.revokeObjectURL(url);
                          toast.success('Client details downloaded');
                        }}
                        className="p-3 bg-white/5 rounded-xl text-white/40 hover:bg-[#c7c42a] hover:text-black transition-all"
                        title="Download Client Info"
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderAnalytics = () => (
    <div className="space-y-12">
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-bold text-[#c7c42a] uppercase tracking-[0.3em]">Data</span>
        <h2 className="text-6xl font-bold tracking-tighter text-white">USER METRICS</h2>
      </div>

      <div className="bg-[#050505] p-10 rounded-[3rem] border border-white/10">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h3 className="text-2xl font-bold text-white tracking-tight">Platform Engagement</h3>
            <p className="text-xs text-white/40 uppercase tracking-widest mt-1">Users Visited Per Day</p>
          </div>
          <div className="text-[10px] font-bold text-[#c7c42a] border border-[#c7c42a]/20 px-4 py-2 rounded-full uppercase tracking-widest">Last 7 Days</div>
        </div>
        <div className="h-80 flex items-end justify-between gap-4">
          {[40, 60, 30, 80, 50, 90, 70].map((h, i) => (
            <div key={i} className="flex-1 bg-white/5 rounded-t-2xl relative group">
              <motion.div 
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                className="w-full bg-[#c7c42a] rounded-t-2xl absolute bottom-0 transition-all group-hover:brightness-125"
              />
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all text-[10px] font-bold text-[#c7c42a] tabular-nums">
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
            <span className="text-[10px] font-bold text-[#c7c42a] uppercase tracking-[0.3em]">Management</span>
            <h2 className="text-6xl font-bold tracking-tighter text-white uppercase italic">Project Details</h2>
          </div>
          <button 
            onClick={() => { setEditingProjectDetails(null); setShowProjectModal(true); }}
            className="px-8 py-4 bg-[#c7c42a] text-black rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-[0_0_30px_rgba(199,196,42,0.2)]"
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
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-16 pr-6 text-white font-bold uppercase tracking-widest outline-none focus:border-[#c7c42a]/50 transition-all placeholder:text-white/10"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={20} />
            <select 
              value={projectStatusFilter}
              onChange={(e) => setProjectStatusFilter(e.target.value as any)}
              className="appearance-none bg-white/5 border border-white/10 rounded-2xl py-5 pl-16 pr-12 text-white font-bold uppercase tracking-widest outline-none focus:border-[#c7c42a]/50 transition-all"
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
        <div className="bg-white/5 backdrop-blur-md rounded-[3rem] border border-white/10 overflow-hidden">
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
                        'bg-#c7c42a/20 text-#c7c42a border-#c7c42a/30'
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
                        <span className="text-[10px] font-black text-[#c7c42a] uppercase tracking-widest mt-1">{p.plan || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="p-8">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-[8px] font-bold text-white/40 uppercase tracking-widest">
                          <Calendar size={10} />
                          <span>Start: {p.startDate ? new Date(p.startDate as any).toLocaleDateString() : 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[8px] font-bold text-[#c7c42a] uppercase tracking-widest">
                          <Clock size={10} />
                          <span>End: {p.deadline ? new Date(p.deadline as any).toLocaleDateString() : 'N/A'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-8 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleDownloadPrompt(p)}
                          className="p-3 bg-white/5 rounded-xl text-[#c7c42a] hover:bg-[#c7c42a] hover:text-black transition-all"
                          title="Download AI Prompt"
                        >
                          <Download size={16} />
                        </button>
                        <button 
                          onClick={() => {
                            const client = users.find(u => u.uid === p.userId);
                            if (client) {
                              setSelectedUser(client);
                              setShowDirectChat(true);
                            } else {
                              toast.error('Client profile not found');
                            }
                          }}
                          className="p-3 bg-white/5 rounded-xl text-white/40 hover:bg-[#c7c42a] hover:text-black transition-all"
                          title="Message Client"
                        >
                          <MessageCircle size={16} />
                        </button>
                        <button 
                          onClick={() => { setViewingProject(p); setModalTab('overview'); setShowProjectDetailModal(true); }}
                          className="p-3 bg-white/5 rounded-xl text-white/40 hover:bg-[#c7c42a] hover:text-black transition-all"
                          title="View Details"
                        >
                          <ArrowRight size={16} />
                        </button>
                        <button 
                          onClick={() => { setEditingProjectDetails(p); setShowProjectModal(true); }}
                          className="p-3 bg-white/5 rounded-xl text-white/40 hover:bg-[#c7c42a] hover:text-black transition-all"
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

  const renderMyTasks = () => {
    const myProjects = projects.filter(p => (p.developerId === user.uid || p.assignedTo === user.uid) && !p.isDeleted);
    
    return (
      <div className="space-y-12">
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-[#c7c42a] uppercase tracking-[0.3em]">Missions</span>
          <h2 className="text-6xl font-bold tracking-tighter text-white uppercase italic">MY ASSIGNMENTS</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {myProjects.map((p) => (
            <div key={p.id} className="bg-[#111] p-8 rounded-[2rem] border border-white/10 group hover:border-[#c7c42a]/30 transition-all relative overflow-hidden">
              <div className="flex justify-between items-start mb-8 relative z-10">
                <div>
                  <h3 className="text-2xl font-bold tracking-tighter text-white mb-1 uppercase italic">{p.businessName}</h3>
                  <div className="flex items-center gap-2">
                    <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{p.userName}</div>
                    <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                      p.paymentStatus === 'paid' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'
                    }`}>
                      {p.paymentStatus || 'pending'}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => { setViewingProject(p); setShowProjectDetailModal(true); }}
                    className="p-3 bg-white/5 rounded-xl text-[#c7c42a] hover:bg-[#c7c42a] hover:text-black transition-all"
                  >
                    <ArrowRight size={18} />
                  </button>
                  <button 
                    onClick={() => { setSelectedProject(p); setShowChat(true); }}
                    className="p-3 bg-white/5 rounded-xl text-white hover:bg-[#c7c42a] hover:text-black transition-all"
                  >
                    <MessageCircle size={18} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <button onClick={() => handleDownloadPrompt(p)} className="flex items-center justify-center gap-2 py-3 bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                  AI Prompt <Download size={12} />
                </button>
                <button onClick={() => handleDownloadDescription(p, 'txt')} className="flex items-center justify-center gap-2 py-3 bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                  Details <User size={12} />
                </button>
              </div>

              <div className="mb-6">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">
                  <span>Progress</span>
                  <span className="text-[#c7c42a]">{p.progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${p.progress}%` }}
                    className="h-full bg-[#c7c42a]"
                  />
                </div>
              </div>

              <button 
                onClick={() => { setSelectedProject(p); setNewProgress(p.progress || 0); setShowProgressModal(true); }}
                className="w-full py-4 bg-white text-black rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-[#c7c42a] transition-all"
              >
                Update Mission Status
              </button>
            </div>
          ))}
          {myProjects.length === 0 && (
            <div className="col-span-full py-32 text-center bg-white/5 rounded-[3rem] border border-dashed border-white/10">
              <p className="text-white/20 text-sm font-bold uppercase tracking-[0.5em]">No missions assigned to you yet</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderRecycleBin = () => (
    <div className="space-y-12">
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-bold text-[#c7c42a] uppercase tracking-[0.3em]">Archive</span>
        <h2 className="text-6xl font-bold tracking-tighter text-white">RECYCLE BIN</h2>
      </div>

      <div className="space-y-4">
        {projects.filter(p => p.isDeleted).map((p) => (
          <div key={p.id} className="bg-white/5 backdrop-blur-md p-8 rounded-[2rem] border border-white/10 flex items-center justify-between group hover:border-[#c7c42a]/30 transition-all">
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
      <div className="h-full flex flex-col bg-[transparent] rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl">
        {/* Chat Header */}
        <div className="p-6 flex items-center justify-between bg-[rgba(255,255,255,0.05)]">
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
              className="w-full bg-[rgba(255,255,255,0.05)] border-none rounded-xl py-2 pl-12 pr-4 text-sm text-[#E9EDEF] outline-none focus:ring-1 focus:ring-[#c7c42a] transition-all placeholder:text-[#8696A0]"
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
                  ? 'bg-[#c7c42a]/20 text-[#c7c42a]' 
                  : 'bg-[rgba(255,255,255,0.05)] text-[#8696A0] hover:bg-[#2A3942]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-[transparent]">
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

  const handleUpdateAppStatus = async (collectionName: string, id: string, status: 'approved' | 'rejected') => {
    try {
      await updateDoc(doc(db, collectionName, id), { status });
      toast.success(`Application ${status}`);
    } catch (error) {
      console.error('Error updating application:', error);
      toast.error('Failed to update application');
    }
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
        <span className="text-[10px] font-bold text-[#c7c42a] uppercase tracking-[0.3em]">Configuration</span>
        <h2 className="text-6xl font-bold tracking-tighter text-white uppercase italic">SYSTEM SETTINGS</h2>
        <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-2 italic">Global platform configuration and pricing management.</p>
      </div>
 
      {systemSettings && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column */}
          <div className="space-y-12">
            {/* Pricing Section */}
            <div className="bg-white/5 backdrop-blur-md p-10 rounded-[3rem] border border-white/10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-[#c7c42a]/10 rounded-2xl flex items-center justify-center text-[#c7c42a]">
                  <TrendingUp size={24} />
                </div>
                <h3 className="text-2xl font-bold text-white tracking-tight uppercase italic">Pricing Configuration</h3>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-4 italic">Starter Launch Price</label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[#c7c42a] font-black">$</span>
                    <input 
                      type="number"
                      value={systemSettings.pricing?.starter ?? 1499}
                      onChange={(e) => handleUpdateSettings({ pricing: { ...systemSettings.pricing!, starter: parseInt(e.target.value) || 0 } })}
                      className="w-full p-6 pl-12 rounded-2xl bg-black/20 border border-white/10 text-white focus:outline-none focus:border-[#c7c42a]/50 font-black text-xl"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-4 italic">Pro Growth Price</label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[#c7c42a] font-black">$</span>
                    <input 
                      type="number"
                      value={systemSettings.pricing?.pro ?? 2999}
                      onChange={(e) => handleUpdateSettings({ pricing: { ...systemSettings.pricing!, pro: parseInt(e.target.value) || 0 } })}
                      className="w-full p-6 pl-12 rounded-2xl bg-black/20 border border-white/10 text-white focus:outline-none focus:border-[#c7c42a]/50 font-black text-xl"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-4 italic">Enterprise Price</label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[#c7c42a] font-black">$</span>
                    <input 
                      type="number"
                      value={systemSettings.pricing?.enterprise ?? 9999}
                      onChange={(e) => handleUpdateSettings({ pricing: { ...systemSettings.pricing!, enterprise: parseInt(e.target.value) || 0 } })}
                      className="w-full p-6 pl-12 rounded-2xl bg-black/20 border border-white/10 text-white focus:outline-none focus:border-[#c7c42a]/50 font-black text-xl"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Required Fields */}
            <div className="bg-white/5 backdrop-blur-md p-10 rounded-[3rem] border border-white/10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-[#c7c42a]/10 rounded-2xl flex items-center justify-center text-[#c7c42a]">
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
                      className={`w-12 h-6 rounded-full transition-all relative ${isRequired ? 'bg-[#c7c42a]' : 'bg-white/10'}`}
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
            <div className="bg-white/5 backdrop-blur-md p-10 rounded-[3rem] border border-white/10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-[#c7c42a]/10 rounded-2xl flex items-center justify-center text-[#c7c42a]">
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
                    className={`w-14 h-7 rounded-full transition-all relative ${systemSettings.allowNewRegistrations ? 'bg-[#c7c42a]' : 'bg-white/10'}`}
                  >
                    <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${systemSettings.allowNewRegistrations ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white/5 backdrop-blur-md p-10 rounded-[3rem] border border-white/10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-[#c7c42a]/10 rounded-2xl flex items-center justify-center text-[#c7c42a]">
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
                      className={`w-12 h-6 rounded-full transition-all relative ${enabled ? 'bg-[#c7c42a]' : 'bg-white/10'}`}
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
    <div className="min-h-screen bg-black font-sans flex flex-col md:flex-row text-white selection:bg-[#c7c42a] selection:text-black">
      {/* Sidebar */}
      <aside className="w-full md:w-80 bg-black border-r border-white/5 flex flex-col sticky top-0 h-screen z-20">
        <div className="p-10 border-b border-white/5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold tracking-tighter text-white">{APP_NAME}</div>
            </div>
            <div className="text-[10px] font-bold text-[#c7c42a] uppercase tracking-[0.4em] mt-2">
              {['workzy59@gmail.com', 'priyankapudi4u@gmail.com', 'sain17296174@gmail.com'].includes(user.email?.toLowerCase() || '') ? 'Developer Dashboard' : 'Admin Panel'}
            </div>
          </div>
        </div>
        <nav className="flex-1 p-6 space-y-3 overflow-y-auto">
          {[
            {id: 'dashboard', label: 'Operations', icon: LayoutDashboard},
            {id: 'my-tasks', label: 'My Projects', icon: Briefcase, hide: user.email?.toLowerCase() === 'workzy59@gmail.com'},
            {id: 'requests', label: 'Job Pool', icon: FileText},
            { id: 'active', label: 'Active Projects', icon: Check },
            { id: 'projects', label: 'Project Details', icon: FolderKanban },
            { id: 'clients', label: 'Clients', icon: Users },
            { id: 'developers', label: 'Developers', icon: Shield },
            { id: 'messages', label: unreadTotal > 0 ? `Messages (${unreadTotal})` : 'Messages', icon: MessageCircle },
            { id: 'meetings', label: 'Meetings', icon: Video },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'system', label: 'System Settings', icon: Settings },
          ].filter(item => !item.hide).map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${
                activeTab === item.id 
                  ? 'bg-[#c7c42a] text-black shadow-[0_0_30px_rgba(199, 196, 42,0.2)]' 
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
            {activeTab === 'my-tasks' && renderMyTasks()}
            {activeTab === 'requests' && renderRequests()}
            {activeTab === 'active' && renderActiveProjects()}
            {activeTab === 'projects' && renderProjectDetails()}
            {activeTab === 'clients' && renderClients()}
            {activeTab === 'developers' && <div className="space-y-12">
              <div className="flex justify-between items-end">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-[#c7c42a] uppercase tracking-[0.3em]">Staff</span>
                  <h2 className="text-6xl font-bold tracking-tighter text-white uppercase italic">Active Developers</h2>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setIsInviteModalOpen(true)}
                    className="px-8 py-4 bg-[#c7c42a] text-black rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(199, 196, 42,0.2)]"
                  >
                    Invite Developer
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.filter(u => u.role === 'developer').map((dev) => {
                  const devProjects = projects.filter(p => !p.isDeleted && (p.developerId === dev.uid || p.assignedTo === dev.uid));
                  const completed = devProjects.filter(p => p.status === 'Completed').length;
                  const active = devProjects.filter(p => ['Accepted', 'Development Started', 'assigned', 'pending'].includes(p.status)).length;
                  const total = completed + active;
                  const efficiency = total > 0 ? Math.round((completed / total) * 100) : 0;
                  const stats = developerStats[dev.uid] || { totalHours: 0, totalPayout: 0 };
                  const isPunchedIn = dev.isPunchedIn || false;

                  return (
                    <div key={dev.uid} className="bg-white/5 p-8 rounded-[2rem] border border-white/10 space-y-6 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-[#c7c42a]/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      <div className="flex justify-between items-start">
                        <div className="w-16 h-16 bg-[#c7c42a] rounded-2xl flex items-center justify-center text-black font-black text-2xl italic">
                          {dev.photoURL ? (
                            <img src={dev.photoURL} alt="" className="w-full h-full object-cover rounded-2xl" referrerPolicy="no-referrer" />
                          ) : (
                            dev.displayName?.[0] || 'D'
                          )}
                        </div>
                        <div className={`px-4 py-2 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-2 ${isPunchedIn ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-white/5 text-white/30 border border-white/5'}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${isPunchedIn ? 'bg-green-500 animate-pulse' : 'bg-white/20'}`} />
                          {isPunchedIn ? 'Punched In' : 'Punched Out'}
                        </div>
                        {devUnreadCounts[dev.uid] > 0 && (
                          <div className="px-4 py-2 bg-[#00F2FF]/10 text-[#00F2FF] border border-[#00F2FF]/20 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-[#00F2FF] animate-pulse" />
                             Signal: {devUnreadCounts[dev.uid]}
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <h4 className="text-xl font-bold text-white uppercase tracking-tight">{dev.displayName}</h4>
                        <p className="text-xs font-bold text-white/40 uppercase tracking-widest">{dev.email}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                          <p className="text-[8px] font-black uppercase text-white/20 tracking-widest mb-1">Weekly Hours</p>
                          <p className="text-xl font-black italic text-[#c7c42a]">{stats.totalHours}h</p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                          <p className="text-[8px] font-black uppercase text-white/20 tracking-widest mb-1">Weekly Payout</p>
                          <p className="text-xl font-black italic text-green-500">₹{stats.totalPayout.toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-2">
                        <div className="text-center p-3 bg-white/5 rounded-2xl border border-white/5 hover:border-[#c7c42a]/30 transition-all">
                          <div className="text-xl font-black text-white italic">{completed}</div>
                          <div className="text-[6px] font-black text-white/30 uppercase tracking-[0.2em]">Done</div>
                        </div>
                        <div className="text-center p-3 bg-white/5 rounded-2xl border border-white/5 hover:border-[#00F2FF]/30 transition-all">
                          <div className="text-xl font-black text-white italic">{active}</div>
                          <div className="text-[6px] font-black text-white/30 uppercase tracking-[0.2em]">Active</div>
                        </div>
                        <div className="text-center p-3 bg-white/5 rounded-2xl border border-white/5 hover:border-[#c7c42a]/30 transition-all">
                          <div className="text-xl font-black text-[#c7c42a] italic">{efficiency}%</div>
                          <div className="text-[6px] font-black text-white/30 uppercase tracking-[0.2em]">Efficiency</div>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-white/5 flex gap-2">
                         <button onClick={() => { setSelectedUser(dev); setShowDirectChat(true); }} className="flex-1 py-3 bg-[#c7c42a] text-black rounded-xl font-bold text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">Message</button>
                         <button className="flex-1 py-3 bg-white/5 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-white/10">Profile</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>}
            {activeTab === 'analytics' && renderAnalytics()}
            {activeTab === 'messages' && renderMessages()}
            {activeTab === 'recycle' && renderRecycleBin()}
            {activeTab === 'system' && renderSystem()}
            {activeTab === 'meetings' && (
              <div className="space-y-12">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-[#c7c42a] uppercase tracking-[0.3em]">Scheduling</span>
                  <h2 className="text-6xl font-bold tracking-tighter text-white uppercase italic">Meeting Manager</h2>
                </div>
                <MeetingList user={user} profile={profile!} allClients={users.filter(u => u.role === 'client')} />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
        <BottomNav userId={user!.uid} role="admin" onOpenMessages={() => setActiveTab('messages')} />
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
              className="relative bg-black/90 backdrop-blur-xl border border-white/10 shadow-2xl rounded-[3rem] p-12"
            >
              <h3 className="text-4xl font-bold tracking-tighter text-white mb-2">Reject Project</h3>
              <p className="text-white/40 text-sm font-bold uppercase tracking-widest mb-8">Specify Reason</p>
              <textarea 
                className="w-full p-6 rounded-3xl bg-black/20 border border-white/10 text-white focus:outline-none focus:border-[#c7c42a]/50 h-40 mb-8 resize-none placeholder:text-white/20"
                placeholder="Reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
              <div className="flex flex-col gap-4">
                <button onClick={handleReject} className="w-full bg-[#c7c42a] text-black py-5 rounded-full font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all">
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
              className="relative bg-black/90 backdrop-blur-xl border border-white/10 shadow-2xl rounded-[3rem] p-12"
            >
              <h3 className="text-4xl font-bold tracking-tighter text-white mb-2">Update Status</h3>
              <p className="text-white/40 text-sm font-bold uppercase tracking-widest mb-10">{selectedProject?.businessName}</p>
              
              <div className="relative mb-12">
                <input 
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  className="w-full h-2 bg-black/20 rounded-full appearance-none cursor-pointer accent-[#c7c42a]"
                  value={newProgress}
                  onChange={(e) => setNewProgress(parseInt(e.target.value))}
                />
                <div className="text-7xl font-bold text-white mt-8 tabular-nums">{newProgress}%</div>
              </div>

              <div className="flex flex-col gap-4">
                <button onClick={handleUpdateProgress} className="w-full bg-[#c7c42a] text-black py-5 rounded-full font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all">
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
              className="bg-black/95 backdrop-blur-2xl border-l border-white/10 shadow-2xl rounded-l-[3rem] flex flex-col relative w-full max-w-xl h-full"
            >
              <div className="p-10 border-b border-white/5 flex justify-between items-center">
                <div>
                  <h2 className="text-4xl font-bold tracking-tighter text-white">PROJECT CHAT</h2>
                  <div className="text-[10px] font-bold text-[#c7c42a] uppercase tracking-[0.4em] mt-2">{selectedProject.businessName}</div>
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
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#c7c42a] to-#c7c42a flex items-center justify-center text-black font-black text-lg">
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
                  <div className="text-[10px] font-bold text-[#c7c42a] uppercase tracking-[0.4em] mt-2">Project Details</div>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => {
                      const details = `
WEBBYLAUNCH PROJECT DETAILS
===========================
Project: ${viewingProject.businessName}
Status: ${viewingProject.status}
Plan: ${viewingProject.plan || 'N/A'}
Price: ${viewingProject.plan === 'basic' ? '₹1,499/-' : viewingProject.plan === 'standard' ? '₹3,499/-' : '₹9,999/-'}

CLIENT DETAILS
--------------
Client Name: ${viewingProject.userName}
Client Email: ${viewingProject.userEmail}
Client Phone: ${viewingProject.userPhone || 'N/A'}

BUSINESS DETAILS
----------------
Business Name: ${viewingProject.businessName}
Business Type: ${viewingProject.businessType}
Business Phone: ${viewingProject.businessPhone || 'N/A'}
Business Email: ${viewingProject.businessEmail || 'N/A'}
Location: ${viewingProject.businessLocation || 'N/A'}
Address: ${viewingProject.addressLine || 'N/A'}
GST: ${viewingProject.gstNumber || 'Not provided'}

DESIGN & FEATURES
-----------------
Primary Color: ${viewingProject.primaryColor}
Secondary Color: ${viewingProject.secondaryColor}
Domain Requested: ${viewingProject.domain || viewingProject.domainPreferences?.join(', ') || 'N/A'}

SELECTED FEATURES:
${(viewingProject.selectedFeatures || []).map((f: string) => `- ${f}`).join('\n') || 'None selected'}

DESCRIPTION:
${viewingProject.description}
                      `;
                      const blob = new Blob([details], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `${viewingProject.businessName}_full_details.txt`;
                      link.click();
                      toast.success('Project details downloaded');
                    }}
                    className="p-4 bg-[#c7c42a] text-black rounded-full hover:scale-110 transition-all flex items-center gap-2"
                    title="Download All Details"
                  >
                    <Download size={20} />
                    <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Details</span>
                  </button>

                  <button 
                    onClick={() => {
                      const prompt = `
Build me a fully responsive website for my ${viewingProject.businessType} business.

Business Name: ${viewingProject.businessName}
Description: ${viewingProject.description}

Design Aesthetic:
- Primary Color: ${viewingProject.primaryColor}
- Secondary Color: ${viewingProject.secondaryColor}
- Style: ${viewingProject.businessType === 'Logistics' ? 'Industrial Corporate / Tech-Noir Hybrid' : 'Modern & Professional'}

Features required:
${(viewingProject.selectedFeatures || []).map((f: string) => `- ${f}`).join('\n')}

Technical Requirements:
- Fully Responsive (Mobile/Tablet/Desktop)
- Modern UI with sharp edges and premium typography
- Fast loading speed
- Basic SEO optimized
${(viewingProject.selectedFeatures || []).includes('Booking System') ? '- Implement a high-end booking/scheduling system' : ''}
${(viewingProject.selectedFeatures || []).includes('Google Login System') ? '- Secure Google Authentication' : ''}

Contact Information for Footer:
- Phone: ${viewingProject.businessPhone || viewingProject.userPhone}
- Email: ${viewingProject.businessEmail || viewingProject.userEmail}
- Location: ${viewingProject.city}, ${viewingProject.state}

Specific Project Brief:
${viewingProject.description}
                      `;
                      const blob = new Blob([prompt], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `${viewingProject.businessName}_ai_prompt.txt`;
                      link.click();
                      toast.success('AI Prompt downloaded');
                    }}
                    className="p-4 bg-[#00F2FF] text-black rounded-full hover:scale-110 transition-all flex items-center gap-2"
                    title="Download AI Prompt"
                  >
                    <ExternalLink size={20} />
                    <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">AI Prompt</span>
                  </button>

                  <button onClick={() => setShowProjectDetailModal(false)} className="p-4 hover:bg-white/5 rounded-full text-white transition-all">
                    <X size={24} />
                  </button>
                </div>
              </div>

              {/* Tab Switcher */}
              <div className="flex gap-4 mb-10 border-b border-white/5 pb-4">
                <button 
                  onClick={() => setModalTab('overview')}
                  className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${modalTab === 'overview' ? 'bg-[#c7c42a] text-black' : 'text-white/40 hover:text-white'}`}
                >
                  Overview
                </button>
                <button 
                  onClick={() => setModalTab('preview')}
                  className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${modalTab === 'preview' ? 'bg-[#c7c42a] text-black' : 'text-white/40 hover:text-white'}`}
                >
                  Preview
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
                          <span className="text-xs font-bold text-[#c7c42a] uppercase">{viewingProject.plan || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Status</span>
                          <span className="text-xs font-bold text-white uppercase">{viewingProject.status}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Progress</span>
                          <span className="text-xs font-bold text-white uppercase">{viewingProject.progress}%</span>
                        </div>
                        {viewingProject.developerId && (
                          <div className="flex justify-between">
                            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Developer</span>
                            <span className="text-xs font-bold text-[#c7c42a] uppercase">
                              {users.find(u => u.uid === viewingProject.developerId)?.displayName || 'Assigned'}
                            </span>
                          </div>
                        )}
                      </div>
                    </section>

                    <section>
                      <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-4 italic">Domain Preferences</h4>
                      <div className="bg-[#c7c42a]/5 p-6 rounded-3xl border border-[#c7c42a]/10 space-y-3">
                        {[0, 1, 2].map((idx) => (
                          <div key={idx} className="flex justify-between items-center">
                            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">
                              {idx === 0 ? '1st' : idx === 1 ? '2nd' : '3rd'} Preference
                            </span>
                            <span className={`text-[10px] font-black uppercase italic ${idx === 0 ? 'text-[#c7c42a]' : 'text-white/60'}`}>
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
                      <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-4 italic">Selected Features</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {(viewingProject.selectedFeatures || []).map((feature: string, i: number) => (
                           <div key={i} className="bg-white/5 p-3 rounded-xl border border-white/5 flex items-center gap-3">
                              <Check size={12} className="text-[#c7c42a]" />
                              <span className="text-[10px] font-bold text-white uppercase tracking-wider">{feature}</span>
                           </div>
                        ))}
                      </div>
                    </section>

                    <section>
                      <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-4 italic">Internal Notes</h4>
                      <div className="bg-[#c7c42a]/5 p-6 rounded-3xl border border-[#c7c42a]/10">
                        <p className="text-xs font-medium text-[#c7c42a]/70 leading-relaxed italic">{viewingProject.internalNotes || 'No internal notes added.'}</p>
                      </div>
                    </section>

                    <section>
                      <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-4 italic">Files & Assets</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {viewingProject.logoUrl && (
                          <a href={viewingProject.logoUrl} target="_blank" rel="noreferrer" className="bg-black/20 p-4 rounded-2xl border border-white/5 flex flex-col items-center gap-2 hover:bg-white/5 transition-all">
                            <FileText size={24} className="text-[#c7c42a]" />
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
                <div className="space-y-8 animate-in fade-in zoom-in duration-500">
                  <div className="flex justify-between items-center mb-8">
                     <div>
                        <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-1 italic">Visual Mockup</h4>
                        <p className="text-2xl font-black text-white italic tracking-tighter">WEBSITE PREVIEW</p>
                     </div>
                     <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/5">
                        <button 
                          onClick={() => setPreviewDevice('desktop')}
                          className={`p-3 rounded-xl transition-all ${previewDevice === 'desktop' ? 'bg-[#c7c42a] text-black' : 'text-white/40'}`}
                        >
                          <Monitor size={16} />
                        </button>
                        <button 
                          onClick={() => setPreviewDevice('tablet')}
                          className={`p-3 rounded-xl transition-all ${previewDevice === 'tablet' ? 'bg-[#c7c42a] text-black' : 'text-white/40'}`}
                        >
                          <Tablet size={16} />
                        </button>
                        <button 
                          onClick={() => setPreviewDevice('mobile')}
                          className={`p-3 rounded-xl transition-all ${previewDevice === 'mobile' ? 'bg-[#c7c42a] text-black' : 'text-white/40'}`}
                        >
                          <Smartphone size={16} />
                        </button>
                     </div>
                  </div>
                  
                  <div className="min-h-[600px] flex items-center justify-center bg-black/40 rounded-[3rem] border border-white/5 p-12 border-dashed">
                    <WebsitePreview data={viewingProject} device={previewDevice} />
                  </div>
                </div>
              )}
              
              <div className="mt-12 pt-10 border-t border-white/5 flex gap-4">
                <button 
                  onClick={() => { setEditingProjectDetails(viewingProject); setShowProjectDetailModal(false); setShowProjectModal(true); }}
                  className="flex-1 bg-[#c7c42a] text-black py-5 rounded-full font-black uppercase italic text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl"
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
                  <div className="text-[10px] font-bold text-[#c7c42a] uppercase tracking-[0.4em] mt-2">Configuration</div>
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
                      className="w-full p-6 rounded-2xl bg-black/20 border border-white/10 text-white focus:outline-none focus:border-[#c7c42a]/50 font-bold uppercase tracking-widest"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-4 italic">Client Name</label>
                    <input 
                      name="userName"
                      defaultValue={editingProjectDetails?.userName}
                      required
                      className="w-full p-6 rounded-2xl bg-black/20 border border-white/10 text-white focus:outline-none focus:border-[#c7c42a]/50 font-bold uppercase tracking-widest"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-4 italic">Client Email</label>
                    <input 
                      name="userEmail"
                      type="email"
                      defaultValue={editingProjectDetails?.userEmail}
                      required
                      className="w-full p-6 rounded-2xl bg-black/20 border border-white/10 text-white focus:outline-none focus:border-[#c7c42a]/50 font-bold uppercase tracking-widest"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-4 italic">Project Type</label>
                      <input 
                        name="businessType"
                        defaultValue={editingProjectDetails?.businessType}
                        required
                        className="w-full p-6 rounded-2xl bg-black/20 border border-white/10 text-white focus:outline-none focus:border-[#c7c42a]/50 font-bold uppercase tracking-widest"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-4 italic">Plan</label>
                      <select 
                        name="plan"
                        defaultValue={editingProjectDetails?.plan}
                        className="w-full p-6 rounded-2xl bg-black/20 border border-white/10 text-white focus:outline-none focus:border-[#c7c42a]/50 font-bold uppercase tracking-widest appearance-none"
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
                        className="w-full p-6 rounded-2xl bg-black/20 border border-white/10 text-white focus:outline-none focus:border-[#c7c42a]/50 font-bold uppercase tracking-widest"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-4 italic">Deadline</label>
                      <input 
                        name="deadline"
                        type="date"
                        defaultValue={editingProjectDetails?.deadline ? new Date(editingProjectDetails.deadline as any).toISOString().split('T')[0] : ''}
                        className="w-full p-6 rounded-2xl bg-black/20 border border-white/10 text-white focus:outline-none focus:border-[#c7c42a]/50 font-bold uppercase tracking-widest"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-4 italic">Status</label>
                    <select 
                      name="status"
                      defaultValue={editingProjectDetails?.status}
                      className="w-full p-6 rounded-2xl bg-black/20 border border-white/10 text-white focus:outline-none focus:border-[#c7c42a]/50 font-bold uppercase tracking-widest appearance-none"
                    >
                      <option value="Waiting for Review">Waiting for Review</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Accepted">Accepted</option>
                      <option value="Development Started">Development Started</option>
                      <option value="assigned">Assigned to Developer</option>
                      <option value="pending">Pending Developer Accept</option>
                      <option value="Completed">Completed</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-4 italic">Assign Developer</label>
                    <select 
                      name="developerId"
                      defaultValue={editingProjectDetails?.developerId || editingProjectDetails?.assignedTo}
                      className="w-full p-6 rounded-2xl bg-black/20 border border-white/10 text-white focus:outline-none focus:border-[#c7c42a]/50 font-bold uppercase tracking-widest appearance-none"
                    >
                      <option value="">No Developer Assigned</option>
                      {users.filter(u => u.role === 'developer').map(dev => (
                        <option key={dev.uid} value={dev.uid}>{dev.displayName || dev.email}</option>
                      ))}
                    </select>
                  </div>
                  <input type="hidden" name="assignedTo" defaultValue={editingProjectDetails?.assignedTo || editingProjectDetails?.developerId} />
                  <input type="hidden" name="domain" id="project-domain-input" defaultValue={editingProjectDetails?.domain} />
                  <DomainSelect 
                    initialValue={editingProjectDetails?.domain} 
                    onSelect={(domain) => {
                      const input = document.getElementById('project-domain-input') as HTMLInputElement;
                      if (input) input.value = domain;
                    }} 
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-4 italic">Basic Payment Link</label>
                      <input 
                        name="paymentLinkBasic"
                        defaultValue={editingProjectDetails?.paymentLinkBasic}
                        placeholder="https://buy.stripe.com/..."
                        className="w-full p-6 rounded-2xl bg-black/20 border border-white/10 text-white focus:outline-none focus:border-[#c7c42a]/50 font-bold text-xs"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-4 italic">Premium Payment Link</label>
                      <input 
                        name="paymentLinkPremium"
                        defaultValue={editingProjectDetails?.paymentLinkPremium}
                        placeholder="https://buy.stripe.com/..."
                        className="w-full p-6 rounded-2xl bg-black/20 border border-white/10 text-white focus:outline-none focus:border-[#c7c42a]/50 font-bold text-xs"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-4 italic">Description</label>
                    <textarea 
                      name="description"
                      defaultValue={editingProjectDetails?.description}
                      className="w-full p-6 rounded-2xl bg-black/20 border border-white/10 text-white focus:outline-none focus:border-[#c7c42a]/50 font-bold uppercase tracking-widest h-32 resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-4 italic">Internal Notes</label>
                    <textarea 
                      name="internalNotes"
                      defaultValue={editingProjectDetails?.internalNotes}
                      className="w-full p-6 rounded-2xl bg-black/20 border border-white/10 text-[#c7c42a] focus:outline-none focus:border-[#c7c42a]/50 font-bold uppercase tracking-widest h-32 resize-none placeholder:text-[#c7c42a]/20"
                      placeholder="Admin only notes..."
                    />
                  </div>
                </div>

                <div className="col-span-full mt-8 flex gap-4">
                  <button type="submit" className="flex-1 bg-[#c7c42a] text-black py-5 rounded-full font-black uppercase italic text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl">
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

      {/* Developer Invite Modal */}
      <AnimatePresence>
        {isInviteModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[100] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#111] w-full max-w-2xl rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl"
            >
              <div className="p-10 border-b border-white/5 flex justify-between items-center bg-[#c7c42a]">
                <div>
                  <h3 className="text-2xl font-bold text-black uppercase italic leading-none">Assemble Crew</h3>
                  <p className="text-[10px] font-black text-black/50 uppercase tracking-widest mt-2 font-mono">ID: {inviteForm.code}</p>
                </div>
                <button onClick={() => setIsInviteModalOpen(false)} className="p-3 bg-black/10 rounded-2xl hover:bg-black/20 transition-all text-black">
                  <X size={24} />
                </button>
              </div>

              <div className="p-12 space-y-8 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-4 italic">Full Name</label>
                    <input 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-[#c7c42a]/50 transition-all placeholder:text-white/10"
                      placeholder="e.g. John Doe"
                      value={inviteForm.name}
                      onChange={(e) => setInviteForm({...inviteForm, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-4 italic">Email Protocol</label>
                    <input 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-[#c7c42a]/50 transition-all placeholder:text-white/10"
                      placeholder="dev@webbylaunch.com"
                      value={inviteForm.email}
                      onChange={(e) => setInviteForm({...inviteForm, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-4 italic">Rank / Role</label>
                    <select 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-[#c7c42a]/50 transition-all appearance-none"
                      value={inviteForm.role}
                      onChange={(e) => setInviteForm({...inviteForm, role: e.target.value as any})}
                    >
                      <option value="developer" className="bg-black text-white">Developer</option>
                      <option value="senior developer" className="bg-black text-white">Senior Developer</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-4 italic">Experience (Yrs)</label>
                    <input 
                      type="number"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-[#c7c42a]/50 transition-all placeholder:text-white/10"
                      placeholder="e.g. 5"
                      value={inviteForm.experience}
                      onChange={(e) => setInviteForm({...inviteForm, experience: e.target.value})}
                    />
                  </div>
                   <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-4 italic">Deployment Date</label>
                    <input 
                      type="date"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-[#c7c42a]/50 transition-all"
                      value={inviteForm.joiningDate}
                      onChange={(e) => setInviteForm({...inviteForm, joiningDate: e.target.value})}
                    />
                  </div>
                </div>

                <div className="p-8 bg-white/5 rounded-3xl border border-white/5 space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-[#c7c42a] uppercase tracking-widest">Payment Links Configuration</h4>
                    <span className="text-[8px] font-black text-white/20 uppercase tracking-widest italic">Mission Critical: Direct Pay</span>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <p className="text-[9px] font-black text-white/40 uppercase tracking-widest ml-1">One-Time Project Links</p>
                      <div className="grid grid-cols-3 gap-3">
                        {['basic', 'standard', 'premium'].map((plan) => (
                          <div key={plan} className="space-y-1">
                            <label className="text-[7px] font-black text-white/20 uppercase tracking-widest ml-2">{plan}</label>
                            <input 
                              placeholder="URL"
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[10px] text-white outline-none focus:border-[#c7c42a]/50 transition-all"
                              value={inviteForm.paymentLinks.oneTime[plan as keyof typeof inviteForm.paymentLinks.oneTime]}
                              onChange={(e) => setInviteForm({
                                ...inviteForm,
                                paymentLinks: {
                                  ...inviteForm.paymentLinks,
                                  oneTime: { ...inviteForm.paymentLinks.oneTime, [plan]: e.target.value }
                                }
                              })}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-8 bg-white/5 rounded-3xl border border-white/5 space-y-4">
                  <h4 className="text-xs font-black text-[#c7c42a] uppercase tracking-widest">Clearance Level</h4>
                  <div className="flex gap-4">
                    {Object.keys(inviteForm.permissions).map((key) => (
                      <button
                        key={key}
                        onClick={() => setInviteForm({
                          ...inviteForm,
                          permissions: {
                            ...inviteForm.permissions,
                            [key as keyof typeof inviteForm.permissions]: !inviteForm.permissions[key as keyof typeof inviteForm.permissions]
                          }
                        })}
                        className={`flex-1 py-3 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all border ${
                          inviteForm.permissions[key as keyof typeof inviteForm.permissions]
                            ? 'bg-[#c7c42a]/10 border-[#c7c42a] text-[#c7c42a]'
                            : 'bg-white/5 border-white/10 text-white/20'
                        }`}
                      >
                        {key.replace(/([A-Z])/g, ' $1')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-10 bg-black/20 border-t border-white/5">
                <button 
                  onClick={handleCreateInvite}
                  className="w-full py-5 bg-[#c7c42a] text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_30px_rgba(199, 196, 42,0.3)]"
                >
                  Generate Invite Link
                </button>
              </div>
            </motion.div>
          </motion.div>
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
              className="relative bg-black border-white/10 shadow-2xl rounded-[3rem] p-12 max-w-md w-full border border-red-500/20"
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
        hover:bg-[rgba(255,255,255,0.05)] active:bg-[#2A3942]
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
          <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 border-2 border-[transparent] rounded-full bg-[#c7c42a]"></div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-0.5">
          <h3 className="text-[17px] font-medium text-[#E9EDEF] truncate">
            {u.displayName || 'User'}
          </h3>
          <span className={`text-xs ${msgCount > 0 ? 'text-[#c7c42a]' : 'text-[#8696A0]'}`}>
            {lastMessage ? formatTime(lastMessage.createdAt) : ''}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 min-w-0 flex-1">
            {lastMessage?.senderId === adminId && (
              <CheckCheck size={16} className={lastMessage.seen ? 'text-[#c7c42a]' : 'text-[#8696A0]'} />
            )}
            {lastMessage?.attachments?.length > 0 && (
              <Camera size={14} className="text-[#8696A0] shrink-0" />
            )}
            <p className={`text-sm truncate ${msgCount > 0 ? 'text-[#E9EDEF] font-medium' : 'text-[#8696A0]'}`}>
              {lastMessage ? lastMessage.text : 'No messages yet...'}
            </p>
          </div>
          
          {msgCount > 0 && (
            <div className="bg-[#c7c42a] text-[transparent] text-xs font-bold min-w-[20px] h-5 flex items-center justify-center px-1.5 rounded-full shrink-0 ml-2">
              {msgCount}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
