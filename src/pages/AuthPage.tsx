import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { APP_NAME } from '../constants';
import { AlertCircle, ArrowRight, Mail, Lock, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { sendOTP, verifyOTP, user } = useAuth();
  
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [shake, setShake] = useState(false);

  const from = location.state?.from || '/dashboard';

  useEffect(() => {
    if (user) navigate(from);
  }, [user, navigate, from]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await sendOTP(email);
      setStep('otp');
      setCooldown(60);
      toast.success('OTP sent to your email');
    } catch (err: any) {
      setError(err.message);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) {
      setError('Please enter the 6-digit code');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await verifyOTP(email, code);
      toast.success('Verification successful');
      // In a real app, the server would return a token to sign in with Firebase
      // For this demo, we'll simulate the login or redirect
      navigate('/onboarding', { state: { email } });
    } catch (err: any) {
      setError(err.message);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 selection:bg-primary selection:text-white">
      {/* Background Accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`max-w-md w-full bg-card border border-border rounded-[2rem] p-10 shadow-2xl relative z-10 ${shake ? 'animate-shake' : ''}`}
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 border border-primary/20">
            <ShieldCheck className="text-primary" size={32} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-text mb-2">
            {step === 'email' ? 'Welcome to WebbyLaunch' : 'Verify your email'}
          </h1>
          <p className="text-subtext text-center text-sm">
            {step === 'email' 
              ? 'Enter your email to receive a 6-digit verification code' 
              : `We've sent a code to ${email}`}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl flex items-center gap-3 text-error text-xs font-medium input-error"
            >
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {step === 'email' ? (
          <form onSubmit={handleSendOTP} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-subtext ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-subtext" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com" 
                  className={`w-full bg-background border border-border rounded-xl pl-12 pr-4 py-4 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-text ${error ? 'border-error' : ''}`}
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2 group"
            >
              {loading ? 'Sending...' : (
                <>
                  <span>Send Code</span>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-8">
            <div className="flex justify-between gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={`w-12 h-14 bg-background border border-border rounded-xl text-center text-2xl font-bold text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all ${error ? 'border-error' : ''}`}
                />
              ))}
            </div>

            <div className="space-y-4">
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  disabled={cooldown > 0 || loading}
                  onClick={handleSendOTP}
                  className="text-sm text-subtext hover:text-primary transition-colors disabled:opacity-50"
                >
                  {cooldown > 0 ? `Resend code in ${cooldown}s` : "Didn't receive a code? Resend"}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep('email')}
              className="w-full text-sm text-subtext hover:text-text transition-colors"
            >
              Change email address
            </button>
          </form>
        )}

        <div className="mt-10 pt-8 border-t border-border text-center">
          <p className="text-xs text-subtext">
            By continuing, you agree to our <br />
            <a href="/terms" className="text-text hover:text-primary transition-colors font-semibold">Terms of Service</a> & <a href="/privacy" className="text-text hover:text-primary transition-colors font-semibold">Privacy Policy</a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
