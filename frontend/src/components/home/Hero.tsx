
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { useSettings } from '@/context/SettingsContext';

const Hero = () => {
  const { t } = useLanguage();
  const { hotelName } = useSettings();

  return (
    <div className="relative h-screen overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/hero-image.jpg')" }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center items-center text-center text-white">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-4">
          <span className="block">{t('welcomeTo')}</span>
          <span className="text-hotel-gold">{hotelName}</span>
        </h1>
        <p className="text-lg md:text-xl max-w-3xl mb-8 opacity-90">
          {t('heroDesc')}
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild className="bg-hotel-gold hover:bg-hotel-gold/80 text-white px-8 py-6 text-lg">
            <Link to="/booking">{t('bookNow')}</Link>
          </Button>
          <Button asChild className="bg-hotel-navy hover:bg-hotel-navy/80 text-white px-8 py-6 text-lg">
            <Link to="/rooms">{t('exploreRooms')}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
