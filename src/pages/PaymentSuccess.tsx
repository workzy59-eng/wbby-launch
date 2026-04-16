import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Rocket, ShieldCheck, Clock } from 'lucide-react';
import { updateProject } from '../services/database';
import SEO from '../components/SEO';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isUpdating, setIsUpdating] = useState(true);
  const projectId = searchParams.get('projectId') || searchParams.get('client_reference_id');

  useEffect(() => {
    const finalizePayment = async () => {
      if (projectId) {
        try {
          // Update project status to 'Paid' or 'Processing'
          await updateProject(projectId, { 
            paymentStatus: 'Paid',
            status: 'Under Review',
            paidAt: new Date().toISOString()
          });
        } catch (error) {
          console.error('Error updating project status:', error);
        }
      }
      setIsUpdating(false);
    };

    finalizePayment();
  }, [projectId]);

  return (
    <div className="min-h-screen bg-[#4A5D4E] pt-40 pb-20 px-10 font-sans overflow-hidden relative">
      <SEO title="Payment Successful – WebbyLaunch" />
      
      {/* Background Accents */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#FACC15]/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-black/20 blur-[100px] rounded-full" />

      <div className="max-w-3xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] p-12 md:p-20 text-center space-y-10 shadow-2xl"
        >
          {/* Success Icon */}
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 12, delay: 0.2 }}
            className="w-32 h-32 bg-[#FACC15] rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(250,204,21,0.4)]"
          >
            <CheckCircle2 size={64} className="text-black" />
          </motion.div>

          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase italic leading-none">
              Payment <span className="text-[#FACC15]">Received!</span>
            </h1>
            <p className="text-white/60 text-xl font-medium italic">
              Your vision is now our mission. We're getting to work.
            </p>
          </div>

          {/* Next Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {[
              { icon: <ShieldCheck className="text-[#FACC15]" />, title: 'Verified', desc: 'Payment confirmed' },
              { icon: <Clock className="text-[#FACC15]" />, title: 'Review', desc: '48h expert analysis' },
              { icon: <Rocket className="text-[#FACC15]" />, title: 'Launch', desc: 'Fast deployment' }
            ].map((item, i) => (
              <div key={i} className="bg-white/5 p-6 rounded-3xl border border-white/5 space-y-3">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                  {item.icon}
                </div>
                <h4 className="text-white font-black uppercase italic tracking-tighter text-sm">{item.title}</h4>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest leading-tight">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="space-y-6 pt-10">
            <p className="text-white/40 text-sm font-medium leading-relaxed max-w-md mx-auto">
              Our developers have been notified. You can track the real-time progress of your website from your dashboard.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/dashboard"
                className="bg-[#FACC15] text-black px-10 py-6 rounded-full font-black text-xl uppercase italic flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-[0_0_30px_rgba(250,204,21,0.2)]"
              >
                Go to Dashboard <ArrowRight size={24} />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Footer Note */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-12 text-white/20 text-[10px] font-bold uppercase tracking-[0.3em]"
        >
          Transaction ID: {searchParams.get('session_id')?.slice(-12) || 'WL-' + Math.random().toString(36).substr(2, 9).toUpperCase()}
        </motion.p>
      </div>
    </div>
  );
}
