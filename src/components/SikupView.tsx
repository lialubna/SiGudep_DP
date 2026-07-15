/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Plus, Edit, Trash2, Search, Award, CheckSquare, X, BookOpen, Layers } from "lucide-react";
import { MasterSKU, UserRole } from "../types";

interface SikupViewProps {
  masterSku: MasterSKU[];
  userRole: UserRole;
  onCreateSku: (data: Partial<MasterSKU>) => void;
  onUpdateSku: (id: string, data: Partial<MasterSKU>) => void;
  onDeleteSku: (id: string) => void;
  darkTheme: boolean;
}

export default function SikupView({
  masterSku,
  userRole,
  onCreateSku,
  onUpdateSku,
  onDeleteSku,
  darkTheme
}: SikupViewProps) {
  const [subTab, setSubTab] = useState<"sku" | "tkk">("sku");
  const [filterGolongan, setFilterGolongan] = useState<"Siaga" | "Penggalang" | "Penegak" | "Pandega">("Penggalang");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState("");

  const [formData, setFormData] = useState<Partial<MasterSKU>>({
    Golongan: "Penggalang", Tingkat: "Penggalang Ramu", NomorButir: 1, Bidang: "Karakter", Deskripsi: "", Urutan: 1, Status: "Aktif"
  });

  const filteredSku = masterSku.filter(s => 
    s.Golongan === filterGolongan && 
    (s.Deskripsi.toLowerCase().includes(search.toLowerCase()) || s.Bidang.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.Deskripsi) {
      alert("Deskripsi Butir SKU wajib diisi!");
      return;
    }
    if (isEdit) {
      onUpdateSku(editId, formData);
    } else {
      onCreateSku(formData);
    }
    setShowModal(false);
  };

  const openAddForm = () => {
    setIsEdit(false);
    setFormData({
      Golongan: filterGolongan,
      Tingkat: filterGolongan === "Penggalang" ? "Penggalang Ramu" : "Bantara",
      NomorButir: filteredSku.length + 1,
      Bidang: "Kepramukaan",
      Deskripsi: "",
      Urutan: filteredSku.length + 1,
      Status: "Aktif"
    });
    setShowModal(true);
  };

  const openEditForm = (sku: MasterSKU) => {
    setIsEdit(true);
    setEditId(sku.SkuID);
    setFormData(sku);
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans">Syllabus SKU & Katalog TKK</h2>
          <p className="text-xs text-slate-400 mt-1">Kelola kurikulum butir Syarat Kecakapan Umum (SKU) dan Tanda Kecakapan Khusus (TKK).</p>
        </div>
        <div className="flex gap-1 bg-slate-500/10 p-1 rounded-xl border border-slate-300/10 self-start sm:self-auto">
          <button
            onClick={() => setSubTab("sku")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5
              ${subTab === "sku" ? "bg-teal-500 text-white shadow" : "text-slate-400 hover:text-slate-600"}`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Syarat Kecakapan Umum (SKU)</span>
          </button>
          <button
            onClick={() => setSubTab("tkk")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5
              ${subTab === "tkk" ? "bg-teal-500 text-white shadow" : "text-slate-400 hover:text-slate-600"}`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Katalog TKK</span>
          </button>
        </div>
      </div>

      {subTab === "sku" ? (
        <>
          {/* Golongan Filter bar */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {(["Siaga", "Penggalang", "Penegak", "Pandega"] as const).map(g => (
              <button
                key={g}
                onClick={() => setFilterGolongan(g)}
                className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all shrink-0
                  ${filterGolongan === g 
                    ? "bg-teal-500 text-white border-teal-500 shadow shadow-teal-500/10" 
                    : "border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-600"}`}
              >
                Golongan {g}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className={`p-4 rounded-2xl border flex items-center gap-3
            ${darkTheme ? "bg-slate-800/40 border-slate-700/80" : "bg-white border-slate-200"}
          `}>
            <div className="relative w-full md:flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder={`Cari materi butir SKU Golongan ${filterGolongan}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full pl-9 pr-4 py-1.5 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-teal-500
                  ${darkTheme ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-800"}`}
              />
            </div>
            {["SUPER_ADMIN", "ADMIN"].includes(userRole) && (
              <button
                onClick={openAddForm}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-teal-500 text-white hover:bg-teal-600 transition-all flex items-center gap-1.5 shadow-md shadow-teal-500/10"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Butir</span>
              </button>
            )}
          </div>

          {/* SKU Syllabus list */}
          <div className="space-y-3">
            {filteredSku.length === 0 ? (
              <p className="text-slate-400 text-center py-10">Belum ada butir kurikulum SKU terdaftar untuk Golongan {filterGolongan}.</p>
            ) : (
              filteredSku.map(sku => (
                <div 
                  key={sku.SkuID}
                  className={`p-4 rounded-2xl border shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4
                    ${darkTheme ? "bg-slate-800/40 border-slate-700/80" : "bg-white border-slate-200"}`}
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 font-bold text-[9px]">
                        Butir Ke-{sku.NomorButir}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-500/10 text-slate-400 font-bold text-[9px] uppercase">
                        {sku.Bidang}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">Tingkat: {sku.Tingkat}</span>
                    </div>
                    <p className="text-xs font-medium leading-relaxed">{sku.Deskripsi}</p>
                  </div>

                  {["SUPER_ADMIN", "ADMIN"].includes(userRole) && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEditForm(sku)}
                        className={`p-1.5 rounded-lg border hover:bg-amber-500 hover:text-white transition-all
                          ${darkTheme ? "border-slate-700 text-slate-300" : "border-slate-200 text-slate-600"}`}
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteSku(sku.SkuID)}
                        className={`p-1.5 rounded-lg border hover:bg-red-500 hover:text-white transition-all
                          ${darkTheme ? "border-slate-700 text-slate-300" : "border-slate-200 text-slate-600"}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        /* MASTER TKK DATABASE PREVIEW */
        <div className={`p-6 rounded-2xl border shadow-sm space-y-4
          ${darkTheme ? "bg-slate-800/40 border-slate-700/80" : "bg-white border-slate-200"}`}
        >
          <div className="flex items-center gap-3 pb-3 border-b border-slate-200/10">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm">Kurikulum Tanda Kecakapan Khusus (TKK)</h4>
              <p className="text-[11px] text-slate-400">10 TKK Wajib dalam Gerakan Pramuka tingkat Gugus Depan.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TkkCatalogCard title="TKK Pertolongan Pertama Pada Kecelakaan (P3K)" desc="Kecakapan memberi bantuan medis darurat ringan dan membalut luka." icon="🚑" />
            <TkkCatalogCard title="TKK Pengatur Rumah" desc="Keahlian merapikan kamar, menata perabot, serta menjaga kenyamanan rumah." icon="🏠" />
            <TkkCatalogCard title="TKK Pengamat" desc="Kecakapan mengamati jejak, membaca arah mata angin, serta memetakan wilayah." icon="🧭" />
            <TkkCatalogCard title="TKK Juru Masak" desc="Kemampuan memasak makanan sederhana bergizi, menyalakan api rimba, serta menghidangkan makanan." icon="🍳" />
            <TkkCatalogCard title="TKK Berkemah" desc="Keterampilan mendirikan tenda dome/kelompok, membuat parit tenda, serta packing peralatan." icon="⛺" />
            <TkkCatalogCard title="TKK Penabung" desc="Kecakapan mengelola keuangan pribadi, rajin menabung di koperasi sekolah." icon="💰" />
          </div>
        </div>
      )}

      {/* --- CRUD MODAL SKU --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-2xl p-6 shadow-2xl animate-fade-in flex flex-col
            ${darkTheme ? "bg-slate-900 border border-slate-800 text-white" : "bg-white text-slate-800"}`}
          >
            <div className="flex justify-between items-center pb-4 border-b border-slate-200/10">
              <h3 className="font-bold text-base font-sans">{isEdit ? "Ubah Butir SKU" : "Tambah Kurikulum Butir SKU"}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-slate-100/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Golongan</label>
                  <input
                    type="text"
                    value={formData.Golongan}
                    disabled
                    className={`w-full px-3 py-2 text-xs rounded-xl border bg-slate-500/10 text-slate-400`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Tingkat Pramuka</label>
                  <input
                    type="text"
                    value={formData.Tingkat}
                    onChange={(e) => setFormData(prev => ({ ...prev, Tingkat: e.target.value }))}
                    className={`w-full px-3 py-2 text-xs rounded-xl border
                      ${darkTheme ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Nomor Urut Butir</label>
                  <input
                    type="number"
                    value={formData.NomorButir}
                    onChange={(e) => setFormData(prev => ({ ...prev, NomorButir: Number(e.target.value) }))}
                    className={`w-full px-3 py-2 text-xs rounded-xl border
                      ${darkTheme ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Bidang Uji</label>
                  <input
                    type="text"
                    value={formData.Bidang}
                    placeholder="Contoh: Keagamaan, Karakter, Fisik"
                    onChange={(e) => setFormData(prev => ({ ...prev, Bidang: e.target.value }))}
                    className={`w-full px-3 py-2 text-xs rounded-xl border
                      ${darkTheme ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Deskripsi Uji Butir SKU *</label>
                <textarea
                  value={formData.Deskripsi}
                  onChange={(e) => setFormData(prev => ({ ...prev, Deskripsi: e.target.value }))}
                  className={`w-full px-3 py-2 text-xs rounded-xl border focus:ring-2 focus:ring-teal-500
                    ${darkTheme ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-800"}`}
                  rows={4}
                  required
                />
              </div>
            </form>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200/10">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-500/10 text-slate-400 hover:bg-slate-500/20"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-teal-500 text-white hover:bg-teal-600 shadow-md"
              >
                {isEdit ? "Simpan Perubahan" : "Terbitkan Butir"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Visual mini component
function TkkCatalogCard({ title, desc, icon }: { title: string; desc: string; icon: string }) {
  return (
    <div className="p-3.5 rounded-xl bg-slate-500/5 border border-slate-200/5 flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-xl shrink-0">
        {icon}
      </div>
      <div className="text-xs space-y-1">
        <h5 className="font-bold">{title}</h5>
        <p className="text-slate-400 leading-normal">{desc}</p>
      </div>
    </div>
  );
}
