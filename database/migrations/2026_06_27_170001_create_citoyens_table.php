<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('citoyens', function (Blueprint $table) {
            $table->id();
            $table->string('cin', 20)->unique();
            $table->string('nom');
            $table->string('prenom');
            $table->string('telephone', 20)->nullable();
            $table->text('adresse')->nullable();
            $table->foreignId('commune_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('citoyens');
    }
};
