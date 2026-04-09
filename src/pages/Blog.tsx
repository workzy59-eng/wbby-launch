import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Clock, ChevronRight } from 'lucide-react';
import SEO from '../components/SEO';

export default function Blog() {
  return (
    <div className="min-h-screen bg-[#0B141A] text-[#E9EDEF] font-sans">
      <SEO 
        title="Blog | Why Mobile-First Design Matters in 2026 – QUICWEB"
        description="Explore why mobile-first design is the standard for business success in 2026. Learn about SEO, speed, and user experience."
        canonical="https://ais-pre-cxnuohxnxotikhimmakonv-628570041945.asia-southeast1.run.app/blog"
      />
      {/* SEO Optimized Header */}
      <header className="border-b border-white/5 bg-[#202C33]/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-[#00A884] font-bold hover:opacity-80 transition-opacity">
            <ArrowLeft size={20} />
            <span>Back to Home</span>
          </Link>
          <div className="text-xs font-black uppercase tracking-widest text-white/40">
            QUICWEB Blog
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <article>
          {/* H1: Primary Title (Crucial for SEO) */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-black tracking-tighter mb-8 italic uppercase"
          >
            Why Mobile-First Design Matters in 2026
          </motion.h1>

          <div className="flex flex-wrap items-center gap-6 mb-12 text-[#8696A0] text-sm font-bold uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-[#00A884]" />
              <span>April 9, 2026</span>
            </div>
            <div className="flex items-center gap-2">
              <User size={16} className="text-[#00A884]" />
              <span>By SEO Expert</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-[#00A884]" />
              <span>5 Min Read</span>
            </div>
          </div>

          {/* Featured Image with Alt Text */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="rounded-[3rem] overflow-hidden mb-16 border border-white/10 shadow-2xl"
          >
            <img 
              src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=1200&h=600" 
              alt="Mobile-first web design concept showing a smartphone with a modern interface" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </motion.div>

          <div className="prose prose-invert max-w-none space-y-8 text-lg leading-relaxed text-[#8696A0]">
            <p className="text-xl text-[#E9EDEF] font-medium italic">
              In the rapidly evolving digital landscape of 2026, the way users interact with the web has shifted fundamentally. Mobile devices are no longer just an alternative; they are the primary gateway to the internet.
            </p>

            {/* H2: Secondary Heading */}
            <h2 className="text-3xl font-black text-white uppercase tracking-tight italic pt-8 border-t border-white/5">
              The Shift to Mobile Dominance
            </h2>
            <p>
              Statistically, over 85% of global web traffic now originates from mobile devices. Google's mobile-first indexing is no longer a suggestion—it's the absolute standard. If your website isn't optimized for the palm of a hand, it effectively doesn't exist in search results.
            </p>

            {/* H3: Tertiary Heading */}
            <h3 className="text-xl font-bold text-[#00A884] uppercase tracking-widest">
              Speed and Core Web Vitals
            </h3>
            <p>
              Speed is the new currency of SEO. Mobile users expect instant gratification. At <Link to="/" className="text-[#00A884] underline decoration-2 underline-offset-4 hover:text-white transition-colors">QUICWEB</Link>, we prioritize performance metrics that directly impact your Google ranking.
            </p>

            <div className="bg-[#202C33] p-8 rounded-[2rem] border border-white/5 my-12">
              <h4 className="text-[#E9EDEF] font-black uppercase italic mb-4">Key Takeaways:</h4>
              <ul className="space-y-4 list-none p-0">
                {[
                  "Responsive layouts are mandatory for indexing.",
                  "Touch-friendly interfaces reduce bounce rates.",
                  "Fast loading times improve user retention.",
                  "Mobile-first design boosts local SEO visibility."
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-[#00A884] rounded-full" />
                    <span className="font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <h2 className="text-3xl font-black text-white uppercase tracking-tight italic pt-8 border-t border-white/5">
              Internal Linking Strategy
            </h2>
            <p>
              A robust internal linking structure helps search engines understand the hierarchy and relationship between your pages. For instance, our <Link to="/dashboard" className="text-[#00A884] hover:underline">Client Dashboard</Link> provides real-time insights into how mobile optimization affects conversion rates.
            </p>

            <p>
              By connecting your blog posts to your service pages, you create a "web" of relevance that Google rewards with higher authority.
            </p>
          </div>

          {/* Internal Linking / CTA */}
          <div className="mt-20 p-12 bg-gradient-to-br from-[#00A884]/20 to-transparent rounded-[3rem] border border-[#00A884]/20 text-center">
            <h2 className="text-4xl font-black text-white uppercase italic mb-6 tracking-tighter">Ready to Rank Higher?</h2>
            <p className="text-[#8696A0] mb-10 max-w-xl mx-auto font-bold uppercase tracking-widest text-sm">
              Get a premium, mobile-first website that is built for speed and optimized for Google indexing.
            </p>
            <Link 
              to="/" 
              className="inline-flex items-center gap-3 bg-[#00A884] text-[#0B141A] px-10 py-5 rounded-full font-black text-xl uppercase italic hover:scale-105 transition-all shadow-[0_0_30px_rgba(0,168,132,0.3)]"
            >
              <span>Get Started Now</span>
              <ChevronRight size={24} />
            </Link>
          </div>
        </article>
      </main>

      <footer className="py-12 border-t border-white/5 text-center">
        <p className="text-[#8696A0] text-xs font-black uppercase tracking-[0.3em]">
          &copy; 2026 QUICWEB. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
}
