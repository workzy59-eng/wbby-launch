import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { FirebaseUser, logOut } from '../firebase';
import { UserProfile, Project } from '../types';
import { LogOut, User, MessageCircle, X, LayoutDashboard, FolderKanban, Settings, Check, ArrowRight } from 'lucide-react';
import ChatSystem from '../components/ChatSystem';
import { getProjects, updateProject } from '../services/database';
import { formatDate } from '../lib/utils';
import { APP_NAME, HYPHENATED_NAME } from '../constants';

interface DashboardProps {
  user: FirebaseUser;
  profile: UserProfile | null;
}

export default function Dashboard({ user, profile }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'messages' | 'settings'>('dashboard');
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    const unsubscribe = getProjects((projectsData) => {
      setProjects(projectsData as Project[]);
      if (projectsData.length > 0 && !selectedProject) {
        setSelectedProject(projectsData[0] as Project);
      }
    }, user.uid);
    return () => unsubscribe();
  }, [user.uid]);

  const handleCancelProject = async () => {
    if (selectedProject) {
      await updateProject(selectedProject.id, { isDeleted: true });
      setShowCancelModal(false);
      setSelectedProject(null);
    }
  };

  const statusSteps = ["Waiting for Review", "Under Review", "Accepted", "Development Started", "Completed"];
  const currentStepIndex = selectedProject ? statusSteps.indexOf(selectedProject.status) : -1;

  return (
    <div className="min-h-screen bg-[#4A5D4E] font-sans text-white selection:bg-[#E6FF00] selection:text-[#4A5D4E]">
      {/* Sidebar Navigation */}
      <aside className="fixed left-0 top-0 bottom-0 w-24 bg-[#4A5D4E] border-r border-white/5 flex flex-col items-center py-10 gap-10 z-20 hidden lg:flex">
        <div className="px-2 py-0.5 bg-[#E6FF00] rounded flex items-center justify-center">
          <span className="text-black font-black text-[8px] tracking-tighter">W-E-B-i-L-A-U-N-C-H</span>
        </div>
        <nav className="flex-1 flex flex-col gap-6">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`p-4 rounded-2xl transition-all ${activeTab === 'dashboard' ? 'bg-[#E6FF00] text-[#4A5D4E]' : 'text-white/50 hover:text-white'}`}
          >
            <LayoutDashboard size={24} />
          </button>
          <button 
            onClick={() => setActiveTab('messages')}
            className={`p-4 rounded-2xl transition-all ${activeTab === 'messages' ? 'bg-[#E6FF00] text-[#4A5D4E]' : 'text-white/50 hover:text-white'}`}
          >
            <MessageCircle size={24} />
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`p-4 rounded-2xl transition-all ${activeTab === 'settings' ? 'bg-[#E6FF00] text-[#4A5D4E]' : 'text-white/50 hover:text-white'}`}
          >
            <Settings size={24} />
          </button>
          {profile?.role === 'admin' && (
            <Link 
              to="/admin"
              className="p-4 rounded-2xl text-white/50 hover:text-[#E6FF00] transition-all"
            >
              <LayoutDashboard size={24} />
            </Link>
          )}
        </nav>
        <button onClick={() => logOut()} className="p-4 rounded-2xl text-white/50 hover:text-red-400 transition-all">
          <LogOut size={24} />
        </button>
      </aside>

      <header className="lg:hidden bg-[#4A5D4E] px-6 py-6 border-b border-white/5 sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="px-2 py-0.5 bg-[#E6FF00] rounded flex items-center justify-center">
              <span className="text-black font-black text-[8px] tracking-tighter">{HYPHENATED_NAME}</span>
            </div>
            <div className="text-xl font-bold tracking-tighter">{APP_NAME}</div>
          </div>
          <button onClick={() => logOut()} className="text-white/50 hover:text-red-400 transition-all">
            <LogOut size={24} />
          </button>
        </div>
      </header>

      <main className="lg:ml-24 max-w-7xl mx-auto px-6 lg:px-12 py-12">
        {activeTab === 'messages' ? (
          <div className="h-[calc(100vh-8rem)] bg-[#5E7162] rounded-[3rem] border border-[#E6FF00]/10 shadow-2xl overflow-hidden flex flex-col">
            <div className="px-10 py-10 border-b border-white/5 flex justify-between items-center">
              <h2 className="text-4xl font-black tracking-tighter uppercase italic text-[#E6FF00]">Admin Support</h2>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#E6FF00] flex items-center justify-center text-[#4A5D4E] font-black italic">W</div>
                <div>
                  <div className="text-sm font-black uppercase italic">WebbyLaunch Admin</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[#E6FF00]">Online</div>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <ChatSystem isDirect user={user} profile={profile} currentUser={user} />
            </div>
          </div>
        ) : activeTab === 'settings' ? (
          <div className="bg-[#5E7162] rounded-[3rem] p-16 border border-[#E6FF00]/10 shadow-2xl">
            <h2 className="text-5xl font-black tracking-tighter mb-12 uppercase italic text-[#E6FF00]">Settings</h2>
            <div className="space-y-8 max-w-xl">
              <div className="p-8 bg-[#4A5D4E] rounded-[2rem] border border-white/5">
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-20 h-20 rounded-full bg-[#E6FF00] flex items-center justify-center text-[#4A5D4E] text-3xl font-black italic">
                    {profile?.displayName?.[0] || 'U'}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black uppercase italic">{profile?.displayName}</h3>
                    <p className="text-white/50 font-bold">{profile?.email}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-4 border-b border-white/5">
                    <span className="text-white/50 font-bold uppercase tracking-widest text-xs">Role</span>
                    <span className="font-black uppercase italic text-[#E6FF00]">{profile?.role}</span>
                  </div>
                  <div className="flex justify-between items-center py-4 border-b border-white/5">
                    <span className="text-white/50 font-bold uppercase tracking-widest text-xs">Member Since</span>
                    <span className="font-black uppercase italic">{formatDate(profile?.createdAt)}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => logOut()} className="w-full bg-red-500/10 text-red-500 py-5 rounded-2xl font-black text-xl uppercase italic hover:bg-red-500 hover:text-white transition-all">
                Log Out
              </button>
            </div>
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-[#5E7162] rounded-[3rem] p-16 text-center border border-[#E6FF00]/10 shadow-2xl">
            <h2 className="text-5xl font-black tracking-tighter mb-6 uppercase italic text-[#E6FF00]">No projects yet</h2>
            <p className="text-white/60 mb-10 text-xl">Start your first project to see it here.</p>
            <a href="/onboarding" className="inline-block bg-[#E6FF00] text-[#4A5D4E] px-12 py-5 rounded-full font-black text-xl uppercase italic hover:scale-[1.05] active:scale-[0.95] transition-all">
              Start Your Project
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Project List */}
            <div className="lg:col-span-1 space-y-6">
              <h2 className="text-xs font-black text-white/50 uppercase tracking-widest px-4">Your Projects</h2>
              <div className="space-y-4">
                {projects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProject(p)}
                    className={`w-full p-8 rounded-[2.5rem] text-left transition-all border ${
                      selectedProject?.id === p.id 
                        ? 'bg-[#E6FF00] border-[#E6FF00] text-[#4A5D4E] shadow-xl scale-[1.02]' 
                        : 'bg-[#5E7162] border-white/5 text-white hover:border-[#E6FF00]/50'
                    }`}
                  >
                    <h3 className="font-black text-2xl mb-2 uppercase italic">{p.businessName}</h3>
                    <p className={`text-sm mb-4 font-bold ${selectedProject?.id === p.id ? 'text-[#4A5D4E]/70' : 'text-white/50'}`}>{p.businessType}</p>
                    <div className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      selectedProject?.id === p.id ? 'bg-[#4A5D4E] text-[#E6FF00]' : 'bg-[#4A5D4E] text-white'
                    }`}>
                      {p.status}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Project Details */}
            <div className="lg:col-span-2 space-y-8">
              {selectedProject && (
                <motion.div 
                  key={selectedProject.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#5E7162] rounded-[3rem] p-10 lg:p-16 border border-[#E6FF00]/10 shadow-2xl relative overflow-hidden"
                >
                  {/* Atmospheric Glow */}
                  <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#E6FF00] rounded-full blur-[120px] opacity-10"></div>

                  <div className="flex justify-between items-start mb-16 relative z-10">
                    <div>
                      <h2 className="text-6xl font-black tracking-tighter mb-4 uppercase italic text-[#E6FF00]">Project Status</h2>
                      <p className="text-2xl text-white/70 font-bold uppercase italic">{selectedProject.businessName}</p>
                    </div>
                    <button 
                      onClick={() => setShowChat(true)}
                      className="bg-[#E6FF00] text-[#4A5D4E] p-6 rounded-full hover:scale-[1.1] active:scale-[0.9] transition-all shadow-xl"
                    >
                      <MessageCircle size={32} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16 relative z-10">
                    <div className="space-y-6">
                      <h3 className="text-xs font-black text-white/40 uppercase tracking-widest">Selected Template</h3>
                      <div className="p-6 bg-[#4A5D4E] rounded-3xl border border-white/5 flex items-center justify-between">
                        <div>
                          <div className="text-xl font-black uppercase italic text-[#E6FF00]">
                            {selectedProject.templateId === 'food-court' ? 'Food Court' : 
                             selectedProject.templateId === 'autos' ? 'Global Autos' : 
                             selectedProject.templateId === 'clothing' ? 'Wearism Fashion' : 
                             selectedProject.templateId === 'ai-custom' ? 'AI Custom Design' : 'Standard Template'}
                          </div>
                          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">
                            {selectedProject.templateId === 'ai-custom' ? 'Generated by Gemini' : 'Premium Theme'}
                          </p>
                        </div>
                        {['food-court', 'autos', 'clothing'].includes(selectedProject.templateId) && (
                          <Link 
                            to={`/portfolio/${selectedProject.templateId === 'food-court' ? 'food-court' : selectedProject.templateId === 'autos' ? 'autos' : 'clothing'}`}
                            className="bg-white/5 hover:bg-[#E6FF00] hover:text-[#4A5D4E] p-3 rounded-xl transition-all"
                          >
                            <ArrowRight size={20} />
                          </Link>
                        )}
                      </div>
                    </div>
                    <div className="space-y-6">
                      <h3 className="text-xs font-black text-white/40 uppercase tracking-widest">Business Type</h3>
                      <div className="p-6 bg-[#4A5D4E] rounded-3xl border border-white/5">
                        <div className="text-xl font-black uppercase italic">{selectedProject.businessType}</div>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">Industry Sector</p>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-12 mb-16 relative z-10">
                    <div className="flex justify-between items-center overflow-x-auto pb-6 gap-6 no-scrollbar">
                      {statusSteps.map((step, i) => (
                        <div key={step} className="flex flex-col items-center min-w-[120px] text-center gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                            i <= currentStepIndex 
                              ? 'bg-[#E6FF00] border-[#E6FF00] text-[#4A5D4E]' 
                              : 'bg-transparent border-white/20 text-white/20'
                          }`}>
                            {i < currentStepIndex ? <Check size={24} /> : <span className="font-black text-lg">{i + 1}</span>}
                          </div>
                          <span className={`text-[10px] font-black uppercase tracking-widest ${
                            i <= currentStepIndex ? 'text-[#E6FF00]' : 'text-white/20'
                          }`}>
                            {step}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="space-y-6">
                      <div className="flex justify-between items-end">
                        <span className="text-2xl font-black uppercase italic text-[#E6FF00]">Progress: {selectedProject.progress}%</span>
                        <span className="text-xs font-black text-white/40 uppercase tracking-widest">Est. Completion: {formatDate(selectedProject.estimatedCompletion)}</span>
                      </div>
                      <div className="w-full h-3 bg-[#4A5D4E] rounded-full overflow-hidden p-0.5 border border-white/5">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${selectedProject.progress}%` }}
                          className="h-full bg-[#E6FF00] rounded-full shadow-[0_0_15px_rgba(230,255,0,0.5)]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-10 border-t border-white/5 relative z-10">
                    <div className="text-sm">
                      {selectedProject.status === 'Rejected' && (
                        <p className="text-red-400 font-black uppercase italic">Reason: {selectedProject.rejectionReason}</p>
                      )}
                    </div>
                    <button 
                      onClick={() => setShowCancelModal(true)}
                      className="text-white/30 hover:text-red-400 font-black text-xs uppercase tracking-widest transition-all"
                    >
                      Cancel Project
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Chat Sidebar */}
      <AnimatePresence>
        {showChat && selectedProject && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#4A5D4E]/80 backdrop-blur-md" 
              onClick={() => setShowChat(false)} 
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-xl bg-[#5E7162] h-full shadow-2xl flex flex-col border-l border-white/10"
            >
              <div className="px-10 py-10 border-b border-white/5 flex justify-between items-center">
                <h2 className="text-3xl font-black tracking-tighter uppercase italic text-[#E6FF00]">Project Chat</h2>
                <button onClick={() => setShowChat(false)} className="p-4 hover:bg-white/5 rounded-full transition-all text-white/50 hover:text-white">
                  <X size={24} />
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <ChatSystem projectId={selectedProject.id} user={user} profile={profile} currentUser={user} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cancel Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#4A5D4E]/80 backdrop-blur-md" 
              onClick={() => setShowCancelModal(false)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-[#5E7162] rounded-[3rem] p-12 max-w-md w-full text-center shadow-2xl border border-[#E6FF00]/10"
            >
              <h3 className="text-4xl font-black tracking-tighter mb-6 uppercase italic text-[#E6FF00]">Cancel Project?</h3>
              <p className="text-white/60 mb-10 text-lg font-bold">Are you sure you want to cancel this project?</p>
              <div className="flex flex-col gap-4">
                <button onClick={handleCancelProject} className="w-full bg-red-500 text-white py-5 rounded-full font-black text-xl uppercase italic hover:bg-red-600 transition-all">
                  Yes, Cancel
                </button>
                <button onClick={() => setShowCancelModal(false)} className="w-full bg-[#4A5D4E] text-white py-5 rounded-full font-black text-xl uppercase italic hover:bg-white/5 transition-all">
                  No, Keep It
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
