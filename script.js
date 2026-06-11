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

let catalogItems = [];

function getFotoSrc(foto) {
  if (!foto) return null;
  return foto.startsWith('http') ? foto : `${API_BASE_URL}/uploads/${foto}`;
}

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
  const icons = { elektronik: '⚡', buku: '📚', dapur: '🍳', pakaian: '👕', perabot: '🪑', lainnya: '📦' };
  return icons[cat] || '📦';
}

// Warna background berdasarkan kategori
function getBg(cat) {
  const bgs = { elektronik: '#E1F5EE', buku: '#E6F1FB', dapur: '#FAEEDA', pakaian: '#FAECE7', perabot: '#F1EFE8', lainnya: '#F5F5F5' };
  return bgs[cat] || '#F5F5F5';
}

// VARIABEL STATE FILTER
let currentCat = 'semua';

// FUNGSI RENDER KATALOG SUPER
function renderCatalog() {
  const grid = document.getElementById('catalog-grid');
  if(!grid) return; 

  const countSemua = document.getElementById('count-semua');
  if (countSemua) {
    document.getElementById('count-semua').textContent = catalogItems.length;
    document.getElementById('count-elektronik').textContent = catalogItems.filter(item => item.cat === 'elektronik').length;
    document.getElementById('count-buku').textContent = catalogItems.filter(item => item.cat === 'buku').length;
    document.getElementById('count-dapur').textContent = catalogItems.filter(item => item.cat === 'dapur').length;
    document.getElementById('count-pakaian').textContent = catalogItems.filter(item => item.cat === 'pakaian').length;
    document.getElementById('count-perabot').textContent = catalogItems.filter(item => item.cat === 'perabot').length;

    const catalogTotalCount = document.getElementById('catalog-total-count');
    if (catalogTotalCount) {
      catalogTotalCount.textContent = catalogItems.length;
    }
  }

  const searchInput = document.getElementById('search-input');
  const searchVal = searchInput ? searchInput.value.toLowerCase() : '';
  const sortSelect = document.getElementById('sort-select');
  const sortVal = sortSelect ? sortSelect.value : 'terbaru';

  const statusCheckboxes = document.querySelectorAll('.filter-status');
  let activeStatuses = [];
  statusCheckboxes.forEach(cb => { if(cb.checked) activeStatuses.push(cb.value); });

  const typeCheckboxes = document.querySelectorAll('.filter-type');
  let activeTypes = [];
  typeCheckboxes.forEach(cb => { if(cb.checked) activeTypes.push(cb.value); });

  let filtered = catalogItems.filter(item => {
    const matchCat = (currentCat === 'semua' || item.cat === currentCat);
    const matchSearch = item.name.toLowerCase().includes(searchVal);
    const matchStatus = statusCheckboxes.length === 0 || activeStatuses.includes(item.status);
    const matchType = typeCheckboxes.length === 0 || activeTypes.includes(item.type);
    return matchCat && matchSearch && matchStatus && matchType;
  });

  if (sortVal === 'az') filtered.sort((a, b) => a.name.localeCompare(b.name));
  else if (sortVal === 'za') filtered.sort((a, b) => b.name.localeCompare(a.name));

  if (filtered.length === 0) {
    grid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding: 2rem; color: var(--text-muted);">Barang tidak ditemukan 😔<br>Coba ubah filter atau kata kunci pencarian.</div>`;
    return;
  }

  grid.innerHTML = filtered.map((item, i) => `
    <div class="catalog-item" onclick="openItemDetail(${catalogItems.indexOf(item)})" style="animation-delay:${i*0.04}s">
      <div class="catalog-item-img" style="background:${item.bg}">
        ${item.foto 
          ? `<img src="${getFotoSrc(item.foto)}" style="width:100%;height:100%;object-fit:cover;border-radius:var(--radius-sm);">` 
          : item.icon
        }
      </div>
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

function filterCat(btn, cat) {
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentCat = cat;
  renderCatalog();
}

async function openItemDetail(idx) {
  const item = catalogItems[idx];
  selectedBarangId = item.id;
  const user = JSON.parse(localStorage.getItem('user'));

  const imgEl = document.getElementById('detail-img');
  const nameEl = document.getElementById('detail-name');
  const catEl = document.getElementById('detail-cat');
  const descEl = document.getElementById('detail-desc');
  const ownerEl = document.getElementById('detail-owner');
  const ratingEl = document.getElementById('detail-rating');

  if (imgEl && nameEl && descEl) {
    if (item.foto) {
      imgEl.style.background = item.bg;
      imgEl.innerHTML = `<img src="${getFotoSrc(item.foto)}" style="width:100%;height:100%;object-fit:cover;">`;
    } else {
      imgEl.style.background = item.bg;
      imgEl.textContent = item.icon;
    }

    nameEl.textContent = item.name;
    descEl.textContent = item.desc;
    if (catEl) catEl.textContent = item.cat.charAt(0).toUpperCase() + item.cat.slice(1);
    if (ownerEl) ownerEl.textContent = item.owner;

    const btnAksi = document.querySelector('#item-detail-modal .btn-primary');
    if (btnAksi) {
      if (user && item.ownerId == user.id) {
        btnAksi.style.display = 'none';
      } else if (item.type === 'Gratis') {
        btnAksi.style.display = 'block';
        btnAksi.textContent = 'Ambil Gratis 🎁';
        btnAksi.onclick = () => handleAmbilGratis(item.id);
      } else {
        btnAksi.style.display = 'block';
        btnAksi.textContent = 'Ajukan Peminjaman';
        btnAksi.onclick = () => handleAjukanPinjam();
      }
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/barang/lifecycle/${item.id}`);
      const lifecycle = await res.json();

      const lifecycleEl = document.getElementById('lifecycle-content');
      if (lifecycleEl && lifecycle.length > 0) {
        const first = lifecycle[0];

        const ratings = lifecycle.filter(l => l.rating !== null);
        const avgRating = ratings.length > 0
          ? (ratings.reduce((a, b) => a + b.rating, 0) / ratings.length).toFixed(1)
          : '-';
        if (ratingEl) ratingEl.textContent = avgRating;

        let html = `
          <div class="timeline-item">
            <div class="timeline-dot-wrap">
              <div class="timeline-dot"></div>
              ${lifecycle.length > 0 ? '<div class="timeline-line"></div>' : ''}
            </div>
            <div class="timeline-content">
              <strong>Ditambahkan</strong>
              <div class="timeline-time">${new Date(first.tanggal_tambah).toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'})}</div>
            </div>
          </div>
        `;

        const pernahDipinjam = lifecycle.some(l => l.tanggal_pinjam !== null);

        if (!pernahDipinjam) {
          html += `
            <div class="timeline-item">
              <div class="timeline-dot-wrap">
                <div class="timeline-dot" style="background:var(--text-muted)"></div>
              </div>
              <div class="timeline-content" style="color:var(--text-muted);">
                Belum pernah dipinjam
              </div>
            </div>
          `;
        } else {
          lifecycle.forEach(l => {
            if (l.tanggal_pinjam) {
              html += `
                <div class="timeline-item">
                  <div class="timeline-dot-wrap">
                    <div class="timeline-dot" style="background:var(--amber)"></div>
                    <div class="timeline-line"></div>
                  </div>
                  <div class="timeline-content">
                    <strong>Dipinjam</strong> oleh ${l.nama_peminjam}
                    <div class="timeline-time">${new Date(l.tanggal_pinjam).toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'})}</div>
                  </div>
                </div>
              `;
            }
            if (l.tanggal_kembali) {
              html += `
                <div class="timeline-item">
                  <div class="timeline-dot-wrap">
                    <div class="timeline-dot" style="background:var(--blue)"></div>
                    ${lifecycle.indexOf(l) < lifecycle.length - 1 ? '<div class="timeline-line"></div>' : ''}
                  </div>
                  <div class="timeline-content">
                    <strong>Tersedia kembali</strong>
                    <div class="timeline-time">${new Date(l.tanggal_kembali).toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'})}</div>
                  </div>
                </div>
              `;
            }
          });
        }
        lifecycleEl.innerHTML = html;
      }
    } catch (err) { console.error('Gagal fetch lifecycle:', err); }
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

  document.querySelectorAll('.feature-card').forEach((el, i) => {
    setTimeout(() => el.classList.add('visible'), 300 + i * 80);
  });
  
  if (document.querySelector('.stat-card')) animateStats();

  if (document.getElementById('catalog-grid')) {
    fetchBarang()
    document.getElementById('search-input').addEventListener('input', renderCatalog);
    document.getElementById('sort-select').addEventListener('change', renderCatalog);
    document.querySelectorAll('.filter-status').forEach(cb => { cb.addEventListener('change', renderCatalog); });
    document.querySelectorAll('.filter-type').forEach(cb => { cb.addEventListener('change', renderCatalog); });
  }
});

