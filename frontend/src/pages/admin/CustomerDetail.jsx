// src/pages/admin/CustomerDetail.jsx
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { User, Phone, MapPin, Mail, Calendar, ShoppingCart, Wrench, ArrowLeft, Loader2 } from 'lucide-react'
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
  <div className="animate-pulse">
    <div className="h-5 w-40 bg-gray-200 rounded-lg mb-4" />
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="w-16 h-16 bg-gray-200 rounded-full" />
        <div className="flex-1">
          <div className="h-7 w-48 bg-gray-200 rounded-lg" />
          <div className="flex flex-wrap gap-4 mt-2">
            <div className="h-4 w-32 bg-gray-200 rounded" />
            <div className="h-4 w-40 bg-gray-200 rounded" />
            <div className="h-4 w-36 bg-gray-200 rounded" />
          </div>
        </div>
        <div className="h-4 w-32 bg-gray-200 rounded" />
      </div>
    </div>
  </div>
)

// Skeleton untuk Tabs
const SkeletonTabs = () => (
  <div className="flex gap-2 border-b border-gray-200 animate-pulse">
    {[1, 2, 3].map((i) => (
      <div key={i} className="px-4 py-2.5">
        <div className="h-5 w-20 bg-gray-200 rounded" />
      </div>
    ))}
  </div>
)

// Skeleton untuk Content
const SkeletonContent = () => (
  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 animate-pulse">
    <div className="h-5 w-32 bg-gray-200 rounded mb-4" />
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <div className="h-4 w-40 bg-gray-200 rounded" />
            <div className="h-3 w-24 bg-gray-200 rounded mt-1" />
          </div>
          <div className="h-6 w-20 bg-gray-200 rounded-full" />
        </div>
      ))}
    </div>
  </div>
)

