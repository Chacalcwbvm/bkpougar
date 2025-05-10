// Caminho: C:\pousada\frontend\src\pages\admin\AdminReports.tsx

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/context/LanguageContext";
import FinancialReport from "@/components/admin/FinancialReport";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { FileText, Database } from "lucide-react";

const AdminReports = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [checkingTables, setCheckingTables] = useState(false);

  const verifyTables = async () => {
    setCheckingTables(true);
    try {
      const response = await axios.get('http://localhost/pougar/backend/admin/check_tables.php');

      const created = Array.isArray(response.data.created_tables)
        ? response.data.created_tables
        : [];

      const missing = Array.isArray(response.data.missing_tables)
        ? response.data.missing_tables
        : [];

      if (response.data.success) {
        toast({
          title: t("success"),
          description: t("allTablesAvailable"),
        });
      } else if (created.length > 0) {
        toast({
          title: t("tablesCreated"),
          description: `${t("createdTables")}: ${created.join(', ')}`,
        });
      } else {
        toast({
          variant: "destructive",
          title: t("missingTables"),
          description: `${t("missingTables")}: ${missing.join(', ')}`,
        });
      }
    } catch (error) {
      console.error("Error checking tables:", error);
      toast({
        variant: "destructive",
        title: t("error"),
        description: error instanceof Error ? error.message : t("unknownError"),
      });
    } finally {
      setCheckingTables(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-serif font-bold">{t("reports")}</h1>
        <Button 
          onClick={verifyTables} 
          size="sm" 
          variant="outline"
          disabled={checkingTables}
        >
          <Database className="mr-2 h-4 w-4" />
          {checkingTables ? t("checkingTables") : t("verifyDatabaseTables")}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <FinancialReport />
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("savedReports")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                {t("savedReportsWillAppearHere")}
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">{t("reportsTips")}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>{t("reportTip1")}</p>
              <p>{t("reportTip2")}</p>
              <p>{t("reportTip3")}</p>
              <div className="mt-4">
                <Button asChild variant="ghost" size="sm" className="w-full">
                  <a href="http://localhost/pougar/backend/install_phpmailer.php" target="_blank" rel="noopener noreferrer">
                    <FileText className="mr-2 h-4 w-4" />
                    {t("setupEmailNotifications")}
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
