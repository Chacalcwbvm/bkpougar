
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface ReservationTableProps {
  reservations: any[];
  filteredReservations: any[];
  loading: boolean;
  formatDate: (dateString: string) => string;
  handleViewDetails: (reservation: any) => void;
  handleNotify: (id: number, telefone: string) => void;
  handleDeleteReservation: (id: number) => void;
}

const ReservationTable = ({
  reservations,
  filteredReservations,
  loading,
  formatDate,
  handleViewDetails,
  handleNotify,
  handleDeleteReservation,
}: ReservationTableProps) => {
  const { t, language } = useLanguage();

  if (loading) {
    return (
      <div className="text-center py-10">
        <Loader2 className="h-8 w-8 mx-auto animate-spin text-gray-400" />
        <p className="mt-3 text-gray-500">{t("loading")}</p>
      </div>
    );
  }

  if (!Array.isArray(reservations) || filteredReservations.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">{t("noReservationsFound")}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("code")}</TableHead>
            <TableHead>{t("guest")}</TableHead>
            <TableHead>{t("room")}</TableHead>
            <TableHead>{t("checkIn")}</TableHead>
            <TableHead>{t("checkOut")}</TableHead>
            <TableHead>{t("status")}</TableHead>
            <TableHead>{t("amount")}</TableHead>
            <TableHead>{t("actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredReservations.map((reservation) => (
            <TableRow key={reservation.id} className="hover:bg-gray-50">
              <TableCell className="font-medium text-gray-900">
                {reservation.codigo}
              </TableCell>
              <TableCell className="text-gray-800">
                {reservation.hospede_nome}
              </TableCell>
              <TableCell className="text-gray-800">
                {reservation.quarto_nome}
              </TableCell>
              <TableCell className="text-gray-800">
                {formatDate(reservation.data_checkin)}
              </TableCell>
              <TableCell className="text-gray-800">
                {formatDate(reservation.data_checkout)}
              </TableCell>
              <TableCell>
                <span className={`px-2 py-1 text-xs rounded-full ${
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
              </TableCell>
              <TableCell className="font-medium text-gray-900">
                {language === 'pt' 
                  ? `R$ ${Number(reservation.valor_total).toFixed(2).replace('.', ',')}`
                  : `$${Number(reservation.valor_total).toFixed(2)}`
                }
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewDetails(reservation)}
                  >
                    {t("view")}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleNotify(reservation.id, reservation.hospede_telefone)}
                    disabled={reservation.whatsapp_enviado}
                  >
                    {t("notify")}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteReservation(reservation.id)}
                  >
                    {t("delete")}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ReservationTable;
