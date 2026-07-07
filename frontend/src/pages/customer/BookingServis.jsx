// src/pages/customer/BookingServis.jsx
import { useEffect, useState, useCallback } from 'react'
import { Wrench, Calendar, AlertCircle, Plus, X, Bike, Clock, CheckCircle, XCircle } from 'lucide-react'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

const STATUS_BADGES = {
  menunggu: 'bg-amber-100 text-amber-800 border-amber-200',
  dikerjakan: 'bg-blue-100 text-blue-800 border-blue-200',
  selesai: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  batal: 'bg-gray-100 text-gray-800 border-gray-200'
}

const STATUS_LABELS = {
  menunggu: 'Menunggu Konfirmasi',
  dikerjakan: 'Sedang Dikerjakan',
  selesai: 'Selesai',
  batal: 'Dibatalkan'
}

const STATUS_ICONS = {
  menunggu: Clock,
  dikerjakan: Wrench,
  selesai: CheckCircle,
  batal: XCircle
}

// ===== SKELETON LOADING =====
const SkeletonServis = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 animate-pulse">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full" />
          <div className="flex-1">
            <div className="h-5 w-32 bg-gray-200 rounded" />
            <div className="h-4 w-48 bg-gray-200 rounded mt-1" />
            <div className="h-4 w-24 bg-gray-200 rounded mt-1" />
          </div>
          <div className="h-6 w-20 bg-gray-200 rounded-full" />
        </div>
      </div>
    ))}
  </div>
)

