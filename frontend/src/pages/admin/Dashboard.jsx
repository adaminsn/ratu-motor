// src/pages/admin/Dashboard.jsx
import { useEffect, useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import {
  Car, ShoppingCart, Wallet, TrendingUp, AlertCircle,
  Calendar, ArrowUp, ArrowDown, Package, DollarSign,
  ChevronRight, Clock, Users, Bike, Search, Filter, Home
} from 'lucide-react'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const formatRupiah = (value) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value)

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const COLORS = ['#1a2f4f', '#10b981', '#f97316', '#6366f1', '#f59e0b', '#ef4444']

const getStatusBadge = (status) => {
  const styles = {
    tersedia: 'bg-emerald-100 text-emerald-700',
    reserved: 'bg-yellow-100 text-yellow-700',
    terjual: 'bg-gray-100 text-gray-700',
  }
  return styles[status] || styles.tersedia
}

// ===== SKELETON COMPONENTS =====

// Skeleton untuk Stat Cards
const SkeletonStats = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="bg-white rounded-xl shadow-sm p-4 md:p-5 animate-pulse">
        <div className="flex items-start justify-between">
          <div className="bg-gray-200 p-2 md:p-3 rounded-lg w-10 h-10 md:w-12 md:h-12" />
          <div className="w-4 h-4 bg-gray-200 rounded-full" />
        </div>
        <div className="mt-2 md:mt-3">
          <div className="h-3 w-16 bg-gray-200 rounded" />
          <div className="h-6 w-12 bg-gray-200 rounded mt-1" />
        </div>
      </div>
    ))}
  </div>
)

// Skeleton untuk Chart
const SkeletonChart = () => (
  <div className="bg-white rounded-xl shadow-sm p-4 md:p-5 animate-pulse">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
      <div className="h-5 w-32 bg-gray-200 rounded" />
      <div className="h-4 w-20 bg-gray-200 rounded-full" />
    </div>
    <div className="h-[180px] md:h-[220px] bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-gray-400 text-sm">Memuat grafik...</div>
    </div>
  </div>
)

// Skeleton untuk Quick Actions
const SkeletonActions = () => (
  <div className="grid grid-cols-2 gap-3 md:gap-4">
    <div className="bg-gray-200 rounded-xl p-4 md:p-5 h-24 md:h-28 animate-pulse" />
    <div className="bg-gray-200 rounded-xl p-4 md:p-5 h-24 md:h-28 animate-pulse" />
  </div>
)

// Skeleton untuk Notifikasi Motor
const SkeletonNotification = () => (
  <div className="bg-white rounded-xl shadow-sm p-4 md:p-5 border-l-4 border-gray-200 animate-pulse">
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex items-center gap-2">
        <div className="bg-gray-200 p-2 rounded-lg w-8 h-8" />
        <div>
          <div className="h-4 w-40 bg-gray-200 rounded" />
          <div className="h-3 w-24 bg-gray-200 rounded mt-1" />
        </div>
      </div>
      <div className="h-4 w-20 bg-gray-200 rounded ml-auto" />
    </div>
  </div>
)

