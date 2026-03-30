import { motion } from 'motion/react';
import { signInWithGoogle } from '../firebase';
import { useNavigate, useLocation } from 'react-router-dom';

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/dashboard';

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      navigate(from);
    } catch (error) {
      console.error('Auth error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white border border-gray-100 rounded-[2.5rem] p-12 shadow-sm text-center"
      >
        <div className="flex justify-center mb-10">
          <div className="px-4 py-1 bg-[#E6FF00] rounded flex items-center justify-center">
            <span className="text-black font-black text-xs tracking-tighter">W-E-B-i-L-A-U-N-C-H</span>
          </div>
        </div>
        <h1 className="text-3xl font-black tracking-tighter mb-4 uppercase italic">Welcome to WebbyLaunch</h1>
        <p className="text-gray-500 mb-10 font-bold uppercase tracking-widest text-xs">Sign in to start your project</p>
        
        <button 
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-3 bg-black text-white py-4 rounded-full font-bold hover:bg-opacity-80 transition-all shadow-lg"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          Continue with Google
        </button>
      </motion.div>
    </div>
  );
}
