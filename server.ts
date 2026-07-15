/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { 
  AppConfig, User, Pembina, Peserta, MasterSKU, ProgressSKU, 
  TingkatHistory, TKKAward, AbsensiPeserta, AbsensiPembina, 
  Jadwal, KalenderKegiatan, Materi, Pengumuman, Notifikasi, 
  Portofolio, Prestasi, Sertifikat, Galeri, Inventaris, 
  RefleksiSiswa, RefleksiPembina, PenilaianSikap, LogAktivitas 
} from "./src/types";

const app = express();
const PORT = 3000;

// Path to localized JSON database
const DB_FILE = path.join(process.cwd(), "sigudep_store.json");

// Local Database Structure representing the Google Spreadsheet sheets
interface Database {
  configs: AppConfig;
  users: User[];
  pembina: Pembina[];
  peserta: Peserta[];
  master_sku: MasterSKU[];
  progress_sku: ProgressSKU[];
  tingkat: TingkatHistory[];
  tkk: TKKAward[];
  absensi_peserta: AbsensiPeserta[];
  absensi_pembina: AbsensiPembina[];
  jadwal: Jadwal[];
  kalender: KalenderKegiatan[];
  materi: Materi[];
  pengumuman: Pengumuman[];
  notifikasi: Notifikasi[];
  portofolio: Portofolio[];
  prestasi: Prestasi[];
  sertifikat: Sertifikat[];
  galeri: Galeri[];
  inventaris: Inventaris[];
  refleksi_siswa: RefleksiSiswa[];
  refleksi_pembina: RefleksiPembina[];
  penilaian_sikap: PenilaianSikap[];
  log_aktivitas: LogAktivitas[];
}

// Default Configuration and Seeds
const defaultConfigs: AppConfig = {
  NamaAplikasi: "SiGudep",
  NamaGudep: "Gugus Depan Ki Hajar Dewantara - Raden Ajeng Kartini",
  NomorGudep: "03.045 - 03.046",
  AlamatGudep: "Jl. Pendidikan No. 10, Jakarta",
  Logo: "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=120&auto=format&fit=crop&q=80", // scout logo placeholder
  Favicon: "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=32&auto=format&fit=crop&q=80",
  ThemeColor: "#2A9D8F",
  SpreadsheetID: "",
  FolderDriveID: "",
  ScriptURL: "",
  Versi: "1.0",
  TahunAktif: "2026/2027",
  Email: "gudep@gmail.com",
  Telepon: "021-5551234",
  Website: "https://gudep.sch.id",
  CreatedAt: new Date().toISOString(),
  UpdatedAt: new Date().toISOString(),
  GugusDepanID: "gudep-1",
  NomorPutra: "03.045",
  NomorPutri: "03.046",
  NamaMabigus: "Dr. H. Siswanto, M.Pd.",
  Kwarcab: "Jakarta Pusat",
  Kwarda: "DKI Jakarta",
  AlamatSekretariat: "Jl. Pendidikan No. 10, Jakarta"
};

// SHA256 helper for password hashing
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// Generate UUID replacement
function generateUUID(): string {
  return crypto.randomUUID();
}

// Load database from file
function loadDB(): Database {
  if (fs.existsSync(DB_FILE)) {
    try {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(data);
    } catch (e) {
      console.error("Error reading database file, resetting:", e);
    }
  }
  // Initialize with seeded database
  const db = initDefaultDB();
  saveDB(db);
  return db;
}

// Save database to file
function saveDB(db: Database) {
  try {
    let oldDb: Database | null = null;
    if (fs.existsSync(DB_FILE)) {
      try {
        oldDb = JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
      } catch (err) {
        // Ignore parsing errors for clean recovery
      }
    }

    // Write the new database state locally
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");

    // Automatically detect changed tables and sync them to Google Sheets in real-time if ScriptURL is configured
    if (db.configs.ScriptURL && db.configs.ScriptURL.startsWith("https://script.google.com")) {
      const keys = Object.keys(db) as (keyof Database)[];
      const changedTables: string[] = [];

      for (const key of keys) {
        const oldVal = oldDb ? JSON.stringify(oldDb[key]) : "";
        const newVal = JSON.stringify(db[key]);
        if (oldVal !== newVal) {
          changedTables.push(key);
        }
      }

      if (changedTables.length > 0) {
        console.log(`[Google Sheets Auto-Sync] Perubahan terdeteksi pada tabel: ${changedTables.join(", ")}. Melakukan sinkronisasi...`);
        changedTables.forEach(table => {
          syncTableToGoogleSheets(table).catch(err => {
            console.error(`[Google Sheets Auto-Sync Error] Gagal menyinkronkan tabel '${table}':`, err.message || err);
          });
        });
      }
    }
  } catch (e) {
    console.error("Error writing database file:", e);
  }
}

// Wrapper to save locally and background sync designated tables to Google Sheets
function saveAndSync(tables: string[]) {
  saveDB(database);
  tables.forEach(table => {
    syncTableToGoogleSheets(table).catch(err => console.error(`[Sync Background Error] ${table}:`, err));
  });
}

