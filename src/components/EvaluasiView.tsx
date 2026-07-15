/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Plus, BookOpen, Smile, FileText, CheckCircle, Award, Star, BarChart } from "lucide-react";
import { RefleksiSiswa, PenilaianSikap, Peserta, UserRole } from "../types";

interface EvaluasiViewProps {
  refleksiList: RefleksiSiswa[];
  penilaianList: PenilaianSikap[];
  pesertaList: Peserta[];
  userRole: UserRole;
  userName: string;
  onSubmitRefleksi: (data: Partial<RefleksiSiswa>) => void;
  onSubmitPenilaian: (data: Partial<PenilaianSikap>) => void;
  darkTheme: boolean;
}

export default function EvaluasiView({
  refleksiList,
  penilaianList,
  pesertaList,
  userRole,
  userName,
  onSubmitRefleksi,
  onSubmitPenilaian,
  darkTheme
}: EvaluasiViewProps) {
  const [subTab, setSubTab] = useState<"refleksi" | "sikap">("refleksi");

  // Reflection form
  const [refleksiText, setRefleksiText] = useState("");
  const [refleksiSuccess, setRefleksiSuccess] = useState(false);

  // Penilaian form
  const [selectedPesertaId, setSelectedPesertaId] = useState("");
  const [periode, setPeriode] = useState<"Mingguan" | "Bulanan" | "Semester" | "Tahunan">("Bulanan");
  const [ratings, setRatings] = useState({
    Disiplin: 4, TanggungJawab: 4, KerjaSama: 4, Kepemimpinan: 4, Kemandirian: 4, Keaktifan: 4
  });
  const [catatan, setCatatan] = useState("");
  const [penilaianSuccess, setPenilaianSuccess] = useState(false);

  // Submit Reflection (Scout only)
  const handleRefleksiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refleksiText) return;
    onSubmitRefleksi({
      PesertaID: "pes-ahmad-1", // default logged in scout
      Tanggal: new Date().toISOString().split("T")[0],
      Isi: refleksiText
    });
    setRefleksiText("");
    setRefleksiSuccess(true);
    setTimeout(() => setRefleksiSuccess(false), 3000);
  };

  // Submit Attitude valuation (Pembina only)
  const handlePenilaianSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPesertaId) {
      alert("Pilih peserta terlebih dahulu!");
      return;
    }
    onSubmitPenilaian({
      PesertaID: selectedPesertaId,
      PembinaID: "pem-budi-1",
      Periode: periode,
      Tanggal: new Date().toISOString().split("T")[0],
      ...ratings,
      Catatan: catatan
    });
    setPenilaianSuccess(true);
    setCatatan("");
    setTimeout(() => setPenilaianSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Tab bar header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans">Refleksi Mandiri & Penilaian Karakter</h2>
          <p className="text-xs text-slate-400 mt-1 font-sans">Lengkapi jurnal refleksi mingguan dan lakukan evaluasi sikap berkala bagi seluruh anggota.</p>
        </div>
        <div className="flex gap-1 bg-slate-500/10 p-1 rounded-xl border border-slate-300/10 self-start sm:self-auto">
          <button
            onClick={() => setSubTab("refleksi")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5
              ${subTab === "refleksi" ? "bg-teal-500 text-white shadow" : "text-slate-400 hover:text-slate-600"}`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Refleksi Latihan</span>
          </button>
          <button
            onClick={() => setSubTab("sikap")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5
              ${subTab === "sikap" ? "bg-teal-500 text-white shadow" : "text-slate-400 hover:text-slate-600"}`}
          >
            <Smile className="w-3.5 h-3.5" />
            <span>Penilaian Sikap</span>
          </button>
        </div>
      </div>

      {/* SUB TAB 1: REFLEKSI SECTION */}
      {subTab === "refleksi" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Write reflection card (Scouts only) */}
          {userRole === "PESERTA_DIDIK" ? (
            <div className={`p-5 rounded-2xl border shadow-sm space-y-4 h-fit
              ${darkTheme ? "bg-slate-800/40 border-slate-700/80" : "bg-white border-slate-200"}`}
            >
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tulis Jurnal Refleksi Hari Ini</h4>
              {refleksiSuccess ? (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl text-xs flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" /> Jurnal Refleksi Berhasil Dikirim!
                </div>
              ) : (
                <form onSubmit={handleRefleksiSubmit} className="space-y-3.5 text-xs">
                  <textarea
                    placeholder="Tuliskan pengalaman latihan hari ini, simpul baru apa yang dipelajari, hambatan regu, serta perasaanmu..."
                    value={refleksiText}
                    onChange={(e) => setRefleksiText(e.target.value)}
                    className={`w-full px-3 py-2.5 text-xs rounded-xl border focus:ring-2 focus:ring-teal-500
                      ${darkTheme ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-800"}`}
                    rows={4}
                    required
                  />
                  <button
                    type="submit"
                    className="w-full py-2 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-xl shadow transition-colors"
                  >
                    Kirim Refleksi Saya
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div className={`p-5 rounded-2xl border shadow-sm space-y-4 h-fit text-center
              ${darkTheme ? "bg-slate-800/40 border-slate-700/80" : "bg-white border-slate-200"}`}
            >
              <div className="w-12 h-12 rounded-full bg-slate-500/10 text-slate-400 flex items-center justify-center mx-auto text-xl">
                📝
              </div>
              <h4 className="font-bold text-xs">Log Jurnal Refleksi</h4>
              <p className="text-xs text-slate-400">
                Menu submit refleksi mandiri hanya tersedia bagi akun dengan peranan perorangan <strong>Peserta Didik</strong>.
              </p>
            </div>
          )}

          {/* List of submissions */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kumpulan Refleksi Anggota Terbaru</h4>
            <div className="space-y-3.5 max-h-[400px] overflow-y-auto pr-1">
              {refleksiList.map(item => {
                const peserta = pesertaList.find(p => p.PesertaID === item.PesertaID) || { NamaLengkap: "Ahmad Fauzi", Foto: "" };
                return (
                  <div 
                    key={item.RefleksiID}
                    className={`p-4 rounded-2xl border shadow-sm space-y-2
                      ${darkTheme ? "bg-slate-800/40 border-slate-700/80" : "bg-white border-slate-200"}`}
                  >
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200/10 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-teal-400">{peserta.NamaLengkap}</span>
                        <span className="text-[10px] text-slate-400 font-mono">Regu: Rajawali</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{item.Tanggal}</span>
                    </div>
                    <p className="text-xs text-slate-300 italic leading-relaxed">"{item.Isi}"</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUB TAB 2: PENILAIAN SIKAP SECTION */}
      {subTab === "sikap" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ratings Creator form (Pembina only) */}
          {["SUPER_ADMIN", "ADMIN", "PEMBINA"].includes(userRole) ? (
            <div className={`p-5 rounded-2xl border shadow-sm space-y-4 h-fit
              ${darkTheme ? "bg-slate-800/40 border-slate-700/80" : "bg-white border-slate-200"}`}
            >
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Formulir Penilaian Karakter</h4>
              {penilaianSuccess ? (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl text-xs flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" /> Evaluasi Karakter Berhasil Disimpan!
                </div>
              ) : (
                <form onSubmit={handlePenilaianSubmit} className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-400">Pilih Peserta Didik *</label>
                    <select
                      value={selectedPesertaId}
                      onChange={(e) => setSelectedPesertaId(e.target.value)}
                      className={`w-full px-3 py-1.5 text-xs rounded-xl border
                        ${darkTheme ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`}
                      required
                    >
                      <option value="">Pilih Anggota...</option>
                      {pesertaList.map(p => (
                        <option key={p.PesertaID} value={p.PesertaID}>{p.NamaLengkap} ({p.NomorKTA})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-400">Periode Penilaian</label>
                    <select
                      value={periode}
                      onChange={(e) => setPeriode(e.target.value as any)}
                      className={`w-full px-3 py-1.5 text-xs rounded-xl border
                        ${darkTheme ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`}
                    >
                      <option value="Mingguan">Mingguan</option>
                      <option value="Bulanan">Bulanan</option>
                      <option value="Semester">Semester</option>
                      <option value="Tahunan">Tahunan</option>
                    </select>
                  </div>

                  {/* 6 Slider indicators */}
                  <div className="space-y-3 pt-2">
                    <SliderRating label="1. Disiplin (Kerapihan, Tepat Waktu)" val={ratings.Disiplin} onChange={(val) => setRatings(p => ({ ...p, Disiplin: val }))} />
                    <SliderRating label="2. Tanggung Jawab (Tugas Regu)" val={ratings.TanggungJawab} onChange={(val) => setRatings(p => ({ ...p, TanggungJawab: val }))} />
                    <SliderRating label="3. Kerja Sama (Kerjasama Kelompok)" val={ratings.KerjaSama} onChange={(val) => setRatings(p => ({ ...p, KerjaSama: val }))} />
                    <SliderRating label="4. Kepemimpinan (Memimpin Forum)" val={ratings.Kepemimpinan} onChange={(val) => setRatings(p => ({ ...p, Kepemimpinan: val }))} />
                    <SliderRating label="5. Kemandirian (Percaya Diri)" val={ratings.Kemandirian} onChange={(val) => setRatings(p => ({ ...p, Kemandirian: val }))} />
                    <SliderRating label="6. Keaktifan (Kehadiran Latihan)" val={ratings.Keaktifan} onChange={(val) => setRatings(p => ({ ...p, Keaktifan: val }))} />
                  </div>

                  <div className="space-y-1 pt-2">
                    <label className="font-semibold text-slate-400">Catatan Pembinaan / Evaluasi</label>
                    <textarea
                      placeholder="Contoh: Sangat baik dalam regu, keberanian memimpin perlu diasah lagi..."
                      value={catatan}
                      onChange={(e) => setCatatan(e.target.value)}
                      className={`w-full px-3 py-2 text-xs rounded-xl border
                        ${darkTheme ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`}
                      rows={2}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-xl shadow transition-colors"
                  >
                    Simpan Nilai Karakter
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div className={`p-5 rounded-2xl border shadow-sm space-y-4 h-fit text-center
              ${darkTheme ? "bg-slate-800/40 border-slate-700/80" : "bg-white border-slate-200"}`}
            >
              <div className="w-12 h-12 rounded-full bg-slate-500/10 text-slate-400 flex items-center justify-center mx-auto text-xl">
                🛡️
              </div>
              <h4 className="font-bold text-xs">Penilaian Karakter Berkala</h4>
              <p className="text-xs text-slate-400">
                Menu pengisian penilaian sikap berkala ini khusus dibatasi bagi akun dengan peranan <strong>Pembina</strong> atau <strong>Super Admin</strong>.
              </p>
            </div>
          )}

          {/* List of score reviews */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Histori Nilai Karakter Anggota</h4>
            <div className="space-y-3.5 max-h-[450px] overflow-y-auto pr-1">
              {penilaianList.map(item => {
                const peserta = pesertaList.find(p => p.PesertaID === item.PesertaID) || { NamaLengkap: "Ahmad Fauzi" };
                return (
                  <div 
                    key={item.PenilaianID}
                    className={`p-4 rounded-3xl border shadow-sm space-y-3
                      ${darkTheme ? "bg-slate-800/40 border-slate-700/80" : "bg-white border-slate-200"}`}
                  >
                    <div className="flex justify-between items-center border-b border-slate-200/10 pb-2">
                      <div>
                        <h5 className="font-bold text-xs text-teal-400">{peserta.NamaLengkap}</h5>
                        <span className="text-[10px] text-slate-400 font-mono">Periode: {item.Periode} • {item.Tanggal}</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-teal-500 text-white text-[10px] font-bold">
                        {item.Kategori} ({item.NilaiRataRata}/5)
                      </span>
                    </div>

                    {/* Bento score indicator blocks */}
                    <div className="grid grid-cols-3 gap-2 text-[10px] text-center pt-1 font-semibold">
                      <div className="p-2 bg-slate-500/5 rounded-xl border border-slate-300/10">
                        <span className="text-slate-400 block">Disiplin</span>
                        <span className="text-sm font-bold text-teal-500">{item.Disiplin}/5</span>
                      </div>
                      <div className="p-2 bg-slate-500/5 rounded-xl border border-slate-300/10">
                        <span className="text-slate-400 block">Tanggung Jawab</span>
                        <span className="text-sm font-bold text-teal-500">{item.TanggungJawab}/5</span>
                      </div>
                      <div className="p-2 bg-slate-500/5 rounded-xl border border-slate-300/10">
                        <span className="text-slate-400 block">Kerja Sama</span>
                        <span className="text-sm font-bold text-teal-500">{item.KerjaSama}/5</span>
                      </div>
                      <div className="p-2 bg-slate-500/5 rounded-xl border border-slate-300/10">
                        <span className="text-slate-400 block">Kepemimpinan</span>
                        <span className="text-sm font-bold text-teal-500">{item.Kepemimpinan}/5</span>
                      </div>
                      <div className="p-2 bg-slate-500/5 rounded-xl border border-slate-300/10">
                        <span className="text-slate-400 block">Kemandirian</span>
                        <span className="text-sm font-bold text-teal-500">{item.Kemandirian}/5</span>
                      </div>
                      <div className="p-2 bg-slate-500/5 rounded-xl border border-slate-300/10">
                        <span className="text-slate-400 block">Keaktifan</span>
                        <span className="text-sm font-bold text-teal-500">{item.Keaktifan}/5</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-normal italic border-t border-slate-200/10 pt-2">
                      Catatan Kakak: "{item.Catatan}"
                    </p>
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

// Interactive custom slider rating
interface SliderRatingProps {
  label: string;
  val: number;
  onChange: (val: number) => void;
}

function SliderRating({ label, val, onChange }: SliderRatingProps) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[11px] font-semibold text-slate-400">
        <span>{label}</span>
        <span className="text-teal-500 font-bold">{val}/5</span>
      </div>
      <input
        type="range"
        min="1"
        max="5"
        value={val}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
      />
    </div>
  );
}
