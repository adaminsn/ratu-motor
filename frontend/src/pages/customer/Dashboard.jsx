// src/pages/customer/CustomerDashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Bike, Calendar, Clock, Package,
  XCircle, Loader2, Sparkles, Heart, 
  User, CreditCard, Tag, CheckCircle, AlertCircle,
  ArrowRight, ShoppingBag, Wrench,
  Store, ShoppingCart, Gift, Star
} from 'lucide-react';
import api from '../../api/axios';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const formatRupiah = (value) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value)

const statusConfig = {
  menunggu: { 
    label: 'Menunggu', 
    color: 'bg-yellow-100 text-yellow-700',
    icon: Clock,
    badge: 'bg-yellow-500'
  },
  dikonfirmasi: { 
    label: 'Dikonfirmasi', 
    color: 'bg-blue-100 text-blue-700',
    icon: CheckCircle,
    badge: 'bg-blue-500'
  },
  selesai: { 
    label: 'Selesai', 
    color: 'bg-emerald-100 text-emerald-700',
    icon: CheckCircle,
    badge: 'bg-emerald-500'
  },
  dibatal: { 
    label: 'Dibatalkan', 
    color: 'bg-red-100 text-red-700',
    icon: AlertCircle,
    badge: 'bg-red-500'
  },
}

// ===== SKELETON LOADING COMPONENTS =====

// Skeleton untuk Welcome Banner
const SkeletonBanner = () => (
  <div className="bg-gradient-to-br from-[#1a2f4f] to-[#0f1f33] rounded-2xl p-6 md:p-8 animate-pulse">
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-white/10 rounded-2xl" />
        <div>
          <div className="h-4 w-32 bg-white/20 rounded-lg" />
          <div className="h-8 w-48 bg-white/20 rounded-lg mt-1" />
          <div className="flex items-center gap-2 mt-1">
            <div className="h-3 w-16 bg-white/20 rounded-full" />
            <div className="w-1 h-1 bg-white/20 rounded-full" />
            <div className="h-3 w-12 bg-white/20 rounded-full" />
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="h-10 w-32 bg-white/10 rounded-xl" />
        <div className="h-10 w-28 bg-white/10 rounded-xl" />
      </div>
    </div>
    <div className="mt-6 pt-6 border-t border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i}>
          <div className="h-3 w-20 bg-white/20 rounded-full" />
          <div className="h-7 w-16 bg-white/20 rounded-lg mt-1" />
        </div>
      ))}
    </div>
  </div>
);

// Skeleton untuk Quick Stats
const SkeletonStats = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100/50 animate-pulse">
        <div className="w-14 h-14 bg-gray-200 rounded-2xl" />
        <div className="h-8 w-12 bg-gray-200 rounded-lg mt-2" />
        <div className="h-4 w-24 bg-gray-200 rounded-lg mt-1" />
        <div className="w-8 h-1 bg-gray-200 rounded-full mt-2" />
      </div>
    ))}
  </div>
);

// Skeleton untuk Action Buttons
const SkeletonActions = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {[1, 2].map((i) => (
      <div key={i} className="bg-gray-200 rounded-2xl p-5 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-300 rounded-xl" />
            <div>
              <div className="h-4 w-24 bg-gray-300 rounded-lg" />
              <div className="h-6 w-32 bg-gray-300 rounded-lg mt-1" />
            </div>
          </div>
          <div className="w-6 h-6 bg-gray-300 rounded-full" />
        </div>
      </div>
    ))}
  </div>
);

