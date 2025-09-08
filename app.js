// === Konfigurasi ===
const API_URL = "https://script.google.com/macros/s/AKfycb.../exec"; // ganti dengan URL Apps Script kamu

// === Variabel Global ===
let lapakData = [];
let selectedLapak = null;

// Tunggu sampai DOM siap
document.addEventListener("DOMContentLoaded", () => {
  // Ambil data awal
  loadLapak();

  // Event search/filter
  document.getElementById("searchInput").addEventListener("input", renderGrid);
  document.getElementById("filterSelect").addEventListener("change", renderGrid);
  document.getElementById("rangeSelect").addEventListener("change", renderGrid);
  document.getElementById("pageSizeSelect").addEventListener("change", renderGrid);
});

// === Ambil data lapak dari API ===
async function loadLapak() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    lapakData = data;
    renderGrid();
  } catch (err) {
    console.error("Gagal load data:", err);
    showToast("⚠️ Gagal memuat data lapak");
  }
}

// === Render Grid Lapak ===
function renderGrid() {
  const grid = document.getElementById("lapakGrid");
  grid.innerHTML = "";

  const search = document.getElementById("searchInput").value.toLowerCase();
  const filter = document.getElementById("filterSelect").value;

  const filtered = lapakData.filter(lapak => {
    const cocokCari =
      lapak.no.toString().includes(search) ||
      lapak.nama.toLowerCase().includes(search);
    const cocokFilter = filter === "all" || lapak.status === filter;
    return cocokCari && cocokFilter;
  });

  filtered.forEach(lapak => {
    const div = document.createElement("div");
    div.className = `lapak-box ${lapak.status}`;
    div.innerHTML = `
      <h3>${lapak.no}</h3>
      <p>${lapak.nama}</p>
    `;
    div.onclick = () => openDetailModal(lapak);
    grid.appendChild(div);
  });
}

// === Modal Detail ===
function openDetailModal(lapak) {
  selectedLapak = lapak;

  const modal = document.getElementById("detailModal");
  const title = document.getElementById("detailTitle");
  const body = document.getElementById("detailBody");
  const btnAbsensi = document.getElementById("btnAbsensi");
  const btnRequest = document.getElementById("btnRequest");

  if (title) title.textContent = `Lapak ${lapak.no} - ${lapak.nama}`;
  if (body) {
    body.innerHTML = `
      <p><b>Nomor:</b> ${lapak.no}</p>
      <p><b>Nama:</b> ${lapak.nama}</p>
      <p><b>Status:</b> ${lapak.status}</p>
    `;
  }
  if (btnAbsensi) {
    btnAbsensi.onclick = () => openAbsensiModal(lapak.no, lapak.nama);
  }
  if (btnRequest) {
    btnRequest.onclick = () => {
      document.getElementById("lapakLama").value = `${lapak.no} - ${lapak.nama}`;
      document.getElementById("lapakBaru").value = "";
      document.getElementById("alasan").value = "";
      document.getElementById("password").value = "";
      document.getElementById("requestModal").style.display = "block";
    };
  }

  modal.style.display = "block";
}

function closeDetailModal() {
  document.getElementById("detailModal").style.display = "none";
}

// === Toast Notifikasi ===
function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.className = "toast show";
  setTimeout(() => (toast.className = "toast"), 3000);
}
