<?php

namespace App\Exports;

use App\Enums\StatutDemande;
use App\Models\AnneeGestion;
use App\Models\Demande;
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
        $demandes = Demande::with(['citoyen.commune', 'typeAide', 'evenement', 'anneeGestion', 'agent'])
            ->when($this->anneeGestionId, fn ($q) => $q->where('annee_gestion_id', $this->anneeGestionId))
            ->when($this->typeAideId,    fn ($q) => $q->where('type_aide_id', $this->typeAideId))
            ->when($this->statut,        fn ($q) => $q->where('statut', $this->statut))
            ->orderBy('created_at')
            ->get();

        $spreadsheet = new Spreadsheet();
        $sheet       = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Demandes');

        // --- Entête document ---
        $sheet->mergeCells('A1:L1');
        $sheet->setCellValue('A1', 'DGPSN — Rapport des Demandes de Prise en Charge Sociale');
        $sheet->getStyle('A1')->applyFromArray([
            'font'      => ['bold' => true, 'size' => 14, 'color' => ['argb' => 'FF' . self::VERT_DGPSN]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        ]);
        $sheet->getRowDimension(1)->setRowHeight(28);

        $sheet->mergeCells('A2:L2');
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
            'F' => 'Téléphone',
            'G' => 'Localité',
            'H' => "Type d'aide",
            'I' => 'Événement',
            'J' => 'Statut',
            'K' => 'Montant (FCFA)',
            'L' => 'Agent',
        ];

        $row = 4;
        foreach ($headers as $col => $label) {
            $sheet->setCellValue("{$col}{$row}", $label);
        }
        $sheet->getStyle("A{$row}:L{$row}")->applyFromArray([
            'font'      => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF']],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FF' . self::VERT_DGPSN]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
            'borders'   => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['argb' => 'FFFFFFFF']]],
        ]);
        $sheet->getRowDimension($row)->setRowHeight(20);

        // --- Données ---
        $row++;
        foreach ($demandes as $i => $d) {
            $sheet->setCellValue("A{$row}", $d->reference ?? '');
            $sheet->setCellValue("B{$row}", $d->created_at->format('d/m/Y'));
            $sheet->setCellValue("C{$row}", $d->citoyen?->cin ?? '');
            $sheet->setCellValue("D{$row}", $d->citoyen?->nom ?? '');
            $sheet->setCellValue("E{$row}", $d->citoyen?->prenom ?? '');
            $sheet->setCellValue("F{$row}", $d->citoyen?->telephone ?? '');
            $sheet->setCellValue("G{$row}", $d->citoyen?->commune?->nom ?? '');
            $sheet->setCellValue("H{$row}", $d->typeAide?->nom ?? '');
            $sheet->setCellValue("I{$row}", $d->evenement?->nom ?? '');
            $sheet->setCellValue("J{$row}", $d->statut->label());
            $sheet->setCellValue("K{$row}", (float) ($d->montant_total ?? 0));
            $sheet->setCellValue("L{$row}", $d->agent?->name ?? '');

            // Alternance couleurs + couleur statut colonne J
            $bg = $i % 2 === 0 ? 'FFFFFFFF' : 'FFF9FAFB';
            $sheet->getStyle("A{$row}:L{$row}")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB($bg);

            $statutColor = match ($d->statut) {
                StatutDemande::APPROUVE => 'FF16a34a',
                StatutDemande::REJETE   => 'FFef4444',
                StatutDemande::SOUMIS,
                StatutDemande::EN_EXAMEN => 'FF3b82f6',
                default                  => 'FF6b7280',
            };
            $sheet->getStyle("J{$row}")->getFont()->setColor(new Color($statutColor))->setBold(true);
            $sheet->getStyle("K{$row}")->getNumberFormat()->setFormatCode('#,##0');

            $row++;
        }

        // --- Total ---
        $sheet->mergeCells("A{$row}:J{$row}");
        $sheet->setCellValue("A{$row}", 'TOTAL — ' . $demandes->count() . ' demande(s)');
        $sheet->setCellValue("K{$row}", $demandes->sum('montant_total'));
        $sheet->getStyle("A{$row}:L{$row}")->applyFromArray([
            'font' => ['bold' => true],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FFEFF6FF']],
        ]);
        $sheet->getStyle("K{$row}")->getNumberFormat()->setFormatCode('#,##0');

        // --- Largeurs colonnes ---
        foreach (['A' => 16, 'B' => 11, 'C' => 16, 'D' => 18, 'E' => 18, 'F' => 14, 'G' => 16, 'H' => 22, 'I' => 18, 'J' => 14, 'K' => 16, 'L' => 20] as $col => $width) {
            $sheet->getColumnDimension($col)->setWidth($width);
        }

        // --- Bordures tableau ---
        $lastDataRow = $row;
        $sheet->getStyle("A4:L{$lastDataRow}")->getBorders()->getAllBorders()
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
