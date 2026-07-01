<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8"/>
    <style>
        body { font-family: Arial, sans-serif; font-size: 14px; color: #1a1a1a; margin: 0; padding: 0; background: #f5f5f5; }
        .wrapper { max-width: 600px; margin: 30px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,.08); }
        .header { background: #1B3A2D; padding: 28px 32px; text-align: center; }
        .header h1 { color: #fff; margin: 0; font-size: 20px; letter-spacing: 1px; }
        .header p { color: rgba(255,255,255,.7); margin: 4px 0 0; font-size: 13px; }
        .body { padding: 32px; }
        .badge { display: inline-block; padding: 6px 16px; border-radius: 20px; font-weight: bold; font-size: 13px; margin: 12px 0; }
        .badge-approuve { background: #d1fae5; color: #065f46; }
        .badge-rejete    { background: #fee2e2; color: #991b1b; }
        .info-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px; margin: 20px 0; }
        .info-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
        .info-row:last-child { border-bottom: none; }
        .info-label { color: #6b7280; }
        .info-value { font-weight: 600; color: #111; }
        .commentaire { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 4px; margin: 16px 0; font-size: 13px; color: #92400e; }
        .footer { background: #f9fafb; border-top: 1px solid #e5e7eb; padding: 16px 32px; text-align: center; font-size: 11px; color: #9ca3af; }
        .btn { display: inline-block; margin: 20px 0; padding: 12px 28px; background: #1B3A2D; color: #fff !important; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px; }
    </style>
</head>
<body>
<div class="wrapper">
    <div class="header">
        <h1>DGPSN</h1>
        <p>Plateforme de Gestion des Demandes Sociales</p>
    </div>
    <div class="body">
        <p>Bonjour <strong>{{ $demande->agent?->name ?? 'Agent' }}</strong>,</p>

        <p>La demande que vous avez instruite vient d'être <strong>délibérée</strong> par le comité.</p>

        <div style="text-align:center">
            <span class="badge {{ $demande->statut->value === 'approuve' ? 'badge-approuve' : 'badge-rejete' }}">
                {{ $demande->statut->label() }}
            </span>
        </div>

        <div class="info-box">
            <div class="info-row">
                <span class="info-label">Référence</span>
                <span class="info-value">{{ $demande->reference }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Bénéficiaire</span>
                <span class="info-value">{{ $demande->citoyen?->prenom }} {{ $demande->citoyen?->nom }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Type d'aide</span>
                <span class="info-value">{{ $demande->typeAide?->nom }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Délibérée le</span>
                <span class="info-value">{{ $demande->date_deliberation?->format('d/m/Y à H:i') }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Délibérée par</span>
                <span class="info-value">{{ $demande->comiteUser?->name }}</span>
            </div>
            @if($demande->montant_total)
            <div class="info-row">
                <span class="info-label">Montant total</span>
                <span class="info-value">{{ number_format($demande->montant_total, 0, ',', ' ') }} FCFA</span>
            </div>
            @endif
        </div>

        @if($demande->commentaire)
        <div class="commentaire">
            <strong>Commentaire du comité :</strong><br/>
            {{ $demande->commentaire }}
        </div>
        @endif

        @if($demande->statut->value === 'approuve')
        <p>Un <strong>bon de prise en charge</strong> a été généré. Le bénéficiaire peut se présenter chez le ou les prestataires agréés.</p>
        @endif

        <p style="color:#6b7280;font-size:13px">Connectez-vous à la plateforme pour consulter le dossier complet.</p>
    </div>
    <div class="footer">
        DGPSN — Délégation Générale à la Protection Sociale et à la Solidarité Nationale<br/>
        République du Sénégal — Cet email est envoyé automatiquement, ne pas répondre.
    </div>
</div>
</body>
</html>
