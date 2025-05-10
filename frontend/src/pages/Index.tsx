
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/home/Hero';
import Features from '@/components/home/Features';
import FeaturedRooms from '@/components/home/FeaturedRooms';
import Testimonials from '@/components/home/Testimonials';
import Cta from '@/components/home/Cta';
import { useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';

const Index = () => {
  const { language } = useLanguage();
  
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    
    // Update document title based on language
    document.title = language === 'pt' 
      ? "PousadaViva - Experiência de Hotel de Luxo" 
      : "PousadaViva - Luxury Hotel Experience";
  }, [language]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Hero />
        <Features />
        <FeaturedRooms />
        <Testimonials />
        <Cta />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
