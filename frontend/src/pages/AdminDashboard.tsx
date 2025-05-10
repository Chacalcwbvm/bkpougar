
import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { 
  Calendar, 
  Home, 
  Users, 
  Settings, 
  LogOut, 
  Menu,
  X,
  Bell,
  Bed,
  DollarSign,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLanguage } from "@/context/LanguageContext";
import { useSettings } from "@/context/SettingsContext";

const AdminDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [pageTitle, setPageTitle] = useState("");
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { hotelName } = useSettings();
  
  useEffect(() => {
    // Update document title
    document.title = `${t("adminDashboard")} - ${hotelName}`;
    
    // Close sidebar on route change if mobile
    if (isMobile) {
      setIsSidebarOpen(false);
    }

    // Set page title based on current route
    const path = location.pathname;
    
    if (path === "/admin") {
      setPageTitle(t("dashboard"));
    } else if (path.includes("/admin/reservations")) {
      setPageTitle(t("reservations"));
    } else if (path.includes("/admin/guests")) {
      setPageTitle(t("guests.title"));
    } else if (path.includes("/admin/rooms")) {
      setPageTitle(t("rooms.admin"));
    } else if (path.includes("/admin/finance")) {
      setPageTitle(t("finance"));
    } else if (path.includes("/admin/reports")) {
      setPageTitle(t("reports"));
    } else if (path.includes("/admin/settings")) {
      setPageTitle(t("settings"));
    }
    
  }, [location.pathname, isMobile, t, hotelName]);

  // Mock logout function
  const handleLogout = () => {
    // In a real app, this would clear authentication tokens, etc.
    toast({
      title: t("loggedOut"),
      description: t("logoutSuccess"),
    });
    setIsAuthenticated(false);
    setTimeout(() => navigate('/admin/login'), 500);
  };

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return null; // Return null while redirecting
  }

  const navItems = [
    { name: t("dashboard"), path: "/admin", icon: <Home className="h-5 w-5 mr-3" /> },
    { name: t("reservations"), path: "/admin/reservations", icon: <Calendar className="h-5 w-5 mr-3" /> },
    { name: t("guests.title"), path: "/admin/guests", icon: <Users className="h-5 w-5 mr-3" /> },
    { name: t("rooms.admin"), path: "/admin/rooms", icon: <Bed className="h-5 w-5 mr-3" /> },
    { name: t("finance"), path: "/admin/finance", icon: <DollarSign className="h-5 w-5 mr-3" /> },
    { name: t("reports"), path: "/admin/reports", icon: <FileText className="h-5 w-5 mr-3" /> },
    { name: t("settings"), path: "/admin/settings", icon: <Settings className="h-5 w-5 mr-3" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-100">
      {/* Mobile Sidebar Toggle */}
      <div className="md:hidden flex items-center justify-between bg-hotel-navy text-white p-4">
        <div className="flex items-center">
          <span className="font-serif text-xl font-bold">
            {hotelName} <span className="text-hotel-gold">{t("adminDashboard")}</span>
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="text-white hover:bg-hotel-navy/80"
        >
          {isSidebarOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside 
        className={`
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} 
          fixed md:static top-0 left-0 z-40 h-full md:h-screen w-64 
          transition-transform duration-300 ease-in-out
          bg-hotel-navy text-white
        `}
      >
        <div className="p-6 flex items-center justify-center border-b border-gray-700">
          <Link to="/" className="font-serif text-xl font-bold">
            {hotelName} <span className="text-hotel-gold">{t("adminDashboard")}</span>
          </Link>
        </div>

        <nav className="mt-6 px-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className={`
                    flex items-center px-4 py-3 rounded-lg transition-colors
                    ${location.pathname === item.path 
                      ? 'bg-white/10 text-hotel-gold' 
                      : 'hover:bg-white/5'}
                  `}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-10 pt-6 border-t border-gray-700">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start text-white hover:bg-white/10"
            >
              <LogOut className="h-5 w-5 mr-3" />
              {t("logout")}
            </Button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="hidden md:flex bg-white shadow-sm p-4 justify-between items-center">
          <h2 className="font-serif text-xl font-bold">{pageTitle}</h2>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <Bell />
            </Button>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="font-semibold text-gray-600">A</span>
              </div>
              <span className="ml-3 font-medium">Admin User</span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
