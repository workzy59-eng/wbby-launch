import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Clock, MessageSquare, Send, Video, FileText } from 'lucide-react';
import { createMeeting, validateMeetingLink, detectPlatform } from '../../services/meetingService';
import { auth } from '../../firebase';
import { toast } from 'react-hot-toast';

interface RequestMeetingFormProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  developerId?: string | null;
}

export const RequestMeetingForm: React.FC<RequestMeetingFormProps> = ({ isOpen, onClose, clientId, developerId }) => {
  const [formData, setFormData] = useState({
    title: 'Client Sync Session',
    preferredDate: '',
    preferredTime: '',
    meetingLink: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorField, setErrorField] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.preferredDate || !formData.preferredTime) {
      toast.error('Please select preferred date and time');
      return;
    }

    if (!developerId) {
      toast.error('No developer assigned to this project. Please contact admin.');
      return;
    }

    // Validate Meeting Link with Zoom / Google Meet check
    const validation = validateMeetingLink(formData.meetingLink);
    if (!validation.isValid) {
      setErrorField('meetingLink');
      toast.error(validation.error || 'Zoom or Google Meet link is required!');
      
      // Attempt Mobile Haptics
      if (typeof window !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate(200);
        } catch (err) {
          console.warn('Vibration API not supported or blocked by sandbox', err);
        }
      }
      
      // Reset the glowing/shaking error after 600ms
      setTimeout(() => {
        setErrorField(null);
      }, 600);
      return;
    }

    setIsSubmitting(true);
    try {
      const { getUserProfile } = await import('../../services/database');
      const devProfile = developerId ? await getUserProfile(developerId) : null;
      
      await createMeeting({
        title: formData.title || 'Client Sync Session',
        clientId,
        clientEmail: auth.currentUser?.email || '',
        developerId,
        developerEmail: devProfile?.email || '',
        adminId: 'SYSTEM',
        date: formData.preferredDate,
        time: formData.preferredTime,
        notes: formData.message,
        meetingLink: formData.meetingLink,
        platform: detectPlatform(formData.meetingLink) || 'Google Meet',
        requestedBy: auth.currentUser?.uid || clientId,
        status: 'pending'
      });
      toast.success('Meeting request scheduled and waiting for confirmation!');
      onClose();
    } catch (error) {
      console.error('Error sending meeting request:', error);
      toast.error('Failed to schedule meeting request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
            className="relative w-full max-w-md bg-[#0A0A0A] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1/2 bg-[#c7c42a]/5 blur-[100px] pointer-events-none" />

            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-black tracking-tighter uppercase italic text-white leading-none">Request Meeting</h2>
                <p className="text-white/40 text-xs mt-1 font-medium uppercase tracking-widest">Suggest a time for a call</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-4">Meeting Topic</label>
                <div className="relative">
                  <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-[#c7c42a]" size={16} />
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-[#c7c42a]/50 transition-colors uppercase font-bold"
                    placeholder="E.g. Website Strategy Discussion"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-4">Preferred Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-[#c7c42a]" size={16} />
                    <input
                      type="date"
                      required
                      value={formData.preferredDate}
                      onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-[#c7c42a]/50 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-4">Preferred Time</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#c7c42a]" size={16} />
                    <input
                      type="time"
                      required
                      value={formData.preferredTime}
                      onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-[#c7c42a]/50 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-4">Meeting Link (Zoom / Google Meet Only)</label>
                <div className="relative">
                  <Video className="absolute left-4 top-1/2 -translate-y-1/2 text-[#c7c42a]" size={16} />
                  <input
                    type="url"
                    required
                    value={formData.meetingLink}
                    onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                    placeholder="https://meet.google.com/abc-defg-hij"
                    className={`w-full bg-white/5 border rounded-2xl py-3 pl-12 pr-4 text-white text-sm focus:outline-none transition-all ${
                      errorField === 'meetingLink'
                        ? 'input-error-neon animate-pulse text-red-500 border-red-500'
                        : 'border-white/10 focus:border-[#c7c42a]/50 text-white'
                    }`}
                  />
                </div>
                {formData.meetingLink && (
                  <p className="text-[9px] font-black uppercase tracking-widest text-center italic text-[#c7c42a] mt-1">
                    Detected Platform: {detectPlatform(formData.meetingLink) || 'Invalid / Unknown'}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-4">Message (Optional)</label>
                <div className="relative">
                  <MessageSquare className="absolute left-4 top-4 text-[#c7c42a]" size={16} />
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="What would you like to discuss?"
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-[#c7c42a]/50 transition-colors resize-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#c7c42a] hover:bg-[#c7c42a]/80 disabled:opacity-50 text-black font-black uppercase tracking-widest py-4 rounded-2xl transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Send Request
                    <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
