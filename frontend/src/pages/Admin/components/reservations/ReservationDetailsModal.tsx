
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";

interface ReservationDetailsModalProps {
  isOpen: boolean;
  reservation: any;
  onClose: () => void;
  formatDate: (dateString: string) => string;
  handleStatusChange: (id: number, status: string) => void;
  handleNotify: (id: number, telefone: string) => void;
  handleDeleteReservation: (id: number) => void;
}

const ReservationDetailsModal = ({
  isOpen,
  reservation,
  onClose,
  formatDate,
  handleStatusChange,
  handleNotify,
  handleDeleteReservation,
}: ReservationDetailsModalProps) => {
  const { t, language } = useLanguage();
  
  if (!isOpen || !reservation) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-medium">{t("reservationDetails")}</h2>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onClose}
            >
              ✕
            </Button>
          </div>
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold">{reservation.codigo}</span>
              <span className={`px-3 py-1 rounded-full text-sm ${
                reservation.status === 'confirmada' 
                  ? 'bg-green-100 text-green-800' 
                  : reservation.status === 'pendente'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {reservation.status === 'confirmada' 
                  ? t("confirmed") 
                  : reservation.status === 'pendente'
                  ? t("pending")
                  : t("cancelled")}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">{t("guestInformation")}</h3>
                <p className="font-medium">{reservation.hospede_nome}</p>
                <p>{reservation.hospede_email}</p>
                <p>{reservation.hospede_telefone}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">{t("reservationDetails")}</h3>
                <p><span className="font-medium">{t("room")}:</span> {reservation.quarto_nome}</p>
                <p>
                  <span className="font-medium">{t("dates")}:</span> {formatDate(reservation.data_checkin)} {t("to")} {formatDate(reservation.data_checkout)}
                </p>
                <p><span className="font-medium">{t("guests")}:</span> {reservation.numero_hospedes}</p>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-1">{t("paymentInformation")}</h3>
              <div className="flex justify-between py-2 border-b">
                <span>{t("totalAmount")}</span>
                <span className="font-medium">
                  {language === 'pt' 
                    ? `R$ ${Number(reservation.valor_total).toFixed(2).replace('.', ',')}`
                    : `$${Number(reservation.valor_total).toFixed(2)}`
                  }
                </span>
              </div>
            </div>
            
            {reservation.observacoes && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-1">{t("specialRequests")}</h3>
                <p className="bg-gray-50 p-3 rounded text-gray-700">{reservation.observacoes}</p>
              </div>
            )}
            
            <div className="mt-8 pt-4 border-t flex flex-wrap justify-between gap-2">
              <div className="space-x-2">
                <Button 
                  variant="outline" 
                  className={`${reservation.status === 'confirmada' ? 'bg-green-100' : ''}`}
                  onClick={() => handleStatusChange(reservation.id, 'confirmada')}
                >
                  {t("confirm")}
                </Button>
                <Button 
                  variant="outline" 
                  className={`${reservation.status === 'pendente' ? 'bg-yellow-100' : ''}`}
                  onClick={() => handleStatusChange(reservation.id, 'pendente')}
                >
                  {t("pending")}
                </Button>
                <Button 
                  variant="outline" 
                  className={`${reservation.status === 'cancelada' ? 'bg-red-100' : ''}`}
                  onClick={() => handleStatusChange(reservation.id, 'cancelada')}
                >
                  {t("cancel")}
                </Button>
              </div>
              <div className="flex space-x-2">
                <Button 
                  onClick={() => handleNotify(reservation.id, reservation.hospede_telefone)}
                  className="bg-hotel-gold hover:bg-hotel-gold/80 text-white"
                  disabled={reservation.whatsapp_enviado}
                >
                  {t("sendNotification")}
                </Button>
                <Button 
                  onClick={() => handleDeleteReservation(reservation.id)}
                  variant="destructive"
                >
                  {t("delete")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationDetailsModal;
