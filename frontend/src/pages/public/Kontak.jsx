// src/pages/public/Kontak.jsx
import { useState } from 'react'
import { MapPin, Phone, Mail, Clock, Send, Sparkles, CheckCircle, MessageCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Kontak() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    toast.success('Pesan berhasil dikirim! Kami akan segera menghubungi Anda.')
    setSubmitted(true)
    setFormData({ name: '', email: '', message: '' })
    setTimeout(() => setSubmitted(false), 3000)
  }

  const contactInfo = [
    { icon: MapPin, label: 'Alamat', value: 'Jl. Raya Banyuwangi No. 123, Banyuwangi', color: '#f97316' },
    { icon: Phone, label: 'Telepon', value: '0812-3456-7890', color: '#10b981' },
    { icon: Mail, label: 'Email', value: 'info@ratumotor.com', color: '#6366f1' },
    { icon: Clock, label: 'Jam Operasional', value: 'Senin - Sabtu: 08.00 - 20.00', color: '#f59e0b' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Header */}
      <div className="text-center mb-12">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#f97316]/10 text-[#f97316] text-sm font-semibold rounded-full mb-4">
          <Sparkles size={14} />
          Hubungi Kami
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#1a2f4f]">
          Siap Membantu <span className="text-[#f97316]">Anda</span>
        </h1>
        <p className="text-gray-500 mt-3 max-w-2xl mx-auto">
          Senang mendengar dari Anda! Hubungi kami melalui informasi di bawah ini.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Contact Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-[#1a2f4f] mb-6 flex items-center gap-2">
              <MessageCircle size={20} className="text-[#f97316]" />
              Informasi Kontak
            </h2>
            <div className="space-y-4">
              {contactInfo.map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-all duration-300 group">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110" style={{ backgroundColor: `${color}20` }}>
                    <Icon size={20} style={{ color }} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">{label}</p>
                    <p className="text-sm font-medium text-gray-800">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Social */}
          <div className="bg-gradient-to-br from-[#1a2f4f] to-[#0f1f33] rounded-3xl p-6 text-white">
            <h3 className="font-semibold mb-4">Follow Kami</h3>
            <div className="flex gap-3">
              {['Facebook', 'Instagram', 'YouTube', 'Twitter'].map((social) => (
                <div key={social} className="w-12 h-12 bg-white/10 hover:bg-[#f97316] rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-orange-500/20">
                  <span className="text-sm font-semibold">{social[0]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-3xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-[#1a2f4f] mb-6 flex items-center gap-2">
            <Send size={20} className="text-[#f97316]" />
            Kirim Pesan
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl focus:border-[#f97316] focus:bg-white focus:ring-2 focus:ring-[#f97316]/10 outline-none transition-all duration-300"
                placeholder="Nama lengkap"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl focus:border-[#f97316] focus:bg-white focus:ring-2 focus:ring-[#f97316]/10 outline-none transition-all duration-300"
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pesan</label>
              <textarea
                required
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl focus:border-[#f97316] focus:bg-white focus:ring-2 focus:ring-[#f97316]/10 outline-none transition-all duration-300 resize-none"
                placeholder="Tulis pesan Anda..."
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-[#f97316] hover:bg-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/20 transition-all duration-300 hover:shadow-orange-500/40 hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              {submitted ? (
                <>
                  <CheckCircle size={18} />
                  Terkirim!
                </>
              ) : (
                <>
                  Kirim Pesan
                  <Send size={18} />
                </>
              )}
            </button>
          </form>
        </div>

      </div>

      {/* Map */}
      <div className="mt-8 bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 h-64">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31547.84947573407!2d114.3333!3d-8.2167!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd6b0b3b3b3b3b%3A0x0!2zOMKwMTMnMDAuMCJTIDExNMKwMjAnMDAuMCJF!5e0!3m2!1sid!2sid!4v1234567890"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Ratu Motor Location"
          className="hover:scale-105 transition-transform duration-500"
        />
      </div>

    </div>
  )
}