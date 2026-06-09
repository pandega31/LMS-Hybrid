require('dotenv').config();
const mongoose = require('mongoose');
const Quiz     = require('../models/Quiz');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB terhubung'))
  .catch(err => console.error(err));

const quizData = [
  {
    course_id:     1,
    title:         'Quiz Bab 1 - Pengenalan Laravel',
    duration_secs: 600,
    is_active:     true,
    questions: [
      {
        question:      'Apa kepanjangan dari MVC?',
        options:       ['Model View Controller','Main View Component','Module View Control','Model Visual Code'],
        correct_index: 0,
        points:        10
      },
      {
        question:      'Perintah apa yang digunakan untuk membuat project Laravel baru?',
        options:       ['npm create laravel','composer create-project laravel/laravel','php new laravel','laravel new project'],
        correct_index: 1,
        points:        10
      },
      {
        question:      'File konfigurasi database Laravel ada di?',
        options:       ['config/app.php','config/database.php','.env.database','database/config.php'],
        correct_index: 1,
        points:        10
      },
      {
        question:      'Perintah untuk menjalankan migration di Laravel?',
        options:       ['php artisan db:migrate','php artisan migration:run','php artisan migrate','composer migrate'],
        correct_index: 2,
        points:        10
      },
      {
        question:      'Apa fungsi dari Eloquent di Laravel?',
        options:       ['Template engine','ORM untuk database','Package manager','Routing system'],
        correct_index: 1,
        points:        10
      },
    ]
  },
  {
    course_id:     1,
    title:         'Quiz Bab 2 - Routing & Controller',
    duration_secs: 600,
    is_active:     true,
    questions: [
      {
        question:      'File routing utama untuk API di Laravel ada di?',
        options:       ['routes/web.php','routes/api.php','routes/auth.php','app/routes.php'],
        correct_index: 1,
        points:        10
      },
      {
        question:      'Perintah untuk membuat Controller di Laravel?',
        options:       ['php artisan create:controller','php artisan make:controller','composer make controller','php new controller'],
        correct_index: 1,
        points:        10
      },
      {
        question:      'Method HTTP apa yang digunakan untuk membuat data baru?',
        options:       ['GET','PUT','POST','DELETE'],
        correct_index: 2,
        points:        10
      },
      {
        question:      'Apa fungsi middleware di Laravel?',
        options:       ['Mengatur tampilan','Memfilter HTTP request','Mengelola database','Membuat migration'],
        correct_index: 1,
        points:        10
      },
      {
        question:      'Apa itu Route Model Binding di Laravel?',
        options:       ['Menghubungkan route dengan database','Otomatis inject model ke controller','Membuat route otomatis','Semua benar'],
        correct_index: 1,
        points:        10
      },
    ]
  },
  {
    course_id:     2,
    title:         'Quiz Bab 1 - Pengenalan Node.js',
    duration_secs: 600,
    is_active:     true,
    questions: [
      {
        question:      'Node.js berjalan di atas engine apa?',
        options:       ['SpiderMonkey','V8','Chakra','JavaScriptCore'],
        correct_index: 1,
        points:        10
      },
      {
        question:      'Apa fungsi dari npm?',
        options:       ['Node Package Manager','Node Program Manager','New Project Manager','None of above'],
        correct_index: 0,
        points:        10
      },
      {
        question:      'Perintah untuk menjalankan file Node.js?',
        options:       ['npm start file.js','node file.js','run file.js','execute file.js'],
        correct_index: 1,
        points:        10
      },
      {
        question:      'Apa itu callback function di Node.js?',
        options:       ['Fungsi yang dipanggil setelah operasi selesai','Fungsi utama program','Fungsi untuk routing','Fungsi database'],
        correct_index: 0,
        points:        10
      },
      {
        question:      'Module mana yang digunakan untuk membuat HTTP server di Node.js?',
        options:       ['fs','path','http','os'],
        correct_index: 2,
        points:        10
      },
    ]
  },
];

async function seedQuiz() {
  try {
    await Quiz.deleteMany({});
    console.log('Data quiz lama dihapus');

    await Quiz.insertMany(quizData);
    console.log('Data quiz berhasil dibuat!');
    console.log(`Total: ${quizData.length} quiz`);

    mongoose.connection.close();
  } catch (err) {
    console.error('Error seeding quiz:', err);
    mongoose.connection.close();
  }
}

seedQuiz();