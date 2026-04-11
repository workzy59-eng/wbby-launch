import React, { useEffect, useState, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { auth, onAuthStateChanged, FirebaseUser, db, collection, getDocs, addDoc, serverTimestamp, onSnapshot, doc, query, where } from './firebase';
import { Toaster, toast } from 'react-hot-toast';
import { UserProfile } from './types';
import { AnimatePresence, motion } from 'motion/react';
import { createUserProfile, getUserProfile, updateUserStatus } from './services/database';
import { ADMIN_EMAIL } from './constants';
import { Smartphone } from 'lucide-react';
import { Loader } from './components/ui/loader';

const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const AuthPage = React.lazy(() => import('./pages/AuthPage'));
const OnboardingFlow = React.lazy(() => import('./pages/OnboardingFlow'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const AdminPanel = React.lazy(() => import('./pages/AdminPanel'));
const DeveloperDashboard = React.lazy(() => import('./pages/DeveloperDashboard'));
const GlobalAutos = React.lazy(() => import('./pages/GlobalAutos'));
const Gym = React.lazy(() => import('./pages/Gym'));
const Cargo = React.lazy(() => import('./pages/Cargo'));
const Autos = React.lazy(() => import('./pages/Autos'));
const About = React.lazy(() => import('./pages/About'));
const Contact = React.lazy(() => import('./pages/Contact'));
const Services = React.lazy(() => import('./pages/Services'));
const Pricing = React.lazy(() => import('./pages/Pricing'));
const Blog = React.lazy(() => import('./pages/Blog'));
const BlogPost = React.lazy(() => import('./pages/BlogPost'));
const Testimonials = React.lazy(() => import('./pages/Testimonials'));
const HowItWorks = React.lazy(() => import('./pages/HowItWorks'));
const Privacy = React.lazy(() => import('./pages/Privacy'));
const Terms = React.lazy(() => import('./pages/Terms'));
const Settings = React.lazy(() => import('./pages/Settings'));
const ComponentShowcase = React.lazy(() => import('./pages/ComponentShowcase'));
const Layout = React.lazy(() => import('./components/Layout'));
const LocationPage = React.lazy(() => import('./pages/LocationPage'));

function MobileRestriction({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const mobileRegex = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
      setIsMobile(mobileRegex.test(userAgent.toLowerCase()));
    };
    checkMobile();
  }, []);

  // Allow Public Pages
  const publicPaths = ['/', '/auth', '/about', '/contact', '/services', '/pricing', '/blog', '/privacy-policy', '/terms', '/settings'];
  const isPublicPage = publicPaths.includes(location.pathname) || location.pathname.startsWith('/portfolio') || location.pathname.startsWith('/blog/');

  if (isMobile && !isPublicPage) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-10 text-center font-sans">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 p-12 rounded-[3rem] max-w-md shadow-2xl"
        >
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-8 text-black shadow-xl">
            <Smartphone size={48} />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic mb-4">Mobile Optimized</h1>
          <p className="text-white/60 font-medium mb-10 leading-relaxed">
            WebbyLaunch is best experienced on our mobile app or desktop. Some dashboard features are restricted on mobile browsers.
          </p>
          <button onClick={() => window.location.href = '/'} className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase italic text-lg flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-2xl">
            Back to Home
          </button>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const notificationSound = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    notificationSound.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');
  }, []);

  useEffect(() => {
    const seedBlogPosts = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'blog_posts'));
        if (snapshot.empty) {
          const posts = [
            {
              title: "How to create a business website in India",
              slug: "how-to-create-business-website-india",
              excerpt: "Learn the step-by-step process of launching a professional business website in India, from domain registration to SEO optimization.",
              content: `
# How to create a business website in India

In 2026, having a digital presence is no longer optional for businesses in India. Whether you're a local gym owner, a car dealer, or a logistics provider, your customers are searching for you online.

## 1. Define Your Goals
Before you start, decide what your website needs to do. Is it for lead generation, showcasing a portfolio, or direct sales?

## 2. Choose the Right Platform
While DIY builders exist, professional services like **WebbyLaunch** offer custom designs that are optimized for the Indian market.

## 3. Focus on Mobile
Over 80% of Indian users access the web via smartphones. Your site must be mobile-responsive.

## 4. SEO is Key
Use local keywords like "best gym in Mumbai" or "car showroom in Delhi" to attract local traffic.

## 5. Fast Loading
With varying internet speeds across the country, a fast-loading site is crucial for retaining visitors.
              `,
              author: "WebbyLaunch Team",
              date: serverTimestamp(),
              image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426",
              category: "Business",
              tags: ["India", "Business", "Web Design"]
            },
            {
              title: "Best website for small business 2026",
              slug: "best-website-small-business-2026",
              excerpt: "Discover the top website features and designs that are driving growth for small businesses this year.",
              content: `
# Best website for small business 2026

What makes a website "the best" for a small business in 2026? It's not just about looking pretty; it's about performance, trust, and real-time engagement.

## 1. Real-Time Communication
In 2026, customers expect instant answers. Integrating a real-time chat system like the one provided by **WebbyLaunch** ensures you never miss a lead. Our system allows you to chat directly with your customers, providing a seamless experience.

## 2. AI-Driven Personalization
Websites that adapt to user behavior are seeing 40% higher conversion rates. From personalized product recommendations to dynamic content, AI is the future. We integrate Gemini AI to help you generate content and analyze user data.

## 3. Ultra-Fast Performance
With Google's Core Web Vitals being more important than ever, your site needs to load in under 1 second. We use advanced caching, global CDNs, and optimized images to achieve blazing-fast speeds.

## 4. Trust and Security
Clear testimonials, SSL certificates, and secure payment gateways are non-negotiable. We integrate Stripe for world-class payment security and provide a transparent review system.

## 5. Mobile-First Design
Your website must look and function perfectly on mobile devices. Our "Iron Pulse" and "Cargo Flow" UIs are designed mobile-first, ensuring a premium experience on every screen.

At **WebbyLaunch**, we incorporate all these features into our standard business launch plans to ensure your success.
              `,
              author: "WebbyLaunch Team",
              date: serverTimestamp(),
              image: "https://images.unsplash.com/photo-1454165833767-0274b0596d33?q=80&w=2340",
              category: "Design",
              tags: ["Small Business", "2026", "Trends"]
            },
            {
              title: "Affordable website design for everyone",
              slug: "affordable-website-design-everyone",
              excerpt: "Everyone needs high-quality design without the high-quality price tag. Here is how to get it.",
              content: `
# Affordable website design for everyone

Everyone often operates on tight budgets. However, skimping on your website can cost you more in the long run through lost customers.

## How to Save Costs:
1. **Use Templates:** Don't reinvent the wheel. Use high-quality industry templates.
2. **Focus on MVP:** Start with the essential pages (Home, About, Services, Contact).
3. **Subscription Models:** Instead of a huge upfront cost, look for affordable monthly plans.

**WebbyLaunch** offers plans starting from just ₹1,499/-, making it the perfect choice for everyone in India.
              `,
              author: "WebbyLaunch Team",
              date: serverTimestamp(),
              image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?q=80&w=2340",
              category: "Everyone",
              tags: ["Affordable", "Everyone", "Web Design"]
            }
          ];

          for (const post of posts) {
            await addDoc(collection(db, 'blog_posts'), post);
          }
        }
      } catch (error) {
        console.error("Error seeding blog posts:", error);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        
        // Use onSnapshot for real-time profile updates
        const profileUnsubscribe = onSnapshot(doc(db, 'users', firebaseUser.uid), async (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            setProfile(data);
            
            // Sync admin role if email matches ADMIN_EMAIL but role is not admin
            if (firebaseUser.email === ADMIN_EMAIL && data.role !== 'admin') {
              const { updateDoc } = await import('./firebase');
              await updateDoc(doc(db, 'users', firebaseUser.uid), { role: 'admin' });
            }
          } else {
            // Create profile if it doesn't exist
            await createUserProfile(firebaseUser);
          }
          setLoading(false);
        }, (error) => {
          console.error("Error fetching user profile:", error);
          setLoading(false);
        });

        // Set online status
        updateUserStatus(firebaseUser.uid, 'online');
        
        // Handle tab close/visibility change
        const handleVisibilityChange = () => {
          if (document.visibilityState === 'visible') {
            updateUserStatus(firebaseUser.uid, 'online');
          } else {
            updateUserStatus(firebaseUser.uid, 'away');
          }
        };

        // Message Notifications Listener
        const conversationsQuery = query(
          collection(db, 'conversations'),
          where('participants', 'array-contains', firebaseUser.uid)
        );

        const messagesUnsubscribe = onSnapshot(conversationsQuery, (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'modified') {
              const data = change.doc.data();
              const lastMessageAt = data.lastMessageAt?.toDate();
              const now = new Date();
              
              // Only notify if message is recent (last 10 seconds) and not from self
              if (lastMessageAt && (now.getTime() - lastMessageAt.getTime() < 10000) && data.lastSenderId !== firebaseUser.uid) {
                // Check if unread count increased for current user
                const unreadCount = data.unreadCount?.[firebaseUser.uid] || 0;
                if (unreadCount > 0) {
                  notificationSound.current?.play().catch(() => {});
                  toast(`New message: ${data.lastMessage}`, {
                    icon: '💬',
                    duration: 4000
                  });
                }
              }
            }
          });
        }, (error) => {
          console.error("Error in conversations snapshot listener:", error);
        });
        
        const handleBeforeUnload = () => {
          updateUserStatus(firebaseUser.uid, 'offline');
        };
        
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('beforeunload', handleBeforeUnload);
        
        return () => {
          profileUnsubscribe();
          messagesUnsubscribe();
          document.removeEventListener('visibilitychange', handleVisibilityChange);
          window.removeEventListener('beforeunload', handleBeforeUnload);
          updateUserStatus(firebaseUser.uid, 'offline');
        };
      } else {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
      seedBlogPosts();
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#4A5D4E]">
        <Loader size={48} />
      </div>
    );
  }

  return (
    <Router>
      <MobileRestriction>
        <React.Suspense fallback={<div className="flex items-center justify-center h-screen bg-black"><Loader size={48} /></div>}>
          <Layout user={user} profile={profile}>
            <Toaster 
              position="top-right"
              toastOptions={{
                style: {
                  background: '#4A5D4E',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '1rem',
                  fontSize: '12px',
                  fontWeight: '900',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  fontStyle: 'italic'
                },
              }}
            />
            <AnimatePresence mode="wait">
              <Routes>
                <Route 
                  path="/" 
                  element={
                    user ? (
                      (profile?.role === 'admin' || user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) ? (
                        <Navigate to="/admin" />
                      ) : (
                        <Navigate to="/dashboard" />
                      )
                    ) : (
                      <LandingPage user={user} profile={profile} />
                    )
                  } 
                />
                <Route path="/auth" element={user ? <Navigate to="/dashboard" /> : <AuthPage />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/services" element={<Services />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/testimonials" element={<Testimonials />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/privacy-policy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/showcase" element={<ComponentShowcase />} />
                <Route path="/web-development-:city" element={<LocationPage />} />
                <Route 
                  path="/onboarding" 
                  element={<OnboardingFlow user={user} profile={profile} />} 
                />
                <Route 
                  path="/settings" 
                  element={user ? <Settings user={user} profile={profile} /> : <Navigate to="/auth" />} 
                />
                <Route 
                  path="/dashboard" 
                  element={
                    user ? (
                      (profile?.role === 'admin' || user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) ? (
                        <AdminPanel user={user} profile={profile} />
                      ) : profile?.role === 'developer' ? (
                        <DeveloperDashboard user={user} profile={profile} />
                      ) : (
                        <Dashboard user={user} profile={profile} />
                      )
                    ) : (
                      <Navigate to="/auth" />
                    )
                  } 
                />
                <Route 
                  path="/admin" 
                  element={user && (profile?.role === 'admin' || user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) ? <AdminPanel user={user} profile={profile} /> : <Navigate to="/auth" />} 
                />
                <Route 
                  path="/portfolio/autos" 
                  element={user && profile?.role === 'client' ? <Navigate to="/dashboard" /> : <Autos />} 
                />
                <Route 
                  path="/portfolio/global-autos" 
                  element={user && profile?.role === 'client' ? <Navigate to="/dashboard" /> : <GlobalAutos />} 
                />
                <Route 
                  path="/portfolio/gym" 
                  element={user && profile?.role === 'client' ? <Navigate to="/dashboard" /> : <Gym />} 
                />
                <Route 
                  path="/portfolio/cargo" 
                  element={user && profile?.role === 'client' ? <Navigate to="/dashboard" /> : <Cargo />} 
                />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </AnimatePresence>
          </Layout>
        </React.Suspense>
      </MobileRestriction>
    </Router>
  );
}
