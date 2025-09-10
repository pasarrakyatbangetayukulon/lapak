// =================== Konfigurasi ===================
const API_URL = "https://script.google.com/macros/s/AKfycbwnf3IcLzgMNXFGAYF8NK4B9rRqd9HkXFuMXFi9de_F0g1GB2KpOq0OS08elQZMBF02nQ/exec";
let lapakData = [];
let currentPage = 1;
let pageSize = Infinity;
let loadingInterval;

// =================== Load Data ===================
async function loadData() {
    try {
        showLoading(true);
        const res = await fetch(API_URL);
        if (!res.ok) {
            showToast("Gagal konek ke server (" + res.status + ")", "error");
            return;
        }

        const text = await res.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch {
            showToast("Respon server tidak valid", "error");
            return;
        }

        lapakData = Array.isArray(data) ? data : (data.data || []);
        pageSize = lapakData.length || 1;

        const pageSizeSelect = document.getElementById("pageSizeSelect");
        if (pageSizeSelect) pageSizeSelect.value = "all";

        generateRangeOptions();
        renderGrid();
    } catch (err) {
        console.error(err);
        showToast("Terjadi kesalahan koneksi!", "error");
    } finally {
        showLoading(false);
    }
}

// =================== Loading Spinner ===================
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

// =================== Generate Range ===================
function generateRangeOptions() {
    const rangeSelect = document.getElementById("rangeSelect");
    rangeSelect.innerHTML = "";
    const optAll = new Option("Semua Nomor", "all");
    rangeSelect.appendChild(optAll);

    let maxNo = lapakData.length > 0 ? lapakData[lapakData.length - 1].no : 0;
    let step = 50;
    for (let start = 1; start <= maxNo; start += step) {
        let end = Math.min(start + step - 1, maxNo);
        rangeSelect.appendChild(new Option(`${start} - ${end}`, `${start}-${end}`));
    }
}

// =================== Render Grid ===================
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

    const safePageSize = pageSize > 0 ? pageSize : filtered.length || 1;
    const totalPages = Math.ceil(filtered.length / safePageSize);
    if (currentPage > totalPages) currentPage = totalPages || 1;
    const startIdx = (currentPage - 1) * safePageSize;
    const pageData = filtered.slice(startIdx, startIdx + safePageSize);

    pageData.forEach(({ no, nama, status }) => {
        const div = document.createElement("div");
        div.className = "lapak " + status;
        div.dataset.no = no;
        div.dataset.nama = nama;

        div.innerHTML = `
      <div class="lapak-info">
        <div class="lapak-no">Lapak: <span class="number">${no}</span></div>
        <hr class="lapak-separator" />
        <div class="lapak-nama">${nama.replace(/\(.*?\)/g, '')}</div>
        ${/\(.*?\)/.test(nama) ? `
          <hr class="lapak-separator" />
          <div class="lapak-inside">${nama.match(/\((.*?)\)/)[1]}</div>
        ` : ""}
      </div>
    `;

        div.onclick = () => openDetailModal({ noLapak: no, nama, status });
        grid.appendChild(div);
    });

    renderPagination(totalPages);
}

// =================== Render Pagination ===================
function renderPagination(totalPages) {
    const nav = document.getElementById("paginationNav");
    nav.innerHTML = "";
    if (totalPages <= 1) return;

    nav.append(`Halaman ${currentPage} dari ${totalPages}`);

    const prevBtn = document.createElement("button");
    prevBtn.textContent = "⬅ Prev";
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => { currentPage--; renderGrid(); };
    nav.appendChild(prevBtn);

    const nextBtn = document.createElement("button");
    nextBtn.textContent = "Next ➡";
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => { currentPage++; renderGrid(); };
    nav.appendChild(nextBtn);
}

// =================== Modal Detail Lapak ===================
function openDetailModal(lapak) {
    const modal = document.getElementById("detailModal");
    const title = document.getElementById("detailTitle");
    const body = document.getElementById("detailBody");

    title.textContent = `Detail Lapak ${lapak.noLapak}`;
    body.innerHTML = `
    <p><b>Nomor:</b> ${lapak.noLapak}</p>
    <p><b>Nama:</b> ${lapak.nama}</p>
    <p><b>Status:</b> ${lapak.status}</p>
  `;

    // simpan data untuk absensi & request
    modal.dataset.lapakId = lapak.noLapak;
    modal.dataset.lapakName = lapak.nama;

    modal.style.display = "flex";
}
function closeDetailModal() {
    document.getElementById("detailModal").style.display = "none";
}
function closeRequestModal() {
    document.getElementById("requestModal").style.display = "none";
}

// =================== Toast ===================
function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.style.display = "block";
    setTimeout(() => { toast.style.display = "none"; }, 3000);
}

// =================== Event Listeners ===================
document.getElementById("searchInput").addEventListener("input", () => { currentPage = 1; renderGrid(); });
document.getElementById("filterSelect").addEventListener("change", () => { currentPage = 1; renderGrid(); });
document.getElementById("rangeSelect").addEventListener("change", () => { currentPage = 1; renderGrid(); });
document.getElementById("pageSizeSelect").addEventListener("change", (e) => {
    pageSize = e.target.value === "all" ? lapakData.length : parseInt(e.target.value);
    currentPage = 1; renderGrid();
});

// Filter select warna
document.getElementById("filterSelect").addEventListener("change", (e) => {
    const sel = e.target;
    if (sel.value === "kosong") {
        sel.style.backgroundColor = "#2ecc71"; sel.style.color = "#000";
    } else if (sel.value === "terisi") {
        sel.style.backgroundColor = "#ffffff"; sel.style.color = "#000";
    } else {
        sel.style.backgroundColor = ""; sel.style.color = "";
    }
});

// Tombol Absensi & Request
document.getElementById("btnAbsensi").addEventListener("click", () => {
    const detailModal = document.getElementById("detailModal");
    openAbsensiModal(detailModal.dataset.lapakId, detailModal.dataset.lapakName);
});
document.getElementById("btnRequest").addEventListener("click", () => {
    const detailModal = document.getElementById("detailModal");
    document.getElementById("lapakLama").value = `${detailModal.dataset.lapakId} - ${detailModal.dataset.lapakName}`;
    document.getElementById("requestModal").style.display = "flex";
});

// Form Request
document.getElementById("requestForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const nama = document.getElementById("nama").value.trim();
    const lapakLama = document.getElementById("lapakLama").value.trim();
    const lapakBaru = document.getElementById("lapakBaru").value.trim();
    const alasan = document.getElementById("alasan").value.trim();
    const password = document.getElementById("password").value.trim();
    const submitBtn = document.getElementById("submitBtn");

    if (!nama || !lapakBaru || !alasan || !password) {
        showToast("⚠️ Semua field wajib diisi!", "error");
        return;
    }

    submitBtn.classList.add("loading");
    submitBtn.disabled = true;

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                action: "requestPergantian",
                nama, lapakLama, lapakBaru, alasan, password,
            }),
        });
        const result = await response.json();
        showToast(result.message || "✅ Request berhasil dikirim", "success");
        closeRequestModal();
    } catch (err) {
        console.error("Error request:", err);
        showToast("❌ Gagal mengirim request.", "error");
    } finally {
        submitBtn.classList.remove("loading");
        submitBtn.disabled = false;
    }
});

// =================== Init ===================
showLoading(true);
loadData();
