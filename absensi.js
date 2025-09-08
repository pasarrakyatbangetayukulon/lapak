// === Konfigurasi ===
const API_URL = "https://script.google.com/macros/s/AKfycbwnf3IcLzgMNXFGAYF8NK4B9rRqd9HkXFuMXFi9de_F0g1GB2KpOq0OS08elQZMBF02nQ/exec";

const PANITIA_PASSWORD = "panitia123";   // harus sama dengan di Apps Script

let selectedLapak = null;
let selectedNama = null;

// === Buka Modal Absensi ===
function openAbsensiModal(noLapak, nama) {
  console.log("🔐 Buka modal absensi:", noLapak, nama);
  selectedLapak = noLapak;
  selectedNama = nama;
  document.getElementById("absensiInfo").innerText = `Lapak ${noLapak} - ${nama}`;
  document.getElementById("absensiPassword").value = "";
  document.getElementById("absensiModal").style.display = "flex"; // ✅ gunakan flex biar modal muncul
}

// === Tutup Modal Absensi ===
function closeAbsensiModal() {
  document.getElementById("absensiModal").style.display = "none";
}

// === Kirim Absensi ===
async function confirmAbsensi() {
  const inputPassword = document.getElementById("absensiPassword").value;
  const btns = document.querySelectorAll("#absensiModal .form-actions button");

  if (!inputPassword) {
    showToast("⚠️ Password wajib diisi!", "error");
    return;
  }

  if (inputPassword !== PANITIA_PASSWORD) {
    showToast("❌ Password salah!", "error");
    return;
  }

  const payload = {
    action: "absen",
    password: PANITIA_PASSWORD,
    noLapak: selectedLapak,
    nama: selectedNama
  };

  console.log("📤 Kirim payload absensi:", payload);

  try {
    // ⏳ Tampilkan loading pada tombol
    btns.forEach(btn => {
      btn.disabled = true;
      if (btn.textContent.includes("Konfirmasi")) {
        btn.textContent = "⏳ Memproses...";
      }
    });

    const res = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" }
    });

    const data = await res.json();
    console.log("📥 Respon absensi:", data);

    if (data.success) {
      showToast(`✅ Absensi berhasil dicatat untuk ${selectedNama}`, "success");
      closeAbsensiModal();
      closeDetailModal();

      // ubah warna lapak jadi hijau
      const lapakBox = document.querySelector(`.lapak[data-no='${selectedLapak}']`);
      if (lapakBox) {
        lapakBox.classList.add("absen-sudah");
      }
    } else {
      showToast(`⚠️ ${data.message}`, "error");
    }
  } catch (err) {
    showToast("❌ Error: " + err.message, "error");
  } finally {
    // ✅ Kembalikan tombol normal
    btns.forEach(btn => {
      btn.disabled = false;
      if (btn.textContent.includes("Memproses")) {
        btn.textContent = "✅ Konfirmasi";
      }
    });
  }
}

// === Pasang onclick Absensi di modal detail ===
function setupAbsensiButton(noLapak, nama) {
  const btnAbsensi = document.getElementById("btnAbsensi");
  if (btnAbsensi) {
    btnAbsensi.onclick = function () {
      openAbsensiModal(noLapak, nama);
    };
  }
}
