import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { laravelAPI, nodeAPI } from '../lib/api';

function ShellCard({ children, className = '' }) {
  return (
    <div className={`bg-white/90 backdrop-blur-xl border border-emerald-100 rounded-3xl shadow-[0_18px_50px_rgba(16,185,129,0.08)] ${className}`}>
      {children}
    </div>
  );
}

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchData = async () => {
    try {
      const courseRes = await laravelAPI.get(`/courses/${id}`);
      setCourse(courseRes.data);

      if (user.id) {
        const subsRes = await nodeAPI.get(`/submissions/user/${user.id}`);
        setSubmissions(subsRes.data);
      }

      const quizRes = await nodeAPI.get(`/quizzes/course/${id}`);
      setQuizzes(quizRes.data);

      if (courseRes.data.enrollment && courseRes.data.materials?.length > 0) {
        setSelectedMaterial(courseRes.data.materials[0]);
      }
    } catch (err) {
      console.error('Error fetching course detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleEnroll = async () => {
    setActionLoading(true);
    try {
      await laravelAPI.post(`/courses/${id}/enroll`);
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mendaftar kursus');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnenroll = async () => {
    if (!window.confirm('Apakah Anda yakin ingin membatalkan pendaftaran dari kursus ini? Semua progress kuis Anda di kursus ini akan tetap tersimpan.')) return;
    setActionLoading(true);
    try {
      await laravelAPI.post(`/courses/${id}/unenroll`);
      setCourse(prev => ({ ...prev, enrollment: null }));
      setSelectedMaterial(null);
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal membatalkan pendaftaran');
    } finally {
      setActionLoading(false);
    }
  };

  const getYoutubeEmbedUrl = (url) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : url;
  };

  const getSubmission = (quizId) => submissions.find(s => s.quiz_id === quizId);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-emerald-700/70">Memuat detail kursus...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 text-emerald-950 flex items-center justify-center p-6">
        <div className="text-center bg-white/90 backdrop-blur-xl border border-emerald-100 rounded-3xl px-8 py-10 shadow-[0_18px_50px_rgba(16,185,129,0.08)]">
          <h2 className="text-2xl font-black mb-2">Kursus Tidak Ditemukan</h2>
          <Link to="/dashboard" className="text-emerald-600 font-semibold hover:underline">Kembali ke Dashboard</Link>
        </div>
      </div>
    );
  }

  const isEnrolled = !!course.enrollment;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 text-emerald-950 font-sans">
      <header className="sticky top-0 z-30 border-b border-emerald-100 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl transition-colors border border-emerald-100"
            >
              ←
            </button>
            <div className="min-w-0">
              <span className="text-[11px] text-emerald-600 font-bold uppercase tracking-[0.24em]">{course.category}</span>
              <h1 className="text-lg sm:text-xl font-black text-emerald-950 leading-tight truncate max-w-[15rem] sm:max-w-2xl">{course.title}</h1>
            </div>
          </div>
          <span className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-100 capitalize">
            {course.level}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 space-y-6">
          {isEnrolled && selectedMaterial ? (
            <ShellCard className="overflow-hidden">
              {selectedMaterial.type === 'video' && selectedMaterial.video_url ? (
                <div className="aspect-video w-full bg-emerald-950">
                  <iframe
                    src={getYoutubeEmbedUrl(selectedMaterial.video_url)}
                    title={selectedMaterial.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                </div>
              ) : (
                <div className="px-6 py-4 border-b border-emerald-100 bg-emerald-50 flex items-center justify-between">
                  <span className="text-xs bg-white text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-full font-semibold uppercase">📄 Bacaan</span>
                  <span className="text-xs text-emerald-600">Materi {selectedMaterial.order}</span>
                </div>
              )}

              <div className="p-6">
                <h2 className="text-2xl font-black text-emerald-950 mb-4">{selectedMaterial.title}</h2>
                <div className="text-emerald-900/80 text-sm leading-relaxed whitespace-pre-wrap">
                  {selectedMaterial.content || 'Tidak ada deskripsi tertulis untuk materi ini.'}
                </div>
              </div>
            </ShellCard>
          ) : (
            <ShellCard className="p-8 space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
              <div>
                <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-full font-semibold uppercase tracking-[0.2em]">
                  Detail Kelas
                </span>
                <h2 className="text-3xl font-black text-emerald-950 mt-4 tracking-tight">{course.title}</h2>
                <p className="text-emerald-700/70 text-sm mt-3 leading-relaxed">{course.description}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-6 border-t border-emerald-100">
                <div>
                  <p className="text-xs text-emerald-600/70 font-medium">Instruktur</p>
                  <p className="text-sm font-semibold text-emerald-950 mt-0.5">{course.instructor?.name || 'Instruktur'}</p>
                </div>
                <div>
                  <p className="text-xs text-emerald-600/70 font-medium">Tingkat Kesulitan</p>
                  <p className="text-sm font-semibold text-emerald-950 mt-0.5 capitalize">{course.level}</p>
                </div>
                <div>
                  <p className="text-xs text-emerald-600/70 font-medium">Jumlah Materi</p>
                  <p className="text-sm font-semibold text-emerald-950 mt-0.5">{course.materials?.length || 0} Pembelajaran</p>
                </div>
              </div>

              {!isEnrolled && (
                <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 mt-2">
                  <div>
                    <h3 className="text-sm font-black text-emerald-950">Mulai belajar hari ini!</h3>
                    <p className="text-xs text-emerald-700/70 mt-1">Daftarkan diri Anda sekarang untuk membuka semua materi dan kuis.</p>
                  </div>
                  <button
                    onClick={handleEnroll}
                    disabled={actionLoading}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all shadow-lg shadow-emerald-600/15 disabled:opacity-50 whitespace-nowrap active:scale-[0.98]"
                  >
                    {actionLoading ? 'Memproses...' : 'Daftar Kursus'}
                  </button>
                </div>
              )}
            </ShellCard>
          )}
        </section>

        <aside className="space-y-6">
          {isEnrolled && (
            <ShellCard className="p-6 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold text-emerald-900">Progress Belajar</span>
                <span className="font-black text-emerald-600">{course.enrollment?.progress || 0}%</span>
              </div>
              <div className="h-2 bg-emerald-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                  style={{ width: `${course.enrollment?.progress || 0}%` }}
                />
              </div>
              <button
                onClick={handleUnenroll}
                disabled={actionLoading}
                className="w-full bg-white hover:bg-red-50 text-red-600 border border-red-200 font-semibold text-xs py-3 rounded-xl transition-colors disabled:opacity-50"
              >
                {actionLoading ? 'Memproses...' : 'Batalkan Pendaftaran'}
              </button>
            </ShellCard>
          )}

          <ShellCard className="p-6">
            <h3 className="font-black text-emerald-950 mb-4 text-sm tracking-[0.2em] uppercase">Materi Belajar</h3>
            <div className="space-y-2">
              {course.materials?.length === 0 ? (
                <p className="text-emerald-600/60 text-xs text-center py-6">Belum ada materi pelajaran.</p>
              ) : (
                course.materials?.map((mat) => {
                  const isActive = selectedMaterial?.id === mat.id;
                  return (
                    <button
                      key={mat.id}
                      disabled={!isEnrolled}
                      onClick={() => setSelectedMaterial(mat)}
                      className={`w-full text-left p-3.5 rounded-2xl flex items-center justify-between border transition-all ${
                        !isEnrolled
                          ? 'opacity-60 cursor-not-allowed border-transparent bg-emerald-50'
                          : isActive
                          ? 'bg-emerald-600/10 border-emerald-500 text-emerald-950 font-semibold'
                          : 'bg-white border-emerald-100 hover:bg-emerald-50 text-emerald-900'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-base flex-shrink-0">{mat.type === 'video' ? '📺' : '📄'}</span>
                        <div className="truncate">
                          <p className="text-xs font-semibold truncate leading-snug">{mat.title}</p>
                          <p className="text-[10px] text-emerald-700/60 mt-0.5 capitalize">Materi {mat.order} • {mat.type}</p>
                        </div>
                      </div>
                      {!isEnrolled && <span className="text-xs text-emerald-600/60">🔒</span>}
                    </button>
                  );
                })
              )}
            </div>
          </ShellCard>

          <ShellCard className="p-6">
            <h3 className="font-black text-emerald-950 mb-4 text-sm tracking-[0.2em] uppercase">Ujian & Kuis</h3>
            <div className="space-y-3">
              {quizzes.length === 0 ? (
                <p className="text-emerald-600/60 text-xs text-center py-6">Belum ada kuis tersedia.</p>
              ) : (
                quizzes.map((quiz) => {
                  const submission = getSubmission(quiz._id);
                  const isDone = !!submission;
                  return (
                    <div key={quiz._id} className="bg-white border border-emerald-100 p-4 rounded-2xl flex flex-col justify-between gap-3 shadow-sm">
                      <div>
                        <h4 className="text-xs font-bold text-emerald-950 leading-snug">{quiz.title}</h4>
                        <p className="text-[10px] text-emerald-700/60 mt-1">
                          ⏱ {Math.round(quiz.duration_secs / 60)} menit • {quiz.questions?.length || 0} soal
                        </p>
                      </div>

                      {isDone ? (
                        <div className="flex justify-between items-center bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-xl">
                          <div>
                            <p className="text-[10px] text-emerald-600 font-medium">Nilai Anda</p>
                            <p className="text-xs font-bold text-emerald-700">{submission.percentage}% ({submission.total_score}/{submission.max_score} pts)</p>
                          </div>
                          <span className="text-xs text-emerald-600 font-bold">✓ Selesai</span>
                        </div>
                      ) : isEnrolled ? (
                        <Link
                          to={`/quiz/${quiz._id}`}
                          className="w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-600/15 block active:scale-[0.98]"
                        >
                          Mulai Kuis
                        </Link>
                      ) : (
                        <div className="w-full text-center bg-emerald-50 text-emerald-600 font-medium text-xs py-2 rounded-xl border border-emerald-100 cursor-not-allowed">
                          🔒 Kursus Terkunci
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </ShellCard>
        </aside>
      </main>
    </div>
  );
}
