import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, Zap, Globe } from 'lucide-react';
import SEO from '../components/SEO';

export default function About() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-40 pb-20 px-10"
    >
      <SEO title="About WebbyLaunch – Premium Mobile-First Web Solutions" />
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-6 mb-20">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter"
          >
            We Build <span className="text-[#c7c42a]">Digital Success.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-2xl mx-auto text-white/60 text-lg font-medium leading-relaxed"
          >
            WebbyLaunch is a premium web development agency dedicated to helping businesses establish a powerful, mobile-first online presence in record time.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center mb-32">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-4xl font-black uppercase italic tracking-tighter">Our Mission</h2>
            <p className="text-white/40 leading-relaxed">
              In today's fast-paced digital world, a business without a website is a business that's invisible. Our mission is to bridge the gap between complex technology and small business owners. We believe that professional web design should be accessible, affordable, and fast.
            </p>
            <p className="text-white/40 leading-relaxed">
              We don't just build websites; we build growth engines. Every line of code we write and every pixel we place is optimized for one thing: conversion.
            </p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="aspect-square bg-white/5 rounded-[3rem] border border-white/10 overflow-hidden"
          >
            <img 
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200" 
              alt="Our Team" 
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: Zap, title: 'Speed', desc: '24-48 hour delivery for standard projects.' },
            { icon: Shield, title: 'Trust', desc: 'Secure, reliable, and professional service.' },
            { icon: Users, title: 'Community', desc: 'Trusted by 50+ businesses across India.' },
            { icon: Globe, title: 'Reach', desc: 'SEO optimized to help you reach more clients.' }
          ].map((item, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="bg-white/5 border border-white/10 p-10 rounded-[2.5rem] space-y-6"
            >
              <div className="w-12 h-12 bg-[#c7c42a] rounded-xl flex items-center justify-center text-black">
                <item.icon size={24} />
              </div>
              <div className="space-y-2">
                <h3 className="font-black uppercase italic tracking-tighter">{item.title}</h3>
                <p className="text-white/40 text-xs font-medium leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
