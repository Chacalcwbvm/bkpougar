
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { QrCode } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import axios from 'axios';

interface PixQrCodeProps {
  pixKey: string;
  pixKeyType: string;
  pixBeneficiary: string;
  amount: number;
  description?: string;
}

const PixQrCode: React.FC<PixQrCodeProps> = ({ 
  pixKey, 
  pixKeyType, 
  pixBeneficiary, 
  amount,
  description 
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const generateQrCode = async () => {
    if (!pixKey || !pixBeneficiary || amount <= 0) {
      toast({
        variant: "destructive",
        title: t("missingInformation"),
        description: t("pixInfoRequired"),
      });
      return;
    }

    try {
      setIsGenerating(true);
      const response = await axios.post('/backend/admin/gerar_qrcode_pix.php', {
        chave: pixKey,
        tipoChave: pixKeyType,
        beneficiario: pixBeneficiary,
        valor: amount,
        descricao: description || `Reserva PousadaViva`
      });
      
      if (response.data.sucesso) {
        setQrCodeUrl(response.data.qrCodeUrl);
      } else {
        throw new Error(response.data.erro || t("unknownError"));
      }
    } catch (error) {
      console.error("Error generating QR code:", error);
      toast({
        variant: "destructive",
        title: t("generationFailed"),
        description: error instanceof Error ? error.message : t("errorOccurred"),
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  useEffect(() => {
    if (pixKey && pixBeneficiary && amount > 0) {
      generateQrCode();
    }
  }, []);

  return (
    <Card>
      <CardContent className="p-4 flex flex-col items-center space-y-4">
        {qrCodeUrl ? (
          <div className="flex flex-col items-center">
            <img 
              src={qrCodeUrl} 
              alt="PIX QR Code" 
              className="max-w-full h-auto"
            />
            <p className="text-sm text-center mt-2">
              {t("scanQrToPayReservation")}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Button 
              onClick={generateQrCode} 
              disabled={isGenerating || !pixKey || !pixBeneficiary || amount <= 0}
            >
              <QrCode className="mr-2 h-4 w-4" />
              {isGenerating ? t("generating") : t("generatePixQrCode")}
            </Button>
            {(!pixKey || !pixBeneficiary) && (
              <p className="text-xs text-red-500 mt-2">
                {t("pixSettingsIncomplete")}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PixQrCode;
