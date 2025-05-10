
import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import ScrollReveal from "@/components/ui/ScrollReveal";
import RoomFilters from "@/components/rooms/RoomFilters";
import RoomList from "@/components/rooms/RoomList";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";

const ITEMS_PER_PAGE = 6;

// Mock data to use when API is not available
const mockRooms = [
  {
    id: 1,
    nome: "Deluxe Ocean View",
    descricao: "Spacious room with beautiful ocean views and modern amenities.",
    preco: 150,
    capacidade: 2,
    imagem: "/room1.jpg"
  },
  {
    id: 2,
    nome: "Family Suite",
    descricao: "Perfect for families, with separate living area and two bedrooms.",
    preco: 220,
    capacidade: 4,
    imagem: "/room2.jpg"
  },
  {
    id: 3,
    nome: "Standard Room",
    descricao: "Comfortable and affordable accommodations for your stay.",
    preco: 90,
    capacidade: 2,
    imagem: "/room3.jpg"
  },
  {
    id: 4,
    nome: "Premium Suite",
    descricao: "Our most luxurious option with panoramic views and premium services.",
    preco: 280,
    capacidade: 2,
    imagem: "/room4.jpg"
  },
  {
    id: 5,
    nome: "Economy Room",
    descricao: "Budget-friendly option with all the essential amenities.",
    preco: 70,
    capacidade: 1,
    imagem: "/room5.jpg"
  },
  {
    id: 6,
    nome: "Garden View Room",
    descricao: "Peaceful room with beautiful views of our tropical garden.",
    preco: 110,
    capacidade: 2,
    imagem: "/room6.jpg"
  }
];

const Rooms = () => {
  const [allRooms, setAllRooms] = useState<Array<any>>([]);  // Initialize as empty array
  const [filteredRooms, setFilteredRooms] = useState<Array<any>>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const [filter, setFilter] = useState({
    capacity: 0,
    minPrice: 0,
    maxPrice: 500
  });

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        setError("");
        // Use relative path for API requests which works in both localhost and production
        const response = await axios.get('/backend/listar_quartos.php', { timeout: 5000 });
        
        // Ensure response.data is always an array
        const roomsData = Array.isArray(response.data) ? response.data : [];
        
        setAllRooms(roomsData);
        setFilteredRooms(roomsData);
      } catch (error) {
        console.error("Erro ao buscar quartos:", error);
        
        // Use mock data if the API fails
        setAllRooms(mockRooms);
        setFilteredRooms(mockRooms);
        
        setError(t("failedToLoadRooms"));
        toast({
          variant: "destructive",
          title: t("error"),
          description: t("failedToLoadRooms"),
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [toast, t]);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = t("roomsPageTitle") || "Rooms - PousadaViva";
  }, [t]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyFilter = () => {
    // Ensure allRooms is an array before calling filter
    if (!Array.isArray(allRooms)) {
      console.error("allRooms is not an array:", allRooms);
      return;
    }
    
    const filtered = allRooms.filter(room => {
      return (
        (filter.capacity === 0 || room.capacidade >= parseInt(filter.capacity.toString())) &&
        (room.preco >= parseInt(filter.minPrice.toString())) &&
        (room.preco <= parseInt(filter.maxPrice.toString()))
      );
    });
    
    setFilteredRooms(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredRooms.length / ITEMS_PER_PAGE);
  const paginatedRooms = filteredRooms.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="pt-24 pb-12 bg-hotel-navy text-white">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <h1 className="font-serif text-3xl md:text-5xl font-bold text-center mb-4">
              {t("ourRoomsAndSuites")}
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <p className="text-center max-w-3xl mx-auto text-gray-300">
              {t("discoverRoomsDescription")}
            </p>
          </ScrollReveal>
        </div>
      </div>

      <main className="flex-grow bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <RoomFilters 
            filter={filter}
            onFilterChange={handleFilterChange}
            onApplyFilter={applyFilter}
          />

          <Card>
            <CardContent className="p-6">
              <RoomList 
                rooms={paginatedRooms}
                isLoading={loading}
                error={error}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Rooms;
