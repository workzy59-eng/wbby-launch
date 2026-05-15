import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FirebaseUser } from '../firebase';
import { UserProfile, Project, LeaveRequest, Attendance } from '../types';
import { 
  LayoutDashboard, 
  Briefcase, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  ChevronRight,
  LogOut,
  Bell,
  MessageSquare,
  FileText,
  User,
  Coffee,
  Check
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { formatDate } from '../lib/utils';
import { 
  getDeveloperProjects, 
  getLeaveRequests, 
  requestLeave,
  getAttendance,
  punchIn,
  punchOut,
  getNotifications,
  markNotificationAsRead
} from '../services/database';
import ChatSystem from '../components/ChatSystem';

interface DeveloperDashboardProps {
  user: FirebaseUser | null;
  profile: UserProfile | null;
}

type Tab = 'overview' | 'projects' | 'attendance' | 'leaves' | 'settings';

export default function DeveloperDashboard({ user, profile }: DeveloperDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [projects, setProjects] = useState<Project[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isPunchedIn, setIsPunchedIn] = useState(false);
  const [punching, setPunching] = useState(false);
  const [selectedChatUser, setSelectedChatUser] = useState<{uid: string, displayName: string} | null>(null);

  // Leave Form State
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    startDate: '',
    endDate: '',
    reason: '',
    type: 'Sick Leave' as LeaveRequest['type']
  });

  useEffect(() => {
    if (!user?.uid) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [userProjects, userLeaves, userAttendance] = await Promise.all([
          getDeveloperProjects(user.uid),
          getLeaveRequests(user.uid),
          getAttendance(user.uid)
        ]);
        
        setProjects(userProjects);
        setLeaves(userLeaves);
        setAttendance(userAttendance);
        
        // Check if punched in today
        const today = new Date().toISOString().split('T')[0];
        const todayRecord = userAttendance.find(a => a.date === today);
        if (todayRecord && !todayRecord.outTime) {
          setIsPunchedIn(true);
        }
      } catch (error) {
        console.error("Error fetching developer data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const unsubNotifs = getNotifications(user.uid, (notifs) => {
      setNotifications(notifs);
    }, 'developer');

    return () => unsubNotifs();
  }, [user?.uid]);

  const handlePunch = async () => {
    if (!user?.uid || !profile) return;
    try {
      setPunching(true);
      if (isPunchedIn) {
        await punchOut(user.uid);
        setIsPunchedIn(false);
        toast.success("Successfully punched out. Good job today!");
      } else {
        await punchIn(user.uid, profile.displayName || 'Developer');
        setIsPunchedIn(true);
        toast.success("Successfully punched in. Happy coding!");
      }
      // Refresh attendance
      const updatedAttendance = await getAttendance(user.uid);
      setAttendance(updatedAttendance);
    } catch (error) {
      toast.error("Failed to update attendance");
    } finally {
      setPunching(false);
    }
  };

  const handleLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid || !profile) return;
    
    try {
      const newLeave: Omit<LeaveRequest, 'id' | 'status' | 'createdAt'> = {
        userId: user.uid,
        userName: profile.displayName || 'Developer',
        ...leaveForm
      };
      
      await requestLeave(newLeave);
      toast.success("Leave request submitted successfully!");
      setIsLeaveModalOpen(false);
      setLeaveForm({ startDate: '', endDate: '', reason: '', type: 'Sick Leave' });
      
      // Refresh leaves
      const updatedLeaves = await getLeaveRequests(user.uid);
      setLeaves(updatedLeaves);
    } catch (error) {
      toast.error("Failed to submit leave request");
    }
  };

  const renderOverview = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 space-y-4 hover:border-[#c7c42a]/30 transition-all group backdrop-blur-xl"
        >
          <div className="flex justify-between items-start">
            <div className={`p-3 bg-${isPunchedIn ? '[#c7c42a]' : 'white'}-500/10 rounded-2xl text-${isPunchedIn ? '[#c7c42a]' : 'white'}-400 group-hover:scale-110 transition-transform`}>
              <Clock size={24} />
            </div>
            <button 
              onClick={handlePunch}
              disabled={punching}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                isPunchedIn 
                  ? 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white' 
                  : 'bg-[#c7c42a]/10 text-[#c7c42a] hover:bg-[#c7c42a] hover:text-black'
              } disabled:opacity-50`}
            >
              {punching ? '...' : isPunchedIn ? 'Punch Out' : 'Punch In'}
            </button>
          </div>
          <div>
            <div className="text-3xl font-black text-white tracking-tighter italic">
              {isPunchedIn ? 'Work Mode' : 'Offline'}
            </div>
            <div className="text-xs font-bold text-white/30 uppercase tracking-widest">Attendance Status</div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 space-y-4 hover:border-[#c7c42a]/30 transition-all group backdrop-blur-xl"
        >
          <div className="flex justify-between items-start">
            <div className="p-3 bg-[#c7c42a]/10 rounded-2xl text-[#c7c42a] group-hover:scale-110 transition-transform">
              <Briefcase size={24} />
            </div>
            <div className="text-[10px] font-black text-white/30 uppercase tracking-widest">Active</div>
          </div>
          <div>
            <div className="text-3xl font-black text-white tracking-tighter italic">{projects.filter(p => p.status !== 'completed').length}</div>
            <div className="text-xs font-bold text-white/30 uppercase tracking-widest">Current Projects</div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 space-y-4 hover:border-[#c7c42a]/30 transition-all group backdrop-blur-xl"
        >
          <div className="flex justify-between items-start">
            <div className="p-3 bg-[#c7c42a]/10 rounded-2xl text-[#c7c42a] group-hover:scale-110 transition-transform">
              <Calendar size={24} />
            </div>
            <div className="text-[10px] font-black text-white/30 uppercase tracking-widest">Remaining</div>
          </div>
          <div>
            <div className="text-3xl font-black text-white tracking-tighter italic">12</div>
            <div className="text-xs font-bold text-white/30 uppercase tracking-widest">Leave Balance</div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 space-y-4 hover:border-[#c7c42a]/30 transition-all group backdrop-blur-xl"
        >
          <div className="flex justify-between items-start">
            <div className="p-3 bg-[#c7c42a]/10 rounded-2xl text-[#c7c42a] group-hover:scale-110 transition-transform">
              <CheckCircle2 size={24} />
            </div>
            <div className="text-[10px] font-black text-white/30 uppercase tracking-widest">Lifetime</div>
          </div>
          <div>
            <div className="text-3xl font-black text-white tracking-tighter italic">{projects.filter(p => p.status === 'completed').length}</div>
            <div className="text-xs font-bold text-white/30 uppercase tracking-widest">Projects Delivered</div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-xl">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-black text-white uppercase italic">Active Projects</h3>
            <button onClick={() => setActiveTab('projects')} className="text-[#c7c42a] text-[10px] font-black uppercase tracking-widest hover:underline italic">View All</button>
          </div>
          <div className="space-y-4">
            {projects.filter(p => p.status !== 'completed').slice(0, 3).map((project, idx) => (
              <div key={idx} className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all group hover:border-[#c7c42a]/20">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#c7c42a] rounded-xl flex items-center justify-center text-black font-black italic">
                    {project.businessName?.[0]}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white uppercase italic">{project.businessName}</div>
                    <div className="text-[10px] font-black text-white/30 uppercase tracking-widest">{project.status} • {project.progress}% Complete</div>
                  </div>
                </div>
                <ChevronRight size={18} className="text-white/30 group-hover:text-[#c7c42a] transition-colors" />
              </div>
            ))}
            {projects.filter(p => p.status !== 'completed').length === 0 && (
              <div className="text-center py-12 text-white/10 font-black uppercase tracking-widest italic opacity-50">No active projects</div>
            )}
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-xl">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-black text-white uppercase italic">Upcoming Deadlines</h3>
            <AlertCircle size={20} className="text-[#c7c42a]" />
          </div>
          <div className="space-y-4">
            <div className="p-6 bg-[#c7c42a]/5 rounded-2xl border border-[#c7c42a]/10 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-white uppercase italic">Code Review Meeting</div>
                <div className="text-[10px] font-black text-white/30 uppercase tracking-widest">Today • 4:00 PM</div>
              </div>
              <Coffee size={20} className="text-[#c7c42a]" />
            </div>
            <div className="p-6 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-white uppercase italic">Project Submission</div>
                <div className="text-[10px] font-black text-white/30 uppercase tracking-widest">Tomorrow • 10:00 AM</div>
              </div>
              <Briefcase size={20} className="text-white/40" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProjects = () => (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter text-[#c7c42a]">Project Vault</h2>
        <div className="text-[10px] font-black text-white/30 uppercase tracking-widest">{projects.length} Total Projects</div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {projects.map((project, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-xl group hover:border-[#c7c42a]/30 transition-all"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="w-16 h-16 bg-[#c7c42a] rounded-2xl flex items-center justify-center text-black font-black text-2xl italic">
                {project.businessName?.[0]}
              </div>
              <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                project.status === 'completed' ? 'bg-[#c7c42a]/20 text-[#c7c42a]' : 'bg-[#c7c42a]/20 text-[#c7c42a]'
              }`}>
                {project.status}
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="text-2xl font-black text-white uppercase italic tracking-tighter">{project.businessName}</h4>
                <p className="text-xs font-bold text-white/30 uppercase tracking-widest">{project.businessType}</p>
              </div>
              <div className="py-6 border-y border-white/5 space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Progress</span>
                  <span className="text-sm font-black text-[#c7c42a] italic">{project.progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#c7c42a] to-yellow-600 transition-all duration-1000"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
                {(project.domainPrice || project.paymentLinkBasic || project.paymentLinkPremium) && (
                  <div className="pt-4 space-y-3">
                    {project.domainPrice && (
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Domain Cost</span>
                        <span className="text-xs font-bold text-white italic">₹{project.domainPrice}</span>
                      </div>
                    )}
                    {(project.paymentLinkBasic || project.paymentLinkPremium) && (
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Payment Links</span>
                        <div className="flex flex-wrap gap-2">
                          {project.paymentLinkBasic && (
                            <a href={project.paymentLinkBasic} target="_blank" rel="noreferrer" className="text-[9px] font-black text-black bg-[#c7c42a] px-3 py-1 rounded-full uppercase tracking-tighter hover:scale-105 transition-all">Standard Link</a>
                          )}
                          {project.paymentLinkPremium && (
                            <a href={project.paymentLinkPremium} target="_blank" rel="noreferrer" className="text-[9px] font-black text-black bg-[#c7c42a] px-3 py-1 rounded-full uppercase tracking-tighter hover:scale-105 transition-all">Premium Link</a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex gap-4">
                <button className="flex-1 py-4 bg-white/5 border border-white/10 rounded-xl text-white font-black uppercase italic text-xs tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                  <FileText size={16} /> Details
                </button>
                <button className="p-4 bg-[#c7c42a]/10 text-[#c7c42a] rounded-xl hover:bg-[#c7c42a] hover:text-black transition-all">
                  <MessageSquare size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderAttendance = () => (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter text-[#c7c42a]">Time Ledger</h2>
        <div className="text-[10px] font-black text-white/30 uppercase tracking-widest">Chronological Operations Log</div>
      </div>
      <div className="bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5">
                <th className="pb-6 text-[10px] font-black text-white/30 uppercase tracking-widest">Date</th>
                <th className="pb-6 text-[10px] font-black text-white/30 uppercase tracking-widest">Status</th>
                <th className="pb-6 text-[10px] font-black text-white/30 uppercase tracking-widest">Punch In</th>
                <th className="pb-6 text-[10px] font-black text-white/30 uppercase tracking-widest">Punch Out</th>
                <th className="pb-6 text-[10px] font-black text-white/30 uppercase tracking-widest">Total Hours</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {attendance.map((record, idx) => (
                <tr key={idx} className="group hover:bg-white/5 transition-colors">
                  <td className="py-6 text-sm font-bold text-white uppercase italic">{formatDate(record.date)}</td>
                  <td className="py-6">
                    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                      record.status === 'present' ? 'bg-[#c7c42a]/20 text-[#c7c42a]' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="py-6 text-xs font-bold text-white/40">{record.checkInTime || record.inTime || '--:--'}</td>
                  <td className="py-6 text-xs font-bold text-white/40">{record.outTime || '--:--'}</td>
                  <td className="py-6">
                    <div className="flex items-center gap-2 text-xs font-black text-[#c7c42a] italic">
                      {record.status === 'present' ? '8.0h' : '0h'}
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

  const renderLeaves = () => (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter text-[#c7c42a]">Leave Matrix</h2>
        <button 
          onClick={() => setIsLeaveModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-[#c7c42a] text-black font-black uppercase italic rounded-2xl hover:scale-105 transition-all shadow-[0_0_20px_rgba(199,196,42,0.3)]"
        >
          <Calendar size={18} />
          <span>Apply for Leave</span>
        </button>
      </div>
      
      <div className="bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-xl">
        <h3 className="text-xl font-black text-white uppercase italic mb-8">Recent Requests</h3>
        <div className="space-y-4">
          {leaves.map((req, idx) => (
            <div key={idx} className="p-8 bg-white/5 rounded-3xl border border-white/5 flex items-center justify-between group hover:border-[#c7c42a]/30 transition-all">
              <div className="flex items-center gap-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white ${
                  req.status === 'approved' ? 'bg-[#c7c42a]/20' : req.status === 'declined' ? 'bg-red-500/20' : 'bg-[#c7c42a]/20'
                }`}>
                  <Calendar size={24} className={
                    req.status === 'approved' ? 'text-[#c7c42a]' : req.status === 'declined' ? 'text-red-400' : 'text-[#c7c42a]'
                  } />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-black text-white uppercase italic">{req.type || 'Leave Request'}</span>
                    <span className={`px-3 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                      req.status === 'approved' ? 'bg-[#c7c42a]/20 text-[#c7c42a]' : 
                      req.status === 'declined' ? 'bg-red-500/20 text-red-400' : 
                      'bg-[#c7c42a]/20 text-[#c7c42a]'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-white/30 uppercase tracking-widest mt-1">
                    {formatDate(req.startDate)} — {formatDate(req.endDate)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1 italic">Reason</p>
                <p className="text-xs font-bold text-white/50 max-w-xs truncate">{req.reason}</p>
              </div>
            </div>
          ))}
          {leaves.length === 0 && (
            <div className="text-center py-20 opacity-20 group">
              <LogOut size={48} className="mx-auto text-white/30 mb-4 group-hover:scale-110 transition-transform" />
              <p className="text-white/30 font-black uppercase tracking-[0.3em] italic">No active leave history</p>
            </div>
          )}
        </div>
      </div>

      {/* Leave Modal */}
      <AnimatePresence>
        {isLeaveModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] w-full max-w-xl p-10 space-y-8 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-[#c7c42a]" />
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Request Leave</h3>
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em]">Operational Downtime Scheduling</p>
                </div>
                <button onClick={() => setIsLeaveModalOpen(false)} className="text-white/40 hover:text-white transition-colors">
                  <XCircle size={24} />
                </button>
              </div>

              <form onSubmit={handleLeaveSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-4">Start Date</label>
                    <input 
                      type="date"
                      required
                      value={leaveForm.startDate}
                      onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-[#c7c42a]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-4">End Date</label>
                    <input 
                      type="date"
                      required
                      value={leaveForm.endDate}
                      onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-[#c7c42a]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-4">Leave Type</label>
                  <select 
                    value={leaveForm.type}
                    onChange={(e) => setLeaveForm({ ...leaveForm, type: e.target.value as any })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-[#c7c42a] appearance-none"
                  >
                    <option value="Sick Leave">Sick Leave</option>
                    <option value="Casual Leave">Casual Leave</option>
                    <option value="Earned Leave">Earned Leave</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-4">Reason for Absence</label>
                  <textarea 
                    required
                    value={leaveForm.reason}
                    onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-[#c7c42a] h-32 resize-none"
                    placeholder="Briefly explain the cause..."
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-5 bg-[#c7c42a] text-black font-black uppercase italic rounded-2xl hover:scale-[1.02] transition-all shadow-[0_0_30px_rgba(199,196,42,0.3)]"
                >
                  Confirm Request
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter text-white/50">Profile Engine</h2>
      </div>
      <div className="bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-xl">
        <div className="flex items-center gap-8 mb-12">
          <div className="w-24 h-24 bg-gradient-to-br from-[#c7c42a] to-yellow-600 rounded-3xl flex items-center justify-center text-black font-black text-4xl italic shadow-2xl">
            {profile?.displayName?.[0] || 'D'}
          </div>
          <div>
            <h3 className="text-2xl font-black text-white uppercase italic">{profile?.displayName}</h3>
            <p className="text-xs font-bold text-white/30 uppercase tracking-widest">{profile?.devRole || 'Professional Developer'}</p>
            <div className="flex gap-2 mt-2">
              <span className="px-3 py-1 bg-[#c7c42a]/20 text-[#c7c42a] rounded-full text-[8px] font-black uppercase tracking-widest">Verified</span>
              <span className="px-3 py-1 bg-[#c7c42a]/20 text-[#c7c42a] rounded-full text-[8px] font-black uppercase tracking-widest">Top Tier</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 bg-white/5 rounded-3xl space-y-4 border border-white/5">
            <h4 className="text-sm font-black text-white uppercase italic">Account Intel</h4>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/20 uppercase tracking-widest">Email Address</label>
              <p className="text-white font-bold">{profile?.email}</p>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/20 uppercase tracking-widest">Joined On</label>
              <p className="text-white font-bold">January 2024</p>
            </div>
          </div>
          
          <div className="p-8 bg-white/5 rounded-3xl space-y-4 border border-white/5">
            <h4 className="text-sm font-black text-white uppercase italic">Technical Stack</h4>
            <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-widest">
              {['React', 'TypeScript', 'Node.js', 'Tailwind', 'Firebase'].map(tech => (
                <span key={tech} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-white/30">{tech}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black font-sans selection:bg-[#c7c42a] selection:text-black text-white/90">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-full w-80 bg-[#0a0a0a] border-r border-white/5 z-40 p-10 flex flex-col hidden lg:flex">
        <div className="text-2xl font-black tracking-tighter text-white uppercase italic mb-12 flex items-center gap-3">
          <div className="w-8 h-8 bg-[#c7c42a] rounded-lg rotate-12 shadow-[0_0_20px_rgba(199,196,42,0.3)] flex items-center justify-center">
             <div className="w-3 h-3 bg-black/20 rounded-full blur-[1px]" />
          </div>
          Webby<span className="text-[#c7c42a]">Developer</span>
        </div>

        <nav className="flex-1 space-y-2">
          {[
            { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'projects', label: 'My Projects', icon: Briefcase },
            { id: 'attendance', label: 'Time Logs', icon: Clock },
            { id: 'leaves', label: 'Leave Matrix', icon: Calendar },
            { id: 'settings', label: 'Force Profile', icon: User },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all relative group ${
                activeTab === item.id 
                  ? 'bg-[#c7c42a] text-black shadow-[0_0_20px_rgba(199,196,42,0.3)]' 
                  : 'text-white/30 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon size={20} className="shrink-0" />
              <span className="text-sm font-black uppercase italic tracking-widest">{item.label}</span>
              {activeTab === item.id && (
                <motion.div layoutId="active" className="absolute left-0 w-1 h-6 bg-black rounded-r-full" />
              )}
            </button>
          ))}
        </nav>

        <div className="mt-auto p-8 rounded-3xl bg-white/5 border border-white/5 space-y-4">
          <div className="text-[10px] font-black text-white/30 uppercase tracking-widest">Active Session</div>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isPunchedIn ? 'bg-[#c7c42a] shadow-[0_0_10px_#c7c42a]' : 'bg-white/10'} animate-pulse`} />
            <span className="text-xs font-bold text-white/50 uppercase italic">{isPunchedIn ? 'Logged In for 4h 12m' : 'Session Ready'}</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="pl-0 lg:pl-80 min-h-screen pb-24 lg:pb-0">
        <header className="px-12 py-10 flex justify-between items-center border-b border-white/5 bg-black/50 backdrop-blur-md sticky top-0 z-30">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">
              {activeTab === 'overview' ? `Welcome, ${profile?.displayName?.split(' ')[0]}` : activeTab.replace('-', ' ')}
            </h2>
            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">
              Resource / {activeTab === 'overview' ? 'Operational Hub' : activeTab}
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-3 bg-white/5 border border-white/10 rounded-xl relative hover:bg-white/10 transition-all group"
              >
                <Bell size={20} className={notifications.some(n => !n.read) ? 'text-[#c7c42a] animate-pulse' : 'text-white/40 group-hover:text-white'} />
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#c7c42a] rounded-full shadow-[0_0_10px_#c7c42a]" />
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute right-0 mt-4 w-80 bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl z-50 overflow-hidden"
                  >
                    <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/50">
                      <h3 className="text-xs font-black italic uppercase tracking-widest text-[#c7c42a]">System Log</h3>
                      <button 
                        onClick={() => notifications.forEach(n => !n.read && markNotificationAsRead(n.id))}
                        className="text-[10px] font-black uppercase text-white/30 hover:text-white transition-colors"
                      >
                        Read All
                      </button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((n) => (
                        <div 
                          key={n.id} 
                          onClick={() => !n.read && markNotificationAsRead(n.id)}
                          className={`p-6 border-b border-white/5 cursor-pointer hover:bg-white/10 transition-colors ${!n.read ? 'bg-[#c7c42a]/5' : ''}`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <p className="text-[10px] font-black uppercase text-[#c7c42a] tracking-widest">{n.title}</p>
                            <p className="text-[8px] text-white/20 font-black uppercase">{formatDate(n.createdAt)}</p>
                          </div>
                          <p className="text-xs text-white/60 leading-relaxed font-bold italic">{n.message}</p>
                        </div>
                      ))}
                      {notifications.length === 0 && (
                        <div className="p-12 text-center opacity-20 italic">
                          <AlertCircle size={24} className="mx-auto mb-2" />
                          <p className="text-[10px] font-black uppercase tracking-widest">No updates detected</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-4">
               <button 
                onClick={() => setSelectedChatUser({ uid: 'admin', displayName: 'Admin Support' })}
                className="p-3 bg-[#c7c42a]/10 text-[#c7c42a] border border-[#c7c42a]/20 rounded-xl hover:bg-[#c7c42a] hover:text-black transition-all"
               >
                 <MessageSquare size={20} />
               </button>
               <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white font-black text-xl italic group hover:border-[#c7c42a]/40 transition-all cursor-pointer">
                {profile?.displayName?.[0]}
              </div>
            </div>
          </div>
        </header>

        <div className="p-12 max-w-7xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="w-8 h-8 border-2 border-[#c7c42a] border-t-transparent rounded-full" />
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
                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'projects' && renderProjects()}
                {activeTab === 'attendance' && renderAttendance()}
                {activeTab === 'leaves' && renderLeaves()}
                {activeTab === 'settings' && renderSettings()}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </main>

      <AnimatePresence>
        {selectedChatUser && user && (
          <ChatSystem 
            isDirect={true}
            recipientUser={selectedChatUser}
            profile={profile}
            currentUser={user}
            onClose={() => setSelectedChatUser(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
