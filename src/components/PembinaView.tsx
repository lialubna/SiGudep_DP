/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Plus, Edit, Trash2, Search, X, Upload, Mail, Phone, Calendar, UserCheck } from "lucide-react";
import { Pembina, UserRole } from "../types";

interface PembinaViewProps {
  pembinaList: Pembina[];
  userRole: UserRole;
  onCreate: (data: Partial<Pembina>) => void;
  onUpdate: (id: string, data: Partial<Pembina>) => void;
  onDelete: (id: string) => void;
  darkTheme: boolean;
}

export default function PembinaView({
  pembinaList,
  userRole,
  onCreate,
  onUpdate,
  onDelete,
  darkTheme
}: PembinaViewProps) {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState("");
  const [formData, setFormData] = useState<Partial<Pembina>>({
    Foto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    Nama: "", NomorKTA: "", NIP: "", Jabatan: "", Golongan: "", NoHP: "", Email: "", Alamat: "",
    TanggalMasuk: new Date().toISOString().split("T")[0], Status: "Aktif"
  });

  const filteredPembina = pembinaList.filter(p => 
    p.Nama.toLowerCase().includes(search.toLowerCase()) || 
    p.NomorKTA.includes(search) || 
    p.Jabatan.toLowerCase().includes(search.toLowerCase())
  );

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, Foto: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.Nama || !formData.NomorKTA) {
      alert("Nama dan Nomor KTA wajib diisi!");
      return;
    }
    if (isEdit) {
      onUpdate(editId, formData);
    } else {
      onCreate(formData);
    }
    setShowForm(false);
  };

  const openAddForm = () => {
    setIsEdit(false);
    setFormData({
      Foto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      Nama: "", NomorKTA: `31.71.${Math.floor(10 + Math.random() * 89)}.${Math.floor(1000 + Math.random() * 9000)}`,
      NIP: "", Jabatan: "Pembina Pembantu", Golongan: "Sertifikasi KMD", NoHP: "", Email: "", Alamat: "",
      TanggalMasuk: new Date().toISOString().split("T")[0], Status: "Aktif"
    });
    setShowForm(true);
  };

  const openEditForm = (p: Pembina) => {
    setIsEdit(true);
    setEditId(p.PembinaID);
    setFormData(p);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans">Administrasi Data Pembina Gugus Depan</h2>
          <p className="text-xs text-slate-400 mt-1">Daftar kakak Pembina Pramuka aktif, pembantu pembina, serta kualifikasi kepelatihan.</p>
        </div>
        {["SUPER_ADMIN", "ADMIN"].includes(userRole) && (
          <button
            onClick={openAddForm}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-teal-500 text-white hover:bg-teal-600 transition-all flex items-center gap-1.5 shadow-md shadow-teal-500/10"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Pembina</span>
          </button>
        )}
      </div>

      {/* Search Filter */}
      <div className={`p-4 rounded-2xl border flex items-center
        ${darkTheme ? "bg-slate-800/40 border-slate-700/80" : "bg-white border-slate-200"}
      `}>
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari Pembina berdasarkan Nama, Jabatan, atau KTA..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full pl-9 pr-4 py-1.5 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-teal-500
              ${darkTheme ? "bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" : "bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400"}
            `}
          />
        </div>
      </div>

      {/* Grid displays of Instructors */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPembina.length === 0 ? (
          <p className="text-slate-400 text-center py-10 col-span-full">Tidak ada data Pembina yang ditemukan.</p>
        ) : (
          filteredPembina.map(p => (
            <div 
              key={p.PembinaID}
              className={`p-5 rounded-2xl border shadow-sm space-y-4 flex flex-col justify-between
                ${darkTheme ? "bg-slate-800/40 border-slate-700/80" : "bg-white border-slate-200"}
              `}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <img src={p.Foto || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"} alt="Photo" className="w-14 h-14 rounded-xl object-cover border border-slate-200/10 shadow" />
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-sm leading-tight text-teal-500">{p.Nama}</h4>
                    <span className="text-[10px] text-slate-400 block font-mono">{p.NomorKTA}</span>
                    <span className="inline-block px-2 py-0.5 mt-1 text-[9px] bg-slate-500/10 text-slate-400 font-semibold rounded-full">
                      {p.Status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-xs space-y-1.5 border-t border-slate-200/10 pt-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Jabatan Gudep:</span>
                  <span className="font-semibold">{p.Jabatan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tingkat Ijazah:</span>
                  <span className="font-semibold text-slate-300">{p.Golongan || "KPD/KPL"}</span>
                </div>
                {p.NIP && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">NIP Pembina:</span>
                    <span className="font-mono">{p.NIP}</span>
                  </div>
                )}
              </div>

              <div className="text-[11px] text-slate-400 space-y-1">
                <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-teal-500" /> {p.Email}</p>
                <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-teal-500" /> {p.NoHP}</p>
              </div>

              {["SUPER_ADMIN", "ADMIN"].includes(userRole) && (
                <div className="flex gap-2 border-t border-slate-200/10 pt-3.5 mt-2">
                  <button
                    onClick={() => openEditForm(p)}
                    className="flex-1 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-md shadow-amber-500/5"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit Profil</span>
                  </button>
                  <button
                    onClick={() => onDelete(p.PembinaID)}
                    className="py-1.5 px-3 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center transition-colors"
                    title="Hapus Pembina"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* CRUD MODAL FOR PEMBINA */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-lg rounded-2xl p-6 shadow-2xl animate-fade-in flex flex-col max-h-[85vh]
            ${darkTheme ? "bg-slate-900 border border-slate-800 text-white" : "bg-white text-slate-800"}
          `}>
            <div className="flex justify-between items-center pb-4 border-b border-slate-200/10">
              <h3 className="font-bold text-base font-sans">{isEdit ? "Ubah Data Pembina" : "Tambah Kakak Pembina Baru"}</h3>
              <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-slate-100/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
              {/* Photo section */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-500/5 border border-dashed border-slate-300/10">
                <img src={formData.Foto} alt="Preview" className="w-14 h-14 rounded-xl object-cover" />
                <div className="text-xs space-y-1">
                  <span className="font-semibold block">Foto Kakak Pembina</span>
                  <label className="inline-flex items-center gap-1 bg-teal-500 hover:bg-teal-600 text-white px-2 py-1 rounded cursor-pointer font-bold text-[10px]">
                    <Upload className="w-3 h-3" /> Pick Photo
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Nama Lengkap Kakak Pembina *</label>
                <input
                  type="text"
                  value={formData.Nama}
                  onChange={(e) => setFormData(prev => ({ ...prev, Nama: e.target.value }))}
                  className={`w-full px-3 py-2 text-xs rounded-xl border focus:ring-2 focus:ring-teal-500
                    ${darkTheme ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-800"}`}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Nomor KTA *</label>
                  <input
                    type="text"
                    value={formData.NomorKTA}
                    onChange={(e) => setFormData(prev => ({ ...prev, NomorKTA: e.target.value }))}
                    className={`w-full px-3 py-2 text-xs rounded-xl border
                      ${darkTheme ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">NIP (Jika PNS)</label>
                  <input
                    type="text"
                    value={formData.NIP}
                    onChange={(e) => setFormData(prev => ({ ...prev, NIP: e.target.value }))}
                    className={`w-full px-3 py-2 text-xs rounded-xl border
                      ${darkTheme ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Jabatan Satuan</label>
                  <input
                    type="text"
                    value={formData.Jabatan}
                    onChange={(e) => setFormData(prev => ({ ...prev, Jabatan: e.target.value }))}
                    className={`w-full px-3 py-2 text-xs rounded-xl border
                      ${darkTheme ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Kualifikasi Kepelatihan</label>
                  <input
                    type="text"
                    value={formData.Golongan}
                    placeholder="Contoh: KMD, KML, KPD, KPL"
                    onChange={(e) => setFormData(prev => ({ ...prev, Golongan: e.target.value }))}
                    className={`w-full px-3 py-2 text-xs rounded-xl border
                      ${darkTheme ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">No. HP WA</label>
                  <input
                    type="text"
                    value={formData.NoHP}
                    onChange={(e) => setFormData(prev => ({ ...prev, NoHP: e.target.value }))}
                    className={`w-full px-3 py-2 text-xs rounded-xl border
                      ${darkTheme ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Email</label>
                  <input
                    type="email"
                    value={formData.Email}
                    onChange={(e) => setFormData(prev => ({ ...prev, Email: e.target.value }))}
                    className={`w-full px-3 py-2 text-xs rounded-xl border
                      ${darkTheme ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Alamat Rumah</label>
                <textarea
                  value={formData.Alamat}
                  onChange={(e) => setFormData(prev => ({ ...prev, Alamat: e.target.value }))}
                  className={`w-full px-3 py-2 text-xs rounded-xl border
                    ${darkTheme ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`}
                  rows={2}
                />
              </div>
            </form>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200/10">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-500/10 text-slate-400 hover:bg-slate-500/20"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-teal-500 text-white hover:bg-teal-600 shadow-md"
              >
                {isEdit ? "Simpan Kakak" : "Tambahkan Kakak"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
