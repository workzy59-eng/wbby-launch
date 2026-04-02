import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Calendar, User, Tag, ArrowLeft, Share2, Loader2, MessageCircle } from 'lucide-react';
import SEO from '../components/SEO';
import { getBlogPostBySlug } from '../services/database';
import { BlogPost as BlogPostType } from '../types';
import { formatDate } from '../lib/utils';
import ReactMarkdown from 'react-markdown';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (slug) {
        const blogPost = await getBlogPostBySlug(slug);
        setPost(blogPost as BlogPostType);
        setIsLoading(false);
      }
    };
    fetchPost();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-6 pt-40">
        <Loader2 className="text-[#E6FF00] animate-spin" size={48} />
        <p className="text-xs font-black uppercase tracking-widest text-white/20">Loading article...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-12 pt-40 px-10 text-center">
        <h1 className="text-6xl font-black uppercase italic tracking-tighter">Article <span className="text-red-500">Not Found.</span></h1>
        <Link to="/blog" className="bg-[#E6FF00] text-black px-10 py-5 rounded-2xl text-sm font-black uppercase tracking-widest hover:scale-105 transition-all">
          Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-40 pb-20 px-10">
      <SEO 
        title={`${post.title} – WebbyLaunch Blog`} 
        description={post.excerpt} 
        image={post.image}
      />
      <div className="max-w-4xl mx-auto">
        <Link 
          to="/blog" 
          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-[#E6FF00] transition-all mb-12"
        >
          <ArrowLeft size={14} /> Back to Blog
        </Link>

        <div className="space-y-12 mb-20">
          <div className="space-y-6">
            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-white/20">
              <span className="flex items-center gap-1.5"><Calendar size={12} /> {formatDate(post.date, 'MMM d, yyyy')}</span>
              <span className="flex items-center gap-1.5"><Tag size={12} className="text-[#E6FF00]" /> {post.category}</span>
              <span className="flex items-center gap-1.5"><User size={12} /> {post.author}</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-tight">
              {post.title}
            </h1>
          </div>

          <div className="aspect-[21/9] rounded-[3rem] overflow-hidden border border-white/10">
            <img 
              src={post.image} 
              alt={post.title} 
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_200px] gap-20">
          <div className="prose prose-invert max-w-none prose-headings:font-black prose-headings:uppercase prose-headings:italic prose-headings:tracking-tighter prose-p:text-white/60 prose-p:leading-relaxed prose-li:text-white/60 prose-strong:text-[#E6FF00] prose-a:text-[#E6FF00] prose-img:rounded-[2rem]">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>

          <aside className="space-y-12">
            <div className="space-y-6">
              <h4 className="text-xs font-black uppercase tracking-widest text-white/20">Share Article</h4>
              <div className="flex flex-col gap-4">
                {['Twitter', 'LinkedIn', 'WhatsApp'].map((platform) => (
                  <button key={platform} className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#E6FF00] hover:text-black hover:border-transparent transition-all flex items-center justify-center gap-2">
                    <Share2 size={12} /> {platform}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[#E6FF00] p-8 rounded-[2.5rem] space-y-6">
              <h4 className="text-xl font-black uppercase italic tracking-tighter text-black leading-tight">Ready to launch your own website?</h4>
              <p className="text-black/60 text-[10px] font-bold uppercase tracking-widest leading-relaxed">Get your business online in 24-48 hours with WebbyLaunch.</p>
              <Link 
                to="/auth" 
                className="block w-full py-4 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest text-center hover:scale-105 transition-all"
              >
                Start Now
              </Link>
            </div>
          </aside>
        </div>

        <div className="mt-32 pt-16 border-t border-white/5">
          <div className="flex items-center justify-between gap-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center text-[#E6FF00] font-black text-2xl">
                {post.author[0]}
              </div>
              <div>
                <h4 className="font-black uppercase italic tracking-tighter text-lg">{post.author}</h4>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Content Strategist at WebbyLaunch</p>
              </div>
            </div>
            <Link 
              to="/contact" 
              className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2"
            >
              <MessageCircle size={14} /> Contact Author
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
