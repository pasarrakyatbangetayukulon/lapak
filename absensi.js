// === Modal Absensi ===
function openAbsensiModal(lapakId, lapakName) {
  const modal = document.getElementById("absensiModal");
  const info = document.getElementById("absensiInfo");
  const passInput = document.getElementById("absensiPassword");

  if (info) {
    info.textContent = `Absensi untuk Lapak ${lapakId} - ${lapakName}`;
  }

  modal.dataset.lapakId = lapakId;
  modal.dataset.lapakName = lapakName;

  if (passInput) passInput.value = "";
  modal.style.display = "block";
}

function closeAbsensiModal() {
  document.getElementById("absensiModal").style.display = "none";
}

// === Konfirmasi Absensi ===
async function confirmAbsensi() {
  const modal = document.getElementById("absensiModal");
  const lapakId = modal.dataset.lapakId;
  const password = document.getElementById("absensiPassword").value;

  if (!password) {
    alert("⚠️ Masukkan password panitia!");
    return;
  }

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        action: "absen",
        noLapak: lapakId,
        password: password
      })
    });

    const result = await response.json();
    alert(result.message || "✅ Absensi berhasil");

    if (result.success) {
      // disable tombol absensi di UI
      const btn = document.querySelector(`button[data-lapak-id="${lapakId}"]`);
      if (btn) {
        btn.disabled = true;
        btn.textContent = "Sudah Absen";
      }
    }

    closeAbsensiModal();
    closeDetailModal();
  } catch (err) {
    console.error("Error absensi:", err);
    alert("❌ Gagal menyimpan absensi.");
  }
}

// === Render Grid Lapak dengan status absensi ===
function renderGrid(lapakData) {
  const container = document.getElementById("lapakGrid");
  container.innerHTML = "";

  lapakData.forEach(lapak => {
    const card = document.createElement("div");
    card.className = "lapak-card";

    const title = document.createElement("h3");
    title.textContent = `Lapak ${lapak.no} - ${lapak.nama}`;
    card.appendChild(title);

    const btnAbsensi = document.createElement("button");
    btnAbsensi.dataset.lapakId = lapak.no;

    if (lapak.sudahAbsen) {
      btnAbsensi.disabled = true;
      btnAbsensi.textContent = "Sudah Absen";
    } else {
      btnAbsensi.textContent = "Absensi";
      btnAbsensi.onclick = () => openAbsensiModal(lapak.no, lapak.nama);
    }

    card.appendChild(btnAbsensi);
    container.appendChild(card);
  });
}
