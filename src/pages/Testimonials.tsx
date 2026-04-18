import React from 'react';
import { motion } from 'motion/react';
import { Star, Quote, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const CATEGORIES = ['All', 'SEO', 'Website', 'Business', 'Tips'];

const ALL_TESTIMONIALS = [
  { 
    id: 1, 
    name: 'Rahul Sharma', 
    role: 'Gym Owner',
    category: 'Website',
    description: 'Got my gym website in 2 days. Super smooth! The design is top-notch and my clients love it. The integration with our booking system was flawless.',
    rating: 5
  },
  { 
    id: 2, 
    name: 'Priya Patel', 
    role: 'Logistics Manager',
    category: 'Business',
    description: 'WebbyLaunch made our logistics portal look professional. The tracking feature is a game changer for our clients. Highly recommend their services.',
    rating: 5
  },
  { 
    id: 3, 
    name: 'Amit Verma', 
    role: 'Car Dealer',
    category: 'SEO',
    description: 'The Auto Speed UI is exactly what I needed for my showroom. Fast, clean, and mobile responsive. It has significantly increased our online inquiries.',
    rating: 5
  },
  { 
    id: 4, 
    name: 'Sneha Reddy', 
    role: 'Boutique Owner',
    category: 'Website',
    description: 'My online boutique took off after WebbyLaunch built my site. The payment integration is flawless and secure. The team was very helpful throughout.',
    rating: 5
  },
  { 
    id: 5, 
    name: 'Vikram Singh', 
    role: 'Real Estate Agent',
    category: 'Tips',
    description: 'Professional and fast. I can now showcase my real estate properties with high-quality galleries that load instantly. Great value for money.',
    rating: 4
  },
  { 
    id: 6, 
    name: 'Ananya Gupta', 
    role: 'Restaurant Owner',
    category: 'Business',
    description: 'The digital menu and reservation system have made my restaurant operations so much easier. Highly recommend WebbyLaunch for any food business.',
    rating: 5
  },
  {
    id: 7,
    name: 'Karan Malhotra',
    role: 'Tech Consultant',
    category: 'SEO',
    description: 'Our organic traffic grew by 200% within 4 months of launching the new site. The SEO structure is brilliant and easy to manage.',
    rating: 5
  },
  {
    id: 8,
    name: 'Meera Deshmukh',
    role: 'Yoga Instructor',
    category: 'Tips',
    description: 'The tips on business growth provided by the team were invaluable. My online classes are now fully booked thanks to the new booking system.',
    rating: 5
  },
  {
    id: 9,
    name: 'Arjun Reddy',
    role: 'E-commerce Founder',
    category: 'Website',
    description: 'The speed of the website is incredible. Our bounce rate dropped significantly, and sales are up by 45%. Best investment for my brand.',
    rating: 5
  }
];

export default function Testimonials() {
  const [activeCategory, setActiveCategory] = React.useState('All');

  const filteredTestimonials = activeCategory === 'All' 
    ? ALL_TESTIMONIALS 
    : ALL_TESTIMONIALS.filter(t => t.category === activeCategory);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-black font-sans text-white py-32 px-10"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-block px-4 py-1 bg-[#c7c42a] text-black rounded-full text-[10px] font-black uppercase tracking-widest italic"
            >
              Success Stories
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic leading-[0.8]"
            >
              Our Clients' <br />
              <span className="text-[#c7c42a]">Growth Journey.</span>
            </motion.h1>
          </div>
          <Link 
            to="/" 
            className="flex items-center gap-2 text-white/40 hover:text-[#c7c42a] transition-colors font-black uppercase text-xs tracking-widest italic"
          >
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-4 mb-16">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeCategory === cat 
                  ? 'bg-[#c7c42a] text-black shadow-[0_0_30px_rgba(199, 196, 42,0.3)]' 
                  : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white border border-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {filteredTestimonials.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="bg-white/5 border border-white/10 p-16 rounded-[4rem] relative group hover:border-[#c7c42a]/30 transition-all overflow-hidden"
            >
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#c7c42a]/5 rounded-full blur-[100px] group-hover:bg-[#c7c42a]/10 transition-all" />
              <Quote className="absolute top-12 right-12 text-[#c7c42a]/10 group-hover:text-[#c7c42a]/20 transition-all" size={80} />
              
              <div className="flex items-center gap-8 mb-10 relative z-10">
                <div>
                  <h4 className="text-3xl font-black uppercase italic tracking-tighter">{t.name}</h4>
                  <p className="text-xs font-black uppercase tracking-widest text-[#c7c42a]">{t.role}</p>
                </div>
              </div>

              <div className="flex gap-1 mb-8 relative z-10">
                {[...Array(5)].map((_, idx) => (
                  <Star 
                    key={idx} 
                    size={18} 
                    className={idx < t.rating ? "text-[#c7c42a] fill-[#c7c42a]" : "text-white/10"} 
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
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#c7c42a] rounded-full blur-[120px] opacity-10 animate-pulse"></div>
          <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter">Ready to be our next success story?</h2>
          <p className="text-white/40 max-w-2xl mx-auto font-medium italic">
            Join 50+ businesses that have transformed their digital presence with WebbyLaunch.
          </p>
          <Link 
            to="/auth" 
            className="inline-flex items-center gap-4 px-12 py-6 bg-[#c7c42a] text-black rounded-2xl font-black uppercase italic text-xl hover:scale-105 transition-all shadow-[0_0_50px_rgba(199, 196, 42,0.2)]"
          >
            Start Your Project
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}