// ── LOGIC UPLOAD FOTO DENGAN CROPPER ──
let cropper = null;
let croppedBlob = null;

window.addEventListener('load', () => {
  const fileInput = document.getElementById('add-item-file-input');
  const uploadArea = document.getElementById('add-item-upload-area');
  const previewImage = document.getElementById('add-item-preview');
  const cropImage = document.getElementById('crop-image');

  if (!fileInput || !uploadArea || !previewImage) return;

  uploadArea.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        cropImage.src = e.target.result;
        openModal('crop-modal');
        if (cropper) cropper.destroy();
        setTimeout(() => {
          cropper = new Cropper(cropImage, { aspectRatio: 1, viewMode: 1 });
        }, 300);
      };
      reader.readAsDataURL(file);
    }
  });
});

function closeCropModal() {
  closeModal('crop-modal');
  if (cropper) { cropper.destroy(); cropper = null; }
}

function applyCrop() {
  if (!cropper) return;
  cropper.getCroppedCanvas({ width: 400, height: 400 }).toBlob((blob) => {
    croppedBlob = blob;
    const previewImage = document.getElementById('add-item-preview');
    const placeholderText = document.getElementById('add-item-placeholder');
    const uploadArea = document.getElementById('add-item-upload-area');

    previewImage.src = URL.createObjectURL(blob);
    previewImage.style.display = 'block';
    placeholderText.style.display = 'none';
    uploadArea.style.padding = '0.5rem';

    closeModal('crop-modal');
    if (cropper) { cropper.destroy(); cropper = null; }
  }, 'image/jpeg');
}

