import React from 'react';
import { motion } from 'motion/react';
import SEO from '../components/SEO';

export default function Privacy() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-40 pb-20 px-10"
    >
      <SEO title="Privacy Policy – WebbyLaunch" />
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="space-y-6">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl font-black uppercase italic tracking-tighter"
          >
            Privacy <span className="text-[#6366F1]">Policy.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-white/40 text-sm font-bold uppercase tracking-widest"
          >
            Last Updated: April 8, 2026
          </motion.p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8 text-white/60 leading-relaxed">
          <section className="space-y-4">
            <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">1. Introduction</h2>
            <p>Welcome to WebbyLaunch. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">2. Data We Collect</h2>
            <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Identity Data includes first name, last name, username or similar identifier.</li>
              <li>Contact Data includes email address and telephone numbers.</li>
              <li>Technical Data includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location.</li>
              <li>Usage Data includes information about how you use our website, products and services.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">3. How We Use Your Data</h2>
            <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>To register you as a new customer.</li>
              <li>To process and deliver your order.</li>
              <li>To manage our relationship with you.</li>
              <li>To improve our website, products/services, marketing or customer relationships.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">4. Data Security</h2>
            <p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">5. Contact Us</h2>
            <p>If you have any questions about this privacy policy or our privacy practices, please contact us at: webbylaunch@gmail.com</p>
          </section>
        </div>
      </div>
    </motion.div>
  );
}
