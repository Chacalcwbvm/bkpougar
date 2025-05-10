
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const FeaturedRooms = () => {
  const { t } = useLanguage();
  
  const rooms = [
    {
      id: 1,
      title: 'Deluxe Room',
      description: 'Spacious room with a king-size bed and beautiful garden view.',
      image: '/room1.jpg',
      price: 150,
      capacity: 2,
    },
    {
      id: 2,
      title: 'Superior Suite',
      description: 'Elegant suite with separate living area and panoramic views.',
      image: '/room2.jpg',
      price: 250,
      capacity: 3,
    },
    {
      id: 3,
      title: 'Family Room',
      description: 'Perfect for families, with two bedrooms and a shared living space.',
      image: '/room3.jpg',
      price: 300,
      capacity: 4,
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-center mb-4">
            {t("featuredRooms")} <span className="text-hotel-gold">{t("rooms")}</span>
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={200}>
          <p className="text-center text-gray-600 max-w-3xl mx-auto mb-16">
            {t("featuredRoomsDesc")}
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rooms.map((room, index) => (
            <ScrollReveal key={room.id} delay={300 + index * 100}>
              <Card className="hotel-card overflow-hidden border-0 shadow-lg">
                <div className="h-64 overflow-hidden">
                  <img 
                    src={room.image} 
                    alt={room.title}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" 
                  />
                </div>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-serif text-xl font-semibold">{room.title}</h3>
                    <span className="text-hotel-gold font-semibold">
                      ${room.price}<span className="text-sm text-gray-500">{t("perNight")}</span>
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{room.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">{t("capacity")}: {room.capacity} {t("people")}</span>
                    <Button asChild variant="ghost" className="text-hotel-gold hover:text-hotel-gold/80 hover:bg-hotel-gold/10 p-0">
                      <Link to={`/rooms/${room.id}`}>
                        {t("viewDetails")} <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Button asChild variant="outline" className="border-hotel-gold text-hotel-gold hover:bg-hotel-gold/10">
            <Link to="/rooms">{t("viewAllRooms")}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedRooms;