function isValidGmail(email) {
  return /^[^\s@]+@gmail\.com$/.test(email);
}

function isValidPassword(password) {
  return password.length >= 8;
}

// ── AUTH FUNCTIONS ──
async function handleRegister() {
  const namaEl = document.getElementById('reg-nama');
  const emailEl = document.getElementById('reg-email');
  const teleponEl = document.getElementById('reg-telepon');
  const passwordEl = document.getElementById('reg-password');

  const nama = namaEl ? namaEl.value.trim() : document.querySelector('#register-modal .form-input[type="text"]').value.trim();
  const email = emailEl ? emailEl.value.trim() : document.querySelector('#register-modal .form-input[type="email"]').value.trim();
  const password = passwordEl ? passwordEl.value : document.querySelector('#register-modal .form-input[type="password"]').value;
  const teleponRaw = teleponEl ? teleponEl.value.trim() : '';
  const nomor_telepon = teleponRaw ? '62' + teleponRaw.replace(/^0+/, '') : null;

  if (!nama || !email || !password) {
    alert('Semua field harus diisi!');
    return;
  }

  if (!teleponRaw) {
    alert('Nomor telepon WhatsApp harus diisi!');
    return;
  }

  if (!isValidGmail(email)) {
    alert('Email harus menggunakan format Gmail, contoh: nama@gmail.com');
    return;
  }

  if (!isValidPassword(password)) {
    alert('Password minimal harus 8 karakter!');
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nama, email, password, nomor_telepon })
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

