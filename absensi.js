// === Modal Absensi ===
function openAbsensiModal(lapakId, lapakName) {
  const modal = document.getElementById("absensiModal");
  const info = document.getElementById("absensiInfo");
  const passInput = document.getElementById("absensiPassword");

  if (info) {
    info.textContent = `Absensi untuk Lapak ${lapakId} - ${lapakName}`;
  }

  // simpan data lapak di atribut modal
  modal.dataset.lapakId = lapakId;
  modal.dataset.lapakName = lapakName;

  // reset input password
  if (passInput) passInput.value = "";

  modal.style.display = "block";
}

function closeAbsensiModal() {
  document.getElementById("absensiModal").style.display = "none";
}

// === Konfirmasi Absensi ===
// === Konfirmasi Absensi ===
async function confirmAbsensi() {
  const modal = document.getElementById("absensiModal");
  const lapakId = modal.dataset.lapakId;
  const lapakName = modal.dataset.lapakName;
  const password = document.getElementById("absensiPassword").value;

  if (!password) {
    alert("⚠️ Masukkan password panitia!");
    return;
  }

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json" // ✅ kirim JSON
      },
      body: JSON.stringify({
        action: "absen",   // ✅ backend siap terima ini
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
