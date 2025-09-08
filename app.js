// === Konfigurasi ===
const API_URL = "https://script.google.com/macros/s/AKfycbwnf3IcLzgMNXFGAYF8NK4B9rRqd9HkXFuMXFi9de_F0g1GB2KpOq0OS08elQZMBF02nQ/exec";

let lapakData = [];
let selectedLapak = "";
let currentPage = 1;
let pageSize = Infinity; // ✅ default: tampil semua data
let loadingInterval;

// === Load Data dari Backend ===
async function loadData() {
  try {
    showLoading(true);
    const res = await fetch(API_URL);

    if (!res.ok) {
      console.error("HTTP ERROR:", res.status, res.statusText);
      showToast("Gagal konek ke server (" + res.status + ")", "error");
      return;
    }

    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (err) {
      console.error("JSON parse error:", err, text);
      showToast("Respon server tidak valid", "error");
      return;
    }

    lapakData = data;
    pageSize = lapakData.length;
    document.getElementById("pageSizeSelect").value = "all";

    generateRangeOptions();
    renderGrid();
  } catch (err) {
    console.error("Fetch error:", err);
    showToast("Terjadi kesalahan koneksi!", "error");
  } finally {
    showLoading(false);
  }
}

// === Loading Spinner ===
function showLoading(show) {
  const loader = document.getElementById("loading");
  const text = document.getElementById("loadingText");

  if (show) {
    loader.style.display = "flex";
    let dots = 0;
    loadingInterval = setInterval(() => {
      dots = (dots + 1) % 4; 
      text.textContent = "Sedang memuat data" + ".".repeat(dots);
    }, 500);
  } else {
    loader.style.display = "none";
    clearInterval(loadingInterval);
    text.textContent = "Sedang memuat data"; 
  }
}

// === Generate Range Dropdown ===
function generateRangeOptions() {
  const rangeSelect = document.getElementById("rangeSelect");
  rangeSelect.innerHTML = ""; 

  const optAll = document.createElement("option");
  optAll.value = "all";
  optAll.textContent = "Semua Nomor";
  rangeSelect.appendChild(optAll);

  let maxNo = lapakData.length > 0 ? lapakData[lapakData.length - 1].no : 0;
  let step = 50;
  for (let start = 1; start <= maxNo; start += step) {
    let end = Math.min(start + step - 1, maxNo);
    const opt = document.createElement("option");
    opt.value = `${start}-${end}`;
    opt.textContent = `${start} - ${end}`;
    rangeSelect.appendChild(opt);
  }
}

// === Render Grid Lapak ===
// === Render Grid Lapak (versi aman) ===
function renderGrid() {
  const grid = document.getElementById("lapakGrid");
  const searchInput = document.getElementById("searchInput");
  const filterSelect = document.getElementById("filterSelect");
  const rangeSelect = document.getElementById("rangeSelect");

  // 🔒 Cek elemen penting
  if (!grid || !searchInput || !filterSelect || !rangeSelect) {
    console.warn("Elemen grid/filter tidak ditemukan di HTML.");
    return;
  }

  const search = searchInput.value.toLowerCase();
  const filter = filterSelect.value;
  const range = rangeSelect.value;

  grid.innerHTML = "";

  // 🔒 Pastikan lapakData array
  if (!Array.isArray(lapakData)) {
    console.warn("lapakData belum berisi array.");
    return;
  }

  let filtered = lapakData.filter(({ no, nama, status }) => {
    if (filter === "kosong" && status !== "kosong") return false;
    if (filter === "terisi" && status !== "terisi") return false;
    if (!no.toString().includes(search) && !nama.toLowerCase().includes(search)) return false;

    if (range !== "all") {
      const [start, end] = range.split("-").map(Number);
      if (no < start || no > end) return false;
    }
    return true;
  });

  // 🔒 Antisipasi pageSize = 0
  const safePageSize = pageSize > 0 ? pageSize : filtered.length || 1;

  const totalPages = Math.ceil(filtered.length / safePageSize);
  if (currentPage > totalPages) currentPage = totalPages || 1;
  const startIdx = (currentPage - 1) * safePageSize;
  const pageData = filtered.slice(startIdx, startIdx + safePageSize);

 pageData.forEach(({ no, nama, status }) => {
    const div = document.createElement("div");
    div.className = "lapak " + status;
    div.setAttribute("data-no", no);      // ✅ penting untuk update warna setelah absen
    div.setAttribute("data-nama", nama);  // optional
    div.innerHTML = `<strong>${no}</strong><br>${formatNama(nama)}`;

    if (typeof openDetailModal === "function") {
      div.onclick = () => openDetailModal(no, nama);
    }
    grid.appendChild(div);
  });

  if (typeof renderPagination === "function") {
    renderPagination(totalPages);
  }
}



// === Render Pagination Nav ===
function renderPagination(totalPages) {
  const nav = document.getElementById("paginationNav");
  nav.innerHTML = "";
  if (totalPages <= 1) return;

  const info = document.createElement("span");
  info.textContent = `Halaman ${currentPage} dari ${totalPages}`;
  nav.appendChild(info);

  const prevBtn = document.createElement("button");
  prevBtn.textContent = "⬅ Prev";
  prevBtn.disabled = currentPage === 1;
  prevBtn.onclick = () => {
    currentPage--;
    renderGrid();
  };
  nav.appendChild(prevBtn);

  const nextBtn = document.createElement("button");
  nextBtn.textContent = "Next ➡";
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.onclick = () => {
    currentPage++;
    renderGrid();
  };
  nav.appendChild(nextBtn);
}

