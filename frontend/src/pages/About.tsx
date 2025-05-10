
import { useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";

const About = () => {
  const { t } = useLanguage();
  
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    
    // Update document title
    document.title = "About Us - PousadaViva";
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="pt-24 pb-12 bg-hotel-navy text-white">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <h1 className="font-serif text-3xl md:text-5xl font-bold text-center mb-4">
              {t("about")} <span className="text-hotel-gold">PousadaViva</span>
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <p className="text-center max-w-3xl mx-auto text-gray-300">
              {t("contactDesc")}
            </p>
          </ScrollReveal>
        </div>
      </div>

      <main className="flex-grow py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <ScrollReveal>
              <div>
                <h2 className="font-serif text-3xl font-bold text-hotel-navy mb-6">{t("ourStory")}</h2>
                <div className="space-y-4 text-gray-600">
                  <p>
                    {t("ourStoryP1")}
                  </p>
                  <p>
                    {t("ourStoryP2")}
                  </p>
                  <p>
                    {t("ourStoryP3")}
                  </p>
                </div>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={300}>
              <div className="rounded-lg overflow-hidden shadow-xl">
                <img 
                  src="/about1.jpg" 
                  alt="PousadaViva History" 
                  className="w-full h-full object-cover"
                />
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal>
            <div className="bg-gray-50 rounded-lg p-8 md:p-12 mb-16">
              <h2 className="font-serif text-3xl font-bold text-center text-hotel-navy mb-8">{t("ourValues")}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-hotel-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">🏠</span>
                  </div>
                  <h3 className="font-serif text-xl font-semibold mb-3">{t("genuineHospitality")}</h3>
                  <p className="text-gray-600">
                    {t("genuineHospitalityDesc")}
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-hotel-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">✨</span>
                  </div>
                  <h3 className="font-serif text-xl font-semibold mb-3">{t("attentionDetail")}</h3>
                  <p className="text-gray-600">
                    {t("attentionDetailDesc")}
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-hotel-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">🌱</span>
                  </div>
                  <h3 className="font-serif text-xl font-semibold mb-3">{t("sustainability")}</h3>
                  <p className="text-gray-600">
                    {t("sustainabilityDesc")}
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <ScrollReveal delay={300}>
              <div className="rounded-lg overflow-hidden shadow-xl order-2 lg:order-1">
                <img 
                  src="/about2.jpg" 
                  alt="Our Team" 
                  className="w-full h-full object-cover"
                />
              </div>
            </ScrollReveal>
            <ScrollReveal>
              <div className="order-1 lg:order-2">
                <h2 className="font-serif text-3xl font-bold text-hotel-navy mb-6">{t("ourTeam")}</h2>
                <div className="space-y-4 text-gray-600">
                  <p>
                    {t("ourTeamP1")}
                  </p>
                  <p>
                    {t("ourTeamP2")}
                  </p>
                  <p>
                    {t("ourTeamP3")}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal>
            <div className="bg-hotel-navy text-white rounded-lg p-8 md:p-12 overflow-hidden relative">
              <div className="relative z-10">
                <h2 className="font-serif text-3xl font-bold text-center mb-6">
                  {t("experiencePousadaViva")}
                </h2>
                <p className="text-center max-w-3xl mx-auto mb-8 text-gray-300">
                  {t("experienceDesc")}
                </p>
                <div className="flex justify-center">
                  <Button asChild className="bg-hotel-gold hover:bg-hotel-gold/80 text-white">
                    <Link to="/booking">{t("bookYourStay")}</Link>
                  </Button>
                </div>
              </div>
              <div className="absolute inset-0 bg-black/30 z-0"></div>
            </div>
          </ScrollReveal>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
