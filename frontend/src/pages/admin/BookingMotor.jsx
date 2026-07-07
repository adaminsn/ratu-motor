// src/pages/admin/BookingMotor.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Calendar, Search, Filter, ChevronLeft, ChevronRight,
  Eye, Check, X, CheckCircle, XCircle,
  Plus, Phone, User, Clock
} from 'lucide-react'
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
  menunggu: 'Menunggu',
  dikonfirmasi: 'Dikonfirmasi',
  selesai: 'Selesai',
  dibatal: 'Dibatalkan'
}

export default function BookingMotor() {
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const response = await api.get('/admin/bookings', {
        params: {
          search: search,
          status: statusFilter,
          page: currentPage,
          per_page: 10
        }
      })
      setBookings(response.data?.data || [])
      setCurrentPage(response.data?.current_page || 1)
      setLastPage(response.data?.last_page || 1)
      setTotal(response.data?.total || 0)
    } catch (err) {
      console.error('Error fetching bookings:', err)
      toast.error('Gagal memuat data booking')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [search, statusFilter, currentPage])

  const handleConfirm = async (bookingId) => {
    setSubmitLoading(true)
    try {
      await api.patch(`/admin/bookings/${bookingId}/confirm`)
      toast.success('Booking berhasil dikonfirmasi')
      fetchBookings()
    } catch (err) {
      console.error('Error confirming booking:', err)
      toast.error(err.response?.data?.message || 'Gagal mengonfirmasi booking')
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleComplete = async (bookingId) => {
    setSubmitLoading(true)
    try {
      await api.patch(`/admin/bookings/${bookingId}/complete`)
      toast.success('Booking ditandai selesai')
      fetchBookings()
    } catch (err) {
      console.error('Error completing booking:', err)
      toast.error(err.response?.data?.message || 'Gagal menyelesaikan booking')
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleCancel = async (bookingId) => {
    setSubmitLoading(true)
    try {
      await api.patch(`/admin/bookings/${bookingId}/cancel`)
      toast.success('Booking berhasil dibatalkan')
      fetchBookings()
    } catch (err) {
      console.error('Error cancelling booking:', err)
      toast.error(err.response?.data?.message || 'Gagal membatalkan booking')
    } finally {
      setSubmitLoading(false)
    }
  }

  const openDetail = (booking) => {
    setSelectedBooking(booking)
    setIsDetailOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-[#1a2f4f] border-t-[#f97316] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6 pb-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1a2f4f] flex items-center gap-2">
            <Calendar size={24} className="text-[#f97316]" />
            Booking Motor
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola booking pembelian motor dari customer
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/bookings/create')}
          className="flex items-center gap-2 bg-[#f97316] hover:bg-orange-600 text-white font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-orange-500/10 transition-all"
        >
          <Plus size={18} />
          <span>Booking Baru</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama customer atau motor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl focus:border-[#1a2f4f] outline-none text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2.5 outline-none text-sm bg-white focus:border-[#1a2f4f]"
          >
            <option value="">Semua Status</option>
            <option value="menunggu">🟡 Menunggu</option>
            <option value="dikonfirmasi">🔵 Dikonfirmasi</option>
            <option value="selesai">🟢 Selesai</option>
            <option value="dibatal">🔴 Dibatalkan</option>
          </select>
        </div>
        {statusFilter && (
          <button
            onClick={() => setStatusFilter('')}
            className="text-xs text-red-500 hover:text-red-700 font-semibold"
          >
            Clear Filter
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        {bookings.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">
            <Calendar size={48} className="mx-auto mb-3 text-gray-300" />
            <p>Belum ada booking motor</p>
            <p className="text-xs mt-1">Customer yang booking motor akan muncul di sini</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Customer</th>
                  <th className="px-6 py-4 font-semibold">Motor</th>
                  <th className="px-6 py-4 font-semibold">Tanggal</th>
                  <th className="px-6 py-4 font-semibold">Pembayaran</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {bookings.map((booking) => {
                  // Pastikan data ada
                  const namaPembeli = booking.nama_pembeli || booking.customer?.nama || 'Belum diisi'
                  const noHp = booking.no_hp || booking.customer?.no_hp || '-'
                  const tanggalBooking = booking.tanggal_booking || booking.created_at
                  const jenisBayar = booking.jenis_bayar || '-'
                  const status = booking.status || 'menunggu'
                  const motor = booking.motor || {}

                  return (
                    <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-800">
                          {namaPembeli}
                        </div>
                        <div className="text-xs text-gray-400">
                          {noHp}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-800">
                          {motor.merk || 'Unknown'} {motor.tipe || ''}
                        </div>
                        <div className="text-xs text-gray-400">
                          {motor.warna || ''} {motor.tahun ? '· ' + motor.tahun : ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {formatDate(tanggalBooking)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                          {jenisBayar}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium border ${STATUS_BADGES[status] || STATUS_BADGES.menunggu}`}>
                          {STATUS_LABELS[status] || 'Menunggu'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {booking.status === 'menunggu' && (
                            <>
                              <button
                                onClick={() => handleConfirm(booking.id)}
                                className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-semibold"
                              >
                                Konfirmasi
                              </button>
                              <button
                                onClick={() => handleCancel(booking.id)}
                                className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-semibold"
                              >
                                Batalkan
                              </button>
                            </>
                          )}
                          {booking.status === 'dikonfirmasi' && (
                            <>
                              <button
                                onClick={() => handleComplete(booking.id)}
                                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold"
                              >
                                Tandai Selesai
                              </button>
                              <button
                                onClick={() => handleCancel(booking.id)}
                                className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-semibold"
                              >
                                Batalkan
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => openDetail(booking)}
                            className="p-1.5 text-gray-400 hover:text-[#1a2f4f] rounded-lg hover:bg-gray-100 transition-colors"
                            title="Detail Booking"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {total > 0 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <div>
              Menampilkan <span className="font-semibold text-gray-700">{bookings.length}</span> dari <span className="font-semibold text-gray-700">{total}</span> booking
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1 || loading}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
              <span>Halaman {currentPage} dari {lastPage}</span>
              <button
                disabled={currentPage === lastPage || loading}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, lastPage))}
                className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Detail */}
      {isDetailOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">

            <div className="bg-[#1a2f4f] text-white px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Calendar size={20} className="text-[#f97316]" />
                <span>Detail Booking</span>
              </h2>
              <button onClick={() => setIsDetailOpen(false)} className="text-white/60 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm text-gray-700">

              <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-[#1a2f4f]/10 text-[#1a2f4f] rounded-full flex items-center justify-center font-bold text-lg">
                  {(selectedBooking.nama_pembeli || selectedBooking.customer?.nama || 'P')[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-base">
                    {selectedBooking.nama_pembeli || selectedBooking.customer?.nama || 'Belum diisi'}
                  </h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Phone size={11} /> {selectedBooking.no_hp || selectedBooking.customer?.no_hp || '-'}
                  </p>
                </div>
                <div className={`ml-auto border font-bold px-2.5 py-0.5 rounded-full text-xs ${STATUS_BADGES[selectedBooking.status] || STATUS_BADGES.menunggu}`}>
                  {STATUS_LABELS[selectedBooking.status] || 'Menunggu'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                <div className="col-span-2">
                  <p className="text-[10px] text-gray-400 uppercase font-semibold">Unit Motor</p>
                  <p className="font-medium">
                    {selectedBooking.motor?.merk || 'Unknown'} {selectedBooking.motor?.tipe || ''}
                  </p>
                  <p className="text-xs text-gray-400">
                    {selectedBooking.motor?.warna || ''} {selectedBooking.motor?.tahun ? '· ' + selectedBooking.motor.tahun : ''}
                  </p>
                </div>

                {selectedBooking.alamat && (
                  <div className="col-span-2">
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">Alamat</p>
                    <p className="font-medium">{selectedBooking.alamat}</p>
                  </div>
                )}

                <div className="col-span-2 border-t border-gray-100 my-1" />

                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-semibold">Tanggal Booking</p>
                  <p className="font-medium">{formatDate(selectedBooking.tanggal_booking || selectedBooking.created_at)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-semibold">Metode Pembayaran</p>
                  <p className="font-medium capitalize">{selectedBooking.jenis_bayar || '-'}</p>
                </div>

                {selectedBooking.pesan && (
                  <div className="col-span-2">
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">Pesan / Catatan</p>
                    <p className="font-medium text-gray-700">{selectedBooking.pesan}</p>
                  </div>
                )}

                <div className="col-span-2 border-t border-gray-100 my-1" />

                <div className="col-span-2">
                  <p className="text-[10px] text-gray-400 uppercase font-semibold">Dibuat oleh</p>
                  <p className="font-medium">{selectedBooking.user?.name || '-'}</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                {selectedBooking.status === 'menunggu' && (
                  <>
                    <button
                      onClick={() => {
                        handleConfirm(selectedBooking.id)
                        setIsDetailOpen(false)
                      }}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs font-semibold"
                    >
                      Konfirmasi
                    </button>
                    <button
                      onClick={() => {
                        handleCancel(selectedBooking.id)
                        setIsDetailOpen(false)
                      }}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-semibold"
                    >
                      Batalkan
                    </button>
                  </>
                )}
                {selectedBooking.status === 'dikonfirmasi' && (
                  <>
                    <button
                      onClick={() => {
                        handleComplete(selectedBooking.id)
                        setIsDetailOpen(false)
                      }}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold"
                    >
                      Tandai Selesai
                    </button>
                    <button
                      onClick={() => {
                        handleCancel(selectedBooking.id)
                        setIsDetailOpen(false)
                      }}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-semibold"
                    >
                      Batalkan
                    </button>
                  </>
                )}
                <button
                  onClick={() => setIsDetailOpen(false)}
                  className="px-5 py-2 bg-[#1a2f4f] text-white rounded-xl text-xs font-semibold hover:bg-[#12223a]"
                >
                  Tutup
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  )
}