import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { MapPin, ArrowRight, CheckCircle2, Zap, Smartphone, Search } from 'lucide-react';
import SEO from '../components/SEO';

export default function LocationPage() {
  const { city } = useParams<{ city: string }>();
  const cityName = city ? city.charAt(0).toUpperCase() + city.slice(1) : '';

  const features = [
    { icon: Zap, title: 'Fast Delivery', desc: 'Get your site in 52 hours.' },
    { icon: Smartphone, title: 'Responsive', desc: 'Perfect on every device.' },
    { icon: Search, title: 'SEO Ready', desc: 'Rank higher on Google.' }
  ];

  return (
    <div className="bg-black min-h-screen">
      <SEO 
        title={`Web Development Services in ${cityName} | Webby Launch`}
        description={`Looking for professional web development in ${cityName}? Webby Launch builds fast, SEO-friendly, and mobile-responsive websites for startups and small businesses in ${cityName}.`}
        keywords={`web development ${city}, website designer ${city}, SEO services ${city}, affordable web design ${city}`}
      />

      <section className="relative pt-40 pb-20 px-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#c7c42a]/10 rounded-full blur-[120px] animate-pulse" />
        
        <div className="max-w-7xl mx-auto relative z-10 text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-6 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-[#c7c42a]"
          >
            <MapPin size={12} />
            Serving {cityName}
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic leading-none text-white"
          >
            Web Development <br />
            <span className="text-[#c7c42a]">in {cityName}.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-white/60 max-w-2xl mx-auto font-medium italic"
          >
            Empowering startups and small businesses in {cityName} with high-performance, SEO-optimized websites that convert visitors into clients.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center"
          >
            <Link 
              to="/auth"
              className="group bg-[#c7c42a] text-black px-10 py-5 rounded-2xl text-sm font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_50px_rgba(199,196,42,0.3)] flex items-center gap-3"
            >
              Start Your Project
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="py-32 px-10 bg-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <div key={i} className="bg-black/40 border border-white/10 p-12 rounded-[3rem] space-y-6 hover:border-[#c7c42a]/30 transition-all">
              <div className="w-16 h-16 bg-[#c7c42a]/10 rounded-2xl flex items-center justify-center text-[#c7c42a]">
                <f.icon size={32} />
              </div>
              <h3 className="text-2xl font-black uppercase italic tracking-tighter">{f.title}</h3>
              <p className="text-white/40 text-sm font-medium italic leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-32 px-10">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic">
            Why {cityName} Businesses <br />
            <span className="text-[#c7c42a]">Choose Webby Launch.</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
            {[
              'Local SEO Optimization',
              'Mobile-First Design',
              'Fast 52-Hour Delivery',
              'Affordable Monthly Plans',
              'Google Search Console Setup',
              'Secure HTTPS Hosting'
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-4 text-white/60 font-bold uppercase tracking-widest text-xs">
                <CheckCircle2 size={18} className="text-[#c7c42a]" />
                {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-10 bg-[#c7c42a]">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-black uppercase italic leading-none">
            Ready to grow your <br /> business in {cityName}?
          </h2>
          <a 
            href={`https://mail.google.com/mail/?view=cm&fs=1&to=workzy59@gmail.com`}
            target="_blank"
            rel="noreferrer"
            className="inline-block bg-black text-white px-12 py-6 rounded-2xl font-black uppercase italic tracking-widest hover:scale-105 transition-all shadow-2xl"
          >
            Email Us Today
          </a>
        </div>
      </section>
    </div>
  );
}
