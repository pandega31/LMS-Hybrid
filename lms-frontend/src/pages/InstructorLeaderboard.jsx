import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { laravelAPI, nodeAPI } from '../lib/api';

export default function InstructorLeaderboard() {
  const navigate = useNavigate();
  const { quizId } = useParams();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [courseTitle, setCourseTitle] = useState('');
  const [entries, setEntries] = useState([]);

  const loadData = async (isRefresh = false) => {
    if (!quizId) return;

    isRefresh ? setRefreshing(true) : setLoading(true);
    try {
      const [quizRes, leaderboardRes] = await Promise.all([
        nodeAPI.get(`/quizzes/${quizId}/review`),
        nodeAPI.get(`/leaderboard/${quizId}`),
      ]);

      setQuiz(quizRes.data || null);
      setEntries(leaderboardRes.data || []);

      if (quizRes.data?.course_id) {
        try {
          const courseRes = await laravelAPI.get(`/courses/${quizRes.data.course_id}`);
          setCourseTitle(courseRes.data?.title || '');
        } catch {
          setCourseTitle('');
        }
      }
    } catch (err) {
      console.error('Error loading instructor leaderboard:', err);
      setQuiz(null);
      setEntries([]);
      setCourseTitle('');
    } finally {
      isRefresh ? setRefreshing(false) : setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [quizId]);

  const totalPoints = quiz?.questions?.reduce((sum, question) => sum + (question.points || 10), 0) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 font-sans">
      <main className="mx-auto max-w-6xl p-6 lg:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <button
              onClick={() => navigate('/instructor/dashboard')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
            >
              ← Kembali ke Dashboard
            </button>
            <h1 className="text-2xl font-bold text-zinc-900 mt-2">Leaderboard Quiz</h1>
            <p className="text-sm text-zinc-500 mt-1">
              {courseTitle ? `${courseTitle} • ` : ''}
              {quiz?.title || 'Memuat data quiz...'}
            </p>
          </div>

          {quiz && (
            <button
              onClick={() => loadData(true)}
              className="w-fit text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl transition-colors shadow-sm shadow-emerald-600/15"
            >
              {refreshing ? 'Memuat...' : 'Muat Ulang'}
            </button>
          )}
        </div>

        {loading ? (
          <div className="bg-white/90 border border-emerald-100 rounded-2xl p-10 text-center shadow-[0_14px_40px_rgba(16,185,129,0.08)]">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-zinc-500">Memuat leaderboard...</p>
          </div>
        ) : !quiz ? (
          <div className="bg-white/90 border border-emerald-100 rounded-2xl p-10 text-center shadow-[0_14px_40px_rgba(16,185,129,0.08)]">
            <p className="text-sm text-zinc-500">Leaderboard tidak ditemukan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-5">
            <section className="space-y-4">
              <div className="bg-white/90 border border-emerald-100 rounded-2xl p-6 shadow-[0_14px_40px_rgba(16,185,129,0.08)]">
                <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Ringkasan Quiz</p>
                <h2 className="text-xl font-bold text-emerald-900 mt-1">{quiz.title}</h2>
                <p className="text-sm text-zinc-500 mt-2">{quiz.questions?.length || 0} soal • {Math.round((quiz.duration_secs || 0) / 60)} menit</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/90 border border-emerald-100 rounded-2xl p-5 shadow-[0_14px_40px_rgba(16,185,129,0.08)]">
                  <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Peserta</p>
                  <p className="text-3xl font-extrabold text-zinc-800 mt-2">{entries.length}</p>
                </div>
                <div className="bg-white/90 border border-emerald-100 rounded-2xl p-5 shadow-[0_14px_40px_rgba(16,185,129,0.08)]">
                  <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Skor Maks</p>
                  <p className="text-3xl font-extrabold text-zinc-800 mt-2">{totalPoints}</p>
                </div>
              </div>
            </section>

            <section className="bg-white/90 border border-emerald-100 rounded-2xl p-6 shadow-[0_14px_40px_rgba(16,185,129,0.08)]">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Peringkat</p>
                  <h3 className="text-lg font-bold text-emerald-900 mt-1">Top 10 Siswa</h3>
                </div>
              </div>

              {entries.length === 0 ? (
                <p className="text-sm text-zinc-400 text-center py-10">Belum ada skor pada quiz ini.</p>
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
                          <p className="text-[10px] text-zinc-400">{entry.percentage}% • {Math.round((entry.time_taken || 0) / 60)}m</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-emerald-700">{entry.total_score}/{entry.max_score ?? totalPoints}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}