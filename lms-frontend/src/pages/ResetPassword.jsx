import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [token, setToken]               = useState('');
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPwd, setShowPwd]           = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');
  const [success, setSuccess]           = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('token');
    const e = params.get('email');
    if (!t || !e) {
      setError('Link reset tidak valid. Silakan minta link baru.');
    } else {
      setToken(t);
      setEmail(e);
    }
  }, []);

  const getStrength = (pwd) => {
    if (!pwd) return null;
    if (pwd.length < 6) return { label: 'Lemah', w: 'w-1/4', color: 'bg-red-400' };
    if (pwd.length < 8)  return { label: 'Cukup', w: 'w-2/4', color: 'bg-amber-400' };
    if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(pwd))
      return { label: 'Kuat', w: 'w-full', color: 'bg-teal-500' };
    return { label: 'Sedang', w: 'w-3/4', color: 'bg-blue-400' };
  };

  const strength = getStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== passwordConfirm) { setError('Konfirmasi kata sandi tidak cocok.'); return; }
    setLoading(true);
    setError('');
    try {
      await axios.post('http://localhost:8000/api/reset-password', {
        token, email, password, password_confirmation: passwordConfirm,
      }, { headers: { 'Accept': 'application/json' } });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      if (err.response?.data?.errors) {
        setError(Object.values(err.response.data.errors)[0][0]);
      } else {
        setError(err.response?.data?.message || 'Terjadi kesalahan. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4 font-sans">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 bg-teal-600 rounded-xl flex items-center justify-center text-white text-lg">🎓</div>
            <span className="font-bold text-zinc-800 text-lg">LMS Hybrid</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">Atur ulang kata sandi</h1>
          {email && (
            <p className="text-zinc-500 text-sm">
              Buat kata sandi baru untuk <span className="font-medium text-zinc-700">{email}</span>
            </p>
          )}
        </div>

        {/* Card */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-8 shadow-sm">

          {success ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-teal-50 border-2 border-teal-200 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                ✅
              </div>
              <h3 className="font-bold text-zinc-900 text-lg mb-2">Kata sandi diperbarui!</h3>
              <p className="text-zinc-500 text-sm mb-4">
                Kata sandi Anda berhasil diubah. Anda akan diarahkan ke halaman login...
              </p>
              <div className="w-full bg-zinc-100 rounded-full h-1 mb-4">
                <div className="bg-teal-500 h-1 rounded-full animate-[pulse_3s_ease-in-out]" style={{ width: '100%' }} />
              </div>
              <Link to="/login" className="text-teal-600 font-semibold text-sm hover:underline">
                Login sekarang →
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-xl mb-5 flex items-center gap-2">
                  <span>⚠️</span> {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* New Password */}
                <div>
                  <label className="block text-zinc-700 text-xs font-semibold mb-1.5">Kata Sandi Baru</label>
                  <div className="relative">
                    <input
                      id="new-password"
                      type={showPwd ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Min. 8 karakter"
                      className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 pr-11 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 transition-all"
                    />
                    <button type="button" onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                      {showPwd ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {strength && (
                    <div className="mt-2">
                      <div className="w-full bg-zinc-100 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full transition-all ${strength.color} ${strength.w}`} />
                      </div>
                      <p className="text-xs text-zinc-400 mt-1">Kekuatan: <span className="font-semibold text-zinc-600">{strength.label}</span></p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-zinc-700 text-xs font-semibold mb-1.5">Konfirmasi Kata Sandi</label>
                  <div className="relative">
                    <input
                      id="confirm-password"
                      type={showConfirm ? 'text' : 'password'}
                      required
                      value={passwordConfirm}
                      onChange={e => setPasswordConfirm(e.target.value)}
                      placeholder="Ulangi kata sandi baru"
                      className={`w-full bg-white border rounded-xl px-4 py-3 pr-11 text-sm placeholder-zinc-400 focus:outline-none focus:ring-2 transition-all ${
                        passwordConfirm && password !== passwordConfirm
                          ? 'border-red-400 focus:border-red-400 focus:ring-red-400/15 text-red-700'
                          : passwordConfirm && password === passwordConfirm
                          ? 'border-teal-400 focus:border-teal-500 focus:ring-teal-500/15 text-zinc-900'
                          : 'border-zinc-200 focus:border-teal-500 focus:ring-teal-500/15 text-zinc-900'
                      }`}
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                      {showConfirm ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {passwordConfirm && (
                    <p className={`text-xs mt-1 ${password === passwordConfirm ? 'text-teal-600' : 'text-red-500'}`}>
                      {password === passwordConfirm ? '✓ Kata sandi cocok' : '✗ Kata sandi tidak cocok'}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !token}
                  id="btn-reset-password"
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
                >
                  {loading
                    ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Memperbarui...</>
                    : '🔒 Perbarui Kata Sandi'}
                </button>
              </form>
            </>
          )}
        </div>

        <div className="text-center mt-6">
          <Link to="/login" className="text-zinc-500 text-sm hover:text-teal-600 transition-colors">
            ← Kembali ke halaman Login
          </Link>
        </div>
      </div>
    </div>
  );
}
