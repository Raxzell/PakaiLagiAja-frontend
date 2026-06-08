const API_BASE_URL = 'https://pakailagiaja-api.onrender.com';

function openModal(id) {
  const modal = document.getElementById(id);
  if(modal) modal.classList.add('open');
}
function closeModal(id) {
  const modal = document.getElementById(id);
  if(modal) modal.classList.remove('open');
}
document.querySelectorAll('.modal-overlay').forEach(m => {
  m.addEventListener('click', function(e) {
    if (e.target === this) closeModal(this.id);
  });
});

// ── ROLE TOGGLE ──
function selectRole(btn) {
  btn.closest('.role-toggle').querySelectorAll('.role-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
}

// ── TABS ──
function switchTab(btn, tabId) {
  btn.closest('.dash-panel').querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  ['activity','notif','myitems'].forEach(id => {
    const el = document.getElementById('tab-' + id);
    if (el) el.style.display = id === tabId ? 'block' : 'none';
  });
}

// // ── CATALOG DATA ──
// const catalogItems = [
//   { name: 'Kipas Angin COSMOS', cat: 'elektronik', icon: '🌀', bg: '#E1F5EE', status: 'Tersedia', owner: 'Andi N.', type: 'Pinjam', desc: 'Kondisi baik, fungsi normal. 1 tahun pakai.' },
//   { name: 'Rice Cooker 1L', cat: 'dapur', icon: '🍳', bg: '#FAEEDA', status: 'Dipinjam', owner: 'Nadia A.', type: 'Pinjam', desc: 'Masih bagus, sudah dicuci bersih.' },
//   { name: 'Buku Kalkulus Ed.9', cat: 'buku', icon: '📚', bg: '#E6F1FB', status: 'Tersedia', owner: 'Dimas K.', type: 'Tukar', desc: 'Lengkap, cover sedikit lecet.' },
//   { name: 'Setrika Philips', cat: 'elektronik', icon: '🪣', bg: '#E1F5EE', status: 'Tersedia', owner: 'Sari W.', type: 'Pinjam', desc: 'Normal, bersih, bawaan kabel masih bagus.' },
//   { name: 'Jaket Kulit M', cat: 'pakaian', icon: '🧥', bg: '#FAECE7', status: 'Tersedia', owner: 'Budi P.', type: 'Gratis', desc: 'Ukuran M, kondisi sangat baik, jarang dipakai.' },
//   { name: 'Lampu Belajar LED', cat: 'elektronik', icon: '💡', bg: '#FAEEDA', status: 'Tersedia', owner: 'Rina M.', type: 'Pinjam', desc: 'Hemat energi, 3 level kecerahan.' },
//   { name: 'Buku Fisika Dasar', cat: 'buku', icon: '🔭', bg: '#E6F1FB', status: 'Tersedia', owner: 'Hendra S.', type: 'Tukar', desc: 'Edisi terbaru, catatan ringan di beberapa halaman.' },
//   { name: 'Kursi Lipat', cat: 'perabot', icon: '🪑', bg: '#F1EFE8', status: 'Tersedia', owner: 'Dewi L.', type: 'Pinjam', desc: 'Kuat, anti karat, cocok untuk acara.' },
//   { name: 'Charger Laptop 65W', cat: 'elektronik', icon: '💻', bg: '#E1F5EE', status: 'Tersedia', owner: 'Andi N.', type: 'Pinjam', desc: 'Universal type C, baru 2 bulan.' },
//   { name: 'Wajan 28cm', cat: 'dapur', icon: '🥘', bg: '#FAEEDA', status: 'Tersedia', owner: 'Tia R.', type: 'Gratis', desc: 'Anti lengket masih bagus, ukuran 28cm.' },
//   { name: 'Kemeja Formal L', cat: 'pakaian', icon: '👔', bg: '#FAECE7', status: 'Tersedia', owner: 'Agus M.', type: 'Gratis', desc: 'Ukuran L, warna putih, sudah dicuci.' },
//   { name: 'Laptop Stand', cat: 'elektronik', icon: '🖥️', bg: '#E1F5EE', status: 'Dipinjam', owner: 'Yuni K.', type: 'Pinjam', desc: 'Aluminium, adjustable, cocok semua laptop.' },
// ];
let catalogItems = [];

// Ambil data barang dari database
async function fetchBarang() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/barang`);
    const data = await response.json();
    
    catalogItems = data.map(item => ({
      id: item.id,
      ownerId: item.user_id,
      name: item.nama,
      cat: item.kategori,
      icon: getIcon(item.kategori),
      bg: getBg(item.kategori),
      status: item.status,
      owner: item.nama_pemilik,
      type: item.jenis,
      desc: item.deskripsi,
      foto: item.foto
    }));

    renderCatalog();
  } catch (err) {
    console.error('Gagal ambil data barang:', err);
  }
}

// Icon berdasarkan kategori
function getIcon(cat) {
  const icons = {
    elektronik: '⚡',
    buku: '📚',
    dapur: '🍳',
    pakaian: '👕',
    perabot: '🪑',
    lainnya: '📦'
  };
  return icons[cat] || '📦';
}

// Warna background berdasarkan kategori
function getBg(cat) {
  const bgs = {
    elektronik: '#E1F5EE',
    buku: '#E6F1FB',
    dapur: '#FAEEDA',
    pakaian: '#FAECE7',
    perabot: '#F1EFE8',
    lainnya: '#F5F5F5'
  };
  return bgs[cat] || '#F5F5F5';
}

// VARIABEL STATE FILTER
let currentCat = 'semua';

// FUNGSI RENDER KATALOG SUPER (Kategori + Search + Checkbox + Sorting)
function renderCatalog() {
  const grid = document.getElementById('catalog-grid');
  if(!grid) return; // Safeguard kalau lagi nggak di halaman katalog

  // 1. Ambil nilai dari Search Bar & Sort Dropdown
  const searchInput = document.getElementById('search-input');
  const searchVal = searchInput ? searchInput.value.toLowerCase() : '';
  const sortSelect = document.getElementById('sort-select');
  const sortVal = sortSelect ? sortSelect.value : 'terbaru';

  // 2. Ambil nilai dari Checkbox Status yang dicentang
  const statusCheckboxes = document.querySelectorAll('.filter-status');
  let activeStatuses = [];
  statusCheckboxes.forEach(cb => { if(cb.checked) activeStatuses.push(cb.value); });

  // 3. Ambil nilai dari Checkbox Jenis yang dicentang
  const typeCheckboxes = document.querySelectorAll('.filter-type');
  let activeTypes = [];
  typeCheckboxes.forEach(cb => { if(cb.checked) activeTypes.push(cb.value); });

  // 4. Proses Filtering Array
  let filtered = catalogItems.filter(item => {
    // Filter Kategori (Sidebar kiri)
    const matchCat = (currentCat === 'semua' || item.cat === currentCat);
    // Filter Pencarian (Ketik nama)
    const matchSearch = item.name.toLowerCase().includes(searchVal);
    // Filter Status (Tersedia/Dipinjam) - abaikan jika checkbox tidak ada di halaman ini
    const matchStatus = statusCheckboxes.length === 0 || activeStatuses.includes(item.status);
    // Filter Jenis (Pinjam/Tukar/Gratis)
    const matchType = typeCheckboxes.length === 0 || activeTypes.includes(item.type);

    return matchCat && matchSearch && matchStatus && matchType;
  });

  // 5. Proses Sorting Array
  if (sortVal === 'az') {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortVal === 'za') {
    filtered.sort((a, b) => b.name.localeCompare(a.name));
  }
  // Kalau 'terbaru', biarkan sesuai urutan asli array dummy

  // 6. Cetak ke HTML
  if (filtered.length === 0) {
    grid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding: 2rem; color: var(--text-muted);">Barang tidak ditemukan 😔<br>Coba ubah filter atau kata kunci pencarian.</div>`;
    return;
  }

  grid.innerHTML = filtered.map((item, i) => `
    <div class="catalog-item" onclick="openItemDetail(${catalogItems.indexOf(item)})" style="animation-delay:${i*0.04}s">
      <div class="catalog-item-img" style="background:${item.bg}">${item.icon}</div>
      <div class="catalog-item-body">
        <div class="catalog-item-name">${item.name}</div>
        <div class="catalog-item-owner">oleh ${item.owner}</div>
        <div class="catalog-item-footer">
          <span class="status-text">
            <span class="status-dot ${item.status === 'Tersedia' ? 'status-available' : item.status === 'Menunggu' ? 'status-waiting' : 'status-borrowed'}"></span>
            ${item.status}
          </span>
          <span class="tag ${item.type === 'Gratis' ? 'tag-green' : item.type === 'Tukar' ? 'tag-blue' : 'tag-gray'}" style="font-size:10px;">${item.type}</span>
        </div>
      </div>
    </div>
  `).join('');
  
  setTimeout(() => grid.querySelectorAll('.catalog-item').forEach(el => el.classList.add('visible')), 50);
}

