<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class LaporanKeuanganExport implements FromArray, WithStyles
{
    protected $data;

    public function __construct($data)
    {
        $this->data = $data;
    }

    public function array(): array
    {
        $rows = [
            ['LAPORAN KEUANGAN RATU MOTOR'],
            ['Periode:', $this->data['periode']['start'] . ' s/d ' . $this->data['periode']['end']],
            [''],
            ['RINGKASAN LABA RUGI'],
            ['Pemasukan dari Transaksi', $this->data['pemasukan_dari_transaksi']],
            ['Pemasukan Manual', $this->data['pemasukan_manual']],
            ['Total Pemasukan', $this->data['total_pemasukan']],
            ['Total Pengeluaran', $this->data['total_pengeluaran']],
            ['Keuntungan Kotor', $this->data['keuntungan_kotor']],
            [''],
            ['RINCIAN PENGELUARAN PER KATEGORI'],
        ];

        foreach ($this->data['pengeluaran_per_kategori'] as $item) {
            $rows[] = [$item->kategori, $item->total];
        }

        $rows[] = ['TOTAL PENGELUARAN', $this->data['total_pengeluaran']];

        return $rows;
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true, 'size' => 14]],
            4 => ['font' => ['bold' => true]],
        ];
    }
}