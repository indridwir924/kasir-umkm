let inventaris = [
  { id: 1, nama: 'Kopi Susu Gula Aren', harga: 18000, stok: 15 },
  { id: 2, nama: 'Roti Bakar Cokelat', harga: 15000, stok: 4 },
  { id: 3, nama: 'Teh Melati Dingin', harga: 8000, stok: 25 }
];
let keranjang = [];
let riwayat = [];

function tampilkanPesan(teks, tipe) {
  const box = document.getElementById('pesanNotif');
  box.innerText = teks;
  box.className = 'notif-box ' + (tipe === 'error' ? 'notif-error' : 'notif-success');
  box.style.display = 'block';
  setTimeout(function() { box.style.display = 'none'; }, 4000);
}

function formatRupiah(angka) {
  return 'Rp ' + angka.toLocaleString('id-ID');
}

function cetakStruk(dataTrx) {
  document.getElementById('strukWaktu').innerText = 'Waktu: ' + dataTrx.tanggal + ' ' + dataTrx.waktu;
  
  const containerItem = document.getElementById('strukDaftarItem');
  containerItem.innerHTML = '';

  dataTrx.items.forEach(function(item) {
    const baris = document.createElement('div');
    baris.style.marginBottom = '6px';
    baris.innerHTML = `
      <div>${item.nama}</div>
      <div class="struk-item">
        <span>${item.qty} x ${formatRupiah(item.harga)}</span>
        <span>${formatRupiah(item.subtotal)}</span>
      </div>
    `;
    containerItem.appendChild(baris);
  });

  document.getElementById('strukTotal').innerText = formatRupiah(dataTrx.total);
  document.getElementById('strukBayar').innerText = formatRupiah(dataTrx.bayar);
  document.getElementById('strukKembali').innerText = formatRupiah(dataTrx.kembalian);

  window.print();
}

function hitungTotalKeranjang() {
  let total = 0;
  keranjang.forEach(function(item) {
    total += item.subtotal;
  });
  return total;
}

function updateKalkulasiBayar() {
  const total = hitungTotalKeranjang();
  const bayar = parseInt(document.getElementById('uangBayar').value) || 0;
  const kembalian = bayar - total;

  document.getElementById('tampilTotal').innerText = formatRupiah(total);
  if (total === 0) {
    document.getElementById('tampilKembalian').innerText = 'Rp 0';
  } else {
    document.getElementById('tampilKembalian').innerText = kembalian >= 0 ? formatRupiah(kembalian) : 'Kurang ' + formatRupiah(Math.abs(kembalian));
  }
}

