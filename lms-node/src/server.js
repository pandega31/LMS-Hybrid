require('dotenv').config();
const express    = require('express');
const http       = require('http');
const { Server } = require('socket.io');
const mongoose   = require('mongoose');
const cors       = require('cors');

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  cors: { origin: '*', methods: ['GET','POST'] }
});

app.use(cors());
app.use(express.json());

// Koneksi MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB terhubung'))
  .catch(err => console.error('MongoDB error:', err));

// Routes
app.use('/api/quizzes',     require('./routes/quiz'));
app.use('/api/submissions', require('./routes/submission'));
app.use('/api/leaderboard', require('./routes/leaderboard'));

// Socket.io — Leaderboard Real-time
io.on('connection', (socket) => {
  console.log('Siswa terhubung:', socket.id);

  // Siswa masuk ke room quiz tertentu
  socket.on('join_quiz', (quizId) => {
    socket.join(`quiz_${quizId}`);
    console.log(`User masuk room quiz_${quizId}`);
  });

  // Emit update ke semua siswa di room yang sama
  socket.on('quiz_completed', async (data) => {
    const { quizId } = data;
    const Submission = require('./models/Submission');

    // Ambil leaderboard terbaru
    const board = await Submission
      .find({ quiz_id: quizId })
      .sort({ total_score: -1, time_taken: 1 })
      .limit(10)
      .select('user_name total_score percentage time_taken');

    io.to(`quiz_${quizId}`).emit('leaderboard_updated', board);
  });

  socket.on('disconnect', () => {
    console.log('Siswa disconnect:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Node.js server jalan di port ${PORT}`);
});