export default function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [charts, setCharts] = useState(null)
  const [motorBelumTerjual, setMotorBelumTerjual] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedPeriod, setSelectedPeriod] = useState('month')

  const fetchData = useCallback(async () => {
    try {
      console.log('Fetching dashboard data...')

      const [statsRes, chartsRes, motorRes] = await Promise.all([
        api.get('/admin/dashboard/stats'),
        api.get('/admin/dashboard/charts'),
        api.get('/admin/dashboard/motor-belum-terjual'),
      ])

      console.log('Stats:', statsRes.data)
      console.log('Charts:', chartsRes.data)
      console.log('Motor:', motorRes.data)

      setStats(statsRes.data)
      setCharts(chartsRes.data)
      setMotorBelumTerjual(motorRes.data?.motors || [])
      setError(null)
    } catch (err) {
      console.error('Error fetching dashboard:', err)
      setError('Gagal memuat data dashboard')
      toast.error('Gagal memuat data dashboard')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      if (isMounted) {
        await fetchData()
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [fetchData])

  const statCards = useMemo(() => [
    {
      label: 'Motor Tersedia',
      value: stats?.total_motor_tersedia ?? 0,
      icon: Car,
      color: 'bg-[#1a2f4f]',
      iconColor: 'text-[#1a2f4f]',
      bgColor: 'bg-[#1a2f4f]/10',
      href: '/admin/motors?status=tersedia'
    },
    {
      label: 'Motor Reserved',
      value: stats?.total_motor_reserved ?? 0,
      icon: Clock,
      color: 'bg-[#10b981]',
      iconColor: 'text-[#10b981]',
      bgColor: 'bg-[#10b981]/10',
      href: '/admin/motors?status=reserved'
    },
    {
      label: 'Motor Terjual',
      value: stats?.total_motor_terjual ?? 0,
      icon: ShoppingCart,
      color: 'bg-emerald-500',
      iconColor: 'text-emerald-500',
      bgColor: 'bg-emerald-50',
      href: '/admin/motors?status=terjual'
    },
    {
      label: 'Total Motor',
      value: stats?.total_semua_motor ?? 0,
      icon: Package,
      color: 'bg-indigo-500',
      iconColor: 'text-indigo-500',
      bgColor: 'bg-indigo-50',
      href: '/admin/motors'
    },
  ], [stats])

  const barData = useMemo(() => charts?.motor_per_merk || [], [charts])

  // ===== RENDER SKELETON SAAT LOADING =====
  if (loading) {
    return (
      <div className="space-y-4 md:space-y-6 pb-6 md:pb-8">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="h-7 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-48 bg-gray-200 rounded mt-1 animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="h-8 w-20 bg-gray-200 rounded-xl animate-pulse" />
            <div className="h-8 w-40 bg-gray-200 rounded-xl animate-pulse" />
          </div>
        </div>

        <SkeletonStats />
        <SkeletonChart />
        <SkeletonActions />
        <SkeletonNotification />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertCircle className="text-red-500 mx-auto mb-2" size={32} />
        <p className="text-red-600 font-medium">{error}</p>
        <button
          onClick={() => {
            setLoading(true)
            setError(null)
            fetchData()
          }}
          className="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
        >
          Muat Ulang
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6 pb-6 md:pb-8">

      {/* ===== HEADER ===== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#1a2f4f]">Dashboard</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-0.5">
            Ringkasan data showroom Ratu Motor
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* ===== TOMBOL HOME ===== */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-xs md:text-sm bg-[#10b981] hover:bg-emerald-600 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-xl shadow-lg shadow-emerald-500/20 transition-all duration-200 active:scale-[0.95]"
          >
            <Home size={16} className="md:w-4 md:h-4" />
            <span>Home</span>
          </button>
          
          <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500 bg-white px-3 py-1.5 md:px-4 md:py-2 rounded-xl shadow-sm">
            <Calendar size={14} className="text-[#10b981] md:w-4 md:h-4" />
            <span className="truncate">
              {new Date().toLocaleDateString('id-ID', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </span>
          </div>
        </div>
      </div>

      {/* ===== STAT CARDS (Clickable) ===== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {statCards.map(({ label, value, icon: Icon, iconColor, bgColor, href }) => (
          <div
            key={label}
            onClick={() => navigate(href)}
            className="bg-white rounded-xl shadow-sm p-4 md:p-5 hover:shadow-md transition-all duration-200 cursor-pointer group active:scale-[0.98]"
          >
            <div className="flex items-start justify-between">
              <div className={`${bgColor} p-2 md:p-3 rounded-lg group-hover:scale-105 transition-transform duration-200`}>
                <Icon size={16} className={`${iconColor} md:w-5 md:h-5`} />
              </div>
              <ChevronRight size={14} className="text-gray-300 group-hover:text-[#10b981] group-hover:translate-x-0.5 transition-all md:w-4 md:h-4" />
            </div>
            <div className="mt-2 md:mt-3">
              <p className="text-[10px] md:text-xs text-gray-500">{label}</p>
              <p className="text-base md:text-xl font-bold text-gray-800 mt-0.5">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ===== CHART SECTION ===== */}
      <div className="grid grid-cols-1 gap-4 md:gap-6">

        {/* Bar Chart - Motor per Merk */}
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <h2 className="text-sm md:text-base font-semibold text-gray-700 flex items-center gap-2">
              <Package size={16} className="text-[#1a2f4f] md:w-5 md:h-5" />
              Stok Motor per Merk
            </h2>
            <span className="text-[10px] md:text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
              Total: {barData.reduce((sum, item) => sum + (item.total || 0), 0)} unit
            </span>
          </div>
          {barData.length === 0 ? (
            <div className="flex items-center justify-center h-[180px] md:h-[220px] text-gray-400 text-sm">
              Belum ada data motor
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="merk" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <Tooltip
                  formatter={(value) => [value, 'Unit']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
                />
                <Bar
                  dataKey="total"
                  fill="#1a2f4f"
                  radius={[4, 4, 0, 0]}
                  barSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          <div
            onClick={() => navigate('/admin/motors/create')}
            className="bg-gradient-to-br from-[#1a2f4f] to-[#12223a] rounded-xl p-4 md:p-5 text-white cursor-pointer hover:shadow-lg transition-all duration-200 active:scale-[0.98]"
          >
            <Bike size={20} className="mb-2 md:w-6 md:h-6" />
            <p className="text-sm md:text-base font-semibold">Tambah Motor</p>
            <p className="text-white/50 text-[10px] md:text-xs mt-0.5">Input motor baru</p>
          </div>
          <div
            onClick={() => navigate('/admin/transaksi/create')}
            className="bg-gradient-to-br from-[#10b981] to-emerald-600 rounded-xl p-4 md:p-5 text-white cursor-pointer hover:shadow-lg transition-all duration-200 active:scale-[0.98]"
          >
            <ShoppingCart size={20} className="mb-2 md:w-6 md:h-6" />
            <p className="text-sm md:text-base font-semibold">Transaksi</p>
            <p className="text-white/50 text-[10px] md:text-xs mt-0.5">Input penjualan</p>
          </div>
        </div>

      </div>

      {/* ===== NOTIFIKASI MOTOR BELUM TERJUAL ===== */}
      {motorBelumTerjual && motorBelumTerjual.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-5 border-l-4 border-[#10b981]">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="bg-emerald-50 p-2 rounded-lg flex-shrink-0">
                <AlertCircle size={16} className="text-[#10b981] md:w-5 md:h-5" />
              </div>
              <div>
                <h2 className="text-sm md:text-base font-semibold text-gray-700">
                  Motor Belum Terjual &gt; 30 Hari
                </h2>
                <p className="text-xs text-gray-400">
                  {motorBelumTerjual.length} unit perlu perhatian
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/admin/motors?status=tersedia')}
              className="text-xs text-[#10b981] hover:text-emerald-600 font-medium ml-auto"
            >
              Lihat Semua →
            </button>
          </div>

          {/* Mobile: Scrollable cards */}
          <div className="mt-3 overflow-x-auto -mx-4 px-4 md:hidden">
            <div className="flex gap-3">
              {motorBelumTerjual.slice(0, 3).map((motor) => {
                const days = motor.tanggal_masuk ? Math.floor((new Date() - new Date(motor.tanggal_masuk)) / (1000 * 60 * 60 * 24)) : 0
                return (
                  <div key={motor.id} className="min-w-[140px] bg-gray-50 rounded-lg p-3 flex-shrink-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {motor.merk || 'Unknown'} {motor.tipe || ''}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(motor.tanggal_masuk)}</p>
                    <p className="text-xs font-semibold text-[#10b981] mt-1">{days} hari</p>
                  </div>
                )
              })}
              {motorBelumTerjual.length > 3 && (
                <div className="min-w-[100px] bg-gray-50 rounded-lg p-3 flex items-center justify-center flex-shrink-0">
                  <p className="text-xs text-gray-400 text-center">
                    +{motorBelumTerjual.length - 3} lainnya
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Desktop: Table */}
          <div className="hidden md:block mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-400 text-xs">
                  <th className="pb-2 font-medium">Motor</th>
                  <th className="pb-2 font-medium">Tanggal Masuk</th>
                  <th className="pb-2 font-medium text-right">Hari</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {motorBelumTerjual.slice(0, 5).map((motor) => {
                  const days = motor.tanggal_masuk ? Math.floor((new Date() - new Date(motor.tanggal_masuk)) / (1000 * 60 * 60 * 24)) : 0
                  return (
                    <tr key={motor.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-2.5 font-medium text-gray-800 text-sm">
                        {motor.merk || 'Unknown'} {motor.tipe || ''}
                      </td>
                      <td className="py-2.5 text-gray-500 text-sm">{formatDate(motor.tanggal_masuk)}</td>
                      <td className="py-2.5 text-[#10b981] font-semibold text-sm text-right">
                        {days} hari
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {motorBelumTerjual.length > 5 && (
              <p className="text-xs text-gray-400 mt-2 text-center">
                +{motorBelumTerjual.length - 5} motor lainnya
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-5 border-l-4 border-emerald-500">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-50 p-2 rounded-lg">
              <AlertCircle size={16} className="text-emerald-500 md:w-5 md:h-5" />
            </div>
            <div>
              <h2 className="text-sm md:text-base font-semibold text-gray-700">
                Semua Motor Terjual dengan Baik
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Tidak ada motor yang sudah &gt; 30 hari belum terjual
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ===== FOOTER INFO ===== */}
      <div className="text-center text-[10px] md:text-xs text-gray-400 pt-4 border-t border-gray-100">
        <p>Data diperbarui secara real-time · Ratu Motor Banyuwangi</p>
      </div>

    </div>
  )
}