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
      className={`w-6 h-6 border-2 border-${color === 'black' ? 'black' : '[#FFD700]'} border-t-transparent rounded-full`}
    />
    <span className={`text-[10px] font-black uppercase tracking-[0.2em] text-${color === 'black' ? 'black' : '[#FFD700]'} animate-pulse italic`}>Processing...</span>
  </div>
);
import { jsPDF } from 'jspdf';
import { toast } from 'react-hot-toast';
import emailjs from '@emailjs/browser';
import { useAuth } from '../context/AuthContext';
import { createProject, getSystemSettings, uploadFile, checkUsernameUnique, createUserProfile } from '../services/database';
import { generateTemplateImage } from '../services/geminiService';
import { SystemSettings } from '../types';

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
      primaryColor: '#FFD700',
      secondaryColor: '#000000',
      tertiaryColor: '',
      logoUrl: '',
      documentsUrl: '',
      plan: 'basic' as 'basic' | 'standard' | 'premium',
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
  const [docFiles, setDocFiles] = useState<File[]>([]);
  const [logoPreview, setLogoPreview] = useState<string>(formData.logoUrl || '');
  const [profilePreview, setProfilePreview] = useState<string>(profile?.photoURL || '');

  const [step, setStep] = useState(() => {
    const saved = localStorage.getItem('onboarding_step');
    return saved ? parseInt(saved, 10) : 1;
  });

  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

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

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (otpTimer > 0) {
      timer = setInterval(() => setOtpTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [otpTimer]);

  const sendOTP = async () => {
    if (!formData.email) {
      toast.error("Please enter an email first");
      return;
    }

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    localStorage.setItem("otp", newOtp);
    localStorage.setItem("otp_expiry", (Date.now() + 5 * 60 * 1000).toString());

    try {
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

      if (serviceId && templateId && publicKey) {
        await emailjs.send(serviceId, templateId, {
          to_email: formData.email,
          to_name: formData.name,
          otp: newOtp,
        }, publicKey);
        
        toast.success("OTP sent to your email!");
      } else {
        // Fallback to server-side OTP sending
        const response = await fetch('/api/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, name: formData.name })
        });
        
        const data = await response.json();
        
        if (data.success) {
          if (data.message.includes("logged to console")) {
            console.warn("Email verification disabled. OTP is:", data.code);
            toast.success(`Test Mode: OTP is ${data.code}`);
            setGeneratedOtp(data.code);
            localStorage.setItem("otp", data.code);
          } else {
            toast.success("OTP sent to your email!");
          }
        } else {
          throw new Error(data.error || "Failed to send OTP");
        }
      }

      setIsOtpSent(true);
      setOtpTimer(30);
    } catch (err: any) {
      console.error("OTP Error:", err);
      toast.error(err.message || "Failed to send OTP. Please try again.");
    }
  };

  const verifyOTP = async () => {
    const storedOtp = localStorage.getItem("otp");
    const expiry = localStorage.getItem("otp_expiry");

    // If we have a stored OTP, it was likely generated locally or returned by the server in test mode
    if (storedOtp && expiry && Date.now() <= parseInt(expiry)) {
      if (otp === storedOtp) {
        toast.success("Email verified successfully!");
        setStep(3);
        return;
      }
    }

    // Otherwise, try server-side verification
    try {
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, code: otp })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success("Email verified successfully!");
        setStep(3);
      } else {
        toast.error(data.error || "Invalid OTP. Please try again.");
      }
    } catch (err) {
      console.error("Verification Error:", err);
      toast.error("Failed to verify OTP. Please try again.");
    }
  };

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
      case 2: // OTP
        if (!otp || otp.length !== 6) invalid.push('otp');
        break;
      case 3: // Business info
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
      case 3: // Domain Preferences
        if (!formData.websiteName) invalid.push('websiteName');
        break;
      case 4: // Design
        if (!formData.primaryColor) invalid.push('primaryColor');
        if (!formData.secondaryColor) invalid.push('secondaryColor');
        break;
      case 5: // Choose Plan
        if (!formData.plan) invalid.push('plan');
        break;
      case 6: // Terms and Conditions
        if (!agreedToTerms) invalid.push('terms');
        break;
      case 7: // Finalize
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
    return `${baseClass} ${isInvalid ? 'border-error shadow-[0_0_12px_rgba(239,68,68,0.4)] animate-shake' : 'border-border'}`;
  };

  const handleNext = () => {
    const invalid = getInvalidFieldsForStep(step);
    if (invalid.length === 0) {
      if (step === 1) {
        sendOTP();
        setStep(2);
      } else if (step === 2) {
        verifyOTP();
      } else {
        setStep(step + 1);
      }
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
        domain: formData.domain,
        domainPreferences: formData.domainPreferences,
        primaryColor: formData.primaryColor,
        secondaryColor: formData.secondaryColor,
        tertiaryColor: formData.tertiaryColor,
        logoUrl: finalLogoUrl,
        documentsUrl: finalDocsUrl,
        plan: formData.plan,
        paymentStatus: 'pending' as 'pending' | 'paid',
        referenceWebsite: formData.referenceWebsite,
        templateId: 'custom-dev',
        estimatedCompletion: null,
        referralSource: formData.referralSource,
        salesCode: formData.salesCode
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

      // Razorpay Integration
      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (!razorpayKey) {
        toast.error("Razorpay Key not configured. Redirecting to dashboard.");
        navigate('/dashboard?success=true');
        return;
      }

      const amount = formData.plan === 'basic' ? 149900 : formData.plan === 'standard' ? 349900 : 999900;

      const options = {
        key: razorpayKey,
        amount: amount,
        currency: "INR",
        name: "WebbyLaunch",
        description: `${formData.plan.toUpperCase()} Plan Subscription`,
        image: "/favicon.svg",
        handler: async function (response: any) {
          try {
            const { updateProject } = await import('../services/database');
            await updateProject(projectId, { 
              paymentStatus: 'paid',
              paymentId: response.razorpay_payment_id
            });
            toast.success("Payment successful!");
            navigate('/dashboard?success=true');
          } catch (err) {
            console.error("Error updating payment status:", err);
            toast.error("Payment recorded but failed to update status. Please contact support.");
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone
        },
        theme: {
          color: "#6366F1"
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

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
              <h3 className="text-4xl font-bold tracking-tight text-text">Verify Email</h3>
              <p className="text-subtext font-medium italic">We've sent a 6-digit OTP to <span className="text-primary">{formData.email}</span></p>
            </div>

            <div className="space-y-6">
              <div className="flex justify-center gap-2">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <input
                    key={i}
                    type="text"
                    maxLength={1}
                    className="w-12 h-16 bg-card border border-border rounded-xl text-center text-2xl font-black text-primary focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all"
                    value={otp[i] || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^\d*$/.test(val)) {
                        const newOtp = otp.split('');
                        newOtp[i] = val;
                        setOtp(newOtp.join(''));
                        if (val && e.target.nextSibling) {
                          (e.target.nextSibling as HTMLInputElement).focus();
                        }
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !otp[i] && (e.target as HTMLInputElement).previousSibling) {
                        (e.target as HTMLInputElement).previousSibling && ( (e.target as HTMLInputElement).previousSibling as HTMLInputElement).focus();
                      }
                    }}
                  />
                ))}
              </div>

              <div className="text-center">
                <button 
                  onClick={sendOTP}
                  disabled={otpTimer > 0}
                  className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/80 disabled:text-subtext transition-colors"
                >
                  {otpTimer > 0 ? `Resend OTP in ${otpTimer}s` : 'Resend OTP'}
                </button>
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={handleBack} className="flex-1 border border-primary text-primary py-6 rounded-2xl font-bold text-xl hover:bg-primary hover:text-white transition-all">Back</button>
              <button 
                onClick={verifyOTP}
                disabled={otp.length !== 6}
                className="flex-1 bg-primary text-white py-6 rounded-2xl font-bold text-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
              >
                Verify & Continue
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

              {/* Logo and Documents Upload */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <label className="text-xs font-bold text-subtext uppercase tracking-wider ml-4">Business Logo</label>
                  <div className="relative group">
                    <div className="w-full h-32 rounded-2xl bg-card border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 group-hover:border-primary/50 transition-all overflow-hidden">
                      {logoPreview ? (
                        <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-contain p-4" />
                      ) : (
                        <>
                          <ImageIcon className="w-8 h-8 text-subtext" />
                          <span className="text-[10px] font-bold text-subtext uppercase tracking-widest">Upload Logo</span>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setLogoFile(file);
                          setLogoPreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-bold text-subtext uppercase tracking-wider ml-4">Business Documents</label>
                  <div className="relative group">
                    <div className="w-full h-32 rounded-2xl bg-card border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 group-hover:border-primary/50 transition-all">
                      <FileText className="w-8 h-8 text-subtext" />
                      <span className="text-[10px] font-bold text-subtext uppercase tracking-widest">
                        {docFiles.length > 0 ? `${docFiles.length} Files Selected` : 'Upload Documents'}
                      </span>
                    </div>
                    <input
                      type="file"
                      multiple
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => {
                        if (e.target.files) {
                          setDocFiles(Array.from(e.target.files));
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

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
              <h2 className="text-xs font-bold uppercase tracking-[0.4em] text-primary">Step 4</h2>
              <h3 className="text-4xl font-bold tracking-tight text-text">Domain Preferences</h3>
            </div>

            <div className="space-y-8">
              <div className="space-y-2">
                <label className="text-xs font-bold text-subtext uppercase tracking-wider ml-4">Business Name <span className="text-error">*</span></label>
                <input
                  type="text"
                  className={getInputClass('businessNameDomain', "w-full p-6 rounded-2xl bg-card border text-text focus:outline-none focus:border-primary font-medium")}
                  value={domainData.businessName}
                  onChange={(e) => handleDomainBusinessNameChange(e.target.value)}
                  placeholder="E.G. mybusiness"
                />
                <p className="text-[10px] text-subtext font-bold uppercase tracking-widest ml-4">Lowercase letters and numbers only, no spaces (3-20 characters)</p>
              </div>

              {domainData.businessName.length >= 3 && (
                <div className="space-y-10">
                  {[0, 1, 2].map((prefIdx) => (
                    <div key={prefIdx} className="space-y-4">
                      <label className="text-xs font-bold text-subtext uppercase tracking-wider ml-4">
                        {prefIdx === 0 ? '1st Preference' : prefIdx === 1 ? '2nd Preference' : '3rd Preference'}
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {extensions.map((ext) => {
                          const isSelectedElsewhere = domainData.preferences.some((p, i) => i !== prefIdx && p === ext);
                          const isCurrentSelection = domainData.preferences[prefIdx] === ext;
                          
                          return (
                            <button
                              key={ext}
                              disabled={isSelectedElsewhere}
                              onClick={() => handlePreferenceChange(prefIdx, ext)}
                              className={`py-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all border flex flex-col items-center gap-1 ${
                                isCurrentSelection 
                                  ? 'bg-primary text-white border-primary' 
                                  : isSelectedElsewhere
                                    ? 'bg-card/50 text-subtext/20 border-border/50 cursor-not-allowed'
                                    : 'bg-card text-subtext border-border hover:border-primary/50'
                              }`}
                            >
                              <span>{domainData.businessName}{ext}</span>
                              {isCurrentSelection && <Check size={12} />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-[10px] font-bold text-subtext uppercase tracking-widest text-center">
                Note: Your first choice is your primary preference. We will try to secure it first.
              </p>

              {domainError && (
                <p className="text-xs font-bold text-error uppercase tracking-widest ml-4">{domainError}</p>
              )}
            </div>

            <div className="flex gap-4">
              <button onClick={handleBack} className="flex-1 border border-primary text-primary py-6 rounded-2xl font-bold text-xl hover:bg-primary hover:text-white transition-all">Back</button>
              <button 
                onClick={handleDomainNext}
                disabled={!!domainError || domainData.preferences.some(p => !p)}
                className={`flex-1 py-6 rounded-2xl font-bold text-xl transition-all ${
                  !domainError && !domainData.preferences.some(p => !p)
                    ? 'bg-primary text-white hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/20'
                    : 'bg-card text-subtext cursor-not-allowed border border-border'
                }`}
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

              <div className="space-y-4">
                <label className="text-xs font-bold text-subtext uppercase tracking-wider ml-4">Upload Logo</label>
                <div className="relative group">
                  <div className="w-full h-48 rounded-2xl bg-card border-2 border-dashed border-border flex flex-col items-center justify-center gap-3 group-hover:border-primary/50 transition-all overflow-hidden">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-contain p-6" />
                    ) : (
                      <>
                        <ImageIcon className="w-10 h-10 text-subtext" />
                        <div className="text-center">
                          <span className="text-xs font-bold text-text uppercase tracking-widest block mb-1">Click to upload logo</span>
                          <span className="text-[10px] font-bold text-subtext uppercase tracking-widest">PNG, JPG or SVG (Max 5MB)</span>
                        </div>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          const { uploadToFileService } = await import('../services/cloudinaryService');
                          toast.promise(
                            uploadToFileService(file).then(url => {
                              setLogoPreview(url);
                              handleInputChange('logoUrl', url);
                            }),
                            {
                              loading: 'Uploading logo...',
                              success: 'Logo uploaded successfully!',
                              error: 'Failed to upload logo'
                            }
                          );
                        } catch (err) {
                          console.error('Logo upload error:', err);
                        }
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
            <div className="space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-[0.4em] text-primary">Step 6</h2>
              <h3 className="text-4xl font-bold tracking-tight text-text">Choose Plan</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { id: 'basic', name: 'Basic', price: '₹1,499/-', features: ['5 Pages', 'Basic SEO', 'Email Support'] },
                { id: 'standard', name: 'Standard', price: '₹3,499/-', features: ['Everything in Basic', 'SEO optimization', 'Blog updates'] },
                { id: 'premium', name: 'Premium', price: '₹9,999/-', features: ['Everything in Standard', 'E-commerce', 'AI features'] }
              ].map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => setFormData({ ...formData, plan: plan.id as any })}
                  className={`p-8 rounded-2xl border transition-all text-left flex flex-col h-full ${
                    formData.plan === plan.id 
                      ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' 
                      : 'bg-card border-border text-text hover:border-primary/50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${formData.plan === plan.id ? 'bg-white/20' : 'bg-primary/10 text-primary'}`}>
                      <CreditCard size={24} />
                    </div>
                    {formData.plan === plan.id && <Check size={20} />}
                  </div>
                  <h4 className="text-2xl font-bold mb-2">{plan.name}</h4>
                  <div className="text-3xl font-bold mb-6">{plan.price}</div>
                  <ul className="space-y-3 flex-1">
                    {plan.features.map((feature, i) => (
                      <li key={i} className={`text-xs font-medium flex items-center gap-2 ${formData.plan === plan.id ? 'text-white/80' : 'text-subtext'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${formData.plan === plan.id ? 'bg-white' : 'bg-primary'}`} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </button>
              ))}
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
            <div className="space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-[0.4em] text-primary">Step 7</h2>
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
                  <div className="space-y-1">
                    <div className="text-xl font-bold text-primary">Pay Advance for starting with us</div>
                    <p className="text-xs font-medium text-subtext">You will pay the remaining balance once you receive your project.</p>
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
                        referralSource: formData.referralSource,
                        salesCode: formData.salesCode
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
    <div className="min-h-screen bg-background font-sans selection:bg-primary selection:text-white">
      <header className="px-10 py-8 border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
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
                animate={{ width: `${(step / 8) * 100}%` }}
                className="h-full bg-primary"
              />
            </div>
            <div className="text-xs font-bold text-primary uppercase tracking-wider">Step {step} of 8</div>
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
