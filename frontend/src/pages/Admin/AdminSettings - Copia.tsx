import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { useSettings } from "@/context/SettingsContext";
import { useLanguage } from "@/context/LanguageContext";

// Initial settings state
const initialSettings = {
  generalSettings: {
    hotelName: "",
    address: "",
    phoneNumber: "",
    emailAddress: "",
    checkInTime: "",
    checkOutTime: "",
    currency: ""
  },
  notificationSettings: {
    enableEmailNotifications: false,
    enableWhatsAppNotifications: false,
    sendBookingConfirmation: false,
    sendCheckInReminders: false,
    notifyAdminNewBookings: false,
    notifyAdminCancellations: false,
    emailTemplate: "",
    whatsAppTemplate: ""
  },
  apiSettings: {
    emailApiKey: "",
    whatsAppApiKey: "",
    whatsAppBusinessPhone: "",
    whatsAppBusinessID: ""
  },
  emailSettings: {
    smtpServer: "",
    smtpPort: "",
    smtpUsername: "",
    smtpPassword: "",
    emailSender: "",
    emailReplyTo: "",
    useSSL: false,
    useAuthentication: false
  }
};

const AdminSettings = () => {
  const [settings, setSettings] = useState(initialSettings);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const { toast } = useToast();
  const { setHotelName } = useSettings();
  const { t } = useLanguage();

  // Fetch settings on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('http://localhost/pougar/backend/admin/obter_configuracoes.php');
        
        if (response.data.sucesso && response.data.configuracoes) {
          setSettings(response.data.configuracoes);

          toast({
            title: t("settingsLoaded"),
            description: t("settingsLoadedFromServer"),
          });
        }
      } catch (error) {
        console.error("Error loading settings:", error);
        
        toast({
          variant: "destructive",
          title: t("errorLoadingSettings"),
          description: t("connectionError"),
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSettings();
  }, [toast, t]);

  // Handle general settings changes
  const handleGeneralSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      generalSettings: {
        ...prev.generalSettings,
        [name]: value
      }
    }));
  };

  // Handle notification settings changes
  const handleNotificationSettingsChange = (name: string, value: boolean | string) => {
    setSettings(prev => ({
      ...prev,
      notificationSettings: {
        ...prev.notificationSettings,
        [name]: value
      }
    }));
  };

  // Handle API settings changes
  const handleApiSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      apiSettings: {
        ...prev.apiSettings,
        [name]: value
      }
    }));
  };

  // Handle email settings changes
  const handleEmailSettingsChange = (name: string, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      emailSettings: {
        ...prev.emailSettings,
        [name]: value
      }
    }));
  };

  // Save general settings
  const saveGeneralSettings = async () => {
    try {
      setIsSaving(true);
      const response = await axios.post('http://localhost/pougar/backend/admin/salvar_configuracoes.php', {
        type: 'general',
        settings: settings.generalSettings
      });
      
      if (response.data.sucesso) {
        toast({
          title: t("settingsSaved"),
          description: t("generalSettingsUpdated"),
        });
        
        // Update global context with new hotel name
        setHotelName(settings.generalSettings.hotelName);
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      
      toast({
        variant: "destructive",
        title: t("errorSavingSettings"),
        description: t("errorOccurred"),
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Save notification settings
  const saveNotificationSettings = async () => {
    try {
      setIsSaving(true);
      const response = await axios.post('http://localhost/pougar/backend/admin/salvar_configuracoes.php', {
        type: 'notification',
        settings: settings.notificationSettings
      });
      
      if (response.data.sucesso) {
        toast({
          title: t("settingsSaved"),
          description: t("notificationSettingsUpdated"),
        });
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      
      toast({
        variant: "destructive",
        title: t("errorSavingSettings"),
        description: t("errorOccurred"),
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Save API settings
  const saveApiSettings = async () => {
    try {
      setIsSaving(true);
      const response = await axios.post('http://localhost/pougar/backend/admin/salvar_configuracoes.php', {
        type: 'api',
        settings: settings.apiSettings
      });
      
      if (response.data.sucesso) {
        toast({
          title: t("settingsSaved"),
          description: t("apiKeysUpdated"),
        });
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      
      toast({
        variant: "destructive",
        title: t("errorSavingSettings"),
        description: t("errorOccurred"),
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Save email settings
  const saveEmailSettings = async () => {
    try {
      setIsSaving(true);
      const response = await axios.post('http://localhost/pougar/backend/admin/salvar_configuracoes.php', {
        type: 'email',
        settings: settings.emailSettings
      });
      
      if (response.data.sucesso) {
        toast({
          title: t("emailSettingsSaved"),
          description: t("emailConfigurationUpdated"),
        });
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      
      toast({
        variant: "destructive",
        title: t("errorSavingSettings"),
        description: t("errorOccurred"),
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Send test WhatsApp message
  const sendTestWhatsApp = async () => {
    try {
      setIsTesting(true);
      const response = await axios.post('http://localhost/pougar/backend/admin/testar_whatsapp.php');
      
      if (response.data.sucesso) {
        toast({
          title: t("testMessageSent"),
          description: t("whatsAppTestSent"),
        });
      } else {
        toast({
          variant: "destructive",
          title: t("testFailed"),
          description: response.data.erro || t("errorOccurred"),
        });
      }
    } catch (error) {
      console.error("Error testing WhatsApp:", error);
      
      toast({
        variant: "destructive",
        title: t("testFailed"),
        description: t("errorOccurred"),
      });
    } finally {
      setIsTesting(false);
    }
  };

  // Send test email
  const sendTestEmail = async () => {
    try {
      setIsTesting(true);
      const response = await axios.post('http://localhost/pougar/backend/admin/testar_email.php');
      
      if (response.data.sucesso) {
        toast({
          title: t("testEmailSent"),
          description: t("emailTestSent"),
        });
      } else {
        toast({
          variant: "destructive",
          title: t("testFailed"),
          description: response.data.erro || t("errorOccurred"),
        });
      }
    } catch (error) {
      console.error("Error testing email:", error);
      
      toast({
        variant: "destructive",
        title: t("testFailed"),
        description: t("errorOccurred"),
      });
    } finally {
      setIsTesting(false);
    }
  };

  // Values with fallbacks to prevent uncontrolled inputs
  const generalSettings = settings.generalSettings || initialSettings.generalSettings;
  const notificationSettings = settings.notificationSettings || initialSettings.notificationSettings;
  const apiSettings = settings.apiSettings || initialSettings.apiSettings;
  const emailSettings = settings.emailSettings || initialSettings.emailSettings;

  return (
    <ScrollReveal>
      <div>
        <h1 className="text-3xl font-bold mb-6">{t("systemSettings")}</h1>
        
        <Tabs defaultValue="general" className="space-y-4">
          <TabsList>
            <TabsTrigger value="general">{t("generalSettings")}</TabsTrigger>
            <TabsTrigger value="notification">{t("notificationSettings")}</TabsTrigger>
            <TabsTrigger value="api">{t("apiSettings")}</TabsTrigger>
            <TabsTrigger value="email">{t("emailSettings")}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>{t("generalSettings")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="hotelName">{t("hotelName")}</Label>
                  <Input
                    id="hotelName"
                    name="hotelName"
                    value={generalSettings.hotelName || ""}
                    onChange={handleGeneralSettingsChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">{t("address")}</Label>
                  <Input
                    id="address"
                    name="address"
                    value={generalSettings.address || ""}
                    onChange={handleGeneralSettingsChange}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">{t("phoneNumber")}</Label>
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      value={generalSettings.phoneNumber || ""}
                      onChange={handleGeneralSettingsChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emailAddress">{t("emailAddress")}</Label>
                    <Input
                      id="emailAddress"
                      name="emailAddress"
                      value={generalSettings.emailAddress || ""}
                      onChange={handleGeneralSettingsChange}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="checkInTime">{t("checkInTime")}</Label>
                    <Input
                      id="checkInTime"
                      name="checkInTime"
                      value={generalSettings.checkInTime || ""}
                      onChange={handleGeneralSettingsChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="checkOutTime">{t("checkOutTime")}</Label>
                    <Input
                      id="checkOutTime"
                      name="checkOutTime"
                      value={generalSettings.checkOutTime || ""}
                      onChange={handleGeneralSettingsChange}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="currency">{t("currency")}</Label>
                  <Input
                    id="currency"
                    name="currency"
                    value={generalSettings.currency || ""}
                    onChange={handleGeneralSettingsChange}
                  />
                </div>
                
                <Button 
                  onClick={saveGeneralSettings} 
                  disabled={isLoading || isSaving}
                  className="w-full"
                >
                  {isSaving ? t("saving") : t("saveGeneralSettings")}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notification">
            <Card>
              <CardHeader>
                <CardTitle>{t("notificationSettings")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enableEmailNotifications"
                      checked={notificationSettings.enableEmailNotifications || false}
                      onCheckedChange={(checked) => 
                        handleNotificationSettingsChange("enableEmailNotifications", checked)
                      }
                    />
                    <Label htmlFor="enableEmailNotifications">{t("enableEmailNotifications")}</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enableWhatsAppNotifications"
                      checked={notificationSettings.enableWhatsAppNotifications || false}
                      onCheckedChange={(checked) => 
                        handleNotificationSettingsChange("enableWhatsAppNotifications", checked)
                      }
                    />
                    <Label htmlFor="enableWhatsAppNotifications">{t("enableWhatsAppNotifications")}</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="sendBookingConfirmation"
                      checked={notificationSettings.sendBookingConfirmation || false}
                      onCheckedChange={(checked) => 
                        handleNotificationSettingsChange("sendBookingConfirmation", checked)
                      }
                    />
                    <Label htmlFor="sendBookingConfirmation">{t("sendBookingConfirmation")}</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="sendCheckInReminders"
                      checked={notificationSettings.sendCheckInReminders || false}
                      onCheckedChange={(checked) => 
                        handleNotificationSettingsChange("sendCheckInReminders", checked)
                      }
                    />
                    <Label htmlFor="sendCheckInReminders">{t("sendCheckInReminders")}</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="notifyAdminNewBookings"
                      checked={notificationSettings.notifyAdminNewBookings || false}
                      onCheckedChange={(checked) => 
                        handleNotificationSettingsChange("notifyAdminNewBookings", checked)
                      }
                    />
                    <Label htmlFor="notifyAdminNewBookings">{t("notifyAdminNewBookings")}</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="notifyAdminCancellations"
                      checked={notificationSettings.notifyAdminCancellations || false}
                      onCheckedChange={(checked) => 
                        handleNotificationSettingsChange("notifyAdminCancellations", checked)
                      }
                    />
                    <Label htmlFor="notifyAdminCancellations">{t("notifyAdminCancellations")}</Label>
                  </div>
                </div>
                
                <div className="space-y-2 pt-4">
                  <Label htmlFor="emailTemplate">{t("emailTemplate")}</Label>
                  <Textarea
                    id="emailTemplate"
                    value={notificationSettings.emailTemplate || ""}
                    onChange={(e) => handleNotificationSettingsChange("emailTemplate", e.target.value)}
                    rows={5}
                  />
                  <p className="text-sm text-gray-500">{t("availableVariables")}: {"{guest_name}"}, {"{check_in_date}"}, {"{check_out_date}"}, {"{room_name}"}, {"{hotel_name}"}</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="whatsAppTemplate">{t("whatsAppTemplate")}</Label>
                  <Textarea
                    id="whatsAppTemplate"
                    value={notificationSettings.whatsAppTemplate || ""}
                    onChange={(e) => handleNotificationSettingsChange("whatsAppTemplate", e.target.value)}
                    rows={5}
                  />
                  <p className="text-sm text-gray-500">{t("availableVariables")}: {"{guest_name}"}, {"{check_in_date}"}, {"{check_out_date}"}, {"{room_name}"}, {"{hotel_name}"}</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    onClick={sendTestWhatsApp} 
                    variant="outline" 
                    disabled={isLoading || isTesting}
                    className="flex-1"
                  >
                    {isTesting ? t("sending") : t("sendTestWhatsApp")}
                  </Button>
                  
                  <Button 
                    onClick={saveNotificationSettings} 
                    disabled={isLoading || isSaving}
                    className="flex-1"
                  >
                    {isSaving ? t("saving") : t("saveNotificationSettings")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="api">
            <Card>
              <CardHeader>
                <CardTitle>{t("apiSettings")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="emailApiKey">{t("emailApiKey")}</Label>
                  <Input
                    id="emailApiKey"
                    name="emailApiKey"
                    value={apiSettings.emailApiKey || ""}
                    onChange={handleApiSettingsChange}
                    type="password"
                  />
                  <p className="text-sm text-gray-500">{t("emailApiDescription")}</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="whatsAppApiKey">{t("whatsAppApiKey")}</Label>
                  <Input
                    id="whatsAppApiKey"
                    name="whatsAppApiKey"
                    value={apiSettings.whatsAppApiKey || ""}
                    onChange={handleApiSettingsChange}
                    type="password"
                  />
                  <p className="text-sm text-gray-500">{t("whatsAppApiDescription")}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="whatsAppBusinessPhone">{t("whatsAppBusinessPhone")}</Label>
                    <Input
                      id="whatsAppBusinessPhone"
                      name="whatsAppBusinessPhone"
                      value={apiSettings.whatsAppBusinessPhone || ""}
                      onChange={handleApiSettingsChange}
                    />
                    <p className="text-sm text-gray-500">{t("whatsAppPhoneDescription")}</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsAppBusinessID">{t("whatsAppBusinessID")}</Label>
                    <Input
                      id="whatsAppBusinessID"
                      name="whatsAppBusinessID"
                      value={apiSettings.whatsAppBusinessID || ""}
                      onChange={handleApiSettingsChange}
                    />
                    <p className="text-sm text-gray-500">{t("whatsAppIDDescription")}</p>
                  </div>
                </div>
                
                <Button 
                  onClick={saveApiSettings} 
                  disabled={isLoading || isSaving}
                  className="w-full"
                >
                  {isSaving ? t("saving") : t("saveApiSettings")}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="email">
            <Card>
              <CardHeader>
                <CardTitle>{t("emailSettings")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtpServer">{t("smtpServer")}</Label>
                    <Input
                      id="smtpServer"
                      value={emailSettings.smtpServer || ""}
                      onChange={(e) => handleEmailSettingsChange("smtpServer", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpPort">{t("smtpPort")}</Label>
                    <Input
                      id="smtpPort"
                      value={emailSettings.smtpPort || ""}
                      onChange={(e) => handleEmailSettingsChange("smtpPort", e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtpUsername">{t("smtpUsername")}</Label>
                    <Input
                      id="smtpUsername"
                      value={emailSettings.smtpUsername || ""}
                      onChange={(e) => handleEmailSettingsChange("smtpUsername", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpPassword">{t("smtpPassword")}</Label>
                    <Input
                      id="smtpPassword"
                      type="password"
                      value={emailSettings.smtpPassword || ""}
                      onChange={(e) => handleEmailSettingsChange("smtpPassword", e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emailSender">{t("emailSender")}</Label>
                    <Input
                      id="emailSender"
                      value={emailSettings.emailSender || ""}
                      onChange={(e) => handleEmailSettingsChange("emailSender", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emailReplyTo">{t("emailReplyTo")}</Label>
                    <Input
                      id="emailReplyTo"
                      value={emailSettings.emailReplyTo || ""}
                      onChange={(e) => handleEmailSettingsChange("emailReplyTo", e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="flex space-x-6">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="useSSL"
                      checked={emailSettings.useSSL || false}
                      onCheckedChange={(checked) => 
                        handleEmailSettingsChange("useSSL", checked)
                      }
                    />
                    <Label htmlFor="useSSL">{t("useSSL")}</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="useAuthentication"
                      checked={emailSettings.useAuthentication || false}
                      onCheckedChange={(checked) => 
                        handleEmailSettingsChange("useAuthentication", checked)
                      }
                    />
                    <Label htmlFor="useAuthentication">{t("useAuthentication")}</Label>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 pt-4">
                  <Button 
                    onClick={sendTestEmail} 
                    variant="outline" 
                    disabled={isLoading || isTesting}
                    className="flex-1"
                  >
                    {isTesting ? t("sending") : t("sendTestEmail")}
                  </Button>
                  
                  <Button 
                    onClick={saveEmailSettings} 
                    disabled={isLoading || isSaving}
                    className="flex-1"
                  >
                    {isSaving ? t("saving") : t("saveEmailSettings")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ScrollReveal>
  );
};

export default AdminSettings;
