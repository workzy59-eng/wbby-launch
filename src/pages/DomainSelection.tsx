import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ArrowLeft, Check, AlertCircle, Sparkles, Layout, Server, Shield } from 'lucide-react';
import { getProject, updateProject } from '../services/database';
import { DomainSelect } from '../components/DomainSelect';
import { Loader } from '../components/ui/loader';
import { toast } from 'react-hot-toast';
import { Project } from '../types';

export default function DomainSelection() {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDomain, setSelectedDomain] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProject() {
      if (!projectId) return;
      try {
        const p = await getProject(projectId);
        if (p) {
          setProject(p);
          setSelectedDomain(p.domain || '');
        }
      } catch (error) {
        console.error('Error fetching project:', error);
        toast.error('Failed to load project details');
      } finally {
        setLoading(false);
      }
    }
    fetchProject();
  }, [projectId]);

  const handleSaveDomain = async () => {
    if (!project || !selectedDomain) return;
    
    setIsSubmitting(true);
    try {
      await updateProject(project.id, {
        domain: selectedDomain,
        updatedAt: new Date()
      });
      toast.success('Domain preferences saved successfully!');
      // Navigate back to dashboard after a short delay
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (error) {
      console.error('Error saving domain:', error);
      toast.error('Failed to save domain preferences');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader size={48} />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-4">
        <AlertCircle size={48} className="text-red-500" />
        <h2 className="text-xl font-bold text-white uppercase tracking-widest">Project Not Found</h2>
        <button 
          onClick={() => navigate('/dashboard')}
          className="text-[#c7c42a] font-bold uppercase tracking-widest text-xs hover:underline"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-white/40 hover:text-[#c7c42a] transition-all group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest italic">Back to Dashboard</span>
            </button>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#c7c42a] rounded-xl flex items-center justify-center text-black">
                  <Globe size={24} />
                </div>
                <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter leading-none">
                  Domain Selection
                </h1>
              </div>
              <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] ml-1">
                Mission: {project.businessName} • ID: {project.id.slice(0, 8)}
              </p>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Launch Status</p>
              <p className="text-sm font-black italic text-[#c7c42a] uppercase">{project.status || 'PREPARING'}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#c7c42a]/10 flex items-center justify-center text-[#c7c42a]">
              <Sparkles size={24} />
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Main Logic */}
          <div className="lg:col-span-3 space-y-8">
            <div className="bg-[#111] border border-white/10 rounded-[2.5rem] p-8 md:p-10 space-y-10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#c7c42a]" />
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter">Choose Your Identity</h3>
                  <p className="text-sm text-white/40 leading-relaxed font-bold uppercase italic tracking-widest">
                    Your domain name is your brand's digital address. Choose a memorable name that represents your mission.
                  </p>
                </div>

                <DomainSelect 
                  initialValue={selectedDomain}
                  onSelect={(domain) => setSelectedDomain(domain)}
                />

                <div className="pt-6">
                  <button 
                    onClick={handleSaveDomain}
                    disabled={isSubmitting || !selectedDomain}
                    className="w-full py-6 bg-[#c7c42a] text-black font-black uppercase italic text-sm tracking-widest rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-[#c7c42a]/20 disabled:opacity-50 disabled:scale-100"
                  >
                    {isSubmitting ? 'Securing Identity...' : 'Confirm & Save Domain'}
                  </button>
                </div>
              </div>
            </div>

            {/* Info Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: Server, title: 'DNS Hosting', desc: 'Enterprise-grade nameservers' },
                { icon: Shield, title: 'SSL Security', desc: 'Military-grade encryption' },
                { icon: Layout, title: 'Email Aliases', desc: 'Professional @brand handles' }
              ].map((item, i) => (
                <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-6 space-y-3">
                  <item.icon size={20} className="text-[#c7c42a]" />
                  <div className="space-y-1">
                    <h4 className="text-[10px] font-black uppercase italic text-white">{item.title}</h4>
                    <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar / Requirements */}
          <div className="lg:col-span-2 space-y-6">
             <div className="bg-[#111] border border-white/10 rounded-[2.5rem] p-8 space-y-6">
                <h4 className="text-xs font-black uppercase italic tracking-widest text-[#c7c42a]">Launch Checklist</h4>
                <div className="space-y-4">
                   {[
                     { label: 'Domain Registration', done: !!selectedDomain },
                     { label: 'Cloud Infrastructure', done: true },
                     { label: 'Core Repository', done: true },
                     { label: 'Production SSL', done: false }
                   ].map((item, i) => (
                     <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                        <span className={`text-[10px] font-black uppercase italic ${item.done ? 'text-white' : 'text-white/20'}`}>
                          {item.label}
                        </span>
                        {item.done ? (
                          <div className="w-5 h-5 rounded-full bg-[#c7c42a] flex items-center justify-center text-black">
                            <Check size={12} strokeWidth={4} />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-white/10" />
                        )}
                     </div>
                   ))}
                </div>
             </div>

             <div className="bg-[#c7c42a]/10 border border-[#c7c42a]/20 rounded-[2.5rem] p-8">
                <div className="flex items-center gap-3 mb-4">
                   <AlertCircle size={18} className="text-[#c7c42a]" />
                   <h4 className="text-xs font-black uppercase italic tracking-widest text-[#c7c42a]">Expert Insight</h4>
                </div>
                <p className="text-[11px] font-medium text-[#c7c42a]/80 leading-relaxed uppercase italic tracking-wide">
                  "Choosing a .com domain can improve your SEO visibility by up to 35% in international markets. Our system automatically optimizes DNS records for maximum performance."
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
