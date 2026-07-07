import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Car, Users, ShoppingCart,
  Wallet, LogOut, Menu, X, Building2, Wrench, UserCog,
  Calendar
} from 'lucide-react'
import useAuthStore from '../store/authStore'
import api from '../api/axios'
import toast from 'react-hot-toast'

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  console.log('DEBUG user:', user)
  console.log('DEBUG roles:', user?.roles)

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout')
    } catch (e) {}
    logout()
    localStorage.removeItem('token')
    toast.success('Berhasil logout')
    navigate('/login')
  }

  // Cek role user
  const userRole = user?.roles?.[0]?.name || user?.role || null
  const isSuperAdmin = userRole === 'super_admin'
  const isAdmin = userRole === 'admin' || isSuperAdmin
  const isKasir = userRole === 'kasir'
  const isTeknisi = userRole === 'teknisi'

  // Menu berdasarkan role
  const allNavItems = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['super_admin', 'admin', 'kasir', 'teknisi'] },
    { to: '/admin/motors', icon: Car, label: 'Stok Motor', roles: ['super_admin', 'admin', 'kasir', 'teknisi'] },
    { to: '/admin/suppliers', icon: Building2, label: 'Supplier', roles: ['super_admin', 'admin', 'kasir'] },
    { to: '/admin/bookings', icon: Calendar, label: 'Booking Motor', roles: ['super_admin', 'admin'] },
    { to: '/admin/transaksi', icon: ShoppingCart, label: 'Transaksi', roles: ['super_admin', 'admin', 'kasir', 'teknisi'] },
    { to: '/admin/keuangan', icon: Wallet, label: 'Keuangan', roles: ['super_admin', 'admin', 'kasir'] },
    { to: '/admin/servis', icon: Wrench, label: 'Booking Servis', roles: ['super_admin', 'admin', 'teknisi'] },
    { to: '/admin/customers', icon: Users, label: 'Customer', roles: ['super_admin', 'admin', 'teknisi'] },
    { to: '/admin/users', icon: UserCog, label: 'Kelola User', roles: ['super_admin'] },
  ]

  // Filter menu berdasarkan role user
  const navItems = allNavItems.filter(item =>
    item.roles.some(role => {
      if (role === 'super_admin') return isSuperAdmin
      if (role === 'admin') return isAdmin
      if (role === 'kasir') return isKasir
      if (role === 'teknisi') return isTeknisi
      return false
    })
  )

  return (
    <div className="flex h-screen bg-gray-100">

      {/* Sidebar */}
      <aside className={`
        ${sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'}
        bg-[#1a2f4f] text-white flex flex-col
        transition-all duration-300 ease-in-out flex-shrink-0
      `}>
        <div className="p-6 border-b border-white/10">
          <h1 className="text-xl font-bold text-white">Ratu Motor</h1>
          <p className="text-xs text-white/50 mt-1">Management System</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-lg text-sm
                transition-colors duration-150
                ${isActive
                  ? 'bg-[#10b981] text-white font-medium shadow-lg shadow-emerald-500/20'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
                }
              `}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <p className="text-xs text-white/50 mb-1">Login sebagai</p>
          <p className="text-sm text-white font-medium truncate">{user?.name}</p>
          <p className="text-[10px] text-white/40 mt-0.5 capitalize">{userRole || 'User'}</p>
          <button
            onClick={handleLogout}
            className="mt-3 flex items-center gap-2 text-xs text-white/60 hover:text-white transition-colors"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-500 hover:text-gray-700"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <h2 className="text-sm font-medium text-gray-600">
            Selamat datang, <span className="text-[#1a2f4f] font-semibold">{user?.name}</span>
          </h2>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs bg-[#10b981]/10 text-[#10b981] px-2.5 py-1 rounded-full capitalize font-medium">
              {userRole || 'User'}
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>

    </div>
  )
}