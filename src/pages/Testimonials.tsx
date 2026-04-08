import React from 'react';
import { motion } from 'motion/react';
import { Star, Quote, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const ALL_TESTIMONIALS = [
  { 
    id: 1, 
    name: 'Rahul Sharma', 
    role: 'Gym Owner',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop', 
    description: 'Got my gym website in 2 days. Super smooth! The design is top-notch and my clients love it. The integration with our booking system was flawless.',
    rating: 5
  },
  { 
    id: 2, 
    name: 'Priya Patel', 
    role: 'Logistics Manager',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop', 
    description: 'WebbyLaunch made our logistics portal look professional. The tracking feature is a game changer for our clients. Highly recommend their services.',
    rating: 5
  },
  { 
    id: 3, 
    name: 'Amit Verma', 
    role: 'Car Dealer',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop', 
    description: 'The Auto Speed UI is exactly what I needed for my showroom. Fast, clean, and mobile responsive. It has significantly increased our online inquiries.',
    rating: 5
  },
  { 
    id: 4, 
    name: 'Sneha Reddy', 
    role: 'Boutique Owner',
    avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=200&auto=format&fit=crop', 
    description: 'My online boutique took off after WebbyLaunch built my site. The payment integration is flawless and secure. The team was very helpful throughout.',
    rating: 5
  },
  { 
    id: 5, 
    name: 'Vikram Singh', 
    role: 'Real Estate Agent',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop', 
    description: 'Professional and fast. I can now showcase my real estate properties with high-quality galleries that load instantly. Great value for money.',
    rating: 4
  },
  { 
    id: 6, 
    name: 'Ananya Gupta', 
    role: 'Restaurant Owner',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop', 
    description: 'The digital menu and reservation system have made my restaurant operations so much easier. Highly recommend WebbyLaunch for any food business.',
    rating: 5
  }
];

export default function Testimonials() {
  return (
    <div className="min-h-screen bg-[#4A5D4E] font-sans text-white py-32 px-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-block px-4 py-1 bg-[#E6FF00] text-black rounded-full text-[10px] font-black uppercase tracking-widest italic"
            >
              Success Stories
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic leading-[0.8]"
            >
              What Our <br />
              <span className="text-[#E6FF00]">Clients Say.</span>
            </motion.h1>
          </div>
          <Link 
            to="/" 
            className="flex items-center gap-2 text-white/40 hover:text-[#E6FF00] transition-colors font-black uppercase text-xs tracking-widest italic"
          >
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {ALL_TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="bg-white/5 border border-white/10 p-16 rounded-[4rem] relative group hover:border-[#E6FF00]/30 transition-all overflow-hidden"
            >
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#E6FF00]/5 rounded-full blur-[100px] group-hover:bg-[#E6FF00]/10 transition-all" />
              <Quote className="absolute top-12 right-12 text-[#E6FF00]/10 group-hover:text-[#E6FF00]/20 transition-all" size={80} />
              
              <div className="flex items-center gap-8 mb-10 relative z-10">
                <img 
                  src={t.avatar} 
                  alt={t.name} 
                  className="w-24 h-24 rounded-3xl object-cover border-2 border-[#E6FF00]/20 group-hover:border-[#E6FF00]/50 transition-all"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="text-3xl font-black uppercase italic tracking-tighter">{t.name}</h4>
                  <p className="text-xs font-black uppercase tracking-widest text-[#E6FF00]">{t.role}</p>
                </div>
              </div>

              <div className="flex gap-1 mb-8 relative z-10">
                {[...Array(5)].map((_, idx) => (
                  <Star 
                    key={idx} 
                    size={18} 
                    className={idx < t.rating ? "text-[#E6FF00] fill-[#E6FF00]" : "text-white/10"} 
                  />
                ))}
              </div>

              <p className="text-2xl text-white/70 font-medium leading-relaxed italic relative z-10">
                "{t.description}"
              </p>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-32 p-16 bg-white/5 border border-white/10 rounded-[4rem] text-center space-y-8 relative overflow-hidden"
        >
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#E6FF00] rounded-full blur-[120px] opacity-10 animate-pulse"></div>
          <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter">Ready to be our next success story?</h2>
          <p className="text-white/40 max-w-2xl mx-auto font-medium italic">
            Join 50+ businesses that have transformed their digital presence with WebbyLaunch.
          </p>
          <Link 
            to="/auth" 
            className="inline-flex items-center gap-4 px-12 py-6 bg-[#E6FF00] text-black rounded-2xl font-black uppercase italic text-xl hover:scale-105 transition-all shadow-[0_0_50px_rgba(230,255,0,0.2)]"
          >
            Start Your Project
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