// Fungsi ganti kategori dari sidebar
function filterCat(btn, cat) {
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentCat = cat;
  renderCatalog();
}

function openItemDetail(idx) {
  const item = catalogItems[idx];
  selectedBarangId = item.id;
  const user = JSON.parse(localStorage.getItem('user'));
  // Sembunyiin tombol pinjam kalau barang milik sendiri
  const btnPinjam = document.querySelector('#item-detail-modal .btn-primary');
  if (btnPinjam) {
    if (user && item.ownerId == user.id) {
      btnPinjam.style.display = 'none';
    } else {
      btnPinjam.style.display = 'block';
    }
  }
  console.log('selectedBarangId:', selectedBarangId); // ← tambah ini
  console.log('item:', item); // ← dan ini

  const imgEl = document.getElementById('detail-img');
  const nameEl = document.getElementById('detail-name');
  const catEl = document.getElementById('detail-cat');
  const descEl = document.getElementById('detail-desc');

  if(imgEl && nameEl && descEl) {
    imgEl.style.background = item.bg;
    imgEl.textContent = item.icon;
    nameEl.textContent = item.name;
    descEl.textContent = item.desc;
    if(catEl) {
      catEl.textContent = item.cat.charAt(0).toUpperCase() + item.cat.slice(1);
    }
    openModal('item-detail-modal');
  }
}

