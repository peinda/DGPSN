<?php

namespace Database\Seeders;

use App\Models\AnneeGestion;
use App\Models\Citoyen;
use App\Models\Commune;
use App\Models\Demande;
use App\Models\Evenement;
use App\Models\Prestataire;
use App\Models\TypeAide;
use App\Models\User;
use Illuminate\Database\Seeder;

class DemandesSeeder extends Seeder
{
    private const PRENOMS_H = ['Mamadou', 'Ibrahima', 'Ousmane', 'Modou', 'Cheikh', 'Abdoulaye', 'Moussa', 'Alioune', 'Babacar', 'Amadou', 'Pape', 'Assane', 'Malick', 'Serigne'];
    private const PRENOMS_F = ['Awa', 'Fatou', 'Aminata', 'Aissatou', 'Khadija', 'Ndeye', 'Bineta', 'Astou', 'Coumba', 'Marieme', 'Adama', 'Rokhaya', 'Sokhna', 'Yacine'];
    private const NOMS = ['Diop', 'Fall', 'Ndiaye', 'Sarr', 'Gueye', 'Ba', 'Sow', 'Diallo', 'Cissé', 'Kane', 'Thiam', 'Faye', 'Mbaye', 'Sy', 'Touré', 'Camara', 'Seck', 'Diagne', 'Wade', 'Niang'];
    private const PREFIXES_TEL = ['70', '71', '75', '76', '77', '78'];

    public function run(): void
    {
        $citoyens = $this->seedCitoyens();
        $this->seedDemandes($citoyens);
    }

    /** @return list<Citoyen> */
    private function seedCitoyens(): array
    {
        $communes = Commune::inRandomOrder()->limit(30)->get();
        if ($communes->isEmpty()) {
            return Citoyen::all()->all();
        }

        $citoyens = [];

        for ($i = 1; $i <= 30; $i++) {
            $estHomme = $i % 2 === 0;
            $prenom   = $estHomme ? self::PRENOMS_H[array_rand(self::PRENOMS_H)] : self::PRENOMS_F[array_rand(self::PRENOMS_F)];
            $nom      = self::NOMS[array_rand(self::NOMS)];
            $cin      = sprintf('%d%011d', random_int(1, 2), $i);
            $tel      = '+221' . self::PREFIXES_TEL[array_rand(self::PREFIXES_TEL)] . sprintf('%07d', random_int(0, 9999999));

            $citoyens[] = Citoyen::firstOrCreate(
                ['cin' => $cin],
                [
                    'nom'        => mb_strtoupper($nom),
                    'prenom'     => $prenom,
                    'telephone'  => $tel,
                    'adresse'    => null,
                    'commune_id' => $communes[($i - 1) % $communes->count()]->id,
                ]
            );
        }

        return $citoyens;
    }

    /** @param list<Citoyen> $citoyens */
    private function seedDemandes(array $citoyens): void
    {
        if (empty($citoyens)) {
            return;
        }

        $agent  = User::role('agent')->first() ?? User::first();
        $comite = User::role('comite')->first() ?? $agent;

        $typesAide = TypeAide::with('evenements')->get();
        if ($typesAide->isEmpty() || ! $agent) {
            return;
        }

        $annees = AnneeGestion::orderByDesc('annee')->get();
        $prestatairesSante = Prestataire::actif()->get();

        // statut => nombre de demandes à créer
        $repartition = [
            'brouillon' => 8,
            'soumis'    => 9,
            'en_examen' => 6,
            'approuve'  => 14,
            'rejete'    => 5,
            'cloture'   => 6,
        ];

        foreach ($repartition as $statut => $nombre) {
            for ($i = 0; $i < $nombre; $i++) {
                $citoyen  = $citoyens[array_rand($citoyens)];
                $typeAide = $typesAide->random();
                $annee    = $annees->isNotEmpty()
                    ? ($annees->firstWhere('annee', now()->year) ?? $annees->first())
                    : null;
                if (! $annee) {
                    continue;
                }

                $evenement = null;
                if ($typeAide->evenements->isNotEmpty() && random_int(1, 100) <= 70) {
                    $evenement = $typeAide->evenements->random();
                }

                $createdAt = now()->subDays(random_int(1, 270));

                $data = [
                    'citoyen_id'       => $citoyen->id,
                    'type_aide_id'     => $typeAide->id,
                    'evenement_id'     => $evenement?->id,
                    'annee_gestion_id' => $annee->id,
                    'agent_id'         => $agent->id,
                    'statut'           => $statut,
                ];

                if ($statut !== 'brouillon') {
                    $data['date_soumission'] = (clone $createdAt)->addDays(random_int(0, 3));
                }

                if (in_array($statut, ['en_examen', 'approuve', 'rejete', 'cloture'], true)) {
                    $data['comite_user_id'] = $comite->id;
                }

                if (in_array($statut, ['approuve', 'rejete', 'cloture'], true)) {
                    $data['date_deliberation'] = (clone $data['date_soumission'])->addDays(random_int(1, 10));
                }

                if ($statut === 'rejete') {
                    $data['commentaire'] = "Dossier incomplet : justificatifs insuffisants pour établir l'éligibilité du demandeur.";
                }

                if ($statut === 'approuve') {
                    $data['commentaire'] = 'Dossier conforme, prise en charge accordée par le comité de délibération.';
                }

                if ($statut === 'cloture') {
                    $data['date_cloture'] = (clone $data['date_deliberation'])->addDays(random_int(5, 30));
                }

                $demande = Demande::create($data);
                $demande->forceFill(['created_at' => $createdAt, 'updated_at' => $createdAt])->saveQuietly();

                // Prestataires liés (aide médicale/hospitalière/urgence uniquement)
                if ($typeAide->code !== 'EVENT_REL' && $prestatairesSante->isNotEmpty() && random_int(1, 100) <= 80) {
                    $nbPrestataires = min(random_int(1, 2), $prestatairesSante->count());
                    $selection      = $prestatairesSante->random($nbPrestataires);

                    $total = 0;
                    foreach ($selection as $prestataire) {
                        $montant = random_int(15, 250) * 1000;
                        $total  += $montant;

                        $demande->prestataires()->syncWithoutDetaching([
                            $prestataire->id => [
                                'montant_estime'    => $montant,
                                'confirme'          => $statut === 'cloture',
                                'date_confirmation' => $statut === 'cloture' ? $data['date_cloture'] : null,
                            ],
                        ]);
                    }

                    $demande->update(['montant_total' => $total]);
                }
            }
        }
    }
}
