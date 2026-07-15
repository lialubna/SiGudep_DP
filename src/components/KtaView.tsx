/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { CreditCard, Printer, ShieldCheck, Download, Award, CheckCircle } from "lucide-react";
import { Peserta } from "../types";

interface KtaViewProps {
  pesertaList: Peserta[];
  darkTheme: boolean;
}

export default function KtaView({ pesertaList, darkTheme }: KtaViewProps) {
  const [selectedPesertaId, setSelectedPesertaId] = useState(pesertaList[0]?.PesertaID || "");
  const selectedPeserta = pesertaList.find(p => p.PesertaID === selectedPesertaId) || pesertaList[0];

  if (!selectedPeserta) {
    return <p className="text-slate-400 text-center py-10">Belum ada data anggota untuk membuat KTA.</p>;
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans">Kartu Tanda Anggota (KTA) Elektronik</h2>
          <p className="text-xs text-slate-400 mt-1 font-sans">Unduh atau cetak KTA Pramuka resmi lengkap dengan identitas barcode.</p>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedPesertaId}
            onChange={(e) => setSelectedPesertaId(e.target.value)}
            className={`px-3 py-1.5 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-teal-500
              ${darkTheme ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-200 text-slate-800"}`}
          >
            {pesertaList.map(p => (
              <option key={p.PesertaID} value={p.PesertaID}>{p.NamaLengkap}</option>
            ))}
          </select>
          <button
            onClick={handlePrint}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-teal-500 text-white hover:bg-teal-600 transition-all flex items-center gap-1.5 shadow-md shadow-teal-500/10"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak KTA</span>
          </button>
        </div>
      </div>

      {/* Main card viewport */}
      <div className="flex flex-col xl:flex-row gap-6 justify-center items-center py-4">
        {/* FRONT SIDE */}
        <div id="kta-front" className="w-[380px] h-[240px] rounded-2xl bg-gradient-to-br from-teal-900 via-teal-800 to-emerald-900 border border-teal-500/30 p-5 flex flex-col justify-between text-white relative overflow-hidden shadow-2xl shrink-0">
          {/* Decorative scout badge backdrop */}
          <div className="absolute right-[-20px] bottom-[-20px] opacity-10 text-9xl">
            ⚜
          </div>

          {/* Top heading banner */}
          <div className="flex items-center justify-between border-b border-white/20 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚜</span>
              <div className="text-[9px] uppercase tracking-wider font-bold leading-tight">
                <span className="block text-teal-400">Gugus Depan Pramuka</span>
                <span>SMP Negeri 1 Jakarta</span>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold text-teal-400 uppercase tracking-widest">KTA</span>
          </div>

          {/* Central ID Details */}
          <div className="flex gap-4 items-center flex-1 py-2">
            <img 
              src={selectedPeserta.Foto || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"} 
              alt="Profil Picture" 
              className="w-16 h-20 rounded-lg object-cover border-2 border-white/20 shadow-md"
            />
            <div className="space-y-1 text-xs">
              <div>
                <span className="text-[8px] text-slate-300 block font-bold uppercase tracking-wider">Nama Lengkap</span>
                <span className="font-bold text-sm tracking-wide text-teal-300">{selectedPeserta.NamaLengkap}</span>
              </div>
              <div>
                <span className="text-[8px] text-slate-300 block font-bold uppercase tracking-wider">Nomor KTA Gudep</span>
                <span className="font-bold font-mono tracking-wider">{selectedPeserta.NomorKTA}</span>
              </div>
              <div>
                <span className="text-[8px] text-slate-300 block font-bold uppercase tracking-wider">Tingkat • Golongan</span>
                <span className="font-semibold text-xs text-amber-400">{selectedPeserta.Tingkat} • {selectedPeserta.GolonganPramuka}</span>
              </div>
            </div>
          </div>

          {/* Footer Barcode & Signature */}
          <div className="flex items-end justify-between border-t border-white/15 pt-2.5">
            {/* Barcode line representation using pure flex divs */}
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-[1.5px] h-4 bg-white/90 px-1 py-0.5 rounded">
                <span className="w-[1px] h-full bg-slate-900" />
                <span className="w-[2px] h-full bg-slate-900" />
                <span className="w-[1px] h-full bg-slate-900" />
                <span className="w-[3px] h-full bg-slate-900" />
                <span className="w-[1px] h-full bg-slate-900" />
                <span className="w-[2px] h-full bg-slate-900" />
                <span className="w-[1px] h-full bg-slate-900" />
                <span className="w-[1px] h-full bg-slate-900" />
                <span className="w-[3px] h-full bg-slate-900" />
              </div>
              <span className="text-[7px] font-mono text-center block text-slate-300 tracking-wider">*{selectedPeserta.PesertaID}*</span>
            </div>

            <div className="text-[8px] text-right font-mono font-semibold">
              <span className="block text-slate-300">Berlaku Selama Menjadi Anggota</span>
            </div>
          </div>
        </div>

        {/* BACK SIDE */}
        <div id="kta-back" className="w-[380px] h-[240px] rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/80 p-5 flex flex-col justify-between text-white relative shadow-2xl shrink-0">
          <div className="space-y-2 text-xs">
            <h5 className="font-bold border-b border-slate-700 pb-1.5 uppercase text-[10px] tracking-wider text-teal-400">Ketentuan Penggunaan KTA</h5>
            <ol className="list-decimal pl-4 text-[8px] text-slate-400 space-y-1">
              <li>Kartu ini adalah milik resmi Gugus Depan Pramuka SMP Negeri 1 Jakarta.</li>
              <li>Wajib dibawa selama latihan rutin, perkemahan, dan upacara kepramukaan resmi.</li>
              <li>Jika menemukan kartu ini, harap mengembalikan ke Sekretariat Gudep atau pihak sekolah.</li>
              <li>Penyalahgunaan kartu ini akan dikenai sanksi kedisiplinan Gerakan Pramuka.</li>
            </ol>
          </div>

          <div className="flex justify-between items-end border-t border-slate-700 pt-3">
            {/* Dynamic QR Code Render */}
            <div className="p-1 bg-white rounded-lg">
              <div className="w-11 h-11 border-[3px] border-slate-900 flex flex-wrap p-0.5 gap-0.5">
                <div className="w-3.5 h-3.5 bg-slate-900" />
                <div className="w-3.5 h-3.5 bg-slate-900" />
                <div className="w-3.5 h-3.5 bg-slate-900" />
                <div className="w-3.5 h-3.5 bg-slate-900" />
              </div>
            </div>

            <div className="text-center">
              <p className="text-[8px] text-slate-400 mb-6">Pembina Gugus Depan</p>
              <span className="block text-[10px] font-bold text-teal-400 underline font-sans">Kakak Budi Utomo, S.Pd.</span>
              <span className="block text-[7px] font-mono text-slate-400">NTA. 31.71.05.0001</span>
            </div>
          </div>
        </div>
      </div>

      {/* Guide text */}
      <div className={`p-4 rounded-xl border flex items-start gap-3 text-xs max-w-2xl mx-auto
        ${darkTheme ? "bg-slate-800/40 border-slate-700/80" : "bg-white border-slate-200"}`}
      >
        <ShieldCheck className="w-5 h-5 text-teal-500 shrink-0" />
        <div className="space-y-1">
          <span className="font-bold block text-teal-400">Tips Cetak KTA Pramuka</span>
          <p className="text-slate-400 leading-normal">
            Klik tombol <strong>Cetak KTA</strong> di kanan atas untuk memicu dialog cetak browser Anda. Gunakan kertas karton tebal/PVC berukuran standard ID Card (8.5cm x 5.4cm) dengan layout landscape untuk hasil yang maksimal.
          </p>
        </div>
      </div>

    </div>
  );
}
