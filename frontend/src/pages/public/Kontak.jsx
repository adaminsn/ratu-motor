// src/pages/public/Kontak.jsx
import { useState } from 'react'
import { MapPin, Phone, Mail, Clock, Send, Sparkles, CheckCircle, MessageCircle, Instagram, Facebook, Youtube, Twitter, Loader2, Globe } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Kontak() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Harap isi semua field!')
      return
    }

    setLoading(true)

    try {
      // Kirim ke WhatsApp
      const waNumber = '6281252446195'
      const text = `Halo Admin Ratu Motor, saya ${formData.name} (${formData.email}).\n\n${formData.message}`
      const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`

      window.open(waUrl, '_blank')

      toast.success('Pesan berhasil dikirim!')
      setSubmitted(true)
      setFormData({ name: '', email: '', message: '' })
      setTimeout(() => setSubmitted(false), 3000)

    } catch (err) {
      console.error('Error:', err)
      toast.error('Gagal mengirim pesan, silakan coba lagi')
    } finally {
      setLoading(false)
    }
  }

  // Fungsi untuk kirim email (tanpa backend)
  const handleEmailClick = () => {
    // Buka email client dengan subject dan body
    const subject = `Pertanyaan dari ${formData.name || 'Customer'}`
    const body = `Halo Admin Ratu Motor,\n\n${formData.message || 'Tulis pesan Anda...'}\n\nDari: ${formData.name || ''}\nEmail: ${formData.email || ''}`

    const mailtoUrl = `mailto:info@ratumotor.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(mailtoUrl, '_blank')

    toast.success('Email client dibuka!')
  }

  const contactInfo = [
    { icon: MapPin, label: 'Alamat', value: 'Jl. Piere Tendean No.1, Karangrejo, Kec. Banyuwangi, Kabupaten Banyuwangi, Jawa Timur 68411', color: '#10b981' },
    { icon: Phone, label: 'Telepon', value: '0812-5244-6195', color: '#10b981', href: 'tel:+6281252446195' },
    { icon: Mail, label: 'Email', value: 'info@ratumotor.com', color: '#10b981', href: 'mailto:info@ratumotor.com' },
    { icon: Clock, label: 'Jam Operasional', value: 'Setiap Hari: 09.00 - 15.00', color: '#10b981' },
  ]

  const socials = [
    { name: 'Instagram', icon: Instagram, color: '#E4405F', url: 'https://www.instagram.com/ratu.motorr/' },
    { name: 'TikTok', icon: MessageCircle, color: '#000000', url: 'https://www.tiktok.com/@jualbelimotorbwi' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* Header */}
      <div className="text-center mb-12">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#10b981]/10 text-[#10b981] text-sm font-semibold rounded-full mb-4">
          <Sparkles size={14} />
          Hubungi Kami
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#1a2f4f]">
          Siap Membantu <span className="text-[#10b981]">Anda</span>
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
              <MessageCircle size={20} className="text-[#10b981]" />
              Informasi Kontak
            </h2>
            <div className="space-y-4">
              {contactInfo.map(({ icon: Icon, label, value, color, href }) => {
                const Wrapper = href ? 'a' : 'div'
                return (
                  <div key={label} className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-all duration-300 group">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110" style={{ backgroundColor: `${color}20` }}>
                      <Icon size={20} style={{ color }} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">{label}</p>
                      {href ? (
                        <Wrapper
                          href={href}
                          className="text-sm font-medium text-gray-800 hover:text-[#10b981] transition-colors"
                        >
                          {value}
                        </Wrapper>
                      ) : (
                        <p className="text-sm font-medium text-gray-800">{value}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Social */}
          <div className="bg-gradient-to-br from-[#1a2f4f] to-[#0f1f33] rounded-3xl p-6 text-white">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Sparkles size={16} className="text-[#10b981]" />
              Follow Kami
            </h3>
            <div className="flex gap-3">
              {socials.map(({ name, icon: Icon, color, url }) => (
                <a
                  key={name}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-white/10 hover:bg-[#10b981] rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-emerald-500/20 group"
                  title={name}
                >
                  <Icon size={20} className="text-white/70 group-hover:text-white transition-all duration-300" />
                </a>
              ))}
            </div>
            <p className="text-white/40 text-xs mt-4">
              Ikuti kami untuk informasi promo dan motor terbaru
            </p>
          </div>

          {/* WhatsApp CTA */}
          <div className="bg-gradient-to-br from-[#10b981] to-emerald-600 rounded-3xl p-6 text-white shadow-lg shadow-emerald-500/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">Chat Langsung WhatsApp</h3>
                <p className="text-white/70 text-sm mt-1">Respons cepat & ramah</p>
              </div>
              <a
                href="https://wa.me/6281252446195"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/20 hover:bg-white/30 p-3 rounded-xl transition-all duration-300 hover:scale-105"
              >
                <MessageCircle size={24} className="text-white" />
              </a>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-3xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-[#1a2f4f] mb-6 flex items-center gap-2">
            <Send size={20} className="text-[#10b981]" />
            Kirim Pesan
          </h2>
          <p className="text-xs text-gray-400 mb-4">
            Kirim pesan melalui WhatsApp atau Email
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl focus:border-[#10b981] focus:bg-white focus:ring-2 focus:ring-[#10b981]/10 outline-none transition-all duration-300"
                placeholder="Nama lengkap"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl focus:border-[#10b981] focus:bg-white focus:ring-2 focus:ring-[#10b981]/10 outline-none transition-all duration-300"
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pesan <span className="text-red-500">*</span></label>
              <textarea
                required
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl focus:border-[#10b981] focus:bg-white focus:ring-2 focus:ring-[#10b981]/10 outline-none transition-all duration-300 resize-none"
                placeholder="Tulis pesan Anda..."
              />
            </div>

            {/* Tombol WhatsApp */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#10b981] hover:bg-emerald-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:shadow-emerald-500/40 hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Mengirim...
                </>
              ) : submitted ? (
                <>
                  <CheckCircle size={18} />
                  Terkirim!
                </>
              ) : (
                <>
                  <MessageCircle size={18} />
                  Kirim via WhatsApp
                </>
              )}
            </button>

            {/* Tombol Email (alternatif) */}
            <button
              type="button"
              onClick={handleEmailClick}
              disabled={!formData.email || !formData.message}
              className={`w-full py-3 border-2 border-gray-200 hover:border-[#10b981] text-gray-600 hover:text-[#10b981] font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${!formData.email || !formData.message ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#10b981]/5'
                }`}
            >
              <Mail size={18} />
              Kirim via Email
            </button>

            <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 p-2 rounded-lg">
              <Globe size={14} className="text-[#10b981] flex-shrink-0" />
              <span>Pesan akan dikirim ke: <strong>info@ratumotor.com</strong> (email) atau WhatsApp <strong>0812-5244-6195</strong></span>
            </div>
          </form>
        </div>

      </div>

      {/* Map */}
      <div className="mt-8 bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 h-64 relative group">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3949.307257374702!2d114.35815737479358!3d-8.203431791902399!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd6b3d2092c851d%3A0x5b9b9b9b9b9b9b9b!2sJl.%20Piere%20Tendean%20No.1%2C%20Karangrejo%2C%20Kec.%20Banyuwangi%2C%20Kabupaten%20Banyuwangi%2C%20Jawa%20Timur%2068411!5e0!3m2!1sid!2sid!4v1700000000000"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Ratu Motor Location"
          className="group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <MapPin size={16} className="text-[#10b981]" />
            <span className="text-xs">Ratu Motor Showroom</span>
          </div>
        </div>
      </div>

    </div>
  )
}