async function handleLogin() {
  const email = document.querySelector('#login-modal .form-input[type="email"]').value.trim();
  const password = document.querySelector('#login-modal .form-input[type="password"]').value;

  if (!email || !password) {
    alert('Email dan password harus diisi!');
    return;
  }

  if (!isValidGmail(email)) {
    alert('Email harus menggunakan format Gmail, contoh: nama@gmail.com');
    return;
  }

  if (!isValidPassword(password)) {
    alert('Password minimal harus 8 karakter!');
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
let isAddingBarang = false;

async function handleTambahBarang() {
  if (isAddingBarang) return;

  isAddingBarang = true;

  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) {
    alert('Kamu harus login dulu!');
    isAddingBarang = false;
    return;
  }

  const nama = document.querySelector('#add-item-modal input[type="text"]').value;
  const kategori = document.querySelectorAll('#add-item-modal select')[0].value.toLowerCase();
  const jenis = document.querySelectorAll('#add-item-modal select')[1].value;
  const kondisi = document.querySelectorAll('#add-item-modal select')[2].value;
  const deskripsi = document.querySelector('#add-item-modal textarea').value;

  if (!nama || !deskripsi) {
    alert('Nama dan deskripsi harus diisi!');
    isAddingBarang = false;
    return;
  }

  if (jenis === 'Gratis') {
    if (!confirm('Kamu yakin mau mendonasikan barang ini secara gratis?')) {
      isAddingBarang = false;
      return;
    }
  }

  const formData = new FormData();
  formData.append('nama', nama);
  formData.append('kategori', kategori);
  formData.append('jenis', jenis);
  formData.append('kondisi', kondisi);
  formData.append('deskripsi', deskripsi);
  formData.append('user_id', user.id);

  if (croppedBlob) {
    formData.append('foto', croppedBlob, 'foto.jpg');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/barang`, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (response.ok) {
      alert('Barang berhasil ditambahkan!');
      closeModal('add-item-modal');

      croppedBlob = null;

      const previewImage = document.getElementById('add-item-preview');
      const placeholderText = document.getElementById('add-item-placeholder');
      const uploadArea = document.getElementById('add-item-upload-area');

      if (previewImage) {
        previewImage.src = '';
        previewImage.style.display = 'none';
      }

      if (placeholderText) {
        placeholderText.style.display = 'block';
      }

      if (uploadArea) {
        uploadArea.style.padding = '';
      }

      if (document.getElementById('catalog-grid')) fetchBarang();
      if (document.querySelector('.stat-card')) loadDashboard();
    } else {
      alert(data.message || 'Gagal tambah barang');
    }
  } catch (err) {
    console.error(err);
    alert('Gagal konek ke server!');
  } finally {
    isAddingBarang = false;
  }
}

function updateNavbar() {
  const user = JSON.parse(localStorage.getItem('user'));
  const navRight = document.querySelector('.nav-right');
  if (!navRight) return;

  if (user) {
    navRight.innerHTML = `<span style="font-size:14px;color:var(--text-muted);">Hei, <strong>${user.nama}</strong></span> <button class="btn btn-outline btn-sm" onclick="handleLogout()">Keluar</button>`;
  } else {
    navRight.innerHTML = `<button class="btn btn-outline btn-sm" onclick="openModal('login-modal')">Masuk</button> <button class="btn btn-primary btn-sm" onclick="openModal('register-modal')">Daftar</button>`;
  }
}

function handleLogout() { localStorage.removeItem('user'); updateNavbar(); window.location.href = 'index.html'; }
function proteksiHalaman() {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) { alert('Kamu harus login dulu!'); window.location.href = 'index.html'; }
}
function cekLoginLaluTambah() {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) { alert('Kamu harus login dulu!'); openModal('login-modal'); return; }
  openModal('add-item-modal');
}

// ── AJUKAN PINJAMAN ──
let selectedBarangId = null;

// Membuka modal pinjam dengan form note + kalender
function handleAjukanPinjam() {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) { alert('Kamu harus login dulu!'); openModal('login-modal'); return; }

  // Set minimum tanggal ke hari ini
  const today = new Date().toISOString().split('T')[0];
  const tglAmbil = document.getElementById('pinjam-tgl-ambil');
  const tglKembali = document.getElementById('pinjam-tgl-kembali');
  if (tglAmbil) { tglAmbil.min = today; tglAmbil.value = ''; }
  if (tglKembali) { tglKembali.min = today; tglKembali.value = ''; }
  const catatan = document.getElementById('pinjam-catatan');
  if (catatan) catatan.value = '';

  closeModal('item-detail-modal');
  openModal('pinjam-modal');
}

// Submit permintaan pinjam dengan catatan dan jadwal
async function submitAjukanPinjam() {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) { alert('Kamu harus login dulu!'); openModal('login-modal'); return; }

  const catatan = document.getElementById('pinjam-catatan')?.value.trim() || '';
  const tanggal_ambil = document.getElementById('pinjam-tgl-ambil')?.value || '';
  const tanggal_kembali_rencana = document.getElementById('pinjam-tgl-kembali')?.value || '';

  if (!catatan) {
    alert('Tolong isi catatan untuk pemilik barang!');
    return;
  }
  if (!tanggal_ambil || !tanggal_kembali_rencana) {
    alert('Tolong pilih tanggal pengambilan dan pengembalian!');
    return;
  }
  if (tanggal_kembali_rencana <= tanggal_ambil) {
    alert('Tanggal pengembalian harus setelah tanggal pengambilan!');
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/transaksi`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ barang_id: selectedBarangId, peminjam_id: user.id, catatan_peminjam: catatan, tanggal_ambil, tanggal_kembali_rencana })
    });
    const data = await response.json();
    if (response.ok) {
      alert('Permintaan peminjaman berhasil dikirim! Tunggu konfirmasi pemilik barang 🌿');
      closeModal('pinjam-modal');
      fetchBarang();
    } else { alert(data.message); }
  } catch (err) { alert('Gagal konek ke server!'); }
}

