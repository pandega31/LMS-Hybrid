<?php

namespace App\Http\Controllers\Api;

use App\Models\Course;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class CourseController extends Controller
{
    public function index(Request $request)
    {
        $query = Course::with('instructor');

        if ($request->query('my_taught_courses') && auth('sanctum')->check()) {
            $query->where('instructor_id', auth('sanctum')->id());
        } else {
            $query->where('is_published', true);
        }

        $courses = $query->when($request->search, fn($q, $s) =>
                $q->where('title', 'like', "%$s%"))
            ->when($request->category, fn($q, $c) =>
                $q->where('category', $c))
            ->paginate(12);

        return response()->json($courses);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'required|string',
            'category'    => 'required|string',
            'level'       => 'required|in:pemula,menengah,lanjutan',
            'thumbnail'   => 'nullable|string',
            'is_published'=> 'nullable|boolean',
        ]);

        $validated['instructor_id'] = auth()->id();
        $validated['is_published']  = $request->boolean('is_published', false);
        
        $course = Course::create($validated);

        return response()->json($course, 201);
    }

    public function show(Course $course)
    {
        $course->load(['instructor', 'materials']);

        // Check if student is enrolled
        if (auth('sanctum')->check()) {
            $enrollment = $course->enrollments()
                ->where('user_id', auth('sanctum')->id())
                ->first();
            $course->setAttribute('enrollment', $enrollment);
        }

        return response()->json($course);
    }

    public function update(Request $request, Course $course)
    {
        $validated = $request->validate([
            'title'       => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'category'    => 'sometimes|required|string',
            'level'       => 'sometimes|required|in:pemula,menengah,lanjutan',
            'thumbnail'   => 'nullable|string',
            'is_published'=> 'nullable|boolean',
        ]);

        if ($request->has('is_published')) {
            $validated['is_published'] = $request->boolean('is_published');
        }

        $course->update($validated);
        return response()->json($course);
    }

    public function destroy(Course $course)
    {
        $course->delete();
        return response()->json(['message' => 'Kursus berhasil dihapus']);
    }
}