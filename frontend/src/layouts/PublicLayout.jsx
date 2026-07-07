// src/layouts/PublicLayout.jsx
import { useState } from 'react'
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom'
import { 
  Bike, Heart, User, LogIn, Menu, X, Home, 
  Info, Phone, MapPin, Mail, Clock, 
  Facebook, Instagram, Youtube, Twitter,
  LayoutDashboard, LogOut
} from 'lucide-react'
import useAuthStore from '../store/authStore'
import api from '../api/axios'
import toast from 'react-hot-toast'

export default function PublicLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuthStore()
  const navigate = useNavigate()

  const navItems = [
    { to: '/', icon: Home, label: 'Beranda' },
    { to: '/katalog', icon: Bike, label: 'Katalog' },
    { to: '/tentang', icon: Info, label: 'Tentang' },
    { to: '/kontak', icon: Phone, label: 'Kontak' },
  ]

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout')
    } catch (e) {}
    logout()
    localStorage.removeItem('token')
    toast.success('Logout berhasil!')
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      
      {/* Navbar */}
      <nav className="bg-[#1a2f4f] text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* ===== LOGO ===== */}
            <Link to="/" className="flex items-center gap-3 flex-shrink-0">
              <img 
                src="/images/Logo.png" 
                alt="Ratu Motor" 
                className="h-10 w-auto object-contain"
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
              <span className="font-bold text-xl hidden sm:block">Ratu Motor</span>
            </Link>

            {/* ===== NAV LINK DESKTOP ===== */}
            <div className="hidden md:flex items-center gap-6">
              {navItems.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive 
                        ? 'bg-[#10b981] text-white' 
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </div>

            {/* ===== RIGHT SECTION ===== */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  {/* Dashboard Button */}
                  <Link
                    to="/customer/dashboard"
                    className="flex items-center gap-2 px-4 py-2 bg-[#10b981] rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors"
                  >
                    <LayoutDashboard size={18} />
                    <span className="hidden sm:inline">
                      {user?.name?.split(' ')[0] || 'Dashboard'}
                    </span>
                  </Link>
                  
                  {/* Logout Button (Desktop) */}
                  <button
                    onClick={handleLogout}
                    className="hidden md:flex items-center gap-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-sm font-medium transition-colors"
                  >
                    <LogOut size={18} />
                    <span className="hidden lg:inline">Logout</span>
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-4 py-2 bg-[#10b981] rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors"
                >
                  <LogIn size={18} />
                  Login
                </Link>
              )}

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>

          </div>
        </div>

        {/* ===== MOBILE MENU ===== */}
        {isMenuOpen && (
          <div className="md:hidden bg-[#12223a] px-4 py-4 space-y-2 border-t border-white/10">
            {navItems.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-[#10b981] text-white' 
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
            
            {/* Mobile Menu - Auth Actions */}
            <div className="border-t border-white/10 pt-3 mt-2">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/customer/dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <LayoutDashboard size={18} />
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <LogIn size={18} />
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-[#1a2f4f] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img 
                  src="/images/logo-ratu-motor.png" 
                  alt="Ratu Motor" 
                  className="h-10 w-auto object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
                <span className="font-bold text-xl">Ratu Motor</span>
              </div>
              <p className="text-white/60 text-sm">Pusat motor terpercaya di Banyuwangi.</p>
            </div>

            {/* Menu */}
            <div>
              <h3 className="font-semibold mb-4">Menu</h3>
              <ul className="space-y-2 text-white/60 text-sm">
                {navItems.map(({ to, label }) => (
                  <li key={to}>
                    <Link to={to} className="hover:text-white transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Kontak */}
            <div>
              <h3 className="font-semibold mb-4">Kontak</h3>
              <ul className="space-y-2 text-white/60 text-sm">
                <li className="flex items-start gap-2"><MapPin size={16} className="mt-0.5 shrink-0" />Jl. Piere Tendean No.1, Karangrejo, Kec. Banyuwangi, Kabupaten Banyuwangi, Jawa Timur 68411</li>
                <li className="flex items-center gap-2"><Phone size={16} />0812-5244-6195</li>
                <li className="flex items-center gap-2"><Mail size={16} />info@ratumotor.com</li>
              </ul>
            </div>

            {/* Jam Operasional */}
            <div>
              <h3 className="font-semibold mb-4">Jam Operasional</h3>
              <ul className="space-y-2 text-white/60 text-sm">
                <li className="flex items-center gap-2"><Clock size={16} />Setiap Hari: 09.00 - 15.00</li>
              </ul>
            </div>

          </div>

          <div className="border-t border-white/10 mt-8 pt-8 text-center text-white/40 text-sm">
            © {new Date().getFullYear()} Ratu Motor Banyuwangi. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  )
}