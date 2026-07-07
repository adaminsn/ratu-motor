// src/pages/admin/Suppliers.jsx
import { useEffect, useState } from 'react'
import { 
  Users, Plus, Edit2, Trash2, Search, 
  ChevronLeft, ChevronRight, X, Eye, ShieldAlert,
  AlertCircle, Package, DollarSign, Phone, MapPin,
  Bike, Hash
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

export default function Suppliers() {
  const { user } = useAuthStore()
  const userRole = user?.roles?.[0]?.name || user?.role || null
  const isKasir = userRole === 'kasir'

  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [total, setTotal] = useState(0)
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('create')
  const [selectedSupplierId, setSelectedSupplierId] = useState(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState(null)
  const [submitLoading, setSubmitLoading] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    nama: '',
    no_hp: '',
    alamat: '',
    keterangan: '',
    jumlah_motor: 0
  })

  const fetchSuppliers = async () => {
    setLoading(true)
    try {
      const response = await api.get('/admin/suppliers', {
        params: {
          search: search,
          page: currentPage,
          per_page: 10
        }
      })
      setSuppliers(response.data?.data || [])
      setCurrentPage(response.data?.current_page || 1)
      setLastPage(response.data?.last_page || 1)
      setTotal(response.data?.total || 0)
    } catch (err) {
      console.error('Error fetching suppliers:', err)
      toast.error('Gagal memuat data supplier')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSuppliers()
  }, [search, currentPage])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const openCreateModal = () => {
    setModalMode('create')
    setFormData({ 
      nama: '', 
      no_hp: '', 
      alamat: '', 
      keterangan: '',
      jumlah_motor: 0
    })
    setIsModalOpen(true)
  }

  const openEditModal = (supplier) => {
    setModalMode('edit')
    setSelectedSupplierId(supplier.id)
    setFormData({
      nama: supplier.nama || '',
      no_hp: supplier.no_hp || '',
      alamat: supplier.alamat || '',
      keterangan: supplier.keterangan || '',
      jumlah_motor: supplier.jumlah_motor || 0
    })
    setIsModalOpen(true)
  }

  const openDeleteModal = (supplier) => {
    setSelectedSupplier(supplier)
    setSelectedSupplierId(supplier.id)
    setIsDeleteOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitLoading(true)
    try {
      const payload = {
        nama: formData.nama,
        no_hp: formData.no_hp,
        alamat: formData.alamat,
        keterangan: formData.keterangan,
        jumlah_motor: parseInt(formData.jumlah_motor) || 0
      }

      if (modalMode === 'create') {
        await api.post('/admin/suppliers', payload)
        toast.success('Supplier berhasil ditambahkan')
      } else {
        await api.put(`/admin/suppliers/${selectedSupplierId}`, payload)
        toast.success('Supplier berhasil diperbarui')
      }
      setIsModalOpen(false)
      fetchSuppliers()
    } catch (err) {
      console.error('Error submitting form:', err)
      const errorMsg = err.response?.data?.message || err.response?.data?.errors || 'Terjadi kesalahan'
      toast.error(typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg)
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleDelete = async () => {
    setSubmitLoading(true)
    try {
      await api.delete(`/admin/suppliers/${selectedSupplierId}`)
      toast.success('Supplier berhasil dihapus')
      setIsDeleteOpen(false)
      fetchSuppliers()
    } catch (err) {
      console.error('Error deleting supplier:', err)
      toast.error('Gagal menghapus supplier')
    } finally {
      setSubmitLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-[#1a2f4f] border-t-[#f97316] rounded-full animate-spin" />
        <p className="text-gray-400 text-xs mt-4">Memuat data supplier...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6 pb-8">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1a2f4f]">Supplier</h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola data supplier pemasok motor ke showroom
          </p>
        </div>
        {!isKasir && (
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-[#f97316] hover:bg-orange-600 text-white font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-orange-500/10 active:scale-[0.98] transition-all"
          >
            <Plus size={18} />
            <span>Tambah Supplier</span>
          </button>
        )}
      </div>

      {/* SEARCH */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari supplier berdasarkan nama, no HP, atau alamat..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl focus:border-[#1a2f4f] focus:ring-2 focus:ring-[#1a2f4f]/10 outline-none text-sm"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        {suppliers.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">
            <Users size={48} className="mx-auto mb-3 text-gray-300" />
            <p>Belum ada data supplier</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Supplier</th>
                  <th className="px-6 py-4 font-semibold">No. HP</th>
                  <th className="px-6 py-4 font-semibold">Alamat</th>
                  <th className="px-6 py-4 font-semibold text-center">Jumlah Motor</th>
                  <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {suppliers.map((supplier) => (
                  <tr key={supplier.id} className="hover:bg-gray-50/50 transition-colors text-sm text-gray-700">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-800">{supplier.nama}</div>
                      {supplier.keterangan && (
                        <div className="text-xs text-gray-400 mt-0.5">{supplier.keterangan}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">{supplier.no_hp || '-'}</td>
                    <td className="px-6 py-4 text-xs">{supplier.alamat || '-'}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-[#1a2f4f]/10 text-[#1a2f4f] px-3 py-1 rounded-full text-xs font-semibold">
                        {supplier.jumlah_motor || 0} Unit
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!isKasir ? (
                          <>
                            <button
                              onClick={() => openEditModal(supplier)}
                              className="p-1.5 text-gray-400 hover:text-[#f97316] rounded-lg hover:bg-gray-100 transition-colors"
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => openDeleteModal(supplier)}
                              className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100 transition-colors"
                              title="Hapus"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION */}
        {total > 0 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <div>
              Menampilkan <span className="font-semibold text-gray-700">{suppliers.length}</span> dari <span className="font-semibold text-gray-700">{total}</span> supplier
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1 || loading}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="font-medium">Halaman {currentPage} dari {lastPage}</span>
              <button
                disabled={currentPage === lastPage || loading}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, lastPage))}
                className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ===== MODAL: CREATE/EDIT SUPPLIER ===== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="bg-[#1a2f4f] text-white px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Users size={20} className="text-[#f97316]" />
                <span>{modalMode === 'create' ? 'Tambah Supplier' : 'Edit Supplier'}</span>
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-white/60 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Nama Supplier *</label>
                <input
                  type="text"
                  name="nama"
                  required
                  placeholder="Contoh: PT Sumber Jaya Motor"
                  value={formData.nama}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-[#1a2f4f] outline-none text-sm"
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">No. HP / WhatsApp</label>
                <input
                  type="text"
                  name="no_hp"
                  placeholder="Contoh: 081234567890"
                  value={formData.no_hp}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-[#1a2f4f] outline-none text-sm font-mono"
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Alamat</label>
                <textarea
                  name="alamat"
                  rows="2"
                  placeholder="Masukkan alamat supplier"
                  value={formData.alamat}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-[#1a2f4f] outline-none text-sm resize-none"
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Keterangan</label>
                <input
                  type="text"
                  name="keterangan"
                  placeholder="Catatan tambahan"
                  value={formData.keterangan}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-[#1a2f4f] outline-none text-sm"
                />
              </div>

              {/* ===== JUMLAH MOTOR ===== */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Jumlah Unit Motor</label>
                <div className="relative">
                  <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    name="jumlah_motor"
                    min="0"
                    placeholder="Jumlah motor yang dipasok"
                    value={formData.jumlah_motor}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:border-[#1a2f4f] outline-none text-sm"
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  📦 Jumlah unit motor yang dipasok oleh supplier ini
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 text-sm font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="px-5 py-2 bg-[#f97316] hover:bg-orange-600 disabled:opacity-50 text-white rounded-xl text-sm font-semibold shadow-lg shadow-orange-500/10 active:scale-[0.98] transition-all"
                >
                  {submitLoading ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== MODAL: CONFIRM DELETE ===== */}
      {isDeleteOpen && selectedSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 border border-gray-100 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <ShieldAlert size={24} />
            </div>
            <h3 className="font-bold text-gray-800 text-lg">Hapus Supplier?</h3>
            <p className="text-gray-500 text-xs mt-2 leading-relaxed">
              Apakah Anda yakin ingin menghapus supplier <span className="font-semibold text-gray-700">{selectedSupplier.nama}</span>?
              {selectedSupplier.jumlah_motor > 0 && (
                <span className="block text-amber-600 mt-1">
                  ⚠️ Supplier ini memiliki {selectedSupplier.jumlah_motor} unit motor terdaftar
                </span>
              )}
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsDeleteOpen(false)}
                disabled={submitLoading}
                className="flex-1 px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl text-xs font-semibold"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={submitLoading}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-xl text-xs font-semibold"
              >
                {submitLoading ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}