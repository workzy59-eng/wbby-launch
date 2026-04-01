import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { signInWithGoogle } from '../firebase';
import { useNavigate, useLocation } from 'react-router-dom';
import { APP_NAME } from '../constants';
import { AlertCircle, Loader2, ArrowRight, Phone } from 'lucide-react';

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const from = location.state?.from || '/dashboard';

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const mobileRegex = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
      setIsMobile(mobileRegex.test(userAgent.toLowerCase()));
    };
    checkMobile();
  }, []);

  const handleGoogleSignIn = async () => {
    if (loading) return;
    
    // Validation
    if (phoneNumber.length !== 10 || !/^\d+$/.test(phoneNumber)) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      await signInWithGoogle();
      // In a real app, we would save the phone number to the profile here
      navigate(from);
    } catch (err: any) {
      console.error('Auth error:', err);
      if (err.code === 'auth/cancelled-popup-request') {
        setError('The sign-in popup was closed before completion. Please try again.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('The sign-in popup was blocked by your browser. Please allow popups for this site.');
      } else {
        setError('An unexpected error occurred during sign-in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#4A5D4E] flex items-center justify-center p-6 font-sans relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-[#E6FF00]/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-black/20 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-12 shadow-2xl text-center relative z-10"
      >
        <h1 className="text-4xl font-black tracking-tighter mb-4 uppercase italic text-white leading-none">
          Welcome to <span className="text-[#E6FF00]">{APP_NAME}</span>
        </h1>
        <p className="text-white/40 mb-10 font-bold uppercase tracking-[0.2em] text-[10px]">
          Sign in to access your premium dashboard
        </p>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-xs font-bold text-left"
            >
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-6 mb-8">
          <div className="space-y-2 text-left">
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-4">10-Digit Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={18} />
              <input 
                type="tel" 
                maxLength={10}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="0000000000" 
                className={`w-full bg-white/5 border ${phoneNumber.length > 0 && phoneNumber.length < 10 ? 'border-red-500/50' : phoneNumber.length === 10 ? 'border-green-500/50' : 'border-white/10'} rounded-2xl pl-16 pr-8 py-5 focus:border-[#E6FF00] outline-none transition-all text-white font-bold`} 
              />
            </div>
          </div>
        </div>
        
        {!isMobile ? (
          <button 
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-4 bg-[#E6FF00] text-black py-5 rounded-2xl font-black uppercase italic text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_40px_rgba(230,255,0,0.2)] disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <>
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
                <span>Continue with Google</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        ) : (
          <div className="p-6 bg-white/5 border border-white/10 rounded-2xl text-white/60 text-xs font-bold uppercase tracking-widest leading-relaxed">
            Sorry, you can't use the webapp on your device's browser. Please download the app.
          </div>
        )}

        <div className="mt-12 pt-8 border-t border-white/5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/20 leading-relaxed">
            By continuing, you agree to our <br />
            <a href="#" className="text-white/40 hover:text-[#E6FF00] transition-colors">Terms of Service</a> & <a href="#" className="text-white/40 hover:text-[#E6FF00] transition-colors">Privacy Policy</a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
