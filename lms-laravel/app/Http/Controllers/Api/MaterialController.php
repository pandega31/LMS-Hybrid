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
            'file'      => 'nullable|file|mimes:pdf,doc,docx,ppt,pptx|max:20480',
        ]);

        if ($request->hasFile('file')) {
            $path = $request->file('file')->store('materials', 'public');
            $validated['file_url'] = $path;
        }

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
            'file'      => 'nullable|file|mimes:pdf,doc,docx,ppt,pptx|max:20480',
        ]);

        if ($request->hasFile('file')) {
            if ($material->file_url && \Illuminate\Support\Facades\Storage::disk('public')->exists($material->file_url)) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($material->file_url);
            }
            $path = $request->file('file')->store('materials', 'public');
            $validated['file_url'] = $path;
        }

        $material->update($validated);

        return response()->json($material);
    }

    public function destroy(Material $material)
    {
        $material->delete();
        return response()->json(['message' => 'Materi berhasil dihapus']);
    }
}
