
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !password) {
      toast({
        title: "Error",
        description: t("loginFieldsRequired"),
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    // Simulating API call with a setTimeout
    setTimeout(() => {
      // For demo purposes, accept any login credentials
      // In a real app, this would validate against a backend
      setIsLoading(false);
      
      toast({
        title: t("loginSuccess"),
        description: t("welcomeAdmin"),
      });
      
      navigate("/admin");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-4">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl font-bold mb-2">
            Pousada<span className="text-hotel-gold">Viva</span>
          </h1>
          <p className="text-gray-600">{t("adminDashboard")}</p>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-medium mb-6 text-center">{t("signIn")}</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                    {t("email")}
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@pousadaviva.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
                    {t("password")}
                  </label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember_me"
                      type="checkbox"
                      className="h-4 w-4 text-hotel-gold focus:ring-hotel-gold border-gray-300 rounded"
                    />
                    <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-700">
                      {t("rememberMe")}
                    </label>
                  </div>
                  
                  <div className="text-sm">
                    <a href="#" className="text-hotel-gold hover:text-hotel-gold/80">
                      {t("forgotPassword")}
                    </a>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full bg-hotel-gold hover:bg-hotel-gold/80 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? t("signingIn") : t("signIn")}
                  </Button>
                </div>
              </div>
            </form>
            
            <div className="mt-8 text-center text-sm text-gray-500">
              <p>{t("demoNote")}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;
