import React, { useState } from 'react';
import { Calendar, CheckCircle2, RefreshCw } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';

function App() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const handleConnectGoogle = async () => {
    setIsConnecting(true);
    try {
      // In a real app, we'd get the current user ID
      const userId = 'user_123'; 
      const response = await fetch(`/api/google/auth-url?userId=${userId}`);
      const { url } = await response.json();
      
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      window.open(
        url,
        'google_auth',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      const handleMessage = (event: MessageEvent) => {
        if (event.data?.type === 'GOOGLE_AUTH_SUCCESS') {
          toast.success("webbylaunch: Google Calendar connected!");
          setIsConnected(true);
          window.removeEventListener('message', handleMessage);
        }
      };
      window.addEventListener('message', handleMessage);
    } catch (error) {
      toast.error("Connection failed");
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <Toaster position="top-center" />
      
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">webbylaunch</h1>
          <p className="text-white/40 text-sm">Professional sync for your development sessions.</p>
        </div>

        <div className={`p-8 rounded-[2.5rem] border transition-all duration-500 ${
          isConnected 
            ? 'bg-green-500/5 border-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.1)]' 
            : 'bg-[#c7c42a]/5 border-[#c7c42a]/20 shadow-[0_0_20px_rgba(199,196,42,0.1)]'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Calendar className={isConnected ? 'text-green-500' : 'text-[#c7c42a]'} size={24} />
              <h3 className="text-sm font-bold uppercase tracking-widest">Google Calendar</h3>
            </div>
            {isConnected && (
              <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            )}
          </div>
          
          <p className="text-xs text-white/50 leading-relaxed mb-8">
            {isConnected 
              ? "webbylaunch is actively syncing your sessions. You will receive notifications in your calendar automatically."
              : "Authorize webbylaunch to push sessions and milestones directly to your Google Calendar."}
          </p>

          <button 
            onClick={handleConnectGoogle}
            disabled={isConnecting || isConnected}
            className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${
              isConnected
                ? 'bg-green-500/10 text-green-500 border border-green-500/30 cursor-default'
                : 'bg-[#c7c42a] text-black hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#c7c42a]/20'
            }`}
          >
            {isConnecting ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                Connecting...
              </>
            ) : isConnected ? (
              <>
                <CheckCircle2 size={14} />
                Sync Active
              </>
            ) : (
              'Connect Google Calendar'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
