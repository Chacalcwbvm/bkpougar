import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useSettings } from "@/context/SettingsContext";
import { useLanguage } from "@/context/LanguageContext";
import ImageUploader from "@/components/admin/ImageUploader";
import { Loader2, RefreshCw } from "lucide-react";

const AdminSettings = () => {
  const { 
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
    saveSettings,
    isSaving,
    isSettingsLoaded,
    retryLoading
  } = useSettings();
  
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveSettings();
  };

  // If settings failed to load, show a retry button
  if (!isSettingsLoaded) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="w-10 h-10 animate-spin text-hotel-navy mb-4" />
        <p className="text-lg mb-4">{t("loadingSettings")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-serif font-bold">{t("settings")}</h1>
          <div className="flex gap-2">
            <Button 
              type="button"
              variant="outline"
              onClick={retryLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              {t("refresh")}
            </Button>
            <Button 
              type="submit" 
              disabled={isSaving} 
              className="bg-hotel-navy hover:bg-hotel-navy/90"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("savingSettings")}
                </>
              ) : (
                t("saveSettings")
              )}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList>
            <TabsTrigger value="general">{t("generalSettings")}</TabsTrigger>
            <TabsTrigger value="reservations">{t("reservationSettings")}</TabsTrigger>
            <TabsTrigger value="appearance">{t("appearanceSettings")}</TabsTrigger>
            <TabsTrigger value="notifications">{t("notificationSettings")}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-6 pt-4">
            <Card>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="hotelName">{t("hotelName")}</Label>
                    <Input 
                      id="hotelName" 
                      value={hotelName} 
                      onChange={(e) => setHotelName(e.target.value)} 
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">{t("email")}</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">{t("phone")}</Label>
                    <Input 
                      id="phone" 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)} 
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">{t("address")}</Label>
                    <Input 
                      id="address" 
                      value={address} 
                      onChange={(e) => setAddress(e.target.value)} 
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="currency">{t("currency")}</Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger id="currency" className="mt-1">
                        <SelectValue placeholder={t("selectCurrency")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="BRL">BRL (R$)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="managerWhatsApp">{t("managerWhatsApp")}</Label>
                    <Input 
                      id="managerWhatsApp" 
                      value={managerWhatsApp} 
                      placeholder="+551199999999" 
                      onChange={(e) => setManagerWhatsApp(e.target.value)} 
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="checkInTime">{t("checkInTime")}</Label>
                    <Input 
                      id="checkInTime" 
                      type="time" 
                      value={checkInTime} 
                      onChange={(e) => setCheckInTime(e.target.value)} 
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="checkOutTime">{t("checkOutTime")}</Label>
                    <Input 
                      id="checkOutTime" 
                      type="time" 
                      value={checkOutTime} 
                      onChange={(e) => setCheckOutTime(e.target.value)} 
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reservations" className="space-y-6 pt-4">
            <Card>
              <CardContent className="p-6 space-y-6">
                <h3 className="text-lg font-medium">{t("pixSettings")}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="pixKey">{t("pixKey")}</Label>
                    <Input 
                      id="pixKey" 
                      value={pixKey} 
                      onChange={(e) => setPixKey(e.target.value)} 
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="pixKeyType">{t("pixKeyType")}</Label>
                    <Select value={pixKeyType} onValueChange={setPixKeyType}>
                      <SelectTrigger id="pixKeyType" className="mt-1">
                        <SelectValue placeholder={t("selectPixKeyType")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CPF">CPF</SelectItem>
                        <SelectItem value="CNPJ">CNPJ</SelectItem>
                        <SelectItem value="EMAIL">E-mail</SelectItem>
                        <SelectItem value="TELEFONE">Telefone</SelectItem>
                        <SelectItem value="ALEATORIA">Chave Aleatória</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="pixBeneficiary">{t("pixBeneficiary")}</Label>
                    <Input 
                      id="pixBeneficiary" 
                      value={pixBeneficiary} 
                      onChange={(e) => setPixBeneficiary(e.target.value)} 
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="depositPercentage">{t("depositPercentage")}</Label>
                    <Input 
                      id="depositPercentage" 
                      type="number" 
                      min="0" 
                      max="100" 
                      value={reservationDepositPercentage} 
                      onChange={(e) => setReservationDepositPercentage(parseInt(e.target.value))} 
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="appearance" className="space-y-6 pt-4">
            <Card>
              <CardContent className="p-6 space-y-6">
                <div>
                  <Label htmlFor="logo">{t("logoImage")}</Label>
                  <div className="mt-2">
                    <ImageUploader 
                      onImageUploaded={setLogoUrl}
                      currentImage={logoUrl}
                    />
                  </div>
                </div>
                
                {/* Outras configurações de aparência podem ser adicionadas aqui */}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-6 pt-4">
            <Card>
              <CardContent className="p-6">
                <p>{t("notificationSettingsComingSoon")}</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isSaving} 
            className="bg-hotel-navy hover:bg-hotel-navy/90"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("savingSettings")}
              </>
            ) : (
              t("saveSettings")
            )}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default AdminSettings;
