import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useNavigate,
  useLocation,
  Link,
  useSearchParams,
} from "react-router-dom";
import { FirebaseUser, auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { serverTimestamp } from "firebase/firestore";
import { UserProfile } from "../types";
import { Check, Image as ImageIcon, FileText, CreditCard } from "lucide-react";
import { useRegion } from "../context/RegionContext";

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
        ease: "easeInOut",
      }}
      className={`w-6 h-6 border-2 border-${color === "black" ? "black" : "[#c7c42a]"} border-t-transparent rounded-full`}
    />
    <span
      className={`text-[10px] font-black uppercase tracking-[0.2em] text-${color === "black" ? "black" : "[#c7c42a]"} animate-pulse italic`}
    >
      Processing...
    </span>
  </div>
);
import { jsPDF } from "jspdf";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { APP_NAME, HYPHENATED_NAME } from "../constants";
import {
  createProject,
  getSystemSettings,
  uploadFile,
  checkUsernameUnique,
  createUserProfile,
} from "../services/database";
import { SystemSettings } from "../types";
import {
  Monitor,
  Smartphone,
  Tablet,
  ExternalLink,
  Code,
  Database,
  Layout,
  Search,
  Zap,
  Image,
  Mail,
  MessageSquare,
  ShieldCheck,
  UserCheck,
  ArrowRight,
  Activity,
  Ship,
  Edit,
  ChevronDown,
  Globe,
} from "lucide-react";

const PLAN_FEATURES: Record<"basic" | "standard" | "premium", string[]> = {
  basic: [
    "1-3 Pages High-Speed Site",
    "Industrial Cyber-Chic Design",
    "Mobile & Tablet Responsive",
    "Secure Lead Capture Forms",
    "7 Days Priority Launch Support"
  ],
  standard: [
    "4-7 Pages Animated Site",
    "Premium UI/UX Art Direction",
    "Ultra-Fast Global CDN Nodes",
    "Core Web Vitals Optimized",
    "Professional SEO Foundation",
    "7 Days Priority Launch Support"
  ],
  premium: [
    "Unlimited Custom Pages",
    "Elite Interactive Animations",
    "High-Conversion Copy Setup",
    "Custom Admin Control Panel",
    "Payment Gateway Integration",
    "24/7 Dedicated Support Node",
    "Priority Flight Queue Delivery"
  ]
};

import StateCityDropdown from "../components/StateCityDropdown";
import { countries } from "../countries";

const WebsitePreview = ({
  data,
  device,
}: {
  data: any;
  device: "desktop" | "tablet" | "mobile";
}) => {
  const containerClasses = {
    desktop: "w-full h-[600px]",
    tablet: "w-[768px] h-[700px] mx-auto scale-[0.8] origin-top",
    mobile: "w-[375px] h-[667px] mx-auto scale-[0.9] origin-top",
  };

  const getHeroImage = () => {
    switch (data.businessType) {
      case "Gym":
        return "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800";
      case "Resort & Hospitality":
        return "https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=800";
      case "Automobiles":
        return "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=800";
      case "Logistics":
        return "https://images.unsplash.com/photo-1519003722824-191d446dc0e5?q=80&w=800";
      case "Clothing store":
        return "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800";
      case "School & Education":
        return "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=800";
      case "Food court":
        return "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800";
      default:
        return "https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=800";
    }
  };

  return (
    <div
      className={`transition-all duration-700 ease-in-out ${containerClasses[device]}`}
    >
      <div className="bg-white rounded-t-3xl border-8 border-gray-800 shadow-2xl relative h-full flex flex-col overflow-hidden">
        {/* Mock Address Bar */}
        <div className="bg-gray-100 px-4 py-2 border-b flex items-center gap-4">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#c7c42a]" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 bg-white rounded-full h-6 flex items-center px-4 text-[10px] text-gray-400 font-mono italic shadow-inner">
            {data.domain
              ? `https://${data.domain}`
              : `https://${data.businessName?.toLowerCase().replace(/\s/g, "") || "yourbusiness"}.webbylaunch.vercel.app`}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-white text-black font-sans no-scrollbar flex flex-col">
          {/* Navbar */}
          <nav
            className="p-5 border-b flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur-md z-30"
            style={{ borderBottomColor: data.primaryColor + "40" }}
          >
            <div className="flex items-center gap-3">
              {data.logoUrl ? (
                <img
                  src={data.logoUrl}
                  alt="Logo"
                  className="w-8 h-8 object-contain"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-[10px] shadow-lg"
                  style={{ backgroundColor: data.primaryColor || "#c7c42a" }}
                >
                  {(data.businessName || "W")[0].toUpperCase()}
                </div>
              )}
              <span className="font-black text-xs uppercase tracking-tighter leading-none">
                {data.businessName || "WEBBYLAUNCH"}
              </span>
            </div>
            <div className="flex gap-4 items-center">
              <span className="text-[8px] font-bold uppercase tracking-widest text-gray-400">
                Home
              </span>
              <span className="text-[8px] font-bold uppercase tracking-widest text-gray-400">
                Services
              </span>
              <button
                className="px-4 py-2 rounded-full font-black text-[8px] uppercase tracking-widest shadow-lg text-white transition-all cursor-pointer hover:scale-105"
                style={{
                  backgroundColor: data.primaryColor || "#000000",
                  border: `2.5px solid ${data.secondaryColor || "#000000"}`,
                }}
              >
                Contact
              </button>
            </div>
          </nav>

          {/* Hero */}
          <section className="relative min-h-[400px] flex items-center justify-center p-12 text-center overflow-hidden transition-all duration-1000">
            <div className="absolute inset-0 z-0">
              <img
                src={getHeroImage()}
                alt="Hero"
                className="w-full h-full object-cover blur-[2px] scale-110 opacity-40"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/40 to-white" />
            </div>

            <div className="relative z-10 max-w-lg mx-auto space-y-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-block px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.3em] mb-4"
                style={{
                  backgroundColor: data.primaryColor + "20" || "#c7c42a20",
                  color: data.primaryColor || "#c7c42a",
                }}
              >
                Welcome to Precision
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-[0.9] italic text-black"
              >
                {data.businessName || "Premium Solutions"} <br />
                <span style={{ color: data.primaryColor || "#c7c42a" }}>
                  For {data.businessType || "Your Business"}
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-[10px] font-bold max-w-xs mx-auto text-black/60 leading-relaxed uppercase tracking-wider"
              >
                {data.description ||
                  "Elevate your digital presence with high-end development and precision engineering."}
              </motion.p>
              <div className="pt-6">
                <button
                  className="px-10 py-5 rounded-full font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl transition-all hover:scale-105 active:scale-95 text-white cursor-pointer"
                  style={{
                    backgroundColor: data.secondaryColor || "#000000",
                    color: "#ffffff",
                    border: `1.5px solid ${data.primaryColor || "transparent"}`,
                  }}
                >
                  Explore Features
                </button>
              </div>
            </div>
          </section>

          {/* Features Grid */}
          <section className="py-20 px-8 bg-gray-50 grid grid-cols-2 gap-4">
            {data.selectedFeatures
              ?.slice(0, 4)
              .map((feature: string, i: number) => (
                <div
                  key={i}
                  className="p-6 rounded-[2rem] bg-white border border-gray-100 flex flex-col items-center gap-4 text-center group hover:shadow-2xl transition-all"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform"
                    style={{
                      backgroundColor: data.primaryColor || "#c7c42a",
                      border: `2px solid ${data.secondaryColor || "#000000"}`,
                    }}
                  >
                    <Zap size={20} className="text-white" />
                  </div>
                  <span className="text-[8px] font-black uppercase tracking-widest text-gray-900 leading-tight">
                    {feature}
                  </span>
                </div>
              ))}
          </section>

          {/* Contact Bar */}
          <section className="py-12 px-10 border-t border-gray-100 flex flex-col items-center gap-8 bg-gray-50">
            <div className="flex gap-10">
              <div className="flex items-center gap-3">
                <Mail
                  size={16}
                  style={{ color: data.primaryColor || "#c7c42a" }}
                />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#111]">
                  {data.businessEmail || "hello@webbylaunch.vercel.app"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Smartphone
                  size={16}
                  style={{ color: data.primaryColor || "#c7c42a" }}
                />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#111]">
                  {data.businessPhone || "+91 88000 00000"}
                </span>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer
            className="p-10 text-white text-center"
            style={{ backgroundColor: data.secondaryColor || "#000000" }}
          >
            <div className="text-xl font-black italic tracking-tighter uppercase mb-4">
              Webby
              <span style={{ color: data.primaryColor || "#c7c42a" }}>
                Launch
              </span>
            </div>
            <p className="text-[8px] font-bold uppercase tracking-[0.3em] opacity-40">
              © 2026 {data.businessName || "Business"}. Precision Built by
              WebbyLaunch.
            </p>
          </footer>
        </div>

        {/* Device specific artifacts */}
        {device === "mobile" && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-gray-800 rounded-full z-40" />
        )}
      </div>

      <div className="mt-8 text-center">
        <p className="text-white/40 text-[10px] font-black uppercase tracking-widest italic">
          * This is a sample preview. Final website will be significantly more
          professional and optimized.
        </p>
      </div>
    </div>
  );
};

