<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('annees_gestion', function (Blueprint $table) {
            $table->id();
            $table->year('annee')->unique();
            $table->enum('statut', ['ouvert', 'cloture', 'archive'])->default('ouvert');
            $table->date('date_ouverture')->nullable();
            $table->date('date_cloture')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('annees_gestion');
    }
};
