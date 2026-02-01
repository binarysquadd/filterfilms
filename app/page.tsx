import AboutSection from './src/public/about/page';
import GallerySection from './src/public/gallery/page';
import Home from './src/public/home/page';
import OurTeam from './src/public/our-team/page';
import PackagesSection from './src/public/packages/page';
import StatisticsSection from './src/public/stats/page';
import ContactSection from './src/public/contact/page';
import TestimonialsSection from './src/public/testimonials/page';

export default function Page() {
  return (
    <>
      <Home />
      <StatisticsSection />
      <GallerySection />
      <OurTeam />
      <PackagesSection />
      <AboutSection />
      <TestimonialsSection />
      <ContactSection />
    </>
  );
}
