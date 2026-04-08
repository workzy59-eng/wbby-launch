import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Send, MessageCircle } from 'lucide-react';
import SEO from '../components/SEO';

export default function Contact() {
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('sending');
    setTimeout(() => setFormStatus('sent'), 1500);
  };

  return (
    <div className="pt-40 pb-20 px-10">
      <SEO title="Contact QUICWEB – Get Your Website Built Today" />
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-6 mb-20">
          <h1 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter">
            Let's Start Your <span className="text-[#E6FF00]">Project.</span>
          </h1>
          <p className="max-w-2xl mx-auto text-white/60 text-lg font-medium leading-relaxed">
            Have a question? Ready to launch? We're here to help you every step of the way.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
          <div className="space-y-12">
            <div className="space-y-8">
              <h2 className="text-4xl font-black uppercase italic tracking-tighter">Get in Touch</h2>
              <p className="text-white/40 leading-relaxed max-w-md">
                Fill out the form or reach out directly via WhatsApp or Email. We typically respond within 2 hours.
              </p>
            </div>

            <div className="space-y-8">
              <div className="flex items-center gap-6 group">
                <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-[#E6FF00] group-hover:bg-[#E6FF00] group-hover:text-black transition-all">
                  <Mail size={24} />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-white/20 mb-1">Email Us</h4>
                  <p className="text-xl font-black uppercase italic tracking-tighter">hello@quicweb.com</p>
                </div>
              </div>

              <div className="flex items-center gap-6 group">
                <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-[#E6FF00] group-hover:bg-[#E6FF00] group-hover:text-black transition-all">
                  <Phone size={24} />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-white/20 mb-1">Call Us</h4>
                  <p className="text-xl font-black uppercase italic tracking-tighter">+91 98765 43210</p>
                </div>
              </div>

              <div className="flex items-center gap-6 group">
                <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-[#E6FF00] group-hover:bg-[#E6FF00] group-hover:text-black transition-all">
                  <MessageCircle size={24} />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-white/20 mb-1">WhatsApp</h4>
                  <p className="text-xl font-black uppercase italic tracking-tighter">Chat Instantly</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-12 rounded-[3rem] backdrop-blur-xl">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">Full Name</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="John Doe" 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white outline-none focus:border-[#E6FF00]/50 transition-all"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">Email Address</label>
                  <input 
                    type="email" 
                    required 
                    placeholder="john@example.com" 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white outline-none focus:border-[#E6FF00]/50 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">Subject</label>
                <select className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white outline-none focus:border-[#E6FF00]/50 transition-all appearance-none">
                  <option className="bg-[#4A5D4E]">General Inquiry</option>
                  <option className="bg-[#4A5D4E]">New Website Project</option>
                  <option className="bg-[#4A5D4E]">Support Request</option>
                  <option className="bg-[#4A5D4E]">Partnership</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">Message</label>
                <textarea 
                  required 
                  rows={5} 
                  placeholder="Tell us about your project..." 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white outline-none focus:border-[#E6FF00]/50 transition-all resize-none"
                />
              </div>

              <button 
                type="submit" 
                disabled={formStatus !== 'idle'}
                className="w-full py-6 bg-[#E6FF00] text-black rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-[0_0_30px_rgba(230,255,0,0.2)] flex items-center justify-center gap-3"
              >
                {formStatus === 'idle' && (
                  <>
                    Send Message
                    <Send size={18} />
                  </>
                )}
                {formStatus === 'sending' && 'Sending...'}
                {formStatus === 'sent' && 'Message Sent!'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
