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
        Schema::create('user_game_profiles', function (Blueprint $table) {
                $table->id();
                $table->foreignUuid('user_id')->constrained('penggunas')->onDelete('cascade');
                $table->integer('total_score')->default(0);
                $table->integer('best_session')->default(0);
                $table->integer('total_sessions')->default(0);
                $table->integer('current_savepoint')->default(0);
                $table->date('last_play_date')->nullable();
                $table->json('achievements')->nullable();
                $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_game_profiles');
    }
};
