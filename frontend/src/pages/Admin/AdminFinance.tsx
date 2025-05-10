import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { DollarSign } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import FinancialTransaction from "@/components/admin/FinancialTransaction";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/context/SettingsContext";

const AdminFinance = () => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const { currency } = useSettings();
  
  useEffect(() => {
    fetchTransactions();
  }, []);
  
  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('http://localhost/pougar/backend/admin/listar_transacoes.php');
      if (response.data && Array.isArray(response.data)) {
        setTransactions(response.data);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast({
        variant: "destructive",
        title: t("errorOccurred"),
        description: t("connectionError"),
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Format currency based on language
  const formatCurrency = (value) => {
    if (value === null || value === undefined) return language === "pt" ? "R$ 0,00" : "$0.00";
    
    if (language === "pt") {
      return `R$ ${Number(value).toFixed(2).replace('.', ',')}`;
    }
    
    return `$${Number(value).toFixed(2)}`;
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    
    return new Intl.DateTimeFormat(language === 'pt' ? 'pt-BR' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Get transaction type class
  const getTransactionTypeClass = (type) => {
    switch (type) {
      case 'payment':
        return 'bg-green-100 text-green-800';
      case 'expense':
        return 'bg-red-100 text-red-800';
      case 'deposit':
        return 'bg-blue-100 text-blue-800';
      case 'refund':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-serif font-bold">{t("finance")}</h1>
        <Button onClick={fetchTransactions} variant="outline">
          {t("refresh")}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                {t("transactions")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid grid-cols-4 mb-4">
                  <TabsTrigger value="all">{t("all")}</TabsTrigger>
                  <TabsTrigger value="income">{t("income")}</TabsTrigger>
                  <TabsTrigger value="expenses">{t("expenses")}</TabsTrigger>
                  <TabsTrigger value="others">{t("others")}</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("date")}</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("transactionType")}</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("description")}</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("amount")}</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {isLoading ? (
                          <tr>
                            <td colSpan={4} className="px-4 py-8 text-center">{t("loading")}</td>
                          </tr>
                        ) : transactions.length > 0 ? (
                          transactions.map((transaction) => (
                            <tr key={transaction.id} className="hover:bg-gray-50">
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-800">
                                {formatDate(transaction.data_transacao)}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm">
                                <span className={`px-2 py-1 text-xs rounded-full ${getTransactionTypeClass(transaction.tipo)}`}>
                                  {t(transaction.tipo)}
                                </span>
                              </td>
                              <td className="px-4 py-4 text-sm text-gray-800">
                                {transaction.descricao}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {formatCurrency(transaction.valor)}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="px-4 py-8 text-center">{t("noTransactionsFound")}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
                
                {/* Other tabs would filter by transaction type */}
                <TabsContent value="income">
                  {/* Similar table but filtered for income transactions */}
                  <div className="text-center py-4 text-gray-500">
                    {t("incomeTransactions")}
                  </div>
                </TabsContent>
                
                <TabsContent value="expenses">
                  {/* Similar table but filtered for expense transactions */}
                  <div className="text-center py-4 text-gray-500">
                    {t("expenseTransactions")}
                  </div>
                </TabsContent>
                
                <TabsContent value="others">
                  {/* Similar table but filtered for other transaction types */}
                  <div className="text-center py-4 text-gray-500">
                    {t("otherTransactions")}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <FinancialTransaction onTransactionAdded={fetchTransactions} />
        </div>
      </div>
    </div>
  );
};

export default AdminFinance;
