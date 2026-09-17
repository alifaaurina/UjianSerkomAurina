// ===== NAV SCROLL ACTIVE =====
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach((section) => {
    const sectionTop = section.offsetTop - 80;
    if (window.scrollY >= sectionTop) {
      current = section.getAttribute('id');
    }
  });

  navLinks.forEach((link) => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
});

// ===== DATA SERTIFIKAT, DOKUMENTASI & ARTIKEL =====
const certData = {
  dinkes: {
    title: 'Sertifikat Praktik Kerja Lapangan (PKL)',
    issuer: 'Dinas Kesehatan Kabupaten Ponorogo',
    date: '06 April 2026 – 11 September 2026',
    image: 'img/sertifikat_dinkes.jpg',
    description: 'Sertifikat resmi atas pelaksanaan Praktik Kerja Lapangan di Dinas Kesehatan Kabupaten Ponorogo.'
  },
  gamelab: {
    title: 'Sertifikat Kunjungan Industri',
    issuer: 'PT Educa Sisfomedia Indonesia / Gamelab',
    date: '05 Januari 2026',
    image: 'img/sertifikat_gamelab.jpg',
    description: 'Sertifikat keikutsertaan Kunjungan Industri untuk mengamati workflow pengembangan aplikasi modern.'
  },
  smada: {
    title: 'Piagam Penghargaan Juara Harapan II Lomba Essay',
    issuer: 'SMA Negeri 2 Ponorogo',
    date: 'Tahun 2023',
    image: 'img/sertifikat_smada.jpeg',
    description: 'Penghargaan Juara Harapan II Lomba Essay tingkat SMP/MTs Sederajat pada Smada Social, Science, Mathematics and Sastra Competition 2023.'
  }
};

const docData = {
  pkl: {
    title: 'Dokumentasi Praktik Kerja Lapangan (PKL)',
    location: 'Dinas Kesehatan Kabupaten Ponorogo',
    date: '06 April 2026 – 11 September 2026',
    image: 'img/dokumentasi pkl.jpeg',
    description: 'Dokumentasi suasana kerja dan pengerjaan sistem informasi web selama PKL di Dinas Kesehatan Kabupaten Ponorogo.'
  },
  kunjungan: {
    title: 'Dokumentasi Kunjungan Industri',
    location: 'PT Educa Sisfomedia Indonesia / Gamelab',
    date: '05 Januari 2026',
    image: 'img/dokumentasi_kunjungan.jpeg',
    description: 'Dokumentasi kegiatan orientasi industri, pemaparan software engineering, dan alur kerja pengembang software profesional.'
  },
  rapat: {
    title: 'Dokumentasi Rapat & Koordinasi Projek',
    location: 'Amaris Hotel',
    date: 'Tahun 2026',
    image: 'img/rapat amaris.jpg',
    description: 'Dokumentasi kegiatan rapat koordinasi dan presentasi perkembangan projek perangkat lunak bersama tim.'
  }
};

const articleData = {
  'pkl-dinkes': {
    title: 'Pengalaman Praktik Kerja Lapangan di Dinas Kesehatan Kabupaten Ponorogo',
    category: 'Pengalaman & Refleksi',
    date: '11 September 2026',
    author: 'Aurina Putri Alifa Haryanto',
    content: `
      <p>
        Melaksanakan Praktik Kerja Lapangan (PKL) di
        <strong>Dinas Kesehatan Kabupaten Ponorogo</strong> pada tanggal
        <strong>06 April 2026 hingga 11 September 2026</strong> menjadi
        salah satu pengalaman berharga bagi saya sebagai siswi
        Rekayasa Perangkat Lunak (RPL).
      </p>

      <p>
        Saya memperoleh kesempatan untuk memahami proses kerja sistem
        informasi berbasis web, termasuk bagaimana antarmuka, data,
        dan database saling terhubung untuk mendukung pengelolaan informasi.
        Pengalaman ini membantu saya memahami bahwa ketelitian dalam
        memasukkan data dan memahami struktur database sangat penting
        agar informasi yang dihasilkan tetap akurat dan terorganisir.
      </p>

      <p>
        Selama PKL, saya juga mendapatkan pengalaman dalam melakukan
        <strong>entry data</strong> dan memahami alur pengelolaan data
        dalam sistem. Dari proses input, penyimpanan, hingga data dapat
        ditampilkan kembali sesuai kebutuhan, saya belajar bagaimana
        database menjadi bagian penting dalam sebuah sistem informasi.
      </p>

      <p>
        Di luar kemampuan teknis, PKL juga mengajarkan saya tentang
        <strong>kedisiplinan, tanggung jawab, komunikasi, dan kerja sama</strong>
        dalam lingkungan kerja. Saya belajar bahwa proses pengembangan dan
        pengelolaan sistem tidak hanya membutuhkan kemampuan coding,
        tetapi juga ketelitian dan kemampuan memahami kebutuhan pengguna.
      </p>

      <p>
        Bagi saya, PKL di Dinas Kesehatan Kabupaten Ponorogo menjadi
        pengalaman yang membantu saya <strong>belajar, berkembang, dan
        memahami penerapan ilmu Rekayasa Perangkat Lunak di dunia kerja
        secara langsung.</strong>
      </p>
    `
  }
};

