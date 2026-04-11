import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Bell, Mail, Video, CreditCard, MessageSquare, Loader2, Check } from 'lucide-react';
import { UserProfile } from '../../types';
import { updateUserProfile } from '../../services/database';
import { toast } from 'react-hot-toast';

interface NotificationSettingsProps {
  profile: UserProfile;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({ profile }) => {
  const [prefs, setPrefs] = useState(profile.notificationPreferences || {
    email: true,
    meetingReminders: true,
    paymentAlerts: true,
    messages: true
  });
  const [isSaving, setIsSaving] = useState(false);

  const togglePref = (key: keyof typeof prefs) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateUserProfile(profile.uid, { notificationPreferences: prefs });
      toast.success('Preferences saved');
    } catch (error) {
      console.error(error);
      toast.error('Failed to save preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const items = [
    { key: 'email', label: 'Email Notifications', icon: Mail, desc: 'Receive updates and news via email.' },
    { key: 'meetingReminders', label: 'Meeting Reminders', icon: Video, desc: 'Get alerts for upcoming scheduled calls.' },
    { key: 'paymentAlerts', label: 'Payment Alerts', icon: CreditCard, desc: 'Notifications for invoices and payments.' },
    { key: 'messages', label: 'Direct Messages', icon: MessageSquare, desc: 'Alerts when you receive a new message.' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4">
        {items.map((item) => (
          <div 
            key={item.key}
            className="flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-3xl hover:border-white/20 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/40 group-hover:text-[#E6FF00] transition-colors">
                <item.icon size={20} />
              </div>
              <div>
                <h4 className="text-sm font-black uppercase tracking-widest text-white">{item.label}</h4>
                <p className="text-[10px] text-white/40 uppercase font-medium">{item.desc}</p>
              </div>
            </div>
            
            <button 
              onClick={() => togglePref(item.key as keyof typeof prefs)}
              className={`relative w-14 h-8 rounded-full transition-all duration-300 ${
                prefs[item.key as keyof typeof prefs] ? 'bg-[#E6FF00]' : 'bg-white/10'
              }`}
            >
              <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg transition-all duration-300 ${
                prefs[item.key as keyof typeof prefs] ? 'left-7' : 'left-1'
              }`} />
            </button>
          </div>
        ))}
      </div>

      <div className="pt-4 flex justify-end">
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-8 py-4 bg-[#E6FF00] text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(230,255,0,0.2)]"
        >
          {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
          Save Preferences
        </button>
      </div>
    </div>
  );
};