// Background syncing helper to Google Sheets
async function syncTableToGoogleSheets(table: string) {
  const scriptURL = database.configs.ScriptURL;
  if (!scriptURL || !scriptURL.startsWith("https://script.google.com")) {
    return;
  }

  try {
    let tableData: any = (database as any)[table];
    if (table === "configs") {
      tableData = [database.configs]; // configs is stored as a single row array
    }

    console.log(`[Google Sheets Sync] Syncing table '${table}' in background...`);
    const response = await fetch(scriptURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "writeTable",
        table: table,
        data: tableData
      })
    });

    if (response.ok) {
      console.log(`[Google Sheets Sync] Table '${table}' synced successfully.`);
    } else {
      const status = response.status;
      let errorMsg = "";
      if (status === 403) {
        errorMsg = "Forbidden (Akses Ditolak). Pastikan setelan deployment Google Apps Script diatur agar 'Siapa Saja' (Anyone) memiliki akses, dan izin eksternal akun Google Workspace Anda diaktifkan.";
      } else {
        const text = await response.text();
        errorMsg = text.length > 300 ? text.substring(0, 300) + "..." : text;
      }
      console.error(`[Google Sheets Sync] Failed to sync table '${table}': Status ${status} - ${errorMsg}`);
    }
  } catch (err: any) {
    console.error(`[Google Sheets Sync] Error background syncing table '${table}':`, err.message || err);
  }
}

// Upload base64 files directly to Google Drive via Apps Script
async function uploadToGoogleDriveIfBase64(base64Data: string, fileName: string): Promise<string> {
  const scriptURL = database.configs.ScriptURL;
  const folderId = database.configs.FolderDriveID;
  if (!scriptURL || !scriptURL.startsWith("https://script.google.com")) {
    return base64Data; // fallback to base64 if no Apps Script Web App configured
  }

  try {
    const parts = base64Data.split(",");
    if (parts.length < 2) return base64Data;
    
    const mimeMatch = parts[0].match(/data:(.*?);/);
    const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
    const rawBase64 = parts[1];

    console.log(`[Google Drive Upload] Uploading ${fileName} to Google Drive...`);
    const response = await fetch(scriptURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "uploadFile",
        folderId: folderId || "",
        fileName: fileName,
        mimeType: mimeType,
        base64Data: rawBase64
      })
    });

    if (response.ok) {
      const result = await response.json() as any;
      if (result && result.success && result.url) {
        console.log(`[Google Drive Upload] Uploaded! URL: ${result.url}`);
        return result.url;
      }
    } else {
      const status = response.status;
      let errorMsg = "";
      if (status === 403) {
        errorMsg = "Forbidden (Akses Ditolak). Pastikan setelan deployment Google Apps Script diatur agar 'Siapa Saja' (Anyone) memiliki akses, dan izin eksternal akun Google Workspace Anda diaktifkan.";
      } else {
        const text = await response.text();
        errorMsg = text.length > 300 ? text.substring(0, 300) + "..." : text;
      }
      console.error(`[Google Drive Upload] Upload failed on Apps Script: Status ${status} - ${errorMsg}`);
    }
  } catch (err: any) {
    console.error("[Google Drive Upload] Error during upload process:", err.message || err);
  }
  return base64Data;
}

// Intercept photo field in body if it has base64 data
async function processPhotoAndUpload(data: any, prefix: string): Promise<any> {
  if (data && data.Foto && data.Foto.startsWith("data:image/")) {
    const id = data.PesertaID || data.PembinaID || generateUUID().slice(0, 8);
    const driveUrl = await uploadToGoogleDriveIfBase64(data.Foto, `${prefix}_${id}.jpg`);
    if (driveUrl) {
      data.Foto = driveUrl;
    }
  }
  return data;
}

// Helper to log user actions (Audit Trail)
function writeLog(db: Database, userID: string, name: string, role: string, modul: string, aktivitas: string, dataID: string, keterangan: string) {
  const log: LogAktivitas = {
    LogID: generateUUID(),
    Tanggal: new Date().toISOString().split('T')[0],
    Jam: new Date().toLocaleTimeString('id-ID'),
    UserID: userID,
    Nama: name,
    Role: role,
    Modul: modul,
    Aktivitas: aktivitas,
    DataID: dataID,
    Keterangan: keterangan
  };
  db.log_aktivitas.unshift(log); // newest first
  if (db.log_aktivitas.length > 1000) {
    db.log_aktivitas = db.log_aktivitas.slice(0, 1000); // keep max 1000 logs
  }
}

