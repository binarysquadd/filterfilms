import type { Metadata } from 'next';
import { Playfair_Display, Cormorant_Garamond } from 'next/font/google';
import './globals.css';

import LayoutWrapper from './src/components/layout-wrapper';
import { AuthProvider } from './lib/firebase/auth-context';
import ToastProvider from './src/components/providers/toast-provider';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['400', '500', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-cormorant',
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
});

// Comprehensive SEO Metadata for Indian Market
export const metadata: Metadata = {
  title:
    'Filter Films - Best Video Production Company in India | Professional Cinematography Services',
  description:
    "Filter Films is India's premier video production company based in Berhampur, Odisha, offering professional cinematography, corporate videos, wedding films, ad films, documentary production, and digital content creation. Award-winning filmmakers serving Berhampur, Bhubaneswar, Cuttack, Odisha, and all major Indian cities.",
  keywords: [
    // Core Services
    'video production company india',
    'professional video production services',
    'cinematography services india',
    'corporate video production',
    'ad film makers india',
    'commercial video production',
    'documentary filmmakers india',
    'wedding videography india',
    'product video production',
    'brand video production',

    // Location-based Keywords (Major Indian Cities)
    'video production mumbai',
    'video production delhi',
    'video production bangalore',
    'video production hyderabad',
    'video production chennai',
    'video production kolkata',
    'video production pune',
    'video production ahmedabad',
    'video production jaipur',
    'video production chandigarh',

    // Odisha & Eastern India Specific
    'video production odisha',
    'video production berhampur',
    'video production bhubaneswar',
    'video production cuttack',
    'video production rourkela',
    'cinematographer odisha',
    'wedding videography odisha',
    'corporate video berhampur',
    'best video production berhampur',
    'professional videographer odisha',
    'video production ganjam',
    'berhampur wedding videographer',
    'odisha corporate films',
    'video production eastern india',

    // Specific Services
    'corporate film production',
    'training video production',
    'explainer video production india',
    'animated video production',
    '2d 3d animation services',
    'youtube video production',
    'social media video content',
    'instagram reels production',
    'facebook video marketing',
    'digital marketing videos',

    // Industry-specific
    'startup video production',
    'real estate video production',
    'healthcare video production',
    'education video production',
    'fashion video production',
    'food video production',
    'hotel video production',
    'product demo videos',

    // Event Coverage
    'event videography india',
    'conference video coverage',
    'seminar video production',
    'exhibition video coverage',
    'concert video production',

    // Wedding & Personal
    'cinematic wedding films',
    'destination wedding videography',
    'pre wedding shoot',
    'candid wedding videography',
    'luxury wedding films india',

    // Technical Keywords
    '4k video production',
    '8k cinematography',
    'drone videography india',
    'aerial cinematography',
    'gimbal camera work',
    'professional video editing',
    'color grading services',
    'post production services india',

    // Creative Services
    'creative video agency',
    'storytelling through video',
    'brand storytelling india',
    'visual content creation',
    'multimedia production',
    'film production house india',

    // Budget-friendly
    'affordable video production',
    'best video production rates india',
    'budget friendly video services',

    // Premium
    'premium video production',
    'luxury video production india',
    'high end cinematography',

    // B2B Keywords
    'video production for businesses',
    'enterprise video solutions',
    'internal communication videos',
    'investor pitch videos',
    'testimonial video production',

    // Regional
    'hindi video production',
    'multilingual video production',
    'regional language videos',

    // Trending
    'viral video production',
    'trending video content',
    'influencer video production',
    'content creator services',

    // Awards & Recognition
    'award winning filmmakers india',
    'top video production company',
    'best cinematographers india',

    // Equipment
    'red camera cinematography',
    'arri camera shoots',
    'professional camera equipment rental',
  ].join(', '),
  authors: [{ name: 'Filter Films' }],
  creator: 'Filter Films',
  publisher: 'Filter Films',

  // Open Graph for Social Media
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://www.filterfilms.in',
    siteName: 'Filter Films',
    title: "Filter Films - India's Premier Video Production Company",
    description:
      'Award-winning video production company based in Berhampur, Odisha. Specializing in corporate videos, ad films, wedding cinematography, and digital content creation. Serving Odisha and all major Indian cities.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Filter Films - Professional Video Production Services',
      },
    ],
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Icons
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },

  // Additional Metadata
  category: 'Video Production',
  classification: 'Business',

  // Alternate Languages
  alternates: {
    canonical: 'https://www.filterfilms.in',
    languages: {
      'en-IN': 'https://www.filterfilms.in',
      'hi-IN': 'https://www.filterfilms.in/hi',
    },
  },

  // Other
  other: {
    'geo.region': 'IN-OR',
    'geo.placename': 'Berhampur, Odisha, India',
    'og:phone_number': '+91-7008772762',
    'og:email': 'filterfilmwork@gmail.com',
    'og:latitude': '19.30958',
    'og:longitude': '84.786354',
    'og:street-address': 'Gandhinagar 2nd Lane Extension, Near Mahamayee College',
    'og:locality': 'Berhampur',
    'og:region': 'Odisha',
    'og:postal-code': '760001',
    'og:country-name': 'India',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Structured Data for SEO (JSON-LD)
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      // Organization Schema
      {
        '@type': 'Organization',
        '@id': 'https://www.filterfilms.in/#organization',
        name: 'Filter Films',
        url: 'https://www.filterfilms.in',
        logo: {
          '@type': 'ImageObject',
          url: 'https://www.filterfilms.in/logo.png',
          width: 512,
          height: 512,
        },
        description:
          'Professional video production company in India offering cinematography, corporate videos, ad films, and digital content creation services.',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Gandhinagar 2nd Lane Extension, Near Mahamayee College',
          addressLocality: 'Berhampur',
          addressRegion: 'Odisha',
          postalCode: '760001',
          addressCountry: 'IN',
        },
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+91-7008772762',
          contactType: 'Customer Service',
          areaServed: 'IN',
          availableLanguage: ['English', 'Hindi', 'Odia'],
          email: 'filterfilmwork@gmail.com',
        },
        sameAs: [
          'https://www.instagram.com/filterfilms',
          'https://www.facebook.com/filterfilms',
          'https://www.youtube.com/@filterfilms',
          'https://www.linkedin.com/company/filterfilms',
        ],
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.9',
          reviewCount: '250',
          bestRating: '5',
          worstRating: '1',
        },
      },

      // Local Business Schema
      {
        '@type': 'LocalBusiness',
        '@id': 'https://www.filterfilms.in/#localbusiness',
        name: 'Filter Films',
        image: 'https://www.filterfilms.in/business-image.jpg',
        telephone: '+91-7008772762',
        email: 'filterfilmwork@gmail.com',
        priceRange: '₹₹₹',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Gandhinagar 2nd Lane Extension, Near Mahamayee College',
          addressLocality: 'Berhampur',
          addressRegion: 'Odisha',
          postalCode: '760001',
          addressCountry: 'IN',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 19.30958,
          longitude: 84.786354,
        },
        url: 'https://www.filterfilms.in',
        openingHoursSpecification: [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            opens: '10:00',
            closes: '19:00',
          },
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: 'Sunday',
            opens: '00:00',
            closes: '00:00',
            description: 'Appointment Only',
          },
        ],
        areaServed: [
          {
            '@type': 'City',
            name: 'Berhampur',
          },
          {
            '@type': 'City',
            name: 'Bhubaneswar',
          },
          {
            '@type': 'City',
            name: 'Cuttack',
          },
          {
            '@type': 'City',
            name: 'Rourkela',
          },
          {
            '@type': 'City',
            name: 'Mumbai',
          },
          {
            '@type': 'City',
            name: 'Delhi',
          },
          {
            '@type': 'City',
            name: 'Bangalore',
          },
          {
            '@type': 'City',
            name: 'Hyderabad',
          },
          {
            '@type': 'City',
            name: 'Chennai',
          },
          {
            '@type': 'City',
            name: 'Kolkata',
          },
          {
            '@type': 'City',
            name: 'Pune',
          },
          {
            '@type': 'State',
            name: 'Odisha',
          },
          {
            '@type': 'Country',
            name: 'India',
          },
        ],
      },

      // Professional Service Schema
      {
        '@type': 'ProfessionalService',
        '@id': 'https://www.filterfilms.in/#service',
        name: 'Filter Films Video Production',
        description:
          'Professional video production services including corporate videos, ad films, wedding cinematography, and digital content creation across India.',
        provider: {
          '@id': 'https://www.filterfilms.in/#organization',
        },
        areaServed: {
          '@type': 'Country',
          name: 'India',
        },
        serviceType: [
          'Video Production',
          'Cinematography',
          'Corporate Videos',
          'Ad Films',
          'Wedding Videography',
          'Documentary Production',
          'Digital Content Creation',
        ],
      },

      // Service Offerings
      {
        '@type': 'Service',
        serviceType: 'Corporate Video Production',
        provider: {
          '@id': 'https://www.filterfilms.in/#organization',
        },
        areaServed: {
          '@type': 'Country',
          name: 'India',
        },
        description:
          'Professional corporate video production services for businesses across India.',
      },
      {
        '@type': 'Service',
        serviceType: 'Wedding Videography',
        provider: {
          '@id': 'https://www.filterfilms.in/#organization',
        },
        areaServed: {
          '@type': 'Country',
          name: 'India',
        },
        description: 'Cinematic wedding videography and photography services.',
      },
      {
        '@type': 'Service',
        serviceType: 'Commercial Ad Films',
        provider: {
          '@id': 'https://www.filterfilms.in/#organization',
        },
        areaServed: {
          '@type': 'Country',
          name: 'India',
        },
        description: 'Creative commercial ad film production for brands.',
      },

      // Website Schema
      {
        '@type': 'WebSite',
        '@id': 'https://www.filterfilms.in/#website',
        url: 'https://www.filterfilms.in',
        name: 'Filter Films',
        description: 'Professional Video Production Company in India',
        publisher: {
          '@id': 'https://www.filterfilms.in/#organization',
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://www.filterfilms.in/search?q={search_term_string}',
          },
          'query-input': 'required name=search_term_string',
        },
      },

      // Breadcrumb Schema
      {
        '@type': 'BreadcrumbList',
        '@id': 'https://www.filterfilms.in/#breadcrumb',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://www.filterfilms.in',
          },
        ],
      },
    ],
  };

  return (
    <html lang="en">
      <head>
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />

        {/* Additional SEO Meta Tags */}
        <meta name="geo.region" content="IN" />
        <meta name="geo.placename" content="India" />
        <meta name="language" content="English" />
        <meta name="coverage" content="Worldwide" />
        <meta name="distribution" content="Global" />
        <meta name="rating" content="General" />
        <meta name="target" content="all" />
        <meta name="audience" content="all" />

        {/* Mobile Optimization */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

        {/* Preconnect for Performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Canonical URL */}
        <link rel="canonical" href="https://www.filterfilms.in" />

        {/* Alternate Language Versions */}
        <link rel="alternate" hrefLang="en-IN" href="https://www.filterfilms.in" />
        <link rel="alternate" hrefLang="hi-IN" href="https://www.filterfilms.in/hi" />
        <link rel="alternate" hrefLang="x-default" href="https://www.filterfilms.in" />
      </head>
      <body className={`${playfair.variable} ${cormorant.variable} antialiased`}>
        <ToastProvider />
        <AuthProvider>
          <LayoutWrapper>{children}</LayoutWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
