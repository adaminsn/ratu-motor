// src/pages/admin/Servis.jsx
import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Wrench, Search, Plus, Trash2, Filter,
  ChevronLeft, ChevronRight, X, Eye, ShieldAlert,
  AlertCircle, Calendar, Phone, CheckCircle2, PlayCircle, XCircle,
  Clock, User, MapPin, MessageCircle, Loader2
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
  menunggu: 'bg-amber-100 text-amber-800 border-amber-200',
  dikerjakan: 'bg-blue-100 text-blue-800 border-blue-200',
  selesai: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  batal: 'bg-gray-100 text-gray-800 border-gray-200'
}

const STATUS_LABELS = {
  menunggu: 'Menunggu',
  dikerjakan: 'Dikerjakan',
  selesai: 'Selesai',
  batal: 'Dibatalkan'
}

const STATUS_ICONS = {
  menunggu: Clock,
  dikerjakan: PlayCircle,
  selesai: CheckCircle2,
  batal: XCircle
}

// ===== SKELETON COMPONENTS =====

// Skeleton untuk Header
const SkeletonHeader = () => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-pulse">
    <div>
      <div className="h-8 w-40 bg-gray-200 rounded-lg" />
      <div className="h-4 w-64 bg-gray-200 rounded-lg mt-1" />
    </div>
    <div className="h-10 w-44 bg-gray-200 rounded-xl" />
  </div>
)

// Skeleton untuk Search
const SkeletonSearch = () => (
  <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col md:flex-row md:items-center gap-4 animate-pulse">
    <div className="flex-1 h-11 bg-gray-200 rounded-xl" />
    <div className="h-11 w-40 bg-gray-200 rounded-xl" />
  </div>
)

// Skeleton untuk Table
const SkeletonTable = () => (
  <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 animate-pulse">
    <div className="p-4 border-b border-gray-100">
      <div className="h-5 w-32 bg-gray-200 rounded" />
    </div>
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="p-4 border-b border-gray-100 flex items-center gap-4">
        <div className="flex-1">
          <div className="h-4 w-32 bg-gray-200 rounded" />
          <div className="h-3 w-24 bg-gray-200 rounded mt-1" />
        </div>
        <div className="h-4 w-28 bg-gray-200 rounded" />
        <div className="h-4 w-20 bg-gray-200 rounded" />
        <div className="h-4 w-24 bg-gray-200 rounded" />
        <div className="h-6 w-20 bg-gray-200 rounded-full" />
        <div className="flex gap-2">
          <div className="h-8 w-8 bg-gray-200 rounded-lg" />
          <div className="h-8 w-8 bg-gray-200 rounded-lg" />
        </div>
      </div>
    ))}
  </div>
)