// ── DASHBOARD REAL DATA ──
async function loadDashboard() {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) return;

  try {
    const resBarang = await fetch(`${API_BASE_URL}/api/barang/user/${user.id}`);
    const dataBarang = await resBarang.json();

    const resTransaksi = await fetch(`${API_BASE_URL}/api/transaksi/${user.id}`);
    const dataTransaksi = await resTransaksi.json();

    try {
      const resSemuaBarang = await fetch(`${API_BASE_URL}/api/barang`);
      const semuaBarang = await resSemuaBarang.json();

      const totalBarangKatalog = semuaBarang.length; 
      const sedangDipinjam = dataBarang.filter(b => b.status === 'Dipinjam').length;
      const totalTransaksiStats = dataTransaksi.length;

      const statNums = document.querySelectorAll('.stat-num');
      if (statNums[0]) statNums[0].textContent = totalBarangKatalog;
      if (statNums[1]) statNums[1].textContent = sedangDipinjam;
      if (statNums[2]) statNums[2].textContent = totalTransaksiStats;
    } catch (err) { console.error('Gagal hitung stat katalog global:', err); }

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
              ${b.status !== 'Dipinjam' ? `
                <button class="btn btn-outline btn-sm" style="border-color:var(--coral); color:var(--coral); padding:4px 10px;" onclick="handleHapusBarang(${b.id})">🗑️ Hapus</button>
              ` : ''}
            </div>
          `).join('')}
        </div>
      `;
    }

    const activityList = document.querySelector('#tab-activity .activity-list');
    if (activityList) {
      if (dataTransaksi.length === 0) {
        activityList.innerHTML = `<li style="text-align:center;padding:2rem;color:var(--text-muted);list-style:none;">Belum ada aktivitas 📋</li>`;
      } else {
        activityList.innerHTML = dataTransaksi.map(t => {
          const isApproved = t.status === 'Disetujui';
          const nomorPemilik = t.nomor_pemilik ? String(t.nomor_pemilik).replace(/^0+/, '62') : null;
          const waLink = nomorPemilik ? `https://wa.me/${nomorPemilik}` : null;
          return `
          <li class="activity-item">
            <div class="activity-avatar" style="background:var(--green-light);color:var(--green-dark);">${t.nama_barang ? t.nama_barang.charAt(0) : '?'}</div>
            <div class="activity-text">
              <strong>${t.nama_barang}</strong> — <span class="tag ${t.status === 'Dikembalikan' ? 'tag-green' : isApproved ? 'tag-amber' : 'tag-blue'}">${isApproved ? 'Dipinjam' : t.status}</span>
              ${isApproved && waLink ? `
                <div style="margin-top:8px;">
                  <a href="${waLink}" target="_blank" class="btn-wa-chat">
                    <span>💬</span> Chat Pemilik
                  </a>
                </div>` : ''}
            </div>
            <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;">
              <div class="activity-time">${new Date(t.created_at).toLocaleDateString('id-ID')}</div>
              ${t.status === 'Disetujui' ? `<button class="btn btn-outline" style="font-size:11px;padding:4px 8px;" onclick="handleKembalikan(${t.id}, ${t.barang_id})">Kembalikan</button>` : ''}
            </div>
          </li>`;
        }).join('');
      }
    }

    const notifList = document.querySelector('#tab-notif .notif-list');
    if (notifList) {
      const resNotif = await fetch(`${API_BASE_URL}/api/transaksi/notifikasi/${user.id}`);
      const dataNotif = await resNotif.json();

      if (dataNotif.length === 0) {
        notifList.innerHTML = `<div style="text-align:center;padding:2rem;color:var(--text-muted);">Belum ada notifikasi 🔔</div>`;
      } else {
        notifList.innerHTML = dataNotif.map(n => {
          const nomorPeminjam = n.nomor_peminjam ? String(n.nomor_peminjam).replace(/^0+/, '62') : null;
          const waLink = nomorPeminjam ? `https://wa.me/${nomorPeminjam}` : null;
          const formatTgl = (d) => d ? new Date(d).toLocaleDateString('id-ID', {day:'numeric',month:'long',year:'numeric'}) : null;
          const tglAmbil = formatTgl(n.tanggal_ambil);
          const tglKembali = formatTgl(n.tanggal_kembali_rencana);
          return `
          <li class="notif-item" onclick="this.querySelector('.notif-dot').style.backgroundColor='transparent'">
            <div class="notif-dot" style="${n.status !== 'Menunggu' ? 'background:transparent;' : ''}"></div>
            <div style="flex:1;">
              <div class="notif-text">
                ${n.status === 'Menunggu'
                  ? `🔔 <strong>${n.nama_peminjam}</strong> mengajukan pinjam <em>${n.nama_barang}</em>`
                  : n.status === 'Disetujui'
                  ? `✅ Kamu menyetujui pinjaman <em>${n.nama_barang}</em> ke <strong>${n.nama_peminjam}</strong>`
                  : `❌ Kamu menolak pinjaman <em>${n.nama_barang}</em> dari <strong>${n.nama_peminjam}</strong>`}
              </div>

              ${n.status === 'Menunggu' && n.catatan_peminjam ? `
                <div class="notif-catatan">
                  <span style="font-size:11px;font-weight:500;color:var(--text-muted);display:block;margin-bottom:3px;">💬 Catatan peminjam:</span>
                  <em style="font-size:13px;color:var(--text);">"${n.catatan_peminjam}"</em>
                </div>` : ''}

              ${n.status === 'Menunggu' && (tglAmbil || tglKembali) ? `
                <div class="notif-jadwal">
                  <span>📅</span>
                  <span>${tglAmbil ? `Ambil: <strong>${tglAmbil}</strong>` : ''}${tglAmbil && tglKembali ? ' &nbsp;→&nbsp; ' : ''}${tglKembali ? `Kembali: <strong>${tglKembali}</strong>` : ''}</span>
                </div>` : ''}

              <div class="notif-time">${new Date(n.created_at).toLocaleDateString('id-ID')}</div>

              ${n.status === 'Menunggu' ? `
                <div style="display:flex;gap:8px;margin-top:8px;">
                  <button class="btn btn-primary" style="font-size:12px;padding:6px 12px;" onclick="handleSetujui(${n.id}, ${n.barang_id}); event.stopPropagation();">Setujui</button>
                  <button class="btn btn-outline" style="font-size:12px;padding:6px 12px;" onclick="handleTolak(${n.id}, ${n.barang_id}); event.stopPropagation();">Tolak</button>
                </div>` : ''}

              ${n.status === 'Disetujui' && waLink ? `
                <div style="margin-top:8px;">
                  <a href="${waLink}" target="_blank" class="btn-wa-chat">
                    <span>💬</span> Chat Peminjam
                  </a>
                </div>` : ''}
            </div>
          </li>`;
        }).join('');
      }
    }
  } catch (err) { console.error('Gagal load dashboard:', err); }
}

