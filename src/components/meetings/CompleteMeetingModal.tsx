import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, DollarSign, QrCode, CheckCircle2, ShieldCheck, Globe } from 'lucide-react';
import { Meeting, Project } from '../../types';
import { getProject } from '../../services/database';
import { toast } from 'react-hot-toast';

interface CompleteMeetingModalProps {
  meeting: Meeting;
  onClose: () => void;
  onConfirm: (salesCode: string, domainPrice: number, paymentLink: string) => Promise<void>;
}

export const CompleteMeetingModal: React.FC<CompleteMeetingModalProps> = ({ 
  meeting, 
  onClose, 
  onConfirm 
}) => {
  const [salesCode, setSalesCode] = useState('');
  const [domainPrice, setDomainPrice] = useState<number>(0);
  const [paymentLink, setPaymentLink] = useState('');
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showQRSection, setShowQRSection] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        if (meeting.projectId) {
          const p = await getProject(meeting.projectId);
          setProject(p as Project);
          if (p?.domainPrice) setDomainPrice(p.domainPrice);
          if (p?.paymentLink) setPaymentLink(p.paymentLink);
        } else if (meeting.clientId) {
          // Fallback: search for client's projects
          const { getProjectsAsync } = await import('../../services/database');
          const projects = await getProjectsAsync(meeting.clientId);
          if (projects && projects.length > 0) {
            // Pick the latest non-completed project
            const activeProj = projects.find(p => p.status !== 'Completed') || projects[0];
            setProject(activeProj);
            if (activeProj.domainPrice) setDomainPrice(activeProj.domainPrice);
            if (activeProj.paymentLink) setPaymentLink(activeProj.paymentLink);
          }
        }
      } catch (error) {
        console.error("Failed to fetch project:", error);
      }
      setLoading(false);
    };
    fetchProject();
  }, [meeting.projectId, meeting.clientId]);

  const handleConfirm = async () => {
    if (salesCode.trim().toLowerCase() === 'sales@gb') {
      if (!domainPrice || !paymentLink) {
        toast.error('Developer must enter domain price and payment link');
        return;
      }
      setShowQRSection(true);
      return;
    }
    
    // If not sales@GB, or if we want to proceed with normal completion
    setSubmitting(true);
    try {
      await onConfirm(salesCode, domainPrice, paymentLink);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const getQRImage = () => {
    const plan = project?.plan?.toLowerCase() || 'basic';
    const upiId = 'kumodkumarguptanemua@oksbi';
    let amount = '300';
    
    if (plan === 'basic' || plan === 'starter') amount = '300';
    else if (plan === 'standard' || plan === 'business' || plan === 'intermediate') amount = '700';
    else if (plan === 'pro' || plan === 'premium') amount = '1200';
    
    // Generate a reliable UPI QR code using a public API
    const upiLink = `upi://pay?pa=${upiId}&am=${amount}&pn=KK%20GUPTA&cu=INR`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(upiLink)}`;
  };

  const getPlanName = () => {
    const plan = project?.plan?.toLowerCase() || 'basic';
    if (plan === 'basic' || plan === 'starter') return 'Basic Plan';
    if (plan === 'standard' || plan === 'business' || plan === 'intermediate') return 'Standard Plan';
    if (plan === 'pro' || plan === 'premium') return 'Pro Plan';
    return 'Basic Plan';
  };

  if (loading) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative bg-[#0B0B0B] border border-white/10 p-10 rounded-[3rem] w-full max-w-xl shadow-2xl overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-[#c7c42a]" />
        
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-white/40 hover:text-white transition-all"
        >
          <X size={24} />
        </button>

        <div className="text-center space-y-4 mb-8">
          <div className="w-20 h-20 bg-[#c7c42a]/10 rounded-full flex items-center justify-center mx-auto text-[#c7c42a]">
            <CheckCircle2 size={40} />
          </div>
          <div>
            <h3 className="text-3xl font-black uppercase italic tracking-tighter">Close Call</h3>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest italic">Finalize Mission Intelligence</p>
          </div>
        </div>

        <div className="space-y-6">
          {!showQRSection ? (
            <>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">Sales Code (Internal)</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <input 
                    type="text" 
                    value={salesCode}
                    onChange={(e) => setSalesCode(e.target.value)}
                    placeholder="Enter sales code..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-16 pr-6 py-5 text-white font-bold outline-none focus:border-[#c7c42a] transition-all"
                  />
                </div>
              </div>

              {salesCode === 'sales@GB' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-6 overflow-hidden"
                >
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#c7c42a] ml-4">Domain Price (₹)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                      <input 
                        type="number" 
                        value={domainPrice || ''}
                        onChange={(e) => setDomainPrice(Number(e.target.value))}
                        placeholder="e.g. 1500"
                        className="w-full bg-white/5 border border-[#c7c42a]/30 rounded-2xl pl-16 pr-6 py-5 text-white font-bold outline-none focus:border-[#c7c42a] transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#c7c42a] ml-4">Razorpay Payment Link</label>
                    <div className="relative">
                      <Globe className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                      <input 
                        type="url" 
                        value={paymentLink}
                        onChange={(e) => setPaymentLink(e.target.value)}
                        placeholder="https://rzp.io/l/..."
                        className="w-full bg-white/5 border border-[#c7c42a]/30 rounded-2xl pl-16 pr-6 py-5 text-white font-bold outline-none focus:border-[#c7c42a] transition-all"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              <button 
                onClick={handleConfirm}
                disabled={submitting}
                className="w-full py-5 bg-[#c7c42a] text-black rounded-3xl font-black uppercase italic tracking-widest hover:scale-105 transition-all shadow-[0_0_30px_rgba(199,196,42,0.3)]"
              >
                {submitting ? 'Processing...' : salesCode.trim().toLowerCase() === 'sales@gb' ? 'Show QR & Close' : 'Confirm Close'}
              </button>
            </>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8 text-center"
            >
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#c7c42a]">{getPlanName()} Detected</span>
                <h4 className="text-xl font-black text-white italic uppercase">{project?.businessName}</h4>
              </div>

              <div className="relative group mx-auto w-64 h-64">
                <div className="absolute -inset-4 bg-[#c7c42a]/20 blur-2xl rounded-full" />
                <div className="relative bg-white p-4 rounded-3xl shadow-2xl">
                  <img 
                    src={getQRImage()} 
                    alt="Payment QR" 
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 p-6 rounded-3xl space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/40 uppercase font-black">Plan</span>
                  <span className="text-white font-black uppercase italic">{getPlanName()}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/40 uppercase font-black">Domain Price</span>
                  <span className="text-[#c7c42a] font-black">₹{domainPrice}</span>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setShowQRSection(false)}
                  className="flex-1 py-4 bg-white/5 text-white/40 rounded-2xl font-black uppercase italic text-[10px] tracking-widest hover:bg-white/10 transition-all border border-white/10"
                >
                  Edit Info
                </button>
                <button 
                  onClick={async () => {
                    setSubmitting(true);
                    try {
                      await onConfirm(salesCode, domainPrice, paymentLink);
                      onClose();
                    } catch (error) {
                      console.error(error);
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                  className="flex-1 py-4 bg-green-500 text-white rounded-2xl font-black uppercase italic text-[10px] tracking-widest hover:scale-105 transition-all shadow-xl shadow-green-500/20"
                >
                  Complete Mission
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
