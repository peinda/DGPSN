<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('demandes', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 20)->unique()->nullable();
            $table->foreignId('citoyen_id')->constrained()->cascadeOnDelete();
            $table->foreignId('type_aide_id')->constrained('types_aide')->restrictOnDelete();
            $table->foreignId('evenement_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('annee_gestion_id')->constrained('annees_gestion')->restrictOnDelete();
            $table->foreignId('periode_ouverture_id')->nullable()->constrained('periodes_ouverture')->nullOnDelete();
            $table->foreignId('agent_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('comite_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('statut', ['brouillon', 'soumis', 'en_examen', 'approuve', 'rejete', 'cloture'])->default('brouillon');
            $table->decimal('montant_total', 12, 2)->nullable();
            $table->text('commentaire')->nullable();
            $table->timestamp('date_soumission')->nullable();
            $table->timestamp('date_deliberation')->nullable();
            $table->timestamp('date_cloture')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('demandes');
    }
};
