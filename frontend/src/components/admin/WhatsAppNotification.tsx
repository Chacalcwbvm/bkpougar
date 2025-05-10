
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useSettings } from "@/context/SettingsContext";
import axios from 'axios';

interface WhatsAppNotificationProps {
  reservationId?: number;
  recipientPhone?: string;
  defaultMessage?: string;
}

const WhatsAppNotification: React.FC<WhatsAppNotificationProps> = ({
  reservationId,
  recipientPhone = '',
  defaultMessage = ''
}) => {
  const [phone, setPhone] = useState(recipientPhone);
  const [message, setMessage] = useState(defaultMessage);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();
  const { managerWhatsApp } = useSettings();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phone) {
      toast({
        variant: "destructive",
        title: t("missingPhoneNumber"),
        description: t("enterPhoneNumber"),
      });
      return;
    }
    
    if (!message) {
      toast({
        variant: "destructive",
        title: t("missingMessage"),
        description: t("enterMessage"),
      });
      return;
    }
    
    try {
      setIsSending(true);
      
      const response = await axios.post('/backend/enviar_whatsapp.php', {
        telefone: phone,
        mensagem: message,
        id_reserva: reservationId,
        lang: "pt"  // Use Portuguese for WhatsApp messages
      });
      
      if (response.data.sucesso) {
        toast({
          title: t("messageSent"),
          description: t("whatsappSent"),
        });
        
        // Clear form if not using predefined recipient
        if (!recipientPhone) {
          setMessage('');
          setPhone('');
        }
      } else {
        throw new Error(response.data.erro || t("unknownError"));
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        variant: "destructive",
        title: t("sendingFailed"),
        description: error instanceof Error ? error.message : t("errorOccurred"),
      });
    } finally {
      setIsSending(false);
    }
  };
  
  const notifyManager = async () => {
    if (!managerWhatsApp) {
      toast({
        variant: "destructive",
        title: t("missingManagerWhatsApp"),
        description: t("setManagerWhatsAppInSettings"),
      });
      return;
    }
    
    setPhone(managerWhatsApp);
    setMessage(t("newReservationNotification"));
  };
  
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <MessageSquare className="h-5 w-5 mr-2" />
          {t("sendWhatsAppNotification")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              placeholder={t("phoneNumber")}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <p className="text-xs text-gray-500">{t("includeCountryCode")}</p>
          </div>
          
          <Textarea
            placeholder={t("message")}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
          />
          
          <div className="flex flex-col sm:flex-row gap-2">
            {managerWhatsApp && (
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1"
                onClick={notifyManager}
              >
                {t("notifyManager")}
              </Button>
            )}
            
            <Button 
              type="submit" 
              className="flex-1" 
              disabled={isSending}
            >
              {isSending ? t("sending") : t("sendMessage")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default WhatsAppNotification;
