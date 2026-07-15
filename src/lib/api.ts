/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  AppConfig, User, Pembina, Peserta, MasterSKU, ProgressSKU, 
  TingkatHistory, TKKAward, AbsensiPeserta, AbsensiPembina, 
  Jadwal, KalenderKegiatan, Materi, Pengumuman, Notifikasi, 
  Inventaris, RefleksiSiswa, RefleksiPembina, PenilaianSikap, LogAktivitas, Prestasi 
} from "../types";

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
  inventaris: Inventaris[];
  refleksi_siswa: RefleksiSiswa[];
  refleksi_pembina: RefleksiPembina[];
  penilaian_sikap: PenilaianSikap[];
  log_aktivitas: LogAktivitas[];
  prestasi: Prestasi[];
}

const defaultConfigs: AppConfig = {
  NamaAplikasi: "SiGudep",
  NamaGudep: "Gugus Depan Ki Hajar Dewantara - Raden Ajeng Kartini",
  NomorGudep: "03.045 - 03.046",
  AlamatGudep: "Jl. Pendidikan No. 10, Jakarta",
  Logo: "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=120&auto=format&fit=crop&q=80",
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

const DB_KEY = "sigudep_offline_db";

let dbCache: Database | null = null;

function getLocalDBOnly(): Database {
  const cached = localStorage.getItem(DB_KEY);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (!parsed.prestasi) {
        parsed.prestasi = [];
      }
      return parsed;
    } catch (e) {
      console.error("Gagal membaca database offline:", e);
    }
  }
  const initDb: Database = {
    configs: defaultConfigs,
    users: [],
    pembina: [],
    peserta: [],
    master_sku: [],
    progress_sku: [],
    tingkat: [],
    tkk: [],
    absensi_peserta: [],
    absensi_pembina: [],
    jadwal: [],
    kalender: [],
    materi: [],
    pengumuman: [],
    notifikasi: [],
    inventaris: [],
    refleksi_siswa: [],
    refleksi_pembina: [],
    penilaian_sikap: [],
    log_aktivitas: [],
    prestasi: []
  };
  localStorage.setItem(DB_KEY, JSON.stringify(initDb));
  return initDb;
}

