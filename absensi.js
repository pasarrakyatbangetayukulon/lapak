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
  const lapakNo = modal.dataset.lapakNo;
  const namaPelapak = modal.dataset.namaPelapak;
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
        action: "absen",
        noLapak: lapakNo,
        password: password
      })
    });

    const result = await response.json();
    alert(result.message || `✅ Absensi berhasil untuk Lapak ${lapakNo} - ${namaPelapak}`);

    closeAbsensiModal();
    closeDetailModal();

    // 🔄 Refresh grid biar warna/status lapak terupdate
    if (typeof loadData === "function") {
      loadData();
    }
  } catch (err) {
    console.error("Error absensi:", err);
    alert("❌ Gagal menyimpan absensi.");
  }
}
