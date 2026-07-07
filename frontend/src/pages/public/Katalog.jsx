// src/pages/public/Katalog.jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter, Bike, Eye, Sparkles, Heart, ChevronLeft, ChevronRight } from 'lucide-react'
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

export default function Katalog() {
  const [motors, setMotors] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [merkFilter, setMerkFilter] = useState('')
  const [hargaMin, setHargaMin] = useState('')
  const [hargaMax, setHargaMax] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [perPage] = useState(12)

  // Daftar merk untuk filter
  const merkList = ['Semua', 'Honda', 'Yamaha', 'Suzuki', 'Kawasaki', 'TVS']

  const fetchMotors = async () => {
    setLoading(true)
    try {
      const response = await api.get('/public/motors', {
        params: {
          search: search || undefined,
          merk: merkFilter === 'Semua' || !merkFilter ? undefined : merkFilter,
          harga_min: hargaMin || undefined,
          harga_max: hargaMax || undefined,
          page: currentPage,
          per_page: perPage
        }
      })
      
      const data = response.data
      setMotors(data?.data || [])
      setCurrentPage(data?.current_page || data?.meta?.current_page || 1)
      setLastPage(data?.last_page || data?.meta?.last_page || 1)
      setTotal(data?.total || data?.meta?.total || 0)
      
    } catch (err) {
      console.error('Error fetching motors:', err)
      toast.error('Gagal memuat data motor')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMotors()
  }, [search, merkFilter, hargaMin, hargaMax, currentPage])

  const handleMerkClick = (merk) => {
    setMerkFilter(merk === 'Semua' ? '' : merk)
    setCurrentPage(1)
  }

  const handleClearFilters = () => {
    setSearch('')
    setMerkFilter('')
    setHargaMin('')
    setHargaMax('')
    setCurrentPage(1)
  }

  const hasActiveFilters = search || merkFilter || hargaMin || hargaMax

  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 5
    let start = Math.max(1, currentPage - 2)
    let end = Math.min(lastPage, start + maxVisible - 1)
    
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1)
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    return pages
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#1a2f4f] flex items-center gap-3">
          <Sparkles size={28} className="text-[#10b981]" />
          Katalog Motor
        </h1>
        <p className="text-gray-500 mt-2">Temukan motor impian Anda di Ratu Motor</p>
      </div>

      {/* ===== FILTER MERK (TAB) ===== */}
      <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 border border-gray-100">
        <div className="flex flex-wrap gap-2">
          {merkList.map((merk) => (
            <button
              key={merk}
              onClick={() => handleMerkClick(merk)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                (merkFilter === '' && merk === 'Semua') || merkFilter === merk
                  ? 'bg-[#10b981] text-white shadow-lg shadow-emerald-500/30'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {merk}
            </button>
          ))}
        </div>
      </div>

      {/* ===== SEARCH & FILTER LANJUTAN ===== */}
      <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative group">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-[#10b981] transition-colors" />
            <input
              type="text"
              placeholder="Cari merk, tipe, atau model motor..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl focus:border-[#10b981] focus:bg-white focus:ring-2 focus:ring-[#10b981]/10 outline-none text-sm transition-all duration-300"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                showFilters 
                  ? 'bg-[#10b981] text-white shadow-lg shadow-emerald-500/30' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
            >
              <Filter size={18} />
              {showFilters ? 'Sembunyikan Filter' : 'Filter Harga'}
            </button>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="px-4 py-3 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl text-sm font-medium transition-all duration-300"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100 animate-slide-down">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Harga Minimum</label>
              <input
                type="number"
                min="0"
                placeholder="Rp 0"
                value={hargaMin}
                onChange={(e) => {
                  setHargaMin(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none text-sm focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/10 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Harga Maksimum</label>
              <input
                type="number"
                min="0"
                placeholder="Tanpa batas"
                value={hargaMax}
                onChange={(e) => {
                  setHargaMax(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none text-sm focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/10 transition-all"
              />
            </div>
          </div>
        )}
      </div>

      {/* Result Count */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500">
          Menampilkan <span className="font-semibold text-gray-700">{motors.length}</span> motor dari <span className="font-semibold text-gray-700">{total}</span>
          {merkFilter && (
            <span className="ml-2 text-[#10b981] font-semibold">· Merk: {merkFilter}</span>
          )}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">
            Halaman {currentPage} dari {lastPage}
          </span>
        </div>
      </div>

      {/* Motor Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-[#10b981] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm mt-4">Memuat data motor...</p>
        </div>
      ) : motors.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
          <Bike size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">Belum ada motor yang tersedia</p>
          <p className="text-sm text-gray-400 mt-1">Coba ubah filter atau cari kata kunci lain</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {motors.map((motor) => (
            <Link
              key={motor.id}
              to={`/motor/${motor.id}`}
              className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden border border-gray-100 hover:-translate-y-2"
            >
              <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                {motor.photos?.length > 0 ? (
                  <img
                      src={motor.photos[0].url}
                      alt={motor.merk}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%239ca3af" stroke-width="2"%3E%3Crect x="3" y="3" width="18" height="18" rx="2"%3E%3C/rect%3E%3Ccircle cx="8.5" cy="8.5" r="1.5"%3E%3C/circle%3E%3Cpath d="M21 15l-5-5L5 21"%3E%3C/path%3E%3C/svg%3E'
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Bike size={48} className="text-gray-300" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span className="bg-emerald-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg shadow-emerald-500/30">
                    Tersedia
                  </span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>

              <div className="p-4">
                <h3 className="font-bold text-gray-800 text-lg hover:text-[#10b981] transition-colors line-clamp-1">
                  {motor.merk} {motor.tipe}
                </h3>
                <p className="text-sm text-gray-500">{motor.tahun} · {motor.warna}</p>
                <p className="text-xl font-bold text-[#10b981] mt-2">{formatRupiah(motor.harga_jual)}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="flex items-center gap-2 text-sm text-gray-400 group-hover:text-[#10b981] transition-colors">
                    <Eye size={14} /> Lihat Detail
                  </span>
                  <button 
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      toast.info('Login untuk menambahkan ke wishlist')
                    }}
                    className="p-2 text-gray-300 hover:text-[#10b981] rounded-lg hover:bg-emerald-50 transition-all duration-300"
                  >
                    <Heart size={18} />
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* ===== PAGINATION ===== */}
      {total > perPage && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="text-sm text-gray-500">
            Menampilkan {((currentPage - 1) * perPage) + 1} - {Math.min(currentPage * perPage, total)} dari {total} motor
          </div>
          
          <div className="flex items-center gap-2">
            {/* Prev Button */}
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || loading}
              className="p-2 rounded-lg border border-gray-200 hover:bg-[#10b981] hover:text-white hover:border-[#10b981] transition-all duration-300 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-gray-600 disabled:hover:border-gray-200"
            >
              <ChevronLeft size={18} />
            </button>

            {/* Page Numbers */}
            <div className="flex gap-1">
              {getPageNumbers().map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-all duration-300 ${
                    currentPage === page
                      ? 'bg-[#10b981] text-white shadow-lg shadow-emerald-500/30'
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            {/* Next Button */}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, lastPage))}
              disabled={currentPage === lastPage || loading}
              className="p-2 rounded-lg border border-gray-200 hover:bg-[#10b981] hover:text-white hover:border-[#10b981] transition-all duration-300 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-gray-600 disabled:hover:border-gray-200"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-down { animation: slide-down 0.3s ease-out; }
        
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}