// ── ANIMATE STATS ──
function animateStats() {
  document.querySelectorAll('.stat-card, .feature-card').forEach((el, i) => {
    el.style.animationDelay = i * 0.07 + 's';
    el.classList.add('visible');
  });
}

// ── INIT ──
window.addEventListener('load', () => {
  if (document.querySelector('.stat-card')) loadDashboard();
  updateNavbar();

  const greetingEl = document.getElementById('dash-greeting');
  if (greetingEl) {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) greetingEl.textContent = `Selamat datang, ${user.nama} 👋`;
  }

  // Animasi fitur di home
  document.querySelectorAll('.feature-card').forEach((el, i) => {
    setTimeout(() => el.classList.add('visible'), 300 + i * 80);
  });
  
  // Animasi statistik di dashboard
  if (document.querySelector('.stat-card')) animateStats();

  // Setup interaksi khusus halaman Katalog
  if (document.getElementById('catalog-grid')) {
    // renderCatalog(); // Render pertama kali
    fetchBarang()

    // Pasang alat pendengar (Event Listener) ke Search Bar
    document.getElementById('search-input').addEventListener('input', renderCatalog);
    
    // Pasang pendengar ke Dropdown Sorting
    document.getElementById('sort-select').addEventListener('change', renderCatalog);
    
    // Pasang pendengar ke semua Checkbox Status
    document.querySelectorAll('.filter-status').forEach(cb => {
      cb.addEventListener('change', renderCatalog);
    });
    
    // Pasang pendengar ke semua Checkbox Jenis
    document.querySelectorAll('.filter-type').forEach(cb => {
      cb.addEventListener('change', renderCatalog);
    });
  }
});

// script.js - Tambahin di paling bawah

