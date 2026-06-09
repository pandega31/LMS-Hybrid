<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\MaterialController;
use App\Http\Controllers\Api\EnrollmentController;
use Illuminate\Support\Facades\Route;

// Auth Routes (Public)
Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);
Route::post('forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('reset-password', [AuthController::class, 'resetPassword']);

// Public Course Routes (For catalog and detail view)
Route::get('courses', [CourseController::class, 'index']);
Route::get('courses/{course}', [CourseController::class, 'show']);

// Protected Routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth Routes (Protected)
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('me', [AuthController::class, 'me']);

    // Courses CRUD (For Instructors)
    Route::post('courses', [CourseController::class, 'store']);
    Route::put('courses/{course}', [CourseController::class, 'update']);
    Route::delete('courses/{course}', [CourseController::class, 'destroy']);

    // Materials CRUD (For Instructors)
    Route::apiResource('courses.materials', MaterialController::class)->shallow();

    // Enrollments (For Students)
    Route::post('courses/{course}/enroll', [EnrollmentController::class, 'enroll']);
    Route::post('courses/{course}/unenroll', [EnrollmentController::class, 'unenroll']);
    Route::get('my-courses', [EnrollmentController::class, 'myCourses']);
});
