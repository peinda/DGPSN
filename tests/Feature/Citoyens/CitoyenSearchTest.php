<?php

namespace Tests\Feature\Citoyens;

use App\Models\Citoyen;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\CreatesUsers;
use Tests\TestCase;

class CitoyenSearchTest extends TestCase
{
    use RefreshDatabase, CreatesUsers;

    public function test_search_returns_null_for_cin_shorter_than_3_chars(): void
    {
        $this->actingAsAgent();
        Citoyen::factory()->create(['cin' => '123456789012']);

        $response = $this->getJson(route('citoyens.search', ['cin' => '12']));

        // Symfony's JsonResponse coerces a null payload to an empty ArrayObject, so the
        // wire response is the literal object "{}", not the JSON scalar "null".
        $response->assertOk();
        $response->assertContent('{}');
    }

    public function test_search_finds_exact_cin_match_with_geo_relations(): void
    {
        $this->actingAsAgent();
        $citoyen = Citoyen::factory()->create(['cin' => '123456789012']);

        $response = $this->getJson(route('citoyens.search', ['cin' => '123456789012']));

        $response->assertOk();
        $response->assertJsonFragment(['id' => $citoyen->id, 'cin' => '123456789012']);
    }

    public function test_search_returns_null_when_no_match(): void
    {
        $this->actingAsAgent();

        $response = $this->getJson(route('citoyens.search', ['cin' => '999999999999']));

        $response->assertOk();
        $response->assertContent('{}');
    }

    public function test_index_search_matches_across_cin_nom_prenom(): void
    {
        $this->actingAsAgent();
        $match = Citoyen::factory()->create(['nom' => 'FALL', 'prenom' => 'Awa']);
        Citoyen::factory()->create(['nom' => 'SARR', 'prenom' => 'Moussa']);

        $response = $this->get(route('citoyens.index', ['search' => 'FALL']));

        $response->assertInertia(fn ($page) => $page
            ->has('citoyens.data', 1)
            ->where('citoyens.data.0.id', $match->id));
    }

    public function test_index_paginates_results(): void
    {
        $this->actingAsAgent();
        Citoyen::factory()->count(25)->create();

        $response = $this->get(route('citoyens.index'));

        $response->assertInertia(fn ($page) => $page
            ->has('citoyens.data', 20)
            ->where('citoyens.total', 25));
    }
}
