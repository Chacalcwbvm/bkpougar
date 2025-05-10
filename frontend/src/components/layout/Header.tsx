
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import LanguageSelector from "./LanguageSelector";
import { useLanguage } from "@/context/LanguageContext";
import { useSettings } from "@/context/SettingsContext";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { t, language } = useLanguage();
  const { hotelName, logoUrl } = useSettings();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: t("home"), path: "/" },
    { name: t("nav.rooms"), path: "/rooms" },
    { name: t("nav.about"), path: "/about" },
    { name: t("nav.contact"), path: "/contact" }
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header 
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-md py-2" : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="flex items-center">
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt={hotelName} 
              className="h-10 mr-2"
            />
          ) : (
            <h1 className={`font-serif text-2xl font-bold ${isScrolled ? "text-hotel-navy" : "text-white"}`}>
              {hotelName.split("Pousada")[0]}<span className="text-hotel-gold">Viva</span>
            </h1>
          )}
        </Link>
        
        <nav className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <Link 
              key={item.name}
              to={item.path}
              className={`font-medium transition-colors duration-200 ${
                isScrolled 
                  ? (isActive(item.path) ? "text-hotel-gold" : "text-hotel-navy hover:text-hotel-gold") 
                  : (isActive(item.path) ? "text-hotel-gold" : "text-white hover:text-hotel-gold")
              }`}
            >
              {item.name}
            </Link>
          ))}
          <Button asChild className="bg-hotel-gold hover:bg-hotel-gold/80 text-white">
            <Link to="/booking">{t("bookNow")}</Link>
          </Button>
          <div className={`transition-colors duration-200 ${
            isScrolled ? "text-hotel-navy" : "text-white"
          }`}>
            <LanguageSelector />
          </div>
        </nav>
        
        <div className="md:hidden flex items-center gap-4">
          <div className={`transition-colors duration-200 ${
            isScrolled ? "text-hotel-navy" : "text-white"
          }`}>
            <LanguageSelector />
          </div>
          <button 
            className="text-hotel-gold"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div 
        className={`md:hidden absolute w-full bg-white shadow-lg transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="container mx-auto px-4 py-4">
          {navItems.map((item) => (
            <Link 
              key={item.name}
              to={item.path}
              className={`block py-3 font-medium ${
                isActive(item.path) ? "text-hotel-gold" : "text-hotel-navy hover:text-hotel-gold"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          <Button asChild className="w-full mt-4 bg-hotel-gold hover:bg-hotel-gold/80 text-white">
            <Link to="/booking" onClick={() => setIsMobileMenuOpen(false)}>{t("bookNow")}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
