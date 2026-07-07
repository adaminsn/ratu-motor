import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  ShoppingCart, Search, Plus, Trash2, Filter,
  ChevronLeft, ChevronRight, X, Eye, ShieldAlert,
  AlertCircle, DollarSign, Calendar, Users,
  MapPin, Phone, CreditCard, CheckCircle2, Clock,
  Car, FileText, Download
} from 'lucide-react' // ← Tambahkan FileText, Download
import api from '../../api/axios'
import toast from 'react-hot-toast'

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

const METODE_BADGES = {
  tunai: 'bg-blue-50 text-blue-700 border-blue-200',
  kredit: 'bg-purple-50 text-purple-700 border-purple-200'
}

const STATUS_BADGES = {
  lunas: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200'
}

export default function Transaksi({ openCreate = false }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [transaksis, setTransaksis] = useState([])
  const [availableMotors, setAvailableMotors] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [error, setError] = useState(null)

  // Search & Filter States
  const [search, setSearch] = useState('')
  const [metodeFilter, setMetodeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [total, setTotal] = useState(0)

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(openCreate)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedTransaksi, setSelectedTransaksi] = useState(null)
  const [selectedMotorDetail, setSelectedMotorDetail] = useState(null)

  // Form State
  const initialFormState = {
    motor_id: '',
    nama_pembeli: '',
    no_hp_pembeli: '',
    alamat_pembeli: '',
    tanggal_transaksi: new Date().toISOString().split('T')[0],
    harga_kesepakatan: '',
    metode_pembayaran: 'tunai',
    status_pembayaran: 'lunas',
    keterangan: ''
  }
  const [formData, setFormData] = useState(initialFormState)

  // Fetch transactions
  const fetchTransaksis = useCallback(async () => {
    setLoading(true)
    try {
      const response = await api.get('/admin/transaksi', {
        params: {
          search: search,
          metode_pembayaran: metodeFilter,
          status_pembayaran: statusFilter,
          page: currentPage,
          per_page: 10
        }
      })
      setTransaksis(response.data?.data || [])
      setCurrentPage(response.data?.current_page || 1)
      setLastPage(response.data?.last_page || 1)
      setTotal(response.data?.total || 0)
      setError(null)
    } catch (err) {
      console.error('Error fetching transactions:', err)
      setError('Gagal memuat riwayat transaksi.')
      toast.error('Gagal memuat riwayat transaksi')
    } finally {
      setLoading(false)
    }
  }, [search, metodeFilter, statusFilter, currentPage])

  // Fetch available motors for dropdown
  const fetchAvailableMotors = async () => {
    try {
      const response = await api.get('/admin/motors', {
        params: {
          per_page: 100
        }
      })
      setAvailableMotors(response.data?.data || [])
    } catch (err) {
      console.error('Error fetching available motors:', err)
    }
  }

  useEffect(() => {
    fetchTransaksis()
  }, [fetchTransaksis])

  useEffect(() => {
    if (isModalOpen) {
      fetchAvailableMotors()
    }
  }, [isModalOpen])

  // Handle Input Changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    if (name === 'motor_id') {
      const selected = availableMotors.find(m => m.id === parseInt(value))
      setSelectedMotorDetail(selected || null)
      if (selected) {
        setFormData(prev => ({
          ...prev,
          harga_kesepakatan: selected.harga_jual || ''
        }))
      }
    }
  }

  // Open Create Modal
  const openCreateModal = () => {
    setFormData(initialFormState)
    setSelectedMotorDetail(null)
    setIsModalOpen(true)
  }

  // Open Detail Modal
  const openDetailModal = (transaksi) => {
    setSelectedTransaksi(transaksi)
    setIsDetailOpen(true)
  }

  // Open Delete Modal
  const openDeleteModal = (transaksi) => {
    setSelectedTransaksi(transaksi)
    setIsDeleteOpen(true)
  }

  // Submit Transaksi
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.motor_id) {
      toast.error('Silakan pilih motor terlebih dahulu')
      return
    }

    setSubmitLoading(true)
    try {
      await api.post('/admin/transaksi', formData)
      toast.success('Transaksi penjualan berhasil disimpan!')
      setIsModalOpen(false)
      fetchTransaksis()
    } catch (err) {
      console.error('Error saving transaction:', err)
      const errorMsg = err.response?.data?.message || 'Terjadi kesalahan sistem'
      toast.error(errorMsg)
    } finally {
      setSubmitLoading(false)
    }
  }

  // Delete Transaksi (Cancel Sale)
  const handleDelete = async () => {
    setSubmitLoading(true)
    try {
      await api.delete(`/admin/transaksi/${selectedTransaksi.id}`)
      toast.success('Transaksi dibatalkan dan status motor dikembalikan')
      setIsDeleteOpen(false)
      fetchTransaksis()
    } catch (err) {
      console.error('Error deleting transaction:', err)
      toast.error('Gagal menghapus transaksi')
    } finally {
      setSubmitLoading(false)
    }
  }

  // Transaksi.jsx - Ubah fungsi downloadInvoice

  const downloadInvoice = async (transaksiId) => {
    try {
      const token = localStorage.getItem('token');

      // Pakai fetch dengan Authorization header
      const response = await fetch(`http://localhost:8000/api/admin/transaksi/${transaksiId}/invoice`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        toast.error('Gagal mengunduh invoice: ' + (errorData.message || 'Unknown error'));
        return;
      }

      // Download PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${transaksiId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Invoice berhasil diunduh!');
    } catch (err) {
      console.error('Error downloading invoice:', err);
      toast.error('Gagal mengunduh invoice');
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 pb-8">

      {/* ===== HEADER ===== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1a2f4f]">Transaksi Penjualan</h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola transaksi penjualan motor, riwayat pembeli, dan pembayaran
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 bg-[#f97316] hover:bg-orange-600 text-white font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-orange-500/10 active:scale-[0.98] transition-all duration-200"
        >
          <Plus size={18} />
          <span>Input Transaksi</span>
        </button>
      </div>

      {/* ===== FILTERS ===== */}
      <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col md:flex-row md:items-center gap-4">

        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama pembeli, merk, atau tipe motor..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl focus:border-[#1a2f4f] focus:ring-2 focus:ring-[#1a2f4f]/10 outline-none text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400" />
          <select
            value={metodeFilter}
            onChange={(e) => {
              setMetodeFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="border border-gray-200 rounded-xl px-4 py-2.5 outline-none text-sm bg-white focus:border-[#1a2f4f]"
          >
            <option value="">Semua Metode</option>
            <option value="tunai">Tunai</option>
            <option value="kredit">Kredit</option>
          </select>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value)
            setCurrentPage(1)
          }}
          className="border border-gray-200 rounded-xl px-4 py-2.5 outline-none text-sm bg-white focus:border-[#1a2f4f]"
        >
          <option value="">Semua Status</option>
          <option value="lunas">Lunas</option>
          <option value="pending">Pending</option>
        </select>

      </div>

      {/* ===== TABLE CONTAINER ===== */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-[#1a2f4f] border-t-[#f97316] rounded-full animate-spin" />
            <p className="text-gray-400 text-xs mt-4">Memuat riwayat transaksi...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">
            <AlertCircle size={32} className="mx-auto mb-2" />
            <p>{error}</p>
            <button onClick={fetchTransaksis} className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg text-xs">
              Muat Ulang
            </button>
          </div>
        ) : transaksis.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">
            <ShoppingCart size={48} className="mx-auto mb-3 text-gray-300" />
            <p>Belum ada transaksi penjualan yang tercatat</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Pembeli</th>
                  <th className="px-6 py-4 font-semibold">Motor</th>
                  <th className="px-6 py-4 font-semibold">Tanggal</th>
                  <th className="px-6 py-4 font-semibold">Harga</th>
                  <th className="px-6 py-4 font-semibold">Pembayaran</th>
                  <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                {transaksis.map((trx) => (
                  <tr key={trx.id} className="hover:bg-gray-50/50 transition-colors">

                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-800">{trx.nama_pembeli}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{trx.no_hp_pembeli}</div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-800">
                        {trx.motor?.merk} {trx.motor?.tipe}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        Tahun {trx.motor?.tahun} · {trx.motor?.no_polisi || 'Tanpa Plat'}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-xs">
                      {formatDate(trx.tanggal_transaksi)}
                    </td>

                    <td className="px-6 py-4 font-bold text-[#1a2f4f]">
                      {formatRupiah(trx.harga_kesepakatan)}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span className={`text-[10px] font-semibold border px-2 py-0.5 rounded-full capitalize ${METODE_BADGES[trx.metode_pembayaran]}`}>
                          {trx.metode_pembayaran}
                        </span>
                        <span className={`text-[10px] font-semibold border px-2 py-0.5 rounded-full capitalize ${STATUS_BADGES[trx.status_pembayaran]}`}>
                          {trx.status_pembayaran}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openDetailModal(trx)}
                          className="p-1.5 text-gray-400 hover:text-[#1a2f4f] rounded-lg hover:bg-gray-100"
                          title="Detail Nota"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => downloadInvoice(trx.id)}
                          className="p-1.5 text-gray-400 hover:text-[#f97316] rounded-lg hover:bg-gray-100"
                          title="Download Invoice PDF"
                        >
                          <FileText size={16} />
                        </button>
                        <button
                          onClick={() => openDeleteModal(trx)}
                          className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100"
                          title="Batalkan Transaksi"
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

        {/* ===== PAGINATION ===== */}
        {total > 0 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <div>
              Menampilkan <span className="font-semibold text-gray-700">{transaksis.length}</span> dari <span className="font-semibold text-gray-700">{total}</span> transaksi
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1 || loading}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="font-medium">
                Halaman {currentPage} dari {lastPage}
              </span>
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

      {/* ===== MODAL: CREATE TRANSAKSI ===== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">

            <div className="bg-[#1a2f4f] text-white px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <ShoppingCart size={20} className="text-[#f97316]" />
                <span>Input Transaksi Penjualan Baru</span>
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-white/60 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Pilih Unit Motor *</label>
                <select
                  name="motor_id"
                  required
                  value={formData.motor_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-[#1a2f4f] outline-none text-sm bg-white"
                >
                  <option value="">-- Pilih Unit Motor --</option>
                  {availableMotors.map(motor => (
                    <option
                      key={motor.id}
                      value={motor.id}
                      disabled={motor.status === 'terjual'}
                    >
                      [{motor.status.toUpperCase()}] {motor.merk} {motor.tipe} ({motor.warna}) - {formatRupiah(motor.harga_jual)}
                    </option>
                  ))}
                </select>
              </div>

              {selectedMotorDetail && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-xs text-gray-700 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-gray-600">Harga Penawaran:</span>{' '}
                    <span className="font-bold text-[#1a2f4f]">{formatRupiah(selectedMotorDetail.harga_jual)}</span>
                  </div>
                  {selectedMotorDetail.harga_minimal && (
                    <div>
                      <span className="font-semibold text-gray-600">Harga Minimal:</span>{' '}
                      <span className="font-bold text-red-600">{formatRupiah(selectedMotorDetail.harga_minimal)}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Nama Pembeli *</label>
                  <input
                    type="text"
                    name="nama_pembeli"
                    required
                    placeholder="Contoh: Budi Santoso"
                    value={formData.nama_pembeli}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-[#1a2f4f] outline-none text-sm"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">No. HP Pembeli *</label>
                  <input
                    type="text"
                    name="no_hp_pembeli"
                    required
                    placeholder="Contoh: 081234567890"
                    value={formData.no_hp_pembeli}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-[#1a2f4f] outline-none text-sm font-mono"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Alamat Pembeli *</label>
                  <textarea
                    name="alamat_pembeli"
                    required
                    rows="2"
                    placeholder="Masukkan alamat lengkap..."
                    value={formData.alamat_pembeli}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-[#1a2f4f] outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Harga Deal *</label>
                  <input
                    type="number"
                    name="harga_kesepakatan"
                    required
                    min="0"
                    placeholder="Harga deal"
                    value={formData.harga_kesepakatan}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-[#1a2f4f] outline-none text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Tanggal Transaksi *</label>
                  <input
                    type="date"
                    name="tanggal_transaksi"
                    required
                    value={formData.tanggal_transaksi}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-[#1a2f4f] outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Metode Pembayaran *</label>
                  <select
                    name="metode_pembayaran"
                    value={formData.metode_pembayaran}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-[#1a2f4f] outline-none text-sm bg-white"
                  >
                    <option value="tunai">Tunai</option>
                    <option value="kredit">Kredit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Status Pembayaran *</label>
                  <select
                    name="status_pembayaran"
                    value={formData.status_pembayaran}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-[#1a2f4f] outline-none text-sm bg-white"
                  >
                    <option value="lunas">Lunas</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>

                <div className="col-span-2">
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
                  className="px-5 py-2 bg-[#f97316] hover:bg-orange-600 disabled:opacity-50 text-white rounded-xl text-sm font-semibold shadow-lg shadow-orange-500/10 active:scale-[0.98] transition-all"
                >
                  {submitLoading ? 'Menyimpan...' : 'Proses Penjualan'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ===== MODAL: DETAIL NOTA ===== */}
      {isDetailOpen && selectedTransaksi && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">

            <div className="bg-[#1a2f4f] text-white px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <ShoppingCart size={20} className="text-[#f97316]" />
                <span>Nota Ringkasan Penjualan</span>
              </h2>
              <button onClick={() => setIsDetailOpen(false)} className="text-white/60 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5 text-sm text-gray-700">

              <div className="text-center pb-4 border-b border-dashed border-gray-200">
                <h3 className="text-xl font-black text-gray-800 tracking-tight">RATU MOTOR</h3>
                <p className="text-xs text-gray-400 mt-1">Showroom & Service Center Banyuwangi</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Tanggal Nota: {formatDate(selectedTransaksi.tanggal_transaksi)}</p>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Users size={14} /> Data Pembeli
                </h4>
                <div className="bg-gray-50 rounded-xl p-3 space-y-1">
                  <div className="flex justify-between"><span className="text-gray-400">Nama:</span> <span className="font-semibold text-gray-800">{selectedTransaksi.nama_pembeli}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">No HP:</span> <span className="font-mono font-medium text-gray-800">{selectedTransaksi.no_hp_pembeli}</span></div>
                  <div className="flex flex-col mt-1 pt-1.5 border-t border-gray-200/50"><span className="text-gray-400 mb-0.5">Alamat:</span> <span className="font-medium text-gray-700">{selectedTransaksi.alamat_pembeli}</span></div>
                </div>
              </div>

              {selectedTransaksi.motor && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Car size={14} /> Unit Kendaraan
                  </h4>
                  <div className="bg-gray-50 rounded-xl p-3 space-y-1">
                    <div className="flex justify-between"><span className="text-gray-400">Motor:</span> <span className="font-semibold text-gray-800">{selectedTransaksi.motor.merk} {selectedTransaksi.motor.tipe}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Tahun / Warna:</span> <span className="font-medium text-gray-800 capitalize">{selectedTransaksi.motor.tahun} / {selectedTransaksi.motor.warna}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">No. Polisi:</span> <span className="font-mono text-gray-800">{selectedTransaksi.motor.no_polisi || '-'}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">No. Rangka:</span> <span className="font-mono text-xs text-gray-800">{selectedTransaksi.motor.no_rangka}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">No. Mesin:</span> <span className="font-mono text-xs text-gray-800">{selectedTransaksi.motor.no_mesin}</span></div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard size={14} /> Rincian Pembayaran
                </h4>
                <div className="bg-gray-50 rounded-xl p-3 space-y-1.5">
                  <div className="flex justify-between"><span className="text-gray-400">Metode:</span> <span className="font-semibold capitalize text-gray-800">{selectedTransaksi.metode_pembayaran}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Status:</span> <span className="font-semibold capitalize text-gray-800">{selectedTransaksi.status_pembayaran}</span></div>
                  <div className="flex justify-between pt-1 border-t border-gray-200/50"><span className="text-gray-500 font-bold text-sm">TOTAL:</span> <span className="font-bold text-lg text-[#f97316]">{formatRupiah(selectedTransaksi.harga_kesepakatan)}</span></div>
                </div>
              </div>

              <div className="text-xs text-gray-400 space-y-1 pt-1.5 border-t border-gray-100 flex items-center justify-between">
                <span>Kasir: <strong className="text-gray-500">{selectedTransaksi.user?.name || '-'}</strong></span>
                {selectedTransaksi.keterangan && <span className="italic text-gray-400 max-w-xs text-right">Catatan: {selectedTransaksi.keterangan}</span>}
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  onClick={() => downloadInvoice(selectedTransaksi.id)}
                  className="px-4 py-2 bg-[#f97316] text-white rounded-xl text-xs font-semibold hover:bg-orange-600 flex items-center gap-2 transition-colors"
                >
                  <Download size={14} />
                  Download PDF
                </button>
                <button
                  onClick={() => setIsDetailOpen(false)}
                  className="px-5 py-2 bg-[#1a2f4f] text-white rounded-xl text-xs font-semibold hover:bg-[#12223a]"
                >
                  Tutup Nota
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL: CONFIRM DELETE ===== */}
      {isDeleteOpen && selectedTransaksi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 border border-gray-100 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <ShieldAlert size={24} />
            </div>
            <h3 className="font-bold text-gray-800 text-lg">Batalkan Transaksi?</h3>
            <p className="text-gray-500 text-xs mt-2 leading-relaxed">
              Apakah Anda yakin ingin membatalkan transaksi untuk <span className="font-semibold text-gray-700">{selectedTransaksi.nama_pembeli}</span>? Status motor akan dikembalikan menjadi <span className="font-semibold text-emerald-600">Tersedia</span>.
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
                {submitLoading ? 'Memproses...' : 'Ya, Batalkan'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}