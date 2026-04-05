import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { auth, onAuthStateChanged, FirebaseUser, db, collection, getDocs, addDoc, serverTimestamp, onSnapshot, doc } from './firebase';
import { UserProfile } from './types';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import OnboardingFlow from './pages/OnboardingFlow';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import DeveloperDashboard from './pages/DeveloperDashboard';
import GlobalAutos from './pages/GlobalAutos';
import Gym from './pages/Gym';
import Cargo from './pages/Cargo';
import Autos from './pages/Autos';
import About from './pages/About';
import Contact from './pages/Contact';
import Services from './pages/Services';
import Pricing from './pages/Pricing';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Settings from './pages/Settings';
import Layout from './components/Layout';
import WhatsAppButton from './components/WhatsAppButton';
import { AnimatePresence, motion } from 'motion/react';
import { createUserProfile, getUserProfile, updateUserStatus } from './services/database';
import { ADMIN_EMAIL } from './constants';
import { Smartphone, Download } from 'lucide-react';

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
  const publicPaths = ['/', '/auth', '/about', '/contact', '/services', '/pricing', '/blog', '/privacy-policy', '/terms'];
  const isPublicPage = publicPaths.includes(location.pathname) || location.pathname.startsWith('/portfolio') || location.pathname.startsWith('/blog/');

  if (isMobile && !isPublicPage) {
    return (
      <div className="min-h-screen bg-[#4A5D4E] flex items-center justify-center p-10 text-center font-sans">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/10 backdrop-blur-xl border border-white/20 p-12 rounded-[3rem] max-w-md shadow-2xl"
        >
          <div className="w-24 h-24 bg-[#E6FF00] rounded-full flex items-center justify-center mx-auto mb-8 text-black shadow-[0_0_40px_rgba(230,255,0,0.3)]">
            <Smartphone size={48} />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic mb-4">Mobile Browser Restricted</h1>
          <p className="text-white/60 font-medium mb-10 leading-relaxed">
            Sorry, the dashboard is optimized for desktop. Please use a computer or download our official app.
          </p>
          <button className="w-full bg-[#E6FF00] text-black py-5 rounded-2xl font-black uppercase italic text-lg flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-2xl">
            Get Started
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

What makes a website "the best" for a small business in 2026? It's not just about looking pretty; it's about performance and trust.

## Essential Features:
- **Trust Signals:** Testimonials, certifications, and clear contact info.
- **Fast Delivery:** Customers expect results quickly.
- **Real-time Chat:** Instant communication builds trust.
- **Clean UI:** Avoid clutter. Focus on the CTA (Call to Action).

At **WebbyLaunch**, we incorporate all these features into our standard business launch plans.
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

**WebbyLaunch** offers plans starting from just ₹899/month, making it the perfect choice for everyone in India.
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
        
        const handleBeforeUnload = () => {
          updateUserStatus(firebaseUser.uid, 'offline');
        };
        
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('beforeunload', handleBeforeUnload);
        
        return () => {
          profileUnsubscribe();
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E6FF00]"></div>
      </div>
    );
  }

  return (
    <Router>
      <MobileRestriction>
        <Layout user={user} profile={profile}>
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
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/privacy-policy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
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
        <WhatsAppButton />
      </MobileRestriction>
    </Router>
  );
}
