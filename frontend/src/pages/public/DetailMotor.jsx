// src/pages/public/DetailMotor.jsx
import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Bike, Heart, ArrowLeft, Award, Eye, MapPin, Phone, Sparkles, ChevronRight, Share2, Clock, ShieldCheck, X, Calendar, CreditCard, Info, Shield, CheckCircle, Star, Fuel, Gauge, Zap } from 'lucide-react'
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

export default function DetailMotor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [motor, setMotor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedImage, setSelectedImage] = useState(0)

  const { isAuthenticated, user } = useAuthStore()
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingForm, setBookingForm] = useState({
    jenis_bayar: 'tunai',
    tanggal_booking: '',
    pesan: ''
  })

  // ===== WISHLIST STATE =====
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [wishlistLoading, setWishlistLoading] = useState(false)

  const handleBooking = async (e) => {
    e.preventDefault()
    
    if (!bookingForm.tanggal_booking) {
      toast.error('Harap isi tanggal booking')
      return
    }

    setBookingLoading(true)
    try {
      await api.post('/customer/bookings', {
        motor_id: id,
        jenis_bayar: bookingForm.jenis_bayar,
        tanggal_booking: bookingForm.tanggal_booking,
        pesan: bookingForm.pesan
      })
      toast.success('Booking berhasil dibuat!')
      setShowBookingModal(false)
      navigate('/customer/booking')
    } catch (err) {
      console.error('Booking error:', err)
      toast.error(err.response?.data?.message || 'Gagal membuat booking')
    } finally {
      setBookingLoading(false)
    }
  }

  // ===== WISHLIST HANDLER =====
  const handleWishlistToggle = async () => {
    if (!isAuthenticated()) {
      navigate('/login')
      return
    }

    setWishlistLoading(true)
    try {
      const response = await api.post('/customer/wishlist/toggle', { motor_id: id })
      setIsWishlisted(response.data?.status === 'added')
      toast.success(response.data?.message || 'Berhasil diperbarui')
    } finally {
      setWishlistLoading(false)
    }
  }

  useEffect(() => {
    const fetchMotor = async () => {
      try {
        setLoading(true)
        setError(null)

        console.log('🔍 Fetching motor with ID:', id)

        const response = await api.get(`/public/motors/${id}`)

        console.log('✅ Response:', response.data)

        let motorData = response.data?.data || response.data

        console.log('📸 Full motor data:', motorData)
        console.log('📸 Photos array:', motorData?.photos)

        setMotor(motorData)

      } catch (err) {
        console.error('❌ Error fetching motor:', err)

        if (err.response?.status === 404) {
          setError('Motor tidak ditemukan atau sudah tidak tersedia')
        } else {
          setError('Gagal memuat detail motor')
        }

        toast.error('Gagal memuat detail motor')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchMotor()
    }
  }, [id])

  // ===== CEK STATUS WISHLIST =====
  useEffect(() => {
    const checkWishlist = async () => {
      if (!isAuthenticated() || !id) return
      try {
        const response = await api.get(`/customer/wishlist/check/${id}`)
        setIsWishlisted(response.data?.is_wishlist || false)
      } catch (err) {
        console.error('Error checking wishlist:', err)
      }
    }
    checkWishlist()
  }, [id])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-[#10b981] border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm mt-4">Memuat detail motor...</p>
      </div>
    )
  }

  if (error || !motor) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <Bike size={64} className="mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500 text-lg">{error || 'Motor tidak ditemukan'}</p>
        <p className="text-sm text-gray-400 mt-2">Motor mungkin sudah terjual atau tidak tersedia</p>
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          <Link to="/katalog" className="px-6 py-2.5 bg-[#10b981] hover:bg-emerald-600 text-white font-semibold rounded-xl transition-all duration-300">
            Kembali ke Katalog
          </Link>
          <Link to="/" className="px-6 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-600 font-semibold rounded-xl transition-all duration-300">
            Ke Beranda
          </Link>
        </div>
      </div>
    )
  }

  // ===== AMBIL URL FOTO =====
  let photoUrls = []
  
  if (motor.photos && Array.isArray(motor.photos)) {
    photoUrls = motor.photos.map(photo => {
      if (typeof photo === 'string') return photo
      if (photo.url) return photo.url
      if (photo.photo?.url) return photo.photo.url
      if (photo.path) return photo.path
      if (photo.link) return photo.link
      if (typeof photo === 'object') {
        const values = Object.values(photo)
        const urlValue = values.find(v => typeof v === 'string' && (v.startsWith('http') || v.startsWith('/')))
        if (urlValue) return urlValue
      }
      return null
    }).filter(url => url !== null)
  }

  const currentPhotoUrl = photoUrls.length > 0 
    ? photoUrls[selectedImage] || photoUrls[0]
    : null

  const specs = [
    { label: 'Status', value: motor.status, color: 'text-emerald-600' },
    { label: 'Kondisi', value: motor.kondisi, color: 'text-gray-800' },
    { label: 'Tahun', value: motor.tahun, color: 'text-gray-800' },
    { label: 'Warna', value: motor.warna, color: 'text-gray-800' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <Link to="/katalog" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#10b981] transition-all duration-300 group mb-6">
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        Kembali ke Katalog
      </Link>

      <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-8">

          {/* Gallery */}
          <div className="space-y-3">
            <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden relative group">
              {currentPhotoUrl ? (
                <>
                  <img
                    src={currentPhotoUrl}
                    alt={`${motor.merk} ${motor.tipe}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      console.error('❌ Image failed to load:', currentPhotoUrl)
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%239ca3af" stroke-width="2"%3E%3Crect x="3" y="3" width="18" height="18" rx="2"%3E%3C/rect%3E%3Ccircle cx="8.5" cy="8.5" r="1.5"%3E%3C/circle%3E%3Cpath d="M21 15l-5-5L5 21"%3E%3C/path%3E%3C/svg%3E'
                    }}
                  />
                  
                  {/* ===== CARD OVERLAY DI FOTO ===== */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                        <CheckCircle size={14} className="text-emerald-400" />
                        <span className="text-xs font-medium">Tersedia</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                        <Star size={14} className="text-yellow-400" />
                        <span className="text-xs font-medium">Kondisi {motor.kondisi || 'Baik'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                        <Calendar size={14} className="text-blue-400" />
                        <span className="text-xs font-medium">{motor.tahun}</span>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold">{formatRupiah(motor.harga_jual)}</span>
                        {/* HAPUS harga minimal yang dicoret */}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleWishlistToggle()
                        }}
                        disabled={wishlistLoading}
                        className={`p-2 rounded-full transition-all duration-300 ${
                          isWishlisted
                            ? 'bg-[#10b981] text-white'
                            : 'bg-white/20 backdrop-blur-sm hover:bg-white/40 text-white'
                        }`}
                      >
                        <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Bike size={64} className="text-gray-300" />
                </div>
              )}
              
              {/* Badge Status */}
              <div className="absolute top-3 right-3">
                <span className="bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg shadow-emerald-500/30 flex items-center gap-1.5">
                  <CheckCircle size={12} />
                  Tersedia
                </span>
              </div>

              {/* Wishlist Button di atas foto */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleWishlistToggle()
                }}
                disabled={wishlistLoading}
                className={`absolute top-3 left-3 p-2.5 rounded-full shadow-lg transition-all duration-300 hover:scale-110 ${
                  isWishlisted
                    ? 'bg-[#10b981] text-white shadow-emerald-500/30'
                    : 'bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-white'
                }`}
              >
                <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
              </button>

              {/* Info Foto */}
              <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm text-white/80 text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5">
                <Camera size={12} />
                {selectedImage + 1} / {photoUrls.length || 1}
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {photoUrls.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {photoUrls.map((url, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square bg-gray-100 rounded-xl overflow-hidden transition-all duration-300 relative group/thumb ${
                      selectedImage === index ? 'ring-2 ring-[#10b981] shadow-lg shadow-emerald-500/20' : 'hover:ring-2 hover:ring-gray-300'
                    }`}
                  >
                    <img 
                      src={url} 
                      alt={`${motor.merk} ${index + 1}`} 
                      className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%239ca3af" stroke-width="2"%3E%3Crect x="3" y="3" width="18" height="18" rx="2"%3E%3C/rect%3E%3Ccircle cx="8.5" cy="8.5" r="1.5"%3E%3C/circle%3E%3Cpath d="M21 15l-5-5L5 21"%3E%3C/path%3E%3C/svg%3E'
                      }}
                    />
                    {selectedImage === index && (
                      <div className="absolute inset-0 border-2 border-[#10b981] rounded-xl" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-6">

            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-[#1a2f4f] flex items-center gap-2">
                    {motor.merk} {motor.tipe}
                    <Sparkles size={20} className="text-[#10b981]" />
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
                    <span>{motor.tahun}</span>
                    <span>•</span>
                    <span className="capitalize">{motor.warna}</span>
                    <span>•</span>
                    <span className="capitalize font-medium text-emerald-600">{motor.kondisi}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#10b981]/10 to-emerald-50 rounded-2xl p-5 border border-[#10b981]/20">
              <p className="text-sm text-gray-500">Harga</p>
              <p className="text-3xl font-bold text-[#10b981]">{formatRupiah(motor.harga_jual)}</p>
              {/* HAPUS harga minimal yang dicoret */}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {specs.map(({ label, value, color }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className={`font-semibold capitalize ${color}`}>{value}</p>
                </div>
              ))}
            </div>

            {/* Detail Motor */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Shield size={16} className="text-[#10b981]" />
                Informasi Tambahan
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                {motor.no_polisi && (
                  <div className="col-span-2">
                    <p className="text-gray-400 text-xs">No. Polisi</p>
                    <p className="font-medium text-gray-700">{motor.no_polisi}</p>
                  </div>
                )}
                <div className="col-span-2 mt-1">
                  <div className="flex items-center gap-2 bg-amber-50 text-amber-700 text-xs p-2 rounded-lg border border-amber-200">
                    <Info size={14} className="flex-shrink-0" />
                    <span>No. Rangka dan No. Mesin akan ditampilkan setelah proses booking selesai</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              {isAuthenticated() ? (
                <button
                  onClick={() => setShowBookingModal(true)}
                  className="flex-1 px-6 py-3 bg-[#10b981] hover:bg-emerald-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/20 transition-all duration-300 text-center hover:shadow-emerald-500/40 hover:-translate-y-0.5"
                >
                  Booking Sekarang
                </button>
              ) : (
                <Link
                  to="/login"
                  className="flex-1 px-6 py-3 bg-[#10b981] hover:bg-emerald-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/20 transition-all duration-300 text-center hover:shadow-emerald-500/40 hover:-translate-y-0.5"
                >
                  Login untuk Booking
                </Link>
              )}
              <Link
                to="/katalog"
                className="px-6 py-3 border-2 border-gray-200 hover:border-[#10b981] text-gray-600 hover:text-[#10b981] font-semibold rounded-xl transition-all duration-300 hover:bg-emerald-50"
              >
                Motor Lain
              </Link>
            </div>

            <div className="bg-gradient-to-r from-[#1a2f4f] to-[#12223a] rounded-xl p-4 text-white">
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <MapPin size={16} className="text-[#10b981]" />
                Informasi Showroom
              </h3>
              <div className="flex items-center gap-2 text-sm text-white/70">
                <MapPin size={14} />
                <span>Jl. Piere Tendean No.1, Karangrejo, Kec. Banyuwangi, Kabupaten Banyuwangi, Jawa Timur 68411</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/70 mt-1">
                <Phone size={14} />
                <span>0812-3456-7890</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/70 mt-1">
                <Clock size={14} />
                <span>08.00 - 20.00 (Senin-Sabtu)</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#1a2f4f] text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold">Form Booking Motor</h3>
              <button onClick={() => setShowBookingModal(false)} className="text-white/70 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleBooking} className="p-6 space-y-4">
              {/* Informasi User (readonly) */}
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Data Pembeli</p>
                <p className="font-medium text-gray-700">{user?.name || user?.nama || 'Tidak tersedia'}</p>
                <p className="text-sm text-gray-500">{user?.email || 'Tidak tersedia'}</p>
                {user?.no_hp && (
                  <p className="text-sm text-gray-500">HP: {user.no_hp}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Metode Pembayaran <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={bookingForm.jenis_bayar}
                  onChange={e => setBookingForm({...bookingForm, jenis_bayar: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/10 outline-none"
                >
                  <option value="tunai">Tunai</option>
                  <option value="kredit">Kredit</option>
                  <option value="indent">Indent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Booking <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={bookingForm.tanggal_booking}
                  onChange={e => setBookingForm({...bookingForm, tanggal_booking: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/10 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pesan (Opsional)</label>
                <textarea
                  rows="3"
                  value={bookingForm.pesan}
                  onChange={e => setBookingForm({...bookingForm, pesan: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/10 outline-none"
                  placeholder="Contoh: Saya ingin lihat motornya besok pagi"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="flex-1 px-4 py-2.5 bg-[#10b981] text-white rounded-xl font-medium hover:bg-emerald-600 disabled:opacity-50"
                >
                  {bookingLoading ? 'Memproses...' : 'Konfirmasi Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}

// Import Camera icon
const Camera = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
    <circle cx="12" cy="13" r="3"/>
  </svg>
)