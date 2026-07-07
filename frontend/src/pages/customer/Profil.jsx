// src/pages/customer/Profil.jsx
import { useState, useEffect, useRef } from 'react'
import { 
  User, Mail, Phone, MapPin, Save, Sparkles, UserCircle, Shield, 
  Camera, X, Crop, ZoomIn, Upload
} from 'lucide-react'
import api from '../../api/axios'
import useAuthStore from '../../store/authStore'
import toast from 'react-hot-toast'

const SkeletonProfile = () => (
  <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 animate-pulse">
    <div className="flex flex-col items-center mb-6">
      <div className="w-24 h-24 bg-gray-200 rounded-full" />
      <div className="h-5 w-32 bg-gray-200 rounded-lg mt-3" />
      <div className="h-4 w-48 bg-gray-200 rounded-lg mt-1" />
    </div>
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i}>
          <div className="h-4 w-24 bg-gray-200 rounded-lg" />
          <div className="h-10 w-full bg-gray-200 rounded-lg mt-1" />
        </div>
      ))}
      <div className="h-10 w-32 bg-gray-200 rounded-lg" />
    </div>
  </div>
)

export default function Profil() {
  const { user, setUser } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    no_hp: '',
    alamat: ''
  })
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [avatarFile, setAvatarFile] = useState(null)
  const fileInputRef = useRef(null)

  // ===== CROP STATE =====
  const [showCropModal, setShowCropModal] = useState(false)
  const [cropImage, setCropImage] = useState(null)
  const [cropPosition, setCropPosition] = useState({ x: 0, y: 0 })
  const [cropSize, setCropSize] = useState({ width: 200, height: 200 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const cropContainerRef = useRef(null)
  const imageRef = useRef(null)

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        no_hp: user.no_hp || '',
        alamat: user.alamat || ''
      })
      if (user.avatar) {
        setAvatarPreview(user.avatar)
      }
    }
    setInitialLoading(false)
  }, [user])

  // ===== UPDATE USER DI STORE =====
  const updateUserInStore = (userData) => {
    if (setUser) {
      setUser(userData)
    }
    window.dispatchEvent(new Event('storage'))
    window.dispatchEvent(new Event('user-updated'))
  }

  // ===== SUBMIT PROFIL =====
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await api.put('/customer/profil', {
        name: formData.name,
        no_hp: formData.no_hp,
        alamat: formData.alamat
      })
      
      if (response.data?.user) {
        updateUserInStore(response.data.user)
      }
      
      // Upload avatar jika ada
      if (avatarFile) {
        await uploadAvatarToServer(avatarFile)
      }
      
      toast.success('Profil berhasil diperbarui!')
    } catch (err) {
      console.error('Error updating profile:', err)
      toast.error(err.response?.data?.message || 'Gagal memperbarui profil')
    } finally {
      setLoading(false)
    }
  }

  // ===== UPLOAD AVATAR =====
  const uploadAvatarToServer = async (file) => {
    if (!file) return
    
    setUploadLoading(true)
    try {
      const formData = new FormData()
      formData.append('avatar', file)
      
      const response = await api.post('/customer/profil/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      console.log('📦 Upload Response:', response.data)
      
      if (response.data?.user) {
        const userData = response.data.user
        
        // Update store
        if (setUser) {
          setUser(userData)
        }
        
        // Update preview
        setAvatarPreview(userData.avatar)
        setAvatarFile(null)
        
        toast.success('Foto profil berhasil diupdate!')
        
        // Trigger events
        window.dispatchEvent(new Event('storage'))
        window.dispatchEvent(new Event('user-updated'))
        
        // Refresh data dari server
        await refreshUserData()
      }
    } catch (err) {
      console.error('Error uploading avatar:', err)
      toast.error(err.response?.data?.message || 'Gagal upload foto profil')
    } finally {
      setUploadLoading(false)
    }
  }

  // ===== REFRESH USER DATA =====
  const refreshUserData = async () => {
    try {
      const response = await api.get('/customer/profil')
      if (response.data?.user) {
        if (setUser) {
          setUser(response.data.user)
        }
        setAvatarPreview(response.data.user.avatar)
        window.dispatchEvent(new Event('storage'))
        window.dispatchEvent(new Event('user-updated'))
      }
    } catch (err) {
      console.error('Error refreshing user:', err)
    }
  }

  // ===== CROP FUNCTIONS =====
  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Format file tidak didukung. Gunakan JPG, PNG, atau WEBP')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 5MB')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setCropImage(reader.result)
      setShowCropModal(true)
      setCropPosition({ x: 0, y: 0 })
      setCropSize({ width: 200, height: 200 })
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleMouseDown = (e) => {
    setIsDragging(true)
    setDragStart({
      x: e.clientX - cropPosition.x,
      y: e.clientY - cropPosition.y
    })
  }

  const handleMouseMove = (e) => {
    if (!isDragging || !cropContainerRef.current) return
    
    const container = cropContainerRef.current
    const rect = container.getBoundingClientRect()
    
    let newX = e.clientX - dragStart.x
    let newY = e.clientY - dragStart.y
    
    const maxX = rect.width - cropSize.width
    const maxY = rect.height - cropSize.height
    
    newX = Math.max(0, Math.min(newX, maxX))
    newY = Math.max(0, Math.min(newY, maxY))
    
    setCropPosition({ x: newX, y: newY })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleZoomIn = () => {
    setCropSize(prev => ({
      width: Math.min(prev.width + 20, 400),
      height: Math.min(prev.height + 20, 400)
    }))
  }

  const handleZoomOut = () => {
    setCropSize(prev => ({
      width: Math.max(prev.width - 20, 80),
      height: Math.max(prev.height - 20, 80)
    }))
  }

  const handleCropConfirm = async () => {
    if (!imageRef.current || !cropContainerRef.current) return

    const image = imageRef.current
    const container = cropContainerRef.current
    
    const scaleX = image.naturalWidth / image.clientWidth
    const scaleY = image.naturalHeight / image.clientHeight
    
    const cropX = cropPosition.x * scaleX
    const cropY = cropPosition.y * scaleY
    const cropW = cropSize.width * scaleX
    const cropH = cropSize.height * scaleY

    const canvas = document.createElement('canvas')
    canvas.width = cropSize.width
    canvas.height = cropSize.height
    const ctx = canvas.getContext('2d')
    
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    
    ctx.drawImage(
      image,
      cropX, cropY, cropW, cropH,
      0, 0, cropSize.width, cropSize.height
    )

    setUploadLoading(true)
    canvas.toBlob(async (blob) => {
      if (blob) {
        const file = new File([blob], 'avatar-cropped.jpg', { type: 'image/jpeg' })
        setAvatarFile(file)
        setAvatarPreview(URL.createObjectURL(blob))
        setShowCropModal(false)
        
        await uploadAvatarToServer(file)
      }
      setUploadLoading(false)
    }, 'image/jpeg', 0.95)
  }

  const handleCropCancel = () => {
    setShowCropModal(false)
    setCropImage(null)
    setCropPosition({ x: 0, y: 0 })
    setCropSize({ width: 200, height: 200 })
  }

  const handleRemoveAvatar = () => {
    setAvatarFile(null)
    setAvatarPreview(user?.avatar || null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  if (initialLoading) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-32 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-4 w-48 bg-gray-200 rounded-lg mt-1 animate-pulse" />
          </div>
        </div>
        <SkeletonProfile />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1a2f4f] flex items-center gap-2">
            <UserCircle size={24} className="text-[#10b981]" />
            Profil Saya
          </h1>
          <p className="text-sm text-gray-500 mt-1">Kelola informasi akun Anda</p>
        </div>
        <div className="flex items-center gap-2 bg-[#10b981]/10 px-3 py-1.5 rounded-full">
          <Shield size={14} className="text-[#10b981]" />
          <span className="text-xs text-[#10b981] font-medium">Akun Terverifikasi</span>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-[#10b981]/10 to-emerald-50 px-6 py-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="relative group">
              {/* Avatar */}
              <div 
                className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-[#10b981] to-emerald-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-emerald-500/20 cursor-pointer hover:opacity-90 transition-opacity flex-shrink-0"
                onClick={triggerFileInput}
              >
                {avatarPreview ? (
                  <img 
                    src={avatarPreview} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const parent = e.target.parentElement
                      if (parent) {
                        e.target.style.display = 'none'
                        parent.textContent = formData.name?.charAt(0)?.toUpperCase() || 'U'
                      }
                    }}
                  />
                ) : user?.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const parent = e.target.parentElement
                      if (parent) {
                        e.target.style.display = 'none'
                        parent.textContent = formData.name?.charAt(0)?.toUpperCase() || 'U'
                      }
                    }}
                  />
                ) : (
                  <span className="text-white font-bold text-2xl">
                    {formData.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              
              {/* Upload Button */}
              <button
                onClick={triggerFileInput}
                disabled={uploadLoading}
                className="absolute -bottom-1 -right-1 bg-white p-1.5 rounded-full shadow-md hover:bg-gray-50 transition-colors border border-gray-200 disabled:opacity-50"
              >
                {uploadLoading ? (
                  <div className="w-4 h-4 border-2 border-[#10b981] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera size={14} className="text-gray-500" />
                )}
              </button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              {avatarPreview && avatarPreview !== user?.avatar && (
                <button
                  onClick={handleRemoveAvatar}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 shadow-md hover:bg-red-600 transition-colors"
                >
                  <X size={12} />
                </button>
              )}
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-[#1a2f4f]">{formData.name || 'Customer'}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm text-gray-500">{formData.email}</span>
                <span className="w-1 h-1 bg-gray-300 rounded-full" />
                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Customer</span>
              </div>
              {avatarFile && (
                <p className="text-xs text-emerald-600 mt-1">📸 Foto baru siap diupload</p>
              )}
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Lengkap</label>
            <div className="relative group">
              <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#10b981] transition-colors" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/10 outline-none text-sm transition-all"
                required
                placeholder="Masukkan nama lengkap"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <div className="relative group">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 outline-none text-sm cursor-not-allowed"
                disabled
              />
            </div>
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
              <Shield size={12} />
              Email tidak dapat diubah untuk keamanan akun
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">No. HP</label>
            <div className="relative group">
              <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#10b981] transition-colors" />
              <input
                type="text"
                value={formData.no_hp}
                onChange={(e) => setFormData({ ...formData, no_hp: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/10 outline-none text-sm transition-all"
                placeholder="Masukkan nomor HP"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Alamat</label>
            <div className="relative group">
              <MapPin size={18} className="absolute left-3 top-3 text-gray-400 group-focus-within:text-[#10b981] transition-colors" />
              <textarea
                value={formData.alamat}
                onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/10 outline-none text-sm min-h-[80px] transition-all resize-none"
                rows={3}
                placeholder="Masukkan alamat lengkap"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-100">
            <button
              type="submit"
              disabled={loading || uploadLoading}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#10b981] hover:bg-emerald-600 text-white rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Simpan Perubahan
                </>
              )}
            </button>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Sparkles size={12} className="text-[#10b981]" />
              Perubahan akan segera berlaku
            </span>
          </div>
        </form>
      </div>

      {/* Info Card */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
        <Shield size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-emerald-700">Keamanan Akun</p>
          <p className="text-xs text-emerald-600 mt-0.5">
            Data pribadi Anda aman dan tidak akan dibagikan ke pihak ketiga.
            Gunakan kata sandi yang kuat untuk melindungi akun Anda.
          </p>
        </div>
      </div>

      {/* ===== CROP MODAL ===== */}
      {showCropModal && cropImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="bg-[#1a2f4f] text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2">
                <Crop size={18} className="text-[#10b981]" />
                Crop Foto
              </h3>
              <button 
                onClick={handleCropCancel}
                className="text-white/70 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4">
              <div 
                ref={cropContainerRef}
                className="relative bg-gray-100 rounded-xl overflow-hidden"
                style={{ height: '400px' }}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <img
                  ref={imageRef}
                  src={cropImage}
                  alt="Crop preview"
                  className="w-full h-full object-contain"
                  draggable={false}
                />
                
                {/* Crop Box */}
                <div
                  className="absolute border-2 border-[#10b981] cursor-move"
                  style={{
                    left: cropPosition.x,
                    top: cropPosition.y,
                    width: cropSize.width,
                    height: cropSize.height,
                    boxShadow: 'inset 0 0 0 9999px rgba(0,0,0,0.3)'
                  }}
                  onMouseDown={handleMouseDown}
                >
                  <div className="absolute -top-1 -left-1 w-3 h-3 bg-[#10b981] rounded-full cursor-nw-resize" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#10b981] rounded-full cursor-ne-resize" />
                  <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-[#10b981] rounded-full cursor-sw-resize" />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#10b981] rounded-full cursor-se-resize" />
                  
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8">
                    <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/50" />
                    <div className="absolute top-0 left-1/2 w-[1px] h-full bg-white/50" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-[#10b981] rounded-full" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleZoomOut}
                    className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <ZoomIn size={16} className="text-gray-600" />
                  </button>
                  <button
                    onClick={handleZoomIn}
                    className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <ZoomIn size={16} className="text-gray-600" />
                  </button>
                </div>
                <p className="text-xs text-gray-400">
                  Drag untuk memposisikan • Scroll untuk zoom
                </p>
              </div>
            </div>

            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={handleCropCancel}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleCropConfirm}
                disabled={uploadLoading}
                className="flex-1 px-4 py-2.5 bg-[#10b981] hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50"
              >
                <span className="flex items-center justify-center gap-2">
                  {uploadLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Mengupload...
                    </>
                  ) : (
                    <>
                      <Upload size={18} />
                      Upload Foto
                    </>
                  )}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}