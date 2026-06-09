<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Selamat Datang di LMS Hybrid</title>
    <style>
        body {
            background-color: #0f172a;
            color: #e2e8f0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
        }
        .card {
            background-color: #1e293b;
            border: 1px solid #334155;
            border-radius: 16px;
            padding: 32px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 32px;
        }
        .logo {
            display: inline-block;
            width: 48px;
            height: 48px;
            background-color: #4f46e5;
            border-radius: 12px;
            line-height: 48px;
            font-size: 24px;
            color: #ffffff;
            margin-bottom: 16px;
            text-align: center;
        }
        .brand {
            font-size: 20px;
            font-weight: 800;
            color: #ffffff;
            letter-spacing: -0.025em;
        }
        h1 {
            font-size: 24px;
            font-weight: 700;
            color: #ffffff;
            margin-top: 0;
            margin-bottom: 8px;
            text-align: center;
        }
        p {
            font-size: 16px;
            line-height: 24px;
            color: #94a3b8;
            margin-top: 0;
            margin-bottom: 16px;
        }
        .highlight {
            color: #818cf8;
            font-weight: 600;
        }
        .role-badge {
            display: inline-block;
            padding: 6px 12px;
            background-color: #312e81;
            border: 1px solid #4338ca;
            color: #c7d2fe;
            border-radius: 9999px;
            font-size: 14px;
            font-weight: 600;
            text-transform: capitalize;
            margin-top: 8px;
        }
        .button {
            display: block;
            text-align: center;
            background-color: #4f46e5;
            color: #ffffff !important;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 12px;
            font-weight: 600;
            margin-top: 32px;
            font-size: 16px;
        }
        .button:hover {
            background-color: #4338ca;
        }
        .footer {
            text-align: center;
            margin-top: 32px;
            font-size: 12px;
            color: #64748b;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <div class="header">
                <div class="logo">🎓</div>
                <div class="brand">LMS Hybrid</div>
            </div>
            <h1>Selamat Datang, {{ $user->name }}!</h1>
            <p>Terima kasih telah mendaftar di <span class="highlight">LMS Hybrid</span>. Kami sangat senang Anda bergabung dengan kami.</p>
            <p>Akun Anda telah berhasil dibuat dengan peran:</p>
            <div style="text-align: center; margin-bottom: 24px;">
                <span class="role-badge">{{ $user->role === 'student' ? 'Siswa' : 'Instruktur' }}</span>
            </div>
            <p>Silakan klik tombol di bawah ini untuk langsung masuk ke halaman dashboard Anda dan mulai menjelajah kelas.</p>
            <a href="http://localhost:3000/login" class="button">Masuk ke Dashboard</a>
        </div>
        <div class="footer">
            &copy; {{ date('Y') }} LMS Hybrid. Hak Cipta Dilindungi.
        </div>
    </div>
</body>
</html>
