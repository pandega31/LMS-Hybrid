<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\ResetPasswordMail;
use App\Mail\WelcomeMail;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role'     => 'required|in:student,instructor',
        ]);

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'role'     => $request->role,
        ]);

        // Kirim email selamat datang
        try {
            Mail::to($user->email)->send(new WelcomeMail($user));
        } catch (\Exception $e) {
            // Log error tapi jangan gagalkan registrasi
            Log::error('Gagal mengirim email selamat datang: ' . $e->getMessage());
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'token'   => $token,
            'user'    => $user,
            'message' => 'Registrasi berhasil! Email konfirmasi telah dikirim.',
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|string|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Kredensial yang diberikan salah.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => $user,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    /**
     * Kirim link reset password ke email user
     */
    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $request->email)->first();

        // Selalu return sukses meskipun email tidak ditemukan (keamanan)
        if (!$user) {
            return response()->json([
                'message' => 'Jika email tersebut terdaftar, link reset password telah dikirimkan.',
            ]);
        }

        // Hapus token lama jika ada
        DB::table('password_reset_tokens')->where('email', $user->email)->delete();

        // Buat token baru
        $token = Str::random(64);

        DB::table('password_reset_tokens')->insert([
            'email'      => $user->email,
            'token'      => Hash::make($token),
            'created_at' => now(),
        ]);

        $resetUrl = env('FRONTEND_URL', 'http://localhost:3000') . '/reset-password?token=' . $token . '&email=' . urlencode($user->email);

        try {
            Mail::to($user->email)->send(new ResetPasswordMail($user, $resetUrl));
        } catch (\Exception $e) {
            Log::error('Gagal mengirim email reset password: ' . $e->getMessage());
            return response()->json([
                'message' => 'Gagal mengirim email. Silakan coba lagi nanti.',
            ], 500);
        }

        return response()->json([
            'message' => 'Link reset password telah dikirimkan ke email Anda.',
        ]);
    }

    /**
     * Proses reset password dengan token yang valid
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'token'    => 'required|string',
            'email'    => 'required|email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        // Cari record di tabel password_reset_tokens
        $record = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$record) {
            return response()->json([
                'message' => 'Token reset password tidak valid atau sudah kedaluwarsa.',
            ], 422);
        }

        // Verifikasi token dan cek kadaluwarsa (60 menit)
        if (!Hash::check($request->token, $record->token)) {
            return response()->json([
                'message' => 'Token reset password tidak valid.',
            ], 422);
        }

        if (now()->diffInMinutes($record->created_at) > 60) {
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            return response()->json([
                'message' => 'Token reset password sudah kedaluwarsa. Silakan minta link baru.',
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'message' => 'Pengguna tidak ditemukan.',
            ], 404);
        }

        // Update password
        $user->update([
            'password' => Hash::make($request->password),
        ]);

        // Hapus semua token reset untuk email ini
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        // Cabut semua token sanctum agar user harus login ulang
        $user->tokens()->delete();

        return response()->json([
            'message' => 'Kata sandi berhasil diperbarui. Silakan login dengan kata sandi baru.',
        ]);
    }
}
