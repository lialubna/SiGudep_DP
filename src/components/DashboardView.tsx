/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  Users, UserCheck, Award, Calendar, BookOpen, Boxes, 
  TrendingUp, Activity, Bell, Shield, ArrowRight, Star, GraduationCap
} from "lucide-react";
import { UserRole, AppConfig, Pembina, Peserta, MasterSKU, ProgressSKU, TKKAward, Inventaris, Pengumuman, LogAktivitas } from "../types";

interface DashboardViewProps {
  userRole: UserRole;
  userName: string;
  config: AppConfig;
  pembinaList: Pembina[];
  pesertaList: Peserta[];
  masterSku: MasterSKU[];
  progressSku: ProgressSKU[];
  tkkAwards: TKKAward[];
  inventarisList: Inventaris[];
  pengumumanList: Pengumuman[];
  logsList: LogAktivitas[];
  onNavigate: (tab: string) => void;
  darkTheme: boolean;
}

export default function DashboardView({
  userRole,
  userName,
  config,
  pembinaList,
  pesertaList,
  masterSku,
  progressSku,
  tkkAwards,
  inventarisList,
  pengumumanList,
  logsList,
  onNavigate,
  darkTheme
}: DashboardViewProps) {

  // Global counts
  const totalPembina = pembinaList.length;
  const totalPeserta = pesertaList.length;
  const totalTKK = tkkAwards.length;
  const totalInventaris = inventarisList.reduce((acc, curr) => acc + Number(curr.Jumlah), 0);
  const totalMateriCount = 2; // default
  const totalJadwalCount = 2; // default

  // Calculate average SKU progress for all members
  const approvedSkuCount = progressSku.filter(p => p.Status === "Lulus").length;
  const totalSkuSyllabusPoints = masterSku.length || 9;
  const avgSkuProgress = totalPeserta > 0 
    ? Math.min(100, Math.round(((approvedSkuCount / (totalPeserta * totalSkuSyllabusPoints)) * 100))) 
    : 0;

  // Active user mapping
  const currentScout = pesertaList[0] || {
    PesertaID: "default-peserta",
    NamaLengkap: userName,
    NomorKTA: "03.045.2026.0024",
    GolonganPramuka: "Penggalang",
    Tingkat: "Penggalang Ramu",
    Regu: "Rajawali",
    Foto: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150"
  };

  const currentPesertaSkuProgress = progressSku.filter(p => p.PesertaID === currentScout.PesertaID && p.Status === "Lulus").length;
  const currentPesertaSkuPct = Math.round((currentPesertaSkuProgress / totalSkuSyllabusPoints) * 100);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className={`p-6 rounded-3xl relative overflow-hidden shadow-lg border-2
        ${darkTheme 
          ? "bg-stone-900 border-amber-600 text-white shadow-[4px_4px_0px_0px_rgba(217,119,6,1)]" 
          : "bg-amber-900 border-stone-950 text-white shadow-[4px_4px_0px_0px_rgba(28,25,23,1)]"
        }
      `}>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300 bg-amber-950/45 px-3 py-1 rounded border border-amber-500/20">
              Selamat Datang di SiGudep
            </span>
            <h2 className="text-2xl font-black tracking-tight mt-2.5">Halo, {userName}!</h2>
            <p className="text-xs text-stone-200 opacity-90 mt-1">
              Sistem Informasi {config.NamaGudep || "Gugus Depan"} aktif di Tahun Ajaran {config.TahunAktif || "2026/2027"}.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button 
              onClick={() => onNavigate("kta")} 
              className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 text-stone-950 hover:bg-amber-400 transition-all border-2 border-stone-950 dark:border-white shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] hover:translate-x-[1px] hover:translate-y-[1px]"
            >
              Lihat KTA Digital
            </button>
            {["SUPER_ADMIN", "ADMIN"].includes(userRole) && (
              <button 
                onClick={() => onNavigate("sistem")} 
                className="px-4 py-2 text-xs font-bold rounded-xl bg-stone-900 hover:bg-stone-850 text-white border-2 border-stone-50 transition-all shadow-[2px_2px_0px_0px_rgba(255,255,255,0.15)] hover:translate-x-[1px] hover:translate-y-[1px]"
              >
                Pengaturan Sistem
              </button>
            )}
          </div>
        </div>
        {/* Backdrop visual elements */}
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 pointer-events-none">
          <SparklesVisual />
        </div>
      </div>

      {/* --- SUPER ADMIN & ADMIN DASHBOARD --- */}
      {["SUPER_ADMIN", "ADMIN"].includes(userRole) && (
        <>
          {/* Stats Summary Bento Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard 
              icon={UserCheck} 
              title="Jumlah Pembina" 
              value={totalPembina} 
              subtitle="Aktif mengajar" 
              color="bg-emerald-500" 
              darkTheme={darkTheme}
              onClick={() => onNavigate("pembina")}
            />
            <StatCard 
              icon={Users} 
              title="Jumlah Peserta" 
              value={totalPeserta} 
              subtitle="Anggota Pramuka" 
              color="bg-blue-500" 
              darkTheme={darkTheme}
              onClick={() => onNavigate("peserta")}
            />
            <StatCard 
              icon={Award} 
              title="TKK Diberikan" 
              value={totalTKK} 
              subtitle="Kecakapan Khusus" 
              color="bg-amber-500" 
              darkTheme={darkTheme}
              onClick={() => onNavigate("sku_tkk")}
            />
            <StatCard 
              icon={Boxes} 
              title="Total Inventaris" 
              value={totalInventaris} 
              subtitle="Barang terdata" 
              color="bg-rose-500" 
              darkTheme={darkTheme}
              onClick={() => onNavigate("inventaris")}
            />
          </div>

          {/* Graphical Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart 1: SKU Progress rates */}
            <div className="bento-card-bold flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-600" />
                  Rata-Rata SKU Lulus
                </h4>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-4xl font-black tracking-tight">{avgSkuProgress}%</span>
                  <span className="text-[10px] uppercase font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/10">+4.2% bulan ini</span>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-3 leading-relaxed">
                  Persentase dari butir Syarat Kecakapan Umum yang telah divalidasi oleh pembina bagi seluruh anggota aktif.
                </p>
              </div>

              {/* Dynamic SVG bar representation */}
              <div className="mt-6 space-y-3">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                  <span className="text-stone-500 dark:text-stone-400">Penggalang Ramu</span>
                  <span className="text-stone-800 dark:text-white">78%</span>
                </div>
                <div className="h-2 w-full bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden border border-stone-200 dark:border-stone-700">
                  <div className="h-full bg-amber-600 rounded-full" style={{ width: "78%" }} />
                </div>

                <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                  <span className="text-stone-500 dark:text-stone-400">Penggalang Rakit</span>
                  <span className="text-stone-800 dark:text-white">45%</span>
                </div>
                <div className="h-2 w-full bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden border border-stone-200 dark:border-stone-700">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: "45%" }} />
                </div>

                <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                  <span className="text-stone-500 dark:text-stone-400">Penggalang Terap</span>
                  <span className="text-stone-800 dark:text-white">12%</span>
                </div>
                <div className="h-2 w-full bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden border border-stone-200 dark:border-stone-700">
                  <div className="h-full bg-amber-700 rounded-full" style={{ width: "12%" }} />
                </div>
              </div>
            </div>

            {/* Chart 2: Kehadiran Anggota (SVG line chart visualization) */}
            <div className="bento-card-bold lg:col-span-2 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-600" />
                  Tren Kehadiran Latihan Rutin (3 Bulan)
                </h4>
                <div className="mt-4 flex gap-4 text-xs font-bold uppercase tracking-wider">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-600" /> Penggalang</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Pembina</span>
                </div>
              </div>

              {/* Styled interactive SVG Line graph */}
              <div className="mt-4 w-full h-40 relative flex items-end">
                <svg viewBox="0 0 300 100" className="w-full h-full overflow-visible">
                  {/* Grid Lines */}
                  <line x1="0" y1="20" x2="300" y2="20" stroke="rgba(148, 163, 184, 0.1)" strokeWidth="1" />
                  <line x1="0" y1="50" x2="300" y2="50" stroke="rgba(148, 163, 184, 0.1)" strokeWidth="1" />
                  <line x1="0" y1="80" x2="300" y2="80" stroke="rgba(148, 163, 184, 0.1)" strokeWidth="1" />
                  
                  {/* Scout attendance line */}
                  <path 
                    d="M 10,80 Q 80,40 150,55 T 290,15" 
                    fill="none" 
                    stroke="#2A9D8F" 
                    strokeWidth="3.5" 
                    strokeLinecap="round"
                    className="drop-shadow-lg"
                  />
                  {/* Instructor attendance line */}
                  <path 
                    d="M 10,65 Q 80,55 150,30 T 290,25" 
                    fill="none" 
                    stroke="#E9C46A" 
                    strokeWidth="2.5" 
                    strokeDasharray="4 2"
                    strokeLinecap="round"
                  />
                  
                  {/* Value dots */}
                  <circle cx="290" cy="15" r="4.5" fill="#2A9D8F" stroke="#fff" strokeWidth="1.5" />
                  <circle cx="290" cy="25" r="4.5" fill="#E9C46A" stroke="#fff" strokeWidth="1.5" />
                </svg>
                {/* Months display */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2 text-[9px] text-slate-400 font-mono">
                  <span>Mei 2026</span>
                  <span>Juni 2026</span>
                  <span>Juli 2026</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* --- PEMBINA DASHBOARD --- */}
      {userRole === "PEMBINA" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick stats */}
          <div className={`p-5 rounded-2xl border shadow-sm col-span-1 space-y-4
            ${darkTheme ? "bg-slate-800/40 border-slate-700/80" : "bg-white border-slate-200"}
          `}>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              Kakak Pembina Unit
            </h4>
            <div className="flex items-center gap-4 py-2 border-b border-slate-200/10">
              <img src={currentScout.Foto} alt="Budi" className="w-14 h-14 rounded-xl object-cover shadow border border-slate-200" />
              <div>
                <h5 className="font-bold text-sm text-teal-500">Kak Budi Santoso</h5>
                <p className="text-xs text-slate-400">Pembina Satuan Penggalang</p>
                <p className="text-[10px] text-slate-500">No.KTA: 31.71.05.0001</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <div className="p-3 bg-teal-500/5 rounded-xl border border-teal-500/10 text-center">
                <span className="block text-2xl font-bold text-teal-500">{totalPeserta}</span>
                <span className="text-[10px] text-slate-400">Peserta Binaan</span>
              </div>
              <div className="p-3 bg-amber-500/5 rounded-xl border border-amber-500/10 text-center">
                <span className="block text-2xl font-bold text-amber-500">{approvedSkuCount}</span>
                <span className="text-[10px] text-slate-400">SKU Disetujui</span>
              </div>
            </div>
            <button 
              onClick={() => onNavigate("peserta")}
              className="w-full py-2 bg-teal-500 hover:bg-teal-600 text-white text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <span>Kelola SKU & TKK Anggota</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Managed Scout Grid overview */}
          <div className={`p-5 rounded-2xl border shadow-sm lg:col-span-2
            ${darkTheme ? "bg-slate-800/40 border-slate-700/80" : "bg-white border-slate-200"}
          `}>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              Anggota Pramuka Binaan Terbaru
            </h4>
            <div className="space-y-3">
              {pesertaList.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">Belum ada peserta bimbingan yang terdaftar.</div>
              ) : (
                pesertaList.map(p => {
                  const passCount = progressSku.filter(pr => pr.PesertaID === p.PesertaID && pr.Status === "Lulus").length;
                  const pct = Math.round((passCount / totalSkuSyllabusPoints) * 100);
                  return (
                    <div key={p.PesertaID} className="flex items-center justify-between p-3 rounded-xl bg-slate-500/5 border border-slate-200/5 hover:bg-slate-500/10 transition-colors">
                      <div className="flex items-center gap-3">
                        <img src={p.Foto || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"} alt="Avatar" className="w-10 h-10 rounded-lg object-cover" />
                        <div>
                          <h5 className="text-xs font-bold">{p.NamaLengkap}</h5>
                          <span className="text-[10px] text-slate-400 font-mono">Regu: {p.Regu} ({p.Tingkat})</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-teal-400 block font-bold">Progress SKU: {pct}%</span>
                        <div className="w-24 h-1.5 bg-slate-200/50 dark:bg-slate-700/50 rounded-full mt-1 overflow-hidden">
                          <div className="h-full bg-teal-500" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- PESERTA DIDIK DASHBOARD --- */}
      {userRole === "PESERTA_DIDIK" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Card & KTA Quick preview */}
          <div className={`p-5 rounded-2xl border shadow-sm
            ${darkTheme ? "bg-slate-800/40 border-slate-700/80" : "bg-white border-slate-200"}
          `}>
            <div className="text-center pb-4 border-b border-slate-200/10">
              <div className="relative inline-block">
                <img 
                  src={currentScout.Foto} 
                  alt="Avatar" 
                  className="w-20 h-20 rounded-2xl mx-auto object-cover border-2 border-teal-500 shadow-md" 
                />
                <span className="absolute -bottom-1 -right-1 p-1 bg-amber-500 rounded-full text-white" title="Anggota Aktif">
                  <Star className="w-3.5 h-3.5 fill-current" />
                </span>
              </div>
              <h4 className="font-bold text-sm mt-3">{currentScout.NamaLengkap}</h4>
              <p className="text-xs text-slate-400 font-mono mt-0.5">KTA: {currentScout.NomorKTA}</p>
              <span className="inline-block px-2 py-0.5 mt-2 text-[10px] bg-teal-500/10 text-teal-500 font-bold rounded-full">
                {currentScout.GolonganPramuka} • {currentScout.Tingkat}
              </span>
            </div>

            <div className="mt-4 space-y-3.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Regu Pramuka:</span>
                <span className="font-semibold">{currentScout.Regu || "Rajawali"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Persentase SKU:</span>
                <span className="font-semibold text-teal-500">{currentPesertaSkuPct}% ({currentPesertaSkuProgress}/{totalSkuSyllabusPoints})</span>
              </div>
              <div className="h-2 w-full bg-slate-200/50 dark:bg-slate-700/50 rounded-full overflow-hidden">
                <div className="h-full bg-teal-500 rounded-full transition-all duration-500" style={{ width: `${currentPesertaSkuPct}%` }} />
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">TKK Berhasil Diraih:</span>
                <span className="font-semibold text-amber-500 flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  {tkkAwards.filter(t => t.PesertaID === currentScout.PesertaID).length} TKK
                </span>
              </div>
              <div className="pt-2">
                <button 
                  onClick={() => onNavigate("kta")}
                  className="w-full py-2 bg-slate-500/10 hover:bg-slate-500/20 text-xs font-semibold rounded-xl text-center transition-all block"
                >
                  Tampilkan Kartu KTA Digital
                </button>
              </div>
            </div>
          </div>

          {/* Personal Badge showcase and notifications */}
          <div className={`p-5 rounded-2xl border shadow-sm lg:col-span-2 space-y-6
            ${darkTheme ? "bg-slate-800/40 border-slate-700/80" : "bg-white border-slate-200"}
          `}>
            {/* TKK Badges earned list */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3.5 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                Koleksi Tanda Kecakapan Khusus (TKK) Saya
              </h4>
              <div className="flex flex-wrap gap-3">
                {tkkAwards.filter(t => t.PesertaID === currentScout.PesertaID).length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 w-full bg-slate-500/5 rounded-xl border border-dashed border-slate-300/10">
                    Belum ada TKK yang disetujui. Selesaikan tugas dari pembina!
                  </div>
                ) : (
                  tkkAwards.filter(t => t.PesertaID === currentScout.PesertaID).map(t => (
                    <div key={t.TKKID} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/5 border border-amber-500/10">
                      <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-sm">
                        🎖️
                      </div>
                      <div>
                        <h5 className="text-[11px] font-bold leading-tight">{t.NamaTKK}</h5>
                        <span className="text-[9px] text-amber-500 font-mono uppercase">{t.Tingkatan}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick materials list */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3.5 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-teal-500" />
                Materi Latihan Pramuka Terbaru
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div 
                  onClick={() => onNavigate("materi")}
                  className="p-3 bg-slate-500/5 rounded-xl border border-slate-200/5 hover:bg-slate-500/10 transition-all cursor-pointer flex gap-3"
                >
                  <div className="w-10 h-10 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold">Materi Sandi Morse & Semaphore</h5>
                    <p className="text-[10px] text-slate-400 mt-1">Sandi & Isyarat • Google Slides</p>
                  </div>
                </div>

                <div 
                  onClick={() => onNavigate("materi")}
                  className="p-3 bg-slate-500/5 rounded-xl border border-slate-200/5 hover:bg-slate-500/10 transition-all cursor-pointer flex gap-3"
                >
                  <div className="w-10 h-10 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold">Tali Temali (Pionering)</h5>
                    <p className="text-[10px] text-slate-400 mt-1">Keterampilan • Video YouTube</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- RECENT ANNOUNCEMENTS AND LOGS (GLOBAL OVERVIEW) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Bulletin board announcements */}
        <div className="bento-card-bold lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-600" />
                Papan Pengumuman Gugus Depan
              </h4>
            </div>

            <div className="space-y-4">
              {pengumumanList.length === 0 ? (
                <div className="p-8 text-center text-xs text-stone-400">Belum ada pengumuman terbit.</div>
              ) : (
                pengumumanList.map(item => (
                  <div key={item.PengumumanID} className="p-4 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 flex gap-3 shadow-sm hover:translate-x-1 transition-all">
                    <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white shrink-0 font-bold border border-stone-950">
                      📢
                    </div>
                    <div>
                      <h5 className="text-xs font-bold leading-snug text-stone-900 dark:text-white">{item.Judul}</h5>
                      <span className="text-[9px] text-stone-500 dark:text-stone-400 font-mono mt-1 block">{item.Tanggal} • Gugus Depan</span>
                      <p className="text-xs text-stone-600 dark:text-stone-300 mt-2 leading-relaxed">{item.Isi}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Audit trails logs (visible only to admins) */}
        <div className="bento-card-bold flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-600" />
              Aktivitas Sistem Terakhir
            </h4>

            <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
              {logsList.slice(0, 5).map(log => (
                <div key={log.LogID} className="text-xs border-l-2 border-amber-600 pl-3 py-0.5 space-y-1">
                  <div className="flex justify-between font-medium">
                    <span className="text-stone-800 dark:text-stone-200 font-bold">{log.Nama}</span>
                    <span className="text-[9px] text-stone-500 font-mono">{log.Jam}</span>
                  </div>
                  <p className="text-stone-500 dark:text-stone-400 text-[11px] leading-snug">{log.Aktivitas} - {log.Keterangan}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Visual icons helper
function SparklesVisual() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full text-teal-500 fill-current">
      <path d="M50 0 L55 35 L90 40 L55 45 L50 80 L45 45 L10 40 L45 35 Z" opacity="0.1" />
      <circle cx="20" cy="20" r="4" opacity="0.15" />
      <circle cx="80" cy="70" r="6" opacity="0.15" />
    </svg>
  );
}

// Stats Card component
interface StatCardProps {
  icon: any;
  title: string;
  value: number;
  subtitle: string;
  color: string;
  darkTheme: boolean;
  onClick?: () => void;
}

function StatCard({ icon: Icon, title, value, subtitle, color, darkTheme, onClick }: StatCardProps) {
  return (
    <div 
      onClick={onClick}
      className="bento-card-bold cursor-pointer flex justify-between items-center group"
    >
      <div className="space-y-1">
        <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">{title}</span>
        <h3 className="text-4xl font-black tracking-tight text-stone-900 dark:text-white mt-1">{value}</h3>
        <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-2 font-mono">{subtitle}</p>
      </div>
      <div className={`p-3.5 rounded-xl text-white shadow-md ${color} border-2 border-stone-950 dark:border-white transition-transform group-hover:scale-105`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
}
