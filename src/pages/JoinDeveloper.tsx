import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function JoinDeveloper() {
  const navigate = useNavigate();
  
  React.useEffect(() => {
    window.location.href = "https://discord.gg/EDZb5Aefb";
  }, []);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#c7c42a] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-white/40 font-black uppercase tracking-widest italic animate-pulse">Redirecting to Developer Community...</p>
      </div>
    </div>
  );
}
