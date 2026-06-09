import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function Register() {
  const [name, setName]                 = useState('');
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [role, setRole]                 = useState('student');
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== passwordConfirm) { setError('Konfirmasi kata sandi tidak cocok.'); return; }
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('http://localhost:8000/api/register', {
        name, email, password, password_confirmation: passwordConfirm, role
      }, { headers: { 'Accept': 'application/json' } });

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      navigate(user.role === 'instructor' ? '/instructor/dashboard' : '/dashboard');
    } catch (err) {
      if (err.response?.data?.errors) {
        setError(Object.values(err.response.data.errors)[0][0]);
      } else {
        setError(err.response?.data?.message || 'Registrasi gagal. Periksa kembali data Anda.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex font-sans">
      {/* Left Panel */}
      <div className="hidden lg:flex w-[42%] bg-teal-700 flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center text-white text-lg">🎓</div>
          <span className="text-white font-bold text-lg tracking-tight">LMS Hybrid</span>
        </div>

        <div>
          <h2 className="text-3xl font-extrabold text-white leading-snug mb-4">
            Bergabung dan mulai perjalanan belajar Anda.
          </h2>
          <p className="text-teal-100 text-sm leading-relaxed">
            Daftarkan diri sebagai siswa untuk mengikuti kelas, atau sebagai instruktur untuk berbagi ilmu Anda ke ribuan pelajar.
          </p>

          <div className="mt-10 space-y-4">
            {[
              { icon: '🎓', title: 'Siswa', desc: 'Akses kelas, materi & kuis' },
              { icon: '👨‍🏫', title: 'Instruktur', desc: 'Buat & kelola kursus Anda' },
            ].map(item => (
              <div key={item.title} className="flex items-center gap-4 bg-white/10 rounded-2xl px-4 py-3">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <p className="text-white text-sm font-semibold">{item.title}</p>
                  <p className="text-teal-200 text-xs">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-teal-300 text-xs">© {new Date().getFullYear()} LMS Hybrid.</p>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 overflow-y-auto">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-teal-600 rounded-xl flex items-center justify-center text-white">🎓</div>
            <span className="font-bold text-zinc-800">LMS Hybrid</span>
          </div>

          <h1 className="text-2xl font-bold text-zinc-900 mb-1">Buat akun baru</h1>
          <p className="text-zinc-500 text-sm mb-6">Sudah punya akun?{' '}
            <Link to="/login" className="text-teal-600 font-semibold hover:underline">Masuk di sini</Link>
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Role Selector */}
            <div>
              <label className="block text-zinc-700 text-xs font-semibold mb-2">Daftar sebagai</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { val: 'student',    icon: '🎓', label: 'Siswa' },
                  { val: 'instructor', icon: '👨‍🏫', label: 'Instruktur' },
                ].map(r => (
                  <button
                    key={r.val}
                    type="button"
                    onClick={() => setRole(r.val)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                      role === r.val
                        ? 'bg-teal-50 border-teal-500 text-teal-700'
                        : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300'
                    }`}
                  >
                    <span className="text-lg">{r.icon}</span>
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-zinc-700 text-xs font-semibold mb-1.5">Nama Lengkap</label>
              <input
                type="text" required value={name} onChange={e => setName(e.target.value)}
                placeholder="Contoh: Budi Santoso"
                className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 transition-all"
              />
            </div>

            <div>
              <label className="block text-zinc-700 text-xs font-semibold mb-1.5">Email</label>
              <input
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-700 text-xs font-semibold mb-1.5">Password</label>
                <input
                  type="password" required value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 8 karakter"
                  className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 transition-all"
                />
              </div>
              <div>
                <label className="block text-zinc-700 text-xs font-semibold mb-1.5">Konfirmasi</label>
                <input
                  type="password" required value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)}
                  placeholder="Ulangi sandi"
                  className={`w-full bg-white border rounded-xl px-4 py-3 text-sm placeholder-zinc-400 focus:outline-none focus:ring-2 transition-all ${
                    passwordConfirm && password !== passwordConfirm
                      ? 'border-red-400 text-red-700 focus:border-red-400 focus:ring-red-500/15'
                      : 'border-zinc-200 text-zinc-900 focus:border-teal-500 focus:ring-teal-500/15'
                  }`}
                />
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading
                ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Mendaftar...</>
                : 'Buat Akun Sekarang'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
