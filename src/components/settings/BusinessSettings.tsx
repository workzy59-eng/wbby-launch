import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Building2, Mail, Phone, Globe, Image as ImageIcon, Loader2, Check, Camera, Download } from 'lucide-react';
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
  const [logoMetadata, setLogoMetadata] = useState<any>(profile.businessInfo?.logoMetadata || null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      toast.error('File too large. Max size is 10MB.');
      return;
    }

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload PNG, JPG, SVG or WEBP.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    try {
      const response = await uploadFile(file, `logos`, (progress) => {
        setUploadProgress(progress);
      });
      
      const metadata = {
        secure_url: response.secure_url,
        public_id: response.public_id,
        original_filename: response.original_filename,
        resource_type: response.resource_type
      };

      setFormData(prev => ({ ...prev, logo: response.secure_url }));
      setLogoMetadata(metadata);
      toast.success('Logo uploaded successfully');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to upload logo');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateUserProfile(profile.uid, { 
        businessInfo: { 
          ...formData,
          logoMetadata 
        } 
      });
      toast.success('Business information updated');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update');
    } finally {
      setIsSaving(false);
    }
  };

  const getFocedDownloadUrl = (url: string) => {
    if (!url) return '';
    return url.replace('/upload/', '/upload/fl_attachment/');
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row items-center gap-8">
        <div className="relative group">
          <div className="w-32 h-32 rounded-3xl overflow-hidden border-2 border-white/10 bg-white/5 flex items-center justify-center relative">
            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="animate-spin text-[#c7c42a]" size={32} />
                <span className="text-[10px] font-black text-[#c7c42a]">{uploadProgress}%</span>
              </div>
            ) : formData.logo ? (
              <img src={formData.logo} alt="Business Logo" className="w-full h-full object-contain" />
            ) : (
              <Building2 className="text-white/10" size={48} />
            )}
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all cursor-pointer"
            >
              <Camera className="text-white mb-2" size={24} />
              <span className="text-[8px] font-black uppercase tracking-widest text-white">Change Logo</span>
            </button>
          </div>
          
          {formData.logo && (
            <div className="absolute -bottom-3 -right-3 flex gap-2">
              <button 
                onClick={() => window.open(formData.logo, '_blank')}
                className="p-3 bg-white/10 backdrop-blur-md text-white rounded-2xl shadow-xl hover:scale-110 hover:bg-white hover:text-black transition-all border border-white/10"
                title="Open Logo"
              >
                <ImageIcon size={16} />
              </button>
              <button 
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = getFocedDownloadUrl(formData.logo);
                  link.download = logoMetadata?.original_filename || 'business-logo';
                  link.target = '_blank';
                  link.click();
                }}
                className="p-3 bg-yellow-400 text-black rounded-2xl shadow-xl hover:scale-110 transition-all"
                title="Download Logo"
              >
                <Download size={16} />
              </button>
            </div>
          )}
          
          <input 
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
            className="hidden"
          />
        </div>

        <div className="text-center sm:text-left space-y-1">
          <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white">Business Information</h3>
          <p className="text-white/40 text-sm italic">Update your business contact details and logo below.</p>
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
              placeholder="hello@webbylaunch.vercel.app"
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
              placeholder="https://webbylaunch.vercel.app"
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
