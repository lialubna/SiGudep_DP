/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Plus, Edit, Trash2, Search, Filter, Printer, FileSpreadsheet, FileText, 
  Eye, X, Upload, Calendar, Award, CheckCircle, Smile, BookOpen, BarChart3, AlertCircle 
} from "lucide-react";
import { Peserta, UserRole, MasterSKU, ProgressSKU, TKKAward, AbsensiPeserta, RefleksiSiswa, PenilaianSikap, User } from "../types";

interface PesertaViewProps {
  pesertaList: Peserta[];
  userRole: UserRole;
  masterSku: MasterSKU[];
  progressSku: ProgressSKU[];
  tkkAwards: TKKAward[];
  absensiList: AbsensiPeserta[];
  refleksiList: RefleksiSiswa[];
  penilaianList: PenilaianSikap[];
  currentUser?: User | null;
  onCreate: (data: Partial<Peserta>) => void;
  onUpdate: (id: string, data: Partial<Peserta>) => void;
  onDelete: (id: string) => void;
  onSaveProgressSku: (data: any) => void;
  onAwardTKK: (data: any) => void;
  darkTheme: boolean;
}

export default function PesertaView({
  pesertaList,
  userRole,
  masterSku,
  progressSku,
  tkkAwards,
  absensiList,
  refleksiList,
  penilaianList,
  currentUser,
  onCreate,
  onUpdate,
  onDelete,
  onSaveProgressSku,
  onAwardTKK,
  darkTheme
}: PesertaViewProps) {
  const [search, setSearch] = useState("");
  const [filterGolongan, setFilterGolongan] = useState("");
  const [filterKelas, setFilterKelas] = useState("");
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Form States
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState("");
  const [formData, setFormData] = useState<Partial<Peserta>>({
    NomorKTA: "", Foto: "", NamaLengkap: "", NamaPanggilan: "", NISN: "",
    TempatLahir: "", TanggalLahir: "", JenisKelamin: "Laki-laki", Agama: "Islam",
    GolonganDarah: "O", Alamat: "", Sekolah: "", Kelas: "",
    GolonganPramuka: "Penggalang", Tingkat: "Penggalang Ramu", Regu: "",
    NoHP: "", NamaAyah: "", NamaIbu: "", NoHPOrangTua: "",
    TanggalMasukGudep: new Date().toISOString().split("T")[0], Status: "Aktif"
  });

  // Selected Detail Peserta State
  const [selectedPeserta, setSelectedPeserta] = useState<Peserta | null>(null);
  const [detailTab, setDetailTab] = useState<"profil" | "sku" | "tkk" | "absensi" | "refleksi" | "penilaian">("profil");

  // SKU interactive state
  const [skuValidation, setSkuValidation] = useState({
    SkuID: "", Status: "Lulus" as any, Catatan: "", Lampiran: ""
  });

  // TKK interactive award state
  const [tkkValidation, setTkkValidation] = useState({
    NamaTKK: "TKK Berkemah", Bidang: "Patriotisme dan Seni Budaya", Tingkatan: "Purwa" as any, NomorSertifikat: "", Catatan: ""
  });

  // Handle Photo upload conversions (Base64)
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, Foto: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit main form
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.NamaLengkap || !formData.NomorKTA) {
      alert("Nama Lengkap dan Nomor KTA wajib diisi!");
      return;
    }
    if (isEdit) {
      onUpdate(editId, formData);
    } else {
      onCreate(formData);
    }
    setShowFormModal(false);
  };

  const openAddForm = () => {
    setIsEdit(false);
    setFormData({
      NomorKTA: `03.045.2026.${Math.floor(1000 + Math.random() * 9000)}`,
      Foto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      NamaLengkap: "", NamaPanggilan: "", NISN: "", TempatLahir: "", TanggalLahir: "",
      JenisKelamin: "Laki-laki", Agama: "Islam", GolonganDarah: "O", Alamat: "",
      Sekolah: "SMP Negeri 1 Jakarta", Kelas: "", GolonganPramuka: "Penggalang",
      Tingkat: "Penggalang Ramu", Regu: "", NoHP: "", NamaAyah: "", NamaIbu: "",
      NoHPOrangTua: "", TanggalMasukGudep: new Date().toISOString().split("T")[0], Status: "Aktif"
    });
    setShowFormModal(true);
  };

  const openEditForm = (p: Peserta) => {
    setIsEdit(true);
    setEditId(p.PesertaID);
    setFormData(p);
    setShowFormModal(true);
  };

  const openDetails = (p: Peserta) => {
    setSelectedPeserta(p);
    setDetailTab("profil");
    setShowDetailModal(true);
  };

  // Filters application
  const filteredPeserta = pesertaList.filter(p => {
    const matchSearch = p.NamaLengkap.toLowerCase().includes(search.toLowerCase()) || 
                        p.NomorKTA.includes(search) || 
                        (p.Regu && p.Regu.toLowerCase().includes(search.toLowerCase()));
    const matchGolongan = filterGolongan ? p.GolonganPramuka === filterGolongan : true;
    const matchKelas = filterKelas ? p.Kelas === filterKelas : true;
    return matchSearch && matchGolongan && matchKelas;
  });

  // Export spreadsheet simulation
  const triggerExportExcel = () => {
    const headers = "ID,KTA,Nama,Regu,Tingkat,Kelas,Golongan,Status\n";
    const rows = filteredPeserta.map(p => 
      `"${p.PesertaID}","${p.NomorKTA}","${p.NamaLengkap}","${p.Regu}","${p.Tingkat}","${p.Kelas}","${p.GolonganPramuka}","${p.Status}"`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sigudep_data_peserta.csv";
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* View Header with Action buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans">Administrasi Data Anggota (Peserta Didik)</h2>
          <p className="text-xs text-slate-400 mt-1">Kelola seluruh biodata, SKU, TKK, dan rekam portofolio anggota Gudep.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={triggerExportExcel}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-500/10 text-slate-400 hover:bg-slate-500/20 transition-all flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Ekspor CSV</span>
          </button>
          {["SUPER_ADMIN", "ADMIN", "PEMBINA"].includes(userRole) && (
            <button 
              onClick={openAddForm}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-teal-500 text-white hover:bg-teal-600 transition-all flex items-center gap-1.5 shadow-md shadow-teal-500/10"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Anggota</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search rail */}
      <div className={`p-4 rounded-2xl border flex flex-col md:flex-row gap-3 items-center
        ${darkTheme ? "bg-slate-800/40 border-slate-700/80" : "bg-white border-slate-200"}
      `}>
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari anggota berdasarkan Nama, KTA, atau Regu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full pl-9 pr-4 py-1.5 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-teal-500
              ${darkTheme ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-800"}
            `}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <select
            value={filterGolongan}
            onChange={(e) => setFilterGolongan(e.target.value)}
            className={`px-3 py-1.5 text-xs rounded-xl border focus:ring-2 focus:ring-teal-500
              ${darkTheme ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-800"}
            `}
          >
            <option value="">Semua Golongan</option>
            <option value="Siaga">Siaga</option>
            <option value="Penggalang">Penggalang</option>
            <option value="Penegak">Penegak</option>
            <option value="Pandega">Pandega</option>
          </select>

          <select
            value={filterKelas}
            onChange={(e) => setFilterKelas(e.target.value)}
            className={`px-3 py-1.5 text-xs rounded-xl border focus:ring-2 focus:ring-teal-500
              ${darkTheme ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-800"}
            `}
          >
            <option value="">Semua Kelas</option>
            <option value="VII-A">Kelas VII</option>
            <option value="VIII-A">Kelas VIII</option>
            <option value="IX-A">Kelas IX</option>
          </select>
        </div>
      </div>

      {/* Main Data Table */}
      <div className={`border rounded-2xl overflow-hidden shadow-sm
        ${darkTheme ? "bg-slate-800/40 border-slate-700/80" : "bg-white border-slate-200"}
      `}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className={`border-b font-semibold text-slate-400
                ${darkTheme ? "bg-slate-800/60 border-slate-700" : "bg-slate-50 border-slate-200"}
              `}>
                <th className="p-4">Foto / Nama</th>
                <th className="p-4">No. KTA</th>
                <th className="p-4">Kelas</th>
                <th className="p-4">Golongan</th>
                <th className="p-4">Tingkat / Regu</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/10">
              {filteredPeserta.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">Tidak ada anggota yang cocok dengan filter pencarian.</td>
                </tr>
              ) : (
                filteredPeserta.map(p => (
                  <tr key={p.PesertaID} className="hover:bg-slate-500/5 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={p.Foto || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"} alt="Photo" className="w-10 h-10 rounded-xl object-cover" />
                        <div>
                          <h4 className="font-bold">{p.NamaLengkap}</h4>
                          <span className="text-[10px] text-slate-400">{p.JenisKelamin}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono font-medium">{p.NomorKTA}</td>
                    <td className="p-4 font-semibold text-teal-500">{p.Kelas || "N/A"}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-500">
                        {p.GolonganPramuka}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-medium">{p.Tingkat}</div>
                      <span className="text-[10px] text-slate-400 font-mono">Regu: {p.Regu || "N/A"}</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold
                        ${p.Status === "Aktif" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}
                      `}>
                        {p.Status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button 
                          onClick={() => openDetails(p)}
                          className={`p-1.5 rounded-lg border hover:bg-teal-500 hover:text-white transition-all
                            ${darkTheme ? "border-slate-700 text-slate-300" : "border-slate-200 text-slate-600"}
                          `}
                          title="Detail Profil & SKU"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {["SUPER_ADMIN", "ADMIN", "PEMBINA"].includes(userRole) && (
                          <>
                            <button 
                              onClick={() => openEditForm(p)}
                              className={`p-1.5 rounded-lg border hover:bg-amber-500 hover:text-white transition-all
                                ${darkTheme ? "border-slate-700 text-slate-300" : "border-slate-200 text-slate-600"}
                              `}
                              title="Edit Anggota"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => onDelete(p.PesertaID)}
                              className={`p-1.5 rounded-lg border hover:bg-red-500 hover:text-white transition-all
                                ${darkTheme ? "border-slate-700 text-slate-300" : "border-slate-200 text-slate-600"}
                              `}
                              title="Hapus Anggota"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- CRUD FORM MODAL --- */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className={`w-full max-w-2xl rounded-2xl p-6 shadow-2xl animate-fade-in flex flex-col max-h-[90vh]
            ${darkTheme ? "bg-slate-900 border border-slate-800 text-white" : "bg-white text-slate-800"}
          `}>
            <div className="flex justify-between items-center pb-4 border-b border-slate-200/10">
              <h3 className="font-bold text-base font-sans">{isEdit ? "Edit Biodata Anggota" : "Registrasi Anggota Pramuka Baru"}</h3>
              <button onClick={() => setShowFormModal(false)} className="p-1 rounded-lg hover:bg-slate-100/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
              {/* Photo Upload section */}
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl bg-slate-500/5 border border-dashed border-slate-300/10">
                <img src={formData.Foto || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"} alt="Preview" className="w-20 h-20 rounded-xl object-cover border border-slate-200/20" />
                <div className="text-center sm:text-left space-y-1">
                  <h5 className="text-xs font-bold">Foto Profil Anggota</h5>
                  <p className="text-[10px] text-slate-400">Pilih berkas pasfoto seragam Pramuka atau formal.</p>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg cursor-pointer transition-colors mt-2">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Pilih Foto</span>
                    <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Bio Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Nama Lengkap *</label>
                  <input
                    type="text"
                    value={formData.NamaLengkap}
                    onChange={(e) => setFormData(prev => ({ ...prev, NamaLengkap: e.target.value }))}
                    className={`w-full px-3.5 py-2 text-xs rounded-xl border focus:ring-2 focus:ring-teal-500
                      ${darkTheme ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Nomor KTA Gudep *</label>
                  <input
                    type="text"
                    value={formData.NomorKTA}
                    onChange={(e) => setFormData(prev => ({ ...prev, NomorKTA: e.target.value }))}
                    className={`w-full px-3.5 py-2 text-xs rounded-xl border focus:ring-2 focus:ring-teal-500
                      ${darkTheme ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">NISN</label>
                  <input
                    type="text"
                    value={formData.NISN}
                    onChange={(e) => setFormData(prev => ({ ...prev, NISN: e.target.value }))}
                    className={`w-full px-3.5 py-2 text-xs rounded-xl border
                      ${darkTheme ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Nama Panggilan</label>
                  <input
                    type="text"
                    value={formData.NamaPanggilan}
                    onChange={(e) => setFormData(prev => ({ ...prev, NamaPanggilan: e.target.value }))}
                    className={`w-full px-3.5 py-2 text-xs rounded-xl border
                      ${darkTheme ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Tempat Lahir</label>
                  <input
                    type="text"
                    value={formData.TempatLahir}
                    onChange={(e) => setFormData(prev => ({ ...prev, TempatLahir: e.target.value }))}
                    className={`w-full px-3.5 py-2 text-xs rounded-xl border
                      ${darkTheme ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Tanggal Lahir</label>
                  <input
                    type="date"
                    value={formData.TanggalLahir}
                    onChange={(e) => setFormData(prev => ({ ...prev, TanggalLahir: e.target.value }))}
                    className={`w-full px-3.5 py-2 text-xs rounded-xl border
                      ${darkTheme ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Golongan Pramuka</label>
                  <select
                    value={formData.GolonganPramuka}
                    onChange={(e) => setFormData(prev => ({ ...prev, GolonganPramuka: e.target.value as any }))}
                    className={`w-full px-3.5 py-2 text-xs rounded-xl border
                      ${darkTheme ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`}
                  >
                    <option value="Siaga">Siaga</option>
                    <option value="Penggalang">Penggalang</option>
                    <option value="Penegak">Penegak</option>
                    <option value="Pandega">Pandega</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Tingkat</label>
                  <input
                    type="text"
                    value={formData.Tingkat}
                    onChange={(e) => setFormData(prev => ({ ...prev, Tingkat: e.target.value }))}
                    className={`w-full px-3.5 py-2 text-xs rounded-xl border
                      ${darkTheme ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Regu</label>
                  <input
                    type="text"
                    value={formData.Regu}
                    onChange={(e) => setFormData(prev => ({ ...prev, Regu: e.target.value }))}
                    placeholder="Contoh: Rajawali, Melati"
                    className={`w-full px-3.5 py-2 text-xs rounded-xl border
                      ${darkTheme ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Kelas</label>
                  <input
                    type="text"
                    value={formData.Kelas}
                    onChange={(e) => setFormData(prev => ({ ...prev, Kelas: e.target.value }))}
                    className={`w-full px-3.5 py-2 text-xs rounded-xl border
                      ${darkTheme ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Jenis Kelamin</label>
                  <select
                    value={formData.JenisKelamin}
                    onChange={(e) => setFormData(prev => ({ ...prev, JenisKelamin: e.target.value as any }))}
                    className={`w-full px-3.5 py-2 text-xs rounded-xl border
                      ${darkTheme ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`}
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">No. HP Anggota</label>
                  <input
                    type="text"
                    value={formData.NoHP}
                    onChange={(e) => setFormData(prev => ({ ...prev, NoHP: e.target.value }))}
                    className={`w-full px-3.5 py-2 text-xs rounded-xl border
                      ${darkTheme ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Alamat Lengkap Rumah</label>
                <textarea
                  value={formData.Alamat}
                  onChange={(e) => setFormData(prev => ({ ...prev, Alamat: e.target.value }))}
                  className={`w-full px-3.5 py-2 text-xs rounded-xl border
                    ${darkTheme ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Nama Ayah</label>
                  <input
                    type="text"
                    value={formData.NamaAyah}
                    onChange={(e) => setFormData(prev => ({ ...prev, NamaAyah: e.target.value }))}
                    className={`w-full px-3.5 py-2 text-xs rounded-xl border
                      ${darkTheme ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Nama Ibu</label>
                  <input
                    type="text"
                    value={formData.NamaIibu}
                    onChange={(e) => setFormData(prev => ({ ...prev, NamaIbu: e.target.value }))}
                    className={`w-full px-3.5 py-2 text-xs rounded-xl border
                      ${darkTheme ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`}
                  />
                </div>
              </div>
            </form>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200/10">
              <button
                type="button"
                onClick={() => setShowFormModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-500/10 text-slate-400 hover:bg-slate-500/20"
              >
                Batalkan
              </button>
              <button
                type="button"
                onClick={handleFormSubmit}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-teal-500 text-white hover:bg-teal-600 shadow-md shadow-teal-500/10"
              >
                {isEdit ? "Simpan Perubahan" : "Daftarkan Anggota"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- DETAILED SCOUT PROFILE MODAL WITH TABS --- */}
      {showDetailModal && selectedPeserta && (
        <div className="fixed inset-0 bg-black/70 z-50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-4xl h-[90vh] rounded-3xl p-6 shadow-2xl flex flex-col animate-fade-in
            ${darkTheme ? "bg-slate-900 border border-slate-800 text-white" : "bg-white text-slate-800"}
          `}>
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-3 border-b border-slate-200/10">
              <div className="flex items-center gap-3">
                <img src={selectedPeserta.Foto || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"} alt="Photo" className="w-12 h-12 rounded-xl object-cover border border-slate-200/20" />
                <div>
                  <h3 className="font-bold text-base font-sans">{selectedPeserta.NamaLengkap}</h3>
                  <span className="text-xs text-slate-400 font-mono">No. KTA: {selectedPeserta.NomorKTA}</span>
                </div>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="p-1 rounded-lg hover:bg-slate-100/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* TAB Navigation Header */}
            <div className="flex gap-1.5 border-b border-slate-200/10 overflow-x-auto py-2">
              <TabButton id="profil" label="Profil Lengkap" icon={CheckCircle} current={detailTab} onClick={setDetailTab} />
              <TabButton id="sku" label="Progress SKU" icon={Award} current={detailTab} onClick={setDetailTab} />
              <TabButton id="tkk" label="Perolehan TKK" icon={BarChart3} current={detailTab} onClick={setDetailTab} />
              <TabButton id="absensi" label="Riwayat Absen" icon={Calendar} current={detailTab} onClick={setDetailTab} />
              <TabButton id="refleksi" label="Log Refleksi" icon={BookOpen} current={detailTab} onClick={setDetailTab} />
              <TabButton id="penilaian" label="Penilaian Sikap" icon={Smile} current={detailTab} onClick={setDetailTab} />
            </div>

            {/* TAB BODY SCROLLABLE CONTENT */}
            <div className="flex-1 overflow-y-auto py-4">

              {/* TAB 1: PROFILE BIODATA */}
              {detailTab === "profil" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-normal">
                  <div className="space-y-3.5">
                    <h4 className="font-bold text-teal-500 uppercase tracking-wider text-[10px]">Identitas Pribadi</h4>
                    <div className="grid grid-cols-3 border-b border-slate-100/5 pb-2">
                      <span className="text-slate-400">Nama Panggilan:</span>
                      <span className="col-span-2 font-semibold">{selectedPeserta.NamaPanggilan || "-"}</span>
                    </div>
                    <div className="grid grid-cols-3 border-b border-slate-100/5 pb-2">
                      <span className="text-slate-400">NISN:</span>
                      <span className="col-span-2 font-semibold">{selectedPeserta.NISN || "-"}</span>
                    </div>
                    <div className="grid grid-cols-3 border-b border-slate-100/5 pb-2">
                      <span className="text-slate-400">Tempat, Tgl Lahir:</span>
                      <span className="col-span-2 font-semibold">{selectedPeserta.TempatLahir}, {selectedPeserta.TanggalLahir}</span>
                    </div>
                    <div className="grid grid-cols-3 border-b border-slate-100/5 pb-2">
                      <span className="text-slate-400">Jenis Kelamin:</span>
                      <span className="col-span-2 font-semibold">{selectedPeserta.JenisKelamin}</span>
                    </div>
                    <div className="grid grid-cols-3 border-b border-slate-100/5 pb-2">
                      <span className="text-slate-400">Agama / Darah:</span>
                      <span className="col-span-2 font-semibold">{selectedPeserta.Agama} / {selectedPeserta.GolonganDarah}</span>
                    </div>
                    <div className="grid grid-cols-3 border-b border-slate-100/5 pb-2">
                      <span className="text-slate-400">Alamat:</span>
                      <span className="col-span-2 font-semibold text-slate-300">{selectedPeserta.Alamat || "-"}</span>
                    </div>
                  </div>

                  <div className="space-y-3.5">
                    <h4 className="font-bold text-teal-500 uppercase tracking-wider text-[10px]">Kademisan & Kepramukaan</h4>
                    <div className="grid grid-cols-3 border-b border-slate-100/5 pb-2">
                      <span className="text-slate-400">Sekolah / Kelas:</span>
                      <span className="col-span-2 font-semibold">{selectedPeserta.Sekolah} / {selectedPeserta.Kelas}</span>
                    </div>
                    <div className="grid grid-cols-3 border-b border-slate-100/5 pb-2">
                      <span className="text-slate-400">Golongan Pramuka:</span>
                      <span className="col-span-2 font-semibold text-teal-400">{selectedPeserta.GolonganPramuka}</span>
                    </div>
                    <div className="grid grid-cols-3 border-b border-slate-100/5 pb-2">
                      <span className="text-slate-400">Tingkat Aktual:</span>
                      <span className="col-span-2 font-semibold">{selectedPeserta.Tingkat}</span>
                    </div>
                    <div className="grid grid-cols-3 border-b border-slate-100/5 pb-2">
                      <span className="text-slate-400">Regu / Suku:</span>
                      <span className="col-span-2 font-semibold">{selectedPeserta.Regu || "Rajawali"}</span>
                    </div>
                    <div className="grid grid-cols-3 border-b border-slate-100/5 pb-2">
                      <span className="text-slate-400">Nama Orang Tua:</span>
                      <span className="col-span-2 font-semibold">Ayah: {selectedPeserta.NamaAyah || "-"} / Ibu: {selectedPeserta.NamaIbu || "-"}</span>
                    </div>
                    <div className="grid grid-cols-3 border-b border-slate-100/5 pb-2">
                      <span className="text-slate-400">HP Orang Tua:</span>
                      <span className="col-span-2 font-semibold">{selectedPeserta.NoHPOrangTua || "-"}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: PROGRESS SKU INTERACTIVE */}
              {detailTab === "sku" && (
                <div className="space-y-5">
                  <div className="flex justify-between items-center bg-teal-500/5 p-3 rounded-2xl border border-teal-500/10">
                    <div className="text-xs">
                      <span className="text-slate-400">Estimasi Progress SKU:</span>
                      <h4 className="font-bold text-sm text-teal-500 mt-1">
                        {progressSku.filter(p => p.PesertaID === selectedPeserta.PesertaID && p.Status === "Lulus").length} dari {masterSku.filter(s => s.Golongan === selectedPeserta.GolonganPramuka).length || 9} Butir Selesai
                      </h4>
                    </div>
                  </div>

                  {/* SKU List with sign-off validations (Pembina Only can edit) */}
                  <div className="space-y-3">
                    {masterSku.filter(s => s.Golongan === selectedPeserta.GolonganPramuka).map(s => {
                      const progress = progressSku.find(p => p.PesertaID === selectedPeserta.PesertaID && p.SkuID === s.SkuID);
                      const status = progress ? progress.Status : "Belum Dinilai";
                      
                      return (
                        <div key={s.SkuID} className="p-4 rounded-2xl bg-slate-500/5 border border-slate-200/5 text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div className="space-y-1 flex-1">
                            <span className="inline-block px-2 py-0.5 rounded bg-slate-500/10 text-slate-300 text-[9px] font-bold">
                              Butir {s.NomorButir} • {s.Bidang}
                            </span>
                            <p className="font-medium text-[11px] leading-relaxed">{s.Deskripsi}</p>
                            {progress?.Catatan && (
                              <p className="text-[10px] text-teal-400 mt-1 font-mono italic">Catatan Kakak: "{progress.Catatan}"</p>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold
                              ${status === "Lulus" ? "bg-emerald-500/15 text-emerald-400" : ""}
                              ${status === "Proses" ? "bg-amber-500/15 text-amber-400" : ""}
                              ${status === "Belum Dinilai" ? "bg-slate-500/10 text-slate-400" : ""}
                            `}>
                              {status}
                            </span>
                            
                            {["SUPER_ADMIN", "ADMIN", "PEMBINA"].includes(userRole) && (
                              <button
                                onClick={() => {
                                  setSkuValidation({ SkuID: s.SkuID, Status: "Lulus", Catatan: "", Lampiran: "" });
                                  // Simply prompt simulated form
                                  const comment = prompt("Masukkan catatan pembina untuk kelulusan butir SKU ini:");
                                  if (comment !== null) {
                                    onSaveProgressSku({
                                      PesertaID: selectedPeserta.PesertaID,
                                      SkuID: s.SkuID,
                                      Status: "Lulus",
                                      Catatan: comment,
                                      PembinaID: currentUser?.PembinaID || "pem-general"
                                    });
                                  }
                                }}
                                className="px-2.5 py-1 text-[10px] bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-bold transition-all"
                              >
                                Verifikasi
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 3: AWARD TKK */}
              {detailTab === "tkk" && (
                <div className="space-y-5">
                  {["SUPER_ADMIN", "ADMIN", "PEMBINA"].includes(userRole) && (
                    <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 text-xs space-y-3">
                      <h4 className="font-bold text-amber-500">Berikan Tanda Kecakapan Khusus (TKK)</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <select
                          value={tkkValidation.NamaTKK}
                          onChange={(e) => setTkkValidation(prev => ({ ...prev, NamaTKK: e.target.value }))}
                          className={`px-3 py-1.5 text-xs rounded-xl border ${darkTheme ? "bg-slate-800 text-white" : "bg-slate-50"}`}
                        >
                          <option value="TKK Berkemah">TKK Berkemah</option>
                          <option value="TKK Juru Masak">TKK Juru Masak</option>
                          <option value="TKK Menabung">TKK Menabung</option>
                          <option value="TKK Juru Kebun">TKK Juru Kebun</option>
                          <option value="TKK Pengaman Kampung">TKK Pengaman Kampung</option>
                        </select>

                        <select
                          value={tkkValidation.Tingkatan}
                          onChange={(e) => setTkkValidation(prev => ({ ...prev, Tingkatan: e.target.value as any }))}
                          className={`px-3 py-1.5 text-xs rounded-xl border ${darkTheme ? "bg-slate-800 text-white" : "bg-slate-50"}`}
                        >
                          <option value="Purwa">Purwa</option>
                          <option value="Madya">Madya</option>
                          <option value="Utama">Utama</option>
                        </select>

                        <input
                          type="text"
                          placeholder="No. Sertifikat TKK..."
                          value={tkkValidation.NomorSertifikat}
                          onChange={(e) => setTkkValidation(prev => ({ ...prev, NomorSertifikat: e.target.value }))}
                          className={`px-3 py-1.5 text-xs rounded-xl border ${darkTheme ? "bg-slate-800 text-white" : "bg-slate-50"}`}
                        />
                      </div>
                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => {
                            if (!tkkValidation.NomorSertifikat) {
                              alert("No. Sertifikat wajib diisi!");
                              return;
                            }
                            onAwardTKK({
                              PesertaID: selectedPeserta.PesertaID,
                              NamaTKK: tkkValidation.NamaTKK,
                              Bidang: "Keterampilan Kepramukaan",
                              Tingkatan: tkkValidation.Tingkatan,
                              Tanggal: new Date().toISOString().split("T")[0],
                              NomorSertifikat: tkkValidation.NomorSertifikat,
                              PembinaID: currentUser?.PembinaID || "pem-general",
                              Catatan: "Diberikan berdasarkan penilaian kecakapan lapangan."
                            });
                            setTkkValidation(prev => ({ ...prev, NomorSertifikat: "" }));
                          }}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold transition-all text-[10px]"
                        >
                          Sahkan TKK
                        </button>
                      </div>
                    </div>
                  )}

                  {/* History of TKK cards */}
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">TKK yang Telah Diraih</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {tkkAwards.filter(t => t.PesertaID === selectedPeserta.PesertaID).length === 0 ? (
                      <div className="p-8 text-center text-slate-400 col-span-2">Belum ada TKK yang tercatat.</div>
                    ) : (
                      tkkAwards.filter(t => t.PesertaID === selectedPeserta.PesertaID).map(t => (
                        <div key={t.TKKID} className="p-3 rounded-2xl bg-slate-500/5 border border-slate-200/5 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white text-base">
                              🎖️
                            </div>
                            <div className="text-xs">
                              <h5 className="font-bold">{t.NamaTKK}</h5>
                              <p className="text-[10px] text-slate-400 font-mono">Tingkat: {t.Tingkatan} • {t.Tanggal}</p>
                              <span className="text-[9px] text-slate-500">Sertifikat: {t.NomorSertifikat}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: HISTORICAL ATTENDANCE */}
              {detailTab === "absensi" && (
                <div className="space-y-4 text-xs">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-slate-400 uppercase tracking-wider">Riwayat Latihan & Presensi</h4>
                    <span className="text-teal-400 font-bold">Total Kehadiran: {absensiList.filter(a => a.PesertaID === selectedPeserta.PesertaID && a.Status === "Hadir").length} Hari</span>
                  </div>
                  <div className="space-y-2">
                    {absensiList.filter(a => a.PesertaID === selectedPeserta.PesertaID).length === 0 ? (
                      <p className="text-slate-400 text-center py-6">Belum ada catatan presensi latihan.</p>
                    ) : (
                      absensiList.filter(a => a.PesertaID === selectedPeserta.PesertaID).map(a => (
                        <div key={a.AbsensiID} className="p-3 rounded-xl bg-slate-500/5 border border-slate-200/5 flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <div>
                              <span className="font-semibold">{a.Tanggal}</span>
                              <p className="text-[10px] text-slate-400">Jam Masuk: {a.JamMasuk}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold
                            ${a.Status === "Hadir" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}
                          `}>
                            {a.Status}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: REFLECTIONS */}
              {detailTab === "refleksi" && (
                <div className="space-y-4 text-xs">
                  <h4 className="font-bold text-slate-400 uppercase tracking-wider">Catatan Refleksi Mingguan Siswa</h4>
                  <div className="space-y-3">
                    {refleksiList.filter(r => r.PesertaID === selectedPeserta.PesertaID).length === 0 ? (
                      <p className="text-slate-400 text-center py-6">Belum ada tulisan refleksi yang disubmit.</p>
                    ) : (
                      refleksiList.filter(r => r.PesertaID === selectedPeserta.PesertaID).map(r => (
                        <div key={r.RefleksiID} className="p-4 rounded-2xl bg-teal-500/5 border border-teal-500/10">
                          <div className="flex justify-between items-center pb-2 border-b border-slate-100/5 mb-2">
                            <span className="font-semibold">Sesi Latihan ({r.Tanggal})</span>
                          </div>
                          <p className="text-slate-300 italic">"{r.Isi}"</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 6: ATTITUDE CHARACTER EVALS */}
              {detailTab === "penilaian" && (
                <div className="space-y-4 text-xs">
                  <h4 className="font-bold text-slate-400 uppercase tracking-wider">Nilai Karakter & Keaktifan Berkala</h4>
                  <div className="space-y-3">
                    {penilaianList.filter(p => p.PesertaID === selectedPeserta.PesertaID).length === 0 ? (
                      <p className="text-slate-400 text-center py-6">Belum ada evaluasi nilai kepribadian.</p>
                    ) : (
                      penilaianList.filter(p => p.PesertaID === selectedPeserta.PesertaID).map(p => (
                        <div key={p.PenilaianID} className="p-4 rounded-2xl bg-slate-500/5 border border-slate-200/5 space-y-3">
                          <div className="flex justify-between items-center border-b border-slate-100/10 pb-2">
                            <span className="font-bold text-teal-400">Periode Evaluasi: {p.Periode} ({p.Tanggal})</span>
                            <span className="px-2 py-0.5 rounded-full bg-teal-500 text-white font-bold text-[10px]">{p.Kategori}</span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[11px] pt-1">
                            <div>Disiplin: <strong>{p.Disiplin}/5</strong></div>
                            <div>Tanggung Jawab: <strong>{p.TanggungJawab}/5</strong></div>
                            <div>Kerja Sama: <strong>{p.KerjaSama}/5</strong></div>
                            <div>Kepemimpinan: <strong>{p.Kepemimpinan}/5</strong></div>
                            <div>Kemandirian: <strong>{p.Kemandirian}/5</strong></div>
                            <div>Keaktifan Latihan: <strong>{p.Keaktifan}/5</strong></div>
                          </div>
                          <p className="text-slate-400 italic text-[11px] pt-2 border-t border-slate-100/10">
                            Catatan Kakak Pembina: "{p.Catatan}"
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="flex justify-end pt-3 border-t border-slate-200/10">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-slate-500/10 hover:bg-slate-500/20 text-xs font-semibold rounded-xl"
              >
                Tutup Jendela
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Sub components
interface TabButtonProps {
  id: string;
  label: string;
  icon: any;
  current: string;
  onClick: (id: any) => void;
}

function TabButton({ id, label, icon: Icon, current, onClick }: TabButtonProps) {
  const isSelected = current === id;
  return (
    <button
      onClick={() => onClick(id)}
      className={`px-3 py-1.5 text-xs font-semibold rounded-xl border shrink-0 transition-all flex items-center gap-1.5
        ${isSelected 
          ? "bg-teal-500 text-white border-teal-500 shadow shadow-teal-500/20" 
          : "border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-slate-600"
        }
      `}
    >
      <span>{label}</span>
    </button>
  );
}
