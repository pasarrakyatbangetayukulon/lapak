// === Konfigurasi Password Panitia ===
const PANITIA_PASSWORD = "panitia123";   // harus sama dengan di Apps Script

let selectedLapak = null;
let selectedNama = null;

// === Modal Absensi ===
function openAbsensiModal(noLapak, nama) {
  console.log("🔐 Buka modal absensi:", noLapak, nama);
  selectedLapak = noLapak;
  selectedNama = nama;
  document.getElementById("absensiInfo").innerText = `Lapak ${noLapak} - ${nama}`;
  document.getElementById("absensiPassword").value = "";
  document.getElementById("absensiModal").style.display = "block";
}

function closeAbsensiModal() {
  document.getElementById("absensiModal").style.display = "none";
}

// === Kirim Absensi ===
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

  console.log("📤 Kirim payload absensi:", payload);

  try {
    const res = await fetch(`${API_URL}?function=doPostAbsensi`, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" }
    });

    const data = await res.json();
    console.log("📥 Respon absensi:", data);

    if (data.success) {
      alert(`✅ Absensi berhasil dicatat untuk ${selectedNama}`);
      closeAbsensiModal();
      closeDetailModal();

      // ubah warna lapak jadi hijau
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

// === Pasang onclick Absensi di modal detail ===
function setupAbsensiButton(noLapak, nama) {
  const btnAbsensi = document.getElementById("btnAbsensi");
  btnAbsensi.onclick = function () {
    openAbsensiModal(noLapak, nama);
  };
}
