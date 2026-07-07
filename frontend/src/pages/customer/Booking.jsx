// src/pages/customer/Booking.jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Calendar, Clock, CheckCircle, XCircle, Eye, Plus, Bike } from 'lucide-react'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const STATUS_BADGES = {
  menunggu: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  dikonfirmasi: 'bg-blue-100 text-blue-700 border-blue-200',
  selesai: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  dibatalkan: 'bg-red-100 text-red-700 border-red-200'
}

const STATUS_LABELS = {
  menunggu: 'Menunggu Konfirmasi',
  dikonfirmasi: 'Dikonfirmasi',
  selesai: 'Selesai',
  dibatalkan: 'Dibatalkan'
}

const STATUS_ICONS = {
  menunggu: Clock,
  dikonfirmasi: CheckCircle,
  selesai: CheckCircle,
  dibatalkan: XCircle
}

// ===== SKELETON LOADING =====
const SkeletonBooking = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 animate-pulse">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="h-5 w-40 bg-gray-200 rounded" />
              <div className="h-5 w-20 bg-gray-200 rounded-full" />
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-1">
              <div className="h-4 w-24 bg-gray-200 rounded" />
              <div className="h-4 w-16 bg-gray-200 rounded" />
            </div>
          </div>
          <div className="h-8 w-16 bg-gray-200 rounded-lg" />
        </div>
      </div>
    ))}
  </div>
)

export default function Booking() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await api.get('/customer/bookings')
        const data = response.data?.data || response.data || []
        setBookings(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('Error fetching bookings:', err)
        toast.error('Gagal memuat booking')
        setBookings([])
      } finally {
        setLoading(false)
      }
    }
    fetchBookings()
  }, [])

  // Hitung statistik
  const totalBookings = bookings.length
  const activeBookings = bookings.filter(b => ['menunggu', 'dikonfirmasi'].includes(b.status)).length
  const completedBookings = bookings.filter(b => b.status === 'selesai').length
  const cancelledBookings = bookings.filter(b => b.status === 'dibatalkan').length

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-40 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-4 w-48 bg-gray-200 rounded-lg mt-1 animate-pulse" />
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse" />
        </div>
        <SkeletonBooking />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1a2f4f] flex items-center gap-2">
            <ShoppingCart size={24} className="text-[#10b981]" />
            Booking Saya
          </h1>
          <p className="text-sm text-gray-500 mt-1">Riwayat booking motor Anda</p>
        </div>
        <Link
          to="/katalog"
          className="flex items-center gap-2 bg-[#10b981] hover:bg-emerald-600 text-white font-semibold px-4 py-2.5 rounded-xl transition-all text-sm shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40"
        >
          <Plus size={18} />
          Booking Baru
        </Link>
      </div>

      {/* Statistik */}
      {bookings.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl shadow-sm p-3 border border-gray-100">
            <p className="text-xs text-gray-400">Total</p>
            <p className="text-xl font-bold text-[#1a2f4f]">{totalBookings}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-3 border border-gray-100">
            <p className="text-xs text-gray-400">Aktif</p>
            <p className="text-xl font-bold text-yellow-600">{activeBookings}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-3 border border-gray-100">
            <p className="text-xs text-gray-400">Selesai</p>
            <p className="text-xl font-bold text-emerald-600">{completedBookings}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-3 border border-gray-100">
            <p className="text-xs text-gray-400">Dibatalkan</p>
            <p className="text-xl font-bold text-red-600">{cancelledBookings}</p>
          </div>
        </div>
      )}

      {/* List Booking */}
      {bookings.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart size={40} className="text-gray-300" />
          </div>
          <p className="text-gray-500 font-medium">Belum ada booking</p>
          <p className="text-sm text-gray-400 mt-1">Mulai booking motor impian kamu sekarang</p>
          <Link 
            to="/katalog" 
            className="inline-flex items-center gap-2 mt-4 px-6 py-2.5 bg-[#10b981] hover:bg-emerald-600 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-emerald-500/20"
          >
            <Bike size={18} />
            Lihat Katalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {bookings.map((booking) => {
            const StatusIcon = STATUS_ICONS[booking.status] || Clock
            const statusColor = STATUS_BADGES[booking.status] || 'bg-gray-100 text-gray-700'
            
            return (
              <div 
                key={booking.id} 
                className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-semibold text-gray-800 text-base">
                        {booking.motor?.merk} {booking.motor?.tipe}
                      </h3>
                      <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium border ${statusColor}`}>
                        <StatusIcon size={12} />
                        {STATUS_LABELS[booking.status] || booking.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} className="text-[#10b981]" />
                        {formatDate(booking.tanggal_booking || booking.created_at)}
                      </span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full" />
                      <span className="flex items-center gap-1 capitalize">
                        💳 {booking.jenis_bayar || '-'}
                      </span>
                      {booking.pesan && (
                        <>
                          <span className="w-1 h-1 bg-gray-300 rounded-full" />
                          <span className="text-xs text-gray-400 truncate max-w-[150px]">
                            📝 {booking.pesan}
                          </span>
                        </>
                      )}
                    </div>
                    {booking.motor && (
                      <div className="text-xs text-gray-400 mt-1">
                        {booking.motor.tahun} · {booking.motor.warna}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/customer/bookings/${booking.id}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a2f4f] hover:bg-[#12223a] text-white rounded-lg text-xs font-semibold transition-colors"
                    >
                      <Eye size={14} />
                      Detail
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}