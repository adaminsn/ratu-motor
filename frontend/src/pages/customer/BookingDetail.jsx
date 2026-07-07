// src/pages/customer/BookingDetail.jsx
import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, Phone, User, Bike, CreditCard, Clock, CheckCircle, XCircle, Shield, Info, MapPin, Package, FileText, AlertCircle } from 'lucide-react'
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
  dibatal: 'bg-red-100 text-red-700 border-red-200'
}

const STATUS_LABELS = {
  menunggu: 'Menunggu Konfirmasi',
  dikonfirmasi: 'Dikonfirmasi',
  selesai: 'Selesai',
  dibatal: 'Dibatalkan'
}

const STATUS_ICONS = {
  menunggu: Clock,
  dikonfirmasi: CheckCircle,
  selesai: CheckCircle,
  dibatal: XCircle
}

export default function BookingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await api.get(`/customer/bookings/${id}`)
        console.log('📦 Booking data:', response.data)
        setBooking(response.data)
      } catch (err) {
        console.error('Error fetching booking:', err)
        toast.error('Gagal memuat detail booking')
        navigate('/customer/booking')
      } finally {
        setLoading(false)
      }
    }
    fetchBooking()
  }, [id, navigate])

  const handleCancel = async () => {
    if (!confirm('Yakin ingin membatalkan booking ini?')) return
    
    setCancelling(true)
    try {
      console.log('🔄 Cancelling booking ID:', id)
      
      // Gunakan PATCH sesuai route
      const response = await api.patch(`/customer/bookings/${id}/cancel`)
      
      console.log('✅ Cancel response:', response.data)
      toast.success('Booking berhasil dibatalkan')
      navigate('/customer/booking')
    } catch (err) {
      console.error('❌ Error cancelling booking:', err)
      console.error('Response status:', err.response?.status)
      console.error('Response data:', err.response?.data)
      
      const errorMessage = err.response?.data?.message || 
                         err.response?.data?.error || 
                         'Gagal membatalkan booking'
      toast.error(errorMessage)
    } finally {
      setCancelling(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-[#1a2f4f] border-t-[#10b981] rounded-full animate-spin" />
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Booking tidak ditemukan</p>
        <Link to="/customer/booking" className="text-[#10b981] hover:underline mt-2 inline-block">
          Kembali ke Booking
        </Link>
      </div>
    )
  }

  // Ambil data customer dari berbagai sumber
  const customerName = booking.nama_pembeli || booking.nama_pelanggan || booking.user?.name || 'Tidak diketahui'
  const customerPhone = booking.no_hp || booking.user?.no_hp || 'Tidak tersedia'
  const customerAddress = booking.alamat || booking.user?.alamat || 'Tidak tersedia'

  const StatusIcon = STATUS_ICONS[booking.status] || Clock

  // Cek apakah booking sudah selesai atau dikonfirmasi (boleh lihat no rangka & mesin)
  const canSeeIdentity = booking.status === 'selesai' || booking.status === 'dikonfirmasi'

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Back Button */}
      <Link to="/customer/booking" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#10b981] transition-colors group">
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        Kembali ke Booking
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1a2f4f] flex items-center gap-2">
            <Calendar size={24} className="text-[#10b981]" />
            Detail Booking
          </h1>
          <p className="text-sm text-gray-500 mt-1">ID Booking: #{booking.id}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${STATUS_BADGES[booking.status] || 'bg-gray-100 text-gray-700'}`}>
            <StatusIcon size={14} />
            {STATUS_LABELS[booking.status] || booking.status}
          </span>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <div className="p-6 space-y-6">
          
          {/* Customer Data */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <User size={16} className="text-[#10b981]" />
              Data Customer
            </h3>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <span className="text-gray-500 text-sm">Nama</span>
                <span className="font-medium text-gray-800">{customerName}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <span className="text-gray-500 text-sm">No HP</span>
                <span className="font-medium text-gray-800">{customerPhone}</span>
              </div>
              {customerAddress && customerAddress !== 'Tidak tersedia' && (
                <div className="flex flex-col sm:flex-row sm:justify-between">
                  <span className="text-gray-500 text-sm">Alamat</span>
                  <span className="font-medium text-gray-800">{customerAddress}</span>
                </div>
              )}
            </div>
          </div>

          {/* Motor Data */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Bike size={16} className="text-[#10b981]" />
              Unit Motor
            </h3>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <span className="text-gray-500 text-sm">Motor</span>
                <span className="font-medium text-gray-800">
                  {booking.motor?.merk} {booking.motor?.tipe}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <span className="text-gray-500 text-sm">Tahun / Warna</span>
                <span className="font-medium text-gray-800 capitalize">
                  {booking.motor?.tahun} · {booking.motor?.warna}
                </span>
              </div>
              {booking.motor?.no_polisi && (
                <div className="flex flex-col sm:flex-row sm:justify-between">
                  <span className="text-gray-500 text-sm">No. Polisi</span>
                  <span className="font-mono font-medium text-gray-800">{booking.motor.no_polisi}</span>
                </div>
              )}

              {/* ===== NO RANGKA & NO MESIN (HANYA TAMPIL JIKA SELESAI/DIKONFIRMASI) ===== */}
              {canSeeIdentity ? (
                <>
                  {booking.motor?.no_rangka && (
                    <div className="flex flex-col sm:flex-row sm:justify-between border-t border-gray-200 pt-2 mt-2">
                      <span className="text-gray-500 text-sm flex items-center gap-1">
                        <Shield size={14} className="text-[#10b981]" />
                        No. Rangka
                      </span>
                      <span className="font-mono font-semibold text-gray-800 bg-white px-3 py-1 rounded-lg border border-gray-200">
                        {booking.motor.no_rangka}
                      </span>
                    </div>
                  )}
                  {booking.motor?.no_mesin && (
                    <div className="flex flex-col sm:flex-row sm:justify-between">
                      <span className="text-gray-500 text-sm flex items-center gap-1">
                        <FileText size={14} className="text-[#10b981]" />
                        No. Mesin
                      </span>
                      <span className="font-mono font-semibold text-gray-800 bg-white px-3 py-1 rounded-lg border border-gray-200">
                        {booking.motor.no_mesin}
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 mt-2">
                  <AlertCircle size={18} className="text-amber-500 flex-shrink-0" />
                  <p className="text-sm text-amber-700">
                    No. Rangka dan No. Mesin akan ditampilkan setelah booking {booking.status === 'menunggu' ? 'dikonfirmasi' : 'selesai'}.
                  </p>
                </div>
              )}

              {booking.motor?.bpkb && (
                <div className="flex flex-col sm:flex-row sm:justify-between">
                  <span className="text-gray-500 text-sm flex items-center gap-1">
                    <Package size={14} className="text-[#10b981]" />
                    BPKB
                  </span>
                  <span className="font-medium text-gray-800">{booking.motor.bpkb}</span>
                </div>
              )}
            </div>
          </div>

          {/* Booking Detail */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <CreditCard size={16} className="text-[#10b981]" />
              Detail Booking
            </h3>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <span className="text-gray-500 text-sm">Tanggal Booking</span>
                <span className="font-medium text-gray-800">
                  {formatDate(booking.tanggal_booking || booking.created_at)}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <span className="text-gray-500 text-sm">Metode Pembayaran</span>
                <span className="font-medium text-gray-800 capitalize">{booking.jenis_bayar || '-'}</span>
              </div>
              {booking.pesan && (
                <div className="flex flex-col sm:flex-row sm:justify-between">
                  <span className="text-gray-500 text-sm">Catatan</span>
                  <span className="font-medium text-gray-800">{booking.pesan}</span>
                </div>
              )}
              <div className="flex flex-col sm:flex-row sm:justify-between border-t border-gray-200 pt-2 mt-2">
                <span className="text-gray-500 text-sm">Dibuat pada</span>
                <span className="font-medium text-gray-800">{formatDate(booking.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
            {booking.status === 'menunggu' && (
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {cancelling ? 'Membatalkan...' : 'Batalkan Booking'}
              </button>
            )}

            <Link
              to="/customer/booking"
              className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-lg text-sm font-semibold transition-colors"
            >
              Kembali
            </Link>
          </div>

          {/* Info Note */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-3">
            <Info size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-emerald-700">
              {canSeeIdentity 
                ? 'No. Rangka dan No. Mesin adalah identitas unik motor. Simpan baik-baik untuk keperluan administrasi.'
                : 'No. Rangka dan No. Mesin akan ditampilkan setelah booking dikonfirmasi atau selesai.'}
            </p>
          </div>

        </div>
      </div>

    </div>
  )
}