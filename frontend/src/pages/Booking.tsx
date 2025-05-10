
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";
import { Loader2 } from "lucide-react";
import axios from "axios";
import { useSettings } from "@/context/SettingsContext";
import PixQrCode from "@/components/admin/PixQrCode";
import WhatsAppNotification from "@/components/admin/WhatsAppNotification";
import { Checkbox } from "@/components/ui/checkbox";
import AvailabilityCalendar from "@/components/rooms/AvailabilityCalendar";

interface Room {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  capacidade: number;
  imagem: string;
}

const Booking = () => {
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [numberOfGuests, setNumberOfGuests] = useState(1);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestDocument, setGuestDocument] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [reservationComplete, setReservationComplete] = useState(false);
  const [reservationCode, setReservationCode] = useState("");
  const [reservationTotal, setReservationTotal] = useState(0);
  const [depositAmount, setDepositAmount] = useState(0);
  const [whatsappUrl, setWhatsappUrl] = useState("");
  const [reservationError, setReservationError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatePix, setGeneratePix] = useState(true);
  const [pixQrCodeUrl, setPixQrCodeUrl] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const { pixKey, pixKeyType, pixBeneficiary, reservationDepositPercentage, currency } = useSettings();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roomId = params.get("roomId");
    const checkinParam = params.get("checkin");
    const checkoutParam = params.get("checkout");

    // Converter as datas de string para objetos Date se existirem
    const checkinDate = checkinParam ? new Date(checkinParam) : null;
    const checkoutDate = checkoutParam ? new Date(checkoutParam) : null;
    
    if (checkinDate && !isNaN(checkinDate.getTime())) {
      setCheckIn(checkinDate);
    }
    
    if (checkoutDate && !isNaN(checkoutDate.getTime())) {
      setCheckOut(checkoutDate);
    }

    const fetchRoomDetails = async (roomId: string | null) => {
      if (roomId) {
        try {
          const response = await axios.get(`/backend/detalhes_quarto.php?id=${roomId}`);
          setSelectedRoom(response.data);
        } catch (error) {
          console.error("Error fetching room details:", error);
          toast({
            variant: "destructive",
            title: t("error"),
            description: t("failedToLoadRoomDetails"),
          });
        }
      }
    };

    fetchRoomDetails(roomId);
  }, [location.search, toast, t]);

  // Calculate deposit amount when room is loaded or deposit percentage changes
  useEffect(() => {
    if (selectedRoom && selectedRoom.preco > 0) {
      const deposit = (selectedRoom.preco * reservationDepositPercentage) / 100;
      setDepositAmount(deposit);
    }
  }, [selectedRoom, reservationDepositPercentage]);

  const submitReservation = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!checkIn || !checkOut) {
      toast({
        variant: "destructive",
        title: t("error"),
        description: t("selectCheckInOutDates"),
      });
      return;
    }
    
    if (!guestName || !guestEmail || !guestPhone) {
      toast({
        variant: "destructive",
        title: t("error"),
        description: t("fillGuestDetails"),
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const reservationData = {
        id_quarto: Number(selectedRoom?.id),
        data_checkin: checkIn?.toISOString().split('T')[0],
        data_checkout: checkOut?.toISOString().split('T')[0],
        numero_hospedes: numberOfGuests,
        nome: guestName,
        email: guestEmail,
        telefone: guestPhone,
        documento: guestDocument,
        observacoes: specialRequests,
        lang: language,
        gerar_pix: generatePix,
        enviar_email: true
      };
      
      const response = await axios.post('/backend/criar_reserva.php', 
        reservationData,
        { 
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000
        }
      );
      
      if (response.data && response.data.sucesso) {
        setReservationComplete(true);
        setReservationCode(response.data.codigo);
        setReservationTotal(response.data.valor_total);
        setDepositAmount(response.data.valor_deposito || depositAmount);
        setWhatsappUrl(response.data.whatsapp_url);
        setEmailSent(response.data.email_enviado);
        
        // Se houver URL para o QR Code PIX
        if (response.data.pix_url) {
          setPixQrCodeUrl(response.data.pix_url);
        }
        
        toast({
          title: t("reservationSuccess"),
          description: t("reservationSuccessDesc").replace('{code}', response.data.codigo),
        });
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        throw new Error(response.data.erro || t("unknownError"));
      }
    } catch (error) {
      console.error("Error submitting reservation:", error);
      
      toast({
        variant: "destructive",
        title: t("reservationError"),
        description: error instanceof Error ? error.message : t("unknownError"),
      });
      
      setReservationError(error instanceof Error ? error.message : t("unknownError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDateSelect = (checkinDate: Date | null, checkoutDate: Date | null) => {
    setCheckIn(checkinDate);
    setCheckOut(checkoutDate);
  };

  return (
    <div className="container mx-auto py-12">
      {selectedRoom ? (
        <Card className="shadow-lg rounded-lg">
          <CardContent className="p-8">
            <h1 className="text-2xl font-semibold mb-4">{t("bookYourStay")}</h1>

            {reservationComplete ? (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-green-600 mb-4">{t("reservationConfirmed")}</h2>
                  <p className="text-gray-700 mb-2">
                    {t("reservationCode")}: <span className="font-medium">{reservationCode}</span>
                  </p>
                  <p className="text-gray-700 mb-2">
                    {t("totalAmount")}: <span className="font-medium">{currency} {reservationTotal}</span>
                  </p>
                  <p className="text-gray-700 mb-4">
                    {t("detailsSentToWhatsapp")}
                  </p>
                  <Button asChild className="mb-6">
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                      {t("viewOnWhatsApp")}
                    </a>
                  </Button>
                  
                  {emailSent && (
                    <div className="mt-2 text-sm text-green-600">
                      {t("emailConfirmationSent")}
                    </div>
                  )}
                </div>

                {/* PIX Payment Section */}
                {generatePix && (pixQrCodeUrl || (pixKey && pixBeneficiary)) && (
                  <div className="border-t border-gray-200 pt-6 pb-3">
                    <h3 className="text-lg font-medium text-center mb-4">
                      {t("makeReservationDeposit")} ({reservationDepositPercentage}%)
                    </h3>
                    <p className="text-center text-sm text-gray-600 mb-4">
                      {t("scanQrCodeToPayDeposit")} {currency} {depositAmount.toFixed(2)}
                    </p>
                    <div className="flex justify-center">
                      {pixQrCodeUrl ? (
                        <div className="text-center">
                          <img 
                            src={pixQrCodeUrl} 
                            alt="PIX QR Code" 
                            className="max-w-full h-auto max-h-64 mx-auto"
                          />
                          <p className="text-sm mt-2">{t("scanQrToPayReservation")}</p>
                        </div>
                      ) : (
                        <PixQrCode 
                          pixKey={pixKey} 
                          pixKeyType={pixKeyType} 
                          pixBeneficiary={pixBeneficiary} 
                          amount={depositAmount}
                          description={`Reserva ${reservationCode}`} 
                        />
                      )}
                    </div>
                  </div>
                )}
                
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-center mb-4">
                    {t("haveQuestions")}
                  </h3>
                  <WhatsAppNotification 
                    defaultMessage={t("reservationQuestion").replace('{code}', reservationCode)} 
                  />
                </div>
              </div>
            ) : (
              <form onSubmit={submitReservation} className="space-y-6">
                <div className="mb-6">
                  <Label>{t("selectDates")}</Label>
                  <div className="mt-2">
                    <AvailabilityCalendar 
                      roomId={selectedRoom.id}
                      onDateSelect={handleDateSelect}
                      initialCheckIn={checkIn}
                      initialCheckOut={checkOut}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="guests">{t("numberOfGuests")}</Label>
                  <Input
                    type="number"
                    id="guests"
                    min="1"
                    max={selectedRoom.capacidade}
                    value={numberOfGuests}
                    onChange={(e) => setNumberOfGuests(parseInt(e.target.value))}
                  />
                </div>

                <div>
                  <Label htmlFor="name">{t("guestName")}</Label>
                  <Input
                    type="text"
                    id="name"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">{t("guestEmail")}</Label>
                  <Input
                    type="email"
                    id="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">{t("guestPhone")}</Label>
                  <Input
                    type="tel"
                    id="phone"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="document">{t("guestDocument")}</Label>
                  <Input
                    type="text"
                    id="document"
                    value={guestDocument}
                    onChange={(e) => setGuestDocument(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="requests">{t("specialRequests")}</Label>
                  <Textarea
                    id="requests"
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="generatePix" 
                    checked={generatePix} 
                    onCheckedChange={(checked) => setGeneratePix(Boolean(checked))} 
                  />
                  <Label htmlFor="generatePix" className="cursor-pointer">
                    {t("generatePixQrCode")}
                  </Label>
                </div>

                {reservationError && (
                  <div className="text-red-600">{reservationError}</div>
                )}

                <Button type="submit" className="bg-hotel-gold text-white hover:bg-hotel-gold/80" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("processing")}
                    </>
                  ) : (
                    t("submitReservation")
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="text-center">
          <p>{t("noRoomSelected")}</p>
          <Button onClick={() => navigate("/rooms")}>{t("goToRooms")}</Button>
        </div>
      )}
    </div>
  );
};

export default Booking;
