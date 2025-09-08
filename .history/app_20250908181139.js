const API_URL = "PASTE_WEB_APP_URL"; // Ganti dengan URL Web App Google Apps Script
let selectedLapak = "";

async function loadData() {
    try {
        const res = await fetch(API_URL);
        const data = await res.json();

        const grid = document.getElementById("lapakGrid");
        grid.innerHTML = "";
        data.forEach((row) => {
            if (row[1]) {
                const div = document.createElement("div");
                div.className = "lapak";
                div.innerText = `${row[0]} - ${row[1]}`;
                div.onclick = () => openModal(row[0], row[1]);
                grid.appendChild(div);
            }
        });
    } catch (err) {
        console.error("Gagal load data:", err);
    }
}

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
                loadData(); // refresh lapak
            }, 2000);
        }
    } catch (err) {
        console.error("Gagal kirim request:", err);
    }
});

loadData();