function renderKeranjang() {
  const tbodyCart = document.getElementById('tabelKeranjang');
  tbodyCart.innerHTML = '';

  if (keranjang.length === 0) {
    tbodyCart.innerHTML = '<tr><td colspan="4" style="text-align:center; color:#64748b;">Keranjang masih kosong</td></tr>';
    updateKalkulasiBayar();
    return;
  }

  keranjang.forEach(function(item, index) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.nama}</td>
      <td>${item.qty}</td>
      <td>${formatRupiah(item.subtotal)}</td>
      <td><button type="button" class="btn-danger btn-hapus-cart" data-idx="${index}">Batal</button></td>
    `;
    tbodyCart.appendChild(tr);
  });

  document.querySelectorAll('.btn-hapus-cart').forEach(function(btn) {
    btn.addEventListener('click', function() {
      const idx = parseInt(this.getAttribute('data-idx'));
      keranjang.splice(idx, 1);
      renderKeranjang();
    });
  });

  updateKalkulasiBayar();
}

function renderUI() {
  const tbodyInv = document.getElementById('tabelInventaris');
  const selectBrg = document.getElementById('pilihBarang');
  tbodyInv.innerHTML = '';
  selectBrg.innerHTML = '<option value="">-- Pilih Barang --</option>';

  inventaris.forEach(function(item, index) {
    const statusBadge = item.stok <= 5 
      ? '<span class="badge-low">Stok Menipis</span>' 
      : '<span class="badge-ok">Tersedia</span>';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.nama}</td>
      <td>${formatRupiah(item.harga)}</td>
      <td>${item.stok} pcs</td>
      <td>${statusBadge}</td>
      <td><button type="button" class="btn-danger btn-hapus-inv" data-idx="${index}">Hapus</button></td>
    `;
    tbodyInv.appendChild(tr);

    if (item.stok > 0) {
      const opt = document.createElement('option');
      opt.value = index;
      opt.textContent = `${item.nama} (${formatRupiah(item.harga)} | Stok: ${item.stok})`;
      selectBrg.appendChild(opt);
    }
  });

  document.querySelectorAll('.btn-hapus-inv').forEach(function(btn) {
    btn.addEventListener('click', function() {
      const idx = parseInt(this.getAttribute('data-idx'));
      inventaris.splice(idx, 1);
      renderUI();
      tampilkanPesan('Barang berhasil dihapus dari inventaris.', 'success');
    });
  });

  const tbodyRiw = document.getElementById('tabelRiwayat');
  tbodyRiw.innerHTML = '';
  let sumPendapatan = 0;

  riwayat.forEach(function(trx, index) {
    sumPendapatan += trx.total;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${trx.waktu}</td>
      <td>${trx.rincian}</td>
      <td>${formatRupiah(trx.total)}</td>
      <td>${formatRupiah(trx.bayar)}</td>
      <td>${formatRupiah(trx.kembalian)}</td>
      <td><button type="button" class="btn-print btn-cetak-ulang" data-idx="${index}">Cetak Struk</button></td>
    `;
    tbodyRiw.appendChild(tr);
  });

  document.querySelectorAll('.btn-cetak-ulang').forEach(function(btn) {
    btn.addEventListener('click', function() {
      const idx = parseInt(this.getAttribute('data-idx'));
      cetakStruk(riwayat[idx]);
    });
  });

  document.getElementById('totalTrxCount').innerText = riwayat.length + ' Transaksi';
  document.getElementById('totalPendapatan').innerText = formatRupiah(sumPendapatan);
  renderKeranjang();
}

document.getElementById('btnTambah').addEventListener('click', function() {
  const nama = document.getElementById('namaBarang').value.trim();
  const harga = parseInt(document.getElementById('hargaBarang').value);
  const stok = parseInt(document.getElementById('stokBarang').value);

  if (!nama || isNaN(harga) || harga <= 0 || isNaN(stok) || stok < 0) {
    tampilkanPesan('Harap isi nama barang, harga, dan stok dengan benar!', 'error');
    return;
  }

  const existingIndex = inventaris.findIndex(function(b) { return b.nama.toLowerCase() === nama.toLowerCase(); });
  if (existingIndex !== -1) {
    inventaris[existingIndex].harga = harga;
    inventaris[existingIndex].stok += stok;
  } else {
    inventaris.push({ id: Date.now(), nama: nama, harga: harga, stok: stok });
  }

  document.getElementById('namaBarang').value = '';
  document.getElementById('hargaBarang').value = '';
  document.getElementById('stokBarang').value = '';
  
  renderUI();
  tampilkanPesan('Barang berhasil disimpan ke inventaris!', 'success');
});

document.getElementById('btnTambahKeranjang').addEventListener('click', function() {
  const idx = document.getElementById('pilihBarang').value;
  const qty = parseInt(document.getElementById('jumlahBeli').value);

  if (idx === '') {
    tampilkanPesan('Pilih barang terlebih dahulu!', 'error');
    return;
  }

  const barang = inventaris[idx];
  if (isNaN(qty) || qty <= 0) {
    tampilkanPesan('Jumlah beli minimal 1!', 'error');
    return;
  }

  const existingCartIndex = keranjang.findIndex(function(c) { return c.id === barang.id; });
  const qtyDiKeranjang = existingCartIndex !== -1 ? keranjang[existingCartIndex].qty : 0;

  if (qty + qtyDiKeranjang > barang.stok) {
    tampilkanPesan('Total pesanan melebihi stok tersedia (' + barang.stok + ' pcs)!', 'error');
    return;
  }

  if (existingCartIndex !== -1) {
    keranjang[existingCartIndex].qty += qty;
    keranjang[existingCartIndex].subtotal = keranjang[existingCartIndex].qty * barang.harga;
  } else {
    keranjang.push({
      id: barang.id,
      nama: barang.nama,
      harga: barang.harga,
      qty: qty,
      subtotal: barang.harga * qty
    });
  }

  document.getElementById('pilihBarang').value = '';
  document.getElementById('jumlahBeli').value = 1;
  renderKeranjang();
});

document.getElementById('btnBayar').addEventListener('click', function() {
  if (keranjang.length === 0) {
    tampilkanPesan('Keranjang pesanan masih kosong! Tambahkan barang terlebih dahulu.', 'error');
    return;
  }

  const total = hitungTotalKeranjang();
  const bayar = parseInt(document.getElementById('uangBayar').value);

  if (isNaN(bayar) || bayar < total) {
    tampilkanPesan('Uang pembayaran kurang dari total tagihan!', 'error');
    return;
  }

  const kembalian = bayar - total;
  let daftarRincian = [];
  let salinanItemStruk = [];

  keranjang.forEach(function(itemCart) {
    const invItem = inventaris.find(function(b) { return b.id === itemCart.id; });
    if (invItem) {
      invItem.stok -= itemCart.qty;
    }
    daftarRincian.push(itemCart.nama + ' (' + itemCart.qty + 'x)');
    salinanItemStruk.push({
      nama: itemCart.nama,
      qty: itemCart.qty,
      harga: itemCart.harga,
      subtotal: itemCart.subtotal
    });
  });

  const now = new Date();
  const tanggalSekarang = now.toLocaleDateString('id-ID');
  const waktuSekarang = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const dataTransaksiBaru = {
    tanggal: tanggalSekarang,
    waktu: waktuSekarang,
    rincian: daftarRincian.join(', '),
    items: salinanItemStruk,
    total: total,
    bayar: bayar,
    kembalian: kembalian
  };

  riwayat.unshift(dataTransaksiBaru);

  keranjang = [];
  document.getElementById('uangBayar').value = '';
  
  renderUI();
  tampilkanPesan('Transaksi Berhasil! Kembalian: ' + formatRupiah(kembalian), 'success');

  setTimeout(function() {
    cetakStruk(dataTransaksiBaru);
  }, 500);
});

document.getElementById('uangBayar').addEventListener('input', updateKalkulasiBayar);

renderUI();
