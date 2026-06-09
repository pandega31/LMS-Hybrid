<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name'     => 'Admin LMS',
            'email'    => 'admin@lms.com',
            'password' => Hash::make('password'),
            'role'     => 'admin'
        ]);

        User::create([
            'name'     => 'Budi Santoso',
            'email'    => 'instruktur@lms.com',
            'password' => Hash::make('password'),
            'role'     => 'instructor'
        ]);

        User::create([
            'name'     => 'Pandega Surya Abditama',
            'email'    => 'siswa@lms.com',
            'password' => Hash::make('password'),
            'role'     => 'student'
        ]);
    }
}