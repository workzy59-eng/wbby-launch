import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Code, Mail, ArrowRight, ShieldCheck, Laptop } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getInviteByCode, markInviteUsed, updateProfile } from '../services/database';

export default function JoinDeveloper() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Please login first to join as a developer");
      navigate('/auth');
      return;
    }

    if (user.email?.toLowerCase() !== email.toLowerCase()) {
      toast.error("The email entered does not match your logged-in account");
      return;
    }

    setLoading(true);
    try {
      const invite: any = await getInviteByCode(email, code);
      
      if (!invite) {
        throw new Error("Invalid or already used invite code for this email");
      }

      // Update user profile
      await updateProfile(user.uid, {
        role: 'developer',
        devRole: invite.role,
        permissions: invite.permissions,
        joiningDate: invite.joiningDate,
        status: 'approved',
        displayName: invite.name
      });

      // Mark invite as used
      await markInviteUsed(invite.id);

      toast.success("Welcome to the team! Redirecting to dashboard...");
      setTimeout(() => {
        navigate('/developer-dashboard');
      }, 2000);

    } catch (error: any) {
      toast.error(error.message || "Failed to join");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 bg-[radial-gradient(circle_at_50%_50%,_rgba(199,196,42,0.1),_transparent_50%)]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8"
      >
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-[#c7c42a]/10 rounded-3xl flex items-center justify-center mx-auto text-[#c7c42a] shadow-[0_0_30px_rgba(199,196,42,0.2)]">
            <Laptop size={40} />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">Join the Force</h1>
            <p className="text-white/40 text-sm font-medium italic uppercase tracking-widest">Enter your credentials to onboard</p>
          </div>
        </div>

        <form onSubmit={handleJoin} className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 space-y-6 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#c7c42a]" />
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] ml-4 italic">Registered Email</label>
            <div className="relative">
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-[#c7c42a]/40" size={18} />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-white font-bold outline-none focus:border-[#c7c42a] transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] ml-4 italic">Invite Code</label>
            <div className="relative">
              <Code className="absolute left-6 top-1/2 -translate-y-1/2 text-[#c7c42a]/40" size={18} />
              <input 
                type="text" 
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="XXXXXX"
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-[#c7c42a] font-black italic tracking-[0.4em] outline-none focus:border-[#c7c42a] transition-all uppercase"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-[#c7c42a] text-black font-black uppercase italic rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_40px_rgba(199,196,42,0.3)] flex items-center justify-center gap-3"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Onboard Now</span>
                <ArrowRight size={20} className="stroke-[3]" />
              </>
            )}
          </button>

          <div className="pt-4 flex items-center gap-3 text-white/20">
            <ShieldCheck size={16} />
            <span className="text-[8px] font-black uppercase tracking-widest italic">Secure Onboarding • Enterprise Grade</span>
          </div>
        </form>

        <p className="text-center text-[10px] font-black text-white/20 uppercase tracking-[0.2em] italic">
          Problems joining? Contact <span className="text-white/40 underline cursor-pointer">admin@webbylaunch.com</span>
        </p>
      </motion.div>
    </div>
  );
}
