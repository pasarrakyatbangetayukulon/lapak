// === Modal Absensi ===
function openAbsensiModal(lapakNo, namaPelapak) {
  const modal = document.getElementById("absensiModal");
  const info = document.getElementById("absensiInfo");
  const passInput = document.getElementById("absensiPassword");

  if (info) {
    info.textContent = `Absensi untuk Lapak ${lapakNo} - ${namaPelapak}`;
  }

  // simpan data lapak di atribut modal
  modal.dataset.lapakNo = lapakNo;
  modal.dataset.namaPelapak = namaPelapak;

  // reset input password
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

    closeAbsensiModal();
    closeDetailModal();
  } catch (err) {
    console.error("Error absensi:", err);
    alert("❌ Gagal menyimpan absensi.");
  }
}

