
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";
import axios from "axios";

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !message) {
      toast({
        variant: "destructive",
        title: t("error"),
        description: t("fillRequiredFields"),
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await axios.post("/backend/enviar_contato.php", {
        name,
        email,
        phone,
        subject,
        message
      });
      
      if (response.data && response.data.sucesso) {
        toast({
          title: t("toast.contact.success"),
          description: t("toast.contact.successDesc"),
        });
        
        // Reset form
        setName("");
        setEmail("");
        setPhone("");
        setSubject("");
        setMessage("");
      } else {
        throw new Error(response.data.erro || t("toast.contact.errorDesc"));
      }
    } catch (error) {
      console.error("Error sending contact:", error);
      toast({
        variant: "destructive",
        title: t("toast.contact.error"),
        description: t("toast.contact.errorDesc"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-serif font-bold mb-4">{t("contact.title")}</h1>
        <p className="text-gray-600">{t("contact.subtitle")}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="md:col-span-2">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">{t("contact.form.name")}*</Label>
                  <Input 
                    id="name" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="email">{t("contact.form.email")}*</Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="phone">{t("contact.form.phone")}</Label>
                  <Input 
                    id="phone" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="subject">{t("contact.form.subject")}</Label>
                  <Input 
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)} 
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="message">{t("contact.form.message")}*</Label>
                <Textarea 
                  id="message" 
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required 
                />
              </div>
              <Button 
                type="submit" 
                className="bg-hotel-gold hover:bg-hotel-gold/90 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("processing")}
                  </>
                ) : (
                  t("contact.form.submit")
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-medium mb-4">{t("contact.info.title")}</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">{t("contact.info.address")}</h4>
                <p className="text-gray-600">
                  Av. Beira Mar, 1234<br />
                  Praia Grande, SC<br />
                  88058-100, Brasil
                </p>
              </div>
              <div>
                <h4 className="font-medium">{t("contact.info.phone")}</h4>
                <p className="text-gray-600">+55 (48) 3333-4444</p>
              </div>
              <div>
                <h4 className="font-medium">{t("contact.info.email")}</h4>
                <p className="text-gray-600">contato@pousadaviva.com</p>
              </div>
              <div>
                <h4 className="font-medium">{t("contact.info.hours")}</h4>
                <p className="text-gray-600">24/7 - {t("alwaysOpen")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mt-10">
        <CardContent className="p-0">
          <h3 className="sr-only">{t("contact.map.title")}</h3>
          <div className="w-full h-[400px] bg-gray-200">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3535.2288335942827!2d-48.63369248678857!3d-27.60217088282703!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9527391ed4403699%3A0x32279ee39f298f0d!2sAv.%20Beira%20Mar%20Norte%2C%20Florian%C3%B3polis%20-%20SC!5e0!3m2!1sen!2sbr!4v1620305267337!5m2!1sen!2sbr" 
              width="100%" 
              height="400" 
              style={{ border: 0 }} 
              allowFullScreen={false} 
              loading="lazy" 
              title="Google Maps"
            ></iframe>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Contact;