// === Buka Modal Detail Lapak ===
function openDetailModal(lapak) {
  const modal = document.getElementById("detailModal");
  const title = document.getElementById("detailTitle");
  const body = document.getElementById("detailBody");
  const btnAbsensi = document.getElementById("btnAbsensi");
  const btnRequest = document.getElementById("btnRequest");

  if (title) {
    title.textContent = `Detail Lapak ${lapak.noLapak}`;
  }

  if (body) {
    body.innerHTML = `
      <p><b>Nomor:</b> ${lapak.noLapak}</p>
      <p><b>Nama:</b> ${lapak.nama}</p>
      <p><b>Status:</b> ${lapak.status}</p>
    `;
  }

  if (btnAbsensi) {
    // Panggil absensi.js
    btnAbsensi.onclick = () => openAbsensiModal(lapak.noLapak, lapak.nama);
  }

  if (btnRequest) {
    // Buka modal request
    btnRequest.onclick = () => {
      document.getElementById("lapakLama").value = `${lapak.noLapak} - ${lapak.nama}`;
      document.getElementById("lapakBaru").value = "";
      document.getElementById("alasan").value = "";
      document.getElementById("password").value = "";
      document.getElementById("requestModal").style.display = "block";
    };
  }

  modal.style.display = "block";
}

// === Tutup Modal Detail ===
function closeDetailModal() {
  document.getElementById("detailModal").style.display = "none";
}


// === Modal Request ===
function openRequestModal(lapakNo, namaPelapak) {
  selectedLapak = lapakNo;
  document.getElementById("lapakLama").value = lapakNo + " - " + namaPelapak;
  document.getElementById("requestModal").style.display = "flex";
}

function closeRequestModal() {
  document.getElementById("requestModal").style.display = "none";
  document.getElementById("requestForm").reset();
}

// === Submit Request Form ===
const form = document.getElementById("requestForm");
const submitBtn = document.getElementById("submitBtn");
const toast = document.getElementById("toast");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const body = {
    nama: document.getElementById("nama").value,
    lapakLama: document.getElementById("lapakLama").value,
    lapakBaru: document.getElementById("lapakBaru").value,
    alasan: document.getElementById("alasan").value,
    password: document.getElementById("password").value
  };

  submitBtn.disabled = true;
  submitBtn.textContent = "Mengirim...";

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      console.error("HTTP ERROR:", res.status, res.statusText);
      showToast("Gagal konek ke server (" + res.status + ")", "error");
      return;
    }

    const text = await res.text();
    let result;
    try {
      result = JSON.parse(text);
    } catch (err) {
      console.error("JSON parse error:", err, text);
      showToast("Respon server tidak valid", "error");
      return;
    }

    if (result.success) {
      showToast(result.message, "success");
      form.reset();
      setTimeout(() => {
        closeRequestModal();
        closeDetailModal();
        loadData();
      }, 1500);
    } else {
      showToast(result.message, "error");
    }
  } catch (err) {
    console.error("Fetch error:", err);
    showToast("Terjadi kesalahan koneksi!", "error");
  }

  submitBtn.disabled = false;
  submitBtn.textContent = "Kirim";
});

// === Toast ===
function showToast(message, type) {
  toast.textContent = message;
  toast.className = `toast ${type}`;
  toast.style.display = "block";
  setTimeout(() => {
    toast.style.display = "none";
  }, 3000);
}
// Pisahkan teks dalam tanda kurung biar bisa diwarnai
function formatNama(nama) {
  return nama.replace(/\((.*?)\)/g, '<span class="inside">($1)</span>');
}

// === Modal Absensi ===
async function openAbsensiModal(lapakNo, namaPelapak) {
  selectedLapak = lapakNo;
  document.getElementById("absensiTitle").textContent = `Absensi Lapak ${lapakNo} - ${namaPelapak}`;
  document.getElementById("absensiTableBody").innerHTML = "<tr><td colspan='3'>Loading...</td></tr>";

  try {
    const res = await fetch(`${API_URL}?action=getAbsensi&noLapak=${lapakNo}`);
    const data = await res.json();

    if (!data.success) {
      document.getElementById("absensiTableBody").innerHTML =
        `<tr><td colspan="3">${data.message}</td></tr>`;
      return;
    }

    if (data.data.length === 0) {
      document.getElementById("absensiTableBody").innerHTML =
        `<tr><td colspan="3">Belum ada data absensi</td></tr>`;
      return;
    }

    document.getElementById("absensiTableBody").innerHTML = data.data
      .map(r => `
        <tr>
          <td>${new Date(r.tanggal).toLocaleDateString("id-ID")}</td>
          <td>${r.nama}</td>
          <td>${r.status}</td>
        </tr>
      `)
      .join("");
  } catch (err) {
    document.getElementById("absensiTableBody").innerHTML =
      `<tr><td colspan="3">Error: ${err.message}</td></tr>`;
  }

  document.getElementById("absensiModal").style.display = "flex";
}

function closeAbsensiModal() {
  document.getElementById("absensiModal").style.display = "none";
}

// === Event Listeners ===
document.getElementById("searchInput").addEventListener("input", () => {
  currentPage = 1;
  renderGrid();
});
document.getElementById("filterSelect").addEventListener("change", () => {
  currentPage = 1;
  renderGrid();
});
document.getElementById("rangeSelect").addEventListener("change", () => {
  currentPage = 1;
  renderGrid();
});
document.getElementById("pageSizeSelect").addEventListener("change", (e) => {
  pageSize = e.target.value === "all" ? lapakData.length : parseInt(e.target.value);
  currentPage = 1;
  renderGrid();
});
showLoading(true);

// === Init ===
loadData();
