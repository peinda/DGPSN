<?php

namespace Tests\Feature\Citoyens;

use App\Models\Citoyen;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\CreatesUsers;
use Tests\TestCase;

class CitoyenCrudTest extends TestCase
{
    use RefreshDatabase, CreatesUsers;

    private function validPayload(array $overrides = []): array
    {
        return array_merge([
            'cin'    => '123456789012',
            'nom'    => 'DIOP',
            'prenom' => 'Moussa',
        ], $overrides);
    }

    public function test_store_creates_citoyen_with_valid_data(): void
    {
        $this->actingAsAgent();

        $response = $this->post(route('citoyens.store'), $this->validPayload());

        $response->assertSessionDoesntHaveErrors();
        $this->assertDatabaseHas('citoyens', ['cin' => '123456789012', 'nom' => 'DIOP', 'prenom' => 'Moussa']);
    }

    public function test_store_rejects_cin_not_starting_with_1_or_2(): void
    {
        $this->actingAsAgent();

        $response = $this->post(route('citoyens.store'), $this->validPayload(['cin' => '923456789012']));

        $response->assertSessionHasErrors('cin');
    }

    public function test_store_rejects_cin_shorter_than_12_chars(): void
    {
        $this->actingAsAgent();

        $response = $this->post(route('citoyens.store'), $this->validPayload(['cin' => '1234567890']));

        $response->assertSessionHasErrors('cin');
    }

    public function test_store_rejects_duplicate_cin(): void
    {
        $this->actingAsAgent();
        Citoyen::factory()->create(['cin' => '123456789012']);

        $response = $this->post(route('citoyens.store'), $this->validPayload(['cin' => '123456789012']));

        $response->assertSessionHasErrors('cin');
    }

    public function test_store_rejects_nom_not_fully_uppercase(): void
    {
        $this->actingAsAgent();

        $response = $this->post(route('citoyens.store'), $this->validPayload(['nom' => 'Diop']));

        $response->assertSessionHasErrors('nom');
    }

    public function test_store_rejects_prenom_not_starting_with_uppercase(): void
    {
        $this->actingAsAgent();

        $response = $this->post(route('citoyens.store'), $this->validPayload(['prenom' => 'moussa']));

        $response->assertSessionHasErrors('prenom');
    }

    public function test_update_modifies_citoyen_fields(): void
    {
        $this->actingAsAgent();
        $citoyen = Citoyen::factory()->create(['nom' => 'DIOP', 'prenom' => 'Moussa']);

        $response = $this->put(route('citoyens.update', $citoyen), [
            'nom'    => 'DIOP',
            'prenom' => 'Ibrahima',
        ]);

        $response->assertRedirect();
        $this->assertEquals('Ibrahima', $citoyen->fresh()->prenom);
    }

    public function test_update_rejects_nom_not_fully_uppercase(): void
    {
        $this->actingAsAgent();
        $citoyen = Citoyen::factory()->create();

        $response = $this->put(route('citoyens.update', $citoyen), [
            'nom'    => 'Diop',
            'prenom' => 'Moussa',
        ]);

        $response->assertSessionHasErrors('nom');
    }
}
