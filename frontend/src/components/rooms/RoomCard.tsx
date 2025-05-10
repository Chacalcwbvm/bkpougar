
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/context/SettingsContext";
import { useLanguage } from "@/context/LanguageContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import AvailabilityCalendar from "./AvailabilityCalendar";
import { CalendarIcon, Users } from "lucide-react";
import axios from "axios";

interface RoomCardProps {
  room: {
    id: number;
    nome: string;
    descricao: string;
    preco: number;
    capacidade: number;
    imagem: string;
  };
  index: number;
}

const RoomCard = ({ room, index }: RoomCardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currency } = useSettings();
  const { t } = useLanguage();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const handleBookNow = (checkIn: Date | null, checkOut: Date | null) => {
    if (!checkIn || !checkOut) {
      toast({
        variant: "destructive",
        title: t("error"),
        description: t("selectCheckInOutDates"),
      });
      return;
    }

    setIsChecking(true);

    // Verificar disponibilidade para as datas selecionadas
    const params = new URLSearchParams({
      checkin: checkIn.toISOString().split('T')[0],
      checkout: checkOut.toISOString().split('T')[0],
      hospedes: room.capacidade.toString(),
      quarto_id: room.id.toString()
    });

    axios.get(`/backend/verificar_disponibilidade.php?${params.toString()}`)
      .then(response => {
        setIsChecking(false);
        if (response.data && response.data.disponivel) {
          setIsDialogOpen(false);
          navigate(`/booking?roomId=${room.id}&checkin=${checkIn.toISOString().split('T')[0]}&checkout=${checkOut.toISOString().split('T')[0]}`);
        } else {
          toast({
            variant: "destructive",
            title: t("notAvailable"),
            description: t("roomNotAvailableForDates"),
          });
        }
      })
      .catch(error => {
        setIsChecking(false);
        console.error("Error checking availability:", error);
        toast({
          variant: "destructive",
          title: t("error"),
          description: t("errorCheckingAvailability"),
        });
      });
  };

  const handleViewDetails = () => {
    navigate(`/room/${room.id}`);
  };

  const getImageUrl = () => {
    if (room.imagem.startsWith('http')) {
      return room.imagem;
    } else if (room.imagem.startsWith('/')) {
      return room.imagem;
    } else {
      return `/backend/${room.imagem}`;
    }
  };

  // Replace this with any animation library or CSS transitions
  const animationDelay = index * 100; // ms

  return (
    <div 
      className="overflow-hidden rounded-lg shadow-md transition-all hover:shadow-lg bg-white"
      style={{ 
        animationDelay: `${animationDelay}ms`,
        opacity: 1,
        transform: 'translateY(0)'
      }}
    >
      <div className="relative h-56 overflow-hidden">
        <img
          src={getImageUrl()}
          alt={room.nome}
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder.svg";
          }}
        />
        <Badge className="absolute top-4 right-4 bg-hotel-navy">
          <Users className="h-3.5 w-3.5 mr-1" /> {room.capacidade}
        </Badge>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-serif font-semibold text-hotel-navy">{room.nome}</h3>
        <p className="mt-2 text-gray-500 line-clamp-2">{room.descricao}</p>
        <div className="mt-4 flex items-center justify-between">
          <div className="text-hotel-gold font-medium">
            {currency} {room.preco.toFixed(2)}
            <span className="text-gray-500 text-sm ml-1">/ {t("perNight")}</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleViewDetails}
              className="border-hotel-navy text-hotel-navy hover:bg-hotel-navy hover:text-white"
            >
              {t("viewDetails")}
            </Button>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-hotel-gold text-white hover:bg-hotel-gold/90">
                  {t("bookNow")}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{t("selectDates")}</DialogTitle>
                  <DialogDescription>
                    {t("selectAvailableDates")}
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <AvailabilityCalendar 
                    roomId={room.id} 
                    onDateSelect={(checkIn, checkOut) => {
                      if (checkIn && checkOut) {
                        handleBookNow(checkIn, checkOut);
                      }
                    }}
                  />
                </div>
                <div className="flex justify-end">
                  <Button 
                    type="button" 
                    disabled={isChecking} 
                    className="bg-hotel-gold hover:bg-hotel-gold/90"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    {t("cancel")}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
