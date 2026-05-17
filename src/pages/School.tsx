import { motion } from 'framer-motion';
import { GraduationCap, ArrowRight, BookOpen, Users, Award, Calendar, Search, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function School() {
  return (
    <div className="min-h-screen bg-white text-[#1a1a1a] font-sans selection:bg-[#0047AB] selection:text-white overflow-x-hidden">
      {/* Banner */}
      <div className="bg-[#0047AB] text-white py-2 text-center overflow-hidden whitespace-nowrap">
        <motion.div 
          animate={{ x: [0, -1000] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="inline-block font-bold uppercase tracking-widest text-[10px]"
        >
          ADMISSIONS OPEN FOR 2026-27 • EXCELLENCE IN EDUCATION • THE ACADEMY • ADMISSIONS OPEN FOR 2026-27 • EXCELLENCE IN EDUCATION • THE ACADEMY
        </motion.div>
      </div>

      {/* Navbar */}
      <nav className="px-10 py-6 flex justify-between items-center border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#0047AB] rounded-lg flex items-center justify-center text-white">
            <GraduationCap size={24} />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase">THE<span className="text-[#0047AB]">ACADEMY</span></span>
        </div>
        
        <div className="hidden lg:flex gap-8 text-[10px] font-bold uppercase tracking-widest text-gray-400">
          <a href="#" className="hover:text-[#0047AB] transition-colors">About Us</a>
          <a href="#" className="hover:text-[#0047AB] transition-colors">Academics</a>
          <a href="#" className="hover:text-[#0047AB] transition-colors">Admissions</a>
          <a href="#" className="hover:text-[#0047AB] transition-colors">Campus Life</a>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/" className="px-6 py-2.5 bg-gray-100 border border-gray-200 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-gray-200 transition-all">
            BACK_TO_WEBBY
          </Link>
          <button className="p-2 text-gray-400 hover:text-[#0047AB] transition-colors">
            <Search size={20} />
          </button>
          <button className="bg-[#0047AB] text-white px-6 py-2.5 rounded-full font-bold uppercase text-[10px] tracking-widest hover:bg-[#003380] transition-all shadow-lg shadow-blue-900/20">
            Apply Now
          </button>
          <button className="lg:hidden p-2 text-gray-400">
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full text-[#0047AB] text-[10px] font-bold uppercase tracking-widest">
                <Award size={14} /> Top Ranked Institution
              </div>
              <h1 className="text-7xl font-black tracking-tighter leading-[0.9] uppercase">
                SHAPING THE <br />
                <span className="text-[#0047AB]">FUTURE</span> LEADERS
              </h1>
              <p className="text-gray-500 text-lg leading-relaxed max-w-lg font-medium">
                We provide a world-class education that empowers students to reach their full potential and become global citizens.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap items-center gap-6"
            >
              <button className="bg-[#0047AB] text-white px-10 py-5 rounded-2xl font-bold uppercase tracking-widest text-sm flex items-center gap-3 hover:scale-105 transition-all shadow-xl shadow-blue-900/20">
                Join Now <ArrowRight size={20} />
              </button>
              <button className="px-10 py-5 rounded-2xl border-2 border-gray-100 font-bold uppercase tracking-widest text-sm hover:bg-gray-50 transition-all">
                Virtual Tour
              </button>
            </motion.div>

            <div className="flex items-center gap-10 pt-10 border-t border-gray-100">
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-gray-100 overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?img=${i+20}`} alt="Student" referrerPolicy="no-referrer" />
                  </div>
                ))}
                <div className="w-12 h-12 rounded-full border-4 border-white bg-[#0047AB] flex items-center justify-center text-white text-xs font-bold">
                  +5k
                </div>
              </div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Trusted by <br /> <span className="text-[#1a1a1a]">5,000+ Students</span>
              </div>
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl relative group">
              <img 
                src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1920" 
                alt="Classroom" 
                className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0047AB]/40 to-transparent"></div>
              
              {/* Floating Stats */}
              <div className="absolute top-10 right-10 bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-white/20">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-[#0047AB]">
                    <BookOpen size={24} />
                  </div>
                  <div>
                    <div className="text-2xl font-black">50+</div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Courses</div>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-10 left-10 bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-white/20">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-[#0047AB]">
                    <Users size={24} />
                  </div>
                  <div>
                    <div className="text-2xl font-black">120+</div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Expert Faculty</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-32 px-10 bg-gray-50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-6">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-[#0047AB]">
              <Calendar size={28} />
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tighter">Flexible Learning</h3>
            <p className="text-gray-500 text-sm leading-relaxed font-medium">
              Choose from full-time, part-time, or online learning options that fit your schedule.
            </p>
          </div>
          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-6">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-[#0047AB]">
              <Award size={28} />
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tighter">Global Certification</h3>
            <p className="text-gray-500 text-sm leading-relaxed font-medium">
              Our degrees are recognized worldwide, opening doors to international career opportunities.
            </p>
          </div>
          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-6">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-[#0047AB]">
              <BookOpen size={28} />
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tighter">Modern Library</h3>
            <p className="text-gray-500 text-sm leading-relaxed font-medium">
              Access thousands of digital and physical resources in our state-of-the-art library.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-10 py-20 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#0047AB] rounded-lg flex items-center justify-center text-white">
                <GraduationCap size={18} />
              </div>
              <span className="text-lg font-black tracking-tighter uppercase">THE<span className="text-[#0047AB]">ACADEMY</span></span>
            </div>
            <p className="text-gray-400 text-sm font-medium leading-relaxed">
              Empowering students through innovation and excellence in education since 1995.
            </p>
          </div>
          <div className="space-y-6">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0047AB]">Quick Links</h4>
            <div className="space-y-3 text-xs font-bold text-gray-400 uppercase tracking-widest">
              <a href="#" className="block hover:text-[#0047AB] transition-colors">Programs</a>
              <a href="#" className="block hover:text-[#0047AB] transition-colors">Admissions</a>
              <a href="#" className="block hover:text-[#0047AB] transition-colors">Campus Life</a>
              <a href="#" className="block hover:text-[#0047AB] transition-colors">Alumni</a>
            </div>
          </div>
          <div className="space-y-6">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0047AB]">Contact</h4>
            <div className="space-y-3 text-xs font-bold text-gray-400 uppercase tracking-widest">
              <p>info@theacademy.edu</p>
              <p>+1 (555) 123-4567</p>
              <p>123 Education Way, NY</p>
            </div>
          </div>
          <div className="space-y-6">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0047AB]">Newsletter</h4>
            <div className="flex gap-2">
              <input type="email" placeholder="Email" className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-[#0047AB] flex-1" />
              <button className="bg-[#0047AB] text-white px-4 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest">Join</button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6">
           <p className="text-[10px] font-bold uppercase tracking-widest text-gray-300">
             © 2024 WebbyLaunch. Premium Website solutions.
           </p>
        </div>
      </footer>
    </div>
  );
}
