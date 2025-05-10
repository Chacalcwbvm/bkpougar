import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { useLanguage } from "@/context/LanguageContext";
import axios from "axios";
import { 
  Plus, 
  Trash2, 
  Edit, 
  Search,
  Loader2,
  User,
  RefreshCw
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Interface for the guests
interface Guest {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  documento?: string;
  nacionalidade?: string;
  data_nascimento?: string;
  endereco?: string;
  cep?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  data_cadastro?: string;
}

// Create a custom axios instance for guest API calls
const guestAxios = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
  // Don't use withCredentials for improved CORS compatibility
  withCredentials: false
});

const AdminGuests = () => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [guestToDelete, setGuestToDelete] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const { toast } = useToast();
  const { t, language } = useLanguage();

  const defaultGuest: Guest = {
    id: 0,
    nome: "",
    email: "",
    telefone: "",
    documento: "",
    nacionalidade: "",
    endereco: "",
    cep: "",
    bairro: "",
    cidade: "",
    estado: ""
  };

  useEffect(() => {
    fetchGuests();
  }, [language]);

  const fetchGuests = async () => {
    setIsLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost/pougar/backend';
      const response = await guestAxios.get(`${baseUrl}/admin/listar_hospedes.php`, {
        params: { lang: language }
      });
      
      if (response.data) {
        setGuests(Array.isArray(response.data) ? response.data : []);
      } else {
        setGuests([]);
      }
    } catch (error) {
      console.error('Error fetching guests:', error);
      toast({
        title: t("errorLoadingGuests"),
        description: t("tryAgainLater"),
        variant: "destructive"
      });
      // Set mock data for development purposes
      const mockGuests: Guest[] = [
        { 
          id: 1, 
          nome: "JOÃO SILVA", 
          email: "joao@example.com", 
          telefone: "11912345678",
          documento: "123.456.789-00"
        },
        { 
          id: 2, 
          nome: "MARIA OLIVEIRA", 
          email: "maria@example.com", 
          telefone: "11998765432",
          documento: "987.654.321-00"
        }
      ];
      setGuests(mockGuests);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle uppercase input (except for email)
  const handleUppercaseInput = (field: string, value: string) => {
    if (field === 'email') {
      return value;
    }
    return value.toUpperCase();
  };

  // Function to search address by CEP
  const searchAddressByCep = async (cep: string) => {
    if (!selectedGuest) return;
    
    // Remove any non-digit characters
    cep = cep.replace(/\D/g, '');

    // Check if CEP has the correct format
    if (cep.length !== 8) {
      return;
    }

    setLoadingCep(true);
    try {
      const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
      
      if (!response.data.erro) {
        // Update address fields with uppercase values
        setSelectedGuest({
          ...selectedGuest,
          endereco: response.data.logradouro.toUpperCase(),
          bairro: response.data.bairro.toUpperCase(),
          cidade: response.data.localidade.toUpperCase(),
          estado: response.data.uf.toUpperCase(),
        });
      }
    } catch (error) {
      console.error('Error fetching address:', error);
    } finally {
      setLoadingCep(false);
    }
  };

  // Filter guests based on search term
  const filteredGuests = guests.filter(guest => {
    return guest.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           guest.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           guest.telefone?.includes(searchTerm) ||
           guest.documento?.includes(searchTerm);
  });

  const handleViewDetails = (guest: Guest) => {
    setSelectedGuest(guest);
    setIsEditMode(false);
    setIsAddMode(false);
    setIsModalOpen(true);
  };
  
  const handleEdit = (guest: Guest) => {
    setSelectedGuest(guest);
    setIsEditMode(true);
    setIsAddMode(false);
    setIsModalOpen(true);
  };

  const handleAddGuest = () => {
    setSelectedGuest(defaultGuest);
    setIsEditMode(false);
    setIsAddMode(true);
    setIsModalOpen(true);
  };

  const handleDeleteGuest = (id: number) => {
    setGuestToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteGuest = async () => {
    if (!guestToDelete) return;
    
    setIsDeleting(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost/pougar/backend';
      const response = await guestAxios.delete(`${baseUrl}/admin/excluir_hospede.php?id=${guestToDelete}`);
      
      if (response.data && response.data.sucesso) {
        setGuests(guests.filter(guest => guest.id !== guestToDelete));
        
        toast({
          title: t("guestDeleted"),
          description: t("guestDeletedDesc"),
        });
        
        setDeleteDialogOpen(false);
        setGuestToDelete(null);
        
        if (selectedGuest && selectedGuest.id === guestToDelete) {
          setIsModalOpen(false);
        }
      } else {
        throw new Error(response.data.erro || t("unknownError"));
      }
    } catch (error) {
      console.error('Error deleting guest:', error);
      toast({
        title: t("error"),
        description: t("guestDeleteError"),
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleInputChange = (field: string, value: any) => {
    if (!selectedGuest) return;
    
    setSelectedGuest({
      ...selectedGuest,
      [field]: field === 'email' ? value : value.toUpperCase()
    });
  };
  
  const handleSaveChanges = async () => {
    if (!selectedGuest) return;
    
    // Simple validation
    if (!selectedGuest.nome || !selectedGuest.email || !selectedGuest.telefone) {
      toast({
        title: t("validationError"),
        description: t("pleaseCompleteRequiredFields"),
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let response;
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost/pougar/backend';
      
      // If we're in add mode, use POST to create a new guest
      if (isAddMode) {
        response = await guestAxios.post(`${baseUrl}/admin/adicionar_hospede.php`, selectedGuest);
        
        if (response.data && response.data.sucesso) {
          // Add the new guest to the list with the ID generated by the backend
          const newGuest = {
            ...selectedGuest,
            id: response.data.id || Date.now() // Fallback ID if server doesn't provide one
          };
          
          setGuests([...guests, newGuest]);
          
          toast({
            title: t("guestAdded"),
            description: t("guestAddedDesc"),
          });
          
          setIsModalOpen(false);
        }
      } else {
        // If we're in edit mode, use PUT to update an existing guest
        response = await guestAxios.put(`${baseUrl}/admin/editar_hospede.php`, selectedGuest);
        
        if (response.data && response.data.sucesso) {
          // Update the guest in the list
          const updatedGuests = guests.map(guest => 
            guest.id === selectedGuest.id ? selectedGuest : guest
          );
          
          setGuests(updatedGuests);
          
          toast({
            title: t("guestUpdated"),
            description: t("guestUpdatedDesc"),
          });
          
          setIsModalOpen(false);
        }
      }
    } catch (error) {
      console.error('Error saving guest:', error);
      
      // For development purposes, simulate success
      if (isAddMode) {
        const newGuest = {
          ...selectedGuest,
          id: Date.now() // Use timestamp as a mock ID
        };
        setGuests([...guests, newGuest]);
        toast({
          title: t("guestAdded"),
          description: t("guestAddedDescDev"),
        });
      } else {
        const updatedGuests = guests.map(guest => 
          guest.id === selectedGuest.id ? selectedGuest : guest
        );
        setGuests(updatedGuests);
        toast({
          title: t("guestUpdated"),
          description: t("guestUpdatedDescDev"),
        });
      }
      setIsModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-serif font-bold">{t("guestManagement")}</h1>
        <Button 
          variant="outline" 
          size="sm"
          onClick={fetchGuests}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? t("loading") : t("refresh")}
        </Button>
      </div>

      <ScrollReveal>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between mb-6 space-y-4 md:space-y-0">
              <div className="w-full md:w-1/2 flex items-center">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder={t("searchGuests")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Button 
                  className="bg-hotel-gold hover:bg-hotel-gold/80 text-white"
                  onClick={handleAddGuest}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  {t("addNewGuest")}
                </Button>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-10">
                <Loader2 className="h-10 w-10 animate-spin mx-auto text-hotel-gold" />
                <p className="mt-4 text-gray-500">{t("loading")}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t("name")}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t("email")}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t("phone")}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t("document")}
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t("actions")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredGuests.length > 0 ? (
                      filteredGuests.map((guest) => (
                        <tr key={guest.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                                <User className="h-5 w-5 text-gray-400" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{guest.nome}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{guest.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{guest.telefone}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{guest.documento || '-'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleViewDetails(guest)}
                              >
                                {t("view")}
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEdit(guest)}
                                className="text-blue-600"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDeleteGuest(guest.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                          {searchTerm ? t("noGuestsMatchSearch") : t("noGuestsFound")}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </ScrollReveal>

      {/* Guest Details/Edit/Add Modal */}
      {isModalOpen && selectedGuest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-medium">
                  {isAddMode
                    ? t("addGuest")
                    : isEditMode 
                    ? t("editGuest") 
                    : t("guestDetails")}
                </h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  ✕
                </Button>
              </div>
              
              <div className="mb-6">
                {(isEditMode || isAddMode) ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t("name")} *
                        </label>
                        <Input
                          value={selectedGuest.nome}
                          onChange={(e) => handleInputChange('nome', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t("email")} *
                        </label>
                        <Input
                          type="email"
                          value={selectedGuest.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t("phone")} *
                        </label>
                        <Input
                          value={selectedGuest.telefone}
                          onChange={(e) => handleInputChange('telefone', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t("document")}
                        </label>
                        <Input
                          value={selectedGuest.documento || ''}
                          onChange={(e) => handleInputChange('documento', e.target.value)}
                        />
                      </div>
                    </div>
                    
                    {/* CEP field with search button */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t("zipCode")}
                        </label>
                        <div className="flex gap-2">
                          <Input
                            value={selectedGuest.cep || ''}
                            onChange={(e) => handleInputChange('cep', e.target.value)}
                            placeholder="00000-000"
                          />
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            onClick={() => selectedGuest.cep && searchAddressByCep(selectedGuest.cep)}
                            disabled={loadingCep || !selectedGuest.cep}
                          >
                            {loadingCep ? <Loader2 className="h-4 w-4 animate-spin" /> : t("search")}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Address fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t("address")}
                        </label>
                        <Input
                          value={selectedGuest.endereco || ''}
                          onChange={(e) => handleInputChange('endereco', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t("neighborhood")}
                        </label>
                        <Input
                          value={selectedGuest.bairro || ''}
                          onChange={(e) => handleInputChange('bairro', e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t("city")}
                        </label>
                        <Input
                          value={selectedGuest.cidade || ''}
                          onChange={(e) => handleInputChange('cidade', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t("state")}
                        </label>
                        <Input
                          value={selectedGuest.estado || ''}
                          onChange={(e) => handleInputChange('estado', e.target.value)}
                          maxLength={2}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="h-8 w-8 text-gray-400" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium">{selectedGuest.nome}</h3>
                        <p className="text-gray-500">{selectedGuest.email}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                      <div>
                        <p className="text-sm text-gray-500">{t("phone")}</p>
                        <p>{selectedGuest.telefone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{t("document")}</p>
                        <p>{selectedGuest.documento || '-'}</p>
                      </div>
                    </div>
                    
                    {selectedGuest.endereco && (
                      <div className="pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-500">{t("address")}</p>
                        <p>{selectedGuest.endereco}</p>
                        {selectedGuest.bairro && (
                          <p>
                            {selectedGuest.bairro}, {selectedGuest.cidade || ''} {selectedGuest.estado ? `- ${selectedGuest.estado}` : ''}
                            {selectedGuest.cep ? ` (${selectedGuest.cep})` : ''}
                          </p>
                        )}
                      </div>
                    )}
                    
                    {selectedGuest.data_cadastro && (
                      <div className="pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-500">{t("registrationDate")}</p>
                        <p>{new Date(selectedGuest.data_cadastro).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex justify-between mt-6 pt-6 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setIsModalOpen(false)}
                >
                  {(isEditMode || isAddMode) ? t("cancel") : t("close")}
                </Button>
                {isEditMode || isAddMode ? (
                  <Button 
                    className="bg-hotel-gold hover:bg-hotel-gold/80 text-white"
                    onClick={handleSaveChanges}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        {t("processing")}
                      </>
                    ) : (
                      t("saveChanges")
                    )}
                  </Button>
                ) : (
                  <Button 
                    onClick={() => setIsEditMode(true)}
                    className="bg-hotel-gold hover:bg-hotel-gold/80 text-white"
                  >
                    {t("edit")}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirmDelete")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("confirmDeleteGuestDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {t("no")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDeleteGuest();
              }}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {t("processing")}
                </>
              ) : (
                t("yes")
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminGuests;
 n