// ── LOGIC UPLOAD FOTO (PREVIEW) DI MODAL TAMBAH BARANG ──
window.addEventListener('load', () => {
  // Ambil elemen-elemen yang dibutuhin
  const fileInput = document.getElementById('add-item-file-input');
  const uploadArea = document.getElementById('add-item-upload-area');
  const placeholderText = document.getElementById('add-item-placeholder');
  const previewImage = document.getElementById('add-item-preview');

  // Safety check: Pastikan elemennya ada di halaman ini
  if (!fileInput || !uploadArea || !previewImage) return;

  // 1. Pas kotak custom diklik, trigger input file asli
  uploadArea.addEventListener('click', () => {
    fileInput.click();
  });

  // 2. Pas user beres milih file (event 'change')
  fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0]; // Ambil file pertama

    // Pastikan file-nya ada dan tipenya gambar
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader(); // Pake API FileReader bawaan browser

      // Setup apa yang terjadi pas file beres dibaca
      reader.onload = (e) => {
        // Isi src gambar preview dengan hasil bacaan file
        previewImage.src = e.target.result;
        
        // Tampilkan gambar, sembunyiin tulisan placeholder
        previewImage.style.display = 'block';
        placeholderText.style.display = 'none';
        
        // Sesuaikan padding kotak upload biar pas sama gambar
        uploadArea.style.padding = '0.5rem';
      };

      // Mulai baca file sebagai Data URL
      reader.readAsDataURL(file);
    } else {
      // Kalau bukan gambar atau batal milih, reset tampilan
      previewImage.style.display = 'none';
      placeholderText.style.display = 'block';
      uploadArea.style.padding = '1.5rem';
    }
  });
});


// ── AUTH FUNCTIONS ──

// REGISTER
async function handleRegister() {
  const nama = document.querySelector('#register-modal .form-input[type="text"]').value;
  const email = document.querySelector('#register-modal .form-input[type="email"]').value;
  const password = document.querySelector('#register-modal .form-input[type="password"]').value;
  const roleBtn = document.querySelector('#register-modal .role-btn.selected');
  const role = roleBtn ? (roleBtn.textContent.includes('Donatur') ? 'donatur' : 'penerima') : 'donatur';

  if (!nama || !email || !password) {
    alert('Semua field harus diisi!');
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nama, email, password, role })
    });

    const data = await response.json();

    if (response.ok) {
      alert('Register berhasil! Silakan login.');
      closeModal('register-modal');
    } else {
      alert(data.message);
    }
  } catch (err) {
    alert('Gagal konek ke server!');
  }
}

// LOGIN
async function handleLogin() {
  const email = document.querySelector('#login-modal .form-input[type="email"]').value;
  const password = document.querySelector('#login-modal .form-input[type="password"]').value;

  if (!email || !password) {
    alert('Email dan password harus diisi!');
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      // Simpan data user di browser
      localStorage.setItem('user', JSON.stringify(data.user));
      alert(`Selamat datang, ${data.user.nama}!`);
      closeModal('login-modal');
      window.location.href = 'dashboard.html';
    } else {
      alert(data.message);
    }
  } catch (err) {
    alert('Gagal konek ke server!');
  }
}


// ── TAMBAH BARANG ──
async function handleTambahBarang() {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) {
    alert('Kamu harus login dulu!');
    return;
  }

  const nama = document.querySelector('#add-item-modal input[type="text"]').value;
  const kategori = document.querySelectorAll('#add-item-modal select')[0].value.toLowerCase();
  const jenis = document.querySelectorAll('#add-item-modal select')[1].value;
  const kondisi = document.querySelectorAll('#add-item-modal select')[2].value;
  const deskripsi = document.querySelector('#add-item-modal textarea').value;
  const foto = document.getElementById('add-item-file-input').files[0];

  if (!nama || !deskripsi) {
    alert('Nama dan deskripsi harus diisi!');
    return;
  }

  const formData = new FormData();
  formData.append('nama', nama);
  formData.append('kategori', kategori);
  formData.append('jenis', jenis);
  formData.append('kondisi', kondisi);
  formData.append('deskripsi', deskripsi);
  formData.append('user_id', user.id);
  if (foto) formData.append('foto', foto);

  try {
    const response = await fetch(`${API_BASE_URL}/api/barang`, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (response.ok) {
      alert('Barang berhasil ditambahkan!');
      closeModal('add-item-modal');
    } else {
      alert(data.message);
    }
  } catch (err) {
    alert('Gagal konek ke server!');
  }
}


// ── UPDATE NAVBAR SETELAH LOGIN ──
function updateNavbar() {
  const user = JSON.parse(localStorage.getItem('user'));
  const navRight = document.querySelector('.nav-right');
  if (!navRight) return;

  if (user) {
    navRight.innerHTML = `
      <span style="font-size:14px;color:var(--text-muted);">Hei, <strong>${user.nama}</strong></span>
      <button class="btn btn-outline btn-sm" onclick="handleLogout()">Keluar</button>
    `;
  } else {
    navRight.innerHTML = `
      <button class="btn btn-outline btn-sm" onclick="openModal('login-modal')">Masuk</button>
      <button class="btn btn-primary btn-sm" onclick="openModal('register-modal')">Daftar</button>
    `;
  }
}