export default function BookingServis() {
  const [servisList, setServisList] = useState([])
  const [myMotors, setMyMotors] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMotors, setLoadingMotors] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const initialForm = {
    motor_id: '',
    jenis_servis: '',
    keluhan: '',
    tanggal_servis: new Date().toISOString().split('T')[0]
  }
  const [formData, setFormData] = useState(initialForm)

  const fetchServis = useCallback(async () => {
    setLoading(true)
    try {
      const response = await api.get('/customer/servis')
      setServisList(response.data?.data || [])
    } catch (err) {
      console.error('Error fetching servis:', err)
      toast.error('Gagal memuat riwayat servis')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchMyMotors = useCallback(async () => {
    setLoadingMotors(true)
    try {
      const response = await api.get('/customer/servis/my-motors')
      console.log('📦 Full Response:', response.data)
      
      let motors = []
      if (response.data?.data) {
        motors = response.data.data
      } else if (Array.isArray(response.data)) {
        motors = response.data
      } else if (response.data?.motors) {
        motors = response.data.motors
      }
      
      console.log('✅ Motors loaded:', motors.length, 'motors')
      console.log('📋 Motor list:', motors.map(m => `${m.merk} ${m.tipe} (${m.status})`))
      
      setMyMotors(motors)
    } catch (err) {
      console.error('Error fetching my motors:', err)
      toast.error('Gagal memuat daftar motor')
    } finally {
      setLoadingMotors(false)
    }
  }, [])

  useEffect(() => {
    fetchServis()
    fetchMyMotors()
  }, [fetchServis, fetchMyMotors])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const openModal = () => {
    setFormData({
      ...initialForm,
      tanggal_servis: new Date().toISOString().split('T')[0]
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.motor_id) {
      toast.error('Silakan pilih motor terlebih dahulu')
      return
    }
    
    if (!formData.jenis_servis.trim()) {
      toast.error('Silakan isi jenis servis')
      return
    }
    
    if (!formData.tanggal_servis) {
      toast.error('Silakan pilih tanggal servis')
      return
    }
    
    setSubmitLoading(true)
    try {
      await api.post('/customer/servis', formData)
      toast.success('Pengajuan servis berhasil dikirim')
      setIsModalOpen(false)
      setFormData(initialForm)
      fetchServis()
    } catch (err) {
      console.error('Error submitting servis:', err)
      const errorMsg = err.response?.data?.message || 'Gagal mengajukan servis'
      toast.error(errorMsg)
    } finally {
      setSubmitLoading(false)
    }
  }

  // Hitung statistik
  const totalServis = servisList.length
  const activeServis = servisList.filter(s => ['menunggu', 'dikerjakan'].includes(s.status)).length
  const completedServis = servisList.filter(s => s.status === 'selesai').length
  const cancelledServis = servisList.filter(s => s.status === 'batal').length

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-40 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-4 w-64 bg-gray-200 rounded-lg mt-1 animate-pulse" />
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse" />
        </div>
        <SkeletonServis />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1a2f4f] flex items-center gap-2">
            <Wrench size={24} className="text-[#10b981]" />
            Booking Servis
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Ajukan servis untuk motor yang sudah kamu beli di showroom ini
          </p>
        </div>
        <button
          onClick={openModal}
          disabled={myMotors.length === 0 || loadingMotors}
          className="flex items-center justify-center gap-2 bg-[#10b981] hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:shadow-emerald-500/40"
        >
          <Plus size={18} />
          <span>Ajukan Servis</span>
        </button>
      </div>

      {/* Statistik */}
      {servisList.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl shadow-sm p-3 border border-gray-100">
            <p className="text-xs text-gray-400">Total</p>
            <p className="text-xl font-bold text-[#1a2f4f]">{totalServis}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-3 border border-gray-100">
            <p className="text-xs text-gray-400">Aktif</p>
            <p className="text-xl font-bold text-amber-600">{activeServis}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-3 border border-gray-100">
            <p className="text-xs text-gray-400">Selesai</p>
            <p className="text-xl font-bold text-emerald-600">{completedServis}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-3 border border-gray-100">
            <p className="text-xs text-gray-400">Dibatalkan</p>
            <p className="text-xl font-bold text-red-600">{cancelledServis}</p>
          </div>
        </div>
      )}

      {/* Info Motor Tersedia */}
      {myMotors.length === 0 && !loadingMotors && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700">
            Kamu belum memiliki motor yang tercatat sebagai pembelian resmi di showroom ini, jadi belum bisa mengajukan servis. Servis hanya berlaku untuk motor yang sudah dibeli.
          </p>
        </div>
      )}

      {loadingMotors && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-blue-700">Memuat daftar motor...</p>
        </div>
      )}

      {myMotors.length > 0 && !loadingMotors && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2">
          <Bike size={16} className="text-emerald-600" />
          <p className="text-sm text-emerald-700">
            {myMotors.length} motor tersedia untuk diajukan servis
          </p>
        </div>
      )}

      {/* List Servis */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        {servisList.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">
            <Wrench size={48} className="mx-auto mb-3 text-gray-300" />
            <p>Belum ada pengajuan servis</p>
            <p className="text-xs mt-1">Ajukan servis untuk motor yang sudah kamu beli</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {servisList.map((servis) => {
              const StatusIcon = STATUS_ICONS[servis.status] || Clock
              const statusColor = STATUS_BADGES[servis.status] || 'bg-gray-100 text-gray-700'
              
              return (
                <div key={servis.id} className="p-5 flex items-start justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 bg-[#10b981]/10 text-[#10b981] rounded-full flex items-center justify-center flex-shrink-0">
                      <Wrench size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-800 text-sm">{servis.jenis_servis}</p>
                        <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-medium border ${statusColor}`}>
                          <StatusIcon size={12} />
                          {STATUS_LABELS[servis.status] || servis.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {servis.motor?.merk} {servis.motor?.tipe} · {servis.motor?.no_rangka || servis.motor?.no_polisi || '-'}
                      </p>
                      {servis.keluhan && (
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{servis.keluhan}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <Calendar size={11} className="text-[#10b981]" /> {formatDate(servis.tanggal_servis)}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal Ajukan Servis */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#1a2f4f] text-white px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Wrench size={20} className="text-[#10b981]" />
                <span>Ajukan Servis</span>
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-white/60 hover:text-white transition-colors"
                type="button"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Pilih Motor *</label>
                <select
                  name="motor_id"
                  required
                  value={formData.motor_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/10 outline-none text-sm transition-all"
                >
                  <option value="">-- Pilih motor kamu --</option>
                  {myMotors.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.merk} {m.tipe} · {m.no_rangka || m.no_polisi || '-'}
                    </option>
                  ))}
                </select>
                {myMotors.length === 0 && (
                  <p className="text-[10px] text-amber-600 mt-1">Belum ada motor yang bisa diajukan servis</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Jenis Servis *</label>
                <input
                  type="text"
                  name="jenis_servis"
                  required
                  placeholder="Contoh: Ganti Oli, Servis Rutin, Komplain Mesin"
                  value={formData.jenis_servis}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/10 outline-none text-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Tanggal Servis *</label>
                <input
                  type="date"
                  name="tanggal_servis"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={formData.tanggal_servis}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/10 outline-none text-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Keluhan</label>
                <textarea
                  name="keluhan"
                  rows={3}
                  placeholder="Jelaskan keluhan atau kebutuhan servis"
                  value={formData.keluhan}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/10 outline-none text-sm resize-none transition-all"
                />
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
                  disabled={submitLoading || myMotors.length === 0}
                  className="px-5 py-2 bg-[#10b981] hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98]"
                >
                  {submitLoading ? 'Mengirim...' : 'Kirim Pengajuan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}