<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\OtpMail;
use App\Mail\WelcomeMail;
use App\Models\PasswordOtp;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
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

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'name'     => 'required|string|max:255',
            'password' => 'nullable|string|min:8|confirmed',
            'photo'    => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ]);

        $user->name = $request->name;

        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }

        if ($request->hasFile('photo')) {
            if ($user->profile_photo && Storage::disk('public')->exists($user->profile_photo)) {
                Storage::disk('public')->delete($user->profile_photo);
            }
            $path = $request->file('photo')->store('profile_photos', 'public');
            $user->profile_photo = $path;
        }

        $user->save();

        // Update nama user di MongoDB (leaderboard/submissions) via Node.js API
        try {
            \Illuminate\Support\Facades\Http::put('http://localhost:3000/api/submissions/user/' . $user->id . '/name', [
                'name' => $user->name
            ]);
        } catch (\Exception $e) {
            Log::error('Gagal mengupdate nama di leaderboard nodejs: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Profil berhasil diperbarui.',
            'user'    => $user
        ]);
    }

    /**
     * Kirim OTP ke email user untuk reset password
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
                'message' => 'Jika email tersebut terdaftar, kode OTP telah dikirimkan.',
            ]);
        }

        // Hapus OTP lama jika ada
        PasswordOtp::where('email', $user->email)->delete();

        // Generate OTP 6 digit
        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        // Simpan ke database, berlaku 10 menit
        PasswordOtp::create([
            'email'      => $user->email,
            'otp'        => $otp,
            'expires_at' => now()->addMinutes(10),
        ]);

        try {
            Mail::to($user->email)->send(new OtpMail($user, $otp));
        } catch (\Exception $e) {
            Log::error('Gagal mengirim OTP: ' . $e->getMessage());
            return response()->json([
                'message' => 'Gagal mengirim email OTP. Silakan coba lagi nanti.',
            ], 500);
        }

        return response()->json([
            'message' => 'Kode OTP telah dikirimkan ke email Anda. Berlaku selama 10 menit.',
        ]);
    }

    /**
     * Verifikasi OTP yang dimasukkan user
     */
    public function verifyOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp'   => 'required|string|size:6',
        ]);

        $record = PasswordOtp::where('email', $request->email)->first();

        if (!$record) {
            return response()->json([
                'message' => 'Kode OTP tidak ditemukan. Silakan minta ulang.',
            ], 422);
        }

        if ($record->isExpired()) {
            $record->delete();
            return response()->json([
                'message' => 'Kode OTP sudah kedaluwarsa. Silakan minta kode baru.',
            ], 422);
        }

        if ($record->otp !== $request->otp) {
            return response()->json([
                'message' => 'Kode OTP tidak valid.',
            ], 422);
        }

        // OTP valid — beri reset_token sementara (bukan langsung hapus, agar bisa reset password)
        // Buat reset_token unik dan simpan
        $resetToken = \Illuminate\Support\Str::random(64);
        $record->update(['reset_token' => $resetToken, 'is_verified' => true]);

        return response()->json([
            'message'      => 'OTP berhasil diverifikasi.',
            'reset_token'  => $resetToken,
            'email'        => $request->email,
        ]);
    }

    /**
     * Proses reset password setelah OTP diverifikasi
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email'        => 'required|email',
            'reset_token'  => 'required|string',
            'password'     => 'required|string|min:8|confirmed',
        ]);

        $record = PasswordOtp::where('email', $request->email)->first();

        if (!$record || !$record->is_verified || $record->reset_token !== $request->reset_token) {
            return response()->json([
                'message' => 'Sesi reset password tidak valid atau sudah kedaluwarsa. Silakan mulai ulang.',
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

        // Hapus record OTP
        $record->delete();

        // Cabut semua token sanctum agar user harus login ulang
        $user->tokens()->delete();

        return response()->json([
            'message' => 'Kata sandi berhasil diperbarui. Silakan login dengan kata sandi baru.',
        ]);
    }
}
