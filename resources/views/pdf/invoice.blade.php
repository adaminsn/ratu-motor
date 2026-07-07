<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Invoice #{{ $transaksi->id }}</title>
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
            max-width: 700px;
            margin: 0 auto;
            border: 1px solid #e5e7eb;
            border-radius: 10px;
            padding: 30px;
            background: #fff;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 3px solid #f97316;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }
        .header-left h1 {
            font-size: 24px;
            color: #1a2f4f;
        }
        .header-left p {
            color: #6b7280;
            font-size: 11px;
        }
        .header-right {
            text-align: right;
        }
        .badge {
            background: #f97316;
            color: #fff;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: bold;
            display: inline-block;
        }
        .badge-lunas {
            background: #10b981;
        }
        .badge-pending {
            background: #f59e0b;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 20px;
            background: #f9fafb;
            padding: 15px;
            border-radius: 8px;
        }
        .info-item label {
            font-size: 10px;
            color: #6b7280;
            text-transform: uppercase;
            font-weight: 600;
            display: block;
            margin-bottom: 2px;
        }
        .info-item p {
            font-weight: 500;
            color: #1a2f4f;
        }
        .table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }
        .table th {
            background: #1a2f4f;
            color: #fff;
            padding: 8px 12px;
            text-align: left;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .table td {
            padding: 8px 12px;
            border-bottom: 1px solid #e5e7eb;
        }
        .table .total-row td {
            font-weight: bold;
            font-size: 15px;
            border-top: 2px solid #1a2f4f;
            padding-top: 12px;
        }
        .total-row .label {
            text-align: right;
            color: #1a2f4f;
        }
        .total-row .value {
            color: #f97316;
            font-size: 18px;
        }
        .footer {
            margin-top: 20px;
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
            margin: 25px auto 6px;
        }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .text-muted { color: #6b7280; }
        .font-bold { font-weight: 700; }
        .capitalize { text-transform: capitalize; }
        .mt-2 { margin-top: 6px; }
    </style>
</head>
<body>
    <div class="container">
        
        <!-- HEADER -->
        <div class="header">
            <div class="header-left">
                <h1>RATU MOTOR</h1>
                <p>Showroom &amp; Service Center Banyuwangi</p>
                <p style="font-size: 10px; margin-top: 3px; color: #9ca3af;">
                    Jl. Raya Banyuwangi No. 123 | Telp: 0812-3456-7890
                </p>
            </div>
            <div class="header-right">
                <div class="badge {{ $transaksi->status_pembayaran === 'lunas' ? 'badge-lunas' : 'badge-pending' }}">
                    {{ strtoupper($transaksi->status_pembayaran) }}
                </div>
                <p style="margin-top: 6px; font-size: 11px; color: #6b7280;">
                    Invoice #{{ str_pad($transaksi->id, 6, '0', STR_PAD_LEFT) }}
                </p>
                <p style="font-size: 11px; color: #6b7280;">
                    {{ $tanggal }}
                </p>
            </div>
        </div>

        <!-- INFO PEMBELI & MOTOR -->
            <div class="info-item">
            <label>Nama Pembeli</label>
                <p>{{ $transaksi->customer->nama ?? '-' }}</p>
            </div>
            <div class="info-item">
                <label>No. HP</label>
                <p>{{ $transaksi->customer->no_hp ?? '-' }}</p>
            </div>
            <div class="info-item" style="grid-column: span 2;">
                <label>Alamat</label>
                <p>{{ $transaksi->customer->alamat ?? '-' }}</p>
            </div>

        <!-- DETAIL MOTOR -->
        <h3 style="font-size: 13px; color: #1a2f4f; margin-bottom: 10px;">Detail Unit Motor</h3>
        <table class="table">
            <thead>
                <tr>
                    <th>Merk / Tipe</th>
                    <th>Tahun / Warna</th>
                    <th>No. Rangka</th>
                    <th>No. Mesin</th>
                    <th class="text-right">Harga</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <strong>{{ $motor->merk }}</strong><br>
                        <span style="font-size: 11px; color: #6b7280;">{{ $motor->tipe }}</span>
                    </td>
                    <td>
                        {{ $motor->tahun }}<br>
                        <span style="font-size: 11px; color: #6b7280; text-transform: capitalize;">{{ $motor->warna }}</span>
                    </td>
                    <td style="font-family: monospace; font-size: 11px;">{{ $motor->no_rangka }}</td>
                    <td style="font-family: monospace; font-size: 11px;">{{ $motor->no_mesin }}</td>
                    <td class="text-right font-bold" style="color: #1a2f4f;">
                        Rp {{ number_format($transaksi->harga_kesepakatan, 0, ',', '.') }}
                    </td>
                </tr>
                <tr class="total-row">
                    <td colspan="4" class="label">TOTAL HARGA DEAL</td>
                    <td class="value text-right">
                        Rp {{ number_format($transaksi->harga_kesepakatan, 0, ',', '.') }}
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- INFO TAMBAHAN -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 15px 0; background: #f9fafb; padding: 12px; border-radius: 8px;">
            <div>
                <label style="font-size: 10px; color: #6b7280; text-transform: uppercase; font-weight: 600;">Metode Pembayaran</label>
                <p style="font-weight: 500; color: #1a2f4f; text-transform: capitalize;">{{ $transaksi->metode_pembayaran }}</p>
            </div>
            <div>
                <label style="font-size: 10px; color: #6b7280; text-transform: uppercase; font-weight: 600;">Diproses Oleh</label>
                <p style="font-weight: 500; color: #1a2f4f;">{{ $transaksi->user->name ?? 'Kasir' }}</p>
            </div>
            @if($transaksi->keterangan)
            <div style="grid-column: span 2;">
                <label style="font-size: 10px; color: #6b7280; text-transform: uppercase; font-weight: 600;">Keterangan</label>
                <p style="font-weight: 400; color: #4b5563;">{{ $transaksi->keterangan }}</p>
            </div>
            @endif
        </div>

        <!-- FOOTER -->
        <div class="footer">
            <p>Terima kasih telah mempercayakan kebutuhan motor Anda kepada kami.</p>
            <p style="font-size: 10px; margin-top: 3px;">Dokumen ini adalah bukti transaksi yang sah.</p>
            
            <div class="signature">
                <div>
                    <div class="line"></div>
                    <p style="font-size: 10px; color: #6b7280;">Pembeli</p>
                </div>
                <div>
                    <div class="line"></div>
                    <p style="font-size: 10px; color: #6b7280;">Hormat Kami,</p>
                    <p style="font-size: 10px; font-weight: 600; color: #1a2f4f;">Ratu Motor</p>
                </div>
            </div>
            
            <p style="margin-top: 15px; font-size: 9px; color: #9ca3af;">
                Invoice generated on {{ now()->format('d F Y H:i:s') }}
            </p>
        </div>

    </div>
</body>
</html>