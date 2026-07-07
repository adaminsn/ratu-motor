<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Laporan Keuangan Ratu Motor</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Arial', sans-serif;
            background: #fff;
            padding: 30px;
            font-size: 13px;
            color: #333;
        }
        .container {
            max-width: 1000px;
            margin: 0 auto;
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #f97316;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }
        .header h1 {
            font-size: 26px;
            color: #1a2f4f;
        }
        .header p {
            color: #6b7280;
            font-size: 12px;
            margin-top: 4px;
        }
        .periode {
            text-align: center;
            background: #f9fafb;
            padding: 10px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-weight: 500;
            color: #1a2f4f;
        }
        .section-title {
            font-size: 16px;
            font-weight: 700;
            color: #1a2f4f;
            margin: 20px 0 12px 0;
            padding-bottom: 6px;
            border-bottom: 2px solid #e5e7eb;
        }
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            margin-bottom: 20px;
        }
        .summary-card {
            background: #f9fafb;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            border-left: 4px solid #1a2f4f;
        }
        .summary-card.orange {
            border-left-color: #f97316;
        }
        .summary-card.green {
            border-left-color: #10b981;
        }
        .summary-card.red {
            border-left-color: #ef4444;
        }
        .summary-card .label {
            font-size: 11px;
            color: #6b7280;
            text-transform: uppercase;
            font-weight: 600;
        }
        .summary-card .value {
            font-size: 18px;
            font-weight: 700;
            margin-top: 4px;
        }
        .summary-card .value.green {
            color: #10b981;
        }
        .summary-card .value.orange {
            color: #f97316;
        }
        .summary-card .value.red {
            color: #ef4444;
        }
        .summary-card .value.blue {
            color: #1a2f4f;
        }
        .table {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0 20px 0;
        }
        .table th {
            background: #1a2f4f;
            color: #fff;
            padding: 10px 14px;
            text-align: left;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .table td {
            padding: 8px 14px;
            border-bottom: 1px solid #e5e7eb;
        }
        .table .total-row td {
            font-weight: 700;
            font-size: 14px;
            border-top: 2px solid #1a2f4f;
            padding-top: 10px;
        }
        .table .total-row .label {
            color: #1a2f4f;
        }
        .table .total-row .value {
            color: #f97316;
        }
        .table .kategori-row td {
            background: #f9fafb;
        }
        .table .kategori-row .kategori-label {
            font-weight: 500;
            text-transform: capitalize;
        }
        .table .kategori-row .kategori-value {
            font-weight: 600;
        }
        .text-right {
            text-align: right;
        }
        .text-center {
            text-align: center;
        }
        .text-muted {
            color: #6b7280;
        }
        .font-bold {
            font-weight: 700;
        }
        .capitalize {
            text-transform: capitalize;
        }
        .mt-2 {
            margin-top: 6px;
        }
        .mb-2 {
            margin-bottom: 6px;
        }
        .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 11px;
        }
        .signature {
            margin-top: 20px;
            display: flex;
            justify-content: space-around;
        }
        .signature div {
            text-align: center;
        }
        .signature .line {
            width: 120px;
            border-bottom: 1px solid #333;
            margin: 30px auto 6px;
        }
        .signature .label {
            font-size: 11px;
            color: #6b7280;
        }
    </style>