// Seeding standard scout values (Indonesian Pramuka SKU and general inventory)
function initDefaultDB(): Database {
  const adminId = "usr-admin-1";

  const initialUsers: User[] = [
    {
      UserID: adminId,
      Username: "admin",
      PasswordHash: hashPassword("admin123"),
      Role: "SUPER_ADMIN",
      NamaLengkap: "Kak Herlambang R.",
      Status: "Aktif",
      CreatedAt: new Date().toISOString(),
      UpdatedAt: new Date().toISOString()
    }
  ];

  const initialPembina: Pembina[] = [];
  const initialPeserta: Peserta[] = [];

  // Scout SKU lists (Syarat Kecakapan Umum)
  const initialMasterSKU: MasterSKU[] = [
    // Penggalang Ramu (General)
    { SkuID: "sku-penggalang-1", Golongan: "Penggalang", Tingkat: "Penggalang Ramu", NomorButir: 1, Bidang: "Keagamaan", Deskripsi: "Selalu taat menjalankan ibadah agamanya secara pribadi ataupun berjamaah.", Urutan: 1, Status: "Aktif" },
    { SkuID: "sku-penggalang-2", Golongan: "Penggalang", Tingkat: "Penggalang Ramu", NomorButir: 2, Bidang: "Keagamaan", Deskripsi: "Dapat menjelaskan hari-hari besar agama di Indonesia.", Urutan: 2, Status: "Aktif" },
    { SkuID: "sku-penggalang-3", Golongan: "Penggalang", Tingkat: "Penggalang Ramu", NomorButir: 3, Bidang: "Karakter", Deskripsi: "Menghafal Dasa Darma Pramuka dan Tri Satya Pramuka beserta maknanya.", Urutan: 3, Status: "Aktif" },
    { SkuID: "sku-penggalang-4", Golongan: "Penggalang", Tingkat: "Penggalang Ramu", NomorButir: 4, Bidang: "Pancasila & Negara", Deskripsi: "Dapat menjelaskan tentang lambang Negara Indonesia, lambang Gerakan Pramuka, dan lagu kebangsaan Indonesia Raya.", Urutan: 4, Status: "Aktif" },
    { SkuID: "sku-penggalang-5", Golongan: "Penggalang", Tingkat: "Penggalang Ramu", NomorButir: 5, Bidang: "Pancasila & Negara", Deskripsi: "Dapat menyebutkan sejarah singkat bendera Merah Putih.", Urutan: 5, Status: "Aktif" },
    { SkuID: "sku-penggalang-6", Golongan: "Penggalang", Tingkat: "Penggalang Ramu", NomorButir: 6, Bidang: "Keterampilan Pramuka", Deskripsi: "Dapat membuat simpul mati, simpul hidup, simpul anyam, simpul tiang, dan simpul pangkal.", Urutan: 6, Status: "Aktif" },
    { SkuID: "sku-penggalang-7", Golongan: "Penggalang", Tingkat: "Penggalang Ramu", NomorButir: 7, Bidang: "Keterampilan Pramuka", Deskripsi: "Dapat menggunakan kompas dan menentukan 8 arah mata angin.", Urutan: 7, Status: "Aktif" },
    { SkuID: "sku-penggalang-8", Golongan: "Penggalang", Tingkat: "Penggalang Ramu", NomorButir: 8, Bidang: "Fisik & Olahraga", Deskripsi: "Dapat melakukan senam Pramuka dan lari 1000 meter.", Urutan: 8, Status: "Aktif" },
    { SkuID: "sku-penggalang-9", Golongan: "Penggalang", Tingkat: "Penggalang Ramu", NomorButir: 9, Bidang: "Kesehatan", Deskripsi: "Dapat menjelaskan tentang pertolongan pertama pada kecelakaan (P3K) ringan.", Urutan: 9, Status: "Aktif" }
  ];

  const initialProgressSKU: ProgressSKU[] = [];
  const initialTKK: TKKAward[] = [];
  const initialTingkat: TingkatHistory[] = [];
  const initialAbsensiPeserta: AbsensiPeserta[] = [];
  const initialJadwal: Jadwal[] = [];
  const initialKalender: KalenderKegiatan[] = [];
  const initialMateri: Materi[] = [];
  const initialPengumuman: Pengumuman[] = [];
  const initialNotifikasi: Notifikasi[] = [];
  const initialInventaris: Inventaris[] = [];
  const initialPenilaianSikap: PenilaianSikap[] = [];
  const initialRefleksiSiswa: RefleksiSiswa[] = [];
  const initialRefleksiPembina: RefleksiPembina[] = [];

  const initialLog: LogAktivitas[] = [
    {
      LogID: "log-init-1",
      Tanggal: new Date().toISOString().split('T')[0],
      Jam: new Date().toLocaleTimeString('id-ID'),
      UserID: "SYSTEM",
      Nama: "Inisialisasi Sistem",
      Role: "SYSTEM",
      Modul: "Sistem",
      Aktivitas: "Inisialisasi Database",
      DataID: "NONE",
      Keterangan: "Sistem basis data SiGudep berhasil disiapkan dalam mode produksi profesional bersih."
    }
  ];

  return {
    configs: defaultConfigs,
    users: initialUsers,
    pembina: initialPembina,
    peserta: initialPeserta,
    master_sku: initialMasterSKU,
    progress_sku: initialProgressSKU,
    tingkat: initialTingkat,
    tkk: initialTKK,
    absensi_peserta: initialAbsensiPeserta,
    absensi_pembina: [],
    jadwal: initialJadwal,
    kalender: initialKalender,
    materi: initialMateri,
    pengumuman: initialPengumuman,
    notifikasi: initialNotifikasi,
    portofolio: [],
    prestasi: [],
    sertifikat: [],
    galeri: [],
    inventaris: initialInventaris,
    refleksi_siswa: initialRefleksiSiswa,
    refleksi_pembina: initialRefleksiPembina,
    penilaian_sikap: initialPenilaianSikap,
    log_aktivitas: initialLog
  };
}

// Ensure database is initialized
let database = loadDB();

// Body parsers
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// --- API ROUTES ---

