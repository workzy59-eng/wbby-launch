import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Building2, Mail, Phone, Globe, Image as ImageIcon, Loader2, Check, Camera } from 'lucide-react';
import { UserProfile } from '../../types';
import { updateUserProfile, uploadFile } from '../../services/database';
import { toast } from 'react-hot-toast';

interface BusinessSettingsProps {
  profile: UserProfile;
}

export const BusinessSettings: React.FC<BusinessSettingsProps> = ({ profile }) => {
  const [formData, setFormData] = useState({
    name: profile.businessInfo?.name || '',
    email: profile.businessInfo?.email || '',
    phone: profile.businessInfo?.phone || '',
    website: profile.businessInfo?.website || '',
    logo: profile.businessInfo?.logo || ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await uploadFile(file, `business/logo`);
      setFormData(prev => ({ ...prev, logo: url }));
      toast.success('Logo uploaded');
    } catch (error) {
      console.error(error);
      toast.error('Failed to upload logo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateUserProfile(profile.uid, { businessInfo: formData });
      toast.success('Business information updated');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row items-center gap-8">
        <div className="text-center sm:text-left space-y-1">
          <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white">Business Information</h3>
          <p className="text-white/40 text-sm italic">Update your business contact details below.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">Business Name</label>
          <div className="relative">
            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
            <input 
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-sm outline-none focus:border-[#c7c42a]/50 transition-all"
              placeholder="WebbyLaunch"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">Business Email</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
            <input 
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-sm outline-none focus:border-[#c7c42a]/50 transition-all"
              placeholder="hello@webbylaunch.com"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">Business Phone</label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
            <input 
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-sm outline-none focus:border-[#c7c42a]/50 transition-all"
              placeholder="+91 00000 00000"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">Website URL</label>
          <div className="relative">
            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
            <input 
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-sm outline-none focus:border-[#c7c42a]/50 transition-all"
              placeholder="https://webbylaunch.com"
            />
          </div>
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-8 py-4 bg-[#c7c42a] text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(199,196,42,0.2)]"
        >
          {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
          Save Business Info
        </button>
      </div>
    </div>
  );
};
