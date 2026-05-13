import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, CheckCircle2, AlertCircle, Send, Globe, Phone, Clock, MessageSquare, Target, Activity, ShieldCheck, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import SEO from '../components/SEO';

export default function JoinSales() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreed, setAgreed] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    languages: '',
    confidence: 'Medium',
    experience: 'No',
    hoursPerDay: '',
    convinceBusiness: '',
    handleRudeCustomer: ''
  });

  const validateStep1 = () => {
    if (!formData.fullName || !formData.email || !formData.phone || !formData.languages || !formData.hoursPerDay || !formData.convinceBusiness || !formData.handleRudeCustomer) {
      toast.error('Please fill all required fields');
      return false;
    }
    
    // Phone validation: exactly 10 digits
    if (!/^\d{10}$/.test(formData.phone)) {
      toast.error('Phone number must be exactly 10 digits');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      toast.error('You must agree to the Terms & Conditions');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast.success('Application submitted successfully! We will review it and get back to you.');
    setIsSubmitting(false);
    navigate('/careers');
  };

  return (
    <div className="min-h-screen bg-black font-sans text-white py-32 px-10">
      <SEO title="Apply for Sales/CS | WebbyLaunch Careers" description="Join our sales team and help businesses grow with professional web solutions." />
      
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-16">
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-block px-4 py-1 bg-[#c7c42a] text-black rounded-full text-[10px] font-black uppercase tracking-widest italic"
            >
              Step {step} of 2
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-[0.8]"
            >
              Sales / CS <br />
              <span className="text-[#c7c42a]">Application.</span>
            </motion.h1>
          </div>
          <Link 
            to="/careers" 
            className="flex items-center gap-2 text-white/40 hover:text-[#c7c42a] transition-colors font-black uppercase text-xs tracking-widest italic"
          >
            <ArrowLeft size={16} /> Back
          </Link>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              {/* Basic Details */}
              <section className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 space-y-8">
                <h3 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#c7c42a] rounded-lg flex items-center justify-center text-black">
                    <Globe size={18} />
                  </div>
                  Personal Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">Full Name *</label>
                    <input 
                      type="text"
                      value={formData.fullName}
                      onChange={e => setFormData({...formData, fullName: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm outline-none focus:border-[#c7c42a]/50 transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">Email Address *</label>
                    <input 
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm outline-none focus:border-[#c7c42a]/50 transition-all"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">Phone Number (10 Digits) *</label>
                    <input 
                      type="tel"
                      maxLength={10}
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm outline-none focus:border-[#c7c42a]/50 transition-all"
                      placeholder="9876543210"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">Languages Known *</label>
                    <input 
                      type="text"
                      value={formData.languages}
                      onChange={e => setFormData({...formData, languages: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm outline-none focus:border-[#c7c42a]/50 transition-all"
                      placeholder="e.g. English, Hindi"
                    />
                  </div>
                </div>
              </section>

              {/* Skills */}
              <section className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 space-y-8">
                <h3 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#c7c42a] rounded-lg flex items-center justify-center text-black">
                    <MessageSquare size={18} />
                  </div>
                  Communication
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">Confidence Level</label>
                    <select 
                      value={formData.confidence}
                      onChange={e => setFormData({...formData, confidence: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm outline-none focus:border-[#c7c42a]/50 transition-all appearance-none"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">Hours per day *</label>
                    <input 
                      type="number"
                      value={formData.hoursPerDay}
                      onChange={e => setFormData({...formData, hoursPerDay: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm outline-none focus:border-[#c7c42a]/50 transition-all"
                      placeholder="e.g. 8"
                    />
                  </div>
                </div>
              </section>

              {/* Test Questions */}
              <section className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 space-y-8">
                <h3 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#c7c42a] rounded-lg flex items-center justify-center text-black">
                    <Activity size={18} />
                  </div>
                  Test Questions *
                </h3>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">How will you convince a business to get a website? *</label>
                    <textarea 
                      value={formData.convinceBusiness}
                      onChange={e => setFormData({...formData, convinceBusiness: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm outline-none focus:border-[#c7c42a]/50 transition-all min-h-[120px]"
                      placeholder="Your pitch here..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">How will you handle a rude customer? *</label>
                    <textarea 
                      value={formData.handleRudeCustomer}
                      onChange={e => setFormData({...formData, handleRudeCustomer: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm outline-none focus:border-[#c7c42a]/50 transition-all min-h-[120px]"
                      placeholder="Your approach here..."
                    />
                  </div>
                </div>
              </section>

              <button
                onClick={() => validateStep1() && setStep(2)}
                className="w-full py-6 bg-[#c7c42a] text-black rounded-3xl font-black uppercase italic text-xl hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_50px_rgba(199,196,42,0.2)] flex items-center justify-center gap-4"
              >
                Next Step
                <ArrowRight size={24} />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              <section className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 space-y-8">
                <h3 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-3 text-[#c7c42a]">
                  <ShieldCheck size={24} />
                  Terms & Conditions
                </h3>
                
                <div className="space-y-8 text-white/60 font-medium italic">
                  <div className="space-y-4">
                    <h4 className="text-white font-black uppercase tracking-widest">Sales Rules:</h4>
                    <ul className="space-y-2 text-xs uppercase tracking-widest list-disc pl-6">
                      <li>Commission is paid only after successful client payment.</li>
                      <li>Spamming or rude behavior is strictly prohibited.</li>
                      <li>Must maintain professionalism in all client interactions.</li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-white font-black uppercase tracking-widest">General Rules:</h4>
                    <ul className="space-y-2 text-xs uppercase tracking-widest list-disc pl-6">
                      <li>Fake information leads to immediate rejection.</li>
                      <li>Poor performance or unprofessionalism may result in removal.</li>
                    </ul>
                  </div>

                  <div className="p-6 bg-[#c7c42a]/10 border border-[#c7c42a]/20 rounded-2xl">
                    <p className="text-xs font-black text-[#c7c42a] uppercase tracking-widest leading-relaxed">
                      “Shortlisted candidates will be invited for an interview. Selection is based on communication, confidence, and professionalism.”
                    </p>
                  </div>
                </div>

                <label className="flex items-center gap-4 cursor-pointer group">
                  <div 
                    onClick={() => setAgreed(!agreed)}
                    className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all ${
                      agreed ? 'bg-[#c7c42a] border-[#c7c42a] text-black' : 'border-white/10 group-hover:border-[#c7c42a]/50'
                    }`}
                  >
                    {agreed && <CheckCircle2 size={20} />}
                  </div>
                  <span className="text-sm font-black uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">
                    I agree to the Terms & Conditions
                  </span>
                </label>
              </section>

              <div className="flex gap-6">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-6 bg-white/5 text-white border border-white/10 rounded-3xl font-black uppercase italic text-xl hover:bg-white/10 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !agreed}
                  className="flex-[2] py-6 bg-[#c7c42a] text-black rounded-3xl font-black uppercase italic text-xl hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_50px_rgba(199,196,42,0.2)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                  {!isSubmitting && <Send size={24} />}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
