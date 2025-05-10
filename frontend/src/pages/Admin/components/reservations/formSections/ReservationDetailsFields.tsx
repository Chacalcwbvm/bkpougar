
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/context/LanguageContext";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { ptBR } from "date-fns/locale";
import { FormValues } from "../schemas/reservationSchema";

interface ReservationDetailsFieldsProps {
  form: UseFormReturn<FormValues>;
  rooms: any[];
  roomsLoading: boolean;
}

const ReservationDetailsFields = ({ form, rooms, roomsLoading }: ReservationDetailsFieldsProps) => {
  const { t, language } = useLanguage();

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-medium">{t("reservationDetails")}</h2>
      
      <FormField
        control={form.control}
        name="quarto_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("room")}</FormLabel>
            <Select 
              onValueChange={field.onChange} 
              defaultValue={field.value}
              disabled={roomsLoading}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={t("selectRoom")} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {rooms.map((room) => (
                  <SelectItem key={room.id} value={room.id.toString()}>
                    {room.nome} - {room.preco_normal} {t("currency")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="data_checkin"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>{t("checkIn")}</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={"outline"}
                    className="pl-3 text-left font-normal"
                  >
                    {field.value ? (
                      format(field.value, "PPP", { locale: language === 'pt' ? ptBR : undefined })
                    ) : (
                      <span>{t("selectCheckIn")}</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="data_checkout"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>{t("checkOut")}</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={"outline"}
                    className="pl-3 text-left font-normal"
                  >
                    {field.value ? (
                      format(field.value, "PPP", { locale: language === 'pt' ? ptBR : undefined })
                    ) : (
                      <span>{t("selectCheckOut")}</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  disabled={(date) => date <= form.getValues("data_checkin") || date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="num_hospedes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("guests")}</FormLabel>
            <Select 
              onValueChange={field.onChange} 
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={t("selectGuests")} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default ReservationDetailsFields;
