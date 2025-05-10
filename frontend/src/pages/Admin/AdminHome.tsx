
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Users, ArrowRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import ScrollReveal from "@/components/ui/ScrollReveal";
import axios from "axios";
import { useLanguage } from "@/context/LanguageContext";

const AdminHome = () => {
  const [stats, setStats] = useState({
    reservas: {
      total: 0,
      confirmadas: 0,
      pendentes: 0,
      canceladas: 0
    },
    quartos: {
      total: 0,
      disponiveis: 0,
      ocupados: 0,
      manutencao: 0
    },
    financeiro: {
      receita_total: 0
    },
    contatos: {
      nao_respondidos: 0
    }
  });
  const [recentReservations, setRecentReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t, language } = useLanguage();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/backend/admin/dashboard_stats.php');
        setStats(response.data);
        
        if (response.data.proximos_checkins && Array.isArray(response.data.proximos_checkins)) {
          setRecentReservations(response.data.proximos_checkins);
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  // Format date function
  const formatDate = (dateString) => {
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
  
  // Format currency based on language
  const formatCurrency = (value) => {
    if (!value) return language === "pt" ? "R$ 0,00" : "$0.00";
    
    if (language === "pt") {
      return `R$ ${Number(value).toFixed(2).replace('.', ',')}`;
    }
    
    return `$${Number(value).toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-serif font-bold">{t("dashboardOverview")}</h1>
        <span className="text-gray-500">
          {new Date().toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ScrollReveal>
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">{t("reservations")}</p>
                  <h3 className="text-2xl font-bold mt-2">{stats.reservas?.total || 0}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {t("confirmedReservations")}: {stats.reservas?.confirmadas || 0}
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">{t("occupancyRate")}</p>
                  <h3 className="text-2xl font-bold mt-2">
                    {stats.quartos?.total ? 
                      Math.round((stats.quartos.ocupados / stats.quartos.total) * 100) : 0}%
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {t("availableRooms")}: {stats.quartos?.disponiveis || 0}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">{t("revenue")}</p>
                  <h3 className="text-2xl font-bold mt-2">{formatCurrency(stats.financeiro?.receita_total)}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {t("totalRevenue")}
                  </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <span className="text-purple-600 text-lg font-bold">{language === 'pt' ? 'R$' : '$'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        <ScrollReveal delay={300}>
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">{t("pendingContacts")}</p>
                  <h3 className="text-2xl font-bold mt-2">{stats.contatos?.nao_respondidos || 0}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {t("waitingResponse")}
                  </p>
                </div>
                <div className="bg-amber-100 p-3 rounded-full">
                  <Users className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>
      </div>

      <ScrollReveal delay={400}>
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium">{t("upcomingCheckIns")}</h2>
              <Link 
                to="/admin/reservations"
                className="text-hotel-gold hover:text-hotel-gold/80 text-sm flex items-center"
              >
                {t("viewAll")} <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              {Array.isArray(recentReservations) && recentReservations.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("code")}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("guest")}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("room")}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("checkIn")}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("checkOut")}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("status")}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("amount")}</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentReservations.map((reservation) => (
                      <tr key={reservation.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {reservation.codigo}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-800">
                          {reservation.hospede_nome}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-800">
                          {reservation.quarto_nome}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-800">
                          {formatDate(reservation.data_checkin)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-800">
                          {formatDate(reservation.data_checkout)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
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
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(reservation.valor_total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500">{t("noUpcomingCheckIns")}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </ScrollReveal>
    </div>
  );
};

export default AdminHome;