// Admin Setup database manually
app.post("/api/setup", (req, res) => {
  try {
    database = initDefaultDB();
    saveDB(database);
    res.json({ success: true, message: "Setup database SiGudep berhasil diselesaikan!" });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Auth Login
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Username dan Password wajib diisi." });
  }

  const user = database.users.find(u => u.Username.toLowerCase() === username.toLowerCase());
  if (!user) {
    return res.status(401).json({ success: false, message: "Username atau password salah." });
  }

  if (user.Status !== "Aktif") {
    return res.status(403).json({ success: false, message: `Akun Anda sedang ${user.Status}. Silakan hubungi pembina.` });
  }

  const hash = hashPassword(password);
  if (user.PasswordHash !== hash) {
    return res.status(401).json({ success: false, message: "Username atau password salah." });
  }

  user.LastLogin = new Date().toISOString();
  saveDB(database);

  // Write log
  writeLog(database, user.UserID, user.NamaLengkap, user.Role, "Auth", "Login", user.UserID, `${user.NamaLengkap} berhasil login.`);
  saveDB(database);

  res.json({
    success: true,
    user: {
      UserID: user.UserID,
      Username: user.Username,
      Role: user.Role,
      NamaLengkap: user.NamaLengkap,
      PembinaID: user.PembinaID,
      PesertaID: user.PesertaID
    }
  });
});

// App Config Endpoint
app.get("/api/config", (req, res) => {
  res.json(database.configs);
});

app.put("/api/config", async (req, res) => {
  const updated = req.body;
  const oldScriptURL = database.configs.ScriptURL;

  // Intercept Logo if it starts with data:image/
  if (updated.Logo && updated.Logo.startsWith("data:image/")) {
    const driveUrl = await uploadToGoogleDriveIfBase64(updated.Logo, "logo_sigudep.jpg");
    if (driveUrl) {
      updated.Logo = driveUrl;
    }
  }

  database.configs = {
    ...database.configs,
    ...updated,
    UpdatedAt: new Date().toISOString()
  };
  saveDB(database);

  // If ScriptURL changed and is valid, trigger an automatic import/sync!
  if (database.configs.ScriptURL && 
      database.configs.ScriptURL !== oldScriptURL && 
      database.configs.ScriptURL.startsWith("https://script.google.com")) {
    try {
      console.log("ScriptURL updated, pulling initial data from Google Sheets...");
      const response = await fetch(`${database.configs.ScriptURL}?action=read`);
      if (response.ok) {
        const remoteDB = await response.json() as any;
        if (remoteDB && remoteDB.configs) {
          database = {
            ...database,
            ...remoteDB
          };
          // Preserve current local settings
          database.configs.ScriptURL = updated.ScriptURL;
          database.configs.SpreadsheetID = updated.SpreadsheetID || database.configs.SpreadsheetID;
          database.configs.FolderDriveID = updated.FolderDriveID || database.configs.FolderDriveID;
          saveDB(database);
          console.log("Initial import from Google Sheets successful!");
        }
      } else {
        if (response.status === 403) {
          console.error("[Google Sheets Auto-Import] Gagal melakukan import otomatis: Akses Ditolak (Status 403). Pastikan setelan deployment Google Apps Script diatur agar 'Siapa Saja' (Anyone) memiliki akses.");
        } else {
          console.error(`[Google Sheets Auto-Import] Gagal melakukan import otomatis: Status ${response.status}`);
        }
      }
    } catch (err: any) {
      console.error("Failed to import from Google Sheets on URL change:", err.message || err);
    }
  } else {
    // If ScriptURL is configured, sync the configs table back
    syncTableToGoogleSheets("configs");
  }

  res.json({ success: true, configs: database.configs });
});

// Manual Bidirectional Sync Endpoint
app.post("/api/sistem/sync", async (req, res) => {
  const scriptURL = database.configs.ScriptURL;
  if (!scriptURL || !scriptURL.startsWith("https://script.google.com")) {
    return res.status(400).json({ success: false, message: "Apps Script Web App URL belum dikonfigurasi di pengaturan sistem!" });
  }

  try {
    console.log("Synchronizing all data from Google Sheets...");
    const response = await fetch(`${scriptURL}?action=read`);
    if (!response.ok) {
      if (response.status === 403) {
        throw new Error("Akses Ditolak (Status 403). Pastikan Google Apps Script Anda telah di-deploy sebagai Web App dengan 'Who has access' (Siapa yang memiliki akses) diset ke 'Anyone' (Siapa saja) dan telah diotorisasi dengan benar.");
      }
      throw new Error(`Apps Script returned status ${response.status}`);
    }
    
    const remoteDB = await response.json() as any;
    if (remoteDB && remoteDB.configs) {
      // Overwrite local tables with spreadsheet data
      database = {
        ...database,
        ...remoteDB
      };
      saveDB(database);
      res.json({ success: true, message: "Sinkronisasi dua arah dengan Google Sheets berhasil!", configs: database.configs });
    } else {
      res.status(500).json({ success: false, message: "Data dari spreadsheet kosong atau format tidak sesuai." });
    }
  } catch (err: any) {
    console.error("Error during sheets sync:", err);
    res.status(500).json({ success: false, message: `Gagal sinkronisasi: ${err.message}` });
  }
});

