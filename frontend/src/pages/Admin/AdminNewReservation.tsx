
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import ReservationForm from "./components/reservations/ReservationForm";

const AdminNewReservation = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          onClick={() => navigate("/admin/reservations")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> {t("back")}
        </Button>
        <h1 className="text-2xl font-serif font-bold">{t("addReservation")}</h1>
      </div>

      <ReservationForm />
    </div>
  );
};

export default AdminNewReservation;
