// === Absensi Handler ===

// Jangan pakai const API_URL lagi di sini, cukup di app.js
// Gunakan saja langsung API_URL yang sudah ada

// Fungsi buka modal absensi
function openAbsensiModal(lapakId, lapakName) {
  const modal = document.getElementById("detailModal");
  const title = document.getElementById("detailTitle");
  const body = document.getElementById("detailBody");

  if (title) title.textContent = `Absensi - Lapak ${lapakId} (${lapakName})`;
  if (body) body.innerHTML = `
    <p>Konfirmasi absensi untuk <b>${lapakName}</b>?</p>
  `;

  const btnAbsensi = document.getElementById("btnAbsensi");
  if (btnAbsensi) {
    btnAbsensi.onclick = () => submitAbsensi(lapakId);
  }

  modal.style.display = "block";
}

// Fungsi submit absensi
async function submitAbsensi(lapakId) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      body: new URLSearchParams({
        action: "absensi",
        lapakId: lapakId
      }),
    });

    const result = await response.json();
    alert(result.message || "Absensi berhasil disimpan");

    closeDetailModal();
  } catch (err) {
    console.error("Error absensi:", err);
    alert("Gagal menyimpan absensi.");
  }
}
