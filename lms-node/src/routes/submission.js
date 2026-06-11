const router     = require('express').Router();
const Submission = require('../models/Submission');
const Quiz       = require('../models/Quiz');

// POST submit jawaban quiz
router.post('/', async (req, res) => {
  const { quiz_id, user_id, user_name, answers, time_taken } = req.body;

  // Ambil quiz dengan jawaban benar
  const quiz = await Quiz.findById(quiz_id);
  if (!quiz) return res.status(404).json({ error: 'Quiz tidak ada' });

  // Hitung skor
  let total_score = 0;
  const max_score = quiz.questions.reduce((s, q) => s + q.points, 0);

  const gradedAnswers = quiz.questions.map((q, i) => {
    const chosen = answers[i];
    const is_correct = chosen === q.correct_index;
    const pts = is_correct ? q.points : 0;
    total_score += pts;
    return {
      question_index: i,
      chosen_index:   chosen,
      is_correct,
      points_earned:  pts
    };
  });

  const submission = await Submission.create({
    quiz_id, user_id, user_name,
    answers:     gradedAnswers,
    total_score, max_score,
    percentage:  Math.round((total_score / max_score) * 100),
    time_taken
  });

  res.status(201).json({
    ...submission.toObject(),
    quiz_questions: quiz.questions // kirim soal + jawaban benar
  });
});

// GET riwayat submission siswa
router.get('/user/:userId', async (req, res) => {
  const subs = await Submission
    .find({ user_id: req.params.userId })
    .sort({ createdAt: -1 });
  res.json(subs);
});

// PUT update nama user di semua submission miliknya
router.put('/user/:userId/name', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Nama wajib diisi' });

    await Submission.updateMany(
      { user_id: Number(req.params.userId) },
      { $set: { user_name: name } }
    );
    res.json({ message: 'Nama berhasil diperbarui di semua riwayat submission' });
  } catch (err) {
    console.error('Update name error:', err);
    res.status(500).json({ error: 'Gagal memperbarui nama' });
  }
});

// GET analytics untuk instruktur berdasarkan daftar course id
router.get('/analytics/instructor', async (req, res) => {
  try {
    const courseIds = String(req.query.course_ids || '')
      .split(',')
      .map(id => Number(id.trim()))
      .filter(Number.isFinite);

    if (courseIds.length === 0) {
      return res.json({
        total_courses: 0,
        total_quizzes: 0,
        total_students: 0,
        total_submissions: 0,
        average_score: 0,
        completion_rate: 0,
        top_quiz: null,
        recent_submissions: [],
        all_quizzes: [],
      });
    }

    const quizzes = await Quiz.find({ course_id: { $in: courseIds }, is_active: true })
      .select('_id title course_id questions duration_secs');

    const quizIds = quizzes.map(q => q._id);
    const submissions = await Submission.find({ quiz_id: { $in: quizIds } })
      .sort({ createdAt: -1 });

    const uniqueStudents = new Set(submissions.map(sub => String(sub.user_id)));
    const averageScore = submissions.length
      ? Math.round(submissions.reduce((sum, item) => sum + (item.percentage || 0), 0) / submissions.length)
      : 0;

    const quizStats = quizzes.map(quiz => {
      const quizSubs = submissions.filter(sub => String(sub.quiz_id) === String(quiz._id));
      const avg = quizSubs.length
        ? Math.round(quizSubs.reduce((sum, item) => sum + (item.percentage || 0), 0) / quizSubs.length)
        : 0;
      return {
        quiz_id: quiz._id,
        title: quiz.title,
        course_id: quiz.course_id,
        attempts: quizSubs.length,
        average_score: avg,
      };
    });

    const topQuiz = quizStats
      .filter(quiz => quiz.attempts > 0)
      .sort((a, b) => b.average_score - a.average_score || b.attempts - a.attempts)[0] || null;

    const completedAttempts = submissions.filter(sub => (sub.percentage || 0) >= 70).length;
    const completionRate = submissions.length
      ? Math.round((completedAttempts / submissions.length) * 100)
      : 0;

    res.json({
      total_courses: courseIds.length,
      total_quizzes: quizzes.length,
      total_students: uniqueStudents.size,
      total_submissions: submissions.length,
      average_score: averageScore,
      completion_rate: completionRate,
      top_quiz: topQuiz,
      recent_submissions: submissions.slice(0, 5).map(sub => ({
        _id: sub._id,
        quiz_id: sub.quiz_id,
        user_name: sub.user_name,
        percentage: sub.percentage,
        total_score: sub.total_score,
        max_score: sub.max_score,
        time_taken: sub.time_taken,
        completed_at: sub.completed_at,
      })),
      all_quizzes: quizzes,
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ error: 'Gagal mengambil analytics instructor' });
  }
});

module.exports = router;