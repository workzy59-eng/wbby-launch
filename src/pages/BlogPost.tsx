import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  User, 
  Tag, 
  ArrowLeft, 
  Share2, 
  MessageCircle, 
  Clock, 
  ChevronRight, 
  ArrowRight,
  Facebook,
  Twitter,
  Linkedin,
  Copy
} from 'lucide-react';

import { ADMIN_EMAIL } from '../constants';

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
      className={`w-6 h-6 border-2 border-${color === 'white' ? 'white' : '[#c7c42a]'} border-t-transparent rounded-full`}
    />
    <span className={`text-[10px] font-black uppercase tracking-[0.2em] text-${color === 'white' ? 'white' : '[#c7c42a]'} animate-pulse italic`}>Loading...</span>
  </div>
);
import SEO from '../components/SEO';
import { getBlogPostBySlug, getBlogPosts } from '../services/database';
import { BlogPost as BlogPostType } from '../types';
import { formatDate } from '../lib/utils';
import ReactMarkdown from 'react-markdown';
import { toast } from 'react-hot-toast';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPostType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (slug) {
        setIsLoading(true);
        const blogPost = await getBlogPostBySlug(slug) as BlogPostType | null;
        setPost(blogPost);
        
        if (blogPost) {
          // Fetch related posts
          const allPosts = await getBlogPosts();
          const related = allPosts
            .filter(p => p.slug !== slug && (p.category === blogPost.category || p.tags.some(t => blogPost.tags.includes(t))))
            .slice(0, 3);
          setRelatedPosts(related);
        }
        
        setIsLoading(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    fetchPost();
  }, [slug]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-6">
        <Loader color="white" />
        <p className="text-xs font-black uppercase tracking-widest text-white/20">Loading article...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-12 pt-40 px-10 text-center">
        <h1 className="text-6xl font-black uppercase italic tracking-tighter text-white">Article <span className="text-red-500">Not Found.</span></h1>
        <Link to="/blog" className="bg-[#c7c42a] text-black px-12 py-5 rounded-full text-sm font-black uppercase tracking-widest hover:scale-105 transition-all">
          Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#c7c42a] selection:text-black">
      <SEO 
        title={`${post.title} – WebbyLaunch Blog`} 
        description={post.excerpt} 
        image={post.image}
      />

      {/* Post Header */}
      <section className="relative pt-40 pb-20 px-6">
        <div className="max-w-4xl mx-auto space-y-12">
          <Link 
            to="/blog" 
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-[#E6FF00] transition-all group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Blog
          </Link>

          <div className="space-y-8">
            <div className="flex flex-wrap items-center gap-4">
              <span className="px-5 py-2 bg-[#c7c42a]/10 border border-[#c7c42a]/20 text-[#c7c42a] text-[10px] font-black uppercase tracking-widest rounded-full">
                {post.category}
              </span>
              <div className="flex items-center gap-4 text-white/40 text-[10px] font-black uppercase tracking-widest">
                <span className="flex items-center gap-2"><Calendar size={14} /> {formatDate(post.date, 'MMM d, yyyy')}</span>
                <span className="flex items-center gap-2"><Clock size={14} /> 5 min read</span>
              </div>
            </div>
            <h1 className="text-5xl md:text-8xl font-black uppercase italic tracking-tighter leading-[0.9]">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center justify-between gap-8 pt-10 border-t border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center text-[#c7c42a] font-black text-2xl border border-white/10">
                  {post.author[0]}
                </div>
                <div>
                  <p className="text-sm font-black text-white uppercase tracking-widest">{post.author}</p>
                  <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest italic">Content Strategist at WebbyLaunch</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={copyToClipboard} className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-white/40 hover:text-[#c7c42a] hover:border-[#c7c42a]/30 transition-all">
                  <Copy size={18} />
                </button>
                <button className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-white/40 hover:text-[#c7c42a] hover:border-[#c7c42a]/30 transition-all">
                  <Twitter size={18} />
                </button>
                <button className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-white/40 hover:text-[#c7c42a] hover:border-[#c7c42a]/30 transition-all">
                  <Linkedin size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Image */}
      <section className="px-6">
        <div className="max-w-6xl mx-auto">
          <div className="relative aspect-[21/9] rounded-[4rem] overflow-hidden border border-white/10 shadow-2xl">
            <img 
              src={post.image} 
              alt={post.title} 
              className="w-full h-full object-cover transition-all duration-1000"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="px-6 py-24">
        <div className="max-w-3xl mx-auto">
          <div className="prose prose-invert prose-xl max-w-none 
            prose-headings:font-black prose-headings:uppercase prose-headings:italic prose-headings:tracking-tighter prose-headings:text-white
            prose-p:text-white/60 prose-p:font-medium prose-p:italic prose-p:leading-relaxed
            prose-strong:text-[#c7c42a] prose-strong:font-black
            prose-blockquote:border-l-4 prose-blockquote:border-[#c7c42a] prose-blockquote:bg-white/5 prose-blockquote:p-10 prose-blockquote:rounded-r-[2rem] prose-blockquote:italic prose-blockquote:text-white/80
            prose-ul:text-white/60 prose-li:marker:text-[#c7c42a]
            prose-a:text-[#c7c42a] prose-a:no-underline hover:prose-a:underline
            prose-img:rounded-[3rem] prose-img:border prose-img:border-white/10
          ">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>

          {/* Tags */}
          <div className="mt-24 pt-12 border-t border-white/5 flex flex-wrap gap-3">
            {post.tags.map(tag => (
              <span key={tag} className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:border-[#c7c42a]/30 transition-all cursor-default">
                <Tag size={12} className="text-[#c7c42a]" /> {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="px-6 py-32 border-t border-white/5">
          <div className="max-w-7xl mx-auto space-y-16">
            <div className="flex items-end justify-between">
              <div className="space-y-3">
                <span className="text-[10px] font-black text-[#c7c42a] uppercase tracking-[0.4em]">Keep Reading</span>
                <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic text-white">Related <span className="text-[#c7c42a]">Insights.</span></h2>
              </div>
              <Link 
                to="/blog" 
                className="hidden md:flex items-center gap-2 text-white/40 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest italic"
              >
                View All Articles <ChevronRight size={18} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {relatedPosts.map((p) => (
                <div 
                  key={p.id}
                  onClick={() => navigate(`/blog/${p.slug}`)}
                  className="group bg-white/5 border border-white/10 rounded-[3rem] overflow-hidden cursor-pointer hover:border-[#c7c42a]/30 transition-all flex flex-col h-full"
                >
                  <div className="relative h-56 overflow-hidden">
                    <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" referrerPolicy="no-referrer" />
                  </div>
                  <div className="p-10 space-y-6 flex-1 flex flex-col">
                    <span className="text-[10px] font-black text-[#c7c42a] uppercase tracking-widest">{p.category}</span>
                    <h3 className="text-2xl font-black tracking-tighter uppercase italic leading-tight text-white group-hover:text-[#c7c42a] transition-colors line-clamp-2">
                      {p.title}
                    </h3>
                    <div className="pt-6 mt-auto border-t border-white/5 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{formatDate(p.date, 'MMM d, yyyy')}</span>
                      <ArrowRight size={20} className="text-[#c7c42a] group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="px-6 pb-40">
        <div className="max-w-7xl mx-auto">
          <div className="relative bg-[#c7c42a] rounded-[5rem] p-16 md:p-32 overflow-hidden text-center">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-black/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10 space-y-10">
              <h2 className="text-6xl md:text-9xl font-black tracking-tighter text-black uppercase italic leading-[0.8] max-w-4xl mx-auto">
                Ready to launch <br /> your business?
              </h2>
              <p className="text-black/60 text-xl font-black uppercase tracking-[0.2em] italic">
                Get your professional website in 52 hours.
              </p>
              <div className="flex flex-wrap justify-center gap-6 pt-6">
                <Link 
                  to="/pricing"
                  className="px-16 py-7 bg-black text-white rounded-full font-black uppercase italic tracking-[0.2em] text-sm hover:scale-105 transition-all shadow-2xl"
                >
                  View Pricing
                </Link>
                <a 
                  href={`https://mail.google.com/mail/?view=cm&fs=1&to=${ADMIN_EMAIL}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-16 py-7 border-2 border-black text-black rounded-full font-black uppercase italic tracking-[0.2em] text-sm hover:bg-black hover:text-white transition-all"
                >
                  Email Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

