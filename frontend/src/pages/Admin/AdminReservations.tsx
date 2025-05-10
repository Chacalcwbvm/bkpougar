import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { useLanguage } from "@/context/LanguageContext";
import ReservationFilters from "./components/reservations/ReservationFilters";
import ReservationTable from "./components/reservations/ReservationTable";
import ReservationDetailsModal from "./components/reservations/ReservationDetailsModal";
import { useReservations } from "@/hooks/useReservations";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminReservations = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const {
    reservations,
    loading,
    isSubmitting,
    fetchReservations,
    formatDate,
    handleStatusChange,
    handleNotify,
    handleDeleteReservation,
    handleClearAllReservations
  } = useReservations();

  // Forçar a atualização de reservas quando o componente é montado
  useEffect(() => {
    fetchReservations();
  }, []);

  // Ensure reservations is always an array before filtering
  const filteredReservations = Array.isArray(reservations) 
    ? reservations.filter(reservation => {
        const matchesSearch = searchTerm === "" || 
          (reservation.codigo && reservation.codigo.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (reservation.hospede_nome && reservation.hospede_nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (reservation.quarto_nome && reservation.quarto_nome.toLowerCase().includes(searchTerm.toLowerCase()));
          
        const matchesStatus = statusFilter === "All" || reservation.status === statusFilter;
        
        return matchesSearch && matchesStatus;
      })
    : [];

  const handleViewDetails = (reservation) => {
    setSelectedReservation(reservation);
    setIsModalOpen(true);
  };

  // Handler for status change in the modal that updates the selected reservation
  const handleModalStatusChange = (id, newStatus) => {
    const success = handleStatusChange(id, newStatus);
    if (success && selectedReservation && selectedReservation.id === id) {
      setSelectedReservation({ ...selectedReservation, status: newStatus });
    }
  };

  // Handler for delete in the modal that closes the modal if the reservation is deleted
  const handleModalDelete = (id) => {
    const success = handleDeleteReservation(id);
    if (success && selectedReservation && selectedReservation.id === id) {
      setIsModalOpen(false);
    }
  };

  const handleAddReservation = () => {
    navigate("/admin/reservations/new");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-serif font-bold">{t("reservations")}</h1>
        <Button onClick={handleAddReservation} className="bg-hotel-navy hover:bg-hotel-navy/90">
          <PlusCircle className="mr-2 h-4 w-4" />
          {t("addReservation")}
        </Button>
      </div>

      <ScrollReveal>
        <Card>
          <CardContent className="p-6">
            <ReservationFilters 
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              fetchReservations={fetchReservations}
              handleClearAllReservations={handleClearAllReservations}
              isSubmitting={isSubmitting}
            />

            <ReservationTable 
              reservations={reservations}
              filteredReservations={filteredReservations}
              loading={loading}
              formatDate={formatDate}
              handleViewDetails={handleViewDetails}
              handleNotify={handleNotify}
              handleDeleteReservation={handleDeleteReservation}
            />
          </CardContent>
        </Card>
      </ScrollReveal>

      <ReservationDetailsModal 
        isOpen={isModalOpen}
        reservation={selectedReservation}
        onClose={() => setIsModalOpen(false)}
        formatDate={formatDate}
        handleStatusChange={handleModalStatusChange}
        handleNotify={handleNotify}
        handleDeleteReservation={handleModalDelete}
      />
    </div>
  );
};

export default AdminReservations;
