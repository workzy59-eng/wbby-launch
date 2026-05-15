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
  title = "Premium Website solutions | WebbyLaunch", 
  description = "WebbyLaunch builds high-performance websites in 52 hours. Specializing in Gyms, Resorts, and Clothing brands with elite UI/UX.", 
  keywords = "website development company in India, affordable web design services India, 52 hour website delivery, premium website solutions, startup website builder India",
  image = "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200&h=630",
  url = "https://ais-pre-cxnuohxnxotikhimmakonv-628570041945.asia-southeast1.run.app/",
  canonical
}) => {
  const seoUrl = url;
  const seoCanonical = canonical || seoUrl;

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
