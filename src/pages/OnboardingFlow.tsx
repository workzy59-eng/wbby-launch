import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FirebaseUser } from '../firebase';
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
import { Monitor, Smartphone, Tablet, ExternalLink, Code, Database, Layout, Search, Zap, Image, Mail, MessageSquare, ShieldCheck, UserCheck, ArrowRight, Activity, Ship } from 'lucide-react';

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

const WebsitePreview = ({ data, device }: { data: any, device: 'desktop' | 'tablet' | 'mobile' }) => {
  const containerClasses = {
    desktop: 'w-full h-[600px]',
    tablet: 'w-[768px] h-[700px] mx-auto scale-[0.8] origin-top',
    mobile: 'w-[375px] h-[667px] mx-auto scale-[0.9] origin-top',
  };

  return (
    <div className={`transition-all duration-700 ease-in-out ${containerClasses[device]}`}>
      <div className="bg-white rounded-t-3xl border-8 border-gray-800 shadow-2xl relative h-full flex flex-col overflow-hidden">
        {/* Mock Address Bar */}
        <div className="bg-gray-100 px-4 py-2 border-b flex items-center gap-4">
          <div className="flex gap-1.5">
             <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
             <div className="w-2.5 h-2.5 rounded-full bg-#c7c42a" />
             <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 bg-white rounded-full h-6 flex items-center px-4 text-[10px] text-gray-400 font-mono italic shadow-inner">
             https://{data.businessName?.toLowerCase().replace(/\s/g, '') || 'yourbusiness'}.webbylaunch.com
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-white text-black font-sans no-scrollbar flex flex-col">
          {/* Navbar */}
          <nav className="p-5 border-b flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur-md z-30">
            <div className="flex items-center gap-3">
              {data.logoUrl ? (
                <img src={data.logoUrl} alt="Logo" className="w-8 h-8 object-contain" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-lg" style={{ backgroundColor: data.primaryColor || '#c7c42a' }}>
                  {(data.businessName || 'W')[0].toUpperCase()}
                </div>
              )}
              <span className="font-black text-sm uppercase tracking-tighter leading-none">{data.businessName || 'WEBBYLAUNCH'}</span>
            </div>
            <div className="flex gap-6 items-center">
               <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Home</span>
               <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">About</span>
               <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Contact</span>
            </div>
          </nav>

          {/* Hero */}
          <section className="flex-1 min-h-[400px] flex items-center justify-center p-12 text-center relative overflow-hidden transition-colors duration-1000" style={{ backgroundColor: data.primaryColor || '#000000' }}>
            <div className="relative z-10 max-w-lg mx-auto space-y-8">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl md:text-6xl font-black uppercase tracking-tighter leading-[0.85] italic" 
                style={{ color: data.secondaryColor || '#c7c42a' }}
              >
                Premium {data.businessType || 'Solutions'} <br /> For Your Business
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-xs font-semibold max-w-sm mx-auto opacity-70 leading-relaxed uppercase tracking-wider" 
                style={{ color: data.secondaryColor || '#c7c42a' }}
              >
                {data.description || 'Elevate your digital presence with high-end development and precision engineering.'}
              </motion.p>
              <div className="pt-4 drop-shadow-2xl">
                <button 
                  className="px-10 py-4 rounded-full font-black text-[10px] uppercase tracking-[0.2em] shadow-xl transition-all hover:scale-105 active:scale-95" 
                  style={{ backgroundColor: data.secondaryColor || '#c7c42a', color: data.primaryColor || '#000000' }}
                >
                  Get Started
                </button>
              </div>
            </div>
            
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(${data.secondaryColor} 1px, transparent 1px)`, backgroundSize: '20px 20px' }} />
          </section>

          {/* Features Grid */}
          <section className="py-20 px-10 bg-white grid grid-cols-2 gap-6">
            {data.selectedFeatures?.slice(0, 4).map((feature: string, i: number) => (
              <div key={i} className="p-8 rounded-[2rem] border border-gray-100 bg-gray-50 flex flex-col items-center gap-4 text-center group hover:bg-white hover:shadow-xl transition-all">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform" style={{ backgroundColor: data.primaryColor || '#c7c42a', color: data.secondaryColor || '#000000' }}>
                  <Zap size={24} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-900">{feature}</span>
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
  const { signInWithGoogle } = useAuth();
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
      gstNumber: '',
      addressLine: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
      businessType: '',
      otherBusinessType: '',
      description: '',
      location: '',
      websiteName: '',
      primaryColor: '#c7c42a',
      secondaryColor: '#000000',
      tertiaryColor: '',
      logoUrl: '',
      selectedFeatures: [
        'Mobile Responsive Design',
        'Work Portfolio',
        'Fast Loading Performance'
      ],
      plan: 'basic' as 'basic' | 'standard' | 'pro',
      billingCycle: 'one-time' as 'one-time' | 'subscription',
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

  const navigate = useNavigate();

  useEffect(() => {
    getSystemSettings().then(settings => {
      if (settings) setSystemSettings(settings);
    });
  }, []);

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem('onboarding_data', JSON.stringify(formData));
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
        if (req.businessNumber && !formData.businessNumber) invalid.push('businessNumber');
        if (req.businessLocation && !formData.location) invalid.push('location');
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
      case 4: // Domain Preferences
        if (formData.domainPreferences.some(p => !p)) {
          formData.domainPreferences.forEach((p, i) => {
            if (!p) invalid.push(`domainPreference${i}`);
          });
        }
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
      case 9: // Finalize
        if (!paymentOption) invalid.push('paymentOption');
        break;
    }
    return invalid;
  };

  const isStepValid = () => {
    return getInvalidFieldsForStep(step).length === 0;
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
    if (invalidFields.includes(field)) {
      setInvalidFields(invalidFields.filter(f => f !== field));
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

    try {
      let finalProfileUrl = profile?.photoURL || '';

      // Upload files if present
      if (profileFile) {
        finalProfileUrl = await uploadFile(profileFile, 'profiles');
      }

      const finalBusinessType = formData.businessType === 'Other' ? formData.otherBusinessType : formData.businessType;
      const projectData = {
        userId: user?.uid,
        userName: formData.name || '',
        userEmail: formData.email || '',
        userPhone: formData.phone || '',
        businessName: formData.businessName || '',
        businessNumber: formData.businessNumber || '',
        businessEmail: formData.businessEmail || '',
        businessPhone: formData.businessPhone || '',
        gstNumber: formData.gstNumber || '',
        addressLine: formData.addressLine || '',
        city: formData.city || '',
        state: formData.state || '',
        pincode: formData.pincode || '',
        country: formData.country || 'India',
        businessType: finalBusinessType || '',
        businessLocation: formData.location || '',
        description: formData.description || '',
        websiteName: formData.websiteName || '',
        domain: formData.domain || '',
        domainPreferences: formData.domainPreferences || ['', '', ''],
        primaryColor: formData.primaryColor || '#c7c42a',
        secondaryColor: formData.secondaryColor || '#000000',
        tertiaryColor: formData.tertiaryColor || '',
        selectedFeatures: formData.selectedFeatures || [],
        plan: formData.plan || 'basic',
        paymentStatus: 'pending' as 'pending' | 'paid',
        referenceWebsite: formData.referenceWebsite || '',
        templateId: 'custom-dev',
        estimatedCompletion: null,
        referralSource: formData.referralSource || '',
        salesCode: formData.salesCode || '',
        logoUrl: '',
        documentsUrl: ''
      };

      const projectId = await createProject(projectData);

      // Update user profile with onboarding info
      if (user) {
        await createUserProfile(user, {
          username: formData.username,
          phone: formData.phone,
          photoURL: finalProfileUrl,
          businessName: formData.businessName,
          businessType: finalBusinessType,
          businessEmail: formData.businessEmail,
          businessPhone: formData.businessPhone,
          businessLocation: formData.location,
          onboardingCompleted: true
        });
      }

      // Stripe Payment Links
      const stripeLinks = {
        'one-time': {
          basic: 'https://buy.stripe.com/test_eVqcN45is5n6bTudhRbAs0a',
          standard: 'https://buy.stripe.com/test_6oU6oGdOY8zi7Deb9JbAs0b',
          pro: 'https://buy.stripe.com/test_8x2eVc9yI02M4r21z9bAs0c',
        },
        'subscription': {
          basic: 'https://buy.stripe.com/test_28E7sK4eo4j28Hi91BbAs07',
          standard: 'https://buy.stripe.com/test_28E28q5is4j29Lmgu3bAs08',
          pro: 'https://buy.stripe.com/test_eVqeVccKU9Dm2iU2DdbAs09',
        },
        advance: 'https://buy.stripe.com/test_28E7sK4eo4j28Hi91BbAs07' // Placeholder for Advance Payment
      };

      let paymentUrl = '';
      if (paymentOption === 'understanding') {
        paymentUrl = stripeLinks.advance;
      } else {
        paymentUrl = stripeLinks[formData.billingCycle][formData.plan];
      }

      if (paymentUrl) {
        // Append projectId as client_reference_id for tracking
        const finalUrl = `${paymentUrl}?client_reference_id=${projectId}`;
        
        localStorage.removeItem('onboarding_data');
        localStorage.removeItem('onboarding_step');
        
        toast.success("Redirecting to secure payment...");
        window.location.href = finalUrl;
        return;
      }

      toast.error("Payment configuration missing. Please contact support.");
    } catch (err: any) {
      console.error('Error submitting project:', err);
      setError(err.message || 'Failed to submit project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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

            <button
              onClick={handleNext}
              className="w-full bg-primary text-white py-6 rounded-2xl font-bold text-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
            >
              Next
            </button>
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
              <h3 className="text-4xl font-bold tracking-tight text-text">Business Details</h3>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-subtext uppercase tracking-wider ml-4">Business Name <span className="text-error">*</span></label>
                  <input
                    type="text"
                    className={getInputClass('businessName')}
                    value={formData.businessName}
                    onChange={(e) => handleInputChange('businessName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-subtext uppercase tracking-wider ml-4">Business Phone <span className="text-error">*</span></label>
                  <input
                    type="tel"
                    className={getInputClass('businessPhone')}
                    value={formData.businessPhone}
                    onChange={(e) => handleInputChange('businessPhone', e.target.value)}
                    placeholder="E.G. 9876543210"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-subtext uppercase tracking-wider ml-4">Business Registration No. (Optional)</label>
                  <input
                    type="text"
                    className={getInputClass('businessNumber')}
                    value={formData.businessNumber}
                    onChange={(e) => handleInputChange('businessNumber', e.target.value)}
                    placeholder="E.G. REG123456"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-subtext uppercase tracking-wider ml-4">Business Location <span className="text-error">*</span></label>
                  <input
                    type="text"
                    className={getInputClass('location')}
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="E.G. Mumbai, Maharashtra"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-subtext uppercase tracking-wider ml-4">Business Email <span className="text-error">*</span></label>
                  <input
                    type="email"
                    className={getInputClass('businessEmail')}
                    value={formData.businessEmail}
                    onChange={(e) => handleInputChange('businessEmail', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-subtext uppercase tracking-wider ml-4">GST Number (Optional)</label>
                  <input
                    type="text"
                    className={getInputClass('gstNumber')}
                    value={formData.gstNumber}
                    onChange={(e) => handleInputChange('gstNumber', e.target.value)}
                    placeholder="22AAAAA0000A1Z5"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-subtext uppercase tracking-wider ml-4">Address Line <span className="text-error">*</span></label>
                <input
                  type="text"
                  className={getInputClass('addressLine')}
                  value={formData.addressLine}
                  onChange={(e) => handleInputChange('addressLine', e.target.value)}
                />
              </div>

              {/* Logo and Documents Upload Removed */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-subtext uppercase tracking-wider ml-4">City <span className="text-error">*</span></label>
                  <input
                    type="text"
                    className={getInputClass('city')}
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-subtext uppercase tracking-wider ml-4">State <span className="text-error">*</span></label>
                  <input
                    type="text"
                    className={getInputClass('state')}
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-subtext uppercase tracking-wider ml-4">Pincode <span className="text-error">*</span></label>
                  <input
                    type="text"
                    className={getInputClass('pincode')}
                    value={formData.pincode}
                    onChange={(e) => handleInputChange('pincode', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-subtext uppercase tracking-wider ml-4">Country</label>
                  <input
                    type="text"
                    readOnly
                    className="w-full p-6 rounded-2xl bg-card border border-border text-subtext focus:outline-none font-medium cursor-not-allowed"
                    value={formData.country}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-subtext uppercase tracking-wider ml-4">Business Category <span className="text-error">*</span></label>
                <select
                  className={getInputClass('businessType', "w-full p-6 rounded-2xl bg-card border text-text focus:outline-none focus:border-primary font-medium appearance-none")}
                  value={formData.businessType}
                  onChange={(e) => handleInputChange('businessType', e.target.value)}
                >
                  <option value="">Select Category</option>
                  <option value="Food Court">Food Court</option>
                  <option value="Automobiles">Automobiles</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Gym">Gym & Fitness</option>
                  <option value="Logistics">Logistics</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {formData.businessType === 'Other' && (
                <input
                  type="text"
                  placeholder="ENTER YOUR BUSINESS TYPE"
                  className={getInputClass('otherBusinessType')}
                  value={formData.otherBusinessType}
                  onChange={(e) => handleInputChange('otherBusinessType', e.target.value)}
                />
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-subtext uppercase tracking-wider ml-4">Description <span className="text-error">*</span></label>
                <textarea
                  className={getInputClass('description', "w-full p-6 rounded-2xl bg-card border text-text focus:outline-none focus:border-primary font-medium h-32 resize-none")}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Tell us about your business..."
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={handleBack} className="flex-1 border border-primary text-primary py-6 rounded-2xl font-bold text-xl hover:bg-primary hover:text-white transition-all">Back</button>
              <button 
                onClick={handleNext} 
                className="flex-1 bg-primary text-white py-6 rounded-2xl font-bold text-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
              >
                Next
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
              <h3 className="text-4xl font-bold tracking-tight text-text italic">Domain Selection</h3>
              <p className="text-subtext font-medium italic">Select your preferred domain extensions for your business name</p>
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <label className="text-xs font-bold text-subtext uppercase tracking-wider ml-4 italic">Confirm Business Name for Domain</label>
                <input 
                  type="text"
                  value={formData.businessName.toLowerCase().replace(/\s/g, '')}
                  readOnly
                  className="w-full p-6 rounded-2xl bg-card border border-border text-subtext focus:outline-none font-bold italic opacity-50"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[0, 1, 2].map((idx) => (
                  <div key={idx} className="space-y-4">
                    <label className="text-xs font-bold text-subtext uppercase tracking-wider ml-4 italic">Preference {idx + 1}</label>
                    <div className="relative group">
                      <select
                        className={getInputClass(`domainPreference${idx}`, "w-full p-6 rounded-2xl bg-card border text-text focus:outline-none focus:border-primary font-bold italic appearance-none cursor-pointer")}
                        value={formData.domainPreferences[idx]?.replace(formData.businessName.toLowerCase().replace(/\s/g, ''), '') || ''}
                        onChange={(e) => {
                          const ext = e.target.value;
                          const newPrefs = [...formData.domainPreferences];
                          const bName = formData.businessName.toLowerCase().replace(/\s/g, '');
                          newPrefs[idx] = bName + ext;
                          handleInputChange('domainPreferences', newPrefs);
                          if (idx === 0) handleInputChange('domain', bName + ext);
                        }}
                      >
                        <option value="">Select Extension</option>
                        <option value=".com">.com</option>
                        <option value=".in">.in</option>
                        <option value=".net">.net</option>
                        <option value=".org">.org</option>
                        <option value=".co.in">.co.in</option>
                        <option value=".online">.online</option>
                        <option value=".store">.store</option>
                      </select>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
                        <ArrowRight size={16} className="text-primary rotate-90" style={{ color: formData.primaryColor }} />
                      </div>
                    </div>
                    {formData.domainPreferences[idx] && (
                        <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] ml-4 animate-pulse italic">
                          {formData.domainPreferences[idx]}
                        </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={handleBack} 
                className="flex-1 border border-primary text-primary py-6 rounded-2xl font-bold text-xl hover:bg-primary hover:text-white transition-all uppercase italic"
                style={{ borderColor: formData.primaryColor, color: formData.primaryColor }}
              >
                Back
              </button>
              <button 
                onClick={handleNext} 
                className="flex-1 bg-primary text-white py-6 rounded-2xl font-bold text-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20 uppercase italic"
                style={{ backgroundColor: formData.primaryColor }}
              >
                Next
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

              {/* Logo Upload Removed */}
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
                  onClick={() => setFormData({ ...formData, billingCycle: 'one-time' })}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.billingCycle === 'one-time' ? 'text-white' : 'text-subtext hover:text-text'}`}
                  style={formData.billingCycle === 'one-time' ? { backgroundColor: formData.primaryColor } : {}}
                >
                  One-Time
                </button>
                <button 
                  onClick={() => setFormData({ ...formData, billingCycle: 'subscription' })}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.billingCycle === 'subscription' ? 'text-white' : 'text-subtext hover:text-text'}`}
                  style={formData.billingCycle === 'subscription' ? { backgroundColor: formData.primaryColor } : {}}
                >
                  Monthly
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { 
                  id: 'basic', 
                  name: 'Basic', 
                  price: formData.billingCycle === 'one-time' ? '₹1,499/-' : '₹999/-', 
                  features: ['5 Pages', 'Basic SEO', 'Email Support'] 
                },
                { 
                  id: 'standard', 
                  name: 'Standard', 
                  price: formData.billingCycle === 'one-time' ? '₹3,499/-' : '₹5,999/-', 
                  features: ['Everything in Basic', 'SEO optimization', 'Blog updates'] 
                },
                { 
                  id: 'pro', 
                  name: 'Pro', 
                  price: formData.billingCycle === 'one-time' ? '₹9,999/-' : '₹9,999/-', 
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
              <h2 className="text-xs font-bold uppercase tracking-[0.4em] text-primary">Step 8</h2>
              <h3 className="text-4xl font-bold tracking-tight text-text">Terms & Conditions</h3>
            </div>

            <div className="bg-card rounded-2xl p-8 space-y-6 border border-border max-h-[40vh] overflow-y-auto scrollbar-hide">
              <div className="space-y-6 text-subtext font-medium leading-relaxed">
                <section className="space-y-2">
                  <h4 className="text-lg font-bold text-text">1. Services</h4>
                  <p>We provide website development services based on the information submitted by the client.</p>
                </section>

                <section className="space-y-2">
                  <h4 className="text-lg font-bold text-text">2. Project Approval</h4>
                  <p>All projects are subject to review and approval by the admin. We reserve the right to reject any project.</p>
                </section>

                <section className="space-y-2">
                  <h4 className="text-lg font-bold text-text">3. Payment Terms</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>An advance payment is required to start the project.</li>
                    <li>Advance payment is non-refundable.</li>
                    <li>Final payment must be completed before project delivery.</li>
                  </ul>
                </section>

                <section className="space-y-2">
                  <h4 className="text-lg font-bold text-text">4. Refund Policy</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Advance payments are non-refundable.</li>
                    <li>In case of project rejection, a refund (if applicable) will be processed within 5–7 working days.</li>
                    <li>Refunds will be credited to the original payment method.</li>
                  </ul>
                </section>
              </div>
            </div>

            <div className="flex items-center gap-4 p-6 bg-card rounded-2xl border border-border">
              <button 
                onClick={() => setAgreedToTerms(!agreedToTerms)}
                className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                  agreedToTerms ? 'bg-primary border-primary text-white' : 'border-border'
                }`}
              >
                {agreedToTerms && <Check size={16} />}
              </button>
              <p className="text-sm font-medium text-subtext">
                I have read and agree to the <span className="text-primary">Terms & Conditions</span>
              </p>
            </div>

            <div className="flex gap-4">
              <button onClick={handleBack} className="flex-1 border border-primary text-primary py-6 rounded-2xl font-bold text-xl hover:bg-primary hover:text-white transition-all">Back</button>
              <button 
                onClick={handleNext} 
                disabled={!agreedToTerms}
                className={`flex-1 py-6 rounded-2xl font-bold text-xl transition-all ${
                  agreedToTerms 
                    ? 'bg-primary text-white hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/20' 
                    : 'bg-card text-subtext cursor-not-allowed border border-border'
                }`}
              >
                Next
              </button>
            </div>
          </motion.div>
        );
      case 9:
        return (
          <motion.div 
            key="step9"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-[0.4em] text-primary">Step 9</h2>
              <h3 className="text-4xl font-bold tracking-tight text-text">Finalize Project</h3>
            </div>
            
            <div className="bg-card rounded-2xl p-8 space-y-8 border border-border">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-text">Ready to Launch</h3>
                <p className="text-subtext font-medium">
                  Your project details have been captured. Choose your payment method to finalize your request.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => setPaymentOption('full')}
                  className={`p-8 rounded-2xl border transition-all text-left relative overflow-hidden group ${
                    paymentOption === 'full' 
                      ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' 
                      : 'bg-card border-border text-text hover:border-primary/50'
                  }`}
                >
                  <div className="absolute top-6 right-6">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentOption === 'full' ? 'border-white' : 'border-border'}`}>
                      {paymentOption === 'full' && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                    </div>
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-wider mb-2 opacity-60">Option 1</div>
                  <div className="text-xl font-bold mb-2">Pay Full Amount</div>
                  <p className={`text-xs font-medium opacity-60 leading-relaxed`}>
                    Get your website live instantly with full ownership and priority support.
                  </p>
                </button>

                <button
                  onClick={() => setPaymentOption('understanding')}
                  className={`p-8 rounded-2xl border transition-all text-left relative overflow-hidden group ${
                    paymentOption === 'understanding' 
                      ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' 
                      : 'bg-card border-border text-text hover:border-primary/50'
                  }`}
                >
                  <div className="absolute top-6 right-6">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentOption === 'understanding' ? 'border-white' : 'border-border'}`}>
                      {paymentOption === 'understanding' && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                    </div>
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-wider mb-2 opacity-60">Option 2</div>
                  <div className="text-xl font-bold mb-2">Advance Payment</div>
                  <p className={`text-xs font-medium opacity-60 leading-relaxed`}>
                    I agree to the project terms and will proceed with the agreed payment schedule.
                  </p>
                </button>
              </div>

              <div className="p-6 bg-background rounded-2xl border border-border">
                {paymentOption === 'full' ? (
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-[10px] font-bold text-subtext uppercase tracking-widest mb-1">Selected Plan</div>
                      <div className="text-xl font-bold text-primary">
                        {formData.plan === 'basic' ? 'Basic' : formData.plan === 'standard' ? 'Standard' : 'Premium'}
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-text">
                      {formData.plan === 'basic' ? '₹1,499/-' : formData.plan === 'standard' ? '₹3,499/-' : '₹9,999/-'}
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <div className="text-xl font-bold text-primary">Pay Advance for starting with us</div>
                      <p className="text-xs font-medium text-subtext">You will pay the remaining balance once you receive your project.</p>
                    </div>
                    <div className="text-2xl font-bold text-text">₹499/-</div>
                  </div>
                )}
              </div>

              {error && (
                <div className="p-4 bg-error/10 border border-error/20 rounded-xl text-error text-xs font-bold uppercase tracking-wider">
                  {error}
                </div>
              )}
            </div>
            
            <div className="flex flex-col gap-4">
              <div className="flex gap-4">
                <button 
                  onClick={handleBack} 
                  disabled={isSubmitting}
                  className="flex-1 border border-primary text-primary py-6 rounded-2xl font-bold text-xl hover:bg-primary hover:text-white transition-all disabled:opacity-50"
                >
                  Back
                </button>
                {user ? (
                  <div className="flex-1 flex flex-col gap-2">
                    <button 
                      onClick={handleSubmit} 
                      disabled={isSubmitting}
                      className="w-full py-6 bg-primary text-white rounded-2xl font-bold text-xl uppercase hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                      {isSubmitting ? (
                        <Loader color="white" />
                      ) : (
                        'Proceed to Payment'
                      )}
                    </button>
                    <p className="text-[10px] font-bold text-subtext uppercase tracking-widest text-center">
                      By continuing, you agree that advance is non-refundable and refunds (if applicable) may take 5–7 working days.
                    </p>
                  </div>
                ) : (
                  <button 
                    onClick={async () => {
                      try {
                        await signInWithGoogle();
                        toast.success('Signed in successfully!');
                      } catch (err: any) {
                        toast.error(err.message || 'Failed to sign in');
                      }
                    }}
                    className="flex-1 bg-white text-black py-6 rounded-2xl font-bold text-xl uppercase hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-3 border border-border"
                  >
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Sign in with Google
                  </button>
                )}
              </div>
              {user && !isSubmitting && (
                <button 
                  onClick={async () => {
                    setIsSubmitting(true);
                    try {
                      // Create project without redirecting to Stripe
                      const finalLogoUrl = formData.logoUrl;
                      const finalDocsUrl = formData.documentsUrl;
                      const finalProfileUrl = profile?.photoURL || '';
                      
                      const finalBusinessType = formData.businessType === 'Other' ? formData.otherBusinessType : formData.businessType;
                      const projectData = {
                        userId: user?.uid,
                        userName: formData.name || '',
                        userEmail: formData.email || '',
                        userPhone: formData.phone || '',
                        businessName: formData.businessName || '',
                        businessNumber: formData.businessNumber || '',
                        businessEmail: formData.businessEmail || '',
                        businessPhone: formData.businessPhone || '',
                        gstNumber: formData.gstNumber || '',
                        addressLine: formData.addressLine || '',
                        city: formData.city || '',
                        state: formData.state || '',
                        pincode: formData.pincode || '',
                        country: formData.country || 'India',
                        businessType: finalBusinessType || '',
                        businessLocation: formData.location || '',
                        description: formData.description || '',
                        websiteName: formData.websiteName || '',
                        domain: formData.domain || '',
                        domainPreferences: formData.domainPreferences || ['', '', ''],
                        primaryColor: formData.primaryColor || '#c7c42a',
                        secondaryColor: formData.secondaryColor || '#000000',
                        tertiaryColor: formData.tertiaryColor || '',
                        selectedFeatures: formData.selectedFeatures || [],
                        logoUrl: '',
                        documentsUrl: '',
                        plan: formData.plan || 'basic',
                        paymentStatus: 'pending' as 'pending' | 'paid',
                        referenceWebsite: formData.referenceWebsite || '',
                        templateId: 'custom-dev',
                        estimatedCompletion: null,
                        referralSource: formData.referralSource || '',
                        salesCode: formData.salesCode || ''
                      };

                      await createProject(projectData);
                      if (user) {
                        await createUserProfile(user, {
                          username: formData.username,
                          phone: formData.phone,
                          photoURL: finalProfileUrl,
                        });
                      }
                      localStorage.removeItem('onboarding_data');
                      localStorage.removeItem('onboarding_step');
                      navigate('/dashboard?success=true');
                    } catch (err: any) {
                      setError(err.message || 'Failed to skip payment. Please try again.');
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  className="text-[10px] font-bold uppercase tracking-widest text-subtext hover:text-primary transition-all"
                >
                  Skip Payment (Test Mode)
                </button>
              )}
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black font-sans selection:bg-primary selection:text-black">
      <header className="px-10 py-8 border-b border-white/5 bg-black/50 backdrop-blur-md sticky top-0 z-50 text-white">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-white font-bold text-xl">W</span>
            </div>
            <div className="text-2xl font-bold tracking-tight text-text">
              Webby<span className="text-primary">Launch</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-1.5 w-32 bg-border rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(step / 10) * 100}%` }}
                className="h-full bg-primary"
              />
            </div>
            <div className="text-xs font-bold text-primary uppercase tracking-wider">Step {step} of 10</div>
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-10 py-16">
        <div className="mb-8">
           <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(step / 10) * 100}%` }}
                className="h-full bg-primary"
              />
            </div>
        </div>
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </main>
    </div>
  );
}
