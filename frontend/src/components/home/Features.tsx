
import { Calendar, Users, Bell, User } from 'lucide-react';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { useLanguage } from '@/context/LanguageContext';

const Features = () => {
  const { t } = useLanguage();
  
  const features = [
    {
      icon: <Calendar className="h-8 w-8 text-hotel-gold" />,
      title: t("easyBooking"),
      description: t("easyBookingDesc"),
    },
    {
      icon: <Users className="h-8 w-8 text-hotel-gold" />,
      title: t("premiumService"),
      description: t("premiumServiceDesc"),
    },
    {
      icon: <Bell className="h-8 w-8 text-hotel-gold" />,
      title: t("comfortLuxury"),
      description: t("comfortLuxuryDesc"),
    },
    {
      icon: <User className="h-8 w-8 text-hotel-gold" />,
      title: t("personalizedExp"),
      description: t("personalizedExpDesc"),
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-center mb-4">
            {t("whyChoose")} <span className="text-hotel-gold">PousadaViva</span>
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={200}>
          <p className="text-center text-gray-600 max-w-3xl mx-auto mb-16">
            {t("chooseDesc")}
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <ScrollReveal key={feature.title} delay={300 + index * 100}>
              <div className="bg-gray-50 p-8 rounded-lg text-center hover:shadow-lg transition-shadow duration-300">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-hotel-gold/10 mb-6">
                  {feature.icon}
                </div>
                <h3 className="font-serif text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
