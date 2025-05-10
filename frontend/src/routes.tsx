import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Rooms from "./pages/Rooms";
import RoomDetail from "./pages/RoomDetail";
import Booking from "./pages/Booking";
import About from "./pages/About";
import Contact from "./pages/Contact";
import AdminDashboard from "./pages/AdminDashboard";
import AdminHome from "./pages/Admin/AdminHome";
import AdminReservations from "./pages/Admin/AdminReservations";
import AdminRooms from "./pages/Admin/AdminRooms";
import AdminGuests from "./pages/Admin/AdminGuests";
import AdminSettings from "./pages/Admin/AdminSettings";
import AdminLogin from "./pages/Admin/AdminLogin";
import AdminFinance from "./pages/Admin/AdminFinance";
import AdminReports from "./pages/Admin/AdminReports";
import AdminNewReservation from "./pages/Admin/AdminNewReservation";
import NotFound from "./pages/NotFound";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Client-facing Routes */}
      <Route path="/" element={<Index />} />
      <Route path="/rooms" element={<Rooms />} />
      <Route path="/rooms/:id" element={<RoomDetail />} />
      <Route path="/booking" element={<Booking />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      
      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminDashboard />}>
        <Route index element={<AdminHome />} />
        <Route path="reservations" element={<AdminReservations />} />
        <Route path="reservations/new" element={<AdminNewReservation />} />
        <Route path="rooms" element={<AdminRooms />} />
        <Route path="guests" element={<AdminGuests />} />
        <Route path="finance" element={<AdminFinance />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* Catch-all route for 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
