import { useState, useEffect } from "react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";

export const useReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { t, language } = useLanguage();

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost/pougar/backend/admin/listar_reservas.php?lang=${language}`);
      // Ensure we always set an array, even if the API returns null/undefined
      setReservations(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching reservations:", error);
      toast({
        variant: "destructive",
        title: t("error"),
        description: t("errorLoadingReservations"),
      });
      // Set empty array on error
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [language]);

  // Format date function
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    
    if (language === "pt") {
      return new Intl.DateTimeFormat('pt-BR', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric'
      }).format(date);
    }
    
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    setIsSubmitting(true);
    try {
      // Chama a API para atualizar o status
      const response = await axios.post('http://localhost/pougar/backend/admin/atualizar_reserva_status.php', {
        id: id,
        status: newStatus
      });
      
      if (response.data && response.data.sucesso) {
        // Atualiza o estado local após sucesso da API
        const updatedReservations = Array.isArray(reservations) 
          ? reservations.map(res => res.id === id ? { ...res, status: newStatus } : res)
          : [];
        
        setReservations(updatedReservations);
        
        toast({
          title: t("statusUpdated"),
          description: t("reservationStatusChanged").replace('{id}', id.toString()).replace('{status}', newStatus),
        });
        return true;
      } else {
        throw new Error(response.data.erro || t("unknownError"));
      }
    } catch (error) {
      console.error("Error changing status:", error);
      toast({
        variant: "destructive",
        title: t("error"),
        description: t("errorChangingStatus"),
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNotify = async (id: number, telefone: string) => {
    try {
      // Enviar notificação WhatsApp
      const response = await axios.post('http://localhost/pougar/backend/admin/enviar_confirmacao_whatsapp.php', {
        id_reserva: id,
        telefone: telefone,
        lang: language
      });

      if (response.data && response.data.sucesso) {
        toast({
          title: t("notificationSent"),
          description: t("whatsAppNotificationSent").replace('{telefone}', telefone),
        });
        
        // Atualiza o estado local para indicar que a notificação foi enviada
        const updatedReservations = Array.isArray(reservations) 
          ? reservations.map(res => res.id === id ? { ...res, whatsapp_enviado: true } : res)
          : [];
        
        setReservations(updatedReservations);
        return true;
      } else {
        throw new Error(response.data.erro || t("unknownError"));
      }
    } catch (error: any) {
      console.error("Error sending notification:", error);
      toast({
        variant: "destructive",
        title: t("error"),
        description: error.message || t("errorSendingNotification"),
      });
      return false;
    }
  };

  const handleDeleteReservation = async (id: number) => {
    if (window.confirm(t("confirmDeleteReservation"))) {
      setIsSubmitting(true);
      try {
        const response = await axios.post('http://localhost/pougar/backend/admin/excluir_reserva.php', { id });
        
        if (response.data && response.data.sucesso) {
          setReservations((prevReservations: any[]) => prevReservations.filter(res => res.id !== id));
          
          toast({
            title: t("reservationDeleted"),
            description: t("reservationDeletedSuccess"),
          });
          return true;
        } else {
          throw new Error(response.data.erro || t("unknownError"));
        }
      } catch (error: any) {
        console.error("Error deleting reservation:", error);
        toast({
          variant: "destructive",
          title: t("error"),
          description: error.message || t("errorDeletingReservation"),
        });
        return false;
      } finally {
        setIsSubmitting(false);
      }
    }
    return false;
  };

  const handleClearAllReservations = async () => {
    if (window.confirm(t("confirmClearAllReservations"))) {
      setIsSubmitting(true);
      try {
        const response = await axios.post('http://localhost/pougar/backend/admin/limpar_reservas.php');
        
        if (response.data && response.data.sucesso) {
          setReservations([]);
          
          toast({
            title: t("allReservationsDeleted"),
            description: t("allReservationsDeletedSuccess").replace('{count}', response.data.registros_afetados || '0'),
          });
          return true;
        } else {
          throw new Error(response.data.erro || t("unknownError"));
        }
      } catch (error: any) {
        console.error("Error clearing reservations:", error);
        toast({
          variant: "destructive",
          title: t("error"),
          description: error.message || t("errorClearingReservations"),
        });
        return false;
      } finally {
        setIsSubmitting(false);
      }
    }
    return false;
  };

  return {
    reservations,
    loading,
    isSubmitting,
    fetchReservations,
    formatDate,
    handleStatusChange,
    handleNotify,
    handleDeleteReservation,
    handleClearAllReservations,
  };
};
