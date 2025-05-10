
import { useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Calendar, Users, ArrowLeft } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";

// Mock room data (same as in Rooms.tsx)
const allRooms = [
  {
    id: 1,
    title: "Deluxe Room",
    description: "Spacious room with a king-size bed and beautiful garden view.",
    longDescription: "Experience luxury in our Deluxe Room featuring a plush king-size bed with premium linens, a spacious bathroom with walk-in shower, and a private balcony overlooking our meticulously maintained gardens. Designed with your comfort in mind, this room provides the perfect retreat after a day of exploration or business.",
    image: "/room1.jpg",
    images: ["/room1.jpg", "/room1-2.jpg", "/room1-3.jpg", "/room1-4.jpg"],
    price: 150,
    capacity: 2,
    size: 30, // square meters
    features: ["Air Conditioning", "Free Wi-Fi", "LCD TV", "Mini Bar", "Room Service", "Daily Housekeeping", "Safe Box", "Hairdryer"],
    amenities: [
      { name: "King Size Bed", icon: "🛏️" },
      { name: "Garden View", icon: "🌳" },
      { name: "Coffee Machine", icon: "☕" },
      { name: "Work Desk", icon: "💼" }
    ]
  },
  {
    id: 2,
    title: "Superior Suite",
    description: "Elegant suite with separate living area and panoramic views.",
    longDescription: "Our Superior Suite offers an exceptional experience with a separate living area, a deluxe bedroom with a king-size bed, and a luxurious bathroom featuring both a rain shower and a soaking tub. From your private balcony, enjoy breathtaking panoramic views of the surrounding landscape. This spacious accommodation provides all the comforts of home with the luxury of a high-end hotel.",
    image: "/room2.jpg",
    images: ["/room2.jpg", "/room2-2.jpg", "/room2-3.jpg", "/room2-4.jpg"],
    price: 250,
    capacity: 3,
    size: 45,
    features: ["Air Conditioning", "Free Wi-Fi", "LCD TV", "Mini Bar", "Lounge Area", "Room Service", "Daily Housekeeping", "Safe Box", "Hairdryer", "Bathrobe & Slippers"],
    amenities: [
      { name: "King Size Bed", icon: "🛏️" },
      { name: "Panoramic View", icon: "🏞️" },
      { name: "Living Room", icon: "🛋️" },
      { name: "Premium Toiletries", icon: "🧴" }
    ]
  },
  {
    id: 3,
    title: "Family Room",
    description: "Perfect for families, with two bedrooms and a shared living space.",
    longDescription: "Our Family Room is specially designed to accommodate families with comfort and convenience. Featuring two separate bedrooms—one with a king-size bed and another with two twin beds—plus a shared living area, it provides both togetherness and privacy. The spacious bathroom includes a bathtub and separate shower. Thoughtful amenities for children make this the perfect choice for family vacations.",
    image: "/room3.jpg",
    images: ["/room3.jpg", "/room3-2.jpg", "/room3-3.jpg", "/room3-4.jpg"],
    price: 300,
    capacity: 4,
    size: 60,
    features: ["Air Conditioning", "Free Wi-Fi", "LCD TV", "Mini Bar", "Multiple Beds", "Room Service", "Daily Housekeeping", "Safe Box", "Hairdryer", "Children's Amenities"],
    amenities: [
      { name: "Two Bedrooms", icon: "🏠" },
      { name: "Living Area", icon: "🛋️" },
      { name: "Child-Friendly", icon: "👶" },
      { name: "Extra Space", icon: "📏" }
    ]
  },
  {
    id: 4,
    title: "Standard Room",
    description: "Comfortable room with twin beds, ideal for short stays.",
    longDescription: "Our Standard Room offers excellent value without compromising on comfort. Featuring two twin beds with quality mattresses and linens, this cozy space is perfect for friends traveling together or short business trips. The room includes a work desk, a modern bathroom with shower, and all the essential amenities for a pleasant stay.",
    image: "/room4.jpg",
    images: ["/room4.jpg", "/room4-2.jpg", "/room4-3.jpg", "/room4-4.jpg"],
    price: 120,
    capacity: 2,
    size: 25,
    features: ["Air Conditioning", "Free Wi-Fi", "LCD TV", "Room Service", "Daily Housekeeping", "Safe Box", "Hairdryer"],
    amenities: [
      { name: "Twin Beds", icon: "🛏️" },
      { name: "Work Desk", icon: "💼" },
      { name: "Modern Bathroom", icon: "🚿" },
      { name: "Economic Choice", icon: "💰" }
    ]
  },
  {
    id: 5,
    title: "Presidential Suite",
    description: "Our most luxurious accommodation with unparalleled amenities.",
    longDescription: "The Presidential Suite represents the pinnacle of luxury at PousadaViva. This expansive suite features a master bedroom with a premium king-size bed, a separate living room with elegant furnishings, a dining area, and a lavish marble bathroom with jacuzzi and walk-in shower. The private terrace offers spectacular views and a perfect setting for intimate gatherings. Additional perks include personalized concierge service and exclusive amenities.",
    image: "/room5.jpg",
    images: ["/room5.jpg", "/room5-2.jpg", "/room5-3.jpg", "/room5-4.jpg"],
    price: 450,
    capacity: 2,
    size: 80,
    features: ["Air Conditioning", "Free Wi-Fi", "LCD TV", "Mini Bar", "Jacuzzi", "Private Terrace", "Room Service", "Daily Housekeeping", "Safe Box", "Hairdryer", "Bathrobe & Slippers", "Premium Toiletries", "Lounge Area"],
    amenities: [
      { name: "Premium King Bed", icon: "👑" },
      { name: "Jacuzzi", icon: "🛁" },
      { name: "Private Terrace", icon: "🌄" },
      { name: "VIP Service", icon: "🌟" }
    ]
  },
  {
    id: 6,
    title: "Economy Room",
    description: "Budget-friendly option with all essential amenities for a comfortable stay.",
    longDescription: "The Economy Room is our most affordable option, perfect for budget-conscious travelers who don't want to sacrifice comfort. This compact yet well-designed space features a comfortable double bed, a clean bathroom with shower, and all the essential amenities you need for a good night's rest. Ideal for solo travelers or couples on short stays.",
    image: "/room6.jpg",
    images: ["/room6.jpg", "/room6-2.jpg", "/room6-3.jpg", "/room6-4.jpg"],
    price: 90,
    capacity: 1,
    size: 20,
    features: ["Air Conditioning", "Free Wi-Fi", "LCD TV", "Daily Housekeeping", "Hairdryer"],
    amenities: [
      { name: "Double Bed", icon: "🛏️" },
      { name: "Compact Design", icon: "📐" },
      { name: "Basic Amenities", icon: "🧴" },
      { name: "Budget Friendly", icon: "💰" }
    ]
  }
];

const RoomDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const room = allRooms.find(r => r.id === parseInt(id || "0"));

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    
    // Update document title
    document.title = room ? `${room.title} - PousadaViva` : "Room Not Found - PousadaViva";
  }, [room]);

  // Handle the case where room is not found
  if (!room) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-serif mb-4">Room Not Found</h2>
            <p className="mb-6 text-gray-600">Sorry, we couldn't find the room you're looking for.</p>
            <Button asChild variant="outline" className="border-hotel-gold text-hotel-gold hover:bg-hotel-gold/10">
              <Link to="/rooms">View All Rooms</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const [mainImage, ...galleryImages] = room.images;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow pt-24">
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            className="mb-6 flex items-center text-gray-600 hover:text-hotel-gold"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Rooms
          </Button>

          <ScrollReveal>
            <h1 className="font-serif text-3xl md:text-4xl font-bold mb-6 text-hotel-navy">
              {room.title}
            </h1>
          </ScrollReveal>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <ScrollReveal>
                <div className="rounded-lg overflow-hidden mb-6">
                  <img
                    src={mainImage}
                    alt={room.title}
                    className="w-full h-[400px] object-cover"
                  />
                </div>
              </ScrollReveal>

              <ScrollReveal delay={200}>
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {galleryImages.map((img, index) => (
                    <div key={index} className="rounded-lg overflow-hidden h-32">
                      <img
                        src={img}
                        alt={`${room.title} view ${index + 2}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </ScrollReveal>

              <ScrollReveal delay={300}>
                <div className="mb-8">
                  <h2 className="font-serif text-2xl mb-4 text-hotel-navy">Room Description</h2>
                  <p className="text-gray-700 leading-relaxed">
                    {room.longDescription}
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={400}>
                <div className="mb-8">
                  <h2 className="font-serif text-2xl mb-4 text-hotel-navy">Amenities & Features</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {room.amenities.map((amenity, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg text-center">
                        <div className="text-3xl mb-2">{amenity.icon}</div>
                        <p className="text-sm font-medium">{amenity.name}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {room.features.map(feature => (
                      <span
                        key={feature}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            </div>

            <div>
              <ScrollReveal delay={500}>
                <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100 sticky top-24">
                  <h3 className="font-serif text-xl mb-4 text-hotel-navy">Booking Summary</h3>
                  
                  <div className="flex justify-between py-3 border-b">
                    <span className="text-gray-600">Price per night</span>
                    <span className="font-semibold text-hotel-gold">${room.price}</span>
                  </div>
                  
                  <div className="flex justify-between py-3 border-b">
                    <span className="text-gray-600">Room Size</span>
                    <span>{room.size} m²</span>
                  </div>
                  
                  <div className="flex justify-between py-3 border-b">
                    <span className="text-gray-600">Capacity</span>
                    <span className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      {room.capacity} {room.capacity === 1 ? 'Guest' : 'Guests'}
                    </span>
                  </div>

                  <div className="mt-6">
                    <Button asChild className="w-full bg-hotel-gold hover:bg-hotel-gold/80 text-white py-6">
                      <Link to={`/booking?roomId=${room.id}`}>
                        <Calendar className="mr-2 h-5 w-5" />
                        Book This Room
                      </Link>
                    </Button>
                  </div>

                  <p className="text-sm text-gray-500 text-center mt-4">
                    No payment required now. Reserve your room today!
                  </p>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RoomDetail;
