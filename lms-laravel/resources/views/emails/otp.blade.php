<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Kode OTP - LMS Hybrid</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #f0fdf4; font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a2e; }
    .wrapper { max-width: 520px; margin: 40px auto; padding: 24px; }
    .card {
      background: #ffffff;
      border: 1px solid #d1fae5;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(16,185,129,0.10);
    }
    .header {
      background: linear-gradient(135deg, #059669, #10b981);
      padding: 32px 24px;
      text-align: center;
    }
    .logo {
      font-size: 36px;
      margin-bottom: 8px;
    }
    .brand {
      font-size: 20px;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: 0.5px;
    }
    .body { padding: 36px 32px; }
    .greeting {
      font-size: 15px;
      color: #374151;
      margin-bottom: 12px;
    }
    .message {
      font-size: 14px;
      color: #6b7280;
      line-height: 1.7;
      margin-bottom: 28px;
    }
    .otp-label {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: #059669;
      margin-bottom: 12px;
    }
    .otp-box {
      background: #f0fdf4;
      border: 2px dashed #10b981;
      border-radius: 16px;
      padding: 24px;
      text-align: center;
      margin-bottom: 24px;
    }
    .otp-code {
      font-size: 42px;
      font-weight: 900;
      letter-spacing: 14px;
      color: #065f46;
      font-family: 'Courier New', monospace;
    }
    .expires {
      font-size: 12px;
      color: #9ca3af;
      text-align: center;
      margin-bottom: 24px;
    }
    .expires span {
      font-weight: 700;
      color: #f59e0b;
    }
    .warning {
      background: #fef3c7;
      border: 1px solid #fde68a;
      border-radius: 12px;
      padding: 14px 16px;
      font-size: 12px;
      color: #92400e;
      line-height: 1.6;
    }
    .footer {
      padding: 20px 32px;
      border-top: 1px solid #d1fae5;
      text-align: center;
      font-size: 11px;
      color: #9ca3af;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <div class="logo">🎓</div>
        <div class="brand">LMS Hybrid</div>
      </div>
      <div class="body">
        <p class="greeting">Halo, <strong>{{ $user->name }}</strong>!</p>
        <p class="message">
          Kami menerima permintaan untuk mereset kata sandi akun LMS Hybrid Anda.
          Gunakan kode OTP di bawah ini untuk memverifikasi identitas Anda.
        </p>

        <p class="otp-label">Kode OTP Anda</p>
        <div class="otp-box">
          <div class="otp-code">{{ $otp }}</div>
        </div>

        <p class="expires">
          Kode ini akan kedaluwarsa dalam <span>10 menit</span>.
        </p>

        <div class="warning">
          ⚠️ Jangan bagikan kode ini kepada siapapun. Tim LMS Hybrid tidak akan pernah meminta kode OTP Anda.
          Jika Anda tidak merasa melakukan permintaan ini, abaikan email ini.
        </div>
      </div>
      <div class="footer">
        &copy; {{ date('Y') }} LMS Hybrid. Hak Cipta Dilindungi.
      </div>
    </div>
  </div>
</body>
</html>
