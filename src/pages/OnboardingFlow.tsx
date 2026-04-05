import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { FirebaseUser } from '../firebase';
import { UserProfile } from '../types';
import { Check, Sparkles, Loader2, Image as ImageIcon, FileText, CreditCard } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { createProject, getSystemSettings, uploadFile, checkUsernameUnique, createUserProfile } from '../services/database';
import { generateTemplateImage } from '../services/geminiService';
import { SystemSettings } from '../types';

interface OnboardingFlowProps {
  user: FirebaseUser | null;
  profile: UserProfile | null;
}

export default function OnboardingFlow({ user, profile }: OnboardingFlowProps) {
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
      primaryColor: '#E6FF00',
      secondaryColor: '#000000',
      logoUrl: '',
      documentsUrl: '',
      plan: 'basic' as 'basic' | 'standard' | 'premium',
      referenceWebsite: '',
      templateId: '',
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
  const [docFiles, setDocFiles] = useState<File[]>([]);
  const [logoPreview, setLogoPreview] = useState<string>(formData.logoUrl || '');
  const [profilePreview, setProfilePreview] = useState<string>(profile?.photoURL || '');

  const [step, setStep] = useState(() => {
    const saved = localStorage.getItem('onboarding_step');
    return saved ? parseInt(saved, 10) : 1;
  });

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

    const validatePhone = (p: string) => /^[6-9]\d{9}$/.test(p);
    const validateEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
    const invalid: string[] = [];

    switch (currentStep) {
      case 1: // Personal info
        if (!formData.name) invalid.push('name');
        if (!validateEmail(formData.email)) invalid.push('email');
        if (req.phone && !validatePhone(formData.phone)) invalid.push('phone');
        if (formData.username.length < 3) invalid.push('username');
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
      case 3: // Project details
        if (!formData.websiteName) invalid.push('websiteName');
        break;
      case 4: // Design (Design step is actually step 3 in the UI, but step 4 in the switch)
        // This logic seems to be slightly different from the switch in the original code
        // Let's stick to the original logic but return field names
        if (req.primaryColor && !formData.primaryColor) invalid.push('primaryColor');
        if (req.secondaryColor && !formData.secondaryColor) invalid.push('secondaryColor');
        break;
      case 5: // Assets
        if (req.logo && !logoFile && !formData.logoUrl) invalid.push('logo');
        if (req.documents && docFiles.length === 0 && !formData.documentsUrl) invalid.push('documents');
        break;
      case 6: // Reference
        if (req.referenceWebsite && !formData.referenceWebsite) invalid.push('referenceWebsite');
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

  const getInputClass = (fieldName: string, baseClass: string = "w-full p-6 rounded-2xl bg-white/5 border text-white focus:outline-none focus:border-[#E6FF00] uppercase font-black italic tracking-tighter") => {
    const isInvalid = invalidFields.includes(fieldName);
    return `${baseClass} ${isInvalid ? 'border-red-500 shadow-[0_0_20px_rgba(255,0,0,0.4)] ring-1 ring-red-500' : 'border-white/10'}`;
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
      let finalLogoUrl = formData.logoUrl;
      let finalDocsUrl = formData.documentsUrl;
      let finalProfileUrl = profile?.photoURL || '';

      // Upload files if present
      if (profileFile) {
        finalProfileUrl = await uploadFile(profileFile, 'profiles');
      }
      if (logoFile) {
        finalLogoUrl = await uploadFile(logoFile, 'logos');
      }
      if (docFiles.length > 0) {
        const urls = await Promise.all(docFiles.map(file => uploadFile(file, 'documents')));
        finalDocsUrl = urls.join(',');
      }

      const finalBusinessType = formData.businessType === 'Other' ? formData.otherBusinessType : formData.businessType;
      const projectData = {
        userId: user?.uid,
        userName: formData.name,
        userEmail: formData.email,
        userPhone: formData.phone,
        businessName: formData.businessName,
        businessNumber: formData.businessNumber,
        businessEmail: formData.businessEmail,
        businessPhone: formData.businessPhone,
        gstNumber: formData.gstNumber,
        addressLine: formData.addressLine,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        country: formData.country,
        businessType: finalBusinessType,
        businessLocation: formData.location,
        description: formData.description,
        websiteName: formData.websiteName,
        primaryColor: formData.primaryColor,
        secondaryColor: formData.secondaryColor,
        logoUrl: finalLogoUrl,
        documentsUrl: finalDocsUrl,
        plan: formData.plan,
        paymentStatus: 'pending' as 'pending' | 'paid',
        referenceWebsite: formData.referenceWebsite,
        templateId: 'custom-dev',
        estimatedCompletion: null,
      };

      const projectId = await createProject(projectData);

      // Update user profile with onboarding info
      if (user) {
        await createUserProfile(user, {
          username: formData.username,
          phone: formData.phone,
          photoURL: finalProfileUrl,
        });
      }

      // Redirect to Stripe Payment Link with projectId
      const stripeLinks: Record<string, string> = {
        basic: 'https://buy.stripe.com/test_28E7sK4eo4j28Hi91BbAs07',
        standard: 'https://buy.stripe.com/test_28E28q5is4j29Lmgu3bAs08',
        premium: 'https://buy.stripe.com/test_eVqeVccKU9Dm2iU2DdbAs09'
      };

      const stripeLink = stripeLinks[formData.plan] || stripeLinks.basic;
      
      window.location.href = `${stripeLink}?client_reference_id=${projectId}`;

      localStorage.removeItem('onboarding_data');
      localStorage.removeItem('onboarding_step');
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
    doc.setTextColor(74, 93, 78); // #4A5D4E
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
    extension: '.com' as '.com' | '.in' | '.net' | 'Custom',
    customDomain: ''
  });
  const [domainError, setDomainError] = useState<string | null>(null);
  const [generatedDomain, setGeneratedDomain] = useState('');

  const handleDomainBusinessNameChange = (val: string) => {
    const sanitized = val.toLowerCase().replace(/[^a-z0-9]/g, '');
    setDomainData(prev => ({ ...prev, businessName: sanitized }));
    validateDomain(sanitized, domainData.extension, domainData.customDomain);
  };

  const handleCustomDomainChange = (val: string) => {
    setDomainData(prev => ({ ...prev, customDomain: val }));
    validateDomain(domainData.businessName, domainData.extension, val);
  };

  const validateDomain = (name: string, ext: string, custom: string) => {
    if (ext !== 'Custom') {
      if (name.length < 3) {
        setDomainError('Business name must be at least 3 characters');
        setGeneratedDomain('');
        return;
      }
      if (name.length > 20) {
        setDomainError('Business name must be at most 20 characters');
        setGeneratedDomain('');
        return;
      }
      setDomainError(null);
      setGeneratedDomain(`${name}${ext}`);
    } else {
      if (!custom) {
        setDomainError('Please enter a custom domain');
        setGeneratedDomain('');
        return;
      }
      // Basic domain regex
      const domainRegex = /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}$/i;
      if (!domainRegex.test(custom)) {
        setDomainError('Invalid domain format');
        setGeneratedDomain('');
        return;
      }
      setDomainError(null);
      setGeneratedDomain(custom);
    }
  };

  useEffect(() => {
    validateDomain(domainData.businessName, domainData.extension, domainData.customDomain);
  }, [domainData.extension]);

  const handleDomainNext = () => {
    setFormData(prev => ({ ...prev, websiteName: generatedDomain, domain: generatedDomain }));
    setStep(4);
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
              <h2 className="text-xs font-black uppercase tracking-[0.4em] text-[#E6FF00]">Step 1</h2>
              <h3 className="text-5xl font-bold tracking-tighter text-white uppercase italic">User Details</h3>
            </div>
            
            <div className="space-y-6">
              <div className="flex flex-col items-center gap-4 mb-8">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center overflow-hidden transition-all group-hover:border-[#E6FF00]/50">
                    {profilePreview ? (
                      <img src={profilePreview} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center">
                        <ImageIcon className="w-8 h-8 text-white/20 mx-auto mb-2" />
                        <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Profile Photo</span>
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
                  <div className="absolute -bottom-2 -right-2 bg-[#E6FF00] text-[#4A5D4E] p-2 rounded-full shadow-lg">
                    <Sparkles className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Upload Profile Picture</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-white/30 uppercase tracking-[0.3em] ml-4">Full Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  className={getInputClass('name')}
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-white/30 uppercase tracking-[0.3em] ml-4">Username <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  className={getInputClass('username')}
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value.toLowerCase().replace(/\s/g, '_'))}
                  placeholder="rahul_123"
                />
                <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest ml-4">Only letters, numbers, and underscores</p>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-white/30 uppercase tracking-[0.3em] ml-4">Phone Number <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  className={getInputClass('phone')}
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="E.G. 9876543210"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-white/30 uppercase tracking-[0.3em] ml-4">Email Address <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  className={getInputClass('email')}
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email address"
                />
              </div>
            </div>

            <button
              onClick={handleNext}
              className="w-full bg-[#E6FF00] text-[#4A5D4E] py-6 rounded-full font-black text-xl uppercase italic hover:scale-[1.02] active:scale-[0.98] transition-all"
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
              <h2 className="text-xs font-black uppercase tracking-[0.4em] text-[#E6FF00]">Step 2</h2>
              <h3 className="text-5xl font-bold tracking-tighter text-white uppercase italic">Business Details</h3>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-white/30 uppercase tracking-[0.3em] ml-4">Business Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    className={getInputClass('businessName')}
                    value={formData.businessName}
                    onChange={(e) => handleInputChange('businessName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-white/30 uppercase tracking-[0.3em] ml-4">Business Phone <span className="text-red-500">*</span></label>
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
                  <label className="text-xs font-black text-white/30 uppercase tracking-[0.3em] ml-4">Business Registration No. (Optional)</label>
                  <input
                    type="text"
                    className={getInputClass('businessNumber')}
                    value={formData.businessNumber}
                    onChange={(e) => handleInputChange('businessNumber', e.target.value)}
                    placeholder="E.G. REG123456"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-white/30 uppercase tracking-[0.3em] ml-4">Business Location <span className="text-red-500">*</span></label>
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
                  <label className="text-xs font-black text-white/30 uppercase tracking-[0.3em] ml-4">Business Email <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    className={getInputClass('businessEmail')}
                    value={formData.businessEmail}
                    onChange={(e) => handleInputChange('businessEmail', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-white/30 uppercase tracking-[0.3em] ml-4">GST Number (Optional)</label>
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
                <label className="text-xs font-black text-white/30 uppercase tracking-[0.3em] ml-4">Address Line <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  className={getInputClass('addressLine')}
                  value={formData.addressLine}
                  onChange={(e) => handleInputChange('addressLine', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-white/30 uppercase tracking-[0.3em] ml-4">City <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    className={getInputClass('city')}
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-white/30 uppercase tracking-[0.3em] ml-4">State <span className="text-red-500">*</span></label>
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
                  <label className="text-xs font-black text-white/30 uppercase tracking-[0.3em] ml-4">Pincode <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    className={getInputClass('pincode')}
                    value={formData.pincode}
                    onChange={(e) => handleInputChange('pincode', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-white/30 uppercase tracking-[0.3em] ml-4">Country</label>
                  <input
                    type="text"
                    readOnly
                    className="w-full p-6 rounded-2xl bg-white/5 border border-white/10 text-white/40 focus:outline-none uppercase font-black italic tracking-tighter cursor-not-allowed"
                    value={formData.country}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-white/30 uppercase tracking-[0.3em] ml-4">Business Category <span className="text-red-500">*</span></label>
                <select
                  className={getInputClass('businessType', "w-full p-6 rounded-2xl bg-white/5 border text-white focus:outline-none focus:border-[#E6FF00] uppercase font-black italic tracking-tighter appearance-none")}
                  value={formData.businessType}
                  onChange={(e) => handleInputChange('businessType', e.target.value)}
                >
                  <option value="" className="bg-[#064E3B]">Select Category</option>
                  <option value="Food Court" className="bg-[#064E3B]">Food Court</option>
                  <option value="Automobiles" className="bg-[#064E3B]">Automobiles</option>
                  <option value="Clothing" className="bg-[#064E3B]">Clothing</option>
                  <option value="Gym" className="bg-[#064E3B]">Gym & Fitness</option>
                  <option value="Logistics" className="bg-[#064E3B]">Logistics</option>
                  <option value="Other" className="bg-[#064E3B]">Other</option>
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
                <label className="text-xs font-black text-white/30 uppercase tracking-[0.3em] ml-4">Description <span className="text-red-500">*</span></label>
                <textarea
                  className={getInputClass('description', "w-full p-6 rounded-2xl bg-white/5 border text-white focus:outline-none focus:border-[#E6FF00] uppercase font-black italic tracking-tighter h-32 resize-none")}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Tell us about your business..."
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={handleBack} className="flex-1 border border-[#E6FF00] text-[#E6FF00] py-6 rounded-full font-black text-xl uppercase italic hover:bg-[#E6FF00] hover:text-[#4A5D4E] transition-all">Back</button>
              <button 
                onClick={handleNext} 
                className="flex-1 bg-[#E6FF00] text-[#4A5D4E] py-6 rounded-full font-black text-xl uppercase italic hover:scale-[1.02] active:scale-[0.98] transition-all"
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
              <h2 className="text-xs font-black uppercase tracking-[0.4em] text-[#E6FF00]">Step 3</h2>
              <h3 className="text-5xl font-bold tracking-tighter text-white uppercase italic">Choose Your Domain</h3>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-white/30 uppercase tracking-[0.3em] ml-4 italic">Business Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  className={getInputClass('businessNameDomain', "w-full p-6 rounded-2xl bg-white/5 border text-white focus:outline-none focus:border-[#E6FF00] uppercase font-black italic tracking-tighter")}
                  value={domainData.businessName}
                  onChange={(e) => handleDomainBusinessNameChange(e.target.value)}
                  placeholder="E.G. mybusiness"
                />
                <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest ml-4 italic">Lowercase letters and numbers only, no spaces (3-20 characters)</p>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-black text-white/30 uppercase tracking-[0.3em] ml-4 italic">Select Extension</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {['.com', '.in', '.net', 'Custom'].map((ext) => (
                    <button
                      key={ext}
                      onClick={() => setDomainData(prev => ({ ...prev, extension: ext as any }))}
                      className={`py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all border ${
                        domainData.extension === ext 
                          ? 'bg-[#E6FF00] text-black border-[#E6FF00]' 
                          : 'bg-white/5 text-white/40 border-white/10 hover:border-white/20'
                      }`}
                    >
                      {ext}
                    </button>
                  ))}
                </div>
              </div>

              {domainData.extension === 'Custom' && (
                <div className="space-y-2">
                  <label className="text-xs font-black text-white/30 uppercase tracking-[0.3em] ml-4 italic">Enter Full Domain</label>
                  <input
                    type="text"
                    className={getInputClass('customDomain', "w-full p-6 rounded-2xl bg-white/5 border text-white focus:outline-none focus:border-[#E6FF00] uppercase font-black italic tracking-tighter")}
                    value={domainData.customDomain}
                    onChange={(e) => handleCustomDomainChange(e.target.value)}
                    placeholder="E.G. mysite.com"
                  />
                </div>
              )}

              <div className="p-6 rounded-2xl bg-[#E6FF00]/5 border border-[#E6FF00]/20">
                <p className="text-xs font-black text-white/40 uppercase tracking-widest mb-2 italic">Live Preview</p>
                <p className="text-2xl font-black text-[#E6FF00] italic tracking-tighter">
                  Your domain: {generatedDomain || '...'}
                </p>
              </div>

              {domainError && (
                <p className="text-xs font-bold text-red-500 uppercase tracking-widest ml-4 italic">{domainError}</p>
              )}
            </div>

            <div className="flex gap-4">
              <button onClick={handleBack} className="flex-1 border border-[#E6FF00] text-[#E6FF00] py-6 rounded-full font-black text-xl uppercase italic hover:bg-[#E6FF00] hover:text-[#4A5D4E] transition-all">Back</button>
              <button 
                onClick={handleDomainNext}
                disabled={!!domainError || !generatedDomain}
                className={`flex-1 py-6 rounded-full font-black text-xl uppercase italic transition-all ${
                  !domainError && generatedDomain
                    ? 'bg-[#E6FF00] text-[#4A5D4E] hover:scale-[1.02] active:scale-[0.98]'
                    : 'bg-white/5 text-white/20 cursor-not-allowed'
                }`}
              >
                Next
              </button>
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
              <h2 className="text-xs font-black uppercase tracking-[0.4em] text-[#E6FF00]">Step 4</h2>
              <h3 className="text-5xl font-bold tracking-tighter text-white uppercase italic">Choose Plan</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { id: 'basic', name: 'Basic', price: '₹1,499/-', features: ['5 Pages', 'Basic SEO', 'Email Support'] },
                { id: 'standard', name: 'Standard', price: '₹1,499/-', features: ['Everything in Basic', 'SEO optimization', 'Blog updates'] },
                { id: 'premium', name: 'Premium', price: '₹1,499/-', features: ['Everything in Standard', 'E-commerce', 'AI features'] }
              ].map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => setFormData({ ...formData, plan: plan.id as any })}
                  className={`p-8 rounded-[2rem] border transition-all text-left flex flex-col h-full ${
                    formData.plan === plan.id 
                      ? 'bg-[#E6FF00] border-[#E6FF00] text-[#4A5D4E]' 
                      : 'bg-white/5 border-white/10 text-white hover:border-white/30'
                  }`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                      <CreditCard size={24} />
                    </div>
                    {formData.plan === plan.id && <Check size={20} />}
                  </div>
                  <h4 className="text-2xl font-black uppercase italic tracking-tighter mb-2">{plan.name}</h4>
                  <div className="text-4xl font-black mb-6">{plan.price}</div>
                  <ul className="space-y-3 flex-1">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="text-[10px] font-bold uppercase tracking-widest opacity-60 flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-current" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>

            <div className="flex gap-4">
              <button onClick={handleBack} className="flex-1 border border-[#E6FF00] text-[#E6FF00] py-6 rounded-full font-black text-xl uppercase italic hover:bg-[#E6FF00] hover:text-[#4A5D4E] transition-all">Back</button>
              <button onClick={handleNext} className="flex-1 bg-[#E6FF00] text-[#4A5D4E] py-6 rounded-full font-black text-xl uppercase italic hover:scale-[1.02] active:scale-[0.98] transition-all">Next</button>
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
              <h2 className="text-xs font-black uppercase tracking-[0.4em] text-[#E6FF00]">Step 5</h2>
              <h3 className="text-5xl font-bold tracking-tighter text-white uppercase italic">Finalize Project</h3>
            </div>
            
            <div className="bg-white/5 rounded-[2rem] p-10 space-y-8 border border-white/10">
              <div className="flex justify-between items-start">
                <div className="space-y-4">
                  <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">Ready to Launch</h3>
                  <p className="text-white/50 italic text-lg leading-relaxed font-medium">
                    Your project details have been captured. Choose your payment method to finalize your request.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => setPaymentOption('full')}
                  className={`p-10 rounded-[2.5rem] border transition-all text-left relative overflow-hidden group ${
                    paymentOption === 'full' 
                      ? 'bg-[#E6FF00] border-[#E6FF00] text-[#4A5D4E]' 
                      : 'bg-white/5 border-white/10 text-white hover:border-white/30'
                  }`}
                >
                  <div className="absolute top-6 right-6">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentOption === 'full' ? 'border-[#4A5D4E]' : 'border-white/20'}`}>
                      {paymentOption === 'full' && <div className="w-3 h-3 rounded-full bg-[#4A5D4E]" />}
                    </div>
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 opacity-60 italic">Option 1</div>
                  <div className="text-3xl font-black uppercase italic tracking-tighter leading-none mb-4">Pay Full Amount + Monthly Subscription</div>
                  <p className="text-xs font-bold opacity-60 uppercase tracking-widest leading-relaxed">
                    Get your website live instantly with full ownership and priority support.
                  </p>
                </button>

                <button
                  onClick={() => setPaymentOption('understanding')}
                  className={`p-10 rounded-[2.5rem] border transition-all text-left relative overflow-hidden group ${
                    paymentOption === 'understanding' 
                      ? 'bg-[#E6FF00] border-[#E6FF00] text-[#4A5D4E]' 
                      : 'bg-white/5 border-white/10 text-white hover:border-white/30'
                  }`}
                >
                  <div className="absolute top-6 right-6">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentOption === 'understanding' ? 'border-[#4A5D4E]' : 'border-white/20'}`}>
                      {paymentOption === 'understanding' && <div className="w-3 h-3 rounded-full bg-[#4A5D4E]" />}
                    </div>
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 opacity-60 italic">Option 2</div>
                  <div className="text-3xl font-black uppercase italic tracking-tighter leading-none mb-4">I Understand the Plan & Payment Terms</div>
                  <p className="text-xs font-bold opacity-60 uppercase tracking-widest leading-relaxed">
                    I agree to the project terms and will proceed with the agreed payment schedule.
                  </p>
                </button>
              </div>

              <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                {paymentOption === 'full' ? (
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Selected Plan</div>
                      <div className="text-xl font-black text-[#E6FF00] uppercase italic">
                        {formData.plan === 'basic' ? 'Basic' : formData.plan === 'standard' ? 'Standard' : 'Premium'}
                      </div>
                    </div>
                    <div className="text-2xl font-black text-white">
                      ₹1,499/-
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-xl font-black text-[#E6FF00] uppercase italic">Pay Advance for starting with us</div>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">You will pay the remaining balance once you receive your project.</p>
                  </div>
                )}
              </div>

              {/* Payment Terms & Conditions */}
              <div className="p-8 bg-black/20 rounded-3xl border border-white/5 space-y-6">
                <h3 className="text-xl font-black text-[#E6FF00] uppercase italic flex items-center gap-3">
                  ⚠️ Payment Terms & Conditions
                </h3>
                <div className="space-y-4 text-sm font-medium text-white/60 leading-relaxed">
                  <p>• The advance payment is non-refundable.</p>
                  <p>• Full payment, once made, is generally non-refundable.</p>
                  <p className="text-white/80 font-bold mt-4">• In case of project rejection by admin:</p>
                  <ul className="list-disc list-inside ml-4 space-y-2">
                    <li>A refund may be initiated.</li>
                    <li>Refund processing time is 5–7 working days.</li>
                    <li>The amount will be credited back to the original payment method.</li>
                  </ul>
                  <p className="mt-4">• By proceeding with the payment, you agree to our terms and conditions.</p>
                  <p>• For any queries, please contact support before making payment.</p>
                </div>
              </div>

              {error && (
                <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-black uppercase tracking-widest">
                  {error}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex gap-4">
                <button 
                  onClick={handleBack} 
                  disabled={isSubmitting}
                  className="flex-1 border border-[#E6FF00] text-[#E6FF00] py-6 rounded-full font-black text-xl uppercase italic hover:bg-[#E6FF00] hover:text-[#4A5D4E] transition-all disabled:opacity-50"
                >
                  Back
                </button>
                {user ? (
                  <div className="flex-1 flex flex-col gap-2">
                    <button 
                      onClick={handleSubmit} 
                      disabled={isSubmitting}
                      className="w-full py-6 bg-[#E6FF00] text-black rounded-full font-black text-xl uppercase italic hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(230,255,0,0.3)] disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="animate-spin" size={24} />
                          <span>Processing...</span>
                        </>
                      ) : (
                        'Proceed to Payment'
                      )}
                    </button>
                    <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest text-center">
                      By continuing, you agree that advance is non-refundable and refunds (if applicable) may take 5–7 working days.
                    </p>
                  </div>
                ) : (
                  <button 
                    onClick={() => navigate('/auth', { state: { from: '/onboarding' } })}
                    className="flex-1 bg-[#E6FF00] text-black py-6 rounded-full font-black text-xl uppercase italic hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(230,255,0,0.3)]"
                  >
                    Sign in to Continue
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
                        userName: formData.name,
                        userEmail: formData.email,
                        userPhone: formData.phone,
                        businessName: formData.businessName,
                        businessNumber: formData.businessNumber,
                        businessEmail: formData.businessEmail,
                        businessPhone: formData.businessPhone,
                        gstNumber: formData.gstNumber,
                        addressLine: formData.addressLine,
                        city: formData.city,
                        state: formData.state,
                        pincode: formData.pincode,
                        country: formData.country,
                        businessType: finalBusinessType,
                        businessLocation: formData.location,
                        description: formData.description,
                        websiteName: formData.websiteName,
                        primaryColor: formData.primaryColor,
                        secondaryColor: formData.secondaryColor,
                        logoUrl: finalLogoUrl,
                        documentsUrl: finalDocsUrl,
                        plan: formData.plan,
                        paymentStatus: 'pending' as 'pending' | 'paid',
                        referenceWebsite: formData.referenceWebsite,
                        templateId: 'custom-dev',
                        estimatedCompletion: null,
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
                  className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-[#E6FF00] transition-all"
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
    <div className="min-h-screen bg-[#064E3B] font-sans selection:bg-[#E6FF00] selection:text-black">
      <header className="px-10 py-8 border-b border-white/5">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#E6FF00] rounded-lg flex items-center justify-center">
              <span className="text-black font-black text-xl italic tracking-tighter">W</span>
            </div>
            <div className="text-2xl font-black tracking-tighter uppercase italic text-white">
              Webby<span className="text-[#E6FF00]">Launch</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-1 w-24 bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(step / 4) * 100}%` }}
                className="h-full bg-[#E6FF00]"
              />
            </div>
            <div className="text-xs font-black text-[#E6FF00] uppercase tracking-widest">Step {step} of 5</div>
          </div>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-10 py-16">
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </main>
    </div>
  );
}
