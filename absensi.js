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
    showAbsensiLoading(true);
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
  } finally {
    // sembunyikan loading saat toast muncul
    setTimeout(() => showAbsensiLoading(false), 300);
  }
}
function showAbsensiLoading(show, text = "Sedang menyimpan data...") {
  const loader = document.getElementById("absensiLoading");
  const loadingText = document.getElementById("absensiLoadingText");

  if (show) {
    loader.style.display = "flex";
    loadingText.textContent = text;
  } else {
    loader.style.display = "none";
  }
}
