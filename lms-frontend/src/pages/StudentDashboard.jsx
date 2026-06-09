import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { laravelAPI, nodeAPI } from '../lib/api';

const levelBadge = {
  pemula:   'bg-emerald-100 text-emerald-700 border border-emerald-200',
  menengah: 'bg-amber-100 text-amber-700 border border-amber-200',
  lanjutan: 'bg-red-100 text-red-700 border border-red-200',
};

function CourseCard({ course, onDetail, isCatalog = false }) {
  const progress = course.pivot?.progress ?? 0;
  return (
    <div className="bg-white/90 border border-emerald-100 rounded-2xl overflow-hidden flex flex-col shadow-[0_14px_40px_rgba(16,185,129,0.08)] hover:border-emerald-300 hover:shadow-[0_18px_50px_rgba(16,185,129,0.14)] transition-all duration-300">
      {/* Top color bar */}
      <div className={`h-1 w-full ${isCatalog ? 'bg-teal-400' : progress === 100 ? 'bg-emerald-400' : 'bg-teal-500'}`} />
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-bold text-zinc-800 text-sm leading-snug line-clamp-2">{course.title}</h3>
            <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-semibold whitespace-nowrap flex-shrink-0 ${levelBadge[course.level] || levelBadge.pemula}`}>
              {course.level}
            </span>
          </div>
          <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">{course.description}</p>
        </div>

        <div className="mt-4">
          {!isCatalog && (
            <div className="mb-3">
              <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
                <span>Progress</span>
                <span className="font-semibold text-zinc-700">{progress}%</span>
              </div>
              <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                <div className="h-full bg-teal-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
          <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
            <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 truncate max-w-[120px]">
              <span>👨‍🏫</span>
              <span className="truncate">{course.instructor?.name || 'Instruktur'}</span>
            </div>
            <button
              onClick={() => onDetail(course.id)}
              className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold px-3 py-1.5 rounded-lg border border-emerald-200 transition-all"
            >
              {isCatalog ? 'Lihat Detail' : 'Belajar →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="bg-white/90 border border-emerald-100 rounded-2xl p-5 flex items-center gap-4 shadow-[0_14px_40px_rgba(16,185,129,0.08)]">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">{label}</p>
        <p className="text-xl font-extrabold text-zinc-800 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function QuizItem({ quiz, submission, onStart, isEnrolled = true }) {
  const done = !!submission;
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-zinc-100 last:border-0">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
          done ? 'bg-emerald-100 text-emerald-600 border border-emerald-200'
               : 'bg-teal-50 text-teal-600 border border-teal-200'
        }`}>
          {done ? '✓' : '?'}
        </div>
        <div>
          <p className="text-sm font-semibold text-zinc-700">{quiz.title}</p>
          <p className="text-[10px] text-zinc-400 mt-0.5">{quiz.questions?.length ?? 0} soal</p>
        </div>
      </div>
      {done ? (
        <div className="text-right">
          <p className="text-sm font-bold text-emerald-600">{submission.percentage}%</p>
          <p className="text-[10px] text-zinc-400">{submission.total_score}/{submission.max_score} pts</p>
        </div>
      ) : isEnrolled ? (
        <button
          onClick={() => onStart(quiz._id)}
          className="text-xs bg-teal-600 hover:bg-teal-700 text-white px-3.5 py-1.5 rounded-lg font-semibold transition-colors"
        >
          Mulai
        </button>
      ) : (
        <span className="text-xs text-zinc-400">🔒 Terkunci</span>
      )}
    </div>
  );
}

