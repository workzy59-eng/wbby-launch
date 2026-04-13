import { db, collection, addDoc, getDocs, query, limit } from '../firebase';
import { serverTimestamp } from 'firebase/firestore';

const SAMPLE_POSTS = [
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
    date: new Date('2026-04-10'),
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=1200&h=600",
    tags: ["Featured", "Design", "Mobile"],
    category: "Website"
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
    date: new Date('2026-04-08'),
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200&h=600",
    tags: ["SEO", "Growth", "Marketing"],
    category: "SEO"
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
    date: new Date('2026-04-05'),
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200&h=600",
    tags: ["Business", "SaaS", "Scaling"],
    category: "Business"
  }
];

export const seedBlogPosts = async () => {
  try {
    const q = query(collection(db, 'blog_posts'), limit(1));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.log('Seeding blog posts...');
      for (const post of SAMPLE_POSTS) {
        await addDoc(collection(db, 'blog_posts'), {
          ...post,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      console.log('Blog posts seeded successfully!');
    } else {
      console.log('Blog posts already exist, skipping seed.');
    }
  } catch (error) {
    console.error('Error seeding blog posts:', error);
  }
};
