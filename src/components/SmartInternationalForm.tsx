import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Building2, Mail, Phone, MapPin, Briefcase, 
  DollarSign, MessageSquare, ChevronDown, Check, 
  AlertCircle, Globe, Search, ArrowRight, Loader2,
  ShieldCheck, Zap, CreditCard, Sparkles
} from 'lucide-react';
import StateCityDropdown from './StateCityDropdown';
import { useGeoLocation } from '../hooks/useGeoLocation';
import { useRegion, type Country } from '../context/RegionContext';
import { toast } from 'react-hot-toast';

// --- Data & Types ---

interface FormState {
  fullName: string;
  businessName: string;
  email: string;
  phone: string;
  country: Country;
  state: string;
  city: string;
  postalCode: string;
  projectType: string;
  budget: string;
  message: string;
}

const PROJECT_TYPES = [
  'E-commerce Website',
  'SaaS Platform',
  'Portfolio & Bio-link',
  'Corporate Website',
  'Custom Web App',
  'Booking System'
];

// --- Helper Functions ---

const validateEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.toLowerCase().trim());
};

const validatePhone = (phone: string, country: Country) => {
  const clean = phone.replace(/\s/g, '');
  if (country === 'India') {
    return /^\+91\d{10}$/.test(clean);
  }
  if (country === 'United States') {
    return /^\+1\d{10}$/.test(clean);
  }
  if (country === 'United Kingdom') {
    return /^\+44\d{10,11}$/.test(clean);
  }
  return false;
};

const validatePostalCode = (code: string, country: Country) => {
  const clean = code.toUpperCase().trim();
  if (country === 'India') {
    return /^\d{6}$/.test(clean);
  }
  if (country === 'United States') {
    return /^\d{5}(-\d{4})?$/.test(clean);
  }
  if (country === 'United Kingdom') {
    return /^[A-Z]{1,2}[0-9][A-Z0-9]? [0-9][A-Z]{2}$/i.test(clean);
  }
  return false;
};

// --- Components ---

