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
function renderGrid() {
  const grid = document.getElementById("lapakGrid");
  const search = document.getElementById("searchInput").value.toLowerCase();
  const filter = document.getElementById("filterSelect").value;
  const range = document.getElementById("rangeSelect").value;

  grid.innerHTML = "";

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

  const totalPages = Math.ceil(filtered.length / pageSize);
  if (currentPage > totalPages) currentPage = totalPages || 1;
  const startIdx = (currentPage - 1) * pageSize;
  const pageData = filtered.slice(startIdx, startIdx + pageSize);

  pageData.forEach(({ no, nama, status }) => {
    const div = document.createElement("div");
    div.className = "lapak " + status;
    div.innerHTML = `<strong>${no}</strong><br>${nama}`;
    div.onclick = () => openModal(no, nama);
    grid.appendChild(div);
  });

  renderPagination(totalPages);
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

// === Modal ===
function openModal(lapakNo, namaPelapak) {
  selectedLapak = lapakNo;
  document.getElementById("lapakLama").value = lapakNo + " - " + namaPelapak;
  document.getElementById("requestModal").style.display = "flex";
}
function closeModal() {
  document.getElementById("requestModal").style.display = "none";
  document.getElementById("requestForm").reset();
}

// === Form Submit + Toast ===
// === Form Submit ===
const form = document.getElementById("requestForm");
const submitBtn = document.getElementById("submitBtn");
const toast = document.getElementById("toast");
// === Form Submit ===
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
    console.log("RAW RESPONSE:", text);

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
        closeModal();
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

 
 

function showToast(message, type) {
  toast.textContent = message;
  toast.className = `toast ${type}`;
  toast.style.display = "block";
  setTimeout(() => {
    toast.style.display = "none";
  }, 3000);
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

// === Init ===
loadData();
