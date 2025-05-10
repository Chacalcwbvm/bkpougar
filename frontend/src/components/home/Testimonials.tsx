
import { useState } from 'react';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { useLanguage } from '@/context/LanguageContext';

const Testimonials = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const { t } = useLanguage();
  
  const testimonials = [
    {
      id: 1,
      name: 'Sarah Johnson',
      title: 'Business Traveler',
      quote: "The service at PousadaViva exceeded all my expectations. The staff was attentive and the room was immaculate. I'll definitely be returning on my next business trip.",
      avatar: '/avatar1.jpg',
    },
    {
      id: 2,
      name: 'Michael Chen',
      title: 'Family Vacation',
      quote: "We had an amazing family vacation at PousadaViva. The family room was spacious and comfortable, and the kids loved the activities organized by the staff.",
      avatar: '/avatar2.jpg',
    },
    {
      id: 3,
      name: 'Elena Rodriguez',
      title: 'Honeymoon',
      quote: "Our honeymoon at PousadaViva was perfect! The romantic suite with its beautiful view created the perfect atmosphere for our special occasion.",
      avatar: '/avatar3.jpg',
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-center mb-4">
            {t("guestsSay")} <span className="text-hotel-gold">{t("guests")}</span>
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={200}>
          <p className="text-center text-gray-600 max-w-3xl mx-auto mb-16">
            {t("sayDesc")}
          </p>
        </ScrollReveal>

        <div className="max-w-4xl mx-auto">
          <ScrollReveal delay={300}>
            <div className="bg-gray-50 rounded-lg p-8 md:p-12 shadow-lg relative">
              <svg 
                className="absolute top-8 left-8 text-hotel-gold/20 h-16 w-16"
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M10 11H6C5.46957 11 4.96086 10.7893 4.58579 10.4142C4.21071 10.0391 4 9.53043 4 9V7C4 6.46957 4.21071 5.96086 4.58579 5.58579C4.96086 5.21071 5.46957 5 6 5H8C8.53043 5 9.03914 5.21071 9.41421 5.58579C9.78929 5.96086 10 6.46957 10 7V17C10 17.5304 9.78929 18.0391 9.41421 18.4142C9.03914 18.7893 8.53043 19 8 19H6M20 11H16C15.4696 11 14.9609 10.7893 14.5858 10.4142C14.2107 10.0391 14 9.53043 14 9V7C14 6.46957 14.2107 5.96086 14.5858 5.58579C14.9609 5.21071 15.4696 5 16 5H18C18.5304 5 19.0391 5.21071 19.4142 5.58579C19.7893 5.96086 20 6.46957 20 7V17C20 17.5304 19.7893 18.0391 19.4142 18.4142C19.0391 18.7893 18.5304 19 18 19H16" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
              
              <div className="relative z-10">
                <p className="text-lg md:text-xl mb-8 italic">
                  {testimonials[activeTestimonial].quote}
                </p>
                
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                    <img 
                      src={testimonials[activeTestimonial].avatar} 
                      alt={testimonials[activeTestimonial].name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-serif font-semibold text-lg">
                      {testimonials[activeTestimonial].name}
                    </h4>
                    <p className="text-gray-500">
                      {testimonials[activeTestimonial].title}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
          
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button 
                key={index}
                onClick={() => setActiveTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  activeTestimonial === index ? 'bg-hotel-gold' : 'bg-gray-300'
                }`}
                aria-label={`View testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