export default function CustomerDetail() {
  const { id } = useParams()
  const [customer, setCustomer] = useState(null)
  const [bookings, setBookings] = useState([])
  const [transactions, setTransactions] = useState([])
  const [servis, setServis] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('bookings')
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchCustomerData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch customer
      const response = await api.get(`/admin/customers/${id}`)
      setCustomer(response.data)

      // Fetch bookings
      try {
        const res = await api.get(`/admin/customers/${id}/bookings`)
        setBookings(res.data || [])
      } catch (err) {
        setBookings([])
      }

      // Fetch transactions
      try {
        const res = await api.get(`/admin/customers/${id}/transactions`)
        setTransactions(res.data || [])
      } catch (err) {
        setTransactions([])
      }

      // Fetch servis
      try {
        const res = await api.get(`/admin/customers/${id}/servis`)
        setServis(res.data || [])
      } catch (err) {
        setServis([])
      }

    } catch (err) {
      console.error('Error fetching customer data:', err)
      setError('Gagal memuat data customer')
      toast.error('Gagal memuat data customer')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchCustomerData()
  }, [id])

  const getStatusColor = (status) => {
    const colors = {
      selesai: 'bg-emerald-100 text-emerald-700',
      dikonfirmasi: 'bg-blue-100 text-blue-700',
      menunggu: 'bg-yellow-100 text-yellow-700',
      dibatal: 'bg-red-100 text-red-700',
      dikerjakan: 'bg-blue-100 text-blue-700',
      lunas: 'bg-emerald-100 text-emerald-700',
      pending: 'bg-yellow-100 text-yellow-700',
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  const getStatusLabel = (status) => {
    const labels = {
      menunggu: 'Menunggu',
      dikonfirmasi: 'Dikonfirmasi',
      selesai: 'Selesai',
      dibatal: 'Dibatalkan',
      dikerjakan: 'Dikerjakan',
      lunas: 'Lunas',
      pending: 'Pending',
    }
    return labels[status] || status
  }

  // ===== RENDER SKELETON SAAT LOADING =====
  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonHeader />
        <SkeletonTabs />
        <SkeletonContent />
      </div>
    )
  }

  if (error || !customer) {
    return (
      <div className="text-center py-20">
        <User size={48} className="mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500">{error || 'Customer tidak ditemukan'}</p>
        <Link to="/admin/customers" className="text-[#10b981] hover:underline mt-2 inline-block">
          Kembali ke Daftar Customer
        </Link>
      </div>
    )
  }

  const tabs = [
    { key: 'bookings', label: 'Booking', count: bookings.length, icon: Calendar },
    { key: 'transactions', label: 'Transaksi', count: transactions.length, icon: ShoppingCart },
    { key: 'servis', label: 'Servis', count: servis.length, icon: Wrench },
  ]

  return (
    <div className="space-y-6">
      
      {/* Back Button */}
      <Link to="/admin/customers" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#10b981] transition-colors group">
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        Kembali ke Daftar Customer
      </Link>

      {/* Customer Profile */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-[#1a2f4f] to-[#10b981] rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-500/20">
            {customer.nama?.[0]?.toUpperCase() || 'C'}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-[#1a2f4f]">{customer.nama}</h1>
            <div className="flex flex-wrap gap-4 mt-1 text-sm text-gray-500">
              {customer.no_hp && (
                <span className="flex items-center gap-1"><Phone size={14} className="text-[#10b981]" /> {customer.no_hp}</span>
              )}
              {customer.email && (
                <span className="flex items-center gap-1"><Mail size={14} className="text-[#10b981]" /> {customer.email}</span>
              )}
              {customer.alamat && (
                <span className="flex items-center gap-1"><MapPin size={14} className="text-[#10b981]" /> {customer.alamat}</span>
              )}
            </div>
          </div>
          <div className="text-sm text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg">
            Member sejak {formatDate(customer.created_at)}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
        {tabs.map(({ key, label, count, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2.5 text-sm font-medium transition-all duration-200 border-b-2 whitespace-nowrap ${
              activeTab === key
                ? 'border-[#10b981] text-[#10b981]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="flex items-center gap-2">
              <Icon size={16} />
              {label}
              <span className={`${activeTab === key ? 'bg-[#10b981]/10 text-[#10b981]' : 'bg-gray-100 text-gray-500'} px-2 py-0.5 rounded-full text-xs`}>
                {count}
              </span>
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        {activeTab === 'bookings' && (
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Calendar size={16} className="text-[#10b981]" />
              Riwayat Booking
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full ml-2">
                {bookings.length}
              </span>
            </h2>
            {bookings.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Calendar size={32} className="mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Belum ada booking</p>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div>
                      <p className="font-medium text-gray-800">
                        {booking.motor?.merk} {booking.motor?.tipe}
                      </p>
                      <p className="text-xs text-gray-400 flex items-center gap-2">
                        <span>{formatDate(booking.tanggal_booking)}</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full" />
                        <span className="capitalize">{booking.jenis_bayar}</span>
                      </p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatusColor(booking.status)}`}>
                      {getStatusLabel(booking.status)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'transactions' && (
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <ShoppingCart size={16} className="text-[#10b981]" />
              Riwayat Transaksi
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full ml-2">
                {transactions.length}
              </span>
            </h2>
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <ShoppingCart size={32} className="mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Belum ada transaksi</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((trx) => (
                  <div key={trx.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div>
                      <p className="font-medium text-gray-800">
                        {trx.motor?.merk} {trx.motor?.tipe}
                      </p>
                      <p className="text-xs text-gray-400">{formatDate(trx.tanggal_transaksi)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#10b981]">{formatRupiah(trx.harga_kesepakatan)}</p>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${getStatusColor(trx.status_pembayaran)}`}>
                        {getStatusLabel(trx.status_pembayaran)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'servis' && (
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Wrench size={16} className="text-[#10b981]" />
              Riwayat Servis
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full ml-2">
                {servis.length}
              </span>
            </h2>
            {servis.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Wrench size={32} className="mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Belum ada servis</p>
              </div>
            ) : (
              <div className="space-y-3">
                {servis.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div>
                      <p className="font-medium text-gray-800">
                        {item.motor?.merk} {item.motor?.tipe}
                      </p>
                      <p className="text-xs text-gray-400 flex items-center gap-2">
                        <span>{item.jenis_servis}</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full" />
                        <span>{formatDate(item.tanggal_servis)}</span>
                      </p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatusColor(item.status)}`}>
                      {getStatusLabel(item.status)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  )
}