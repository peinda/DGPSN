<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8"/>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: DejaVu Sans, sans-serif; font-size: 11px; color: #1a1a1a; }

        /* En-tête */
        .header-table { width: 100%; border-bottom: 3px solid #1B3A2D; padding-bottom: 14px; margin-bottom: 18px; }
        .header-logo { width: 80px; vertical-align: middle; }
        .header-logo img { width: 75px; height: 75px; }
        .header-text { vertical-align: middle; padding-left: 12px; }
        .header-text .state { font-size: 8px; color: #555; text-transform: uppercase; letter-spacing: 1px; }
        .header-text .structure { font-size: 13px; font-weight: bold; color: #1B3A2D; margin-top: 2px; }
        .header-text .sub { font-size: 9px; color: #555; margin-top: 2px; }
        .header-ref { text-align: right; vertical-align: middle; white-space: nowrap; }
        .header-ref .ref { font-size: 16px; font-weight: bold; color: #1B3A2D; }
        .header-ref .date { font-size: 9px; color: #777; margin-top: 3px; }

        /* Titre */
        .title-box { background: #1B3A2D; color: white; text-align: center; padding: 12px; margin-bottom: 18px; border-radius: 4px; }
        .title-box h1 { font-size: 15px; font-weight: bold; letter-spacing: 1px; }
        .title-box p { font-size: 10px; margin-top: 3px; opacity: 0.8; }

        /* Sections */
        .section { margin-bottom: 14px; border: 1px solid #d1d5db; border-radius: 4px; }
        .section-header { background: #f3f4f6; padding: 6px 12px; font-size: 9px; font-weight: bold;
            text-transform: uppercase; letter-spacing: 0.5px; color: #374151;
            border-bottom: 1px solid #d1d5db; }
        .section-body { padding: 12px; }

        /* Grilles avec tables */
        .field-table { width: 100%; }
        .field-table td { vertical-align: top; padding: 3px 6px 3px 0; width: 50%; }
        .field label { font-size: 9px; color: #6b7280; display: block; text-transform: uppercase; }
        .field span { font-size: 11px; font-weight: 600; color: #111; }

        /* Table prestataires */
        .prest-table { width: 100%; border-collapse: collapse; }
        .prest-table th { background: #f9fafb; padding: 6px 10px; text-align: left; font-size: 9px;
            text-transform: uppercase; color: #6b7280; border-bottom: 1px solid #e5e7eb; }
        .prest-table td { padding: 7px 10px; font-size: 10px; border-bottom: 1px solid #f3f4f6; }
        .prest-table tr:last-child td { border-bottom: none; }
        .amount { text-align: right; font-weight: bold; }
        .total-row td { background: #f0fdf4; font-weight: bold; font-size: 11px; border-top: 2px solid #1B3A2D; }

        /* Autorisation */
        .authorization { margin: 18px 0; padding: 12px 16px; background: #f0fdf4;
            border-left: 4px solid #1B3A2D; font-size: 10px; line-height: 1.7; color: #374151; }

        /* Signatures */
        .sig-table { width: 100%; margin-top: 28px; }
        .sig-table td { width: 50%; text-align: center; padding: 0 20px; vertical-align: bottom; }
        .sig-label { font-size: 10px; font-weight: bold; color: #374151; text-transform: uppercase;
            border-bottom: 1px solid #9ca3af; padding-bottom: 38px; margin-bottom: 6px; }
        .sig-name { font-size: 10px; color: #555; }

        /* Pied de page */
        .footer { margin-top: 28px; border-top: 1px solid #e5e7eb; padding-top: 8px;
            text-align: center; font-size: 8px; color: #9ca3af; }

        .badge { display: inline-block; padding: 2px 8px; border-radius: 10px;
            font-size: 9px; font-weight: bold; background: #d1fae5; color: #065f46; }
    </style>
</head>
<body>

    <!-- En-tête -->
    <table class="header-table" cellpadding="0" cellspacing="0">
        <tr>
            <td class="header-logo">
                <img src="{{ public_path('images/logo.png') }}" alt="DGPSN" />
            </td>
            <td class="header-text">
                <div class="state">République du Sénégal — Un Peuple, Un But, Une Foi</div>
                <div class="structure">DGPSN</div>
                <div class="sub">Délégation Générale à la Protection Sociale et à la Solidarité Nationale</div>
            </td>
            <td class="header-ref">
                <div class="ref">{{ $demande->reference }}</div>
                <div class="date">Dakar, le {{ now()->locale('fr')->isoFormat('D MMMM YYYY') }}</div>
                <div style="margin-top:5px"><span class="badge">Approuvée</span></div>
            </td>
        </tr>
    </table>

    <!-- Titre -->
    <div class="title-box">
        <h1>BON DE PRISE EN CHARGE SOCIALE</h1>
        <p>Année de gestion {{ $demande->anneeGestion->annee }}</p>
    </div>

    <!-- Bénéficiaire -->
    <div class="section">
        <div class="section-header">Bénéficiaire</div>
        <div class="section-body">
            <table class="field-table" cellpadding="0" cellspacing="0">
                <tr>
                    <td><div class="field"><label>Nom complet</label><span>{{ $demande->citoyen->prenom }} {{ $demande->citoyen->nom }}</span></div></td>
                    <td><div class="field"><label>Numéro CIN</label><span>{{ $demande->citoyen->cin }}</span></div></td>
                </tr>
                <tr>
                    <td><div class="field"><label>Téléphone</label><span>{{ $demande->citoyen->telephone ?? '—' }}</span></div></td>
                    <td><div class="field"><label>Localité</label><span>{{ $demande->citoyen->commune?->nom ?? '—' }}</span></div></td>
                </tr>
                @if($demande->citoyen->adresse)
                <tr>
                    <td colspan="2"><div class="field"><label>Adresse</label><span>{{ $demande->citoyen->adresse }}</span></div></td>
                </tr>
                @endif
            </table>
        </div>
    </div>

    <!-- Nature de l'aide -->
    <div class="section">
        <div class="section-header">Nature de l'aide</div>
        <div class="section-body">
            <table class="field-table" cellpadding="0" cellspacing="0">
                <tr>
                    <td><div class="field"><label>Type d'aide</label><span>{{ $demande->typeAide->nom }}</span></div></td>
                    <td><div class="field"><label>Événement</label><span>{{ $demande->evenement?->nom ?? '—' }}</span></div></td>
                </tr>
            </table>
        </div>
    </div>

    <!-- Prestataires -->
    <div class="section">
        <div class="section-header">Prestataires agréés</div>
        <table class="prest-table" cellpadding="0" cellspacing="0">
            <thead>
                <tr>
                    <th>Prestataire</th>
                    <th>Type</th>
                    <th>Localité</th>
                    <th style="text-align:right">Montant estimé (FCFA)</th>
                </tr>
            </thead>
            <tbody>
                @foreach($demande->prestataires as $p)
                <tr>
                    <td><strong>{{ $p->nom }}</strong></td>
                    <td>{{ $p->type->label() }}</td>
                    <td>{{ $p->commune?->nom ?? $p->departement?->nom ?? '—' }}</td>
                    <td class="amount">{{ number_format($p->pivot->montant_estime, 0, ',', ' ') }}</td>
                </tr>
                @endforeach
                <tr class="total-row">
                    <td colspan="3">Total</td>
                    <td class="amount">{{ number_format($demande->montant_total, 0, ',', ' ') }} FCFA</td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- Texte d'autorisation -->
    <div class="authorization">
        Le présent bon autorise <strong>{{ $demande->citoyen->prenom }} {{ $demande->citoyen->nom }}</strong>
        (CIN : <strong>{{ $demande->citoyen->cin }}</strong>) à bénéficier d'une aide sociale de type
        <strong>« {{ $demande->typeAide->nom }} »</strong> auprès du ou des prestataires agréés susmentionnés,
        dans le cadre des programmes de solidarité nationale de la DGPSN.<br/><br/>
        Ce bon est valable pour l'année de gestion <strong>{{ $demande->anneeGestion->annee }}</strong>.
        Toute utilisation frauduleuse sera sanctionnée conformément aux lois en vigueur.
    </div>

    <!-- Signatures -->
    <table class="sig-table" cellpadding="0" cellspacing="0">
        <tr>
            <td>
                <div class="sig-label">L'Agent instructeur</div>
                <div class="sig-name">{{ $demande->agent?->name }}</div>
            </td>
            <td>
                <div class="sig-label">Le Comité de délibération</div>
                <div class="sig-name">{{ $demande->comiteUser?->name }}</div>
            </td>
        </tr>
    </table>

    <!-- Pied de page -->
    <div class="footer">
        DGPSN — Délégation Générale à la Protection Sociale et à la Solidarité Nationale — République du Sénégal<br/>
        Document généré le {{ now()->locale('fr')->isoFormat('D MMMM YYYY [à] HH:mm') }} — Réf. : {{ $demande->reference }}
    </div>

</body>
</html>