// Skeleton untuk Booking History
const SkeletonBooking = () => (
  <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
    <div className="p-5 border-b border-gray-100 flex items-center justify-between">
      <div className="h-5 w-32 bg-gray-200 rounded-lg animate-pulse" />
      <div className="h-5 w-16 bg-gray-200 rounded-full animate-pulse" />
    </div>
    {[1, 2, 3].map((i) => (
      <div key={i} className="p-4 border-b border-gray-100 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-lg" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div className="h-4 w-32 bg-gray-200 rounded" />
              <div className="h-5 w-16 bg-gray-200 rounded-full" />
            </div>
            <div className="flex items-center gap-3 mt-1">
              <div className="h-3 w-16 bg-gray-200 rounded" />
              <div className="w-1 h-1 bg-gray-200 rounded-full" />
              <div className="h-3 w-20 bg-gray-200 rounded" />
            </div>
          </div>
          <div className="w-2 h-2 bg-gray-200 rounded-full" />
        </div>
      </div>
    ))}
  </div>
);

export default function CustomerDashboard() {
  const [motorList, setMotorList] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedMotor, setSelectedMotor] = useState(null);
  const [jenisBayar, setJenisBayar] = useState('tunai');
  const [pesan, setPesan] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { user } = useAuthStore();
  const navigate = useNavigate();

  // ===== FUNGSI FETCH DATA =====
  const fetchData = async () => {
    try {
      setLoading(true);
      const [motorRes, bookingRes] = await Promise.all([
        api.get('/public/motors').catch(() => ({ data: [] })),
        api.get('/customer/bookings').catch(() => ({ data: [] }))
      ]);

      const motorData = motorRes.data;
      setMotorList(Array.isArray(motorData) ? motorData : motorData?.data || []);
      setBookings(Array.isArray(bookingRes.data) ? bookingRes.data : bookingRes.data?.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  // ===== FETCH DATA PERTAMA KALI =====
  useEffect(() => {
    fetchData();
  }, []);

  // ===== REFRESH DATA (bisa dipanggil dari komponen lain) =====
  const refreshData = () => {
    fetchData();
  };

  // ===== FUNGSI UNTUK MEMBATALKAN BOOKING (LANGSUNG DARI DASHBOARD) =====
  const handleCancelBooking = async (bookingId) => {
    if (!confirm('Yakin ingin membatalkan booking ini?')) return;

    try {
      const response = await api.patch(`/customer/bookings/${bookingId}/cancel`);
      toast.success('Booking berhasil dibatalkan');
      // Refresh data setelah cancel
      fetchData();
    } catch (err) {
      console.error('Error cancelling booking:', err);
      toast.error(err.response?.data?.message || 'Gagal membatalkan booking');
    }
  };

  const handleBooking = async () => {
    if (!selectedMotor) return;
    setSubmitting(true);
    try {
      await api.post('/customer/bookings', {
        motor_id: selectedMotor.id,
        jenis_bayar: jenisBayar,
        pesan: pesan,
      });
      toast.success('Booking berhasil dibuat!');
      setShowBookingModal(false);
      setSelectedMotor(null);
      setJenisBayar('tunai');
      setPesan('');
      // Refresh data setelah booking berhasil
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal membuat booking');
    } finally {
      setSubmitting(false);
    }
  };

  const openBookingModal = (motor) => {
    setSelectedMotor(motor);
    setShowBookingModal(true);
  };

  // ===== EKSPOSE FUNGSI REFRESH KE WINDOW (untuk dipanggil dari komponen lain) =====
  useEffect(() => {
    window.refreshCustomerDashboard = refreshData;
    return () => {
      delete window.refreshCustomerDashboard;
    };
  }, []);

  const aktifBookings = bookings.filter(b => ['menunggu', 'dikonfirmasi'].includes(b.status));
  const selesaiBookings = bookings.filter(b => b.status === 'selesai');
  const totalBookings = bookings.length;

  const statsData = [
    { 
      label: 'Motor Tersedia', 
      value: motorList.length, 
      icon: Bike,
      color: 'text-[#1a2f4f]',
      bgColor: 'bg-[#1a2f4f]/10',
      gradient: 'from-[#1a2f4f] to-[#0f1f33]'
    },
    { 
      label: 'Booking Aktif', 
      value: aktifBookings.length, 
      icon: Clock,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      gradient: 'from-emerald-400 to-emerald-600'
    },
    { 
      label: 'Selesai', 
      value: selesaiBookings.length, 
      icon: CheckCircle,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      gradient: 'from-blue-400 to-blue-600'
    },
    { 
      label: 'Dibatalkan', 
      value: bookings.filter(b => b.status === 'dibatal').length, 
      icon: XCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      gradient: 'from-red-400 to-red-600'
    },
  ];

  // ===== RENDER SKELETON SAAT LOADING =====
  if (loading) {
    return (
      <div className="space-y-6 pb-8 max-w-7xl mx-auto px-4">
        <SkeletonBanner />
        <SkeletonStats />
        <SkeletonActions />
        <SkeletonBooking />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8 max-w-7xl mx-auto px-4">

      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-[#1a2f4f] to-[#0f1f33] rounded-2xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl"
      >
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/5 rounded-full blur-2xl" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="bg-white/10 backdrop-blur-sm p-3 rounded-2xl">
              <User size={24} className="text-white/80" />
            </div>
            <div>
              <p className="text-white/60 text-sm font-medium">Selamat datang kembali,</p>
              <h1 className="text-2xl md:text-3xl font-bold mt-0.5">{user?.name || 'Customer'}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-white/40 text-xs">Customer</span>
                <span className="w-1 h-1 bg-white/20 rounded-full" />
                <span className="text-white/40 text-xs">Aktif</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/5">
              <Sparkles size={16} className="text-emerald-400" />
              <span className="text-sm font-medium">Promo Spesial!</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/5">
              <Tag size={16} className="text-emerald-400" />
              <span className="text-sm font-medium">Diskon 10%</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-6 pt-6 border-t border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-white/40 text-xs flex items-center gap-1">
              <Bike size={12} /> Total Motor
            </p>
            <p className="text-xl font-bold">{motorList.length} Unit</p>
          </div>
          <div>
            <p className="text-white/40 text-xs flex items-center gap-1">
              <ShoppingCart size={12} /> Booking Aktif
            </p>
            <p className="text-xl font-bold">{aktifBookings.length}</p>
          </div>
          <div>
            <p className="text-white/40 text-xs flex items-center gap-1">
              <Gift size={12} /> Total Booking
            </p>
            <p className="text-xl font-bold">{totalBookings}</p>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {statsData.map(({ label, value, icon: Icon, color, bgColor, gradient }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white rounded-2xl shadow-sm p-5 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 border border-gray-100/50 backdrop-blur-sm group"
          >
            <div className={`${bgColor} w-14 h-14 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
              <Icon size={28} className="text-gray-700" strokeWidth={1.5} />
            </div>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
            <p className="text-sm font-medium text-gray-600">{label}</p>
            <div className={`mt-2 w-8 h-1 rounded-full bg-gradient-to-r ${gradient}`} />
          </motion.div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => navigate('/katalog')}
          className="group bg-gradient-to-r from-[#1a2f4f] to-[#0f1f33] rounded-2xl p-5 text-left text-white hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/10 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <ShoppingBag size={24} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-white/60">Lihat Katalog</p>
                <p className="font-semibold text-lg">Cari Motor Impian</p>
              </div>
            </div>
            <ArrowRight size={24} className="text-emerald-400 group-hover:translate-x-2 transition-transform" />
          </div>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => navigate('/customer/servis')}
          className="group bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-5 text-left text-white hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/10 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <Wrench size={24} className="text-white" />
              </div>
              <div>
                <p className="text-sm text-white/70">Booking Servis</p>
                <p className="font-semibold text-lg">Ajukan Servis Motor</p>
              </div>
            </div>
            <ArrowRight size={24} className="text-white group-hover:translate-x-2 transition-transform" />
          </div>
        </motion.button>
      </div>

      {/* Booking History */}
      {bookings.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Calendar size={16} className="text-emerald-500" />
              Riwayat Booking
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchData}
                className="text-xs text-emerald-500 hover:text-emerald-600 font-medium flex items-center gap-1 px-2 py-1 hover:bg-emerald-50 rounded-lg transition-colors"
              >
                <Loader2 size={12} className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                {bookings.length} booking
              </span>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {bookings.slice(0, 5).map((booking) => {
              const config = statusConfig[booking.status] || statusConfig.menunggu
              const StatusIcon = config.icon || Clock
              const isActive = ['menunggu', 'dikonfirmasi'].includes(booking.status)
              
              return (
                <div key={booking.id} className="p-4 hover:bg-gray-50 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#1a2f4f]/10 rounded-lg flex items-center justify-center shrink-0">
                      <Bike size={18} className="text-[#1a2f4f]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {booking.motor?.merk} {booking.motor?.tipe}
                        </p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${config.color}`}>
                          {config.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <p className="text-xs text-gray-400 capitalize flex items-center gap-1">
                          <CreditCard size={12} />
                          {booking.jenis_bayar}
                        </p>
                        <span className="w-1 h-1 bg-gray-300 rounded-full" />
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(booking.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Tombol Cancel untuk booking yang masih aktif */}
                      {isActive && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          title="Batalkan booking"
                        >
                          <XCircle size={16} />
                        </button>
                      )}
                      <div className={`w-2 h-2 rounded-full ${config.badge || 'bg-gray-300'}`} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          {bookings.length > 5 && (
            <div className="p-3 bg-gray-50 text-center border-t border-gray-100">
              <button
                onClick={() => navigate('/customer/booking')}
                className="text-sm text-[#1a2f4f] hover:underline font-medium flex items-center gap-1 mx-auto"
              >
                Lihat semua booking <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar size={40} className="text-gray-300" />
          </div>
          <p className="text-gray-400 font-medium">Belum ada booking</p>
          <p className="text-sm text-gray-300 mt-1">Mulai booking motor impian kamu sekarang</p>
          <button
            onClick={() => navigate('/katalog')}
            className="mt-4 px-6 py-2.5 bg-[#1a2f4f] text-white rounded-lg text-sm font-medium hover:bg-[#12223a] transition-colors"
          >
            Lihat Katalog Motor
          </button>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && selectedMotor && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Konfirmasi Booking</h3>
                <p className="text-xs text-gray-400">Lengkapi data untuk booking motor</p>
              </div>
              <button
                onClick={() => setShowBookingModal(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <XCircle size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Motor Info */}
            <div className="bg-emerald-50 rounded-xl p-4 mb-5 border border-emerald-100">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <Bike size={20} className="text-emerald-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 text-sm">
                    {selectedMotor.merk} {selectedMotor.tipe}
                  </p>
                  <p className="text-xs text-gray-500">
                    {selectedMotor.tahun} · {selectedMotor.warna} · {selectedMotor.kondisi}
                  </p>
                  <p className="text-emerald-600 font-bold text-base mt-1">
                    {formatRupiah(selectedMotor.harga_jual)}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Metode Pembayaran
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['tunai', 'kredit', 'indent'].map((jenis) => (
                  <button
                    key={jenis}
                    type="button"
                    onClick={() => setJenisBayar(jenis)}
                    className={`py-2.5 rounded-lg text-sm font-medium border-2 transition-all capitalize
                      ${jenisBayar === jenis
                        ? 'bg-[#1a2f4f] text-white border-[#1a2f4f] shadow-md'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-[#1a2f4f] hover:bg-gray-50'
                      }`}
                  >
                    {jenis}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catatan <span className="text-gray-400 text-xs">(opsional)</span>
              </label>
              <textarea
                value={pesan}
                onChange={(e) => setPesan(e.target.value)}
                placeholder="Contoh: Apakah bisa test ride dulu?"
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none transition-all"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowBookingModal(false)}
                className="flex-1 py-3 border-2 border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors font-medium"
              >
                Batal
              </button>
              <button
                onClick={handleBooking}
                disabled={submitting}
                className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    Memproses...
                  </span>
                ) : (
                  'Konfirmasi Booking'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}