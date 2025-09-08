const API_URL = "https://script.google.com/macros/s/AKfycbwnf3IcLzgMNXFGAYF8NK4B9rRqd9HkXFuMXFi9de_F0g1GB2KpOq0OS08elQZMBF02nQ/exec";
let lapakData = [];
let selectedLapak = "";

// Load data dari backend
async function loadData() {
    const grid = document.getElementById("lapakGrid");
    grid.innerHTML = `<div class="loading">⏳ Loading data...</div>`;

    try {
        const res = await fetch(API_URL, { cache: "no-store" });
        const data = await res.json();

        lapakData = Array.isArray(data) ? data : [];
        renderGrid();
    } catch (err) {
        console.error("Gagal load data:", err);
        grid.innerHTML = `<div class="error">⚠️ Gagal memuat data</div>`;
    }
}

// Render grid lapak
function renderGrid() {
    const grid = document.getElementById("lapakGrid");
    const search = document.getElementById("searchInput").value.toLowerCase();
    const filter = document.getElementById("filterSelect").value;

    grid.innerHTML = "";

    let filtered = lapakData.filter(({ no, nama, status }) => {
        if (filter === "kosong" && status !== "kosong") return false;
        if (filter === "terisi" && status !== "terisi") return false;

        return (
            no.toLowerCase().includes(search) ||
            nama.toLowerCase().includes(search)
        );
    });

    if (filtered.length === 0) {
        grid.innerHTML = `<div class="no-data">Tidak ada data ditemukan</div>`;
        return;
    }

    filtered.forEach(({ no, nama, status }) => {
        const div = document.createElement("div");
        div.className = "lapak " + status;
        div.innerHTML = `<strong>${no}</strong><br>${nama}`;
        div.onclick = () => openModal(no, nama);
        grid.appendChild(div);
    });
}

// Modal
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

// Form submit
document.getElementById("requestForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const body = {
        nama: document.getElementById("nama").value,
        lapakLama: document.getElementById("lapakLama").value,
        lapakBaru: document.getElementById("lapakBaru").value,
        alasan: document.getElementById("alasan").value,
        password: document.getElementById("password").value
    };

    const msg = document.getElementById("responseMsg");
    msg.innerText = "⏳ Mengirim data...";
    msg.style.color = "black";

    try {
        const res = await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify(body)
        });
        const result = await res.json();

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
        msg.innerText = "⚠️ Gagal mengirim data!";
        msg.style.color = "red";
    }
});

// Event listener untuk filter & search
document.getElementById("searchInput").addEventListener("input", renderGrid);
document.getElementById("filterSelect").addEventListener("change", renderGrid);

// Auto load
loadData();
