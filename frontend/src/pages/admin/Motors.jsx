import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { 
  Car, Search, Plus, Edit2, Trash2, Filter, 
  ChevronLeft, ChevronRight, X, Eye, ShieldAlert,
  AlertCircle, DollarSign, Calendar, RefreshCw
} from 'lucide-react'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import useAuthStore from '../../store/authStore'

const formatRupiah = (value) => {
  if (!value) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value)
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

// ===== FUNGSI GET PHOTO URL =====
const getPhotoUrl = (path) => {
  if (!path) return ''
  
  // Jika sudah URL lengkap, langsung return
  if (path.startsWith('http')) return path
  
  // Base URL untuk akses file
  const baseUrl = 'http://127.0.0.1:8000'
  
  // Hapus 'storage/' di depan jika ada
  let cleanPath = path.replace(/^storage\//, '')
  
  return `${baseUrl}/storage/${cleanPath}`
}

const STATUS_BADGES = {
  tersedia: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  reserved: 'bg-amber-100 text-amber-800 border-amber-200',
  terjual: 'bg-gray-100 text-gray-800 border-gray-200'
}

export default function Motors({ openCreate = false }) {
  const { user } = useAuthStore()
  const userRole = user?.roles?.[0]?.name || user?.role || null
  const isKasir = userRole === 'kasir'

  const [searchParams, setSearchParams] = useSearchParams()
  const [motors, setMotors] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [error, setError] = useState(null)
  
  // Search & Filter States
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '')
  const [merkFilter, setMerkFilter] = useState('')
  const [tahunFilter, setTahunFilter] = useState('')
  const [hargaMin, setHargaMin] = useState('')
  const [hargaMax, setHargaMax] = useState('')
  const [showMoreFilters, setShowMoreFilters] = useState(false)
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [perPage, setPerPage] = useState(10)

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(openCreate)
  const [modalMode, setModalMode] = useState(openCreate ? 'create' : 'create')
  const [selectedMotorId, setSelectedMotorId] = useState(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [selectedMotor, setSelectedMotor] = useState(null)

  // Foto States
  const [selectedFiles, setSelectedFiles] = useState([])
  const [previewUrls, setPreviewUrls] = useState([])
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [motorPhotos, setMotorPhotos] = useState([])

  // Form State
  const initialFormState = {
    supplier_id: '',
    merk: '',
    tipe: '',
    tahun: new Date().getFullYear(),
    warna: '',
    kondisi: 'bekas',
    no_rangka: '',
    no_mesin: '',
    no_polisi: '',
    bpkb: '',
    harga_beli: '',
    harga_jual: '',
    harga_minimal: '',
    status: 'tersedia',
    tanggal_masuk: new Date().toISOString().split('T')[0]
  }
  const [formData, setFormData] = useState(initialFormState)

  // Fetch data motor
  const fetchMotors = useCallback(async () => {
    setLoading(true)
    try {
      const response = await api.get('/admin/motors', {
        params: {
          search: search,
          status: statusFilter,
          merk: merkFilter,
          tahun: tahunFilter,
          harga_min: hargaMin,
          harga_max: hargaMax,
          page: currentPage,
          per_page: perPage
        }
      })
      
      setMotors(response.data?.data || [])
      setCurrentPage(response.data?.current_page || 1)
      setLastPage(response.data?.last_page || 1)
      setTotal(response.data?.total || 0)
      setError(null)
    } catch (err) {
      console.error('Error fetching motors:', err)
      setError('Gagal mengambil data stok motor.')
      toast.error('Gagal memuat data motor')
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, merkFilter, tahunFilter, hargaMin, hargaMax, currentPage, perPage])

  // Fetch data supplier (untuk dropdown)
  const fetchSuppliers = useCallback(async () => {
    try {
      const response = await api.get('/admin/suppliers', {
        params: { per_page: 100 }
      })
      setSuppliers(response.data?.data || [])
    } catch (err) {
      console.error('Error fetching suppliers:', err)
    }
  }, [])

  // Fetch motor photos
  const fetchMotorPhotos = useCallback(async (motorId) => {
    try {
      const response = await api.get(`/admin/motors/${motorId}`)
      setMotorPhotos(response.data?.motor?.photos || [])
    } catch (err) {
      console.error('Error fetching motor photos:', err)
    }
  }, [])

  useEffect(() => {
    fetchMotors()
  }, [fetchMotors])

  useEffect(() => {
    fetchSuppliers()
  }, [fetchSuppliers])

  // Sync status query param with state
  useEffect(() => {
    const statusParam = searchParams.get('status')
    if (statusParam !== null && statusParam !== statusFilter) {
      setStatusFilter(statusParam)
      setCurrentPage(1)
    }
  }, [searchParams])

  // Handle filter changes
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

  const handleMerkFilterChange = (val) => {
    setMerkFilter(val)
    setCurrentPage(1)
  }

  const handleTahunFilterChange = (val) => {
    if (val && Number(val) < 1980) {
      setTahunFilter('')
      return
    }
    if (val && Number(val) > new Date().getFullYear() + 5) {
      setTahunFilter('')
      return
    }
    setTahunFilter(val)
    setCurrentPage(1)
  }

  const handleHargaMinChange = (val) => {
    if (val && Number(val) < 0) return
    setHargaMin(val)
    setCurrentPage(1)
  }

  const handleHargaMaxChange = (val) => {
    if (val && Number(val) < 0) return
    setHargaMax(val)
    setCurrentPage(1)
  }

  const handlePerPageChange = (val) => {
    setPerPage(Number(val))
    setCurrentPage(1)
  }

  const handleClearAllFilters = () => {
    setSearch('')
    setStatusFilter('')
    setMerkFilter('')
    setTahunFilter('')
    setHargaMin('')
    setHargaMax('')
    setCurrentPage(1)
    searchParams.delete('status')
    setSearchParams(searchParams)
  }

  // Handle Form Inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // ===== PHOTO HANDLERS =====
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    
    if (files.length + selectedFiles.length > 10) {
      toast.error('Maksimal 10 foto per motor')
      return
    }

    const validFiles = files.filter(file => {
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
        toast.error(`${file.name} bukan format gambar yang didukung`)
        return false
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} terlalu besar (maks 5MB)`)
        return false
      }
      return true
    })

    setSelectedFiles(prev => [...prev, ...validFiles])
    
    const newPreviews = validFiles.map(file => URL.createObjectURL(file))
    setPreviewUrls(prev => [...prev, ...newPreviews])
  }

  const removeSelectedFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    setPreviewUrls(prev => {
      URL.revokeObjectURL(prev[index])
      return prev.filter((_, i) => i !== index)
    })
  }

  const uploadPhotosForMotor = async (motorId) => {
    if (selectedFiles.length === 0) return

    setUploadingPhoto(true)
    try {
      const formData = new FormData()
      selectedFiles.forEach(file => {
        formData.append('photos[]', file)
      })

      await api.post(`/admin/motors/${motorId}/photos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      toast.success('Foto berhasil diupload')
      setSelectedFiles([])
      previewUrls.forEach(url => URL.revokeObjectURL(url))
      setPreviewUrls([])
    } catch (err) {
      console.error('Error uploading photos:', err)
      toast.error('Gagal mengupload foto')
    } finally {
      setUploadingPhoto(false)
    }
  }

  // Open Create Modal
  const openCreateModal = () => {
    setModalMode('create')
    setFormData(initialFormState)
    setSelectedFiles([])
    setPreviewUrls([])
    setMotorPhotos([])
    setIsModalOpen(true)
  }

  const openEditModal = (motor) => {
    setModalMode('edit')
    setSelectedMotorId(motor.id)
    setFormData({
      supplier_id: motor.supplier_id || '',
      merk: motor.merk || '',
      tipe: motor.tipe || '',
      tahun: motor.tahun || new Date().getFullYear(),
      warna: motor.warna || '',
      kondisi: motor.kondisi || 'bekas',
      no_rangka: motor.no_rangka || '',
      no_mesin: motor.no_mesin || '',
      no_polisi: motor.no_polisi || '',
      bpkb: motor.bpkb || '',
      harga_beli: motor.harga_beli || '',
      harga_jual: motor.harga_jual || '',
      harga_minimal: motor.harga_minimal || '',
      status: motor.status || 'tersedia',
      tanggal_masuk: motor.tanggal_masuk || new Date().toISOString().split('T')[0]
    })
    setSelectedFiles([])
    setPreviewUrls([])
    fetchMotorPhotos(motor.id)
    setIsModalOpen(true)
  }

  // Open Detail View
  const openDetailModal = (motor) => {
    setSelectedMotor(motor)
    setIsDetailOpen(true)
  }

  // Open Delete Confirm
  const openDeleteModal = (motor) => {
    setSelectedMotorId(motor.id)
    setSelectedMotor(motor)
    setIsDeleteOpen(true)
  }

  // Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitLoading(true)
    try {
      let motorId = selectedMotorId

      if (modalMode === 'create') {
        const response = await api.post('/admin/motors', formData)
        motorId = response.data.motor.id
        toast.success('Motor baru berhasil ditambahkan')
      } else {
        await api.put(`/admin/motors/${selectedMotorId}`, formData)
        toast.success('Informasi motor berhasil diperbarui')
      }

      // Upload foto kalau ada yang dipilih
      if (selectedFiles.length > 0 && motorId) {
        await uploadPhotosForMotor(motorId)
      }

      setIsModalOpen(false)
      fetchMotors()
    } catch (err) {
      console.error('Error submitting form:', err)
      const errorMsg = err.response?.data?.message || 'Terjadi kesalahan sistem'
      toast.error(errorMsg)
    } finally {
      setSubmitLoading(false)
    }
  }

  // Handle Delete
  const handleDelete = async () => {
    setSubmitLoading(true)
    try {
      await api.delete(`/admin/motors/${selectedMotorId}`)
      toast.success('Motor berhasil dihapus dari sistem')
      setIsDeleteOpen(false)
      fetchMotors()
    } catch (err) {
      console.error('Error deleting motor:', err)
      toast.error('Gagal menghapus data motor')
    } finally {
      setSubmitLoading(false)
    }
  }

  // Handle Quick Status Change
  const handleQuickStatusChange = async (motorId, newStatus) => {
    try {
      await api.patch(`/admin/motors/${motorId}/status`, { status: newStatus })
      toast.success('Status motor berhasil diperbarui')
      fetchMotors()
    } catch (err) {
      console.error('Error updating status:', err)
      toast.error('Gagal memperbarui status')
    }
  }

  const hasActiveFilters = search || statusFilter || merkFilter || tahunFilter || hargaMin || hargaMax

  return (
    <div className="space-y-4 md:space-y-6 pb-8">
      
      {/* ===== HEADER ===== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1a2f4f]">Stok Motor</h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola data dan status ketersediaan motor showroom
          </p>
        </div>
        {!isKasir && (
          <button
            onClick={openCreateModal}
            className="flex items-center justify-center gap-2 bg-[#f97316] hover:bg-orange-600 text-white font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-orange-500/10 active:scale-[0.98] transition-all duration-200"
          >
            <Plus size={18} />
            <span>Tambah Motor</span>
          </button>
        )}
      </div>

      {/* ===== CONTROLS / FILTERS ===== */}
      <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">

        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari berdasarkan No Rangka, No Mesin, Merk, atau Tipe..."
              value={search}
              onChange={handleSearchChange}
              className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl focus:border-[#1a2f4f] focus:ring-2 focus:ring-[#1a2f4f]/10 outline-none text-sm"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-2.5 outline-none text-sm bg-white focus:border-[#1a2f4f] focus:ring-2 focus:ring-[#1a2f4f]/10"
            >
              <option value="">Semua Status</option>
              <option value="tersedia">Tersedia</option>
              <option value="reserved">Reserved</option>
              <option value="terjual">Terjual</option>
            </select>
          </div>

          {/* Toggle filter lanjutan */}
          <button
            onClick={() => setShowMoreFilters(prev => !prev)}
            className="text-xs font-semibold text-[#1a2f4f] hover:text-[#f97316] px-3 py-2.5 border border-gray-200 rounded-xl transition-colors whitespace-nowrap"
          >
            {showMoreFilters ? 'Sembunyikan Filter' : 'Filter Lainnya'}
          </button>

          {/* Reset Button */}
          {hasActiveFilters && (
            <button
              onClick={handleClearAllFilters}
              className="text-xs text-red-500 hover:text-red-700 font-semibold py-2 px-3 hover:bg-red-50 rounded-lg transition-colors whitespace-nowrap"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Filter Lanjutan: Merk, Tahun, Rentang Harga */}
        {showMoreFilters && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-gray-100">
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-1 uppercase">Merk</label>
              <input
                type="text"
                placeholder="Contoh: Honda"
                value={merkFilter}
                onChange={(e) => handleMerkFilterChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none text-sm focus:border-[#1a2f4f]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-1 uppercase">Tahun</label>
              <input
                type="number"
                placeholder="Contoh: 2024"
                value={tahunFilter}
                onChange={(e) => handleTahunFilterChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none text-sm focus:border-[#1a2f4f]"
                min="1980"
                max={new Date().getFullYear() + 1}
                onKeyDown={(e) => {
                  if (e.key === '-' || e.key === 'e') {
                    e.preventDefault();
                  }
                }}
                onWheel={(e) => e.target.blur()}
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-1 uppercase">Harga Min</label>
              <input
                type="number"
                placeholder="Rp 0"
                min="0"
                value={hargaMin}
                onChange={(e) => handleHargaMinChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none text-sm focus:border-[#1a2f4f]"
                onKeyDown={(e) => {
                  if (e.key === '-' || e.key === 'e') {
                    e.preventDefault();
                  }
                }}
                onWheel={(e) => e.target.blur()}
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-1 uppercase">Harga Max</label>
              <input
                type="number"
                min="0"
                placeholder="Tanpa batas"
                value={hargaMax}
                onChange={(e) => handleHargaMaxChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none text-sm focus:border-[#1a2f4f]"
                onKeyDown={(e) => {
                  if (e.key === '-' || e.key === 'e') {
                    e.preventDefault();
                  }
                }}
                onWheel={(e) => e.target.blur()}
              />
            </div>
          </div>
        )}
      </div>

      {/* ===== TABLE CONTAINER ===== */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-[#1a2f4f] border-t-[#f97316] rounded-full animate-spin" />
            <p className="text-gray-400 text-xs mt-4">Memuat data motor...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">
            <AlertCircle size={32} className="mx-auto mb-2" />
            <p>{error}</p>
            <button onClick={fetchMotors} className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg text-xs">
              Muat Ulang
            </button>
          </div>
        ) : motors.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">
            <Car size={48} className="mx-auto mb-3 text-gray-300" />
            <p>Tidak ada data motor ditemukan</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Motor</th>
                  <th className="px-6 py-4 font-semibold">Warna / Tahun</th>
                  <th className="px-6 py-4 font-semibold">No Rangka / Mesin</th>
                  <th className="px-6 py-4 font-semibold">Harga Jual</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {motors.map((motor) => (
                  <tr key={motor.id} className="hover:bg-gray-50/50 transition-colors text-sm text-gray-700">
                    
                    {/* Brand & Tipe */}
                    <td className="px-6 py-4.5">
                      <div className="font-semibold text-gray-800">{motor.merk}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{motor.tipe}</div>
                      {motor.supplier && (
                        <div className="text-[10px] text-gray-400 mt-0.5">via {motor.supplier.nama}</div>
                      )}
                    </td>
                    
                    {/* Warna / Tahun */}
                    <td className="px-6 py-4.5">
                      <div className="capitalize">{motor.warna}</div>
                      <div className="text-xs text-gray-400 mt-0.5">Tahun {motor.tahun} · <span className="uppercase font-medium text-orange-500">{motor.kondisi}</span></div>
                    </td>

                    {/* Identifikasi */}
                    <td className="px-6 py-4.5 font-mono text-xs">
                      <div>Rk: {motor.no_rangka}</div>
                      <div className="text-gray-400 mt-0.5">Ms: {motor.no_mesin}</div>
                    </td>

                    {/* Harga Jual */}
                    <td className="px-6 py-4.5">
                      <div className="font-semibold text-[#1a2f4f]">{formatRupiah(motor.harga_jual)}</div>
                      <div className="text-[10px] text-gray-400">Beli: {formatRupiah(motor.harga_beli)}</div>
                    </td>

                    {/* Status Select */}
                    <td className="px-6 py-4.5">
                      <select
                        value={motor.status}
                        onChange={(e) => handleQuickStatusChange(motor.id, e.target.value)}
                        disabled={isKasir}
                        className={`text-xs border font-semibold px-2.5 py-1 rounded-full outline-none ${isKasir ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'} ${STATUS_BADGES[motor.status]}`}
                      >
                        <option value="tersedia">Tersedia</option>
                        <option value="reserved">Reserved</option>
                        <option value="terjual">Terjual</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openDetailModal(motor)}
                          className="p-1.5 text-gray-400 hover:text-[#1a2f4f] rounded-lg hover:bg-gray-100 transition-colors"
                          title="Detail Motor"
                        >
                          <Eye size={16} />
                        </button>
                        {!isKasir && (
                          <>
                            <button
                              onClick={() => openEditModal(motor)}
                              className="p-1.5 text-gray-400 hover:text-[#f97316] rounded-lg hover:bg-gray-100 transition-colors"
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => openDeleteModal(motor)}
                              className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100 transition-colors"
                              title="Hapus"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ===== PAGINATION ===== */}
        {total > 0 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-3">
              <span>
                Menampilkan <span className="font-semibold text-gray-700">{motors.length}</span> dari <span className="font-semibold text-gray-700">{total}</span> motor
              </span>
              <select
                value={perPage}
                onChange={(e) => handlePerPageChange(e.target.value)}
                className="border border-gray-200 rounded-lg px-2 py-1 outline-none text-xs bg-white"
              >
                <option value={10}>10 / halaman</option>
                <option value={25}>25 / halaman</option>
                <option value={50}>50 / halaman</option>
              </select>
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

      {/* ==================== MODAL: ADD / EDIT MOTOR ==================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="bg-[#1a2f4f] text-white px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Car size={20} className="text-[#f97316]" />
                <span>{modalMode === 'create' ? 'Tambah Unit Motor' : 'Edit Unit Motor'}</span>
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-white/60 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              <div className="grid grid-cols-2 gap-4">

                {/* Supplier */}
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Supplier</label>
                  <select
                    name="supplier_id"
                    value={formData.supplier_id}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-[#1a2f4f] outline-none text-sm"
                  >
                    <option value="">-- Tanpa Supplier --</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>{s.nama}</option>
                    ))}
                  </select>
                </div>

                {/* Merk */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Merk *</label>
                  <input
                    type="text"
                    name="merk"
                    required
                    placeholder="Contoh: Honda, Yamaha, Suzuki"
                    value={formData.merk}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-[#1a2f4f] focus:ring-1 focus:ring-[#1a2f4f]/20 outline-none text-sm"
                  />
                </div>

                {/* Tipe */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Tipe *</label>
                  <input
                    type="text"
                    name="tipe"
                    required
                    placeholder="Contoh: Vario 160 ABS, NMAX 155"
                    value={formData.tipe}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-[#1a2f4f] focus:ring-1 focus:ring-[#1a2f4f]/20 outline-none text-sm"
                  />
                </div>

                {/* Tahun */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Tahun Pembuatan *</label>
                  <input
                    type="number"
                    name="tahun"
                    required
                    min="1980"
                    max={new Date().getFullYear() + 1}
                    value={formData.tahun}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-[#1a2f4f] focus:ring-1 focus:ring-[#1a2f4f]/20 outline-none text-sm"
                  />
                </div>

                {/* Warna */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Warna *</label>
                  <input
                    type="text"
                    name="warna"
                    required
                    placeholder="Contoh: Hitam Matte, Merah Glossy"
                    value={formData.warna}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-[#1a2f4f] focus:ring-1 focus:ring-[#1a2f4f]/20 outline-none text-sm"
                  />
                </div>

                {/* Kondisi */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Kondisi *</label>
                  <select
                    name="kondisi"
                    value={formData.kondisi}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-[#1a2f4f] outline-none text-sm"
                  >
                    <option value="baru">Baru</option>
                    <option value="bekas">Bekas</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Status Ketersediaan *</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-[#1a2f4f] outline-none text-sm"
                  >
                    <option value="tersedia">Tersedia</option>
                    <option value="reserved">Reserved</option>
                    <option value="terjual">Terjual</option>
                  </select>
                </div>

                {/* No Rangka */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">No. Rangka *</label>
                  <input
                    type="text"
                    name="no_rangka"
                    required
                    placeholder="Masukkan nomor rangka resmi"
                    value={formData.no_rangka}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-[#1a2f4f] focus:ring-1 focus:ring-[#1a2f4f]/20 outline-none text-sm font-mono"
                  />
                </div>

                {/* No Mesin */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">No. Mesin *</label>
                  <input
                    type="text"
                    name="no_mesin"
                    required
                    placeholder="Masukkan nomor mesin resmi"
                    value={formData.no_mesin}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-[#1a2f4f] focus:ring-1 focus:ring-[#1a2f4f]/20 outline-none text-sm font-mono"
                  />
                </div>

                {/* No Polisi */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">No. Polisi (Plat)</label>
                  <input
                    type="text"
                    name="no_polisi"
                    placeholder="Contoh: P 1234 XX"
                    value={formData.no_polisi}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-[#1a2f4f] outline-none text-sm font-mono"
                  />
                </div>

                {/* BPKB */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">No. BPKB</label>
                  <input
                    type="text"
                    name="bpkb"
                    placeholder="Masukkan nomor BPKB"
                    value={formData.bpkb}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-[#1a2f4f] outline-none text-sm font-mono"
                  />
                </div>

                {/* Harga Beli */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Harga Beli *</label>
                  <input
                    type="number"
                    name="harga_beli"
                    required
                    min="0"
                    placeholder="Harga kulakan"
                    value={formData.harga_beli}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-[#1a2f4f] outline-none text-sm"
                  />
                </div>

                {/* Harga Jual */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Harga Jual *</label>
                  <input
                    type="number"
                    name="harga_jual"
                    required
                    min="0"
                    placeholder="Harga penawaran"
                    value={formData.harga_jual}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-[#1a2f4f] outline-none text-sm"
                  />
                </div>

                {/* Harga Minimal */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Harga Jual Minimal</label>
                  <input
                    type="number"
                    name="harga_minimal"
                    min="0"
                    placeholder="Harga paling rendah (net)"
                    value={formData.harga_minimal}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-[#1a2f4f] outline-none text-sm"
                  />
                </div>

                {/* Tanggal Masuk */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Tanggal Masuk Showroom *</label>
                  <input
                    type="date"
                    name="tanggal_masuk"
                    required
                    value={formData.tanggal_masuk}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-[#1a2f4f] outline-none text-sm"
                  />
                </div>

                {/* ===== UPLOAD FOTO ===== */}
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Foto Motor (maks 10, @5MB)</label>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    multiple
                    onChange={handleFileSelect}
                    className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#1a2f4f]/10 file:text-[#1a2f4f] file:font-semibold file:text-xs hover:file:bg-[#1a2f4f]/20"
                  />

                  {/* Foto yang sudah ada di motor (mode edit) */}
                  {motorPhotos.length > 0 && (
                    <div className="mt-3">
                      <p className="text-[10px] text-gray-400 uppercase font-semibold mb-2">Foto Tersimpan</p>
                      <div className="grid grid-cols-4 gap-2">
                        {motorPhotos.map((photo) => {
                          const photoUrl = getPhotoUrl(photo.photo_path)
                          return (
                            <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                              {photoUrl ? (
                                <img
                                  src={photoUrl}
                                  alt="Foto motor"
                                  loading="lazy"
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    console.error('Gagal load gambar:', photoUrl)
                                    e.target.style.display = 'none'
                                    e.target.parentElement.innerHTML = `
                                      <div class="w-full h-full flex items-center justify-center text-gray-400 text-[10px] p-1 text-center break-all">
                                        ${photo.photo_path?.split('/').pop() || 'No image'}
                                      </div>
                                    `
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                  No image
                                </div>
                              )}
                              {photo.is_primary && (
                                <span className="absolute top-1 left-1 bg-[#f97316] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                  Utama
                                </span>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Preview foto baru yang mau diupload */}
                  {previewUrls.length > 0 && (
                    <div className="mt-3">
                      <p className="text-[10px] text-gray-400 uppercase font-semibold mb-2">Foto Baru (belum tersimpan)</p>
                      <div className="grid grid-cols-4 gap-2">
                        {previewUrls.map((url, index) => (
                          <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                            <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeSelectedFile(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {uploadingPhoto && (
                    <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                      <RefreshCw size={12} className="animate-spin" /> Mengupload foto...
                    </p>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
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
                  className="px-5 py-2 bg-[#f97316] hover:bg-orange-600 disabled:opacity-50 text-white rounded-xl text-sm font-semibold shadow-lg shadow-orange-500/10 active:scale-[0.98] transition-all"
                >
                  {submitLoading ? 'Menyimpan...' : 'Simpan Unit'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: DETAIL MOTOR ==================== */}
      {isDetailOpen && selectedMotor && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="bg-[#1a2f4f] text-white px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Eye size={20} className="text-[#f97316]" />
                <span>Spesifikasi Detail Motor</span>
              </h2>
              <button onClick={() => setIsDetailOpen(false)} className="text-white/60 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Details Grid */}
            <div className="p-6 space-y-4 text-sm text-gray-700">
              
              <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-[#1a2f4f]/10 text-[#1a2f4f] rounded-full flex items-center justify-center font-bold text-lg">
                  {selectedMotor.merk ? selectedMotor.merk[0].toUpperCase() : 'M'}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-base">{selectedMotor.merk}</h3>
                  <p className="text-xs text-gray-500">{selectedMotor.tipe} · {selectedMotor.tahun}</p>
                </div>
                <div className={`ml-auto border font-bold px-2.5 py-0.5 rounded-full text-xs uppercase ${STATUS_BADGES[selectedMotor.status]}`}>
                  {selectedMotor.status}
                </div>
              </div>

              {/* ===== GALLERY FOTO ===== */}
              {selectedMotor.photos && selectedMotor.photos.length > 0 && (
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-semibold mb-2">Galeri Foto</p>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedMotor.photos.map((photo) => {
                      const photoUrl = getPhotoUrl(photo.photo_path)
                      return (
                        <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                          {photoUrl ? (
                            <img
                              src={photoUrl}
                              alt="Foto motor"
                              loading="lazy"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                console.error('Gagal load gambar:', photoUrl)
                                e.target.style.display = 'none'
                                e.target.parentElement.innerHTML = `
                                  <div class="w-full h-full flex items-center justify-center text-gray-400 text-[10px] p-1 text-center break-all">
                                    ${photo.photo_path?.split('/').pop() || 'No image'}
                                  </div>
                                `
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                              No image
                            </div>
                          )}
                          {photo.is_primary && (
                            <span className="absolute top-1 left-1 bg-[#f97316] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                              Utama
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-semibold">Warna</p>
                  <p className="font-medium capitalize">{selectedMotor.warna}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-semibold">Kondisi</p>
                  <p className="font-medium capitalize">{selectedMotor.kondisi}</p>
                </div>

                <div className="col-span-2">
                  <p className="text-[10px] text-gray-400 uppercase font-semibold">Supplier</p>
                  <p className="font-medium">{selectedMotor.supplier?.nama || '-'}</p>
                </div>

                <div className="col-span-2 border-t border-gray-100 my-1" />

                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-semibold">No. Rangka</p>
                  <p className="font-mono text-xs font-semibold">{selectedMotor.no_rangka}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-semibold">No. Mesin</p>
                  <p className="font-mono text-xs font-semibold">{selectedMotor.no_mesin}</p>
                </div>

                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-semibold">No. Polisi</p>
                  <p className="font-mono text-xs font-semibold capitalize">{selectedMotor.no_polisi || '-'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-semibold">BPKB</p>
                  <p className="font-mono text-xs font-semibold">{selectedMotor.bpkb || '-'}</p>
                </div>

                <div className="col-span-2 border-t border-gray-100 my-1" />

                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-semibold flex items-center gap-1">
                    <DollarSign size={12} /> Harga Beli
                  </p>
                  <p className="font-semibold text-gray-600">{formatRupiah(selectedMotor.harga_beli)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-semibold flex items-center gap-1">
                    <DollarSign size={12} className="text-[#f97316]" /> Harga Jual
                  </p>
                  <p className="font-bold text-[#f97316]">{formatRupiah(selectedMotor.harga_jual)}</p>
                </div>

                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-semibold flex items-center gap-1">
                    Harga Jual Minimal
                  </p>
                  <p className="font-medium text-gray-600">{formatRupiah(selectedMotor.harga_minimal) || '-'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-semibold flex items-center gap-1">
                    <Calendar size={12} /> Tanggal Masuk
                  </p>
                  <p className="font-medium text-gray-600">{formatDate(selectedMotor.tanggal_masuk)}</p>
                </div>
              </div>

              {/* Close Button */}
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

      {/* ==================== MODAL: CONFIRM DELETE ==================== */}
      {isDeleteOpen && selectedMotor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 border border-gray-100 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <ShieldAlert size={24} />
            </div>
            <h3 className="font-bold text-gray-800 text-lg">Hapus Unit Motor?</h3>
            <p className="text-gray-500 text-xs mt-2 leading-relaxed">
              Apakah Anda yakin ingin menghapus data motor <span className="font-semibold text-gray-700">{selectedMotor.merk} {selectedMotor.tipe} ({selectedMotor.warna})</span>? Tindakan ini bersifat permanen.
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
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-lg shadow-red-500/10 transition-colors"
              >
                {submitLoading ? 'Menghapus...' : 'Hapus Unit'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}