</head>
<body>
    <div class="container">

        <!-- HEADER -->
        <div class="header">
            <h1>RATU MOTOR</h1>
            <p>Showroom &amp; Service Center Banyuwangi</p>
            <p style="font-size: 10px; color: #9ca3af; margin-top: 2px;">
                Jl. Raya Banyuwangi No. 123 | Telp: 0812-3456-7890
            </p>
        </div>

        <!-- PERIODE -->
        <div class="periode">
            Laporan Keuangan Periode: {{ $periode['start'] }} s/d {{ $periode['end'] }}
        </div>

        <!-- SUMMARY CARDS -->
        <div class="summary-grid">
            <div class="summary-card green">
                <div class="label">Total Pemasukan</div>
                <div class="value green">Rp {{ number_format($total_pemasukan, 0, ',', '.') }}</div>
            </div>
            <div class="summary-card red">
                <div class="label">Total Pengeluaran</div>
                <div class="value red">Rp {{ number_format($total_pengeluaran, 0, ',', '.') }}</div>
            </div>
            <div class="summary-card orange">
                <div class="label">Keuntungan Kotor</div>
                <div class="value orange">Rp {{ number_format($keuntungan_kotor, 0, ',', '.') }}</div>
            </div>
        </div>

        <!-- DETAIL LABA RUGI -->
        <div class="section-title">Detail Laba Rugi</div>
        <table class="table">
            <thead>
                <tr>
                    <th style="width: 50%;">Keterangan</th>
                    <th class="text-right">Jumlah</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Pemasukan dari Transaksi Penjualan</td>
                    <td class="text-right font-bold">Rp {{ number_format($pemasukan_dari_transaksi, 0, ',', '.') }}</td>
                </tr>
                <tr>
                    <td>Pemasukan Manual (Tambahan)</td>
                    <td class="text-right font-bold">Rp {{ number_format($pemasukan_manual, 0, ',', '.') }}</td>
                </tr>
                <tr style="border-top: 1px solid #d1d5db;">
                    <td><strong>Total Pemasukan</strong></td>
                    <td class="text-right font-bold" style="color: #10b981; font-size: 15px;">
                        Rp {{ number_format($total_pemasukan, 0, ',', '.') }}
                    </td>
                </tr>
                <tr>
                    <td>Total Pengeluaran</td>
                    <td class="text-right font-bold" style="color: #ef4444;">
                        Rp {{ number_format($total_pengeluaran, 0, ',', '.') }}
                    </td>
                </tr>
                <tr style="border-top: 2px solid #1a2f4f;">
                    <td><strong style="font-size: 16px;">KEUNTUNGAN KOTOR</strong></td>
                    <td class="text-right font-bold" style="color: #f97316; font-size: 20px;">
                        Rp {{ number_format($keuntungan_kotor, 0, ',', '.') }}
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- RINCIAN PENGELUARAN PER KATEGORI -->
        <div class="section-title">Rincian Pengeluaran per Kategori</div>
        <table class="table">
            <thead>
                <tr>
                    <th>Kategori</th>
                    <th class="text-right">Jumlah</th>
                </tr>
            </thead>
            <tbody>
                @foreach($pengeluaran_per_kategori as $item)
                <tr>
                    <td class="capitalize">{{ str_replace('_', ' ', $item->kategori) }}</td>
                    <td class="text-right font-bold">Rp {{ number_format($item->total, 0, ',', '.') }}</td>
                </tr>
                @endforeach
                <tr class="total-row">
                    <td class="label"><strong>TOTAL PENGELUARAN</strong></td>
                    <td class="value text-right">Rp {{ number_format($total_pengeluaran, 0, ',', '.') }}</td>
                </tr>
            </tbody>
        </table>

        <!-- FOOTER -->
        <div class="footer">
            <p>Laporan ini dibuat secara otomatis oleh Sistem Informasi Manajemen Showroom Ratu Motor.</p>
            
            <div class="signature">
                <div>
                    <div class="line"></div>
                    <p class="label">Dibuat Oleh,</p>
                    <p style="font-weight: 600; color: #1a2f4f; margin-top: 4px;">Kasir / Admin</p>
                </div>
                <div>
                    <div class="line"></div>
                    <p class="label">Mengetahui,</p>
                    <p style="font-weight: 600; color: #1a2f4f; margin-top: 4px;">Pemilik Ratu Motor</p>
                </div>
            </div>
            
            <p style="margin-top: 15px; font-size: 9px; color: #9ca3af;">
                Dicetak pada: {{ now()->format('d F Y H:i:s') }}
            </p>
        </div>

    </div>
</body>
</html>