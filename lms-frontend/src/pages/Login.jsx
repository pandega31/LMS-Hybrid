import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('http://localhost:8000/api/login', { email, password }, {
        headers: { 'Accept': 'application/json' }
      });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      navigate(user.role === 'instructor' ? '/instructor/dashboard' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Email atau password salah. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex font-sans">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex w-[45%] bg-teal-700 flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center text-white text-lg">
            🎓
          </div>
          <span className="text-white font-bold text-lg tracking-tight">LMS Hybrid</span>
        </div>

        <div>
          <h2 className="text-4xl font-extrabold text-white leading-snug mb-4">
            Belajar lebih<br />cerdas, bukan<br />lebih keras.
          </h2>
          <p className="text-teal-100 text-sm leading-relaxed max-w-xs">
            Platform pembelajaran hybrid yang menggabungkan kelas online dan offline untuk pengalaman belajar yang optimal.
          </p>

          <div className="flex gap-6 mt-10">
            <div>
              <p className="text-white text-2xl font-extrabold">200+</p>
              <p className="text-teal-200 text-xs mt-1">Kelas Aktif</p>
            </div>
            <div className="w-px bg-white/20" />
            <div>
              <p className="text-white text-2xl font-extrabold">5K+</p>
              <p className="text-teal-200 text-xs mt-1">Pelajar Terdaftar</p>
            </div>
            <div className="w-px bg-white/20" />
            <div>
              <p className="text-white text-2xl font-extrabold">98%</p>
              <p className="text-teal-200 text-xs mt-1">Tingkat Kepuasan</p>
            </div>
          </div>
        </div>

        <p className="text-teal-300 text-xs">© {new Date().getFullYear()} LMS Hybrid. Hak cipta dilindungi.</p>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">

          {/* Mobile brand */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-8 h-8 bg-teal-600 rounded-xl flex items-center justify-center text-white">🎓</div>
            <span className="font-bold text-zinc-800">LMS Hybrid</span>
          </div>

          <h1 className="text-2xl font-bold text-zinc-900 mb-1">Masuk ke akun Anda</h1>
          <p className="text-zinc-500 text-sm mb-8">Belum punya akun?{' '}
            <Link to="/register" className="text-teal-600 font-semibold hover:underline">Daftar gratis</Link>
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-xl mb-5 flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-zinc-700 text-xs font-semibold mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 transition-all"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-zinc-700 text-xs font-semibold">Password</label>
                <Link to="/forgot-password" className="text-teal-600 text-xs font-medium hover:underline">
                  Lupa password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 pr-11 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  {showPwd ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-semibold py-3 rounded-xl transition-colors text-sm mt-2 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading
                ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Masuk...</>
                : 'Masuk ke Akun'}
            </button>
          </form>

          {/* Quick Login */}
          <div className="mt-8 pt-6 border-t border-zinc-200">
            <p className="text-center text-zinc-400 text-xs mb-3">Login cepat (Demo)</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: '🎓 Sebagai Siswa',      email: 'siswa@lms.com' },
                { label: '👨‍🏫 Sebagai Instruktur', email: 'instruktur@lms.com' },
              ].map(item => (
                <button
                  key={item.email}
                  onClick={() => { setEmail(item.email); setPassword('password'); }}
                  className="text-xs bg-white border border-zinc-200 hover:border-teal-400 hover:bg-teal-50 text-zinc-600 py-2 px-3 rounded-xl transition-all text-left truncate"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
