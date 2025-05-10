import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { DollarSign } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import axios from 'axios';
import { useSettings } from "@/context/SettingsContext";

interface FinancialTransactionProps {
  reservationId?: number;
  onTransactionAdded?: () => void;
}

const FinancialTransaction: React.FC<FinancialTransactionProps> = ({ 
  reservationId,
  onTransactionAdded
}) => {
  const [type, setType] = useState('payment');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();
  const { currency } = useSettings();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        variant: "destructive",
        title: t("invalidAmount"),
        description: t("enterValidAmount"),
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const response = await axios.post('http://localhost/pougar/backend/admin/registrar_transacao.php', {
        id_reserva: reservationId,
        tipo: type,
        valor: parseFloat(amount),
        descricao: description || (type === 'payment' ? t("paymentReceived") : t("expenseRecorded"))
      });
      
      if (response.data.sucesso) {
        toast({
          title: t("transactionSuccess"),
          description: t("transactionAdded"),
        });
        
        // Reset form
        setAmount('');
        setDescription('');
        
        // Notify parent
        if (onTransactionAdded) {
          onTransactionAdded();
        }
      } else {
        throw new Error(response.data.erro || t("unknownError"));
      }
    } catch (error) {
      console.error("Error adding transaction:", error);
      toast({
        variant: "destructive",
        title: t("transactionFailed"),
        description: error instanceof Error ? error.message : t("errorOccurred"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <DollarSign className="h-5 w-5 mr-2" />
          {t("addFinancialTransaction")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="transactionType">{t("transactionType")}</Label>
            <Select 
              value={type} 
              onValueChange={setType}
            >
              <SelectTrigger id="transactionType">
                <SelectValue placeholder={t("selectTransactionType")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="payment">{t("payment")}</SelectItem>
                <SelectItem value="expense">{t("expense")}</SelectItem>
                <SelectItem value="deposit">{t("deposit")}</SelectItem>
                <SelectItem value="refund">{t("refund")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">{t("amount")}</Label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-500">
                {currency}
              </span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-10"
                placeholder="0.00"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">{t("description")}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("transactionDescription")}
              rows={2}
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? t("processing") : t("addTransaction")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default FinancialTransaction;
