import React, { useState } from 'react';
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
  Loader2,
  X,
  Globe,
  Settings2,
  Activity,
  Trash2,
  Briefcase,
  Phone
} from 'lucide-react';
import { FirebaseUser, logOut, db } from '../firebase';
import { UserProfile, SystemSettings } from '../types';
import { updateProfile, getSystemSettings, updateSystemSettings } from '../services/database';
import { collection, query, getDocs, deleteDoc, doc } from 'firebase/firestore';

interface SettingsProps {
  user: FirebaseUser;
  profile: UserProfile | null;
}

export default function Settings({ user, profile }: SettingsProps) {
  const isAdmin = profile?.role === 'admin';
  const [activeSection, setActiveSection] = useState<string>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const [formData, setFormData] = useState({
    displayName: profile?.displayName || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    username: profile?.username || '',
    businessName: profile?.businessName || '',
    businessType: profile?.businessType || '',
    businessEmail: profile?.businessEmail || '',
    businessPhone: profile?.businessPhone || '',
    businessLocation: profile?.businessLocation || '',
    notifications: {
      email: true,
      push: true,
      updates: false
    }
  });

  React.useEffect(() => {
    if (isAdmin) {
      getSystemSettings().then(settings => {
        if (settings) setSystemSettings(settings);
      });
    }
  }, [isAdmin]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile(user.uid, {
        displayName: formData.displayName,
        phone: formData.phone,
        username: formData.username,
        businessName: formData.businessName,
        businessType: formData.businessType,
        businessEmail: formData.businessEmail,
        businessPhone: formData.businessPhone,
        businessLocation: formData.businessLocation,
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

  const handleResetDatabase = async () => {
    if (!isAdmin) return;
    setIsResetting(true);
    try {
      const collections = ['projects', 'conversations', 'notifications', 'leave_requests', 'attendance'];
      for (const collName of collections) {
        const q = query(collection(db, collName));
        const snapshot = await getDocs(q);
        await Promise.all(snapshot.docs.map(d => deleteDoc(doc(db, collName, d.id))));
      }
      setShowResetModal(false);
      alert('Database wiped successfully.');
    } catch (error) {
      console.error('Reset failed:', error);
    } finally {
      setIsResetting(false);
    }
  };

  const clientSections = [
    { id: 'profile', label: 'Profile Settings', icon: User, desc: 'Manage your personal info' },
    { id: 'business', label: 'Business Settings', icon: Briefcase, desc: 'Manage your business details' },
    { id: 'security', label: 'Password Settings', icon: Shield, desc: 'Update your password' },
    { id: 'notifications', label: 'Notifications', icon: Bell, desc: 'Manage alerts' },
  ];

  const adminSections = [
    { id: 'profile', label: 'Profile Settings', icon: User, desc: 'Admin personal info' },
    { id: 'payment', label: 'Payment Settings', icon: CreditCard, desc: 'Stripe & Razorpay config' },
    { id: 'website', label: 'Website Settings', icon: Globe, desc: 'Maintenance & SEO' },
    { id: 'notifications', label: 'Notification Settings', icon: Bell, desc: 'Admin & Client alerts' },
    { id: 'system', label: 'System Controls', icon: Settings2, desc: 'Database & Users' },
  ];

  const sections = isAdmin ? adminSections : clientSections;

  const renderSection = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-4 italic">Full Name</label>
                <input
                  type="text"
                  className="w-full p-6 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#E6FF00] uppercase font-black italic tracking-tighter transition-all"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-4 italic">Username</label>
                <input
                  type="text"
                  className="w-full p-6 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#E6FF00] uppercase font-black italic tracking-tighter transition-all"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s/g, '_') })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-4 italic">Email Address</label>
                <input
                  type="email"
                  readOnly
                  className="w-full p-6 rounded-2xl bg-white/5 border border-white/10 text-white/40 focus:outline-none uppercase font-black italic tracking-tighter cursor-not-allowed"
                  value={formData.email}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-4 italic">Phone Number</label>
                <input
                  type="tel"
                  className="w-full p-6 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#E6FF00] uppercase font-black italic tracking-tighter transition-all"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>
            <button onClick={handleSave} disabled={isSaving} className="px-12 py-5 bg-[#E6FF00] text-black rounded-full font-black text-xl uppercase italic hover:scale-[1.05] active:scale-[0.95] transition-all shadow-[0_0_30px_rgba(230,255,0,0.2)] flex items-center gap-4">
              {isSaving ? <Loader2 className="animate-spin" size={24} /> : (saveSuccess ? <Check size={24} /> : 'Save Changes')}
            </button>
          </motion.div>
        );
      case 'business':
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-4 italic">Business Name</label>
                <input
                  type="text"
                  className="w-full p-6 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#E6FF00] uppercase font-black italic tracking-tighter transition-all"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-4 italic">Business Type</label>
                <input
                  type="text"
                  className="w-full p-6 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#E6FF00] uppercase font-black italic tracking-tighter transition-all"
                  value={formData.businessType}
                  onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-4 italic">Business Email</label>
                <input
                  type="email"
                  className="w-full p-6 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#E6FF00] uppercase font-black italic tracking-tighter transition-all"
                  value={formData.businessEmail}
                  onChange={(e) => setFormData({ ...formData, businessEmail: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-4 italic">Business Phone</label>
                <input
                  type="tel"
                  className="w-full p-6 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#E6FF00] uppercase font-black italic tracking-tighter transition-all"
                  value={formData.businessPhone}
                  onChange={(e) => setFormData({ ...formData, businessPhone: e.target.value })}
                />
              </div>
            </div>
            <button onClick={handleSave} disabled={isSaving} className="px-12 py-5 bg-[#E6FF00] text-black rounded-full font-black text-xl uppercase italic hover:scale-[1.05] active:scale-[0.95] transition-all shadow-[0_0_30px_rgba(230,255,0,0.2)] flex items-center gap-4">
              {isSaving ? <Loader2 className="animate-spin" size={24} /> : (saveSuccess ? <Check size={24} /> : 'Update Business')}
            </button>
          </motion.div>
        );
      case 'security':
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div className="p-8 bg-white/5 rounded-3xl border border-white/10 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-4 italic">New Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="w-full p-6 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#E6FF00] uppercase font-black italic tracking-tighter transition-all"
                      placeholder="••••••••"
                    />
                    <button onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-4 italic">Confirm Password</label>
                  <input
                    type="password"
                    className="w-full p-6 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#E6FF00] uppercase font-black italic tracking-tighter transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <button className="px-12 py-5 bg-[#E6FF00] text-black rounded-full font-black text-xl uppercase italic hover:scale-[1.05] active:scale-[0.95] transition-all shadow-[0_0_30px_rgba(230,255,0,0.2)]">
                Update Password
              </button>
            </div>
          </motion.div>
        );
      case 'notifications':
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div className="space-y-4">
              {[
                { id: 'email', label: 'Email Notifications', desc: 'Receive updates about your project via email' },
                { id: 'push', label: 'Push Notifications', desc: 'Get real-time alerts on your browser' },
                { id: 'updates', label: 'Marketing Updates', desc: 'Stay informed about new features and offers' },
              ].map((item) => (
                <div key={item.id} className="p-8 bg-white/5 rounded-3xl border border-white/10 flex items-center justify-between group hover:border-white/20 transition-all">
                  <div>
                    <h4 className="text-xl font-black uppercase italic tracking-tighter">{item.label}</h4>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{item.desc}</p>
                  </div>
                  <button 
                    onClick={() => setFormData({ ...formData, notifications: { ...formData.notifications, [item.id]: !formData.notifications[item.id as keyof typeof formData.notifications] } })}
                    className={`w-14 h-8 rounded-full transition-all relative ${formData.notifications[item.id as keyof typeof formData.notifications] ? 'bg-[#E6FF00]' : 'bg-white/10'}`}
                  >
                    <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${formData.notifications[item.id as keyof typeof formData.notifications] ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        );
      case 'payment':
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-10 bg-white/5 rounded-[3rem] border border-white/10 space-y-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#E6FF00]/10 flex items-center justify-center text-[#E6FF00]">
                    <CreditCard size={24} />
                  </div>
                  <h4 className="text-2xl font-black uppercase italic tracking-tighter">Stripe Config</h4>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-4 italic">Publishable Key</label>
                    <input type="text" className="w-full p-4 rounded-xl bg-black/20 border border-white/10 text-white/40 text-xs" value="pk_test_********************" readOnly />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-4 italic">Secret Key</label>
                    <input type="password" title="Secret Key" className="w-full p-4 rounded-xl bg-black/20 border border-white/10 text-white/40 text-xs" value="sk_test_********************" readOnly />
                  </div>
                </div>
              </div>
              <div className="p-10 bg-white/5 rounded-[3rem] border border-white/10 space-y-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#E6FF00]/10 flex items-center justify-center text-[#E6FF00]">
                    <CreditCard size={24} />
                  </div>
                  <h4 className="text-2xl font-black uppercase italic tracking-tighter">Razorpay Config</h4>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-4 italic">Key ID</label>
                    <input type="text" className="w-full p-4 rounded-xl bg-black/20 border border-white/10 text-white/40 text-xs" value="rzp_test_********************" readOnly />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      case 'website':
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div className="bg-white/5 rounded-[3rem] p-10 border border-white/10 space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-2xl font-black uppercase italic tracking-tighter">Maintenance Mode</h4>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Disable client access temporarily</p>
                </div>
                <button className="w-14 h-8 rounded-full bg-white/10 relative">
                  <div className="absolute top-1 left-1 w-6 h-6 rounded-full bg-white" />
                </button>
              </div>
              <div className="space-y-4">
                <h4 className="text-2xl font-black uppercase italic tracking-tighter">Global SEO</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-4 italic">Site Title</label>
                    <input type="text" className="w-full p-6 rounded-2xl bg-black/20 border border-white/10 text-white" defaultValue="WebbyLaunch | Launch Your Business" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-4 italic">Meta Description</label>
                    <textarea className="w-full p-6 rounded-2xl bg-black/20 border border-white/10 text-white h-32 resize-none" defaultValue="Professional website design and development for Indian businesses." />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      case 'system':
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div className="bg-red-500/10 rounded-[3rem] p-10 border border-red-500/20 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-500/20 flex items-center justify-center text-red-500">
                  <Trash2 size={24} />
                </div>
                <h4 className="text-2xl font-black uppercase italic tracking-tighter text-red-500">Danger Zone</h4>
              </div>
              <p className="text-sm font-bold text-white/60 uppercase tracking-widest leading-relaxed">
                Wiping the database will permanently delete all projects, messages, and system logs. This action cannot be undone.
              </p>
              <button 
                onClick={() => setShowResetModal(true)}
                className="px-10 py-4 bg-red-600 text-white rounded-full font-black text-sm uppercase italic hover:bg-red-700 transition-all"
              >
                Wipe All Data
              </button>
            </div>

            {systemSettings && (
              <div className="bg-white/5 rounded-[3rem] p-10 border border-white/10 space-y-8">
                <h4 className="text-2xl font-black uppercase italic tracking-tighter">Registration Controls</h4>
                <div className="space-y-4">
                  {Object.entries(systemSettings.requiredFields).map(([field, isRequired]) => (
                    <div key={field} className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5">
                      <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">{field.replace(/([A-Z])/g, ' $1')}</span>
                      <button 
                        onClick={() => handleUpdateSystemSettings({
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
            )}
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#4A5D4E] font-sans text-white selection:bg-[#E6FF00] selection:text-[#4A5D4E] p-10 lg:p-20">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-20">
          {/* Sidebar */}
          <div className="lg:w-80 space-y-12">
            <div className="space-y-4">
              <h1 className="text-7xl font-black tracking-tighter uppercase italic leading-none">Settings</h1>
              <p className="text-white/40 font-medium italic">{isAdmin ? 'Admin Control Center' : 'Manage your account and preferences.'}</p>
            </div>

            <nav className="space-y-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full p-6 rounded-2xl flex items-center justify-between transition-all group ${
                    activeSection === section.id 
                      ? 'bg-[#E6FF00] text-black shadow-xl' 
                      : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <section.icon size={20} />
                    <div className="text-left">
                      <span className="block text-xs font-black uppercase tracking-widest italic">{section.label}</span>
                      <span className="block text-[8px] font-bold opacity-40 uppercase tracking-widest">{section.desc}</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className={activeSection === section.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} />
                </button>
              ))}
            </nav>

            <div className="pt-12 border-t border-white/10">
              <button 
                onClick={() => logOut()}
                className="w-full p-6 rounded-2xl bg-red-500/10 text-red-500 flex items-center gap-4 hover:bg-red-500 hover:text-white transition-all group"
              >
                <LogOut size={20} />
                <span className="text-xs font-black uppercase tracking-widest italic">Sign Out</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="bg-black/20 backdrop-blur-3xl rounded-[3rem] p-10 lg:p-16 border border-white/5 shadow-2xl min-h-[600px]">
              <div className="mb-12">
                <h2 className="text-4xl font-black uppercase italic tracking-tighter text-[#E6FF00]">
                  {sections.find(s => s.id === activeSection)?.label}
                </h2>
                <div className="w-20 h-1 bg-[#E6FF00] mt-4 rounded-full"></div>
              </div>

              {renderSection()}
            </div>
          </div>
        </div>
      </div>

      {/* Reset Modal */}
      <AnimatePresence>
        {showResetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => !isResetting && setShowResetModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative bg-[#2A2A2A] rounded-[3rem] p-12 max-w-md w-full text-center shadow-2xl border border-red-500/20">
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
                <Trash2 size={40} className="text-red-500" />
              </div>
              <h3 className="text-4xl font-bold tracking-tighter text-white mb-4 uppercase italic">Wipe Database?</h3>
              <p className="text-white/60 text-sm leading-relaxed mb-10 font-bold uppercase tracking-widest">
                This will permanently delete <span className="text-white font-black">ALL project data</span>. This action is irreversible.
              </p>
              <div className="flex flex-col gap-4">
                <button onClick={handleResetDatabase} disabled={isResetting} className="w-full bg-red-600 text-white py-5 rounded-full font-black uppercase italic tracking-widest hover:bg-red-700 disabled:opacity-50 transition-all">
                  {isResetting ? 'Wiping Data...' : 'Yes, Delete Everything'}
                </button>
                <button onClick={() => setShowResetModal(false)} disabled={isResetting} className="w-full bg-white/5 text-white py-5 rounded-full font-black uppercase italic tracking-widest hover:bg-white/10 transition-all">
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
