
import React, { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import axios from "axios";
import { ptBR } from "date-fns/locale";

interface AvailabilityCalendarProps {
  roomId: number;
  onDateSelect: (checkIn: Date | null, checkOut: Date | null) => void;
  initialCheckIn?: Date | null;
  initialCheckOut?: Date | null;
}

interface DateRange {
  checkin: string;
  checkout: string;
}

const AvailabilityCalendar = ({
  roomId,
  onDateSelect,
  initialCheckIn = null,
  initialCheckOut = null
}: AvailabilityCalendarProps) => {
  const [checkIn, setCheckIn] = useState<Date | null>(initialCheckIn);
  const [checkOut, setCheckOut] = useState<Date | null>(initialCheckOut);
  const [selectionMode, setSelectionMode] = useState<"checkIn" | "checkOut">("checkIn");
  const [occupiedDateRanges, setOccupiedDateRanges] = useState<DateRange[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { t, language } = useLanguage();

  useEffect(() => {
    if (roomId) {
      fetchOccupiedDates();
    }
  }, [roomId]);

  const fetchOccupiedDates = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`/backend/verificar_disponibilidade.php?quarto_id=${roomId}`);
      if (response.data && Array.isArray(response.data.datas_ocupadas)) {
        setOccupiedDateRanges(response.data.datas_ocupadas);
      }
    } catch (error) {
      console.error("Erro ao buscar datas ocupadas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const isDateDisabled = (date: Date) => {
    // Desabilitar datas passadas
    if (date < new Date(new Date().setHours(0, 0, 0, 0))) {
      return true;
    }
    
    // Para seleção de checkout, desabilitar datas anteriores ao checkin
    if (selectionMode === "checkOut" && checkIn && date <= checkIn) {
      return true;
    }

    // Verificar se a data está em algum intervalo ocupado
    return occupiedDateRanges.some(range => {
      const rangeStart = new Date(range.checkin);
      const rangeEnd = new Date(range.checkout);
      
      // Ajustando para comparar apenas datas sem horas
      rangeStart.setHours(0, 0, 0, 0);
      rangeEnd.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);
      
      return date >= rangeStart && date < rangeEnd;
    });
  };

  const handleDateSelect = (date: Date | null) => {
    if (selectionMode === "checkIn") {
      setCheckIn(date);
      setCheckOut(null);
      setSelectionMode("checkOut");
      
      // Não chama onDateSelect ainda, aguarda a data de checkout
    } else {
      setCheckOut(date);
      setSelectionMode("checkIn");
      
      // Agora podemos chamar onDateSelect com ambas as datas
      onDateSelect(checkIn, date);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="grid gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className="w-full justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {checkIn ? format(checkIn, "PPP", { locale: language === 'pt' ? ptBR : undefined }) : <span>{t("selectCheckInDate")}</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={checkIn}
              onSelect={(date) => {
                setCheckIn(date);
                setCheckOut(null);
                setSelectionMode("checkOut");
              }}
              disabled={isDateDisabled}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
              locale={language === 'pt' ? ptBR : undefined}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              disabled={!checkIn}
              className="w-full justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {checkOut ? format(checkOut, "PPP", { locale: language === 'pt' ? ptBR : undefined }) : <span>{t("selectCheckOutDate")}</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={checkOut}
              onSelect={(date) => {
                setCheckOut(date);
                setSelectionMode("checkIn");
                onDateSelect(checkIn, date);
              }}
              disabled={(date) => !checkIn || date <= checkIn || isDateDisabled(date)}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
              locale={language === 'pt' ? ptBR : undefined}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default AvailabilityCalendar;
