import Home from "./(public)/home/page";
import AboutSection from "./(public)/about/page";
import PackagesSection from "./(public)/packages/page";
import OurTeam from "./(public)/our-team/page";
import GalleryPage from "./(public)/gallery/page";
import ContactPage from "./(public)/contact/page";


export default function Page(){
  return(
    <>
      <Home />
      <AboutSection />
      <OurTeam />
      <GalleryPage />
      <PackagesSection />
      <ContactPage />
    </>
  )
}