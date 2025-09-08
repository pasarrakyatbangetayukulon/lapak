const API_URL = "https://script.google.com/macros/s/AKfycbwnf3IcLzgMNXFGAYF8NK4B9rRqd9HkXFuMXFi9de_F0g1GB2KpOq0OS08elQZMBF02nQ/exec";
let lapakData = [];
let selectedLapak = "";

// Load data dari backend
async function loadData() {
    try {
        const res = await fetch(API_URL);
        const data = await res.json();
        lapakData = data;
        renderGrid();
    } catch (err) {
        console.error("Gagal load data:", err);
    }
}

// Render grid lapak
function renderGrid() {
    const grid = document.getElementById("lapakGrid");
    const search = document.getElementById("searchInput").value.toLowerCase();
    const filter = document.getElementById("filterSelect").value;

    grid.innerHTML = "";
    lapakData.forEach((row) => {
        const noLapak = row[0];
        const namaPelapak = row[1] || "Kosong";

        // Filter & search
        if (
            (filter === "kosong" && row[1]) ||
            (filter === "terisi" && !row[1]) ||
            (!noLapak.toLowerCase().includes(search) &&
                !namaPelapak.toLowerCase().includes(search))
        ) {
            return;
        }

        // Buat kartu lapak
        const div = document.createElement("div");
        div.className = "lapak " + (row[1] ? "terisi" : "kosong");
        div.innerHTML = `<strong>${noLapak}</strong><br>${namaPelapak}`;
        div.onclick = () => openModal(noLapak, namaPelapak);
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

// Event listener untuk filter & search
document.getElementById("searchInput").addEventListener("input", renderGrid);
document.getElementById("filterSelect").addEventListener("change", renderGrid);

loadData();
