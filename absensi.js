// === Konfigurasi API Web App Google Apps Script ===
const API_URL = "https://script.google.com/macros/s/AKfycbwnf3IcLzgMNXFGAYF8NK4B9rRqd9HkXFuMXFi9de_F0g1GB2KpOq0OS08elQZMBF02nQ/exec"; 
const PANITIA_PASSWORD = "panitia123";   // harus sama dengan di code.gs

// Fungsi dipanggil ketika klik tombol Absensi
async function absenLangsung(noLapak, nama) {
  // Prompt password panitia
  const inputPassword = prompt("Masukkan password panitia untuk absen:");

  if (!inputPassword) {
    alert("❌ Absensi dibatalkan.");
    return;
  }

  if (inputPassword !== PANITIA_PASSWORD) {
    alert("⚠️ Password salah! Tidak bisa absen.");
    return;
  }

  const payload = {
    password: PANITIA_PASSWORD,
    noLapak: noLapak,
    nama: nama
  };

  try {
    const res = await fetch(`${API_URL}?function=doPostAbsensi`, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" }
    });

    const data = await res.json();

    if (data.success) {
      alert(`✅ Absensi berhasil dicatat untuk ${nama}`);
    } else {
      alert(`⚠️ ${data.message}`);
    }

  } catch (err) {
    alert("❌ Error: " + err.message);
  }
}
