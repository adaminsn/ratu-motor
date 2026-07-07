import { useEffect, useState } from 'react'
import { 
  Users as UsersIcon, Plus, Edit2, Trash2, Search, 
  ChevronLeft, ChevronRight, X, ShieldAlert,
  AlertCircle
} from 'lucide-react'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import useAuthStore from '../../store/authStore'

export default function Users() {
  const { user } = useAuthStore()
  const isSuperAdmin = user?.roles?.[0]?.name === 'super_admin'

  const [usersData, setUsersData] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [total, setTotal] = useState(0)
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('create')
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [submitLoading, setSubmitLoading] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    no_hp: ''
  })

  // List of valid roles for select
  const rolesList = [
    { value: 'super_admin', label: 'Super Admin' },
    { value: 'admin', label: 'Admin' },
    { value: 'kasir', label: 'Kasir' },
    { value: 'sales', label: 'Sales' },
    { value: 'customer', label: 'Customer' },
  ]

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await api.get('/admin/users', {
        params: {
          search: search,
          page: currentPage,
          per_page: 10
        }
      })
      setUsersData(response.data?.data || [])
      setCurrentPage(response.data?.current_page || 1)
      setLastPage(response.data?.last_page || 1)
      setTotal(response.data?.total || 0)
    } catch (err) {
      console.error('Error fetching users:', err)
      toast.error('Gagal memuat data user')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [search, currentPage])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const openCreateModal = () => {
    setModalMode('create')
    setFormData({ name: '', email: '', password: '', role: '', no_hp: '' })
    setIsModalOpen(true)
  }

  const openEditModal = (userData) => {
    setModalMode('edit')
    setSelectedUserId(userData.id)
    setFormData({
      name: userData.name || '',
      email: userData.email || '',
      password: '', // Kosongkan saat edit, hanya diisi jika ingin diubah
      role: userData.roles?.[0]?.name || '',
      no_hp: userData.no_hp || ''
    })
    setIsModalOpen(true)
  }

  const openDeleteModal = (userData) => {
    setSelectedUser(userData)
    setSelectedUserId(userData.id)
    setIsDeleteOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitLoading(true)
    try {
      if (modalMode === 'create') {
        await api.post('/admin/users', formData)
        toast.success('User berhasil ditambahkan')
      } else {
        const payload = { ...formData }
        if (!payload.password) delete payload.password // Jangan kirim password kosong saat edit
        
        await api.put(`/admin/users/${selectedUserId}`, payload)
        toast.success('User berhasil diperbarui')
      }
      setIsModalOpen(false)
      fetchUsers()
    } catch (err) {
      console.error('Error submitting form:', err)
      toast.error(err.response?.data?.message || 'Terjadi kesalahan')
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleDelete = async () => {
    setSubmitLoading(true)
    try {
      await api.delete(`/admin/users/${selectedUserId}`)
      toast.success('User berhasil dihapus')
      setIsDeleteOpen(false)
      fetchUsers()
    } catch (err) {
      console.error('Error deleting user:', err)
      toast.error('Gagal menghapus user')
    } finally {
      setSubmitLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-[#1a2f4f] border-t-[#f97316] rounded-full animate-spin" />
        <p className="text-gray-400 text-xs mt-4">Memuat data user...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6 pb-8">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1a2f4f]">Kelola User</h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola data akun pengguna di sistem Ratu Motor
          </p>
        </div>
        {isSuperAdmin && (
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-[#f97316] hover:bg-orange-600 text-white font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-orange-500/10 active:scale-[0.98] transition-all"
          >
            <Plus size={18} />
            <span>Tambah User</span>
          </button>
        )}
      </div>

      {/* SEARCH */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari user berdasarkan nama atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl focus:border-[#1a2f4f] focus:ring-2 focus:ring-[#1a2f4f]/10 outline-none text-sm"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        {usersData.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">
            <UsersIcon size={48} className="mx-auto mb-3 text-gray-300" />
            <p>Belum ada data user</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">User</th>
                  <th className="px-6 py-4 font-semibold">Email</th>
                  <th className="px-6 py-4 font-semibold">Role</th>
                  <th className="px-6 py-4 font-semibold">No HP</th>
                  <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {usersData.map((userData) => (
                  <tr key={userData.id} className="hover:bg-gray-50/50 transition-colors text-sm text-gray-700">
                    <td className="px-6 py-4 font-semibold text-gray-800">
                      {userData.name}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {userData.email}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-[#1a2f4f]/10 text-[#1a2f4f] px-3 py-1 rounded-full text-[11px] font-semibold uppercase">
                        {userData.roles?.[0]?.name || 'No Role'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-mono text-xs">
                      {userData.no_hp || '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isSuperAdmin ? (
                          <>
                            <button
                              onClick={() => openEditModal(userData)}
                              className="p-1.5 text-gray-400 hover:text-[#f97316] rounded-lg hover:bg-gray-100 transition-colors"
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                            {user?.id !== userData.id && (
                              <button
                                onClick={() => openDeleteModal(userData)}
                                className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100 transition-colors"
                                title="Hapus"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
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
              Menampilkan <span className="font-semibold text-gray-700">{usersData.length}</span> dari <span className="font-semibold text-gray-700">{total}</span> user
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

      {/* ===== MODAL: CREATE/EDIT USER ===== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="bg-[#1a2f4f] text-white px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <UsersIcon size={20} className="text-[#f97316]" />
                <span>{modalMode === 'create' ? 'Tambah User' : 'Edit User'}</span>
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-white/60 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-[#1a2f4f] outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="Contoh: budi@ratumotor.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-[#1a2f4f] outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Password {modalMode === 'edit' && '(Kosongkan jika tidak ingin diubah)'}</label>
                <input
                  type="password"
                  name="password"
                  required={modalMode === 'create'}
                  placeholder="********"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-[#1a2f4f] outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Role / Peran *</label>
                <select
                  name="role"
                  required
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-[#1a2f4f] outline-none text-sm bg-white"
                >
                  <option value="" disabled>Pilih Role</option>
                  {rolesList.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
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
      {isDeleteOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 border border-gray-100 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <ShieldAlert size={24} />
            </div>
            <h3 className="font-bold text-gray-800 text-lg">Hapus User?</h3>
            <p className="text-gray-500 text-xs mt-2 leading-relaxed">
              Apakah Anda yakin ingin menghapus akun <span className="font-semibold text-gray-700">{selectedUser.name}</span>? Tindakan ini tidak bisa dibatalkan.
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
