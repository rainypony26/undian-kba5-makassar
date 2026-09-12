# LUCKY DRAW PRO - Sistem Nomor Undian Berbasis Web

Aplikasi web modern, interaktif, dan responsif untuk pengundian nomor kupon, doorprize, arisan, dan hadiah panggung acara.

## 🚀 Fitur Utama

- **Mode Pengundian Fleksibel**:
  - **Mode Rentang Angka (Range)**: Generate otomatis nomor `0001 - 1000` lengkap dengan kustomisasi prefix/awalan (misal `TKT-`, `A-`), panjang digit (leading zero), dan suffix.
  - **Mode Daftar Peserta Kustom**: Impor daftar nama dan nomor kupon melalui upload file CSV / TXT atau salin-tempel langsung dari Microsoft Excel.
- **Panggung Undian Proyektor (Stage Mode)**:
  - Tampilan layar penuh (*Fullscreen*) tanpa gangguan antarmuka admin saat acara berlangsung.
  - Animasi *Slot Machine / Odometer Reel* dengan durasi suspense yang dapat diatur (2 - 12 detik).
  - Shortcut keyboard: Tekan tombol **Spasi** untuk langsung memutar undian.
- **Efek Suara Sintetis (Web Audio API)**:
  - Suara ketukan roda berputar (*ticking*), drumroll ketegangan, dan melodi kemenangan (*fanfare*).
  - 100% bekerja secara offline tanpa memerlukan koneksi internet ataupun download file MP3.
- **Efek Visual Spektakuler**:
  - Ledakan konfeti kembang api warna-warni (*Canvas Confetti*) saat nomor pemenang berhenti.
- **Validasi & Berita Acara Pemenang**:
  - Opsi verifikasi: **Sahkan Pemenang** atau **Gugurkan / Undi Ulang** (bila pemenang tidak hadir di tempat).
  - Filter riwayat pemenang berdasarkan kategori hadiah dan status sah/gugur.
  - Ekspor rekapitulasi pemenang ke file **CSV / Excel** lengkap dengan stempel waktu (timestamp).
- **Manajemen Kategori Hadiah**:
  - Pengaturan kuota pemenang (misal Grand Prize: 1 orang, Hiburan: 10 orang).
  - Pilihan jumlah nomor diundi per putaran (1, 3, 5, atau 10 nomor sekaligus).
  - Progres ketercapaian kuota pemenang secara real-time.
- **Penyimpanan Lokal & Backup**:
  - Otomatis tersimpan di `localStorage` peramban (aman jika refresh atau browser tidak sengaja tertutup).
  - Fitur Ekspor & Impor Backup JSON untuk memindahkan konfigurasi antar-laptop panitia.

---

## 🛠️ Panduan Menjalankan Aplikasi

### Menjalankan Server Pengembangan (Local Dev):
```bash
npm run dev
```
Buka peramban pada alamat: `http://localhost:5173/`

### Membangun Versi Produksi (Production Build):
```bash
npm run build
```
File hasil kompilasi siap di-hosting akan berada di folder `dist/`.
Folder `dist/` ini dapat langsung di-upload ke layanan hosting seperti Vercel, Netlify, Cloudflare Pages, GitHub Pages, atau web server Apache/Nginx lokal.

---

## ⌨️ Pintasan Keyboard (Shortcuts)
- **Spasi**: Memutar undian / mengacak nomor pada tab Panggung Undian.
- **F11**: Masuk / Keluar mode Layar Penuh (Fullscreen proyektor).
