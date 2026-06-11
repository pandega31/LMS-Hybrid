import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'http://localhost:8000/api';

export default function ForgotPassword() {
  const navigate = useNavigate();

  // step: 'email' | 'otp' | 'password'
  const [step, setStep]           = useState('email');
  const [email, setEmail]         = useState('');
  const [otp, setOtp]             = useState(['', '', '', '', '', '']);
  const [resetToken, setResetToken] = useState('');
  const [password, setPassword]   = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPwd, setShowPwd]     = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  /* ---------- Helpers ---------- */
  const startCooldown = () => {
    setResendCooldown(60);
    const t = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) { clearInterval(t); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleOtpChange = (val, idx) => {
    const clean = val.replace(/\D/, '');
    const next = [...otp];
    next[idx] = clean;
    setOtp(next);
    if (clean && idx < 5) {
      document.getElementById(`otp-${idx + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      document.getElementById(`otp-${idx - 1}`)?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = [...otp];
    pasted.split('').forEach((ch, i) => { next[i] = ch; });
    setOtp(next);
    document.getElementById(`otp-${Math.min(pasted.length, 5)}`)?.focus();
  };

  const getStrength = (pwd) => {
    if (!pwd) return null;
    if (pwd.length < 6)  return { label: 'Lemah', w: 'w-1/4', color: 'bg-red-400' };
    if (pwd.length < 8)  return { label: 'Cukup', w: 'w-2/4', color: 'bg-amber-400' };
    if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(pwd))
      return { label: 'Kuat', w: 'w-full', color: 'bg-teal-500' };
    return { label: 'Sedang', w: 'w-3/4', color: 'bg-blue-400' };
  };

  /* ---------- Step 1: Kirim OTP ---------- */
  const handleSendOtp = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post(`${API}/forgot-password`, { email }, { headers: { Accept: 'application/json' } });
      setStep('otp');
      startCooldown();
    } catch (err) {
      setError(err.response?.data?.errors?.email?.[0] || err.response?.data?.message || 'Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Step 2: Verifikasi OTP ---------- */
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) { setError('Masukkan 6 digit kode OTP.'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API}/verify-otp`, { email, otp: code }, { headers: { Accept: 'application/json' } });
      setResetToken(res.data.reset_token);
      setStep('password');
    } catch (err) {
      setError(err.response?.data?.message || 'Kode OTP tidak valid.');
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Step 3: Reset Password ---------- */
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (password !== passwordConfirm) { setError('Konfirmasi kata sandi tidak cocok.'); return; }
    setLoading(true);
    setError('');
    try {
      await axios.post(`${API}/reset-password`, {
        email,
        reset_token: resetToken,
        password,
        password_confirmation: passwordConfirm,
      }, { headers: { Accept: 'application/json' } });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mereset kata sandi.');
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Render ---------- */
  const strength = getStrength(password);

  const stepInfo = {
    email:    { num: 1, title: 'Lupa Kata Sandi?', sub: 'Masukkan email Anda dan kami akan mengirimkan kode OTP 6 digit.' },
    otp:      { num: 2, title: 'Verifikasi OTP',   sub: `Masukkan kode 6 digit yang dikirim ke ${email}` },
    password: { num: 3, title: 'Buat Kata Sandi Baru', sub: 'Buat kata sandi yang kuat untuk akun Anda.' },
  };

  const current = stepInfo[step];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center px-4 font-sans">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg shadow-teal-500/20">🎓</div>
            <span className="font-bold text-zinc-800 text-lg">LMS Hybrid</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">{current.title}</h1>
          <p className="text-zinc-500 text-sm">{current.sub}</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map(n => (
            <div key={n} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                current.num > n ? 'bg-teal-600 text-white' :
                current.num === n ? 'bg-teal-600 text-white ring-4 ring-teal-200' :
                'bg-zinc-200 text-zinc-400'
              }`}>
                {current.num > n ? '✓' : n}
              </div>
              {n < 3 && <div className={`w-10 h-0.5 rounded ${current.num > n ? 'bg-teal-600' : 'bg-zinc-200'}`} />}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-8 shadow-sm">

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-xl mb-5 flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          {success ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-teal-50 border-2 border-teal-200 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✅</div>
              <h3 className="font-bold text-zinc-900 text-lg mb-2">Kata sandi berhasil diubah!</h3>
              <p className="text-zinc-500 text-sm mb-4">Anda akan diarahkan ke halaman login...</p>
              <Link to="/login" className="text-teal-600 font-semibold text-sm hover:underline">Login sekarang →</Link>
            </div>

          ) : step === 'email' ? (
            /* ── STEP 1: Email ── */
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-zinc-700 text-xs font-semibold mb-1.5">Alamat Email</label>
                <input
                  id="forgot-email"
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading
                  ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Mengirim OTP...</>
                  : '📩 Kirim Kode OTP'}
              </button>
            </form>

          ) : step === 'otp' ? (
            /* ── STEP 2: OTP ── */
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div>
                <label className="block text-zinc-700 text-xs font-semibold mb-4 text-center">Masukkan Kode OTP</label>
                <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`otp-${idx}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(e.target.value, idx)}
                      onKeyDown={e => handleOtpKeyDown(e, idx)}
                      className="w-11 h-14 text-center text-xl font-bold border-2 border-zinc-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 transition-all bg-zinc-50 text-zinc-900"
                    />
                  ))}
                </div>
                <p className="text-xs text-zinc-400 text-center mt-3">
                  Kode OTP berlaku selama <strong>10 menit</strong>
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || otp.join('').length < 6}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading
                  ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Memverifikasi...</>
                  : '✅ Verifikasi Kode'}
              </button>

              <div className="text-center text-xs text-zinc-400">
                Tidak menerima kode?{' '}
                {resendCooldown > 0 ? (
                  <span className="text-zinc-400">Kirim ulang dalam {resendCooldown}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="text-teal-600 font-semibold hover:underline"
                  >
                    Kirim ulang
                  </button>
                )}
              </div>
            </form>

          ) : (
            /* ── STEP 3: Password Baru ── */
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-zinc-700 text-xs font-semibold mb-1.5">Kata Sandi Baru</label>
                <div className="relative">
                  <input
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

              <div>
                <label className="block text-zinc-700 text-xs font-semibold mb-1.5">Konfirmasi Kata Sandi</label>
                <input
                  type={showPwd ? 'text' : 'password'}
                  required
                  value={passwordConfirm}
                  onChange={e => setPasswordConfirm(e.target.value)}
                  placeholder="Ulangi kata sandi baru"
                  className={`w-full bg-white border rounded-xl px-4 py-3 text-sm placeholder-zinc-400 focus:outline-none focus:ring-2 transition-all ${
                    passwordConfirm && password !== passwordConfirm
                      ? 'border-red-400 focus:border-red-400 focus:ring-red-400/15 text-red-700'
                      : passwordConfirm && password === passwordConfirm
                      ? 'border-teal-400 focus:border-teal-500 focus:ring-teal-500/15 text-zinc-900'
                      : 'border-zinc-200 focus:border-teal-500 focus:ring-teal-500/15 text-zinc-900'
                  }`}
                />
                {passwordConfirm && (
                  <p className={`text-xs mt-1 ${password === passwordConfirm ? 'text-teal-600' : 'text-red-500'}`}>
                    {password === passwordConfirm ? '✓ Kata sandi cocok' : '✗ Kata sandi tidak cocok'}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
              >
                {loading
                  ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Memperbarui...</>
                  : '🔒 Perbarui Kata Sandi'}
              </button>
            </form>
          )}
        </div>

        <div className="text-center mt-6">
          <Link to="/login" className="text-zinc-500 text-sm hover:text-teal-600 transition-colors inline-flex items-center gap-1.5">
            ← Kembali ke halaman Login
          </Link>
        </div>
      </div>
    </div>
  );
}
