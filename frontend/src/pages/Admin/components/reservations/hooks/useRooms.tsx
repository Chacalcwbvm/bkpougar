
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";
import { fetchRooms } from "../utils/reservationApi";
import { useState } from "react";
import axios from "axios";

export const useRooms = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [retryCount, setRetryCount] = useState(0);

  // Fetch rooms data with better error handling
  const { data: roomsData, isLoading: roomsLoading, error: roomsError, refetch } = useQuery({
    queryKey: ['rooms', retryCount],
    queryFn: async () => {
      try {
        // Try the regular API endpoint first
        return await fetchRooms();
      } catch (error) {
        console.error("Error fetching rooms:", error);
        
        // If we get a 404, try to create a mock response for development/testing
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          // Return mock data for development/testing
          console.log("Returning mock room data for development");
          return [
            { id: "1", nome: "Standard Room", preco_diaria: "100.00", capacidade: 2, descricao: "Standard room with basic amenities" },
            { id: "2", nome: "Deluxe Room", preco_diaria: "150.00", capacidade: 2, descricao: "Deluxe room with premium amenities" },
            { id: "3", nome: "Suite", preco_diaria: "250.00", capacidade: 4, descricao: "Spacious suite with separate living area" }
          ];
        }
        
        // If it's another error, rethrow to be caught by the error handling
        throw error;
      }
    },
    retry: 1,
    staleTime: 60000, // 1 minute
    meta: {
      onError: (error: Error) => {
        console.error("Error fetching rooms:", error);
        toast({
          variant: "destructive",
          title: t("error"),
          description: t("errorLoadingRooms"),
        });
      }
    }
  });
  
  // Ensure roomsData is always an array
  const rooms = Array.isArray(roomsData) ? roomsData : [];

  // Function to manually retry loading rooms
  const retryLoading = () => {
    setRetryCount(prevCount => prevCount + 1);
  };

  return { 
    rooms, 
    roomsLoading, 
    roomsError,
    retryLoading
  };
};
