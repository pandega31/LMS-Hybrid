<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use Illuminate\Http\Request;

class EnrollmentController extends Controller
{
    public function enroll(Request $request, Course $course)
    {
        $userId = $request->user()->id;

        // Cek apakah sudah terdaftar
        $exists = Enrollment::where('user_id', $userId)
            ->where('course_id', $course->id)
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Sudah terdaftar di kursus ini'], 400);
        }

        $enrollment = Enrollment::create([
            'user_id' => $userId,
            'course_id' => $course->id,
            'status' => 'aktif',
            'progress' => 0,
            'enrolled_at' => now(),
        ]);

        return response()->json([
            'message' => 'Berhasil terdaftar',
            'enrollment' => $enrollment
        ], 201);
    }

    public function unenroll(Request $request, Course $course)
    {
        $userId = $request->user()->id;

        $enrollment = Enrollment::where('user_id', $userId)
            ->where('course_id', $course->id)
            ->first();

        if (!$enrollment) {
            return response()->json(['message' => 'Belum terdaftar di kursus ini'], 400);
        }

        $enrollment->delete();

        return response()->json(['message' => 'Berhasil membatalkan pendaftaran']);
    }

    public function myCourses(Request $request)
    {
        $courses = $request->user()->enrolledCourses()->with('instructor')->get();
        return response()->json($courses);
    }
}
