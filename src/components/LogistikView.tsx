/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Plus, Edit, Trash2, Search, Filter, Boxes, Tag, AlertTriangle, CheckCircle, X } from "lucide-react";
import { Inventaris, UserRole } from "../types";

interface LogistikViewProps {
  inventarisList: Inventaris[];
  userRole: UserRole;
  onCreate: (data: Partial<Inventaris>) => void;
  onUpdate: (id: string, data: Partial<Inventaris>) => void;
  onDelete: (id: string) => void;
  darkTheme: boolean;
}

export default function LogistikView({
  inventarisList,
  userRole,
  onCreate,
  onUpdate,
  onDelete,
  darkTheme
}: LogistikViewProps) {
  const [search, setSearch] = useState("");
  const [filterKondisi, setFilterKondisi] = useState("");
  const [filterKategori, setFilterKategori] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState("");

  const [formData, setFormData] = useState<Partial<Inventaris>>({
    NamaBarang: "", Kategori: "Tenda", KodeBarang: "", Jumlah: 1, Satuan: "Unit", Kondisi: "Baik", Lokasi: "Gudang Pramuka", TanggalPerolehan: new Date().toISOString().split("T")[0], Keterangan: ""
  });

  const filteredInventaris = inventarisList.filter(i => {
    const matchSearch = i.NamaBarang.toLowerCase().includes(search.toLowerCase()) || i.KodeBarang.toLowerCase().includes(search.toLowerCase());
    const matchKondisi = filterKondisi ? i.Kondisi === filterKondisi : true;
    const matchKategori = filterKategori ? i.Kategori === filterKategori : true;
    return matchSearch && matchKondisi && matchKategori;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.NamaBarang || !formData.KodeBarang) {
      alert("Nama Barang dan Kode Barang wajib diisi!");
      return;
    }
    if (isEdit) {
      onUpdate(editId, formData);
    } else {
      onCreate(formData);
    }
    setShowModal(false);
  };

  const openAddForm = () => {
    setIsEdit(false);
    setFormData({
      NamaBarang: "", Kategori: "Tenda", KodeBarang: `GD.PR.${Math.floor(100 + Math.random() * 899)}`, Jumlah: 5, Satuan: "Pcs", Kondisi: "Baik", Lokasi: "Gudang Pramuka", TanggalPerolehan: new Date().toISOString().split("T")[0], Keterangan: ""
    });
    setShowModal(true);
  };

  const openEditForm = (item: Inventaris) => {
    setIsEdit(true);
    setEditId(item.InventarisID);
    setFormData(item);
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans">Inventaris & Logistik Gudep</h2>
          <p className="text-xs text-slate-400 mt-1 font-sans">Kelola tenda regu, kompas bidik, tongkat pionering, kotak P3K, dan aset logistik lainnya.</p>
        </div>
        {["SUPER_ADMIN", "ADMIN"].includes(userRole) && (
          <button
            onClick={openAddForm}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-teal-500 text-white hover:bg-teal-600 transition-all flex items-center gap-1.5 shadow-md shadow-teal-500/10"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Barang</span>
          </button>
        )}
      </div>

      {/* Stats Bento */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`p-4 rounded-xl border flex items-center gap-3 ${darkTheme ? "bg-slate-800/40 border-slate-700/80" : "bg-white border-slate-200"}`}>
          <div className="w-9 h-9 rounded-lg bg-teal-500/10 text-teal-500 flex items-center justify-center font-bold">
            🎒
          </div>
          <div className="text-xs">
            <span className="text-slate-400 block">Total Item Logistik</span>
            <span className="font-bold text-lg">{inventarisList.length} Unit terdaftar</span>
          </div>
        </div>

        <div className={`p-4 rounded-xl border flex items-center gap-3 ${darkTheme ? "bg-slate-800/40 border-slate-700/80" : "bg-white border-slate-200"}`}>
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
            ✓
          </div>
          <div className="text-xs">
            <span className="text-slate-400 block">Kondisi Baik</span>
            <span className="font-bold text-lg text-emerald-500">{inventarisList.filter(i => i.Kondisi === "Baik").length} Item siap pakai</span>
          </div>
        </div>

        <div className={`p-4 rounded-xl border flex items-center gap-3 ${darkTheme ? "bg-slate-800/40 border-slate-700/80" : "bg-white border-slate-200"}`}>
          <div className="w-9 h-9 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center font-bold">
            ⚠
          </div>
          <div className="text-xs">
            <span className="text-slate-400 block">Perlu Perbaikan</span>
            <span className="font-bold text-lg text-red-500">{inventarisList.filter(i => i.Kondisi === "Rusak").length} Item rusak</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={`p-4 rounded-2xl border flex flex-col md:flex-row gap-3 items-center
        ${darkTheme ? "bg-slate-800/40 border-slate-700/80" : "bg-white border-slate-200"}`}
      >
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama barang atau kode aset..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full pl-9 pr-4 py-1.5 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-teal-500
              ${darkTheme ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-800"}`}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <select
            value={filterKategori}
            onChange={(e) => setFilterKategori(e.target.value)}
            className={`px-3 py-1.5 text-xs rounded-xl border focus:ring-2 focus:ring-teal-500
              ${darkTheme ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-800"}`}
          >
            <option value="">Semua Kategori</option>
            <option value="Tenda">Tenda</option>
            <option value="Tongkat">Tongkat</option>
            <option value="Kompas">Kompas</option>
            <option value="Semaphore">Semaphore</option>
            <option value="Bendera">Bendera</option>
            <option value="P3K">P3K</option>
            <option value="Tali">Tali</option>
            <option value="Lampu">Lampu</option>
            <option value="Peralatan Masak">Peralatan Masak</option>
          </select>

          <select
            value={filterKondisi}
            onChange={(e) => setFilterKondisi(e.target.value)}
            className={`px-3 py-1.5 text-xs rounded-xl border focus:ring-2 focus:ring-teal-500
              ${darkTheme ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-800"}`}
          >
            <option value="">Semua Kondisi</option>
            <option value="Baik">Kondisi Baik</option>
            <option value="Rusak">Kondisi Rusak</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className={`border rounded-2xl overflow-hidden shadow-sm
        ${darkTheme ? "bg-slate-800/40 border-slate-700/80" : "bg-white border-slate-200"}`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className={`border-b font-semibold text-slate-400
                ${darkTheme ? "bg-slate-800/60 border-slate-700" : "bg-slate-50 border-slate-200"}`}
              >
                <th className="p-4">Nama Barang</th>
                <th className="p-4">Kode Aset</th>
                <th className="p-4">Kategori</th>
                <th className="p-4">Stok / Satuan</th>
                <th className="p-4">Kondisi</th>
                <th className="p-4">Lokasi Penyimpanan</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/10">
              {filteredInventaris.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">Tidak ada aset logistik terdata.</td>
                </tr>
              ) : (
                filteredInventaris.map(item => (
                  <tr key={item.InventarisID} className="hover:bg-slate-500/5 transition-colors">
                    <td className="p-4 font-bold text-teal-500">{item.NamaBarang}</td>
                    <td className="p-4 font-mono font-medium">{item.KodeBarang}</td>
                    <td className="p-4 font-semibold uppercase">{item.Kategori}</td>
                    <td className="p-4 font-semibold text-base">{item.Jumlah} <span className="text-xs text-slate-400 font-normal">{item.Satuan}</span></td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 w-fit
                        ${item.Kondisi === "Baik" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}
                      >
                        {item.Kondisi === "Baik" ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                        <span>{item.Kondisi}</span>
                      </span>
                    </td>
                    <td className="p-4 text-slate-400 font-medium">{item.Lokasi}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => openEditForm(item)}
                          className={`p-1.5 rounded-lg border hover:bg-amber-500 hover:text-white transition-all
                            ${darkTheme ? "border-slate-700 text-slate-300" : "border-slate-200 text-slate-600"}`}
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDelete(item.InventarisID)}
                          className={`p-1.5 rounded-lg border hover:bg-red-500 hover:text-white transition-all
                            ${darkTheme ? "border-slate-700 text-slate-300" : "border-slate-200 text-slate-600"}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- CRUD MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-2xl p-6 shadow-2xl animate-fade-in flex flex-col
            ${darkTheme ? "bg-slate-900 border border-slate-800 text-white" : "bg-white text-slate-800"}`}
          >
            <div className="flex justify-between items-center pb-4 border-b border-slate-200/10">
              <h3 className="font-bold text-base font-sans">{isEdit ? "Ubah Logistik Aset" : "Daftarkan Aset Barang Baru"}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-slate-100/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="py-4 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Nama Barang / Perlengkapan *</label>
                <input
                  type="text"
                  placeholder="Contoh: Tenda Dome 4 Orang..."
                  value={formData.NamaBarang}
                  onChange={(e) => setFormData(prev => ({ ...prev, NamaBarang: e.target.value }))}
                  className={`w-full px-3 py-2 text-xs rounded-xl border focus:ring-2 focus:ring-teal-500
                    ${darkTheme ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-800"}`}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Kode Aset Gudep *</label>
                  <input
                    type="text"
                    value={formData.KodeBarang}
                    onChange={(e) => setFormData(prev => ({ ...prev, KodeBarang: e.target.value }))}
                    className={`w-full px-3 py-2 text-xs rounded-xl border
                      ${darkTheme ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Kategori Logistik</label>
                  <select
                    value={formData.Kategori}
                    onChange={(e) => setFormData(prev => ({ ...prev, Kategori: e.target.value as any }))}
                    className={`w-full px-3 py-2 text-xs rounded-xl border
                      ${darkTheme ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`}
                  >
                    <option value="Tenda">Tenda</option>
                    <option value="Tongkat">Tongkat</option>
                    <option value="Kompas">Kompas</option>
                    <option value="Semaphore">Semaphore</option>
                    <option value="Bendera">Bendera</option>
                    <option value="P3K">P3K</option>
                    <option value="Tali">Tali</option>
                    <option value="Lampu">Lampu</option>
                    <option value="Peralatan Masak">Peralatan Masak</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Jumlah Stok</label>
                  <input
                    type="number"
                    value={formData.Jumlah}
                    onChange={(e) => setFormData(prev => ({ ...prev, Jumlah: Number(e.target.value) }))}
                    className={`w-full px-3 py-2 text-xs rounded-xl border
                      ${darkTheme ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Satuan</label>
                  <input
                    type="text"
                    value={formData.Satuan}
                    onChange={(e) => setFormData(prev => ({ ...prev, Satuan: e.target.value }))}
                    className={`w-full px-3 py-2 text-xs rounded-xl border
                      ${darkTheme ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Kondisi Aktual</label>
                  <select
                    value={formData.Kondisi}
                    onChange={(e) => setFormData(prev => ({ ...prev, Kondisi: e.target.value as any }))}
                    className={`w-full px-3 py-2 text-xs rounded-xl border
                      ${darkTheme ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`}
                  >
                    <option value="Baik">Baik</option>
                    <option value="Rusak">Rusak</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Lokasi Penyimpanan</label>
                  <input
                    type="text"
                    value={formData.Lokasi}
                    onChange={(e) => setFormData(prev => ({ ...prev, Lokasi: e.target.value }))}
                    className={`w-full px-3 py-2 text-xs rounded-xl border
                      ${darkTheme ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`}
                  />
                </div>
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
                {isEdit ? "Simpan Perlengkapan" : "Daftarkan Barang"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
