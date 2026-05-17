import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Download, Share2, CheckCircle2, CreditCard, FileText, Smartphone, Globe, ShieldCheck, Zap } from 'lucide-react';
import { Project, UserProfile } from '../types';
import { formatDate } from '../lib/utils';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { APP_NAME } from '../constants';
import { toast } from 'react-hot-toast';

interface InvoiceSystemProps {
  project: Project;
  profile: UserProfile | null;
  onClose: () => void;
}

export default function InvoiceSystem({ project, profile, onClose }: InvoiceSystemProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);

  const plans = {
    'starter': { name: 'Basic', price: 999, setupFee: 1999, features: ['1–3 pages website', 'Basic design', 'Hosting support'] },
    'food-court': { name: 'Standard', price: 5999, setupFee: 2999, features: ['5–7 pages website', 'SEO setup', 'Faster support'] },
    'autos': { name: 'Standard', price: 5999, setupFee: 2999, features: ['5–7 pages website', 'SEO setup', 'Faster support'] },
    'clothing': { name: 'Standard', price: 5999, setupFee: 2999, features: ['5–7 pages website', 'SEO setup', 'Faster support'] },
    'ai-custom': { name: 'Premium', price: 9999, setupFee: 4999, features: ['Full custom website', 'Admin panel', 'Priority support'] },
  };

  const selectedPlan = plans[project.templateId as keyof typeof plans] || plans['starter'];
  const setupFee = selectedPlan.setupFee;
  const totalAmount = selectedPlan.price + setupFee;
  const invoiceNumber = `INV-${project.id.slice(0, 8).toUpperCase()}`;
  const today = new Date();
  const dueDate = new Date();
  dueDate.setDate(today.getDate() + 7);

  const downloadPDF = async () => {
    if (!invoiceRef.current) return;
    
    toast.loading('Generating PDF...', { id: 'pdf-gen' });
    
    try {
      // Small delay to ensure everything is rendered
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#0a0a0a',
        logging: false,
        onclone: (clonedDoc) => {
          // Ensure the cloned element is visible for capture
          const el = clonedDoc.getElementById('invoice-content');
          if (el) el.style.maxHeight = 'none';
        }
      });
      
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      
      // Use a more robust download method
      const pdfBlob = pdf.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Invoice downloaded successfully', { id: 'pdf-gen' });
    } catch (error) {
      console.error('PDF Generation Error:', error);
      toast.error('Failed to generate PDF', { id: 'pdf-gen' });
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-10">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/90 backdrop-blur-xl"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-4xl bg-[#0a0a0a] rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Actions Header */}
        <div className="p-6 md:p-8 border-b border-white/5 flex justify-between items-center bg-black/50 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#c7c42a] rounded-xl flex items-center justify-center text-black">
              <FileText size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase italic tracking-tighter text-white">Invoice System</h2>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{invoiceNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={downloadPDF}
              className="flex items-center gap-2 bg-[#c7c42a] text-black px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(199,196,42,0.2)]"
            >
              <Download size={18} />
              <span className="hidden sm:inline">Download PDF</span>
            </button>
            <button 
              onClick={onClose}
              className="p-3 bg-white/5 hover:bg-red-500/20 text-white/70 hover:text-red-400 rounded-xl transition-all"
            >
              <CreditCard size={20} />
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div id="invoice-content" className="flex-1 overflow-y-auto p-6 md:p-12 space-y-12 custom-scrollbar" ref={invoiceRef}>
          {/* Brand Header */}
          <div className="flex flex-col md:flex-row justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center">
                  <span className="text-black font-black text-2xl italic tracking-tighter">Q</span>
                </div>
                <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white">{APP_NAME}</h1>
              </div>
              <div className="text-xs font-bold text-white/40 uppercase tracking-widest space-y-1">
                <p>webbylaunch@gmail.com</p>
                <p>webbylaunch.vercel.app</p>
              </div>
            </div>
            <div className="text-right space-y-2">
              <div className="inline-block px-4 py-1.5 bg-[#c7c42a]/10 border border-[#c7c42a]/20 rounded-full text-[10px] font-black uppercase tracking-widest text-[#c7c42a]">
                {project.status === 'Completed' ? 'PAID' : 'PENDING'}
              </div>
              <div className="text-xs font-bold text-white/40 uppercase tracking-widest">
                <p>Invoice Date: {formatDate(today.toISOString())}</p>
                <p>Due Date: {formatDate(dueDate.toISOString())}</p>
              </div>
            </div>
          </div>

          {/* Client Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 p-10 bg-white/5 rounded-[2.5rem] border border-white/5">
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-[#c7c42a] uppercase tracking-[0.3em]">Bill To</h3>
              <div>
                <p className="text-2xl font-black uppercase italic text-white">{project.businessName}</p>
                <p className="text-sm font-bold text-white/50 mt-1">{profile?.displayName || 'Valued Client'}</p>
              </div>
              <div className="text-xs font-bold text-white/30 uppercase tracking-widest space-y-1">
                <p>{project.businessPhone || profile?.email}</p>
                <p>{project.city}, {project.state}</p>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-[#c7c42a] uppercase tracking-[0.3em]">Project Details</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Globe size={14} className="text-white/40" />
                  <span className="text-xs font-black uppercase tracking-widest text-white/70">{project.businessType}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-white/40" />
                  <span className="text-xs font-black uppercase tracking-widest text-white/70">Secure SSL Included</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap size={14} className="text-white/40" />
                  <span className="text-xs font-black uppercase tracking-widest text-white/70">High Performance Hosting</span>
                </div>
              </div>
            </div>
          </div>

          {/* Plan Selected */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Selected Plan</h3>
            <div className="p-8 bg-[#c7c42a] rounded-[2.5rem] text-black flex flex-col md:flex-row justify-between items-center gap-8 shadow-[0_0_40px_rgba(199,196,42,0.1)]">
              <div className="space-y-2 text-center md:text-left">
                <h4 className="text-4xl font-black uppercase italic tracking-tighter">{selectedPlan.name}</h4>
                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                  {selectedPlan.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-60">
                      <CheckCircle2 size={12} />
                      {f}
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-center md:text-right">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Service Fee</p>
                <p className="text-4xl font-black tracking-tighter italic">₹{selectedPlan.price.toLocaleString()}/-</p>
              </div>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Pricing Breakdown</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-4 border-b border-white/5">
                <span className="text-sm font-bold text-white/60 uppercase tracking-widest">Premium Development Fee</span>
                <span className="text-lg font-black text-white italic">₹{selectedPlan.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-4 border-b border-white/5">
                <div className="space-y-1">
                  <span className="text-sm font-bold text-white/60 uppercase tracking-widest">Setup Fee</span>
                  <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Domain + Premium Hosting + SSL</p>
                </div>
                <span className="text-lg font-black text-white italic">₹{setupFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pt-8">
                <span className="text-2xl font-black text-[#c7c42a] uppercase italic tracking-tighter">Total Amount</span>
                <div className="relative group">
                  <div className="absolute -inset-4 bg-[#c7c42a] rounded-full opacity-20 blur-xl animate-pulse" />
                  <span className="text-5xl font-black text-[#c7c42a] italic tracking-tighter relative z-10">₹{totalAmount.toLocaleString()}/-</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-12 border-t border-white/5">
            <div className="space-y-6">
              <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Payment Methods</h3>
              <div className="space-y-4">
                <div className="p-6 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                  <p className="text-[10px] font-black text-[#c7c42a] uppercase tracking-widest">UPI Payment</p>
                  <p className="text-lg font-black text-white tracking-tighter">quicweb@upi</p>
                </div>
                <div className="p-6 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                  <p className="text-[10px] font-black text-[#c7c42a] uppercase tracking-widest">Bank Transfer</p>
                  <div className="text-xs font-bold text-white/60 space-y-1 uppercase tracking-widest">
                    <p>A/C: 98765432101234</p>
                    <p>IFSC: QUIC0001234</p>
                    <p>Bank: Digital Growth Bank</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center p-8 bg-white/5 rounded-[2.5rem] border border-white/5 text-center space-y-4">
              <div className="w-32 h-32 bg-white p-2 rounded-2xl">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=webbylaunch@upi&pn=WebbyLaunch&am=${totalAmount}&cu=INR`} 
                  alt="Payment QR" 
                  className="w-full h-full"
                />
              </div>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Scan to pay securely</p>
            </div>
          </div>

          {/* Terms */}
          <div className="p-10 bg-white/5 rounded-[2.5rem] border border-white/5 space-y-6">
            <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Terms & Conditions</h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4">
              {[
                'Advance payment required to start',
                'Setup fee is non-refundable',
                'Maintenance billed annually',
                'Delay in payment may pause website',
                'Extra features cost additional',
                'Support available 24/7'
              ].map((term, i) => (
                <li key={i} className="flex items-start gap-3 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                  <div className="w-1.5 h-1.5 bg-[#c7c42a] rounded-full mt-1 shrink-0" />
                  {term}
                </li>
              ))}
            </ul>
          </div>

          {/* Footer */}
          <div className="text-center py-12 space-y-4">
            <p className="text-2xl font-black uppercase italic tracking-tighter text-white">Thank you for choosing {APP_NAME}!</p>
            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Building the future of the web together.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
