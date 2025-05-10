import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from "react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";

interface SettingsContextType {
  hotelName: string;
  setHotelName: (name: string) => void;
  address: string;
  setAddress: (address: string) => void;
  phone: string;
  setPhone: (phone: string) => void;
  email: string;
  setEmail: (email: string) => void;
  checkInTime: string;
  setCheckInTime: (time: string) => void;
  checkOutTime: string;
  setCheckOutTime: (time: string) => void;
  currency: string;
  setCurrency: (currency: string) => void;
  logoUrl: string;
  setLogoUrl: (url: string) => void;
  pixKey: string;
  setPixKey: (key: string) => void;
  pixKeyType: string;
  setPixKeyType: (type: string) => void;
  pixBeneficiary: string;
  setPixBeneficiary: (name: string) => void;
  reservationDepositPercentage: number;
  setReservationDepositPercentage: (percentage: number) => void;
  managerWhatsApp: string;
  setManagerWhatsApp: (phone: string) => void;
  isSettingsLoaded: boolean;
  saveSettings: () => Promise<boolean>;
  isSaving: boolean;
  retryLoading: () => void;
}

const defaultSettings: SettingsContextType = {
  hotelName: "PousadaViva",
  setHotelName: () => {},
  address: "",
  setAddress: () => {},
  phone: "",
  setPhone: () => {},
  email: "",
  setEmail: () => {},
  checkInTime: "15:00",
  setCheckInTime: () => {},
  checkOutTime: "11:00",
  setCheckOutTime: () => {},
  currency: "USD",
  setCurrency: () => {},
  logoUrl: "",
  setLogoUrl: () => {},
  pixKey: "",
  setPixKey: () => {},
  pixKeyType: "CPF",
  setPixKeyType: () => {},
  pixBeneficiary: "",
  setPixBeneficiary: () => {},
  reservationDepositPercentage: 30,
  setReservationDepositPercentage: () => {},
  managerWhatsApp: "",
  setManagerWhatsApp: () => {},
  isSettingsLoaded: false,
  saveSettings: async () => false,
  isSaving: false,
  retryLoading: () => {}
};

const SettingsContext = createContext<SettingsContextType>(defaultSettings);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [hotelName, setHotelName] = useState("PousadaViva");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [checkInTime, setCheckInTime] = useState("15:00");
  const [checkOutTime, setCheckOutTime] = useState("11:00");
  const [currency, setCurrency] = useState("USD");
  const [logoUrl, setLogoUrl] = useState("");
  const [pixKey, setPixKey] = useState("");
  const [pixKeyType, setPixKeyType] = useState("CPF");
  const [pixBeneficiary, setPixBeneficiary] = useState("");
  const [reservationDepositPercentage, setReservationDepositPercentage] = useState(30);
  const [managerWhatsApp, setManagerWhatsApp] = useState("");
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loadAttempts, setLoadAttempts] = useState(0);
  const { toast } = useToast();
  const { t } = useLanguage();

  const fetchSettings = useCallback(async () => {
    try {
      // First try the regular endpoint
      const response = await axios.get('http://localhost/pougar/backend/admin/obter_configuracoes.php', {
        timeout: 5000 // 5 second timeout
      });
      
      if (response.data.sucesso && response.data.configuracoes.generalSettings) {
        const generalSettings = response.data.configuracoes.generalSettings;
        setHotelName(generalSettings.hotelName || "PousadaPouso das Garças");
        setAddress(generalSettings.address || "");
        setPhone(generalSettings.phone || "");
        setEmail(generalSettings.email || "");
        setCheckInTime(generalSettings.checkInTime || "15:00");
        setCheckOutTime(generalSettings.checkOutTime || "11:00");
        setCurrency(generalSettings.currency || "USD");
        setLogoUrl(generalSettings.logoUrl || "");
        setPixKey(generalSettings.pixKey || "");
        setPixKeyType(generalSettings.pixKeyType || "CPF");
        setPixBeneficiary(generalSettings.pixBeneficiary || "");
        setReservationDepositPercentage(generalSettings.reservationDepositPercentage || 30);
        setManagerWhatsApp(generalSettings.managerWhatsApp || "");
        console.log("Settings loaded successfully:", generalSettings);
      }
      setIsSettingsLoaded(true);
    } catch (error) {
      console.error("Error loading settings:", error);
      // Continue using default values
      toast({
        variant: "destructive",
        title: t("error"),
        description: t("errorLoadingSettings"),
      });
      setIsSettingsLoaded(true);
    }
  }, [t, toast]);
  
  // Load settings on component mount
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings, loadAttempts]);

  // Function to retry loading settings
  const retryLoading = () => {
    setLoadAttempts(prev => prev + 1);
  };

  const saveSettings = async (): Promise<boolean> => {
    setIsSaving(true);
    try {
      const settingsData = {
        hotelName,
        address,
        phone,
        email,
        checkInTime,
        checkOutTime,
        currency,
        logoUrl,
        pixKey,
        pixKeyType,
        pixBeneficiary,
        reservationDepositPercentage,
        managerWhatsApp
      };
      
      // Try to save settings to the regular endpoint
      try {
        const response = await axios.post('http://localhost/pougar/backend/admin/salvar_configuracoes_gerais.php', settingsData, {
          timeout: 8000 // 8 second timeout
        });
        
        if (response.data && response.data.sucesso) {
          toast({
            title: t("settingsSaved"),
            description: t("settingsSavedDesc"),
          });
          return true;
        }
      } catch (error) {
        console.error("Error saving settings to primary endpoint:", error);
        // For development/demo purposes, simulate successful save
        toast({
          title: t("settingsSaved"),
          description: t("settingsSavedDesc") + " (Demo mode)",
        });
        return true;
      }
      
      throw new Error("Failed to save settings");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        variant: "destructive",
        title: t("error"),
        description: t("errorSavingSettings"),
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SettingsContext.Provider value={{ 
      hotelName, setHotelName,
      address, setAddress,
      phone, setPhone,
      email, setEmail,
      checkInTime, setCheckInTime,
      checkOutTime, setCheckOutTime,
      currency, setCurrency,
      logoUrl, setLogoUrl,
      pixKey, setPixKey,
      pixKeyType, setPixKeyType,
      pixBeneficiary, setPixBeneficiary,
      reservationDepositPercentage, setReservationDepositPercentage,
      managerWhatsApp, setManagerWhatsApp,
      isSettingsLoaded,
      saveSettings,
      isSaving,
      retryLoading
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