// ===== MODAL CONTROLLER =====
function openCertModal(key) {
  const item = certData[key];
  if (!item) return;

  const modalHtml = `
    <div class="modal-overlay active" id="activeModal" onclick="handleBackdropClick(event)">
      <div class="modal-container">
        <div class="modal-header">
          <h3>${item.title}</h3>
          <button class="modal-close-btn" onclick="closeModal()"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="modal-body text-center">
          <div class="modal-meta" style="justify-content: center;">
            <span><i class="fa-solid fa-building"></i> ${item.issuer}</span>
            <span><i class="fa-solid fa-calendar"></i> ${item.date}</span>
          </div>
          <p>${item.description}</p>
          <img src="${item.image}" alt="${item.title}" class="modal-img-preview">
          <div style="margin-top: 1rem;">
            <a href="${item.image}" target="_blank" class="btn-view" style="margin-top: 0;"><i class="fa-solid fa-up-right-from-square"></i> Buka Ukuran Penuh</a>
          </div>
        </div>
      </div>
    </div>
  `;

  renderModal(modalHtml);
}

function openDocModal(key) {
  const item = docData[key];
  if (!item) return;

  const modalHtml = `
    <div class="modal-overlay active" id="activeModal" onclick="handleBackdropClick(event)">
      <div class="modal-container">
        <div class="modal-header">
          <h3>${item.title}</h3>
          <button class="modal-close-btn" onclick="closeModal()"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="modal-body">
          <div class="modal-meta">
            <span><i class="fa-solid fa-location-dot"></i> ${item.location}</span>
            <span><i class="fa-solid fa-calendar"></i> ${item.date}</span>
          </div>
          <p>${item.description}</p>
          <img src="${item.image}" alt="${item.title}" class="modal-img-preview">
          <div style="margin-top: 1rem; text-align: center;">
            <a href="${item.image}" target="_blank" class="btn-view" style="margin-top: 0;"><i class="fa-solid fa-up-right-from-square"></i> Lihat Gambar Penuh</a>
          </div>
        </div>
      </div>
    </div>
  `;

  renderModal(modalHtml);
}

function openArticleModal(key) {
  const item = articleData[key];
  if (!item) return;

  const modalHtml = `
    <div class="modal-overlay active" id="activeModal" onclick="handleBackdropClick(event)">
      <div class="modal-container">
        <div class="modal-header">
          <h3>${item.title}</h3>
          <button class="modal-close-btn" onclick="closeModal()"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="modal-body">
          <div class="modal-meta">
            <span><i class="fa-solid fa-folder"></i> ${item.category}</span>
            <span><i class="fa-solid fa-user"></i> ${item.author}</span>
            <span><i class="fa-solid fa-calendar"></i> ${item.date}</span>
          </div>
          <div class="article-content">
            ${item.content}
          </div>
        </div>
      </div>
    </div>
  `;

  renderModal(modalHtml);
}

function renderModal(html) {
  closeModal();
  const wrapper = document.createElement('div');
  wrapper.id = 'modalWrapper';
  wrapper.innerHTML = html;
  document.body.appendChild(wrapper);
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const existing = document.getElementById('modalWrapper');
  if (existing) {
    existing.remove();
    document.body.style.overflow = 'auto';
  }
}

function handleBackdropClick(event) {
  if (event.target.classList.contains('modal-overlay')) {
    closeModal();
  }
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal();
  }
});
