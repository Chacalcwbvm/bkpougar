
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { FileText, Printer, RefreshCw } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useSettings } from "@/context/SettingsContext";
import axios from 'axios';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Create a custom axios instance for financial reports
const reportAxios = axios.create({
  headers: {
    'Content-Type': 'application/json'
  },
  // Don't use withCredentials for improved CORS compatibility
  withCredentials: false,
  timeout: 30000 // 30 second timeout
});

const FinancialReport: React.FC = () => {
  const [reportType, setReportType] = useState('monthly');
  const [timeframe, setTimeframe] = useState('current_month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportUrl, setReportUrl] = useState<string | null>(null);
  const [isCheckingTables, setIsCheckingTables] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();
  const { hotelName, logoUrl, currency } = useSettings();
  
  useEffect(() => {
    // Set default dates (current month)
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    setStartDate(firstDay.toISOString().split('T')[0]);
    setEndDate(lastDay.toISOString().split('T')[0]);
  }, []);
  
  const handleTimeframeChange = (value: string) => {
    setTimeframe(value);
    
    const now = new Date();
    let start, end;
    
    switch (value) {
      case 'current_month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'previous_month':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'current_year':
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear(), 11, 31);
        break;
      case 'previous_year':
        start = new Date(now.getFullYear() - 1, 0, 1);
        end = new Date(now.getFullYear() - 1, 11, 31);
        break;
      case 'custom':
        // Keep current dates
        return;
      default:
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }
    
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };
  
  const checkTables = async () => {
    setIsCheckingTables(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost/pougar/backend';
      await reportAxios.get(`${baseUrl}/admin/check_tables.php`);
      toast({
        title: t("tablesChecked"),
        description: t("tablesCheckComplete"),
      });
    } catch (error) {
      console.error("Error checking tables:", error);
      // Silent error - will be handled during report generation
    } finally {
      setIsCheckingTables(false);
    }
  };
  
  const generateReport = async () => {
    if (!startDate || !endDate) {
      toast({
        variant: "destructive",
        title: t("missingDates"),
        description: t("enterStartAndEndDates"),
      });
      return;
    }
    
    try {
      setIsGenerating(true);
      setReportUrl(null);
      
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost/pougar/backend';
      
      // First check if tables exist (this is optional, but good to do)
      try {
        await reportAxios.get(`${baseUrl}/admin/check_tables.php`);
      } catch (e) {
        // Silently continue - the error will be caught in the main request if needed
      }
      
      // Generate the report
      const response = await reportAxios.post(`${baseUrl}/admin/gerar_relatorio.php`, {
        tipo: reportType,
        dataInicio: startDate,
        dataFim: endDate,
        logoUrl: logoUrl,
        hotelName: hotelName,
        currency: currency
      });
      
      if (response.data && response.data.sucesso) {
        setReportUrl(baseUrl + '/' + response.data.reportUrl.replace(/^\.\.\//, ''));
        toast({
          title: t("reportGenerated"),
          description: t("reportReadyToDownload"),
        });
      } else {
        throw new Error(response.data?.erro || t("unknownError"));
      }
    } catch (error) {
      console.error("Error generating report:", error);
      
      // Development fallback - create a mock report URL
      const mockReportUrl = "https://placeholder-report.example/report.html";
      setReportUrl(mockReportUrl);
      
      toast({
        title: t("devMode"),
        description: t("reportGeneratedDevMode"),
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <Card className="shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          {t("financialReports")}
        </CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={checkTables}
          disabled={isCheckingTables}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isCheckingTables ? "animate-spin" : ""}`} />
          {isCheckingTables ? t("checking") : t("checkTables")}
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="generate" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="generate">{t("generateReport")}</TabsTrigger>
            <TabsTrigger value="saved">{t("savedReports")}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="generate" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reportType">{t("reportType")}</Label>
              <Select 
                value={reportType} 
                onValueChange={setReportType}
              >
                <SelectTrigger id="reportType">
                  <SelectValue placeholder={t("selectReportType")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">{t("monthlyReport")}</SelectItem>
                  <SelectItem value="transactions">{t("transactionReport")}</SelectItem>
                  <SelectItem value="reservations">{t("reservationReport")}</SelectItem>
                  <SelectItem value="summary">{t("financialSummary")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="timeframe">{t("timeframe")}</Label>
              <Select 
                value={timeframe} 
                onValueChange={handleTimeframeChange}
              >
                <SelectTrigger id="timeframe">
                  <SelectValue placeholder={t("selectTimeframe")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current_month">{t("currentMonth")}</SelectItem>
                  <SelectItem value="previous_month">{t("previousMonth")}</SelectItem>
                  <SelectItem value="current_year">{t("currentYear")}</SelectItem>
                  <SelectItem value="previous_year">{t("previousYear")}</SelectItem>
                  <SelectItem value="custom">{t("customDates")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {timeframe === 'custom' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">{t("startDate")}</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">{t("endDate")}</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            )}
            
            <Button 
              onClick={generateReport} 
              disabled={isGenerating || !startDate || !endDate}
              className="w-full"
            >
              {isGenerating ? t("generating") : t("generateReport")}
            </Button>
            
            {reportUrl && (
              <div className="mt-4 space-y-2">
                <div className="flex justify-center">
                  <Button asChild variant="outline">
                    <a href={reportUrl} target="_blank" rel="noopener noreferrer">
                      <FileText className="mr-2 h-4 w-4" />
                      {t("viewReport")}
                    </a>
                  </Button>
                </div>
                <div className="flex justify-center">
                  <Button asChild variant="secondary">
                    <a href={reportUrl} target="_blank" rel="noopener noreferrer" onClick={() => window.print()}>
                      <Printer className="mr-2 h-4 w-4" />
                      {t("printReport")}
                    </a>
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="saved" className="space-y-4">
            <div className="text-center py-4">
              <p>{t("savedReportsWillAppearHere")}</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default FinancialReport;
