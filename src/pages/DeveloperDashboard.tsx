import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FirebaseUser } from '../firebase';
import { UserProfile, LeaveRequest, Attendance } from '../types';
import { 
  LayoutDashboard, 
  Briefcase, 
  MessageSquare, 
  RefreshCcw, 
  Calendar as CalendarIcon, 
  LogOut, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle,
  User,
  ChevronRight,
  Send,
  X,
  Loader2
} from 'lucide-react';
import { updateProfile, requestLeave, getLeaveRequests, getAttendance, getProjectsAsync } from '../services/database';
import ChatSystem from '../components/ChatSystem';
import MessagesModule from '../components/MessagesModule';
import { Project } from '../types';

interface DeveloperDashboardProps {
  user: FirebaseUser | null;
  profile: UserProfile | null;
}

type Tab = 'dashboard' | 'projects' | 'messages' | 'update' | 'leave' | 'calendar' | 'resign';

export default function DeveloperDashboard({ user, profile }: DeveloperDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSalaryWarning, setShowSalaryWarning] = useState(false);
  const [onboardingData, setOnboardingData] = useState({
    name: profile?.displayName || '',
    experience: '',
    devRole: '',
  });
  
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [newLeave, setNewLeave] = useState({
    startDate: '',
    endDate: '',
    reason: '',
  });

  const [resignAgreed, setResignAgreed] = useState(false);
  const [showResignConfirm, setShowResignConfirm] = useState(false);
  const [projectUpdate, setProjectUpdate] = useState({
    projectId: '',
    details: '',
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateSubmit = async () => {
    if (!projectUpdate.projectId || !projectUpdate.details || isUpdating) return;
    
    setIsUpdating(true);
    try {
      const { updateProject } = await import('../services/database');
      await updateProject(projectUpdate.projectId, {
        lastUpdate: projectUpdate.details,
        lastUpdateAt: new Date().toISOString(),
        // We could also increment progress here if needed
      });
      setProjectUpdate({ projectId: '', details: '' });
      alert('Project update posted successfully!');
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Failed to post update. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    if (profile && !profile.devRole) {
      setShowOnboarding(true);
    }
  }, [profile]);

  useEffect(() => {
    if (user?.uid) {
      const fetchDevData = async () => {
        setLoading(true);
        const [leaves, att, projs] = await Promise.all([
          getLeaveRequests(user.uid),
          getAttendance(user.uid),
          getProjectsAsync()
        ]);
        setLeaveRequests(leaves);
        setAttendance(att);
        setProjects(projs.filter((p: any) => p.developerId === user.uid));
        setLoading(false);
      };
      fetchDevData();
    }
  }, [user]);

  const handleOnboardingSubmit = async () => {
    if (!onboardingData.name || !onboardingData.experience || !onboardingData.devRole) return;
    setShowSalaryWarning(true);
  };

  const confirmOnboarding = async () => {
    if (!user?.uid) return;
    await updateProfile(user.uid, {
      displayName: onboardingData.name,
      experience: onboardingData.experience,
      devRole: onboardingData.devRole,
      status: 'pending',
      joiningDate: new Date().toISOString(),
    });
    setShowOnboarding(false);
    setShowSalaryWarning(false);
  };

  const handleLeaveSubmit = async () => {
    if (!user?.uid || !newLeave.startDate || !newLeave.endDate || !newLeave.reason) return;
    
    const start = new Date(newLeave.startDate);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    if (start < tomorrow) {
      alert('Leave can only be requested from the next day onwards.');
      return;
    }

    await requestLeave({
      userId: user.uid,
      userName: profile?.displayName || 'Developer',
      ...newLeave,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });

    setNewLeave({ startDate: '', endDate: '', reason: '' });
    const leaves = await getLeaveRequests(user.uid);
    setLeaveRequests(leaves);
  };

  const handleResign = async () => {
    if (!user?.uid || !resignAgreed) return;
    await updateProfile(user.uid, { status: 'resigned' });
    window.location.href = '/';
  };

  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-[#4A5D4E] flex items-center justify-center p-6 font-sans">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-xl w-full bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-12 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-[#E6FF00]/20">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              className="h-full bg-[#E6FF00]"
            />
          </div>

          <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic mb-8">Developer Onboarding</h2>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-4">Full Name</label>
              <input 
                type="text" 
                value={onboardingData.name}
                onChange={(e) => setOnboardingData({ ...onboardingData, name: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-5 focus:border-[#E6FF00] outline-none transition-all text-white font-bold uppercase" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-4">Years of Experience</label>
              <input 
                type="number" 
                value={onboardingData.experience}
                onChange={(e) => setOnboardingData({ ...onboardingData, experience: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-5 focus:border-[#E6FF00] outline-none transition-all text-white font-bold uppercase" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-4">Your Role</label>
              <select 
                value={onboardingData.devRole}
                onChange={(e) => setOnboardingData({ ...onboardingData, devRole: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-5 focus:border-[#E6FF00] outline-none transition-all text-white font-bold uppercase appearance-none"
              >
                <option value="" className="bg-[#4A5D4E]">Select Role</option>
                <option value="Frontend" className="bg-[#4A5D4E]">Frontend Developer</option>
                <option value="Backend" className="bg-[#4A5D4E]">Backend Developer</option>
                <option value="Fullstack" className="bg-[#4A5D4E]">Fullstack Developer</option>
                <option value="UI/UX" className="bg-[#4A5D4E]">UI/UX Designer</option>
              </select>
            </div>

            <button 
              onClick={handleOnboardingSubmit}
              className="w-full bg-[#E6FF00] text-black py-6 rounded-2xl font-black uppercase italic text-xl hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_40px_rgba(230,255,0,0.2)]"
            >
              Submit Application
            </button>
          </div>
        </motion.div>

        <AnimatePresence>
          {showSalaryWarning && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="max-w-md w-full bg-[#4A5D4E] border border-[#E6FF00]/20 rounded-[2rem] p-10 text-center space-y-8"
              >
                <div className="w-20 h-20 bg-[#E6FF00]/10 rounded-full flex items-center justify-center mx-auto text-[#E6FF00]">
                  <AlertTriangle size={40} />
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-black text-white uppercase italic">Salary Expectation</h3>
                  <p className="text-white/60 text-sm leading-relaxed font-bold uppercase italic">
                    Please note that salary will be decided based on your performance during the interview and trial period. Do you agree to proceed?
                  </p>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setShowSalaryWarning(false)} className="flex-1 py-4 rounded-xl border border-white/10 text-white font-bold uppercase tracking-widest hover:bg-white/5 transition-all">Cancel</button>
                  <button onClick={confirmOnboarding} className="flex-1 py-4 rounded-xl bg-[#E6FF00] text-black font-black uppercase italic hover:scale-105 transition-all">I Agree</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'My Projects', value: projects.length, icon: Briefcase, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
                { label: 'Attendance', value: attendance.length > 0 ? `${Math.round((attendance.filter(a => a.status === 'present').length / 30) * 100)}%` : '0%', icon: Clock, color: 'text-[#E6FF00]', bg: 'bg-[#E6FF00]/10' },
                { label: 'Messages', value: '0', icon: MessageSquare, color: 'text-yellow-200', bg: 'bg-yellow-500/10' },
              ].map((stat, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-slate-900/40 border border-white/5 rounded-3xl p-8 space-y-4 hover:border-[#E6FF00]/30 transition-all group"
                >
                  <div className="flex justify-between items-start">
                    <div className={`p-3 ${stat.bg} rounded-2xl ${stat.color} group-hover:scale-110 transition-transform`}>
                      <stat.icon size={24} />
                    </div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Live</span>
                  </div>
                  <div>
                    <div className="text-4xl font-black text-white tracking-tighter">{stat.value}</div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.label}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-10">
              <h3 className="text-2xl font-black text-white uppercase italic mb-8">Recent Activity</h3>
              <div className="space-y-6">
                <div className="flex items-center gap-6 p-6 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all">
                  <div className="w-12 h-12 bg-[#818CF8]/10 rounded-xl flex items-center justify-center text-[#818CF8]">
                    <CheckCircle2 size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-white uppercase italic">Profile Approved</div>
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Your developer profile is now active</div>
                  </div>
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Just now</div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'leave':
        return (
          <div className="space-y-8">
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10">
              <h3 className="text-2xl font-black text-white uppercase italic mb-8">Request Leave</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-4">Start Date</label>
                  <input 
                    type="date" 
                    value={newLeave.startDate}
                    onChange={(e) => setNewLeave({ ...newLeave, startDate: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-5 focus:border-[#E6FF00] outline-none transition-all text-white font-bold uppercase" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-4">End Date</label>
                  <input 
                    type="date" 
                    value={newLeave.endDate}
                    onChange={(e) => setNewLeave({ ...newLeave, endDate: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-5 focus:border-[#E6FF00] outline-none transition-all text-white font-bold uppercase" 
                  />
                </div>
              </div>
              <div className="space-y-2 mb-8">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-4">Reason</label>
                <textarea 
                  value={newLeave.reason}
                  onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-5 focus:border-[#E6FF00] outline-none transition-all text-white font-bold uppercase h-32" 
                />
              </div>
              <button 
                onClick={handleLeaveSubmit}
                className="w-full bg-[#E6FF00] text-black py-6 rounded-2xl font-black uppercase italic text-xl hover:scale-[1.02] active:scale-95 transition-all"
              >
                Submit Request
              </button>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10">
              <h3 className="text-2xl font-black text-white uppercase italic mb-8">My Requests</h3>
              <div className="space-y-4">
                {leaveRequests.map((req, idx) => (
                  <div key={idx} className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5">
                    <div className="space-y-1">
                      <div className="text-sm font-bold text-white uppercase italic">{req.reason}</div>
                      <div className="text-[10px] font-black text-white/20 uppercase tracking-widest">{req.startDate} to {req.endDate}</div>
                    </div>
                    <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      req.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                      req.status === 'declined' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {req.status}
                    </div>
                  </div>
                ))}
                {leaveRequests.length === 0 && (
                  <div className="text-center py-12 text-white/20 font-black uppercase tracking-widest italic">No leave requests found</div>
                )}
              </div>
            </div>
          </div>
        );
      case 'calendar':
        return (
          <div className="space-y-8">
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10">
              <h3 className="text-2xl font-black text-white uppercase italic mb-8">Attendance Calendar</h3>
              <div className="grid grid-cols-7 gap-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-[10px] font-black text-white/20 uppercase tracking-widest mb-4">{day}</div>
                ))}
                {Array.from({ length: 31 }).map((_, i) => {
                  const day = i + 1;
                  const status = attendance.find(a => new Date(a.date).getDate() === day)?.status;
                  return (
                    <div 
                      key={i} 
                      className={`aspect-square rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all ${
                        status === 'present' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                        status === 'absent' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                        status === 'leave' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' :
                        'bg-white/5 border-white/5 text-white/40'
                      }`}
                    >
                      <span className="text-lg font-black">{day}</span>
                      {status && <span className="text-[8px] font-black uppercase tracking-tighter">{status}</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      case 'resign':
        return (
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-12 text-center space-y-8">
              <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500">
                <LogOut size={48} />
              </div>
              <div className="space-y-4">
                <h3 className="text-3xl font-black text-white uppercase italic">Resignation Process</h3>
                <p className="text-white/60 italic leading-relaxed font-bold uppercase">
                  We are sorry to see you go. Please note that by resigning, you agree to complete all ongoing projects and commit to a 6-month cooling period before reapplying.
                </p>
              </div>

              <div className="flex items-center gap-4 p-6 bg-white/5 rounded-2xl border border-white/5 text-left">
                <button 
                  onClick={() => setResignAgreed(!resignAgreed)}
                  className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all ${
                    resignAgreed ? 'bg-[#E6FF00] border-[#E6FF00] text-black' : 'border-white/20'
                  }`}
                >
                  {resignAgreed && <CheckCircle2 size={20} />}
                </button>
                <span className="text-xs font-bold text-white/60 uppercase tracking-widest italic">
                  I agree to complete ongoing work and the 6-month commitment.
                </span>
              </div>

              <button 
                disabled={!resignAgreed}
                onClick={() => setShowResignConfirm(true)}
                className="w-full bg-red-500 text-white py-6 rounded-2xl font-black uppercase italic text-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
              >
                Resign Now
              </button>
            </div>
          </div>
        );
      case 'projects':
        return (
          <div className="space-y-8">
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10">
              <h3 className="text-2xl font-black text-white uppercase italic mb-8">Assigned Projects</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.map((project, idx) => (
                  <div key={idx} className="p-8 bg-white/5 rounded-3xl border border-white/10 space-y-6 group hover:border-[#E6FF00]/40 transition-all">
                    <div className="flex justify-between items-start">
                      <div className="w-14 h-14 bg-[#E6FF00] rounded-2xl flex items-center justify-center text-black font-black text-xl italic shadow-[0_0_20px_rgba(230,255,0,0.1)]">
                        {project.businessName?.[0]}
                      </div>
                      <div className="px-4 py-1 bg-blue-500/20 text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                        {project.status}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-white uppercase italic tracking-tighter">{project.businessName}</h4>
                      <p className="text-xs font-bold text-white/40 uppercase tracking-widest">{project.businessType}</p>
                    </div>
                    <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                      <div className="text-[10px] font-black text-white/20 uppercase tracking-widest">Deadline: 14 Days</div>
                      <button className="text-[#E6FF00] font-black uppercase italic text-xs tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all">
                        View Details <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                ))}
                {projects.length === 0 && (
                  <div className="col-span-full text-center py-20 text-white/20 font-black uppercase tracking-widest italic border-2 border-dashed border-white/5 rounded-3xl">
                    No projects assigned yet
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case 'messages':
        return (
          <MessagesModule 
            currentUser={user!}
            profile={profile}
            onClose={() => setActiveTab('dashboard')}
            fullScreen={false}
          />
        );
      case 'update':
        return (
          <div className="space-y-8">
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10">
              <h3 className="text-2xl font-black text-white uppercase italic mb-8">Submit Project Update</h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-4">Select Project</label>
                  <select 
                    value={projectUpdate.projectId}
                    onChange={(e) => setProjectUpdate({ ...projectUpdate, projectId: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-5 focus:border-[#E6FF00] outline-none transition-all text-white font-bold uppercase appearance-none"
                  >
                    <option value="" className="bg-[#4A5D4E]">Choose Project</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id} className="bg-[#4A5D4E]">{p.businessName}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-4">Update Details</label>
                  <textarea 
                    value={projectUpdate.details}
                    onChange={(e) => setProjectUpdate({ ...projectUpdate, details: e.target.value })}
                    placeholder="What have you completed today?"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-5 focus:border-[#E6FF00] outline-none transition-all text-white font-bold uppercase h-40" 
                  />
                </div>
                <button 
                  onClick={handleUpdateSubmit}
                  disabled={!projectUpdate.projectId || !projectUpdate.details || isUpdating}
                  className="w-full bg-[#E6FF00] text-black py-6 rounded-2xl font-black uppercase italic text-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                >
                  {isUpdating ? <Loader2 className="animate-spin mx-auto" /> : 'Post Update'}
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] font-sans selection:bg-[#E6FF00] selection:text-black text-slate-200">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-full w-80 bg-slate-900/40 backdrop-blur-3xl border-r border-white/5 z-40 p-10 flex flex-col hidden lg:flex">
        <div className="text-2xl font-black tracking-tighter text-white uppercase italic mb-12 flex items-center gap-3">
          <div className="w-8 h-8 bg-[#E6FF00] rounded-lg -rotate-6 shadow-[0_0_20px_rgba(230,255,0,0.3)]" />
          Webby<span className="text-[#E6FF00]">Dev</span>
        </div>

        <nav className="flex-1 space-y-2">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'projects', label: 'My Projects', icon: Briefcase },
            { id: 'messages', label: 'Messages', icon: MessageSquare },
            { id: 'update', label: 'Update', icon: RefreshCcw },
            { id: 'leave', label: 'Leave Requests', icon: Clock },
            { id: 'calendar', label: 'My Calendar', icon: CalendarIcon },
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

        <button
          onClick={() => setActiveTab('resign')}
          className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black uppercase italic text-xs tracking-widest transition-all mt-auto ${
            activeTab === 'resign' 
              ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.2)]' 
              : 'text-red-500/60 hover:bg-red-500/10 hover:text-red-500'
          }`}
        >
          <LogOut size={18} />
          <span>Resign</span>
        </button>
      </aside>

      {/* Mobile Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-900/80 backdrop-blur-2xl border-t border-white/5 px-6 py-4 flex justify-around items-center z-40">
        {[
          { id: 'dashboard', icon: LayoutDashboard },
          { id: 'projects', icon: Briefcase },
          { id: 'messages', icon: MessageSquare },
          { id: 'update', icon: RefreshCcw },
          { id: 'leave', icon: Clock },
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
              Developer Portal / {profile?.devRole || 'New Developer'}
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-sm font-black text-white uppercase italic">{profile?.displayName}</div>
              <div className="text-[10px] font-black text-[#E6FF00] uppercase tracking-widest">{profile?.status || 'Active'}</div>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E6FF00] to-yellow-600 flex items-center justify-center text-black font-black text-xl italic shadow-[0_0_30px_rgba(230,255,0,0.2)]">
              {profile?.displayName?.[0] || 'D'}
            </div>
          </div>
        </header>

        <div className="p-12 max-w-7xl mx-auto">
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
        </div>
      </main>

      <AnimatePresence>
        {showChat && user && (
          <ChatSystem 
            isDirect={true}
            recipientUser={{ uid: 'admin', displayName: 'System Admin' }} // Hardcoded admin ID for now
            profile={profile}
            currentUser={user}
            onClose={() => setShowChat(false)}
          />
        )}
      </AnimatePresence>

      {/* Resign Confirm Modal */}
      <AnimatePresence>
        {showResignConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="max-w-md w-full bg-[#4A5D4E] border border-red-500/20 rounded-[2rem] p-10 text-center space-y-8"
            >
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500">
                <AlertTriangle size={40} />
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-black text-white uppercase italic">Confirm Resignation</h3>
                <p className="text-white/60 text-sm leading-relaxed font-bold uppercase italic">
                  Are you absolutely sure? This action cannot be undone and you will lose access to all your projects.
                </p>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setShowResignConfirm(false)} className="flex-1 py-4 rounded-xl border border-white/10 text-white font-bold uppercase tracking-widest hover:bg-white/5 transition-all">Cancel</button>
                <button onClick={handleResign} className="flex-1 py-4 rounded-xl bg-red-500 text-white font-black uppercase italic hover:scale-105 transition-all">Yes, Resign</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