export default function Servis() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [servisList, setServisList] = useState([])
  const [motorsTerjual, setMotorsTerjual] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [error, setError] = useState(null)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '')

  const [currentPage, setCurrentPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [total, setTotal] = useState(0)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedServisId, setSelectedServisId] = useState(null)
  const [selectedServis, setSelectedServis] = useState(null)

  const initialFormState = {
    motor_id: '',
    nama_pelanggan: '',
    no_hp: '',
    alamat: '',
    jenis_servis: '',
    keluhan: '',
    tanggal_servis: new Date().toISOString().split('T')[0],
    estimasi_selesai: '',
    catatan: ''
  }
  const [formData, setFormData] = useState(initialFormState)

  const fetchServis = useCallback(async () => {
    setLoading(true)
    try {
      const response = await api.get('/admin/servis', {
        params: {
          search: search,
          status: statusFilter,
          page: currentPage,
          per_page: 10
        }
      })
      setServisList(response.data?.data || [])
      setCurrentPage(response.data?.current_page || 1)
      setLastPage(response.data?.last_page || 1)
      setTotal(response.data?.total || 0)
      setError(null)
    } catch (err) {
      console.error('Error fetching servis:', err)
      setError('Gagal mengambil data booking servis.')
      toast.error('Gagal memuat data servis')
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, currentPage])

  const fetchMotorsTerjual = useCallback(async () => {
    try {
      const response = await api.get('/admin/transaksi', {
        params: { per_page: 100 }
      })
      const motors = (response.data?.data || [])
        .map(t => t.motor)
        .filter((motor, index, self) => 
          motor && self.findIndex(m => m?.id === motor.id) === index
        )
      setMotorsTerjual(motors)
    } catch (err) {
      console.error('Error fetching motors from transaksi:', err)
    }
  }, [])

  useEffect(() => {
    fetchServis()
  }, [fetchServis])

  useEffect(() => {
    fetchMotorsTerjual()
  }, [fetchMotorsTerjual])

  useEffect(() => {
    const statusParam = searchParams.get('status')
    if (statusParam !== null && statusParam !== statusFilter) {
      setStatusFilter(statusParam)
      setCurrentPage(1)
    }
  }, [searchParams])

  const handleStatusFilterChange = (val) => {
    setStatusFilter(val)
    setCurrentPage(1)
    if (val) {
      setSearchParams({ status: val })
    } else {
      searchParams.delete('status')
      setSearchParams(searchParams)
    }
  }

  const handleSearchChange = (e) => {
    setSearch(e.target.value)
    setCurrentPage(1)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const openCreateModal = () => {
    setFormData(initialFormState)
    setIsModalOpen(true)
  }

  const openDetailModal = (servis) => {
    setSelectedServis(servis)
    setIsDetailOpen(true)
  }

  const openDeleteModal = (servis) => {
    setSelectedServisId(servis.id)
    setSelectedServis(servis)
    setIsDeleteOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitLoading(true)
    try {
      await api.post('/admin/servis', formData)
      toast.success('Booking servis berhasil dibuat')
      setIsModalOpen(false)
      fetchServis()
    } catch (err) {
      console.error('Error submitting servis:', err)
      const errorMsg = err.response?.data?.message || 'Terjadi kesalahan sistem'
      toast.error(errorMsg)
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleDelete = async () => {
    setSubmitLoading(true)
    try {
      await api.delete(`/admin/servis/${selectedServisId}`)
      toast.success('Booking servis berhasil dihapus')
      setIsDeleteOpen(false)
      fetchServis()
    } catch (err) {
      console.error('Error deleting servis:', err)
      toast.error('Gagal menghapus booking servis')
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleStatusChange = async (servisId, newStatus) => {
    try {
      setSubmitLoading(true)
      
      console.log('📤 Updating status to:', newStatus)
      console.log('📤 Servis ID:', servisId)
      
      const response = await api.put(`/admin/servis/${servisId}`, { status: newStatus })
          
      const statusLabel = STATUS_LABELS[newStatus] || newStatus
      toast.success(`Status servis berubah menjadi "${statusLabel}"`)
      
      setServisList(prevList => 
        prevList.map(item => {
          if (item.id === servisId) {
            return { 
              ...item, 
              status: newStatus
            }
          }
          return item
        })
      )
      
    } catch (err) {
      console.error('❌ Error updating servis status:', err)
      console.error('❌ Error response:', err.response?.data)
      toast.error(err.response?.data?.message || 'Gagal memperbarui status servis')
    } finally {
      setSubmitLoading(false)
    }
  }

  const hasActiveFilters = search || statusFilter

  const renderStatusBadge = (status) => {
    const Icon = STATUS_ICONS[status] || Clock
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs border font-semibold px-2.5 py-1 rounded-full ${STATUS_BADGES[status]}`}>
        <Icon size={12} />
        {STATUS_LABELS[status]}
      </span>
    )
  }

  // ===== RENDER SKELETON SAAT LOADING =====
  if (loading) {
    return (
      <div className="space-y-4 md:space-y-6 pb-8">
        <SkeletonHeader />
        <SkeletonSearch />
        <SkeletonTable />
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6 pb-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1a2f4f] flex items-center gap-2">
            <Wrench size={24} className="text-[#10b981]" />
            Booking Servis
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola jadwal servis motor (khusus unit yang sudah terjual / garansi purnajual)
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 bg-[#10b981] hover:bg-emerald-600 text-white font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all duration-200"
        >
          <Plus size={18} />
          <span>Booking Servis Baru</span>
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama pelanggan, no HP, merk, atau tipe motor..."
            value={search}
            onChange={handleSearchChange}
            className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/10 outline-none text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilterChange(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2.5 outline-none text-sm bg-white focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/10"
          >
            <option value="">Semua Status</option>
            <option value="menunggu">Menunggu</option>
            <option value="dikerjakan">Dikerjakan</option>
            <option value="selesai">Selesai</option>
            <option value="batal">Dibatalkan</option>
          </select>
        </div>

        {hasActiveFilters && (
          <button
            onClick={() => {
              setSearch('')
              handleStatusFilterChange('')
            }}
            className="text-xs text-red-500 hover:text-red-700 font-semibold py-2 px-3 hover:bg-red-50 rounded-lg transition-colors whitespace-nowrap"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        {error ? (
          <div className="p-8 text-center text-red-500">
            <AlertCircle size={32} className="mx-auto mb-2" />
            <p>{error}</p>
            <button onClick={fetchServis} className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg text-xs">
              Muat Ulang
            </button>
          </div>
        ) : servisList.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">
            <Wrench size={48} className="mx-auto mb-3 text-gray-300" />
            <p>Belum ada booking servis</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">#</th>
                  <th className="px-6 py-4 font-semibold">Pelanggan</th>
                  <th className="px-6 py-4 font-semibold">Motor</th>
                  <th className="px-6 py-4 font-semibold">Jenis Servis</th>
                  <th className="px-6 py-4 font-semibold">Jadwal</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {servisList.map((servis, index) => (
                  <tr key={servis.id} className="hover:bg-gray-50/50 transition-colors text-sm text-gray-700">
                    <td className="px-6 py-4.5 text-xs text-gray-400">
                      {((currentPage - 1) * 10) + index + 1}
                    </td>

                    <td className="px-6 py-4.5">
                      <div className="font-semibold text-gray-800">{servis.nama_pelanggan}</div>
                      <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                        <Phone size={11} /> {servis.no_hp}
                      </div>
                    </td>

                    <td className="px-6 py-4.5">
                      <div className="font-medium text-gray-700">{servis.motor?.merk} {servis.motor?.tipe}</div>
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5">{servis.motor?.no_rangka}</div>
                    </td>

                    <td className="px-6 py-4.5">
                      <div className="font-medium">{servis.jenis_servis}</div>
                      {servis.keluhan && (
                        <div className="text-xs text-gray-400 mt-0.5 line-clamp-1 max-w-[180px]">{servis.keluhan}</div>
                      )}
                    </td>

                    <td className="px-6 py-4.5">
                      <div className="flex items-center gap-1 text-xs">
                        <Calendar size={11} className="text-[#10b981]" />
                        {formatDate(servis.tanggal_servis)}
                      </div>
                      {servis.estimasi_selesai && (
                        <div className="text-[10px] text-gray-400 mt-0.5">
                          Est. selesai: {formatDate(servis.estimasi_selesai)}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4.5">
                      {renderStatusBadge(servis.status)}
                    </td>

                    <td className="px-6 py-4.5">
                      <div className="flex flex-wrap items-center justify-end gap-1.5">
                        
                        {/* Status: MENUNGGU → Dikerjakan atau Batal */}
                        {servis.status === 'menunggu' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(servis.id, 'dikerjakan')}
                              className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded-lg transition-all duration-200 active:scale-[0.95]"
                              title="Mulai Dikerjakan"
                            >
                              <PlayCircle size={14} />
                              <span className="hidden sm:inline">Terima</span>
                            </button>
                            <button
                              onClick={() => handleStatusChange(servis.id, 'batal')}
                              className="flex items-center gap-1 px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-semibold rounded-lg transition-all duration-200 active:scale-[0.95]"
                              title="Batalkan"
                            >
                              <XCircle size={14} />
                              <span className="hidden sm:inline">Batal</span>
                            </button>
                          </>
                        )}

                        {/* Status: DIKERJAKAN → Selesai atau Batal */}
                        {servis.status === 'dikerjakan' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(servis.id, 'selesai')}
                              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg transition-all duration-200 active:scale-[0.95]"
                              title="Tandai Selesai"
                            >
                              <CheckCircle2 size={14} />
                              <span className="hidden sm:inline">Selesai</span>
                            </button>
                            <button
                              onClick={() => handleStatusChange(servis.id, 'batal')}
                              className="flex items-center gap-1 px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-semibold rounded-lg transition-all duration-200 active:scale-[0.95]"
                              title="Batalkan"
                            >
                              <XCircle size={14} />
                              <span className="hidden sm:inline">Batal</span>
                            </button>
                          </>
                        )}

                        {/* Status: SELESAI → Tidak ada aksi, hanya detail & hapus */}
                        {servis.status === 'selesai' && (
                          <span className="text-xs text-emerald-600 font-medium px-2 py-1">
                            ✓ Selesai
                          </span>
                        )}

                        {/* Status: BATAL → Tidak ada aksi, hanya detail & hapus */}
                        {servis.status === 'batal' && (
                          <span className="text-xs text-gray-500 font-medium px-2 py-1">
                            ✗ Dibatalkan
                          </span>
                        )}

                        {/* Tombol Detail & Hapus (selalu muncul) */}
                        <button
                          onClick={() => openDetailModal(servis)}
                          className="p-1.5 text-gray-400 hover:text-[#10b981] rounded-lg hover:bg-gray-100 transition-colors"
                          title="Detail"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => openDeleteModal(servis)}
                          className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100 transition-colors"
                          title="Hapus"
                        >
                          <Trash2 size={16} />
                        </button>

                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {total > 0 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <div>
              Menampilkan <span className="font-semibold text-gray-700">{servisList.length}</span> dari <span className="font-semibold text-gray-700">{total}</span> booking
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1 || loading}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="font-medium">
                Halaman {currentPage} dari {lastPage}
              </span>
              <button
                disabled={currentPage === lastPage || loading}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, lastPage))}
                className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 disabled:opacity-40 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ===== MODAL: BOOKING SERVIS BARU ===== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">

            <div className="bg-[#1a2f4f] text-white px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Wrench size={20} className="text-[#10b981]" />
                <span>Booking Servis Baru</span>
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-white/60 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">

              <div className="grid grid-cols-2 gap-4">

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Unit Motor (khusus yang sudah terjual) *</label>
                  <select
                    name="motor_id"
                    required
                    value={formData.motor_id}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981]/20 outline-none text-sm"
                  >
                    <option value="">-- Pilih Motor --</option>
                    {motorsTerjual.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.merk} {m.tipe} · {m.no_rangka}
                      </option>
                    ))}
                  </select>
                  {motorsTerjual.length === 0 && (
                    <p className="text-[10px] text-amber-600 mt-1">Belum ada motor berstatus "terjual" di sistem.</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Nama Pelanggan *</label>
                  <input
                    type="text"
                    name="nama_pelanggan"
                    required
                    placeholder="Nama pemilik motor"
                    value={formData.nama_pelanggan}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-[#10b981] outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">No. HP *</label>
                  <input
                    type="text"
                    name="no_hp"
                    required
                    placeholder="08xxxxxxxxxx"
                    value={formData.no_hp}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-[#10b981] outline-none text-sm"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Alamat</label>
                  <input
                    type="text"
                    name="alamat"
                    placeholder="Alamat pelanggan (opsional)"
                    value={formData.alamat}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-[#10b981] outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Jenis Servis *</label>
                  <input
                    type="text"
                    name="jenis_servis"
                    required
                    placeholder="Contoh: Ganti Oli, Servis Rutin"
                    value={formData.jenis_servis}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-[#10b981] outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Tanggal Servis *</label>
                  <input
                    type="date"
                    name="tanggal_servis"
                    required
                    value={formData.tanggal_servis}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-[#10b981] outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Estimasi Selesai</label>
                  <input
                    type="date"
                    name="estimasi_selesai"
                    value={formData.estimasi_selesai}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-[#10b981] outline-none text-sm"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Keluhan</label>
                  <textarea
                    name="keluhan"
                    rows={2}
                    placeholder="Keluhan atau kebutuhan servis dari pelanggan"
                    value={formData.keluhan}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-[#10b981] outline-none text-sm resize-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Catatan Tambahan</label>
                  <textarea
                    name="catatan"
                    rows={2}
                    placeholder="Catatan internal (opsional)"
                    value={formData.catatan}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-[#10b981] outline-none text-sm resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 text-sm font-semibold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="px-5 py-2 bg-[#10b981] hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl text-sm font-semibold shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center gap-2"
                >
                  {submitLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                  {submitLoading ? 'Menyimpan...' : 'Buat Booking'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ===== MODAL: DETAIL SERVIS ===== */}
      {isDetailOpen && selectedServis && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">

            <div className="bg-[#1a2f4f] text-white px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Eye size={20} className="text-[#10b981]" />
                <span>Detail Booking Servis</span>
              </h2>
              <button onClick={() => setIsDetailOpen(false)} className="text-white/60 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm text-gray-700">

              <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-[#1a2f4f]/10 text-[#1a2f4f] rounded-full flex items-center justify-center font-bold text-lg">
                  {selectedServis.nama_pelanggan ? selectedServis.nama_pelanggan[0].toUpperCase() : 'P'}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-base">{selectedServis.nama_pelanggan}</h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Phone size={11} /> {selectedServis.no_hp}
                  </p>
                </div>
                <div className={`ml-auto border font-bold px-2.5 py-0.5 rounded-full text-xs ${STATUS_BADGES[selectedServis.status]}`}>
                  {STATUS_LABELS[selectedServis.status]}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                <div className="col-span-2">
                  <p className="text-[10px] text-gray-400 uppercase font-semibold">Unit Motor</p>
                  <p className="font-medium">{selectedServis.motor?.merk} {selectedServis.motor?.tipe}</p>
                  <p className="text-xs text-gray-400 font-mono">{selectedServis.motor?.no_rangka}</p>
                </div>

                {selectedServis.alamat && (
                  <div className="col-span-2">
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">Alamat</p>
                    <p className="font-medium">{selectedServis.alamat}</p>
                  </div>
                )}

                <div className="col-span-2 border-t border-gray-100 my-1" />

                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-semibold">Jenis Servis</p>
                  <p className="font-medium">{selectedServis.jenis_servis}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-semibold flex items-center gap-1">
                    <Calendar size={12} className="text-[#10b981]" /> Tanggal Servis
                  </p>
                  <p className="font-medium">{formatDate(selectedServis.tanggal_servis)}</p>
                </div>

                {selectedServis.estimasi_selesai && (
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">Estimasi Selesai</p>
                    <p className="font-medium">{formatDate(selectedServis.estimasi_selesai)}</p>
                  </div>
                )}

                {selectedServis.keluhan && (
                  <div className="col-span-2">
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">Keluhan</p>
                    <p className="font-medium">{selectedServis.keluhan}</p>
                  </div>
                )}

                {selectedServis.catatan && (
                  <div className="col-span-2">
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">Catatan</p>
                    <p className="font-medium">{selectedServis.catatan}</p>
                  </div>
                )}

                <div className="col-span-2 border-t border-gray-100 my-1" />

                <div className="col-span-2">
                  <p className="text-[10px] text-gray-400 uppercase font-semibold">Ditangani Oleh</p>
                  <p className="font-medium">{selectedServis.user?.name || '-'}</p>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-100">
                <button
                  onClick={() => setIsDetailOpen(false)}
                  className="px-5 py-2 bg-[#1a2f4f] text-white rounded-xl text-xs font-semibold hover:bg-[#12223a] transition-colors"
                >
                  Tutup
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL: CONFIRM DELETE ===== */}
      {isDeleteOpen && selectedServis && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 border border-gray-100 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <ShieldAlert size={24} />
            </div>
            <h3 className="font-bold text-gray-800 text-lg">Hapus Booking Servis?</h3>
            <p className="text-gray-500 text-xs mt-2 leading-relaxed">
              Apakah Anda yakin ingin menghapus booking servis <span className="font-semibold text-gray-700">{selectedServis.nama_pelanggan}</span> untuk motor <span className="font-semibold text-gray-700">{selectedServis.motor?.merk} {selectedServis.motor?.tipe}</span>? Tindakan ini bersifat permanen.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsDeleteOpen(false)}
                disabled={submitLoading}
                className="flex-1 px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl text-xs font-semibold transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={submitLoading}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-lg shadow-red-500/10 transition-colors flex items-center justify-center gap-2"
              >
                {submitLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                {submitLoading ? 'Menghapus...' : 'Hapus Booking'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}