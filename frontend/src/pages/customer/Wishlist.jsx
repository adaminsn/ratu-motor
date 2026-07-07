// src/pages/customer/Wishlist.jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Trash2, Bike, ShoppingCart, Sparkles } from 'lucide-react'
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

// ===== SKELETON LOADING =====
const SkeletonWishlist = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 animate-pulse">
        <div className="aspect-[4/3] bg-gray-200" />
        <div className="p-4">
          <div className="h-5 w-32 bg-gray-200 rounded" />
          <div className="h-4 w-24 bg-gray-200 rounded mt-1" />
          <div className="h-6 w-28 bg-gray-200 rounded mt-2" />
          <div className="h-9 w-full bg-gray-200 rounded-lg mt-3" />
        </div>
      </div>
    ))}
  </div>
)

export default function Wishlist() {
  const [wishlists, setWishlists] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [removing, setRemoving] = useState(null)

  const fetchWishlist = async () => {
    setLoading(true)
    try {
      const response = await api.get('/customer/wishlist', {
        params: { page: currentPage, per_page: 12 }
      })
      setWishlists(response.data?.data || [])
      setCurrentPage(response.data?.current_page || 1)
      setLastPage(response.data?.last_page || 1)
      setTotal(response.data?.total || 0)
    } catch (err) {
      console.error('Error fetching wishlist:', err)
      toast.error('Gagal memuat wishlist')
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (id) => {
    if (!confirm('Hapus motor dari wishlist?')) return
    setRemoving(id)
    try {
      await api.delete(`/customer/wishlist/${id}`)
      toast.success('Motor dihapus dari wishlist')
      fetchWishlist()
    } catch (err) {
      console.error('Error removing wishlist:', err)
      toast.error('Gagal menghapus dari wishlist')
    } finally {
      setRemoving(null)
    }
  }

  useEffect(() => {
    fetchWishlist()
  }, [currentPage])

  // Generate page numbers
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

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-32 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-4 w-48 bg-gray-200 rounded-lg mt-1 animate-pulse" />
          </div>
          <div className="h-8 w-20 bg-gray-200 rounded-full animate-pulse" />
        </div>
        <SkeletonWishlist />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header - Tanpa Badge/Notif */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1a2f4f] flex items-center gap-2">
            <Heart size={24} className="text-[#10b981]" />
            Wishlist
          </h1>
          <p className="text-sm text-gray-500 mt-1">Daftar motor favorit Anda</p>
        </div>
        {/* Badge/Notif dihapus */}
      </div>

      {/* List */}
      {wishlists.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart size={40} className="text-gray-300" />
          </div>
          <p className="text-gray-500 font-medium">Belum ada motor di wishlist</p>
          <p className="text-sm text-gray-400 mt-1">Temukan motor impian dan tambahkan ke wishlist</p>
          <Link 
            to="/katalog" 
            className="inline-flex items-center gap-2 mt-4 px-6 py-2.5 bg-[#10b981] hover:bg-emerald-600 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-emerald-500/20"
          >
            <Bike size={18} />
            Lihat Katalog
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {wishlists.map((item) => (
              <div 
                key={item.id} 
                className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
              >
                  <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                    {item.motor?.photos?.length > 0 ? (
                      <img
                        src={item.motor.photos[0].photo_path}
                        alt={item.motor?.merk}
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
                    {item.motor?.status === 'tersedia' ? (
                      <span className="absolute top-2 left-2 bg-emerald-500 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full shadow-lg shadow-emerald-500/30">
                        Tersedia
                      </span>
                    ) : (
                      <span className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full shadow-lg shadow-amber-500/30">
                        Reserved
                      </span>
                    )}
                    <button
                      onClick={(e) => { 
                        e.preventDefault(); 
                        e.stopPropagation(); 
                        handleRemove(item.id) 
                      }}
                      disabled={removing === item.id}
                      className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-all duration-300 hover:scale-110 disabled:opacity-50 z-10"
                    >
                      {removing === item.id ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-800 line-clamp-1">
                    {item.motor?.merk} {item.motor?.tipe}
                  </h3>
                  <p className="text-sm text-gray-500">{item.motor?.tahun} · {item.motor?.warna}</p>
                  <p className="text-lg font-bold text-[#10b981] mt-2">
                    {formatRupiah(item.motor?.harga_jual)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {total > 12 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="text-sm text-gray-500">
                Menampilkan {((currentPage - 1) * 12) + 1} - {Math.min(currentPage * 12, total)} dari {total} motor
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1 || loading}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-[#10b981] hover:text-white hover:border-[#10b981] transition-all duration-300 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-gray-600"
                >
                  <span className="sr-only">Previous</span>
                  ←
                </button>

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

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, lastPage))}
                  disabled={currentPage === lastPage || loading}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-[#10b981] hover:text-white hover:border-[#10b981] transition-all duration-300 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-gray-600"
                >
                  <span className="sr-only">Next</span>
                  →
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <style>{`
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