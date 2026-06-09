import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function ForgotPassword() {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await axios.post('http://localhost:8000/api/forgot-password', { email }, {
        headers: { 'Accept': 'application/json' }
      });
      setSuccess(response.data.message || 'Link reset password telah dikirimkan ke email Anda.');
      setEmail('');
    } catch (err) {
      if (err.response?.data?.errors?.email) {
        setError(err.response.data.errors.email[0]);
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
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">Lupa kata sandi?</h1>
          <p className="text-zinc-500 text-sm">
            Masukkan email Anda dan kami akan mengirimkan link untuk mengatur ulang kata sandi.
          </p>
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
              <div className="w-14 h-14 bg-teal-50 border border-teal-200 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                📬
              </div>
              <h3 className="font-bold text-zinc-900 mb-2">Email Terkirim!</h3>
              <p className="text-zinc-500 text-sm mb-4">{success}</p>
              <p className="text-zinc-400 text-xs">Tidak menerima email? Cek folder spam atau</p>
              <button
                onClick={() => setSuccess('')}
                className="text-teal-600 text-xs font-semibold hover:underline mt-1"
              >
                kirim ulang email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
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
                id="btn-send-reset"
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading
                  ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Mengirim...</>
                  : '📩 Kirim Link Reset'}
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
