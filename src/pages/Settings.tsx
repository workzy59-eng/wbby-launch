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
  X
} from 'lucide-react';
import { FirebaseUser, logOut } from '../firebase';
import { UserProfile } from '../types';
import { updateProfile } from '../services/database';

interface SettingsProps {
  user: FirebaseUser;
  profile: UserProfile | null;
}

export default function Settings({ user, profile }: SettingsProps) {
  const [activeSection, setActiveSection] = useState<'account' | 'notifications' | 'billing' | 'security'>('account');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    displayName: profile?.displayName || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    username: profile?.username || '',
    notifications: {
      email: true,
      push: true,
      updates: false
    }
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile(user.uid, {
        displayName: formData.displayName,
        phone: formData.phone,
        username: formData.username,
        // In a real app, you'd save notification preferences too
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const sections = [
    { id: 'account', label: 'Account & Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'billing', label: 'Billing & Plans', icon: CreditCard },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'account':
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
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
            
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-12 py-5 bg-[#E6FF00] text-black rounded-full font-black text-xl uppercase italic hover:scale-[1.05] active:scale-[0.95] transition-all shadow-[0_0_30px_rgba(230,255,0,0.2)] flex items-center gap-4"
            >
              {isSaving ? <Loader2 className="animate-spin" size={24} /> : (saveSuccess ? <Check size={24} /> : 'Save Changes')}
            </button>
          </motion.div>
        );
      case 'security':
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="p-8 bg-white/5 rounded-3xl border border-white/10 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-[#E6FF00]">
                    <Lock size={24} />
                  </div>
                  <div>
                    <h4 className="text-xl font-black uppercase italic tracking-tighter">Password</h4>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Last changed 3 months ago</p>
                  </div>
                </div>
                <button className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Change</button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-[#E6FF00]">
                    <Shield size={24} />
                  </div>
                  <div>
                    <h4 className="text-xl font-black uppercase italic tracking-tighter">Two-Factor Auth</h4>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Enhance your account security</p>
                  </div>
                </div>
                <button className="px-6 py-3 bg-[#E6FF00] text-black rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Enable</button>
              </div>
            </div>
          </motion.div>
        );
      case 'notifications':
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
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
      case 'billing':
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="p-10 bg-[#E6FF00] text-black rounded-[2.5rem] flex items-center justify-between shadow-2xl relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-white rounded-full blur-[120px] opacity-20"></div>
              <div className="relative z-10">
                <div className="text-[10px] font-black uppercase tracking-[0.3em] mb-2 opacity-60">Current Plan</div>
                <h4 className="text-4xl font-black uppercase italic tracking-tighter mb-4">Business Pro</h4>
                <p className="text-sm font-bold opacity-60 uppercase tracking-widest">Next billing date: May 15, 2026</p>
              </div>
              <button className="relative z-10 px-10 py-4 bg-black text-white rounded-full font-black text-sm uppercase italic hover:scale-[1.05] transition-all">Manage</button>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-black text-white/30 uppercase tracking-[0.3em] ml-4 italic">Payment Methods</h3>
              <div className="p-8 bg-white/5 rounded-3xl border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-[#E6FF00]">
                    <CreditCard size={24} />
                  </div>
                  <div>
                    <h4 className="text-xl font-black uppercase italic tracking-tighter">Visa ending in 4242</h4>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Expires 12/28</p>
                  </div>
                </div>
                <button className="text-red-400 text-[10px] font-black uppercase tracking-widest hover:underline">Remove</button>
              </div>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#064E3B] font-sans text-white selection:bg-[#E6FF00] selection:text-[#064E3B] p-10 lg:p-20">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-20">
          {/* Sidebar */}
          <div className="lg:w-80 space-y-12">
            <div className="space-y-4">
              <h1 className="text-7xl font-black tracking-tighter uppercase italic leading-none">Settings</h1>
              <p className="text-white/40 font-medium italic">Manage your account and preferences.</p>
            </div>

            <nav className="space-y-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id as any)}
                  className={`w-full p-6 rounded-2xl flex items-center justify-between transition-all group ${
                    activeSection === section.id 
                      ? 'bg-[#E6FF00] text-black shadow-xl' 
                      : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <section.icon size={20} />
                    <span className="text-xs font-black uppercase tracking-widest italic">{section.label}</span>
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
    </div>
  );
}
