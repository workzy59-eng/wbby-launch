import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  Calendar, 
  Clock, 
  Link as LinkIcon, 
  FileText, 
  Users, 
  Video,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { Meeting, UserProfile } from '../../types';
import { validateMeetingLink, detectPlatform } from '../../services/meetingService';

interface MeetingFormProps {
  clients: UserProfile[];
  isAdmin: boolean;
  currentUserId: string;
  onSubmit: (data: any) => void;
  onClose: () => void;
  initialData?: Meeting;
}

export const MeetingForm: React.FC<MeetingFormProps> = ({ 
  clients, 
  isAdmin,
  currentUserId,
  onSubmit, 
  onClose,
  initialData 
}) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    clientId: initialData?.clientId || (isAdmin ? '' : currentUserId),
    date: initialData?.date || '',
    time: initialData?.time || '',
    meetingLink: initialData?.meetingLink || '',
    notes: initialData?.notes || '',
    status: initialData?.status || 'pending',
    requestedBy: initialData?.requestedBy || currentUserId
  });

  const [validation, setValidation] = useState<{ isValid: boolean; error: string }>({ isValid: true, error: '' });
  const [platform, setPlatform] = useState<'Google Meet' | 'Zoom' | null>(null);

  useEffect(() => {
    if (formData.meetingLink) {
      const res = validateMeetingLink(formData.meetingLink);
      setValidation({
        isValid: res.isValid,
        error: res.error || ''
      });
      setPlatform(detectPlatform(formData.meetingLink));
    } else {
      setValidation({ isValid: true, error: '' });
      setPlatform(null);
    }
  }, [formData.meetingLink]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validation.isValid) return;
    
    onSubmit({
      ...formData,
      platform: platform || 'Google Meet'
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-10">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-[#0A0A0A] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
      >
        <div className="p-8 sm:p-12 space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-3xl font-black uppercase italic tracking-tighter">
                {initialData ? 'Edit' : 'Schedule'} <span className="text-[#c7c42a]">Meeting.</span>
              </h2>
              <p className="text-white/40 text-sm font-medium italic">Set up a video call with your client.</p>
            </div>
            <button 
              onClick={onClose}
              className="p-3 hover:bg-white/5 rounded-2xl text-white/40 hover:text-white transition-all"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {isAdmin && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2 flex items-center gap-2">
                    <Users size={12} />
                    Select Client
                  </label>
                  <select 
                    required
                    value={formData.clientId}
                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white outline-none focus:border-[#c7c42a]/50 transition-all appearance-none"
                  >
                    <option value="" className="bg-[#0A0A0A]">Choose a client</option>
                    {clients.map(client => (
                      <option key={client.uid} value={client.uid} className="bg-[#0A0A0A]">
                        {client.displayName || client.email}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className={`space-y-2 ${!isAdmin ? 'sm:col-span-2' : ''}`}>
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2 flex items-center gap-2">
                  <FileText size={12} />
                  Meeting Title
                </label>
                <input 
                  required
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Project Kickoff"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white outline-none focus:border-[#c7c42a]/50 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2 flex items-center gap-2">
                  <Calendar size={12} />
                  Date
                </label>
                <input 
                  required
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white outline-none focus:border-[#c7c42a]/50 transition-all [color-scheme:dark]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2 flex items-center gap-2">
                  <Clock size={12} />
                  Time
                </label>
                <input 
                  required
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white outline-none focus:border-[#c7c42a]/50 transition-all [color-scheme:dark]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2 flex items-center gap-2">
                <LinkIcon size={12} />
                Video Meeting URL (Zoom or Google Meet Only)
              </label>
              <div className="relative">
                <input 
                  required
                  type="url"
                  value={formData.meetingLink}
                  onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                  placeholder="https://meet.google.com/xyz-abc-123"
                  className={`w-full bg-white/5 border rounded-2xl px-6 py-4 text-sm text-white outline-none transition-all pr-32 ${
                    formData.meetingLink 
                      ? validation.isValid ? 'border-green-500/30 focus:border-green-500/50' : 'border-red-500/30 focus:border-red-500/50'
                      : 'border-white/10 focus:border-[#c7c42a]/50'
                  }`}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {platform && (
                    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                      platform === 'Google Meet' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {platform}
                    </span>
                  )}
                  {formData.meetingLink && validation.isValid && (
                    <button 
                      type="button"
                      onClick={() => window.open(formData.meetingLink, '_blank')}
                      className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-[#c7c42a] transition-all"
                      title="Test Link"
                    >
                      <ExternalLink size={14} />
                    </button>
                  )}
                </div>
              </div>
              {!validation.isValid && formData.meetingLink && (
                <div className="flex items-center gap-2 text-red-400 text-[10px] font-bold uppercase tracking-widest ml-2">
                  <AlertCircle size={12} />
                  {validation.error}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2 flex items-center gap-2">
                <FileText size={12} />
                Notes (Optional)
              </label>
              <textarea 
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any specific agenda or instructions..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white outline-none focus:border-[#c7c42a]/50 transition-all resize-none"
                rows={3}
              />
            </div>

            <button 
              type="submit"
              disabled={!validation.isValid || !formData.meetingLink || !formData.clientId || !formData.title || !formData.date || !formData.time}
              className="w-full py-6 bg-[#c7c42a] text-black rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-[0_0_30px_rgba(199,196,42,0.2)] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-3"
            >
              <Video size={18} />
              {initialData ? 'Update Meeting' : 'Schedule Meeting'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