// ── LOGOUT ──
function handleLogout() {
  localStorage.removeItem('user');
  updateNavbar();
  window.location.href = 'index.html';
}

// ── PROTEKSI HALAMAN ──
function proteksiHalaman() {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) {
    alert('Kamu harus login dulu!');
    window.location.href = 'index.html';
  }
}

// ── CEK LOGIN SEBELUM TAMBAH BARANG ──
function cekLoginLaluTambah() {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) {
    alert('Kamu harus login dulu!');
    openModal('login-modal');
    return;
  }
  openModal('add-item-modal');
}

// ── AJUKAN PINJAMAN ──
let selectedBarangId = null;

async function handleAjukanPinjam() {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) {
    alert('Kamu harus login dulu!');
    openModal('login-modal');
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/transaksi`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        barang_id: selectedBarangId,
        peminjam_id: user.id
      })
    });

    const data = await response.json();

    if (response.ok) {
      alert('Peminjaman berhasil diajukan!');
      closeModal('item-detail-modal');
      fetchBarang();
    } else {
      alert(data.message);
    }
  } catch (err) {
    alert('Gagal konek ke server!');
  }
}

// ── DASHBOARD REAL DATA ──
async function loadDashboard() {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) return;

  try {
    // Ambil barang milik user
    const resBarang = await fetch(`${API_BASE_URL}/api/barang/user/${user.id}`);
    const dataBarang = await resBarang.json();

    // Ambil transaksi user
    const resTransaksi = await fetch(`${API_BASE_URL}/api/transaksi/${user.id}`);
    const dataTransaksi = await resTransaksi.json();

    console.log('dataTransaksi:', dataTransaksi); // soon be deleted

    // Hitung stats
    const barangAktif = dataBarang.filter(b => b.status === 'Tersedia').length;
    const sedangDipinjam = dataBarang.filter(b => b.status === 'Dipinjam').length;
    const totalTransaksi = dataTransaksi.length;

    // Update stat cards
    const statNums = document.querySelectorAll('.stat-num');
    if (statNums[0]) statNums[0].textContent = barangAktif;
    if (statNums[1]) statNums[1].textContent = sedangDipinjam;
    if (statNums[2]) statNums[2].textContent = totalTransaksi;

    // Update tab "Barang Saya"
    const myItemsTab = document.getElementById('tab-myitems');
    if (myItemsTab && dataBarang.length > 0) {
      myItemsTab.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:10px;">
          ${dataBarang.map(b => `
            <div style="display:flex;align-items:center;gap:12px;padding:10px;border:1px solid var(--border);border-radius:var(--radius-sm);">
              <div style="font-size:24px;">${getIcon(b.kategori)}</div>
              <div style="flex:1;">
                <div style="font-weight:500;font-size:14px;">${b.nama}</div>
                <div style="font-size:12px;color:var(--text-muted);">${b.kategori}</div>
              </div>
              <span class="tag ${b.status === 'Tersedia' ? 'tag-green' : b.status === 'Dipinjam' ? 'tag-coral' : 'tag-amber'}">${b.status}</span>
            </div>
          `).join('')}
        </div>
      `;
    }

    // Update tab "Riwayat Saya" / Aktivitas
    const activityList = document.querySelector('#tab-activity .activity-list');
    if (activityList) {
      if (dataTransaksi.length === 0) {
        activityList.innerHTML = `
          <li style="text-align:center;padding:2rem;color:var(--text-muted);list-style:none;">
            Belum ada aktivitas 📋
          </li>
        `;
      } else {
        activityList.innerHTML = dataTransaksi.map(t => `
          <li class="activity-item">
            <div class="activity-avatar" style="background:var(--green-light);color:var(--green-dark);">
              ${t.nama_barang ? t.nama_barang.charAt(0) : '?'}
            </div>
            <div class="activity-text">
              <strong>${t.nama_barang}</strong> — 
              <span class="tag ${t.status === 'Dikembalikan' ? 'tag-green' : 'tag-blue'}">${t.status === 'Disetujui' ? 'Dipinjam' : t.status}</span>
            </div>
            <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;">
              <div class="activity-time">${new Date(t.created_at).toLocaleDateString('id-ID')}</div>
              ${t.status === 'Disetujui' ? `
                <button class="btn btn-outline" style="font-size:11px;padding:4px 8px;" 
                  onclick="handleKembalikan(${t.id}, ${t.barang_id})">
                  Kembalikan
                </button>
              ` : ''}
            </div>
          </li>
        `).join('');
      }
    }

    // Update tab Notifikasi (permintaan pinjam masuk)
    const notifList = document.querySelector('#tab-notif .notif-list');
    if (notifList) {
      const resNotif = await fetch(`${API_BASE_URL}/api/transaksi/notifikasi/${user.id}`);
      const dataNotif = await resNotif.json();

      if (dataNotif.length === 0) {
        notifList.innerHTML = `
          <div style="text-align:center;padding:2rem;color:var(--text-muted);">
            Belum ada notifikasi 🔔
          </div>
        `;
      } else {
        notifList.innerHTML = dataNotif.map(n => `
          <li class="notif-item">
            <div class="notif-dot ${n.status !== 'Menunggu' ? 'read' : ''}"></div>
            <div style="flex:1;">
              <div class="notif-text">
                ${n.status === 'Menunggu' ? `
                  🔔 <strong>${n.nama_peminjam}</strong> mengajukan pinjam <em>${n.nama_barang}</em>
                ` : n.status === 'Disetujui' ? `
                  ✅ Kamu menyetujui pinjaman <em>${n.nama_barang}</em> ke <strong>${n.nama_peminjam}</strong>
                ` : `
                  ❌ Kamu menolak pinjaman <em>${n.nama_barang}</em> dari <strong>${n.nama_peminjam}</strong>
                `}
              </div>
              <div class="notif-time">${new Date(n.created_at).toLocaleDateString('id-ID')}</div>
              ${n.status === 'Menunggu' ? `
                <div style="display:flex;gap:8px;margin-top:8px;">
                  <button class="btn btn-primary" style="font-size:12px;padding:6px 12px;" 
                    onclick="handleSetujui(${n.id}, ${n.barang_id})">Setujui</button>
                  <button class="btn btn-outline" style="font-size:12px;padding:6px 12px;"
                    onclick="handleTolak(${n.id}, ${n.barang_id})">Tolak</button>
                </div>
              ` : ''}
            </div>
          </li>
        `).join('');
      }
    }

  } catch (err) {
    console.error('Gagal load dashboard:', err);
  }
}

