export const handlePrintReport = (
  itemsToPrint,
  isFiltered = false,
  filterOpts = {}
) => {
  const { startDate = '', endDate = '', periodFilter = 'all', categoryFilter = 'all' } = filterOpts;

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Gagal membuka jendela cetak. Pastikan pop-up dibolehkan di browser Anda.');
    return;
  }

  const formatRupiah = (num) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const printDateStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  let filterInfoText = 'Semua Transaksi (Tanpa Filter)';
  if (isFiltered) {
    const parts = [];
    if (startDate || endDate) {
      parts.push(`Tanggal: ${startDate || 'Awal'} s/d ${endDate || 'Kini'}`);
    }
    if (periodFilter !== 'all') {
      const periodNames = {
        today: 'Hari Ini',
        week: '7 Hari Terakhir',
        month: '30 Hari Terakhir',
        year: '1 Tahun Terakhir'
      };
      parts.push(`Periode: ${periodNames[periodFilter] || periodFilter}`);
    }
    if (categoryFilter !== 'all') {
      parts.push(`Kategori: ${categoryFilter}`);
    }
    filterInfoText = parts.length > 0 ? parts.join(' | ') : 'Semua Transaksi';
  }

  const totalOmzetPrint = itemsToPrint.reduce((sum, t) => sum + (t.total || 0), 0);
  const totalQtyPrint = itemsToPrint.reduce((sum, t) => {
    return sum + (t.items || []).reduce((iSum, item) => iSum + (item.quantity || 1), 0);
  }, 0);

  const rowsHtml = itemsToPrint.length === 0
    ? `<tr><td colspan="7" style="text-align: center; padding: 24px; color: #64748b; font-style: italic;">Tidak ada data transaksi yang sesuai filter.</td></tr>`
    : itemsToPrint.map((t, index) => {
        const formattedDate = new Date(t.date).toLocaleDateString('id-ID', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

        const itemsFormatted = (t.items || []).map((i, iIdx, arr) => `
          <div style="display: flex; justify-content: space-between; align-items: baseline; gap: 10px; font-size: 11px; padding: 3px 0; ${iIdx < arr.length - 1 ? 'border-bottom: 1px dashed #e2e8f0;' : ''}">
            <span style="font-weight: 600; color: #0f172a;">${i.name}</span>
            <span style="white-space: nowrap; font-size: 10.5px; color: #475569; font-weight: 500;">${i.quantity}x @ ${formatRupiah(i.price)}</span>
          </div>
        `).join('');

        return `
          <tr>
            <td style="text-align: center; font-weight: bold; color: #334155;">${index + 1}</td>
            <td style="font-family: monospace; font-weight: bold; color: #0f172a;">${t.id}</td>
            <td>${formattedDate}</td>
            <td>
              <strong>${t.nama}</strong><br/>
              <span style="font-size: 10px; color: #64748b;">WA: ${t.whatsapp}</span>
            </td>
            <td style="text-align: center; color: #1e293b; font-weight: 500;">${t.metode}</td>
            <td>${itemsFormatted}</td>
            <td style="text-align: right; font-weight: bold; color: #0f172a;">${formatRupiah(t.total)}</td>
          </tr>
        `;
      }).join('');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="id">
      <head>
        <meta charset="UTF-8">
        <title></title>
        <style>
          @page {
            size: A4 landscape;
            margin: 0;
          }
          body {
            font-family: Arial, Helvetica, sans-serif;
            color: #1e293b;
            margin: 0;
            padding: 15mm;
            background: #fff;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .header-container {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 10px;
            margin-bottom: 16px;
          }
          .store-title {
            font-size: 20px;
            font-weight: bold;
            letter-spacing: -0.3px;
            color: #0f172a;
            text-transform: uppercase;
            margin: 0;
          }
          .store-subtitle {
            font-size: 13px;
            color: #475569;
            font-weight: 600;
            margin: 3px 0 0 0;
          }
          .report-title-box {
            text-align: right;
            font-size: 11px;
            color: #475569;
          }
          
          .meta-grid {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr 1.2fr;
            gap: 10px;
            background: #f8fafc;
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            padding: 10px 14px;
            margin-bottom: 16px;
            font-size: 11px;
          }
          .meta-item label {
            display: block;
            color: #64748b;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
          }
          .meta-item span {
            font-weight: bold;
            color: #0f172a;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
            margin-bottom: 16px;
          }
          th {
            background: #f1f5f9;
            color: #0f172a;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 10px;
            letter-spacing: 0.5px;
            padding: 8px 10px;
            text-align: left;
            border: 1px solid #cbd5e1;
          }
          td {
            padding: 8px 10px;
            border: 1px solid #cbd5e1;
            vertical-align: top;
          }
          tbody tr:nth-child(even) {
            background-color: #f8fafc;
          }
          
          .summary-section {
            display: flex;
            justify-content: flex-end;
            align-items: flex-start;
            margin-top: 20px;
            page-break-inside: avoid;
          }
          
          .total-card {
            background: #f8fafc;
            border: 1.5px solid #0f172a;
            border-radius: 6px;
            padding: 10px 16px;
            text-align: right;
            min-width: 260px;
          }
          .total-card .label {
            font-size: 11px;
            color: #475569;
            font-weight: bold;
            text-transform: uppercase;
          }
          .total-card .value {
            font-size: 18px;
            font-weight: bold;
            color: #0f172a;
            margin-top: 2px;
          }

          @media print {
            @page {
              margin: 0;
            }
            body {
              padding: 15mm;
            }
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        
        <div class="header-container">
          <div>
            <h1 class="store-title">LYFFA CRAFT - TOKO RAJUT</h1>
            <p class="store-subtitle">Laporan Penjualan & Rekapitulasi Transaksi</p>
          </div>
          <div class="report-title-box">
            <div>Tanggal Cetak: ${printDateStr}</div>
          </div>
        </div>

        <div class="meta-grid">
          <div class="meta-item">
            <label>Kriteria Filter / Periode</label>
            <span>${filterInfoText}</span>
          </div>
          <div class="meta-item">
            <label>Total Transaksi</label>
            <span>${itemsToPrint.length} Transaksi</span>
          </div>
          <div class="meta-item">
            <label>Total Produk Terjual</label>
            <span>${totalQtyPrint} pcs</span>
          </div>
          <div class="meta-item">
            <label>Total Omzet Penjualan</label>
            <span style="color: #0f172a;">${formatRupiah(totalOmzetPrint)}</span>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 30px; text-align: center;">No</th>
              <th style="width: 100px;">No. Transaksi</th>
              <th style="width: 110px;">Waktu & Tanggal</th>
              <th style="width: 130px;">Pembeli</th>
              <th style="width: 90px; text-align: center;">Metode</th>
              <th>Rincian Produk Dipesan</th>
              <th style="width: 120px; text-align: right;">Total (Rp)</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div class="summary-section">
          <div class="total-card">
            <div class="label">Total Omzet Penjualan</div>
            <div class="value">${formatRupiah(totalOmzetPrint)}</div>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          }
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};

export default handlePrintReport;
