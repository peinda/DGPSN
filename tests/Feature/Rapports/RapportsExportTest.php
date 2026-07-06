<?php

namespace Tests\Feature\Rapports;

use App\Models\Citoyen;
use App\Models\Demande;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\CreatesUsers;
use Tests\TestCase;

class RapportsExportTest extends TestCase
{
    use RefreshDatabase, CreatesUsers;

    public function test_export_csv_returns_utf8_bom_header_and_rows(): void
    {
        $this->actingAsAdministrateur();
        $citoyen = Citoyen::factory()->create(['nom' => 'SARR', 'prenom' => 'Aida']);
        Demande::factory()->create(['citoyen_id' => $citoyen->id]);
        Demande::factory()->create();

        $response = $this->get(route('rapports.export-csv'));

        $response->assertOk();
        $response->assertHeader('Content-Type', 'text/csv; charset=UTF-8');

        $content = $response->getContent();
        $this->assertStringStartsWith("\xEF\xBB\xBF", $content);

        $withoutBom = substr($content, 3);
        $lines      = explode("\n", trim($withoutBom));
        $header     = explode(';', $lines[0]);

        $this->assertEquals(['Référence', 'Date', 'CIN', 'Nom', 'Prénom', 'Téléphone', 'Localité', "Type d'aide", 'Événement', 'Statut', 'Montant total', 'Agent'], $header);
        $this->assertCount(3, $lines); // header + 2 data rows
        $this->assertStringContainsString('SARR', $lines[1] . $lines[2]);
    }

    public function test_export_excel_produces_valid_spreadsheet(): void
    {
        $this->actingAsAdministrateur();
        Demande::factory()->count(2)->create();

        $response = $this->get(route('rapports.export-excel'));

        $response->assertOk();
        $response->assertHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

        $tempFile = tempnam(sys_get_temp_dir(), 'xlsx');
        file_put_contents($tempFile, $response->streamedContent());

        $spreadsheet = IOFactory::load($tempFile);
        $sheet       = $spreadsheet->getActiveSheet();

        $this->assertEquals('Demandes', $sheet->getTitle());
        $this->assertEquals('Référence', $sheet->getCell('A4')->getValue());
        // header row (4) + 2 data rows + 1 total row = row 7 is the last written row
        $this->assertStringContainsString('TOTAL', (string) $sheet->getCell('A7')->getValue());

        unlink($tempFile);
    }
}
