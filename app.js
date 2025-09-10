// =================== Konfigurasi ===================
const API_URL = "https://script.google.com/macros/s/AKfycbwnf3IcLzgMNXFGAYF8NK4B9rRqd9HkXFuMXFi9de_F0g1GB2KpOq0OS08elQZMBF02nQ/exec";
const modal = document.querySelector('.modal');
const modalContent = modal.querySelector('.modal-content');
const closeBtn = modal.querySelector('.close-btn');
const filterSelect = document.getElementById("filterSelect");
let lapakData = [];
let selectedLapak = "";
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
        } catch (err) {
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

// =================== Render Grid ===================
// =================== Render Grid ===================
function renderGrid() {
    const grid = document.getElementById("lapakGrid");
    const searchInput = document.getElementById("searchInput");
    const filterSelect = document.getElementById("filterSelect");
    const rangeSelect = document.getElementById("rangeSelect");

    if (!grid || !searchInput || !filterSelect || !rangeSelect) return;

    const search = searchInput.value.toLowerCase();
    const filter = filterSelect.value;
    const range = rangeSelect.value;

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
        div.setAttribute("data-no", no);
        div.setAttribute("data-nama", nama);

        div.innerHTML = `
            <div class="lapak-info">
                <div class="lapak-no">Lapak: <span class="number">${no}</span></div>
                <hr class="lapak-separator" />
                <div class="lapak-nama">
                    ${nama.replace(/\(.*?\)/g, '')} 
                </div>
                ${/\(.*?\)/.test(nama) ? `
                    <hr class="lapak-separator" />
                    <div class="lapak-inside">${nama.match(/\((.*?)\)/)[1]}</div>
                ` : ""}
            </div>
        `;

        if (typeof openDetailModal === "function") {
            div.onclick = () => openDetailModal({ noLapak: no, nama: nama, status: status });
        }

        grid.appendChild(div);
    });

    // ✅ tidak ada enableLongPressZoom lagi
    if (typeof renderPagination === "function") renderPagination(totalPages);
}


// =================== Render Pagination ===================
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
    if (title) title.textContent = `Detail Lapak ${lapak.noLapak}`;
    if (body) {
        body.innerHTML = `
            <p><b>Nomor:</b> ${lapak.noLapak}</p>
            <p><b>Nama:</b> ${lapak.nama}</p>
            <p><b>Status:</b> ${lapak.status}</p>
        `;
    }
    modal.style.display = "flex";
}

function closeDetailModal() {
    document.getElementById("detailModal").style.display = "none";
}

// =================== Toast ===================
const toast = document.getElementById("toast");
function showToast(message, type) {
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

// =================== Toolbar Sticky ===================
window.addEventListener("load", setToolbarTop);
window.addEventListener("resize", setToolbarTop);
function setToolbarTop() {
    const header = document.querySelector("header");
    const toolbar = document.querySelector(".toolbar");
    if (header && toolbar) {
        toolbar.style.top = header.offsetHeight + "px";
    }
}

filterSelect.addEventListener("change", () => {
    if (filterSelect.value === "kosong") {
        filterSelect.style.backgroundColor = "#2ecc71";
        filterSelect.style.color = "#000000ff";
    } else if (filterSelect.value === "terisi") {
        filterSelect.style.backgroundColor = "#ffffff";
        filterSelect.style.color = "#000000ff";
    } else {
        filterSelect.style.backgroundColor = "";
        filterSelect.style.color = "";
    }
});
// =================== Init ===================
showLoading(true);
loadData();
