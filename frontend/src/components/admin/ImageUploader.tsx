import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";
import { Loader2, Upload, X } from "lucide-react";
import axios from "axios";

interface ImageUploaderProps {
  onImageUploaded: (imageUrl: string) => void;
  currentImage?: string;
  className?: string;
}

const ImageUploader = ({ onImageUploaded, currentImage, className = "" }: ImageUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        variant: "destructive",
        title: t("invalidFileType"),
        description: t("pleaseSelectValidImage"),
      });
      return;
    }

    // Validar tamanho (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({
        variant: "destructive",
        title: t("fileTooLarge"),
        description: t("imageMustBeLessThan5MB"),
      });
      return;
    }

    // Criar um preview da imagem
    const preview = URL.createObjectURL(file);
    setPreviewImage(preview);

    // Enviar para o servidor
    const formData = new FormData();
    formData.append('imagem', file);

    setIsUploading(true);

    try {
      const response = await axios.post('http://localhost/pougar/backend/upload_image.php', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data && response.data.sucesso) {
        toast({
          title: t("uploadSuccess"),
          description: t("imageUploadedSuccessfully"),
        });
        
        // Notificar o componente pai sobre a nova URL da imagem
        onImageUploaded(response.data.arquivo);
      } else {
        throw new Error(response.data.erro || t("unknownError"));
      }
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast({
        variant: "destructive",
        title: t("uploadError"),
        description: error.message || t("errorUploadingImage"),
      });
      // Se falhar, remove o preview
      setPreviewImage(currentImage || null);
    } finally {
      setIsUploading(false);
      // Limpar o input de arquivo para permitir o upload do mesmo arquivo novamente
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    setPreviewImage(null);
    onImageUploaded('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getImageUrl = (src: string) => {
    if (src.startsWith('http')) {
      return src;
    } else if (src.startsWith('/')) {
      return src;
    } else {
      return `http://localhost/pougar/backend/uploads/${src}`;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
      />
      
      {previewImage ? (
        <div className="relative border rounded-lg overflow-hidden">
          <img 
            src={getImageUrl(previewImage)}
            alt="Preview"
            className="w-full h-auto max-h-64 object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.svg";
            }}
          />
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
            disabled={isUploading}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50"
          onClick={handleUploadClick}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4 text-sm text-gray-600">{t("dragAndDropOrClickToUpload")}</div>
        </div>
      )}
      
      <div className="flex space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleUploadClick}
          disabled={isUploading}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("uploading")}
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              {previewImage ? t("changeImage") : t("uploadImage")}
            </>
          )}
        </Button>
        
        {previewImage && (
          <Button
            type="button"
            variant="destructive"
            onClick={handleRemoveImage}
            disabled={isUploading}
            className="flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
