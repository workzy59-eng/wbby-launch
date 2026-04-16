import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Video, Clock, Calendar, Bell, RefreshCw, Loader2, Check, MessageSquare } from 'lucide-react';
import { UserProfile } from '../../types';
import { updateUserProfile } from '../../services/database';
import { toast } from 'react-hot-toast';

interface MeetingSettingsProps {
  profile: UserProfile;
}

export const MeetingSettings: React.FC<MeetingSettingsProps> = ({ profile }) => {
  const isAdmin = profile?.role === 'admin';
  const [isSaving, setIsSaving] = useState(false);

  // Admin State
  const [adminData, setAdminData] = useState(profile?.adminMeetingSettings || {
    defaultDuration: 30,
    allowRescheduling: true,
    reminders: {
      oneHour: true,
      tenMinutes: true
    },
    allowClientRequests: true,
    autoApprove: false
  });

  // Client State
  const [clientData, setClientData] = useState(profile?.meetingPreferences || {
    preferredTimeSlot: 'Morning (10 AM - 1 PM)',
    enableReminders: true
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (isAdmin) {
        await updateUserProfile(profile?.uid, { adminMeetingSettings: adminData });
      } else {
        await updateUserProfile(profile?.uid, { meetingPreferences: clientData });
      }
      toast.success('Meeting preferences saved');
    } catch (error) {
      console.error(error);
      toast.error('Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  if (isAdmin) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-6">
            <div className="flex items-center gap-4 text-[#FACC15]">
              <Clock size={24} />
              <h3 className="text-xl font-black uppercase italic tracking-tighter">Default Duration</h3>
            </div>
            <select 
              value={adminData.defaultDuration}
              onChange={(e) => setAdminData({ ...adminData, defaultDuration: parseInt(e.target.value) })}
              className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm outline-none focus:border-[#FACC15]/50 transition-all appearance-none"
            >
              <option value={15}>15 Minutes</option>
              <option value={30}>30 Minutes</option>
              <option value={45}>45 Minutes</option>
              <option value={60}>60 Minutes</option>
            </select>
          </div>

          <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-6">
            <div className="flex items-center gap-4 text-[#FACC15]">
              <Bell size={24} />
              <h3 className="text-xl font-black uppercase italic tracking-tighter">Reminders</h3>
            </div>
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-sm font-black uppercase tracking-widest text-white/60 group-hover:text-white transition-colors">1 Hour Before</span>
                <button 
                  onClick={() => setAdminData({ ...adminData, reminders: { ...adminData.reminders, oneHour: !adminData.reminders.oneHour } })}
                  className={`relative w-12 h-6 rounded-full transition-all ${adminData.reminders.oneHour ? 'bg-[#FACC15]' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${adminData.reminders.oneHour ? 'left-7' : 'left-1'}`} />
                </button>
              </label>
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-sm font-black uppercase tracking-widest text-white/60 group-hover:text-white transition-colors">10 Minutes Before</span>
                <button 
                  onClick={() => setAdminData({ ...adminData, reminders: { ...adminData.reminders, tenMinutes: !adminData.reminders.tenMinutes } })}
                  className={`relative w-12 h-6 rounded-full transition-all ${adminData.reminders.tenMinutes ? 'bg-[#FACC15]' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${adminData.reminders.tenMinutes ? 'left-7' : 'left-1'}`} />
                </button>
              </label>
            </div>
          </div>

          <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-6">
            <div className="flex items-center gap-4 text-[#FACC15]">
              <RefreshCw size={24} />
              <h3 className="text-xl font-black uppercase italic tracking-tighter">Client Actions</h3>
            </div>
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-sm font-black uppercase tracking-widest text-white/60 group-hover:text-white transition-colors">Allow Rescheduling</span>
                <button 
                  onClick={() => setAdminData({ ...adminData, allowRescheduling: !adminData.allowRescheduling })}
                  className={`relative w-12 h-6 rounded-full transition-all ${adminData.allowRescheduling ? 'bg-[#FACC15]' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${adminData.allowRescheduling ? 'left-7' : 'left-1'}`} />
                </button>
              </label>
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-sm font-black uppercase tracking-widest text-white/60 group-hover:text-white transition-colors">Allow Meeting Requests</span>
                <button 
                  onClick={() => setAdminData({ ...adminData, allowClientRequests: !adminData.allowClientRequests })}
                  className={`relative w-12 h-6 rounded-full transition-all ${adminData.allowClientRequests ? 'bg-[#FACC15]' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${adminData.allowClientRequests ? 'left-7' : 'left-1'}`} />
                </button>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-8 py-4 bg-[#FACC15] text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(250,204,21,0.2)]"
          >
            {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
            Save Meeting Settings
          </button>
        </div>
      </div>
    );
  }

  // Client View
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-6">
          <div className="flex items-center gap-4 text-[#FACC15]">
            <Calendar size={24} />
            <h3 className="text-xl font-black uppercase italic tracking-tighter">Preferred Time</h3>
          </div>
          <select 
            value={clientData.preferredTimeSlot}
            onChange={(e) => setClientData({ ...clientData, preferredTimeSlot: e.target.value })}
            className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm outline-none focus:border-[#FACC15]/50 transition-all appearance-none"
          >
            <option value="Morning (10 AM - 1 PM)">Morning (10 AM - 1 PM)</option>
            <option value="Afternoon (2 PM - 5 PM)">Afternoon (2 PM - 5 PM)</option>
            <option value="Evening (6 PM - 9 PM)">Evening (6 PM - 9 PM)</option>
          </select>
        </div>

        <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-6">
          <div className="flex items-center gap-4 text-[#FACC15]">
            <Bell size={24} />
            <h3 className="text-xl font-black uppercase italic tracking-tighter">Reminders</h3>
          </div>
          <label className="flex items-center justify-between cursor-pointer group">
            <span className="text-sm font-black uppercase tracking-widest text-white/60 group-hover:text-white transition-colors">Enable Meeting Reminders</span>
            <button 
              onClick={() => setClientData({ ...clientData, enableReminders: !clientData.enableReminders })}
              className={`relative w-12 h-6 rounded-full transition-all ${clientData.enableReminders ? 'bg-[#FACC15]' : 'bg-white/10'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${clientData.enableReminders ? 'left-7' : 'left-1'}`} />
            </button>
          </label>
        </div>
      </div>

      <div className="flex justify-end">
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-8 py-4 bg-[#FACC15] text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(250,204,21,0.2)]"
        >
          {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
          Save Preferences
        </button>
      </div>
    </div>
  );
};
