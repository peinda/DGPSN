<?php

namespace Tests\Feature\Parametres;

use App\Models\TypeAide;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\CreatesUsers;
use Tests\TestCase;

class ParametresTest extends TestCase
{
    use RefreshDatabase, CreatesUsers;

    public function test_index_exposes_types_aide_only_for_administrateur(): void
    {
        $this->actingAsAdministrateur();
        TypeAide::factory()->create();

        $response = $this->get(route('parametres.index'));

        $response->assertInertia(fn ($page) => $page
            ->where('isAdmin', true)
            ->has('typesAide', 1));
    }

    public function test_index_hides_types_aide_for_agent(): void
    {
        $this->actingAsAgent();
        TypeAide::factory()->create();

        $response = $this->get(route('parametres.index'));

        $response->assertInertia(fn ($page) => $page
            ->where('isAdmin', false)
            ->has('typesAide', 0));
    }

    public function test_update_profil_requires_unique_email_ignoring_self(): void
    {
        $user = $this->actingAsAgent();
        $other = User::factory()->create();

        $response = $this->put(route('parametres.update-profil'), [
            'name'  => $user->name,
            'email' => $other->email,
        ]);
        $response->assertSessionHasErrors('email');

        // updating with own current email should succeed
        $response = $this->put(route('parametres.update-profil'), [
            'name'  => 'Nouveau Nom',
            'email' => $user->email,
        ]);
        $response->assertSessionHas('success');
        $this->assertEquals('Nouveau Nom', $user->fresh()->name);
    }

    public function test_update_password_requires_correct_current_password(): void
    {
        $user = $this->actingAsAgent(['password' => bcrypt('correct-password')]);

        $response = $this->put(route('parametres.update-password'), [
            'current_password'      => 'wrong-password',
            'password'              => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        $response->assertSessionHasErrors('current_password');
    }

    public function test_update_password_success(): void
    {
        $user = $this->actingAsAgent(['password' => bcrypt('correct-password')]);

        $response = $this->put(route('parametres.update-password'), [
            'current_password'      => 'correct-password',
            'password'              => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        $response->assertSessionHas('success');
        $this->assertTrue(\Illuminate\Support\Facades\Hash::check('newpassword123', $user->fresh()->password));
    }
}
