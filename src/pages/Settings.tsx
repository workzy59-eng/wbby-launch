import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Bell, 
  Shield, 
  CreditCard, 
  LogOut, 
  Check, 
  ChevronRight, 
  Smartphone, 
  Mail, 
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  X,
  Globe,
  Settings2,
  Activity,
  Trash2,
  Briefcase,
  Phone,
  ArrowLeft,
  Camera,
  MessageSquare,
  RefreshCw,
  Users,
  DollarSign
} from 'lucide-react';
import { FirebaseUser, logOut, db } from '../firebase';
import { UserProfile, SystemSettings, Project } from '../types';
import { updateProfile, getSystemSettings, updateSystemSettings } from '../services/database';
import { collection, query, getDocs, deleteDoc, doc, onSnapshot, where } from 'firebase/firestore';
import { ADMIN_EMAIL, APP_NAME } from '../constants';
import { useNavigate } from 'react-router-dom';

interface SettingsProps {
  user: FirebaseUser;
  profile: UserProfile | null;
}

export default function Settings({ user, profile }: SettingsProps) {
  const navigate = useNavigate();
  const isAdmin = user.email === ADMIN_EMAIL;
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);

  const [formData, setFormData] = useState({
    displayName: profile?.displayName || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    photoURL: profile?.photoURL || '',
    notifications: {
      messages: true,
      updates: true
    }
  });

  useEffect(() => {
    if (isAdmin) {
      getSystemSettings().then(settings => {
        if (settings) setSystemSettings(settings);
      });
      
      // Fetch stats for admin
      const fetchStats = async () => {
        const usersSnap = await getDocs(collection(db, 'users'));
        setTotalUsers(usersSnap.size);
        const projectsSnap = await getDocs(collection(db, 'projects'));
        setProjects(projectsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Project)));
      };
      fetchStats();
    }

    // Fetch user's project info
    if (user.uid) {
      const q = query(collection(db, 'projects'), where('userId', '==', user.uid));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const userProjects = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Project));
        if (userProjects.length > 0) {
          setProjects(userProjects);
        }
      });
      return () => unsubscribe();
    }
  }, [isAdmin, user.uid]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile(user.uid, {
        displayName: formData.displayName,
        phone: formData.phone,
        photoURL: formData.photoURL
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateSystemSettings = async (data: Partial<SystemSettings>) => {
    if (!systemSettings) return;
    try {
      await updateSystemSettings(data);
      setSystemSettings({ ...systemSettings, ...data });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to update system settings:', error);
    }
  };

  const activeProject = projects[0];

  return (
    <div className="min-h-screen bg-white font-sans text-black selection:bg-black selection:text-white pb-24">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-4 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold tracking-tight">Settings</h1>
      </header>

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* SECTION 1 — PROFILE */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
          <div className="flex items-center gap-4 mb-2">
            <User size={20} className="text-gray-400" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">Profile</h2>
          </div>
          
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-50 shadow-inner">
                <img 
                  src={formData.photoURL || `https://ui-avatars.com/api/?name=${formData.displayName}&background=000&color=fff`} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-black text-white rounded-full shadow-lg hover:scale-110 transition-transform">
                <Camera size={16} />
              </button>
            </div>
            
            <div className="w-full space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                <input 
                  type="text" 
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-black transition-colors font-medium"
                  placeholder="Your Name"
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                <input 
                  type="email" 
                  value={formData.email}
                  readOnly
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-100 rounded-xl text-gray-500 font-medium cursor-not-allowed"
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                <input 
                  type="tel" 
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-black transition-colors font-medium"
                  placeholder="10-digit number"
                />
              </div>

              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="w-full py-4 bg-black text-white rounded-xl font-bold uppercase tracking-widest hover:bg-gray-900 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                {isSaving ? <RefreshCw className="animate-spin" size={20} /> : (saveSuccess ? <Check size={20} /> : 'Save Changes')}
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 2 — PROJECT INFO */}
        {activeProject && (
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
            <div className="flex items-center gap-4 mb-2">
              <Briefcase size={20} className="text-gray-400" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">Project Info</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Project Name</span>
                <span className="font-bold">{activeProject.websiteName}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Website Type</span>
                <span className="font-bold">{activeProject.businessType}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Status</span>
                <span className="px-3 py-1 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                  {activeProject.status}
                </span>
              </div>
            </div>
          </section>
        )}

        {/* SECTION 3 — NOTIFICATIONS */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
          <div className="flex items-center gap-4 mb-2">
            <Bell size={20} className="text-gray-400" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">Notifications</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold">New Messages</h4>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Instant alerts</p>
              </div>
              <button 
                onClick={() => setFormData({ ...formData, notifications: { ...formData.notifications, messages: !formData.notifications.messages } })}
                className={`w-14 h-8 rounded-full transition-all relative ${formData.notifications.messages ? 'bg-black' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${formData.notifications.messages ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold">Project Updates</h4>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Status changes</p>
              </div>
              <button 
                onClick={() => setFormData({ ...formData, notifications: { ...formData.notifications, updates: !formData.notifications.updates } })}
                className={`w-14 h-8 rounded-full transition-all relative ${formData.notifications.updates ? 'bg-black' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${formData.notifications.updates ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 4 — BILLING */}
        {activeProject && (
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
            <div className="flex items-center gap-4 mb-2">
              <CreditCard size={20} className="text-gray-400" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">Billing</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Cost</span>
                <span className="text-xl font-black">₹{activeProject.plan === 'basic' ? '1,499' : activeProject.plan === 'standard' ? '3,499' : '9,999'}</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-green-600">Paid: ₹3,000</span>
                  <span className="text-gray-400">Remaining: ₹{activeProject.plan === 'basic' ? '0' : activeProject.plan === 'standard' ? '499' : '6,999'}</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-black" style={{ width: '40%' }} />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* SECTION 5 — SECURITY */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center gap-4 mb-2">
            <Shield size={20} className="text-gray-400" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">Security</h2>
          </div>
          
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
              <Globe size={20} className="text-blue-500" />
            </div>
            <div>
              <h4 className="font-bold">Signed in with Google</h4>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Secure authentication</p>
            </div>
          </div>
        </section>

        {/* SECTION 6 — SUPPORT */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center gap-4 mb-2">
            <MessageSquare size={20} className="text-gray-400" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">Support</h2>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            <button className="w-full py-4 bg-gray-50 border border-gray-100 rounded-xl font-bold uppercase tracking-widest hover:bg-gray-100 transition-all flex items-center justify-center gap-2">
              <Mail size={18} /> Contact Support
            </button>
            <button onClick={() => navigate('/dashboard?chat=true')} className="w-full py-4 bg-gray-50 border border-gray-100 rounded-xl font-bold uppercase tracking-widest hover:bg-gray-100 transition-all flex items-center justify-center gap-2">
              <MessageSquare size={18} /> Chat with Admin
            </button>
          </div>
        </section>

        {/* ADMIN SECTIONS */}
        {isAdmin && (
          <>
            {/* ADMIN SECTION 1 — CONTROL PANEL */}
            <section className="bg-black text-white rounded-2xl p-6 shadow-xl space-y-6">
              <div className="flex items-center gap-4 mb-2">
                <Settings2 size={20} className="text-gray-400" />
                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">Admin Control</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold">Allow New Projects</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Public registration</p>
                  </div>
                  <button 
                    onClick={() => handleUpdateSystemSettings({ maintenanceMode: !systemSettings?.maintenanceMode })}
                    className={`w-14 h-8 rounded-full transition-all relative ${!systemSettings?.maintenanceMode ? 'bg-green-500' : 'bg-gray-700'}`}
                  >
                    <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${!systemSettings?.maintenanceMode ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold">Auto Accept Projects</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Skip review phase</p>
                  </div>
                  <button className="w-14 h-8 rounded-full bg-gray-700 relative">
                    <div className="absolute top-1 left-1 w-6 h-6 rounded-full bg-white" />
                  </button>
                </div>
              </div>
            </section>

            {/* ADMIN SECTION 2 — PRICING CONTROL */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
              <div className="flex items-center gap-4 mb-2">
                <DollarSign size={20} className="text-gray-400" />
                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">Pricing Control</h2>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Website Price (₹)</label>
                  <input type="number" defaultValue="1499" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl font-medium" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Monthly Maintenance (₹)</label>
                  <input type="number" defaultValue="899" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl font-medium" />
                </div>
                <button className="w-full py-4 bg-black text-white rounded-xl font-bold uppercase tracking-widest">Update Pricing</button>
              </div>
            </section>

            {/* ADMIN SECTION 3 — USER MANAGEMENT */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
              <div className="flex items-center gap-4 mb-2">
                <Users size={20} className="text-gray-400" />
                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">User Management</h2>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Users</span>
                <span className="text-xl font-black">{totalUsers}</span>
              </div>
              <button onClick={() => navigate('/admin')} className="w-full py-4 bg-gray-50 border border-gray-100 rounded-xl font-bold uppercase tracking-widest hover:bg-gray-100 transition-all flex items-center justify-center gap-2">
                Manage Users
              </button>
            </section>

            {/* ADMIN SECTION 4 — SYSTEM STATUS */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
              <div className="flex items-center gap-4 mb-2">
                <Activity size={20} className="text-gray-400" />
                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">System Status</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Users</div>
                  <div className="text-2xl font-black">{totalUsers}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Active Projects</div>
                  <div className="text-2xl font-black">{projects.length}</div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* SECTION 7 — LOGOUT */}
        <button 
          onClick={() => logOut()}
          className="w-full py-5 bg-red-50 text-red-600 rounded-2xl font-black uppercase tracking-[0.2em] italic hover:bg-red-100 active:scale-[0.98] transition-all flex items-center justify-center gap-3 border border-red-100"
        >
          <LogOut size={20} /> Logout
        </button>

        <div className="text-center pt-8">
          <p className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.5em] italic">
            {APP_NAME} v2.4.0
          </p>
        </div>
      </div>
    </div>
  );
}
