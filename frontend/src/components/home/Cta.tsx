
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { useLanguage } from '@/context/LanguageContext';

const Cta = () => {
  const { t } = useLanguage();
  
  return (
    <section className="py-16 md:py-24 bg-hotel-navy text-white">
      <div className="container mx-auto px-4 text-center">
        <ScrollReveal>
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
            {t("readyForStay")} <span className="text-hotel-gold">{t("unforgettable")}</span> {t("stay")}
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={200}>
          <p className="text-xl max-w-3xl mx-auto mb-8 text-gray-300">
            {t("readyDesc")}
          </p>
        </ScrollReveal>
        <ScrollReveal delay={400}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="bg-hotel-gold hover:bg-hotel-gold/80 text-white px-8 py-6">
              <Link to="/booking">{t("bookNow")}</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/10 px-8 py-6">
              <Link to="/contact">{t("contactUs")}</Link>
            </Button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default Cta;
