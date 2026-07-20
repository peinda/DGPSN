<?php

namespace App\Exports;

use App\Enums\StatutDemande;
use App\Models\AnneeGestion;
use App\Models\Demande;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Color;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DemandesExport
{
    private const VERT_DGPSN = '1B3A2D';
    private const OR_DGPSN   = 'F5A623';

    public function __construct(
        private readonly ?int    $anneeGestionId,
        private readonly ?int    $typeAideId,
        private readonly ?string $statut,
    ) {}

    public function download(): StreamedResponse
    {
        $demandes = Demande::with(['citoyen.commune.departement.region', 'typeAide', 'evenement', 'anneeGestion', 'agent'])
            ->when($this->anneeGestionId, fn ($q) => $q->where('annee_gestion_id', $this->anneeGestionId))
            ->when($this->typeAideId,    fn ($q) => $q->where('type_aide_id', $this->typeAideId))
            ->when($this->statut,        fn ($q) => $q->where('statut', $this->statut))
            ->orderBy('created_at')
            ->get();

        $spreadsheet = new Spreadsheet();
        $sheet       = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Demandes');

        // --- Entête document ---
        $sheet->mergeCells('A1:R1');
        $sheet->setCellValue('A1', 'DGPSN — Rapport des Demandes de Prise en Charge Sociale');
        $sheet->getStyle('A1')->applyFromArray([
            'font'      => ['bold' => true, 'size' => 14, 'color' => ['argb' => 'FF' . self::VERT_DGPSN]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        ]);
        $sheet->getRowDimension(1)->setRowHeight(28);

        $sheet->mergeCells('A2:R2');
        $anneeLabel = $this->anneeGestionId
            ? 'Année ' . AnneeGestion::find($this->anneeGestionId)?->annee
            : 'Toutes les années';
        $sheet->setCellValue('A2', 'Généré le ' . now()->format('d/m/Y à H:i') . ' — ' . $anneeLabel);
        $sheet->getStyle('A2')->applyFromArray([
            'font'      => ['italic' => true, 'color' => ['argb' => 'FF666666']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        ]);
        $sheet->getRowDimension(2)->setRowHeight(18);

        // --- En-têtes colonnes ---
        $headers = [
            'A' => 'Référence',
            'B' => 'Date',
            'C' => 'CIN',
            'D' => 'Nom',
            'E' => 'Prénom',
            'F' => 'Sexe',
            'G' => 'Date de naissance',
            'H' => 'Âge',
            'I' => 'Cycle de vie',
            'J' => 'Téléphone',
            'K' => 'Région',
            'L' => 'Département',
            'M' => 'Commune',
            'N' => "Type d'aide",
            'O' => 'Événement',
            'P' => 'Statut',
            'Q' => 'Montant (FCFA)',
            'R' => 'Agent',
        ];

        $row = 4;
        foreach ($headers as $col => $label) {
            $sheet->setCellValue("{$col}{$row}", $label);
        }
        $sheet->getStyle("A{$row}:R{$row}")->applyFromArray([
            'font'      => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF']],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FF' . self::VERT_DGPSN]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
            'borders'   => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['argb' => 'FFFFFFFF']]],
        ]);
        $sheet->getRowDimension($row)->setRowHeight(20);

        // Colonnes contenant des numéros longs (CIN, téléphone) : forcer le type
        // texte pour éviter qu'Excel ne les convertisse en notation scientifique.
        $sheet->getStyle('C:C')->getNumberFormat()->setFormatCode('@');
        $sheet->getStyle('J:J')->getNumberFormat()->setFormatCode('@');

        // --- Données ---
        $row++;
        foreach ($demandes as $i => $d) {
            $citoyen = $d->citoyen;

            $sheet->setCellValue("A{$row}", $d->reference ?? '');
            $sheet->setCellValue("B{$row}", $d->created_at->format('d/m/Y'));
            $sheet->setCellValueExplicit("C{$row}", $citoyen?->cin ?? '', DataType::TYPE_STRING);
            $sheet->setCellValue("D{$row}", $citoyen?->nom ?? '');
            $sheet->setCellValue("E{$row}", $citoyen?->prenom ?? '');
            $sheet->setCellValue("F{$row}", $citoyen?->sexe?->label() ?? '');
            $sheet->setCellValue("G{$row}", $citoyen?->date_naissance?->format('d/m/Y') ?? '');
            $sheet->setCellValue("H{$row}", $citoyen?->age ?? '');
            $sheet->setCellValue("I{$row}", $citoyen?->cycle_vie?->label() ?? '');
            $sheet->setCellValueExplicit("J{$row}", $citoyen?->telephone ?? '', DataType::TYPE_STRING);
            $sheet->setCellValue("K{$row}", $citoyen?->commune?->departement?->region?->nom ?? '');
            $sheet->setCellValue("L{$row}", $citoyen?->commune?->departement?->nom ?? '');
            $sheet->setCellValue("M{$row}", $citoyen?->commune?->nom ?? '');
            $sheet->setCellValue("N{$row}", $d->typeAide?->nom ?? '');
            $sheet->setCellValue("O{$row}", $d->evenement?->nom ?? '');
            $sheet->setCellValue("P{$row}", $d->statut->label());
            $sheet->setCellValue("Q{$row}", (float) ($d->montant_total ?? 0));
            $sheet->setCellValue("R{$row}", $d->agent?->name ?? '');

            // Alternance couleurs + couleur statut colonne P
            $bg = $i % 2 === 0 ? 'FFFFFFFF' : 'FFF9FAFB';
            $sheet->getStyle("A{$row}:R{$row}")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB($bg);

            $statutColor = match ($d->statut) {
                StatutDemande::APPROUVE => 'FF16a34a',
                StatutDemande::REJETE   => 'FFef4444',
                StatutDemande::SOUMIS,
                StatutDemande::EN_EXAMEN => 'FF3b82f6',
                default                  => 'FF6b7280',
            };
            $sheet->getStyle("P{$row}")->getFont()->setColor(new Color($statutColor))->setBold(true);
            $sheet->getStyle("Q{$row}")->getNumberFormat()->setFormatCode('#,##0');

            $row++;
        }

        // --- Total ---
        $sheet->mergeCells("A{$row}:P{$row}");
        $sheet->setCellValue("A{$row}", 'TOTAL — ' . $demandes->count() . ' demande(s)');
        $sheet->setCellValue("Q{$row}", $demandes->sum('montant_total'));
        $sheet->getStyle("A{$row}:R{$row}")->applyFromArray([
            'font' => ['bold' => true],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FFEFF6FF']],
        ]);
        $sheet->getStyle("Q{$row}")->getNumberFormat()->setFormatCode('#,##0');

        // --- Largeurs colonnes ---
        foreach ([
            'A' => 16, 'B' => 11, 'C' => 16, 'D' => 18, 'E' => 18, 'F' => 10, 'G' => 15, 'H' => 8,
            'I' => 13, 'J' => 15, 'K' => 16, 'L' => 16, 'M' => 16, 'N' => 22, 'O' => 18, 'P' => 14, 'Q' => 16, 'R' => 20,
        ] as $col => $width) {
            $sheet->getColumnDimension($col)->setWidth($width);
        }

        // --- Bordures tableau ---
        $lastDataRow = $row;
        $sheet->getStyle("A4:R{$lastDataRow}")->getBorders()->getAllBorders()
            ->setBorderStyle(Border::BORDER_THIN)->getColor()->setARGB('FFD1D5DB');

        // --- Réponse ---
        $annee    = $this->anneeGestionId ? AnneeGestion::find($this->anneeGestionId)?->annee : 'toutes';
        $filename = "demandes-{$annee}-" . now()->format('Ymd-His') . '.xlsx';

        return response()->stream(function () use ($spreadsheet) {
            $writer = new Xlsx($spreadsheet);
            $writer->save('php://output');
        }, 200, [
            'Content-Type'        => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Cache-Control'       => 'max-age=0',
        ]);
    }
}
