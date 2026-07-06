<?php

namespace Tests\Feature\Referentiels;

use App\Models\Evenement;
use App\Models\TypeAide;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\CreatesUsers;
use Tests\TestCase;

class TypesAideReferentielTest extends TestCase
{
    use RefreshDatabase, CreatesUsers;

    public function test_index_lists_types_aide(): void
    {
        $this->actingAsAdministrateur();
        TypeAide::factory()->create(['nom' => 'Aide Médicale']);

        $response = $this->get(route('referentiels.types-aide.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->has('typesAide', 1));
    }

    public function test_store_creates_type_aide(): void
    {
        $this->actingAsAdministrateur();

        $response = $this->post(route('referentiels.types-aide.store'), [
            'nom'  => 'Aide Scolaire',
            'code' => 'SCOL',
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('types_aide', ['code' => 'SCOL']);
    }

    public function test_store_requires_unique_code(): void
    {
        $this->actingAsAdministrateur();
        TypeAide::factory()->create(['code' => 'DUP']);

        $response = $this->post(route('referentiels.types-aide.store'), [
            'nom' => 'Autre', 'code' => 'DUP',
        ]);

        $response->assertSessionHasErrors('code');
    }

    public function test_update_modifies_type_aide(): void
    {
        $this->actingAsAdministrateur();
        $type = TypeAide::factory()->create();

        $response = $this->put(route('referentiels.types-aide.update', $type), [
            'nom' => 'Nom modifié', 'code' => $type->code,
        ]);

        $response->assertSessionHas('success');
        $this->assertEquals('Nom modifié', $type->fresh()->nom);
    }

    public function test_destroy_blocked_when_has_evenements(): void
    {
        $this->actingAsAdministrateur();
        $type = TypeAide::factory()->create();
        Evenement::factory()->create(['type_aide_id' => $type->id]);

        $response = $this->delete(route('referentiels.types-aide.destroy', $type));

        $response->assertSessionHas('error');
        $this->assertDatabaseHas('types_aide', ['id' => $type->id]);
    }

    public function test_destroy_allowed_when_no_evenements(): void
    {
        $this->actingAsAdministrateur();
        $type = TypeAide::factory()->create();

        $response = $this->delete(route('referentiels.types-aide.destroy', $type));

        $response->assertSessionHas('success');
        $this->assertDatabaseMissing('types_aide', ['id' => $type->id]);
    }

    public function test_toggle_flips_actif(): void
    {
        $this->actingAsAdministrateur();
        $type = TypeAide::factory()->create(['actif' => true]);

        $this->patch(route('referentiels.types-aide.toggle', $type));

        $this->assertFalse((bool) $type->fresh()->actif);
    }
}
