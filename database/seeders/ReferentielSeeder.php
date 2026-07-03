<?php

namespace Database\Seeders;

use App\Enums\StatutAnnee;
use App\Enums\TypePrestataire;
use App\Models\AnneeGestion;
use App\Models\Commune;
use App\Models\Departement;
use App\Models\Evenement;
use App\Models\Prestataire;
use App\Models\Region;
use App\Models\TypeAide;
use Illuminate\Database\Seeder;

class ReferentielSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedRegions();
        $this->seedTypesAideEtEvenements();
        $this->seedAnneeGestion();
        $this->seedPrestataires();
    }

    private function seedRegions(): void
    {
        $regions = [
            ['nom' => 'Dakar', 'code' => 'DK', 'departements' => [
                ['nom' => 'Dakar',       'communes' => ['Dakar-Plateau', 'Médina', 'Grand-Dakar', 'HLM', 'Biscuiterie', 'Fann-Point E-Amitié', 'Gueule Tapée-Fass-Colobane', 'Sicap-Liberté', 'Dieuppeul-Derklé', 'Grand Yoff', 'Ouakam', 'Yoff', 'Ngor', 'Almadies', 'Mermoz-Sacré Cœur', 'Parcelles Assainies', 'Patte d\'Oie', 'Cambérène']],
                ['nom' => 'Guédiawaye',  'communes' => ['Guédiawaye', 'Golf Sud', 'Médina Gounass', 'Ndiarème Limamoulaye', 'Sam Notaire']],
                ['nom' => 'Pikine',      'communes' => ['Pikine Nord', 'Pikine Est', 'Pikine Ouest', 'Djida Thiaroye Kao', 'Guinaw Rails Nord', 'Guinaw Rails Sud', 'Keur Massar', 'Thiaroye sur Mer', 'Thiaroye Gare', 'Yeumbeul Nord', 'Yeumbeul Sud', 'Diamaguène Sicap Mbao', 'Mbao', 'Tivaouane Peulh-Niague', 'Malika']],
                ['nom' => 'Rufisque',    'communes' => ['Rufisque', 'Rufisque Est', 'Rufisque Nord', 'Rufisque Ouest', 'Bargny', 'Diamniadio', 'Sébikotane', 'Sangalkam', 'Yène']],
            ]],
            ['nom' => 'Thiès', 'code' => 'TH', 'departements' => [
                ['nom' => 'Thiès',    'communes' => ['Thiès Nord', 'Thiès Est', 'Thiès Ouest', 'Fandène', 'Keur Moussa', 'Ndieyène Sirakh', 'Ngoundiane', 'Noto Gouye Diama', 'Pout', 'Tassette']],
                ['nom' => 'Mbour',    'communes' => ['Mbour', 'Joal-Fadiouth', 'Malicounda', 'Ndiaganiao', 'Nguékhokh', 'Popenguine-Ndayane', 'Sandiara', 'Sessène', 'Sindia', 'Saly Portudal', 'Thiadiaye']],
                ['nom' => 'Tivaouane','communes' => ['Tivaouane', 'Méouane', 'Mérina Dakhar', 'Ngandiouf', 'Pambal', 'Pékesse', 'Phass-Ndiaye', 'Taïba Ndiaye', 'Thillé Boubacar']],
            ]],
            ['nom' => 'Diourbel', 'code' => 'DB', 'departements' => [
                ['nom' => 'Diourbel', 'communes' => ['Diourbel', 'Ndindy', 'Ndoulo', 'Taïba Ndiaye']],
                ['nom' => 'Bambey',   'communes' => ['Bambey', 'Baba Garage', 'Gawane', 'Lambaye', 'Ngoye', 'Thiakhar', 'Tocky Gare']],
                ['nom' => 'Mbacké',   'communes' => ['Mbacké', 'Touba', 'Darou Nahim', 'Sadio', 'Kael']],
            ]],
            ['nom' => 'Fatick', 'code' => 'FK', 'departements' => [
                ['nom' => 'Fatick',       'communes' => ['Fatick', 'Diakhao', 'Diarrère', 'Fimela', 'Loul Sessène', 'Niakhar', 'Palmarin Faoye', 'Tattaguine', 'Toubacouta']],
                ['nom' => 'Foundiougne',  'communes' => ['Foundiougne', 'Djilor', 'Karang', 'Keur Saloum Diané', 'Nioro du Rip', 'Sokone', 'Ndoffane']],
                ['nom' => 'Gossas',       'communes' => ['Gossas', 'Colobane', 'Dinguiraye', 'Mbar', 'Ngayokhème']],
            ]],
            ['nom' => 'Kaolack', 'code' => 'KL', 'departements' => [
                ['nom' => 'Kaolack',      'communes' => ['Kaolack', 'Kahone', 'Ndoffane', 'Ndiédieng', 'Gandiaye', 'Mbadakhoune', 'Ngothie']],
                ['nom' => 'Nioro du Rip', 'communes' => ['Nioro du Rip', 'Darou Salam', 'Keur Ayib', 'Keur Madaro', 'Paoskoto', 'Porokhane', 'Wack Ngouna', 'Médina Sabakh']],
                ['nom' => 'Guinguinéo',   'communes' => ['Guinguinéo', 'Damba Ndiaye', 'Ndiognick', 'Samba Yoro Diop', 'Sibassor']],
            ]],
            ['nom' => 'Ziguinchor', 'code' => 'ZG', 'departements' => [
                ['nom' => 'Ziguinchor', 'communes' => ['Ziguinchor', 'Niaguiss', 'Boutoupa-Camaracounda', 'Enampor', 'Niamone', 'Oulampane']],
                ['nom' => 'Bignona',    'communes' => ['Bignona', 'Kataba 1', 'Mangagoulack', 'Djibidione', 'Sindian', 'Suel', 'Tenghory', 'Thionck-Essyl']],
                ['nom' => 'Oussouye',   'communes' => ['Oussouye', 'Mlomp', 'Loudia-Wolof', 'Kabrousse', 'Santhiaba Manjaque']],
            ]],
            ['nom' => 'Saint-Louis', 'code' => 'SL', 'departements' => [
                ['nom' => 'Saint-Louis', 'communes' => ['Saint-Louis', 'Gandon', 'Mpal', 'Ndiébène Gandiole', 'Rao']],
                ['nom' => 'Dagana',      'communes' => ['Dagana', 'Mbane', 'Ngandiol', 'Richard Toll', 'Ronkh', 'Ross-Béthio', 'Syer']],
                ['nom' => 'Podor',       'communes' => ['Podor', 'Aéré Lao', 'Gamadji Saré', 'Guédé Village', 'Méri', 'Ndioum', 'Pété', 'Thillé Boubacar', 'Walaldé']],
            ]],
            ['nom' => 'Louga', 'code' => 'LG', 'departements' => [
                ['nom' => 'Louga',    'communes' => ['Louga', 'Coki', 'Guéoul', 'Kébémer', 'Léona', 'Mbédiène', 'Nguer Malal', 'Pété Ouali', 'Sakal', 'Thiamène']],
                ['nom' => 'Kébémer', 'communes' => ['Kébémer', 'Darou Mousty', 'Khombole', 'Ndande', 'Thiès Sine']],
                ['nom' => 'Linguère', 'communes' => ['Linguère', 'Barkedji', 'Dodji', 'Félo', 'Gassane', 'Mbar', 'Yang-Yang']],
            ]],
            ['nom' => 'Tambacounda', 'code' => 'TC', 'departements' => [
                ['nom' => 'Tambacounda', 'communes' => ['Tambacounda', 'Gouloumbou', 'Koussanar', 'Makacoulibantang', 'Missirah', 'Nettéboulou', 'Sinthiou Mamadou Boubou']],
                ['nom' => 'Bakel',       'communes' => ['Bakel', 'Bélé', 'Diawara', 'Kidira', 'Moudéry', 'Sinthiou Fissa', 'Tomboronkoto']],
                ['nom' => 'Goudiry',     'communes' => ['Goudiry', 'Bala', 'Boynguel Bamba', 'Dianké Makhan', 'Goudiry', 'Koulor', 'Samba Lala']],
                ['nom' => 'Koumpentoum','communes' => ['Koumpentoum', 'Malem Niani', 'Ndame', 'Payar', 'Sinthiou Koundara']],
            ]],
            ['nom' => 'Kolda', 'code' => 'KD', 'departements' => [
                ['nom' => 'Kolda',           'communes' => ['Kolda', 'Bagadadji', 'Dioulacolon', 'Médina Cherif', 'Médina El Hadj', 'Sakar', 'Sare Bidji', 'Sare Yoro Bana', 'Tankanto Escale']],
                ['nom' => 'Médina Yoro Fula','communes' => ['Médina Yoro Fula', 'Dabo', 'Fafacourou', 'Koulinto', 'Ngari', 'Pata']],
                ['nom' => 'Vélingara',       'communes' => ['Vélingara', 'Anambé', 'Bonconto', 'Diaobé-Kabendou', 'Dialambéré', 'Kandiaye', 'Linkering', 'Pakour', 'Saré Coly Sallé']],
            ]],
            ['nom' => 'Matam', 'code' => 'MT', 'departements' => [
                ['nom' => 'Matam',        'communes' => ['Matam', 'Agnam-Civol', 'Dondé', 'Ogo', 'Oréfondé', 'Ourossogui', 'Semme', 'Thilogne', 'Waounde']],
                ['nom' => 'Kanel',        'communes' => ['Kanel', 'Aouré', 'Bodé Lao', 'Dabia', 'Hamady Hounaré', 'Orkadiéré', 'Sinthiou Bamambé-Banadji', 'Yang-Yang']],
                ['nom' => 'Ranérou Ferlo','communes' => ['Ranérou', 'Lougré-Thiolly', 'Oudalaye', 'Vélingara Ferlo']],
            ]],
            ['nom' => 'Kaffrine', 'code' => 'KF', 'departements' => [
                ['nom' => 'Kaffrine',     'communes' => ['Kaffrine', 'Diamal', 'Gniby', 'Kathiotte', 'Mabo', 'Nganda', 'Touba Mbella']],
                ['nom' => 'Birkelane',    'communes' => ['Birkelane', 'Kahi', 'Lambel', 'Ndioum Ngoundoum', 'Ndiognick']],
                ['nom' => 'Koungheul',    'communes' => ['Koungheul', 'Ida Mouride', 'Lour Escale', 'Missirah Wadene', 'Ndiognick', 'Ribot Escale', 'Saly Escale']],
                ['nom' => 'Malem Hoddar', 'communes' => ['Malem Hoddar', 'Darou Minam II', 'Kouloffane', 'Médinatoul Salam 2', 'Ndiongolor', 'Sagna']],
            ]],
            ['nom' => 'Kédougou', 'code' => 'KG', 'departements' => [
                ['nom' => 'Kédougou', 'communes' => ['Kédougou', 'Bandafassi', 'Dimboli', 'Fongolimbi', 'Khossanto', 'Ninéfécha', 'Tomboronkoto']],
                ['nom' => 'Saraya',   'communes' => ['Saraya', 'Bembou', 'Dialafara', 'Diakha Madina', 'Gabou', 'Khossanto', 'Missirah Tabadian']],
                ['nom' => 'Salémata', 'communes' => ['Salémata', 'Dakateli', 'Ethiolo', 'Kévoye', 'Oubadji', 'Siwol', 'Tébérébie']],
            ]],
            ['nom' => 'Sédhiou', 'code' => 'SD', 'departements' => [
                ['nom' => 'Sédhiou',   'communes' => ['Sédhiou', 'Bambali', 'Diambati', 'Diender', 'Karantaba', 'Marsassoum', 'Niamone', 'Oulampane', 'Samine']],
                ['nom' => 'Bounkiling','communes' => ['Bounkiling', 'Boghal', 'Diacounda', 'Madina Wandifa', 'Niaming', 'Sibalon']],
                ['nom' => 'Goudomp',   'communes' => ['Goudomp', 'Diattacounda', 'Kabrousse', 'Kataba 1', 'Niafor', 'Simbandi Balante', 'Simbandi Brassou', 'Tanaff']],
            ]],
        ];

        foreach ($regions as $data) {
            $region = Region::firstOrCreate(
                ['code' => $data['code']],
                ['nom'  => $data['nom']]
            );

            foreach ($data['departements'] as $j => $dep) {
                $codeDepNo = str_pad($j + 1, 2, '0', STR_PAD_LEFT);
                $departement = Departement::firstOrCreate(
                    ['code'      => $data['code'] . '-' . $codeDepNo],
                    ['region_id' => $region->id, 'nom' => $dep['nom']]
                );

                foreach ($dep['communes'] as $k => $nomCommune) {
                    $codeCommune = $data['code'] . '-' . $codeDepNo . '-' . str_pad($k + 1, 3, '0', STR_PAD_LEFT);
                    Commune::firstOrCreate(
                        ['code'           => $codeCommune],
                        ['departement_id' => $departement->id, 'nom' => $nomCommune]
                    );
                }
            }
        }
    }

    private function seedTypesAideEtEvenements(): void
    {
        $catalogue = [
            [
                'nom'              => 'Événements religieux',
                'code'             => 'EVENT_REL',
                'description'      => 'Aides distribuées à l\'occasion des fêtes religieuses.',
                'requiert_periode' => true,
                'evenements'       => [
                    ['nom' => 'Tabaski',  'code' => 'TABASKI'],
                    ['nom' => 'Korité',   'code' => 'KORITE'],
                    ['nom' => 'Gamou',    'code' => 'GAMOU'],
                    ['nom' => 'Maouloud', 'code' => 'MAOULOUD'],
                    ['nom' => 'Magal',    'code' => 'MAGAL'],
                ],
            ],
            [
                'nom'              => 'Assistance médicale',
                'code'             => 'ASSIST_MED',
                'description'      => 'Prise en charge d\'ordonnances médicales pour personnes vulnérables.',
                'requiert_periode' => false,
                'evenements'       => [
                    ['nom' => 'Aide médicale générale', 'code' => 'MED_GENERAL'],
                ],
            ],
            [
                'nom'              => 'Prise en charge hospitalière',
                'code'             => 'HOSP',
                'description'      => 'Frais d\'hospitalisation pour indigents.',
                'requiert_periode' => false,
                'evenements'       => [
                    ['nom' => 'Hospitalisation', 'code' => 'HOSP_GENERAL'],
                ],
            ],
            [
                'nom'              => 'Urgence sociale',
                'code'             => 'URGENCE',
                'description'      => 'Aides exceptionnelles pour situations d\'urgence.',
                'requiert_periode' => false,
                'evenements'       => [
                    ['nom' => 'Aide d\'urgence', 'code' => 'URGENCE_GENERAL'],
                ],
            ],
        ];

        foreach ($catalogue as $item) {
            $type = TypeAide::firstOrCreate(
                ['code' => $item['code']],
                ['nom' => $item['nom'], 'description' => $item['description'], 'actif' => true, 'requiert_periode' => $item['requiert_periode']]
            );
            $type->update(['requiert_periode' => $item['requiert_periode']]);

            foreach ($item['evenements'] as $ev) {
                Evenement::firstOrCreate(
                    ['code'         => $ev['code']],
                    ['type_aide_id' => $type->id, 'nom' => $ev['nom'], 'actif' => true]
                );
            }
        }
    }

    private function seedAnneeGestion(): void
    {
        AnneeGestion::firstOrCreate(
            ['annee' => 2025],
            [
                'statut'         => StatutAnnee::OUVERT,
                'date_ouverture' => '2025-01-01',
            ]
        );

        AnneeGestion::firstOrCreate(
            ['annee' => 2026],
            [
                'statut'         => StatutAnnee::OUVERT,
                'date_ouverture' => '2026-01-01',
            ]
        );
    }

    private function seedPrestataires(): void
    {
        $prestataires = [
            ['nom' => 'Hôpital Aristide Le Dantec',        'type' => TypePrestataire::HOPITAL,   'commune' => 'Dakar-Plateau',  'telephone' => '338211100'],
            ['nom' => 'Hôpital Principal de Dakar',        'type' => TypePrestataire::HOPITAL,   'commune' => 'Dakar-Plateau',  'telephone' => '338399292'],
            ['nom' => 'Hôpital Général de Grand Yoff',     'type' => TypePrestataire::HOPITAL,   'commune' => 'Grand Yoff',     'telephone' => '338592727'],
            ['nom' => 'Hôpital Abass Ndao',                'type' => TypePrestataire::HOPITAL,   'commune' => 'Médina',         'telephone' => '338219071'],
            ['nom' => 'Centre Hospitalier Régional Thiès', 'type' => TypePrestataire::HOPITAL,   'commune' => 'Thiès Nord',     'telephone' => '339512345'],
            ['nom' => 'Clinique de la Madeleine',          'type' => TypePrestataire::CLINIQUE,  'commune' => 'Fann-Point E-Amitié', 'telephone' => '338215566'],
            ['nom' => 'Clinique Pasteur',                  'type' => TypePrestataire::CLINIQUE,  'commune' => 'Mermoz-Sacré Cœur',   'telephone' => '338602020'],
            ['nom' => 'Clinique du Cap',                   'type' => TypePrestataire::CLINIQUE,  'commune' => 'Almadies',       'telephone' => '338697070'],
            ['nom' => 'Pharmacie Guigon',                  'type' => TypePrestataire::PHARMACIE, 'commune' => 'Dakar-Plateau',  'telephone' => '338215050'],
            ['nom' => 'Pharmacie du Point E',               'type' => TypePrestataire::PHARMACIE, 'commune' => 'Fann-Point E-Amitié', 'telephone' => '338254040'],
            ['nom' => 'Pharmacie Sacré Cœur',              'type' => TypePrestataire::PHARMACIE, 'commune' => 'Mermoz-Sacré Cœur',   'telephone' => '338697171'],
            ['nom' => 'Pharmacie Guédiawaye',              'type' => TypePrestataire::PHARMACIE, 'commune' => 'Guédiawaye',     'telephone' => '338361212'],

            // Thiès
            ['nom' => 'Centre Hospitalier Régional de Mbour', 'type' => TypePrestataire::HOPITAL,   'commune' => 'Mbour',    'telephone' => '339571010'],
            ['nom' => 'Pharmacie de Thiès',                   'type' => TypePrestataire::PHARMACIE, 'commune' => 'Thiès Nord', 'telephone' => '339511212'],

            // Diourbel
            ['nom' => 'Hôpital Matlaboul Fawzeyni',        'type' => TypePrestataire::HOPITAL,   'commune' => 'Touba',    'telephone' => '339781010'],
            ['nom' => 'Centre Hospitalier de Diourbel',    'type' => TypePrestataire::HOPITAL,   'commune' => 'Diourbel', 'telephone' => '339711010'],
            ['nom' => 'Pharmacie de Touba',                'type' => TypePrestataire::PHARMACIE, 'commune' => 'Touba',    'telephone' => '339781313'],

            // Fatick
            ['nom' => 'Hôpital Régional de Fatick',        'type' => TypePrestataire::HOPITAL,   'commune' => 'Fatick',   'telephone' => '339491010'],
            ['nom' => 'Pharmacie de Fatick',                'type' => TypePrestataire::PHARMACIE, 'commune' => 'Fatick',   'telephone' => '339491414'],

            // Kaolack
            ['nom' => 'Hôpital El Hadji Ibrahima Niasse',  'type' => TypePrestataire::HOPITAL,   'commune' => 'Kaolack',  'telephone' => '339411010'],
            ['nom' => 'Pharmacie de Kaolack',               'type' => TypePrestataire::PHARMACIE, 'commune' => 'Kaolack',  'telephone' => '339411515'],

            // Ziguinchor
            ['nom' => 'Hôpital de la Paix de Ziguinchor',  'type' => TypePrestataire::HOPITAL,   'commune' => 'Ziguinchor', 'telephone' => '339911010'],
            ['nom' => 'Pharmacie de Ziguinchor',            'type' => TypePrestataire::PHARMACIE, 'commune' => 'Ziguinchor', 'telephone' => '339911616'],

            // Saint-Louis
            ['nom' => 'Hôpital Régional de Saint-Louis',   'type' => TypePrestataire::HOPITAL,   'commune' => 'Saint-Louis', 'telephone' => '339611010'],
            ['nom' => 'Pharmacie de Saint-Louis',           'type' => TypePrestataire::PHARMACIE, 'commune' => 'Saint-Louis', 'telephone' => '339611717'],

            // Louga
            ['nom' => 'Hôpital Amadou Sakhir Ndieguène',   'type' => TypePrestataire::HOPITAL,   'commune' => 'Louga',    'telephone' => '339671010'],
            ['nom' => 'Pharmacie de Louga',                 'type' => TypePrestataire::PHARMACIE, 'commune' => 'Louga',    'telephone' => '339671818'],

            // Tambacounda
            ['nom' => 'Hôpital Régional Maguette Lô',      'type' => TypePrestataire::HOPITAL,   'commune' => 'Tambacounda', 'telephone' => '339811010'],
            ['nom' => 'Pharmacie de Tambacounda',           'type' => TypePrestataire::PHARMACIE, 'commune' => 'Tambacounda', 'telephone' => '339811919'],

            // Kolda
            ['nom' => 'Hôpital Régional de Kolda',         'type' => TypePrestataire::HOPITAL,   'commune' => 'Kolda',    'telephone' => '339961010'],
            ['nom' => 'Pharmacie de Kolda',                 'type' => TypePrestataire::PHARMACIE, 'commune' => 'Kolda',    'telephone' => '339962020'],

            // Matam
            ['nom' => 'Hôpital Régional de Matam',         'type' => TypePrestataire::HOPITAL,   'commune' => 'Matam',    'telephone' => '339661010'],
            ['nom' => 'Pharmacie de Matam',                 'type' => TypePrestataire::PHARMACIE, 'commune' => 'Matam',    'telephone' => '339662121'],

            // Kaffrine
            ['nom' => 'Hôpital Régional de Kaffrine',      'type' => TypePrestataire::HOPITAL,   'commune' => 'Kaffrine', 'telephone' => '339461010'],
            ['nom' => 'Pharmacie de Kaffrine',               'type' => TypePrestataire::PHARMACIE, 'commune' => 'Kaffrine', 'telephone' => '339462222'],

            // Kédougou
            ['nom' => 'Hôpital Régional de Kédougou',      'type' => TypePrestataire::HOPITAL,   'commune' => 'Kédougou', 'telephone' => '339851010'],
            ['nom' => 'Pharmacie de Kédougou',               'type' => TypePrestataire::PHARMACIE, 'commune' => 'Kédougou', 'telephone' => '339852323'],

            // Sédhiou
            ['nom' => 'Hôpital Régional de Sédhiou',       'type' => TypePrestataire::HOPITAL,   'commune' => 'Sédhiou',  'telephone' => '339951010'],
            ['nom' => 'Pharmacie de Sédhiou',                'type' => TypePrestataire::PHARMACIE, 'commune' => 'Sédhiou',  'telephone' => '339952424'],
        ];

        foreach ($prestataires as $data) {
            $commune = Commune::where('nom', $data['commune'])->first();

            Prestataire::firstOrCreate(
                ['nom' => $data['nom']],
                [
                    'type'           => $data['type'],
                    'telephone'      => $data['telephone'],
                    'email'          => null,
                    'adresse'        => null,
                    'region_id'      => $commune?->departement?->region_id,
                    'departement_id' => $commune?->departement_id,
                    'commune_id'     => $commune?->id,
                    'actif'          => true,
                ]
            );
        }
    }
}