function LeaderboardPanel({ title, quiz, entries, loading, onRefresh }) {
  return (
    <div className="bg-white/90 border border-emerald-100 rounded-2xl p-6 shadow-[0_14px_40px_rgba(16,185,129,0.08)]">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">{title}</p>
          <h3 className="text-lg font-bold text-emerald-900 mt-1">{quiz ? quiz.title : 'Pilih kuis untuk melihat leaderboard'}</h3>
        </div>
        {quiz && (
          <button onClick={onRefresh} className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold px-3 py-1.5 rounded-lg border border-emerald-200 transition-all">
            Muat Ulang
          </button>
        )}
      </div>

      {!quiz ? (
        <p className="text-sm text-zinc-400 text-center py-8">Belum ada kuis dipilih.</p>
      ) : loading ? (
        <div className="py-8 text-center text-sm text-zinc-400">Memuat leaderboard...</div>
      ) : entries.length === 0 ? (
        <p className="text-sm text-zinc-400 text-center py-8">Belum ada skor pada kuis ini.</p>
      ) : (
        <div className="space-y-2">
          {entries.map((entry, index) => (
            <div key={entry._id || `${entry.user_name}-${index}`} className={`flex items-center justify-between rounded-xl border px-4 py-3 ${index === 0 ? 'border-emerald-200 bg-emerald-50' : 'border-zinc-100 bg-white'}`}>
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${index === 0 ? 'bg-emerald-600 text-white' : 'bg-zinc-100 text-zinc-600'}`}>
                  {index + 1}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-zinc-800 truncate">{entry.user_name || 'Siswa'}</p>
                  <p className="text-[10px] text-zinc-400">{entry.completed_at ? new Date(entry.completed_at).toLocaleString('id-ID') : 'Waktu tidak tersedia'}</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-emerald-700">{entry.total_score}/{entry.max_score ?? quiz.questions?.reduce((sum, question) => sum + (question.points || 10), 0)}</p>
                <p className="text-[10px] text-zinc-400">{entry.percentage}% • {Math.round((entry.time_taken || 0) / 60)}m</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ReviewModal({ quiz, submission, onClose }) {
  if (!quiz || !submission) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-[0_30px_90px_rgba(16,185,129,0.2)]" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-emerald-100 bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 text-white">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-emerald-100 font-semibold">Review Kuis</p>
            <h3 className="text-lg font-bold">{quiz.title}</h3>
          </div>
          <button onClick={onClose} className="text-2xl leading-none text-white/85 hover:text-white">×</button>
        </div>

        <div className="max-h-[calc(90vh-88px)] overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600">Skor</p>
              <p className="mt-1 text-2xl font-extrabold text-emerald-700">{submission.percentage}%</p>
            </div>
            <div className="rounded-2xl border border-teal-100 bg-teal-50 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-teal-600">Nilai</p>
              <p className="mt-1 text-2xl font-extrabold text-teal-700">{submission.total_score}/{submission.max_score}</p>
            </div>
            <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Durasi</p>
              <p className="mt-1 text-2xl font-extrabold text-zinc-700">{Math.round((submission.time_taken || 0) / 60)}m</p>
            </div>
            <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Status</p>
              <p className="mt-1 text-2xl font-extrabold text-zinc-700">{submission.percentage >= 70 ? 'Lulus' : 'Perbaikan'}</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {quiz.questions?.map((question, index) => {
              const answer = submission.answers?.find(item => item.question_index === index);
              const chosen = answer?.chosen_index;
              const correct = question.correct_index;

              return (
                <div key={index} className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-[0_10px_30px_rgba(16,185,129,0.06)]">
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${answer?.is_correct ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-zinc-800 leading-relaxed">{question.question}</p>
                      <div className="mt-3 grid gap-2 md:grid-cols-2">
                        {question.options?.map((option, optionIndex) => {
                          const isCorrect = optionIndex === correct;
                          const isChosen = optionIndex === chosen;
                          const tone = isCorrect
                            ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                            : isChosen
                              ? 'border-amber-300 bg-amber-50 text-amber-800'
                              : 'border-zinc-200 bg-zinc-50 text-zinc-600';

                          return (
                            <div key={optionIndex} className={`rounded-xl border px-3 py-2 text-sm ${tone}`}>
                              <span className="mr-2 font-bold">{String.fromCharCode(65 + optionIndex)}.</span>
                              {option}
                              {isCorrect && <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-emerald-600">Kunci</span>}
                              {isChosen && !isCorrect && <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-amber-600">Jawaban Anda</span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

const navItems = [
  { id: 'beranda',    label: 'Beranda',        icon: '⊞' },
  { id: 'my-courses', label: 'Kursus Saya',    icon: '📚' },
  { id: 'catalog',    label: 'Katalog Kursus', icon: '🔎' },
  { id: 'quiz',       label: 'Evaluasi Kuis',  icon: '✏️' },
  { id: 'nilai',      label: 'Rekap Nilai',    icon: '📊' },
];

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [courses, setCourses]         = useState([]);
  const [catalog, setCatalog]         = useState([]);
  const [quizzes, setQuizzes]         = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [activeTab, setActiveTab]     = useState('beranda');
  const [filterCourse, setFilterCourse] = useState(null);
  const [reviewModal, setReviewModal] = useState({ open: false, loading: false, quiz: null, submission: null });
  const [leaderboardQuizId, setLeaderboardQuizId] = useState(null);
  const [leaderboardEntries, setLeaderboardEntries] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchData = async () => {
    try {
      const [enrolledRes, catalogRes, subRes] = await Promise.all([
        laravelAPI.get('/my-courses'),
        laravelAPI.get('/courses'),
        nodeAPI.get(`/submissions/user/${user.id}`),
      ]);
      setCourses(enrolledRes.data);
      setCatalog(catalogRes.data.data || []);
      setSubmissions(subRes.data);

      if (enrolledRes.data.length > 0) {
        const quizResponses = await Promise.all(
          enrolledRes.data.map(c => nodeAPI.get(`/quizzes/course/${c.id}`).catch(() => ({ data: [] })))
        );
        setQuizzes(quizResponses.flatMap(r => r.data));
      }
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (!leaderboardQuizId && quizzes.length > 0) {
      loadLeaderboard(quizzes[0]._id);
    }
  }, [quizzes]);

  const handleLogout = () => { localStorage.clear(); navigate('/login'); };

  const avgScore = submissions.length
    ? Math.round(submissions.reduce((s, x) => s + x.percentage, 0) / submissions.length) : 0;
  const completedCourses = courses.filter(c => c.pivot?.progress === 100).length;
  const filteredQuizzes  = filterCourse ? quizzes.filter(q => q.course_id === filterCourse) : quizzes;
  const getSubmission    = (qId) => submissions.find(s => s.quiz_id === qId);
  const selectedLeaderboardQuiz = quizzes.find(q => q._id === leaderboardQuizId) || null;

  const loadLeaderboard = async (quizId) => {
    if (!quizId) return;
    setLeaderboardQuizId(quizId);
    setLeaderboardLoading(true);
    try {
      const res = await nodeAPI.get(`/leaderboard/${quizId}`);
      setLeaderboardEntries(res.data || []);
    } catch (err) {
      console.error('Error loading leaderboard:', err);
      setLeaderboardEntries([]);
    } finally {
      setLeaderboardLoading(false);
    }
  };

  const openReview = async (submission) => {
    setReviewModal({ open: true, loading: true, quiz: null, submission });
    try {
      const quizRes = await nodeAPI.get(`/quizzes/${submission.quiz_id}/review`);
      setReviewModal({ open: true, loading: false, quiz: quizRes.data, submission });
    } catch (err) {
      console.error('Error loading review quiz:', err);
      setReviewModal({ open: false, loading: false, quiz: null, submission: null });
      alert('Gagal memuat review kuis.');
    }
  };

  const closeReview = () => {
    setReviewModal({ open: false, loading: false, quiz: null, submission: null });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-zinc-500">Menyiapkan dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 font-sans flex h-screen overflow-hidden">

      {/* Sidebar */}
      <aside className="w-64 bg-emerald-700 text-white border-r border-emerald-800/30 flex flex-col flex-shrink-0 shadow-[0_20px_50px_rgba(4,120,87,0.18)]">
        {/* Brand */}
        <div className="p-5 border-b border-white/15">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center text-white font-bold text-sm ring-1 ring-white/15">🎓</div>
            <span className="font-extrabold text-white text-sm tracking-tight">Student Hub</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === item.id
                  ? 'bg-white text-emerald-700 font-semibold shadow-sm'
                  : 'text-emerald-50/85 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-white/15">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-white/15 text-white font-bold rounded-full flex items-center justify-center text-xs flex-shrink-0 ring-1 ring-white/15">
              {user.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{user.name}</p>
              <p className="text-[10px] text-emerald-50/80 capitalize">{user.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full bg-white/10 hover:bg-white text-white hover:text-emerald-700 text-xs py-2 rounded-lg border border-white/15 hover:border-white transition-all"
          >
            Keluar
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-gradient-to-br from-white via-emerald-50/40 to-white">

        {/* ===== BERANDA ===== */}
        {activeTab === 'beranda' && (
          <div className="space-y-8 max-w-5xl">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900">
                Selamat datang, {user.name?.split(' ')[0]}! 👋
              </h1>
              <p className="text-zinc-500 text-sm mt-1">Terus tingkatkan keahlian Anda. Konsistensi adalah kunci sukses.</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon="📚" label="Kursus Diikuti"  value={courses.length}      color="bg-teal-50 text-teal-600" />
              <StatCard icon="✅" label="Kursus Selesai"  value={completedCourses}    color="bg-emerald-50 text-emerald-600" />
              <StatCard icon="✏️" label="Kuis Dikerjakan" value={submissions.length}  color="bg-amber-50 text-amber-600" />
              <StatCard icon="⭐" label="Rata-rata Nilai"  value={`${avgScore}%`}      color="bg-violet-50 text-violet-600" />
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-zinc-800">Lanjutkan Belajar</h2>
                <button onClick={() => setActiveTab('my-courses')} className="text-xs text-teal-600 hover:underline font-medium">
                  Semua kelas →
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courses.slice(0, 2).map(c => (
                  <CourseCard key={c.id} course={c} onDetail={id => navigate(`/course/${id}`)} />
                ))}
                {courses.length === 0 && (
                  <div className="col-span-2 bg-white border border-zinc-200 border-dashed p-10 rounded-2xl text-center">
                    <p className="text-zinc-400 text-sm">Belum ada kursus yang diikuti.</p>
                    <button onClick={() => setActiveTab('catalog')} className="mt-2 text-teal-600 text-sm font-semibold hover:underline">
                      Telusuri katalog kelas →
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Quizzes */}
                <div className="bg-white/90 border border-emerald-100 rounded-2xl p-6 shadow-[0_14px_40px_rgba(16,185,129,0.08)]">
                  <h2 className="font-bold text-emerald-900 mb-4">Kuis Terbaru</h2>
              {quizzes.length === 0
                ? <p className="text-emerald-400 text-sm text-center py-6">Belum ada kuis tersedia.</p>
                : quizzes.slice(0, 3).map(quiz => (
                    <QuizItem key={quiz._id} quiz={quiz} submission={getSubmission(quiz._id)} onStart={id => navigate(`/quiz/${id}`)} />
                  ))}
            </div>
          </div>
        )}

        {/* ===== KURSUS SAYA ===== */}
        {activeTab === 'my-courses' && (
          <div className="space-y-6 max-w-5xl">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900">Kelas Belajar Saya</h1>
              <p className="text-zinc-500 text-sm mt-1">Daftar kelas aktif yang sedang Anda pelajari.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {courses.map(c => (
                <CourseCard key={c.id} course={c} onDetail={id => navigate(`/course/${id}`)} />
              ))}
              {courses.length === 0 && (
                <div className="col-span-full border border-dashed border-emerald-200 bg-white p-14 rounded-2xl text-center">
                  <p className="text-zinc-400 text-sm">Anda belum mendaftar di kelas apapun.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== KATALOG ===== */}
        {activeTab === 'catalog' && (
          <div className="space-y-6 max-w-5xl">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900">Katalog Kelas</h1>
              <p className="text-zinc-500 text-sm mt-1">Telusuri dan ikuti kelas yang tersedia di platform kami.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {catalog.map(c => (
                <CourseCard key={c.id} course={c} isCatalog onDetail={id => navigate(`/course/${id}`)} />
              ))}
              {catalog.length === 0 && (
                <div className="col-span-full border border-dashed border-emerald-200 bg-white p-14 rounded-2xl text-center">
                  <p className="text-zinc-400 text-sm">Belum ada kelas yang dipublikasikan.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== QUIZ ===== */}
        {activeTab === 'quiz' && (
          <div className="space-y-6 max-w-5xl">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900">Evaluasi Kuis</h1>
              <p className="text-zinc-500 text-sm mt-1">Selesaikan kuis untuk menguji pemahaman Anda.</p>
            </div>

            <div className="flex gap-2 flex-wrap">
              {[{ id: null, title: 'Semua Kelas' }, ...courses].map(c => (
                <button
                  key={c.id ?? 'all'}
                  onClick={() => setFilterCourse(c.id ?? null)}
                  className={`text-xs font-semibold px-3.5 py-2 rounded-lg border transition-all ${
                    filterCourse === (c.id ?? null)
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'bg-white border-zinc-200 text-zinc-600 hover:border-teal-300'
                  }`}
                >
                  {c.id ? c.title.split(' ').slice(0, 3).join(' ') + '...' : c.title}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-5">
              <div className="bg-white/90 border border-emerald-100 rounded-2xl p-6 shadow-[0_14px_40px_rgba(16,185,129,0.08)]">
                {filteredQuizzes.length === 0
                  ? <p className="text-center text-zinc-400 text-sm py-10">Belum ada kuis untuk kategori ini.</p>
                  : filteredQuizzes.map(quiz => {
                      const isSelected = leaderboardQuizId === quiz._id;
                      return (
                        <div key={quiz._id} className="rounded-2xl border border-zinc-100 p-4 mb-3 last:mb-0 bg-white hover:border-emerald-200 transition-colors">
                          <QuizItem quiz={quiz} submission={getSubmission(quiz._id)} onStart={id => navigate(`/quiz/${id}`)} />
                          <p className="text-[10px] text-zinc-400 pb-2 pl-11">
                            📖 {courses.find(c => c.id === quiz.course_id)?.title || 'Kelas Terdaftar'}
                          </p>
                          <div className="flex gap-2 pl-11">
                            <button
                              onClick={() => loadLeaderboard(quiz._id)}
                              className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${isSelected ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'}`}
                            >
                              Leaderboard
                            </button>
                          </div>
                        </div>
                      );
                    })}
              </div>

              <LeaderboardPanel
                title="Leaderboard Kuis"
                quiz={selectedLeaderboardQuiz}
                entries={leaderboardEntries}
                loading={leaderboardLoading}
                onRefresh={() => loadLeaderboard(leaderboardQuizId)}
              />
            </div>
          </div>
        )}

        {/* ===== REKAP NILAI ===== */}
        {activeTab === 'nilai' && (
          <div className="space-y-6 max-w-4xl">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900">Rekap Hasil Belajar</h1>
              <p className="text-zinc-500 text-sm mt-1">Laporan nilai evaluasi kuis yang telah diselesaikan.</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Rata-rata Nilai', value: `${avgScore}%`, color: 'text-teal-600' },
                { label: 'Kuis Lulus (≥70%)', value: submissions.filter(s => s.percentage >= 70).length, color: 'text-emerald-600' },
                { label: 'Perlu Perbaikan', value: submissions.filter(s => s.percentage < 70).length, color: 'text-amber-600' },
              ].map(s => (
                <div key={s.label} className="bg-white/90 border border-emerald-100 rounded-2xl p-6 text-center shadow-[0_14px_40px_rgba(16,185,129,0.08)]">
                  <p className={`text-3xl font-extrabold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider mt-2">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="bg-white/90 border border-emerald-100 rounded-2xl overflow-hidden shadow-[0_14px_40px_rgba(16,185,129,0.08)]">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-zinc-100 bg-zinc-50">
                    <th className="px-5 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Judul Kuis</th>
                    <th className="px-5 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Kelas</th>
                    <th className="px-5 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-center">Skor</th>
                    <th className="px-5 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-center">Nilai</th>
                    <th className="px-5 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-center">Status</th>
                    <th className="px-5 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {submissions.map(sub => {
                    const quiz   = quizzes.find(q => q._id === sub.quiz_id);
                    const course = courses.find(c => c.id === quiz?.course_id);
                    const passed = sub.percentage >= 70;
                    return (
                      <tr key={sub._id} className="hover:bg-zinc-50 transition-colors">
                        <td className="px-5 py-4 text-sm font-semibold text-zinc-700">{quiz?.title || '—'}</td>
                        <td className="px-5 py-4 text-sm text-zinc-500">{course?.title || '—'}</td>
                        <td className="px-5 py-4 text-sm text-zinc-600 text-center">{sub.total_score}/{sub.max_score}</td>
                        <td className="px-5 py-4 text-center">
                          <span className={`text-sm font-bold ${passed ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {sub.percentage}%
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                            passed ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {passed ? 'Lulus' : 'Perbaikan'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          {quiz && (
                            <button
                              onClick={() => openReview(sub)}
                              className="text-xs bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-semibold px-3 py-1.5 rounded-lg transition-all"
                            >
                              Review
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {submissions.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-zinc-400 text-sm">
                        Belum ada hasil kuis yang diselesaikan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {reviewModal.open && (
          reviewModal.loading ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
              <div className="rounded-2xl bg-white px-6 py-5 shadow-[0_24px_60px_rgba(16,185,129,0.14)]">
                <p className="text-sm font-semibold text-zinc-700">Memuat review kuis...</p>
              </div>
            </div>
          ) : (
            <ReviewModal quiz={reviewModal.quiz} submission={reviewModal.submission} onClose={closeReview} />
          )
        )}

      </main>
    </div>
  );
}
