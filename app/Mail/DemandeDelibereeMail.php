<?php

namespace App\Mail;

use App\Models\Demande;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class DemandeDelibereeMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public readonly Demande $demande) {}

    public function envelope(): Envelope
    {
        $statut  = $this->demande->statut->label();
        $ref     = $this->demande->reference;

        return new Envelope(
            subject: "DGPSN — Demande {$ref} : {$statut}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.demande-deliberee',
        );
    }
}
