import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Shield, 
  Layout, 
  LogOut, 
  Check, 
  RefreshCw, 
  Globe, 
  Phone, 
  Briefcase, 
  MapPin, 
  Lock, 
  CreditCard, 
  Settings2, 
  DollarSign, 
  Users, 
  AlertCircle,
  Menu,
  X,
  ChevronRight,
  Save,
  FileText,
  Download
} from 'lucide-react';
import { FirebaseUser, logOut, db } from '../firebase';
import { UserProfile, SystemSettings, Project } from '../types';
import { updateProfile, getSystemSettings, updateSystemSettings, getProfiles } from '../services/database';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { ADMIN_EMAIL, APP_NAME } from '../constants';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import InvoiceSystem from '../components/InvoiceSystem';

interface SettingsProps {
  user: FirebaseUser;
  profile: UserProfile | null;
}

type SettingTab = 
  | 'profile' 
  | 'business' 
  | 'security' 
  | 'subscription' 
  | 'preferences'
  | 'controls' 
  | 'pricing' 
  | 'users';

export default function Settings({ user, profile }: SettingsProps) {
  const navigate = useNavigate();
  const isAdmin = profile?.role === 'admin' || user.email === ADMIN_EMAIL;
  
  const [activeTab, setActiveTab] = useState<SettingTab>('profile');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [showInvoice, setShowInvoice] = useState(false);
  
  const [formData, setFormData] = useState({
    displayName: profile?.displayName || '',
    phone: profile?.phone || '',
    businessName: profile?.businessName || '',
    businessType: profile?.businessType || '',
    googleMapsLink: profile?.googleMapsLink || '',
    photoURL: profile?.photoURL || '',
    preferences: {
      language: 'English',
      timezone: 'Asia/Kolkata',
      theme: 'Dark'
    }
  });

  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        displayName: profile.displayName || '',
        phone: profile.phone || '',
        businessName: profile.businessName || '',
        businessType: profile.businessType || '',
        googleMapsLink: profile.googleMapsLink || '',
        photoURL: profile.photoURL || '',
      }));
    }
  }, [profile]);

  useEffect(() => {
    if (isAdmin) {
      getSystemSettings().then(settings => {
        if (settings) setSystemSettings(settings);
      });
      getProfiles().then(profiles => {
        setAllUsers(profiles);
      });
    }

    if (user.uid) {
      const q = query(collection(db, 'projects'), where('userId', '==', user.uid));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const projects = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Project));
        setUserProjects(projects);
      });
      return () => unsubscribe();
    }
  }, [isAdmin, user.uid]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await updateProfile(user.uid, {
        displayName: formData.displayName,
        phone: formData.phone,
        businessName: formData.businessName,
        businessType: formData.businessType,
        googleMapsLink: formData.googleMapsLink,
        photoURL: formData.photoURL,
        updatedAt: new Date().toISOString()
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateSystemSettings = async (data: Partial<SystemSettings>) => {
    setIsSaving(true);
    try {
      await updateSystemSettings(data);
      if (systemSettings) {
        setSystemSettings({ ...systemSettings, ...data });
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      toast.success('System settings updated!');
    } catch (error) {
      console.error('Failed to update system settings:', error);
      toast.error('Failed to update system settings');
    } finally {
      setIsSaving(false);
    }
  };

  const clientTabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'business', label: 'Business Details', icon: Briefcase },
    { id: 'security', label: 'Account Security', icon: Shield },
    { id: 'subscription', label: 'Subscription & Invoice', icon: CreditCard },
    { id: 'preferences', label: 'Preferences', icon: Globe },
  ];

  const adminTabs = [
    { id: 'profile', label: 'Admin Profile', icon: User },
    { id: 'controls', label: 'Global Controls', icon: Settings2 },
    { id: 'pricing', label: 'Pricing Control', icon: DollarSign },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  const tabs = isAdmin ? adminTabs : clientTabs;
  const activeProject = userProjects[0];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col md:flex-row font-sans selection:bg-[#E6FF00] selection:text-black">
      {/* Mobile Header */}
      <div className="md:hidden bg-black/50 backdrop-blur-xl border-b border-white/10 p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded-xl transition-all">
            <X size={24} />
          </button>
          <h1 className="text-xl font-black uppercase italic tracking-tighter">Settings</h1>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-white/5 rounded-xl transition-all">
          <Menu size={24} />
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-black/40 backdrop-blur-3xl border-r border-white/5 transform transition-transform duration-500 ease-in-out md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col p-8">
          <div className="mb-12 hidden md:block">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center border border-white/10">
                <span className="text-white font-black text-sm italic">W</span>
              </div>
              <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic">{APP_NAME}</h1>
            </div>
            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Settings Portal</p>
          </div>

          <nav className="flex-1 space-y-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as SettingTab);
                  setIsSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black uppercase italic tracking-tighter transition-all group
                  ${activeTab === tab.id 
                    ? 'bg-[#E6FF00] text-black shadow-[0_0_30px_rgba(230,255,0,0.2)] scale-105' 
                    : 'text-white/40 hover:bg-white/5 hover:text-white'}
                `}
              >
                <tab.icon size={20} className={activeTab === tab.id ? '' : 'group-hover:scale-110 transition-transform'} />
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="pt-8 border-t border-white/5">
            <button 
              onClick={() => logOut()}
              className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black uppercase italic tracking-tighter text-red-500 hover:bg-red-500/10 transition-all"
            >
              <LogOut size={20} />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-16 overflow-y-auto relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#E6FF00]/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "circOut" }}
            >
              {activeTab === 'profile' && (
                <div className="space-y-12">
                  <header className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#E6FF00] rounded-full animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#E6FF00]">Identity</span>
                    </div>
                    <h2 className="text-5xl md:text-7xl font-black text-white uppercase italic tracking-tighter leading-none">Profile <br/><span className="text-[#E6FF00]">Settings</span></h2>
                  </header>

                  <div className="bg-white/5 backdrop-blur-xl rounded-[3rem] p-10 border border-white/10 space-y-10">
                    <div className="flex flex-col md:flex-row items-center gap-10">
                      <div className="relative group">
                        <div className="w-40 h-40 rounded-[2.5rem] overflow-hidden border-4 border-white/5 shadow-2xl relative">
                          <img 
                            src={formData.photoURL || `https://ui-avatars.com/api/?name=${formData.displayName}&background=E6FF00&color=000`} 
                            alt="Profile" 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <RefreshCw className="text-white animate-spin-slow" size={32} />
                          </div>
                        </div>
                        <label className="absolute -bottom-4 -right-4 p-4 bg-[#E6FF00] text-black rounded-2xl shadow-2xl cursor-pointer hover:scale-110 active:scale-95 transition-all">
                          <Settings2 size={20} />
                          <input type="file" className="hidden" />
                        </label>
                      </div>

                      <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Full Name</label>
                          <input 
                            type="text" 
                            value={formData.displayName}
                            onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                            className="w-full px-6 py-5 bg-black/20 border border-white/5 rounded-2xl focus:outline-none focus:border-[#E6FF00]/50 transition-all font-black uppercase italic tracking-tighter text-xl"
                            placeholder="John Doe"
                          />
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Phone Number</label>
                          <input 
                            type="tel" 
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-6 py-5 bg-black/20 border border-white/5 rounded-2xl focus:outline-none focus:border-[#E6FF00]/50 transition-all font-black uppercase italic tracking-tighter text-xl"
                            placeholder="00000 00000"
                          />
                        </div>
                        <div className="space-y-3 md:col-span-2">
                          <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Business Name</label>
                          <input 
                            type="text" 
                            value={formData.businessName}
                            onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                            className="w-full px-6 py-5 bg-black/20 border border-white/5 rounded-2xl focus:outline-none focus:border-[#E6FF00]/50 transition-all font-black uppercase italic tracking-tighter text-xl"
                            placeholder="My Awesome Shop"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-10 border-t border-white/5 flex justify-end">
                      <button 
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className="px-12 py-5 bg-[#E6FF00] text-black rounded-2xl font-black uppercase italic tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-4 shadow-[0_0_30px_rgba(230,255,0,0.2)]"
                      >
                        {isSaving ? <RefreshCw className="animate-spin" size={24} /> : (saveSuccess ? <Check size={24} /> : <><Save size={24} /> Save Changes</>)}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'business' && (
                <div className="space-y-12">
                  <header className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#E6FF00] rounded-full animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#E6FF00]">Operations</span>
                    </div>
                    <h2 className="text-5xl md:text-7xl font-black text-white uppercase italic tracking-tighter leading-none">Business <br/><span className="text-[#E6FF00]">Details</span></h2>
                  </header>

                  <div className="bg-white/5 backdrop-blur-xl rounded-[3rem] p-10 border border-white/10 space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Business Type</label>
                        <select 
                          value={formData.businessType}
                          onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                          className="w-full px-6 py-5 bg-black/20 border border-white/5 rounded-2xl focus:outline-none focus:border-[#E6FF00]/50 transition-all font-black uppercase italic tracking-tighter text-xl appearance-none"
                        >
                          <option value="" className="bg-slate-900">Select Type</option>
                          <option value="Salon" className="bg-slate-900">Salon / Spa</option>
                          <option value="Restaurant" className="bg-slate-900">Restaurant / Cafe</option>
                          <option value="Shop" className="bg-slate-900">Retail Shop</option>
                          <option value="Gym" className="bg-slate-900">Gym / Fitness</option>
                          <option value="Real Estate" className="bg-slate-900">Real Estate</option>
                          <option value="Other" className="bg-slate-900">Other</option>
                        </select>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Google Maps Link</label>
                        <div className="relative">
                          <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={24} />
                          <input 
                            type="url" 
                            value={formData.googleMapsLink}
                            onChange={(e) => setFormData({ ...formData, googleMapsLink: e.target.value })}
                            className="w-full pl-16 pr-6 py-5 bg-black/20 border border-white/5 rounded-2xl focus:outline-none focus:border-[#E6FF00]/50 transition-all font-black uppercase italic tracking-tighter text-xl"
                            placeholder="https://maps.google.com/..."
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-8 bg-[#E6FF00]/5 rounded-[2rem] border border-[#E6FF00]/10 flex gap-6">
                      <AlertCircle className="text-[#E6FF00] shrink-0" size={32} />
                      <p className="text-sm text-white/60 font-medium italic leading-relaxed">
                        Providing your Google Maps link helps us integrate a live map into your website, making it easier for local customers to find you.
                      </p>
                    </div>

                    <div className="pt-10 border-t border-white/5 flex justify-end">
                      <button 
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className="px-12 py-5 bg-[#E6FF00] text-black rounded-2xl font-black uppercase italic tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-4 shadow-[0_0_30px_rgba(230,255,0,0.2)]"
                      >
                        {isSaving ? <RefreshCw className="animate-spin" size={24} /> : (saveSuccess ? <Check size={24} /> : 'Update Business Info')}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-12">
                  <header className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#E6FF00] rounded-full animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#E6FF00]">Protection</span>
                    </div>
                    <h2 className="text-5xl md:text-7xl font-black text-white uppercase italic tracking-tighter leading-none">Account <br/><span className="text-[#E6FF00]">Security</span></h2>
                  </header>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white/5 backdrop-blur-xl rounded-[3rem] p-10 border border-white/10 space-y-6 group hover:border-[#E6FF00]/30 transition-all">
                      <div className="w-16 h-16 bg-[#E6FF00]/10 rounded-2xl flex items-center justify-center text-[#E6FF00] group-hover:scale-110 transition-transform">
                        <Lock size={32} />
                      </div>
                      <h3 className="text-3xl font-black uppercase italic tracking-tighter">Password</h3>
                      <p className="text-sm text-white/40 font-medium italic leading-relaxed">You are currently signed in with Google. Password management is handled by your Google Account.</p>
                      <button className="w-full py-5 bg-white/5 text-white border border-white/10 rounded-2xl font-black uppercase italic tracking-widest hover:bg-white/10 transition-all">
                        Manage Google Account
                      </button>
                    </div>

                    <div className="bg-white/5 backdrop-blur-xl rounded-[3rem] p-10 border border-white/10 space-y-6 group hover:border-red-500/30 transition-all">
                      <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                        <LogOut size={32} />
                      </div>
                      <h3 className="text-3xl font-black uppercase italic tracking-tighter text-red-500">Session</h3>
                      <p className="text-sm text-white/40 font-medium italic leading-relaxed">Sign out of your current session on this device.</p>
                      <button 
                        onClick={() => logOut()}
                        className="w-full py-5 bg-red-600 text-white rounded-2xl font-black uppercase italic tracking-widest hover:bg-red-700 transition-all shadow-[0_0_30px_rgba(220,38,38,0.2)]"
                      >
                        Sign Out Now
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'subscription' && (
                <div className="space-y-12">
                  <header className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#E6FF00] rounded-full animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#E6FF00]">Billing</span>
                    </div>
                    <h2 className="text-5xl md:text-7xl font-black text-white uppercase italic tracking-tighter leading-none">Subscription <br/><span className="text-[#E6FF00]">& Invoice</span></h2>
                  </header>

                  {activeProject ? (
                    <div className="bg-white/5 backdrop-blur-xl rounded-[3.5rem] p-12 border border-white/10 shadow-2xl relative overflow-hidden group">
                      <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#E6FF00] rounded-full blur-[120px] opacity-10 group-hover:opacity-20 transition-opacity" />
                      
                      <div className="relative z-10 space-y-12">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="px-6 py-2 bg-[#E6FF00] text-black rounded-full text-[10px] font-black uppercase tracking-[0.3em] italic">Active Plan</span>
                            <h3 className="text-6xl font-black mt-6 uppercase italic tracking-tighter text-[#E6FF00]">{activeProject.plan || 'Starter Launch'}</h3>
                          </div>
                          <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center text-[#E6FF00] border border-white/10">
                            <CreditCard size={40} />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                          <div className="space-y-2">
                            <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em]">System Status</p>
                            <div className="flex items-center gap-3">
                              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
                              <p className="text-2xl font-black uppercase italic tracking-tighter">Live & Hosting</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em]">Renewal Date</p>
                            <p className="text-2xl font-black uppercase italic tracking-tighter">April 2027</p>
                          </div>
                        </div>

                        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row gap-6">
                          <button className="flex-1 py-6 bg-[#E6FF00] text-black rounded-2xl font-black uppercase italic tracking-widest text-xl hover:scale-[1.02] transition-all shadow-[0_0_30px_rgba(230,255,0,0.2)]">
                            Upgrade Plan
                          </button>
                          <button 
                            onClick={() => setShowInvoice(true)}
                            className="flex-1 py-6 bg-white/5 text-white border border-white/10 rounded-2xl font-black uppercase italic tracking-widest text-xl hover:bg-white/10 transition-all flex items-center justify-center gap-4"
                          >
                            <FileText size={24} /> View Invoice
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white/5 backdrop-blur-xl rounded-[3.5rem] p-20 text-center border border-dashed border-white/10 space-y-8">
                      <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/20 border border-white/5">
                        <CreditCard size={48} />
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-4xl font-black text-[#E6FF00] uppercase italic tracking-tighter">No Active Subscription</h3>
                        <p className="text-white/40 max-w-xs mx-auto font-medium italic">Launch your first website to see subscription and invoice details here.</p>
                      </div>
                      <button onClick={() => navigate('/onboarding')} className="px-12 py-5 bg-[#E6FF00] text-black rounded-2xl font-black uppercase italic tracking-widest text-xl hover:scale-105 transition-all shadow-[0_0_30px_rgba(230,255,0,0.2)]">
                        Get Started
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'preferences' && (
                <div className="space-y-12">
                  <header className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#E6FF00] rounded-full animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#E6FF00]">Experience</span>
                    </div>
                    <h2 className="text-5xl md:text-7xl font-black text-white uppercase italic tracking-tighter leading-none">Platform <br/><span className="text-[#E6FF00]">Preferences</span></h2>
                  </header>

                  <div className="bg-white/5 backdrop-blur-xl rounded-[3rem] p-10 border border-white/10 space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Language</label>
                        <select 
                          value={formData.preferences.language}
                          onChange={(e) => setFormData({ ...formData, preferences: { ...formData.preferences, language: e.target.value } })}
                          className="w-full px-6 py-5 bg-black/20 border border-white/5 rounded-2xl focus:outline-none focus:border-[#E6FF00]/50 transition-all font-black uppercase italic tracking-tighter text-xl appearance-none"
                        >
                          <option className="bg-slate-900">English</option>
                          <option className="bg-slate-900">Hindi</option>
                          <option className="bg-slate-900">Spanish</option>
                          <option className="bg-slate-900">French</option>
                        </select>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Timezone</label>
                        <select 
                          value={formData.preferences.timezone}
                          onChange={(e) => setFormData({ ...formData, preferences: { ...formData.preferences, timezone: e.target.value } })}
                          className="w-full px-6 py-5 bg-black/20 border border-white/5 rounded-2xl focus:outline-none focus:border-[#E6FF00]/50 transition-all font-black uppercase italic tracking-tighter text-xl appearance-none"
                        >
                          <option className="bg-slate-900">Asia/Kolkata (GMT+5:30)</option>
                          <option className="bg-slate-900">UTC (GMT+0:00)</option>
                          <option className="bg-slate-900">America/New_York (GMT-5:00)</option>
                          <option className="bg-slate-900">Europe/London (GMT+0:00)</option>
                        </select>
                      </div>
                    </div>
                    <div className="pt-10 border-t border-white/5 flex justify-end">
                      <button 
                        onClick={handleSaveProfile}
                        className="px-12 py-5 bg-[#E6FF00] text-black rounded-2xl font-black uppercase italic tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(230,255,0,0.2)]"
                      >
                        Save Preferences
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'controls' && isAdmin && (
                <div className="space-y-12">
                  <header className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#E6FF00] rounded-full animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#E6FF00]">Admin</span>
                    </div>
                    <h2 className="text-5xl md:text-7xl font-black text-white uppercase italic tracking-tighter leading-none">Global <br/><span className="text-[#E6FF00]">Controls</span></h2>
                  </header>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white/5 backdrop-blur-xl rounded-[3rem] p-10 border border-white/10 flex items-center justify-between group hover:border-[#E6FF00]/30 transition-all">
                      <div className="space-y-1">
                        <h4 className="text-2xl font-black uppercase italic tracking-tighter text-white">Maintenance Mode</h4>
                        <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">Disable public access</p>
                      </div>
                      <button 
                        onClick={() => handleUpdateSystemSettings({ maintenanceMode: !systemSettings?.maintenanceMode })}
                        className={`w-16 h-9 rounded-full transition-all relative ${systemSettings?.maintenanceMode ? 'bg-red-500' : 'bg-white/10'}`}
                      >
                        <div className={`absolute top-1 w-7 h-7 rounded-full bg-white transition-all shadow-xl ${systemSettings?.maintenanceMode ? 'left-8' : 'left-1'}`} />
                      </button>
                    </div>

                    <div className="bg-white/5 backdrop-blur-xl rounded-[3rem] p-10 border border-white/10 flex items-center justify-between group hover:border-[#E6FF00]/30 transition-all">
                      <div className="space-y-1">
                        <h4 className="text-2xl font-black uppercase italic tracking-tighter text-white">New Registrations</h4>
                        <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">Allow new signups</p>
                      </div>
                      <button 
                        onClick={() => handleUpdateSystemSettings({ allowNewRegistrations: !systemSettings?.allowNewRegistrations })}
                        className={`w-16 h-9 rounded-full transition-all relative ${systemSettings?.allowNewRegistrations ? 'bg-green-500' : 'bg-white/10'}`}
                      >
                        <div className={`absolute top-1 w-7 h-7 rounded-full bg-white transition-all shadow-xl ${systemSettings?.allowNewRegistrations ? 'left-8' : 'left-1'}`} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'pricing' && isAdmin && (
                <div className="space-y-12">
                  <header className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#E6FF00] rounded-full animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#E6FF00]">Revenue</span>
                    </div>
                    <h2 className="text-5xl md:text-7xl font-black text-white uppercase italic tracking-tighter leading-none">Pricing <br/><span className="text-[#E6FF00]">Control</span></h2>
                  </header>

                  <div className="bg-white/5 backdrop-blur-xl rounded-[3rem] p-10 border border-white/10 space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Starter Price (₹)</label>
                        <div className="relative">
                          <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={24} />
                          <input 
                            type="number" 
                            value={systemSettings?.pricing?.starter || 1499}
                            onChange={(e) => setSystemSettings(prev => prev ? { ...prev, pricing: { ...prev.pricing!, starter: parseInt(e.target.value) } } : null)}
                            className="w-full pl-16 pr-6 py-5 bg-black/20 border border-white/5 rounded-2xl focus:outline-none focus:border-[#E6FF00]/50 transition-all font-black uppercase italic tracking-tighter text-xl"
                          />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Pro Price (₹)</label>
                        <div className="relative">
                          <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={24} />
                          <input 
                            type="number" 
                            value={systemSettings?.pricing?.pro || 3499}
                            onChange={(e) => setSystemSettings(prev => prev ? { ...prev, pricing: { ...prev.pricing!, pro: parseInt(e.target.value) } } : null)}
                            className="w-full pl-16 pr-6 py-5 bg-black/20 border border-white/5 rounded-2xl focus:outline-none focus:border-[#E6FF00]/50 transition-all font-black uppercase italic tracking-tighter text-xl"
                          />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Enterprise Price (₹)</label>
                        <div className="relative">
                          <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={24} />
                          <input 
                            type="number" 
                            value={systemSettings?.pricing?.enterprise || 9999}
                            onChange={(e) => setSystemSettings(prev => prev ? { ...prev, pricing: { ...prev.pricing!, enterprise: parseInt(e.target.value) } } : null)}
                            className="w-full pl-16 pr-6 py-5 bg-black/20 border border-white/5 rounded-2xl focus:outline-none focus:border-[#E6FF00]/50 transition-all font-black uppercase italic tracking-tighter text-xl"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-8 bg-[#E6FF00]/5 rounded-[2rem] border border-[#E6FF00]/10 flex gap-6">
                      <AlertCircle className="text-[#E6FF00] shrink-0" size={32} />
                      <p className="text-sm text-white/60 font-medium italic leading-relaxed">
                        Changing these values will immediately update the pricing cards on the landing page and onboarding flow.
                      </p>
                    </div>

                    <div className="pt-10 border-t border-white/5 flex justify-end">
                      <button 
                        onClick={() => handleUpdateSystemSettings({ pricing: systemSettings?.pricing })}
                        disabled={isSaving}
                        className="px-12 py-5 bg-[#E6FF00] text-black rounded-2xl font-black uppercase italic tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-4 shadow-[0_0_30px_rgba(230,255,0,0.2)]"
                      >
                        {isSaving ? <RefreshCw className="animate-spin" size={24} /> : (saveSuccess ? <Check size={24} /> : 'Update Global Pricing')}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'users' && isAdmin && (
                <div className="space-y-12">
                  <header className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#E6FF00] rounded-full animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#E6FF00]">Community</span>
                    </div>
                    <h2 className="text-5xl md:text-7xl font-black text-white uppercase italic tracking-tighter leading-none">User <br/><span className="text-[#E6FF00]">Management</span></h2>
                  </header>

                  <div className="bg-white/5 backdrop-blur-xl rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-white/5 border-b border-white/10">
                            <th className="px-8 py-6 text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">User</th>
                            <th className="px-8 py-6 text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Role</th>
                            <th className="px-8 py-6 text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Status</th>
                            <th className="px-8 py-6 text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Joined</th>
                            <th className="px-8 py-6 text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {allUsers.map((u) => (
                            <tr key={u.uid} className="hover:bg-white/5 transition-colors group">
                              <td className="px-8 py-6">
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-2xl overflow-hidden bg-white/5 border border-white/10 group-hover:scale-110 transition-transform">
                                    <img src={u.photoURL || `https://ui-avatars.com/api/?name=${u.displayName}&background=E6FF00&color=000`} alt="" className="w-full h-full object-cover" />
                                  </div>
                                  <div>
                                    <p className="font-black uppercase italic tracking-tighter text-lg">{u.displayName}</p>
                                    <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">{u.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-8 py-6">
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${u.role === 'admin' ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'}`}>
                                  {u.role}
                                </span>
                              </td>
                              <td className="px-8 py-6">
                                <div className="flex items-center gap-3">
                                  <span className={`w-2 h-2 rounded-full ${u.status === 'online' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-white/20'}`} />
                                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{u.status}</span>
                                </div>
                              </td>
                              <td className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/30">
                                {u.createdAt ? new Date(u.createdAt as any).toLocaleDateString() : 'N/A'}
                              </td>
                              <td className="px-8 py-6">
                                <button onClick={() => navigate(`/admin?user=${u.uid}`)} className="p-3 bg-white/5 hover:bg-[#E6FF00] hover:text-black rounded-xl transition-all">
                                  <ChevronRight size={20} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Invoice Modal */}
        <AnimatePresence>
          {showInvoice && activeProject && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-2xl"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="w-full max-w-5xl h-[90vh] bg-white rounded-[3rem] overflow-hidden relative flex flex-col"
              >
                <button 
                  onClick={() => setShowInvoice(false)}
                  className="absolute top-8 right-8 z-50 p-4 bg-black text-white rounded-full hover:scale-110 active:scale-90 transition-all shadow-2xl"
                >
                  <X size={24} />
                </button>
                
                <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                  <InvoiceSystem 
                    project={activeProject} 
                    profile={profile} 
                    onClose={() => setShowInvoice(false)} 
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
