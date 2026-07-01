<?php

namespace App\Notifications;

use App\Mail\DemandeDelibereeMail;
use App\Models\Demande;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class DemandeDelibereeNotification extends Notification
{
    use Queueable;

    public function __construct(private readonly Demande $demande) {}

    public function via(object $notifiable): array
    {
        $channels = ['database'];

        $mailer = config('mail.default');
        if (! in_array($mailer, ['log', 'array']) && ! empty($notifiable->email)) {
            $channels[] = 'mail';
        }

        return $channels;
    }

    public function toMail(object $notifiable): DemandeDelibereeMail
    {
        return (new DemandeDelibereeMail($this->demande))->to($notifiable->email);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'demande_id'  => $this->demande->id,
            'reference'   => $this->demande->reference,
            'statut'      => $this->demande->statut->value,
            'message'     => "La demande {$this->demande->reference} a été {$this->demande->statut->label()}.",
            'commentaire' => $this->demande->commentaire,
        ];
    }
}
