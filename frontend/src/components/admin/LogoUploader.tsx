
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";
import axios from 'axios';
import { useLanguage } from "@/context/LanguageContext";

interface LogoUploaderProps {
  currentLogo: string;
  onLogoUploaded: (logoUrl: string) => void;
}

const LogoUploader: React.FC<LogoUploaderProps> = ({ currentLogo, onLogoUploaded }) => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp'];
    
    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      toast({
        variant: "destructive",
        title: t("invalidFileType"),
        description: t("pleaseSelectAnImage"),
      });
      return;
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: t("fileTooLarge"),
        description: t("maxFileSize"),
      });
      return;
    }
    
    // Upload file
    const formData = new FormData();
    formData.append('imagem', file);
    
    try {
      setIsUploading(true);
      const response = await axios.post('/backend/upload_image.php', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.sucesso) {
        toast({
          title: t("uploadSuccess"),
          description: t("logoUploaded"),
        });
        onLogoUploaded(response.data.url);
      } else {
        throw new Error(response.data.erro || t("unknownError"));
      }
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast({
        variant: "destructive",
        title: t("uploadFailed"),
        description: error instanceof Error ? error.message : t("errorOccurred"),
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <div className="flex flex-col space-y-4">
      {currentLogo && (
        <div className="p-4 border rounded-md flex justify-center">
          <img 
            src={currentLogo} 
            alt="Hotel Logo" 
            className="max-h-32 object-contain"
          />
        </div>
      )}
      
      <div className="flex items-center">
        <Button
          variant="outline"
          disabled={isUploading}
          className="relative"
        >
          <input
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileChange}
            accept="image/jpeg,image/png,image/gif,image/svg+xml,image/webp"
            disabled={isUploading}
          />
          <Upload className="mr-2 h-4 w-4" />
          {isUploading ? t("uploading") : t("uploadLogo")}
        </Button>
        {currentLogo && (
          <Button 
            variant="ghost" 
            onClick={() => onLogoUploaded('')}
            className="ml-2"
          >
            {t("removeLogo")}
          </Button>
        )}
      </div>
    </div>
  );
};

export default LogoUploader;
