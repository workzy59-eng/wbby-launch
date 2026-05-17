import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [stateSearch, setStateSearch] = useState('');
  const [isStateDropdownOpen, setIsStateDropdownOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredStates = useMemo(() => {
    return INDIAN_STATES.filter(state => 
      state.toLowerCase().includes(stateSearch.toLowerCase())
    );
  }, [stateSearch]);

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-[#ffffff60] ml-1">Full Name</label>
          <div className="relative group">
            <User className="absolute left-6 top-1/2 -translate-y-1/2 text-[#c7c42a]/20 group-focus-within:text-[#c7c42a] transition-all" size={20} />
            <input 
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              className="w-full bg-[#0a0a0a] border border-white/5 rounded-[1.5rem] py-6 pl-16 pr-6 text-white text-base font-bold outline-none focus:border-[#c7c42a]/30 focus:bg-[#0d0d0d] transition-all placeholder:text-white/5 shadow-inner"
              placeholder="Your full name"
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-[#ffffff60] ml-1">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-white/5" size={20} />
            <input 
              type="email"
              value={profile.email}
              readOnly
              className="w-full bg-[#050505] border border-white/5 rounded-[1.5rem] py-6 pl-16 pr-6 text-white/20 text-base font-bold outline-none cursor-not-allowed opacity-60"
            />
            <div className="absolute right-6 top-1/2 -translate-y-1/2 px-3 py-1 bg-white/5 rounded-lg text-[8px] font-black uppercase tracking-widest text-white/20">Verified</div>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-[#ffffff60] ml-1">Phone Number</label>
          <div className="relative group">
            <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-[#c7c42a]/20 group-focus-within:text-[#c7c42a] transition-all" size={20} />
            <input 
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-[#0a0a0a] border border-white/5 rounded-[1.5rem] py-6 pl-16 pr-6 text-white text-base font-bold outline-none focus:border-[#c7c42a]/30 focus:bg-[#0d0d0d] transition-all placeholder:text-white/5 shadow-inner"
              placeholder="+91 00000 00000"
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-[#ffffff60] ml-1">Pincode Check</label>
          <div className="relative group">
            <Check className="absolute left-6 top-1/2 -translate-y-1/2 text-[#c7c42a]/20 group-focus-within:text-[#c7c42a] transition-all" size={20} />
            <input 
              type="text"
              maxLength={6}
              value={formData.pincode}
              onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '') })}
              className="w-full bg-[#0a0a0a] border border-white/5 rounded-[1.5rem] py-6 pl-16 pr-6 text-white text-base font-bold outline-none focus:border-[#c7c42a]/30 focus:bg-[#0d0d0d] transition-all placeholder:text-white/5 shadow-inner"
              placeholder="123456"
            />
          </div>
        </div>

        <div className="md:col-span-2 space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-[#ffffff60] ml-1">Street Address</label>
          <div className="relative group">
            <Building className="absolute left-6 top-6 text-[#c7c42a]/20 group-focus-within:text-[#c7c42a] transition-all" size={20} />
            <textarea 
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={4}
              className="w-full bg-[#0a0a0a] border border-white/5 rounded-[1.5rem] py-6 pl-16 pr-6 text-white text-base font-bold outline-none focus:border-[#c7c42a]/30 focus:bg-[#0d0d0d] transition-all resize-none placeholder:text-white/5 shadow-inner"
              placeholder="Enter your full business or residence address"
            />
          </div>
        </div>

        <div className="space-y-3 relative">
          <label className="text-[10px] font-black uppercase tracking-widest text-[#ffffff60] ml-1">State Selection</label>
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[#c7c42a]/20 group-focus-within:text-[#c7c42a] transition-all" size={20} />
            <input 
              type="text"
              value={formData.state || stateSearch}
              onFocus={() => setIsStateDropdownOpen(true)}
              onChange={(e) => {
                setStateSearch(e.target.value);
                setFormData({ ...formData, state: '', city: '' });
                setIsStateDropdownOpen(true);
              }}
              className="w-full bg-[#0a0a0a] border border-white/5 rounded-[1.5rem] py-6 pl-16 pr-6 text-white text-base font-bold outline-none focus:border-[#c7c42a]/30 focus:bg-[#0d0d0d] transition-all placeholder:text-white/5 shadow-inner"
              placeholder="Select State"
            />
            <ChevronDown className={`absolute right-6 top-1/2 -translate-y-1/2 text-white/20 transition-transform duration-300 ${isStateDropdownOpen ? 'rotate-180' : ''}`} size={16} />
            <AnimatePresence>
              {isStateDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsStateDropdownOpen(false)} />
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute left-0 right-0 top-full mt-2 bg-[#0a0a0a] border border-white/10 rounded-[1.5rem] shadow-2xl z-50 max-h-60 overflow-y-auto custom-scrollbar backdrop-blur-3xl"
                  >
                    {filteredStates.length > 0 ? (
                      filteredStates.map(state => (
                        <button
                          key={state}
                          onClick={() => {
                            setFormData({ ...formData, state, city: '' });
                            setStateSearch(state);
                            setCitySearch('');
                            setIsStateDropdownOpen(false);
                          }}
                          className="w-full text-left px-6 py-4 text-xs text-white/50 hover:text-[#c7c42a] hover:bg-[#c7c42a]/5 transition-all border-b border-white/5 last:border-0 uppercase font-black italic tracking-tighter"
                        >
                          {state}
                        </button>
                      ))
                    ) : (
                      <div className="px-6 py-8 text-center text-[10px] font-black uppercase tracking-widest text-white/20 italic">No states matched.</div>
                    )}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="space-y-3 relative">
          <label className="text-[10px] font-black uppercase tracking-widest text-[#ffffff60] ml-1">City Selection</label>
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[#c7c42a]/20 group-focus-within:text-[#c7c42a] transition-all" size={20} />
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
              className="w-full bg-[#0a0a0a] border border-white/5 rounded-[1.5rem] py-6 pl-16 pr-6 text-white text-base font-bold outline-none focus:border-[#c7c42a]/30 focus:bg-[#0d0d0d] transition-all disabled:opacity-30 disabled:cursor-not-allowed placeholder:text-white/5 shadow-inner"
              placeholder={formData.state ? "Select City" : "Select state first"}
            />
            <ChevronDown className={`absolute right-6 top-1/2 -translate-y-1/2 text-white/20 transition-transform duration-300 ${isCityDropdownOpen ? 'rotate-180' : ''}`} size={16} />
            
            <AnimatePresence>
              {isCityDropdownOpen && formData.state && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsCityDropdownOpen(false)} />
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute left-0 right-0 top-full mt-2 bg-[#0a0a0a] border border-white/10 rounded-[1.5rem] shadow-2xl z-50 max-h-60 overflow-y-auto custom-scrollbar backdrop-blur-3xl"
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
                          className="w-full text-left px-6 py-4 text-xs text-white/50 hover:text-[#c7c42a] hover:bg-[#c7c42a]/5 transition-all border-b border-white/5 last:border-0 uppercase font-black italic tracking-tighter"
                        >
                          {city}
                        </button>
                      ))
                    ) : (
                      <div className="px-6 py-8 text-center text-[10px] font-black uppercase tracking-widest text-white/20 italic">No cities matched.</div>
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
