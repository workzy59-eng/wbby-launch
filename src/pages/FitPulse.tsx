import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Play, Users, Dumbbell, Timer, Trophy, ArrowLeft } from 'lucide-react';

export default function FitPulse() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans selection:bg-[#E6FF00] selection:text-black">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-xl border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/dashboard" className="flex items-center gap-2 text-white/60 hover:text-[#E6FF00] transition-all group">
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-black uppercase tracking-widest">Back to WebbyLaunch</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#E6FF00] rounded-lg flex items-center justify-center">
              <Dumbbell size={18} className="text-black" />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase italic">FitPulse</span>
          </div>
          <button className="bg-[#E6FF00] text-black px-6 py-2 rounded-full font-bold text-xs uppercase tracking-widest hover:scale-105 transition-all">
            Join Now
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop" 
            alt="Gym Hero" 
            className="w-full h-full object-cover opacity-40 grayscale"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-[#E6FF00] animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/60">Portfolio / Gym & Fitness</span>
            </div>
            <h1 className="text-7xl md:text-9xl font-black tracking-tighter uppercase italic leading-[0.85]">
              Push your<br />
              <span className="text-[#E6FF00]">limits</span>
            </h1>
            <p className="max-w-xl mx-auto text-lg text-white/60 font-medium leading-relaxed">
              Experience the next generation of fitness. High-intensity training, expert coaching, and a community that drives results.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
              <button className="group bg-[#E6FF00] text-black px-10 py-5 rounded-2xl font-black text-xl uppercase italic flex items-center gap-3 hover:scale-105 transition-all shadow-[0_0_30px_rgba(230,255,0,0.2)]">
                Start Training
                <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="flex items-center gap-4 text-white hover:text-[#E6FF00] transition-all group">
                <div className="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center group-hover:border-[#E6FF00] transition-all">
                  <Play size={20} fill="currentColor" />
                </div>
                <span className="font-black uppercase italic tracking-widest text-sm">Watch Story</span>
              </button>
            </div>
          </motion.div>
        </div>

        {/* Floating Stats */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-full max-w-7xl px-6 hidden lg:grid grid-cols-3 gap-8">
          {[
            { label: 'Active Members', value: '12K+', icon: Users },
            { label: 'Expert Coaches', value: '45+', icon: Trophy },
            { label: 'Training Programs', value: '150+', icon: Timer },
          ].map((stat, i) => (
            <div key={i} className="bg-white/5 backdrop-blur-xl p-8 rounded-[2rem] border border-white/10 flex items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-[#E6FF00]/10 flex items-center justify-center text-[#E6FF00]">
                <stat.icon size={28} />
              </div>
              <div>
                <div className="text-3xl font-black italic">{stat.value}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-white/40">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-20">
          <div className="space-y-4">
            <span className="text-[10px] font-bold text-[#E6FF00] uppercase tracking-[0.4em]">Our Programs</span>
            <h2 className="text-6xl font-black tracking-tighter uppercase italic">Transform your body</h2>
          </div>
          <p className="max-w-md text-white/40 font-medium">
            Choose from a wide range of specialized training programs designed to help you reach your specific fitness goals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: 'Strength Training', desc: 'Build muscle and increase power with our heavy lifting programs.', img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800' },
            { title: 'Cardio Blast', desc: 'Improve endurance and burn fat with high-intensity interval training.', img: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=800' },
            { title: 'Yoga & Mobility', desc: 'Enhance flexibility and find balance with our guided yoga sessions.', img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800' },
          ].map((program, i) => (
            <div key={i} className="group relative aspect-[4/5] rounded-[3rem] overflow-hidden border border-white/10">
              <img 
                src={program.img} 
                alt={program.title} 
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
              <div className="absolute bottom-0 left-0 right-0 p-10 space-y-4">
                <h3 className="text-3xl font-black uppercase italic tracking-tight">{program.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                  {program.desc}
                </p>
                <button className="flex items-center gap-2 text-[#E6FF00] font-bold uppercase italic text-xs tracking-widest pt-4">
                  Learn More <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Membership Section */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="bg-[#111] rounded-[4rem] p-12 md:p-24 border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#E6FF00]/5 rounded-full blur-[120px] -z-10" />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-10">
              <div className="space-y-4">
                <span className="text-[10px] font-bold text-[#E6FF00] uppercase tracking-[0.4em]">Membership</span>
                <h2 className="text-6xl font-black tracking-tighter uppercase italic">Ready to join the elite?</h2>
              </div>
              <div className="space-y-6">
                {[
                  'Unlimited access to all gym locations',
                  'Personalized nutrition and workout plans',
                  'Complimentary fitness assessment',
                  'Exclusive member-only events',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-6 h-6 rounded-full bg-[#E6FF00] flex items-center justify-center text-black">
                      <CheckCircle2 size={14} />
                    </div>
                    <span className="text-lg font-bold text-white/80">{item}</span>
                  </div>
                ))}
              </div>
              <button className="bg-[#E6FF00] text-black px-12 py-6 rounded-2xl font-black text-xl uppercase italic hover:scale-105 transition-all shadow-[0_0_40px_rgba(230,255,0,0.15)]">
                Get Started Now
              </button>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-[3rem] overflow-hidden border border-white/10 rotate-3 hover:rotate-0 transition-all duration-700">
                <img 
                  src="https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=2070&auto=format&fit=crop" 
                  alt="Gym Interior" 
                  className="w-full h-full object-cover grayscale"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-10 -left-10 bg-[#E6FF00] text-black p-10 rounded-[2rem] shadow-2xl -rotate-6">
                <div className="text-5xl font-black italic tracking-tighter">₹1999</div>
                <div className="text-[10px] font-bold uppercase tracking-widest opacity-60">Starting per month</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#E6FF00] rounded-xl flex items-center justify-center">
              <Dumbbell size={24} className="text-black" />
            </div>
            <span className="text-2xl font-black tracking-tighter uppercase italic">FitPulse</span>
          </div>
          <div className="flex gap-12 text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">
            <a href="#" className="hover:text-[#E6FF00] transition-all">Instagram</a>
            <a href="#" className="hover:text-[#E6FF00] transition-all">Twitter</a>
            <a href="#" className="hover:text-[#E6FF00] transition-all">YouTube</a>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/20">
            © 2026 FitPulse. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
