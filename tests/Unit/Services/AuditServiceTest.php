<?php

namespace Tests\Unit\Services;

use App\Models\Demande;
use App\Models\User;
use App\Services\AuditService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuditServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_log_creates_audit_log_row_with_expected_fields(): void
    {
        $user    = User::factory()->create();
        $demande = Demande::factory()->create();
        $this->actingAs($user);

        AuditService::log('demande.test', 'Une description', $demande, ['avant' => 1], ['apres' => 2]);

        $this->assertDatabaseHas('audit_logs', [
            'user_id'     => $user->id,
            'action'      => 'demande.test',
            'model_type'  => Demande::class,
            'model_id'    => $demande->id,
            'description' => 'Une description',
        ]);
    }

    public function test_demande_helper_delegates_to_log(): void
    {
        $user    = User::factory()->create();
        $demande = Demande::factory()->create();
        $this->actingAs($user);

        AuditService::demande('demande.approuvee', $demande, 'Demande approuvée par Test');

        $this->assertDatabaseHas('audit_logs', [
            'action'     => 'demande.approuvee',
            'model_id'   => $demande->id,
            'model_type' => Demande::class,
        ]);
    }
}
