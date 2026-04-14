import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Lock, 
  Bell, 
  CreditCard, 
  Video, 
  Building2, 
  Users, 
  ChevronRight,
  Settings as SettingsIcon,
  Moon,
  Sun,
  Monitor,
  Check,
  ArrowLeft
} from 'lucide-react';
import { UserProfile } from '../types';
import { ProfileSettings } from '../components/settings/ProfileSettings';
import { SecuritySettings } from '../components/settings/SecuritySettings';
import { NotificationSettings } from '../components/settings/NotificationSettings';
import { PaymentSettings } from '../components/settings/PaymentSettings';
import { MeetingSettings } from '../components/settings/MeetingSettings';
import { BusinessSettings } from '../components/settings/BusinessSettings';
import { UsersManagement } from '../components/settings/UsersManagement';
import { useNavigate } from 'react-router-dom';

interface SettingsProps {
  user: any;
  profile: UserProfile;
}

type SettingsTab = 'profile' | 'security' | 'notifications' | 'payments' | 'meetings' | 'business' | 'users' | 'preferences';

export default function Settings({ user, profile }: SettingsProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const isAdmin = profile.role === 'admin';

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User, desc: 'Personal information & photo' },
    { id: 'security', label: 'Security', icon: Lock, desc: 'Password & account protection' },
    { id: 'notifications', label: 'Notifications', icon: Bell, desc: 'Alerts & communication' },
    { id: 'payments', label: 'Payments', icon: CreditCard, desc: isAdmin ? 'UPI & Bank details' : 'Subscription & Billing' },
    { id: 'meetings', label: 'Meetings', icon: Video, desc: isAdmin ? 'Platform & availability' : 'Meeting preferences' },
    ...(isAdmin ? [
      { id: 'business', label: 'Business', icon: Building2, desc: 'Company branding & info' },
      { id: 'users', label: 'Users', icon: Users, desc: 'Manage clients & accounts' }
    ] : []),
    { id: 'preferences', label: 'Preferences', icon: SettingsIcon, desc: 'Theme & display settings' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'profile': return <ProfileSettings profile={profile} />;
      case 'security': return <SecuritySettings />;
      case 'notifications': return <NotificationSettings profile={profile} />;
      case 'payments': return <PaymentSettings profile={profile} />;
      case 'meetings': return <MeetingSettings profile={profile} />;
      case 'business': return isAdmin ? <BusinessSettings profile={profile} /> : null;
      case 'users': return isAdmin ? <UsersManagement /> : null;
      case 'preferences': return (
        <div className="space-y-8">
          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-6">
            <div className="flex items-center gap-4 text-[#6366F1]">
              <Monitor size={24} />
              <h3 className="text-xl font-black uppercase italic tracking-tighter">Appearance</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button className="flex items-center justify-between p-6 bg-black/40 border-2 border-[#6366F1] rounded-3xl group">
                <div className="flex items-center gap-4">
                  <Moon className="text-[#6366F1]" size={20} />
                  <span className="text-sm font-black uppercase tracking-widest text-white">Dark Mode</span>
                </div>
                <Check className="text-[#6366F1]" size={20} />
              </button>
              <button className="flex items-center justify-between p-6 bg-white/5 border-2 border-transparent rounded-3xl group hover:border-white/10 transition-all">
                <div className="flex items-center gap-4">
                  <Sun className="text-white/20 group-hover:text-white transition-colors" size={20} />
                  <span className="text-sm font-black uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">Light Mode</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 sm:p-10">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-white/40 hover:text-[#6366F1] transition-colors text-[10px] font-black uppercase tracking-widest mb-4"
            >
              <ArrowLeft size={14} />
              Back to Dashboard
            </button>
            <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-none">
              Account <span className="text-[#6366F1]">Settings.</span>
            </h1>
            <p className="text-white/40 text-sm font-medium italic">Manage your account preferences and platform settings.</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar Navigation */}
          <aside className="w-full lg:w-80 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as SettingsTab)}
                className={`w-full flex items-center justify-between p-6 rounded-[2rem] transition-all group ${
                  activeTab === tab.id 
                    ? 'bg-[#6366F1] text-white shadow-[0_0_30px_rgba(99,102,241,0.1)]' 
                    : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white border border-white/5'
                }`}
              >
                <div className="flex items-center gap-4">
                  <tab.icon size={20} className={activeTab === tab.id ? 'text-white' : 'group-hover:text-[#6366F1] transition-colors'} />
                  <div className="text-left">
                    <p className="text-sm font-black uppercase tracking-widest">{tab.label}</p>
                    <p className={`text-[8px] font-black uppercase tracking-[0.2em] ${activeTab === tab.id ? 'text-white/60' : 'text-white/20'}`}>
                      {tab.desc}
                    </p>
                  </div>
                </div>
                <ChevronRight size={18} className={activeTab === tab.id ? 'text-white/40' : 'text-white/10'} />
              </button>
            ))}
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-8 sm:p-12"
            >
              <div className="mb-10 space-y-1">
                <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">
                  {tabs.find(t => t.id === activeTab)?.label} <span className="text-[#6366F1]">Details.</span>
                </h2>
                <p className="text-white/40 text-xs italic uppercase tracking-widest">
                  {tabs.find(t => t.id === activeTab)?.desc}
                </p>
              </div>
              
              {renderContent()}
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
}
