// src/routes/index.jsx
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Login from '../pages/auth/Login';
import Dashboard from '../pages/admin/Dashboard';
import AdminLayout from '../layouts/AdminLayout';
import CustomerLayout from '../layouts/CustomerLayout';
import PublicLayout from '../layouts/PublicLayout';
import Motors from '../pages/admin/Motors';
import Transaksi from '../pages/admin/Transaksi';
import Keuangan from '../pages/admin/Keuangan';
import Suppliers from '../pages/admin/Suppliers';
import Servis from '../pages/admin/Servis';
import Users from '../pages/admin/Users';
import BookingMotor from '../pages/admin/BookingMotor';
import Customers from '../pages/admin/Customers';
import CustomerDetail from '../pages/admin/CustomerDetail';
import CustomerDashboard from '../pages/customer/Dashboard';
import Booking from '../pages/customer/Booking';
import BookingDetail from '../pages/customer/BookingDetail';
import Profil from '../pages/customer/Profil';
import Wishlist from '../pages/customer/Wishlist';
import LandingPage from '../pages/public/LandingPage';
import Katalog from '../pages/public/Katalog';
import DetailMotor from '../pages/public/DetailMotor';
import Tentang from '../pages/public/Tentang';
import Kontak from '../pages/public/Kontak';
import useAuthStore from '../store/authStore';
import BookingServis from '../pages/customer/BookingServis';

const adminRoles = ['super_admin', 'admin', 'kasir', 'teknisi'];

// ===== PROTECTED ROUTE ADMIN =====
const ProtectedRoute = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { role } = useAuthStore();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      setIsAuthenticated(!!token);
      setIsLoading(false);
    };
    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#1a2f4f] border-t-[#f97316] rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 text-sm mt-4">Memeriksa sesi...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Kalau role customer, arahkan ke customer dashboard
  if (role === 'customer') return <Navigate to="/customer/dashboard" replace />;

  return children;
};

// ===== PROTECTED ROUTE CUSTOMER =====
const CustomerRoute = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { role } = useAuthStore();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      setIsAuthenticated(!!token);
      setIsLoading(false);
    };
    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#1a2f4f] border-t-[#f97316] rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 text-sm mt-4">Memeriksa sesi...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Kalau role admin, arahkan ke admin dashboard
  if (role && adminRoles.includes(role)) return <Navigate to="/admin/dashboard" replace />;

  return children;
};

// ===== ROUTER =====
export const router = createBrowserRouter([
  // ===== PUBLIC ROUTES =====
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'katalog', element: <Katalog /> },
      { path: 'motor/:id', element: <DetailMotor /> },
      { path: 'tentang', element: <Tentang /> },
      { path: 'kontak', element: <Kontak /> },
    ]
  },

  // ===== LOGIN =====
  { path: '/login', element: <Login /> },

  // ===== ADMIN ROUTES =====
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'motors', element: <Motors /> },
      { path: 'motors/create', element: <Motors openCreate={true} /> },
      { path: 'suppliers', element: <Suppliers /> },
      { path: 'transaksi', element: <Transaksi /> },
      { path: 'transaksi/create', element: <Transaksi openCreate={true} /> },
      { path: 'servis', element: <Servis /> },
      { path: 'bookings', element: <BookingMotor /> },
      { path: 'customers', element: <Customers /> },
      { path: 'customers/:id', element: <CustomerDetail /> },
      { path: 'users', element: <Users /> },
      { path: 'keuangan', element: <Keuangan /> },
    ],
  },

  // ===== CUSTOMER ROUTES =====
  {
    path: '/customer',
    element: (
      <CustomerRoute>
        <CustomerLayout />
      </CustomerRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/customer/dashboard" replace /> },
      { path: 'dashboard', element: <CustomerDashboard /> },
      { path: 'booking', element: <Booking /> },
      { path: 'bookings/:id', element: <BookingDetail /> },
      { path: 'wishlist', element: <Wishlist /> },
      { path: 'profil', element: <Profil /> },
      { path: 'servis', element: <BookingServis />, },
    ],
  },

  // ===== FALLBACK =====
  { path: '*', element: <Navigate to="/" replace /> },
]);

export default router;