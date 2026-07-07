// src/pages/admin/Customers.jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Users, Search, Plus, Edit2, Trash2, Eye, Filter,
  ChevronLeft, ChevronRight, X, ShieldAlert,
  AlertCircle, Phone, MapPin, Mail, Calendar,
  UserPlus, UserCheck, Loader2
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

const formatRupiah = (value) => {
  if (!value) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value)
}

// ===== SKELETON COMPONENTS =====

// Skeleton untuk Header
const SkeletonHeader = () => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-pulse">
    <div>
      <div className="h-8 w-40 bg-gray-200 rounded-lg" />
      <div className="h-4 w-56 bg-gray-200 rounded-lg mt-1" />
    </div>
    <div className="h-10 w-40 bg-gray-200 rounded-xl" />
  </div>
)

// Skeleton untuk Search
const SkeletonSearch = () => (
  <div className="bg-white rounded-xl shadow-sm p-4 animate-pulse">
    <div className="h-11 w-full bg-gray-200 rounded-xl" />
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
        <div className="h-4 w-24 bg-gray-200 rounded" />
        <div className="h-5 w-16 bg-gray-200 rounded-full" />
        <div className="flex gap-2">
          <div className="h-8 w-8 bg-gray-200 rounded-lg" />
          <div className="h-8 w-8 bg-gray-200 rounded-lg" />
          <div className="h-8 w-8 bg-gray-200 rounded-lg" />
        </div>
      </div>
    ))}
  </div>
)

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [submitLoading, setSubmitLoading] = useState(false)
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('create')
  const [selectedCustomerId, setSelectedCustomerId] = useState(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)

  // Form State
  const initialFormState = {
    nama: '',
    email: '',
    no_hp: '',
    alamat: '',
    nik: ''
  }
  const [formData, setFormData] = useState(initialFormState)

  const fetchCustomers = async () => {
    setLoading(true)
    try {
      const response = await api.get('/admin/customers', {
        params: {
          search: search,
          page: currentPage,
          per_page: 10
        }
      })
      setCustomers(response.data?.data || [])
      setCurrentPage(response.data?.current_page || 1)
      setLastPage(response.data?.last_page || 1)
      setTotal(response.data?.total || 0)
    } catch (err) {
      console.error('Error fetching customers:', err)
      toast.error('Gagal memuat data customer')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [search, currentPage])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const openCreateModal = () => {
    setModalMode('create')
    setFormData(initialFormState)
    setIsModalOpen(true)
  }

  const openEditModal = (customer) => {
    setModalMode('edit')
    setSelectedCustomerId(customer.id)
    setFormData({
      nama: customer.nama || '',
      email: customer.email || '',
      no_hp: customer.no_hp || '',
      alamat: customer.alamat || '',
      nik: customer.nik || ''
    })
    setIsModalOpen(true)
  }

  const openDeleteModal = (customer) => {
    setSelectedCustomer(customer)
    setSelectedCustomerId(customer.id)
    setIsDeleteOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitLoading(true)
    try {
      if (modalMode === 'create') {
        await api.post('/admin/customers', formData)
        toast.success('Customer berhasil ditambahkan')
      } else {
        await api.put(`/admin/customers/${selectedCustomerId}`, formData)
        toast.success('Customer berhasil diperbarui')
      }
      setIsModalOpen(false)
      fetchCustomers()
    } catch (err) {
      console.error('Error:', err)
      toast.error(err.response?.data?.message || 'Terjadi kesalahan')
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleDelete = async () => {
    setSubmitLoading(true)
    try {
      await api.delete(`/admin/customers/${selectedCustomerId}`)
      toast.success('Customer berhasil dihapus')
      setIsDeleteOpen(false)
      fetchCustomers()
    } catch (err) {
      console.error('Error:', err)
      toast.error('Gagal menghapus customer')
    } finally {
      setSubmitLoading(false)
    }
  }

  const getCustomerBadge = (customer) => {
    const totalTransaksi = customer.transaksis_count || 0
    if (totalTransaksi > 1) {
      return { label: 'Loyal', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' }
    }
    if (totalTransaksi === 1) {
      return { label: 'Pertama', color: 'bg-blue-100 text-blue-700 border-blue-200' }
    }
    return { label: 'Baru', color: 'bg-gray-100 text-gray-600 border-gray-200' }
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
            <Users size={24} className="text-[#10b981]" />
            Customer
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola data customer showroom
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-[#10b981] hover:bg-emerald-600 text-white font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
        >
          <UserPlus size={18} />
          <span>Tambah Customer</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari customer berdasarkan nama, email, atau no HP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/10 outline-none text-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        {customers.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">
            <Users size={48} className="mx-auto mb-3 text-gray-300" />
            <p>Belum ada data customer</p>
            <button
              onClick={openCreateModal}
              className="mt-3 text-[#10b981] hover:text-emerald-600 font-medium text-sm"
            >
              Tambahkan customer sekarang →
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">#</th>
                  <th className="px-6 py-4 font-semibold">Customer</th>
                  <th className="px-6 py-4 font-semibold">Kontak</th>
                  <th className="px-6 py-4 font-semibold">Bergabung</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {customers.map((customer, index) => {
                  const badge = getCustomerBadge(customer)
                  return (
                    <tr key={customer.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-xs text-gray-400">
                        {((currentPage - 1) * 10) + index + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-800">{customer.nama}</div>
                        <div className="text-xs text-gray-400">{customer.email || '-'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 flex items-center gap-1">
                          <Phone size={14} className="text-gray-400" />
                          {customer.no_hp || '-'}
                        </div>
                        {customer.alamat && (
                          <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                            <MapPin size={12} className="text-gray-300" />
                            <span className="truncate max-w-[120px]">{customer.alamat}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {formatDate(customer.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${badge.color}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/admin/customers/${customer.id}`}
                            className="p-1.5 text-gray-400 hover:text-[#10b981] rounded-lg hover:bg-gray-100 transition-colors"
                            title="Detail Customer"
                          >
                            <Eye size={16} />
                          </Link>
                          <button
                            onClick={() => openEditModal(customer)}
                            className="p-1.5 text-gray-400 hover:text-[#10b981] rounded-lg hover:bg-gray-100 transition-colors"
                            title="Edit Customer"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => openDeleteModal(customer)}
                            className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100 transition-colors"
                            title="Hapus Customer"
                          >
                            <Trash2 size={16} />
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
              Menampilkan <span className="font-semibold text-gray-700">{customers.length}</span> dari <span className="font-semibold text-gray-700">{total}</span> customer
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

      {/* ===== MODAL: CREATE/EDIT CUSTOMER ===== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-100">

            <div className="bg-[#1a2f4f] text-white px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Users size={20} className="text-[#10b981]" />
                <span>{modalMode === 'create' ? 'Tambah Customer' : 'Edit Customer'}</span>
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-white/60 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Nama Lengkap <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="nama"
                  required
                  placeholder="Nama customer"
                  value={formData.nama}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/10 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/10 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">No. HP <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="no_hp"
                  required
                  placeholder="081234567890"
                  value={formData.no_hp}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/10 outline-none text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">NIK</label>
                <input
                  type="text"
                  name="nik"
                  placeholder="Nomor KTP"
                  value={formData.nik}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/10 outline-none text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Alamat</label>
                <textarea
                  name="alamat"
                  rows="2"
                  placeholder="Alamat lengkap customer"
                  value={formData.alamat}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/10 outline-none text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 text-sm font-semibold transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="px-5 py-2 bg-[#10b981] hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl text-sm font-semibold shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
                >
                  {submitLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                  {submitLoading ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== MODAL: CONFIRM DELETE ===== */}
      {isDeleteOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 border border-gray-100 text-center">
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <ShieldAlert size={24} />
            </div>
            <h3 className="font-bold text-gray-800 text-lg">Hapus Customer?</h3>
            <p className="text-gray-500 text-xs mt-2 leading-relaxed">
              Apakah Anda yakin ingin menghapus customer <span className="font-semibold text-gray-700">{selectedCustomer.nama}</span>?
            </p>
            <p className="text-gray-400 text-[10px] mt-1">
              Data terkait seperti transaksi dan booking akan tetap tersimpan.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsDeleteOpen(false)}
                disabled={submitLoading}
                className="flex-1 px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl text-xs font-semibold transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={submitLoading}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2"
              >
                {submitLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                {submitLoading ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}