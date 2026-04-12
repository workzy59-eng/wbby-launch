import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Code, Send, CheckCircle2, Briefcase, Globe, Clock, IndianRupee } from 'lucide-react';
import { db, collection, addDoc, serverTimestamp } from '../firebase';
import { toast } from 'react-hot-toast';

export default function JoinDeveloper() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    skills: '',
    experience: '',
    portfolio: '',
    availability: '',
    maxProjectsPerWeek: 1,
    expectedEarnings: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'developer_applications'), {
        ...formData,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      setSubmitted(true);
      toast.success('Application submitted successfully!');
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/5 border border-white/10 p-12 rounded-[3rem] max-w-xl text-center shadow-2xl"
        >
          <div className="w-24 h-24 bg-[#E6FF00] rounded-full flex items-center justify-center mx-auto mb-8 text-black shadow-[0_0_50px_rgba(230,255,0,0.3)]">
            <CheckCircle2 size={48} />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic mb-4">Application Received!</h1>
          <p className="text-white/60 font-medium mb-10 leading-relaxed">
            Thank you for your interest in joining WebbyLaunch. Our team will review your portfolio and get back to you within 3–5 business days.
          </p>
          <button 
            onClick={() => window.location.href = '/'}
            className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase italic text-lg hover:scale-105 transition-all shadow-2xl"
          >
            Back to Home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-20 px-6 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="text-center space-y-6 mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-6 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.4em] text-[#E6FF00] italic"
          >
            Careers
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic leading-[0.8]"
          >
            Join Our <br />
            <span className="text-[#E6FF00]">Developer</span> Network.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-white/40 max-w-2xl mx-auto font-medium italic"
          >
            Build premium websites for global clients. Flexible work, competitive pay, and a modern tech stack.
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 border border-white/10 p-10 md:p-16 rounded-[4rem] shadow-2xl relative overflow-hidden"
        >
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#E6FF00] rounded-full blur-[120px] opacity-5"></div>
          
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-[0.3em] text-white/40 ml-6">Full Name</label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-[2rem] py-6 px-8 focus:outline-none focus:border-[#E6FF00]/50 transition-all font-medium text-lg"
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-[0.3em] text-white/40 ml-6">Email Address</label>
                <input 
                  required
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-[2rem] py-6 px-8 focus:outline-none focus:border-[#E6FF00]/50 transition-all font-medium text-lg"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-[0.3em] text-white/40 ml-6">Phone Number</label>
                <input 
                  required
                  type="tel" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-[2rem] py-6 px-8 focus:outline-none focus:border-[#E6FF00]/50 transition-all font-medium text-lg"
                  placeholder="+91 98765 43210"
                />
              </div>
              <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-[0.3em] text-white/40 ml-6">Primary Skills</label>
                <input 
                  required
                  type="text" 
                  value={formData.skills}
                  onChange={(e) => setFormData({...formData, skills: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-[2rem] py-6 px-8 focus:outline-none focus:border-[#E6FF00]/50 transition-all font-medium text-lg"
                  placeholder="React, Tailwind, Firebase, etc."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-[0.3em] text-white/40 ml-6">Experience (Years)</label>
                <input 
                  required
                  type="text" 
                  value={formData.experience}
                  onChange={(e) => setFormData({...formData, experience: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-[2rem] py-6 px-8 focus:outline-none focus:border-[#E6FF00]/50 transition-all font-medium text-lg"
                  placeholder="e.g. 3 Years"
                />
              </div>
              <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-[0.3em] text-white/40 ml-6">Portfolio Link</label>
                <div className="relative">
                  <Globe className="absolute left-8 top-1/2 -translate-y-1/2 text-white/20" size={20} />
                  <input 
                    required
                    type="url" 
                    value={formData.portfolio}
                    onChange={(e) => setFormData({...formData, portfolio: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-[2rem] py-6 pl-16 pr-8 focus:outline-none focus:border-[#E6FF00]/50 transition-all font-medium text-lg"
                    placeholder="https://yourportfolio.com"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-[0.3em] text-white/40 ml-6">Availability</label>
                <div className="relative">
                  <Clock className="absolute left-8 top-1/2 -translate-y-1/2 text-white/20" size={20} />
                  <select 
                    required
                    value={formData.availability}
                    onChange={(e) => setFormData({...formData, availability: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-[2rem] py-6 pl-16 pr-8 focus:outline-none focus:border-[#E6FF00]/50 transition-all font-black uppercase tracking-widest text-sm appearance-none"
                  >
                    <option value="">Select Availability</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Freelance">Freelance</option>
                  </select>
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-[0.3em] text-white/40 ml-6">Expected Earnings / Project</label>
                <div className="relative">
                  <IndianRupee className="absolute left-8 top-1/2 -translate-y-1/2 text-white/20" size={20} />
                  <input 
                    required
                    type="text" 
                    value={formData.expectedEarnings}
                    onChange={(e) => setFormData({...formData, expectedEarnings: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-[2rem] py-6 pl-16 pr-8 focus:outline-none focus:border-[#E6FF00]/50 transition-all font-medium text-lg"
                    placeholder="e.g. ₹5,000 - ₹10,000"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-black uppercase tracking-[0.3em] text-white/40 ml-6">Why should we hire you?</label>
              <textarea 
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-[2.5rem] py-8 px-10 focus:outline-none focus:border-[#E6FF00]/50 transition-all font-medium text-lg resize-none"
                placeholder="Tell us about your best work..."
              />
            </div>

            <button 
              disabled={loading}
              type="submit"
              className="w-full bg-[#E6FF00] text-black py-8 rounded-[2rem] font-black uppercase italic text-2xl flex items-center justify-center gap-4 hover:scale-[1.02] transition-all shadow-[0_0_50px_rgba(230,255,0,0.2)] disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Application'} <Send size={28} />
            </button>
          </form>
        </motion.div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Briefcase, title: "Global Projects", desc: "Work on diverse projects for clients worldwide." },
            { icon: Clock, title: "Flexible Hours", desc: "Choose your own schedule and work from anywhere." },
            { icon: Code, title: "Modern Stack", desc: "Build with React, Tailwind, and the latest AI tools." }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="bg-white/5 border border-white/10 p-8 rounded-3xl text-center"
            >
              <div className="w-12 h-12 bg-[#E6FF00]/10 rounded-xl flex items-center justify-center text-[#E6FF00] mx-auto mb-6">
                <item.icon size={24} />
              </div>
              <h3 className="text-lg font-black uppercase italic tracking-tighter mb-2">{item.title}</h3>
              <p className="text-white/40 text-sm font-medium italic">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
