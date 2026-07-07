import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Mail, Lock, Bike, ShieldCheck, BarChart3, ChevronRight, User, Phone, Leaf, Rocket } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

const registerSchema = z.object({
  name: z.string().min(3, 'Nama minimal 3 karakter'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  password_confirmation: z.string().min(6, 'Konfirmasi password minimal 6 karakter'),
  no_hp: z.string().optional(),
}).refine((data) => data.password === data.password_confirmation, {
  message: 'Password tidak sama',
  path: ['password_confirmation'],
});

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.5 }
};

const adminRoles = ['super_admin', 'admin', 'kasir', 'teknisi'];

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(isRegister ? registerSchema : loginSchema)
  });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const getUserRole = (user) => {
    if (user.roles && Array.isArray(user.roles) && user.roles.length > 0) {
      const firstRole = user.roles[0];
      if (typeof firstRole === 'object' && firstRole.name) return firstRole.name;
      if (typeof firstRole === 'string') return firstRole;
    }
    if (user.role) return user.role;
    return 'customer';
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (isRegister) {
        await api.post('/auth/register', {
          name: data.name,
          email: data.email,
          password: data.password,
          password_confirmation: data.password_confirmation,
          no_hp: data.no_hp || '',
        });
        toast.success('Registrasi berhasil! Silakan login.');
        setIsRegister(false);
        reset({ email: data.email, password: '' });
        setLoading(false);
        return;
      }

      const res = await api.post('/auth/login', {
        email: data.email,
        password: data.password,
      });

      const { token, user } = res.data;

      if (!token || !user) {
        toast.error('Data login tidak lengkap');
        setLoading(false);
        return;
      }

      localStorage.setItem('token', token);
      setAuth(token, user);
      toast.success('Login berhasil!');

      // Deteksi role dan redirect
      const roleName = getUserRole(user);
      console.log('🎯 Role detected:', roleName);

      if (adminRoles.includes(roleName)) {
        navigate('/admin/dashboard');
      } else {
        navigate('/customer/dashboard');
      }

    } catch (err) {
      const errorMsg = err.response?.data?.message || (isRegister ? 'Registrasi gagal' : 'Email atau password salah');
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    reset();
  };

  const features = [
    { icon: Bike, label: 'Katalog Motor', desc: 'Cek stok & spesifikasi' },
    { icon: ShieldCheck, label: 'Transaksi Aman', desc: 'Booking & pembelian' },
    { icon: BarChart3, label: 'Laporan Lengkap', desc: 'PDF & Excel' },
  ];

  const userList = [
    { name: 'Dwi Purnomo', email: 'dwi@ratumotor.test', role: 'Super Admin' },
    { name: 'Afrisal', email: 'afrisal@ratumotor.test', role: 'Admin' },
    { name: 'Durrahman', email: 'durrahman@ratumotor.test', role: 'Teknisi' },
    { name: 'Iyut', email: 'iyut@ratumotor.test', role: 'Kasir' },
    { name: 'Test Customer', email: 'customer@test.com', role: 'Customer' },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50 relative overflow-hidden">

      {/* Cursor Glow */}
      <div
        className="fixed pointer-events-none z-0 w-96 h-96 rounded-full blur-3xl opacity-20 transition-all duration-500"
        style={{
          background: 'radial-gradient(circle, #10b981, transparent)',
          left: mousePosition.x - 192,
          top: mousePosition.y - 192,
        }}
      />

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[#10b981]/20 rounded-full"
            animate={{
              x: [Math.random() * window.innerWidth, Math.random() * window.innerWidth],
              y: [Math.random() * window.innerHeight, Math.random() * window.innerHeight],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: 10 + Math.random() * 20,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* SISI KIRI - BRANDING */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="hidden lg:flex lg:w-1/2 bg-[#1a2f4f] flex-col justify-between p-12 relative overflow-hidden"
      >
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#10b981]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#10b981]/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-[#10b981]/10 rounded-full animate-spin-slow" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border-2 border-[#10b981]/5 rounded-full animate-spin-slow-reverse" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <motion.div
              className="w-12 h-12 bg-[#10b981] rounded-xl flex items-center justify-center shadow-lg"
              animate={{
                boxShadow: [
                  '0 0 20px rgba(16, 185, 129, 0.3)',
                  '0 0 40px rgba(16, 185, 129, 0.6)',
                  '0 0 20px rgba(16, 185, 129, 0.3)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-white font-bold text-xl">R</span>
            </motion.div>
            <div>
              <span className="text-white font-bold text-2xl tracking-tight">Ratu Motor</span>
              <p className="text-white/40 text-xs tracking-wider uppercase flex items-center gap-1">
                <Leaf size={10} className="text-[#10b981]" />
                Showroom & Service Center
              </p>
            </div>
          </div>

          <div className="mt-16">
            <div className="inline-block px-4 py-1 bg-[#10b981]/10 border border-[#10b981]/20 rounded-full text-[#10b981] text-xs font-medium tracking-wider mb-4">
              <Rocket size={12} className="inline mr-1" />
              SISTEM MANAJEMEN SHOWROOM
            </div>
            <h1 className="text-4xl font-bold text-white leading-tight">
              Pusat Motor
              <br />
              <span className="text-[#10b981]">Terpercaya</span> &amp;
              <br />
              <span className="text-[#10b981]">Terintegrasi</span>
            </h1>
            <p className="text-white/50 text-sm mt-4 max-w-sm leading-relaxed">
              Sistem manajemen showroom motor modern untuk memudahkan
              pembelian, penjualan, dan pengelolaan stok motor secara transparan.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-12">
            {features.map(({ icon: Icon, label, desc }) => (
              <motion.div
                key={label}
                className="bg-white/5 hover:bg-white/10 transition-all duration-300 rounded-xl p-4 border border-white/5 hover:border-[#10b981]/30 group"
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <Icon size={20} className="text-[#10b981] mb-2" />
                <p className="text-white font-medium text-sm">{label}</p>
                <p className="text-white/40 text-xs">{desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Akun Demo */}
          <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10">
            <p className="text-white/40 text-xs uppercase tracking-wider mb-3">👥 Akun Demo</p>
            <div className="space-y-1.5">
              {userList.map((u) => (
                <div key={u.email} className="flex items-center justify-between text-xs">
                  <span className="text-white/60">{u.name}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-medium ${
                    u.role === 'Super Admin' ? 'bg-red-500/20 text-red-400' :
                    u.role === 'Admin' ? 'bg-blue-500/20 text-blue-400' :
                    u.role === 'Kasir' ? 'bg-yellow-500/20 text-yellow-400' :
                    u.role === 'Teknisi' ? 'bg-purple-500/20 text-purple-400' :
                    'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-white/30 text-[8px] mt-2 text-center">
              Semua password: <span className="font-mono">password</span>
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-white/20 text-xs border-t border-white/5 pt-6">
          <span>© 2026 Ratu Motor Banyuwangi</span>
          <div className="flex items-center gap-4">
            <span>Privacy</span>
            <span>Terms</span>
          </div>
        </div>
      </motion.div>

      {/* SISI KANAN - FORM */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full lg:w-1/2 flex flex-col bg-[#1a2f4f] lg:bg-transparent relative"
      >
        <div className="lg:hidden absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#10b981]/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#10b981]/5 rounded-full blur-3xl" />
        </div>

        {/* MOBILE HEADER */}
        <div className="lg:hidden relative z-10 px-6 pt-10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#10b981] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="text-white font-bold text-lg">Ratu Motor</span>
          </div>
          <h2 className="text-2xl font-bold text-white mt-8">
            {isRegister ? 'Daftar Akun Baru! 🌿' : 'Selamat Datang! 👋'}
          </h2>
          <p className="text-white/50 text-sm mt-1">
            {isRegister ? 'Buat akun untuk akses katalog & booking' : 'Masuk untuk akses sistem'}
          </p>
        </div>

        {/* FORM CARD */}
        <div className="relative z-10 flex-1 flex items-start lg:items-center justify-center px-4 lg:px-8 pb-8 lg:pb-0">
          <motion.div
            className="w-full max-w-md bg-white rounded-3xl lg:rounded-2xl shadow-2xl px-6 sm:px-8 pt-8 pb-8 relative overflow-hidden"
            whileHover={{ y: -3 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#10b981] via-[#1a2f4f] to-[#10b981]" />

            {/* Header */}
            <AnimatePresence mode="wait">
              <motion.div
                key={isRegister ? 'register' : 'login'}
                className="mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  {isRegister ? 'Daftar Akun' : 'Masuk ke Akun'}
                  <span className="text-xs bg-[#10b981]/10 text-[#10b981] px-2 py-0.5 rounded-full font-normal">
                    {isRegister ? 'Customer' : 'All Roles'}
                  </span>
                </h3>
                <p className="text-gray-500 text-sm mt-1">
                  {isRegister ? 'Isi data diri untuk mendaftar' : 'Masukkan email dan password untuk mengakses sistem'}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

              {/* Register Fields */}
              <AnimatePresence>
                {isRegister && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 overflow-hidden"
                  >
                    {/* Nama */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama Lengkap</label>
                      <div className="relative rounded-xl border border-gray-200 focus-within:border-[#10b981] focus-within:ring-2 focus-within:ring-[#10b981]/20 transition-all">
                        <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          {...register('name')}
                          placeholder="Nama lengkap"
                          className="w-full pl-11 pr-4 py-3.5 text-sm bg-transparent focus:outline-none placeholder:text-gray-400"
                        />
                      </div>
                      {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                    </div>

                    {/* No HP */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">No. HP</label>
                      <div className="relative rounded-xl border border-gray-200 focus-within:border-[#10b981] focus-within:ring-2 focus-within:ring-[#10b981]/20 transition-all">
                        <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          {...register('no_hp')}
                          placeholder="081234567890"
                          className="w-full pl-11 pr-4 py-3.5 text-sm bg-transparent focus:outline-none placeholder:text-gray-400"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Alamat Email</label>
                <div className="relative rounded-xl border border-gray-200 focus-within:border-[#10b981] focus-within:ring-2 focus-within:ring-[#10b981]/20 transition-all">
                  <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    {...register('email')}
                    placeholder="email@ratumotor.com"
                    className="w-full pl-11 pr-4 py-3.5 text-sm bg-transparent focus:outline-none placeholder:text-gray-400"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Kata Sandi</label>
                <div className="relative rounded-xl border border-gray-200 focus-within:border-[#10b981] focus-within:ring-2 focus-within:ring-[#10b981]/20 transition-all">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-11 py-3.5 text-sm bg-transparent focus:outline-none placeholder:text-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>

              {/* Confirm Password */}
              <AnimatePresence>
                {isRegister && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Konfirmasi Kata Sandi</label>
                      <div className="relative rounded-xl border border-gray-200 focus-within:border-[#10b981] focus-within:ring-2 focus-within:ring-[#10b981]/20 transition-all">
                        <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          {...register('password_confirmation')}
                          placeholder="••••••••"
                          className="w-full pl-11 pr-11 py-3.5 text-sm bg-transparent focus:outline-none placeholder:text-gray-400"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      {errors.password_confirmation && <p className="text-red-500 text-xs mt-1">{errors.password_confirmation.message}</p>}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Remember Me */}
              {!isRegister && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 text-[#10b981] focus:ring-[#10b981] focus:ring-offset-0"
                    />
                    <span className="text-sm text-gray-600">Ingat saya</span>
                  </label>
                  <a href="#" className="text-sm text-[#1a2f4f] hover:text-[#10b981] transition-colors font-medium">
                    Lupa Password?
                  </a>
                </div>
              )}

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1a2f4f] hover:bg-[#12223a] text-white font-semibold py-3.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg relative overflow-hidden group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.span
                  className="absolute inset-0 bg-gradient-to-r from-[#10b981] to-emerald-500"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      {isRegister ? 'Mendaftar...' : 'Memproses...'}
                    </>
                  ) : (
                    <>
                      {isRegister ? 'Daftar Sekarang' : 'Masuk ke Sistem'}
                      <ChevronRight size={18} />
                    </>
                  )}
                </span>
              </motion.button>

              {/* Toggle */}
              <div className="text-center text-sm text-gray-500">
                {isRegister ? (
                  <>
                    Sudah punya akun?{' '}
                    <button type="button" onClick={toggleMode} className="text-[#1a2f4f] font-semibold hover:text-[#10b981] transition-colors">
                      Masuk di sini
                    </button>
                  </>
                ) : (
                  <>
                    Belum punya akun?{' '}
                    <button type="button" onClick={toggleMode} className="text-[#1a2f4f] font-semibold hover:text-[#10b981] transition-colors">
                      Daftar sekarang
                    </button>
                  </>
                )}
              </div>

            </form>

            <p className="text-center text-xs text-gray-400 mt-6">
              Sistem Informasi Manajemen Showroom Motor
              <br />
              <span className="text-[#1a2f4f] font-medium">Ratu Motor Banyuwangi</span>
            </p>

          </motion.div>
        </div>
      </motion.div>

      <style>{`
        @keyframes spin-slow {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes spin-slow-reverse {
          from { transform: translate(-50%, -50%) rotate(360deg); }
          to { transform: translate(-50%, -50%) rotate(0deg); }
        }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }
        .animate-spin-slow-reverse { animation: spin-slow-reverse 25s linear infinite; }
      `}</style>
    </div>
  );
}