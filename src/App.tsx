/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { API } from "./lib/api";
import { 
  AppConfig, User, Pembina, Peserta, MasterSKU, ProgressSKU, 
  TKKAward, AbsensiPeserta, Jadwal, KalenderKegiatan, 
  Materi, Pengumuman, Notifikasi, Inventaris, RefleksiSiswa, 
  PenilaianSikap, LogAktivitas, UserRole, Prestasi 
} from "./types";

// Import UI components
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import DashboardView from "./components/DashboardView";
import PesertaView from "./components/PesertaView";
import PembinaView from "./components/PembinaView";
import SensusView from "./components/SensusView";
import SikupView from "./components/SikupView";
import AktivitasView from "./components/AktivitasView";
import MateriView from "./components/MateriView";
import LogistikView from "./components/LogistikView";
import EvaluasiView from "./components/EvaluasiView";
import KtaView from "./components/KtaView";
import SistemView from "./components/SistemView";
import PrestasiView from "./components/PrestasiView";

import { ShieldCheck, LogIn, Award, Activity, Key } from "lucide-react";

export default function App() {
  const [darkTheme, setDarkTheme] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTab, setTab] = useState("dashboard");

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  // Connection and Bootstrapping States
  const [showConfigScreen, setShowConfigScreen] = useState(false);
  const [scriptUrlInput, setScriptUrlInput] = useState("");
  const [bootstrapUsername, setBootstrapUsername] = useState("admin");
  const [bootstrapPassword, setBootstrapPassword] = useState("");
  const [bootstrapStatus, setBootstrapStatus] = useState({ success: "", error: "", loading: false });

  // Active User session info
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Master Data Store states
  const [appConfig, setAppConfig] = useState<AppConfig>({
    GugusDepanID: "gudep-1", NamaGudep: "SMP Negeri 1 Jakarta",
    NomorPutra: "05.123", NomorPutri: "05.124",
    NamaMabigus: "Dr. H. Siswanto, M.Pd.", Kwarcab: "Jakarta Pusat", Kwarda: "DKI Jakarta",
    AlamatSekretariat: "Jl. Lapangan Banteng Barat No.36, Jakarta", TahunAktif: "2026/2027", Logo: "",
    NomorGudep: "05.123 - 05.124", AlamatGudep: "Jl. Lapangan Banteng Barat No.36, Jakarta",
    Favicon: "", ThemeColor: "#2A9D8F", SpreadsheetID: "", FolderDriveID: "", ScriptURL: "",
    Versi: "1.0", Email: "", Telepon: "", Website: "", CreatedAt: "", UpdatedAt: ""
  });
  const [usersList, setUsersList] = useState<User[]>([]);
  const [pembinaList, setPembinaList] = useState<Pembina[]>([]);
  const [pesertaList, setPesertaList] = useState<Peserta[]>([]);
  const [masterSku, setMasterSku] = useState<MasterSKU[]>([]);
  const [progressSku, setProgressSku] = useState<ProgressSKU[]>([]);
  const [tkkAwards, setTkkAwards] = useState<TKKAward[]>([]);
  const [absensiList, setAbsensiList] = useState<AbsensiPeserta[]>([]);
  const [jadwalList, setJadwalList] = useState<Jadwal[]>([]);
  const [kalenderList, setKalenderList] = useState<KalenderKegiatan[]>([]);
  const [materiList, setMateriList] = useState<Materi[]>([]);
  const [pengumumanList, setPengumumanList] = useState<Pengumuman[]>([]);
  const [inventarisList, setInventarisList] = useState<Inventaris[]>([]);
  const [refleksiList, setRefleksiList] = useState<RefleksiSiswa[]>([]);
  const [penilaianList, setPenilaianList] = useState<PenilaianSikap[]>([]);
  const [logsList, setLogsList] = useState<LogAktivitas[]>([]);
  const [notifications, setNotifications] = useState<Notifikasi[]>([]);
  const [prestasiList, setPrestasiList] = useState<Prestasi[]>([]);

  // Connection check state on startup
  const [connectionStatus, setConnectionStatus] = useState<{
    status: "loading" | "success" | "error";
    errorMsg: string;
  }>({ status: "loading", errorMsg: "" });

  const handleRetryConnection = async () => {
    try {
      setConnectionStatus({ status: "loading", errorMsg: "" });
      const db = await API.refreshDBFromServer();
      if (db && db.users) {
        setAppConfig(db.configs);
        setScriptUrlInput(db.configs.ScriptURL || "");
        setConnectionStatus({ status: "success", errorMsg: "" });
      } else {
        throw new Error("Respons Spreadsheet kosong atau tidak valid.");
      }
    } catch (err: any) {
      console.error("Kesalahan koneksi database Spreadsheet:", err);
      setConnectionStatus({
        status: "error",
        errorMsg: err.message || "Gagal terhubung ke Google Apps Script."
      });
    }
  };

  // Local storage session recoveries & Startup connection check
  useEffect(() => {
    const checkConnection = async () => {
      try {
        setConnectionStatus({ status: "loading", errorMsg: "" });
        const db = await API.refreshDBFromServer();
        if (db && db.users) {
          setAppConfig(db.configs);
          setScriptUrlInput(db.configs.ScriptURL || "");
          setConnectionStatus({ status: "success", errorMsg: "" });
        } else {
          throw new Error("Respons Spreadsheet kosong atau tidak valid.");
        }
      } catch (err: any) {
        console.error("Kesalahan koneksi database Spreadsheet:", err);
        setConnectionStatus({
          status: "error",
          errorMsg: err.message || "Gagal terhubung ke Google Apps Script. Pastikan Web App URL Apps Script Anda aktif!"
        });
      }
    };
    checkConnection();

    const savedUser = localStorage.getItem("sigudep_user");
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        setCurrentUser(u);
        setIsAuthenticated(true);
      } catch (err) {
        localStorage.removeItem("sigudep_user");
      }
    }
    const savedTheme = localStorage.getItem("sigudep_theme");
    if (savedTheme) {
      setDarkTheme(savedTheme === "dark");
    }
  }, []);

  // Sync dark class styling with theme state
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkTheme) {
      root.classList.add("dark");
      localStorage.setItem("sigudep_theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("sigudep_theme", "light");
    }
  }, [darkTheme]);

  // Load all data from API when authenticated
  const fetchAllData = async () => {
    if (!isAuthenticated) return;
    try {
      const [
        cfg, users, pembinas, pesertas, sku, progress, tkk, 
        absensi, jadwals, kalender, materis, pengumuman, 
        inventaris, refleksi, penilaian, logs, notifs, prestasis
      ] = await Promise.all([
        API.getConfig(),
        API.getUsers(),
        API.getPembina(),
        API.getPeserta(),
        API.getMasterSKU(),
        API.getProgressSKU(),
        API.getTKK(),
        API.getAbsensiPeserta(),
        API.getJadwal(),
        API.getKalender(),
        API.getMateri(),
        API.getPengumuman(),
        API.getInventaris(),
        API.getRefleksiSiswa(),
        API.getPenilaianSikap(),
        API.getLogs(),
        API.getNotifikasi(),
        API.getPrestasi()
      ]);

      if (cfg) setAppConfig(cfg);
      setUsersList(users || []);
      setPembinaList(pembinas || []);
      setPesertaList(pesertas || []);
      setMasterSku(sku || []);
      setProgressSku(progress || []);
      setTkkAwards(tkk || []);
      setAbsensiList(absensi || []);
      setJadwalList(jadwals || []);
      setKalenderList(kalender || []);
      setMateriList(materis || []);
      setPengumumanList(pengumuman || []);
      setInventarisList(inventaris || []);
      setRefleksiList(refleksi || []);
      setPenilaianList(penilaian || []);
      setLogsList(logs || []);
      setNotifications(notifs || []);
      setPrestasiList(prestasis || []);
    } catch (err) {
      console.error("Gagal memuat data dari server:", err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData();
    }
  }, [isAuthenticated]);

  // Authenticate user handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUsername || !loginPassword) {
      setAuthError("Harap lengkapi username dan kata sandi.");
      return;
    }
    setLoggingIn(true);
    setAuthError("");
    try {
      const res = await API.login(loginUsername, loginPassword);
      if (res.success && res.user) {
        setCurrentUser(res.user);
        setIsAuthenticated(true);
        localStorage.setItem("sigudep_user", JSON.stringify(res.user));
      } else {
        setAuthError(res.message || "Username atau sandi tidak cocok.");
      }
    } catch (err: any) {
      setAuthError(err.message || "Gagal menghubungi server.");
    } finally {
      setLoggingIn(false);
    }
  };

  // Handle Google Sheets integration & bootstrap admin account
  const handleBootstrapSpreadsheet = async (e: React.FormEvent, initializeNew: boolean) => {
    e.preventDefault();
    if (!scriptUrlInput || !scriptUrlInput.startsWith("https://script.google.com")) {
      setBootstrapStatus({ success: "", error: "Harap masukkan URL Apps Script Web App yang valid!", loading: false });
      return;
    }

    setBootstrapStatus({ success: "", error: "", loading: true });
    try {
      // 1. Update system config with the URL
      await API.updateConfig({ ScriptURL: scriptUrlInput });

      if (initializeNew) {
        if (!bootstrapUsername || !bootstrapPassword) {
          throw new Error("Harap isi username dan password untuk akun admin baru.");
        }
        // 2. Initialize the Google Sheet sheets
        await API.initializeGoogleSheets();

        // 3. Create initial administrator user
        await API.createUser({
          Username: bootstrapUsername,
          PasswordHash: bootstrapPassword,
          Role: "SUPER_ADMIN",
          NamaLengkap: "Administrator Utama",
          Status: "Aktif"
        });

        setBootstrapStatus({
          success: "Berhasil diinisialisasi! Google Spreadsheet telah terhubung dan akun administrator '" + bootstrapUsername + "' berhasil dibuat. Silakan login sekarang.",
          error: "",
          loading: false
        });
        setShowConfigScreen(false);
      } else {
        // Just pull/sync existing data
        const syncRes = await API.syncGoogleSheets();
        if (syncRes.success) {
          setBootstrapStatus({
            success: "Sinkronisasi Berhasil! Seluruh data dari Google Spreadsheet berhasil ditarik secara langsung.",
            error: "",
            loading: false
          });
          setShowConfigScreen(false);
        } else {
          throw new Error(syncRes.message || "Gagal sinkronisasi data.");
        }
      }
      
      // Update local configuration state
      const updatedConfig = await API.getConfig();
      setAppConfig(updatedConfig);
    } catch (err: any) {
      setBootstrapStatus({
        success: "",
        error: err.message || "Kesalahan koneksi atau inisialisasi.",
        loading: false
      });
    }
  };

  // Sign out user session handler
  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem("sigudep_user");
    setTab("dashboard");
  };

  // --- CRUD API MUTATIONS FOR ALL VIEWS ---

  // Peserta
  const handleCreatePeserta = async (data: Partial<Peserta>) => {
    try {
      await API.createPeserta(data);
      fetchAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };
  const handleUpdatePeserta = async (id: string, data: Partial<Peserta>) => {
    try {
      await API.updatePeserta(id, data);
      fetchAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };
  const handleDeletePeserta = async (id: string) => {
    if (confirm("Apakah anda yakin ingin menghapus data anggota ini?")) {
      try {
        await API.deletePeserta(id);
        fetchAllData();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  // Pembina
  const handleCreatePembina = async (data: Partial<Pembina>) => {
    try {
      await API.createPembina(data);
      fetchAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };
  const handleUpdatePembina = async (id: string, data: Partial<Pembina>) => {
    try {
      await API.updatePembina(id, data);
      fetchAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };
  const handleDeletePembina = async (id: string) => {
    if (confirm("Apakah anda yakin ingin menghapus data Pembina ini?")) {
      try {
        await API.deletePembina(id);
        fetchAllData();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  // Sensus (Users accounts)
  const handleCreateUser = async (data: Partial<User>) => {
    try {
      await API.createUser(data);
      fetchAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };
  const handleUpdateUser = async (id: string, data: Partial<User>) => {
    try {
      await API.updateUser(id, data);
      fetchAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };
  const handleDeleteUser = async (id: string) => {
    if (confirm("Apakah anda yakin ingin menghapus akun user ini?")) {
      try {
        await API.deleteUser(id);
        fetchAllData();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  // SKU Master Uji
  const handleCreateMasterSKU = async (data: Partial<MasterSKU>) => {
    try {
      await API.createMasterSKU(data);
      fetchAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };
  const handleUpdateMasterSKU = async (id: string, data: Partial<MasterSKU>) => {
    try {
      await API.updateMasterSKU(id, data);
      fetchAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };
  const handleDeleteMasterSKU = async (id: string) => {
    if (confirm("Hapus butir kurikulum SKU ini?")) {
      try {
        await API.deleteMasterSKU(id);
        fetchAllData();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  // Progress SKU
  const handleSaveProgressSku = async (data: any) => {
    try {
      await API.saveProgressSKU(data);
      fetchAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Award TKK
  const handleAwardTKK = async (data: any) => {
    try {
      await API.awardTKK(data);
      fetchAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Schedules (Jadwal)
  const handleCreateJadwal = async (data: Partial<Jadwal>) => {
    try {
      await API.createJadwal(data);
      fetchAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };
  const handleDeleteJadwal = async (id: string) => {
    try {
      await API.deleteJadwal(id);
      fetchAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // GPS Attendance
  const handleRecordAbsensi = async (data: any) => {
    try {
      await API.recordAbsensiPeserta(data);
      fetchAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Materi
  const handleCreateMateri = async (data: Partial<Materi>) => {
    try {
      await API.createMateri(data);
      fetchAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };
  const handleDeleteMateri = async (id: string) => {
    try {
      await API.deleteMateri(id);
      fetchAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Prestasi
  const handleCreatePrestasi = async (data: Partial<Prestasi>) => {
    try {
      await API.createPrestasi(data);
      fetchAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };
  const handleUpdatePrestasi = async (id: string, data: Partial<Prestasi>) => {
    try {
      await API.updatePrestasi(id, data);
      fetchAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };
  const handleDeletePrestasi = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus data prestasi ini?")) {
      try {
        await API.deletePrestasi(id);
        fetchAllData();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  // Logistik (Inventaris)
  const handleCreateInventaris = async (data: Partial<Inventaris>) => {
    try {
      await API.createInventaris(data);
      fetchAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };
  const handleUpdateInventaris = async (id: string, data: Partial<Inventaris>) => {
    try {
      await API.updateInventaris(id, data);
      fetchAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };
  const handleDeleteInventaris = async (id: string) => {
    if (confirm("Hapus barang logistik ini dari inventaris?")) {
      try {
        await API.deleteInventaris(id);
        fetchAllData();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  // Reflections (Refleksi)
  const handleCreateRefleksi = async (data: Partial<RefleksiSiswa>) => {
    try {
      await API.createRefleksiSiswa(data);
      fetchAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Penilaian Karakter
  const handleCreatePenilaian = async (data: Partial<PenilaianSikap>) => {
    try {
      await API.createPenilaianSikap(data);
      fetchAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Update Config
  const handleUpdateConfig = async (data: Partial<AppConfig>) => {
    try {
      const res = await API.updateConfig(data);
      if (res.success) {
        setAppConfig(res.configs);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Backup data
  const handleBackupData = async () => {
    // Simply fetch current state structure as backup payload
    return {
      config: appConfig,
      users: usersList,
      pembina: pembinaList,
      peserta: pesertaList,
      masterSku: masterSku,
      progressSku: progressSku,
      tkkAwards: tkkAwards,
      absensi: absensiList,
      jadwal: jadwalList,
      kalender: kalenderList,
      materi: materiList,
      inventaris: inventarisList,
      refleksi: refleksiList,
      penilaian: penilaianList
    };
  };

  // Restore database
  const handleRestoreDatabase = async (payload: any) => {
    try {
      const res = await API.triggerRestore(payload);
      if (res.success) {
        fetchAllData();
        return true;
      }
      return false;
    } catch (err) {
      alert("Gagal memulihkan database.");
      return false;
    }
  };

  const handleReadNotification = async (id: string) => {
    try {
      await API.readNotifikasi(id);
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleGlobalSearch = (query: string) => {
    // Basic search filtering triggers
    console.log("Global searching for:", query);
  };

  const userRole: UserRole = currentUser ? currentUser.Role : "PESERTA_DIDIK";
  const userName = currentUser ? currentUser.NamaLengkap : "Kakak Guest";

  // --- RENDERING CONNECTION LOADER OR ERROR PANEL ---
  if (connectionStatus.status === "loading") {
    return (
      <main className={`min-h-screen flex items-center justify-center p-4 transition-colors font-sans
        ${darkTheme ? "bg-stone-950 text-stone-100" : "bg-stone-50 text-stone-900"}`}
      >
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-stone-500 dark:text-stone-400 animate-pulse">
            Menghubungkan ke Google Spreadsheet Database...
          </p>
        </div>
      </main>
    );
  }

  if (connectionStatus.status === "error") {
    return (
      <main className={`min-h-screen flex items-center justify-center p-4 transition-colors font-sans
        ${darkTheme ? "bg-stone-950 text-stone-100" : "bg-stone-50 text-stone-900"}`}
      >
        <div className={`w-full max-w-md p-8 rounded-3xl border shadow-2xl space-y-6 text-center
          ${darkTheme ? "bg-stone-900/40 border-stone-850" : "bg-white border-stone-200"}`}
        >
          <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center text-3xl mx-auto">
            ⚠️
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-stone-900 dark:text-white">Gagal Menghubungkan Database</h1>
            <p className="text-xs text-red-500 font-semibold leading-relaxed">
              {connectionStatus.errorMsg}
            </p>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed bg-stone-100 dark:bg-stone-800/40 p-4 rounded-xl text-left">
            <strong>Catatan Pengembang:</strong><br />
            Silakan periksa dan perbarui konfigurasi database permanen (SpreadsheetID, ScriptURL, FolderDriveID) pada berkas berikut di AI Studio:<br />
            <code className="text-amber-500 font-mono text-[10px] block mt-1">src/config/database.ts</code>
          </p>
          <button
            onClick={handleRetryConnection}
            className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-all shadow cursor-pointer"
          >
            Hubungkan Kembali
          </button>
        </div>
      </main>
    );
  }

  // --- RENDERING LOGIN PANEL IF UNAUTHENTICATED ---
  if (!isAuthenticated) {
    return (
      <main className={`min-h-screen flex items-center justify-center p-4 transition-colors font-sans
        ${darkTheme ? "bg-stone-950 text-stone-100" : "bg-stone-50 text-stone-900"}`}
      >
        <div className={`w-full max-w-md p-8 rounded-3xl border shadow-2xl relative overflow-hidden space-y-6
          ${darkTheme ? "bg-stone-900/40 border-stone-850" : "bg-white border-stone-200"}`}
        >
          {/* Logo badge */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center text-4xl shadow-xl border-2 border-stone-200 dark:border-stone-800 overflow-hidden p-1.5">
              {appConfig.Logo ? (
                <img 
                  src={appConfig.Logo} 
                  alt="Logo Gudep" 
                  className="w-full h-full object-contain" 
                  referrerPolicy="no-referrer"
                />
              ) : (
                "⛺"
              )}
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-stone-900 dark:text-white">
                {appConfig.NamaAplikasi || "SiGudep"}
              </h1>
              <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mt-1 uppercase tracking-wider">
                Gugus Depan {appConfig.NomorGudep || (appConfig.NomorPutra && appConfig.NomorPutri ? `${appConfig.NomorPutra} - ${appConfig.NomorPutri}` : appConfig.NomorPutra || "05.123 - 05.124")}
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400 max-w-xs leading-normal mt-1.5 font-semibold">
                Pangkalan: {appConfig.NamaGudep || "SMP Negeri 1 Jakarta"}
              </p>
            </div>
          </div>

          {authError && (
            <div className="p-3 text-xs font-semibold rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 text-center animate-pulse">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-stone-500 dark:text-stone-400 uppercase text-[9px] tracking-wider">Nama Akun (Username)</label>
              <input
                type="text"
                placeholder="Masukkan username akun Anda"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                className={`w-full px-4 py-3 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all
                  ${darkTheme ? "bg-stone-800 border-stone-700 text-white" : "bg-stone-50 border-stone-200 text-stone-800"}`}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-stone-500 dark:text-stone-400 uppercase text-[9px] tracking-wider">Kata Sandi (Password)</label>
              <input
                type="password"
                placeholder="Masukkan kata sandi akun Anda"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className={`w-full px-4 py-3 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all
                  ${darkTheme ? "bg-stone-800 border-stone-700 text-white" : "bg-stone-50 border-stone-200 text-stone-800"}`}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-amber-500/15 flex items-center justify-center gap-1.5 border border-amber-700 cursor-pointer"
            >
              {loggingIn ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Memvalidasi Akun...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Masuk Sesi</span>
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    );
  }

  // --- MAIN APP SHELL ONCE AUTHENTICATED ---
  return (
    <div className={`min-h-screen flex transition-colors font-sans
      ${darkTheme ? "bg-stone-950 text-stone-100" : "bg-stone-50 text-stone-900"}`}
    >
      {/* Role-based Sidebar navigation */}
      <Sidebar
        currentTab={currentTab}
        setTab={setTab}
        userRole={userRole}
        userName={userName}
        gudepName={appConfig.NamaAplikasi || "SiGudep"}
        gudepNumber={appConfig.NomorGudep || (appConfig.NomorPutra && appConfig.NomorPutri ? `${appConfig.NomorPutra} - ${appConfig.NomorPutri}` : appConfig.NomorPutra || "03.045")}
        gudepLogo={appConfig.Logo}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        themeColor="amber"
        darkTheme={darkTheme}
      />

      {/* Main View Shell Container */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Navbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          userRole={userRole}
          userName={userName}
          notifications={notifications}
          onReadNotification={handleReadNotification}
          onGlobalSearch={handleGlobalSearch}
          darkTheme={darkTheme}
          onToggleTheme={() => setDarkTheme(!darkTheme)}
        />

        {/* Dynamic active sub-view content container */}
        <main className="flex-1 p-6 space-y-6 overflow-y-auto max-w-[1400px] mx-auto w-full">
          {currentTab === "dashboard" && (
            <DashboardView
              userRole={userRole}
              userName={userName}
              config={appConfig}
              pembinaList={pembinaList}
              pesertaList={pesertaList}
              masterSku={masterSku}
              progressSku={progressSku}
              tkkAwards={tkkAwards}
              inventarisList={inventarisList}
              pengumumanList={pengumumanList}
              logsList={logsList}
              onNavigate={(tab) => setTab(tab)}
              darkTheme={darkTheme}
            />
          )}

          {currentTab === "peserta" && (
            <PesertaView
              pesertaList={pesertaList}
              userRole={userRole}
              masterSku={masterSku}
              progressSku={progressSku}
              tkkAwards={tkkAwards}
              absensiList={absensiList}
              refleksiList={refleksiList}
              penilaianList={penilaianList}
              currentUser={currentUser}
              onCreate={handleCreatePeserta}
              onUpdate={handleUpdatePeserta}
              onDelete={handleDeletePeserta}
              onSaveProgressSku={handleSaveProgressSku}
              onAwardTKK={handleAwardTKK}
              darkTheme={darkTheme}
            />
          )}

          {currentTab === "pembina" && (
            <PembinaView
              pembinaList={pembinaList}
              userRole={userRole}
              onCreate={handleCreatePembina}
              onUpdate={handleUpdatePembina}
              onDelete={handleDeletePembina}
              darkTheme={darkTheme}
            />
          )}

          {currentTab === "sensus" && (
            <SensusView
              usersList={usersList}
              logsList={logsList}
              onCreateUser={handleCreateUser}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
              darkTheme={darkTheme}
            />
          )}

          {currentTab === "sku_tkk" && (
            <SikupView
              masterSku={masterSku}
              userRole={userRole}
              onCreateSku={handleCreateMasterSKU}
              onUpdateSku={handleUpdateMasterSKU}
              onDeleteSku={handleDeleteMasterSKU}
              darkTheme={darkTheme}
            />
          )}

          {currentTab === "aktivitas" && (
            <AktivitasView
              jadwalList={jadwalList}
              kalenderList={kalenderList}
              absensiList={absensiList}
              pesertaList={pesertaList}
              userRole={userRole}
              userName={userName}
              currentUser={currentUser}
              onCreateJadwal={handleCreateJadwal}
              onDeleteJadwal={handleDeleteJadwal}
              onRecordAbsensi={handleRecordAbsensi}
              darkTheme={darkTheme}
            />
          )}

          {currentTab === "materi" && (
            <MateriView
              materiList={materiList}
              userRole={userRole}
              currentUser={currentUser}
              onCreateMateri={handleCreateMateri}
              onDeleteMateri={handleDeleteMateri}
              darkTheme={darkTheme}
            />
          )}

          {currentTab === "evaluasi" && (
            <EvaluasiView
              refleksiList={refleksiList}
              penilaianList={penilaianList}
              pesertaList={pesertaList}
              userRole={userRole}
              userName={userName}
              currentUser={currentUser}
              onSubmitRefleksi={handleCreateRefleksi}
              onSubmitPenilaian={handleCreatePenilaian}
              darkTheme={darkTheme}
            />
          )}

          {currentTab === "prestasi" && (
            <PrestasiView
              prestasiList={prestasiList}
              pesertaList={pesertaList}
              userRole={userRole}
              onCreate={handleCreatePrestasi}
              onUpdate={handleUpdatePrestasi}
              onDelete={handleDeletePrestasi}
              darkTheme={darkTheme}
            />
          )}

          {currentTab === "kta" && (
            <KtaView
              pesertaList={pesertaList}
              darkTheme={darkTheme}
            />
          )}

          {currentTab === "inventaris" && (
            <LogistikView
              inventarisList={inventarisList}
              userRole={userRole}
              onCreate={handleCreateInventaris}
              onUpdate={handleUpdateInventaris}
              onDelete={handleDeleteInventaris}
              darkTheme={darkTheme}
            />
          )}

          {currentTab === "sistem" && (
            <SistemView
              userRole={userRole}
              config={appConfig}
              onUpdateConfig={handleUpdateConfig}
              onBackup={handleBackupData}
              onRestore={handleRestoreDatabase}
              darkTheme={darkTheme}
            />
          )}
        </main>
      </div>
    </div>
  );
}
