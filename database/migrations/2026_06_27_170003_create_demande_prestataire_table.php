<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('demande_prestataire', function (Blueprint $table) {
            $table->id();
            $table->foreignId('demande_id')->constrained()->cascadeOnDelete();
            $table->foreignId('prestataire_id')->constrained()->cascadeOnDelete();
            $table->decimal('montant_estime', 12, 2)->default(0);
            $table->boolean('confirme')->default(false);
            $table->timestamp('date_confirmation')->nullable();
            $table->timestamps();

            $table->unique(['demande_id', 'prestataire_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('demande_prestataire');
    }
};
