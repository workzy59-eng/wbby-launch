import React from 'react';
import { motion } from 'motion/react';
import { TestimonialCarousel, type Testimonial } from '@/components/ui/testimonial';
import { Loader } from '@/components/ui/loader';
import NavHeader from '@/components/ui/nav-header';
import { Sparkles, Code, Layout, Smartphone } from 'lucide-react';

const TESTIMONIAL_DATA: Testimonial[] = [
  {
    id: 1,
    name: "Sai Roshan",
    description: "WebbyLaunch transformed our digital presence. The speed and quality of their work is unmatched in the industry."
  },
  {
    id: 2,
    name: "Ananya Sharma",
    description: "The admin panel they built for us is a game-changer. Clean, intuitive, and incredibly powerful. Highly recommended!"
  },
  {
    id: 3,
    name: "Vikram Singh",
    description: "Exceptional design sense. They understood our brand vision perfectly and delivered a website that truly stands out."
  },
  {
    id: 4,
    name: "Sneha Reddy",
    description: "My online boutique took off after WebbyLaunch built my site. The payment integration is flawless and secure."
  },
  {
    id: 5,
    name: "Rajesh Kumar",
    description: "Clean, professional, and exactly what I needed for my legal consultancy firm. The appointment booking feature is great."
  }
];

export default function ComponentShowcase() {
  return (
    <div className="min-h-screen bg-black font-sans text-white selection:bg-[#FACC15] selection:text-black p-10 lg:p-20 overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-32">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FACC15]/10 border border-[#FACC15]/20 text-[#FACC15] text-[10px] font-black uppercase tracking-[0.3em] italic">
            <Sparkles size={14} />
            New Components Integrated
          </div>
          <h1 className="text-7xl lg:text-9xl font-black tracking-tighter uppercase italic leading-none">
            UI <span className="text-[#FACC15]">REFINEMENT</span>
          </h1>
          <p className="max-w-2xl mx-auto text-white/40 font-medium italic text-lg lg:text-xl">
            Integrating high-performance React components with custom theme styling for WebbyLaunch.
          </p>
        </motion.div>

        {/* Nav Header Showcase */}
        <section className="space-y-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FACC15]/10 flex items-center justify-center text-[#FACC15]">
              <Layout size={24} />
            </div>
            <h2 className="text-4xl font-black uppercase italic tracking-tighter">Navigation Menu</h2>
          </div>
          <div className="p-20 bg-black/20 rounded-[3rem] border border-white/5 flex items-center justify-center">
            <NavHeader />
          </div>
        </section>

        {/* Testimonials Showcase */}
        <section className="space-y-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FACC15]/10 flex items-center justify-center text-[#FACC15]">
              <Code size={24} />
            </div>
            <h2 className="text-4xl font-black uppercase italic tracking-tighter">Testimonial Carousel</h2>
          </div>
          <div className="p-10 lg:p-20 bg-black/20 rounded-[3rem] border border-white/5">
            <TestimonialCarousel testimonials={TESTIMONIAL_DATA} />
          </div>
        </section>

        {/* Loader Showcase */}
        <section className="space-y-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FACC15]/10 flex items-center justify-center text-[#FACC15]">
              <Smartphone size={24} />
            </div>
            <h2 className="text-4xl font-black uppercase italic tracking-tighter">System Loaders</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[16, 24, 32, 48].map((size) => (
              <div key={size} className="p-12 bg-white/5 rounded-[2.5rem] border border-white/10 flex flex-col items-center justify-center gap-6 group hover:border-[#FACC15]/30 transition-all">
                <Loader size={size} />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/30 italic group-hover:text-[#FACC15]">Size {size}px</span>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-20 border-t border-white/10 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 italic">
            &copy; 2026 WebbyLaunch | Built for Performance
          </p>
        </footer>
      </div>
    </div>
  );
}