// Manual Google Sheets Table Initialization Proxy Endpoint
app.post("/api/sistem/init", async (req, res) => {
  const scriptURL = database.configs.ScriptURL;
  if (!scriptURL || !scriptURL.startsWith("https://script.google.com")) {
    return res.status(400).json({ success: false, message: "Apps Script Web App URL belum dikonfigurasi di pengaturan sistem!" });
  }

  try {
    console.log("[Google Sheets Init] Initializing Google Sheets tables via server-side proxy...");
    const response = await fetch(scriptURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "setup" })
    });

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error("Akses Ditolak (Status 403). Pastikan Google Apps Script Anda telah di-deploy sebagai Web App dengan 'Who has access' (Siapa yang memiliki akses) diset ke 'Anyone' (Siapa saja) dan telah diotorisasi dengan benar.");
      }
      throw new Error(`Apps Script returned status ${response.status}`);
    }

    const resData = await response.json() as any;
    if (resData && resData.success) {
      res.json({ success: true, message: "Berhasil diinisialisasi!" });
    } else {
      res.status(500).json({ success: false, message: resData.error || "Gagal menghubungi Apps Script" });
    }
  } catch (err: any) {
    console.error("[Google Sheets Init] Error during initialization proxy:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// User CRUD
app.get("/api/users", (req, res) => {
  res.json(database.users);
});

app.post("/api/users", (req, res) => {
  const user: User = req.body;
  if (!user.Username || !user.NamaLengkap || !user.Role) {
    return res.status(400).json({ success: false, message: "Lengkapi data user." });
  }

  // Check username exists
  if (database.users.some(u => u.Username.toLowerCase() === user.Username.toLowerCase())) {
    return res.status(400).json({ success: false, message: "Username sudah digunakan." });
  }

  user.UserID = "usr-" + generateUUID().slice(0, 8);
  user.PasswordHash = hashPassword(user.PasswordHash || "123456"); // default password
  user.Status = user.Status || "Aktif";
  user.CreatedAt = new Date().toISOString();
  user.UpdatedAt = new Date().toISOString();

  database.users.push(user);
  writeLog(database, "ADMIN", "Administrator", "SUPER_ADMIN", "User", "Tambah", user.UserID, `Menambah user ${user.Username}`);
  saveDB(database);

  res.json({ success: true, user });
});

app.put("/api/users/:id", (req, res) => {
  const { id } = req.params;
  const updated = req.body;
  const index = database.users.findIndex(u => u.UserID === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: "User tidak ditemukan." });
  }

  if (updated.Password) {
    updated.PasswordHash = hashPassword(updated.Password);
    delete updated.Password;
  }

  database.users[index] = {
    ...database.users[index],
    ...updated,
    UpdatedAt: new Date().toISOString()
  };

  writeLog(database, "ADMIN", "Administrator", "SUPER_ADMIN", "User", "Edit", id, `Mengubah user ${database.users[index].Username}`);
  saveDB(database);
  res.json({ success: true, user: database.users[index] });
});

app.delete("/api/users/:id", (req, res) => {
  const { id } = req.params;
  const index = database.users.findIndex(u => u.UserID === id);
  if (index !== -1) {
    const user = database.users[index];
    database.users.splice(index, 1);
    writeLog(database, "ADMIN", "Administrator", "SUPER_ADMIN", "User", "Hapus", id, `Menghapus user ${user.Username}`);
    saveDB(database);
    res.json({ success: true });
  } else {
    res.status(404).json({ success: false, message: "User tidak ditemukan." });
  }
});

// Pembina CRUD
app.get("/api/pembina", (req, res) => {
  res.json(database.pembina);
});

app.post("/api/pembina", async (req, res) => {
  let data: Pembina = req.body;
  data.PembinaID = "pem-" + generateUUID().slice(0, 8);
  data.CreatedAt = new Date().toISOString();
  data.UpdatedAt = new Date().toISOString();

  // Handle Google Drive Photo Upload
  data = await processPhotoAndUpload(data, "pembina");

  database.pembina.push(data);
  writeLog(database, "ADMIN", "Administrator", "SUPER_ADMIN", "Pembina", "Tambah", data.PembinaID, `Menambah Pembina ${data.Nama}`);
  saveAndSync(["pembina", "log_aktivitas"]);
  res.json({ success: true, pembina: data });
});

app.put("/api/pembina/:id", async (req, res) => {
  const { id } = req.params;
  const index = database.pembina.findIndex(p => p.PembinaID === id);
  if (index !== -1) {
    let updatedData = {
      ...database.pembina[index],
      ...req.body,
      UpdatedAt: new Date().toISOString()
    };

    // Handle Google Drive Photo Upload
    updatedData = await processPhotoAndUpload(updatedData, "pembina");

    database.pembina[index] = updatedData;
    writeLog(database, "ADMIN", "Administrator", "SUPER_ADMIN", "Pembina", "Edit", id, `Mengubah Pembina ${database.pembina[index].Nama}`);
    saveAndSync(["pembina", "log_aktivitas"]);
    res.json({ success: true, pembina: database.pembina[index] });
  } else {
    res.status(404).json({ success: false, message: "Pembina tidak ditemukan" });
  }
});

