import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { APP_NAME } from '../constants';
import { AlertCircle, ArrowRight, Mail, Lock, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signInWithGoogle, user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const from = location.state?.from || '/dashboard';

  useEffect(() => {
    if (user) navigate(from);
  }, [user, navigate, from]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      toast.success('Welcome back!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const { signInWithEmail, signUpWithEmail } = useAuth();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
        toast.success('Account created successfully!');
      } else {
        await signInWithEmail(email, password);
        toast.success('Welcome back!');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 selection:bg-[#c7c42a] selection:text-black technical-grid">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-[#0a0a0a] border border-white/10 p-12 shadow-2xl relative z-10"
      >
        <div className="flex flex-col items-center mb-12">
          <div className="w-16 h-16 bg-[#c7c42a]/5 border border-[#c7c42a]/10 rounded-full flex items-center justify-center mb-8 text-[#c7c42a]">
            <ShieldCheck size={32} strokeWidth={1} />
          </div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white mb-2">
            {isSignUp ? 'Initiate Node' : 'System Entry'}
          </h1>
          <p className="text-white/30 text-center text-sm font-medium italic">
            {isSignUp ? 'Configure your identity in the network' : 'Authorize your digital access'}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-500 text-xs font-bold uppercase tracking-widest italic"
            >
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleEmailAuth} className="space-y-6 mb-12">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] ml-1 italic">Identity Email</label>
            <div className="relative">
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={18} />
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="protocol@network.com"
                className="w-full bg-[#050505] border border-white/5 rounded-none py-6 pl-14 pr-6 text-white focus:border-[#c7c42a] focus:ring-0 outline-none transition-all font-mono text-sm"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] ml-1 italic">Access Logic</label>
            <div className="relative">
              <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={18} />
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#050505] border border-white/5 rounded-none py-6 pl-14 pr-6 text-white focus:border-[#c7c42a] focus:ring-0 outline-none transition-all font-mono text-sm"
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#c7c42a] text-black py-6 font-black text-lg uppercase italic hover:scale-105 active:scale-95 transition-all shadow-[0_30px_60px_rgba(199,196,42,0.1)] flex items-center justify-center gap-4 group"
          >
            {loading ? 'Processing...' : (
              <>
                <span>{isSignUp ? 'Configure' : 'Authorize'}</span>
                <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/5"></div>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-[0.4em]">
            <span className="bg-[#0a0a0a] px-4 text-white/20 font-black italic">External Bridge</span>
          </div>
        </div>

        <button 
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-white/5 text-white py-6 border border-white/10 font-black text-lg uppercase italic hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center gap-4 group"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span>Google</span>
        </button>

        <div className="mt-12 text-center">
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-[#c7c42a] transition-colors italic"
          >
            {isSignUp ? 'Switch to Authorized Entry' : "Register New Identity Protocol"}
          </button>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 text-center">
          <p className="text-[10px] text-white/20 uppercase tracking-widest leading-loose italic">
            By proceeding, you accept the <br />
            <a href="/terms" className="text-white hover:text-[#c7c42a] transition-colors font-black">Legal Terms</a> & <a href="/privacy" className="text-white hover:text-[#c7c42a] transition-colors font-black">Privacy Protocol</a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
