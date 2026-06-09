import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { laravelAPI, nodeAPI } from '../lib/api';

// ─── Reusable Modal wrapper ───────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white/95 backdrop-blur-xl border border-emerald-100 w-full max-w-lg rounded-2xl shadow-[0_24px_60px_rgba(16,185,129,0.14)] relative" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-100">
          <h3 className="font-bold text-emerald-900 text-base">{title}</h3>
          <button onClick={onClose} className="text-emerald-400 hover:text-emerald-700 text-xl leading-none">×</button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

// ─── Shared input/label styles ────────────────────────────────────────────────
const inp = "w-full bg-white border border-emerald-100 rounded-xl px-3.5 py-2.5 text-sm text-emerald-900 placeholder-zinc-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 transition-all";
const lbl = "block text-emerald-700 text-xs font-semibold mb-1.5";
const btnPrimary = "bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors shadow-sm shadow-emerald-600/15";
const btnSecondary = "bg-white hover:bg-emerald-50 text-emerald-700 font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors border border-emerald-100";
const btnDanger = "bg-white hover:bg-red-50 text-red-500 hover:text-red-600 border border-red-200 font-semibold text-xs px-3 py-1.5 rounded-lg transition-colors";

export default function InstructorDashboard() {
  const navigate = useNavigate();
  const [courses, setCourses]             = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [materials, setMaterials]         = useState([]);
  const [quizzes, setQuizzes]             = useState([]);
  const [selectedQuiz, setSelectedQuiz]   = useState(null);
  const [loading, setLoading]             = useState(true);
  const [activeTab, setActiveTab]         = useState('courses');
  const [analytics, setAnalytics]         = useState({
    total_courses: 0,
    total_quizzes: 0,
    total_students: 0,
    total_submissions: 0,
    average_score: 0,
    completion_rate: 0,
    top_quiz: null,
    recent_submissions: [],
  });

  const [courseModal, setCourseModal]     = useState({ open: false, mode: 'create', data: null });
  const [materialModal, setMaterialModal] = useState({ open: false, mode: 'create', data: null });
  const [quizModal, setQuizModal]         = useState({ open: false, mode: 'create', data: null });
  const [questionModal, setQuestionModal] = useState({ open: false, mode: 'create', idx: null, data: null });

  const [courseForm, setCourseForm]       = useState({ title: '', description: '', category: 'Pemrograman', level: 'pemula', is_published: true, thumbnail: '' });
  const [materialForm, setMaterialForm]   = useState({ title: '', type: 'video', content: '', video_url: '' });
  const [quizForm, setQuizForm]           = useState({ title: '', duration_mins: 15 });
  const [questionForm, setQuestionForm]   = useState({ question: '', optionA: '', optionB: '', optionC: '', optionD: '', correct_index: 0, points: 10 });

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchCourses = async () => {
    try {
      const res = await laravelAPI.get('/courses?my_taught_courses=1');
      const courseData = res.data.data || [];
      setCourses(courseData);

      if (courseData.length > 0) {
        const courseIds = courseData.map(course => course.id).join(',');
        const analyticsRes = await nodeAPI.get(`/submissions/analytics/instructor?course_ids=${courseIds}`);
        setAnalytics(analyticsRes.data);
      } else {
        setAnalytics({
          total_courses: 0,
          total_quizzes: 0,
          total_students: 0,
          total_submissions: 0,
          average_score: 0,
          completion_rate: 0,
          top_quiz: null,
          recent_submissions: [],
        });
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCourses(); }, []);

  const handleLogout = () => { localStorage.clear(); navigate('/login'); };

  // ── Course CRUD ──
  const openCourseCreate = () => {
    setCourseForm({ title: '', description: '', category: 'Pemrograman', level: 'pemula', is_published: true, thumbnail: '' });
    setCourseModal({ open: true, mode: 'create', data: null });
  };
  const openCourseEdit = (c) => {
    setCourseForm({ title: c.title, description: c.description, category: c.category, level: c.level, is_published: !!c.is_published, thumbnail: c.thumbnail || '' });
    setCourseModal({ open: true, mode: 'edit', data: c });
  };
  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    try {
      courseModal.mode === 'create'
        ? await laravelAPI.post('/courses', courseForm)
        : await laravelAPI.put(`/courses/${courseModal.data.id}`, courseForm);
      setCourseModal({ open: false, mode: 'create', data: null });
      fetchCourses();
    } catch { alert('Gagal menyimpan kursus.'); }
  };
  const handleCourseDelete = async (id) => {
    if (!window.confirm('Hapus kursus beserta seluruh materinya?')) return;
    try {
      await laravelAPI.delete(`/courses/${id}`);
      if (selectedCourse?.id === id) { setSelectedCourse(null); setMaterials([]); setQuizzes([]); }
      fetchCourses();
    } catch { alert('Gagal menghapus kursus.'); }
  };

  const selectCourse = async (course) => {
    setSelectedCourse(course); setSelectedQuiz(null); setLoading(true);
    try {
      const [matRes, quizRes] = await Promise.all([
        laravelAPI.get(`/courses/${course.id}`),
        nodeAPI.get(`/quizzes/course/${course.id}`),
      ]);
      setMaterials(matRes.data.materials || []);
      setQuizzes(quizRes.data || []);
      setActiveTab('materials');
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  // ── Material CRUD ──
  const openMaterialCreate = () => {
    setMaterialForm({ title: '', type: 'video', content: '', video_url: '' });
    setMaterialModal({ open: true, mode: 'create', data: null });
  };
  const openMaterialEdit = (m) => {
    setMaterialForm({ title: m.title, type: m.type, content: m.content || '', video_url: m.video_url || '' });
    setMaterialModal({ open: true, mode: 'edit', data: m });
  };
  const handleMaterialSubmit = async (e) => {
    e.preventDefault();
    try {
      materialModal.mode === 'create'
        ? await laravelAPI.post(`/courses/${selectedCourse.id}/materials`, materialForm)
        : await laravelAPI.put(`/materials/${materialModal.data.id}`, materialForm);
      setMaterialModal({ open: false, mode: 'create', data: null });
      const matRes = await laravelAPI.get(`/courses/${selectedCourse.id}`);
      setMaterials(matRes.data.materials || []);
    } catch { alert('Gagal menyimpan materi.'); }
  };
  const handleMaterialDelete = async (id) => {
    if (!window.confirm('Hapus materi ini?')) return;
    try { await laravelAPI.delete(`/materials/${id}`); setMaterials(p => p.filter(m => m.id !== id)); }
    catch { alert('Gagal menghapus materi.'); }
  };

  // ── Quiz CRUD ──
  const openQuizCreate = () => { setQuizForm({ title: '', duration_mins: 15 }); setQuizModal({ open: true, mode: 'create', data: null }); };
  const openQuizEdit   = (q) => { setQuizForm({ title: q.title, duration_mins: Math.round(q.duration_secs / 60) }); setQuizModal({ open: true, mode: 'edit', data: q }); };
  const handleQuizSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { title: quizForm.title, duration_secs: quizForm.duration_mins * 60, course_id: selectedCourse.id };
      quizModal.mode === 'create' ? await nodeAPI.post('/quizzes', payload) : await nodeAPI.put(`/quizzes/${quizModal.data._id}`, payload);
      setQuizModal({ open: false, mode: 'create', data: null });
      const quizRes = await nodeAPI.get(`/quizzes/course/${selectedCourse.id}`);
      setQuizzes(quizRes.data || []);
    } catch { alert('Gagal menyimpan kuis.'); }
  };
  const handleQuizDelete = async (id) => {
    if (!window.confirm('Hapus kuis ini?')) return;
    try { await nodeAPI.delete(`/quizzes/${id}`); setQuizzes(p => p.filter(q => q._id !== id)); if (selectedQuiz?._id === id) setSelectedQuiz(null); }
    catch { alert('Gagal menghapus kuis.'); }
  };

  // ── Question CRUD ──
  const openQuestionCreate = () => {
    setQuestionForm({ question: '', optionA: '', optionB: '', optionC: '', optionD: '', correct_index: 0, points: 10 });
    setQuestionModal({ open: true, mode: 'create', idx: null, data: null });
  };
  const openQuestionEdit = (q, idx) => {
    setQuestionForm({ question: q.question, optionA: q.options[0]||'', optionB: q.options[1]||'', optionC: q.options[2]||'', optionD: q.options[3]||'', correct_index: q.correct_index, points: q.points || 10 });
    setQuestionModal({ open: true, mode: 'edit', idx, data: q });
  };
  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    try {
      const newQ = { question: questionForm.question, options: [questionForm.optionA, questionForm.optionB, questionForm.optionC, questionForm.optionD], correct_index: Number(questionForm.correct_index), points: Number(questionForm.points) };
      const nextQs = [...(selectedQuiz.questions || [])];
      questionModal.mode === 'create' ? nextQs.push(newQ) : (nextQs[questionModal.idx] = newQ);
      const updated = await nodeAPI.put(`/quizzes/${selectedQuiz._id}`, { questions: nextQs });
      setSelectedQuiz(updated.data);
      setQuizzes(p => p.map(q => q._id === selectedQuiz._id ? updated.data : q));
      setQuestionModal({ open: false, mode: 'create', idx: null, data: null });
    } catch { alert('Gagal menyimpan soal.'); }
  };
  const handleQuestionDelete = async (idx) => {
    if (!window.confirm('Hapus soal ini?')) return;
    try {
      const nextQs = selectedQuiz.questions.filter((_, i) => i !== idx);
      const updated = await nodeAPI.put(`/quizzes/${selectedQuiz._id}`, { questions: nextQs });
      setSelectedQuiz(updated.data);
      setQuizzes(p => p.map(q => q._id === selectedQuiz._id ? updated.data : q));
    } catch { alert('Gagal menghapus soal.'); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 font-sans flex h-screen overflow-hidden">

      {/* Sidebar */}
      <aside className="w-64 bg-emerald-700 text-white border-r border-emerald-800/30 flex flex-col flex-shrink-0 shadow-[0_20px_50px_rgba(4,120,87,0.18)]">
        <div className="p-5 border-b border-white/15">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center text-white font-bold ring-1 ring-white/15">👨‍🏫</div>
            <span className="font-extrabold text-white text-sm">Instructor Hub</span>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          <button
            onClick={() => { setSelectedCourse(null); setSelectedQuiz(null); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              !selectedCourse ? 'bg-white text-emerald-700 font-semibold shadow-sm' : 'text-emerald-50/85 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span>📚</span> Semua Kursus
          </button>

          {selectedCourse && (
            <div className="pt-3 mt-3 border-t border-white/15 space-y-0.5">
              <p className="text-[10px] text-emerald-50/70 font-bold uppercase px-3 mb-1 truncate">
                📂 {selectedCourse.title}
              </p>
              {[
                { id: 'materials', label: '📄 Manajemen Materi' },
                { id: 'quizzes',   label: '✏️ Manajemen Kuis' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => { setActiveTab(t.id); setSelectedQuiz(null); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    activeTab === t.id && !selectedQuiz
                      ? 'bg-white text-emerald-700 font-semibold shadow-sm'
                      : 'text-emerald-50/85 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-white/15">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-white/15 text-white font-bold rounded-full flex items-center justify-center text-xs flex-shrink-0 ring-1 ring-white/15">
              {user.name?.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{user.name}</p>
              <p className="text-[10px] text-emerald-50/80 capitalize">{user.role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full bg-white/10 hover:bg-white text-white hover:text-emerald-700 text-xs py-2 rounded-lg border border-white/15 hover:border-white transition-all">
            Keluar
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-gradient-to-br from-white via-emerald-50/40 to-white">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-zinc-500">Memuat data...</p>
            </div>
          </div>
        ) : !selectedCourse ? (

          /* ── SEMUA KURSUS ── */
          <div className="space-y-6 max-w-5xl">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-zinc-900">Kelas Saya</h1>
                <p className="text-zinc-500 text-sm mt-1">Kelola silabus, materi, dan kuis kelas Anda.</p>
              </div>
              <button onClick={openCourseCreate} className={`${btnPrimary} flex items-center gap-2`}>
                + Tambah Kelas
              </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Kelas Aktif', value: analytics.total_courses, tone: 'text-emerald-600 bg-emerald-50' },
                { label: 'Total Kuis', value: analytics.total_quizzes, tone: 'text-teal-600 bg-teal-50' },
                { label: 'Siswa Unik', value: analytics.total_students, tone: 'text-amber-600 bg-amber-50' },
                { label: 'Rata-rata Nilai', value: `${analytics.average_score}%`, tone: 'text-violet-600 bg-violet-50' },
              ].map(card => (
                <div key={card.label} className="bg-white/90 border border-emerald-100 rounded-2xl p-5 shadow-[0_14px_40px_rgba(16,185,129,0.08)]">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold ${card.tone}`}>★</div>
                  <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider mt-3">{card.label}</p>
                  <p className="text-2xl font-extrabold text-zinc-800 mt-1">{card.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="bg-white/90 border border-emerald-100 rounded-2xl p-5 shadow-[0_14px_40px_rgba(16,185,129,0.08)] lg:col-span-2">
                <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Ringkasan Kinerja</p>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
                    <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wider">Completion Rate</p>
                    <p className="text-3xl font-extrabold text-emerald-700 mt-1">{analytics.completion_rate}%</p>
                  </div>
                  <div className="rounded-2xl bg-teal-50 border border-teal-100 p-4">
                    <p className="text-xs text-teal-600 font-semibold uppercase tracking-wider">Total Submissions</p>
                    <p className="text-3xl font-extrabold text-teal-700 mt-1">{analytics.total_submissions}</p>
                  </div>
                </div>
                <div className="mt-4 rounded-2xl border border-zinc-100 bg-zinc-50 p-4">
                  <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Kuis Terbaik</p>
                  <p className="text-sm font-bold text-zinc-800 mt-1">
                    {analytics.top_quiz ? analytics.top_quiz.title : 'Belum ada data kuis'}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">
                    {analytics.top_quiz
                      ? `Rata-rata ${analytics.top_quiz.average_score}% dari ${analytics.top_quiz.attempts} percobaan`
                      : 'Setelah siswa mengerjakan kuis, ringkasan ini akan tampil di sini.'}
                  </p>
                </div>

                <div className="mt-4 rounded-2xl border border-emerald-100 bg-white p-4">
                  <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Leaderboard Kuis</p>
                  <div className="mt-3 space-y-2">
                    {quizzes.length > 0 ? quizzes.map(q => (
                      <div key={q._id} className="flex items-center justify-between gap-3 rounded-xl border border-zinc-100 bg-zinc-50 px-3 py-2">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-zinc-800 truncate">{q.title}</p>
                          <p className="text-[10px] text-zinc-400">{q.questions?.length || 0} soal</p>
                        </div>
                        <button
                          onClick={() => navigate(`/instructor/leaderboard/${q._id}`)}
                          className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold px-3 py-1.5 rounded-lg border border-emerald-200 transition-all"
                        >
                          Lihat
                        </button>
                      </div>
                    )) : (
                      <p className="text-sm text-zinc-400 py-4 text-center">Belum ada kuis di kelas Anda.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white/90 border border-emerald-100 rounded-2xl p-5 shadow-[0_14px_40px_rgba(16,185,129,0.08)]">
                <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Aktivitas Terbaru</p>
                <div className="mt-4 space-y-3">
                  {analytics.recent_submissions.length > 0 ? analytics.recent_submissions.map(item => (
                    <div key={item._id} className="rounded-xl border border-zinc-100 bg-white p-3">
                      <p className="text-sm font-semibold text-zinc-800 line-clamp-1">{item.user_name || 'Siswa'}</p>
                      <p className="text-xs text-zinc-500 mt-1">Nilai {item.percentage}% • {item.total_score}/{item.max_score}</p>
                    </div>
                  )) : (
                    <p className="text-sm text-zinc-400">Belum ada pengumpulan kuis.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {courses.map(c => (
                <div key={c.id} className="bg-white/90 border border-emerald-100 rounded-2xl overflow-hidden shadow-[0_14px_40px_rgba(16,185,129,0.08)] hover:border-emerald-300 hover:shadow-[0_18px_50px_rgba(16,185,129,0.14)] transition-all duration-300">
                  <div className="h-1 w-full bg-teal-500" />
                  <div className="p-5">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <h3 className="font-bold text-zinc-800 text-sm leading-snug line-clamp-1">{c.title}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-semibold flex-shrink-0 ${
                        c.is_published ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-100 text-zinc-500'
                      }`}>
                        {c.is_published ? 'Publik' : 'Draft'}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 line-clamp-2">{c.description}</p>

                    <div className="flex justify-between items-center pt-4 mt-4 border-t border-zinc-100">
                      <div className="flex gap-1.5">
                        <button onClick={() => openCourseEdit(c)} title="Edit" className="p-1.5 hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 rounded-lg transition-colors text-sm">✏️</button>
                        <button onClick={() => handleCourseDelete(c.id)} title="Hapus" className="p-1.5 hover:bg-red-50 text-zinc-400 hover:text-red-500 rounded-lg transition-colors text-sm">🗑️</button>
                      </div>
                      <button onClick={() => selectCourse(c)} className="text-xs bg-teal-50 hover:bg-teal-100 text-teal-700 font-semibold px-3 py-1.5 rounded-lg border border-teal-200 transition-all">
                        Kelola →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {courses.length === 0 && (
                <div className="col-span-full border border-dashed border-emerald-200 bg-white p-14 rounded-2xl text-center">
                  <p className="text-zinc-400 text-sm mb-3">Belum ada kelas. Buat kelas pertama Anda!</p>
                  <button onClick={openCourseCreate} className={btnPrimary}>+ Buat Kelas</button>
                </div>
              )}
            </div>
          </div>

        ) : (

          /* ── DETAIL KURSUS ── */
          <div className="space-y-6 max-w-4xl">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs text-emerald-600 font-semibold uppercase tracking-wide">{selectedCourse.category}</span>
                <h1 className="text-2xl font-bold text-emerald-950">{selectedCourse.title}</h1>
              </div>
              <button onClick={() => { setSelectedCourse(null); setSelectedQuiz(null); }} className={btnSecondary}>
                ← Kembali
              </button>
            </div>

            {/* ── MATERI ── */}
            {activeTab === 'materials' && (
              <div className="bg-white/90 border border-emerald-100 rounded-2xl overflow-hidden shadow-[0_14px_40px_rgba(16,185,129,0.08)]">
                <div className="flex justify-between items-center px-6 py-4 border-b border-emerald-100">
                  <h2 className="font-bold text-emerald-900">Silabus Pembelajaran</h2>
                  <button onClick={openMaterialCreate} className={`${btnPrimary} text-xs py-2`}>+ Tambah Materi</button>
                </div>
                <div className="divide-y divide-emerald-100">
                  {materials.map(m => (
                    <div key={m.id} className="flex items-center justify-between px-6 py-4 hover:bg-zinc-50 transition-colors">
                      <div className="flex items-center gap-4 min-w-0">
                        <span className="text-xl flex-shrink-0">{m.type === 'video' ? '📺' : '📄'}</span>
                        <div className="truncate">
                          <p className="text-sm font-semibold text-zinc-700">{m.title}</p>
                          <p className="text-xs text-zinc-400 capitalize mt-0.5">Materi {m.order} • {m.type}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => openMaterialEdit(m)} className="text-xs bg-zinc-100 hover:bg-zinc-200 text-zinc-600 px-3 py-1.5 rounded-lg border border-zinc-200 font-semibold transition-colors">Edit</button>
                        <button onClick={() => handleMaterialDelete(m.id)} className={btnDanger}>Hapus</button>
                      </div>
                    </div>
                  ))}
                  {materials.length === 0 && (
                    <p className="text-center text-zinc-400 text-sm py-10">Belum ada materi di kelas ini.</p>
                  )}
                </div>
              </div>
            )}

            {/* ── KUIS LIST ── */}
            {activeTab === 'quizzes' && !selectedQuiz && (
              <div className="bg-white/90 border border-emerald-100 rounded-2xl overflow-hidden shadow-[0_14px_40px_rgba(16,185,129,0.08)]">
                <div className="flex justify-between items-center px-6 py-4 border-b border-emerald-100">
                  <h2 className="font-bold text-emerald-900">Evaluasi Kuis</h2>
                  <button onClick={openQuizCreate} className={`${btnPrimary} text-xs py-2`}>+ Buat Kuis</button>
                </div>
                <div className="divide-y divide-emerald-100">
                  {quizzes.map(q => (
                    <div key={q._id} className="flex items-center justify-between px-6 py-4 hover:bg-zinc-50 transition-colors">
                      <div>
                        <p className="text-sm font-semibold text-zinc-700">{q.title}</p>
                        <p className="text-xs text-zinc-400 mt-0.5">⏱ {Math.round(q.duration_secs / 60)} menit • {q.questions?.length || 0} soal</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setSelectedQuiz(q)} className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg font-semibold transition-all">
                          Kelola Soal ({q.questions?.length || 0}) →
                        </button>
                        <button onClick={() => openQuizEdit(q)} className="text-xs bg-zinc-100 hover:bg-zinc-200 text-zinc-600 px-3 py-1.5 rounded-lg border border-zinc-200 font-semibold transition-colors">Edit</button>
                        <button onClick={() => handleQuizDelete(q._id)} className={btnDanger}>Hapus</button>
                      </div>
                    </div>
                  ))}
                  {quizzes.length === 0 && (
                    <p className="text-center text-zinc-400 text-sm py-10">Belum ada kuis di kelas ini.</p>
                  )}
                </div>
              </div>
            )}

            {/* ── EDITOR SOAL ── */}
            {activeTab === 'quizzes' && selectedQuiz && (
              <div className="space-y-5">
                <div className="bg-white/90 border border-emerald-100 rounded-2xl px-6 py-4 flex justify-between items-center shadow-[0_14px_40px_rgba(16,185,129,0.08)]">
                  <div>
                    <span className="text-xs text-emerald-600 font-semibold uppercase">Editor Soal</span>
                    <h2 className="font-bold text-emerald-900 text-lg">{selectedQuiz.title}</h2>
                    <p className="text-xs text-zinc-400">Durasi: {Math.round(selectedQuiz.duration_secs / 60)} menit</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setSelectedQuiz(null)} className={btnSecondary}>← Kembali</button>
                    <button onClick={openQuestionCreate} className={btnPrimary}>+ Tambah Soal</button>
                  </div>
                </div>

                <div className="bg-white/90 border border-emerald-100 rounded-2xl divide-y divide-emerald-100 shadow-[0_14px_40px_rgba(16,185,129,0.08)]">
                  {selectedQuiz.questions?.map((q, idx) => (
                    <div key={idx} className="p-6 space-y-3">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex gap-3 min-w-0">
                          <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {idx + 1}
                          </span>
                          <p className="text-sm font-semibold text-zinc-700 leading-relaxed">{q.question}</p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button onClick={() => openQuestionEdit(q, idx)} className="text-xs bg-zinc-100 hover:bg-zinc-200 text-zinc-600 px-2.5 py-1.5 rounded-lg border border-zinc-200 font-semibold transition-colors">Edit</button>
                          <button onClick={() => handleQuestionDelete(idx)} className={btnDanger}>Hapus</button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pl-9">
                        {q.options?.map((opt, oIdx) => {
                          const isCorrect = oIdx === q.correct_index;
                          return (
                            <div key={oIdx} className={`p-3 rounded-xl border text-xs ${
                              isCorrect
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-medium'
                                : 'bg-zinc-50 border-zinc-200 text-zinc-500'
                            }`}>
                              <span className="font-bold mr-1.5">{String.fromCharCode(65 + oIdx)}.</span>
                              {opt}
                              {isCorrect && <span className="ml-2 text-[10px] text-emerald-500 font-bold">(Kunci)</span>}
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-xs text-zinc-400 pl-9">Bobot: {q.points || 10} poin</p>
                    </div>
                  ))}
                  {(!selectedQuiz.questions || selectedQuiz.questions.length === 0) && (
                    <p className="text-center text-zinc-400 text-sm py-10">Belum ada soal. Klik "+ Tambah Soal".</p>
                  )}
                </div>

                <div className="bg-white/90 border border-emerald-100 rounded-2xl p-6 shadow-[0_14px_40px_rgba(16,185,129,0.08)] flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Leaderboard Quiz</p>
                    <h3 className="text-lg font-bold text-emerald-900 mt-1">Lihat peringkat siswa untuk quiz ini</h3>
                    <p className="text-sm text-zinc-500 mt-1">Halaman leaderboard sekarang terpisah dari dashboard.</p>
                  </div>
                  <button
                    onClick={() => navigate(`/instructor/leaderboard/${selectedQuiz._id}`)}
                    className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm shadow-emerald-600/15"
                  >
                    Buka Leaderboard
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ─── MODALS ─────────────────────────────────────────────────────────── */}

      {/* Course Modal */}
      {courseModal.open && (
        <Modal title={courseModal.mode === 'create' ? 'Buat Kelas Baru' : 'Edit Kelas'} onClose={() => setCourseModal({ open: false, mode: 'create', data: null })}>
          <form onSubmit={handleCourseSubmit} className="space-y-4">
            <div><label className={lbl}>Judul Kelas</label>
              <input type="text" required value={courseForm.title} onChange={e => setCourseForm({...courseForm, title: e.target.value})} placeholder="Contoh: Belajar Next.js Dasar" className={inp} />
            </div>
            <div><label className={lbl}>Deskripsi Singkat</label>
              <textarea required rows={3} value={courseForm.description} onChange={e => setCourseForm({...courseForm, description: e.target.value})} placeholder="Deskripsikan isi kelas ini..." className={inp} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className={lbl}>Kategori</label>
                <input type="text" required value={courseForm.category} onChange={e => setCourseForm({...courseForm, category: e.target.value})} className={inp} />
              </div>
              <div><label className={lbl}>Tingkat</label>
                <select value={courseForm.level} onChange={e => setCourseForm({...courseForm, level: e.target.value})} className={inp}>
                  <option value="pemula">Pemula</option>
                  <option value="menengah">Menengah</option>
                  <option value="lanjutan">Lanjutan</option>
                </select>
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={courseForm.is_published} onChange={e => setCourseForm({...courseForm, is_published: e.target.checked})} className="rounded border-zinc-300 text-teal-600 focus:ring-teal-500" />
              <span className="text-sm text-zinc-600">Publikasikan kelas</span>
            </label>
            <div className="flex justify-end gap-3 pt-3 border-t border-zinc-100">
              <button type="button" onClick={() => setCourseModal({ open: false, mode: 'create', data: null })} className={btnSecondary}>Batal</button>
              <button type="submit" className={btnPrimary}>Simpan</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Material Modal */}
      {materialModal.open && (
        <Modal title={materialModal.mode === 'create' ? 'Tambah Materi' : 'Edit Materi'} onClose={() => setMaterialModal({ open: false, mode: 'create', data: null })}>
          <form onSubmit={handleMaterialSubmit} className="space-y-4">
            <div><label className={lbl}>Judul Materi</label>
              <input type="text" required value={materialForm.title} onChange={e => setMaterialForm({...materialForm, title: e.target.value})} placeholder="Contoh: Pengenalan State Management" className={inp} />
            </div>
            <div><label className={lbl}>Tipe Konten</label>
              <select value={materialForm.type} onChange={e => setMaterialForm({...materialForm, type: e.target.value})} className={inp}>
                <option value="video">📺 Video (YouTube)</option>
                <option value="text">📄 Artikel / Tulisan</option>
                <option value="pdf">📂 Dokumen PDF</option>
              </select>
            </div>
            {materialForm.type === 'video' && (
              <div><label className={lbl}>URL Video YouTube</label>
                <input type="url" required value={materialForm.video_url} onChange={e => setMaterialForm({...materialForm, video_url: e.target.value})} placeholder="https://www.youtube.com/watch?v=..." className={inp} />
              </div>
            )}
            <div><label className={lbl}>Konten / Ringkasan</label>
              <textarea rows={4} value={materialForm.content} onChange={e => setMaterialForm({...materialForm, content: e.target.value})} placeholder="Tuliskan deskripsi materi..." className={inp} />
            </div>
            <div className="flex justify-end gap-3 pt-3 border-t border-zinc-100">
              <button type="button" onClick={() => setMaterialModal({ open: false, mode: 'create', data: null })} className={btnSecondary}>Batal</button>
              <button type="submit" className={btnPrimary}>Simpan</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Quiz Modal */}
      {quizModal.open && (
        <Modal title={quizModal.mode === 'create' ? 'Buat Kuis Baru' : 'Edit Kuis'} onClose={() => setQuizModal({ open: false, mode: 'create', data: null })}>
          <form onSubmit={handleQuizSubmit} className="space-y-4">
            <div><label className={lbl}>Judul Kuis</label>
              <input type="text" required value={quizForm.title} onChange={e => setQuizForm({...quizForm, title: e.target.value})} placeholder="Contoh: Evaluasi Bab 1" className={inp} />
            </div>
            <div><label className={lbl}>Durasi (menit)</label>
              <input type="number" required min={1} value={quizForm.duration_mins} onChange={e => setQuizForm({...quizForm, duration_mins: Number(e.target.value)})} className={inp} />
            </div>
            <div className="flex justify-end gap-3 pt-3 border-t border-zinc-100">
              <button type="button" onClick={() => setQuizModal({ open: false, mode: 'create', data: null })} className={btnSecondary}>Batal</button>
              <button type="submit" className={btnPrimary}>Simpan</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Question Modal */}
      {questionModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white border border-zinc-200 w-full max-w-lg rounded-2xl shadow-xl my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
              <h3 className="font-bold text-zinc-800">{questionModal.mode === 'create' ? 'Tambah Soal' : 'Edit Soal'}</h3>
              <button onClick={() => setQuestionModal({ open: false, mode: 'create', idx: null, data: null })} className="text-zinc-400 hover:text-zinc-600 text-xl">×</button>
            </div>
            <div className="px-6 py-5">
              <form onSubmit={handleQuestionSubmit} className="space-y-4">
                <div><label className={lbl}>Pertanyaan</label>
                  <textarea required rows={3} value={questionForm.question} onChange={e => setQuestionForm({...questionForm, question: e.target.value})} placeholder="Ketik soal kuis di sini..." className={inp} />
                </div>
                <div className="space-y-2">
                  <label className={lbl}>Pilihan Jawaban</label>
                  {['A', 'B', 'C', 'D'].map((letter, i) => {
                    const key = `option${letter}`;
                    return (
                      <div key={letter} className="flex items-center gap-3">
                        <span className="text-xs font-bold text-zinc-500 w-4">{letter}.</span>
                        <input type="text" required value={questionForm[key]} onChange={e => setQuestionForm({...questionForm, [key]: e.target.value})} className={inp} />
                      </div>
                    );
                  })}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={lbl}>Kunci Jawaban</label>
                    <select value={questionForm.correct_index} onChange={e => setQuestionForm({...questionForm, correct_index: e.target.value})} className={inp}>
                      {['A','B','C','D'].map((l,i) => <option key={l} value={i}>{l}</option>)}
                    </select>
                  </div>
                  <div><label className={lbl}>Bobot Poin</label>
                    <input type="number" required min={1} value={questionForm.points} onChange={e => setQuestionForm({...questionForm, points: Number(e.target.value)})} className={inp} />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-3 border-t border-zinc-100">
                  <button type="button" onClick={() => setQuestionModal({ open: false, mode: 'create', idx: null, data: null })} className={btnSecondary}>Batal</button>
                  <button type="submit" className={btnPrimary}>Simpan Soal</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
