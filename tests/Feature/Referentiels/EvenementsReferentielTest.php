<?php

namespace Tests\Feature\Referentiels;

use App\Models\Demande;
use App\Models\Evenement;
use App\Models\TypeAide;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\CreatesUsers;
use Tests\TestCase;

class EvenementsReferentielTest extends TestCase
{
    use RefreshDatabase, CreatesUsers;

    public function test_index_lists_evenements(): void
    {
        $this->actingAsAdministrateur();
        Evenement::factory()->create();

        $response = $this->get(route('referentiels.evenements.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->has('evenements', 1));
    }

    public function test_store_creates_evenement(): void
    {
        $this->actingAsAdministrateur();
        $type = TypeAide::factory()->create();

        $response = $this->post(route('referentiels.evenements.store'), [
            'type_aide_id' => $type->id,
            'nom'          => 'Tabaski',
            'code'         => 'TABASKI',
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('evenements', ['code' => 'TABASKI']);
    }

    public function test_store_requires_unique_code(): void
    {
        $this->actingAsAdministrateur();
        $existing = Evenement::factory()->create(['code' => 'DUP']);

        $response = $this->post(route('referentiels.evenements.store'), [
            'type_aide_id' => $existing->type_aide_id, 'nom' => 'Autre', 'code' => 'DUP',
        ]);

        $response->assertSessionHasErrors('code');
    }

    public function test_destroy_blocked_when_has_demandes(): void
    {
        $this->actingAsAdministrateur();
        $evenement = Evenement::factory()->create();
        Demande::factory()->create(['evenement_id' => $evenement->id]);

        $response = $this->delete(route('referentiels.evenements.destroy', $evenement));

        $response->assertSessionHas('error');
        $this->assertDatabaseHas('evenements', ['id' => $evenement->id]);
    }

    public function test_destroy_allowed_when_no_demandes(): void
    {
        $this->actingAsAdministrateur();
        $evenement = Evenement::factory()->create();

        $response = $this->delete(route('referentiels.evenements.destroy', $evenement));

        $response->assertSessionHas('success');
        $this->assertDatabaseMissing('evenements', ['id' => $evenement->id]);
    }
}
