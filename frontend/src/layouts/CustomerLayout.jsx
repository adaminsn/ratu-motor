// src/layouts/CustomerLayout.jsx
import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, Heart, ShoppingCart, User, 
  LogOut, Menu, X, Sparkles,
  Bell, Wrench, Calendar, Home, 
  Settings, Award, Gift, Star,
  ChevronRight, Circle, Shield
} from 'lucide-react'
import useAuthStore from '../store/authStore'
import api from '../api/axios'
import toast from 'react-hot-toast'


export default function CustomerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout')
    } catch (e) {}
    logout()
    localStorage.removeItem('token')
    toast.success('Logout berhasil!')
    navigate('/')
  }

  const menuItems = [
    { to: '/customer/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/customer/booking', icon: Calendar, label: 'Booking Saya' },
    { to: '/customer/servis', icon: Wrench, label: 'Booking Servis' },
    { to: '/customer/wishlist', icon: Heart, label: 'Wishlist' },
    { to: '/customer/profil', icon: User, label: 'Profil Saya' },
  ]

  const getPageTitle = () => {
    const current = menuItems.find(item => location.pathname === item.to || location.pathname.startsWith(item.to + '/'))
    return current?.label || 'Dashboard'
  }

  const getInitial = (name) => {
    if (!name) return 'C'
    return name.charAt(0).toUpperCase()
  }

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      
      {/* Cursor Glow - Hijau */}
      <div 
        className="fixed pointer-events-none z-50 w-96 h-96 rounded-full blur-3xl opacity-20 transition-all duration-300"
        style={{
          background: 'radial-gradient(circle, #10b981, transparent)',
          left: mousePosition.x - 192,
          top: mousePosition.y - 192,
        }}
      />

      {/* Sidebar */}
      <aside className={`
        fixed lg:relative inset-y-0 left-0 z-40 w-72 bg-gradient-to-b from-[#1a2f4f] to-[#0f1f33] text-white
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col h-full shadow-2xl flex-shrink-0
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#10b981] to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <span className="text-white font-bold text-xl">R</span>
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight">Ratu Motor</span>
              <p className="text-white/40 text-[10px] tracking-wider flex items-center gap-1">
                <Sparkles size={10} className="text-[#10b981]" />
                Customer Panel
              </p>
            </div>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'bg-[#10b981] text-white shadow-lg shadow-emerald-500/30 scale-105'
                    : 'text-white/60 hover:text-white hover:bg-white/10 hover:translate-x-1'
                }`
              }
            >
              <Icon size={20} className="flex-shrink-0" />
              <span className="text-sm font-medium">{label}</span>
              {label === 'Wishlist' && (
                <span className="ml-auto bg-[#10b981] text-white text-[10px] px-2 py-0.5 rounded-full"></span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Profile */}
        <div className="p-4 border-t border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3 mb-3">
            {/* Avatar Sidebar */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#10b981] to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 flex-shrink-0 overflow-hidden">
              {user?.avatar ? (
                <img 
                  src={user.avatar} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const parent = e.target.parentElement
                    if (parent) {
                      e.target.style.display = 'none'
                      parent.textContent = getInitial(user?.name)
                      parent.className = 'w-10 h-10 rounded-full bg-gradient-to-br from-[#10b981] to-emerald-600 flex items-center justify-center text-white font-semibold text-sm'
                    }
                  }}
                />
              ) : (
                <span className="text-white font-semibold text-sm">
                  {getInitial(user?.name)}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || 'Customer'}</p>
              <p className="text-white/40 text-[10px] capitalize flex items-center gap-1">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                {user?.type || 'Customer'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 py-2.5 rounded-xl transition-all duration-300 text-sm font-medium hover:scale-105"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        
        {/* Header */}
        <header className="bg-white shadow-sm px-4 sm:px-6 py-3 flex items-center justify-between z-30 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-all duration-300"
            >
              {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-[#1a2f4f]">{getPageTitle()}</h2>
              <Sparkles size={14} className="text-[#10b981]" />
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {/* ===== IKON HEART DAN BELL DIHAPUS ===== */}
            
            <span className="text-sm text-gray-600 hidden sm:block">
              Selamat datang, <span className="font-semibold text-[#1a2f4f]">{user?.name?.split(' ')[0] || 'Customer'}</span>
            </span>
            
            {/* Avatar Header */}
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#10b981]/20 to-emerald-500/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {user?.avatar ? (
                <img 
                  src={user.avatar} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const parent = e.target.parentElement
                    if (parent) {
                      e.target.style.display = 'none'
                      parent.textContent = getInitial(user?.name)
                      parent.className = 'w-9 h-9 rounded-full bg-gradient-to-br from-[#10b981]/20 to-emerald-500/20 flex items-center justify-center text-[#10b981] font-semibold text-sm'
                    }
                  }}
                />
              ) : (
                <span className="text-[#10b981] font-semibold text-sm">
                  {getInitial(user?.name)}
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-8">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="bg-white shadow-sm border-t border-gray-200 px-6 py-3 text-center flex-shrink-0">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} Ratu Motor. All rights reserved.
          </p>
        </footer>

      </div>
    </div>
  )
}