
import axios from "axios";

// Configure a custom axios instance for reservation API calls
const reservationAxios = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost/pougar/backend',
  headers: {
    'Content-Type': 'application/json',
  },
  // Don't set withCredentials: true by default, as it affects CORS
  withCredentials: false
});

// Fetch rooms with error handling
export const fetchRooms = async () => {
  try {
    const response = await reservationAxios.get('/listar_quartos.php');
    return response.data || []; // Ensure we always return an array
  } catch (error) {
    console.error("Error fetching rooms:", error);
    // Return an empty array so the app doesn't crash
    return [];
  }
};

// Submit reservation data to API
export const submitReservation = async (formattedData: any) => {
  return await reservationAxios.post('/admin/adicionar_reserva.php', formattedData);
};

// Utility function to fix API url paths
export const getApiUrl = (endpoint: string) => {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost/pougar/backend';
  
  // Make sure the endpoint starts with "/"
  const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  return `${baseUrl}${formattedEndpoint}`;
};
