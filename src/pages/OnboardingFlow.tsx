import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { FirebaseUser, auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { serverTimestamp } from 'firebase/firestore';
import { UserProfile } from '../types';
import { Check, Image as ImageIcon, FileText, CreditCard } from 'lucide-react';

const Loader = ({ color = "black" }: { color?: string }) => (
  <div className="flex items-center justify-center gap-2">
    <motion.div
      animate={{
        scale: [1, 1.2, 1],
        rotate: [0, 180, 360],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className={`w-6 h-6 border-2 border-${color === 'black' ? 'black' : '[#c7c42a]'} border-t-transparent rounded-full`}
    />
    <span className={`text-[10px] font-black uppercase tracking-[0.2em] text-${color === 'black' ? 'black' : '[#c7c42a]'} animate-pulse italic`}>Processing...</span>
  </div>
);
import { jsPDF } from 'jspdf';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { APP_NAME, HYPHENATED_NAME } from '../constants';
import { createProject, getSystemSettings, uploadFile, checkUsernameUnique, createUserProfile } from '../services/database';
import { generateTemplateImage } from '../services/geminiService';
import { SystemSettings } from '../types';
import { Monitor, Smartphone, Tablet, ExternalLink, Code, Database, Layout, Search, Zap, Image, Mail, MessageSquare, ShieldCheck, UserCheck, ArrowRight, Activity, Ship, Edit, ChevronDown } from 'lucide-react';

const AVAILABLE_FEATURES = [
  'Google Login System',
  'Booking System',
  'Contact Form',
  'WhatsApp Chat Integration',
  'Admin Dashboard',
  'SEO Optimization',
  'Mobile Responsive Design',
  'Image Gallery',
  'Payment Integration (Stripe)',
  'Fast Loading Performance'
];

import StateCityDropdown from '../components/StateCityDropdown';

const WebsitePreview = ({ data, device }: { data: any, device: 'desktop' | 'tablet' | 'mobile' }) => {
  const containerClasses = {
    desktop: 'w-full h-[600px]',
    tablet: 'w-[768px] h-[700px] mx-auto scale-[0.8] origin-top',
    mobile: 'w-[375px] h-[667px] mx-auto scale-[0.9] origin-top',
  };

  const getHeroImage = () => {
    switch (data.businessType) {
      case 'Gym': return 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800';
      case 'Resort & Hospitality': return 'https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=800';
      case 'Automobiles': return 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=800';
      case 'Logistics': return 'https://images.unsplash.com/photo-1519003722824-191d446dc0e5?q=80&w=800';
      case 'Clothing store': return 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800';
      case 'School & Education': return 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=800';
      case 'Food court': return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800';
      default: return 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=800';
    }
  };

  return (
    <div className={`transition-all duration-700 ease-in-out ${containerClasses[device]}`}>
      <div className="bg-white rounded-t-3xl border-8 border-gray-800 shadow-2xl relative h-full flex flex-col overflow-hidden">
        {/* Mock Address Bar */}
        <div className="bg-gray-100 px-4 py-2 border-b flex items-center gap-4">
          <div className="flex gap-1.5">
             <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
             <div className="w-2.5 h-2.5 rounded-full bg-[#c7c42a]" />
             <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 bg-white rounded-full h-6 flex items-center px-4 text-[10px] text-gray-400 font-mono italic shadow-inner">
             {data.domain ? `https://${data.domain}` : `https://${data.businessName?.toLowerCase().replace(/\s/g, '') || 'yourbusiness'}.webbylaunch.com`}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-white text-black font-sans no-scrollbar flex flex-col">
          {/* Navbar */}
          <nav className="p-5 border-b flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur-md z-30">
            <div className="flex items-center gap-3">
              {data.logoUrl ? (
                <img src={data.logoUrl} alt="Logo" className="w-8 h-8 object-contain" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-[10px] shadow-lg" style={{ backgroundColor: data.primaryColor || '#c7c42a' }}>
                  {(data.businessName || 'W')[0].toUpperCase()}
                </div>
              )}
              <span className="font-black text-xs uppercase tracking-tighter leading-none">{data.businessName || 'WEBBYLAUNCH'}</span>
            </div>
            <div className="flex gap-4 items-center">
               <span className="text-[8px] font-bold uppercase tracking-widest text-gray-400">Home</span>
               <span className="text-[8px] font-bold uppercase tracking-widest text-gray-400">Services</span>
               <button className="px-4 py-2 rounded-full font-black text-[8px] uppercase tracking-widest shadow-lg text-white" style={{ backgroundColor: data.primaryColor || '#000000' }}>Contact</button>
            </div>
          </nav>

          {/* Hero */}
          <section className="relative min-h-[400px] flex items-center justify-center p-12 text-center overflow-hidden transition-all duration-1000">
            <div className="absolute inset-0 z-0">
              <img src={getHeroImage()} alt="Hero" className="w-full h-full object-cover blur-[2px] scale-110 opacity-40" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/40 to-white" />
            </div>

            <div className="relative z-10 max-w-lg mx-auto space-y-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-block px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.3em] mb-4"
                style={{ backgroundColor: data.primaryColor + '20' || '#c7c42a20', color: data.primaryColor || '#c7c42a' }}
              >
                Welcome to Precision
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-[0.9] italic text-black" 
              >
                {data.businessName || 'Premium Solutions'} <br /> 
                <span style={{ color: data.primaryColor || '#c7c42a' }}>For {data.businessType || 'Your Business'}</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-[10px] font-bold max-w-xs mx-auto text-black/60 leading-relaxed uppercase tracking-wider" 
              >
                {data.description || 'Elevate your digital presence with high-end development and precision engineering.'}
              </motion.p>
              <div className="pt-6">
                <button 
                  className="px-10 py-5 rounded-full font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl transition-all hover:scale-105 active:scale-95 text-white" 
                  style={{ backgroundColor: data.primaryColor || '#000000' }}
                >
                  Explore Features
                </button>
              </div>
            </div>
          </section>

          {/* Features Grid */}
          <section className="py-20 px-8 bg-gray-50 grid grid-cols-2 gap-4">
            {data.selectedFeatures?.slice(0, 4).map((feature: string, i: number) => (
              <div key={i} className="p-6 rounded-[2rem] bg-white border border-gray-100 flex flex-col items-center gap-4 text-center group hover:shadow-2xl transition-all">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform" 
                  style={{ backgroundColor: data.primaryColor || '#c7c42a', color: '#FFFFFF' }}
                >
                  <Zap size={20} />
                </div>
                <span className="text-[8px] font-black uppercase tracking-widest text-gray-900 leading-tight">{feature}</span>
              </div>
            ))}
          </section>

          {/* Contact Bar */}
          <section className="py-12 px-10 border-t border-gray-100 flex flex-col items-center gap-8 bg-gray-50">
             <div className="flex gap-10">
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-gray-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{data.businessEmail || 'hello@webbylaunch.com'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Smartphone size={16} className="text-gray-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{data.businessPhone || '+91 88000 00000'}</span>
                </div>
             </div>
          </section>

          {/* Footer */}
          <footer className="p-10 bg-black text-white text-center">
            <div className="text-xl font-black italic tracking-tighter uppercase mb-4">Webby<span style={{ color: data.primaryColor || '#c7c42a' }}>Launch</span></div>
            <p className="text-[8px] font-bold uppercase tracking-[0.3em] opacity-40">© 2026 {data.businessName || 'Business'}. Precision Built by WebbyLaunch.</p>
          </footer>
        </div>
        
        {/* Device specific artifacts */}
        {device === 'mobile' && <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-gray-800 rounded-full z-40" />}
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-white/40 text-[10px] font-black uppercase tracking-widest italic">
          * This is a sample preview. Final website will be significantly more professional and optimized.
        </p>
      </div>
    </div>
  );
};

interface OnboardingFlowProps {
  user: FirebaseUser | null;
  profile: UserProfile | null;
}

export default function OnboardingFlow({ user, profile }: OnboardingFlowProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { signInWithGoogle } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/auth', { state: { from: location.pathname } });
    }
  }, [user, navigate, location]);

  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('onboarding_data');
    const defaults = {
      name: profile?.displayName || '',
      email: profile?.email || '',
      phone: '',
      username: '',
      businessName: '',
      businessNumber: '',
      businessEmail: '',
      businessPhone: '',
      addressLine: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
      businessType: '',
      otherBusinessType: '',
      description: '',
      websiteName: '',
      domain: '',
      primaryColor: '#c7c42a',
      secondaryColor: '#000000',
      tertiaryColor: '',
      logoUrl: '',
      documentsUrl: '',
      selectedFeatures: [
        'Mobile Responsive Design',
        'Work Portfolio',
        'Fast Loading Performance'
      ],
      plan: 'basic' as 'basic' | 'standard' | 'pro',
      billingCycle: 'one-time' as 'one-time',
      referenceWebsite: '',
      templateId: '',
      domainPreferences: ['', '', ''],
      referralSource: '',
      salesCode: '',
    };

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...defaults, ...parsed };
      } catch (e) {
        console.error('Error parsing saved onboarding data:', e);
      }
    }
    return defaults;
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [docsFile, setDocsFile] = useState<File | null>(null);
  const [docsName, setDocsName] = useState<string>('');
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string>(profile?.photoURL || '');

  const [step, setStep] = useState(() => {
    const saved = localStorage.getItem('onboarding_step');
    return saved ? parseInt(saved, 10) : 1;
  });

  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invalidFields, setInvalidFields] = useState<string[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
  const [paymentOption, setPaymentOption] = useState<'full' | 'understanding'>('full');

  useEffect(() => {
    getSystemSettings().then(settings => {
      if (settings) setSystemSettings(settings);
    });
  }, []);

  // Persist state to localStorage (excluding large binary data)
  useEffect(() => {
    const { logoUrl, documentsUrl, ...rest } = formData;
    localStorage.setItem('onboarding_data', JSON.stringify(rest));
    localStorage.setItem('onboarding_step', step.toString());
  }, [formData, step]);

  // Update form data when profile becomes available
  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || profile.displayName || '',
        email: prev.email || profile.email || '',
      }));
    }
  }, [profile]);

  const getInvalidFieldsForStep = (currentStep: number) => {
    if (!systemSettings) return [];
    const req = systemSettings.requiredFields;

    const validatePhone = (p: string) => /^\d{10}$/.test(p);
    const validateEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
    const invalid: string[] = [];

    switch (currentStep) {
      case 1: // Personal info
        if (!formData.name || formData.name.length < 3) invalid.push('name');
        if (!validateEmail(formData.email)) invalid.push('email');
        if (req.phone && !validatePhone(formData.phone)) invalid.push('phone');
        if (formData.username.length < 3) invalid.push('username');
        if (!formData.referralSource) invalid.push('referralSource');
        if (formData.referralSource === 'I got a call' && !formData.salesCode) invalid.push('salesCode');
        break;
      case 2: // Business info
        if (req.businessName && !formData.businessName) invalid.push('businessName');
        if (req.businessType && !formData.businessType) invalid.push('businessType');
        if (formData.businessType === 'Other' && !formData.otherBusinessType) invalid.push('otherBusinessType');
        if (!formData.businessEmail || !validateEmail(formData.businessEmail)) invalid.push('businessEmail');
        if (!formData.businessPhone || !validatePhone(formData.businessPhone)) invalid.push('businessPhone');
        if (!formData.addressLine) invalid.push('addressLine');
        if (!formData.city) invalid.push('city');
        if (!formData.state) invalid.push('state');
        if (!formData.pincode) invalid.push('pincode');
        if (req.description && !formData.description) invalid.push('description');
        break;
      case 3: // Features Select
        if (!formData.selectedFeatures || formData.selectedFeatures.length === 0) invalid.push('selectedFeatures');
        break;
      case 4: // Domain Selection
        if (!formData.domain) invalid.push('domain');
        break;
      case 5: // Design
        if (!formData.primaryColor) invalid.push('primaryColor');
        if (!formData.secondaryColor) invalid.push('secondaryColor');
        break;
      case 6: // Preview
        // No fields to validate for preview step itself
        break;
      case 7: // Choose Plan
        if (!formData.plan) invalid.push('plan');
        break;
      case 8: // Terms and Conditions
        if (!agreedToTerms) invalid.push('terms');
        break;
    }
    return invalid;
  };

  const isStepValid = () => {
    return getInvalidFieldsForStep(step).length === 0;
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Also clear individual domain preference errors if applicable
    if (field === 'domainPreferences') {
      setInvalidFields(prev => prev.filter(f => !f.startsWith('domainPreference')));
    }
    if (invalidFields.includes(field)) {
      setInvalidFields(prev => prev.filter(f => f !== field));
    }
  };

  const getInputClass = (fieldName: string, baseClass: string = "w-full p-6 rounded-2xl bg-card border text-text focus:outline-none focus:border-primary font-medium") => {
    const isInvalid = invalidFields.includes(fieldName);
    return `${baseClass} ${isInvalid ? 'border-error shadow-[0_0_12px_rgba(239,68,68,0.4)]' : 'border-border'}`;
  };

  const handleNext = () => {
    const invalid = getInvalidFieldsForStep(step);
    if (invalid.length === 0) {
      setStep(step + 1);
      setInvalidFields([]);
    } else {
      setInvalidFields(invalid);
      setError("Please fill in all required fields correctly.");
      setTimeout(() => setError(null), 3000);
    }
  };
  const handleBack = () => setStep(step - 1);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setError(null);
    console.log("STARTING SUBMISSION... AUTH CHECK IN PROGRESS");

    // CRITICAL: Robust auth wait as requested by user
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      unsubscribe();
      
      if (!currentUser) {
        console.error("AUTH FAILED IN SUBMIT");
        setError("Your session is not ready. Please wait a moment and try again.");
        setIsSubmitting(false);
        return;
      }

      console.log("AUTH READY:", currentUser.uid);

      try {
        let finalProfileUrl = profile?.photoURL || '';

        if (profileFile) {
          finalProfileUrl = await uploadFile(profileFile, 'profiles');
        }

        const finalBusinessType = formData.businessType === 'Other' ? formData.otherBusinessType : formData.businessType;
        const sanitizedOnboardingData = { ...formData };
        
        const projectData = {
          userId: currentUser.uid,
          userName: formData.name || '',
          userEmail: formData.email || '',
          businessName: formData.businessName || '',
          businessType: finalBusinessType || '',
          description: formData.description || '',
          primaryColor: formData.primaryColor || '#c7c42a',
          secondaryColor: formData.secondaryColor || '#000000',
          plan: formData.plan || 'basic',
          paymentStatus: 'pending',
          isDeleted: false,
          onboardingData: sanitizedOnboardingData 
        };

        console.log("WRITING PROJECT TO FIRESTORE...");
        const projectId = await createProject(projectData);
        
        console.log("WRITING USER PROFILE TO FIRESTORE...");
        await createUserProfile(currentUser, {
          username: formData.username,
          phone: formData.phone,
          photoURL: finalProfileUrl,
          businessName: formData.businessName,
          onboardingCompleted: true,
          lastProjectId: projectId
        });

        localStorage.removeItem('onboarding_data');
        localStorage.removeItem('onboarding_step');
        
        toast.success("SUCCESS: DATA SAVED");
        setStep(9); 
        
        setTimeout(() => navigate('/dashboard'), 5000);
      } catch (err: any) {
        console.error("PERMISSION OR SYSTEM ERROR:", err);
        setError("Submission failed. Permission denied or network issue.");
        toast.error("ERROR: PLEASE TRY AGAIN");
        setIsSubmitting(false);
      }
    });
  };

  const handleDownloadSummary = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(0, 0, 0);
    doc.text('WebbyLaunch Project Summary', 20, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    
    let y = 40;
    const addLine = (label: string, value: string) => {
      doc.setFont('helvetica', 'bold');
      doc.text(`${label}:`, 20, y);
      doc.setFont('helvetica', 'normal');
      doc.text(value || 'Not Provided', 70, y);
      y += 10;
    };

    addLine('Name', formData.name);
    addLine('Email', formData.email);
    addLine('Phone', formData.phone);
    y += 5;
    addLine('Business Name', formData.businessName);
    addLine('Business Type', formData.businessType === 'Other' ? formData.otherBusinessType : formData.businessType);
    addLine('Location', formData.location);
    y += 5;
    addLine('Website Name', formData.websiteName);
    addLine('Selected Plan', formData.plan === 'basic' ? 'Basic' : formData.plan === 'standard' ? 'Standard' : 'Premium');
    addLine('Payment Option', paymentOption === 'full' ? 'Full Payment' : 'Advance Payment');
    
    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Description:', 20, y);
    y += 7;
    doc.setFont('helvetica', 'normal');
    const splitDesc = doc.splitTextToSize(formData.description || 'No description provided.', 160);
    doc.text(splitDesc, 20, y);
    
    doc.save(`WebbyLaunch_Project_Summary.pdf`);
  };

  const [domainData, setDomainData] = useState({
    businessName: '',
    preferences: ['', '', ''],
    customDomain: ''
  });
  const [domainError, setDomainError] = useState<string | null>(null);

  const extensions = ['.com', '.in', '.org'];

  const handleDomainBusinessNameChange = (val: string) => {
    const sanitized = val.toLowerCase().replace(/[^a-z0-9]/g, '');
    setDomainData(prev => ({ ...prev, businessName: sanitized }));
    if (sanitized.length < 3) {
      setDomainError('Business name must be at least 3 characters');
    } else if (sanitized.length > 20) {
      setDomainError('Business name must be at most 20 characters');
    } else {
      setDomainError(null);
    }
  };

  const handlePreferenceChange = (index: number, ext: string) => {
    const newPrefs = [...domainData.preferences];
    newPrefs[index] = ext;
    
    // Clear subsequent preferences if they match the new selection
    for (let i = index + 1; i < 3; i++) {
      if (newPrefs[i] === ext) {
        newPrefs[i] = '';
      }
    }
    
    setDomainData(prev => ({ ...prev, preferences: newPrefs }));
  };

  const handleDomainNext = () => {
    const domainPrefs = domainData.preferences.map(ext => `${domainData.businessName}${ext}`);
    setFormData(prev => ({ 
      ...prev, 
      websiteName: domainPrefs[0], 
      domain: domainPrefs[0],
      domainPreferences: domainPrefs
    }));
    setStep(4);
  };

  const toggleFeature = (feature: string) => {
    const current = formData.selectedFeatures || [];
    const updated = current.includes(feature)
      ? current.filter(f => f !== feature)
      : [...current, feature];
    handleInputChange('selectedFeatures', updated);
  };

  const [suggestedDomains, setSuggestedDomains] = useState<{name: string, status: 'loading' | 'available' | 'taken' | 'error'}[]>([]);
  const [customDomain, setCustomDomain] = useState('');
  const [customStatus, setCustomStatus] = useState<'idle' | 'loading' | 'available' | 'taken' | 'error'>('idle');
  const [isCheckingCustom, setIsCheckingCustom] = useState(false);

  const checkDomain = async (domain: string) => {
    try {
      const res = await fetch(`https://dns.google/resolve?name=${domain}`);
      const data = await res.json();
      // Google DNS Answer field exists if there are records (domain taken)
      return data.Answer ? "taken" : "available";
    } catch {
      return "error";
    }
  };

  const loadSuggestions = async (name: string) => {
    if (!name || name.length < 3) return;
    
    const extensions = ['.com', '.in', '.org', '.online', '.store'];
    const bases = [name, name + 'official', 'get' + name];
    
    // Pick top 4 common variations
    const domainNames = [
      `${name}.com`,
      `${name}.in`,
      `${name}.online`,
      `${name}.site`
    ];

    setSuggestedDomains(domainNames.map(d => ({ name: d, status: 'loading' })));

    const results = await Promise.all(
      domainNames.map(async (d) => ({
        name: d,
        status: (await checkDomain(d)) as any
      }))
    );

    setSuggestedDomains(results);
  };

  const checkCustom = async () => {
    if (!customDomain || !customDomain.includes('.')) {
      toast.error("Please enter a valid domain (e.g., example.com)");
      return;
    }
    setIsCheckingCustom(true);
    setCustomStatus('loading');
    const status = await checkDomain(customDomain);
    setCustomStatus(status as any);
    setIsCheckingCustom(false);
  };

  useEffect(() => {
    if (step === 4) {
      const name = formData.websiteName || formData.businessName.toLowerCase().replace(/[^a-z0-9]/g, '');
      loadSuggestions(name);
    }
  }, [step]);

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-[0.4em] text-primary">Step 1</h2>
              <h3 className="text-4xl font-bold tracking-tight text-text">User Details</h3>
            </div>
            
            <div className="space-y-6">
              <div className="flex flex-col items-center gap-4 mb-8">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full bg-card border-2 border-dashed border-border flex items-center justify-center overflow-hidden transition-all group-hover:border-primary/50">
                    {profilePreview ? (
                      <img src={profilePreview} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center">
                        <ImageIcon className="w-8 h-8 text-subtext mx-auto mb-2" />
                        <span className="text-[8px] font-bold text-subtext uppercase tracking-widest">Profile Photo</span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setProfileFile(file);
                          setProfilePreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                  </div>
                </div>
                <p className="text-[10px] font-bold text-subtext uppercase tracking-[0.2em]">Upload Profile Picture</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-subtext uppercase tracking-wider ml-4">Full Name <span className="text-error">*</span></label>
                <input
                  type="text"
                  className={getInputClass('name')}
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-subtext uppercase tracking-wider ml-4">Username <span className="text-error">*</span></label>
                <input
                  type="text"
                  className={getInputClass('username')}
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value.toLowerCase().replace(/\s/g, '_'))}
                  placeholder="rahul_123"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-subtext uppercase tracking-wider ml-4">Phone Number <span className="text-error">*</span></label>
                <input
                  type="tel"
                  className={getInputClass('phone')}
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="E.G. 9876543210"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-subtext uppercase tracking-wider ml-4">Email Address <span className="text-error">*</span></label>
                <input
                  type="email"
                  className={getInputClass('email')}
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email address"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-subtext uppercase tracking-wider ml-4">How did you hear about us? <span className="text-error">*</span></label>
                <select
                  className={getInputClass('referralSource', "w-full p-6 rounded-2xl bg-card border text-text focus:outline-none focus:border-primary font-medium appearance-none")}
                  value={formData.referralSource}
                  onChange={(e) => handleInputChange('referralSource', e.target.value)}
                >
                  <option value="">Select an option</option>
                  <option value="Google Search">Google Search</option>
                  <option value="Social Media">Social Media</option>
                  <option value="Friend/Colleague">Friend/Colleague</option>
                  <option value="I got a call">I got a call</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {formData.referralSource === 'I got a call' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-subtext uppercase tracking-wider ml-4">Sales Code <span className="text-error">*</span></label>
                  <input
                    type="text"
                    className={getInputClass('salesCode')}
                    value={formData.salesCode}
                    onChange={(e) => handleInputChange('salesCode', e.target.value.toUpperCase())}
                    placeholder="Enter Sales Code"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-4">
              {!user ? (
                <button 
                  onClick={async () => {
                    try {
                      await signInWithGoogle();
                    } catch (err: any) {
                      toast.error("Login failed: " + err.message);
                    }
                  }}
                  className="flex-1 bg-white text-black py-6 rounded-2xl font-bold text-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 shadow-lg shadow-white/10"
                >
                  <img src="https://www.google.com/favicon.ico" className="w-6 h-6" alt="Google" />
                  Sign in with Google to Continue
                </button>
              ) : (
                <button 
                  onClick={handleNext} 
                  className="flex-1 bg-primary text-white py-6 rounded-2xl font-bold text-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
                >
                  Next
                </button>
              )}
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-[0.4em] text-primary">Step 2</h2>
              <h3 className="text-4xl font-bold tracking-tight text-white uppercase italic leading-none">Business Details</h3>
              <p className="text-white/40 text-[10px] font-black uppercase tracking-widest italic">Help us understand your brand ecosystem</p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-subtext uppercase tracking-wider ml-4 italic">Business Name <span className="text-error">*</span></label>
                  <input
                    type="text"
                    className={getInputClass('businessName', "w-full p-8 rounded-[2rem] bg-white/5 border text-white focus:outline-none focus:border-primary font-black italic text-xl tracking-tighter uppercase")}
                    value={formData.businessName}
                    onChange={(e) => handleInputChange('businessName', e.target.value)}
                    placeholder="E.G. TITAN FORGE"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-subtext uppercase tracking-wider ml-4 italic">Business Phone <span className="text-error">*</span></label>
                  <input
                    type="tel"
                    className={getInputClass('businessPhone', "w-full p-8 rounded-[2rem] bg-white/5 border text-white focus:outline-none focus:border-primary font-black italic text-xl tracking-tighter uppercase")}
                    value={formData.businessPhone}
                    onChange={(e) => handleInputChange('businessPhone', e.target.value)}
                    placeholder="E.G. 9876543210"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-subtext uppercase tracking-wider ml-4 italic">Business Email <span className="text-error">*</span></label>
                  <input
                    type="email"
                    className={getInputClass('businessEmail', "w-full p-8 rounded-[2rem] bg-white/5 border text-white focus:outline-none focus:border-primary font-black italic text-xl tracking-tighter")}
                    value={formData.businessEmail}
                    onChange={(e) => handleInputChange('businessEmail', e.target.value)}
                    placeholder="HELLO@BRAND.COM"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-subtext uppercase tracking-wider ml-4 italic">Registration No. (Optional)</label>
                  <input
                    type="text"
                    className={getInputClass('businessNumber', "w-full p-8 rounded-[2rem] bg-white/5 border text-white focus:outline-none focus:border-primary font-black italic text-xl tracking-tighter uppercase")}
                    value={formData.businessNumber}
                    onChange={(e) => handleInputChange('businessNumber', e.target.value)}
                    placeholder="E.G. REG-9901"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-subtext uppercase tracking-wider ml-4 italic">Address Line <span className="text-error">*</span></label>
                  <input
                    type="text"
                    className={getInputClass('addressLine', "w-full p-8 rounded-[2rem] bg-white/5 border text-white focus:outline-none focus:border-primary font-black italic text-xl tracking-tighter uppercase")}
                    value={formData.addressLine}
                    onChange={(e) => handleInputChange('addressLine', e.target.value)}
                    placeholder="123 BUSINESS PARK"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-subtext uppercase tracking-wider ml-4 italic">Pincode <span className="text-error">*</span></label>
                  <input
                    type="text"
                    maxLength={6}
                    className={getInputClass('pincode', "w-full p-8 rounded-[2rem] bg-white/5 border text-white focus:outline-none focus:border-primary font-black italic text-xl tracking-tighter uppercase")}
                    value={formData.pincode}
                    onChange={(e) => handleInputChange('pincode', e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-bold text-subtext uppercase tracking-wider ml-4 italic">Location Selection <span className="text-error">*</span></label>
                <StateCityDropdown 
                  onSelect={(state, city) => {
                    handleInputChange('state', state);
                    handleInputChange('city', city);
                  }}
                  error={invalidFields.includes('state') || invalidFields.includes('city') ? "Please select both state and city" : undefined}
                />
              </div>

              <div className="space-y-4">
                <label className="text-xs font-bold text-subtext uppercase tracking-wider ml-4 italic">Business Category <span className="text-error">*</span></label>
                <div className="relative">
                  <select
                    className={getInputClass('businessType', "w-full p-8 rounded-[2rem] bg-white/5 border text-white focus:outline-none focus:border-primary font-black italic text-xl tracking-tighter uppercase appearance-none cursor-pointer")}
                    value={formData.businessType}
                    onChange={(e) => handleInputChange('businessType', e.target.value)}
                  >
                    <option value="">SELECT CATEGORY</option>
                    <option value="Food Court">FOOD COURT</option>
                    <option value="Automobiles">AUTOMOBILES</option>
                    <option value="Clothing">CLOTHING</option>
                    <option value="Gym">GYM & FITNESS</option>
                    <option value="Resort & Hospitality">RESORT & HOSPITALITY</option>
                    <option value="Logistics">LOGISTICS</option>
                    <option value="Other">OTHER</option>
                  </select>
                  <ChevronDown className="absolute right-8 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" size={20} />
                </div>
              </div>

              {formData.businessType === 'Other' && (
                <input
                  type="text"
                  placeholder="ENTER YOUR BUSINESS TYPE"
                  className={getInputClass('otherBusinessType', "w-full p-8 rounded-[2rem] bg-white/5 border text-white focus:outline-none focus:border-primary font-black italic text-xl tracking-tighter uppercase")}
                  value={formData.otherBusinessType}
                  onChange={(e) => handleInputChange('otherBusinessType', e.target.value)}
                />
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-subtext uppercase tracking-wider ml-4 italic">Description <span className="text-error">*</span></label>
                <textarea
                  className={getInputClass('description', "w-full p-8 rounded-[2rem] bg-white/5 border text-white focus:outline-none focus:border-primary font-black italic text-lg tracking-tighter uppercase h-40 resize-none")}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="TELL US ABOUT YOUR BRAND..."
                />
              </div>

              <div className="space-y-4">
                <label className="text-xs font-bold text-subtext uppercase tracking-wider ml-4 italic text-primary">Branding Assets (Optional)</label>
                <div className="relative group p-12 rounded-[3rem] border-2 border-dashed border-white/5 bg-white/[0.02] hover:border-primary/50 transition-all flex flex-col items-center justify-center gap-6 cursor-pointer">
                  <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-white/20 group-hover:text-primary group-hover:scale-110 transition-all">
                    <FileText size={32} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-black uppercase italic tracking-tighter text-white">
                      {docsName || 'Drop Business Assets / ID / Trade License'}
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 mt-2 italic">PRO TIP: UPLOAD YOUR LOGO IN STEP 5</p>
                  </div>
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setDocsFile(file);
                        setDocsName(file.name);
                        try {
                          const base64 = await uploadFile(file);
                          handleInputChange('documentsUrl', base64);
                          toast.success('Document uploaded!');
                        } catch (err) {
                          toast.error('Upload failed');
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-6 pt-10">
              <button 
                onClick={handleBack} 
                className="flex-[0.4] border-2 border-white/10 text-white/60 py-6 rounded-[2rem] font-black text-xl hover:bg-white/5 transition-all uppercase italic tracking-tighter"
              >
                Back
              </button>
              <button 
                onClick={handleNext} 
                className="flex-1 bg-primary text-black py-6 rounded-[2rem] font-black text-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-primary/20 uppercase italic tracking-tighter"
                style={{ backgroundColor: formData.primaryColor }}
              >
                Continue
              </button>
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div 
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-[0.4em] text-primary">Step 3</h2>
              <h3 className="text-4xl font-bold tracking-tight text-text">Select Features</h3>
              <p className="text-subtext font-medium italic">Customize your platform with premium features</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {AVAILABLE_FEATURES.map((feature) => {
                const isSelected = (formData.selectedFeatures || []).includes(feature);
                return (
                  <button
                    key={feature}
                    onClick={() => toggleFeature(feature)}
                    className={`p-6 rounded-2xl border transition-all text-left flex items-start gap-4 ${
                      isSelected 
                        ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' 
                        : 'bg-card border-border text-subtext hover:border-primary/50'
                    }`}
                  >
                    <div className={`mt-1 w-6 h-6 rounded flex items-center justify-center border-2 transition-all ${
                      isSelected ? 'bg-white border-white text-primary' : 'border-border text-transparent'
                    }`}>
                      <Check size={14} strokeWidth={4} />
                    </div>
                    <div>
                      <div className="text-sm font-bold uppercase tracking-widest">{feature}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-4">
              <button onClick={handleBack} className="flex-1 border border-primary text-primary py-6 rounded-2xl font-bold text-xl hover:bg-primary hover:text-white transition-all">Back</button>
              <button onClick={handleNext} className="flex-1 bg-primary text-white py-6 rounded-2xl font-bold text-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20">Next</button>
            </div>
          </motion.div>
        );
      case 4:
        const bName = formData.businessName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'yourbusiness';
        
        return (
          <motion.div 
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-[0.4em] text-primary" style={{ color: formData.primaryColor }}>Step 4</h2>
              <h3 className="text-4xl font-bold tracking-tight text-white italic uppercase leading-none">Best domains for your business</h3>
              <p className="text-white/40 text-sm font-medium italic uppercase tracking-widest">Select your digital identity</p>
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-1 gap-3">
                {suggestedDomains.length > 0 ? (
                  suggestedDomains.map((d, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        handleInputChange('domain', d.name);
                        handleInputChange('websiteName', d.name.split('.')[0]);
                        handleInputChange('domainPreferences', [d.name, ...formData.domainPreferences.filter(p => p !== d.name)].slice(0, 3));
                      }}
                      className={`group flex items-center justify-between p-6 rounded-2xl border-2 transition-all ${
                        formData.domain === d.name 
                          ? 'bg-primary/10 border-primary' 
                          : 'bg-white/5 border-white/5'
                      }`}
                    >
                      <span className={`text-xl font-black italic uppercase tracking-tighter ${formData.domain === d.name ? 'text-primary' : 'text-white/80'}`}>
                        {d.name}
                      </span>
                      {formData.domain === d.name && <Check size={20} className="text-primary" strokeWidth={4} />}
                    </button>
                  ))
                ) : (
                  <div className="p-8 rounded-2xl bg-white/5 border border-dashed border-white/10 text-center">
                    <p className="text-xs font-bold text-white/20 uppercase tracking-widest italic">Generating suggestions...</p>
                  </div>
                )}
              </div>

              <div className="p-6 rounded-2xl bg-yellow-500/10 border border-yellow-500/20">
                <p className="text-yellow-500 font-bold uppercase tracking-tight text-xs flex items-start gap-2">
                  <span className="shrink-0">⚠️</span>
                  Domain charges are NOT included in your plan. You will need to purchase the domain separately during checkout.
                </p>
              </div>

              {/* Custom Domain Section */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] ml-4 italic">Or enter your own domain</label>
                <div className="relative group">
                  <input 
                    type="text"
                    value={customDomain}
                    onChange={(e) => {
                      setCustomDomain(e.target.value.toLowerCase().trim());
                      setCustomStatus('idle');
                    }}
                    placeholder="mycoolbrand.xyz"
                    className="w-full p-8 rounded-[2rem] bg-white/5 border border-white/10 text-white focus:outline-none focus:border-primary font-black italic text-2xl tracking-tighter placeholder-white/10 uppercase pr-40"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <button 
                      onClick={checkCustom}
                      disabled={isCheckingCustom || !customDomain}
                      className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black text-white uppercase italic transition-all disabled:opacity-50"
                    >
                      {isCheckingCustom ? 'Checking...' : 'Check Status'}
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {customStatus !== 'idle' && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`ml-4 p-4 rounded-xl inline-flex items-center gap-3 ${
                        customStatus === 'available' ? 'bg-green-400/10 border border-green-400/20' : 
                        customStatus === 'taken' ? 'bg-red-400/10 border border-red-400/20' : 
                        'bg-white/5'
                      }`}
                    >
                      {customStatus === 'loading' ? (
                        <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      ) : customStatus === 'available' ? (
                        <>
                          <div className="w-2 h-2 rounded-full bg-green-400" />
                          <span className="text-[10px] font-black text-green-400 uppercase italic tracking-widest">Domain is available!</span>
                          <button 
                            onClick={() => {
                              handleInputChange('domain', customDomain);
                              handleInputChange('websiteName', customDomain.split('.')[0]);
                              handleInputChange('domainPreferences', [customDomain, ...formData.domainPreferences.filter(p => p !== customDomain)].slice(0, 3));
                            }}
                            className="ml-4 px-4 py-1.5 bg-green-400 text-black rounded-lg text-[9px] font-black uppercase"
                          >
                            Use This
                          </button>
                        </>
                      ) : customStatus === 'taken' ? (
                        <>
                          <div className="w-2 h-2 rounded-full bg-red-400" />
                          <span className="text-[10px] font-black text-red-400 uppercase italic tracking-widest">Domain is already taken</span>
                        </>
                      ) : (
                        <span className="text-[10px] font-black text-white/40 uppercase italic tracking-widest">Error checking domain</span>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 flex items-start gap-4">
                <ShieldCheck size={20} className="text-primary shrink-0 mt-1" />
                <p className="text-[10px] font-medium text-primary leading-relaxed italic uppercase tracking-[0.05em]">
                  ⚠️ Note: Domain availability is checked via live DNS records. Final availability and registration will be confirmed by our team during setup.
                </p>
              </div>
            </div>

            <div className="flex gap-6 pt-8">
              <button 
                onClick={handleBack} 
                className="flex-[0.4] border-2 border-white/10 text-white/60 py-6 rounded-[2rem] font-black text-xl hover:bg-white/5 transition-all uppercase italic tracking-tighter"
              >
                Back
              </button>
              <button 
                onClick={handleNext} 
                disabled={!formData.domain}
                className="flex-1 bg-primary text-black py-6 rounded-[2rem] font-black text-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-primary/20 uppercase italic tracking-tighter disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: formData.primaryColor }}
              >
                Continue
              </button>
            </div>
          </motion.div>
        );
      case 5:
        return (
          <motion.div 
            key="step5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-[0.4em] text-primary">Step 5</h2>
              <h3 className="text-4xl font-bold tracking-tight text-text">Design for your website</h3>
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-xs font-bold text-subtext uppercase tracking-wider ml-4">Primary Color <span className="text-error">*</span></label>
                  <div className="flex items-center gap-4 p-4 bg-card rounded-2xl border border-border">
                    <input 
                      type="color" 
                      value={formData.primaryColor}
                      onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                      className="w-12 h-12 rounded-lg bg-transparent cursor-pointer"
                    />
                    <input 
                      type="text" 
                      value={formData.primaryColor}
                      onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                      className="flex-1 bg-transparent text-text font-mono uppercase focus:outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-xs font-bold text-subtext uppercase tracking-wider ml-4">Secondary Color <span className="text-error">*</span></label>
                  <div className="flex items-center gap-4 p-4 bg-card rounded-2xl border border-border">
                    <input 
                      type="color" 
                      value={formData.secondaryColor}
                      onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                      className="w-12 h-12 rounded-lg bg-transparent cursor-pointer"
                    />
                    <input 
                      type="text" 
                      value={formData.secondaryColor}
                      onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                      className="flex-1 bg-transparent text-text font-mono uppercase focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-bold text-subtext uppercase tracking-wider ml-4">Tertiary Color (Optional)</label>
                <div className="flex items-center gap-4 p-4 bg-card rounded-2xl border border-border">
                  <input 
                    type="color" 
                    value={formData.tertiaryColor || '#000000'}
                    onChange={(e) => handleInputChange('tertiaryColor', e.target.value)}
                    className="w-12 h-12 rounded-lg bg-transparent cursor-pointer"
                  />
                  <input 
                    type="text" 
                    value={formData.tertiaryColor}
                    onChange={(e) => handleInputChange('tertiaryColor', e.target.value)}
                    placeholder="E.G. #FFFFFF"
                    className="flex-1 bg-transparent text-text font-mono uppercase focus:outline-none"
                  />
                </div>
              </div>

              {/* Logo Upload */}
              <div className="space-y-4">
                <label className="text-xs font-bold text-subtext uppercase tracking-wider ml-4 italic">Upload Logo (Optional)</label>
                <div className="relative group p-8 rounded-3xl border-2 border-dashed border-white/10 bg-white/5 hover:border-primary/50 transition-all flex flex-col items-center justify-center gap-4 cursor-pointer overflow-hidden">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo Preview" className="h-20 object-contain" />
                  ) : (
                    <ImageIcon className="text-subtext w-10 h-10 group-hover:text-primary transition-colors" />
                  )}
                  <div className="text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-text">
                      {logoPreview ? 'Click to change logo' : 'Upload your brand identity'}
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setLogoFile(file);
                        setLogoPreview(URL.createObjectURL(file));
                        const base64 = await uploadFile(file);
                        handleInputChange('logoUrl', base64);
                        toast.success('Logo uploaded!');
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={handleBack} className="flex-1 border border-primary text-primary py-6 rounded-2xl font-bold text-xl hover:bg-primary hover:text-white transition-all">Back</button>
              <button onClick={handleNext} className="flex-1 bg-primary text-white py-6 rounded-2xl font-bold text-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20">Next</button>
            </div>
          </motion.div>
        );
      case 6:
        return (
          <motion.div 
            key="step6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
              <div className="space-y-2">
                <h2 className="text-xs font-bold uppercase tracking-[0.4em] text-primary">Step 6</h2>
                <h3 className="text-4xl font-bold tracking-tight text-text">Website Preview</h3>
                <p className="text-subtext font-medium italic">See how your website will look on different devices</p>
              </div>

              <div className="flex items-center gap-2 bg-card p-1.5 rounded-2xl border border-border">
                <button 
                  onClick={() => setPreviewDevice('desktop')}
                  className={`p-3 rounded-xl transition-all ${previewDevice === 'desktop' ? 'bg-primary text-white' : 'text-subtext hover:text-text'}`}
                >
                  <Monitor size={20} />
                </button>
                <button 
                  onClick={() => setPreviewDevice('tablet')}
                  className={`p-3 rounded-xl transition-all ${previewDevice === 'tablet' ? 'bg-primary text-white' : 'text-subtext hover:text-text'}`}
                >
                  <Tablet size={20} />
                </button>
                <button 
                  onClick={() => setPreviewDevice('mobile')}
                  className={`p-3 rounded-xl transition-all ${previewDevice === 'mobile' ? 'bg-primary text-white' : 'text-subtext hover:text-text'}`}
                >
                  <Smartphone size={20} />
                </button>
              </div>
            </div>

            <div className="min-h-[500px] flex items-center justify-center bg-card/30 rounded-[3rem] border border-border/50 p-8 border-dashed">
              <WebsitePreview data={formData} device={previewDevice} />
            </div>

            <div className="bg-primary/10 border border-primary/20 p-6 rounded-2xl">
               <p className="text-xs font-bold text-primary uppercase tracking-widest text-center italic">
                 ⚠️ This is only a sample preview. Final website will be 100% more professional and better.
               </p>
            </div>

            <div className="flex gap-4">
              <button onClick={handleBack} className="flex-1 border border-primary text-primary py-6 rounded-2xl font-bold text-xl hover:bg-primary hover:text-white transition-all">Back</button>
              <button onClick={handleNext} className="flex-1 bg-primary text-white py-6 rounded-2xl font-bold text-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20">Next</button>
            </div>
          </motion.div>
        );
      case 7:
        return (
          <motion.div 
            key="step7"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-primary px-2 py-0.5 rounded flex items-center justify-center" style={{ backgroundColor: formData.primaryColor }}>
                    <span className="text-black font-black text-[10px] tracking-tighter uppercase">{HYPHENATED_NAME}</span>
                  </div>
                  <div className="text-3xl font-bold tracking-tighter text-white uppercase italic">{APP_NAME}</div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-xs font-bold uppercase tracking-[0.4em] text-primary" style={{ color: formData.primaryColor }}>Step 7</h2>
                  <h3 className="text-4xl font-bold tracking-tight text-text">Choose Plan</h3>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-card p-2 rounded-2xl border border-border">
                <button 
                  className="px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-white"
                  style={{ backgroundColor: formData.primaryColor }}
                >
                  One-Time Payment
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { 
                  id: 'basic', 
                  name: 'Basic', 
                  price: '₹5,000/-', 
                  features: ['5 Pages', 'Basic SEO', 'Email Support'] 
                },
                { 
                  id: 'standard', 
                  name: 'Standard', 
                  price: '₹15,000/-', 
                  features: ['Everything in Basic', 'SEO optimization', 'Blog updates'] 
                },
                { 
                  id: 'pro', 
                  name: 'Pro', 
                  price: '₹30,000/-', 
                  features: ['Everything in Standard', 'E-commerce', 'AI features'] 
                }
              ].map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => setFormData({ ...formData, plan: plan.id as any })}
                  className={`p-8 rounded-2xl border transition-all text-left flex flex-col h-full ${
                    formData.plan === plan.id 
                      ? 'text-white shadow-lg shadow-primary/20' 
                      : 'bg-card border-border text-text hover:border-primary/50'
                  }`}
                  style={formData.plan === plan.id ? { backgroundColor: formData.primaryColor, borderColor: formData.primaryColor } : {}}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div 
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${formData.plan === plan.id ? 'bg-white/20' : 'bg-primary/10 text-primary'}`}
                      style={formData.plan !== plan.id ? { backgroundColor: formData.primaryColor + '10', color: formData.primaryColor } : {}}
                    >
                      <CreditCard size={24} />
                    </div>
                    {formData.plan === plan.id && <Check size={20} />}
                  </div>
                  <h4 className="text-2xl font-bold mb-2">{plan.name}</h4>
                  <div className="text-3xl font-bold mb-6">{plan.price}</div>
                  <ul className="space-y-3 flex-1">
                    {plan.features.map((feature, i) => (
                      <li key={i} className={`text-xs font-medium flex items-center gap-2 ${formData.plan === plan.id ? 'text-white/80' : 'text-subtext'}`}>
                        <div 
                          className={`w-1.5 h-1.5 rounded-full ${formData.plan === plan.id ? 'bg-white' : 'bg-primary'}`} 
                          style={formData.plan !== plan.id ? { backgroundColor: formData.primaryColor } : {}}
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>

            <div className="flex gap-4">
              <button 
                onClick={handleBack} 
                className="flex-1 border border-primary text-primary py-6 rounded-2xl font-bold text-xl hover:bg-primary hover:text-white transition-all"
                style={{ borderColor: formData.primaryColor, color: formData.primaryColor }}
              >
                Back
              </button>
              <button 
                onClick={() => {
                  if (!formData.plan) {
                    toast.error('Please select a plan to continue');
                    return;
                  }
                  handleNext();
                }} 
                className="flex-1 bg-primary text-white py-6 rounded-2xl font-bold text-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
                style={{ backgroundColor: formData.primaryColor }}
              >
                Next
              </button>
            </div>
          </motion.div>
        );
      case 8:
        return (
          <motion.div 
            key="step8"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-[0.4em] text-primary" style={{ color: formData.primaryColor }}>Step 8</h2>
              <h3 className="text-4xl font-bold tracking-tight text-white italic leading-none uppercase">Terms & Submission</h3>
              <p className="text-subtext font-medium italic">Review our terms before launching your project.</p>
            </div>

            <div className="bg-card rounded-[2.5rem] p-10 space-y-8 border border-border/50">
              <h4 className="text-xl font-black text-text uppercase italic tracking-tighter">Project Review</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Business Identity</p>
                    <p className="text-sm font-bold text-white">{formData.businessName || 'Not Set'}</p>
                    <p className="text-[10px] text-white/40 italic">{formData.businessType || 'No Type selected'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Target Domain</p>
                    <p className="text-sm font-bold text-[#c7c42a]" style={{ color: formData.primaryColor }}>{formData.domain || 'Not Set'}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Selected Plan</p>
                    <p className="text-sm font-bold text-white uppercase">{formData.plan} ({formData.billingCycle})</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Features Activated</p>
                    <p className="text-[10px] font-bold text-white/40 leading-relaxed">
                      {formData.selectedFeatures?.join(', ') || 'None selected'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-[2.5rem] p-10 space-y-8 border border-border/50 max-h-[30vh] overflow-y-auto scrollbar-hide relative group">
              <div className="space-y-8 text-subtext font-medium leading-relaxed">
                <section className="space-y-4">
                  <h4 className="text-xl font-black text-text uppercase italic tracking-tighter">1. Services</h4>
                  <p className="text-sm opacity-80">We provide premium website development services tailored to your business needs as specified in this onboarding flow.</p>
                </section>

                <section className="space-y-4">
                  <h4 className="text-xl font-black text-text uppercase italic tracking-tighter">2. Project Approval</h4>
                  <p className="text-sm opacity-80">All project requests are subject to engineering review. We reserve the right to refine or adjust scope based on technical feasibility.</p>
                </section>

                <section className="space-y-4">
                  <h4 className="text-xl font-black text-text uppercase italic tracking-tighter">3. Payment & Delivery</h4>
                  <p className="text-sm opacity-80">You can finalize your plan and complete payment via your personal Client Dashboard after submission. Development officially begins upon receipt of the initial payment.</p>
                </section>
              </div>
            </div>

            <div className="flex items-center gap-6 p-8 bg-white/5 rounded-[2rem] border border-white/5 transition-all hover:bg-white/10 group cursor-pointer" onClick={() => setAgreedToTerms(!agreedToTerms)}>
              <div 
                className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${
                  agreedToTerms ? 'bg-primary border-primary text-black' : 'border-white/20'
                }`}
                style={agreedToTerms ? { backgroundColor: formData.primaryColor, borderColor: formData.primaryColor } : {}}
              >
                {agreedToTerms && <Check size={18} strokeWidth={4} />}
              </div>
              <p className="text-xs font-bold text-white/60 uppercase tracking-widest leading-relaxed">
                I have reviewed my project summary and agree to the <span className="text-primary italic underline underline-offset-4" style={{ color: formData.primaryColor }}>Terms & Conditions</span>
              </p>
            </div>

            <div className="flex gap-6">
              <button onClick={handleBack} className="flex-[0.4] border-2 border-white/10 text-white/60 py-6 rounded-[2rem] font-black text-xl hover:bg-white/5 transition-all uppercase italic tracking-tighter">Back</button>
              <button 
                onClick={handleSubmit} 
                disabled={!agreedToTerms || isSubmitting}
                className={`flex-1 py-6 rounded-[2rem] font-black text-2xl transition-all flex items-center justify-center gap-4 shadow-2xl ${
                  agreedToTerms && !isSubmitting
                    ? 'bg-primary text-black hover:scale-[1.02] active:scale-[0.98]' 
                    : 'bg-white/5 text-white/20 cursor-not-allowed'
                }`}
                style={agreedToTerms && !isSubmitting ? { backgroundColor: formData.primaryColor } : {}}
              >
                {isSubmitting ? <Loader color="black" /> : (
                  <>
                    <span>Launch Project</span>
                    <ArrowRight size={24} />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        );
      case 9:
        return (
          <motion.div 
            key="step9"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 px-8 bg-card rounded-[4rem] border border-border relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50" />
            <div className="relative z-10 space-y-10">
              <div className="w-32 h-32 bg-primary/20 rounded-full flex items-center justify-center text-primary mx-auto relative" style={{ color: formData.primaryColor }}>
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 rounded-full blur-2xl"
                  style={{ backgroundColor: formData.primaryColor }}
                />
                <ShieldCheck size={64} strokeWidth={1.5} className="relative z-10" />
              </div>
              <div className="space-y-6">
                <h2 className="text-6xl font-black uppercase italic tracking-tighter text-white leading-none">Flight Initiated</h2>
                <p className="text-white/40 text-sm font-medium uppercase tracking-[0.3em] max-w-sm mx-auto italic leading-relaxed text-center">
                  Your project has been successfully transmitted. Redirecting to your dashboard control center...
                </p>
              </div>
              <div className="pt-4 flex justify-center">
                <Loader color="white" />
              </div>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  const TOTAL_STEPS = 8;

  return (
    <div className="min-h-screen bg-black font-sans selection:bg-primary selection:text-black">
      <header className="px-10 py-8 border-b border-white/5 bg-black/50 backdrop-blur-md sticky top-0 z-50 text-white">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20" style={{ backgroundColor: formData.primaryColor }}>
              <span className="text-black font-bold text-xl">W</span>
            </div>
            <div className="text-2xl font-bold tracking-tight text-white uppercase italic">
              Webby<span style={{ color: formData.primaryColor }}>Launch</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-1.5 w-32 bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
                className="h-full"
                style={{ backgroundColor: formData.primaryColor }}
              />
            </div>
            <div className="text-[10px] font-black italic text-white/40 uppercase tracking-[0.2em]">Step {step <= 8 ? step : 'Final'} of 8</div>
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-10 py-16">
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </main>
    </div>
  );
}
