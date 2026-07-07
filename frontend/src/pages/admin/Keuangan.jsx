// src/pages/admin/Keuangan.jsx
import { useEffect, useState } from 'react'
import { 
  DollarSign, TrendingUp, TrendingDown, Calendar,
  FileText, FileSpreadsheet, Plus, X,
  AlertCircle, Info, Receipt, Search,
  ChevronLeft, ChevronRight, Filter,
  Sparkles, Zap, Coins, Wallet, PiggyBank,
  Trash2, ShieldAlert, Loader2
} from 'lucide-react'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const formatRupiah = (value) => {
  if (!value || value === 0) return 'Rp 0'
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

const kategoriLabels = {
  pembelian_motor: 'Pembelian Motor',
  operasional: 'Operasional',
  gaji: 'Gaji Karyawan',
  marketing: 'Marketing / Promosi',
  lainnya: 'Lainnya'
}

// ===== SKELETON COMPONENTS =====

// Skeleton untuk Header
const SkeletonHeader = () => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-pulse">
    <div>
      <div className="h-8 w-48 bg-gray-200 rounded-lg" />
      <div className="h-4 w-64 bg-gray-200 rounded-lg mt-1" />
    </div>
    <div className="flex gap-2">
      <div className="h-10 w-28 bg-gray-200 rounded-xl" />
      <div className="h-10 w-28 bg-gray-200 rounded-xl" />
      <div className="h-10 w-36 bg-gray-200 rounded-xl" />
    </div>
  </div>
)

// Skeleton untuk Filter
const SkeletonFilter = () => (
  <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col sm:flex-row sm:items-center gap-4 animate-pulse">
    <div className="h-5 w-20 bg-gray-200 rounded" />
    <div className="flex gap-3">
      <div className="h-10 w-36 bg-gray-200 rounded-lg" />
      <div className="h-10 w-10 bg-gray-200 rounded-lg" />
      <div className="h-10 w-36 bg-gray-200 rounded-lg" />
    </div>
    <div className="flex ml-auto gap-2">
      <div className="h-10 w-20 bg-gray-200 rounded-xl" />
      <div className="h-10 w-24 bg-gray-200 rounded-xl" />
    </div>
  </div>
)

// Skeleton untuk Summary Cards
const SkeletonSummary = () => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-pulse">
    {[1, 2, 3].map((i) => (
      <div key={i} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-200 rounded-lg" />
          <div>
            <div className="h-3 w-24 bg-gray-200 rounded" />
            <div className="h-6 w-32 bg-gray-200 rounded mt-1" />
          </div>
        </div>
      </div>
    ))}
  </div>
)

// Skeleton untuk Table
const SkeletonTable = () => (
  <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 animate-pulse">
    <div className="p-4 border-b border-gray-100 flex justify-between">
      <div className="h-5 w-32 bg-gray-200 rounded" />
      <div className="flex gap-3">
        <div className="h-8 w-40 bg-gray-200 rounded-lg" />
        <div className="h-8 w-32 bg-gray-200 rounded-lg" />
      </div>
    </div>
    <div className="p-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-4 py-3 border-b border-gray-100">
          <div className="h-4 w-24 bg-gray-200 rounded" />
          <div className="flex-1 h-4 w-32 bg-gray-200 rounded" />
          <div className="h-4 w-20 bg-gray-200 rounded" />
          <div className="h-4 w-28 bg-gray-200 rounded" />
          <div className="h-6 w-24 bg-gray-200 rounded-full" />
        </div>
      ))}
    </div>
  </div>
)

