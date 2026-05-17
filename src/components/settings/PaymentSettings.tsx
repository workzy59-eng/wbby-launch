import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Landmark, QrCode, ShieldCheck, Loader2, Check, Plus } from 'lucide-react';
import { UserProfile } from '../../types';
import { updateUserProfile } from '../../services/database';
import { toast } from 'react-hot-toast';

interface PaymentSettingsProps {
  profile: UserProfile;
}

export const PaymentSettings: React.FC<PaymentSettingsProps> = ({ profile }) => {
  const isAdmin = profile?.role === 'admin';
  const [isSaving, setIsSaving] = useState(false);

  // Admin State
  const [adminData, setAdminData] = useState({
    upiId: profile?.paymentDetails?.upiId || '',
    bankDetails: {
      accountName: profile?.paymentDetails?.bankDetails?.accountName || '',
      accountNumber: profile?.paymentDetails?.bankDetails?.accountNumber || '',
      ifscCode: profile?.paymentDetails?.bankDetails?.ifscCode || ''
    }
  });

  const handleAdminSave = async () => {
    setIsSaving(true);
    try {
      await updateUserProfile(profile?.uid, { paymentDetails: adminData });
      toast.success('Payment details updated');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update');
    } finally {
      setIsSaving(false);
    }
  };

  if (isAdmin) {
    return (
      <div className="space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* UPI Settings */}
          <div className="space-y-6 bg-white/5 border border-white/10 rounded-[2.5rem] p-8">
            <div className="flex items-center gap-4 text-[#c7c42a]">
              <QrCode size={24} />
              <h3 className="text-xl font-black uppercase italic tracking-tighter">UPI Configuration</h3>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">UPI ID</label>
                <input 
                  type="text"
                  value={adminData.upiId}
                  onChange={(e) => setAdminData({ ...adminData, upiId: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm outline-none focus:border-[#c7c42a]/50 transition-all"
                  placeholder="example@upi"
                />
            </div>
          </div>

          {/* Bank Settings */}
          <div className="space-y-6 bg-white/5 border border-white/10 rounded-[2.5rem] p-8">
            <div className="flex items-center gap-4 text-[#c7c42a]">
              <Landmark size={24} />
              <h3 className="text-xl font-black uppercase italic tracking-tighter">Bank Details</h3>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">Account Name</label>
                <input 
                  type="text"
                  value={adminData.bankDetails.accountName}
                  onChange={(e) => setAdminData({ 
                    ...adminData, 
                    bankDetails: { ...adminData.bankDetails, accountName: e.target.value } 
                  })}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm outline-none focus:border-[#c7c42a]/50 transition-all"
                  placeholder="Business Name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">Account Number</label>
                <input 
                  type="text"
                  value={adminData.bankDetails.accountNumber}
                  onChange={(e) => setAdminData({ 
                    ...adminData, 
                    bankDetails: { ...adminData.bankDetails, accountNumber: e.target.value } 
                  })}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm outline-none focus:border-[#c7c42a]/50 transition-all"
                  placeholder="000000000000"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">IFSC Code</label>
                <input 
                  type="text"
                  value={adminData.bankDetails.ifscCode}
                  onChange={(e) => setAdminData({ 
                    ...adminData, 
                    bankDetails: { ...adminData.bankDetails, ifscCode: e.target.value } 
                  })}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm outline-none focus:border-[#c7c42a]/50 transition-all"
                  placeholder="SBIN0000000"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            onClick={handleAdminSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-8 py-4 bg-[#c7c42a] text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(199,196,42,0.2)]"
          >
            {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
            Save Payment Settings
          </button>
        </div>
      </div>
    );
  }

  // Client View
  return (
    <div className="space-y-8">
      <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#c7c42a]/10 rounded-2xl flex items-center justify-center text-[#c7c42a]">
              <CreditCard size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">Current Plan</h3>
              <p className="text-white/40 text-xs italic uppercase tracking-widest">Your current service plan.</p>
            </div>
          </div>
          <span className="px-4 py-2 bg-[#c7c42a] text-black rounded-full text-[10px] font-black uppercase tracking-widest">
            {profile?.plan || 'Standard'} Plan
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
          <div className="p-6 bg-black/40 border border-white/5 rounded-3xl space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Pricing Model</p>
            <p className="text-lg font-black text-white italic tracking-tighter">One-Time Payment</p>
          </div>
          <div className="p-6 bg-black/40 border border-white/5 rounded-3xl space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Status</p>
            <p className="text-lg font-black text-[#c7c42a] italic tracking-tighter uppercase">Active</p>
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button className="flex-1 py-4 bg-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all">
            Upgrade Plan
          </button>
          <button className="flex-1 py-4 bg-white/5 text-white/40 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all">
            View History
          </button>
        </div>
      </div>

      <div className="bg-blue-500/5 border border-blue-500/10 rounded-[2.5rem] p-8 flex items-center gap-6">
        <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
          <ShieldCheck size={32} />
        </div>
        <div>
          <h4 className="text-lg font-black uppercase italic tracking-tighter text-white">Secure Payments</h4>
          <p className="text-white/40 text-xs italic">All transactions are encrypted and processed securely via our payment partners.</p>
        </div>
      </div>
    </div>
  );
};
