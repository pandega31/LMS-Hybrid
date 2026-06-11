import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { nodeAPI } from '../lib/api';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001');

function Panel({ children, className = '' }) {
  return (
    <div className={`bg-white/90 backdrop-blur-xl border border-emerald-100 rounded-3xl shadow-[0_18px_50px_rgba(16,185,129,0.08)] ${className}`}>
      {children}
    </div>
  );
}

export default function QuizPage({ quizId, userId, userName }) {
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [result, setResult] = useState(null);
  const [leaderboard, setLB] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    nodeAPI.get(`/quizzes/${quizId}`).then(r => {
      setQuiz(r.data);
      setTimeLeft(r.data.duration_secs);
      setAnswers(new Array(r.data.questions.length).fill(null));
    }).catch(err => {
      console.error(err);
      alert('Gagal memuat kuis');
      navigate('/dashboard');
    });

    socket.emit('join_quiz', quizId);

    nodeAPI.get(`/leaderboard/${quizId}`).then(r => {
      setLB(r.data);
    }).catch(err => console.error(err));

    socket.on('leaderboard_updated', (board) => {
      setLB(board);
    });

    return () => {
      socket.off('leaderboard_updated');
    };
  }, [quizId, navigate]);

  useEffect(() => {
    if (!quiz || result) return;
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(t);
          submitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [quiz, result]);

  const submitQuiz = useCallback(async () => {
    if (isSubmitting || !quiz) return;
    setIsSubmitting(true);
    try {
      const timeTaken = quiz.duration_secs - timeLeft;
      const res = await nodeAPI.post('/submissions', {
        quiz_id: quizId,
        user_id: userId,
        user_name: userName,
        answers,
        time_taken: timeTaken
      });
      setResult(res.data);
      socket.emit('quiz_completed', { quizId });
    } catch (err) {
      console.error('Error submitting quiz:', err);
      alert('Gagal mengirim jawaban');
    } finally {
      setIsSubmitting(false);
    }
  }, [answers, quizId, userId, userName, timeLeft, quiz, isSubmitting]);

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 flex items-center justify-center">
        <div className="text-center bg-white/90 backdrop-blur-xl border border-emerald-100 rounded-3xl px-8 py-10 shadow-[0_18px_50px_rgba(16,185,129,0.08)]">
          <div className="w-10 h-10 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-emerald-700/70">Menyiapkan kuis...</p>
        </div>
      </div>
    );
  }

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const isTimeCritical = timeLeft < 60;

  if (result) {
    const questionsReviewed = result.quiz_questions || quiz.questions;
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 text-emerald-950 font-sans p-4 md:p-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Panel className="p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
              <h2 className="text-2xl font-black text-emerald-950 mb-6">Hasil Ujian Anda</h2>

              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-32 h-32 rounded-full border-4 border-emerald-500 flex flex-col items-center justify-center bg-emerald-50 shadow-lg shadow-emerald-500/10">
                  <span className="text-3xl font-black text-emerald-900">{result.percentage}%</span>
                  <span className="text-[10px] text-emerald-600 font-semibold uppercase tracking-[0.2em] mt-1">Persentase</span>
                </div>

                <div className="space-y-2 text-center md:text-left">
                  <p className="text-emerald-700/70 text-sm">Anda telah menyelesaikan <span className="font-semibold text-emerald-950">{quiz.title}</span>.</p>
                  <p className="text-emerald-700/70 text-sm">Skor Akhir: <span className="font-bold text-emerald-600">{result.total_score}</span> dari total maksimal <span className="font-bold text-emerald-950">{result.max_score}</span> poin.</p>
                  <p className="text-xs text-emerald-600/70">Waktu Pengerjaan: {Math.floor(result.time_taken / 60)}m {result.time_taken % 60}s</p>
                </div>
              </div>

              <div className="mt-8 text-center md:text-left">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors shadow-lg shadow-emerald-600/15"
                >
                  Kembali ke Dashboard
                </button>
              </div>
            </Panel>

            <Panel className="p-6 space-y-6">
              <h3 className="text-lg font-black text-emerald-950">Review Jawaban</h3>
              <div className="space-y-6 divide-y divide-emerald-100">
                {questionsReviewed.map((q, idx) => {
                  const subAns = result.answers[idx];
                  const chosenIdx = subAns?.chosen_index;
                  const isCorrect = subAns?.is_correct;
                  const correctIdx = q.correct_index;

                  return (
                    <div key={idx} className={`pt-6 ${idx === 0 ? 'pt-0' : ''} space-y-3`}>
                      <div className="flex items-start gap-3">
                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                          isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-red-50 text-red-600'
                        }`}>
                          {idx + 1}
                        </span>
                        <h4 className="text-sm font-semibold text-emerald-950 leading-relaxed">{q.question}</h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-9">
                        {q.options.map((opt, optIdx) => {
                          let optStyle = 'bg-white border-emerald-100 text-emerald-900/70';
                          if (optIdx === correctIdx) {
                            optStyle = 'bg-emerald-50 border-emerald-200 text-emerald-800 font-medium';
                          } else if (optIdx === chosenIdx && !isCorrect) {
                            optStyle = 'bg-red-50 border-red-200 text-red-700';
                          }

                          return (
                            <div key={optIdx} className={`p-3 rounded-xl border text-xs leading-relaxed flex items-center justify-between ${optStyle}`}>
                              <span>{opt}</span>
                              {optIdx === correctIdx && <span className="text-xs">✔️ Jawaban Benar</span>}
                              {optIdx === chosenIdx && !isCorrect && <span className="text-xs">❌ Pilihan Anda</span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Panel>
          </div>

          <div className="space-y-6">
            <Panel className="p-6 sticky top-24">
              <h3 className="font-black text-emerald-950 mb-4 text-sm tracking-[0.2em] uppercase">Papan Peringkat Kuis</h3>
              <div className="space-y-2.5">
                {leaderboard.map((boardUser, i) => {
                  const isMe = boardUser.user_name === userName;
                  return (
                    <div
                      key={i}
                      className={`flex justify-between items-center p-3 rounded-2xl border transition-all ${
                        isMe
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                          : 'bg-white border-emerald-100 text-emerald-900/80'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          i === 0 ? 'bg-amber-400 text-slate-900' : i === 1 ? 'bg-slate-300 text-slate-900' : i === 2 ? 'bg-amber-700 text-white' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {i + 1}
                        </span>
                        <span className="text-xs font-semibold truncate">{boardUser.user_name}</span>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-xs font-bold text-emerald-600">{boardUser.total_score} pts</span>
                        <p className="text-[8px] text-emerald-600/50 mt-0.5">{Math.round(boardUser.time_taken)}s</p>
                      </div>
                    </div>
                  );
                })}
                {leaderboard.length === 0 && (
                  <p className="text-emerald-600/60 text-xs text-center py-6">Belum ada papan peringkat.</p>
                )}
              </div>
            </Panel>
          </div>
        </div>
      </div>
    );
  }

  const activeQuestion = quiz.questions[current];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 text-emerald-950 font-sans flex flex-col">
      <header className="bg-white/85 backdrop-blur-xl border-b border-emerald-100 px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="min-w-0">
          <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-[0.24em]">Lembar Pengerjaan Kuis</span>
          <h1 className="text-sm font-black text-emerald-950 leading-tight mt-0.5 truncate max-w-sm md:max-w-md">{quiz.title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
            isTimeCritical
              ? 'bg-red-50 border-red-200 text-red-700 animate-pulse'
              : 'bg-emerald-50 border-emerald-100 text-emerald-700'
          }`}>
            <span className="text-sm">⏱️</span>
            <span className="text-sm font-bold tracking-widest">{mins}:{secs.toString().padStart(2, '0')}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        <Panel className="lg:col-span-3 p-6 space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-emerald-100">
            <span className="text-xs text-emerald-600 font-semibold uppercase tracking-[0.2em]">Pertanyaan {current + 1} Dari {quiz.questions.length}</span>
            <span className="text-xs text-emerald-700/70 font-medium">Poin: {activeQuestion.points}</span>
          </div>

          <h3 className="text-lg font-bold text-emerald-950 leading-relaxed">{activeQuestion.question}</h3>

          <div className="space-y-2.5">
            {activeQuestion.options.map((opt, i) => {
              const isSelected = answers[current] === i;
              return (
                <button
                  key={i}
                  onClick={() => {
                    const nextAnswers = [...answers];
                    nextAnswers[current] = i;
                    setAnswers(nextAnswers);
                  }}
                  className={`w-full text-left p-4 rounded-2xl border text-sm leading-relaxed transition-all flex items-center justify-between group ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-950 font-medium shadow-sm'
                      : 'bg-white border-emerald-100 hover:bg-emerald-50 text-emerald-900/75 hover:border-emerald-200'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold transition-colors ${
                      isSelected
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white border border-emerald-100 text-emerald-700 group-hover:bg-emerald-50'
                    }`}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span>{opt}</span>
                  </div>
                  {isSelected && <span className="text-emerald-600">⚡ Terpilih</span>}
                </button>
              );
            })}
          </div>

          <div className="flex justify-between items-center pt-6 border-t border-emerald-100">
            <button
              disabled={current === 0}
              onClick={() => setCurrent(c => c - 1)}
              className="px-5 py-2.5 bg-white hover:bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-xl border border-emerald-100 transition-colors disabled:opacity-30 disabled:pointer-events-none"
            >
              Sebelumnya
            </button>

            {current < quiz.questions.length - 1 ? (
              <button
                onClick={() => setCurrent(c => c + 1)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-600/15 transition-all"
              >
                Selanjutnya
              </button>
            ) : (
              <button
                onClick={() => {
                  if (answers.includes(null)) {
                    if (!window.confirm('Ada soal yang belum Anda jawab. Apakah Anda yakin ingin menyelesaikan kuis sekarang?')) return;
                  } else if (!window.confirm('Apakah Anda yakin ingin mengirim semua jawaban kuis?')) {
                    return;
                  }
                  submitQuiz();
                }}
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-600/15 transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Mengirim...' : 'Selesai & Kirim'}
              </button>
            )}
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel className="p-6">
            <h3 className="font-black text-emerald-950 mb-4 text-xs tracking-[0.2em] uppercase">Peta Soal</h3>
            <div className="grid grid-cols-5 gap-2.5">
              {quiz.questions.map((_, i) => {
                const isCurrent = current === i;
                const isAnswered = answers[i] !== null;

                let btnStyle = 'bg-white border-emerald-100 text-emerald-700';
                if (isCurrent) {
                  btnStyle = 'bg-emerald-600 text-white border-emerald-600 shadow-sm';
                } else if (isAnswered) {
                  btnStyle = 'bg-emerald-50 border-emerald-200 text-emerald-900';
                }

                return (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`h-9 rounded-xl border text-xs flex items-center justify-center transition-all ${btnStyle}`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </Panel>

          <Panel className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-emerald-950 text-xs tracking-[0.2em] uppercase">Papan Peringkat Kuis</h3>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>

            <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
              {leaderboard.map((boardUser, i) => (
                <div key={i} className="flex justify-between items-center p-2.5 bg-white border border-emerald-100 rounded-xl">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[10px] font-semibold text-emerald-700">#{i + 1}</span>
                    <span className="text-[11px] font-medium text-emerald-950/80 truncate">{boardUser.user_name}</span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-600 flex-shrink-0">{boardUser.total_score} pts</span>
                </div>
              ))}
              {leaderboard.length === 0 && (
                <p className="text-emerald-600/60 text-[10px] text-center py-4">Belum ada papan peringkat.</p>
              )}
            </div>
          </Panel>
        </div>
      </main>
    </div>
  );
}