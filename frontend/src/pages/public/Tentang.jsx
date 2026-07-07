// src/pages/public/Tentang.jsx
import { useEffect, useState } from 'react'
import { Bike, ShieldCheck, Award, Clock, Users, Sparkles, Building2, Target, Heart, ChevronRight, Leaf, Store } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Tentang() {
  const [counters, setCounters] = useState({ motors: 0, customers: 0, rating: 0, years: 0 })
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          animateCounter()
        }
      })
    }, { threshold: 0.3 })

    const section = document.getElementById('stats-section')
    if (section) observer.observe(section)

    return () => observer.disconnect()
  }, [])

  const animateCounter = () => {
    const targetMotors = 500
    const targetCustomers = 1000
    const targetRating = 49
    const targetYears = 5
    let currentMotors = 0
    let currentCustomers = 0
    let currentRating = 0
    let currentYears = 0

    const interval = setInterval(() => {
      if (currentMotors < targetMotors) {
        currentMotors += 10
        currentCustomers += 20
        currentRating += 1
        currentYears += 0.1
        setCounters({
          motors: Math.min(currentMotors, targetMotors),
          customers: Math.min(currentCustomers, targetCustomers),
          rating: Math.min(currentRating, targetRating) / 10,
          years: Math.min(currentYears, targetYears)
        })
      } else {
        clearInterval(interval)
      }
    }, 20)

    return () => clearInterval(interval)
  }

  const values = [
    { icon: ShieldCheck, label: 'Kualitas', desc: 'Motor berkualitas terjamin' },
    { icon: Award, label: 'Integritas', desc: 'Harga transparan & bersaing' },
    { icon: Heart, label: 'Pelayanan', desc: 'Ramah & profesional' },
    { icon: Clock, label: 'Kecepatan', desc: 'Proses cepat & efisien' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Header */}
      <div className="text-center mb-12">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#10b981]/10 text-[#10b981] text-sm font-semibold rounded-full mb-4">
          <Sparkles size={14} />
          Tentang Kami
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#1a2f4f]">
          Kenali <span className="text-[#10b981]">Ratu Motor</span> Lebih Dekat
        </h1>
        <p className="text-gray-500 mt-3 max-w-2xl mx-auto">
          Pusat motor terpercaya di Banyuwangi yang telah melayani ribuan pelanggan dengan kualitas terbaik.
        </p>
      </div>

      {/* Stats */}
      <div id="stats-section" className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white rounded-3xl shadow-sm p-6 mb-12 border border-gray-100">
        {[
          { label: 'Motor Terjual', value: counters.motors, suffix: '+' },
          { label: 'Pelanggan', value: counters.customers, suffix: '+' },
          { label: 'Rating', value: counters.rating.toFixed(1), suffix: '/5 ⭐' },
          { label: 'Pengalaman', value: Math.floor(counters.years), suffix: '+ Tahun' },
        ].map((stat) => (
          <div key={stat.label} className="text-center p-4 rounded-xl hover:bg-gray-50 transition-all duration-300">
            <p className="text-3xl font-bold text-[#10b981]">{stat.value}{stat.suffix}</p>
            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Visi Misi */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="bg-gradient-to-br from-[#1a2f4f] to-[#0f1f33] text-white rounded-3xl p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-[#10b981] rounded-2xl flex items-center justify-center">
              <Target size={24} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold">Visi</h2>
          </div>
          <p className="text-white/70 leading-relaxed text-lg">
            Menjadi pusat motor terkemuka di Banyuwangi yang memberikan pelayanan terbaik dan produk berkualitas.
          </p>
        </div>
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-[#10b981]/10 rounded-2xl flex items-center justify-center">
              <Building2 size={24} className="text-[#10b981]" />
            </div>
            <h2 className="text-2xl font-bold text-[#1a2f4f]">Misi</h2>
          </div>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-start gap-3">
              <ChevronRight size={18} className="text-[#10b981] mt-0.5 flex-shrink-0" />
              <span>Menyediakan motor berkualitas dengan harga bersaing</span>
            </li>
            <li className="flex items-start gap-3">
              <ChevronRight size={18} className="text-[#10b981] mt-0.5 flex-shrink-0" />
              <span>Memberikan pelayanan profesional dan ramah</span>
            </li>
            <li className="flex items-start gap-3">
              <ChevronRight size={18} className="text-[#10b981] mt-0.5 flex-shrink-0" />
              <span>Menjaga kepercayaan pelanggan</span>
            </li>
            <li className="flex items-start gap-3">
              <ChevronRight size={18} className="text-[#10b981] mt-0.5 flex-shrink-0" />
              <span>Berkontribusi untuk masyarakat Banyuwangi</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Values */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-[#1a2f4f] text-center mb-8">
          Nilai <span className="text-[#10b981]">Kami</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {values.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 group">
              <div className="w-14 h-14 bg-[#10b981]/10 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:bg-[#10b981] group-hover:scale-110 transition-all duration-300">
                <Icon size={24} className="text-[#10b981] group-hover:text-white transition-all duration-300" />
              </div>
              <h3 className="font-bold text-gray-800">{label}</h3>
              <p className="text-sm text-gray-500 mt-1">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Keunggulan */}
      <div className="mb-12 bg-white rounded-3xl shadow-sm p-8 border border-gray-100">
        <h2 className="text-2xl font-bold text-[#1a2f4f] text-center mb-8">
          Mengapa <span className="text-[#10b981]">Memilih Kami</span>?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 rounded-2xl hover:bg-gray-50 transition-all duration-300">
            <div className="w-16 h-16 bg-[#10b981]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Store size={28} className="text-[#10b981]" />
            </div>
            <h3 className="font-bold text-gray-800">Showroom Lengkap</h3>
            <p className="text-sm text-gray-500 mt-2">Berbagai pilihan motor dari merk ternama dengan kondisi terbaik</p>
          </div>
          <div className="text-center p-6 rounded-2xl hover:bg-gray-50 transition-all duration-300">
            <div className="w-16 h-16 bg-[#10b981]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck size={28} className="text-[#10b981]" />
            </div>
            <h3 className="font-bold text-gray-800">Garansi Resmi</h3>
            <p className="text-sm text-gray-500 mt-2">Setiap unit motor dilengkapi dengan garansi resmi dan layanan purna jual</p>
          </div>
          <div className="text-center p-6 rounded-2xl hover:bg-gray-50 transition-all duration-300">
            <div className="w-16 h-16 bg-[#10b981]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Leaf size={28} className="text-[#10b981]" />
            </div>
            <h3 className="font-bold text-gray-800">Transparansi Harga</h3>
            <p className="text-sm text-gray-500 mt-2">Harga jujur tanpa biaya tersembunyi, sesuai dengan kualitas motor</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-[#1a2f4f] to-[#0f1f33] rounded-3xl p-8 text-center text-white">
        <h2 className="text-2xl font-bold mb-3">Siap Mencari Motor Impian?</h2>
        <p className="text-white/60 mb-6">Kunjungi showroom kami atau lihat katalog motor terbaru</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to="/katalog"
            className="px-8 py-3 bg-[#10b981] hover:bg-emerald-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:shadow-emerald-500/40 hover:-translate-y-0.5"
          >
            Lihat Katalog
          </Link>
          <Link
            to="/kontak"
            className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/10 transition-all duration-300"
          >
            Hubungi Kami
          </Link>
        </div>
      </div>

    </div>
  )
}