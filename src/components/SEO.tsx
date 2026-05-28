import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  canonical?: string;
  type?: 'website' | 'article' | 'business';
}

const SEO: React.FC<SEOProps> = ({ 
  title = "WebbyLaunch | Webby Launch | Premium Website Solutions and SaaS Development", 
  description = "WebbyLaunch (Webby Launch) builds high-performance websites in under 52 hours. Discover the best affordable web agencies in India and website development and design costs in India.", 
  keywords = "best affordable web agencies in India, website development and design costs in India, WebbyLaunch, Webby Launch, webbylaunch, webby launch, website development company in India, affordable web design services India, WPWeb Infotech comparison, FODUU review, Webclick Digital cheap web designer, Syspree pricing, premium website solutions, startup website builder India",
  image = "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200",
  url = "https://webbylaunch.vercel.app",
  canonical,
  type = 'website'
}) => {
  const seoUrl = url;
  const seoCanonical = canonical || seoUrl;

  const schemaData = {
    "@context": "https://schema.org",
    "@type": type === 'business' ? 'LocalBusiness' : 'Organization',
    "name": "WebbyLaunch",
    "url": "https://webbylaunch.vercel.app",
    "logo": "https://webbylaunch.vercel.app/favicon.svg",
    "description": description,
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "IN"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91-88000-00000",
      "contactType": "customer service"
    }
  };

  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={seoCanonical} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={seoUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={seoUrl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />

      {/* Structured Schema */}
      <script type="application/ld+json">
        {JSON.stringify(schemaData)}
      </script>
    </Helmet>
  );
};

export default SEO;
