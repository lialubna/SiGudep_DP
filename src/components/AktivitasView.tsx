/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Plus, Trash2, Calendar, MapPin, Clock, CheckCircle, User, Award, ShieldAlert } from "lucide-react";
import { Jadwal, KalenderKegiatan, AbsensiPeserta, UserRole, Peserta } from "../types";

interface AktivitasViewProps {
  jadwalList: Jadwal[];
  kalenderList: KalenderKegiatan[];
  absensiList: AbsensiPeserta[];
  pesertaList: Peserta[];
  userRole: UserRole;
  userName: string;
  onCreateJadwal: (data: Partial<Jadwal>) => void;
  onDeleteJadwal: (id: string) => void;
  onRecordAbsensi: (data: any) => void;
  darkTheme: boolean;
}

export default function AktivitasView({
  jadwalList,
  kalenderList,
  absensiList,
  pesertaList,
  userRole,
  userName,
  onCreateJadwal,
  onDeleteJadwal,
  onRecordAbsensi,
  darkTheme
}: AktivitasViewProps) {
  const [subTab, setSubTab] = useState<"jadwal" | "kalender" | "absensi">("jadwal");
  
  // Schedule creation states
  const [showAddJadwal, setShowAddJadwal] = useState(false);
  const [newJadwal, setNewJadwal] = useState({
    Judul: "", Tanggal: new Date().toISOString().split("T")[0], Jam: "14:00 - 16:00", Lokasi: "Lapangan Sekolah", Deskripsi: ""
  });

  // GPS Attendance Simulation states
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkInSuccess, setCheckInSuccess] = useState(false);

  const handleCreateJadwal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJadwal.Judul) return;
    onCreateJadwal({
      ...newJadwal,
      CreatedBy: userName
    });
    setShowAddJadwal(false);
    setNewJadwal({ Judul: "", Tanggal: new Date().toISOString().split("T")[0], Jam: "14:00 - 16:00", Lokasi: "Lapangan Sekolah", Deskripsi: "" });
  };

  // Mock checking-in GPS
  const triggerGpsCheckIn = () => {
    setCheckingIn(true);
    setTimeout(() => {
      onRecordAbsensi({
        PesertaID: "pes-ahmad-1", // default logged in student
        Tanggal: new Date().toISOString().split("T")[0],
        JamMasuk: new Date().toLocaleTimeString("id-ID"),
        Status: "Hadir",
        Latitude: -6.17511 + (Math.random() - 0.5) * 0.001,
        Longitude: 106.865039 + (Math.random() - 0.5) * 0.001,
        Lokasi: "SMP Negeri 1 Jakarta (Pramuka Center)",
        PembinaID: "pem-budi-1"
      });
      setCheckingIn(false);
      setCheckInSuccess(true);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Tab bar header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans">Jadwal Latihan & Absensi GPS</h2>
          <p className="text-xs text-slate-400 mt-1 font-sans">Pantau agenda kegiatan Gugus Depan dan amati absensi berbasis GPS.</p>
        </div>
        <div className="flex gap-1 bg-slate-500/10 p-1 rounded-xl border border-slate-300/10 self-start sm:self-auto">
          <button
            onClick={() => setSubTab("jadwal")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5
              ${subTab === "jadwal" ? "bg-teal-500 text-white shadow" : "text-slate-400 hover:text-slate-600"}`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Jadwal Latihan</span>
          </button>
          <button
            onClick={() => setSubTab("kalender")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5
              ${subTab === "kalender" ? "bg-teal-500 text-white shadow" : "text-slate-400 hover:text-slate-600"}`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Kalender Visual</span>
          </button>
          <button
            onClick={() => setSubTab("absensi")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5
              ${subTab === "absensi" ? "bg-teal-500 text-white shadow" : "text-slate-400 hover:text-slate-600"}`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Presensi GPS</span>
          </button>
        </div>
      </div>

      {/* SUB TAB 1: SCHEDULES LIST */}
      {subTab === "jadwal" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create form panel (Admins only) */}
          {["SUPER_ADMIN", "ADMIN", "PEMBINA"].includes(userRole) && (
            <div className={`p-5 rounded-2xl border shadow-sm h-fit space-y-4
              ${darkTheme ? "bg-slate-800/40 border-slate-700/80" : "bg-white border-slate-200"}`}
            >
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rilis Jadwal Latihan Baru</h4>
              <form onSubmit={handleCreateJadwal} className="space-y-3.5 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-400">Judul Kegiatan</label>
                  <input
                    type="text"
                    placeholder="Contoh: Latihan Tali Temali..."
                    value={newJadwal.Judul}
                    onChange={(e) => setNewJadwal(prev => ({ ...prev, Judul: e.target.value }))}
                    className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-teal-500
                      ${darkTheme ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-400">Tanggal Kegiatan</label>
                  <input
                    type="date"
                    value={newJadwal.Tanggal}
                    onChange={(e) => setNewJadwal(prev => ({ ...prev, Tanggal: e.target.value }))}
                    className={`w-full px-3 py-2 text-xs rounded-xl border
                      ${darkTheme ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-400">Waktu / Jam</label>
                  <input
                    type="text"
                    value={newJadwal.Jam}
                    onChange={(e) => setNewJadwal(prev => ({ ...prev, Jam: e.target.value }))}
                    className={`w-full px-3 py-2 text-xs rounded-xl border
                      ${darkTheme ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-400">Lokasi Latihan</label>
                  <input
                    type="text"
                    value={newJadwal.Lokasi}
                    onChange={(e) => setNewJadwal(prev => ({ ...prev, Lokasi: e.target.value }))}
                    className={`w-full px-3 py-2 text-xs rounded-xl border
                      ${darkTheme ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-400">Deskripsi / Tugas Mandiri</label>
                  <textarea
                    placeholder="Tuliskan detail perlengkapan yang wajib dibawa..."
                    value={newJadwal.Deskripsi}
                    onChange={(e) => setNewJadwal(prev => ({ ...prev, Deskripsi: e.target.value }))}
                    className={`w-full px-3 py-2 text-xs rounded-xl border
                      ${darkTheme ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`}
                    rows={3}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-xl shadow transition-colors"
                >
                  Terbitkan Jadwal Latihan
                </button>
              </form>
            </div>
          )}

          {/* Schedules list overview */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Jadwal Latihan Mendatang</h4>
            {jadwalList.length === 0 ? (
              <p className="text-slate-400 text-center py-10">Belum ada rilis jadwal latihan terbaru.</p>
            ) : (
              jadwalList.map(item => (
                <div 
                  key={item.JadwalID}
                  className={`p-5 rounded-2xl border shadow-sm space-y-3 relative overflow-hidden group
                    ${darkTheme ? "bg-slate-800/40 border-slate-700/80" : "bg-white border-slate-200"}`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="text-[10px] bg-teal-500/10 text-teal-500 font-bold px-2 py-0.5 rounded-full border border-teal-500/20 uppercase">
                        Rutin
                      </span>
                      <h5 className="font-bold text-sm mt-1.5 leading-snug">{item.Judul}</h5>
                    </div>
                    {["SUPER_ADMIN", "ADMIN"].includes(userRole) && (
                      <button
                        onClick={() => onDeleteJadwal(item.JadwalID)}
                        className="p-1.5 rounded-lg border border-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                        title="Hapus Jadwal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">{item.Deskripsi}</p>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-400 border-t border-slate-200/10 pt-3 font-mono">
                    <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-teal-500" /> {item.Tanggal}</span>
                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-teal-500" /> {item.Jam}</span>
                    <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-teal-500" /> {item.Lokasi}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SUB TAB 2: VISUAL MONTHLY CALENDAR GRID (JULY 2026) */}
      {subTab === "kalender" && (
        <div className={`p-5 rounded-3xl border shadow-sm space-y-4
          ${darkTheme ? "bg-slate-800/40 border-slate-700/80" : "bg-white border-slate-200"}`}
        >
          {/* Month Indicator header */}
          <div className="flex justify-between items-center pb-3 border-b border-slate-200/10 text-sm">
            <span className="font-bold text-base">Kalender Kegiatan • Juli 2026</span>
            <span className="text-xs font-mono text-slate-400">Mode Bulanan</span>
          </div>

          {/* 7 Columns Day headings */}
          <div className="grid grid-cols-7 gap-1.5 text-center font-bold text-xs text-slate-400 font-mono">
            <span>Min</span><span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span><span>Jum</span><span>Sab</span>
          </div>

          {/* Grid visual calendar days representing July 2026 */}
          {/* Note: July 2026 starts on Wednesday (3 empty spots) */}
          <div className="grid grid-cols-7 gap-2">
            <span className="h-14 sm:h-20" />{/* Mon empty */}
            <span className="h-14 sm:h-20" />{/* Tue empty */}
            <span className="h-14 sm:h-20" />{/* Wed empty */}

            {/* Generated calendar blocks with static custom events */}
            {Array.from({ length: 31 }, (_, i) => {
              const day = i + 1;
              const hasRutin = day === 17;
              const hasPersami = day === 25 || day === 26;
              
              return (
                <div 
                  key={day}
                  className={`h-14 sm:h-20 p-1.5 rounded-xl border flex flex-col justify-between text-xs transition-colors relative
                    ${darkTheme ? "bg-slate-800/20 border-slate-700/50 hover:bg-slate-800/40" : "bg-slate-50 border-slate-200 hover:bg-slate-100"}
                  `}
                >
                  <span className="font-bold font-mono text-slate-400">{day}</span>
                  
                  {/* Event labels */}
                  {hasRutin && (
                    <span className="block px-1 py-0.5 rounded text-[8px] sm:text-[9px] bg-teal-500 text-white font-bold truncate">
                      Latihan Rutin
                    </span>
                  )}
                  {hasPersami && (
                    <span className="block px-1 py-0.5 rounded text-[8px] sm:text-[9px] bg-amber-500 text-white font-bold truncate">
                      PERSAMI
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB TAB 3: GPS ATTENDANCE CHECK-IN PORTAL */}
      {subTab === "absensi" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Student/User checking portal card */}
          <div className={`p-5 rounded-2xl border shadow-sm flex flex-col items-center justify-center text-center space-y-4
            ${darkTheme ? "bg-slate-800/40 border-slate-700/80" : "bg-white border-slate-200"}`}
          >
            <div className="w-14 h-14 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-500">
              <MapPin className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-sm">Presensi Kehadiran Latihan Rutin</h4>
              <p className="text-xs text-slate-400 max-w-xs">
                Aplikasi mendeteksi koordinat Anda secara realtime. Pastikan Anda berada dalam radius sekolah.
              </p>
            </div>

            {/* Check-In Action simulation triggers */}
            {checkInSuccess ? (
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-2 text-xs">
                <CheckCircle className="w-4 h-4" />
                <span>Presensi Anda Berhasil Dicatat!</span>
              </div>
            ) : (
              <button
                disabled={checkingIn}
                onClick={triggerGpsCheckIn}
                className="w-full py-2.5 bg-teal-500 hover:bg-teal-600 text-white text-xs font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                {checkingIn ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Memperoleh Lokasi GPS...</span>
                  </>
                ) : (
                  <>
                    <MapPin className="w-4 h-4" />
                    <span>Lakukan Absensi Masuk</span>
                  </>
                )}
              </button>
            )}

            <div className="text-[10px] text-slate-400 font-mono">
              Radius Toleransi: 100m • GPS Aktif
            </div>
          </div>

          {/* Historical attendance logs for the entire unit */}
          <div className={`p-5 rounded-2xl border shadow-sm lg:col-span-2 space-y-4
            ${darkTheme ? "bg-slate-800/40 border-slate-700/80" : "bg-white border-slate-200"}`}
          >
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rekapitulasi Kehadiran Peserta Latihan</h4>
            <div className="space-y-3.5 max-h-[250px] overflow-y-auto pr-1">
              {absensiList.map(item => {
                const peserta = pesertaList.find(p => p.PesertaID === item.PesertaID) || { NamaLengkap: "Ahmad Fauzi", Foto: "" };
                return (
                  <div 
                    key={item.AbsensiID}
                    className="p-3 rounded-xl bg-slate-500/5 border border-slate-200/5 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold text-xs">
                        {peserta.NamaLengkap[0]}
                      </div>
                      <div className="text-xs">
                        <span className="font-bold block">{peserta.NamaLengkap}</span>
                        <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-red-500" /> Lat: {item.Latitude?.toFixed(4)}, Long: {item.Longitude?.toFixed(4)}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-mono text-slate-400 block">{item.Tanggal} • {item.JamMasuk}</span>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[9px] font-bold rounded-full bg-emerald-500/10 text-emerald-500">
                        Hadir GPS
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
