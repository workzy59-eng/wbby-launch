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
  MapPin,
  FileText
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { formatDate } from '../lib/utils';
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
import MessagesModule from '../components/MessagesModule';

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
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [isGeneratingWarning, setIsGeneratingWarning] = useState<string | null>(null);

  const [editingProject, setEditingProject] = useState<Project | null>(null);

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
                { label: 'Total Clients', value: profiles.filter(p => p.role === 'client').length, icon: User, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                { label: 'Total Developers', value: profiles.filter(p => p.role === 'developer').length, icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                { label: 'Active Projects', value: projects.length, icon: Briefcase, color: 'text-[#00F2FF]', bg: 'bg-[#00F2FF]/10' },
                { label: 'Pending Leaves', value: leaveRequests.filter(r => r.status === 'pending').length, icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
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
        return (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Registered Clients</h2>
            </div>
            <div className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-10 backdrop-blur-xl">
              <h3 className="text-2xl font-black text-white uppercase italic mb-8">Registered Clients</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {profiles.filter(p => p.role === 'client').map((client, idx) => (
                  <div key={idx} className="p-8 bg-white/5 rounded-3xl border border-white/10 space-y-6 group hover:border-[#00F2FF]/40 transition-all">
                    <div className="flex justify-between items-start">
                      <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 font-black text-xl italic">
                        {client.displayName?.[0]}
                      </div>
                      <div className="px-4 py-1 bg-green-500/20 text-green-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                        Active
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-white uppercase italic tracking-tighter">{client.displayName}</h4>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{client.email}</p>
                    </div>
                    <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        <MapPin size={12} />
                        <span>Remote</span>
                      </div>
                      <button 
                        onClick={() => setSelectedChatUser(client)}
                        className="text-[#00F2FF] font-black uppercase italic text-xs tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all"
                      >
                        Message <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                ))}
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
                      <div className="w-14 h-14 bg-yellow-500/10 rounded-2xl flex items-center justify-center text-yellow-400">
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
                        'bg-yellow-500/20 text-yellow-400'
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
      case 'developers':
        return (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter text-[#E6FF00]">Developers Team</h2>
            </div>
            <div className="flex justify-between items-center bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xl">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                <input 
                  type="text" 
                  placeholder="Search developers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent pl-12 pr-4 py-2 text-white font-bold uppercase tracking-widest outline-none placeholder:text-slate-600"
                />
              </div>
              <button className="flex items-center gap-2 px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-white/60 font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                <Filter size={16} />
                <span>Filter</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredDevelopers.map((dev, idx) => (
                <div key={idx} className="bg-slate-900/40 border border-white/5 rounded-[2rem] p-8 space-y-6 group hover:border-[#00F2FF]/40 transition-all backdrop-blur-xl">
                  <div className="flex justify-between items-start">
                    <div className="w-16 h-16 bg-[#00F2FF] rounded-2xl flex items-center justify-center text-black font-black text-2xl italic shadow-[0_0_20px_rgba(0,242,255,0.2)]">
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
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{dev.devRole}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                    <div className="space-y-1">
                      <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Experience</div>
                      <div className="text-xs font-bold text-white uppercase">{dev.experience} Years</div>
                    </div>
                    <div className="space-y-1 text-right">
                      <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Absences</div>
                      <div className={`text-xs font-bold uppercase ${dev.absences && dev.absences > 3 ? 'text-red-400' : 'text-white'}`}>
                        {dev.absences || 0} Days
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <button className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-white/60 font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all">View Profile</button>
                    <button 
                      onClick={() => setSelectedChatUser(dev)}
                      className="p-3 bg-[#00F2FF]/10 text-[#00F2FF] rounded-xl hover:bg-[#00F2FF] hover:text-black transition-all"
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
                        'bg-yellow-500/20 text-yellow-400'
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

                    {/* File Display Section */}
                    <div className="grid grid-cols-1 gap-4 py-4 border-y border-white/5">
                      {/* Logo Display */}
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center overflow-hidden">
                            {project.logoUrl ? (
                              <img src={project.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                            ) : (
                              <FileText size={20} className="text-white/20" />
                            )}
                          </div>
                          <span className="text-[10px] font-black text-white uppercase tracking-widest">Business Logo</span>
                        </div>
                        {project.logoUrl && (
                          <div className="flex gap-2">
                            <a 
                              href={project.logoUrl} 
                              target="_blank" 
                              rel="noreferrer"
                              className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-[#00F2FF] transition-all"
                              title="View Logo"
                            >
                              <ArrowUpRight size={14} />
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Documents Display */}
                      {project.documentsUrl && (
                        <div className="space-y-2">
                          <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-2">Project Documents</div>
                          {project.documentsUrl.split(',').map((docUrl, dIdx) => (
                            <div key={dIdx} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                              <div className="flex items-center gap-3">
                                <FileText size={20} className="text-[#E6FF00]" />
                                <span className="text-[10px] font-black text-white uppercase tracking-widest truncate max-w-[150px]">
                                  {docUrl.split('/').pop()?.split('_').slice(1).join('_') || `Document ${dIdx + 1}`}
                                </span>
                              </div>
                              <div className="flex gap-2">
                                <a 
                                  href={docUrl} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-[#00F2FF] transition-all"
                                  title="View Document"
                                >
                                  <ArrowUpRight size={14} />
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-6 flex flex-wrap gap-4 justify-between items-center">
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Progress: {project.progress || 0}%</div>
                      <div className="flex gap-2">
                        <div className="relative group/download">
                          <button 
                            className="p-2 bg-white/5 border border-white/10 rounded-xl text-[#E6FF00] hover:bg-[#E6FF00] hover:text-black transition-all"
                            title="View Description"
                          >
                            <FileText size={16} />
                          </button>
                        </div>
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
                          className="w-full h-2 bg-white/5 rounded-lg appearance-none cursor-pointer accent-[#00F2FF]"
                        />
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
                          rejectionReason: editingProject.rejectionReason
                        })}
                        className="flex-1 py-4 rounded-xl bg-[#00F2FF] text-black font-black uppercase italic hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,242,255,0.2)]"
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
            <div className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-10 backdrop-blur-xl">
              <h3 className="text-2xl font-black text-white uppercase italic mb-8">Developer Attendance Tracking</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Developer</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Role</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Last Check-in</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profiles.filter(p => p.role === 'developer' && p.status === 'approved').map((dev, idx) => (
                      <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-all group">
                        <td className="px-6 py-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#00F2FF] rounded-lg flex items-center justify-center text-black font-black italic text-sm shadow-[0_0_15px_rgba(0,242,255,0.1)]">
                              {dev.displayName?.[0]}
                            </div>
                            <span className="font-bold text-white uppercase italic">{dev.displayName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{dev.devRole}</span>
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                            <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">Present</span>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Today, 09:00 AM</span>
                        </td>
                        <td className="px-6 py-6 text-right">
                          <button className="p-2 bg-white/5 border border-white/10 rounded-lg text-slate-500 hover:text-[#00F2FF] hover:border-[#00F2FF]/40 transition-all">
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
          <MessagesModule 
            currentUser={user!}
            profile={profile}
            onClose={() => setActiveTab('overview')}
            fullScreen={false}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] font-sans selection:bg-[#E6FF00] selection:text-black text-slate-200">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-full w-80 bg-slate-900/40 backdrop-blur-3xl border-r border-white/5 z-40 p-10 flex flex-col hidden lg:flex">
        <div className="text-2xl font-black tracking-tighter text-white uppercase italic mb-12 flex items-center gap-3">
          <div className="w-8 h-8 bg-[#E6FF00] rounded-lg rotate-12 shadow-[0_0_20px_rgba(230,255,0,0.3)]" />
          Webby<span className="text-[#E6FF00]">Admin</span>
        </div>

        <nav className="flex-1 space-y-2">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'clients', label: 'Clients', icon: User },
            { id: 'projects', label: 'Projects', icon: Briefcase },
            { id: 'leaves', label: 'Leaves', icon: Clock },
            { id: 'attendance', label: 'Attendance', icon: CalendarIcon },
            { id: 'messages', label: 'Messages', icon: MessageSquare },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black uppercase italic text-xs tracking-widest transition-all duration-300 ${
                activeTab === tab.id 
                  ? 'bg-[#E6FF00] text-black shadow-[0_0_30px_rgba(230,255,0,0.2)] scale-[1.02]' 
                  : 'text-slate-500 hover:bg-white/5 hover:text-white'
              }`}
            >
              <tab.icon size={18} />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto p-6 bg-white/5 rounded-3xl border border-white/5">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">System Status</div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-green-500 uppercase">All Systems Operational</span>
          </div>
        </div>
      </aside>

      {/* Mobile Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-900/80 backdrop-blur-2xl border-t border-white/5 px-6 py-4 flex justify-around items-center z-40">
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
                ? 'bg-[#E6FF00] text-black shadow-[0_0_20px_rgba(230,255,0,0.2)]' 
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
              <div className="text-[10px] font-black text-[#E6FF00] uppercase tracking-widest">Online</div>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E6FF00] to-yellow-600 flex items-center justify-center text-black font-black text-xl italic shadow-[0_0_30px_rgba(230,255,0,0.2)]">
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

function Loader2({ className, size }: { className?: string; size?: number }) {
  return <RefreshCcw className={className} size={size} />;
}
