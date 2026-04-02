import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { FirebaseUser } from '../firebase';
import { UserProfile } from '../types';
import { Check, Sparkles, Loader2 } from 'lucide-react';
import { createProject } from '../services/database';
import { generateTemplateImage } from '../services/geminiService';

interface OnboardingFlowProps {
  user: FirebaseUser | null;
  profile: UserProfile | null;
}

export default function OnboardingFlow({ user, profile }: OnboardingFlowProps) {
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('onboarding_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing saved onboarding data:', e);
      }
    }
    return {
      businessType: '',
      otherBusinessType: '',
      templateId: '',
      name: profile?.displayName || '',
      email: profile?.email || '',
      businessName: '',
      description: '',
    };
  });

  const [step, setStep] = useState(() => {
    const saved = localStorage.getItem('onboarding_step');
    return saved ? parseInt(saved, 10) : 1;
  });

  const [aiImage, setAiImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const navigate = useNavigate();

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem('onboarding_data', JSON.stringify(formData));
    localStorage.setItem('onboarding_step', step.toString());
  }, [formData, step]);

  // Update form data when profile becomes available
  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || profile.displayName || '',
        email: prev.email || profile.email || '',
      }));
    }
  }, [profile]);

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleGenerateAI = async () => {
    if (!formData.businessName || !formData.description) return;
    setIsGenerating(true);
    const image = await generateTemplateImage(
      formData.businessType === 'Other' ? formData.otherBusinessType : formData.businessType,
      formData.businessName,
      formData.description
    );
    setAiImage(image);
    setIsGenerating(false);
    if (image) {
      setFormData({ ...formData, templateId: 'ai-custom' });
    }
  };

  const handleSubmit = async () => {
    try {
      const finalBusinessType = formData.businessType === 'Other' ? formData.otherBusinessType : formData.businessType;
      const projectData = {
        userId: user?.uid,
        userName: formData.name,
        userEmail: formData.email,
        businessName: formData.businessName,
        businessType: finalBusinessType,
        description: formData.description,
        templateId: formData.templateId,
        estimatedCompletion: null,
      };

      await createProject(projectData);
      localStorage.removeItem('onboarding_data');
      localStorage.removeItem('onboarding_step');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error submitting project:', error);
    }
  };

  const templates = [
    { id: 'food-court', name: 'Food Court', type: 'Food', img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800' },
    { id: 'autos', name: 'Global Autos', type: 'Automobiles', img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800' },
    { id: 'clothing', name: 'Wearism Fashion', type: 'Clothing', img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800' },
  ];

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <h2 className="text-5xl font-bold tracking-tighter text-[#E6FF00] uppercase italic">What do you want to build?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {['Food Court', 'Automobiles', 'Clothing', 'Other'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFormData({ ...formData, businessType: type })}
                  className={`p-8 rounded-[2rem] border transition-all text-left ${
                    formData.businessType === type 
                      ? 'border-[#E6FF00] bg-[#E6FF00] text-black shadow-[0_0_30px_rgba(230,255,0,0.2)]' 
                      : 'border-white/10 bg-white/5 text-white hover:border-[#E6FF00]/50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-black uppercase italic tracking-tighter">{type}</span>
                    {formData.businessType === type && <Check size={24} />}
                  </div>
                </button>
              ))}
            </div>
            {formData.businessType === 'Other' && (
              <input
                type="text"
                placeholder="ENTER YOUR BUSINESS TYPE"
                className="w-full p-6 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#E6FF00] uppercase font-black italic tracking-tighter"
                value={formData.otherBusinessType}
                onChange={(e) => setFormData({ ...formData, otherBusinessType: e.target.value })}
              />
            )}
            <button
              disabled={!formData.businessType || (formData.businessType === 'Other' && !formData.otherBusinessType)}
              onClick={handleNext}
              className="w-full bg-[#E6FF00] text-[#4A5D4E] py-6 rounded-full font-black text-xl uppercase italic hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all"
            >
              Next
            </button>
          </motion.div>
        );
      case 2:
        return (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <h2 className="text-5xl font-bold tracking-tighter text-[#E6FF00] uppercase italic">Project Details</h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-white/30 uppercase tracking-[0.3em] ml-4">Your Name</label>
                <input
                  type="text"
                  className="w-full p-6 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#E6FF00] uppercase font-black italic tracking-tighter"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-white/30 uppercase tracking-[0.3em] ml-4">Your Email</label>
                <input
                  type="email"
                  className="w-full p-6 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#E6FF00] uppercase font-black italic tracking-tighter"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-white/30 uppercase tracking-[0.3em] ml-4">Business Name</label>
                <div className="relative group">
                  <input
                    type="text"
                    className={`w-full p-6 rounded-2xl bg-white/5 border transition-all uppercase font-black italic tracking-tighter ${
                      formData.businessName.length > 0 && formData.businessName.length < 2
                        ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                        : formData.businessName.length >= 2
                        ? 'border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                        : 'border-white/10 focus:border-[#E6FF00]'
                    } text-white focus:outline-none`}
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  />
                  {formData.businessName.length > 0 && formData.businessName.length < 2 && (
                    <p className="text-red-400 text-[10px] font-black uppercase tracking-widest mt-2 ml-4 animate-pulse">
                      it should continue, move forward, it should continue move on
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-white/30 uppercase tracking-[0.3em] ml-4">Describe your website (Min 95 words)</label>
                <div className="relative">
                  <textarea
                    className={`w-full p-6 rounded-2xl bg-white/5 border transition-all uppercase font-black italic tracking-tighter h-48 resize-none ${
                      formData.description.length > 0 && formData.description.trim().split(/\s+/).filter(Boolean).length < 95
                        ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                        : formData.description.trim().split(/\s+/).filter(Boolean).length >= 95
                        ? 'border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                        : 'border-white/10 focus:border-[#E6FF00]'
                    } text-white focus:outline-none`}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                  <div className="absolute bottom-4 right-6 text-[10px] font-black uppercase tracking-widest text-white/30">
                    {formData.description.trim().split(/\s+/).filter(Boolean).length} / 95 Words
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={handleBack} className="flex-1 border border-[#E6FF00] text-[#E6FF00] py-6 rounded-full font-black text-xl uppercase italic hover:bg-[#E6FF00] hover:text-[#4A5D4E] transition-all">Back</button>
              <button 
                disabled={formData.businessName.length < 2 || formData.description.trim().split(/\s+/).filter(Boolean).length < 95}
                onClick={handleNext} 
                className="flex-1 bg-[#E6FF00] text-[#4A5D4E] py-6 rounded-full font-black text-xl uppercase italic hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all"
              >
                Next
              </button>
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div 
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <h2 className="text-5xl font-bold tracking-tighter text-[#E6FF00] uppercase italic">Pick a Design</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {templates.map((template) => (
                <div key={template.id} className="space-y-4">
                  <div className="aspect-video bg-white/5 rounded-[2rem] overflow-hidden border border-white/10 group relative">
                    <img src={template.img} alt={template.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#064E3B] to-transparent opacity-60"></div>
                  </div>
                  <div className="flex justify-between items-center px-2">
                    <div className="flex flex-col">
                      <span className="font-black text-white uppercase italic tracking-tighter">{template.name}</span>
                      <span className="text-[10px] text-white/40 uppercase font-black tracking-widest">{template.type}</span>
                    </div>
                    <button
                      onClick={() => setFormData({ ...formData, templateId: template.id })}
                      className={`px-8 py-3 rounded-full font-black uppercase italic transition-all ${
                        formData.templateId === template.id
                          ? 'bg-[#E6FF00] text-black shadow-[0_0_20px_rgba(230,255,0,0.3)]'
                          : 'bg-white/5 text-white hover:bg-[#E6FF00] hover:text-black'
                      }`}
                    >
                      {formData.templateId === template.id ? 'Selected' : 'Select'}
                    </button>
                  </div>
                </div>
              ))}
              
              {/* AI Custom Template */}
              <div className="space-y-4">
                <div className="aspect-video bg-white/5 rounded-[2rem] overflow-hidden border border-white/10 group relative flex items-center justify-center">
                  {aiImage ? (
                    <img src={aiImage} alt="AI Generated" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="text-center space-y-4 p-6">
                      <div className="w-16 h-16 bg-[#E6FF00]/10 rounded-full flex items-center justify-center mx-auto text-[#E6FF00]">
                        <Sparkles size={32} />
                      </div>
                      <p className="text-xs font-black text-white/40 uppercase tracking-widest leading-relaxed">
                        Generate a custom design using Gemini AI based on your business details.
                      </p>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#064E3B] to-transparent opacity-60"></div>
                </div>
                <div className="flex justify-between items-center px-2">
                  <div className="flex flex-col">
                    <span className="font-black text-[#E6FF00] uppercase italic flex items-center gap-2 tracking-tighter">
                      AI Custom <Sparkles size={14} />
                    </span>
                    <span className="text-[10px] text-white/40 uppercase font-black tracking-widest">Gemini Nano Banana</span>
                  </div>
                  <button
                    onClick={handleGenerateAI}
                    disabled={isGenerating}
                    className={`px-8 py-3 rounded-full font-black uppercase italic transition-all flex items-center gap-2 ${
                      formData.templateId === 'ai-custom'
                        ? 'bg-[#E6FF00] text-black shadow-[0_0_20px_rgba(230,255,0,0.3)]'
                        : 'bg-white text-black hover:bg-[#E6FF00]'
                    }`}
                  >
                    {isGenerating ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      formData.templateId === 'ai-custom' ? 'Selected' : 'Generate'
                    )}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={handleBack} className="flex-1 border border-[#E6FF00] text-[#E6FF00] py-6 rounded-full font-black text-xl uppercase italic hover:bg-[#E6FF00] hover:text-[#4A5D4E] transition-all">Back</button>
              <button disabled={!formData.templateId} onClick={handleNext} className="flex-1 bg-[#E6FF00] text-[#4A5D4E] py-6 rounded-full font-black text-xl uppercase italic hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all">Continue</button>
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div 
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <h2 className="text-5xl font-bold tracking-tighter text-[#E6FF00] uppercase italic">Finalize Project</h2>
            <div className="bg-white/5 rounded-[2rem] p-10 space-y-8 border border-white/10">
              <div className="space-y-4">
                <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">Ready to Launch</h3>
                <p className="text-white/50 italic text-lg leading-relaxed font-medium">
                  Your project details have been captured. Click continue to finalize your request and move to your dashboard.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => navigate('/')} 
                className="flex-1 border border-red-500 text-red-500 py-6 rounded-full font-black text-xl uppercase italic hover:bg-red-500 hover:text-white transition-all"
              >
                Discontinue
              </button>
              {user ? (
                <button 
                  onClick={handleSubmit} 
                  className="flex-1 bg-[#E6FF00] text-black py-6 rounded-full font-black text-xl uppercase italic hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(230,255,0,0.3)]"
                >
                  Continue
                </button>
              ) : (
                <button 
                  onClick={() => navigate('/auth', { state: { from: '/onboarding' } })}
                  className="flex-1 bg-[#E6FF00] text-black py-6 rounded-full font-black text-xl uppercase italic hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(230,255,0,0.3)]"
                >
                  Sign in to Continue
                </button>
              )}
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#064E3B] font-sans selection:bg-[#E6FF00] selection:text-black">
      <header className="px-10 py-8 border-b border-white/5">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#E6FF00] rounded-lg flex items-center justify-center">
              <span className="text-black font-black text-xl italic tracking-tighter">W</span>
            </div>
            <div className="text-2xl font-black tracking-tighter uppercase italic text-white">
              Webby<span className="text-[#E6FF00]">Launch</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-1 w-24 bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(step / 4) * 100}%` }}
                className="h-full bg-[#E6FF00]"
              />
            </div>
            <div className="text-xs font-black text-[#E6FF00] uppercase tracking-widest">Step {step} of 4</div>
          </div>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-10 py-16">
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </main>
    </div>
  );
}