// ── KEMBALIKAN BARANG ──
async function handleKembalikan(transaksi_id, barang_id) {
  if (!confirm('Yakin mau kembalikan barang ini?')) return;

  try {
    const response = await fetch(`${API_BASE_URL}/api/transaksi/kembalikan`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transaksi_id, barang_id })
    });

    const data = await response.json();

    if (response.ok) {
      alert('Barang berhasil dikembalikan!');
      loadDashboard();
    } else {
      alert(data.message);
    }
  } catch (err) {
    alert('Gagal konek ke server!');
  }
}

// ── SETUJUI / TOLAK PINJAMAN ──
async function handleSetujui(transaksi_id, barang_id) {
  if (!confirm('Setujui permintaan pinjaman ini?')) return;

  try {
    const response = await fetch(`${API_BASE_URL}/api/transaksi/setujui`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transaksi_id, barang_id })
    });

    const data = await response.json();
    if (response.ok) {
      alert('Pinjaman disetujui!');
      loadDashboard();
    } else {
      alert(data.message);
    }
  } catch (err) {
    alert('Gagal konek ke server!');
  }
}

async function handleTolak(transaksi_id, barang_id) {
  if (!confirm('Tolak permintaan pinjaman ini?')) return;

  try {
    const response = await fetch(`${API_BASE_URL}/api/transaksi/tolak`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transaksi_id, barang_id })
    });

    const data = await response.json();
    if (response.ok) {
      alert('Pinjaman ditolak!');
      loadDashboard();
    } else {
      alert(data.message);
    }
  } catch (err) {
    alert('Gagal konek ke server!');
  }
}