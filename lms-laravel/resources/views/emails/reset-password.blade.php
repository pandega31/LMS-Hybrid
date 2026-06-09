<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Atur Ulang Kata Sandi - LMS Hybrid</title>
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
        .note {
            font-size: 14px;
            color: #64748b;
            margin-top: 24px;
            border-top: 1px solid #334155;
            padding-top: 16px;
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
                <div class="logo">🔑</div>
                <div class="brand">LMS Hybrid</div>
            </div>
            <h1>Permintaan Atur Ulang Kata Sandi</h1>
            <p>Halo, {{ $user->name }}!</p>
            <p>Kami menerima permintaan untuk mengatur ulang kata sandi akun LMS Hybrid Anda. Silakan klik tombol di bawah ini untuk mereset kata sandi Anda:</p>
            
            <a href="{{ $resetUrl }}" class="button">Atur Ulang Kata Sandi</a>

            <div class="note">
                <p>Tautan ini akan kedaluwarsa dalam 60 menit. Jika Anda tidak merasa melakukan permintaan ini, abaikan email ini dan kata sandi Anda tidak akan berubah.</p>
            </div>
        </div>
        <div class="footer">
            &copy; {{ date('Y') }} LMS Hybrid. Hak Cipta Dilindungi.
        </div>
    </div>
</body>
</html>
