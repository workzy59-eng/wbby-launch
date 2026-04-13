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
const SalesDashboard = React.lazy(() => import('./pages/SalesDashboard'));
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
const JoinDeveloper = React.lazy(() => import('./pages/JoinDeveloper'));
const JoinSales = React.lazy(() => import('./pages/JoinSales'));
const Privacy = React.lazy(() => import('./pages/Privacy'));
const Terms = React.lazy(() => import('./pages/Terms'));
const Settings = React.lazy(() => import('./pages/Settings'));
const ComponentShowcase = React.lazy(() => import('./pages/ComponentShowcase'));
const Layout = React.lazy(() => import('./components/Layout'));
const LocationPage = React.lazy(() => import('./pages/LocationPage'));
const Careers = React.lazy(() => import('./pages/Careers'));
const Docs = React.lazy(() => import('./pages/Docs'));

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
  const publicPaths = ['/', '/auth', '/about', '/contact', '/services', '/pricing', '/blog', '/privacy-policy', '/terms', '/settings', '/careers', '/docs'];
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
              title: "Why Mobile-First Design is the Standard in 2026",
              slug: "mobile-first-design-2026",
              excerpt: "Explore why mobile-first design is no longer an option but a necessity for business success in the modern digital era.",
              content: `
# The Shift to Mobile Dominance

In the rapidly evolving digital landscape of 2026, the way users interact with the web has shifted fundamentally. Mobile devices are no longer just an alternative; they are the primary gateway to the internet.

## Why Mobile-First?

Statistically, over 85% of global web traffic now originates from mobile devices. Google's mobile-first indexing is no longer a suggestion—it's the absolute standard. If your website isn't optimized for the palm of a hand, it effectively doesn't exist in search results.

### Key Benefits:
1. **Better SEO Ranking**: Google prioritizes mobile-friendly sites.
2. **Improved User Experience**: Faster load times and touch-friendly interfaces.
3. **Higher Conversion Rates**: Users are more likely to buy on a seamless mobile site.

> "Design is not just what it looks like and feels like. Design is how it works." - Steve Jobs

At WebbyLaunch, we build every site with a mobile-first philosophy, ensuring your business looks premium on every screen size.
              `,
              author: "Sarah Chen",
              date: serverTimestamp(),
              image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=1200&h=600",
              category: "Website",
              tags: ["Featured", "Design", "Mobile"]
            },
            {
              title: "10 SEO Strategies to Double Your Traffic",
              slug: "seo-strategies-2026",
              excerpt: "Master the latest SEO techniques that actually work in 2026. From AI-driven content to technical optimization.",
              content: `
# SEO in the Age of AI

Search Engine Optimization has changed. It's no longer just about keywords; it's about intent, authority, and user satisfaction.

## Our Top 10 Strategies

1. **Focus on User Intent**: Answer the questions your users are actually asking.
2. **Optimize for Core Web Vitals**: Speed, stability, and responsiveness are key.
3. **Leverage AI Content Wisely**: Use AI for research, but keep the human touch for authority.
4. **Build High-Quality Backlinks**: Quality always beats quantity.

... and much more.
              `,
              author: "Alex Rivera",
              date: serverTimestamp(),
              image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200&h=600",
              category: "SEO",
              tags: ["SEO", "Growth", "Marketing"]
            },
            {
              title: "How to Scale Your SaaS Business Fast",
              slug: "scale-saas-business",
              excerpt: "Learn the proven frameworks for scaling your software business from zero to hero in record time.",
              content: `
# Scaling Your SaaS

Scaling a SaaS business requires a mix of product excellence, aggressive marketing, and operational efficiency.

## The Growth Framework

- **Product-Led Growth**: Let your product do the talking.
- **Customer Success**: Happy customers are your best advocates.
- **Data-Driven Decisions**: Use analytics to guide your next move.
              `,
              author: "James Wilson",
              date: serverTimestamp(),
              image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200&h=600",
              category: "Business",
              tags: ["Business", "SaaS", "Scaling"]
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
                <Route path="/careers" element={<Careers />} />
                <Route path="/docs" element={<Docs />} />
                <Route path="/testimonials" element={<Testimonials />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/join-developer" element={<JoinDeveloper />} />
                <Route path="/join-sales" element={<JoinSales />} />
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
                      ) : profile?.role === 'sales' ? (
                        <SalesDashboard user={user} profile={profile} />
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
