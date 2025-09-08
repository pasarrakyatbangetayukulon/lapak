// === Konfigurasi API Web App Google Apps Script ===
const API_URL = "https://script.google.com/macros/s/AKfycbwnf3IcLzgMNXFGAYF8NK4B9rRqd9HkXFuMXFi9de_F0g1GB2KpOq0OS08elQZMBF02nQ/exec"; // ganti dengan URL Web App kamu
const PANITIA_PASSWORD = "panitia123";   // harus sama dengan di Apps Script (code.gs/absensi.gs)

let selectedLapak = null;
let selectedNama = null;

// === Buka modal password absensi ===
function openAbsensiModal(noLapak, nama) {
  selectedLapak = noLapak;
  selectedNama = nama;
  document.getElementById("absensiInfo").innerText =
    `Lapak ${noLapak} - ${nama}`;
  document.getElementById("absensiPassword").value = "";
  document.getElementById("absensiModal").style.display = "block";
}

// === Tutup modal password absensi ===
function closeAbsensiModal() {
  document.getElementById("absensiModal").style.display = "none";
}

// === Konfirmasi Absensi ===
async function confirmAbsensi() {
  const inputPassword = document.getElementById("absensiPassword").value;

  if (!inputPassword) {
    alert("⚠️ Password wajib diisi!");
    return;
  }

  if (inputPassword !== PANITIA_PASSWORD) {
    alert("❌ Password salah!");
    return;
  }

  const payload = {
    password: PANITIA_PASSWORD,
    noLapak: selectedLapak,
    nama: selectedNama
  };

  try {
    const res = await fetch(`${API_URL}?function=doPostAbsensi`, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" }
    });

    const data = await res.json();
    if (data.success) {
      alert(`✅ Absensi berhasil dicatat untuk ${selectedNama}`);
      closeAbsensiModal();
      closeDetailModal();

      // opsional: ubah warna kotak lapak jadi hijau tanda sudah absen
      const lapakBox = document.querySelector(`.lapak[data-no='${selectedLapak}']`);
      if (lapakBox) {
        lapakBox.classList.add("absen-sudah");
      }
    } else {
      alert(`⚠️ ${data.message}`);
    }
  } catch (err) {
    alert("❌ Error: " + err.message);
  }
}

// === Integrasi dengan tombol di detail modal ===
// Fungsi ini dipanggil setelah modal detail dibuka
function setupAbsensiButton(noLapak, nama) {
  const btnAbsensi = document.getElementById("btnAbsensi");
  btnAbsensi.onclick = function () {
    openAbsensiModal(noLapak, nama);
  };
}
