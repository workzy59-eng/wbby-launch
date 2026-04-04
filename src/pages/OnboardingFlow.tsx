import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { FirebaseUser } from '../firebase';
import { UserProfile } from '../types';
import { Check, Sparkles, Loader2, Image as ImageIcon, FileText, CreditCard } from 'lucide-react';
import { createProject } from '../services/database';
import { generateTemplateImage } from '../services/geminiService';

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
      businessName: '',
      businessNumber: '',
      businessType: '',
      otherBusinessType: '',
      description: '',
      location: '',
      websiteName: '',
      primaryColor: '#E6FF00',
      secondaryColor: '#000000',
      logoUrl: '',
      documentsUrl: '',
      plan: 'Basic' as 'Basic' | 'Pro',
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
  const [docFiles, setDocFiles] = useState<File[]>([]);
  const [logoPreview, setLogoPreview] = useState<string>(formData.logoUrl || '');

  const [step, setStep] = useState(() => {
    const saved = localStorage.getItem('onboarding_step');
    return saved ? parseInt(saved, 10) : 1;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

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

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError(null);

    try {
      let finalLogoUrl = formData.logoUrl;
      let finalDocsUrl = formData.documentsUrl;

      // Upload files if present
      if (logoFile || docFiles.length > 0) {
        const uploadData = new FormData();
        if (logoFile) uploadData.append('logo', logoFile);
        docFiles.forEach(file => uploadData.append('documents', file));

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: uploadData,
        });

        if (!uploadRes.ok) {
          const errorData = await uploadRes.json().catch(() => ({}));
          throw new Error(errorData.error || 'File upload failed');
        }
        const uploadResult = await uploadRes.json();
        finalLogoUrl = uploadResult.logoUrl || finalLogoUrl;
        finalDocsUrl = uploadResult.documentsUrl || finalDocsUrl;
      }

      const finalBusinessType = formData.businessType === 'Other' ? formData.otherBusinessType : formData.businessType;
      const projectData = {
        userId: user?.uid,
        userName: formData.name,
        userEmail: formData.email,
        userPhone: formData.phone,
        businessName: formData.businessName,
        businessNumber: formData.businessNumber,
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

      // Redirect to Stripe Payment Link
      window.location.href = 'https://buy.stripe.com/test_9B65kC26g16Q2iU5PpbAs01';

      localStorage.removeItem('onboarding_data');
      localStorage.removeItem('onboarding_step');
    } catch (err: any) {
      console.error('Error submitting project:', err);
      setError(err.message || 'Failed to submit project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
              <div className="space-y-2">
                <label className="text-xs font-black text-white/30 uppercase tracking-[0.3em] ml-4">Full Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  className="w-full p-6 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#E6FF00] uppercase font-black italic tracking-tighter"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-white/30 uppercase tracking-[0.3em] ml-4">Phone Number <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  className="w-full p-6 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#E6FF00] uppercase font-black italic tracking-tighter"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="E.G. +91 98765 43210"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-white/30 uppercase tracking-[0.3em] ml-4">Email Address <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  className="w-full p-6 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#E6FF00] uppercase font-black italic tracking-tighter"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter your email address"
                />
              </div>
            </div>

            <button
              disabled={!formData.name || !formData.phone || !formData.email}
              onClick={handleNext}
              className="w-full bg-[#E6FF00] text-[#4A5D4E] py-6 rounded-full font-black text-xl uppercase italic hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all"
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
                    className="w-full p-6 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#E6FF00] uppercase font-black italic tracking-tighter"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-white/30 uppercase tracking-[0.3em] ml-4">Business Phone <span className="text-red-500">*</span></label>
                  <input
                    type="tel"
                    className="w-full p-6 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#E6FF00] uppercase font-black italic tracking-tighter"
                    value={formData.businessNumber}
                    onChange={(e) => setFormData({ ...formData, businessNumber: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-white/30 uppercase tracking-[0.3em] ml-4">Business Category <span className="text-red-500">*</span></label>
                <select
                  className="w-full p-6 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#E6FF00] uppercase font-black italic tracking-tighter appearance-none"
                  value={formData.businessType}
                  onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
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
                  className="w-full p-6 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#E6FF00] uppercase font-black italic tracking-tighter"
                  value={formData.otherBusinessType}
                  onChange={(e) => setFormData({ ...formData, otherBusinessType: e.target.value })}
                />
              )}

              <div className="space-y-2">
                <label className="text-xs font-black text-white/30 uppercase tracking-[0.3em] ml-4">Location <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  className="w-full p-6 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#E6FF00] uppercase font-black italic tracking-tighter"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="City, State"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-white/30 uppercase tracking-[0.3em] ml-4">Description <span className="text-red-500">*</span></label>
                <textarea
                  className="w-full p-6 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#E6FF00] uppercase font-black italic tracking-tighter h-32 resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Tell us about your business..."
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={handleBack} className="flex-1 border border-[#E6FF00] text-[#E6FF00] py-6 rounded-full font-black text-xl uppercase italic hover:bg-[#E6FF00] hover:text-[#4A5D4E] transition-all">Back</button>
              <button 
                disabled={!formData.businessName || !formData.businessNumber || !formData.businessType || !formData.location || !formData.description}
                onClick={handleNext} 
                className="flex-1 bg-[#E6FF00] text-[#4A5D4E] py-6 rounded-full font-black text-xl uppercase italic hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all"
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
              <h3 className="text-5xl font-bold tracking-tighter text-white uppercase italic">Website Details</h3>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-white/30 uppercase tracking-[0.3em] ml-4">Website Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  className="w-full p-6 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#E6FF00] uppercase font-black italic tracking-tighter"
                  value={formData.websiteName}
                  onChange={(e) => setFormData({ ...formData, websiteName: e.target.value })}
                  placeholder="E.G. MyBusiness.com"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-white/30 uppercase tracking-[0.3em] ml-4">Primary Color</label>
                  <div className="flex gap-4">
                    <input
                      type="color"
                      className="w-16 h-16 rounded-xl bg-transparent border-none cursor-pointer"
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    />
                    <input
                      type="text"
                      className="flex-1 p-4 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#E6FF00] font-mono text-sm"
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-white/30 uppercase tracking-[0.3em] ml-4">Secondary Color</label>
                  <div className="flex gap-4">
                    <input
                      type="color"
                      className="w-16 h-16 rounded-xl bg-transparent border-none cursor-pointer"
                      value={formData.secondaryColor}
                      onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                    />
                    <input
                      type="text"
                      className="flex-1 p-4 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#E6FF00] font-mono text-sm"
                      value={formData.secondaryColor}
                      onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-white/30 uppercase tracking-[0.3em] ml-4">Business Logo (Optional)</label>
                <div className="flex items-center gap-6 p-6 rounded-2xl bg-white/5 border border-white/10">
                  <div className="w-20 h-20 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="text-white/20" size={32} />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/jpg"
                      className="hidden"
                      id="logo-upload"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        
                        // Validation
                        if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
                          setError('Only image files (JPG, PNG) are allowed');
                          return;
                        }
                        if (file.size > 5 * 1024 * 1024) {
                          setError('Logo file size must be less than 5MB');
                          return;
                        }

                        setLogoFile(file);
                        setLogoPreview(URL.createObjectURL(file));
                        setError(null);
                      }}
                    />
                    <label 
                      htmlFor="logo-upload"
                      className="inline-block px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-white cursor-pointer transition-all"
                    >
                      {logoFile || formData.logoUrl ? 'Change Logo' : 'Upload Logo'}
                    </label>
                    <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">
                      {logoFile || formData.logoUrl ? 'Logo Selected' : 'JPG, PNG (Max 5MB)'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-white/30 uppercase tracking-[0.3em] ml-4">Additional Documents (Optional)</label>
                <div className="flex items-center gap-6 p-6 rounded-2xl bg-white/5 border border-white/10">
                  <div className="w-20 h-20 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                    {docFiles.length > 0 || formData.documentsUrl ? (
                      <FileText className="text-[#E6FF00]" size={32} />
                    ) : (
                      <FileText className="text-white/20" size={32} />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/jpg,application/pdf"
                      multiple
                      className="hidden"
                      id="doc-upload"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        if (files.length === 0) return;
                        
                        // Validation
                        const invalidType = files.find(f => !['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'].includes(f.type));
                        if (invalidType) {
                          setError('Only JPG, PNG, or PDF files are allowed');
                          return;
                        }
                        const tooBig = files.find(f => f.size > 5 * 1024 * 1024);
                        if (tooBig) {
                          setError('Each file must be less than 5MB');
                          return;
                        }

                        setDocFiles(files);
                        setError(null);
                      }}
                    />
                    <label 
                      htmlFor="doc-upload"
                      className="inline-block px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-white cursor-pointer transition-all"
                    >
                      {docFiles.length > 0 || formData.documentsUrl ? 'Change Documents' : 'Upload Documents'}
                    </label>
                    <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">
                      {docFiles.length > 0 ? `${docFiles.length} files selected: ${docFiles.map(f => f.name).join(', ')}` : formData.documentsUrl ? 'Documents Uploaded' : 'JPG, PNG, PDF (Max 5MB)'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-white/30 uppercase tracking-[0.3em] ml-4">Reference Website (Optional)</label>
                <input
                  type="url"
                  className="w-full p-6 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#E6FF00] uppercase font-black italic tracking-tighter"
                  value={formData.referenceWebsite}
                  onChange={(e) => setFormData({ ...formData, referenceWebsite: e.target.value })}
                  placeholder="E.G. apple.com"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={handleBack} className="flex-1 border border-[#E6FF00] text-[#E6FF00] py-6 rounded-full font-black text-xl uppercase italic hover:bg-[#E6FF00] hover:text-[#4A5D4E] transition-all">Back</button>
              <button 
                disabled={!formData.websiteName}
                onClick={handleNext} 
                className="flex-1 bg-[#E6FF00] text-[#4A5D4E] py-6 rounded-full font-black text-xl uppercase italic hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all"
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

            <div className="grid grid-cols-1 max-w-md mx-auto gap-6">
              {[
                { id: 'Basic', name: 'Starter Plan', price: '₹899/-', features: ['Single Page', 'Basic SEO', '1 Month Support'] },
              ].map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => setFormData({ ...formData, plan: plan.id as 'Basic' | 'Pro' })}
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
              <div className="space-y-4">
                <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">Ready to Launch</h3>
                <p className="text-white/50 italic text-lg leading-relaxed font-medium">
                  Your project details have been captured. Click continue to proceed to payment and finalize your request.
                </p>
              </div>
              <div className="p-6 bg-white/5 rounded-2xl border border-white/10 flex justify-between items-center">
                <div>
                  <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Selected Plan</div>
                  <div className="text-xl font-black text-[#E6FF00] uppercase italic">Starter Plan</div>
                </div>
                <div className="text-2xl font-black text-white">₹899/-</div>
              </div>
              {error && (
                <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-black uppercase tracking-widest">
                  {error}
                </div>
              )}
            </div>
            <div className="flex gap-4">
              <button 
                onClick={handleBack} 
                disabled={isSubmitting}
                className="flex-1 border border-[#E6FF00] text-[#E6FF00] py-6 rounded-full font-black text-xl uppercase italic hover:bg-[#E6FF00] hover:text-[#4A5D4E] transition-all disabled:opacity-50"
              >
                Back
              </button>
              {user ? (
                <button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting}
                  className="flex-1 bg-[#E6FF00] text-black py-6 rounded-full font-black text-xl uppercase italic hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(230,255,0,0.3)] disabled:opacity-50 flex items-center justify-center gap-3"
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
              ) : (
                <button 
                  onClick={() => navigate('/auth', { state: { from: '/onboarding' } })}
                  className="flex-1 bg-[#E6FF00] text-black py-6 rounded-full font-black text-xl uppercase italic hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(230,255,0,0.3)]"
                >
                  Sign in to Continue
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