const SmartInput = ({ 
  label, icon: Icon, value, onChange, placeholder, error, type = "text", success, id
}: { 
  label: string, icon: any, value: string, onChange: (val: string) => void, placeholder: string, error?: string, type?: string, success?: boolean, id: string
}) => (
  <div className="space-y-2 w-full group">
    <label htmlFor={id} className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-4 group-focus-within:text-[#c7c42a] transition-all">
      {label}
    </label>
    <div className="relative">
      <div className={`absolute left-5 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all ${error ? 'text-red-500' : success ? 'text-green-500' : 'text-white/20 group-focus-within:text-[#c7c42a]'}`}>
        <Icon size={18} />
      </div>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-white/5 border-[1.5px] rounded-2xl py-4 pl-14 pr-12 text-white placeholder:text-white/10 outline-none transition-all focus:bg-white/10 ${
          error ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.1)] animate-shake' : 
          success ? 'border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.1)]' : 
          'border-white/10 focus:border-[#c7c42a]/50'
        }`}
      />
      <div className="absolute right-5 top-1/2 -translate-y-1/2">
        <AnimatePresence mode="wait">
          {error && (
            <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}>
              <AlertCircle size={18} className="text-red-500" />
            </motion.div>
          )}
          {success && !error && (
            <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}>
              <Check size={18} className="text-green-500" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
    <AnimatePresence>
      {error && (
        <motion.p 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }} 
          exit={{ opacity: 0, y: -10 }}
          className="text-[10px] font-bold text-red-500 ml-4 italic"
        >
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  </div>
);

export default function SmartInternationalForm() {
  const { geoData, loading: geoLoading } = useGeoLocation();
  const { country: globalCountry, setCountry: setGlobalCountry, currency, symbol, gateway, pricing: globalPricing, paymentLinks } = useRegion();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<FormState>({
    fullName: '',
    businessName: '',
    email: '',
    phone: '',
    country: globalCountry,
    state: '',
    city: '',
    postalCode: '',
    projectType: '',
    budget: '',
    message: ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});

  // Sync internal country with global context if global context changes (e.g. on mount or detection)
  useEffect(() => {
    setForm(prev => ({ ...prev, country: globalCountry }));
  }, [globalCountry]);

  // Auto-detect country
  useEffect(() => {
    if (geoData && !localStorage.getItem('webbylaunch_region')) {
      let detectedCountry: Country = 'India';
      if (geoData.country_name === 'United States') detectedCountry = 'United States';
      if (geoData.country_name === 'United Kingdom') detectedCountry = 'United Kingdom';
      
      setGlobalCountry(detectedCountry);
      setForm(prev => ({ 
        ...prev, 
        country: detectedCountry,
        phone: detectedCountry === 'India' ? '+91 ' : detectedCountry === 'United States' ? '+1 ' : '+44 '
      }));
    }
  }, [geoData, setGlobalCountry]);

  // Validation logic
  const validateField = (field: keyof FormState, value: string) => {
    let error = '';
    switch (field) {
      case 'fullName':
        if (value.length < 2) error = 'Name is too short';
        break;
      case 'businessName':
        if (value.length < 2) error = 'Business name required';
        break;
      case 'email':
        if (!validateEmail(value)) error = 'Invalid email address';
        break;
      case 'phone':
        if (!validatePhone(value, form.country)) error = `Invalid ${form.country} phone format`;
        break;
      case 'postalCode':
        if (!validatePostalCode(value, form.country)) error = 'Invalid postal/zip code';
        break;
      case 'state':
        if (!value) error = 'Please select a state';
        break;
      case 'city':
        if (!value) error = 'Please select a city';
        break;
      case 'projectType':
        if (!value) error = 'Please select project type';
        break;
      case 'budget':
        if (!value) error = 'Please select a budget range';
        break;
    }
    return error;
  };

  const handleInputChange = (field: keyof FormState, value: string) => {
    let processedValue = value;
    if (field === 'email') processedValue = value.toLowerCase().trim();
    
    setForm(prev => ({ ...prev, [field]: processedValue }));
    
    if (touched[field]) {
      const error = validateField(field, processedValue);
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const handleBlur = (field: keyof FormState) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, form[field]);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: any = {};
    Object.keys(form).forEach(key => {
      const error = validateField(key as keyof FormState, (form as any)[key]);
      if (error) newErrors[key] = error;
    });

    setErrors(newErrors);
    setTouched(Object.keys(form).reduce((acc, key) => ({ ...acc, [key]: true }), {}));

    if (Object.keys(newErrors).length > 0) {
      toast.error('Please fix form errors');
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success('Project inquiry sent successfully!');
      
      if (form.country === 'India' && form.budget) {
        const link = (paymentLinks as any)[form.budget];
        if (link && link !== '#') {
          setTimeout(() => {
            window.location.href = link;
          }, 1000);
        }
      }
    }, 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-8">
      <form onSubmit={handleSubmit} className="space-y-12">
        
        {/* Progress Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-8">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#c7c42a]">
              <Sparkles size={16} className="animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Smart Form System</span>
            </div>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">
              Start Your<br />
              <span className="text-[#c7c42a]">Project</span>
            </h1>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl flex items-center gap-6">
            <div className="space-y-1">
              <p className="text-[8px] font-black uppercase tracking-widest text-white/40">Market Region</p>
              <div className="flex items-center gap-2 font-black italic uppercase tracking-tighter">
                {form.country === 'India' ? '🇮🇳' : form.country === 'United States' ? '🇺🇸' : '🇬🇧'}
                {form.country}
              </div>
            </div>
            <div className="w-px h-8 bg-white/10" />
                <div className="space-y-1">
                  <p className="text-[8px] font-black uppercase tracking-widest text-white/40">Payment Ready</p>
                  <div className="flex items-center gap-2 font-black italic uppercase tracking-tighter text-[#c7c42a]">
                    <ShieldCheck size={14} />
                    {gateway}
                  </div>
                </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Column 1: Personal & Business */}
          <div className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.4em] text-white/20 border-l-2 border-[#c7c42a] pl-4">Account Integrity</h3>
            
            <SmartInput 
              id="fullName"
              label="Full Name"
              icon={User}
              placeholder="John Doe"
              value={form.fullName}
              onChange={(val) => handleInputChange('fullName', val)}
              error={errors.fullName}
              success={touched.fullName && !errors.fullName}
            />

            <SmartInput 
              id="businessName"
              label="Business Name"
              icon={Building2}
              placeholder="Global Tech Ltd"
              value={form.businessName}
              onChange={(val) => handleInputChange('businessName', val)}
              error={errors.businessName}
              success={touched.businessName && !errors.businessName}
            />

            <SmartInput 
              id="email"
              label="Professional Email"
              icon={Mail}
              type="email"
              placeholder="john@business.co"
              value={form.email}
              onChange={(val) => handleInputChange('email', val)}
              error={errors.email}
              success={touched.email && !errors.email}
            />

            <SmartInput 
              id="phone"
              label="Phone Number"
              icon={Phone}
              placeholder={form.country === 'India' ? '+91 90000 00000' : '+1 555 000 0000'}
              value={form.phone}
              onChange={(val) => handleInputChange('phone', val)}
              error={errors.phone}
              success={touched.phone && !errors.phone}
            />
          </div>

          {/* Column 2: Location & Project */}
          <div className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.4em] text-white/20 border-l-2 border-[#c7c42a] pl-4">Operational Footprint</h3>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-4 group-focus-within:text-[#c7c42a]">Country Base</label>
              <div className="grid grid-cols-3 gap-2">
                {(['India', 'United States', 'United Kingdom'] as Country[]).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      const prefix = c === 'India' ? '+91 ' : c === 'United States' ? '+1 ' : '+44 ';
                      setGlobalCountry(c);
                      setForm(prev => ({ ...prev, country: c, phone: prefix, state: '', city: '' }));
                    }}
                    className={`py-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                      form.country === c 
                        ? 'bg-[#c7c42a] border-[#c7c42a] text-black shadow-lg shadow-[#c7c42a]/20' 
                        : 'bg-white/5 border-white/10 text-white/40 hover:border-white/30'
                    }`}
                  >
                    {c === 'India' ? 'IN' : c === 'United States' ? 'US' : 'UK'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-4">Strategic Location</label>
              <StateCityDropdown 
                country={form.country}
                onSelect={(state, city) => {
                  handleInputChange('state', state);
                  handleInputChange('city', city);
                }}
                error={errors.state || errors.city}
              />
            </div>

            <SmartInput 
              id="postalCode"
              label={form.country === 'India' ? 'PIN Code' : form.country === 'United States' ? 'ZIP Code' : 'Postal Code'}
              icon={MapPin}
              placeholder={form.country === 'India' ? '500001' : form.country === 'United States' ? '90210' : 'SW1A 1AA'}
              value={form.postalCode}
              onChange={(val) => handleInputChange('postalCode', val)}
              error={errors.postalCode}
              success={touched.postalCode && !errors.postalCode}
            />

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-4">Architecture Selection</label>
              <select 
                value={form.projectType}
                onChange={(e) => handleInputChange('projectType', e.target.value)}
                className="w-full bg-white/5 border-[1.5px] border-white/10 rounded-2xl p-4 text-white outline-none focus:border-[#c7c42a]/50 appearance-none font-medium transition-all"
              >
                <option value="" className="bg-[#111]">Select Project Type</option>
                {PROJECT_TYPES.map(t => <option key={t} value={t} className="bg-[#111]">{t}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Dynamic Pricing / Payment Selection */}
        <div className="bg-gradient-to-br from-white/5 to-transparent border border-white/5 rounded-[2.5rem] p-8 space-y-8 backdrop-blur-3xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-1">
              <h4 className="text-xl font-black italic uppercase tracking-tighter text-white">Investment Packages</h4>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-relaxed">
                Localized pricing for <span className="text-[#c7c42a]">{form.country}</span> operational market.
              </p>
            </div>
            
            <div className="flex gap-2">
              <div className="px-6 py-3 rounded-2xl bg-black border border-white/10 flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[#c7c42a]">
                    <Globe size={14} />
                 </div>
                 <div className="text-left">
                    <p className="text-[8px] font-black uppercase tracking-widest text-white/30">Currency</p>
                    <p className="text-[10px] font-black uppercase tracking-tighter text-white">{symbol}</p>
                 </div>
              </div>
              <div className="px-6 py-3 rounded-2xl bg-black border border-white/10 flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[#c7c42a]">
                    <CreditCard size={14} />
                 </div>
                 <div className="text-left">
                    <p className="text-[8px] font-black uppercase tracking-widest text-white/30">Gateway</p>
                    <p className="text-[10px] font-black uppercase tracking-tighter text-white">{gateway}</p>
                 </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {(['basic', 'standard', 'premium'] as const).map((plan, index) => {
              const fontSizes = ['64px', '56px', '48px'];
              return (
                <button
                  key={plan}
                  type="button"
                  onClick={() => handleInputChange('budget', plan)}
                  className={`p-8 rounded-[2rem] border-2 transition-all text-left flex flex-col gap-4 group min-h-[250px] justify-between ${
                    form.budget === plan 
                      ? 'border-[#c7c42a] bg-[#c7c42a]/5 shadow-2xl shadow-[#c7c42a]/10' 
                      : 'border-white/5 bg-black/40 hover:border-white/20'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${form.budget === plan ? 'text-[#c7c42a]' : 'text-white/20'}`}>
                      {plan === 'basic' ? 'starter' : plan === 'standard' ? 'growth' : 'premium'}
                    </span>
                    {form.budget === plan && <Check size={16} className="text-[#c7c42a]" />}
                  </div>
                  <div className="space-y-0.5 mt-auto">
                    <p className="font-black italic uppercase tracking-tighter flex items-end gap-1 leading-none">
                      <span className="text-[#c7c42a] text-lg mb-2">{currency}</span>
                      <span style={{ fontSize: fontSizes[index] }}>{globalPricing[plan]}</span>
                      <span className="text-[8px] font-bold text-white/20 mb-2">{symbol}</span>
                    </p>
                    <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Base Investment</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
           <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-4 group-focus-within:text-[#c7c42a]">Detailed Inquiry</label>
            <div className="relative">
              <MessageSquare size={18} className="absolute left-6 top-6 text-white/20 group-focus-within:text-[#c7c42a]" />
              <textarea 
                rows={4}
                value={form.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                placeholder="Tell us about your architectural vision..."
                className="w-full bg-white/5 border-[1.5px] border-white/10 rounded-3xl p-6 pl-14 text-white placeholder:text-white/10 outline-none focus:border-[#c7c42a]/50 focus:bg-white/10 transition-all font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-8 rounded-[2rem] bg-[#c7c42a] text-black font-black italic uppercase tracking-widest text-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 group disabled:opacity-50 disabled:grayscale"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin text-black" size={24} />
            ) : (
              <>
                Initiate Project Protocol
                <ArrowRight className="group-hover:translate-x-2 transition-transform" />
              </>
            )}
          </button>

          <p className="text-center text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">
            Precision Engineering Guaranteed. No Spam, No Fluff.
          </p>
        </div>
      </form>
    </div>
  );
}
