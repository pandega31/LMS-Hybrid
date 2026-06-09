<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Material;
use Illuminate\Http\Request;

class MaterialController extends Controller
{
    public function index(Course $course)
    {
        return response()->json($course->materials);
    }

    public function store(Request $request, Course $course)
    {
        $validated = $request->validate([
            'title'     => 'required|string|max:255',
            'type'      => 'required|in:video,text,pdf',
            'content'   => 'nullable|string',
            'video_url' => 'nullable|url',
        ]);

        $validated['course_id'] = $course->id;
        $validated['order']     = Material::where('course_id', $course->id)->count() + 1;

        $material = Material::create($validated);

        return response()->json($material, 201);
    }

    public function show(Material $material)
    {
        return response()->json($material);
    }

    public function update(Request $request, Material $material)
    {
        $validated = $request->validate([
            'title'     => 'nullable|string|max:255',
            'type'      => 'nullable|in:video,text,pdf',
            'content'   => 'nullable|string',
            'video_url' => 'nullable|url',
            'order'     => 'nullable|integer',
        ]);

        $material->update($validated);

        return response()->json($material);
    }

    public function destroy(Material $material)
    {
        $material->delete();
        return response()->json(['message' => 'Materi berhasil dihapus']);
    }
}
