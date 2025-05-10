import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/context/LanguageContext";
import { UseFormReturn } from "react-hook-form";
import { useState } from "react";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { FormValues } from "../schemas/reservationSchema";

interface GuestInformationFieldsProps {
  form: UseFormReturn<FormValues>;
}

const GuestInformationFields = ({ form }: GuestInformationFieldsProps) => {
  const { t } = useLanguage();
  const [loadingCep, setLoadingCep] = useState(false);

  // Function to handle uppercase input (except for email)
  const handleUppercaseInput = (field: string, value: string) => {
    if (field === 'hospede_email') {
      return value;
    }
    return value.toUpperCase();
  };

  // Function to search address by CEP
  const searchAddressByCep = async (cep: string) => {
    // Remove any non-digit characters
    cep = cep.replace(/\D/g, '');

    // Check if CEP has the correct format
    if (cep.length !== 8) {
      return;
    }

    setLoadingCep(true);
    try {
      const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
      
      if (!response.data.erro) {
        // Update address fields
        form.setValue('hospede_endereco', response.data.logradouro.toUpperCase());
        form.setValue('hospede_bairro', response.data.bairro.toUpperCase());
        form.setValue('hospede_cidade', response.data.localidade.toUpperCase());
        form.setValue('hospede_estado', response.data.uf.toUpperCase());
      }
    } catch (error) {
      console.error('Error fetching address:', error);
    } finally {
      setLoadingCep(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-medium">{t("guestInformation")}</h2>
      
      <FormField
        control={form.control}
        name="hospede_nome"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("guestName")}</FormLabel>
            <FormControl>
              <Input 
                placeholder={t("enterGuestName")} 
                {...field} 
                onChange={(e) => field.onChange(handleUppercaseInput('hospede_nome', e.target.value))} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="hospede_email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("email")}</FormLabel>
            <FormControl>
              <Input 
                type="email" 
                placeholder={t("enterEmail")} 
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="hospede_telefone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("phone")}</FormLabel>
            <FormControl>
              <Input 
                placeholder={t("enterPhone")} 
                {...field}
                onChange={(e) => field.onChange(handleUppercaseInput('hospede_telefone', e.target.value))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="hospede_cep"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("zipCode")}</FormLabel>
            <FormControl>
              <div className="flex gap-2">
                <Input 
                  placeholder={t("enterZipCode")} 
                  {...field}
                  onChange={(e) => field.onChange(e.target.value)}
                  onBlur={(e) => {
                    if (e.target.value) {
                      searchAddressByCep(e.target.value);
                    }
                  }}
                />
                {loadingCep && (
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="hospede_endereco"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("address")}</FormLabel>
              <FormControl>
                <Input 
                  placeholder={t("enterAddress")} 
                  {...field}
                  onChange={(e) => field.onChange(handleUppercaseInput('hospede_endereco', e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="hospede_bairro"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("neighborhood")}</FormLabel>
              <FormControl>
                <Input 
                  placeholder={t("enterNeighborhood")} 
                  {...field}
                  onChange={(e) => field.onChange(handleUppercaseInput('hospede_bairro', e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="hospede_cidade"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("city")}</FormLabel>
              <FormControl>
                <Input 
                  placeholder={t("enterCity")} 
                  {...field}
                  onChange={(e) => field.onChange(handleUppercaseInput('hospede_cidade', e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="hospede_estado"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("state")}</FormLabel>
              <FormControl>
                <Input 
                  placeholder={t("enterState")} 
                  {...field}
                  onChange={(e) => field.onChange(handleUppercaseInput('hospede_estado', e.target.value))}
                  maxLength={2}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default GuestInformationFields;
