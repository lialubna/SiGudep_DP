/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Plus, Trash2, Search, BookOpen, Link, Video, FileText, X } from "lucide-react";
import { Materi, UserRole } from "../types";

interface MateriViewProps {
  materiList: Materi[];
  userRole: UserRole;
  onCreateMateri: (data: Partial<Materi>) => void;
  onDeleteMateri: (id: string) => void;
  darkTheme: boolean;
}

export default function MateriView({
  materiList,
  userRole,
  onCreateMateri,
  onDeleteMateri,
  darkTheme
}: MateriViewProps) {
  const [search, setSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Materi>>({
    Judul: "", Kategori: "Teknik Kepramukaan", JenisFile: "Google Slides", Link: "", Deskripsi: ""
  });

  const filteredMateri = materiList.filter(m => 
    m.Judul.toLowerCase().includes(search.toLowerCase()) || 
    m.Kategori.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.Judul || !formData.Link) return;
    onCreateMateri({
      ...formData,
      Tanggal: new Date().toISOString().split("T")[0],
      PembinaID: "pem-budi-1"
    });
    setShowAddForm(false);
    setFormData({ Judul: "", Kategori: "Teknik Kepramukaan", JenisFile: "Google Slides", Link: "", Deskripsi: "" });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans">Koleksi Materi Latihan Pramuka</h2>
          <p className="text-xs text-slate-400 mt-1 font-sans">Pusat bacaan sandi-sandi, simpul ikatan pionering, dan rujukan SKU pramuka.</p>
        </div>
        {["SUPER_ADMIN", "ADMIN", "PEMBINA"].includes(userRole) && (
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-teal-500 text-white hover:bg-teal-600 transition-all flex items-center gap-1.5 shadow-md shadow-teal-500/10"
          >
            <Plus className="w-4 h-4" />
            <span>Terbitkan Materi</span>
          </button>
        )}
      </div>

      {/* Search Filter */}
      <div className={`p-4 rounded-2xl border flex items-center
        ${darkTheme ? "bg-slate-800/40 border-slate-700/80" : "bg-white border-slate-200"}`}
      >
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari materi berdasarkan Judul, Kategori, atau Golongan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full pl-9 pr-4 py-1.5 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-teal-500
              ${darkTheme ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-800"}`}
          />
        </div>
      </div>

      {/* Materi Cards grid list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredMateri.map(item => {
          const isVideo = item.JenisFile === "Video YouTube";
          return (
            <div 
              key={item.MateriID}
              className={`p-5 rounded-2xl border shadow-sm space-y-4 flex flex-col justify-between group relative
                ${darkTheme ? "bg-slate-800/40 border-slate-700/80" : "bg-white border-slate-200"}`}
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 font-bold text-[9px] uppercase">
                      {item.Kategori}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{item.Tanggal}</span>
                  </div>
                  {["SUPER_ADMIN", "ADMIN", "PEMBINA"].includes(userRole) && (
                    <button
                      onClick={() => onDeleteMateri(item.MateriID)}
                      className="p-1 rounded text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <h4 className="font-bold text-sm leading-snug">{item.Judul}</h4>
                <p className="text-xs text-slate-400 leading-relaxed max-h-16 overflow-hidden text-ellipsis line-clamp-3">
                  {item.Deskripsi}
                </p>
              </div>

              {/* Simulation Embed or link preview */}
              <div className="p-3.5 rounded-xl bg-slate-500/5 border border-slate-200/5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  {isVideo ? <Video className="w-4 h-4 text-red-500" /> : <FileText className="w-4 h-4 text-blue-500" />}
                  <span className="font-semibold text-[11px] truncate max-w-[120px]">{item.JenisFile}</span>
                </div>
                <a 
                  href={item.Link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-teal-500 hover:text-teal-600 font-bold text-[10px] flex items-center gap-1"
                >
                  <Link className="w-3 h-3" />
                  <span>Buka Tautan</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* --- ADD MATERI FORM MODAL --- */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-2xl p-6 shadow-2xl animate-fade-in flex flex-col
            ${darkTheme ? "bg-slate-900 border border-slate-800 text-white" : "bg-white text-slate-800"}`}
          >
            <div className="flex justify-between items-center pb-4 border-b border-slate-200/10">
              <h3 className="font-bold text-base font-sans">Terbitkan Materi Latihan Baru</h3>
              <button onClick={() => setShowAddForm(false)} className="p-1 rounded-lg hover:bg-slate-100/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="py-4 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Judul Rujukan Materi *</label>
                <input
                  type="text"
                  placeholder="Contoh: Peta Kompas dan Navigasi Rimba"
                  value={formData.Judul}
                  onChange={(e) => setFormData(prev => ({ ...prev, Judul: e.target.value }))}
                  className={`w-full px-3 py-2 text-xs rounded-xl border focus:ring-2 focus:ring-teal-500
                    ${darkTheme ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-800"}`}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Kategori</label>
                  <input
                    type="text"
                    placeholder="Contoh: Sandi Morse, Pionering"
                    value={formData.Kategori}
                    onChange={(e) => setFormData(prev => ({ ...prev, Kategori: e.target.value }))}
                    className={`w-full px-3 py-2 text-xs rounded-xl border
                      ${darkTheme ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Format File</label>
                  <select
                    value={formData.JenisFile}
                    onChange={(e) => setFormData(prev => ({ ...prev, JenisFile: e.target.value as any }))}
                    className={`w-full px-3 py-2 text-xs rounded-xl border
                      ${darkTheme ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`}
                  >
                    <option value="Google Slides">Google Slides</option>
                    <option value="Google Docs">Google Docs</option>
                    <option value="Google PDF">Google PDF</option>
                    <option value="Video YouTube">Video YouTube</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Tautan Link File / Video *</label>
                <input
                  type="url"
                  placeholder="https://docs.google.com/..."
                  value={formData.Link}
                  onChange={(e) => setFormData(prev => ({ ...prev, Link: e.target.value }))}
                  className={`w-full px-3 py-2 text-xs rounded-xl border
                    ${darkTheme ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Deskripsi Ringkas</label>
                <textarea
                  placeholder="Deskripsikan isi bahasan materi latihan..."
                  value={formData.Deskripsi}
                  onChange={(e) => setFormData(prev => ({ ...prev, Deskripsi: e.target.value }))}
                  className={`w-full px-3 py-2 text-xs rounded-xl border
                    ${darkTheme ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`}
                  rows={3}
                />
              </div>
            </form>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200/10">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-500/10 text-slate-400 hover:bg-slate-500/20"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-teal-500 text-white hover:bg-teal-600 shadow-md"
              >
                Terbitkan Materi
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
