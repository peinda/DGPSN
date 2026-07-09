<?php

namespace Tests\Feature;

use App\Models\Demande;
use App\Models\User;
use App\Notifications\DemandeDelibereeNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationsTest extends TestCase
{
    use RefreshDatabase;

    public function test_marquer_toutes_les_notifications_comme_lues(): void
    {
        $user    = User::factory()->create();
        $demande = Demande::factory()->create();
        $user->notify(new DemandeDelibereeNotification($demande));
        $user->notify(new DemandeDelibereeNotification($demande));

        $response = $this->actingAs($user)->post(route('notifications.lire'));

        $response->assertRedirect();
        $this->assertEquals(0, $user->fresh()->unreadNotifications()->count());
    }

    public function test_marquer_une_notification_comme_lue_sans_affecter_les_autres(): void
    {
        $user    = User::factory()->create();
        $demande = Demande::factory()->create();
        $user->notify(new DemandeDelibereeNotification($demande));
        $user->notify(new DemandeDelibereeNotification($demande));
        $this->actingAs($user);

        $premiere = $user->notifications()->latest()->first();

        $response = $this->post(route('notifications.lire-une', $premiere->id));

        $response->assertRedirect();
        $this->assertNotNull($premiere->fresh()->read_at);
        $this->assertEquals(1, $user->fresh()->unreadNotifications()->count());
    }
}
