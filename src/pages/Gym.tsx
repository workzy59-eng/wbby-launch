import { motion } from 'motion/react';
import { Play, ArrowRight, Instagram, Facebook, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Gym() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#FF4D00] selection:text-white overflow-x-hidden">
      {/* Banner */}
      <div className="bg-[#FF4D00] text-black py-2 text-center overflow-hidden whitespace-nowrap">
        <motion.div 
          animate={{ x: [0, -1000] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="inline-block font-black uppercase italic tracking-widest text-sm"
        >
          THE JUBLIE GYM • PUSH YOUR LIMITS • JOIN THE ELITE • THE JUBLIE GYM • PUSH YOUR LIMITS • JOIN THE ELITE • THE JUBLIE GYM • PUSH YOUR LIMITS • JOIN THE ELITE
        </motion.div>
      </div>

      {/* Navbar */}
      <nav className="px-10 py-8 flex justify-between items-center border-b border-white/10">
        <div className="text-2xl font-black italic tracking-tighter uppercase">JUBLIE<span className="text-[#FF4D00]">GYM</span></div>
        <div className="hidden md:flex gap-10 text-[10px] font-black uppercase tracking-widest opacity-60">
          <a href="#" className="hover:text-[#FF4D00] transition-colors">Home</a>
          <a href="#" className="hover:text-[#FF4D00] transition-colors">Programs</a>
          <a href="#" className="hover:text-[#FF4D00] transition-colors">Trainers</a>
          <a href="#" className="hover:text-[#FF4D00] transition-colors">Contact</a>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/" className="px-6 py-3 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
            Back to Webby
          </Link>
          <button className="bg-[#FF4D00] text-black px-8 py-3 rounded-full font-black uppercase italic text-xs hover:scale-105 transition-all">Member Login</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center px-10">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-black to-[#FF4D00]/20 z-0" />
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
          <div className="space-y-10">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-[2px] bg-[#FF4D00]"></div>
                <span className="text-[#FF4D00] font-black uppercase tracking-[0.3em] text-xs">Elite Fitness Club</span>
              </div>
              <h1 className="text-8xl font-black tracking-tighter uppercase italic leading-[0.85]">
                PUSH YOUR <br />
                <span className="text-transparent border-t-2 border-b-2 border-white/20 py-2">LIMITS</span> WITH US
              </h1>
              <p className="text-white/60 text-lg italic leading-relaxed max-w-lg">
                From beginner to advanced, experience workouts designed to help you achieve peak performance and exceed your fitness goals.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap items-center gap-8"
            >
              <button className="bg-[#FF4D00] text-black px-12 py-6 rounded-full font-black uppercase italic text-xl flex items-center gap-4 hover:scale-105 transition-all shadow-[0_0_50px_rgba(255,77,0,0.3)]">
                Join Now <ArrowRight size={24} />
              </button>
              <button className="flex items-center gap-4 group">
                <div className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                  <Play size={24} fill="currentColor" />
                </div>
                <span className="font-black uppercase italic tracking-widest text-sm">Watch Video</span>
              </button>
            </motion.div>

            <div className="flex flex-wrap gap-3 pt-10">
              {['Personal Training', 'Strength', 'Group Classes', 'Swimming', 'Cardio', 'Functional'].map(tag => (
                <span key={tag} className="px-6 py-2 rounded-full border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-widest text-white/40">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <div className="aspect-[4/5] rounded-[3rem] overflow-hidden border border-white/10 relative group">
              <img 
                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1920" 
                alt="Athlete" 
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
              
              <div className="absolute bottom-10 left-10 right-10 p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-2xl font-black italic uppercase">1.7k+</div>
                    <div className="text-[10px] font-black text-white/40 uppercase tracking-widest">Positive Reviews</div>
                  </div>
                  <div className="flex -space-x-4">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-black bg-gray-800 overflow-hidden">
                        <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" referrerPolicy="no-referrer" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Programs Section */}
      <section id="programs" className="py-32 px-10 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-10">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-[1px] bg-[#FF4D00]" />
                <span className="text-xs font-bold uppercase tracking-[0.4em] text-[#FF4D00]">Our Programs</span>
              </div>
              <h2 className="text-7xl font-black tracking-tighter uppercase italic leading-[0.9]">
                Choose Your <span className="text-black bg-[#FF4D00] px-4">Path</span>
              </h2>
            </div>
            <p className="text-xl font-medium opacity-50 max-w-md italic">
              We offer a wide range of programs tailored to your specific fitness needs and goals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Strength Training', desc: 'Build lean muscle and increase your power with our expert-led strength programs.', icon: '💪' },
              { title: 'Cardio Blast', desc: 'High-intensity interval training designed to burn fat and improve cardiovascular health.', icon: '🔥' },
              { title: 'Yoga & Mobility', desc: 'Improve flexibility, balance, and mental clarity with our restorative yoga sessions.', icon: '🧘' },
              { title: 'Boxing Elite', desc: 'Learn the fundamentals of boxing while getting an incredible full-body workout.', icon: '🥊' },
              { title: 'Swimming Pro', desc: 'Master your technique in our Olympic-sized pool with professional coaching.', icon: '🏊' },
              { title: 'CrossFit', desc: 'Functional movements performed at high intensity for overall fitness excellence.', icon: '🏋️' }
            ].map((p, i) => (
              <div key={i} className="p-10 rounded-[3rem] bg-white/5 border border-white/10 hover:bg-[#FF4D00] transition-all group">
                <div className="text-5xl mb-8 group-hover:scale-110 transition-transform">{p.icon}</div>
                <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-4 group-hover:text-black transition-colors">{p.title}</h3>
                <p className="font-medium opacity-50 leading-relaxed group-hover:text-black/70 transition-colors">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trainers Section */}
      <section id="trainers" className="py-32 px-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-24">
            <h2 className="text-7xl font-black tracking-tighter uppercase italic mb-6">Expert <span className="text-[#FF4D00]">Coaches</span></h2>
            <p className="text-white/40 font-bold uppercase tracking-widest text-sm italic">Our trainers are world-class athletes dedicated to your success.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { name: 'Alex Rivers', role: 'Strength Coach', img: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?q=80&w=800' },
              { name: 'Sarah Chen', role: 'Yoga Expert', img: 'https://images.unsplash.com/photo-1518611012118-2969c6360207?q=80&w=800' },
              { name: 'Marcus Thorne', role: 'Boxing Pro', img: 'https://images.unsplash.com/photo-1548690312-e3b507d17a47?q=80&w=800' },
              { name: 'Elena Vance', role: 'Cardio Specialist', img: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=800' }
            ].map((t, i) => (
              <div key={i} className="space-y-6 group">
                <div className="aspect-[3/4] rounded-[3rem] overflow-hidden border border-white/10 relative">
                  <img src={t.img} alt={t.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                </div>
                <div className="text-center">
                  <h4 className="text-2xl font-black uppercase italic tracking-tighter">{t.name}</h4>
                  <p className="text-[#FF4D00] text-[10px] font-black uppercase tracking-widest mt-1">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-10 bg-white text-black">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-1 space-y-8">
              <h2 className="text-7xl font-black tracking-tighter uppercase italic leading-[0.9]">Start Your <br /><span className="text-white bg-black px-4">Transformation</span></h2>
              <p className="text-xl font-medium opacity-50 italic">Choose the membership that fits your lifestyle. No hidden fees, just results.</p>
              <div className="flex items-center gap-4 p-6 bg-black/5 rounded-3xl border border-black/5">
                <div className="w-12 h-12 bg-black text-[#FF4D00] rounded-full flex items-center justify-center font-black italic">!</div>
                <p className="text-xs font-bold uppercase tracking-tight">Join today and get a free personal training session.</p>
              </div>
            </div>

            {[
              { name: 'Basic', price: '49', features: ['Gym Access', 'Locker Room', 'Free Weights', 'Basic Support'] },
              { name: 'Pro', price: '99', features: ['All Basic Features', 'Group Classes', 'Personal Trainer', 'Sauna Access'], popular: true },
              { name: 'Elite', price: '199', features: ['All Pro Features', 'Nutrition Plan', 'Private Sessions', 'VIP Lounge'] }
            ].map((plan, i) => (
              <div key={i} className={`p-12 rounded-[4rem] border ${plan.popular ? 'bg-black text-white border-black' : 'bg-[#f5f5f5] border-black/5'} flex flex-col justify-between relative overflow-hidden`}>
                {plan.popular && <div className="absolute top-0 right-0 bg-[#FF4D00] text-black px-8 py-2 rounded-bl-3xl text-[10px] font-black uppercase tracking-widest">Most Popular</div>}
                <div>
                  <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-8">{plan.name}</h3>
                  <div className="flex items-baseline gap-2 mb-12">
                    <span className="text-7xl font-black tracking-tighter">${plan.price}</span>
                    <span className="text-sm font-bold opacity-40 uppercase tracking-widest">/mo</span>
                  </div>
                  <ul className="space-y-4 mb-12">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${plan.popular ? 'bg-[#FF4D00]' : 'bg-black'}`} />
                        <span className="text-xs font-bold uppercase italic tracking-tight">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <button className={`w-full py-6 rounded-2xl font-black uppercase italic text-lg transition-all ${plan.popular ? 'bg-[#FF4D00] text-black hover:scale-105 shadow-[0_0_30px_rgba(255,77,0,0.3)]' : 'bg-black text-white hover:bg-[#FF4D00] hover:text-black'}`}>
                  Select Plan
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-10 py-20 border-t border-white/10 bg-black">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16">
          <div className="space-y-6">
            <div className="text-2xl font-black italic tracking-tighter uppercase">JUBLIE<span className="text-[#FF4D00]">GYM</span></div>
            <p className="text-white/40 text-sm italic leading-relaxed">
              Premium fitness experience designed for those who demand the best.
            </p>
          </div>
          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-[#FF4D00]">Contact</h4>
            <div className="space-y-4 text-sm font-bold text-white/60 italic">
              <p>support@webbylaunch.com</p>
              <p>+1 (555) 000-0000</p>
            </div>
          </div>
          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-[#FF4D00]">Social</h4>
            <div className="flex gap-4">
              <Instagram size={20} className="text-white/40 hover:text-[#FF4D00] transition-colors cursor-pointer" />
              <Facebook size={20} className="text-white/40 hover:text-[#FF4D00] transition-colors cursor-pointer" />
              <Twitter size={20} className="text-white/40 hover:text-[#FF4D00] transition-colors cursor-pointer" />
            </div>
          </div>
          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-[#FF4D00]">Newsletter</h4>
            <div className="flex gap-2">
              <input type="email" placeholder="Email" className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-xs focus:outline-none focus:border-[#FF4D00] flex-1" />
              <button className="bg-[#FF4D00] text-black px-4 py-2 rounded-lg font-black uppercase italic text-[10px]">Join</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
