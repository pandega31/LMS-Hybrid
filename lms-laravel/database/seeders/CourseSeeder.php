<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Course;
use App\Models\Material;
use App\Models\Enrollment;
use App\Models\User;

class CourseSeeder extends Seeder
{
    public function run(): void
    {
        $instructor = User::where('role', 'instructor')->first();
        $student    = User::where('role', 'student')->first();

        // Kursus 1
        $course1 = Course::create([
            'title'         => 'Belajar Laravel dari Nol',
            'description'   => 'Kursus lengkap belajar Laravel mulai dari instalasi hingga membuat aplikasi web modern. Cocok untuk pemula yang ingin belajar framework PHP terpopuler.',
            'category'      => 'pemrograman',
            'level'         => 'pemula',
            'instructor_id' => $instructor->id,
            'is_published'  => true,
        ]);

        Material::insert([
            [
                'course_id' => $course1->id,
                'title'     => 'Pengenalan Laravel',
                'type'      => 'video',
                'video_url' => 'https://www.youtube.com/watch?v=example1',
                'content'   => 'Pengenalan framework Laravel dan ekosistemnya.',
                'order'     => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'course_id' => $course1->id,
                'title'     => 'Instalasi Laravel',
                'type'      => 'text',
                'video_url' => null,
                'content'   => 'Cara instalasi Laravel menggunakan Composer. Jalankan perintah: composer create-project laravel/laravel nama-project',
                'order'     => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'course_id' => $course1->id,
                'title'     => 'Routing di Laravel',
                'type'      => 'video',
                'video_url' => 'https://www.youtube.com/watch?v=example2',
                'content'   => 'Memahami konsep routing di Laravel.',
                'order'     => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'course_id' => $course1->id,
                'title'     => 'MVC di Laravel',
                'type'      => 'text',
                'video_url' => null,
                'content'   => 'Memahami konsep Model View Controller di Laravel.',
                'order'     => 4,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // Kursus 2
        $course2 = Course::create([
            'title'         => 'Belajar Node.js & Express',
            'description'   => 'Kursus belajar Node.js dan Express untuk membuat REST API modern. Dilengkapi dengan koneksi MongoDB dan Socket.io untuk fitur real-time.',
            'category'      => 'pemrograman',
            'level'         => 'menengah',
            'instructor_id' => $instructor->id,
            'is_published'  => true,
        ]);

        Material::insert([
            [
                'course_id' => $course2->id,
                'title'     => 'Pengenalan Node.js',
                'type'      => 'video',
                'video_url' => 'https://www.youtube.com/watch?v=example3',
                'content'   => 'Pengenalan Node.js dan cara kerjanya.',
                'order'     => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'course_id' => $course2->id,
                'title'     => 'Membuat REST API dengan Express',
                'type'      => 'video',
                'video_url' => 'https://www.youtube.com/watch?v=example4',
                'content'   => 'Cara membuat REST API menggunakan Express.js.',
                'order'     => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'course_id' => $course2->id,
                'title'     => 'Koneksi MongoDB dengan Mongoose',
                'type'      => 'text',
                'video_url' => null,
                'content'   => 'Cara menghubungkan Node.js dengan MongoDB menggunakan Mongoose ODM.',
                'order'     => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // Kursus 3
        $course3 = Course::create([
            'title'         => 'Belajar React.js untuk Pemula',
            'description'   => 'Kursus lengkap belajar React.js dari dasar hingga membuat aplikasi web interaktif. Dilengkapi dengan Tailwind CSS dan React Router.',
            'category'      => 'pemrograman',
            'level'         => 'pemula',
            'instructor_id' => $instructor->id,
            'is_published'  => true,
        ]);

        Material::insert([
            [
                'course_id' => $course3->id,
                'title'     => 'Pengenalan React.js',
                'type'      => 'video',
                'video_url' => 'https://www.youtube.com/watch?v=example5',
                'content'   => 'Pengenalan React.js dan konsep component.',
                'order'     => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'course_id' => $course3->id,
                'title'     => 'JSX dan Props',
                'type'      => 'text',
                'video_url' => null,
                'content'   => 'Memahami JSX syntax dan cara menggunakan Props di React.',
                'order'     => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'course_id' => $course3->id,
                'title'     => 'State dan Hooks',
                'type'      => 'video',
                'video_url' => 'https://www.youtube.com/watch?v=example6',
                'content'   => 'Memahami State Management dan React Hooks.',
                'order'     => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // Enroll siswa ke kursus 1 dan 2
        Enrollment::insert([
            [
                'user_id'     => $student->id,
                'course_id'   => $course1->id,
                'status'      => 'aktif',
                'progress'    => 50,
                'enrolled_at' => now(),
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
            [
                'user_id'     => $student->id,
                'course_id'   => $course2->id,
                'status'      => 'aktif',
                'progress'    => 25,
                'enrolled_at' => now(),
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
        ]);
    }
}