import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Globe, ShieldAlert, CheckCircle2, AlertCircle, Copy, ExternalLink, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface DNSInstruction {
  type: string;
  host: string;
  value: string;
}

export const DomainConnectivity: React.FC = () => {
  const [domain, setDomain] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [status, setStatus] = useState<'none' | 'pending' | 'connected'>('none');

  const dnsInstructions: DNSInstruction[] = [
    { type: 'A', host: '@', value: '76.76.21.21' },
    { type: 'CNAME', host: 'www', value: 'cname.webbylaunch.vercel.app' }
  ];

  const handleVerify = async () => {
    if (!domain) {
      toast.error('Please enter a domain');
      return;
    }
    setIsVerifying(true);
    setStatus('pending');
    
    // Simulate verification delay
    setTimeout(() => {
      setIsVerifying(false);
      // For demo purposes, we'll just set it to connected after 2s
      setStatus('connected');
      toast.success('Domain DNS Propagation Detected!');
    }, 2000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FFFF00]">Connection Hub</span>
        <h2 className="text-6xl font-black tracking-tighter uppercase italic text-white leading-none">Domain Sync</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Zone */}
        <div className="lg:col-span-12">
          <div className="bg-white/5 border border-white/10 p-10 rounded-[3rem] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <Globe size={120} strokeWidth={1} />
            </div>

            <div className="relative z-10 max-w-2xl">
              <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 block mb-6">Enter Destination Domain</label>
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Globe className="absolute left-6 top-1/2 -translate-y-1/2 text-[#FFFF00]" size={20} />
                  <input
                    type="text"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="e.g. clientdomain.com"
                    className="w-full bg-black border border-white/20 rounded-2xl py-6 pl-16 pr-6 text-white font-black italic focus:border-[#FFFF00] transition-colors outline-none"
                  />
                </div>
                <button
                  onClick={handleVerify}
                  disabled={isVerifying}
                  className="px-10 bg-[#FFFF00] text-black font-black uppercase tracking-widest rounded-2xl hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,255,0,0.2)] disabled:opacity-50"
                >
                  {isVerifying ? <RefreshCw className="animate-spin" /> : 'Sync Signal'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* DNS Zone */}
        <div className="lg:col-span-8">
          <div className="bg-[#111] border border-white/5 rounded-[3rem] p-10 space-y-8">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black uppercase italic tracking-tighter">DNS Configuration</h3>
              <div className={`px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.2em] flex items-center gap-2 ${
                status === 'connected' ? 'bg-green-500/10 text-green-500' :
                status === 'pending' ? 'bg-[#FFFF00]/10 text-[#FFFF00]' :
                'bg-white/5 text-white/20'
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${
                  status === 'connected' ? 'bg-green-500 animate-pulse' :
                  status === 'pending' ? 'bg-[#FFFF00] animate-bounce' :
                  'bg-white/20'
                }`} />
                {status === 'connected' ? 'Connected' : status === 'pending' ? 'Propagating' : 'Not Pointed'}
              </div>
            </div>

            <div className="overflow-hidden border border-white/10 rounded-3xl">
              <table className="w-full text-left border-collapse">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40 border-b border-white/10">Type</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40 border-b border-white/10">Host</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40 border-b border-white/10">Value</th>
                    <th className="px-6 py-4 text-right border-b border-white/10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {dnsInstructions.map((dns, i) => (
                    <tr key={i} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-6 text-sm font-black text-[#FFFF00] italic">{dns.type}</td>
                      <td className="px-6 py-6 text-sm font-bold text-white/80">{dns.host}</td>
                      <td className="px-6 py-6 text-xs font-mono text-white/40">{dns.value}</td>
                      <td className="px-6 py-6 text-right">
                        <button 
                          onClick={() => copyToClipboard(dns.value)}
                          className="p-2 bg-white/5 text-white/20 rounded-lg hover:text-[#FFFF00] hover:bg-[#FFFF00]/10 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Copy size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-[#FFFF00]/5 border border-[#FFFF00]/20 p-8 rounded-3xl flex gap-6 items-start">
              <div className="w-12 h-12 bg-[#FFFF00]/10 rounded-2xl flex items-center justify-center text-[#FFFF00] shrink-0">
                <ShieldAlert size={28} />
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-black uppercase tracking-widest text-[#FFFF00]">Critical Protection Guard</h4>
                <p className="text-[10px] text-white/40 leading-relaxed font-medium">
                  DO NOT modify or delete existing MX records. Changing MX records will disconnect the client's email systems.
                  Only add or update the A and CNAME records listed above.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Status Zone */}
        <div className="lg:col-span-4">
          <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 h-full">
            <h3 className="text-sm font-black uppercase tracking-[0.4em] text-white/40 mb-10">Verification Protocol</h3>
            <div className="space-y-8">
              {[
                { label: 'DNS Propagation', status: status === 'connected' ? 'pass' : status === 'pending' ? 'wait' : 'idle' },
                { label: 'SSL Certificate', status: status === 'connected' ? 'pass' : 'idle' },
                { label: 'SSL Protocol', status: status === 'connected' ? 'pass' : 'idle' },
                { label: 'Security Firewall', status: status === 'connected' ? 'pass' : 'idle' },
              ].map((check, i) => (
                <div key={i} className="flex items-center justify-between group">
                  <span className="text-[10px] font-black uppercase tracking-[0.1em] text-white/60 group-hover:text-white transition-colors">{check.label}</span>
                  {check.status === 'pass' ? (
                    <CheckCircle2 size={18} className="text-green-500" />
                  ) : check.status === 'wait' ? (
                    <RefreshCw size={18} className="text-[#FFFF00] animate-spin" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-white/10" />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-12 pt-12 border-t border-white/5">
              <button 
                className="w-full flex items-center justify-between group"
                onClick={() => window.open('https://dnschecker.org', '_blank')}
              >
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">External Tool</p>
                  <p className="text-xs font-bold text-white group-hover:text-[#FFFF00] transition-colors">Global DNS Pulse Check</p>
                </div>
                <ExternalLink size={16} className="text-white/20 group-hover:text-[#FFFF00] transition-colors" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