app.delete("/api/pembina/:id", (req, res) => {
  const { id } = req.params;
  const index = database.pembina.findIndex(p => p.PembinaID === id);
  if (index !== -1) {
    const item = database.pembina[index];
    database.pembina.splice(index, 1);
    writeLog(database, "ADMIN", "Administrator", "SUPER_ADMIN", "Pembina", "Hapus", id, `Menghapus Pembina ${item.Nama}`);
    saveAndSync(["pembina", "log_aktivitas"]);
    res.json({ success: true });
  } else {
    res.status(404).json({ success: false, message: "Pembina tidak ditemukan." });
  }
});

// Peserta CRUD
app.get("/api/peserta", (req, res) => {
  res.json(database.peserta);
});

app.post("/api/peserta", async (req, res) => {
  let data: Peserta = req.body;
  data.PesertaID = "pes-" + generateUUID().slice(0, 8);
  data.CreatedAt = new Date().toISOString();
  data.UpdatedAt = new Date().toISOString();

  // Handle Google Drive Photo Upload
  data = await processPhotoAndUpload(data, "peserta");

  database.peserta.push(data);
  writeLog(database, "ADMIN", "Administrator", "SUPER_ADMIN", "Peserta", "Tambah", data.PesertaID, `Menambah Peserta ${data.NamaLengkap}`);
  saveAndSync(["peserta", "log_aktivitas"]);
  res.json({ success: true, peserta: data });
});

app.put("/api/peserta/:id", async (req, res) => {
  const { id } = req.params;
  const index = database.peserta.findIndex(p => p.PesertaID === id);
  if (index !== -1) {
    let updatedData = {
      ...database.peserta[index],
      ...req.body,
      UpdatedAt: new Date().toISOString()
    };

    // Handle Google Drive Photo Upload
    updatedData = await processPhotoAndUpload(updatedData, "peserta");

    database.peserta[index] = updatedData;
    writeLog(database, "ADMIN", "Administrator", "SUPER_ADMIN", "Peserta", "Edit", id, `Mengubah Peserta ${database.peserta[index].NamaLengkap}`);
    saveAndSync(["peserta", "log_aktivitas"]);
    res.json({ success: true, peserta: database.peserta[index] });
  } else {
    res.status(404).json({ success: false, message: "Peserta tidak ditemukan" });
  }
});

app.delete("/api/peserta/:id", (req, res) => {
  const { id } = req.params;
  const index = database.peserta.findIndex(p => p.PesertaID === id);
  if (index !== -1) {
    const item = database.peserta[index];
    database.peserta.splice(index, 1);
    writeLog(database, "ADMIN", "Administrator", "SUPER_ADMIN", "Peserta", "Hapus", id, `Menghapus Peserta ${item.NamaLengkap}`);
    saveAndSync(["peserta", "log_aktivitas"]);
    res.json({ success: true });
  } else {
    res.status(404).json({ success: false, message: "Peserta tidak ditemukan." });
  }
});

// SKU Endpoints
app.get("/api/sku/master", (req, res) => {
  res.json(database.master_sku);
});

app.post("/api/sku/master", (req, res) => {
  const sku: MasterSKU = req.body;
  sku.SkuID = "sku-" + generateUUID().slice(0, 8);
  database.master_sku.push(sku);
  saveDB(database);
  res.json({ success: true, sku });
});

app.put("/api/sku/master/:id", (req, res) => {
  const { id } = req.params;
  const index = database.master_sku.findIndex(s => s.SkuID === id);
  if (index !== -1) {
    database.master_sku[index] = { ...database.master_sku[index], ...req.body };
    saveDB(database);
    res.json({ success: true, sku: database.master_sku[index] });
  } else {
    res.status(404).json({ success: false });
  }
});

app.delete("/api/sku/master/:id", (req, res) => {
  const { id } = req.params;
  database.master_sku = database.master_sku.filter(s => s.SkuID !== id);
  saveDB(database);
  res.json({ success: true });
});

// Progress SKU Endpoints
app.get("/api/sku/progress", (req, res) => {
  res.json(database.progress_sku);
});

app.post("/api/sku/progress", (req, res) => {
  const prog: ProgressSKU = req.body;
  prog.ProgressID = "prog-" + generateUUID().slice(0, 8);
  prog.CreatedAt = new Date().toISOString();
  
  // Find if exists, then overwrite/update or add
  const index = database.progress_sku.findIndex(p => p.PesertaID === prog.PesertaID && p.SkuID === prog.SkuID);
  if (index !== -1) {
    database.progress_sku[index] = { ...database.progress_sku[index], ...prog };
  } else {
    database.progress_sku.push(prog);
  }

  writeLog(database, "PEMBINA", "Pembina", "PEMBINA", "SKU", "Validasi", prog.PesertaID, `Memperbarui progress SKU`);
  saveDB(database);
  res.json({ success: true, progress: prog });
});

// TKK Endpoints
app.get("/api/tkk", (req, res) => {
  res.json(database.tkk);
});

app.post("/api/tkk", (req, res) => {
  const data: TKKAward = req.body;
  data.TKKID = "tkk-" + generateUUID().slice(0, 8);
  database.tkk.push(data);
  writeLog(database, "PEMBINA", "Pembina", "PEMBINA", "TKK", "Tambah", data.PesertaID, `Memberikan ${data.NamaTKK} kepada Peserta`);
  saveDB(database);
  res.json({ success: true, tkk: data });
});

