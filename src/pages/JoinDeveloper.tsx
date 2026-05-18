import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Code, Mail, ArrowRight, ShieldCheck, Laptop, User, Github, Briefcase, FileText, ExternalLink, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getInviteByCode, markInviteUsed, createDeveloperRequest } from '../services/database';
import { db, doc, setDoc, serverTimestamp } from '../firebase';

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

  const { user, signUpWithEmail, signInWithEmail } = useAuth();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [verifiedInvite, setVerifiedInvite] = useState<any>(null);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (email.trim().toLowerCase() === 'aither2029@gmail.com') {
      toast.error("This account is not authorized to join the developer network.");
      return;
    }
    
    setLoading(true);
    try {
      if (!verifiedInvite) {
        const invite: any = await getInviteByCode(email.trim().toLowerCase(), code.trim().toUpperCase());
        
        if (!invite) {
          throw new Error("Invalid or already used invite code for this email");
        }

        setVerifiedInvite(invite);
        // Check if we need a password (if user not logged in)
        if (!user) {
          setIsNewUser(true);
        } else {
          // If logged in, we can proceed directly
          await completeOnboarding(user.uid, invite);
        }
      } else {
        // We have a verified invite and need to handle password/auth
        if (!user && password) {
          try {
            // Try to sign up, if it fails because user exists, try to notify or just login
            const cred = await signUpWithEmail(email, password);
            if (cred.user) {
              await completeOnboarding(cred.user.uid, verifiedInvite);
            }
          } catch (signUpError: any) {
            if (signUpError.code === 'auth/email-already-in-use') {
              // Try to sign in instead
              const cred = await signInWithEmail(email, password);
              if (cred.user) {
                await completeOnboarding(cred.user.uid, verifiedInvite);
              }
            } else {
              throw signUpError;
            }
          }
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to join");
    } finally {
      setLoading(false);
    }
  };

  const completeOnboarding = async (uid: string, invite: any) => {
    try {
      // 🏗️ STEP 4: CREATE DEVELOPER USER (Crucial Step)
      await setDoc(doc(db, "users", uid), {
        uid,
        email: email.toLowerCase(),
        role: 'developer',
        devRole: invite.role || 'Developer',
        permissions: invite.permissions || ['projects', 'messages'],
        joiningDate: invite.joiningDate || new Date().toISOString(),
        status: 'online',
        displayName: invite.name || applyData.name || 'Developer',
        paymentLinks: invite.paymentLinks || null,
        experience: invite.experience || '0',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });

      // Marks invite used in Firestore
      await markInviteUsed(invite.id);

      toast.success("Welcome to the team! Redirecting to dashboard...");
      setTimeout(() => {
        navigate('/developer-dashboard');
      }, 2000);
    } catch (error) {
      console.error("Error in completeOnboarding:", error);
      throw new Error("Failed to finalize onboarding. Please contact support.");
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login/signup to apply");
      return;
    }
    
    setLoading(true);
    try {
      // 1. Save to Firestore
      await createDeveloperRequest({
        name: applyData.name,
        email: user.email,
        skills: [applyData.role],
        experience: applyData.experience,
        portfolio: applyData.portfolio,
        github: applyData.github,
        uid: user.uid
      });

      const discordUrl = "https://discord.com/channels/1496067242432139276/1496378249259778149";
      const message = `🚀 NEW DEVELOPER APPLICATION\n\nName: ${applyData.name}\nRole: ${applyData.role}\nExperience: ${applyData.experience} Years\nGitHub: ${applyData.github}\nPortfolio: ${applyData.portfolio}\nEmail: ${user?.email}\n\nLooking for a developer job at WebbyLaunch!`;
      
      // 2. Copy to clipboard
      await navigator.clipboard.writeText(message);
      
      // 3. Show alert/toast
      toast.success("Application saved and details copied! Opening Discord...");
      
      // 4. Open Discord after small delay
      setTimeout(() => {
        window.open(discordUrl, '_blank');
      }, 2000);
    } catch (error) {
      toast.error("Application failed to save. Please try again.");
    } finally {
      setLoading(false);
    }
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
              
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] ml-4 italic">Registered Email</label>
                    <div className="relative">
                      <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-[#c7c42a]/40" size={18} />
                      <input 
                        type="email" 
                        required
                        disabled={!!verifiedInvite}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-white font-bold outline-none focus:border-[#c7c42a] transition-all disabled:opacity-50"
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
                        disabled={!!verifiedInvite}
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="XXXXXX"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-[#c7c42a] font-black italic tracking-[0.4em] outline-none focus:border-[#c7c42a] transition-all uppercase disabled:opacity-50"
                      />
                    </div>
                  </div>

                  {isNewUser && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-2"
                    >
                      <label className="text-[10px] font-black text-[#c7c42a] uppercase tracking-[0.3em] ml-4 italic">Create Access Password</label>
                      <div className="relative">
                        <ShieldCheck className="absolute left-6 top-1/2 -translate-y-1/2 text-[#c7c42a]/40" size={18} />
                        <input 
                          type="password" 
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-white font-bold outline-none focus:border-[#c7c42a] transition-all"
                        />
                      </div>
                      <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest ml-4 mt-2 italic">This will be your system access logic going forward.</p>
                    </motion.div>
                  )}
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
                    <span>{isNewUser ? 'Complete Onboarding' : (verifiedInvite ? 'Confirm Join' : 'Verify & Onboard')}</span>
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
