const router = require('express').Router();
const Quiz   = require('../models/Quiz');

// GET semua quiz untuk 1 kursus
router.get('/course/:courseId', async (req, res) => {
  const quizzes = await Quiz
    .find({ course_id: req.params.courseId, is_active: true })
    .select('-questions.correct_index'); // sembunyikan jawaban
  res.json(quizzes);
});

// GET 1 quiz (tanpa jawaban benar)
router.get('/:id', async (req, res) => {
  const quiz = await Quiz.findById(req.params.id)
    .select('-questions.correct_index');
  if (!quiz) return res.status(404).json({ error: 'Quiz tidak ditemukan' });
  res.json(quiz);
});

// GET 1 quiz untuk review historis (termasuk kunci jawaban)
router.get('/:id/review', async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);
  if (!quiz) return res.status(404).json({ error: 'Quiz tidak ditemukan' });
  res.json(quiz);
});

// POST buat quiz baru (instruktur)
router.post('/', async (req, res) => {
  const quiz = await Quiz.create(req.body);
  res.status(201).json(quiz);
});

// PUT edit quiz
router.put('/:id', async (req, res) => {
  const quiz = await Quiz.findByIdAndUpdate(
    req.params.id, req.body, { new: true }
  );
  res.json(quiz);
});

// DELETE hapus quiz
router.delete('/:id', async (req, res) => {
  await Quiz.findByIdAndDelete(req.params.id);
  res.json({ message: 'Quiz dihapus' });
});

module.exports = router;