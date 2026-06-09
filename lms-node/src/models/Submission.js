const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  question_index: Number,
  chosen_index:   Number,
  is_correct:     Boolean,
  points_earned:  Number
});

const submissionSchema = new mongoose.Schema({
  quiz_id:      { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
  user_id:      { type: Number, required: true }, // ID dari MySQL
  user_name:    String,
  answers:      [answerSchema],
  total_score:  { type: Number, default: 0 },
  max_score:    { type: Number, default: 0 },
  percentage:   { type: Number, default: 0 },
  time_taken:   Number, // detik
  completed_at: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Submission', submissionSchema);