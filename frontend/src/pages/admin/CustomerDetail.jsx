// src/pages/admin/CustomerDetail.jsx
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { User, Phone, MapPin, Mail, Calendar, ShoppingCart, Wrench, ArrowLeft } from 'lucide-react'
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

export default function CustomerDetail() {
  const { id } = useParams()
  const [customer, setCustomer] = useState(null)
  const [bookings, setBookings] = useState([])
  const [transactions, setTransactions] = useState([])
  const [servis, setServis] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('bookings')
  const [error, setError] = useState(null)

  useEffect(() => {
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
      }
    }
    fetchCustomerData()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-[#1a2f4f] border-t-[#f97316] rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !customer) {
    return (
      <div className="text-center py-20">
        <User size={48} className="mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500">{error || 'Customer tidak ditemukan'}</p>
        <Link to="/admin/customers" className="text-[#f97316] hover:underline mt-2 inline-block">
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
      
      <Link to="/admin/customers" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#f97316] transition-colors group">
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        Kembali ke Daftar Customer
      </Link>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-[#1a2f4f] to-[#f97316] rounded-full flex items-center justify-center text-white font-bold text-xl">
            {customer.nama?.[0]?.toUpperCase() || 'C'}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-[#1a2f4f]">{customer.nama}</h1>
            <div className="flex flex-wrap gap-4 mt-1 text-sm text-gray-500">
              <span className="flex items-center gap-1"><Phone size={14} /> {customer.no_hp || '-'}</span>
              <span className="flex items-center gap-1"><Mail size={14} /> {customer.email || '-'}</span>
              <span className="flex items-center gap-1"><MapPin size={14} /> {customer.alamat || '-'}</span>
            </div>
          </div>
          <div className="text-sm text-gray-400">
            Member sejak {formatDate(customer.created_at)}
          </div>
        </div>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        {tabs.map(({ key, label, count, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2.5 text-sm font-medium transition-all duration-200 border-b-2 ${
              activeTab === key
                ? 'border-[#f97316] text-[#f97316]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="flex items-center gap-2">
              <Icon size={16} />
              {label}
              <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full text-xs">
                {count}
              </span>
            </span>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        {activeTab === 'bookings' && (
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Riwayat Booking</h2>
            {bookings.length === 0 ? (
              <p className="text-gray-400 text-sm">Belum ada booking</p>
            ) : (
              <div className="space-y-3">
                {bookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">{booking.motor?.merk} {booking.motor?.tipe}</p>
                      <p className="text-xs text-gray-400">{formatDate(booking.tanggal_booking)}</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      booking.status === 'selesai' ? 'bg-emerald-100 text-emerald-700' :
                      booking.status === 'dikonfirmasi' ? 'bg-blue-100 text-blue-700' :
                      booking.status === 'menunggu' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'transactions' && (
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Riwayat Transaksi</h2>
            {transactions.length === 0 ? (
              <p className="text-gray-400 text-sm">Belum ada transaksi</p>
            ) : (
              <div className="space-y-3">
                {transactions.map((trx) => (
                  <div key={trx.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">{trx.motor?.merk} {trx.motor?.tipe}</p>
                      <p className="text-xs text-gray-400">{formatDate(trx.tanggal_transaksi)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#f97316]">{formatRupiah(trx.harga_kesepakatan)}</p>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                        trx.status_pembayaran === 'lunas' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {trx.status_pembayaran}
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
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Riwayat Servis</h2>
            {servis.length === 0 ? (
              <p className="text-gray-400 text-sm">Belum ada servis</p>
            ) : (
              <div className="space-y-3">
                {servis.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">{item.motor?.merk} {item.motor?.tipe}</p>
                      <p className="text-xs text-gray-400">{item.jenis_servis} · {formatDate(item.tanggal_servis)}</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      item.status === 'selesai' ? 'bg-emerald-100 text-emerald-700' :
                      item.status === 'dikerjakan' ? 'bg-blue-100 text-blue-700' :
                      item.status === 'menunggu' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {item.status}
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