// ── KEMBALIKAN BARANG ──
function handleKembalikan(transaksi_id, barang_id) {
  pendingKembalikanId = transaksi_id;
  pendingKembalikanBarangId = barang_id;
  selectedRating = 0;

  const stars = document.querySelectorAll('.star');
  stars.forEach(s => s.style.opacity = '0.3');
  const ratingSelected = document.getElementById('rating-selected');
  if (ratingSelected) ratingSelected.textContent = 'Belum dipilih';

  openModal('rating-modal');
}

// ── SETUJUI / TOLAK PINJAMAN ──
async function handleSetujui(transaksi_id, barang_id) {
  if (!confirm('Setujui permintaan pinjaman ini?')) return;
  try {
    const response = await fetch(`${API_BASE_URL}/api/transaksi/setujui`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ transaksi_id, barang_id })
    });
    const data = await response.json();
    if (response.ok) { alert('Pinjaman disetujui!'); loadDashboard(); } else { alert(data.message); }
  } catch (err) { alert('Gagal konek ke server!'); }
}

async function handleTolak(transaksi_id, barang_id) {
  if (!confirm('Tolak permintaan pinjaman ini?')) return;
  try {
    const response = await fetch(`${API_BASE_URL}/api/transaksi/tolak`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ transaksi_id, barang_id })
    });
    const data = await response.json();
    if (response.ok) { alert('Pinjaman ditolak!'); loadDashboard(); } else { alert(data.message); }
  } catch (err) { alert('Gagal konek ke server!'); }
}

