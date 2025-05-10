
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/context/LanguageContext";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "../schemas/reservationSchema";

interface ReservationNotesFieldsProps {
  form: UseFormReturn<FormValues>;
}

const ReservationNotesFields = ({ form }: ReservationNotesFieldsProps) => {
  const { t } = useLanguage();

  return (
    <>
      <FormField
        control={form.control}
        name="observacoes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("observations")}</FormLabel>
            <FormControl>
              <Textarea 
                placeholder={t("enterObservations")} 
                className="resize-none" 
                {...field} 
                rows={4}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="status"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("status")}</FormLabel>
            <Select 
              onValueChange={field.onChange} 
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={t("selectStatus")} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="pendente">{t("pending")}</SelectItem>
                <SelectItem value="confirmada">{t("confirmed")}</SelectItem>
                <SelectItem value="cancelada">{t("canceled")}</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default ReservationNotesFields;
