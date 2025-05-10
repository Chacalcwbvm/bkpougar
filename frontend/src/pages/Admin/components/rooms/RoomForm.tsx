
import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/LanguageContext';
import { Loader2 } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import ImageUploader from '@/components/admin/ImageUploader';

// Define the form schema with Zod
const roomSchema = z.object({
  nome: z.string().min(1, { message: 'O nome do quarto é obrigatório' }),
  descricao: z.string().min(1, { message: 'A descrição é obrigatória' }),
  preco: z.coerce.number().positive({ message: 'O preço deve ser maior que zero' }),
  capacidade: z.coerce.number().int().positive({ message: 'A capacidade deve ser maior que zero' }),
  status: z.boolean().default(true)
});

interface RoomFormProps {
  onSubmit: (formData: any) => Promise<void>;
  initialData?: any;
  isSubmitting?: boolean;
}

const RoomForm = ({ onSubmit, initialData, isSubmitting = false }: RoomFormProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [imageUrl, setImageUrl] = useState<string>(initialData?.imagem || '');
  
  const form = useForm<z.infer<typeof roomSchema>>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      nome: initialData?.nome || '',
      descricao: initialData?.descricao || '',
      preco: initialData?.preco || 0,
      capacidade: initialData?.capacidade || 1,
      status: initialData?.status === 'disponivel' || initialData?.status === undefined ? true : false
    }
  });

  const handleFormSubmit = async (values: z.infer<typeof roomSchema>) => {
    try {
      // Convert status boolean to expected string value
      const formattedData = {
        ...values,
        status: values.status ? 'disponivel' : 'indisponivel',
        imagem: imageUrl
      };

      await onSubmit(formattedData);
    } catch (error) {
      console.error('Error submitting room form:', error);
      toast({
        variant: 'destructive',
        title: t('error'),
        description: t('errorSavingRoom')
      });
    }
  };

  const handleImageUploaded = (url: string) => {
    setImageUrl(url);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('roomName')}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t('enterRoomName')} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('description')}</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder={t('enterRoomDescription')} rows={4} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="preco"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('pricePerNight')}</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min="0" step="0.01" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="capacidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('capacity')}</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min="1" max="20" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      {t('roomAvailable')}
                    </FormLabel>
                    <div className="text-sm text-muted-foreground">
                      {t('switchToMakeAvailable')}
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          
          <div>
            <FormLabel>{t('roomImage')}</FormLabel>
            <ImageUploader 
              onImageUploaded={handleImageUploaded}
              currentImage={initialData?.imagem || ""}
              className="mt-2"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isSubmitting} 
            className="bg-hotel-navy hover:bg-hotel-navy/90"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('saving')}
              </>
            ) : (
              initialData ? t('updateRoom') : t('createRoom')
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default RoomForm;
