import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { FirebaseUser, auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { serverTimestamp } from 'firebase/firestore';
import { UserProfile } from '../types';
import { Check, Image as ImageIcon, FileText, CreditCard } from 'lucide-react';
import { useRegion } from '../context/RegionContext';

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
import { SystemSettings } from '../types';
import { Monitor, Smartphone, Tablet, ExternalLink, Code, Database, Layout, Search, Zap, Image, Mail, MessageSquare, ShieldCheck, UserCheck, ArrowRight, Activity, Ship, Edit, ChevronDown, Globe } from 'lucide-react';

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
          <nav className="p-5 border-b flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur-md z-30" style={{ borderBottomColor: data.primaryColor + '40' }}>
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
               <button className="px-4 py-2 rounded-full font-black text-[8px] uppercase tracking-widest shadow-lg text-white transition-all cursor-pointer hover:scale-105" style={{ backgroundColor: data.primaryColor || '#000000', border: `2.5px solid ${data.secondaryColor || '#000000'}` }}>Contact</button>
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
                  className="px-10 py-5 rounded-full font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl transition-all hover:scale-105 active:scale-95 text-white cursor-pointer" 
                  style={{ backgroundColor: data.secondaryColor || '#000000', color: '#ffffff', border: `1.5px solid ${data.primaryColor || 'transparent'}` }}
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
                  style={{ backgroundColor: data.primaryColor || '#c7c42a', border: `2px solid ${data.secondaryColor || '#000000'}` }}
                >
                  <Zap size={20} className="text-white" />
                </div>
                <span className="text-[8px] font-black uppercase tracking-widest text-gray-900 leading-tight">{feature}</span>
              </div>
            ))}
          </section>

          {/* Contact Bar */}
          <section className="py-12 px-10 border-t border-gray-100 flex flex-col items-center gap-8 bg-gray-50">
             <div className="flex gap-10">
                <div className="flex items-center gap-3">
                  <Mail size={16} style={{ color: data.primaryColor || '#c7c42a' }} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#111]">{data.businessEmail || 'hello@webbylaunch.com'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Smartphone size={16} style={{ color: data.primaryColor || '#c7c42a' }} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#111]">{data.businessPhone || '+91 88000 00000'}</span>
                </div>
             </div>
          </section>

          {/* Footer */}
          <footer className="p-10 text-white text-center" style={{ backgroundColor: data.secondaryColor || '#000000' }}>
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
  const { country: globalCountry, currency, pricing: globalPricing, paymentLinks } = useRegion();

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
      storeType: 'online_store' as 'online_store' | 'local_store',
      addressLine: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India' as 'India' | 'US' | 'UK',
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
      plan: 'basic' as 'basic' | 'standard' | 'premium',
      billingCycle: 'one-time' as 'one-time',
      referenceWebsite: '',
      templateId: '',
      requestedDomain: '',
      referralSource: '',
      salesCode: '',
      developerNote: '',
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

  const shakeAnimation = {
    shake: {
      x: [0, -10, 10, -10, 10, 0],
      transition: { duration: 0.4 }
    }
  };
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
        if (formData.country === 'India' && !formData.state) invalid.push('state');
        if (!formData.pincode) invalid.push('pincode');
        if (!formData.country) invalid.push('country');
        if (req.description && !formData.description) invalid.push('description');
        break;
      case 3: // Domain Selection
        if (!formData.domain) invalid.push('domain');
        break;
      case 4: // Features Select
        if (!formData.selectedFeatures || formData.selectedFeatures.length === 0) invalid.push('selectedFeatures');
        break;
      case 5: // Design
        if (!formData.primaryColor) invalid.push('primaryColor');
        if (!formData.secondaryColor) invalid.push('secondaryColor');
        break;
      case 6: // Preview
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
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'businessName') {
        const sanitized = value.toLowerCase().replace(/[^a-z0-9]/g, '');
        updated.domain = sanitized ? `${sanitized}.com` : '';
        updated.requestedDomain = sanitized ? `${sanitized}.com` : '';
        updated.websiteName = value;
      }
      return updated;
    });
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

  const handleNext = async () => {
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
          const res = await uploadFile(profileFile, 'profiles');
          finalProfileUrl = res.secure_url || res.url;
        }

        const finalBusinessType = formData.businessType === 'Other' ? formData.otherBusinessType : formData.businessType;
        const sanitizedOnboardingData = { ...formData };
        
        const projectData: any = {
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
          onboardingData: sanitizedOnboardingData,
          status: 'Waiting for Review',
          developerNote: formData.developerNote || ''
        };

        console.log("WRITING PROJECT TO FIRESTORE...");
        
        projectData.promptEngineeringInstruction = `You are a Prompt Engineering Expert. Your job is to take basic business details from me and turn them into a professional, high-level prompt for a Web Developer AI. When I give you a Name, Category, Contact, and Color, you will generate a structured prompt that includes: Professional Role: Assigning a Senior Developer persona. Design Language: Expanding the 'color' into a full UI theme. Conversion Logic: Adding sections like Hero, Services, and Lead Gen. Technical Stack: Formatting it for React and Tailwind CSS.`;
        
        projectData.aiDeveloperBrief = `
MISSION BRIEF FOR DEVELOPER:
Business Name: ${formData.businessName}
Business Category: ${formData.businessType}
Location: ${formData.city}, ${formData.state}, ${formData.country}
Primary Color: ${formData.primaryColor}
Secondary Color: ${formData.secondaryColor}

DESCRIPTION:
${formData.description}

FEATURES REQUESTED:
${formData.selectedFeatures?.join(', ') || 'Standard responsive design'}

CLIENT NOTE:
${formData.developerNote || 'No specific note provided.'}
        `.trim();

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
        
        setTimeout(() => {
          if (globalCountry === 'India' && formData.plan) {
            const link = (paymentLinks as any)[formData.plan];
            if (link && link !== '#') {
              window.location.href = link;
              return;
            }
          }
          navigate('/dashboard');
        }, 5000);
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

  const [isCheckingDomain, setIsCheckingDomain] = useState(false);
  const [domainTaken, setDomainTaken] = useState(false);

  const handleDomainNext = async () => {
    if (!formData.domain) return;
    
    setIsCheckingDomain(true);
    
    const restrictedDomains = ['google.com', 'youtube.com', 'facebook.com', 'instagram.com', 'twitter.com', 'apple.com', 'amazon.com', 'microsoft.com', 'webbylaunch.com', 'admin.com', 'test.com'];
    if (restrictedDomains.some(d => formData.domain?.toLowerCase().includes(d))) {
      toast.error("SECURITY ALERT: This domain is restricted or system-reserved.");
      setIsCheckingDomain(false);
      return;
    }

    const { checkDomainInUse } = await import('../services/database');
    
    // Check locally first
    const inUseLocally = await checkDomainInUse(formData.domain);
    if (inUseLocally) {
       setDomainTaken(true);
       toast.error("MISSING SIGNAL: Domain is already registered in our local network.");
       setIsCheckingDomain(false);
       return;
    }

    // Check globally
    const globalStatus = await checkDomain(formData.domain);
    if (globalStatus === 'taken') {
      setDomainTaken(true);
      toast.error("COMMAND REJECTED: This domain is already registered to another owner globally.");
      setIsCheckingDomain(false);
      return;
    }

    setDomainTaken(false);
    setStep(5); // Moving to features step
    setIsCheckingDomain(false);
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
      const RESERVED_WORDS = ['google', 'youtube', 'admin', 'byjus', 'facebook', 'instagram', 'twitter', 'amazon', 'apple', 'microsoft', 'webbylaunch', 'test'];
      const normalized = domain.toLowerCase().trim();
      const domainNameOnly = normalized.split('.')[0];
      
      if (RESERVED_WORDS.some(word => normalized.includes(word) || domainNameOnly.includes(word))) {
        return "taken";
      }

      const res = await fetch(`https://dns.google/resolve?name=${normalized}`);
      const data = await res.json();
      // Google DNS: Status 0 is NOERROR (domain is registered/taken globally), Status 3 is NXDOMAIN (available)
      if (data.Status === 0 || (data.Answer && data.Answer.length > 0)) {
        return "taken";
      }
      return "available";
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

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-subtext uppercase tracking-wider ml-4">Full Name <span className="text-error">*</span></label>
                  <motion.div
                    animate={invalidFields.includes('name') ? "shake" : ""}
                    variants={shakeAnimation}
                  >
                    <input
                      type="text"
                      className={getInputClass('name')}
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </motion.div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-subtext uppercase tracking-wider ml-4">Username <span className="text-error">*</span></label>
                  <motion.div
                    animate={invalidFields.includes('username') ? "shake" : ""}
                    variants={shakeAnimation}
                  >
                    <input
                      type="text"
                      className={getInputClass('username')}
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value.toLowerCase().replace(/\s/g, '_'))}
                      placeholder="rahul_123"
                    />
                  </motion.div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-subtext uppercase tracking-wider ml-4">Phone Number <span className="text-error">*</span></label>
                  <motion.div
                    animate={invalidFields.includes('phone') ? "shake" : ""}
                    variants={shakeAnimation}
                  >
                    <input
                      type="tel"
                      className={getInputClass('phone')}
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="E.G. 9876543210"
                    />
                  </motion.div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-subtext uppercase tracking-wider ml-4">Email Address <span className="text-error">*</span></label>
                  <motion.div
                    animate={invalidFields.includes('email') ? "shake" : ""}
                    variants={shakeAnimation}
                  >
                    <input
                      type="email"
                      className={getInputClass('email')}
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Enter your email address"
                    />
                  </motion.div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-subtext uppercase tracking-wider ml-4">How did you hear about us? <span className="text-error">*</span></label>
                  <motion.div
                    animate={invalidFields.includes('referralSource') ? "shake" : ""}
                    variants={shakeAnimation}
                  >
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
                  </motion.div>
                </div>

                {formData.referralSource === 'I got a call' && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-subtext uppercase tracking-wider ml-4">Sales Code <span className="text-error">*</span></label>
                    <motion.div
                      animate={invalidFields.includes('salesCode') ? "shake" : ""}
                      variants={shakeAnimation}
                    >
                      <input
                        type="text"
                        className={getInputClass('salesCode')}
                        value={formData.salesCode}
                        onChange={(e) => handleInputChange('salesCode', e.target.value.toUpperCase())}
                        placeholder="Enter Sales Code"
                      />
                    </motion.div>
                  </div>
                )}
              </div>
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
            <div className="space-y-2 text-left">
              <h2 className="text-xs font-black uppercase tracking-[0.4em] text-[#c7c42a]">Step 2</h2>
              <h3 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-[0.85]">
                Business<br />
                <span className="text-[#c7c42a]">Intelligence</span>
              </h3>
              <p className="text-white/40 text-[10px] font-black uppercase tracking-widest italic leading-relaxed">
                Define your operational footprint. <br />
                <span className="text-white/60 underline decoration-[#c7c42a]/40">Note: these will be visible on your website metadata.</span>
              </p>
            </div>

            <div className="space-y-10">
              {/* Store Type Selection */}
              <div className="space-y-4">
                <label className="text-xs font-black text-white uppercase tracking-[0.2em] ml-2 italic text-left block">Store Configuration <span className="text-error font-black">*</span></label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'online_store', label: 'Online Store', desc: 'Ships anywhere' },
                    { id: 'local_store', label: 'Local Store', desc: 'Walk-in location' }
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => handleInputChange('storeType', type.id)}
                      className={`p-10 rounded-sm border-2 transition-all text-left flex flex-col gap-2 ${
                        formData.storeType === type.id 
                          ? 'bg-[#c7c42a] border-[#c7c42a]' 
                          : 'bg-black border-white/20 hover:border-white/40'
                      }`}
                    >
                      <span className={`text-2xl font-black italic uppercase tracking-tighter ${formData.storeType === type.id ? 'text-black' : 'text-white'}`}>{type.label}</span>
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${formData.storeType === type.id ? 'text-black/60' : 'text-white/40'}`}>{type.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Country Selection */}
              <div className="space-y-4">
                <label className="text-xs font-black text-white uppercase tracking-[0.2em] ml-2 italic text-left block">Select Country <span className="text-error font-black">*</span></label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { id: 'India', label: 'India', flag: '🇮🇳' },
                    { id: 'US', label: 'United States', flag: '🇺🇸' },
                    { id: 'UK', label: 'United Kingdom', flag: '🇬🇧' }
                  ].map((c) => (
                    <button
                      key={c.id}
                      onClick={() => handleInputChange('country', c.id)}
                      className={`p-10 rounded-sm border-2 transition-all flex flex-col items-center justify-center gap-2 ${
                        formData.country === c.id 
                          ? 'bg-[#c7c42a] border-[#c7c42a]' 
                          : 'bg-black border-white/20 hover:border-white/40 grayscale'
                      }`}
                    >
                      <span className="text-3xl">{c.flag}</span>
                      <span className={`text-[10px] font-black italic uppercase tracking-tighter ${formData.country === c.id ? 'text-black' : 'text-white'}`}>{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-xs font-black text-white uppercase tracking-[0.2em] ml-2 italic text-left block">Business Name <span className="text-error font-black">*</span></label>
                  <motion.div
                    animate={invalidFields.includes('businessName') ? "shake" : ""}
                    variants={shakeAnimation}
                  >
                    <input
                      type="text"
                      className="w-full p-8 rounded-sm bg-black border-2 border-white text-white focus:outline-none focus:border-[#c7c42a] font-black italic text-xl tracking-tighter uppercase placeholder:text-white/10"
                      value={formData.businessName}
                      onChange={(e) => handleInputChange('businessName', e.target.value)}
                      placeholder="E.G. TITAN FORGE"
                    />
                  </motion.div>
                </div>
                <div className="space-y-4">
                  <label className="text-xs font-black text-white uppercase tracking-[0.2em] ml-2 italic text-left block">Business Phone <span className="text-error font-black">*</span></label>
                  <motion.div
                    animate={invalidFields.includes('businessPhone') ? "shake" : ""}
                    variants={shakeAnimation}
                  >
                    <input
                      type="tel"
                      className="w-full p-8 rounded-sm bg-black border-2 border-white text-white focus:outline-none focus:border-[#c7c42a] font-black italic text-xl tracking-tighter uppercase placeholder:text-white/10"
                      value={formData.businessPhone}
                      onChange={(e) => handleInputChange('businessPhone', e.target.value)}
                      placeholder="E.G. 9876543210"
                    />
                  </motion.div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-black text-white uppercase tracking-[0.2em] ml-2 italic text-left block">Business Email <span className="text-error font-black">*</span></label>
                <motion.div
                  animate={invalidFields.includes('businessEmail') ? "shake" : ""}
                  variants={shakeAnimation}
                >
                  <input
                    type="email"
                    className="w-full p-8 rounded-sm bg-black border-2 border-white text-white focus:outline-none focus:border-[#c7c42a] font-black italic text-xl tracking-tighter placeholder:text-white/10"
                    value={formData.businessEmail}
                    onChange={(e) => handleInputChange('businessEmail', e.target.value)}
                    placeholder="HELLO@BRAND.COM"
                  />
                </motion.div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-xs font-black text-white uppercase tracking-[0.2em] ml-2 italic text-left block">Address Line <span className="text-error font-black">*</span></label>
                  <motion.div
                    animate={invalidFields.includes('addressLine') ? "shake" : ""}
                    variants={shakeAnimation}
                  >
                    <input
                      type="text"
                      className="w-full p-8 rounded-sm bg-black border-2 border-white text-white focus:outline-none focus:border-[#c7c42a] font-black italic text-xl tracking-tighter uppercase placeholder:text-white/10"
                      value={formData.addressLine}
                      onChange={(e) => handleInputChange('addressLine', e.target.value)}
                      placeholder="123 BUSINESS PARK"
                    />
                  </motion.div>
                </div>
                <div className="space-y-4">
                  <label className="text-xs font-black text-white uppercase tracking-[0.2em] ml-2 italic text-left block">Pincode <span className="text-error font-black">*</span></label>
                  <motion.div
                    animate={invalidFields.includes('pincode') ? "shake" : ""}
                    variants={shakeAnimation}
                  >
                    <input
                      type="text"
                      maxLength={6}
                      className="w-full p-8 rounded-sm bg-black border-2 border-white text-white focus:outline-none focus:border-[#c7c42a] font-black italic text-xl tracking-tighter uppercase placeholder:text-white/10"
                      value={formData.pincode}
                      onChange={(e) => handleInputChange('pincode', e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                    />
                  </motion.div>
                </div>
              </div>

              <div className="space-y-4 text-left">
                <label className="text-xs font-black text-white uppercase tracking-[0.2em] ml-2 italic block">Location Details <span className="text-error font-black">*</span></label>
                <motion.div
                  animate={(invalidFields.includes('state') || invalidFields.includes('city')) ? "shake" : ""}
                  variants={shakeAnimation}
                >
                  <StateCityDropdown 
                    country={formData.country === 'India' ? 'India' : formData.country === 'US' ? 'United States' : 'United Kingdom'}
                    onSelect={(state, city) => {
                      handleInputChange('state', state);
                      handleInputChange('city', city);
                    }}
                    error={invalidFields.includes('state') || invalidFields.includes('city') ? 'Please select both' : ''}
                  />
                </motion.div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-black text-white uppercase tracking-[0.2em] ml-2 italic text-left block">Business Category <span className="text-error font-black">*</span></label>
                <div className="relative group">
                  <motion.div
                    animate={invalidFields.includes('businessType') ? "shake" : ""}
                    variants={shakeAnimation}
                  >
                    <select
                      className="w-full p-8 rounded-sm bg-black border-2 border-white text-white focus:outline-none focus:border-[#c7c42a] font-black italic text-xl tracking-tighter uppercase appearance-none"
                      value={formData.businessType}
                      onChange={(e) => handleInputChange('businessType', e.target.value)}
                    >
                      <option value="">SELECT CATEGORY</option>
                      <option value="Salon">SALON</option>
                      <option value="Salon/Studio">SALON / STUDIO</option>
                      <option value="Salon/Makeup">SALON / MAKEUP</option>
                      <option value="Food/Cloud Kitchen">FOOD / CLOUD KITCHEN</option>
                      <option value="Food/Restaurant">FOOD / RESTAURANT</option>
                      <option value="Food/Retail">FOOD / RETAIL</option>
                      <option value="Food Court">FOOD COURT</option>
                      <option value="Service/Design">SERVICE / DESIGN</option>
                      <option value="Professional Svc">PROFESSIONAL SVC</option>
                      <option value="Coaching">COACHING</option>
                      <option value="Healthcare">HEALTHCARE</option>
                      <option value="Academy">ACADEMY</option>
                      <option value="Local Decor">LOCAL DECOR</option>
                      <option value="Agency">AGENCY</option>
                      <option value="Tech Agency">TECH AGENCY</option>
                      <option value="Interior">INTERIOR</option>
                      <option value="Travel/Hotel">TRAVEL / HOTEL</option>
                      <option value="Manufacturing">MANUFACTURING</option>
                      <option value="Industrial">INDUSTRIAL</option>
                      <option value="Automobiles">AUTOMOBILES</option>
                      <option value="Clothing">CLOTHING</option>
                      <option value="Gym">GYM & FITNESS</option>
                      <option value="Resort & Hospitality">RESORT & HOSPITALITY</option>
                      <option value="Logistics">LOGISTICS</option>
                      <option value="Other">OTHER</option>
                    </select>
                    <ChevronDown className="absolute right-8 top-1/2 -translate-y-1/2 text-white pointer-events-none group-focus-within:text-[#c7c42a] transition-colors" size={20} />
                  </motion.div>
                </div>
              </div>

              {formData.businessType === 'Other' && (
                <motion.div
                  animate={invalidFields.includes('otherBusinessType') ? "shake" : ""}
                  variants={shakeAnimation}
                >
                  <input
                    type="text"
                    placeholder="ENTER YOUR BUSINESS TYPE"
                    className="w-full p-8 rounded-sm bg-black border-2 border-white text-white focus:outline-none focus:border-[#c7c42a] font-black italic text-xl tracking-tighter uppercase"
                    value={formData.otherBusinessType}
                    onChange={(e) => handleInputChange('otherBusinessType', e.target.value)}
                  />
                </motion.div>
              )}

              <div className="space-y-4">
                <label className="text-xs font-black text-white uppercase tracking-[0.2em] ml-2 italic text-left block">Description <span className="text-error font-black">*</span></label>
                <motion.div
                  animate={invalidFields.includes('description') ? "shake" : ""}
                  variants={shakeAnimation}
                >
                  <textarea
                    className="w-full p-8 rounded-sm bg-black border-2 border-white text-white focus:outline-none focus:border-[#c7c42a] font-black italic text-xl tracking-tighter uppercase placeholder:text-white/10 resize-none text-left h-40"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="TELL US ABOUT YOUR BRAND..."
                  />
                </motion.div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-bold text-subtext uppercase tracking-wider ml-4 italic text-primary">Branding Assets (Optional)</label>
                <div className="relative group p-12 rounded-[3rem] border-2 border-dashed border-white/5 bg-white/[0.02] hover:border-primary/50 transition-all flex flex-col items-center justify-center gap-6 cursor-pointer">
                  <div className="relative">
                    <div className="w-16 h-16 bg-[#c7c42a]/10 rounded-2xl flex items-center justify-center text-[#c7c42a] group-hover:scale-110 transition-all">
                      <span className="text-3xl text-yellow-400">🧷</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-black uppercase italic tracking-tighter text-white">
                      {docsName || 'Drop Business Assets / ID / Trade License'}
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 mt-2 italic flex items-center justify-center gap-2">
                      <span className="text-yellow-400 text-lg">🧷</span> PRO TIP: UPLOAD YOUR LOGO IN NEXT STEP <span className="text-yellow-400 text-lg">🧷</span>
                    </p>
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
                          const res = await uploadFile(file, 'project-files');
                          handleInputChange('documentsUrl', res.secure_url || res.url);
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
                className="flex-1 bg-[#c7c42a] text-black py-6 rounded-[2rem] font-black text-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-[#c7c42a]/20 uppercase italic tracking-tighter"
              >
                Continue
              </button>
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div 
            key="stepDomain"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                 <div className="bg-[#c7c42a] p-2 rounded-xl">
                    <Globe className="text-black" size={24} />
                 </div>
                 <div>
                    <h2 className="text-xs font-black uppercase tracking-[0.4em] text-[#c7c42a]">Step 3</h2>
                    <h3 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none">Domain selection</h3>
                 </div>
              </div>
              <p className="text-white/40 text-[10px] font-black uppercase tracking-widest italic">Secure your digital territory. Choose your primary URL.</p>
            </div>

            <div className="bg-white/5 border border-white/10 p-10 rounded-[3rem] space-y-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 ml-4">Analyze Target Domain</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="w-full p-8 rounded-[2rem] bg-black/40 border border-white/10 text-white font-black italic text-xl tracking-tighter uppercase focus:outline-none focus:border-[#c7c42a] placeholder:text-white/5"
                      value={formData.domain}
                      onChange={(e) => {
                        const val = e.target.value.toLowerCase().replace(/\s/g, '');
                        handleInputChange('domain', val);
                        if (val.length > 3) loadSuggestions(val.split('.')[0]);
                      }}
                      placeholder="MYBRAND.COM"
                    />
                    <button 
                      onClick={handleDomainNext}
                      disabled={!formData.domain || isCheckingDomain}
                      className="bg-[#c7c42a] text-black px-10 rounded-[2rem] font-black text-xl hover:scale-[1.05] active:scale-[0.95] transition-all disabled:opacity-50"
                    >
                      {isCheckingDomain ? <Loader color="black" /> : <ArrowRight size={28} />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {suggestedDomains.map((d, i) => (
                    <button
                      key={i}
                      onClick={() => handleInputChange('domain', d.name)}
                      className={`p-6 rounded-[2rem] border-2 transition-all text-left flex flex-col gap-1 relative overflow-hidden ${
                        formData.domain === d.name 
                          ? 'bg-primary/10 border-primary' 
                          : 'bg-white/5 border-white/5 hover:border-white/10'
                      }`}
                    >
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Option {i + 1}</span>
                      <span className={`text-sm font-black italic uppercase tracking-tighter ${formData.domain === d.name ? 'text-[#c7c42a]' : 'text-white'}`}>{d.name}</span>
                      {d.status === 'loading' && <div className="absolute top-2 right-2"><Loader color="#c7c42a" /></div>}
                      {d.status === 'available' && <div className="absolute top-2 right-2 text-green-400 text-[8px] font-black uppercase">Available</div>}
                      {d.status === 'taken' && <div className="absolute top-2 right-2 text-red-400 text-[8px] font-black uppercase">Taken</div>}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button 
              onClick={handleBack} 
              className="w-full border-2 border-white/5 text-white/20 py-6 rounded-[2rem] font-black text-xl hover:bg-white/5 transition-all uppercase italic tracking-tighter"
            >
              Back to Operations
            </button>
          </motion.div>
        );
      case 4:
        return (
          <motion.div 
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="space-y-2">
              <h2 className="text-xs font-black uppercase tracking-[0.4em] text-[#c7c42a]">Step 4</h2>
              <h3 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none">Select Features</h3>
              <p className="text-white/40 font-black uppercase tracking-widest italic text-[10px] leading-relaxed">Customize your platform with premium features</p>
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
                    <div className={`mt-1 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
                      isSelected ? 'bg-[#c7c42a] border-[#c7c42a] text-black' : 'border-white/20 text-transparent'
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
              <h2 className="text-xs font-black uppercase tracking-[0.4em] text-[#c7c42a]">Step 5</h2>
              <h3 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none">Design your website</h3>
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
                    <div className="flex flex-col items-center gap-2">
                       <span className="text-4xl text-yellow-400 animate-bounce">🧷</span>
                       <ImageIcon className="text-subtext w-10 h-10 group-hover:text-primary transition-colors" />
                    </div>
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
                        const res = await uploadFile(file, 'logos');
                        handleInputChange('logoUrl', res.secure_url || res.url);
                        toast.success('Logo uploaded!');
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-6">
              <button onClick={handleBack} className="flex-[0.4] border-2 border-white/10 text-white/40 py-6 rounded-2xl font-black text-xl hover:bg-white/5 transition-all uppercase italic tracking-tighter">Back</button>
              <button onClick={handleNext} className="flex-1 bg-[#c7c42a] text-black py-6 rounded-2xl font-black text-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-[#c7c42a]/20 uppercase italic tracking-tighter">Next</button>
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
                <h2 className="text-xs font-black uppercase tracking-[0.4em] text-[#c7c42a]">Step 6</h2>
                <h3 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none">Website Preview</h3>
                <p className="text-white/40 font-black uppercase tracking-widest italic text-[10px] leading-relaxed">See how your website will look on different devices</p>
              </div>

              <div className="flex items-center gap-2 bg-card p-1.5 rounded-2xl border border-border">
                <button 
                  onClick={() => setPreviewDevice('desktop')}
                  className={`p-3 rounded-xl transition-all ${previewDevice === 'desktop' ? 'bg-[#c7c42a] text-black shadow-lg shadow-[#c7c42a]/20' : 'text-subtext hover:text-text'}`}
                >
                  <Monitor size={20} />
                </button>
                <button 
                  onClick={() => setPreviewDevice('tablet')}
                  className={`p-3 rounded-xl transition-all ${previewDevice === 'tablet' ? 'bg-[#c7c42a] text-black shadow-lg shadow-[#c7c42a]/20' : 'text-subtext hover:text-text'}`}
                >
                  <Tablet size={20} />
                </button>
                <button 
                  onClick={() => setPreviewDevice('mobile')}
                  className={`p-3 rounded-xl transition-all ${previewDevice === 'mobile' ? 'bg-[#c7c42a] text-black shadow-lg shadow-[#c7c42a]/20' : 'text-subtext hover:text-text'}`}
                >
                  <Smartphone size={20} />
                </button>
              </div>
            </div>

            <div className="min-h-[500px] flex items-center justify-center bg-card/30 rounded-[3rem] border border-border/50 p-8 border-dashed">
              <WebsitePreview data={formData} device={previewDevice} />
            </div>

            <div className="bg-[#c7c42a]/10 border border-[#c7c42a]/20 p-6 rounded-2xl">
               <p className="text-[10px] font-black uppercase tracking-widest text-[#c7c42a] text-center italic">
                 Note: Selected colors apply to buttons (secondary) and background (primary) in your preview.
               </p>
               <p className="text-xs font-black text-[#c7c42a] uppercase tracking-widest text-center italic mt-2 underline decoration-[#c7c42a]/30">
                 ⚠️ This is only a sample preview. Final website will be 100% more professional and better.
               </p>
            </div>

            <div className="flex gap-6">
              <button onClick={handleBack} className="flex-[0.4] border-2 border-white/10 text-white/40 py-6 rounded-2xl font-black text-xl hover:bg-white/5 transition-all uppercase italic tracking-tighter">Back</button>
              <button onClick={handleNext} className="flex-1 bg-[#c7c42a] text-black py-6 rounded-2xl font-black text-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-[#c7c42a]/20 uppercase italic tracking-tighter">Next</button>
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
                  <div className="bg-[#c7c42a] px-3 py-1 rounded flex items-center justify-center shadow-lg shadow-[#c7c42a]/20">
                    <span className="text-black font-black text-[10px] tracking-tighter uppercase">{HYPHENATED_NAME}</span>
                  </div>
                  <div className="text-3xl font-black tracking-tighter text-white uppercase italic leading-none">{APP_NAME}</div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-xs font-black uppercase tracking-[0.4em] text-[#c7c42a]">Step 7</h2>
                  <h3 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none">Choose Plan</h3>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/10">
                <button 
                  className="px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all bg-[#c7c42a] text-black"
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
                  price: `${currency}${globalPricing.basic}/-`, 
                  features: ['1–3 Pages Website', 'Simple Design', 'Mobile Responsive'] 
                },
                { 
                  id: 'standard', 
                  name: 'Standard', 
                  price: `${currency}${globalPricing.standard}/-`, 
                  features: ['4–7 Pages Website', 'Modern UI/UX', 'Basic SEO'] 
                },
                { 
                  id: 'premium', 
                  name: 'Premium', 
                  price: `${currency}${globalPricing.premium}/-`, 
                  features: ['Full Custom Website', 'Advanced UI/UX', 'SEO Optimization'] 
                }
              ].map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => setFormData({ ...formData, plan: plan.id as any })}
                  className={`p-8 rounded-2xl border-2 transition-all text-left flex flex-col h-full relative overflow-hidden ${
                    formData.plan === plan.id 
                      ? 'bg-[#c7c42a] border-[#c7c42a] text-black' 
                      : 'bg-black border-white/10 text-white hover:border-[#c7c42a]/50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div 
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${formData.plan === plan.id ? 'bg-black/10' : 'bg-[#c7c42a]/10 text-[#c7c42a]'}`}
                    >
                      <CreditCard size={24} />
                    </div>
                    {formData.plan === plan.id && <Check size={20} strokeWidth={4} />}
                  </div>
                  <h4 className="text-2xl font-black italic uppercase tracking-tighter mb-2">{plan.name}</h4>
                  <div className="text-3xl font-black italic tracking-tighter mb-6">{plan.price}</div>
                  <ul className="space-y-3 flex-1">
                    {plan.features.map((feature, i) => (
                      <li key={i} className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${formData.plan === plan.id ? 'text-black/60' : 'text-white/40'}`}>
                        <div 
                          className={`w-1.5 h-1.5 rounded-full ${formData.plan === plan.id ? 'bg-black' : 'bg-[#c7c42a]'}`} 
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>

            <div className="flex gap-6">
              <button 
                onClick={handleBack} 
                className="flex-[0.4] border-2 border-white/10 text-white/40 py-6 rounded-2xl font-black text-xl hover:bg-white/5 transition-all uppercase italic tracking-tighter"
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
                className="flex-1 bg-[#c7c42a] text-black py-6 rounded-2xl font-black text-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-[#c7c42a]/20 uppercase italic tracking-tighter"
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
              <h2 className="text-xs font-black uppercase tracking-[0.4em] text-[#c7c42a]">Step 8</h2>
              <h3 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none">Terms & Submission</h3>
              <p className="text-white/40 font-black uppercase tracking-widest italic leading-relaxed text-[10px]">Review our terms before launching your project.</p>
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
                    <p className="text-sm font-bold text-[#c7c42a]">{formData.domain || 'Not Set'}</p>
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

            {/* Note to Developer */}
            <div className="space-y-4">
              <h4 className="text-xl font-black text-text uppercase italic tracking-tighter">Note for Developer</h4>
              <p className="text-[10px] font-medium text-white/40 uppercase tracking-widest italic">Anything special for our team? (e.g., Build carefully, specific font ideas, etc.)</p>
              <textarea
                className="w-full p-8 rounded-[2rem] bg-white/5 border border-white/5 text-white focus:outline-none focus:border-primary font-black italic text-sm tracking-tighter uppercase h-32 resize-none"
                value={formData.developerNote}
                onChange={(e) => handleInputChange('developerNote', e.target.value)}
                placeholder="WRITE YOUR NOTE HERE..."
              />
            </div>

            <h4 className="text-xl font-black text-text uppercase italic tracking-tighter">Terms & Conditions</h4>
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
                  agreedToTerms ? 'bg-[#c7c42a] border-[#c7c42a] text-black' : 'border-white/20'
                }`}
              >
                {agreedToTerms && <Check size={18} strokeWidth={4} />}
              </div>
              <p className="text-xs font-bold text-white/60 uppercase tracking-widest leading-relaxed">
                I have reviewed my project summary and agree to the <span className="text-[#c7c42a] italic underline underline-offset-4">Terms & Conditions</span>
              </p>
            </div>

            <div className="flex gap-6">
              <button onClick={handleBack} className="flex-[0.4] border-2 border-white/10 text-white/60 py-6 rounded-[2rem] font-black text-xl hover:bg-white/5 transition-all uppercase italic tracking-tighter">Back</button>
              <button 
                onClick={handleSubmit} 
                disabled={!agreedToTerms || isSubmitting}
                className={`flex-1 py-6 rounded-[2rem] font-black text-2xl transition-all flex items-center justify-center gap-4 shadow-2xl ${
                  agreedToTerms && !isSubmitting
                    ? 'bg-[#c7c42a] text-black hover:scale-[1.02] active:scale-[0.98]' 
                    : 'bg-white/5 text-white/20 cursor-not-allowed'
                }`}
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
              <div className="w-32 h-32 bg-[#c7c42a]/20 rounded-full flex items-center justify-center text-[#c7c42a] mx-auto relative">
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 rounded-full blur-2xl bg-[#c7c42a]"
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
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 overflow-hidden rounded-lg">
              <img src="/favicon.svg" alt="WebbyLaunch Logo" className="w-full h-full object-cover" />
            </div>
            <div className="text-2xl font-black tracking-tighter uppercase italic text-white">
              Webby<span className="text-[#c7c42a]">Launch</span>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <div className="h-1.5 w-32 bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
                className="h-full bg-[#c7c42a]"
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