app.delete("/api/tkk/:id", (req, res) => {
  const { id } = req.params;
  database.tkk = database.tkk.filter(t => t.TKKID !== id);
  saveDB(database);
  res.json({ success: true });
});

// Kenaikan Tingkat Endpoints
app.get("/api/tingkat", (req, res) => {
  res.json(database.tingkat);
});

app.post("/api/tingkat", (req, res) => {
  const data: TingkatHistory = req.body;
  data.TingkatID = "tkt-" + generateUUID().slice(0, 8);
  database.tingkat.push(data);

  // Update Scout Member's current level
  const scoutIndex = database.peserta.findIndex(p => p.PesertaID === data.PesertaID);
  if (scoutIndex !== -1) {
    database.peserta[scoutIndex].Tingkat = data.TingkatBaru;
  }

  writeLog(database, "PEMBINA", "Pembina", "PEMBINA", "Kenaikan Tingkat", "Tambah", data.PesertaID, `Kenaikan tingkat menjadi ${data.TingkatBaru}`);
  saveDB(database);
  res.json({ success: true, tingkat: data });
});

// Absensi Endpoints
app.get("/api/absensi/peserta", (req, res) => {
  res.json(database.absensi_peserta);
});

app.post("/api/absensi/peserta", (req, res) => {
  const data: AbsensiPeserta = req.body;
  data.AbsensiID = "abs-" + generateUUID().slice(0, 8);
  data.JamMasuk = data.JamMasuk || new Date().toLocaleTimeString('id-ID');
  database.absensi_peserta.push(data);
  saveDB(database);
  res.json({ success: true, absensi: data });
});

app.get("/api/absensi/pembina", (req, res) => {
  res.json(database.absensi_pembina);
});

app.post("/api/absensi/pembina", (req, res) => {
  const data: AbsensiPembina = req.body;
  data.AbsensiID = "absp-" + generateUUID().slice(0, 8);
  data.JamMasuk = data.JamMasuk || new Date().toLocaleTimeString('id-ID');
  database.absensi_pembina.push(data);
  saveDB(database);
  res.json({ success: true, absensi: data });
});

// Jadwal Endpoints
app.get("/api/jadwal", (req, res) => {
  res.json(database.jadwal);
});

app.post("/api/jadwal", (req, res) => {
  const data: Jadwal = req.body;
  data.JadwalID = "jad-" + generateUUID().slice(0, 8);
  database.jadwal.push(data);

  // Auto notification
  const notif: Notifikasi = {
    NotifikasiID: "not-" + generateUUID().slice(0, 8),
    Judul: "Jadwal Latihan Baru",
    Pesan: `Jadwal baru dirilis: ${data.Judul} pada ${data.Tanggal}`,
    Role: "ALL",
    Tanggal: new Date().toISOString().split('T')[0],
    Status: "Unread"
  };
  database.notifikasi.unshift(notif);

  saveDB(database);
  res.json({ success: true, jadwal: data });
});

app.delete("/api/jadwal/:id", (req, res) => {
  const { id } = req.params;
  database.jadwal = database.jadwal.filter(j => j.JadwalID !== id);
  saveDB(database);
  res.json({ success: true });
});

// Kalender Endpoints
app.get("/api/kalender", (req, res) => {
  res.json(database.kalender);
});

app.post("/api/kalender", (req, res) => {
  const data: KalenderKegiatan = req.body;
  data.KalenderID = "kal-" + generateUUID().slice(0, 8);
  database.kalender.push(data);
  saveDB(database);
  res.json({ success: true, kalender: data });
});

app.delete("/api/kalender/:id", (req, res) => {
  const { id } = req.params;
  database.kalender = database.kalender.filter(k => k.KalenderID !== id);
  saveDB(database);
  res.json({ success: true });
});

// Materi Endpoints
app.get("/api/materi", (req, res) => {
  res.json(database.materi);
});

app.post("/api/materi", (req, res) => {
  const data: Materi = req.body;
  data.MateriID = "mat-" + generateUUID().slice(0, 8);
  database.materi.push(data);
  saveDB(database);
  res.json({ success: true, materi: data });
});

app.delete("/api/materi/:id", (req, res) => {
  const { id } = req.params;
  database.materi = database.materi.filter(m => m.MateriID !== id);
  saveDB(database);
  res.json({ success: true });
});

// Pengumuman Endpoints
app.get("/api/pengumuman", (req, res) => {
  res.json(database.pengumuman);
});

app.post("/api/pengumuman", (req, res) => {
  const data: Pengumuman = req.body;
  data.PengumumanID = "ann-" + generateUUID().slice(0, 8);
  database.pengumuman.push(data);
  saveDB(database);
  res.json({ success: true, pengumuman: data });
});

app.delete("/api/pengumuman/:id", (req, res) => {
  const { id } = req.params;
  database.pengumuman = database.pengumuman.filter(p => p.PengumumanID !== id);
  saveDB(database);
  res.json({ success: true });
});

// Inventaris Endpoints
app.get("/api/inventaris", (req, res) => {
  res.json(database.inventaris);
});

app.post("/api/inventaris", (req, res) => {
  const data: Inventaris = req.body;
  data.InventarisID = "inv-" + generateUUID().slice(0, 8);
  database.inventaris.push(data);
  saveDB(database);
  res.json({ success: true, inventaris: data });
});

