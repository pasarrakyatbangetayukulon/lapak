// === Konfigurasi ===
const API_URL = "https://script.google.com/macros/s/AKfycbwnf3IcLzgMNXFGAYF8NK4B9rRqd9HkXFuMXFi9de_F0g1GB2KpOq0OS08elQZMBF02nQ/exec";
const PANITIA_PASSWORD = "panitia123";

let selectedLapak = null;
let selectedNama = null;

// === Buka Modal Absensi ===
function openAbsensiModal(noLapak, nama) {
  selectedLapak = noLapak;
  selectedNama = nama;

  const modal = document.getElementById("absensiModal");
  document.getElementById("absensiInfo").innerText = `Lapak ${noLapak} - ${nama}`;
  document.getElementById("absensiPassword").value = "";
  modal.style.display = "flex"; // ✅ pakai flex agar center
}

// === Tutup Modal Absensi ===
function closeAbsensiModal() {
  document.getElementById("absensiModal").style.display = "none";
}

// === Kirim Absensi ===
async function confirmAbsensi() {
  const inputPassword = document.getElementById("absensiPassword").value;
  const modal = document.getElementById("absensiModal");
  const buttons = modal.querySelectorAll(".form-actions button");
  const confirmBtn = buttons[0]; // tombol pertama = Konfirmasi

  if (!inputPassword) { showToast("⚠️ Password wajib diisi!", "error"); return; }
  if (inputPassword !== PANITIA_PASSWORD) { showToast("❌ Password salah!", "error"); return; }

  const payload = {
    action: "absen",
    password: PANITIA_PASSWORD,
    noLapak: selectedLapak,
    nama: selectedNama
  };

  try {
    // ⏳ indikator proses di tombol
    buttons.forEach(b => b.disabled = true);
    const oldText = confirmBtn.textContent;
    confirmBtn.textContent = "⏳ Memproses...";

    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    // Antisipasi respon non-JSON
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); }
    catch { throw new Error("Respon server tidak valid"); }

    if (data.success) {
      showToast(`✅ Absensi berhasil untuk ${selectedNama}`, "success");
      closeAbsensiModal();
      closeDetailModal?.();

      // ✅ warnai kotak lapak (butuh data-no dari app.js patch)
      const lapakBox = document.querySelector(`.lapak[data-no='${selectedLapak}']`);
      if (lapakBox) lapakBox.classList.add("absen-sudah");
    } else {
      showToast(`⚠️ ${data.message}`, "error");
    }
  } catch (err) {
    showToast("❌ Error: " + err.message, "error");
  } finally {
    buttons.forEach(b => b.disabled = false);
    confirmBtn.textContent = "✅ Konfirmasi";
  }
}

// (opsional) Enter untuk submit di input password
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && document.getElementById("absensiModal").style.display === "flex") {
    confirmAbsensi();
  }
});
