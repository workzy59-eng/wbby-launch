import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  User,
  ChevronRight,
  Search,
  Calendar as CalendarIcon,
  Filter,
  Mail,
  Phone,
  ArrowUpRight,
  RefreshCcw,
  MapPin,
  FileText,
  Plus,
  Shield,
  Activity,
  Award
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { toast } from 'react-hot-toast';
import { formatDate } from '../lib/utils';
import { 
  getProfiles, 
  updateProfile, 
  getProjectsAsync, 
  getAllLeaveRequests, 
  updateLeaveRequest,
  getAllAttendance,
  sendDirectMessage,
  createDeveloperInvite,
  getDeveloperInvites,
  getVisitSessions
} from '../services/database';
import ChatSystem from '../components/ChatSystem';
import MessagesModule from '../components/MessagesModule';

interface AdminDashboardProps {
  user: FirebaseUser | null;
  profile: UserProfile | null;
}

type Tab = 'overview' | 'clients' | 'developer-leads' | 'projects' | 'leaves' | 'attendance' | 'messages';

interface DeveloperInvite {
  id?: string;
  name: string;
  email: string;
  code: string;
  role: 'developer' | 'senior developer';
  permissions: {
    canChat: boolean;
    canUpload: boolean;
    canViewProjects: boolean;
  };
  joiningDate: string;
  createdBy: string;
  createdAt: any;
  used: boolean;
}

interface VisitSession {
  id: string;
  userId: string;
  startTime: any;
  endTime: any;
  durationMinutes: number;
}

