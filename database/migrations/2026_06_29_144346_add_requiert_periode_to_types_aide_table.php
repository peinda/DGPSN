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
        Schema::table('types_aide', function (Blueprint $table) {
            $table->boolean('requiert_periode')->default(false)->after('actif');
        });
    }

    public function down(): void
    {
        Schema::table('types_aide', function (Blueprint $table) {
            $table->dropColumn('requiert_periode');
        });
    }
};
