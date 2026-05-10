import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  canonical?: string;
}

const SEO: React.FC<SEOProps> = ({ 
  title = "Premium Website Solutions | WebbyLaunch", 
  description = "WebbyLaunch builds high-performance websites in 52 hours. Specializing in Gyms, Resorts, and Clothing brands with elite UI/UX.", 
  keywords = "gym website design India, NGO digital strategy, premium web design services, clothing brand SEO India, 52 hour website delivery, hyper-speed website builder",
  image = "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200",
  url = "https://webbylaunch.vercel.app/",
  canonical
}) => {
  const seoUrl = url;
  const seoCanonical = canonical || "https://webbylaunch.vercel.app/";

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
    </Helmet>
  );
};

export default SEO;
