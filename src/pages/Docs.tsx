import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Book, 
  ChevronRight, 
  Search, 
  Rocket, 
  Settings, 
  User, 
  Code, 
  TrendingUp, 
  CreditCard, 
  HelpCircle, 
  Mail,
  ArrowRight
} from 'lucide-react';
import SEO from '../components/SEO';

const DOCS_CONTENT = {
  'getting-started': {
    title: 'Getting Started',
    icon: Rocket,
    sections: [
      {
        subtitle: 'What is WebbyLaunch?',
        content: 'WebbyLaunch is a premium web development platform designed specifically for startups and small businesses. We provide high-performance, mobile-first websites with a focus on speed, SEO, and conversion.'
      },
      {
        subtitle: 'Platform Overview',
        content: 'Our platform connects clients with professional developers and sales experts. We handle the entire lifecycle of a project, from onboarding and payment to development and final delivery.'
      }
    ]
  },
  'how-it-works': {
    title: 'How It Works',
    icon: Settings,
    sections: [
      {
        subtitle: 'The Process',
        content: '1. Client selects a plan and completes onboarding.\n2. Payment is secured through our platform.\n3. A dedicated developer is assigned to the project.\n4. Real-time collaboration via our built-in chat system.\n5. Project delivery within 52 hours for standard plans.'
      }
    ]
  },
  'for-clients': {
    title: 'For Clients',
    icon: User,
    sections: [
      {
        subtitle: 'Purchasing Plans',
        content: 'Browse our pricing page to select a plan that fits your business needs. We offer transparent, one-time payment models for high-end digital solutions.'
      },
      {
        subtitle: 'After Payment',
        content: 'Once payment is confirmed, you will be redirected to your dashboard where you can track progress, chat with your developer, and manage project details.'
      },
      {
        subtitle: 'Using the Chat',
        content: 'Our built-in chat system allows you to send text, images, and audio messages directly to your developer. Stay updated in real-time.'
      }
    ]
  },
  'for-sales': {
    title: 'For Sales Team',
    icon: TrendingUp,
    sections: [
      {
        subtitle: 'Lead Generation',
        content: 'Our sales team helps businesses understand the value of a professional web presence. You will be provided with leads and support tools.'
      },
      {
        subtitle: 'Commission Rules',
        content: 'Commissions are processed only after the client makes a successful payment. Track your earnings and performance in the sales dashboard.'
      }
    ]
  },
  'payments': {
    title: 'Payments & Pricing',
    icon: CreditCard,
    sections: [
      {
        subtitle: 'Pricing Models',
        content: 'We offer transparent pricing with no hidden costs. Choose the plan that best fits your business goals and get your premium website delivered in record time.'
      },
      {
        subtitle: 'Refund Policy',
        content: 'We offer a 100% money-back guarantee if you are not satisfied with the initial design phase. Terms and conditions apply.'
      }
    ]
  },
  'faq': {
    title: 'FAQ',
    icon: HelpCircle,
    sections: [
      {
        subtitle: 'What is the delivery time?',
        content: 'Standard projects are typically delivered within 52 hours. Custom enterprise solutions may take longer depending on complexity.'
      },
      {
        subtitle: 'Do you provide support?',
        content: 'Yes, we provide 24/7 support for all our clients. You can reach out via the chat system or email.'
      }
    ]
  },
  'contact': {
    title: 'Contact Support',
    icon: Mail,
    sections: [
      {
        subtitle: 'Need Help?',
        content: 'If you have any questions or need further assistance, please reach out to our support team at support@webbylaunch.com or use the live chat in your dashboard.'
      }
    ]
  }
};

export default function Docs() {
  const [activeSection, setActiveSection] = useState('getting-started');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDocs = Object.entries(DOCS_CONTENT).filter(([key, value]) => 
    value.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    value.sections.some(s => s.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) || s.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#c7c42a] selection:text-black">
      <SEO 
        title="Documentation | WebbyLaunch Help Center" 
        description="Learn how to use WebbyLaunch, manage your projects, and work with our team. Comprehensive guides for clients, developers, and sales."
      />

      <div className="max-w-7xl mx-auto pt-40 pb-20 px-10 flex flex-col lg:flex-row gap-16">
        {/* Sidebar */}
        <aside className="lg:w-80 space-y-12 shrink-0">
          <div className="space-y-4">
            <h1 className="text-4xl font-black tracking-tighter uppercase italic">Docs.</h1>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
              <input 
                type="text"
                placeholder="Search guides..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-xs font-bold uppercase tracking-widest outline-none focus:border-[#c7c42a]/50 transition-all"
              />
            </div>
          </div>

          <nav className="space-y-2">
            {Object.entries(DOCS_CONTENT).map(([key, value]) => (
              <button
                key={key}
                onClick={() => setActiveSection(key)}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeSection === key 
                    ? 'bg-[#c7c42a] text-black shadow-[0_0_30px_rgba(199,196,42,0.2)]' 
                    : 'text-white/40 hover:bg-white/5 hover:text-white'
                }`}
              >
                <value.icon size={16} />
                {value.title}
                {activeSection === key && <ChevronRight size={14} className="ml-auto" />}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 space-y-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              <div className="space-y-4">
                <div className="w-16 h-16 bg-[#c7c42a]/10 rounded-2xl flex items-center justify-center text-[#c7c42a]">
                  {React.createElement(DOCS_CONTENT[activeSection as keyof typeof DOCS_CONTENT].icon, { size: 32 })}
                </div>
                <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic">
                  {DOCS_CONTENT[activeSection as keyof typeof DOCS_CONTENT].title}
                </h2>
              </div>

              <div className="space-y-12">
                {DOCS_CONTENT[activeSection as keyof typeof DOCS_CONTENT].sections.map((section, i) => (
                  <div key={i} className="space-y-6 group">
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white group-hover:text-[#c7c42a] transition-colors">
                      {section.subtitle}
                    </h3>
                    <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] text-white/60 font-medium italic leading-relaxed whitespace-pre-line">
                      {section.content}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-12 border-t border-white/5 flex items-center justify-between">
                <button className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors">
                  Was this helpful?
                </button>
                <div className="flex gap-4">
                  <button className="px-6 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">Yes</button>
                  <button className="px-6 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">No</button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* CTA */}
          <section className="bg-[#c7c42a] rounded-[3rem] p-12 text-black space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-black/5 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2" />
            <div className="relative z-10 space-y-4">
              <h3 className="text-4xl font-black uppercase italic tracking-tighter">Still have questions?</h3>
              <p className="text-black/60 font-bold uppercase tracking-widest text-xs">Our support team is ready to help you 24/7.</p>
            </div>
            <button className="relative z-10 flex items-center gap-3 bg-black text-white px-10 py-5 rounded-2xl text-sm font-black uppercase tracking-widest hover:scale-105 transition-all shadow-2xl">
              Contact Support
              <ArrowRight size={18} />
            </button>
          </section>
        </main>
      </div>
    </div>
  );
}
