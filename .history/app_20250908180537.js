const API_URL = "https://script.google.com/macros/s/AKfycbx1234567890/exec";
const grid = document.getElementById("grid");
const searchInput = document.getElementById("searchInput");
const showEmptyOnly = document.getElementById("showEmptyOnly");
const reloadBtn = document.getElementById("reload");
const modal = document.getElementById("requestModal");
const form = document.getElementById("requestForm");
const cancelBtn = document.getElementById("cancelBtn");
const requestTableBody = document.querySelector("#requestTable tbody");

async function loadData() {
    const res = await fetch(API_URL);
    const data = await res.json();
    renderGrid(data);
}

async function loadRequests() {
    const res = await fetch(API_URL + "?type=request");
    const data = await res.json();
    renderRequestTable(data);
}

function renderGrid(data) {
    const query = searchInput.value.toLowerCase();
    const filterEmpty = showEmptyOnly.checked;
    grid.innerHTML = "";

    data
        .filter(item => {
            if (filterEmpty && item.nama !== "") return false;
            if (query && !(`${item.no}`.includes(query) || item.nama.toLowerCase().includes(query))) return false;
            return true;
        })
        .forEach(item => {
            const card = document.createElement("div");
            card.className = "stall-card" + (item.nama === "" ? " empty" : "");
            card.innerHTML = `
        <div>
          <strong>${item.no}</strong>
          <div>${item.nama || "(Kosong)"}</div>
        </div>
        <button class="request-btn">Request</button>
      `;
            card.querySelector(".request-btn").addEventListener("click", () => openRequestForm(item));
            grid.appendChild(card);
        });
}

function renderRequestTable(data) {
    requestTableBody.innerHTML = "";
    data.forEach(row => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
      <td>${new Date(row.tanggal).toLocaleString()}</td>
      <td>${row.nama}</td>
      <td>${row.lapakLama}</td>
      <td>${row.lapakBaru}</td>
      <td>${row.alasan}</td>
      <td>${row.status}</td>
    `;
        requestTableBody.appendChild(tr);
    });
}

function openRequestForm(item) {
    document.getElementById("lapakLama").value = item.no;
    modal.showModal();
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(form);

    await fetch(API_URL, { method: "POST", body: formData });

    alert("Request berhasil dikirim!");
    form.reset();
    modal.close();
    loadRequests();
});

cancelBtn.addEventListener("click", () => modal.close());
reloadBtn.addEventListener("click", () => { loadData(); loadRequests(); });
searchInput.addEventListener("input", loadData);
showEmptyOnly.addEventListener("change", loadData);

loadData();
loadRequests();
