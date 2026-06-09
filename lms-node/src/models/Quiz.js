const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question:      { type: String, required: true },
  options:       [{ type: String, required: true }],
  correct_index: { type: Number, required: true },
  points:        { type: Number, default: 10 }
});

const quizSchema = new mongoose.Schema({
  course_id:     { type: Number, required: true }, // ID dari MySQL
  chapter_id:    { type: Number },
  title:         { type: String, required: true },
  questions:     [questionSchema],
  duration_secs: { type: Number, default: 1800 }, // 30 menit
  is_active:     { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);