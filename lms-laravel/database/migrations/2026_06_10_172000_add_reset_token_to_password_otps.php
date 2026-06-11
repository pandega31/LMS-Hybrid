<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('password_otps', function (Blueprint $table) {
            $table->string('reset_token', 255)->nullable()->after('otp');
            $table->boolean('is_verified')->default(false)->after('reset_token');
        });
    }

    public function down(): void
    {
        Schema::table('password_otps', function (Blueprint $table) {
            $table->dropColumn(['reset_token', 'is_verified']);
        });
    }
};