const SuccessScreen = ({ formData, onNavigate }: { formData: any; onNavigate: () => void }) => {
  const [countdown, setCountdown] = useState(6);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onNavigate();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const planKey = formData.plan || "basic";
  const isIndia = formData.country === "India";
  const planAdvanceINR = planKey === "basic" ? 1999 : planKey === "standard" ? 4999 : 9999;
  const planAdvanceUSD = planKey === "basic" ? 29 : planKey === "standard" ? 59 : 119;

  return (
    <motion.div
      key="success"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative min-h-[80vh] flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Glowing background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.08, 0.18, 0.08] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#c7c42a] blur-[100px]"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.06, 0.14, 0.06] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#c7c42a] blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.04, 0.10, 0.04] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-[#c7c42a] blur-[80px]"
        />
      </div>

      <div className="relative z-10 w-full max-w-3xl mx-auto px-6 text-center space-y-12">
        {/* Glowing shield checkmark */}
        <div className="flex justify-center">
          <div className="relative">
            <motion.div
              animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="absolute inset-0 rounded-full blur-3xl bg-[#c7c42a]"
            />
            <motion.div
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
              className="relative w-40 h-40 bg-[#c7c42a] rounded-full flex items-center justify-center shadow-2xl shadow-[#c7c42a]/30 border-4 border-[#c7c42a]/30"
            >
              <Check size={72} strokeWidth={3} className="text-black" />
            </motion.div>
          </div>
        </div>

        {/* Main heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c7c42a] block">
            🚀 Launch Confirmed
          </span>
          <h2 className="text-5xl sm:text-7xl font-black italic tracking-tighter text-white uppercase leading-none">
            Project<br />
            <span className="text-[#c7c42a]">Transmitted!</span>
          </h2>
          <p className="text-white/50 text-sm sm:text-base font-semibold uppercase tracking-widest max-w-lg mx-auto leading-relaxed">
            Your project brief has been received and is now queued in our engineering flight lane. We will begin development shortly.
          </p>
        </motion.div>

        {/* Project Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          {[
            { label: "Plan", value: `${planKey.charAt(0).toUpperCase() + planKey.slice(1)}`, sub: "Tier Selected" },
            { label: "Domain", value: formData.domain || "TBD", sub: "Target URL" },
            { label: "Advance Paid", value: isIndia ? `₹${planAdvanceINR.toLocaleString("en-IN")}` : `$${planAdvanceUSD}`, sub: "Initiation Fee" },
            { label: "Status", value: "In Queue", sub: "Engineering Lane" },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 + i * 0.1, type: "spring", stiffness: 200 }}
              className="bg-white/[0.03] border border-white/10 p-5 rounded-2xl text-left space-y-1.5 hover:border-[#c7c42a]/30 transition-colors"
            >
              <span className="text-[9px] font-black uppercase tracking-[0.25em] text-white/30 block">{item.sub}</span>
              <span className="text-sm sm:text-base font-black text-[#c7c42a] font-mono uppercase tracking-wide block leading-tight">{item.value}</span>
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">{item.label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Countdown + Redirect bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="space-y-4"
        >
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-widest text-white/40">
                Redirecting to Dashboard
              </span>
              <span className="text-2xl font-black text-[#c7c42a] font-mono tabular-nums">
                {countdown}s
              </span>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 6, ease: "linear" }}
                className="h-full bg-[#c7c42a] rounded-full"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={onNavigate}
            className="w-full py-5 bg-[#c7c42a] text-black font-black text-lg uppercase tracking-widest rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-[#c7c42a]/20 flex items-center justify-center gap-3"
          >
            <span>Go to Dashboard Now</span>
            <ArrowRight size={22} />
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};

interface OnboardingFlowProps {
  user: FirebaseUser | null;
  profile: UserProfile | null;
}

export default function OnboardingFlow({ user, profile }: OnboardingFlowProps) {
  const TOTAL_STEPS = 3;
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { signInWithGoogle } = useAuth();
  const {
    country: globalCountry,
    currency,
    pricing: globalPricing,
    paymentLinks,
  } = useRegion();

  useEffect(() => {
    if (!user) {
      navigate("/auth", { state: { from: location.pathname } });
    }
  }, [user, navigate, location]);

  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem("onboarding_data");
    const savedStep = localStorage.getItem("onboarding_step");
    const urlPlan = new URLSearchParams(window.location.search).get("plan") as
      | "basic"
      | "standard"
      | "premium"
      | "custom"
      | null;
    const validPlan =
      urlPlan && ["basic", "standard", "premium", "custom"].includes(urlPlan)
        ? urlPlan
        : null;

    const defaults = {
      name: profile?.displayName || "",
      email: profile?.email || "",
      phone: profile?.phone || "",
      username: profile?.username || "",
      businessName: "",
      businessNumber: "",
      businessEmail: "",
      businessPhone: "",
      storeType: "online_store" as "online_store" | "local_store",
      addressLine: "",
      city: "",
      state: "",
      pincode: "",
      country: "India" as "India" | "US" | "UK",
      businessType: "",
      otherBusinessType: "",
      description: "",
      websiteName: "",
      domain: "",
      primaryColor: "#c7c42a",
      secondaryColor: "#000000",
      tertiaryColor: "",
      logoUrl: "",
      documentsUrl: "",
      selectedFeatures:
        validPlan && validPlan !== "custom"
          ? [...PLAN_FEATURES[validPlan]]
          : [
              "1-3 Pages High-Speed Site",
              "Industrial Cyber-Chic Design",
              "Mobile & Tablet Responsive",
              "Secure Lead Capture Forms",
              "7 Days Priority Launch Support",
            ],
      plan: (validPlan || "basic") as "basic" | "standard" | "premium" | "custom",
      provideDomainHosting: "we_provide" as "we_provide" | "client_provide",
      billingCycle: "one-time" as "one-time",
      referenceWebsite: "",
      templateId: "",
      requestedDomain: "",

      referralSource: "",
      salesCode: "",
      developerNote: "",
    };

    if (saved && savedStep !== "9") {
      try {
        const parsed = JSON.parse(saved);
        return { ...defaults, ...parsed };
      } catch (e) {
        console.error("Error parsing saved onboarding data:", e);
      }
    }
    return defaults;
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [docsFile, setDocsFile] = useState<File | null>(null);
  const [docsName, setDocsName] = useState<string>("");
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string>(
    profile?.photoURL || "",
  );

  const [step, setStepState] = useState(() => {
    const saved = localStorage.getItem("onboarding_step");
    const urlStep = parseInt(
      new URLSearchParams(window.location.search).get("step") || "",
      10,
    );
    return urlStep && urlStep >= 1 && urlStep <= 9
      ? urlStep
      : saved && parseInt(saved, 10) < 9
        ? parseInt(saved, 10)
        : 1;
  });

  const setStep = (newStep: number) => {
    setStepState(newStep);
    setSearchParams({ step: newStep.toString() }, { replace: true });
    localStorage.setItem("onboarding_step", newStep.toString());
  };

  useEffect(() => {
    const urlStep = parseInt(searchParams.get("step") || "", 10);
    if (urlStep && urlStep >= 1 && urlStep <= 9 && urlStep !== step) {
      setStepState(urlStep);
    }
  }, [searchParams]);

  useEffect(() => {
    const savedStep = localStorage.getItem("onboarding_step");
    if (savedStep === "9") {
      localStorage.removeItem("onboarding_step");
      localStorage.removeItem("onboarding_data");
    }
  }, []);

  const [previewDevice, setPreviewDevice] = useState<
    "desktop" | "tablet" | "mobile"
  >("desktop");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [indiaPaymentMethod, setIndiaPaymentMethod] = useState<"upi" | "qr">(
    "qr",
  );
  const [error, setError] = useState<string | null>(null);
  const [invalidFields, setInvalidFields] = useState<string[]>([]);
  const [countrySearchQuery, setCountrySearchQuery] = useState("");
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(
    null,
  );

  const shakeAnimation = {
    shake: {
      x: [0, -10, 10, -10, 10, 0],
      transition: { duration: 0.4 },
    },
  };
  const [paymentOption, setPaymentOption] = useState<"full" | "understanding">(
    "full",
  );
  const [utr, setUtr] = useState("");

  useEffect(() => {
    getSystemSettings().then((settings) => {
      if (settings) setSystemSettings(settings);
    });
  }, []);

  // Persist state to localStorage (excluding large binary data)
  useEffect(() => {
    const { logoUrl, documentsUrl, ...rest } = formData;
    localStorage.setItem("onboarding_data", JSON.stringify(rest));
    localStorage.setItem("onboarding_step", step.toString());
  }, [formData, step]);

  // Update form data when profile becomes available
  useEffect(() => {
    if (profile) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || profile.displayName || "",
        email: prev.email || profile.email || "",
        phone: prev.phone || profile.phone || "",
        username: prev.username || profile.username || "",
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
      case 1: // Client Details + Business Intelligence
        // Personal Details Validation
        if (!formData.name || formData.name.length < 3) invalid.push("name");
        if (!validateEmail(formData.email)) invalid.push("email");
        if (req.phone && !validatePhone(formData.phone)) invalid.push("phone");
        if (formData.username.length < 3) invalid.push("username");
        if (!formData.referralSource) invalid.push("referralSource");

        if (!formData.country) invalid.push("country");
        break;

      case 2: // Project Specifications & Brand Choices
        if (formData.plan === "custom") break;
        if (!formData.domain) invalid.push("domain");
        if (
          !formData.selectedFeatures ||
          formData.selectedFeatures.length === 0
        )
          invalid.push("selectedFeatures");
        if (!formData.plan) invalid.push("plan");
        break;

      case 3: // Checkout Protocol & Invoice
        if (!agreedToTerms) invalid.push("terms");
        break;
    }
    return invalid;
  };

  const isStepValid = () => {
    return getInvalidFieldsForStep(step).length === 0;
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === "businessName") {
        const sanitized = value.toLowerCase().replace(/[^a-z0-9]/g, "");
        updated.domain = sanitized ? `${sanitized}.com` : "";
        updated.requestedDomain = sanitized ? `${sanitized}.com` : "";
        updated.websiteName = value;
      }
      return updated;
    });
    // Also clear individual domain preference errors if applicable
    if (field === "domainPreferences") {
      setInvalidFields((prev) =>
        prev.filter((f) => !f.startsWith("domainPreference")),
      );
    }
    if (invalidFields.includes(field)) {
      setInvalidFields((prev) => prev.filter((f) => f !== field));
    }
  };

  const getInputClass = (
    fieldName: string,
    baseClass: string = "w-full p-6 py-7 px-8 bg-card border text-white focus:outline-none focus:border-[#c7c42a] font-bold text-lg tracking-wide",
  ) => {
    const isInvalid = invalidFields.includes(fieldName);
    return `${baseClass} ${isInvalid ? "border-error shadow-[0_0_12px_rgba(239,68,68,0.4)]" : "border-border"}`;
  };

  const handleNext = async () => {
    const invalid = getInvalidFieldsForStep(step);
    if (invalid.length === 0) {
      setStep(step + 1);
      setInvalidFields([]);
      setError(null);
    } else {
      setInvalidFields(invalid);
      const fieldNames = invalid
        .map((f) => {
          const mapping: Record<string, string> = {
            name: "Full Name",
            email: "Email Address",
            phone: "Phone Number",
            username: "Username",
            referralSource: "Referral Source",

            businessName: "Business Name",
            businessType: "Business Category",
            otherBusinessType: "Custom Business Category",
            businessEmail: "Business Email",
            businessPhone: "Business Phone",
            addressLine: "Address Line",
            city: "City",
            state: "State",
            pincode: "Pincode",
            country: "Country",
            description: "Description",
            domain: "Domain",
            selectedFeatures: "Features",
            primaryColor: "Primary Color",
            secondaryColor: "Secondary Color",
            terms: "Terms agreement",
          };
          return mapping[f] || f;
        })
        .join(", ");

      const msg = `Please fill in all required fields: ${fieldNames}`;
      setError(msg);
      toast.error(msg, { duration: 6000 });
    }
  };
  const handleBack = () => setStep(step - 1);

  const handleSubmit = async () => {
    if (isSubmitting) return;

    const isIndia = formData.country === "India";
    if (!utr || utr.trim().length < 6) {
      const errorMsg = isIndia
        ? "UTR / Reference Number is strictly required to verify your UPI/QR payment."
        : "PayPal Transaction ID is strictly required to verify your payment.";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    console.log("STARTING SUBMISSION... AUTH CHECK IN PROGRESS");

    // CRITICAL: Robust auth wait as requested by user
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      unsubscribe();

      if (!currentUser) {
        console.error("AUTH FAILED IN SUBMIT");
        setError(
          "Your session is not ready. Please wait a moment and try again.",
        );
        setIsSubmitting(false);
        return;
      }

      console.log("AUTH READY:", currentUser.uid);

      try {
        let finalProfileUrl = profile?.photoURL || "";

        if (profileFile) {
          const res = await uploadFile(profileFile, "profiles");
          finalProfileUrl = res.secure_url || res.url;
        }

        const finalBusinessType =
          formData.businessType === "Other"
            ? formData.otherBusinessType
            : formData.businessType;
        const sanitizedOnboardingData = { ...formData, utr };

        const projectData: any = {
          userId: currentUser.uid,
          userName: formData.name || "",
          userEmail: formData.email || "",
          businessName: formData.businessName || "",
          businessType: finalBusinessType || "",
          description: formData.description || "",
          primaryColor: formData.primaryColor || "#c7c42a",
          secondaryColor: formData.secondaryColor || "#000000",
          plan: formData.plan || "basic",
          paymentStatus: utr ? "pending_verification" : "pending",
          utr: utr || "",
          isDeleted: false,
          onboardingData: sanitizedOnboardingData,
          status: "Waiting for Review",
          developerNote: formData.developerNote || "",
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
${formData.selectedFeatures?.join(", ") || "Standard responsive design"}

CLIENT NOTE:
${formData.developerNote || "No specific note provided."}
        `.trim();

        const projectId = await createProject(projectData);

        console.log("WRITING USER PROFILE TO FIRESTORE...");
        await createUserProfile(currentUser, {
          username: formData.username,
          phone: formData.phone,
          photoURL: finalProfileUrl,
          businessName: formData.businessName,
          onboardingCompleted: true,
          lastProjectId: projectId,
        });

        localStorage.removeItem("onboarding_data");
        localStorage.removeItem("onboarding_step");

        toast.success("🚀 Project launched successfully!");
        setStep(4);

        setTimeout(() => {
          navigate("/dashboard");
        }, 6000);
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
    doc.text("WebbyLaunch Project Summary", 20, 20);

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);

    let y = 40;
    const addLine = (label: string, value: string) => {
      doc.setFont("helvetica", "bold");
      doc.text(`${label}:`, 20, y);
      doc.setFont("helvetica", "normal");
      doc.text(value || "Not Provided", 70, y);
      y += 10;
    };

    addLine("Name", formData.name);
    addLine("Email", formData.email);
    addLine("Phone", formData.phone);
    y += 5;
    addLine("Business Name", formData.businessName);
    addLine(
      "Business Type",
      formData.businessType === "Other"
        ? formData.otherBusinessType
        : formData.businessType,
    );
    addLine("Location", formData.location);
    y += 5;
    addLine("Website Name", formData.websiteName);
    addLine(
      "Selected Plan",
      formData.plan === "basic"
        ? "Basic"
        : formData.plan === "standard"
          ? "Standard"
          : "Premium",
    );
    addLine(
      "Payment Option",
      paymentOption === "full" ? "Full Payment" : "Advance Payment",
    );

    y += 10;
    doc.setFont("helvetica", "bold");
    doc.text("Description:", 20, y);
    y += 7;
    doc.setFont("helvetica", "normal");
    const splitDesc = doc.splitTextToSize(
      formData.description || "No description provided.",
      160,
    );
    doc.text(splitDesc, 20, y);

    doc.save(`WebbyLaunch_Project_Summary.pdf`);
  };

  const [domainData, setDomainData] = useState({
    businessName: "",
    preferences: ["", "", ""],
    customDomain: "",
  });
  const [domainError, setDomainError] = useState<string | null>(null);

  const extensions = [".com", ".in", ".org"];

  const handleDomainBusinessNameChange = (val: string) => {
    const sanitized = val.toLowerCase().replace(/[^a-z0-9]/g, "");
    setDomainData((prev) => ({ ...prev, businessName: sanitized }));
    if (sanitized.length < 3) {
      setDomainError("Business name must be at least 3 characters");
    } else if (sanitized.length > 20) {
      setDomainError("Business name must be at most 20 characters");
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
        newPrefs[i] = "";
      }
    }

    setDomainData((prev) => ({ ...prev, preferences: newPrefs }));
  };

  const [isCheckingDomain, setIsCheckingDomain] = useState(false);
  const [domainTaken, setDomainTaken] = useState(false);

  const handleDomainNext = async () => {
    if (!formData.domain) return;

    setIsCheckingDomain(true);

    const restrictedDomains = [
      "google.com",
      "youtube.com",
      "facebook.com",
      "instagram.com",
      "twitter.com",
      "apple.com",
      "amazon.com",
      "microsoft.com",
      "webbylaunch.com",
      "webbylaunch.vercel.app",
      "admin.com",
      "test.com",
    ];
    if (
      restrictedDomains.some((d) => formData.domain?.toLowerCase().includes(d))
    ) {
      toast.error(
        "SECURITY ALERT: This domain is restricted or system-reserved.",
      );
      setIsCheckingDomain(false);
      return;
    }

    const { checkDomainInUse } = await import("../services/database");

    // Check locally first
    const inUseLocally = await checkDomainInUse(formData.domain);
    if (inUseLocally) {
      setDomainTaken(true);
      toast.error(
        "MISSING SIGNAL: Domain is already registered in our local network.",
      );
      setIsCheckingDomain(false);
      return;
    }

    // Check globally
    const globalStatus = await checkDomain(formData.domain);
    if (globalStatus === "taken") {
      setDomainTaken(true);
      toast.error(
        "COMMAND REJECTED: This domain is already registered to another owner globally.",
      );
      setIsCheckingDomain(false);
      return;
    }

    setDomainTaken(false);
    setStep(4); // Moving to features step
    setIsCheckingDomain(false);
  };

  const toggleFeature = (feature: string) => {
    const current = formData.selectedFeatures || [];
    const updated = current.includes(feature)
      ? current.filter((f) => f !== feature)
      : [...current, feature];
    handleInputChange("selectedFeatures", updated);
  };

  const [suggestedDomains, setSuggestedDomains] = useState<
    { name: string; status: "loading" | "available" | "taken" | "error" }[]
  >([]);
  const [customDomain, setCustomDomain] = useState("");
  const [customStatus, setCustomStatus] = useState<
    "idle" | "loading" | "available" | "taken" | "error"
  >("idle");
  const [isCheckingCustom, setIsCheckingCustom] = useState(false);

  const checkDomain = async (domain: string) => {
    try {
      const RESERVED_WORDS = [
        "google",
        "youtube",
        "admin",
        "byjus",
        "facebook",
        "instagram",
        "twitter",
        "amazon",
        "apple",
        "microsoft",
        "webbylaunch",
        "test",
      ];
      const normalized = domain.toLowerCase().trim();
      const domainNameOnly = normalized.split(".")[0];

      if (
        RESERVED_WORDS.some(
          (word) => normalized.includes(word) || domainNameOnly.includes(word),
        )
      ) {
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

    const extensions = [".com", ".in", ".org", ".online", ".store"];
    const bases = [name, name + "official", "get" + name];

    // Pick top 4 common variations
    const domainNames = [
      `${name}.com`,
      `${name}.in`,
      `${name}.online`,
      `${name}.site`,
    ];

    setSuggestedDomains(
      domainNames.map((d) => ({ name: d, status: "loading" })),
    );

    const results = await Promise.all(
      domainNames.map(async (d) => ({
        name: d,
        status: (await checkDomain(d)) as any,
      })),
    );

    setSuggestedDomains(results);
  };

  const checkCustom = async () => {
    if (!customDomain || !customDomain.includes(".")) {
      toast.error("Please enter a valid domain (e.g., example.com)");
      return;
    }
    setIsCheckingCustom(true);
    setCustomStatus("loading");
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-10 w-full"
          >
            <div className="space-y-2 text-center sm:text-left">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c7c42a]">
                Step 1 of 3
              </span>
              <h3 className="text-3xl sm:text-5xl font-extrabold italic tracking-tight text-white uppercase leading-none">
                Client &{" "}
                <span className="text-[#c7c42a]">Business Profile</span>
              </h3>
              <p className="text-white/40 text-xs font-semibold uppercase tracking-wider italic">
                Let's establish your professional identity and operational
                footprint.
              </p>
            </div>
            <div className="max-w-5xl mx-auto space-y-8 bg-white/[0.01] border border-white/5 p-12 rounded-[2.5rem] backdrop-blur-md">
              <h4 className="text-lg font-black uppercase tracking-widest text-white/80 border-b border-white/5 pb-3">
                Personal Identity & Region
              </h4>

              <div className="flex flex-col items-center gap-3 py-2">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full bg-black/40 border border-white/10 flex items-center justify-center overflow-hidden transition-all group-hover:border-[#c7c42a]/50">
                    {profilePreview ? (
                      <img
                        src={profilePreview}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center">
                        <ImageIcon className="w-6 h-6 text-white/30 mx-auto mb-1" />
                        <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest">
                          Photo
                        </span>
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
                <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">
                  Upload Profile Picture
                </span>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/50 uppercase tracking-wider ml-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <motion.div
                    animate={invalidFields.includes("name") ? "shake" : ""}
                    variants={shakeAnimation}
                  >
                    <input
                      type="text"
                      className={getInputClass("name")}
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      placeholder="E.G. RAHUL SHARMA"
                    />
                  </motion.div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/50 uppercase tracking-wider ml-2">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <motion.div
                    animate={
                      invalidFields.includes("username") ? "shake" : ""
                    }
                    variants={shakeAnimation}
                  >
                    <input
                      type="text"
                      className={getInputClass("username")}
                      value={formData.username}
                      onChange={(e) =>
                        handleInputChange(
                          "username",
                          e.target.value.toLowerCase().replace(/\s/g, "_"),
                        )
                      }
                      placeholder="rahul_sharma"
                    />
                  </motion.div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/50 uppercase tracking-wider ml-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <motion.div
                      animate={invalidFields.includes("phone") ? "shake" : ""}
                      variants={shakeAnimation}
                    >
                      <input
                        type="tel"
                        className={getInputClass("phone")}
                        value={formData.phone}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                        placeholder="9876543210"
                      />
                    </motion.div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/50 uppercase tracking-wider ml-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <motion.div
                      animate={invalidFields.includes("email") ? "shake" : ""}
                      variants={shakeAnimation}
                    >
                      <input
                        type="email"
                        className={getInputClass("email")}
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        placeholder="RAHUL@GMAIL.COM"
                      />
                    </motion.div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/50 uppercase tracking-wider ml-2">
                    How did you hear about us?{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <motion.div
                    animate={
                      invalidFields.includes("referralSource") ? "shake" : ""
                    }
                    variants={shakeAnimation}
                  >
                    <select
                      className={getInputClass(
                        "referralSource",
                        "w-full p-6 py-7 px-8 bg-card border text-white focus:outline-none focus:border-[#c7c42a] font-bold text-lg tracking-wide appearance-none",
                      )}
                      value={formData.referralSource}
                      onChange={(e) =>
                        handleInputChange("referralSource", e.target.value)
                      }
                    >
                      <option value="">SELECT AN OPTION</option>
                      <option value="Google Search">Google Search</option>
                      <option value="Social Media">Social Media</option>
                      <option value="Friend/Colleague">
                        Friend/Colleague
                      </option>
                      <option value="I got a call">I got a call</option>
                      <option value="Other">Other</option>
                    </select>
                  </motion.div>
                </div>


                <div className="space-y-2 relative">
                  <label className="text-[10px] font-black text-white/50 uppercase tracking-wider ml-2">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                      className="w-full p-6 py-7 px-8 bg-card border border-border text-white text-left font-bold text-lg tracking-wide flex items-center justify-between transition-colors focus:border-[#c7c42a] focus:outline-none"
                    >
                      <span className="flex items-center gap-3">
                        {formData.country ? (
                          <>
                            <span className="text-2xl">
                              {countries.find(c => c.name === formData.country || c.code === formData.country)?.flag || "🏳️"}
                            </span>
                            <span className="text-sm font-black uppercase tracking-wider text-white">
                              {countries.find(c => c.name === formData.country || c.code === formData.country)?.name || formData.country}
                            </span>
                          </>
                        ) : (
                          <span className="text-white/40 font-bold uppercase tracking-wider text-xs">Select Country</span>
                        )}
                      </span>
                      <ChevronDown size={16} className={`text-white/40 transition-transform ${isCountryDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isCountryDropdownOpen && (
                      <div className="absolute top-[102%] left-0 w-full bg-[#111] border border-white/10 z-50 shadow-2xl overflow-hidden max-h-80 flex flex-col">
                        <div className="p-3 border-b border-white/5 bg-black/40">
                          <input
                            type="text"
                            value={countrySearchQuery}
                            onChange={(e) => setCountrySearchQuery(e.target.value)}
                            placeholder="SEARCH COUNTRY..."
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white font-mono uppercase text-xs focus:outline-none focus:border-[#c7c42a] font-bold"
                            autoFocus
                          />
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-white/5">
                          {countries
                            .filter(c => c.name.toLowerCase().includes(countrySearchQuery.toLowerCase()))
                            .map((c) => (
                              <button
                                type="button"
                                key={c.code}
                                onClick={() => {
                                  handleInputChange("country", c.name);
                                  setIsCountryDropdownOpen(false);
                                  setCountrySearchQuery("");
                                }}
                                className={`w-full p-4 flex items-center gap-4 transition-colors text-left hover:bg-[#c7c42a]/10 hover:text-[#c7c42a] ${
                                  formData.country === c.name ? 'bg-[#c7c42a]/5 text-[#c7c42a]' : 'text-white/80'
                                }`}
                              >
                                <span className="text-2xl">{c.flag}</span>
                                <span className="text-xs font-black uppercase tracking-wider">{c.name}</span>
                              </button>
                            ))}
                          {countries.filter(c => c.name.toLowerCase().includes(countrySearchQuery.toLowerCase())).length === 0 && (
                            <div className="p-6 text-center text-white/40 text-xs font-black uppercase tracking-widest italic">
                              No Countries Found
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              {!user ? (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await signInWithGoogle();
                    } catch (err: any) {
                      toast.error("Login failed: " + err.message);
                    }
                  }}
                  className="flex-1 bg-white text-black py-6 rounded-2xl font-black text-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 shadow-lg shadow-white/10"
                >
                  <img
                    src="https://www.google.com/favicon.ico"
                    className="w-6 h-6"
                    alt="Google"
                  />
                  Sign in with Google to Continue
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 bg-[#c7c42a] text-black py-6 rounded-2xl font-black text-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-[#c7c42a]/20 uppercase tracking-wider"
                >
                  Next: Configure Specs
                </button>
              )}
            </div>
          </motion.div>
        );

      case 2: {
        const mailtoLink = `mailto:hello@webbylaunch.com?subject=WebbyLaunch - Custom Engineering Project Request&body=Hello WebbyLaunch Team,%0D%0A%0D%0AI would like to request a Custom Engineering project for my business.%0D%0A%0D%0ABusiness Details:%0D%0A- Client Name: ${formData.name}%0D%0A- Email: ${formData.email}%0D%0A- Phone: ${formData.phone || "Not provided"}%0D%0A- Country: ${formData.country}%0D%0A- Business Name: ${formData.businessName || "Not provided"}%0D%0A- Target Domain: ${formData.domain || "Not provided"}%0D%0A- Reference Website: ${formData.referenceWebsite || "Not provided"}%0D%0A- Developer Notes: ${formData.developerNote || "Not provided"}`;

        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-10 w-full"
          >
            <div className="space-y-2 text-center sm:text-left">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c7c42a]">
                Step 2 of 3
              </span>
              <h3 className="text-3xl sm:text-5xl font-extrabold italic tracking-tight text-white uppercase leading-none">
                Digital <span className="text-[#c7c42a]">Specifications</span>
              </h3>
              <p className="text-white/40 text-xs font-semibold uppercase tracking-wider italic">
                Configure your digital node, select plan specifications, capabilities and developer brief.
              </p>
            </div>

            <div className="max-w-5xl mx-auto space-y-8 bg-white/[0.01] border border-white/5 p-12 rounded-[2.5rem] backdrop-blur-md">
              <h4 className="text-lg font-black uppercase tracking-widest text-white/80 border-b border-white/5 pb-3">
                Digital Specifications
              </h4>

              {/* Domain & Digital Space */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-white/50 uppercase tracking-wider ml-2">
                  Target Primary URL <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 p-6 py-7 px-8 bg-card border border-border text-white font-mono font-bold tracking-widest uppercase focus:outline-none focus:border-[#c7c42a] text-lg"
                    value={formData.domain}
                    onChange={(e) => {
                      const val = e.target.value
                        .toLowerCase()
                        .replace(/\s/g, "");
                      handleInputChange("domain", val);
                      setDomainTaken(false); // Reset taken status on edit
                      if (val.length > 3) loadSuggestions(val.split(".")[0]);
                    }}
                    placeholder="MYBRAND.COM"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      if (!formData.domain) return;
                      setIsCheckingDomain(true);
                      const PageRestrictedDomains = [
                        "google.com",
                        "youtube.com",
                        "facebook.com",
                        "instagram.com",
                        "webbylaunch.com",
                      ];
                      if (
                        PageRestrictedDomains.some((d) =>
                          formData.domain?.toLowerCase().includes(d),
                        )
                      ) {
                        toast.error("Restricted domain node.");
                        setIsCheckingDomain(false);
                        return;
                      }
                      const { checkDomainInUse } =
                        await import("../services/database");
                      const inUseLocally = await checkDomainInUse(
                        formData.domain,
                      );
                      if (inUseLocally) {
                        setDomainTaken(true);
                        toast.error("Domain already registered locally.");
                        setIsCheckingDomain(false);
                        return;
                      }
                      const globalStatus = await checkDomain(formData.domain);
                      if (globalStatus === "taken") {
                        setDomainTaken(true);
                        toast.error("Domain taken globally.");
                      } else {
                        setDomainTaken(false);
                        toast.success("Domain is available!");
                      }
                      setIsCheckingDomain(false);
                    }}
                    disabled={!formData.domain || isCheckingDomain}
                    className="bg-[#c7c42a] text-black px-8 rounded-2xl font-black text-sm uppercase hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {isCheckingDomain ? <Loader color="black" /> : "Check"}
                  </button>
                </div>

                {/* Main Domain Status Indicator */}
                {formData.domain && !isCheckingDomain && (
                  <div className="pt-1">
                    {domainTaken ? (
                      <div className="flex items-center gap-2 text-rose-500 font-black text-xs uppercase tracking-widest bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl">
                        <span>⚠️ Domain is Taken globally. Try one of our suggestions below.</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-emerald-400 font-black text-xs uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl">
                        <Check size={14} strokeWidth={4} />
                        <span>✓ Premium URL is Available for immediate registration & deployment!</span>
                      </div>
                    )}
                  </div>
                )}

                {suggestedDomains.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {suggestedDomains.slice(0, 4).map((d, i) => {
                      const isSelected = formData.domain === d.name;
                      return (
                        <button
                          type="button"
                          key={i}
                          onClick={() => {
                            handleInputChange("domain", d.name);
                            setDomainTaken(false); // suggestions are guaranteed available
                          }}
                          className={`p-5 rounded-2xl border text-left flex justify-between items-center transition-all ${
                            isSelected
                              ? "bg-[#c7c42a] border-[#c7c42a] text-black shadow-lg shadow-[#c7c42a]/20 scale-[1.01]"
                              : d.status === "available"
                                ? "bg-card border-emerald-500/20 hover:border-emerald-500/50 hover:bg-emerald-950/5 shadow-[0_0_12px_rgba(16,185,129,0.05)]"
                                : "bg-card border-border hover:border-white/20"
                          }`}
                        >
                          <div className="flex flex-col gap-1">
                            <span className={`text-sm sm:text-base font-mono font-black tracking-tight uppercase ${
                              isSelected ? "text-black" : "text-white"
                            }`}>
                              {d.name}
                            </span>
                            <span className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1 ${
                              isSelected
                                ? "text-emerald-900 font-extrabold"
                                : d.status === "available"
                                  ? "text-emerald-400 font-extrabold"
                                  : d.status === "taken"
                                    ? "text-rose-500"
                                    : "text-white/40"
                            }`}>
                              {d.status === "loading" && "Checking..."}
                              {d.status === "available" && (
                                <>
                                  <Check size={10} strokeWidth={4} className={isSelected ? "text-emerald-900" : "text-emerald-400"} />
                                  Available
                                </>
                              )}
                              {d.status === "taken" && "Taken"}
                              {d.status === "error" && "Error Checking"}
                            </span>
                          </div>
                          {d.status === "available" && (
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                              isSelected
                                ? "bg-emerald-900/10 border-emerald-900/30 text-emerald-900"
                                : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            }`}>
                              <Check size={12} strokeWidth={4} />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Pricing launch tier */}
              <div className="space-y-4 pt-2">
                <label className="text-[10px] font-black text-white/50 uppercase tracking-wider ml-2">
                  Select Launch Tier <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-col gap-3">
                  {(["basic", "standard", "premium", "custom"] as const).map((pKey) => {
                    const isIndia = formData.country === "India";
                    
                    const priceStr = pKey === "custom"
                      ? "Custom Quote"
                      : isIndia
                        ? pKey === "basic"
                          ? "₹9,999"
                          : pKey === "standard"
                            ? "₹19,999"
                            : "₹39,999"
                        : pKey === "basic"
                          ? "$129"
                          : pKey === "standard"
                            ? "$249"
                            : "$499";

                    const planDetails = {
                      basic: "Essential launch node. 1-3 pages high-speed landing website. Includes custom domain setup, secure lead capture, and fully responsive layouts.",
                      standard: "Advanced growth node. 4-7 pages fully animated website. Premium UI/UX art direction, ultra-fast CDN nodes, and core web vitals optimization.",
                      premium: "Complete digital fortress. Unlimited custom pages, bespoke administrative control panel, secure payment gateway, elite animations, and priority flight support.",
                      custom: "Custom Engineering: For complex, tailored systems (SaaS, Custom E-commerce platforms, AI Agents/Integrations, dedicated server clusters, or custom ERP logic).",
                    };

                    const isSelected = formData.plan === pKey;

                    return (
                      <button
                        type="button"
                        key={pKey}
                        onClick={() => {
                          handleInputChange("plan", pKey);
                          if (pKey !== "custom") {
                            handleInputChange("selectedFeatures", [...PLAN_FEATURES[pKey]]);
                          } else {
                            handleInputChange("selectedFeatures", []);
                          }
                        }}
                        className={`w-full p-5 border text-left flex items-center justify-between transition-all ${
                          isSelected
                            ? "bg-[#c7c42a]/10 border-[#c7c42a] text-[#c7c42a] shadow-[0_0_15px_rgba(199,196,42,0.1)]"
                            : "bg-card border-border text-white/60 hover:border-white/20 hover:text-white"
                        }`}
                      >
                        <div className="flex-1 pr-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all ${
                                isSelected
                                  ? "bg-[#c7c42a] border-[#c7c42a] text-black"
                                  : "border-white/20 text-transparent"
                              }`}
                            >
                              <Check size={10} strokeWidth={4} />
                            </div>
                            <span className="text-sm font-black uppercase tracking-wider text-[#c7c42a]">
                              {pKey === "custom" ? "Custom Engineering" : `${pKey} Plan`}
                            </span>
                          </div>
                          <p className="text-xs text-white/50 uppercase tracking-wide mt-2 leading-relaxed font-semibold">
                            {planDetails[pKey]}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-2xl font-black font-mono tracking-tight text-white block">
                            {priceStr}
                          </span>
                          <span className="text-[10px] font-black uppercase text-white/40 block mt-1">
                            {pKey === "custom" ? "Consultation" : "One-Time"}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Who Provides Domain & Hosting Selection */}
              <div className="space-y-4 pt-2">
                <label className="text-xs font-black text-white/50 uppercase tracking-wider ml-2">
                  Who provides Domain & Hosting? <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-col gap-3">
                  {(["we_provide", "client_provide"] as const).map((opt) => {
                    const isIndia = formData.country === "India";
                    const extraPriceText = opt === "we_provide"
                      ? isIndia ? " (Adds ₹4,999 to advance payment)" : " (Adds $59 to advance payment)"
                      : " (No extra charge)";

                    const details = {
                      we_provide: `WebbyLaunch Registers & Hosts your site for 1-Year on our premium Cloud server networks.${extraPriceText}`,
                      client_provide: "I will provide my own Domain & Cloud Hosting server credentials. (No setup fees).",
                    };

                    const isSelected = formData.provideDomainHosting === opt;

                    return (
                      <button
                        type="button"
                        key={opt}
                        onClick={() => handleInputChange("provideDomainHosting", opt)}
                        className={`w-full p-5 border text-left flex items-center justify-between transition-all ${
                          isSelected
                            ? "bg-[#c7c42a]/10 border-[#c7c42a] text-[#c7c42a] shadow-[0_0_15px_rgba(199,196,42,0.1)]"
                            : "bg-card border-border text-white/60 hover:border-white/20 hover:text-white"
                        }`}
                      >
                        <div className="flex-1 pr-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all ${
                                isSelected
                                  ? "bg-[#c7c42a] border-[#c7c42a] text-black"
                                  : "border-white/20 text-transparent"
                              }`}
                            >
                              <Check size={10} strokeWidth={4} />
                            </div>
                            <span className="text-sm font-black uppercase tracking-wider text-[#c7c42a]">
                              {opt === "we_provide" ? "WebbyLaunch Provides" : "Client Provides"}
                            </span>
                          </div>
                          <p className="text-xs text-white/50 uppercase tracking-wide mt-2 leading-relaxed font-semibold">
                            {details[opt]}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Features Select / Custom Engineering Info */}
              <div className="space-y-4 pt-2">
                <label className="text-[10px] font-black text-white/50 uppercase tracking-wider ml-2">
                  Activate Platform Capabilities <span className="text-red-500">*</span>
                </label>
                {formData.plan === "custom" ? (
                  <div className="p-6 bg-white/5 border border-white/10 text-center space-y-4">
                    <div className="text-[#c7c42a] font-black text-xs uppercase tracking-[0.2em] italic">
                      [ Custom System Node Selected ]
                    </div>
                    <p className="text-white/60 text-xs font-semibold uppercase tracking-wider leading-relaxed">
                      Custom engineering packages bypass standard capability constraints. Fill out target URL, developer notes, and reference website below, then click "Initiate Custom Consultation" to email us your full specifications.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 max-h-[40vh] overflow-y-auto pr-1 custom-scrollbar">
                    {PLAN_FEATURES[formData.plan as "basic" | "standard" | "premium"]?.map((feature) => {
                      const isSelected = (
                        formData.selectedFeatures || []
                      ).includes(feature);
                      return (
                        <button
                          type="button"
                          key={feature}
                          onClick={() => toggleFeature(feature)}
                          className={`p-4 rounded-xl border transition-all text-left flex items-start gap-3 ${
                            isSelected
                              ? "bg-[#c7c42a]/10 border-[#c7c42a] text-[#c7c42a] shadow-[0_0_15px_rgba(199,196,42,0.1)]"
                              : "bg-card border-border text-white/60 hover:border-white/20 hover:text-white"
                          }`}
                        >
                          <div
                            className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all ${
                              isSelected
                                ? "bg-[#c7c42a] border-[#c7c42a] text-black"
                                : "border-white/20 text-transparent"
                            }`}
                          >
                            <Check size={10} strokeWidth={4} />
                          </div>
                          <span className="text-sm font-black uppercase tracking-wider leading-tight">
                            {feature}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Reference website */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/50 uppercase tracking-wider ml-2">
                  Reference Website URL (Optional)
                </label>
                <input
                  type="url"
                  className={getInputClass("referenceWebsite")}
                  value={formData.referenceWebsite}
                  onChange={(e) =>
                    handleInputChange("referenceWebsite", e.target.value)
                  }
                  placeholder="HTTPS://EXAMPLE.COM"
                />
              </div>

              {/* Notes for developer */}
              <div className="space-y-2 pt-2">
                <label className="text-[10px] font-black text-white/50 uppercase tracking-wider ml-2">
                  Notes for the Developer (Optional)
                </label>
                <textarea
                  className={getInputClass(
                    "developerNote",
                    "w-full p-6 py-7 px-8 bg-card border text-white focus:outline-none focus:border-[#c7c42a] font-bold text-lg tracking-wide resize-none h-36",
                  )}
                  value={formData.developerNote}
                  onChange={(e) =>
                    handleInputChange("developerNote", e.target.value)
                  }
                  placeholder="E.G. PLEASE USE MINIMALIST SANS-SERIF FONTS, FAST LOADING AND VIBRANT ACCENTS..."
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={handleBack}
                className="flex-[0.3] border border-white/10 text-white/60 py-6 rounded-2xl font-black text-xl hover:bg-white/5 transition-all uppercase tracking-wider"
              >
                Back
              </button>
              {formData.plan === "custom" ? (
                <a
                  href={mailtoLink}
                  className="flex-1 bg-[#c7c42a] text-black py-6 rounded-2xl font-black text-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-[#c7c42a]/20 uppercase tracking-wider text-center flex items-center justify-center gap-2"
                >
                  <Mail size={20} />
                  Initiate Custom Consultation
                </a>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 bg-[#c7c42a] text-black py-6 rounded-2xl font-black text-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-[#c7c42a]/20 uppercase tracking-wider"
                >
                  Proceed to Payment
                </button>
              )}
            </div>
          </motion.div>
        );
      }

      case 3: {
        const isIndia = formData.country === "India";
        const planKey = formData.plan || "basic";
        const provideDomainHosting = formData.provideDomainHosting || "we_provide";
        const billingInfo = isIndia
          ? "Shivam Tiwari (8726490079@goaxb)"
          : "shivamt2023@gmail.com";

        // Dynamic pricing calculation
        const planAdvanceINR = planKey === "basic" ? 1999 : planKey === "standard" ? 4999 : 9999;
        const planAdvanceUSD = planKey === "basic" ? 29 : planKey === "standard" ? 59 : 119;

        const isWeProvide = provideDomainHosting === "we_provide";
        const domainHostingCostINR = isWeProvide ? 4999 : 0;
        const domainHostingCostUSD = isWeProvide ? 59 : 0;

        const totalINR = planAdvanceINR + domainHostingCostINR;
        const totalUSD = planAdvanceUSD + domainHostingCostUSD;

        const mappedPrice = isIndia ? `₹${totalINR.toLocaleString("en-IN")}` : `$${totalUSD}`;
        const paypalCheckoutUrl = `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=shivamt2023@gmail.com&amount=${totalUSD}&currency_code=USD&item_name=WebbyLaunch%20Project%20Advance%20-%20${planKey.toUpperCase()}%20Plan%20(${formData.domain || "No%20Domain%20Configured"})`;

        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-10 w-full"
          >
            <div className="space-y-2 text-center sm:text-left">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c7c42a]">
                Step 3 of 3
              </span>
              <h3 className="text-3xl sm:text-5xl font-extrabold italic tracking-tight text-white uppercase leading-none">
                Secure <span className="text-[#c7c42a]">Settlement</span>
              </h3>
              <p className="text-white/40 text-sm font-semibold uppercase tracking-wider italic">
                Review invoice summary and complete verification to launch project.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
              <div className="space-y-10 bg-white/[0.01] border border-white/5 p-12 rounded-[2.5rem] backdrop-blur-md">
                <h4 className="text-xl sm:text-2xl font-black uppercase tracking-widest text-white border-b border-white/10 pb-4">
                  Project Invoice Summary
                </h4>

                <div className="bg-black/60 rounded-[2rem] p-8 border border-white/10 space-y-6">
                  <div className="flex justify-between items-center border-b border-white/10 pb-4">
                    <div>
                      <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-[#c7c42a] block mb-1">
                        Active Project Spec
                      </span>
                      <h5 className="text-lg sm:text-xl font-black uppercase text-white tracking-tight">
                        {formData.businessName || "MY BUSINESS"}
                      </h5>
                    </div>
                    <span className="bg-[#c7c42a]/10 border border-[#c7c42a]/20 px-4 py-1.5 rounded-full text-xs font-black uppercase text-[#c7c42a] font-mono tracking-widest">
                      Node Active
                    </span>
                  </div>

                  <div className="space-y-5 border-b border-white/10 pb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-white/40 font-black uppercase tracking-widest text-xs sm:text-sm">Plan Tier:</span>
                      <span className="font-black uppercase text-[#c7c42a] tracking-widest text-xs sm:text-sm">{planKey} Plan</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/40 font-black uppercase tracking-widest text-xs sm:text-sm">Full Contract Price:</span>
                      <span className="font-black text-white/95 text-xs sm:text-sm">{isIndia ? `₹${(planKey === "basic" ? 9999 : planKey === "standard" ? 19999 : 39999).toLocaleString("en-IN")}` : `$${planKey === "basic" ? "129" : planKey === "standard" ? "249" : "499"}`}</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-white/5 pt-4">
                      <span className="text-white/40 font-black uppercase tracking-widest text-xs sm:text-sm">Project Advance (20-25%):</span>
                      <span className="font-black text-[#c7c42a] text-xs sm:text-sm">{isIndia ? `₹${planAdvanceINR.toLocaleString("en-IN")}` : `$${planAdvanceUSD}`}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/40 font-black uppercase tracking-widest text-xs sm:text-sm">Domain & Hosting Node:</span>
                      <span className="font-black text-white/95 text-xs sm:text-sm">{provideDomainHosting === "we_provide" ? (isIndia ? "₹4,999 (WebbyLaunch Provided)" : "$59 (WebbyLaunch Provided)") : "FREE (Client Providing)"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/40 font-black uppercase tracking-widest text-xs sm:text-sm">Registered Target Domain:</span>
                      <span className="font-mono text-[#c7c42a] font-black uppercase tracking-wider text-xs sm:text-sm">{formData.domain || "NOT CONFIGURED"}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <div>
                      <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-white/40 block mb-1">
                        Total Due Upfront
                      </span>
                      <span className="text-sm sm:text-base font-black uppercase tracking-widest text-white">
                        Advance Settlement:
                      </span>
                    </div>
                    <span className="text-3xl sm:text-4xl font-black text-[#c7c42a] tracking-tight font-mono">
                      {mappedPrice}
                    </span>
                  </div>
                </div>

                {/* Explanation Card */}
                <div className="bg-[#c7c42a]/5 border border-[#c7c42a]/20 p-8 rounded-[2rem] space-y-4">
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-[#c7c42a] block">
                    What are you paying for?
                  </span>
                  <div className="space-y-3 text-xs font-semibold uppercase tracking-wider text-white/70 leading-relaxed">
                    <p>
                      1. <span className="text-white font-black">Project Initiation Advance:</span> We charge a fractional <span className="text-[#c7c42a] font-black">{isIndia ? `₹${planAdvanceINR.toLocaleString("en-IN")}` : `$${planAdvanceUSD}`} upfront advance</span> to lock in server developers, establish project briefs, and design custom UI wireframes.
                    </p>
                    {isWeProvide ? (
                      <p>
                        2. <span className="text-white font-black">Domain & Hosting Setup ({isIndia ? "₹4,999" : "$59"}):</span> WebbyLaunch handles 100% of registrations and purchases your premium Cloud hosting infrastructure upfront. This setup fee is paid in full advance so we can launch and link your domains immediately.
                      </p>
                    ) : (
                      <p>
                        2. <span className="text-white font-black">Client-Provided Server Credentials:</span> Since you are providing your own hosting & domain credentials, there is no domain registration fee included in your advance payment.
                      </p>
                    )}
                    <p className="text-[10px] text-white/40 font-bold tracking-widest pt-2">
                      * Remaining contract balance is settled upon milestone completion or final product launch.
                    </p>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <h5 className="text-xs sm:text-sm font-black uppercase tracking-widest text-white/80">
                    Terms & Launch Protocol <span className="text-red-500">*</span>
                  </h5>
                  <div className="bg-black/50 p-6 rounded-2xl border border-white/5 text-[11px] text-white/40 leading-relaxed max-h-40 overflow-y-auto custom-scrollbar">
                    <p className="font-bold uppercase text-white/60 mb-1">
                      1. Professional Engineering Services
                    </p>
                    <p className="mb-2">
                      We build and deploy top-tier React applications matching
                      your selected specifications. Design modifications will be
                      finalized inside your Client Dashboard after settlement.
                    </p>

                    <p className="font-bold uppercase text-white/60 mb-1">
                      2. Payment Verification
                    </p>
                    <p className="mb-2">
                      All payments require a manual banking verification by our
                      support team. Your dashboard controls will unlock
                      immediately in preview mode upon submitting a transaction
                      reference.
                    </p>

                    <p className="font-bold uppercase text-white/60 mb-1">
                      3. Project Ownership
                    </p>
                    <p>
                      Full codebase and domain transfer credentials are
                      officially assigned to the user upon final project
                      delivery sign-off.
                    </p>
                  </div>

                  <div
                    className="flex items-center gap-4 p-5 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all cursor-pointer"
                    onClick={() => setAgreedToTerms(!agreedToTerms)}
                  >
                    <div
                      className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
                        agreedToTerms
                          ? "bg-[#c7c42a] border-[#c7c42a] text-black"
                          : "border-white/20"
                      }`}
                    >
                      {agreedToTerms && <Check size={12} strokeWidth={4} />}
                    </div>
                    <span className="text-xs sm:text-sm font-black uppercase text-white/70 tracking-widest">
                      I agree to terms & verified launch protocol
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-10 bg-white/[0.01] border border-white/5 p-12 rounded-[2.5rem] backdrop-blur-md flex flex-col justify-between">
                <div>
                  <h4 className="text-xl sm:text-2xl font-black uppercase tracking-widest text-white border-b border-white/10 pb-4">
                    Secure Settlement Node
                  </h4>

                  <div className="pt-4 text-center">
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-white/40 block mb-1">
                      Receiver Authority
                    </span>
                    <span className="text-lg sm:text-xl font-black text-white font-mono tracking-wide">
                      {billingInfo}
                    </span>
                  </div>

                  {isIndia ? (
                    <div className="flex flex-col items-center justify-center pt-8 gap-6 w-full">
                      {/* UPI Mode Selector Tab Buttons */}
                      <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
                        <button
                          type="button"
                          onClick={() => setIndiaPaymentMethod("qr")}
                          className={`py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all border ${
                            indiaPaymentMethod === "qr"
                              ? "bg-[#c7c42a] border-[#c7c42a] text-black shadow-lg shadow-[#c7c42a]/10"
                              : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                          }`}
                        >
                          Pay by QR Code
                        </button>
                        <button
                          type="button"
                          onClick={() => setIndiaPaymentMethod("upi")}
                          className={`py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all border ${
                            indiaPaymentMethod === "upi"
                              ? "bg-[#c7c42a] border-[#c7c42a] text-black shadow-lg shadow-[#c7c42a]/10"
                              : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                          }`}
                        >
                          Pay by Mobile UPI
                        </button>
                      </div>

                      {indiaPaymentMethod === "upi" ? (
                        <div className="flex flex-col items-center justify-center w-full gap-4 pt-2">
                          <div className="text-center">
                            <p className="text-xs text-white/60 uppercase font-black tracking-widest">
                              Direct Mobile UPI Payment
                            </p>
                          </div>
                          
                          {/* Premium glowing direct UPI pay button */}
                          <a
                            href={`upi://pay?pa=8726490079@goaxb&pn=Shivam%20Tiwari&am=${totalINR}&cu=INR&tn=WebbyLaunch%20Project%20Advance%20-${planKey.toUpperCase()}%20Plan`}
                            className="w-full max-w-sm py-5 rounded-2xl bg-[#c7c42a] hover:bg-[#a6a322] text-black font-black uppercase tracking-[0.15em] text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#c7c42a]/10 cursor-pointer text-center"
                          >
                            <ExternalLink size={16} />
                            <span>Pay via UPI App</span>
                          </a>
                          
                          <span className="text-[10px] font-black uppercase tracking-widest text-white/40 text-center max-w-xs leading-relaxed">
                            Click to launch GPay, PhonePe, Paytm, or BHIM instantly on your phone
                          </span>
                        </div>
                      ) : (
                          <div className="flex flex-col items-center justify-center w-full gap-4">
                          <div className="text-center">
                            <p className="text-xs text-white/60 uppercase font-black tracking-widest">
                              Payable settlement QR
                            </p>
                          </div>
                          <img
                            src={
                              isWeProvide
                                ? planKey === "basic"
                                  ? "/6998pay.jpeg"
                                  : planKey === "standard"
                                    ? "/9998pay.jpeg"
                                    : "/14998pay.jpeg"
                                : planKey === "basic"
                                  ? "/1thausand999.png"
                                  : planKey === "standard"
                                    ? "/4thaunsand999.png"
                                    : "/ninethausand999.png"
                            }
                            alt={`${planKey} QR Code — ₹${totalINR.toLocaleString("en-IN")}`}
                            className="w-56 h-56 object-contain rounded-2xl border-2 border-[#c7c42a]/20 shadow-lg shadow-[#c7c42a]/5"
                          />
                          <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#c7c42a] font-mono text-center mt-2 block leading-relaxed max-w-sm">
                            Scan ₹{totalINR.toLocaleString("en-IN")} with GPay, PhonePe, Paytm
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-10 gap-6">
                      <div className="text-center">
                        <p className="text-xs text-white/60 uppercase font-black tracking-widest">
                          International Checkout
                        </p>
                      </div>
                      <a
                        href={paypalCheckoutUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full max-w-sm py-5 rounded-2xl bg-[#ffc439] hover:bg-[#e0ac30] text-black font-black uppercase tracking-[0.15em] text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#ffc439]/10 cursor-pointer"
                      >
                        <span className="text-blue-800 font-serif lowercase italic font-black text-base">
                          Pay
                        </span>
                        <span className="text-blue-600 font-serif lowercase italic font-black text-base">
                          Pal
                        </span>
                        <span className="text-xs text-black/70 font-black tracking-widest ml-1">
                          Checkout
                        </span>
                      </a>
                    </div>
                  )}
                </div>

                <div className="space-y-6 pt-6 border-t border-white/10 mt-8">
                  <div className="flex justify-between items-center">
                    <div>
                      <h5 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
                        Verification Reference proof <span className="text-red-500">*</span>
                      </h5>
                      <p className="text-[10px] text-white/50 uppercase tracking-widest mt-1">
                        {isIndia
                          ? "Enter 12-digit UPI UTR / Ref Number"
                          : "Enter PayPal Transaction ID"}
                      </p>
                    </div>
                    <span className="bg-yellow-500/10 border border-yellow-500/20 px-3 py-1 rounded-full text-[9px] font-black uppercase text-yellow-500 tracking-widest font-mono">
                      Manual Verification
                    </span>
                  </div>

                  <input
                    type="text"
                    value={utr}
                    onChange={(e) =>
                      setUtr(e.target.value.replace(/[^a-zA-Z0-9]/g, ""))
                    }
                    placeholder={
                      isIndia
                        ? "Enter 12-digit UPI UTR / Ref Number"
                        : "Enter PayPal Transaction ID"
                    }
                    className="w-full bg-black/60 border border-white/10 hover:border-white/20 focus:border-[#c7c42a] text-white py-5 px-6 rounded-2xl text-sm font-mono font-black tracking-widest focus:outline-none placeholder:text-white/20"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={handleBack}
                className="flex-[0.3] border border-white/10 text-white/60 py-6 rounded-2xl font-black text-xl hover:bg-white/5 transition-all uppercase tracking-wider"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || !utr.trim() || !agreedToTerms}
                className={`flex-1 py-6 rounded-2xl font-black text-xl transition-all flex items-center justify-center gap-4 shadow-2xl ${
                  !isSubmitting && utr.trim() && agreedToTerms
                    ? "bg-[#c7c42a] text-black hover:scale-[1.02] active:scale-[0.98]"
                    : "bg-white/5 text-white/20 cursor-not-allowed"
                }`}
              >
                {isSubmitting ? (
                  <Loader color="black" />
                ) : (
                  <>
                    <span>Verify & Submit Launch</span>
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        );
      }

      case 4:
        return (
          <SuccessScreen
            formData={formData}
            onNavigate={() => navigate("/dashboard")}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black font-sans selection:bg-primary selection:text-black">
      <header className="px-10 py-8 border-b border-white/5 bg-black/50 backdrop-blur-md sticky top-0 z-50 text-white">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 overflow-hidden rounded-lg">
              <img
                src="/favicon.svg"
                alt="WebbyLaunch Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-2xl font-black tracking-tighter uppercase italic text-white">
              Webby<span className="text-primary">Launch</span>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <div className="h-1.5 w-32 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
                className="h-full bg-primary"
              />
            </div>
            <div className="text-[10px] font-black italic text-white/40 uppercase tracking-[0.2em]">
              Step {step <= 3 ? step : "Final"} of 3
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-10 py-16">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 rounded-2xl bg-red-950/40 border border-red-500/50 text-red-200 text-xs font-bold uppercase tracking-wider text-center"
          >
            ⚠️ {error}
          </motion.div>
        )}
        <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
      </main>
    </div>
  );
}
