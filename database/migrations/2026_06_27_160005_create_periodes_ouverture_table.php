<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('periodes_ouverture', function (Blueprint $table) {
            $table->id();
            $table->foreignId('evenement_id')->constrained()->cascadeOnDelete();
            $table->foreignId('annee_gestion_id')->constrained('annees_gestion')->cascadeOnDelete();
            $table->date('date_debut');
            $table->date('date_fin');
            $table->boolean('actif')->default(true);
            $table->timestamps();

            $table->unique(['evenement_id', 'annee_gestion_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('periodes_ouverture');
    }
};
