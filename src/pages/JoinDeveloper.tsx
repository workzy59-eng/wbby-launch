import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Code, Mail, ArrowRight, ShieldCheck, Laptop, User, Github, Briefcase, FileText, ExternalLink, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getInviteByCode, markInviteUsed, updateProfile } from '../services/database';

export default function JoinDeveloper() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [showApply, setShowApply] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Application fields
  const [applyData, setApplyData] = useState({
    name: '',
    github: '',
    portfolio: '',
    experience: '',
    role: 'Frontend'
  });

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
        displayName: invite.name || applyData.name
      });

      // Mark invite as used
      await markInviteUsed(invite.id);

      toast.success("Welcome to the team! Redirecting to dashboard...");
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (error: any) {
      toast.error(error.message || "Failed to join");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    const discordUrl = "https://discord.com/channels/1496067242432139276/1496378249259778149";
    const message = `🚀 NEW DEVELOPER APPLICATION\n\nName: ${applyData.name}\nRole: ${applyData.role}\nExperience: ${applyData.experience} Years\nGitHub: ${applyData.github}\nPortfolio: ${applyData.portfolio}\nEmail: ${user?.email}\n\nLooking for a developer job at WebbyLaunch!`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(message);
    toast.success("Application details copied! Redirecting to Discord...");
    
    setTimeout(() => {
      window.open(discordUrl, '_blank');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 bg-[radial-gradient(circle_at_50%_50%,_rgba(199,196,42,0.1),_transparent_50%)]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg space-y-8"
      >
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-[#c7c42a]/10 rounded-3xl flex items-center justify-center mx-auto text-[#c7c42a] shadow-[0_0_30px_rgba(199,196,42,0.2)]">
            <Laptop size={40} />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">WebbyLaunch Team</h1>
            <p className="text-white/40 text-sm font-medium italic uppercase tracking-widest">Join our elite engineering force</p>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-4 flex gap-2">
          <button 
            onClick={() => setShowApply(false)}
            className={`flex-1 py-4 rounded-2xl font-black uppercase italic text-xs tracking-widest transition-all ${!showApply ? 'bg-[#c7c42a] text-black shadow-lg' : 'text-white/40 hover:bg-white/5'}`}
          >
            I have a code
          </button>
          <button 
            onClick={() => setShowApply(true)}
            className={`flex-1 py-4 rounded-2xl font-black uppercase italic text-xs tracking-widest transition-all ${showApply ? 'bg-[#c7c42a] text-black shadow-lg' : 'text-white/40 hover:bg-white/5'}`}
          >
            Apply Now
          </button>
        </div>

        <AnimatePresence mode="wait">
          {!showApply ? (
            <motion.form 
              key="join"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleJoin} 
              className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 space-y-6 backdrop-blur-xl shadow-2xl relative overflow-hidden"
            >
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
            </motion.form>
          ) : (
            <motion.form 
              key="apply"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleApply} 
              className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 space-y-6 backdrop-blur-xl shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-[#c7c42a]" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] ml-4 italic">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-6 top-1/2 -translate-y-1/2 text-[#c7c42a]/40" size={18} />
                    <input 
                      type="text" 
                      required
                      value={applyData.name}
                      onChange={(e) => setApplyData({ ...applyData, name: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-white font-bold outline-none focus:border-[#c7c42a] transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] ml-4 italic">Preferred Role</label>
                  <select 
                    value={applyData.role}
                    onChange={(e) => setApplyData({ ...applyData, role: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-[#c7c42a] transition-all appearance-none"
                  >
                    <option value="Frontend" className="bg-[#111]">Frontend</option>
                    <option value="Backend" className="bg-[#111]">Backend</option>
                    <option value="Fullstack" className="bg-[#111]">Fullstack</option>
                    <option value="UI/UX" className="bg-[#111]">UI/UX Designer</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] ml-4 italic">GitHub URL</label>
                <div className="relative">
                  <Github className="absolute left-6 top-1/2 -translate-y-1/2 text-[#c7c42a]/40" size={18} />
                  <input 
                    type="url" 
                    required
                    value={applyData.github}
                    onChange={(e) => setApplyData({ ...applyData, github: e.target.value })}
                    placeholder="https://github.com/yourusername"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-white font-bold outline-none focus:border-[#c7c42a] transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] ml-4 italic">Portfolio URL</label>
                <div className="relative">
                  <Briefcase className="absolute left-6 top-1/2 -translate-y-1/2 text-[#c7c42a]/40" size={18} />
                  <input 
                    type="url" 
                    required
                    value={applyData.portfolio}
                    onChange={(e) => setApplyData({ ...applyData, portfolio: e.target.value })}
                    placeholder="https://yourportfolio.com"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-white font-bold outline-none focus:border-[#c7c42a] transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] ml-4 italic">Years of Experience</label>
                <div className="relative">
                  <FileText className="absolute left-6 top-1/2 -translate-y-1/2 text-[#c7c42a]/40" size={18} />
                  <input 
                    type="text" 
                    required
                    value={applyData.experience}
                    onChange={(e) => setApplyData({ ...applyData, experience: e.target.value })}
                    placeholder="e.g. 3+"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-white font-bold outline-none focus:border-[#c7c42a] transition-all"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-5 bg-[#c7c42a] text-black font-black uppercase italic rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_40px_rgba(199,196,42,0.3)] flex items-center justify-center gap-3"
              >
                <span>Apply via Discord</span>
                <ExternalLink size={20} className="stroke-[3]" />
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="pt-4 flex items-center justify-center gap-3 text-white/20">
          <ShieldCheck size={16} />
          <span className="text-[8px] font-black uppercase tracking-widest italic">Official Webbylaunch Engineering Access</span>
        </div>
      </motion.div>
    </div>
  );
}
