import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, User, Mail, Phone, Check, Loader2, MapPin, Building, Search, ChevronDown } from 'lucide-react';
import { UserProfile } from '../../types';
import { updateUserProfile, uploadFile } from '../../services/database';
import { toast } from 'react-hot-toast';
import { INDIAN_STATES, CITIES_BY_STATE } from '../../lib/locationData';

interface ProfileSettingsProps {
  profile: UserProfile;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ profile }) => {
  const [formData, setFormData] = useState({
    displayName: profile.displayName || '',
    phone: profile.phone || '',
    photoURL: profile.photoURL || '',
    address: profile.address || '',
    state: profile.state || '',
    city: profile.city || '',
    pincode: profile.pincode || ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const availableCities = useMemo(() => {
    if (!formData.state) return [];
    return CITIES_BY_STATE[formData.state] || [];
  }, [formData.state]);

  const filteredCities = useMemo(() => {
    return availableCities.filter(city => 
      city.toLowerCase().includes(citySearch.toLowerCase())
    );
  }, [availableCities, citySearch]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview locally
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, photoURL: reader.result as string }));
    };
    reader.readAsDataURL(file);

    setIsUploading(true);
    try {
      const url = await uploadFile(file, `profiles/${profile.uid}`);
      setFormData(prev => ({ ...prev, photoURL: url }));
      toast.success('Profile picture uploaded');
    } catch (error) {
      console.error(error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (formData.pincode && !/^\d{6}$/.test(formData.pincode)) {
      toast.error('Please enter a valid 6-digit pincode');
      return;
    }

    setIsSaving(true);
    try {
      await updateUserProfile(profile.uid, formData);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-center gap-8">
        <div className="relative group">
          <div className="w-32 h-32 rounded-[2rem] overflow-hidden bg-white/5 border-2 border-white/10 group-hover:border-[#c7c42a]/50 transition-all">
            {formData.photoURL ? (
              <img 
                src={formData.photoURL} 
                alt={profile.displayName} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/20">
                <User size={48} />
              </div>
            )}
            {isUploading && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <Loader2 className="text-[#c7c42a] animate-spin" size={24} />
              </div>
            )}
          </div>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-2 -right-2 p-3 bg-[#c7c42a] text-black rounded-2xl shadow-xl hover:scale-110 transition-all"
          >
            <Camera size={18} />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*"
          />
        </div>
        <div className="text-center sm:text-left space-y-1">
          <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white">Profile Photo</h3>
          <p className="text-white/40 text-sm italic">Upload a high-resolution image for your profile.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">Full Name</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
            <input 
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-sm outline-none focus:border-[#c7c42a]/50 transition-all"
              placeholder="Your full name"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
            <input 
              type="email"
              value={profile.email}
              readOnly
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white/40 text-sm outline-none cursor-not-allowed"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">Phone Number</label>
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
          <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">Pincode Check</label>
          <div className="relative">
            <Check className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
            <input 
              type="text"
              maxLength={6}
              value={formData.pincode}
              onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '') })}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-sm outline-none focus:border-[#c7c42a]/50 transition-all"
              placeholder="6-digit Pincode"
            />
          </div>
        </div>

        <div className="md:col-span-2 space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">Street Address</label>
          <div className="relative">
            <Building className="absolute left-4 top-4 text-white/20" size={18} />
            <textarea 
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-sm outline-none focus:border-[#c7c42a]/50 transition-all resize-none"
              placeholder="Building, Street, Area..."
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">State (First)</label>
          <div className="relative">
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" size={18} />
            <select 
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value, city: '' })}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm outline-none focus:border-[#c7c42a]/50 transition-all appearance-none"
            >
              <option value="" className="bg-[#111]">Select State</option>
              {INDIAN_STATES.map(state => (
                <option key={state} value={state} className="bg-[#111]">{state}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2 relative">
          <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">City (Last)</label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
            <input 
              type="text"
              value={formData.city || citySearch}
              onFocus={() => setIsCityDropdownOpen(true)}
              onChange={(e) => {
                setCitySearch(e.target.value);
                setFormData({ ...formData, city: '' });
                setIsCityDropdownOpen(true);
              }}
              disabled={!formData.state}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-sm outline-none focus:border-[#c7c42a]/50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              placeholder={formData.state ? "Search city..." : "Select state first"}
            />
            
            <AnimatePresence>
              {isCityDropdownOpen && formData.state && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsCityDropdownOpen(false)} />
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute left-0 right-0 top-full mt-2 bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl z-50 max-h-60 overflow-y-auto custom-scrollbar"
                  >
                    {filteredCities.length > 0 ? (
                      filteredCities.map(city => (
                        <button
                          key={city}
                          onClick={() => {
                            setFormData({ ...formData, city });
                            setCitySearch(city);
                            setIsCityDropdownOpen(false);
                          }}
                          className="w-full text-left px-6 py-3 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          {city}
                        </button>
                      ))
                    ) : (
                      <div className="px-6 py-4 text-xs text-white/20 italic">No cities found. Try typing...</div>
                    )}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-8 py-4 bg-[#c7c42a] text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(199,196,42,0.2)]"
        >
          {isSaving ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <Check size={16} />
          )}
          Save Changes
        </button>
      </div>
    </div>
  );
};
