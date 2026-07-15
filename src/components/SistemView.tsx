/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Settings, Save, Download, Upload, ShieldAlert, CheckCircle, 
  Copy, Check, FileSpreadsheet, Database, Loader2, ArrowLeftRight 
} from "lucide-react";
import { AppConfig, UserRole } from "../types";
import { API } from "../lib/api";
import { DATABASE_CONFIG } from "../config/database";

interface SistemViewProps {
  userRole: UserRole;
  config: AppConfig;
  onUpdateConfig: (data: Partial<AppConfig>) => void;
  onBackup: () => Promise<any>;
  onRestore: (payload: any) => Promise<boolean>;
  darkTheme: boolean;
}

export default function SistemView({
  userRole,
  config,
  onUpdateConfig,
  onBackup,
  onRestore,
  darkTheme
}: SistemViewProps) {
  const [subTab, setSubTab] = useState<"settings" | "database" | "backup">("settings");
  
  // Settings success state
  const [settingsSuccess, setSettingsSuccess] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncSuccessMessage, setSyncSuccessMessage] = useState("");
  const [syncErrorMessage, setSyncErrorMessage] = useState("");
  const [initSuccessMessage, setInitSuccessMessage] = useState("");
  const [initErrorMessage, setInitErrorMessage] = useState("");
  const [initializing, setInitializing] = useState(false);

  // Local settings mirroring AppConfig
  const [localConfig, setLocalConfig] = useState<Partial<AppConfig>>({
    NamaAplikasi: config.NamaAplikasi || "SiGudep",
    NamaGudep: config.NamaGudep || "",
    NomorGudep: config.NomorGudep || "",
    AlamatGudep: config.AlamatGudep || "",
    Logo: config.Logo || "",
    Email: config.Email || "",
    Telepon: config.Telepon || "",
    Website: config.Website || "",
    TahunAktif: config.TahunAktif || "2026/2027",
    SpreadsheetID: config.SpreadsheetID || "",
    FolderDriveID: config.FolderDriveID || "",
    ScriptURL: config.ScriptURL || "",
    NomorPutra: config.NomorPutra || "",
    NomorPutri: config.NomorPutri || "",
    NamaMabigus: config.NamaMabigus || "",
    Kwarcab: config.Kwarcab || "",
    Kwarda: config.Kwarda || "",
    AlamatSekretariat: config.AlamatSekretariat || ""
  });

  // Sync state if global config changes
  React.useEffect(() => {
    setLocalConfig({
      NamaAplikasi: config.NamaAplikasi || "SiGudep",
      NamaGudep: config.NamaGudep || "",
      NomorGudep: config.NomorGudep || "",
      AlamatGudep: config.AlamatGudep || "",
      Logo: config.Logo || "",
      Email: config.Email || "",
      Telepon: config.Telepon || "",
      Website: config.Website || "",
      TahunAktif: config.TahunAktif || "2026/2027",
      SpreadsheetID: config.SpreadsheetID || "",
      FolderDriveID: config.FolderDriveID || "",
      ScriptURL: config.ScriptURL || "",
      NomorPutra: config.NomorPutra || "",
      NomorPutri: config.NomorPutri || "",
      NamaMabigus: config.NamaMabigus || "",
      Kwarcab: config.Kwarcab || "",
      Kwarda: config.Kwarda || "",
      AlamatSekretariat: config.AlamatSekretariat || ""
    });
  }, [config]);

  // Backup state
  const [backupJson, setBackupJson] = useState("");
  const [loadingBackup, setLoadingBackup] = useState(false);
  const [copiedBackup, setCopiedBackup] = useState(false);
  const [backupErrorMessage, setBackupErrorMessage] = useState("");

  // Apps Script code copy state
  const [copiedScript, setCopiedScript] = useState(false);

  // Restore state
  const [restoreJsonInput, setRestoreJsonInput] = useState("");
  const [restoreSuccess, setRestoreSuccess] = useState(false);
  const [restoreErrorMessage, setRestoreErrorMessage] = useState("");

  // Logo uploading handler (convert to Base64 to trigger backend Drive upload)
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalConfig(prev => ({ ...prev, Logo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    // Combine Putra and Putri numbers for general Nomad Gudep field
    const derivedNomorGudep = `${localConfig.NomorPutra || ""} - ${localConfig.NomorPutri || ""}`;
    const derivedAlamatGudep = localConfig.AlamatSekretariat || "";
    
    const payload = {
      ...localConfig,
      NomorGudep: derivedNomorGudep,
      AlamatGudep: derivedAlamatGudep
    };

    onUpdateConfig(payload);
    setSettingsSuccess(true);
    setTimeout(() => setSettingsSuccess(false), 3500);
  };

  const triggerBackupDownload = async () => {
    setLoadingBackup(true);
    setBackupErrorMessage("");
    try {
      const data = await onBackup();
      const text = JSON.stringify(data, null, 2);
      setBackupJson(text);
      
      const blob = new Blob([text], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sigudep_backup_${new Date().toISOString().split("T")[0]}.json`;
      a.click();
    } catch (err) {
      setBackupErrorMessage("Gagal melakukan ekspor data cadangan.");
    } finally {
      setLoadingBackup(false);
    }
  };

  const triggerRestore = async () => {
    if (!restoreJsonInput) return;
    setRestoreErrorMessage("");
    setRestoreSuccess(false);
    try {
      const parsed = JSON.parse(restoreJsonInput);
      const ok = await onRestore(parsed);
      if (ok) {
        setRestoreSuccess(true);
        setRestoreJsonInput("");
        setTimeout(() => setRestoreSuccess(false), 4000);
      } else {
        setRestoreErrorMessage("Gagal memulihkan database.");
      }
    } catch (err) {
      setRestoreErrorMessage("Format JSON tidak valid atau korup!");
    }
  };

  const copyBackupToClipboard = () => {
    if (!backupJson) return;
    navigator.clipboard.writeText(backupJson);
    setCopiedBackup(true);
    setTimeout(() => setCopiedBackup(false), 2000);
  };

  const copyScriptToClipboard = () => {
    navigator.clipboard.writeText(googleAppsScriptCode);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  // Perform Bidirectional sheets sync
  const triggerSheetsSync = async () => {
    if (!config.ScriptURL) {
      setSyncErrorMessage("Harap konfigurasi dan simpan 'Script URL' Apps Script terlebih dahulu!");
      return;
    }
    setSyncing(true);
    setSyncSuccessMessage("");
    setSyncErrorMessage("");
    try {
      const response = await API.syncGoogleSheets();
      if (response.success) {
        setSyncSuccessMessage("Koneksi berhasil! Seluruh data lokal dan Google Sheets disinkronkan dua arah.");
        setTimeout(() => setSyncSuccessMessage(""), 5000);
      } else {
        setSyncErrorMessage("Gagal sinkronisasi: " + (response.message || "Kesalahan tidak diketahui"));
      }
    } catch (err: any) {
      setSyncErrorMessage("Gagal sinkronisasi: " + err.message);
    } finally {
      setSyncing(false);
    }
  };

  // Trigger Google Sheets table initialize
  const triggerSheetsInitialize = async () => {
    if (!config.ScriptURL) {
      setInitErrorMessage("Harap masukkan dan simpan 'Script URL' Apps Script terlebih dahulu!");
      return;
    }
    setInitializing(true);
    setInitSuccessMessage("");
    setInitErrorMessage("");
    try {
      const response = await API.initializeGoogleSheets();
      if (response.success) {
        setInitSuccessMessage("Berhasil! Seluruh lembar tabel (20 sheet) telah diinisialisasi secara otomatis di Spreadsheet Anda.");
        setTimeout(() => setInitSuccessMessage(""), 5000);
      } else {
        setInitErrorMessage("Gagal menginisialisasi: Gagal menghubungi Apps Script.");
      }
    } catch (err: any) {
      setInitErrorMessage("Gagal memanggil inisialisasi: " + err.message + ". Pastikan Apps Script telah di-deploy sebagai Web App dengan akses 'Anyone' (Siapa Saja)!");
    } finally {
      setInitializing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header tab */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans">Sistem & Konfigurasi Gudep</h2>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Kelola profil administrasi pangkalan dan integrasikan database awan dengan Google Spreadsheet & Drive.
          </p>
        </div>
        <div className="flex flex-wrap gap-1 bg-slate-500/10 p-1 rounded-xl border border-slate-300/10 self-start sm:self-auto">
          <button
            onClick={() => setSubTab("settings")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5
              ${subTab === "settings" ? "bg-teal-500 text-white shadow" : "text-slate-400 hover:text-slate-200"}`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Profil Gudep</span>
          </button>
          <button
            onClick={() => setSubTab("database")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5
              ${subTab === "database" ? "bg-teal-500 text-white shadow" : "text-slate-400 hover:text-slate-200"}`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Integrasi Spreadsheet</span>
          </button>
          <button
            onClick={() => setSubTab("backup")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5
              ${subTab === "backup" ? "bg-teal-500 text-white shadow" : "text-slate-400 hover:text-slate-200"}`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Backup / Restore</span>
          </button>
        </div>
      </div>

      {/* SUB TAB 1: PROFIL SETTINGS */}
      {subTab === "settings" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className={`p-6 rounded-2xl border shadow-sm space-y-5
              ${darkTheme ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-800"}`}
            >
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Informasi Pangkalan</h4>
              {settingsSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl text-xs flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" /> Profil pangkalan berhasil disimpan!
                </div>
              )}
              
              <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-400">Nama Aplikasi</label>
                    <input
                      type="text"
                      value={localConfig.NamaAplikasi}
                      onChange={(e) => setLocalConfig(prev => ({ ...prev, NamaAplikasi: e.target.value }))}
                      className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-teal-500
                        ${darkTheme ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-400">Nama Gugus Depan</label>
                    <input
                      type="text"
                      value={localConfig.NamaGudep}
                      onChange={(e) => setLocalConfig(prev => ({ ...prev, NamaGudep: e.target.value }))}
                      className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-teal-500
                        ${darkTheme ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-400">Nomor Gudep (Putra)</label>
                    <input
                      type="text"
                      value={localConfig.NomorPutra}
                      onChange={(e) => setLocalConfig(prev => ({ ...prev, NomorPutra: e.target.value }))}
                      className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-teal-500
                        ${darkTheme ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-400">Nomor Gudep (Putri)</label>
                    <input
                      type="text"
                      value={localConfig.NomorPutri}
                      onChange={(e) => setLocalConfig(prev => ({ ...prev, NomorPutri: e.target.value }))}
                      className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-teal-500
                        ${darkTheme ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-400">Nama Kamabigus (Kepala Sekolah)</label>
                    <input
                      type="text"
                      value={localConfig.NamaMabigus}
                      onChange={(e) => setLocalConfig(prev => ({ ...prev, NamaMabigus: e.target.value }))}
                      className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-teal-500
                        ${darkTheme ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-400">Tahun Aktif Latihan</label>
                    <input
                      type="text"
                      value={localConfig.TahunAktif}
                      onChange={(e) => setLocalConfig(prev => ({ ...prev, TahunAktif: e.target.value }))}
                      className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-teal-500
                        ${darkTheme ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-400">Kwartir Cabang (Kwarcab)</label>
                    <input
                      type="text"
                      value={localConfig.Kwarcab}
                      onChange={(e) => setLocalConfig(prev => ({ ...prev, Kwarcab: e.target.value }))}
                      className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-teal-500
                        ${darkTheme ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-400">Kwartir Daerah (Kwarda)</label>
                    <input
                      type="text"
                      value={localConfig.Kwarda}
                      onChange={(e) => setLocalConfig(prev => ({ ...prev, Kwarda: e.target.value }))}
                      className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-teal-500
                        ${darkTheme ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-400">Alamat Sekretariat Gudep</label>
                  <textarea
                    value={localConfig.AlamatSekretariat}
                    onChange={(e) => setLocalConfig(prev => ({ ...prev, AlamatSekretariat: e.target.value }))}
                    className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-teal-500
                      ${darkTheme ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`}
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-400">Email Gudep</label>
                    <input
                      type="email"
                      value={localConfig.Email}
                      onChange={(e) => setLocalConfig(prev => ({ ...prev, Email: e.target.value }))}
                      className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-teal-500
                        ${darkTheme ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-400">Telepon Gudep</label>
                    <input
                      type="text"
                      value={localConfig.Telepon}
                      onChange={(e) => setLocalConfig(prev => ({ ...prev, Telepon: e.target.value }))}
                      className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-teal-500
                        ${darkTheme ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-400">Website Resmi</label>
                    <input
                      type="text"
                      value={localConfig.Website}
                      onChange={(e) => setLocalConfig(prev => ({ ...prev, Website: e.target.value }))}
                      className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-teal-500
                        ${darkTheme ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`}
                    />
                  </div>
                </div>

                {["SUPER_ADMIN", "ADMIN"].includes(userRole) && (
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold rounded-xl bg-teal-500 hover:bg-teal-600 text-white flex items-center gap-1.5 shadow-md shadow-teal-500/10 transition-all cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Simpan Profil</span>
                  </button>
                )}
              </form>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            {/* Logo upload Card */}
            <div className={`p-6 rounded-2xl border shadow-sm text-center space-y-4
              ${darkTheme ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-800"}`}
            >
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider text-left">Lambang Gerakan Pramuka / Logo Gudep</h4>
              <div className="flex flex-col items-center justify-center p-4 border border-dashed border-slate-300/20 rounded-2xl bg-slate-500/5">
                <img 
                  src={localConfig.Logo || "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=120&auto=format&fit=crop&q=80"} 
                  alt="Scout Logo" 
                  className="w-24 h-24 rounded-full object-cover shadow-md bg-white p-1 border border-slate-200"
                />
                
                <p className="text-[10px] text-slate-400 mt-3 leading-normal max-w-[200px]">
                  Format pasfoto logo bulat / perisai. Disinkronkan ke Google Drive otomatis.
                </p>

                {["SUPER_ADMIN", "ADMIN"].includes(userRole) && (
                  <label className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-500 hover:bg-teal-600 text-white text-[10px] font-bold rounded-xl cursor-pointer transition-colors shadow">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Unggah Logo</span>
                    <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            {/* General Info Card */}
            <div className={`p-6 rounded-2xl border shadow-sm space-y-3
              ${darkTheme ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-800"}`}
            >
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status Integrasi Awan</h4>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Awan Google Sheets:</span>
                  {config.ScriptURL ? (
                    <span className="px-2 py-0.5 bg-emerald-500/15 text-emerald-500 font-bold rounded-lg text-[10px]">TERHUBUNG</span>
                  ) : (
                    <span className="px-2 py-0.5 bg-amber-500/15 text-amber-500 font-bold rounded-lg text-[10px]">BELUM SETUP</span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Situs Web:</span>
                  <span className="font-semibold text-right max-w-[140px] truncate">{config.Website || "-"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Versi Sistem:</span>
                  <span className="font-mono text-[10px] font-bold text-teal-500">v{config.Versi || "1.0"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB TAB 2: INTEGRASI SPREADSHEET */}
      {subTab === "database" && (
        <div className="grid grid-cols-1 max-w-3xl gap-6">
          <div className={`p-8 rounded-3xl border shadow-lg space-y-6
            ${darkTheme ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-800"}`}
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-teal-500/10 text-teal-500 rounded-2xl">
                <Database className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm font-bold font-sans">Status Koneksi Database Google Spreadsheet</h4>
                <p className="text-xs text-slate-400 mt-0.5">Integrasi awan pangkalan pangkalan pramuka Gudep Anda aktif secara real-time.</p>
              </div>
            </div>

            <hr className={darkTheme ? "border-slate-800" : "border-slate-100"} />

            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-slate-400 block uppercase tracking-wider text-[9px]">ID Google Spreadsheet</span>
                <div className={`px-4 py-3 font-mono rounded-xl border flex justify-between items-center
                  ${darkTheme ? "bg-slate-950 border-slate-850 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-700"}`}
                >
                  <span className="truncate pr-4">{DATABASE_CONFIG.SPREADSHEET_ID}</span>
                  <span className="px-2 py-0.5 bg-teal-500/15 text-teal-500 text-[9px] font-bold rounded-lg shrink-0">TERKONFIGURASI</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-slate-400 block uppercase tracking-wider text-[9px]">ID Folder Google Drive (Pasfoto Media)</span>
                <div className={`px-4 py-3 font-mono rounded-xl border flex justify-between items-center
                  ${darkTheme ? "bg-slate-950 border-slate-850 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-700"}`}
                >
                  <span className="truncate pr-4">{DATABASE_CONFIG.FOLDER_ID}</span>
                  <span className="px-2 py-0.5 bg-teal-500/15 text-teal-500 text-[9px] font-bold rounded-lg shrink-0">TERKONFIGURASI</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-slate-400 block uppercase tracking-wider text-[9px]">URL Web App Google Apps Script</span>
                <div className={`px-4 py-3 font-mono rounded-xl border flex justify-between items-center
                  ${darkTheme ? "bg-slate-950 border-slate-850 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-700"}`}
                >
                  <span className="truncate pr-4">{DATABASE_CONFIG.SCRIPT_URL}</span>
                  <span className="px-2 py-0.5 bg-emerald-500/15 text-emerald-500 text-[9px] font-bold rounded-lg shrink-0">AKTIF / TERHUBUNG 🔒</span>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-2xl border text-xs leading-relaxed flex gap-2
              ${darkTheme ? "bg-slate-950/45 border-slate-850 text-slate-400" : "bg-slate-50/50 border-slate-200 text-slate-600"}`}
            >
              <ShieldAlert className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" />
              <div>
                <strong className={darkTheme ? "text-slate-200" : "text-slate-800"}>Pengaturan Database Dikunci:</strong><br />
                Untuk alasan keamanan pangkalan dan kestabilan sistem multiuser, konfigurasi kredensial database spreadsheet telah diamankan dalam kode sumber aplikasi oleh pengembang di AI Studio. Pengguna umum tidak dapat mengubah setelan ini secara dinamis dari antarmuka sistem.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB TAB 3: BACKUP / RESTORE */}
      {subTab === "backup" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Backup database segment */}
          <div className={`p-6 rounded-2xl border shadow-sm space-y-4 h-fit
            ${darkTheme ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-800"}`}
          >
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Unduh Cadangan Database Gudep</h4>
            <p className="text-xs text-slate-400 leading-normal">
              Ekspor seluruh data (Siswa, Pembina, SKU, TKK, Presensi, Inventaris, Audit Log) ke dalam file <code>.json</code> yang aman.
            </p>

            <button
              disabled={loadingBackup}
              onClick={triggerBackupDownload}
              className="px-4 py-2.5 bg-teal-500 hover:bg-teal-600 text-white text-xs font-semibold rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{loadingBackup ? "Mengekspor JSON..." : "Unduh Cadangan JSON"}</span>
            </button>

            {backupErrorMessage && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{backupErrorMessage}</span>
              </div>
            )}

            {backupJson && (
              <div className="space-y-2 pt-2 animate-fade-in">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-400 font-mono">Pratinjau JSON Cadangan</span>
                  <button
                    onClick={copyBackupToClipboard}
                    className="text-teal-500 hover:text-teal-600 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    {copiedBackup ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedBackup ? "Tersalin!" : "Salin JSON"}</span>
                  </button>
                </div>
                <pre className={`p-3 rounded-xl border font-mono text-[9px] max-h-40 overflow-y-auto leading-relaxed
                  ${darkTheme ? "bg-slate-950 border-slate-850 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-600"}`}>
                  {backupJson}
                </pre>
              </div>
            )}
          </div>

          {/* Restore database segment */}
          <div className={`p-6 rounded-2xl border shadow-sm space-y-4 h-fit
            ${darkTheme ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-800"}`}
          >
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Unggah / Tempel Puluhkan Database</h4>
            <p className="text-xs text-slate-400 leading-normal">
              Pulihkan/Ganti seluruh database sistem dengan file JSON cadangan yang pernah diunduh sebelumnya.
            </p>

            {restoreSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl text-xs flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" /> Database berhasil dipulihkan! Aplikasi akan memuat ulang data.
              </div>
            )}

            {restoreErrorMessage && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{restoreErrorMessage}</span>
              </div>
            )}

            {["SUPER_ADMIN", "ADMIN"].includes(userRole) ? (
              <div className="space-y-3">
                <textarea
                  placeholder="Tempel teks JSON cadangan di sini..."
                  value={restoreJsonInput}
                  onChange={(e) => setRestoreJsonInput(e.target.value)}
                  className={`w-full px-3 py-2 text-xs font-mono rounded-xl border focus:ring-2 focus:ring-teal-500
                    ${darkTheme ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-800"}`}
                  rows={6}
                />
                <button
                  onClick={triggerRestore}
                  disabled={!restoreJsonInput}
                  className="w-full py-2 bg-red-500 hover:bg-red-600 text-white font-semibold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Pulihkan Database Sekarang</span>
                </button>
              </div>
            ) : (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold">Akses Ditolak</span>
                  <p className="text-slate-400">Hanya peranan administrator utama yang berwenang memulihkan file cadangan database.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

// Complete and robust code snippet for Google Apps Script
const googleAppsScriptCode = `/**
 * Google Apps Script for SiGudep Database & Drive Sync
 * Copy and paste this code into your Google Apps Script project (https://script.google.com)
 * Deploy as a "Web App" accessible to "Anyone" (Bisa diakses siapa saja).
 */

function doGet(e) {
  var action = e.parameter.action;
  if (action === 'read') {
    return ContentService.createTextOutput(JSON.stringify(readAllSheets()))
      .setMimeType(ContentService.MimeType.JSON);
  }
  return ContentService.createTextOutput(JSON.stringify({ success: false, message: "Invalid GET action" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var postData = JSON.parse(e.postData.contents);
    var action = postData.action;
    
    if (action === 'writeTable') {
      var table = postData.table;
      var data = postData.data;
      writeTableToSheet(table, data);
      return ContentService.createTextOutput(JSON.stringify({ success: true, message: "Table " + table + " updated successfully." }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === 'uploadFile') {
      var folderId = postData.folderId;
      var fileName = postData.fileName;
      var mimeType = postData.mimeType;
      var base64Data = postData.base64Data;
      var fileUrl = uploadFileToDrive(folderId, fileName, mimeType, base64Data);
      return ContentService.createTextOutput(JSON.stringify({ success: true, url: fileUrl }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === 'setup') {
      initializeSheets();
      return ContentService.createTextOutput(JSON.stringify({ success: true, message: "Database sheets initialized successfully!" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ success: false, message: "Invalid POST action" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function readAllSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var tables = [
    "configs", "users", "pembina", "peserta", "master_sku", "progress_sku", 
    "tingkat", "tkk", "absensi_peserta", "absensi_pembina", "jadwal", 
    "kalender", "materi", "pengumuman", "notifikasi", "inventaris", 
    "refleksi_siswa", "refleksi_pembina", "penilaian_sikap", "log_aktivitas", "prestasi"
  ];
  
  var db = {};
  tables.forEach(function(table) {
    var sheet = ss.getSheetByName(table);
    if (!sheet) {
      db[table] = table === 'configs' ? {} : [];
      return;
    }
    
    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      db[table] = table === 'configs' ? {} : [];
      return;
    }
    
    var headers = data[0];
    var list = [];
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var obj = {};
      var isEmptyRow = true;
      for (var j = 0; j < headers.length; j++) {
        var header = headers[j];
        if (header) {
          var val = row[j];
          if (val instanceof Date) {
            val = val.toISOString().split('T')[0];
          }
          obj[header] = val;
          if (val !== "" && val !== null && val !== undefined) {
            isEmptyRow = false;
          }
        }
      }
      if (!isEmptyRow) {
        list.push(obj);
      }
    }
    
    if (table === 'configs') {
      db[table] = list.length > 0 ? list[0] : {};
    } else {
      db[table] = list;
    }
  });
  
  return db;
}

function writeTableToSheet(table, data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(table);
  if (!sheet) {
    sheet = ss.insertSheet(table);
  }
  
  sheet.clear();
  
  if (!data || data.length === 0) {
    var headers = getHeadersForTable(table);
    sheet.appendRow(headers);
    return;
  }
  
  var list = Array.isArray(data) ? data : [data];
  var headers = getHeadersForTable(table);
  if (headers.length === 0) {
    headers = Object.keys(list[0]);
  }
  
  sheet.appendRow(headers);
  
  var rows = [];
  list.forEach(function(item) {
    var row = [];
    headers.forEach(function(header) {
      var val = item[header];
      if (val === undefined || val === null) {
        row.push("");
      } else if (typeof val === 'object') {
        row.push(JSON.stringify(val));
      } else {
        row.push(val);
      }
    });
    rows.push(row);
  });
  
  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  }
}

function uploadFileToDrive(folderId, fileName, mimeType, base64Data) {
  var folder;
  if (folderId) {
    try {
      folder = DriveApp.getFolderById(folderId);
    } catch (e) {}
  }
  
  if (!folder) {
    var folders = DriveApp.getFoldersByName("SiGudep Media");
    if (folders.hasNext()) {
      folder = folders.next();
    } else {
      folder = DriveApp.createFolder("SiGudep Media");
    }
  }
  
  var decodedBytes = Utilities.base64Decode(base64Data);
  var blob = Utilities.newBlob(decodedBytes, mimeType, fileName);
  var file = folder.createFile(blob);
  
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  
  var fileUrl = "https://lh3.googleusercontent.com/d/" + file.getId() + "=w1000";
  return fileUrl;
}

function initializeSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var tables = [
    "configs", "users", "pembina", "peserta", "master_sku", "progress_sku", 
    "tingkat", "tkk", "absensi_peserta", "absensi_pembina", "jadwal", 
    "kalender", "materi", "pengumuman", "notifikasi", "inventaris", 
    "refleksi_siswa", "refleksi_pembina", "penilaian_sikap", "log_aktivitas", "prestasi"
  ];
  
  tables.forEach(function(table) {
    var sheet = ss.getSheetByName(table);
    if (!sheet) {
      sheet = ss.insertSheet(table);
    }
    if (sheet.getDataRange().getValues().length <= 1) {
      sheet.clear();
      var headers = getHeadersForTable(table);
      sheet.appendRow(headers);
    }
  });
}

function getHeadersForTable(table) {
  switch(table) {
    case "configs":
      return ["NamaAplikasi", "NamaGudep", "NomorGudep", "AlamatGudep", "Logo", "Favicon", "ThemeColor", "SpreadsheetID", "FolderDriveID", "ScriptURL", "Versi", "TahunAktif", "Email", "Telepon", "Website", "CreatedAt", "UpdatedAt", "GugusDepanID", "NomorPutra", "NomorPutri", "NamaMabigus", "Kwarcab", "Kwarda", "AlamatSekretariat"];
    case "users":
      return ["UserID", "Username", "PasswordHash", "Role", "NamaLengkap", "PembinaID", "PesertaID", "Status", "LastLogin", "CreatedAt", "UpdatedAt"];
    case "pembina":
      return ["PembinaID", "Foto", "Nama", "NomorKTA", "NIP", "Jabatan", "Golongan", "NoHP", "Email", "Alamat", "TanggalMasuk", "Status", "CreatedAt", "UpdatedAt"];
    case "peserta":
      return ["PesertaID", "NomorKTA", "Foto", "NamaLengkap", "NamaPanggilan", "NISN", "TempatLahir", "TanggalLahir", "JenisKelamin", "Agama", "GolonganDarah", "Alamat", "Sekolah", "Kelas", "GolonganPramuka", "Tingkat", "Regu", "NoHP", "NamaAyah", "NamaIbu", "NoHPOrangTua", "TanggalMasukGudep", "Status", "CreatedAt", "UpdatedAt"];
    case "master_sku":
      return ["SkuID", "Golongan", "Tingkat", "NomorButir", "Bidang", "Deskripsi", "Urutan", "Status"];
    case "progress_sku":
      return ["ProgressID", "PesertaID", "SkuID", "Status", "TanggalValidasi", "PembinaID", "Catatan", "CreatedAt"];
    case "tingkat":
      return ["TingkatID", "PesertaID", "Golongan", "TingkatLama", "TingkatBaru", "Tanggal", "PembinaID", "Catatan"];
    case "tkk":
      return ["TKKID", "PesertaID", "NamaTKK", "Bidang", "Tingkatan", "Tanggal", "PembinaID", "NomorSertifikat", "Catatan"];
    case "absensi_peserta":
      return ["AbsensiID", "PesertaID", "Tanggal", "JamMasuk", "Status", "Latitude", "Longitude", "Lokasi", "PembinaID"];
    case "absensi_pembina":
      return ["AbsensiID", "PembinaID", "Tanggal", "JamMasuk", "Status", "Latitude", "Longitude", "Lokasi"];
    case "jadwal":
      return ["JadwalID", "Judul", "Tanggal", "Jam", "Lokasi", "Deskripsi", "CreatedBy"];
    case "kalender":
      return ["KalenderID", "Judul", "Mulai", "Selesai", "Jenis", "Keterangan"];
    case "materi":
      return ["MateriID", "Judul", "Kategori", "JenisFile", "Link", "Deskripsi", "Tanggal", "PembinaID"];
    case "pengumuman":
      return ["PengumumanID", "Judul", "Isi", "Tanggal", "Status"];
    case "notifikasi":
      return ["NotifikasiID", "Judul", "Pesan", "Role", "Tanggal", "Status"];
    case "inventaris":
      return ["InventarisID", "NamaBarang", "Kategori", "KodeBarang", "Jumlah", "Satuan", "Kondisi", "Lokasi", "TanggalPerolehan", "Keterangan"];
    case "refleksi_siswa":
      return ["RefleksiID", "PesertaID", "Tanggal", "Isi", "Lampiran"];
    case "refleksi_pembina":
      return ["RefleksiID", "PembinaID", "PesertaID", "Tanggal", "Isi"];
    case "penilaian_sikap":
      return ["PenilaianID", "PesertaID", "PembinaID", "Periode", "Tanggal", "Disiplin", "TanggungJawab", "KerjaSama", "Kepemimpinan", "Kemandirian", "Keaktifan", "NilaiTotal", "NilaiRataRata", "Kategori", "Catatan", "CreatedAt", "UpdatedAt"];
    case "log_aktivitas":
      return ["LogID", "Tanggal", "Jam", "UserID", "Nama", "Role", "Modul", "Aktivitas", "DataID", "Keterangan"];
    case "prestasi":
      return ["PrestasiID", "PesertaID", "NamaPrestasi", "Tingkat", "Penyelenggara", "Tanggal", "Sertifikat", "FotoKegiatan", "Deskripsi"];
    default:
      return [];
  }
}
`;