app.put("/api/inventaris/:id", (req, res) => {
  const { id } = req.params;
  const index = database.inventaris.findIndex(i => i.InventarisID === id);
  if (index !== -1) {
    database.inventaris[index] = { ...database.inventaris[index], ...req.body };
    saveDB(database);
    res.json({ success: true, inventaris: database.inventaris[index] });
  } else {
    res.status(404).json({ success: false });
  }
});

app.delete("/api/inventaris/:id", (req, res) => {
  const { id } = req.params;
  database.inventaris = database.inventaris.filter(i => i.InventarisID !== id);
  saveDB(database);
  res.json({ success: true });
});

// Refleksi Endpoints
app.get("/api/refleksi/siswa", (req, res) => {
  res.json(database.refleksi_siswa);
});

app.post("/api/refleksi/siswa", (req, res) => {
  const data: RefleksiSiswa = req.body;
  data.RefleksiID = "ref-" + generateUUID().slice(0, 8);
  database.refleksi_siswa.push(data);
  saveDB(database);
  res.json({ success: true, refleksi: data });
});

app.get("/api/refleksi/pembina", (req, res) => {
  res.json(database.refleksi_pembina);
});

app.post("/api/refleksi/pembina", (req, res) => {
  const data: RefleksiPembina = req.body;
  data.RefleksiID = "refp-" + generateUUID().slice(0, 8);
  database.refleksi_pembina.push(data);
  saveDB(database);
  res.json({ success: true, refleksi: data });
});

// Penilaian Sikap Endpoints
app.get("/api/penilaian_sikap", (req, res) => {
  res.json(database.penilaian_sikap);
});

app.post("/api/penilaian_sikap", (req, res) => {
  const data: PenilaianSikap = req.body;
  data.PenilaianID = "pen-" + generateUUID().slice(0, 8);
  data.CreatedAt = new Date().toISOString();
  data.UpdatedAt = new Date().toISOString();
  
  // Calculate stats
  data.NilaiTotal = data.Disiplin + data.TanggungJawab + data.KerjaSama + data.Kepemimpinan + data.Kemandirian + data.Keaktifan;
  data.NilaiRataRata = parseFloat((data.NilaiTotal / 6).toFixed(2));
  
  // Categories
  const scorePct = (data.NilaiRataRata / 5) * 100;
  if (scorePct >= 90) data.Kategori = "Sangat Baik";
  else if (scorePct >= 80) data.Kategori = "Baik";
  else if (scorePct >= 70) data.Kategori = "Cukup";
  else if (scorePct >= 60) data.Kategori = "Perlu Pembinaan";
  else data.Kategori = "Pembinaan Intensif";

  database.penilaian_sikap.push(data);
  writeLog(database, "PEMBINA", "Pembina", "PEMBINA", "Penilaian Sikap", "Tambah", data.PesertaID, `Mengisi Penilaian Sikap periode ${data.Periode}`);
  saveDB(database);
  res.json({ success: true, penilaian: data });
});

// Logs Endpoint
app.get("/api/logs", (req, res) => {
  res.json(database.log_aktivitas);
});

// Notifikasi Endpoints
app.get("/api/notifikasi", (req, res) => {
  res.json(database.notifikasi);
});

app.put("/api/notifikasi/:id", (req, res) => {
  const { id } = req.params;
  const index = database.notifikasi.findIndex(n => n.NotifikasiID === id);
  if (index !== -1) {
    database.notifikasi[index].Status = "Read";
    saveDB(database);
  }
  res.json({ success: true });
});

// Backup Database (export as JSON file payload)
app.get("/api/backup", (req, res) => {
  res.setHeader("Content-Disposition", "attachment; filename=sigudep_backup.json");
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(database, null, 2));
});

// Restore Database
app.post("/api/restore", (req, res) => {
  try {
    const backupData = req.body;
    if (!backupData.configs || !backupData.users) {
      return res.status(400).json({ success: false, message: "Format file backup tidak valid." });
    }
    database = backupData;
    saveDB(database);
    res.json({ success: true, message: "Database SiGudep berhasil direstore!" });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// Setup development Vite server middleware
async function startServer() {
  // On boot, if a Google Sheets ScriptURL is configured, pull the latest data to sync State
  if (database.configs.ScriptURL && database.configs.ScriptURL.startsWith("https://script.google.com")) {
    console.log("[Google Sheets Boot-Sync] Mengambil data terbaru dari Spreadsheet pada saat startup...");
    try {
      const response = await fetch(`${database.configs.ScriptURL}?action=read`);
      if (response.ok) {
        const remoteDB = await response.json() as any;
        if (remoteDB && remoteDB.configs) {
          database = {
            ...database,
            ...remoteDB
          };
          // Write back to local cache
          fs.writeFileSync(DB_FILE, JSON.stringify(database, null, 2), "utf-8");
          console.log("[Google Sheets Boot-Sync] Sinkronisasi awal startup berhasil! Menggunakan data terbaru dari Spreadsheet.");
        }
      }
    } catch (err: any) {
      console.error("[Google Sheets Boot-Sync Error] Gagal mengambil data Spreadsheet pada saat startup:", err.message || err);
    }
  }

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SiGudep server running on port ${PORT}`);
  });
}

startServer();