const Loader = ({ color = "white" }: { color?: string }) => (
  <div className="flex items-center justify-center gap-2">
    <motion.div
      animate={{
        scale: [1, 1.2, 1],
        rotate: [0, 180, 360],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className={`w-6 h-6 border-2 border-${color === 'white' ? 'white' : '[#c7c42a]'} border-t-transparent rounded-full`}
    />
    <span className={`text-[10px] font-black uppercase tracking-[0.2em] text-${color === 'white' ? 'white' : '[#c7c42a]'} animate-pulse italic`}>Loading...</span>
  </div>
);

export default function AdminDashboard({ user, profile }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [invites, setInvites] = useState<DeveloperInvite[]>([]);
  const [sessions, setSessions] = useState<VisitSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChatUser, setSelectedChatUser] = useState<UserProfile | null>(null);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [isGeneratingWarning, setIsGeneratingWarning] = useState<string | null>(null);

  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [viewingDescription, setViewingDescription] = useState<Project | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const [inviteForm, setInviteForm] = useState({
    name: '',
    email: '',
    code: Math.random().toString(36).substring(2, 8).toUpperCase(),
    role: 'developer' as 'developer' | 'senior developer',
    joiningDate: new Date().toISOString().split('T')[0],
    permissions: {
      canChat: true,
      canUpload: true,
      canViewProjects: true
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [allProfiles, allProjects, allLeaves, allAttendance, allInvites, allSessions] = await Promise.all([
          getProfiles(),
          getProjectsAsync(),
          getAllLeaveRequests(),
          getAllAttendance(),
          getDeveloperInvites(),
          getVisitSessions()
        ]);

        // Enrich attendance with user names if missing
        const enrichedAttendance = allAttendance.map(record => {
          const userProfile = allProfiles.find(p => p.uid === record.userId);
          return {
            ...record,
            userName: record.userName || userProfile?.displayName || 'Unknown Developer',
            checkInTime: record.checkInTime || record.inTime || '--:--'
          };
        });

        setProfiles(allProfiles);
        setProjects(allProjects);
        setLeaveRequests(allLeaves);
        setAttendance(enrichedAttendance);
        setInvites(allInvites as DeveloperInvite[]);
        setSessions(allSessions as VisitSession[]);
      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCreateInvite = async () => {
    if (!inviteForm.name || !inviteForm.email) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (!user) return;
      const inviteData: DeveloperInvite = {
        ...inviteForm,
        email: inviteForm.email.toLowerCase(),
        createdBy: user.uid,
        createdAt: new Date(),
        used: false
      };

      await createDeveloperInvite(inviteData);
      setInvites(prev => [inviteData, ...prev]);
      setIsInviteModalOpen(false);
      setInviteForm({
        name: '',
        email: '',
        code: Math.random().toString(36).substring(2, 8).toUpperCase(),
        role: 'developer',
        joiningDate: new Date().toISOString().split('T')[0],
        permissions: {
          canChat: true,
          canUpload: true,
          canViewProjects: true
        }
      });
      toast.success("Developer invite created!");
    } catch (error: any) {
      toast.error(error.message || "Failed to create invite");
    }
  };

  const getDevStats = (devId: string) => {
    const devProjects = projects.filter(p => p.developerId === devId);
    const completed = devProjects.filter(p => p.status?.toLowerCase() === 'completed').length;
    const pending = devProjects.filter(p => ['pending', 'waiting for review', 'under review', 'accepted', 'development started', 'in-progress'].includes(p.status?.toLowerCase() || '')).length;
    const rejected = devProjects.filter(p => p.status?.toLowerCase() === 'rejected').length;
    const total = devProjects.length;
    const efficiency = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    const devSessions = sessions.filter(s => s.userId === devId);
    const totalMinutes = devSessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
    const activeHours = Math.round(totalMinutes / 60);

    return { total, completed, pending, rejected, efficiency, activeHours };
  };

  const handleUpdateProject = async (projectId: string, updates: Partial<Project>) => {
    try {
      const { updateProject } = await import('../services/database');
      await updateProject(projectId, updates);
      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, ...updates } : p));
      setEditingProject(null);
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

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

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const val = row[header];
        return `"${val?.toString().replace(/"/g, '""') || ''}"`;
      }).join(','))
    ];
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadDescription = (project: Project, format: 'pdf' | 'txt') => {
    const content = `
WebbyLaunch Project Details
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
      doc.text(`Logo: ${project.logoUrl ? 'Uploaded' : 'No Logo Uploaded'}`, 25, 122);

      // Section 3: Description
      doc.setFontSize(16);
      doc.text('3. DESCRIPTION', 20, 137);
      doc.setFontSize(10);
      doc.text(`Business Name: ${project.businessName || 'Not Provided'}`, 25, 147);
      const splitDescription = doc.splitTextToSize(`Description Content: ${project.description || 'Not Provided'}`, 160);
      doc.text(splitDescription, 25, 154);

      // Section 4: User Personal Details
      const descriptionHeight = splitDescription.length * 5;
      const userSectionY = 154 + descriptionHeight + 10;
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
                { label: 'Total Clients', value: profiles.filter(p => p.role === 'client').length, icon: User, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                { label: 'Total Developers', value: profiles.filter(p => p.role === 'developer').length, icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                { label: 'Active Projects', value: projects.length, icon: Briefcase, color: 'text-[#00F2FF]', bg: 'bg-[#00F2FF]/10' },
                { label: 'Pending Leaves', value: leaveRequests.filter(r => r.status === 'pending').length, icon: Clock, color: 'text-#c7c42a', bg: 'bg-#c7c42a/10' },
              ].map((stat, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-slate-900/40 border border-white/5 rounded-3xl p-8 space-y-4 hover:border-[#00F2FF]/30 transition-all group backdrop-blur-xl"
                >
                  <div className="flex justify-between items-start">
                    <div className={`p-3 ${stat.bg} rounded-2xl ${stat.color} group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(0,0,0,0.2)]`}>
                      <stat.icon size={24} />
                    </div>
                    <ArrowUpRight size={16} className="text-slate-500 group-hover:text-[#00F2FF] transition-colors" />
                  </div>
                  <div>
                    <div className="text-4xl font-black text-white tracking-tighter">{stat.value}</div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.label}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-10 backdrop-blur-xl">
                <h3 className="text-2xl font-black text-white uppercase italic mb-8">Pending Developer Requests</h3>
                <div className="space-y-4">
                  {profiles.filter(p => p.role === 'developer' && p.status === 'pending').map((dev, idx) => (
                    <div key={idx} className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#00F2FF] rounded-xl flex items-center justify-center text-black font-black italic shadow-[0_0_15px_rgba(0,242,255,0.1)]">
                          {dev.displayName?.[0]}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white uppercase italic">{dev.displayName}</div>
                          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{dev.devRole} • {dev.experience} Years Exp</div>
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
                    <div className="text-center py-12 text-slate-500 font-black uppercase tracking-widest italic">No pending requests</div>
                  )}
                </div>
              </div>

              <div className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-10 backdrop-blur-xl">
                <h3 className="text-2xl font-black text-white uppercase italic mb-8">Pending Leave Requests</h3>
                <div className="space-y-4">
                  {leaveRequests.filter(r => r.status === 'pending').map((req, idx) => (
                    <div key={idx} className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all group">
                      <div>
                        <div className="text-sm font-bold text-white uppercase italic">{req.userName}</div>
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{formatDate(req.startDate)} to {formatDate(req.endDate)}</div>
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
                    <div className="text-center py-12 text-slate-500 font-black uppercase tracking-widest italic">No pending leaves</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      case 'clients':
        const clients = profiles.filter(p => p.role === 'client');
        return (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter text-[#00F2FF]">Client Network</h2>
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                {clients.length} Registered Users
              </div>
            </div>
            <div className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-10 backdrop-blur-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clients.map((client, idx) => (
                  <div key={idx} className="p-8 bg-white/5 rounded-3xl border border-white/10 space-y-6 group hover:border-[#00F2FF]/40 transition-all relative overflow-hidden">
                    <div className="absolute -top-4 -right-4 w-24 h-24 bg-[#00F2FF]/5 rounded-full blur-2xl group-hover:bg-[#00F2FF]/10 transition-all" />
                    <div className="flex justify-between items-start relative z-10">
                      <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 font-black text-xl italic shadow-xl">
                        {client.displayName?.[0] || 'U'}
                      </div>
                      <div className="px-4 py-1 bg-green-500/20 text-green-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                        Active
                      </div>
                    </div>
                    <div className="relative z-10">
                      <h4 className="text-xl font-black text-white uppercase italic tracking-tighter truncate">{client.displayName || 'Unnamed User'}</h4>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest truncate">{client.email}</p>
                    </div>
                    <div className="pt-6 border-t border-white/5 flex justify-between items-center relative z-10">
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        <MapPin size={12} />
                        <span>{client.businessLocation || 'Remote'}</span>
                      </div>
                      <button 
                        onClick={() => setSelectedChatUser(client)}
                        className="text-[#00F2FF] font-black uppercase italic text-xs tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all"
                      >
                        Portal <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                ))}
                {clients.length === 0 && (
                  <div className="col-span-full py-20 text-center">
                    <Users size={48} className="mx-auto text-slate-700 mb-4 opacity-20" />
                    <p className="text-slate-600 font-black uppercase tracking-[0.3em] italic">No clients found in relay</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case 'leaves':
        return (
          <div className="space-y-8">
            <div className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-10 backdrop-blur-xl">
              <h3 className="text-2xl font-black text-white uppercase italic mb-8">All Leave Requests</h3>
              <div className="space-y-4">
                {leaveRequests.map((req, idx) => (
                  <div key={idx} className="flex items-center justify-between p-8 bg-white/5 rounded-3xl border border-white/5 hover:bg-white/10 transition-all">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-#c7c42a/10 rounded-2xl flex items-center justify-center text-#c7c42a">
                        <Clock size={28} />
                      </div>
                      <div>
                        <div className="text-lg font-black text-white uppercase italic">{req.userName}</div>
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">{formatDate(req.startDate)} to {formatDate(req.endDate)}</div>
                        <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-1">Reason: {req.reason}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        req.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                        req.status === 'declined' ? 'bg-red-500/20 text-red-400' :
                        'bg-#c7c42a/20 text-#c7c42a'
                      }`}>
                        {req.status}
                      </div>
                      {req.status === 'pending' && (
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
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'developer-leads':
        return (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter text-[#c7c42a]">Developer Leads</h2>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1">Recruitment & Talent Acquisition</p>
              </div>
              <button 
                onClick={() => setIsInviteModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-[#c7c42a] text-black font-black uppercase italic rounded-2xl hover:scale-105 transition-all shadow-[0_0_20px_rgba(199,196,42,0.3)]"
              >
                <Plus size={20} />
                <span>Invite New Lead</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-10 backdrop-blur-xl">
                <h3 className="text-2xl font-black text-white uppercase italic mb-8">Pending Developer Requests</h3>
                <div className="space-y-4">
                  {profiles.filter(p => p.role === 'developer' && p.status === 'pending').map((dev, idx) => (
                    <div key={idx} className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#00F2FF] rounded-xl flex items-center justify-center text-black font-black italic shadow-[0_0_15px_rgba(0,242,255,0.1)]">
                          {dev.displayName?.[0]}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white uppercase italic">{dev.displayName}</div>
                          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{dev.devRole} • {dev.experience} Years Exp</div>
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
                    <div className="text-center py-12 text-slate-500 font-black uppercase tracking-widest italic">No pending requests</div>
                  )}
                </div>
              </div>

              <div className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-10 backdrop-blur-xl">
                <h3 className="text-2xl font-black text-white uppercase italic mb-8">Active Invites</h3>
                <div className="space-y-4">
                  {invites.filter(i => !i.used).map((invite, idx) => (
                    <div key={idx} className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5">
                      <div>
                        <div className="text-sm font-bold text-white uppercase italic">{invite.name}</div>
                        <div className="text-[10px] font-black text-[#c7c42a] uppercase tracking-widest">{invite.code} • {invite.role}</div>
                      </div>
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        PENDING ONBOARDING
                      </div>
                    </div>
                  ))}
                  {invites.filter(i => !i.used).length === 0 && (
                    <div className="text-center py-12 text-slate-500 font-black uppercase tracking-widest italic">No active invites</div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xl">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                <input 
                  type="text" 
                  placeholder="Search crew members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent pl-12 pr-4 py-2 text-white font-bold uppercase tracking-widest outline-none placeholder:text-slate-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredDevelopers.map((dev, idx) => {
                const stats = getDevStats(dev.uid);
                return (
                  <div key={idx} className="bg-slate-900/40 border border-white/5 rounded-[2rem] p-8 space-y-6 group hover:border-[#c7c42a]/40 transition-all backdrop-blur-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Shield size={80} className="text-[#c7c42a]" />
                    </div>
                    
                    <div className="flex justify-between items-start relative z-10">
                      <div className="w-16 h-16 bg-[#c7c42a] rounded-2xl flex items-center justify-center text-black font-black text-2xl italic shadow-[0_0_20px_rgba(199,196,42,0.2)]">
                        {dev.displayName?.[0]}
                      </div>
                      <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        dev.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                        dev.status === 'declined' ? 'bg-red-500/20 text-red-400' :
                        'bg-[#c7c42a]/20 text-[#c7c42a]'
                      }`}>
                        {dev.status}
                      </div>
                    </div>

                    <div className="relative z-10">
                      <h4 className="text-xl font-black text-white uppercase italic tracking-tighter">{dev.displayName}</h4>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{dev.devRole}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 py-4 border-y border-white/5 relative z-10">
                      <div className="text-center">
                        <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Projects</div>
                        <div className="text-lg font-black text-white italic">{stats.total}</div>
                      </div>
                      <div className="text-center border-x border-white/5">
                        <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Efficiency</div>
                        <div className="text-lg font-black text-[#c7c42a] italic">{stats.efficiency}%</div>
                      </div>
                      <div className="text-center">
                        <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Hours</div>
                        <div className="text-lg font-black text-white italic">{stats.activeHours}h</div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 relative z-10">
                      <button className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-white/60 font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                        <Activity size={14} /> Analytics
                      </button>
                      <button 
                        onClick={() => setSelectedChatUser(dev)}
                        className="p-3 bg-[#c7c42a]/10 text-[#c7c42a] rounded-xl hover:bg-[#c7c42a] hover:text-black transition-all"
                      >
                        <Mail size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Invite Modal */}
            <AnimatePresence>
              {isInviteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-[#0f172a] border border-white/10 rounded-[2.5rem] w-full max-w-xl p-10 space-y-8 shadow-2xl relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-full h-1 bg-[#c7c42a]" />
                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Invite Developer</h3>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">Access Control & Onboarding</p>
                      </div>
                      <button onClick={() => setIsInviteModalOpen(false)} className="text-white/40 hover:text-white transition-colors">
                        <XCircle size={24} />
                      </button>
                    </div>

                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Full Name</label>
                          <input 
                            type="text" 
                            value={inviteForm.name}
                            onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                            placeholder="John Doe"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-[#c7c42a]"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Email Address</label>
                          <input 
                            type="email" 
                            value={inviteForm.email}
                            onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                            placeholder="john@example.com"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-[#c7c42a]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Invite Code</label>
                          <div className="relative">
                            <input 
                              type="text" 
                              value={inviteForm.code}
                              readOnly
                              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-[#c7c42a] font-black italic tracking-widest outline-none"
                            />
                            <button 
                              onClick={() => setInviteForm({ ...inviteForm, code: Math.random().toString(36).substring(2, 8).toUpperCase() })}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                            >
                              <RefreshCcw size={16} />
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Developer Role</label>
                          <select 
                            value={inviteForm.role}
                            onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value as any })}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-[#c7c42a] appearance-none"
                          >
                            <option value="developer">Developer</option>
                            <option value="senior developer">Senior Developer</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-4 pt-4 border-t border-white/5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Permissions</label>
                        <div className="grid grid-cols-3 gap-4">
                          {[
                            { id: 'canChat', label: 'Chat Access' },
                            { id: 'canUpload', label: 'File Upload' },
                            { id: 'canViewProjects', label: 'View Projects' }
                          ].map(perm => (
                            <label key={perm.id} className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-2xl cursor-pointer hover:border-[#c7c42a]/40 transition-all">
                              <input 
                                type="checkbox"
                                checked={(inviteForm.permissions as any)[perm.id]}
                                onChange={(e) => setInviteForm({ 
                                  ...inviteForm, 
                                  permissions: { ...inviteForm.permissions, [perm.id]: e.target.checked }
                                })}
                                className="w-4 h-4 rounded border-white/10 text-[#c7c42a] focus:ring-[#c7c42a] bg-transparent"
                              />
                              <span className="text-[10px] font-black text-white uppercase tracking-widest italic">{perm.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={handleCreateInvite}
                      className="w-full py-5 bg-[#c7c42a] text-black font-black uppercase italic rounded-2xl hover:scale-[1.02] transition-all shadow-[0_0_30px_rgba(199,196,42,0.3)] flex items-center justify-center gap-3"
                    >
                      <Plus size={20} strokeWidth={4} />
                      Generate Invite Link
                    </button>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        );
      case 'projects':
        return (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">All Projects</h2>
            </div>
            <div className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-10 backdrop-blur-xl">
              <h3 className="text-2xl font-black text-white uppercase italic mb-8">All Projects</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.map((project, idx) => (
                  <div key={idx} className="p-8 bg-white/5 rounded-3xl border border-white/10 space-y-6 group hover:border-[#00F2FF]/40 transition-all">
                    <div className="flex justify-between items-start">
                      <div className="w-14 h-14 bg-[#00F2FF] rounded-2xl flex items-center justify-center text-black font-black text-xl italic shadow-[0_0_20px_rgba(0,242,255,0.2)]">
                        {project.businessName?.[0]}
                      </div>
                      <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        project.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        project.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-#c7c42a/20 text-#c7c42a'
                      }`}>
                        {project.status}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-white uppercase italic tracking-tighter">{project.businessName}</h4>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{project.businessType} • {project.userEmail}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                          {project.businessPhone || project.businessNumber}
                        </div>
                        <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                          {project.city}, {project.state} • {project.pincode}
                        </div>
                      </div>
                    </div>

                    {/* File Display Section Removed */}
                    <div className="grid grid-cols-1 gap-4 py-4 border-y border-white/5">
                    </div>

                      <div className="pt-6 flex flex-wrap gap-4 justify-between items-center">
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Progress: {project.progress || 0}%</div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setViewingDescription(project)}
                            className="p-2 bg-white/5 border border-white/10 rounded-xl text-[#c7c42a] hover:bg-[#c7c42a] hover:text-black transition-all"
                            title="View Description"
                          >
                            <FileText size={16} />
                          </button>
                          <button 
                            onClick={() => setEditingProject(project)}
                            className="text-[#00F2FF] font-black uppercase italic text-xs tracking-widest flex items-center gap-2 hover:gap-4 transition-all"
                          >
                            Manage <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>
                  </div>
                ))}
                {projects.length === 0 && (
                  <div className="col-span-full text-center py-20 text-slate-500 font-black uppercase tracking-widest italic border-2 border-dashed border-white/5 rounded-3xl">
                    No projects found
                  </div>
                )}
              </div>
            </div>

            {/* Project Edit Modal */}
            <AnimatePresence>
              {viewingDescription && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-[#0f172a] border border-white/10 rounded-[2.5rem] w-full max-w-2xl p-10 space-y-8 shadow-2xl relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00F2FF] via-[#c7c42a] to-[#00F2FF]" />
                    
                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Project Prompt</h3>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">Generated for Developer</p>
                      </div>
                      <button onClick={() => setViewingDescription(null)} className="text-white/40 hover:text-white transition-colors">
                        <XCircle size={24} />
                      </button>
                    </div>

                    <div className="bg-black/40 rounded-3xl p-8 border border-white/5 font-mono text-sm leading-relaxed text-slate-300 relative group">
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => {
                            const prompt = `Build a modern, responsive website for a business named "${viewingDescription.businessName}".

The website should be designed based on the following details:

- Website Type / Description: ${viewingDescription.description || 'Not provided'}
- Primary Color: ${viewingDescription.primaryColor}
- Secondary Color: ${viewingDescription.secondaryColor}
- Business Phone: ${viewingDescription.businessPhone || viewingDescription.businessNumber || 'Not provided'}
- Business Email: ${viewingDescription.businessEmail || viewingDescription.userEmail || 'Not provided'}

Requirements:
- Pages: Home, About Us, Services, Contact
- Premium UI
- Responsive design`;
                            navigator.clipboard.writeText(prompt);
                            toast.success('Prompt copied to clipboard!');
                          }}
                          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-[#00F2FF] transition-all"
                        >
                          <RefreshCcw size={14} />
                        </button>
                      </div>
                      <p className="whitespace-pre-wrap">
                        Build a modern, responsive website for a business named <span className="text-[#c7c42a]">“{viewingDescription.businessName}”</span>.
                        {"\n\n"}
                        The website should be designed based on the following details:
                        {"\n\n"}
                        - Website Type / Description: <span className="text-slate-400">{viewingDescription.description || 'Not provided'}</span>
                        {"\n"}
                        - Primary Color: <span className="text-[#00F2FF]">{viewingDescription.primaryColor}</span>
                        {"\n"}
                        - Secondary Color: <span className="text-[#00F2FF]">{viewingDescription.secondaryColor}</span>
                        {"\n"}
                        - Business Phone: <span className="text-slate-400">{viewingDescription.businessPhone || viewingDescription.businessNumber || 'Not provided'}</span>
                        {"\n"}
                        - Business Email: <span className="text-slate-400">{viewingDescription.businessEmail || viewingDescription.userEmail || 'Not provided'}</span>
                        {"\n\n"}
                        Requirements:
                        {"\n"}
                        - Pages: Home, About Us, Services, Contact
                        {"\n"}
                        - Premium UI
                        {"\n"}
                        - Responsive design
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => handleDownloadDescription(viewingDescription, 'pdf')}
                        className="flex-1 py-4 rounded-xl border border-white/10 text-white font-bold uppercase tracking-widest hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                      >
                        <FileText size={16} /> Download PDF
                      </button>
                      <button 
                        onClick={() => {
                          const prompt = `Build a modern, responsive website for a business named "${viewingDescription.businessName}".

The website should be designed based on the following details:

- Website Type / Description: ${viewingDescription.description || 'Not provided'}
- Primary Color: ${viewingDescription.primaryColor}
- Secondary Color: ${viewingDescription.secondaryColor}
- Business Phone: ${viewingDescription.businessPhone || viewingDescription.businessNumber || 'Not provided'}
- Business Email: ${viewingDescription.businessEmail || viewingDescription.userEmail || 'Not provided'}

Requirements:
- Pages: Home, About Us, Services, Contact
- Premium UI
- Responsive design`;
                          navigator.clipboard.writeText(prompt);
                          toast.success('Prompt copied to clipboard!');
                        }}
                        className="flex-1 py-4 rounded-xl bg-[#c7c42a] text-black font-black uppercase italic hover:scale-105 transition-all shadow-[0_0_20px_rgba(199,196,42,0.2)] flex items-center justify-center gap-2"
                      >
                        Copy Full Prompt
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}

              {editingProject && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-[#0f172a] border border-white/10 rounded-[2.5rem] w-full max-w-lg p-10 space-y-8 shadow-2xl"
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Update Project</h3>
                      <button onClick={() => setEditingProject(null)} className="text-white/40 hover:text-white">
                        <XCircle size={24} />
                      </button>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Status</label>
                        <select 
                          value={editingProject.status}
                          onChange={(e) => setEditingProject({ ...editingProject, status: e.target.value as any })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-[#00F2FF]"
                        >
                          <option value="pending">Pending</option>
                          <option value="Under Review">Under Review</option>
                          <option value="Accepted">Accepted</option>
                          <option value="Development Started">Development Started</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Progress ({editingProject.progress}%)</label>
                        <input 
                          type="range"
                          min="0"
                          max="100"
                          value={editingProject.progress}
                          onChange={(e) => setEditingProject({ ...editingProject, progress: parseInt(e.target.value) })}
                          className="w-full h-2 bg-white/5 rounded-lg appearance-none cursor-pointer accent-[#c7c42a]"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Assign Developer</label>
                        <select 
                          value={editingProject.developerId || ''}
                          onChange={(e) => setEditingProject({ ...editingProject, developerId: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-[#00F2FF]"
                        >
                          <option value="">Unassigned</option>
                          {profiles.filter(p => p.role === 'developer' && p.status === 'approved').map(dev => (
                            <option key={dev.uid} value={dev.uid}>{dev.displayName} ({dev.devRole})</option>
                          ))}
                        </select>
                      </div>

                      {editingProject.status === 'rejected' && (
                        <div>
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Rejection Reason</label>
                          <textarea 
                            value={editingProject.rejectionReason || ''}
                            onChange={(e) => setEditingProject({ ...editingProject, rejectionReason: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-red-500 h-24 resize-none"
                            placeholder="Why was this project rejected?"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button 
                        onClick={() => setEditingProject(null)}
                        className="flex-1 py-4 rounded-xl border border-white/10 text-white font-bold uppercase tracking-widest hover:bg-white/5 transition-all"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={() => handleUpdateProject(editingProject.id, { 
                          status: editingProject.status, 
                          progress: editingProject.progress,
                          rejectionReason: editingProject.rejectionReason,
                          developerId: editingProject.developerId
                        })}
                        className="flex-1 py-4 rounded-xl bg-[#c7c42a] text-black font-black uppercase italic hover:scale-105 transition-all shadow-[0_0_20px_rgba(199,196,42,0.2)]"
                      >
                        Save Changes
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        );
      case 'attendance':
        return (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Attendance Logs</h2>
              <button 
                onClick={() => exportToCSV(attendance, 'attendance_logs')}
                className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-white/60 font-black uppercase tracking-widest hover:bg-white/10 transition-all"
              >
                Export CSV
              </button>
            </div>
            <div className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-10 backdrop-blur-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="pb-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Developer</th>
                      <th className="pb-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Date</th>
                      <th className="pb-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                      <th className="pb-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Check In</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {attendance.map((record, idx) => (
                      <tr key={idx} className="group hover:bg-white/5 transition-colors">
                        <td className="py-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-[#c7c42a]/20 rounded-lg flex items-center justify-center text-[#c7c42a] font-black text-xs italic">
                              {record.userName?.[0]}
                            </div>
                            <span className="text-sm font-bold text-white uppercase italic">{record.userName}</span>
                          </div>
                        </td>
                        <td className="py-6 text-xs font-bold text-slate-400">{formatDate(record.date)}</td>
                        <td className="py-6">
                          <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                            record.status === 'present' ? 'bg-green-500/20 text-green-400' :
                            record.status === 'absent' ? 'bg-red-500/20 text-red-400' :
                            'bg-#c7c42a/20 text-#c7c42a'
                          }`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="py-6 text-xs font-bold text-slate-500">{record.checkInTime || '--:--'}</td>
                      </tr>
                    ))}
                    {attendance.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-slate-500 font-black uppercase tracking-widest italic">No attendance records found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case 'messages':
        return (
          <MessagesModule 
            currentUser={user!}
            profile={profile}
            onClose={() => setActiveTab('overview')}
            fullScreen={false}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] font-sans selection:bg-[#c7c42a] selection:text-black text-slate-200">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-full w-80 bg-slate-900/40 backdrop-blur-3xl border-r border-white/5 z-40 p-10 flex flex-col hidden lg:flex">
        <div className="text-2xl font-black tracking-tighter text-white uppercase italic mb-12 flex items-center gap-3">
          <div className="w-8 h-8 bg-[#c7c42a] rounded-lg rotate-12 shadow-[0_0_20px_rgba(199,196,42,0.3)]" />
          Webby<span className="text-[#c7c42a]">Admin</span>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">
          <div className="mb-6">
            <p className="px-4 text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-4">Core Management</p>
            <div className="space-y-1">
              {[
                { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                { id: 'clients', label: 'Clients', icon: User },
                { id: 'projects', label: 'Projects', icon: Briefcase },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as Tab)}
                  className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all relative group ${
                    activeTab === item.id 
                      ? 'bg-[#00F2FF] text-black shadow-[0_0_20px_rgba(0,242,255,0.3)]' 
                      : 'text-slate-500 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <item.icon size={20} className="shrink-0" />
                  <span className="text-sm font-black uppercase italic tracking-widest">{item.label}</span>
                  {activeTab === item.id && (
                    <motion.div layoutId="active" className="absolute left-0 w-1 h-6 bg-black rounded-r-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <p className="px-4 text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-4">Sales Leads</p>
            <div className="space-y-1">
              {[
                { id: 'developer-leads', label: 'Developer Leads', icon: FileText },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as Tab)}
                  className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all relative group ${
                    activeTab === item.id 
                      ? 'bg-[#c7c42a] text-black shadow-[0_0_20px_rgba(199,196,42,0.3)]' 
                      : 'text-slate-500 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <item.icon size={20} className="shrink-0" />
                  <span className="text-sm font-black uppercase italic tracking-widest">{item.label}</span>
                  {activeTab === item.id && (
                    <motion.div layoutId="active" className="absolute left-0 w-1 h-6 bg-black rounded-r-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <p className="px-4 text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-4">Operations</p>
            <div className="space-y-1">
              {[
                { id: 'leaves', label: 'Leaves', icon: Clock },
                { id: 'attendance', label: 'Attendance', icon: CalendarIcon },
                { id: 'messages', label: 'Messages', icon: MessageSquare },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as Tab)}
                  className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all relative group ${
                    activeTab === item.id 
                      ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]' 
                      : 'text-slate-500 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <item.icon size={20} className="shrink-0" />
                  <span className="text-sm font-black uppercase italic tracking-widest">{item.label}</span>
                  {activeTab === item.id && (
                    <motion.div layoutId="active" className="absolute left-0 w-1 h-6 bg-black rounded-r-full" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </nav>
      </aside>

      {/* Mobile Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-white/5 px-6 py-4 flex justify-around items-center z-40">
        {[
          { id: 'overview', icon: LayoutDashboard },
          { id: 'clients', icon: User },
          { id: 'projects', icon: Briefcase },
          { id: 'messages', icon: MessageSquare },
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={`p-3 rounded-xl transition-all ${
              activeTab === tab.id 
                ? 'bg-[#c7c42a] text-black shadow-[0_0_20px_rgba(199,196,42,0.2)]' 
                : 'text-slate-500'
            }`}
          >
            <tab.icon size={20} />
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main className="pl-0 lg:pl-80 min-h-screen pb-24 lg:pb-0">
        <header className="px-12 py-10 flex justify-between items-center border-b border-white/5 bg-slate-900/20 backdrop-blur-md sticky top-0 z-30">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">
              {activeTab.replace('-', ' ')}
            </h2>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
              Admin Control Center / {profile?.displayName}
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-sm font-black text-white uppercase italic">System Admin</div>
              <div className="text-[10px] font-black text-[#c7c42a] uppercase tracking-widest">Online</div>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#c7c42a] to-#c7c42a flex items-center justify-center text-black font-black text-xl italic shadow-[0_0_30px_rgba(199,196,42,0.2)]">
              A
            </div>
          </div>
        </header>

        <div className="p-12 max-w-7xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader color="white" />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "circOut" }}
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


