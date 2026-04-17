import React from 'react';
import { motion } from 'motion/react';
import SEO from '../components/SEO';

export default function Terms() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-40 pb-20 px-10"
    >
      <SEO title="Terms of Service – WebbyLaunch" />
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="space-y-6">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl font-black uppercase italic tracking-tighter"
          >
            Terms of <span className="text-[#cfcb11]">Service.</span>
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
            <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">1. Agreement to Terms</h2>
            <p>By accessing or using WebbyLaunch, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">2. Use License</h2>
            <p>Permission is granted to temporarily download one copy of the materials (information or software) on WebbyLaunch's website for personal, non-commercial transitory viewing only.</p>
            <p>This is the grant of a license, not a transfer of title, and under this license you may not:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>modify or copy the materials;</li>
              <li>use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
              <li>attempt to decompile or reverse engineer any software contained on WebbyLaunch's website;</li>
              <li>remove any copyright or other proprietary notations from the materials; or</li>
              <li>transfer the materials to another person or "mirror" the materials on any other server.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">3. Disclaimer</h2>
            <p>The materials on WebbyLaunch's website are provided on an 'as is' basis. WebbyLaunch makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">4. Limitations</h2>
            <p>In no event shall WebbyLaunch or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on WebbyLaunch's website, even if WebbyLaunch or a WebbyLaunch authorized representative has been notified orally or in writing of the possibility of such damage.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">5. Governing Law</h2>
            <p>These terms and conditions are governed by and construed in accordance with the laws of India and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.</p>
          </section>
        </div>
      </div>
    </motion.div>
  );
}