// ── RATING ──
let selectedRating = 0;
let pendingKembalikanId = null;
let pendingKembalikanBarangId = null;

function selectRating(val) {
  selectedRating = val;
  const stars = document.querySelectorAll('.star');
  stars.forEach((s, i) => { s.style.opacity = i < val ? '1' : '0.3'; });
  document.getElementById('rating-selected').textContent = `${val} bintang`;
}

async function submitRating() {
  if (selectedRating === 0) { alert('Pilih rating dulu!'); return; }
  try {
    const response = await fetch(`${API_BASE_URL}/api/transaksi/kembalikan`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transaksi_id: pendingKembalikanId, barang_id: pendingKembalikanBarangId, rating: selectedRating })
    });
    const data = await response.json();
    if (response.ok) {
      alert('Barang berhasil dikembalikan! Terima kasih atas ratingnya 🌿');
      closeModal('rating-modal'); loadDashboard();
    } else { alert(data.message); }
  } catch (err) { alert('Gagal konek ke server!'); }
}

// ── AMBIL GRATIS ──
async function handleAmbilGratis(barang_id) {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) { alert('Kamu harus login dulu!'); openModal('login-modal'); return; }
  if (!confirm('Yakin mau ambil barang ini? Barang akan jadi milikmu secara permanen!')) return;

  try {
    const response = await fetch(`${API_BASE_URL}/api/barang/gratis`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ barang_id, user_id: user.id })
    });
    const data = await response.json();
    if (response.ok) {
      alert('Selamat! Barang berhasil diambil! 🎁'); closeModal('item-detail-modal'); fetchBarang();
    } else { alert(data.message); }
  } catch (err) { alert('Gagal konek ke server!'); }
}

// ── FUNGSI HAPUS BARANG ──
async function handleHapusBarang(barangId) {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) { alert('Kamu harus login dulu!'); return; }
  if (!confirm('Apakah kamu yakin ingin menghapus barang ini? Semua riwayat transaksi terkait barang ini juga akan dihapus permanen.')) return;

  try {
    const response = await fetch(`${API_BASE_URL}/api/barang/hapus`, {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ barang_id: barangId, user_id: user.id })
    });
    const data = await response.json();
    if (response.ok) {
      alert(data.message); closeModal('item-detail-modal');
      if (document.querySelector('.stat-card')) loadDashboard();
      if (document.getElementById('catalog-grid')) fetchBarang();
    } else { alert(data.message); }
  } catch (err) { alert('Gagal konek ke server!'); }
}

async function loadHomeStats() {
  const homeBarang = document.getElementById('home-barang-aktif');
  const homePengguna = document.getElementById('home-total-pengguna');
  if (!homeBarang && !homePengguna) return;

  try {
    const resBarang = await fetch(`${API_BASE_URL}/api/barang`);
    const dataBarang = await resBarang.json();
    if (homeBarang) homeBarang.textContent = dataBarang.length;

    const resUser = await fetch(`${API_BASE_URL}/api/auth/total-users`);
    const dataUser = await resUser.json();
    if (homePengguna) homePengguna.textContent = dataUser.total ?? 0;
  } catch (err) { console.error('Gagal memuat statistik beranda:', err); }
}

document.addEventListener('DOMContentLoaded', loadHomeStats);
