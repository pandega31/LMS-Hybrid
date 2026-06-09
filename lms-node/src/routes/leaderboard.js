const router     = require('express').Router();
const Submission = require('../models/Submission');

// GET leaderboard global (semua quiz dalam 1 kursus)
router.get('/course/:courseId', async (req, res) => {
  try {
    const leaderboard = await Submission
      .aggregate([
        { $match: { course_id: parseInt(req.params.courseId) } },
        { $group: {
            _id: '$user_id',
            user_name:   { $first: '$user_name' },
            total_score: { $sum: '$total_score' },
            quiz_count:  { $sum: 1 }
        }},
        { $sort: { total_score: -1 } },
        { $limit: 10 }
      ]);

    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil leaderboard' });
  }
});

// GET leaderboard berdasarkan quiz_id
router.get('/:quizId', async (req, res) => {
  try {
    const leaderboard = await Submission
      .find({ quiz_id: req.params.quizId })
      .sort({ total_score: -1, time_taken: 1 })
      .limit(10)
      .select('user_name total_score percentage time_taken completed_at');

    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil leaderboard' });
  }
});

module.exports = router;