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
        Schema::create('game_logs', function (Blueprint $table) {
    $table->id();
    $table->foreignUuid('user_id')->constrained('penggunas')->onDelete('cascade');
    $table->integer('session_score');
    $table->integer('savepoint_score')->default(0);
    $table->integer('misses')->default(0);
    $table->json('bonus_collected')->nullable();
    $table->integer('play_duration')->nullable();
    $table->text('signature')->nullable();
    $table->string('ip_address', 45)->nullable();
    $table->text('user_agent')->nullable();
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('log_games');
    }
};
