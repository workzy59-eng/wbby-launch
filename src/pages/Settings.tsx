import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Shield, 
  Bell, 
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
  Save
} from 'lucide-react';
import { FirebaseUser, logOut, db } from '../firebase';
import { UserProfile, SystemSettings, Project } from '../types';
import { updateProfile, getSystemSettings, updateSystemSettings, getProfiles } from '../services/database';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { ADMIN_EMAIL, APP_NAME } from '../constants';
import { useNavigate } from 'react-router-dom';

interface SettingsProps {
  user: FirebaseUser;
  profile: UserProfile | null;
}

type SettingTab = 
  | 'profile' 
  | 'business' 
  | 'security' 
  | 'subscription' 
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
  
  const [formData, setFormData] = useState({
    displayName: profile?.displayName || '',
    phone: profile?.phone || '',
    businessName: profile?.businessName || '',
    businessType: profile?.businessType || '',
    googleMapsLink: profile?.googleMapsLink || '',
    photoURL: profile?.photoURL || '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || '',
        phone: profile.phone || '',
        businessName: profile.businessName || '',
        businessType: profile.businessType || '',
        googleMapsLink: profile.googleMapsLink || '',
        photoURL: profile.photoURL || '',
      });
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
    } catch (error) {
      console.error('Failed to update profile:', error);
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
    } catch (error) {
      console.error('Failed to update system settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const clientTabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'business', label: 'Business Details', icon: Briefcase },
    { id: 'security', label: 'Account Security', icon: Shield },
    { id: 'subscription', label: 'Subscription', icon: CreditCard },
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
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
      {/* Mobile Header */}
      <div className="md:hidden bg-[#1e3a8a] text-white p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1">
            <X size={24} />
          </button>
          <h1 className="text-xl font-bold">Settings</h1>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1">
          <Menu size={24} />
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-[#1e3a8a] text-white transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col p-6">
          <div className="mb-10 hidden md:block">
            <h1 className="text-2xl font-black tracking-tighter text-[#facc15] italic">{APP_NAME}</h1>
            <p className="text-xs font-bold text-white/50 uppercase tracking-widest mt-1">Settings Portal</p>
          </div>

          <nav className="flex-1 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as SettingTab);
                  setIsSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all
                  ${activeTab === tab.id 
                    ? 'bg-[#facc15] text-[#1e3a8a] shadow-lg shadow-yellow-500/20' 
                    : 'text-white/70 hover:bg-white/10 hover:text-white'}
                `}
              >
                <tab.icon size={20} />
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="pt-6 border-t border-white/10">
            <button 
              onClick={() => logOut()}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-red-400 hover:bg-red-500/10 transition-all"
            >
              <LogOut size={20} />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-10 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'profile' && (
                <div className="space-y-8">
                  <header>
                    <h2 className="text-3xl font-black text-[#1e3a8a] uppercase italic">Profile Settings</h2>
                    <p className="text-gray-500 font-medium">Manage your public identity and contact info.</p>
                  </header>

                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                      <div className="relative group">
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-50 shadow-inner">
                          <img 
                            src={formData.photoURL || `https://ui-avatars.com/api/?name=${formData.displayName}&background=1e3a8a&color=fff`} 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <label className="absolute bottom-0 right-0 p-3 bg-[#facc15] text-[#1e3a8a] rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform">
                          <RefreshCw size={18} />
                          <input type="file" className="hidden" />
                        </label>
                      </div>

                      <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-black text-[#1e3a8a] uppercase tracking-widest">Full Name</label>
                          <input 
                            type="text" 
                            value={formData.displayName}
                            onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-[#1e3a8a] transition-all font-bold"
                            placeholder="John Doe"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-black text-[#1e3a8a] uppercase tracking-widest">Phone Number</label>
                          <input 
                            type="tel" 
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-[#1e3a8a] transition-all font-bold"
                            placeholder="+91 00000 00000"
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <label className="text-xs font-black text-[#1e3a8a] uppercase tracking-widest">Business Name</label>
                          <input 
                            type="text" 
                            value={formData.businessName}
                            onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-[#1e3a8a] transition-all font-bold"
                            placeholder="My Awesome Shop"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-gray-50 flex justify-end">
                      <button 
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className="px-10 py-4 bg-[#1e3a8a] text-white rounded-2xl font-black uppercase tracking-widest hover:bg-[#1e3a8a]/90 active:scale-95 transition-all flex items-center gap-3 shadow-lg shadow-blue-900/20"
                      >
                        {isSaving ? <RefreshCw className="animate-spin" size={20} /> : (saveSuccess ? <Check size={20} /> : <><Save size={20} /> Save Changes</>)}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'business' && (
                <div className="space-y-8">
                  <header>
                    <h2 className="text-3xl font-black text-[#1e3a8a] uppercase italic">Business Details</h2>
                    <p className="text-gray-500 font-medium">Help us understand your business better.</p>
                  </header>

                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-[#1e3a8a] uppercase tracking-widest">Business Type</label>
                        <select 
                          value={formData.businessType}
                          onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                          className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-[#1e3a8a] transition-all font-bold appearance-none"
                        >
                          <option value="">Select Type</option>
                          <option value="Salon">Salon / Spa</option>
                          <option value="Restaurant">Restaurant / Cafe</option>
                          <option value="Shop">Retail Shop</option>
                          <option value="Gym">Gym / Fitness</option>
                          <option value="Real Estate">Real Estate</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-[#1e3a8a] uppercase tracking-widest">Google Maps Link</label>
                        <div className="relative">
                          <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                          <input 
                            type="url" 
                            value={formData.googleMapsLink}
                            onChange={(e) => setFormData({ ...formData, googleMapsLink: e.target.value })}
                            className="w-full pl-14 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-[#1e3a8a] transition-all font-bold"
                            placeholder="https://maps.google.com/..."
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-yellow-50 rounded-2xl border border-yellow-100 flex gap-4">
                      <AlertCircle className="text-[#facc15] shrink-0" size={24} />
                      <p className="text-sm text-[#1e3a8a] font-bold">
                        Providing your Google Maps link helps us integrate a live map into your website, making it easier for local customers to find you.
                      </p>
                    </div>

                    <div className="pt-6 border-t border-gray-50 flex justify-end">
                      <button 
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className="px-10 py-4 bg-[#1e3a8a] text-white rounded-2xl font-black uppercase tracking-widest hover:bg-[#1e3a8a]/90 active:scale-95 transition-all flex items-center gap-3"
                      >
                        {isSaving ? <RefreshCw className="animate-spin" size={20} /> : (saveSuccess ? <Check size={20} /> : 'Update Business Info')}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-8">
                  <header>
                    <h2 className="text-3xl font-black text-[#1e3a8a] uppercase italic">Account Security</h2>
                    <p className="text-gray-500 font-medium">Protect your account and data.</p>
                  </header>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-[#1e3a8a]">
                        <Lock size={24} />
                      </div>
                      <h3 className="text-xl font-black text-[#1e3a8a]">Password</h3>
                      <p className="text-sm text-gray-500 font-medium">You are currently signed in with Google. Password management is handled by your Google Account.</p>
                      <button className="w-full py-4 bg-gray-50 text-[#1e3a8a] rounded-2xl font-black uppercase tracking-widest hover:bg-gray-100 transition-all">
                        Manage Google Account
                      </button>
                    </div>

                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-4">
                      <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600">
                        <LogOut size={24} />
                      </div>
                      <h3 className="text-xl font-black text-red-600">Session</h3>
                      <p className="text-sm text-gray-500 font-medium">Sign out of your current session on this device.</p>
                      <button 
                        onClick={() => logOut()}
                        className="w-full py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
                      >
                        Sign Out Now
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'subscription' && (
                <div className="space-y-8">
                  <header>
                    <h2 className="text-3xl font-black text-[#1e3a8a] uppercase italic">Subscription Status</h2>
                    <p className="text-gray-500 font-medium">Monitor your hosting and plan details.</p>
                  </header>

                  {activeProject ? (
                    <div className="bg-[#1e3a8a] rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-[#facc15] rounded-full -mr-32 -mt-32 opacity-10" />
                      
                      <div className="relative z-10 space-y-8">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="px-4 py-1 bg-[#facc15] text-[#1e3a8a] rounded-full text-[10px] font-black uppercase tracking-[0.2em]">Active Plan</span>
                            <h3 className="text-5xl font-black mt-4 uppercase italic tracking-tighter">{activeProject.plan || 'Starter'}</h3>
                          </div>
                          <CreditCard size={48} className="text-[#facc15]" />
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                          <div>
                            <p className="text-white/50 text-[10px] font-black uppercase tracking-widest mb-1">Status</p>
                            <p className="text-xl font-bold flex items-center gap-2">
                              <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                              Live & Hosting
                            </p>
                          </div>
                          <div>
                            <p className="text-white/50 text-[10px] font-black uppercase tracking-widest mb-1">Renewal Date</p>
                            <p className="text-xl font-bold">April 2027</p>
                          </div>
                        </div>

                        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row gap-4">
                          <button className="flex-1 py-4 bg-white text-[#1e3a8a] rounded-2xl font-black uppercase tracking-widest hover:bg-[#facc15] transition-all">
                            Upgrade Plan
                          </button>
                          <button className="flex-1 py-4 bg-white/10 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-white/20 transition-all border border-white/20">
                            Download Invoice
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-200 space-y-6">
                      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                        <CreditCard size={40} />
                      </div>
                      <h3 className="text-2xl font-black text-[#1e3a8a]">No Active Subscription</h3>
                      <p className="text-gray-500 max-w-xs mx-auto font-medium">Launch your first website to see subscription details here.</p>
                      <button onClick={() => navigate('/onboarding')} className="px-10 py-4 bg-[#1e3a8a] text-white rounded-2xl font-black uppercase tracking-widest hover:bg-[#1e3a8a]/90 transition-all">
                        Get Started
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'controls' && isAdmin && (
                <div className="space-y-8">
                  <header>
                    <h2 className="text-3xl font-black text-[#1e3a8a] uppercase italic">Global Controls</h2>
                    <p className="text-gray-500 font-medium">Manage platform-wide availability.</p>
                  </header>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex items-center justify-between">
                      <div className="space-y-1">
                        <h4 className="text-xl font-black text-[#1e3a8a]">Maintenance Mode</h4>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Disable public access</p>
                      </div>
                      <button 
                        onClick={() => handleUpdateSystemSettings({ maintenanceMode: !systemSettings?.maintenanceMode })}
                        className={`w-16 h-9 rounded-full transition-all relative ${systemSettings?.maintenanceMode ? 'bg-red-500' : 'bg-gray-200'}`}
                      >
                        <div className={`absolute top-1 w-7 h-7 rounded-full bg-white transition-all shadow-sm ${systemSettings?.maintenanceMode ? 'left-8' : 'left-1'}`} />
                      </button>
                    </div>

                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex items-center justify-between">
                      <div className="space-y-1">
                        <h4 className="text-xl font-black text-[#1e3a8a]">New Registrations</h4>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Allow new signups</p>
                      </div>
                      <button 
                        onClick={() => handleUpdateSystemSettings({ allowNewRegistrations: !systemSettings?.allowNewRegistrations })}
                        className={`w-16 h-9 rounded-full transition-all relative ${systemSettings?.allowNewRegistrations ? 'bg-green-500' : 'bg-gray-200'}`}
                      >
                        <div className={`absolute top-1 w-7 h-7 rounded-full bg-white transition-all shadow-sm ${systemSettings?.allowNewRegistrations ? 'left-8' : 'left-1'}`} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'pricing' && isAdmin && (
                <div className="space-y-8">
                  <header>
                    <h2 className="text-3xl font-black text-[#1e3a8a] uppercase italic">Pricing Control</h2>
                    <p className="text-gray-500 font-medium">Update costs shown across the platform.</p>
                  </header>

                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-[#1e3a8a] uppercase tracking-widest">Base Website Cost (₹)</label>
                        <div className="relative">
                          <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                          <input 
                            type="number" 
                            value={systemSettings?.baseWebsiteCost || 1499}
                            onChange={(e) => handleUpdateSystemSettings({ baseWebsiteCost: parseInt(e.target.value) })}
                            className="w-full pl-14 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-[#1e3a8a] transition-all font-bold"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 flex gap-4">
                      <AlertCircle className="text-[#1e3a8a] shrink-0" size={24} />
                      <p className="text-sm text-[#1e3a8a] font-bold">
                        Changing this value will immediately update the pricing cards on the landing page and onboarding flow.
                      </p>
                    </div>

                    <div className="pt-6 border-t border-gray-50 flex justify-end">
                      <button 
                        disabled={isSaving}
                        className="px-10 py-4 bg-[#1e3a8a] text-white rounded-2xl font-black uppercase tracking-widest hover:bg-[#1e3a8a]/90 transition-all flex items-center gap-3"
                      >
                        {isSaving ? <RefreshCw className="animate-spin" size={20} /> : 'Update Global Pricing'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'users' && isAdmin && (
                <div className="space-y-8">
                  <header>
                    <h2 className="text-3xl font-black text-[#1e3a8a] uppercase italic">User Management</h2>
                    <p className="text-gray-500 font-medium">Overview of all registered clients.</p>
                  </header>

                  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="px-6 py-4 text-[10px] font-black text-[#1e3a8a] uppercase tracking-widest">User</th>
                            <th className="px-6 py-4 text-[10px] font-black text-[#1e3a8a] uppercase tracking-widest">Role</th>
                            <th className="px-6 py-4 text-[10px] font-black text-[#1e3a8a] uppercase tracking-widest">Status</th>
                            <th className="px-6 py-4 text-[10px] font-black text-[#1e3a8a] uppercase tracking-widest">Joined</th>
                            <th className="px-6 py-4 text-[10px] font-black text-[#1e3a8a] uppercase tracking-widest">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {allUsers.map((u) => (
                            <tr key={u.uid} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100">
                                    <img src={u.photoURL || `https://ui-avatars.com/api/?name=${u.displayName}&background=1e3a8a&color=fff`} alt="" className="w-full h-full object-cover" />
                                  </div>
                                  <div>
                                    <p className="font-bold text-sm">{u.displayName}</p>
                                    <p className="text-[10px] text-gray-400 font-bold">{u.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${u.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                  {u.role}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <span className={`w-2 h-2 rounded-full ${u.status === 'online' ? 'bg-green-500' : 'bg-gray-300'}`} />
                                  <span className="text-xs font-bold text-gray-500 capitalize">{u.status}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-xs font-bold text-gray-400">
                                {u.createdAt ? new Date(u.createdAt as any).toLocaleDateString() : 'N/A'}
                              </td>
                              <td className="px-6 py-4">
                                <button onClick={() => navigate(`/admin?user=${u.uid}`)} className="p-2 hover:bg-white rounded-lg transition-colors text-[#1e3a8a]">
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
      </main>
    </div>
  );
}
