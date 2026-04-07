import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Calendar, User, Tag, ArrowRight, Search } from 'lucide-react';

const Loader = ({ color = "white" }: { color?: string }) => (
  <div className="flex items-center justify-center gap-2">
    <motion.div
      animate={{
        scale: [1, 1.2, 1],
        rotate: [0, 180, 360],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className={`w-6 h-6 border-2 border-${color === 'white' ? 'white' : '[#E6FF00]'} border-t-transparent rounded-full`}
    />
    <span className={`text-[10px] font-black uppercase tracking-[0.2em] text-${color === 'white' ? 'white' : '[#E6FF00]'} animate-pulse italic`}>Loading...</span>
  </div>
);
import SEO from '../components/SEO';
import { getBlogPosts } from '../services/database';
import { BlogPost as BlogPostType } from '../types';
import { formatDate } from '../lib/utils';

export default function Blog() {
  const [posts, setPosts] = useState<BlogPostType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      const blogPosts = await getBlogPosts();
      setPosts(blogPosts as BlogPostType[]);
      setIsLoading(false);
    };
    fetchPosts();
  }, []);

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="pt-40 pb-20 px-10">
      <SEO 
        title="WebbyLaunch Blog – Web Design & Business Growth Tips" 
        description="Read our latest articles on web design, SEO, and how to grow your small business in India with a professional website."
      />
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-6 mb-24">
          <h1 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter">
            Our <span className="text-[#E6FF00]">Blog.</span>
          </h1>
          <p className="max-w-2xl mx-auto text-white/60 text-lg font-medium leading-relaxed">
            Expert insights on web development, SEO, and digital marketing to help your business thrive.
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-20">
          <div className="relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={20} />
            <input 
              type="text" 
              placeholder="Search articles..." 
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-16 py-5 text-sm text-white outline-none focus:border-[#E6FF00]/50 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-40 space-y-6">
            <Loader color="white" />
            <p className="text-xs font-black uppercase tracking-widest text-white/20">Loading articles...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-40 space-y-6">
            <p className="text-xl font-black uppercase italic tracking-tighter text-white/20">No articles found matching your search.</p>
            <button 
              onClick={() => setSearchQuery('')}
              className="text-[#E6FF00] text-xs font-black uppercase tracking-widest hover:underline"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {filteredPosts.map((post, idx) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="group bg-white/5 border border-white/10 rounded-[3rem] overflow-hidden hover:border-[#E6FF00]/30 transition-all flex flex-col"
              >
                <Link to={`/blog/${post.slug}`} className="aspect-[16/9] overflow-hidden block">
                  <img 
                    src={post.image} 
                    alt={post.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 grayscale hover:grayscale-0"
                    referrerPolicy="no-referrer"
                  />
                </Link>
                <div className="p-10 flex-1 flex flex-col space-y-6">
                  <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-white/20">
                    <span className="flex items-center gap-1.5"><Calendar size={12} /> {formatDate(post.date, 'MMM d, yyyy')}</span>
                    <span className="flex items-center gap-1.5"><Tag size={12} className="text-[#E6FF00]" /> {post.category}</span>
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-2xl font-black uppercase italic tracking-tighter leading-tight group-hover:text-[#E6FF00] transition-colors">
                      <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                    </h2>
                    <p className="text-white/40 text-xs font-medium leading-relaxed line-clamp-3">{post.excerpt}</p>
                  </div>
                  <div className="pt-6 border-t border-white/5 mt-auto">
                    <Link 
                      to={`/blog/${post.slug}`} 
                      className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#E6FF00] hover:gap-4 transition-all"
                    >
                      Read Article <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
