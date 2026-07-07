// src/pages/public/LandingPage.jsx
import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { 
  Bike, ShieldCheck, Award, Clock, Sparkles, ArrowRight, 
  Star, Users, TrendingUp, Zap, Heart, ChevronRight,
  MapPin, Phone, Mail, Facebook, Instagram, Youtube, Twitter
} from 'lucide-react'
import api from '../../api/axios'

const formatRupiah = (value) => {
  if (!value) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value)
}

export default function LandingPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const sectionRef = useRef(null)
  const [unggulanMotors, setUnggulanMotors] = useState([])
  const [loadingUnggulan, setLoadingUnggulan] = useState(true)

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useEffect(() => {
    const fetchUnggulan = async () => {
      try {
        const response = await api.get('/public/motors/unggulan')
        setUnggulanMotors(response.data?.data || [])
      } catch (error) {
        console.error('Error fetching motor unggulan:', error)
      } finally {
        setLoadingUnggulan(false)
      }
    }
    fetchUnggulan()
  }, [])

  const features = [
    { icon: ShieldCheck, label: 'Motor Berkualitas', desc: 'Semua motor terjamin kualitasnya', color: '#10b981' },
    { icon: Award, label: 'Harga Bersaing', desc: 'Harga terbaik di pasaran', color: '#10b981' },
    { icon: Clock, label: 'Pelayanan Cepat', desc: 'Proses cepat & profesional', color: '#10b981' },
    { icon: Bike, label: 'Berbagai Pilihan', desc: 'Banyak pilihan motor', color: '#10b981' },
  ]

  const testimonials = [
    { name: 'Budi Santoso', text: 'Motor berkualitas, pelayanan ramah, harga bersaing!', rating: 5 },
    { name: 'Siti Rahayu', text: 'Proses cepat dan mudah. Motor langsung siap pakai.', rating: 5 },
    { name: 'Ahmad Fauzi', text: 'Rekomendasi banget buat yang cari motor bekas berkualitas.', rating: 5 },
  ]

  const partners = [
    { name: 'Adira Finance', icon: '🏦' },
  ]

  return (
    <div className="relative overflow-hidden">
      
      {/* Cursor Glow - HIJAU */}
      <div 
        className="fixed pointer-events-none z-50 w-96 h-96 rounded-full blur-3xl opacity-20 transition-all duration-300"
        style={{
          background: 'radial-gradient(circle, #10b981, transparent)',
          left: mousePosition.x - 192,
          top: mousePosition.y - 192,
        }}
      />

      {/* Floating Particles - HIJAU */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-[#10b981]/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDuration: `${10 + Math.random() * 20}s`,
              animationDelay: `${Math.random() * 5}s`,
              width: `${2 + Math.random() * 4}px`,
              height: `${2 + Math.random() * 4}px`,
            }}
          />
        ))}
      </div>

      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-screen flex items-center bg-gradient-to-br from-[#1a2f4f] via-[#1e3a5f] to-[#0f1f33] overflow-hidden">
        
        {/* Background Dekorasi - HIJAU */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-96 h-96 bg-[#10b981]/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-[#10b981]/5 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border-2 border-[#10b981]/5 rounded-full animate-spin-slow" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border-2 border-[#10b981]/3 rounded-full animate-spin-slow-reverse" />
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-[#10b981]/20 to-transparent rounded-full blur-3xl animate-float-slow" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-[#10b981]/20 to-transparent rounded-full blur-3xl animate-float-slow delay-1000" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-[#10b981]/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-[#10b981] border border-[#10b981]/20">
                <Sparkles size={16} />
                Pusat Motor Terpercaya di Banyuwangi
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight">
                <span className="text-white">Temukan Motor</span>
                <br />
                <span className="bg-gradient-to-r from-[#10b981] via-[#34d399] to-[#10b981] bg-clip-text text-transparent animate-gradient">
                  Impian Anda
                </span>
              </h1>

              <p className="text-white/60 text-lg max-w-lg leading-relaxed">
                Ratu Motor menyediakan berbagai pilihan motor baru & bekas dengan kualitas terbaik dan harga bersaing.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  to="/katalog"
                  className="group relative px-8 py-4 bg-[#10b981] hover:bg-emerald-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/30 transition-all duration-300 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Lihat Katalog
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </Link>
                <Link
                  to="/tentang"
                  className="px-8 py-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold rounded-xl border border-white/10 transition-all duration-300"
                >
                  Tentang Kami
                </Link>
              </div>
            </div>

            {/* Right Content - Motor Image */}
            <div className="relative flex justify-center items-center">
              <div className="relative w-full max-w-lg aspect-square">
                <div className="absolute inset-0 bg-gradient-to-br from-[#10b981]/20 to-transparent rounded-3xl blur-2xl animate-float-slow" />
                
                <div className="relative bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl animate-float w-full h-full flex flex-col items-center justify-center">
                  
                  {/* Gambar Motor */}
                  <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-2xl">
                    <img 
                      src="/images/Motor2.png" 
                      alt="Ratu Motor - Motor Sport Premium" 
                      className="w-full h-full object-contain drop-shadow-2xl"
                      style={{
                        objectFit: 'contain',
                        width: '100%',
                        height: '100%',
                        maxWidth: '100%',
                        maxHeight: '100%',
                        transform: 'scale(0.85)',
                        borderRadius: '24px',
                      }}
                      loading="lazy"
                    />
                    
                    {/* Decorative Circles - HIJAU */}
                    <div className="absolute inset-0 border-2 border-[#10b981]/10 rounded-full animate-spin-slow pointer-events-none" />
                    <div className="absolute inset-4 border-2 border-[#10b981]/5 rounded-full animate-spin-slow-reverse pointer-events-none" />
                    <div className="absolute inset-8 border border-[#10b981]/5 rounded-full pointer-events-none" />
                  </div>
                  
                  {/* Floating Badges - HIJAU */}
                  <div className="absolute -top-4 -right-4 bg-emerald-500 text-white px-4 py-2 rounded-xl shadow-lg shadow-emerald-500/30 animate-bounce-slow">
                    <p className="text-sm font-bold">Tersedia</p>
                  </div>
                  <div className="absolute -bottom-4 -left-4 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10">
                    <p className="text-sm text-white">⭐ 4.9/5</p>
                  </div>
                </div>

                <div className="absolute -top-6 -right-6 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10 animate-float-delayed">
                  <p className="text-sm font-semibold text-white">100+ Motor</p>
                  <p className="text-xs text-white/40">Tersedia</p>
                </div>
                <div className="absolute -bottom-6 -left-6 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10 animate-float-delayed-2">
                  <p className="text-sm font-semibold text-white">⭐ 4.9</p>
                  <p className="text-xs text-white/40">Rating Pelanggan</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/20 rounded-full flex items-start justify-center p-1">
            <div className="w-1 h-3 bg-white/40 rounded-full animate-scroll-dot" />
          </div>
        </div>
      </section>

      {/* ===== FEATURES SECTION - HIJAU ===== */}
      <section ref={sectionRef} className="py-20 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1 bg-[#10b981]/10 text-[#10b981] text-sm font-semibold rounded-full mb-4">
              Keunggulan Kami
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1a2f4f]">
              Kenapa Memilih <span className="text-[#10b981]">Ratu Motor</span>?
            </h2>
            <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
              Kami berkomitmen memberikan pelayanan terbaik untuk setiap pelanggan
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, label, desc, color }) => (
              <div
                key={label}
                className="group relative bg-gray-50 hover:bg-white rounded-2xl p-8 text-center transition-all duration-500 hover:shadow-xl hover:-translate-y-2"
              >
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3"
                  style={{ backgroundColor: `${color}20` }}
                >
                  <Icon size={28} style={{ color }} />
                </div>
                <h3 className="font-bold text-gray-800 text-lg">{label}</h3>
                <p className="text-sm text-gray-500 mt-2">{desc}</p>
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#10b981]/20 rounded-2xl transition-all duration-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== MOTOR UNGGULAN SECTION ===== */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1 bg-[#10b981]/10 text-[#10b981] text-sm font-semibold rounded-full mb-4">
              Motor Unggulan
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1a2f4f]">
              Pilihan <span className="text-[#10b981]">Terbaik</span> Untuk Anda
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loadingUnggulan ? (
              [1, 2, 3, 4].map((_, index) => (
                <div key={index} className="bg-white rounded-2xl h-80 animate-pulse border border-gray-100" />
              ))
            ) : unggulanMotors.length > 0 ? (
              unggulanMotors.map((motor) => (
                <div
                  key={motor.id}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border border-gray-100"
                >
                  <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                    {motor.photos && motor.photos.length > 0 ? (
                      <img 
                        src={motor.photos[0].url} 
                        alt={motor.merk}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%239ca3af" stroke-width="2"%3E%3Crect x="3" y="3" width="18" height="18" rx="2"%3E%3C/rect%3E%3Ccircle cx="8.5" cy="8.5" r="1.5"%3E%3C/circle%3E%3Cpath d="M21 15l-5-5L5 21"%3E%3C/path%3E%3C/svg%3E'
                        }}
                      />
                    ) : (
                      <Bike size={48} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-300" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a2f4f]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute top-2 right-2 bg-emerald-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-lg shadow-emerald-500/30">
                      Tersedia
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-800 line-clamp-1">{motor.merk} {motor.tipe}</h3>
                    <p className="text-sm text-gray-500">{motor.tahun} · {motor.warna}</p>
                    <p className="text-lg font-bold text-[#10b981] mt-2">{formatRupiah(motor.harga_jual)}</p>
                    <Link
                      to={`/motor/${motor.id}`}
                      className="mt-3 w-full flex items-center justify-center gap-2 bg-[#1a2f4f] hover:bg-[#12223a] text-white font-semibold py-2 rounded-xl transition-all duration-300 text-sm group-hover:shadow-lg hover:scale-[1.02]"
                    >
                      Lihat Detail
                      <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-gray-400">
                <Bike size={48} className="mx-auto mb-3 opacity-20" />
                <p>Belum ada motor unggulan saat ini.</p>
              </div>
            )}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/katalog"
              className="inline-flex items-center gap-2 px-8 py-3 bg-[#10b981] hover:bg-emerald-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40"
            >
              Lihat Semua Motor
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>



      {/* ===== PARTNER SECTION ===== */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-400 uppercase tracking-wider mb-8">
            Mitra Pembiayaan Terpercaya
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12">
            {partners.map((partner) => (
              <div key={partner.name} className="text-center">
                <div className="text-4xl mb-2">{partner.icon}</div>
                <p className="text-sm font-semibold text-gray-600">{partner.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CSS CUSTOM ANIMATIONS ===== */}
      <style>{`
        @keyframes spin-slow {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes spin-slow-reverse {
          from { transform: translate(-50%, -50%) rotate(360deg); }
          to { transform: translate(-50%, -50%) rotate(0deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(3deg); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes scroll-dot {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(20px); opacity: 0; }
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }
        .animate-spin-slow-reverse { animation: spin-slow-reverse 25s linear infinite; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
        .animate-float-delayed { animation: float-slow 8s ease-in-out infinite 2s; }
        .animate-float-delayed-2 { animation: float-slow 8s ease-in-out infinite 4s; }
        .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
        .animate-scroll-dot { animation: scroll-dot 2s ease-in-out infinite; }
        .animate-gradient { background-size: 200% 200%; animation: gradient 3s ease-in-out infinite; }
        .animate-pulse { animation: pulse 2s ease-in-out infinite; }
        .delay-1000 { animation-delay: 1000ms; }
      `}</style>
    </div>
  )
}