function saveDB(db: Database) {
  dbCache = db;
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

export async function refreshDBFromServer(): Promise<Database> {
  const localDb = getLocalDBOnly();
  const scriptURL = localDb.configs.ScriptURL;

  if (scriptURL && scriptURL.startsWith("https://script.google.com")) {
    try {
      const response = await fetch(`${scriptURL}?action=read`);
      if (response.ok) {
        const remoteDB = await response.json() as any;
        if (remoteDB && remoteDB.configs) {
          const mergedDB: Database = {
            ...localDb,
            ...remoteDB
          };
          mergedDB.configs.ScriptURL = scriptURL;
          mergedDB.configs.SpreadsheetID = localDb.configs.SpreadsheetID || mergedDB.configs.SpreadsheetID;
          mergedDB.configs.FolderDriveID = localDb.configs.FolderDriveID || mergedDB.configs.FolderDriveID;
          
          dbCache = mergedDB;
          localStorage.setItem(DB_KEY, JSON.stringify(dbCache));
          return dbCache;
        }
      }
    } catch (err) {
      console.error("Gagal memperbarui database dari server:", err);
    }
  }
  
  if (!dbCache) {
    dbCache = localDb;
  }
  return dbCache;
}

async function getDB(): Promise<Database> {
  if (dbCache) {
    return dbCache;
  }
  return await refreshDBFromServer();
}

// SHA256 helper for password hashing (runs natively in browser)
async function hashPassword(password: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

function generateUUID(): string {
  return window.crypto.randomUUID ? window.crypto.randomUUID() : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function writeLog(db: Database, userId: string, nama: string, role: string, modul: string, aktivitas: string, dataId: string, keterangan: string) {
  const newLog: LogAktivitas = {
    LogID: generateUUID(),
    Tanggal: new Date().toISOString().split("T")[0],
    Jam: new Date().toLocaleTimeString("id-ID"),
    UserID: userId,
    Nama: nama,
    Role: role,
    Modul: modul,
    Aktivitas: aktivitas,
    DataID: dataId,
    Keterangan: keterangan
  };
  db.log_aktivitas = [newLog, ...(db.log_aktivitas || [])];
}

// Background syncing helper to Google Sheets
async function syncTableToGoogleSheets(table: keyof Database): Promise<void> {
  const db = await await getDB();
  const scriptURL = db.configs.ScriptURL;
  if (!scriptURL || !scriptURL.startsWith("https://script.google.com")) {
    return;
  }

  let tableData: any = db[table];
  if (table === "configs") {
    tableData = [db.configs]; // configs is stored as a single row array
  }

  try {
    const response = await fetch(scriptURL, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({
        action: "writeTable",
        table: table,
        data: tableData || []
      })
    });
    if (!response.ok) {
      console.error(`Gagal sinkronisasi tabel ${table} ke Google Sheets. Status: ${response.status}`);
    } else {
      await refreshDBFromServer();
    }
  } catch (err) {
    console.error(`Kesalahan sinkronisasi tabel ${table}:`, err);
  }
}

// Upload base64 files directly to Google Drive via Apps Script
async function uploadToGoogleDriveIfBase64(base64Data: string, fileName: string): Promise<string> {
  const db = await await getDB();
  const scriptURL = db.configs.ScriptURL;
  const folderId = db.configs.FolderDriveID;
  if (!scriptURL || !scriptURL.startsWith("https://script.google.com")) {
    return base64Data;
  }

  try {
    const parts = base64Data.split(",");
    if (parts.length < 2) return base64Data;
    
    const mimeMatch = parts[0].match(/data:(.*?);/);
    const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
    const rawBase64 = parts[1];

    const response = await fetch(scriptURL, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({
        action: "uploadFile",
        folderId: folderId,
        fileName: fileName,
        mimeType: mimeType,
        base64Data: rawBase64
      })
    });

    if (response.ok) {
      const resData = await response.json();
      if (resData && resData.success) {
        return resData.url || resData.fileUrl || base64Data;
      }
    }
  } catch (err) {
    console.error("Gagal mengunggah berkas ke Google Drive:", err);
  }
  return base64Data;
}

export const API = {
  // Setup database
  async setupDB(): Promise<{ success: boolean; message: string }> {
    await getDB();
    return { success: true, message: "Database offline diinisialisasi!" };
  },

  // Auth Login
  async login(username: string, password: string): Promise<{ success: boolean; user: any; message?: string }> {
    await refreshDBFromServer();
    const db = await await getDB();
    const user = db.users.find(u => u.Username.toLowerCase() === username.toLowerCase());
    if (!user) {
      return { success: false, user: null, message: "Username atau password salah." };
    }

    if (user.Status !== "Aktif") {
      return { success: false, user: null, message: `Akun Anda sedang ${user.Status}. Silakan hubungi pembina.` };
    }

    const hash = await hashPassword(password);
    if (user.PasswordHash !== hash) {
      if (user.PasswordHash !== password) {
        return { success: false, user: null, message: "Username atau password salah." };
      }
    }

    user.LastLogin = new Date().toISOString();
    writeLog(db, user.UserID, user.NamaLengkap, user.Role, "Auth", "Login", user.UserID, `${user.NamaLengkap} berhasil login.`);
    saveDB(db);
    
    // Sync tables on background
    syncTableToGoogleSheets("users").catch(console.error);
    syncTableToGoogleSheets("log_aktivitas").catch(console.error);

    return {
      success: true,
      user: {
        UserID: user.UserID,
        Username: user.Username,
        Role: user.Role,
        NamaLengkap: user.NamaLengkap,
        PembinaID: user.PembinaID,
        PesertaID: user.PesertaID
      }
    };
  },

  // Config
  async getConfig(): Promise<AppConfig> {
    const db = await await getDB();
    return db.configs;
  },
  async updateConfig(config: Partial<AppConfig>): Promise<{ success: boolean; configs: AppConfig }> {
    const db = await await getDB();
    const oldScriptURL = db.configs.ScriptURL;
    const updated = { ...config };

    if (updated.Logo && updated.Logo.startsWith("data:image/")) {
      const driveUrl = await uploadToGoogleDriveIfBase64(updated.Logo, "logo_sigudep.jpg");
      if (driveUrl) {
        updated.Logo = driveUrl;
      }
    }

    db.configs = {
      ...db.configs,
      ...updated,
      UpdatedAt: new Date().toISOString()
    };
    saveDB(db);

    if (db.configs.ScriptURL && db.configs.ScriptURL !== oldScriptURL && db.configs.ScriptURL.startsWith("https://script.google.com")) {
      try {
        const response = await fetch(`${db.configs.ScriptURL}?action=read`);
        if (response.ok) {
          const remoteDB = await response.json() as any;
          if (remoteDB && remoteDB.configs) {
            const mergedDB = {
              ...db,
              ...remoteDB
            };
            mergedDB.configs.ScriptURL = db.configs.ScriptURL;
            mergedDB.configs.SpreadsheetID = db.configs.SpreadsheetID || mergedDB.configs.SpreadsheetID;
            mergedDB.configs.FolderDriveID = db.configs.FolderDriveID || mergedDB.configs.FolderDriveID;
            saveDB(mergedDB);
          }
        }
      } catch (err) {
        console.error("Gagal menarik data awal dari Spreadsheet baru:", err);
      }
    } else {
      await syncTableToGoogleSheets("configs");
    }

    return { success: true, configs: db.configs };
  },
  async syncGoogleSheets(): Promise<{ success: boolean; message: string; configs?: AppConfig }> {
    const db = await await getDB();
    const scriptURL = db.configs.ScriptURL;
    if (!scriptURL || !scriptURL.startsWith("https://script.google.com")) {
      throw new Error("Apps Script Web App URL belum dikonfigurasi di pengaturan sistem!");
    }

    const response = await fetch(`${scriptURL}?action=read`);
    if (!response.ok) {
      throw new Error(`Apps Script mengembalikan status ${response.status}`);
    }
    
    const remoteDB = await response.json() as any;
    if (remoteDB && remoteDB.configs) {
      const localDB = await await getDB();
      const mergedDB = {
        ...localDB,
        ...remoteDB
      };
      // Tetap pertahankan setelan lokal koneksi webapp
      mergedDB.configs.ScriptURL = db.configs.ScriptURL;
      mergedDB.configs.SpreadsheetID = db.configs.SpreadsheetID || mergedDB.configs.SpreadsheetID;
      mergedDB.configs.FolderDriveID = db.configs.FolderDriveID || mergedDB.configs.FolderDriveID;
      saveDB(mergedDB);
      return { success: true, message: "Koneksi berhasil! Seluruh data disinkronkan dua arah.", configs: mergedDB.configs };
    }
    throw new Error("Format respons Google Sheets tidak valid.");
  },
  async initializeGoogleSheets(): Promise<{ success: boolean; message: string }> {
    const db = await await getDB();
    const scriptURL = db.configs.ScriptURL;
    if (!scriptURL || !scriptURL.startsWith("https://script.google.com")) {
      throw new Error("Apps Script Web App URL belum dikonfigurasi di pengaturan sistem!");
    }

    const response = await fetch(scriptURL, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({ action: "setup" })
    });

    if (!response.ok) {
      throw new Error(`Apps Script mengembalikan status ${response.status}`);
    }

    const resData = await response.json();
    if (resData && resData.success) {
      return { success: true, message: "Berhasil diinisialisasi!" };
    } else {
      throw new Error(resData.error || "Gagal menghubungi Apps Script.");
    }
  },

  // Users
  async getUsers(): Promise<User[]> {
    const db = await await getDB();
    return db.users || [];
  },
  async createUser(user: Partial<User>): Promise<{ success: boolean; user: User }> {
    const db = await await getDB();
    const newId = user.UserID || "usr-" + generateUUID().substring(0, 8);
    const password = user.PasswordHash || "123456";
    const hashedPassword = await hashPassword(password);
    
    const newUser: User = {
      UserID: newId,
      Username: user.Username || "",
      PasswordHash: hashedPassword,
      Role: user.Role || "PESERTA_DIDIK",
      NamaLengkap: user.NamaLengkap || "",
      PembinaID: user.PembinaID || "",
      PesertaID: user.PesertaID || "",
      Status: user.Status || "Aktif",
      LastLogin: "",
      CreatedAt: new Date().toISOString(),
      UpdatedAt: new Date().toISOString()
    };
    
    db.users = [...(db.users || []), newUser];
    saveDB(db);
    await syncTableToGoogleSheets("users");
    return { success: true, user: newUser };
  },
  async updateUser(id: string, user: Partial<User>): Promise<{ success: boolean; user: User }> {
    const db = await await getDB();
    const index = db.users.findIndex(u => u.UserID === id);
    if (index === -1) throw new Error("Pengguna tidak ditemukan.");
    
    const current = db.users[index];
    const updated = { 
      ...current, 
      ...user,
      UpdatedAt: new Date().toISOString()
    };
    
    if (user.PasswordHash && user.PasswordHash !== current.PasswordHash) {
      updated.PasswordHash = await hashPassword(user.PasswordHash);
    }
    
    db.users[index] = updated;
    saveDB(db);
    await syncTableToGoogleSheets("users");
    return { success: true, user: updated };
  },
  async deleteUser(id: string): Promise<{ success: boolean }> {
    const db = await await getDB();
    db.users = db.users.filter(u => u.UserID !== id);
    saveDB(db);
    await syncTableToGoogleSheets("users");
    return { success: true };
  },

  // Pembina
  async getPembina(): Promise<Pembina[]> {
    const db = await await getDB();
    return db.pembina || [];
  },
  async createPembina(data: Partial<Pembina>): Promise<{ success: boolean; pembina: Pembina }> {
    const db = await await getDB();
    const newId = "pem-" + generateUUID().substring(0, 8);
    const newPembina: Pembina = {
      PembinaID: newId,
      Foto: data.Foto || "",
      Nama: data.Nama || "",
      NomorKTA: data.NomorKTA || "",
      NIP: data.NIP || "",
      Jabatan: data.Jabatan || "Pembina Gudep",
      Golongan: data.Golongan || "",
      NoHP: data.NoHP || "",
      Email: data.Email || "",
      Alamat: data.Alamat || "",
      TanggalMasuk: data.TanggalMasuk || new Date().toISOString().split("T")[0],
      Status: data.Status || "Aktif",
      CreatedAt: new Date().toISOString(),
      UpdatedAt: new Date().toISOString()
    };

    const username = data.Nama?.toLowerCase().replace(/\s+/g, "").substring(0, 10) || "pembina";
    const hashedPassword = await hashPassword("pembina123");
    const newUser: User = {
      UserID: "usr-" + generateUUID().substring(0, 8),
      Username: username,
      PasswordHash: hashedPassword,
      Role: "PEMBINA",
      NamaLengkap: data.Nama || "",
      PembinaID: newId,
      PesertaID: "",
      Status: "Aktif",
      LastLogin: "",
      CreatedAt: new Date().toISOString(),
      UpdatedAt: new Date().toISOString()
    };

    db.pembina = [...(db.pembina || []), newPembina];
    db.users = [...(db.users || []), newUser];
    saveDB(db);
    await Promise.all([
      syncTableToGoogleSheets("pembina"),
      syncTableToGoogleSheets("users")
    ]);
    return { success: true, pembina: newPembina };
  },
  async updatePembina(id: string, data: Partial<Pembina>): Promise<{ success: boolean; pembina: Pembina }> {
    const db = await await getDB();
    const index = db.pembina.findIndex(p => p.PembinaID === id);
    if (index === -1) throw new Error("Pembina tidak ditemukan.");
    
    const current = db.pembina[index];
    const updated = { 
      ...current, 
      ...data,
      UpdatedAt: new Date().toISOString()
    };
    db.pembina[index] = updated;

    db.users = db.users.map(u => {
      if (u.PembinaID === id) {
        return { 
          ...u, 
          NamaLengkap: data.Nama || u.NamaLengkap,
          UpdatedAt: new Date().toISOString()
        };
      }
      return u;
    });

    saveDB(db);
    await Promise.all([
      syncTableToGoogleSheets("pembina"),
      syncTableToGoogleSheets("users")
    ]);
    return { success: true, pembina: updated };
  },
  async deletePembina(id: string): Promise<{ success: boolean }> {
    const db = await await getDB();
    db.pembina = db.pembina.filter(p => p.PembinaID !== id);
    db.users = db.users.filter(u => u.PembinaID !== id);
    saveDB(db);
    await Promise.all([
      syncTableToGoogleSheets("pembina"),
      syncTableToGoogleSheets("users")
    ]);
    return { success: true };
  },

  // Peserta
  async getPeserta(): Promise<Peserta[]> {
    const db = await await getDB();
    return db.peserta || [];
  },
  async createPeserta(data: Partial<Peserta>): Promise<{ success: boolean; peserta: Peserta }> {
    const db = await await getDB();
    const newId = "pes-" + generateUUID().substring(0, 8);
    let fotoUrl = data.Foto || "";
    if (fotoUrl && fotoUrl.startsWith("data:image/")) {
      const url = await uploadToGoogleDriveIfBase64(fotoUrl, `foto_peserta_${newId}.jpg`);
      if (url) fotoUrl = url;
    }

    const newPeserta: Peserta = {
      PesertaID: newId,
      NomorKTA: data.NomorKTA || "",
      Foto: fotoUrl,
      NamaLengkap: data.NamaLengkap || "",
      NamaPanggilan: data.NamaPanggilan || "",
      NISN: data.NISN || "",
      TempatLahir: data.TempatLahir || "",
      TanggalLahir: data.TanggalLahir || "",
      JenisKelamin: data.JenisKelamin || "Laki-laki",
      Agama: data.Agama || "Islam",
      GolonganDarah: data.GolonganDarah || "O",
      Alamat: data.Alamat || "",
      Sekolah: data.Sekolah || "",
      Kelas: data.Kelas || "",
      GolonganPramuka: data.GolonganPramuka || "Penggalang",
      Tingkat: data.Tingkat || "Ramu",
      Regu: data.Regu || "",
      NoHP: data.NoHP || "",
      NamaAyah: data.NamaAyah || "",
      NamaIbu: data.NamaIbu || "",
      NoHPOrangTua: data.NoHPOrangTua || "",
      TanggalMasukGudep: data.TanggalMasukGudep || new Date().toISOString().split("T")[0],
      Status: data.Status || "Aktif",
      CreatedAt: new Date().toISOString(),
      UpdatedAt: new Date().toISOString()
    };

    const username = data.NamaLengkap?.toLowerCase().replace(/\s+/g, "").substring(0, 10) || "peserta";
    const hashedPassword = await hashPassword("siswa123");
    const newUser: User = {
      UserID: "usr-" + generateUUID().substring(0, 8),
      Username: username,
      PasswordHash: hashedPassword,
      Role: "PESERTA_DIDIK",
      NamaLengkap: data.NamaLengkap || "",
      PembinaID: "",
      PesertaID: newId,
      Status: "Aktif",
      LastLogin: "",
      CreatedAt: new Date().toISOString(),
      UpdatedAt: new Date().toISOString()
    };

    db.peserta = [...(db.peserta || []), newPeserta];
    db.users = [...(db.users || []), newUser];
    saveDB(db);
    await Promise.all([
      syncTableToGoogleSheets("peserta"),
      syncTableToGoogleSheets("users")
    ]);
    return { success: true, peserta: newPeserta };
  },
  async updatePeserta(id: string, data: Partial<Peserta>): Promise<{ success: boolean; peserta: Peserta }> {
    const db = await await getDB();
    const index = db.peserta.findIndex(p => p.PesertaID === id);
    if (index === -1) throw new Error("Peserta tidak ditemukan.");
    
    const current = db.peserta[index];
    let fotoUrl = data.Foto || current.Foto;
    if (data.Foto && data.Foto.startsWith("data:image/")) {
      const url = await uploadToGoogleDriveIfBase64(data.Foto, `foto_peserta_${id}.jpg`);
      if (url) fotoUrl = url;
    }

    const updated = { 
      ...current, 
      ...data, 
      Foto: fotoUrl,
      UpdatedAt: new Date().toISOString()
    };
    db.peserta[index] = updated;

    db.users = db.users.map(u => {
      if (u.PesertaID === id) {
        return { 
          ...u, 
          NamaLengkap: data.NamaLengkap || u.NamaLengkap,
          UpdatedAt: new Date().toISOString()
        };
      }
      return u;
    });

    saveDB(db);
    await Promise.all([
      syncTableToGoogleSheets("peserta"),
      syncTableToGoogleSheets("users")
    ]);
    return { success: true, peserta: updated };
  },
  async deletePeserta(id: string): Promise<{ success: boolean }> {
    const db = await await getDB();
    db.peserta = db.peserta.filter(p => p.PesertaID !== id);
    db.users = db.users.filter(u => u.PesertaID !== id);
    saveDB(db);
    await Promise.all([
      syncTableToGoogleSheets("peserta"),
      syncTableToGoogleSheets("users")
    ]);
    return { success: true };
  },

  // Master SKU
  async getMasterSKU(): Promise<MasterSKU[]> {
    const db = await await getDB();
    return db.master_sku || [];
  },
  async createMasterSKU(data: Partial<MasterSKU>): Promise<{ success: boolean; sku: MasterSKU }> {
    const db = await await getDB();
    const newId = "sku-" + generateUUID().substring(0, 8);
    const newSku: MasterSKU = {
      SkuID: newId,
      Golongan: data.Golongan || "Penggalang",
      Tingkat: data.Tingkat || "Ramu",
      NomorButir: data.NomorButir || 1,
      Bidang: data.Bidang || "Keagamaan",
      Deskripsi: data.Deskripsi || "",
      Urutan: data.Urutan || 1,
      Status: data.Status || "Aktif"
    };
    db.master_sku = [...(db.master_sku || []), newSku];
    saveDB(db);
    await syncTableToGoogleSheets("master_sku");
    return { success: true, sku: newSku };
  },
  async updateMasterSKU(id: string, data: Partial<MasterSKU>): Promise<{ success: boolean; sku: MasterSKU }> {
    const db = await await getDB();
    const index = db.master_sku.findIndex(s => s.SkuID === id);
    if (index === -1) throw new Error("Butir SKU tidak ditemukan.");
    const updated = { ...db.master_sku[index], ...data };
    db.master_sku[index] = updated;
    saveDB(db);
    await syncTableToGoogleSheets("master_sku");
    return { success: true, sku: updated };
  },
  async deleteMasterSKU(id: string): Promise<{ success: boolean }> {
    const db = await await getDB();
    db.master_sku = db.master_sku.filter(s => s.SkuID !== id);
    saveDB(db);
    await syncTableToGoogleSheets("master_sku");
    return { success: true };
  },

  // Progress SKU
  async getProgressSKU(): Promise<ProgressSKU[]> {
    const db = await await getDB();
    return db.progress_sku || [];
  },
  async saveProgressSKU(data: Partial<ProgressSKU>): Promise<{ success: boolean; progress: ProgressSKU }> {
    const db = await await getDB();
    const existingIndex = db.progress_sku.findIndex(
      p => p.PesertaID === data.PesertaID && p.SkuID === data.SkuID
    );

    const progressData: ProgressSKU = {
      ProgressID: data.ProgressID || "prg-" + generateUUID().substring(0, 8),
      PesertaID: data.PesertaID || "",
      SkuID: data.SkuID || "",
      Status: data.Status || "Belum Dinilai",
      TanggalValidasi: data.TanggalValidasi || new Date().toISOString().split("T")[0],
      PembinaID: data.PembinaID || "",
      Catatan: data.Catatan || "",
      Lampiran: data.Lampiran || "",
      CreatedAt: new Date().toISOString()
    };

    if (existingIndex > -1) {
      db.progress_sku[existingIndex] = { ...db.progress_sku[existingIndex], ...progressData };
    } else {
      db.progress_sku = [...(db.progress_sku || []), progressData];
    }

    saveDB(db);
    await syncTableToGoogleSheets("progress_sku");
    return { success: true, progress: progressData };
  },

  // TKK Awards
  async getTKK(): Promise<TKKAward[]> {
    const db = await await getDB();
    return db.tkk || [];
  },
  async awardTKK(data: Partial<TKKAward>): Promise<{ success: boolean; tkk: TKKAward }> {
    const db = await await getDB();
    const newId = "tkk-" + generateUUID().substring(0, 8);
    const newAward: TKKAward = {
      TKKID: newId,
      PesertaID: data.PesertaID || "",
      NamaTKK: data.NamaTKK || "",
      Bidang: data.Bidang || "",
      Tingkatan: data.Tingkatan || "Purwa",
      Tanggal: data.Tanggal || new Date().toISOString().split("T")[0],
      NomorSertifikat: data.NomorSertifikat || "",
      PembinaID: data.PembinaID || "",
      Catatan: data.Catatan || ""
    };
    db.tkk = [...(db.tkk || []), newAward];
    saveDB(db);
    await syncTableToGoogleSheets("tkk");
    return { success: true, tkk: newAward };
  },
  async deleteTKK(id: string): Promise<{ success: boolean }> {
    const db = await await getDB();
    db.tkk = db.tkk.filter(t => t.TKKID !== id);
    saveDB(db);
    await syncTableToGoogleSheets("tkk");
    return { success: true };
  },

  // Kenaikan Tingkat
  async getTingkat(): Promise<TingkatHistory[]> {
    const db = await await getDB();
    return db.tingkat || [];
  },
  async promoteTingkat(data: Partial<TingkatHistory>): Promise<{ success: boolean; tingkat: TingkatHistory }> {
    const db = await await getDB();
    const newId = "tkt-" + generateUUID().substring(0, 8);
    const newHistory: TingkatHistory = {
      TingkatID: newId,
      PesertaID: data.PesertaID || "",
      Golongan: data.Golongan || "Penggalang",
      TingkatLama: data.TingkatLama || "",
      TingkatBaru: data.TingkatBaru || "",
      Tanggal: data.Tanggal || new Date().toISOString().split("T")[0],
      PembinaID: data.PembinaID || "",
      Catatan: data.Catatan || ""
    };

    db.peserta = db.peserta.map(p => {
      if (p.PesertaID === data.PesertaID) {
        return {
          ...p,
          Tingkat: data.TingkatBaru || p.Tingkat
        };
      }
      return p;
    });

    db.tingkat = [...(db.tingkat || []), newHistory];
    saveDB(db);
    await Promise.all([
      syncTableToGoogleSheets("tingkat"),
      syncTableToGoogleSheets("peserta")
    ]);
    return { success: true, tingkat: newHistory };
  },

  // Absensi
  async getAbsensiPeserta(): Promise<AbsensiPeserta[]> {
    const db = await await getDB();
    return db.absensi_peserta || [];
  },
  async recordAbsensiPeserta(data: Partial<AbsensiPeserta>): Promise<{ success: boolean; absensi: AbsensiPeserta }> {
    const db = await await getDB();
    const newId = "abp-" + generateUUID().substring(0, 8);
    const newAbsensi: AbsensiPeserta = {
      AbsensiID: newId,
      PesertaID: data.PesertaID || "",
      Tanggal: data.Tanggal || new Date().toISOString().split("T")[0],
      JamMasuk: data.JamMasuk || new Date().toLocaleTimeString("id-ID"),
      Status: data.Status || "Hadir",
      Latitude: data.Latitude || 0,
      Longitude: data.Longitude || 0,
      Lokasi: data.Lokasi || "",
      PembinaID: data.PembinaID || ""
    };
    db.absensi_peserta = [...(db.absensi_peserta || []), newAbsensi];
    saveDB(db);
    await syncTableToGoogleSheets("absensi_peserta");
    return { success: true, absensi: newAbsensi };
  },
  async getAbsensiPembina(): Promise<AbsensiPembina[]> {
    const db = await await getDB();
    return db.absensi_pembina || [];
  },
  async recordAbsensiPembina(data: Partial<AbsensiPembina>): Promise<{ success: boolean; absensi: AbsensiPembina }> {
    const db = await await getDB();
    const newId = "abm-" + generateUUID().substring(0, 8);
    const newAbsensi: AbsensiPembina = {
      AbsensiID: newId,
      PembinaID: data.PembinaID || "",
      Tanggal: data.Tanggal || new Date().toISOString().split("T")[0],
      JamMasuk: data.JamMasuk || new Date().toLocaleTimeString("id-ID"),
      Status: data.Status || "Hadir",
      Latitude: data.Latitude || 0,
      Longitude: data.Longitude || 0,
      Lokasi: data.Lokasi || ""
    };
    db.absensi_pembina = [...(db.absensi_pembina || []), newAbsensi];
    saveDB(db);
    await syncTableToGoogleSheets("absensi_pembina");
    return { success: true, absensi: newAbsensi };
  },

  // Jadwal
  async getJadwal(): Promise<Jadwal[]> {
    const db = await await getDB();
    return db.jadwal || [];
  },
  async createJadwal(data: Partial<Jadwal>): Promise<{ success: boolean; jadwal: Jadwal }> {
    const db = await await getDB();
    const newId = "jad-" + generateUUID().substring(0, 8);
    const newJadwal: Jadwal = {
      JadwalID: newId,
      Judul: data.Judul || "",
      Tanggal: data.Tanggal || "",
      Jam: data.Jam || "14:00 - 16:00",
      Lokasi: data.Lokasi || "",
      Deskripsi: data.Deskripsi || "",
      CreatedBy: data.CreatedBy || "Admin"
    };
    db.jadwal = [...(db.jadwal || []), newJadwal];
    saveDB(db);
    await syncTableToGoogleSheets("jadwal");
    return { success: true, jadwal: newJadwal };
  },
  async deleteJadwal(id: string): Promise<{ success: boolean }> {
    const db = await await getDB();
    db.jadwal = db.jadwal.filter(j => j.JadwalID !== id);
    saveDB(db);
    await syncTableToGoogleSheets("jadwal");
    return { success: true };
  },

  // Kalender
  async getKalender(): Promise<KalenderKegiatan[]> {
    const db = await await getDB();
    return db.kalender || [];
  },
  async createKalender(data: Partial<KalenderKegiatan>): Promise<{ success: boolean; kalender: KalenderKegiatan }> {
    const db = await await getDB();
    const newId = "kal-" + generateUUID().substring(0, 8);
    const newKalender: KalenderKegiatan = {
      KalenderID: newId,
      Judul: data.Judul || "",
      Mulai: data.Mulai || "",
      Selesai: data.Selesai || "",
      Jenis: data.Jenis || "Latihan",
      Keterangan: data.Keterangan || ""
    };
    db.kalender = [...(db.kalender || []), newKalender];
    saveDB(db);
    await syncTableToGoogleSheets("kalender");
    return { success: true, kalender: newKalender };
  },
  async deleteKalender(id: string): Promise<{ success: boolean }> {
    const db = await await getDB();
    db.kalender = db.kalender.filter(k => k.KalenderID !== id);
    saveDB(db);
    await syncTableToGoogleSheets("kalender");
    return { success: true };
  },

  // Materi
  async getMateri(): Promise<Materi[]> {
    const db = await await getDB();
    return db.materi || [];
  },
  async createMateri(data: Partial<Materi>): Promise<{ success: boolean; materi: Materi }> {
    const db = await await getDB();
    const newId = "mat-" + generateUUID().substring(0, 8);
    const newMateri: Materi = {
      MateriID: newId,
      Judul: data.Judul || "",
      Kategori: data.Kategori || "Teknik Kepramukaan",
      JenisFile: data.JenisFile || "Drive PDF",
      Link: data.Link || "",
      Deskripsi: data.Deskripsi || "",
      Tanggal: data.Tanggal || new Date().toISOString().split("T")[0],
      PembinaID: data.PembinaID || ""
    };
    db.materi = [...(db.materi || []), newMateri];
    saveDB(db);
    await syncTableToGoogleSheets("materi");
    return { success: true, materi: newMateri };
  },
  async deleteMateri(id: string): Promise<{ success: boolean }> {
    const db = await await getDB();
    db.materi = db.materi.filter(m => m.MateriID !== id);
    saveDB(db);
    await syncTableToGoogleSheets("materi");
    return { success: true };
  },

  // Pengumuman
  async getPengumuman(): Promise<Pengumuman[]> {
    const db = await await getDB();
    return db.pengumuman || [];
  },
  async createPengumuman(data: Partial<Pengumuman>): Promise<{ success: boolean; pengumuman: Pengumuman }> {
    const db = await await getDB();
    const newId = "pen-" + generateUUID().substring(0, 8);
    const newPengumuman: Pengumuman = {
      PengumumanID: newId,
      Judul: data.Judul || "",
      Isi: data.Isi || "",
      Tanggal: data.Tanggal || new Date().toISOString().split("T")[0],
      Status: data.Status || "Publish"
    };

    const newNotifs: Notifikasi[] = [
      {
        NotifikasiID: "not-" + generateUUID().substring(0, 8),
        Judul: "Pengumuman Baru: " + (data.Judul || ""),
        Pesan: (data.Isi || "").substring(0, 100),
        Role: "ALL",
        Tanggal: new Date().toISOString(),
        Status: "Unread"
      }
    ];

    db.pengumuman = [...(db.pengumuman || []), newPengumuman];
    db.notifikasi = [...newNotifs, ...(db.notifikasi || [])];

    saveDB(db);
    await Promise.all([
      syncTableToGoogleSheets("pengumuman"),
      syncTableToGoogleSheets("notifikasi")
    ]);
    return { success: true, pengumuman: newPengumuman };
  },
  async deletePengumuman(id: string): Promise<{ success: boolean }> {
    const db = await await getDB();
    db.pengumuman = db.pengumuman.filter(p => p.PengumumanID !== id);
    saveDB(db);
    await syncTableToGoogleSheets("pengumuman");
    return { success: true };
  },

  // Inventaris
  async getInventaris(): Promise<Inventaris[]> {
    const db = await await getDB();
    return db.inventaris || [];
  },
  async createInventaris(data: Partial<Inventaris>): Promise<{ success: boolean; inventaris: Inventaris }> {
    const db = await await getDB();
    const newId = "inv-" + generateUUID().substring(0, 8);
    const newInventaris: Inventaris = {
      InventarisID: newId,
      NamaBarang: data.NamaBarang || "",
      Kategori: data.Kategori || "Lainnya",
      KodeBarang: data.KodeBarang || "INV-" + generateUUID().substring(0, 5).toUpperCase(),
      Jumlah: data.Jumlah || 0,
      Satuan: data.Satuan || "Unit",
      Kondisi: data.Kondisi || "Baik",
      Lokasi: data.Lokasi || "",
      TanggalPerolehan: data.TanggalPerolehan || new Date().toISOString().split("T")[0],
      Keterangan: data.Keterangan || ""
    };
    db.inventaris = [...(db.inventaris || []), newInventaris];
    saveDB(db);
    await syncTableToGoogleSheets("inventaris");
    return { success: true, inventaris: newInventaris };
  },
  async updateInventaris(id: string, data: Partial<Inventaris>): Promise<{ success: boolean; inventaris: Inventaris }> {
    const db = await await getDB();
    const index = db.inventaris.findIndex(i => i.InventarisID === id);
    if (index === -1) throw new Error("Barang tidak ditemukan.");
    const updated = { ...db.inventaris[index], ...data };
    db.inventaris[index] = updated;
    saveDB(db);
    await syncTableToGoogleSheets("inventaris");
    return { success: true, inventaris: updated };
  },
  async deleteInventaris(id: string): Promise<{ success: boolean }> {
    const db = await await getDB();
    db.inventaris = db.inventaris.filter(i => i.InventarisID !== id);
    saveDB(db);
    await syncTableToGoogleSheets("inventaris");
    return { success: true };
  },

  // Refleksi
  async getRefleksiSiswa(): Promise<RefleksiSiswa[]> {
    const db = await await getDB();
    return db.refleksi_siswa || [];
  },
  async createRefleksiSiswa(data: Partial<RefleksiSiswa>): Promise<{ success: boolean; refleksi: RefleksiSiswa }> {
    const db = await await getDB();
    const newId = "rfs-" + generateUUID().substring(0, 8);
    const newRefleksi: RefleksiSiswa = {
      RefleksiID: newId,
      PesertaID: data.PesertaID || "",
      Tanggal: data.Tanggal || new Date().toISOString().split("T")[0],
      Isi: data.Isi || "",
      Lampiran: data.Lampiran || ""
    };
    db.refleksi_siswa = [...(db.refleksi_siswa || []), newRefleksi];
    saveDB(db);
    await syncTableToGoogleSheets("refleksi_siswa");
    return { success: true, refleksi: newRefleksi };
  },
  async getRefleksiPembina(): Promise<RefleksiPembina[]> {
    const db = await await getDB();
    return db.refleksi_pembina || [];
  },
  async createRefleksiPembina(data: Partial<RefleksiPembina>): Promise<{ success: boolean; refleksi: RefleksiPembina }> {
    const db = await await getDB();
    const newId = "rfp-" + generateUUID().substring(0, 8);
    const newRefleksi: RefleksiPembina = {
      RefleksiID: newId,
      PembinaID: data.PembinaID || "",
      PesertaID: data.PesertaID || "",
      Tanggal: data.Tanggal || new Date().toISOString().split("T")[0],
      Isi: data.Isi || ""
    };
    db.refleksi_pembina = [...(db.refleksi_pembina || []), newRefleksi];
    saveDB(db);
    await syncTableToGoogleSheets("refleksi_pembina");
    return { success: true, refleksi: newRefleksi };
  },

  // Penilaian Sikap
  async getPenilaianSikap(): Promise<PenilaianSikap[]> {
    const db = await await getDB();
    return db.penilaian_sikap || [];
  },
  async createPenilaianSikap(data: Partial<PenilaianSikap>): Promise<{ success: boolean; penilaian: PenilaianSikap }> {
    const db = await await getDB();
    const newId = "pnk-" + generateUUID().substring(0, 8);
    
    const disiplin = data.Disiplin || 3;
    const tanggungJawab = data.TanggungJawab || 3;
    const kerjaSama = data.KerjaSama || 3;
    const kepemimpinan = data.Kepemimpinan || 3;
    const kemandirian = data.Kemandirian || 3;
    const keaktifan = data.Keaktifan || 3;

    const nilaiTotal = disiplin + tanggungJawab + kerjaSama + kepemimpinan + kemandirian + keaktifan;
    const nilaiRataRata = parseFloat((nilaiTotal / 6).toFixed(2));

    let kategori: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Perlu Pembinaan' | 'Pembinaan Intensif' = 'Baik';
    if (nilaiRataRata >= 4.5) kategori = 'Sangat Baik';
    else if (nilaiRataRata >= 3.5) kategori = 'Baik';
    else if (nilaiRataRata >= 2.5) kategori = 'Cukup';
    else if (nilaiRataRata >= 1.5) kategori = 'Perlu Pembinaan';
    else kategori = 'Pembinaan Intensif';

    const newPenilaian: PenilaianSikap = {
      PenilaianID: newId,
      PesertaID: data.PesertaID || "",
      PembinaID: data.PembinaID || "",
      Periode: data.Periode || "Semester",
      Tanggal: data.Tanggal || new Date().toISOString().split("T")[0],
      Disiplin: disiplin,
      TanggungJawab: tanggungJawab,
      KerjaSama: kerjaSama,
      Kepemimpinan: kepemimpinan,
      Kemandirian: kemandirian,
      Keaktifan: keaktifan,
      NilaiTotal: nilaiTotal,
      NilaiRataRata: nilaiRataRata,
      Kategori: kategori,
      Catatan: data.Catatan || "",
      CreatedAt: new Date().toISOString(),
      UpdatedAt: new Date().toISOString()
    };
    db.penilaian_sikap = [...(db.penilaian_sikap || []), newPenilaian];
    saveDB(db);
    await syncTableToGoogleSheets("penilaian_sikap");
    return { success: true, penilaian: newPenilaian };
  },

  // Logs
  async getLogs(): Promise<LogAktivitas[]> {
    const db = await await getDB();
    return db.log_aktivitas || [];
  },

  // Notifikasi
  async getNotifikasi(): Promise<Notifikasi[]> {
    const db = await await getDB();
    return db.notifikasi || [];
  },
  async readNotifikasi(id: string): Promise<{ success: boolean }> {
    const db = await await getDB();
    db.notifikasi = db.notifikasi.map(n => {
      if (n.NotifikasiID === id) {
        return { ...n, Status: "Read" as const };
      }
      return n;
    });
    saveDB(db);
    await syncTableToGoogleSheets("notifikasi");
    return { success: true };
  },

  // Prestasi
  async getPrestasi(): Promise<Prestasi[]> {
    const db = await await getDB();
    return db.prestasi || [];
  },
  async createPrestasi(data: Partial<Prestasi>): Promise<{ success: boolean; prestasi: Prestasi }> {
    const db = await await getDB();
    const newId = "prs-" + generateUUID().substring(0, 8);
    
    let sertifikatUrl = data.Sertifikat || "";
    if (sertifikatUrl && sertifikatUrl.startsWith("data:")) {
      sertifikatUrl = await uploadToGoogleDriveIfBase64(sertifikatUrl, "piagam_" + newId);
    }

    let fotoKegiatanUrl = data.FotoKegiatan || "";
    if (fotoKegiatanUrl && fotoKegiatanUrl.startsWith("data:")) {
      fotoKegiatanUrl = await uploadToGoogleDriveIfBase64(fotoKegiatanUrl, "kegiatan_" + newId);
    }

    const newPrestasi: Prestasi = {
      PrestasiID: newId,
      PesertaID: data.PesertaID || "",
      NamaPrestasi: data.NamaPrestasi || "",
      Tingkat: data.Tingkat || "Pangkalan",
      Penyelenggara: data.Penyelenggara || "",
      Tanggal: data.Tanggal || new Date().toISOString().split("T")[0],
      Sertifikat: sertifikatUrl,
      FotoKegiatan: fotoKegiatanUrl,
      Deskripsi: data.Deskripsi || ""
    };

    db.prestasi = [...(db.prestasi || []), newPrestasi];
    saveDB(db);
    await syncTableToGoogleSheets("prestasi");
    return { success: true, prestasi: newPrestasi };
  },
  async updatePrestasi(id: string, data: Partial<Prestasi>): Promise<{ success: boolean; prestasi: Prestasi }> {
    const db = await await getDB();
    const index = db.prestasi.findIndex(p => p.PrestasiID === id);
    if (index === -1) throw new Error("Prestasi tidak ditemukan.");

    const current = db.prestasi[index];
    let sertifikatUrl = data.Sertifikat !== undefined ? data.Sertifikat : current.Sertifikat;
    if (sertifikatUrl && sertifikatUrl.startsWith("data:")) {
      sertifikatUrl = await uploadToGoogleDriveIfBase64(sertifikatUrl, "piagam_" + id);
    }

    let fotoKegiatanUrl = data.FotoKegiatan !== undefined ? data.FotoKegiatan : current.FotoKegiatan;
    if (fotoKegiatanUrl && fotoKegiatanUrl.startsWith("data:")) {
      fotoKegiatanUrl = await uploadToGoogleDriveIfBase64(fotoKegiatanUrl, "kegiatan_" + id);
    }

    const updated: Prestasi = {
      ...current,
      ...data,
      Sertifikat: sertifikatUrl,
      FotoKegiatan: fotoKegiatanUrl
    };

    db.prestasi[index] = updated;
    saveDB(db);
    await syncTableToGoogleSheets("prestasi");
    return { success: true, prestasi: updated };
  },
  async deletePrestasi(id: string): Promise<{ success: boolean }> {
    const db = await await getDB();
    db.prestasi = (db.prestasi || []).filter(p => p.PrestasiID !== id);
    saveDB(db);
    await syncTableToGoogleSheets("prestasi");
    return { success: true };
  },

  // Backup / Restore
  async triggerRestore(backupData: any): Promise<{ success: boolean; message: string }> {
    if (backupData && backupData.config) {
      const db = await await getDB();
      const restored: Database = {
        configs: { ...db.configs, ...backupData.config },
        users: backupData.users || [],
        pembina: backupData.pembina || [],
        peserta: backupData.peserta || [],
        master_sku: backupData.masterSku || [],
        progress_sku: backupData.progressSku || [],
        tingkat: backupData.tingkat || [],
        tkk: backupData.tkkAwards || [],
        absensi_peserta: backupData.absensi || [],
        absensi_pembina: backupData.absensiPembina || [],
        jadwal: backupData.jadwal || [],
        kalender: backupData.kalender || [],
        materi: backupData.materi || [],
        pengumuman: backupData.pengumuman || [],
        notifikasi: backupData.notifikasi || [],
        inventaris: backupData.inventaris || [],
        refleksi_siswa: backupData.refleksi || [],
        refleksi_pembina: backupData.refleksiPembina || [],
        penilaian_sikap: backupData.penilaian || [],
        log_aktivitas: backupData.logs || [],
        prestasi: backupData.prestasi || []
      };
      saveDB(restored);
      
      const tables: (keyof Database)[] = [
        "configs", "users", "pembina", "peserta", "master_sku", "progress_sku", 
        "tingkat", "tkk", "absensi_peserta", "absensi_pembina", "jadwal", "kalender", 
        "materi", "pengumuman", "notifikasi", "inventaris", "refleksi_siswa", 
        "refleksi_pembina", "penilaian_sikap", "log_aktivitas", "prestasi"
      ];
      for (const t of tables) {
        syncTableToGoogleSheets(t).catch(e => console.error(`Failed to sync table on restore: ${t}`, e));
      }

      return { success: true, message: "Berhasil memulihkan data!" };
    }
    throw new Error("Format cadangan tidak didukung.");
  }
};
