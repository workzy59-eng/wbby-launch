import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Layout, 
  Type, 
  Palette, 
  Image as ImageIcon, 
  Home, 
  Info, 
  Briefcase, 
  Mail, 
  ArrowRight, 
  Globe, 
  Smartphone, 
  Monitor, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  Check,
  Upload,
  MousePointer2,
  Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PREVIEW_PAGES = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'about', label: 'About Us', icon: Info },
  { id: 'services', label: 'Services', icon: Briefcase },
  { id: 'contact', label: 'Contact', icon: Mail },
];

export default function PreviewBuilder() {
  const navigate = useNavigate();
  const [businessName, setBusinessName] = useState('Your Business');
  const [primaryColor, setPrimaryColor] = useState('#c7c42a');
  const [secondaryColor, setSecondaryColor] = useState('#000000');
  const [logo, setLogo] = useState<string | null>(null);
  const [activePage, setActivePage] = useState('home');
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBuildWebsite = () => {
    // Save data logic here (e.g., to context or local storage)
    navigate('/onboarding');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans selection:bg-[#c7c42a] selection:text-black flex flex-col lg:flex-row overflow-hidden">
      {/* Left Panel: Controls */}
      <div className="w-full lg:w-[400px] border-r border-white/10 bg-black/40 backdrop-blur-xl flex flex-col h-screen overflow-y-auto">
        <div className="p-8 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#c7c42a] rounded-xl flex items-center justify-center text-black shadow-[0_0_20px_rgba(199, 196, 42,0.3)]">
              <Activity size={24} />
            </div>
            <h1 className="text-xl font-black uppercase italic tracking-tighter">Preview <span className="text-[#c7c42a]">Builder</span></h1>
          </div>
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded-lg transition-all">
            <ChevronLeft size={20} />
          </button>
        </div>

        <div className="p-8 space-y-10">
          {/* Business Name */}
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
              <Type size={12} /> Business Name
            </label>
            <input 
              type="text" 
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Enter business name..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold focus:border-[#c7c42a]/50 outline-none transition-all"
            />
          </div>

          {/* Logo Upload */}
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
              <ImageIcon size={12} /> Brand Logo
            </label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-video bg-white/5 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-[#c7c42a]/30 transition-all group overflow-hidden relative"
            >
              {logo ? (
                <img src={logo} alt="Logo" className="w-full h-full object-contain p-4" />
              ) : (
                <>
                  <Upload className="text-white/20 group-hover:text-[#c7c42a] transition-colors" size={32} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Upload PNG/SVG</span>
                </>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleLogoUpload} 
                className="hidden" 
                accept="image/*" 
              />
            </div>
          </div>

          {/* Color Pickers */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                <Palette size={12} /> Primary
              </label>
              <div className="relative group">
                <input 
                  type="color" 
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl cursor-pointer p-1"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-[10px] font-black uppercase tracking-widest mix-blend-difference">{primaryColor}</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                <Palette size={12} /> Secondary
              </label>
              <div className="relative group">
                <input 
                  type="color" 
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl cursor-pointer p-1"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-[10px] font-black uppercase tracking-widest mix-blend-difference">{secondaryColor}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
              <Layout size={12} /> Preview Page
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PREVIEW_PAGES.map((page) => (
                <button
                  key={page.id}
                  onClick={() => setActivePage(page.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    activePage === page.id 
                      ? 'bg-[#c7c42a] text-black shadow-[0_0_20px_rgba(199, 196, 42,0.2)]' 
                      : 'bg-white/5 text-white/40 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <page.icon size={14} />
                  {page.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-auto p-8 border-t border-white/10 bg-black/60">
          <button 
            onClick={handleBuildWebsite}
            className="w-full py-6 bg-[#c7c42a] text-black rounded-2xl font-black uppercase italic text-xl hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_40px_rgba(199, 196, 42,0.3)] flex items-center justify-center gap-4 group"
          >
            Build This Site <Sparkles size={24} className="group-hover:rotate-12 transition-transform" />
          </button>
        </div>
      </div>

      {/* Right Panel: Live Preview */}
      <div className="flex-1 bg-[#111] p-6 lg:p-12 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#c7c42a]/5 rounded-full blur-[150px] pointer-events-none" />

        {/* View Mode Switcher */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/40 backdrop-blur-xl border border-white/10 p-1.5 rounded-2xl z-50">
          <button 
            onClick={() => setViewMode('desktop')}
            className={`p-3 rounded-xl transition-all ${viewMode === 'desktop' ? 'bg-[#c7c42a] text-black shadow-lg' : 'text-white/40 hover:text-white'}`}
          >
            <Monitor size={18} />
          </button>
          <button 
            onClick={() => setViewMode('mobile')}
            className={`p-3 rounded-xl transition-all ${viewMode === 'mobile' ? 'bg-[#c7c42a] text-black shadow-lg' : 'text-white/40 hover:text-white'}`}
          >
            <Smartphone size={18} />
          </button>
        </div>

        {/* Browser Frame */}
        <motion.div 
          layout
          className={`relative bg-white rounded-3xl shadow-[0_50px_100px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-700 ${
            viewMode === 'desktop' ? 'w-full max-w-5xl aspect-video' : 'w-[375px] h-[667px]'
          }`}
        >
          {/* Browser Header */}
          <div className="h-10 bg-[#F5F5F5] border-b border-black/5 flex items-center px-4 gap-4">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
            </div>
            <div className="flex-1 bg-white rounded-md h-6 flex items-center px-3 gap-2 border border-black/5">
              <Globe size={10} className="text-black/20" />
              <span className="text-[8px] font-medium text-black/40 tracking-tight">https://{businessName.toLowerCase().replace(/\s+/g, '-')}.com</span>
            </div>
          </div>

          {/* Website Content */}
          <div className="h-[calc(100%-2.5rem)] overflow-y-auto bg-white text-black font-sans">
            <AnimatePresence mode="wait">
              <motion.div
                key={activePage}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="h-full"
              >
                {/* Navbar */}
                <nav className="px-8 py-6 flex items-center justify-between border-b border-black/5 sticky top-0 bg-white/80 backdrop-blur-md z-50">
                  <div className="flex items-center gap-3">
                    {logo ? (
                      <img src={logo} alt="Logo" className="h-8 w-auto object-contain" />
                    ) : (
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black italic text-sm" style={{ backgroundColor: primaryColor }}>
                        {businessName.charAt(0)}
                      </div>
                    )}
                    <span className="font-black uppercase italic tracking-tighter text-lg">{businessName}</span>
                  </div>
                  <div className="hidden md:flex items-center gap-8 text-[10px] font-black uppercase tracking-widest text-black/40">
                    {PREVIEW_PAGES.map(p => (
                      <span key={p.id} className={`cursor-pointer hover:text-black transition-colors ${activePage === p.id ? 'text-black' : ''}`}>{p.label}</span>
                    ))}
                  </div>
                </nav>

                {/* Page Content */}
                <div className="p-8 md:p-16">
                  {activePage === 'home' && (
                    <div className="space-y-20">
                      <div className="text-center space-y-8 max-w-3xl mx-auto">
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-[0.9]">
                          Welcome to <br />
                          <span style={{ color: primaryColor }}>{businessName}</span>
                        </h1>
                        <p className="text-black/60 text-lg font-medium italic leading-relaxed">
                          We provide premium solutions tailored to your business needs. Experience excellence with {businessName}.
                        </p>
                        <button 
                          className="px-10 py-5 rounded-2xl text-white font-black uppercase italic text-xl shadow-xl hover:scale-105 transition-all"
                          style={{ 
                            background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                            boxShadow: `0 20px 40px ${primaryColor}33`
                          }}
                        >
                          Get Started Today
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="p-8 rounded-3xl border border-black/5 bg-[#F9F9F9] space-y-4 group hover:scale-[1.02] transition-all">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white" style={{ backgroundColor: primaryColor }}>
                              <Activity size={24} />
                            </div>
                            <h3 className="text-xl font-black uppercase italic tracking-tighter">Feature {i}</h3>
                            <p className="text-black/40 text-sm italic">High-performance solutions designed for your growth.</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activePage === 'about' && (
                    <div className="space-y-16">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                          <h2 className="text-5xl font-black tracking-tighter uppercase italic leading-tight">
                            About <br />
                            <span style={{ color: primaryColor }}>{businessName}</span>
                          </h2>
                          <p className="text-black/60 text-lg font-medium italic leading-relaxed">
                            Founded with a vision to revolutionize the industry, {businessName} has been at the forefront of innovation since day one. We believe in quality, integrity, and client success.
                          </p>
                          <div className="flex items-center gap-6">
                            <div className="text-center">
                              <div className="text-4xl font-black italic" style={{ color: primaryColor }}>10+</div>
                              <div className="text-[10px] font-black uppercase tracking-widest text-black/40">Years Exp</div>
                            </div>
                            <div className="text-center">
                              <div className="text-4xl font-black italic" style={{ color: primaryColor }}>500+</div>
                              <div className="text-[10px] font-black uppercase tracking-widest text-black/40">Clients</div>
                            </div>
                          </div>
                        </div>
                        <div className="aspect-square rounded-[3rem] bg-black/5 flex items-center justify-center relative overflow-hidden">
                          <div className="absolute inset-0 opacity-20" style={{ backgroundColor: primaryColor }} />
                          <Sparkles size={80} className="text-black/10" />
                        </div>
                      </div>
                    </div>
                  )}

                  {activePage === 'services' && (
                    <div className="space-y-16">
                      <div className="text-center space-y-4">
                        <h2 className="text-5xl font-black tracking-tighter uppercase italic">Our Services</h2>
                        <p className="text-black/40 font-medium italic">Tailored solutions for every business challenge.</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                          { title: 'Strategy', desc: 'Expert planning for your long-term success.' },
                          { title: 'Design', desc: 'Beautiful interfaces that convert users.' },
                          { title: 'Growth', desc: 'Scalable solutions for modern businesses.' },
                          { title: 'Support', desc: '24/7 dedicated assistance for your team.' },
                          { title: 'Analytics', desc: 'Data-driven insights to power decisions.' },
                          { title: 'Security', desc: 'Enterprise-grade protection for your data.' },
                        ].map((s, i) => (
                          <div 
                            key={i} 
                            className="p-10 rounded-[2.5rem] bg-white border border-black/5 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden"
                          >
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.03] transition-opacity" style={{ backgroundColor: primaryColor }} />
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-8 group-hover:scale-110 transition-transform" style={{ backgroundColor: primaryColor }}>
                              <Activity size={28} />
                            </div>
                            <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-4 group-hover:translate-x-2 transition-transform">{s.title}</h3>
                            <p className="text-black/40 text-sm italic leading-relaxed">{s.desc}</p>
                            <div className="mt-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all" style={{ color: primaryColor }}>
                              Learn More <ArrowRight size={14} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activePage === 'contact' && (
                    <div className="max-w-4xl mx-auto space-y-16">
                      <div className="text-center space-y-4">
                        <h2 className="text-5xl font-black tracking-tighter uppercase italic">Get In Touch</h2>
                        <p className="text-black/40 font-medium italic">We'd love to hear from you. Send us a message.</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-8">
                          <div className="p-8 rounded-3xl bg-[#F9F9F9] border border-black/5 space-y-6">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: primaryColor }}>
                                <Mail size={20} />
                              </div>
                              <div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-black/40">Email Us</div>
                                <div className="font-bold">hello@{businessName.toLowerCase().replace(/\s+/g, '')}.com</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: primaryColor }}>
                                <Globe size={20} />
                              </div>
                              <div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-black/40">Office</div>
                                <div className="font-bold">123 Business Ave, Tech City</div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                          <input 
                            type="text" 
                            placeholder="Your Name" 
                            className="w-full bg-[#F9F9F9] border border-black/5 rounded-2xl px-6 py-4 text-sm outline-none focus:border-black/20 transition-all"
                          />
                          <input 
                            type="email" 
                            placeholder="Email Address" 
                            className="w-full bg-[#F9F9F9] border border-black/5 rounded-2xl px-6 py-4 text-sm outline-none focus:border-black/20 transition-all"
                          />
                          <textarea 
                            placeholder="Your Message" 
                            rows={4}
                            className="w-full bg-[#F9F9F9] border border-black/5 rounded-2xl px-6 py-4 text-sm outline-none focus:border-black/20 transition-all resize-none"
                          />
                          <button 
                            className="w-full py-5 rounded-2xl text-white font-black uppercase italic text-lg shadow-lg hover:scale-[1.02] transition-all"
                            style={{ backgroundColor: primaryColor }}
                          >
                            Send Message
                          </button>
                        </form>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <footer className="mt-20 border-t border-black/5 px-8 py-12 bg-[#F9F9F9]">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-3">
                      <span className="font-black uppercase italic tracking-tighter text-lg">{businessName}</span>
                    </div>
                    <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-black/40">
                      <span>Privacy</span>
                      <span>Terms</span>
                      <span>Cookies</span>
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-black/20">
                      © 2024 {businessName}. All rights reserved.
                    </div>
                  </div>
                </footer>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Sticky CTA Overlay */}
        <div className="absolute bottom-12 right-12 z-[100]">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBuildWebsite}
            className="flex items-center gap-4 px-8 py-4 bg-[#c7c42a] text-black rounded-full font-black text-sm uppercase italic shadow-[0_20px_40px_rgba(199, 196, 42,0.3)] border-4 border-black group"
          >
            Build This Website for Me <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
