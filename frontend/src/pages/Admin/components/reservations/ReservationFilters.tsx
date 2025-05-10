import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCw, Trash2, Loader2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface ReservationFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  fetchReservations: () => void;
  handleClearAllReservations: () => void;
  isSubmitting: boolean;
}

const ReservationFilters = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  fetchReservations,
  handleClearAllReservations,
  isSubmitting,
}: ReservationFiltersProps) => {
  const { t } = useLanguage();
  
  return (
    <div className="flex flex-col md:flex-row justify-between mb-6 space-y-4 md:space-y-0">
      <div className="w-full md:w-1/3">
        <Input
          placeholder={t("searchReservations")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-md px-4 py-2"
        >
          <option value="All">{t("allStatuses")}</option>
          <option value="confirmada">{t("confirmed")}</option>
          <option value="pendente">{t("pending")}</option>
          <option value="cancelada">{t("cancelled")}</option>
        </select>
        
        <div className="flex space-x-2">
          <Button 
            onClick={fetchReservations}
            variant="outline"
            className="flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {t("refresh")}
          </Button>
          
          <Button 
            onClick={handleClearAllReservations} 
            variant="destructive"
            disabled={isSubmitting}
            className="flex items-center"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            {t("clearAll")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReservationFilters;
