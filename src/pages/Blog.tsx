import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Calendar, 
  User, 
  ArrowRight, 
  Clock, 
  Tag,
  ChevronRight,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { BlogPost } from '../types';
import { getBlogPosts } from '../services/database';
import SEO from '../components/SEO';

const CATEGORIES = ['All', 'SEO', 'Website', 'Business', 'Tips'];

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      const blogPosts = await getBlogPosts();
      setPosts(blogPosts);
      setIsLoading(false);
    };
    fetchPosts();
  }, []);

  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
      const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [posts, selectedCategory, searchQuery]);

  const featuredPost = posts.find(p => p.tags.includes('Featured')) || posts[0];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-[#FACC15] border-t-transparent rounded-full"
        />
        <p className="text-xs font-black uppercase tracking-[0.3em] text-[#FACC15] animate-pulse italic">Loading Insights...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-black text-white selection:bg-[#FACC15] selection:text-black"
    >
      <SEO 
        title="Blog | Insights & Guides – WebbyLaunch"
        description="Expert insights, practical tips, and deep dives into web design, SEO, and business growth. Grow your business online with WebbyLaunch."
      />

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 overflow-hidden px-6">
        <div className="absolute inset-0 bg-[#FACC15]/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 text-center space-y-8 max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#FACC15]/10 border border-[#FACC15]/20 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-[#FACC15] italic"
          >
            <Sparkles size={12} /> Knowledge Hub
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-7xl md:text-9xl font-black tracking-tighter uppercase italic leading-[0.8] text-white"
          >
            Our <span className="text-[#FACC15]">Blog.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/40 text-lg md:text-xl font-bold uppercase tracking-widest max-w-2xl mx-auto italic leading-relaxed"
          >
            Insights, tips, and guides to grow your business online and stay ahead of the competition.
          </motion.p>

          {/* Search Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-xl mx-auto pt-10"
          >
            <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#FACC15] transition-colors" size={20} />
              <input 
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-full py-6 pl-16 pr-8 text-white placeholder:text-white/20 focus:outline-none focus:border-[#FACC15]/50 focus:bg-white/10 transition-all text-sm font-black uppercase tracking-widest"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Post */}
      {featuredPost && !searchQuery && selectedCategory === 'All' && (
        <section className="px-6 pb-20">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="group relative bg-white/5 border border-white/10 rounded-[4rem] overflow-hidden cursor-pointer hover:border-[#FACC15]/30 transition-all"
              onClick={() => navigate(`/blog/${featuredPost.slug}`)}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="relative h-[400px] lg:h-auto overflow-hidden">
                  <img 
                    src={featuredPost.image} 
                    alt={featuredPost.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent lg:hidden" />
                </div>
                <div className="p-12 lg:p-24 flex flex-col justify-center space-y-10">
                  <div className="flex items-center gap-4">
                    <span className="px-5 py-2 bg-[#FACC15] text-black text-[10px] font-black uppercase tracking-widest rounded-full shadow-[0_0_20px_rgba(250,204,21,0.3)]">Featured Story</span>
                    <span className="text-white/40 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                      <TrendingUp size={12} className="text-[#FACC15]" /> {featuredPost.category}
                    </span>
                  </div>
                  <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-[0.9] text-white group-hover:text-[#FACC15] transition-colors">
                    {featuredPost.title}
                  </h2>
                  <p className="text-white/40 text-lg font-bold uppercase tracking-widest italic line-clamp-3">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex items-center justify-between pt-6 border-t border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-[#FACC15] font-black text-xl">
                        {featuredPost.author[0]}
                      </div>
                      <div>
                        <p className="text-xs font-black text-white uppercase tracking-widest">{featuredPost.author}</p>
                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{typeof featuredPost.date === 'string' ? featuredPost.date : featuredPost.date.toDate().toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-[#FACC15] font-black text-xs uppercase tracking-[0.2em] group-hover:translate-x-2 transition-transform italic">
                      Read Full Article <ArrowRight size={20} />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Categories & Filter */}
      <section className="px-6 sticky top-24 z-30 py-6 bg-black/80 backdrop-blur-xl border-y border-white/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                  selectedCategory === cat 
                    ? 'bg-[#FACC15] text-black border-transparent shadow-[0_0_30px_rgba(250,204,21,0.2)]' 
                    : 'text-white/40 border-white/10 hover:text-white hover:bg-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-2 text-white/20 text-[10px] font-black uppercase tracking-widest italic">
            <TrendingUp size={14} className="text-[#FACC15]" /> {filteredPosts.length} Articles Found
          </div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="px-6 py-32">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <AnimatePresence mode="popLayout">
              {filteredPosts.map((post, idx) => (
                <motion.div
                  key={post.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => navigate(`/blog/${post.slug}`)}
                  className="group bg-white/5 border border-white/10 rounded-[3rem] overflow-hidden cursor-pointer hover:border-[#FACC15]/30 transition-all flex flex-col h-full"
                >
                  <div className="relative h-72 overflow-hidden">
                    <img 
                      src={post.image} 
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-8 left-8">
                      <span className="px-5 py-2 bg-black/60 backdrop-blur-md border border-white/10 text-[#FACC15] text-[10px] font-black uppercase tracking-widest rounded-full">
                        {post.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-12 flex flex-col flex-1 space-y-8">
                    <div className="flex items-center gap-6 text-white/20 text-[10px] font-black uppercase tracking-widest">
                      <div className="flex items-center gap-2"><Calendar size={14} className="text-[#FACC15]" /> {typeof post.date === 'string' ? post.date : post.date.toDate().toLocaleDateString()}</div>
                      <div className="flex items-center gap-2"><Clock size={14} /> 5 min read</div>
                    </div>
                    <h3 className="text-3xl font-black tracking-tighter uppercase italic leading-tight text-white group-hover:text-[#FACC15] transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-white/40 text-sm font-bold uppercase tracking-widest italic line-clamp-3 flex-1 leading-relaxed">
                      {post.excerpt}
                    </p>
                    <div className="pt-8 flex items-center justify-between border-t border-white/5">
                      <div className="flex items-center gap-3 text-white/40 text-[10px] font-black uppercase tracking-widest">
                        <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-[#FACC15] font-black">
                          {post.author[0]}
                        </div>
                        {post.author}
                      </div>
                      <div className="flex items-center gap-2 text-[#FACC15] font-black text-[10px] uppercase tracking-widest group-hover:translate-x-2 transition-transform italic">
                        Read More <ArrowRight size={16} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredPosts.length === 0 && (
            <div className="py-40 text-center space-y-8">
              <div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10">
                <Search className="text-white/10" size={48} />
              </div>
              <div className="space-y-3">
                <h3 className="text-4xl font-black uppercase italic tracking-tighter text-white">No articles found</h3>
                <p className="text-white/20 text-xs font-black uppercase tracking-[0.3em]">Try adjusting your search or filters</p>
              </div>
              <button 
                onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                className="px-12 py-5 bg-[#FACC15] text-black rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 pb-40">
        <div className="max-w-7xl mx-auto">
          <div className="relative bg-[#FACC15] rounded-[5rem] p-16 md:p-32 overflow-hidden text-center">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-black/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10 space-y-10">
              <h2 className="text-6xl md:text-9xl font-black tracking-tighter text-black uppercase italic leading-[0.8] max-w-4xl mx-auto">
                Need a website <br /> for your business?
              </h2>
              <p className="text-black/60 text-xl font-black uppercase tracking-[0.2em] italic">
                Let's build something extraordinary together.
              </p>
              <div className="flex flex-wrap justify-center gap-6 pt-6">
                <Link 
                  to="/pricing"
                  className="px-16 py-7 bg-black text-white rounded-full font-black uppercase italic tracking-[0.2em] text-sm hover:scale-105 transition-all shadow-2xl"
                >
                  View Pricing
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}

