// === Konfigurasi ===
const API_URL = "https://script.google.com/macros/s/AKfycbwnf3IcLzgMNXFGAYF8NK4B9rRqd9HkXFuMXFi9de_F0g1GB2KpOq0OS08elQZMBF02nQ/exec";

let lapakData = [];
let selectedLapak = "";
let currentPage = 1;
let pageSize = "all"; // ✅ default tampil semua

// === Load Data dari Backend ===
async function loadData() {
    try {
        showLoading(true);
        const res = await fetch(API_URL);
        const data = await res.json();
        lapakData = data;

        // Kalau default "all", set pageSize ke jumlah lapak
        if (pageSize === "all") {
            pageSize = lapakData.length;
            document.getElementById("pageSizeSelect").value = "all";
        }

        // Buat dropdown range otomatis
        generateRangeOptions();

        renderGrid();
    } catch (err) {
        console.error("Gagal load data:", err);
    } finally {
        showLoading(false);
    }
}


// === Generate Range Dropdown ===
function generateRangeOptions() {
    const rangeSelect = document.getElementById("rangeSelect");
    rangeSelect.innerHTML = ""; // reset dulu

    // Option Semua
    const optAll = document.createElement("option");
    optAll.value = "all";
    optAll.textContent = "Semua Nomor";
    rangeSelect.appendChild(optAll);

    // Cari max nomor lapak
    let maxNo = lapakData.length > 0 ? lapakData[lapakData.length - 1].no : 0;

    // Buat range per 50
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

    // 1. Filter data
    let filtered = lapakData.filter(({ no, nama, status }) => {
        if (filter === "kosong" && status !== "kosong") return false;
        if (filter === "terisi" && status !== "terisi") return false;

        if (
            !no.toString().includes(search) &&
            !nama.toLowerCase().includes(search)
        ) return false;

        if (range !== "all") {
            const [start, end] = range.split("-").map(Number);
            if (no < start || no > end) return false;
        }
        return true;
    });

    // 2. Pagination
    const totalPages = Math.ceil(filtered.length / pageSize);
    if (currentPage > totalPages) currentPage = totalPages || 1;
    const startIdx = (currentPage - 1) * pageSize;
    const pageData = filtered.slice(startIdx, startIdx + pageSize);

    // 3. Render lapak
    pageData.forEach(({ no, nama, status }) => {
        const div = document.createElement("div");
        div.className = "lapak " + status;
        div.innerHTML = `<strong>${no}</strong><br>${nama}`;
        div.onclick = () => openModal(no, nama);
        grid.appendChild(div);
    });

    // 4. Pagination nav
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
    document.getElementById("responseMsg").innerText = "";
}

// === Form Submit ===
document.getElementById("requestForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const body = {
        nama: document.getElementById("nama").value,
        lapakLama: document.getElementById("lapakLama").value,
        lapakBaru: document.getElementById("lapakBaru").value,
        alasan: document.getElementById("alasan").value,
        password: document.getElementById("password").value
    };

    try {
        const res = await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify(body)
        });
        const result = await res.json();

        const msg = document.getElementById("responseMsg");
        msg.innerText = result.message;
        msg.style.color = result.success ? "green" : "red";

        if (result.success) {
            setTimeout(() => {
                closeModal();
                loadData();
            }, 2000);
        }
    } catch (err) {
        console.error("Gagal kirim request:", err);
    }
});

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
