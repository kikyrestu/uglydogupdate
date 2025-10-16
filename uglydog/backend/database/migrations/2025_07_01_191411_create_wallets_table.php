<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('wallets', function (Blueprint $table) {
        $table->id();
        $table->foreignUuid('pengguna_id')->constrained('penggunas')->onDelete('cascade');
        $table->string('provider')->nullable(); // contoh: 'phantom', 'metamask'
        $table->string('address')->unique();    // hex address wallet
        $table->timestamps();
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wallets');
    }
};