export default function Keuangan() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  
  const [pemasukans, setPemasukans] = useState([])
  const [pengeluarans, setPengeluarans] = useState([])
  const [transaksiMotor, setTransaksiMotor] = useState([])
  const [isMotorDetailOpen, setIsMotorDetailOpen] = useState(false)
  const [selectedMotorTransaksi, setSelectedMotorTransaksi] = useState(null)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historySearch, setHistorySearch] = useState('')
  const [historyType, setHistoryType] = useState('semua')
  const [historyPage, setHistoryPage] = useState(1)
  const [historyLastPage, setHistoryLastPage] = useState(1)
  const [historyTotal, setHistoryTotal] = useState(0)
  const [showHistory, setShowHistory] = useState(false)

  // ===== DELETE MODAL =====
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deleteItem, setDeleteItem] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const [isPemasukanOpen, setIsPemasukanOpen] = useState(false)
  const [isPengeluaranOpen, setIsPengeluaranOpen] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  
  const [pemasukanForm, setPemasukanForm] = useState({
    keterangan: '',
    jumlah: '',
    tanggal: new Date().toISOString().split('T')[0]
  })
  const [pengeluaranForm, setPengeluaranForm] = useState({
    kategori: 'operasional',
    keterangan: '',
    jumlah: '',
    tanggal: new Date().toISOString().split('T')[0]
  })

  const [pemasukanErrors, setPemasukanErrors] = useState({})
  const [pengeluaranErrors, setPengeluaranErrors] = useState({})

  const fetchHistory = async () => {
    setHistoryLoading(true)
    try {
      const [pemasukanRes, pengeluaranRes, transaksiRes] = await Promise.all([
        api.get('/admin/keuangan/pemasukan', {
          params: { search: historySearch, page: historyPage, per_page: 10 }
        }),
        api.get('/admin/keuangan/pengeluaran', {
          params: { search: historySearch, page: historyPage, per_page: 10 }
        }),
        api.get('/admin/keuangan/riwayat-transaksi', {
          params: { start_date: startDate, end_date: endDate }
        })
      ])

      setPemasukans(pemasukanRes.data?.data || [])
      setPengeluarans(pengeluaranRes.data?.data || [])
      setTransaksiMotor(transaksiRes.data?.data || [])
      setHistoryTotal(Math.max(pemasukanRes.data?.total || 0, pengeluaranRes.data?.total || 0))
      setHistoryLastPage(Math.max(pemasukanRes.data?.last_page || 1, pengeluaranRes.data?.last_page || 1))
    } catch (err) {
      console.error('Error fetching history:', err)
    } finally {
      setHistoryLoading(false)
    }
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const params = {}
      if (startDate) params.start_date = startDate
      if (endDate) params.end_date = endDate
      
      const response = await api.get('/admin/keuangan/laba-rugi', { params })
      setData(response.data)
    } catch (err) {
      console.error('Error fetching finance data:', err)
      toast.error('Gagal memuat data keuangan')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    if (showHistory) fetchHistory()
  }, [startDate, endDate, showHistory, historyPage, historySearch])

  // ===== DELETE HANDLER =====
  const openDeleteModal = (item, type) => {
    setDeleteItem({
      id: item.id,
      type: type,
      keterangan: item.keterangan,
      jumlah: item.jumlah,
      tanggal: item.tanggal,
      kategori: item.kategori || '-'
    })
    setIsDeleteOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteItem) return
    setDeleteLoading(true)
    try {
      const endpoint = deleteItem.type === 'pemasukan' 
        ? `/admin/keuangan/pemasukan/${deleteItem.id}`
        : `/admin/keuangan/pengeluaran/${deleteItem.id}`
      
      await api.delete(endpoint)
      
      toast.success(`✅ ${deleteItem.type === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'} berhasil dihapus!`)
      setIsDeleteOpen(false)
      setDeleteItem(null)
      
      fetchData()
      if (showHistory) fetchHistory()
    } catch (err) {
      console.error('Error deleting:', err)
      toast.error('❌ Gagal menghapus data: ' + (err.response?.data?.message || 'Terjadi kesalahan'))
    } finally {
      setDeleteLoading(false)
    }
  }

  // ===== EXPORT =====
  const handleExportPDF = async () => {
    try {
      const token = localStorage.getItem('token')
      const params = new URLSearchParams()
      if (startDate) params.append('start_date', startDate)
      if (endDate) params.append('end_date', endDate)
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/keuangan/export-pdf?${params.toString()}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
      })

      if (!response.ok) {
        const errorData = await response.json()
        toast.error('Gagal mengunduh PDF: ' + (errorData.message || 'Unknown error'))
        return
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `laporan-keuangan-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      toast.success('Laporan PDF berhasil diunduh!')
    } catch (err) {
      console.error('Error downloading PDF:', err)
      toast.error('Gagal mengunduh PDF')
    }
  }

  const handleExportExcel = async () => {
    try {
      const token = localStorage.getItem('token')
      const params = new URLSearchParams()
      if (startDate) params.append('start_date', startDate)
      if (endDate) params.append('end_date', endDate)
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/keuangan/export-excel?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        toast.error('Gagal mengunduh Excel: ' + (errorData.message || 'Unknown error'))
        return
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `laporan-keuangan-${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      toast.success('Laporan Excel berhasil diunduh!')
    } catch (err) {
      console.error('Error downloading Excel:', err)
      toast.error('Gagal mengunduh Excel: ' + err.message)
    }
  }

  // ===== VALIDASI & SUBMIT =====
  const validatePemasukan = () => {
    const errors = {}
    if (!pemasukanForm.keterangan?.trim()) errors.keterangan = 'Keterangan wajib diisi!'
    if (!pemasukanForm.jumlah || Number(pemasukanForm.jumlah) <= 0) errors.jumlah = 'Jumlah harus lebih dari 0!'
    if (!pemasukanForm.tanggal) errors.tanggal = 'Tanggal wajib diisi!'
    setPemasukanErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handlePemasukanSubmit = async (e) => {
    e.preventDefault()
    if (!validatePemasukan()) return
    setSubmitLoading(true)
    try {
      await api.post('/admin/keuangan/pemasukan', pemasukanForm)
      toast.success('✅ Pemasukan manual berhasil ditambahkan!')
      setIsPemasukanOpen(false)
      setPemasukanForm({ keterangan: '', jumlah: '', tanggal: new Date().toISOString().split('T')[0] })
      setPemasukanErrors({})
      fetchData()
      if (showHistory) fetchHistory()
    } catch (err) {
      toast.error('❌ ' + (err.response?.data?.message || 'Gagal menambah pemasukan'))
    } finally {
      setSubmitLoading(false)
    }
  }

  const validatePengeluaran = () => {
    const errors = {}
    if (!pengeluaranForm.keterangan?.trim()) errors.keterangan = 'Keterangan wajib diisi!'
    if (!pengeluaranForm.jumlah || Number(pengeluaranForm.jumlah) <= 0) errors.jumlah = 'Jumlah harus lebih dari 0!'
    if (!pengeluaranForm.tanggal) errors.tanggal = 'Tanggal wajib diisi!'
    setPengeluaranErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handlePengeluaranSubmit = async (e) => {
    e.preventDefault()
    if (!validatePengeluaran()) return
    setSubmitLoading(true)
    try {
      await api.post('/admin/keuangan/pengeluaran', pengeluaranForm)
      toast.success('✅ Pengeluaran berhasil ditambahkan!')
      setIsPengeluaranOpen(false)
      setPengeluaranForm({ kategori: 'operasional', keterangan: '', jumlah: '', tanggal: new Date().toISOString().split('T')[0] })
      setPengeluaranErrors({})
      fetchData()
      if (showHistory) fetchHistory()
    } catch (err) {
      toast.error('❌ ' + (err.response?.data?.message || 'Gagal menambah pengeluaran'))
    } finally {
      setSubmitLoading(false)
    }
  }

  const getCombinedHistory = () => {
    const pemasukanItems = pemasukans.map(p => ({ ...p, type: 'pemasukan' }))
    const pengeluaranItems = pengeluarans.map(p => ({ ...p, type: 'pengeluaran' }))
    const transaksiMotorItems = transaksiMotor.map(t => ({
      id: t.id,
      keterangan: t.keterangan,
      jumlah: t.jumlah,
      tanggal: t.tanggal,
      type: 'transaksi_motor',
      motor: t.motor,
      customer: t.customer,
      metode_pembayaran: t.metode_pembayaran,
      diproses_oleh: t.diproses_oleh
    }))

    let combined = [...pemasukanItems, ...pengeluaranItems, ...transaksiMotorItems]

    if (historyType === 'pemasukan') {
      combined = combined.filter(item => item.type === 'pemasukan')
    } else if (historyType === 'pengeluaran') {
      combined = combined.filter(item => item.type === 'pengeluaran')
    } else if (historyType === 'transaksi_motor') {
      combined = combined.filter(item => item.type === 'transaksi_motor')
    }
    return combined.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))
  }

  const combinedHistory = getCombinedHistory()

  const summaryCards = [
    { label: 'Total Pemasukan', value: formatRupiah(data?.total_pemasukan || 0), icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Total Pengeluaran', value: formatRupiah(data?.total_pengeluaran || 0), icon: TrendingDown, color: 'text-red-500', bg: 'bg-red-50' },
    { label: 'Keuntungan Kotor', value: formatRupiah(data?.keuntungan_kotor || 0), icon: DollarSign, color: 'text-[#10b981]', bg: 'bg-emerald-50' },
  ]

  // ===== RENDER SKELETON SAAT LOADING =====
  if (loading) {
    return (
      <div className="space-y-4 md:space-y-6 pb-8">
        <SkeletonHeader />
        <SkeletonFilter />
        <SkeletonSummary />
        <SkeletonTable />
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6 pb-8">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative">
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-[#10b981] animate-pulse" />
            <h1 className="text-2xl font-bold text-[#1a2f4f]">Keuangan & Laporan</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
            <Wallet size={14} className="text-[#10b981]" /> Kelola pemasukan, pengeluaran, dan laporan laba rugi
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setIsPemasukanOpen(true)}
            className="flex items-center gap-2 bg-[#10b981] hover:bg-emerald-600 text-white font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all duration-200 text-sm"
          >
            <Plus size={18} />
            <span>Pemasukan</span>
          </button>
          <button
            onClick={() => setIsPengeluaranOpen(true)}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-red-500/20 active:scale-[0.98] transition-all duration-200 text-sm"
          >
            <Plus size={18} />
            <span>Pengeluaran</span>
          </button>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              showHistory 
                ? 'bg-[#1a2f4f] text-white shadow-lg shadow-[#1a2f4f]/20' 
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            <Receipt size={18} />
            {showHistory ? 'Sembunyikan Riwayat' : 'Lihat Riwayat'}
          </button>
        </div>
      </div>

      {/* PERIODE FILTER */}
      <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col sm:flex-row sm:items-center gap-4 border border-gray-100">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-[#10b981]" />
          <span className="text-sm font-medium text-gray-600">Periode:</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 outline-none text-sm focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/10 transition-all"
          />
          <span className="text-gray-400">s/d</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 outline-none text-sm focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/10 transition-all"
          />
          <button
            onClick={() => { setStartDate(''); setEndDate('') }}
            className="text-xs text-red-500 hover:text-red-700 font-semibold transition-colors"
          >
            Reset
          </button>
        </div>
        <div className="flex ml-auto gap-2">
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-[#1a2f4f] text-white rounded-xl text-xs font-semibold hover:bg-[#12223a] transition-all duration-200 active:scale-[0.95]"
          >
            <FileText size={16} />
            PDF
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2 bg-[#10b981] text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-all duration-200 active:scale-[0.95]"
          >
            <FileSpreadsheet size={16} />
            Excel
          </button>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {summaryCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`${bg} rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-all duration-200 group`}>
            <div className="flex items-center gap-3">
              <div className={`${bg} p-3 rounded-lg group-hover:scale-110 transition-transform duration-200`}>
                <Icon className={color} size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500">{label}</p>
                <p className={`text-xl font-bold ${color}`}>{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* RIWAYAT TRANSAKSI */}
      {showHistory && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 animate-in fade-in slide-in-from-top-5 duration-300">
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <Receipt size={18} className="text-[#1a2f4f]" />
              <h2 className="text-sm font-semibold text-gray-700">Riwayat Transaksi</h2>
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                {combinedHistory.length} transaksi
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari keterangan..."
                  value={historySearch}
                  onChange={(e) => { setHistorySearch(e.target.value); setHistoryPage(1) }}
                  className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs outline-none focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/10 w-40 transition-all"
                />
              </div>
              <select
                value={historyType}
                onChange={(e) => { setHistoryType(e.target.value); setHistoryPage(1) }}
                className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-[#10b981] bg-white"
              >
                <option value="semua">📊 Semua</option>
                <option value="pemasukan">📈 Pemasukan</option>
                <option value="pengeluaran">📉 Pengeluaran</option>
                <option value="transaksi_motor">🏍️ Penjualan Motor</option>
              </select>
              <button
                onClick={() => { setHistorySearch(''); setHistoryType('semua'); setHistoryPage(1) }}
                className="text-xs text-red-500 hover:text-red-700 font-semibold"
              >
                Reset
              </button>
            </div>
          </div>

          {historyLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-8 h-8 border-4 border-[#1a2f4f] border-t-[#10b981] rounded-full animate-spin" />
            </div>
          ) : combinedHistory.length === 0 ? (
            <div className="py-10 text-center text-gray-400 text-sm">
              <Receipt size={32} className="mx-auto mb-2 text-gray-300" />
              <p>
                {historyType === 'pemasukan' && 'Belum ada riwayat pemasukan'}
                {historyType === 'pengeluaran' && 'Belum ada riwayat pengeluaran'}
                {historyType === 'transaksi_motor' && 'Belum ada riwayat penjualan motor'}
                {historyType === 'semua' && 'Belum ada riwayat transaksi'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b text-xs text-gray-400 uppercase tracking-wider">
                    <th className="px-4 py-3 text-left font-semibold">Tanggal</th>
                    <th className="px-4 py-3 text-left font-semibold">Keterangan</th>
                    <th className="px-4 py-3 text-left font-semibold">Kategori</th>
                    <th className="px-4 py-3 text-right font-semibold">Jumlah</th>
                    <th className="px-4 py-3 text-center font-semibold">Tipe</th>
                    <th className="px-4 py-3 text-center font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {combinedHistory.map((item) => (
                    <tr key={`${item.type}-${item.id}`} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 text-gray-600">{formatDate(item.tanggal)}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {item.keterangan}
                        {item.type === 'transaksi_motor' && item.motor && (
                          <div className="text-[10px] text-gray-400 font-mono mt-0.5">{item.motor.no_rangka}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600 capitalize">
                        {item.type === 'transaksi_motor'
                          ? 'Penjualan Motor'
                          : item.kategori ? (kategoriLabels[item.kategori] || item.kategori) : '-'}
                      </td>
                      <td className={`px-4 py-3 text-right font-bold ${item.type === 'pengeluaran' ? 'text-red-500' : 'text-emerald-600'}`}>
                        {item.type === 'pengeluaran' ? '-' : '+'} {formatRupiah(item.jumlah)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          item.type === 'pemasukan' ? 'bg-emerald-100 text-emerald-700'
                          : item.type === 'pengeluaran' ? 'bg-red-100 text-red-700'
                          : 'bg-blue-100 text-blue-700'
                        }`}>
                          {item.type === 'pemasukan' && '📈 Pemasukan'}
                          {item.type === 'pengeluaran' && '📉 Pengeluaran'}
                          {item.type === 'transaksi_motor' && '🏍️ Penjualan Motor'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {item.type === 'transaksi_motor' ? (
                          <button
                            onClick={() => { setSelectedMotorTransaksi(item); setIsMotorDetailOpen(true) }}
                            className="p-1.5 text-gray-400 hover:text-[#10b981] rounded-lg hover:bg-gray-100 transition-colors"
                            title="Lihat Detail"
                          >
                            <Info size={16} />
                          </button>
                        ) : (
                          <button
                            onClick={() => openDeleteModal(item, item.type)}
                            className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                            title={`Hapus ${item.type === 'pemasukan' ? 'pemasukan' : 'pengeluaran'}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {historyTotal > 10 && (
            <div className="bg-gray-50 px-4 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span>Total {historyTotal} transaksi</span>
              <div className="flex items-center gap-2">
                <button
                  disabled={historyPage === 1 || historyLoading}
                  onClick={() => setHistoryPage(prev => Math.max(prev - 1, 1))}
                  className="p-1 rounded border border-gray-200 bg-white hover:bg-gray-50 transition-colors disabled:opacity-40"
                >
                  <ChevronLeft size={14} />
                </button>
                <span>Halaman {historyPage}</span>
                <button
                  disabled={historyPage === historyLastPage || historyLoading}
                  onClick={() => setHistoryPage(prev => Math.min(prev + 1, historyLastPage))}
                  className="p-1 rounded border border-gray-200 bg-white hover:bg-gray-50 transition-colors disabled:opacity-40"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PENGELUARAN PER KATEGORI */}
      <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
        <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <PiggyBank size={16} className="text-[#10b981]" />
          Rincian Pengeluaran per Kategori
        </h2>
        {data?.pengeluaran_per_kategori?.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {data.pengeluaran_per_kategori.map((item) => (
              <div key={item.kategori} className="bg-gray-50 rounded-xl p-4 text-center hover:bg-gray-100 transition-colors duration-200">
                <p className="text-[10px] text-gray-400 uppercase font-semibold">
                  {kategoriLabels[item.kategori] || item.kategori}
                </p>
                <p className="text-sm font-bold text-gray-800 mt-1">{formatRupiah(item.total)}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400 text-sm py-4">Belum ada data pengeluaran</p>
        )}
      </div>

      {/* DETAIL LABA RUGI */}
      <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
        <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <Coins size={16} className="text-[#10b981]" />
          Detail Laba Rugi
        </h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-50">
            <span className="text-gray-500">Pemasukan dari Transaksi</span>
            <span className="font-semibold text-emerald-600">{formatRupiah(data?.pemasukan_dari_transaksi || 0)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-50">
            <span className="text-gray-500">Pemasukan Manual</span>
            <span className="font-semibold text-emerald-600">{formatRupiah(data?.pemasukan_manual || 0)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200 font-semibold">
            <span className="text-gray-700">Total Pemasukan</span>
            <span className="text-emerald-600">{formatRupiah(data?.total_pemasukan || 0)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-50">
            <span className="text-gray-500">Total Pengeluaran</span>
            <span className="font-semibold text-red-500">{formatRupiah(data?.total_pengeluaran || 0)}</span>
          </div>
          <div className="flex justify-between py-3 border-t-2 border-[#1a2f4f] bg-gradient-to-r from-emerald-50 to-transparent rounded-lg px-3 -mx-3">
            <span className="font-bold text-gray-800">KEUNTUNGAN KOTOR</span>
            <span className="font-bold text-[#10b981] text-lg">{formatRupiah(data?.keuntungan_kotor || 0)}</span>
          </div>
        </div>
      </div>

      {/* MODAL TAMBAH PEMASUKAN */}
      {isPemasukanOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 border border-gray-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Plus size={20} className="text-[#10b981]" />
                  Tambah Pemasukan
                </h2>
                <p className="text-xs text-gray-400 mt-1">Keterangan wajib diisi untuk dokumentasi</p>
              </div>
              <button onClick={() => setIsPemasukanOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handlePemasukanSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Keterangan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={pemasukanForm.keterangan}
                  onChange={(e) => {
                    setPemasukanForm({ ...pemasukanForm, keterangan: e.target.value })
                    if (pemasukanErrors.keterangan) setPemasukanErrors({ ...pemasukanErrors, keterangan: '' })
                  }}
                  placeholder="Contoh: Penjualan aksesoris, servis, dll"
                  className={`w-full px-3 py-2 border rounded-lg focus:border-[#10b981] outline-none text-sm transition-all ${
                    pemasukanErrors.keterangan ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-200'
                  }`}
                />
                {pemasukanErrors.keterangan && (
                  <p className="text-red-500 text-[10px] mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {pemasukanErrors.keterangan}
                  </p>
                )}
                <p className="text-[10px] text-gray-400 mt-1">📝 Contoh: "Penjualan Sparepart Beat"</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Jumlah (Rp) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={pemasukanForm.jumlah}
                  onChange={(e) => {
                    setPemasukanForm({ ...pemasukanForm, jumlah: e.target.value })
                    if (pemasukanErrors.jumlah) setPemasukanErrors({ ...pemasukanErrors, jumlah: '' })
                  }}
                  placeholder="0"
                  className={`w-full px-3 py-2 border rounded-lg focus:border-[#10b981] outline-none text-sm transition-all ${
                    pemasukanErrors.jumlah ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-200'
                  }`}
                />
                {pemasukanErrors.jumlah && (
                  <p className="text-red-500 text-[10px] mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {pemasukanErrors.jumlah}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Tanggal *</label>
                <input
                  type="date"
                  required
                  value={pemasukanForm.tanggal}
                  onChange={(e) => {
                    setPemasukanForm({ ...pemasukanForm, tanggal: e.target.value })
                    if (pemasukanErrors.tanggal) setPemasukanErrors({ ...pemasukanErrors, tanggal: '' })
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:border-[#10b981] outline-none text-sm transition-all ${
                    pemasukanErrors.tanggal ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-200'
                  }`}
                />
                {pemasukanErrors.tanggal && (
                  <p className="text-red-500 text-[10px] mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {pemasukanErrors.tanggal}
                  </p>
                )}
              </div>
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => { setIsPemasukanOpen(false); setPemasukanErrors({}) }}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="flex-1 px-4 py-2 bg-[#10b981] hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50 transition-all active:scale-[0.95] flex items-center justify-center gap-2"
                >
                  {submitLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                  {submitLoading ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH PENGELUARAN */}
      {isPengeluaranOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 border border-gray-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Plus size={20} className="text-red-500" />
                  Tambah Pengeluaran
                </h2>
                <p className="text-xs text-gray-400 mt-1">Keterangan wajib diisi untuk dokumentasi</p>
              </div>
              <button onClick={() => setIsPengeluaranOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handlePengeluaranSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Kategori *</label>
                <select
                  required
                  value={pengeluaranForm.kategori}
                  onChange={(e) => setPengeluaranForm({ ...pengeluaranForm, kategori: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-[#10b981] outline-none text-sm"
                >
                  <option value="pembelian_motor">Pembelian Motor</option>
                  <option value="operasional">Operasional</option>
                  <option value="gaji">Gaji Karyawan</option>
                  <option value="marketing">Marketing / Promosi</option>
                  <option value="lainnya">Lainnya</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Keterangan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={pengeluaranForm.keterangan}
                  onChange={(e) => {
                    setPengeluaranForm({ ...pengeluaranForm, keterangan: e.target.value })
                    if (pengeluaranErrors.keterangan) setPengeluaranErrors({ ...pengeluaranErrors, keterangan: '' })
                  }}
                  placeholder="Deskripsi pengeluaran"
                  className={`w-full px-3 py-2 border rounded-lg focus:border-[#10b981] outline-none text-sm transition-all ${
                    pengeluaranErrors.keterangan ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-200'
                  }`}
                />
                {pengeluaranErrors.keterangan && (
                  <p className="text-red-500 text-[10px] mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {pengeluaranErrors.keterangan}
                  </p>
                )}
                <p className="text-[10px] text-gray-400 mt-1">📝 Contoh: "Beli sparepart Beat"</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Jumlah (Rp) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={pengeluaranForm.jumlah}
                  onChange={(e) => {
                    setPengeluaranForm({ ...pengeluaranForm, jumlah: e.target.value })
                    if (pengeluaranErrors.jumlah) setPengeluaranErrors({ ...pengeluaranErrors, jumlah: '' })
                  }}
                  placeholder="0"
                  className={`w-full px-3 py-2 border rounded-lg focus:border-[#10b981] outline-none text-sm transition-all ${
                    pengeluaranErrors.jumlah ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-200'
                  }`}
                />
                {pengeluaranErrors.jumlah && (
                  <p className="text-red-500 text-[10px] mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {pengeluaranErrors.jumlah}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Tanggal *</label>
                <input
                  type="date"
                  required
                  value={pengeluaranForm.tanggal}
                  onChange={(e) => {
                    setPengeluaranForm({ ...pengeluaranForm, tanggal: e.target.value })
                    if (pengeluaranErrors.tanggal) setPengeluaranErrors({ ...pengeluaranErrors, tanggal: '' })
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:border-[#10b981] outline-none text-sm transition-all ${
                    pengeluaranErrors.tanggal ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-200'
                  }`}
                />
                {pengeluaranErrors.tanggal && (
                  <p className="text-red-500 text-[10px] mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {pengeluaranErrors.tanggal}
                  </p>
                )}
              </div>
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => { setIsPengeluaranOpen(false); setPengeluaranErrors({}) }}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50 transition-all active:scale-[0.95] flex items-center justify-center gap-2"
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
      {isDeleteOpen && deleteItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 border border-gray-100 text-center animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldAlert size={28} />
            </div>
            <h3 className="font-bold text-gray-800 text-lg">Hapus {deleteItem.type === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'}?</h3>
            <p className="text-gray-500 text-sm mt-2 leading-relaxed">
              Apakah Anda yakin ingin menghapus data <span className="font-semibold text-gray-700">{deleteItem.type === 'pemasukan' ? 'pemasukan' : 'pengeluaran'}</span> ini?
            </p>
            <div className="bg-gray-50 rounded-xl p-3 mt-3 text-left text-sm">
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Keterangan:</span>
                <span className="font-medium text-gray-800">{deleteItem.keterangan}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Jumlah:</span>
                <span className={`font-bold ${deleteItem.type === 'pemasukan' ? 'text-emerald-600' : 'text-red-500'}`}>
                  {deleteItem.type === 'pemasukan' ? '+' : '-'} {formatRupiah(deleteItem.jumlah)}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Tanggal:</span>
                <span className="font-medium text-gray-800">{formatDate(deleteItem.tanggal)}</span>
              </div>
              {deleteItem.kategori && deleteItem.kategori !== '-' && (
                <div className="flex justify-between py-1">
                  <span className="text-gray-500">Kategori:</span>
                  <span className="font-medium text-gray-800 capitalize">{kategoriLabels[deleteItem.kategori] || deleteItem.kategori}</span>
                </div>
              )}
            </div>
            <p className="text-red-400 text-xs mt-3">
              ⚠️ Tindakan ini tidak dapat dibatalkan!
            </p>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => { setIsDeleteOpen(false); setDeleteItem(null) }}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl text-sm font-semibold transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-xl text-sm font-semibold shadow-lg shadow-red-500/20 transition-all active:scale-[0.95] flex items-center justify-center gap-2"
              >
                {deleteLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                {deleteLoading ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL: DETAIL TRANSAKSI MOTOR ===== */}
      {isMotorDetailOpen && selectedMotorTransaksi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
            <div className="bg-[#1a2f4f] text-white px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Receipt size={20} className="text-[#10b981]" />
                Detail Transaksi Motor
              </h2>
              <button onClick={() => setIsMotorDetailOpen(false)} className="text-white/60 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-3 text-sm text-gray-700">
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-semibold">Unit Motor</p>
                <p className="font-medium">
                  {selectedMotorTransaksi.motor?.merk} {selectedMotorTransaksi.motor?.tipe} ({selectedMotorTransaksi.motor?.tahun})
                </p>
                <p className="text-xs text-gray-400 capitalize">{selectedMotorTransaksi.motor?.warna}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-3">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-semibold">No. Rangka</p>
                  <p className="font-mono text-xs">{selectedMotorTransaksi.motor?.no_rangka}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-semibold">No. Mesin</p>
                  <p className="font-mono text-xs">{selectedMotorTransaksi.motor?.no_mesin}</p>
                </div>
              </div>
              <div className="border-t border-gray-100 pt-3">
                <p className="text-[10px] text-gray-400 uppercase font-semibold">Pembeli</p>
                <p className="font-medium">{selectedMotorTransaksi.customer?.nama}</p>
                <p className="text-xs text-gray-400">{selectedMotorTransaksi.customer?.no_hp}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-3">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-semibold">Harga Kesepakatan</p>
                  <p className="font-bold text-emerald-600">{formatRupiah(selectedMotorTransaksi.jumlah)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-semibold">Metode Bayar</p>
                  <p className="font-medium capitalize">{selectedMotorTransaksi.metode_pembayaran}</p>
                </div>
              </div>
              <div className="border-t border-gray-100 pt-3">
                <p className="text-[10px] text-gray-400 uppercase font-semibold">Diproses Oleh</p>
                <p className="font-medium">{selectedMotorTransaksi.diproses_oleh}</p>
              </div>
            </div>
            <div className="px-6 pb-6 flex justify-end">
              <button
                onClick={() => setIsMotorDetailOpen(false)}
                className="px-5 py-2 bg-[#1a2f4f] text-white rounded-xl text-xs font-semibold hover:bg-[#12223a]"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}