/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Sparkles, Plus, Search, Filter, Calendar, Award, 
  MapPin, User, Trash2, Edit3, Image, FileText, 
  X, Check, AlertCircle, Eye, Download, Info
} from "lucide-react";
import { Prestasi, Peserta, UserRole } from "../types";

interface PrestasiViewProps {
  prestasiList: Prestasi[];
  pesertaList: Peserta[];
  userRole: UserRole;
  onCreate: (data: Partial<Prestasi>) => Promise<void>;
  onUpdate: (id: string, data: Partial<Prestasi>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  darkTheme: boolean;
}

export default function PrestasiView({
  prestasiList = [],
  pesertaList = [],
  userRole,
  onCreate,
  onUpdate,
  onDelete,
  darkTheme
}: PrestasiViewProps) {
  // Authorization check
  const canManage = ["SUPER_ADMIN", "ADMIN", "PEMBINA"].includes(userRole);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTingkat, setSelectedTingkat] = useState("Semua");
  const [selectedPesertaId, setSelectedPesertaId] = useState("Semua");

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // File size error states
  const [sertifikatError, setSertifikatError] = useState("");
  const [fotoError, setFotoError] = useState("");

  // Form state
  const [formData, setFormData] = useState<Partial<Prestasi>>({
    PesertaID: "",
    NamaPrestasi: "",
    Tingkat: "Pangkalan",
    Penyelenggara: "",
    Tanggal: new Date().toISOString().split("T")[0],
    Sertifikat: "",
    FotoKegiatan: "",
    Deskripsi: ""
  });

  // Detailed view modal state
  const [selectedPrestasi, setSelectedPrestasi] = useState<Prestasi | null>(null);

  // File validation and conversion to base64
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>, 
    type: "Sertifikat" | "FotoKegiatan"
  ) => {
    const file = e.target.files?.[0];
    const setError = type === "Sertifikat" ? setSertifikatError : setFotoError;
    
    setError(""); // Clear previous errors

    if (file) {
      // Check file size (2MB = 2,097,152 bytes)
      const maxSize = 2 * 1024 * 1024;
      if (file.size > maxSize) {
        setError("Ukuran berkas melebihi batasan maksimum 2MB!");
        e.target.value = ""; // Clear file input
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [type]: reader.result as string }));
      };
      reader.onerror = () => {
        setError("Gagal membaca berkas.");
      };
      reader.readAsDataURL(file);
    }
  };

  const openAddModal = () => {
    setIsEdit(false);
    setEditId("");
    setSertifikatError("");
    setFotoError("");
    setFormData({
      PesertaID: pesertaList[0]?.PesertaID || "",
      NamaPrestasi: "",
      Tingkat: "Kabupaten/Kota",
      Penyelenggara: "",
      Tanggal: new Date().toISOString().split("T")[0],
      Sertifikat: "",
      FotoKegiatan: "",
      Deskripsi: ""
    });
    setShowModal(true);
  };

  const openEditModal = (p: Prestasi) => {
    setIsEdit(true);
    setEditId(p.PrestasiID);
    setSertifikatError("");
    setFotoError("");
    setFormData({
      PesertaID: p.PesertaID,
      NamaPrestasi: p.NamaPrestasi,
      Tingkat: p.Tingkat,
      Penyelenggara: p.Penyelenggara,
      Tanggal: p.Tanggal,
      Sertifikat: p.Sertifikat || "",
      FotoKegiatan: p.FotoKegiatan || "",
      Deskripsi: p.Deskripsi || ""
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.NamaPrestasi || !formData.PesertaID || !formData.Penyelenggara) {
      alert("Harap lengkapi semua bidang yang wajib diisi!");
      return;
    }

    if (sertifikatError || fotoError) {
      alert("Harap perbaiki kesalahan berkas sebelum menyimpan!");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEdit) {
        await onUpdate(editId, formData);
      } else {
        await onCreate(formData);
      }
      setShowModal(false);
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan saat menyimpan data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    await onDelete(id);
  };

  // Helper function to get member name by ID
  const getPesertaName = (id: string) => {
    const peserta = pesertaList.find(p => p.PesertaID === id);
    return peserta ? peserta.NamaLengkap : "Anggota tidak ditemukan";
  };

  // Filtered achievements
  const filteredPrestasi = prestasiList.filter(p => {
    const matchesSearch = 
      p.NamaPrestasi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.Penyelenggara.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getPesertaName(p.PesertaID).toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTingkat = selectedTingkat === "Semua" || p.Tingkat === selectedTingkat;
    const matchesPeserta = selectedPesertaId === "Semua" || p.PesertaID === selectedPesertaId;

    return matchesSearch && matchesTingkat && matchesPeserta;
  });

  // Calculate statistics
  const totalPrestasi = filteredPrestasi.length;
  const tingkatNasionalAtauInter = filteredPrestasi.filter(p => 
    p.Tingkat === "Nasional" || p.Tingkat === "Internasional"
  ).length;
  const tingkatDaerahAtauCabang = filteredPrestasi.filter(p => 
    p.Tingkat === "Provinsi" || p.Tingkat === "Kabupaten/Kota"
  ).length;
  const tingkatPangkalanAtauRanting = filteredPrestasi.filter(p => 
    p.Tingkat === "Kecamatan/Ranting" || p.Tingkat === "Pangkalan"
  ).length;

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500 rounded-xl text-stone-950 font-bold shadow-lg shadow-amber-500/20 border border-stone-950">
              <Sparkles className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-stone-900 dark:text-white">
              Prestasi & Penghargaan
            </h1>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Daftar prestasi luar biasa yang dicapai oleh anggota Gugus Depan Pramuka kita.
          </p>
        </div>

        {canManage && (
          <button
            onClick={openAddModal}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-extrabold text-xs rounded-xl shadow-[3px_3px_0px_0px_rgba(28,25,23,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] transition-all flex items-center gap-1.5 uppercase tracking-wider border-2 border-stone-950 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Tambah Prestasi</span>
          </button>
        )}
      </div>

      {/* Stats Summary Bento Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`p-4 rounded-2xl border ${darkTheme ? "bg-stone-900 border-stone-850" : "bg-white border-stone-200"} flex flex-col justify-between`}>
          <span className="text-[10px] uppercase font-bold tracking-widest text-stone-400">Total Prestasi</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-3xl font-black text-amber-500">{totalPrestasi}</span>
            <span className="text-xs font-semibold text-stone-400">Sertifikat</span>
          </div>
        </div>

        <div className={`p-4 rounded-2xl border ${darkTheme ? "bg-stone-900 border-stone-850" : "bg-white border-stone-200"} flex flex-col justify-between`}>
          <span className="text-[10px] uppercase font-bold tracking-widest text-amber-500">Nasional / Inter</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-3xl font-black text-amber-500">{tingkatNasionalAtauInter}</span>
            <span className="text-xs font-semibold text-stone-400">Kejuaraan</span>
          </div>
        </div>

        <div className={`p-4 rounded-2xl border ${darkTheme ? "bg-stone-900 border-stone-850" : "bg-white border-stone-200"} flex flex-col justify-between`}>
          <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-500">Daerah / Cabang</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-3xl font-black text-emerald-500">{tingkatDaerahAtauCabang}</span>
            <span className="text-xs font-semibold text-stone-400">Kejuaraan</span>
          </div>
        </div>

        <div className={`p-4 rounded-2xl border ${darkTheme ? "bg-stone-900 border-stone-850" : "bg-white border-stone-200"} flex flex-col justify-between`}>
          <span className="text-[10px] uppercase font-bold tracking-widest text-blue-500">Ranting / Pangkalan</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-3xl font-black text-blue-500">{tingkatPangkalanAtauRanting}</span>
            <span className="text-xs font-semibold text-stone-400">Kejuaraan</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Panel */}
      <div className={`p-4 rounded-2xl border flex flex-col md:flex-row gap-3 items-center justify-between
        ${darkTheme ? "bg-stone-900 border-stone-850" : "bg-white border-stone-200"}`}
      >
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari prestasi, penyelenggara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-amber-500
              ${darkTheme ? "bg-stone-950 border-stone-800 text-white" : "bg-stone-50 border-stone-200 text-stone-850"}`}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Level Filter */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-stone-400" />
            <select
              value={selectedTingkat}
              onChange={(e) => setSelectedTingkat(e.target.value)}
              className={`text-xs px-3 py-2 rounded-xl border focus:ring-2 focus:ring-amber-500 w-full sm:w-auto
                ${darkTheme ? "bg-stone-950 border-stone-800 text-white" : "bg-stone-50 border-stone-200 text-stone-850"}`}
            >
              <option value="Semua">Semua Tingkatan</option>
              <option value="Pangkalan">Pangkalan (Gudep)</option>
              <option value="Kecamatan/Ranting">Ranting (Kecamatan)</option>
              <option value="Kabupaten/Kota">Cabang (Kabupaten/Kota)</option>
              <option value="Provinsi">Daerah (Provinsi)</option>
              <option value="Nasional">Nasional</option>
              <option value="Internasional">Internasional</option>
            </select>
          </div>

          {/* Member Filter */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <User className="w-3.5 h-3.5 text-stone-400" />
            <select
              value={selectedPesertaId}
              onChange={(e) => setSelectedPesertaId(e.target.value)}
              className={`text-xs px-3 py-2 rounded-xl border focus:ring-2 focus:ring-amber-500 w-full sm:w-auto
                ${darkTheme ? "bg-stone-950 border-stone-800 text-white" : "bg-stone-50 border-stone-200 text-stone-850"}`}
            >
              <option value="Semua">Semua Anggota</option>
              {pesertaList.map(p => (
                <option key={p.PesertaID} value={p.PesertaID}>{p.NamaLengkap}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid List of Achievements */}
      {filteredPrestasi.length === 0 ? (
        <div className={`p-12 text-center rounded-2xl border border-dashed flex flex-col items-center justify-center space-y-3
          ${darkTheme ? "border-stone-800 bg-stone-900/20" : "border-stone-200 bg-stone-50/50"}`}
        >
          <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-stone-900 flex items-center justify-center text-stone-400">
            <Sparkles className="w-6 h-6 text-stone-400" />
          </div>
          <div>
            <h3 className="font-bold text-stone-800 dark:text-stone-200">Belum Ada Data Prestasi</h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 max-w-xs mx-auto mt-1">
              {searchQuery || selectedTingkat !== "Semua" || selectedPesertaId !== "Semua"
                ? "Tidak ada hasil yang cocok dengan kriteria filter pencarian Anda."
                : "Ayo catat pencapaian, lomba, atau penghargaan luar biasa pramuka di sini!"}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrestasi.map((p) => {
            const isNasInter = p.Tingkat === "Nasional" || p.Tingkat === "Internasional";
            const isProvCab = p.Tingkat === "Provinsi" || p.Tingkat === "Kabupaten/Kota";
            
            return (
              <div 
                key={p.PrestasiID}
                className={`rounded-2xl border overflow-hidden flex flex-col transition-all group hover:shadow-lg
                  ${darkTheme ? "bg-stone-900 border-stone-850" : "bg-white border-stone-200"}`}
              >
                {/* Event Photo Cover */}
                <div className="relative h-44 bg-stone-800 flex items-center justify-center overflow-hidden border-b border-stone-200 dark:border-stone-800">
                  {p.FotoKegiatan ? (
                    <img 
                      src={p.FotoKegiatan} 
                      alt={p.NamaPrestasi}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-stone-500 space-y-1.5 p-4">
                      <Image className="w-10 h-10 text-stone-600 stroke-[1.5]" />
                      <span className="text-[10px] font-medium tracking-wide uppercase">Foto Kegiatan</span>
                    </div>
                  )}

                  {/* Level Badge Overlay */}
                  <span className={`absolute top-3 left-3 text-[9px] font-black uppercase px-2.5 py-1 rounded-lg border shadow-md
                    ${isNasInter 
                      ? "bg-amber-500 text-stone-950 border-amber-600" 
                      : isProvCab 
                        ? "bg-emerald-500 text-white border-emerald-600" 
                        : "bg-blue-500 text-white border-blue-600"
                    }`}
                  >
                    Tingkat {p.Tingkat}
                  </span>

                  {/* Action overlays for view */}
                  <div className="absolute inset-0 bg-stone-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      onClick={() => setSelectedPrestasi(p)}
                      className="p-2 bg-white hover:bg-stone-100 text-stone-950 rounded-xl shadow-md transition-transform transform translate-y-2 group-hover:translate-y-0 duration-300 flex items-center gap-1 text-[11px] font-extrabold cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Detail
                    </button>
                  </div>
                </div>

                {/* Content Box */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-extrabold text-stone-900 dark:text-stone-100 text-sm leading-snug tracking-tight group-hover:text-amber-500 transition-colors">
                      {p.NamaPrestasi}
                    </h3>

                    {/* Member Profile */}
                    <div className="flex items-center gap-2 mt-3 p-2 rounded-xl bg-stone-100/50 dark:bg-stone-950/50">
                      <div className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center font-bold text-xs shrink-0">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-black tracking-tight text-stone-800 dark:text-stone-200 truncate">
                          {getPesertaName(p.PesertaID)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 space-y-1 text-stone-500 dark:text-stone-400 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-stone-400" />
                        <span className="truncate">Penyelenggara: <strong className="text-stone-700 dark:text-stone-300 font-semibold">{p.Penyelenggara}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 shrink-0 text-stone-400" />
                        <span>Tanggal: <strong className="text-stone-700 dark:text-stone-300 font-semibold">{p.Tanggal}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="mt-4 pt-3 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between gap-2">
                    <div className="flex gap-2">
                      {p.Sertifikat && (
                        <a
                          href={p.Sertifikat}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 dark:bg-stone-950 dark:hover:bg-stone-900 text-[10px] font-bold rounded-lg border border-stone-300 dark:border-stone-800 text-stone-700 dark:text-stone-300 flex items-center gap-1 transition-colors"
                        >
                          <FileText className="w-3 h-3 text-red-500" />
                          <span>Piagam</span>
                        </a>
                      )}
                    </div>

                    {canManage && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 hover:text-amber-500 rounded-lg transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Apakah Anda yakin ingin menghapus prestasi "${p.NamaPrestasi}"?`)) {
                              handleDelete(p.PrestasiID);
                            }
                          }}
                          className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Insert & Edit Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 bg-stone-950/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]
            ${darkTheme ? "bg-stone-900 border-stone-800 text-white" : "bg-white border-stone-200 text-stone-900"}`}
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex justify-between items-center bg-stone-100/50 dark:bg-stone-950/20">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h3 className="font-extrabold text-sm uppercase tracking-wider">
                  {isEdit ? "Edit Prestasi Gudep" : "Catat Prestasi Baru"}
                </h3>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
              
              {/* PesertaID */}
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-widest text-stone-400 mb-1">
                  Anggota Pramuka Berprestasi <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.PesertaID}
                  onChange={(e) => setFormData(prev => ({ ...prev, PesertaID: e.target.value }))}
                  className={`w-full px-3 py-2 text-xs rounded-xl border focus:ring-2 focus:ring-amber-500
                    ${darkTheme ? "bg-stone-950 border-stone-800 text-white" : "bg-stone-50 border-stone-200 text-stone-800"}`}
                >
                  <option value="" disabled>-- Pilih Anggota Pramuka --</option>
                  {pesertaList.map(p => (
                    <option key={p.PesertaID} value={p.PesertaID}>{p.NamaLengkap} - ({p.Regu || p.GolonganPramuka})</option>
                  ))}
                </select>
              </div>

              {/* Nama Prestasi */}
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-widest text-stone-400 mb-1">
                  Nama Prestasi / Kejuaraan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Juara 1 Lomba Pionering Putra"
                  value={formData.NamaPrestasi}
                  onChange={(e) => setFormData(prev => ({ ...prev, NamaPrestasi: e.target.value }))}
                  className={`w-full px-3 py-2 text-xs rounded-xl border focus:ring-2 focus:ring-amber-500
                    ${darkTheme ? "bg-stone-950 border-stone-800 text-white" : "bg-stone-50 border-stone-200 text-stone-800"}`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Tingkat */}
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-stone-400 mb-1">
                    Tingkat Prestasi <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.Tingkat}
                    onChange={(e) => setFormData(prev => ({ ...prev, Tingkat: e.target.value }))}
                    className={`w-full px-3 py-2 text-xs rounded-xl border focus:ring-2 focus:ring-amber-500
                      ${darkTheme ? "bg-stone-950 border-stone-800 text-white" : "bg-stone-50 border-stone-200 text-stone-800"}`}
                  >
                    <option value="Pangkalan">Pangkalan (Gudep)</option>
                    <option value="Kecamatan/Ranting">Ranting (Kecamatan)</option>
                    <option value="Kabupaten/Kota">Cabang (Kabupaten/Kota)</option>
                    <option value="Provinsi">Daerah (Provinsi)</option>
                    <option value="Nasional">Nasional</option>
                    <option value="Internasional">Internasional</option>
                  </select>
                </div>

                {/* Tanggal */}
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-stone-400 mb-1">
                    Tanggal Perolehan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.Tanggal}
                    onChange={(e) => setFormData(prev => ({ ...prev, Tanggal: e.target.value }))}
                    className={`w-full px-3 py-2 text-xs rounded-xl border focus:ring-2 focus:ring-amber-500
                      ${darkTheme ? "bg-stone-950 border-stone-800 text-white" : "bg-stone-50 border-stone-200 text-stone-800"}`}
                  />
                </div>
              </div>

              {/* Penyelenggara */}
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-widest text-stone-400 mb-1">
                  Penyelenggara <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Kwartir Ranting Kebayoran Baru"
                  value={formData.Penyelenggara}
                  onChange={(e) => setFormData(prev => ({ ...prev, Penyelenggara: e.target.value }))}
                  className={`w-full px-3 py-2 text-xs rounded-xl border focus:ring-2 focus:ring-amber-500
                    ${darkTheme ? "bg-stone-950 border-stone-800 text-white" : "bg-stone-50 border-stone-200 text-stone-800"}`}
                />
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-widest text-stone-400 mb-1">
                  Deskripsi / Catatan Singkat
                </label>
                <textarea
                  rows={2}
                  placeholder="Catatan tambahan mengenai prestasi..."
                  value={formData.Deskripsi}
                  onChange={(e) => setFormData(prev => ({ ...prev, Deskripsi: e.target.value }))}
                  className={`w-full px-3 py-2 text-xs rounded-xl border focus:ring-2 focus:ring-amber-500
                    ${darkTheme ? "bg-stone-950 border-stone-800 text-white" : "bg-stone-50 border-stone-200 text-stone-800"}`}
                />
              </div>

              {/* Upload piagam (Certificate) */}
              <div className="p-3.5 border rounded-xl bg-stone-100/30 dark:bg-stone-950/30 border-stone-200 dark:border-stone-800">
                <label className="block text-[10px] uppercase font-bold tracking-widest text-stone-400 mb-1">
                  Unggah Berkas Piagam / Sertifikat (Max 2MB)
                </label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => handleFileChange(e, "Sertifikat")}
                  className="w-full text-xs text-stone-500 mt-1 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-amber-500 file:text-stone-950 cursor-pointer"
                />
                {sertifikatError && (
                  <p className="text-[10px] text-red-500 flex items-center gap-1 mt-1 font-semibold">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {sertifikatError}
                  </p>
                )}
                {formData.Sertifikat && !sertifikatError && (
                  <div className="mt-2 text-stone-500 text-[10px] font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Piagam berhasil dimuat!</span>
                  </div>
                )}
              </div>

              {/* Upload Foto Kegiatan */}
              <div className="p-3.5 border rounded-xl bg-stone-100/30 dark:bg-stone-950/30 border-stone-200 dark:border-stone-800">
                <label className="block text-[10px] uppercase font-bold tracking-widest text-stone-400 mb-1">
                  Unggah Foto Kegiatan (Max 2MB)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "FotoKegiatan")}
                  className="w-full text-xs text-stone-500 mt-1 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-amber-500 file:text-stone-950 cursor-pointer"
                />
                {fotoError && (
                  <p className="text-[10px] text-red-500 flex items-center gap-1 mt-1 font-semibold">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {fotoError}
                  </p>
                )}
                {formData.FotoKegiatan && !fotoError && (
                  <div className="mt-2 flex items-center gap-3">
                    <div className="w-16 h-10 rounded-lg overflow-hidden border border-stone-300 dark:border-stone-800">
                      <img src={formData.FotoKegiatan} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[10px] font-semibold text-stone-500 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-500" /> Foto kegiatan dimuat!
                    </span>
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 dark:bg-stone-950 dark:hover:bg-stone-900 border border-stone-300 dark:border-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-stone-950 font-extrabold text-xs rounded-xl shadow-md cursor-pointer uppercase tracking-wider"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Data"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detailed Info Modal Dialog */}
      {selectedPrestasi && (
        <div className="fixed inset-0 bg-stone-950/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]
            ${darkTheme ? "bg-stone-900 border-stone-800 text-white" : "bg-white border-stone-200 text-stone-900"}`}
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex justify-between items-center bg-stone-100/50 dark:bg-stone-950/20">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h3 className="font-extrabold text-sm uppercase tracking-wider">
                  Detail Penghargaan Prestasi
                </h3>
              </div>
              <button 
                onClick={() => setSelectedPrestasi(null)}
                className="p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-5 overflow-y-auto">
              
              {/* Event Photo Cover */}
              <div className="relative h-56 bg-stone-800 rounded-xl overflow-hidden border border-stone-200 dark:border-stone-800 flex items-center justify-center">
                {selectedPrestasi.FotoKegiatan ? (
                  <img 
                    src={selectedPrestasi.FotoKegiatan} 
                    alt={selectedPrestasi.NamaPrestasi}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-stone-500 space-y-1.5">
                    <Image className="w-12 h-12 text-stone-600 stroke-[1.5]" />
                    <span className="text-[10px] font-semibold tracking-wide uppercase">Tidak Ada Foto Kegiatan</span>
                  </div>
                )}
              </div>

              {/* Information Blocks */}
              <div className="space-y-3.5">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-stone-400 block">Nama Prestasi / Kejuaraan</span>
                  <h2 className="text-lg font-black text-stone-900 dark:text-white mt-0.5 leading-snug">
                    {selectedPrestasi.NamaPrestasi}
                  </h2>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-stone-100 dark:border-stone-800">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-stone-400">Anggota Pramuka</span>
                    <p className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5 mt-1">
                      <User className="w-4 h-4 text-amber-500" />
                      {getPesertaName(selectedPrestasi.PesertaID)}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-stone-400">Tingkat Prestasi</span>
                    <p className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5 mt-1">
                      <Award className="w-4 h-4 text-amber-500" />
                      {selectedPrestasi.Tingkat}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-stone-400">Penyelenggara</span>
                    <p className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5 mt-1">
                      <MapPin className="w-4 h-4 text-stone-400" />
                      {selectedPrestasi.Penyelenggara}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-stone-400">Tanggal Perolehan</span>
                    <p className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5 mt-1">
                      <Calendar className="w-4 h-4 text-stone-400" />
                      {selectedPrestasi.Tanggal}
                    </p>
                  </div>
                </div>

                {selectedPrestasi.Deskripsi && (
                  <div className="pt-3 border-t border-stone-100 dark:border-stone-800">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-stone-400 block mb-1">Catatan Tambahan / Deskripsi</span>
                    <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed bg-stone-50 dark:bg-stone-950 p-3 rounded-xl border border-stone-100 dark:border-stone-850">
                      {selectedPrestasi.Deskripsi}
                    </p>
                  </div>
                )}
              </div>

              {/* Piagam Certificate preview block */}
              {selectedPrestasi.Sertifikat ? (
                <div className="p-3.5 border rounded-xl bg-stone-50 dark:bg-stone-950 border-stone-200 dark:border-stone-850 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-red-500/10 rounded-lg text-red-500 border border-red-500/20">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200">Piagam & Sertifikat Resmi</h4>
                      <p className="text-[10px] text-stone-500">Berkas verifikasi prestasi tersimpan di Google Drive.</p>
                    </div>
                  </div>
                  <a
                    href={selectedPrestasi.Sertifikat}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-extrabold rounded-lg flex items-center gap-1 transition-colors uppercase tracking-wider"
                  >
                    <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Buka Berkas</span>
                  </a>
                </div>
              ) : (
                <div className="p-3 bg-stone-100/50 dark:bg-stone-950/50 rounded-xl text-center text-[11px] text-stone-500 flex items-center justify-center gap-1.5">
                  <Info className="w-4 h-4 shrink-0 text-stone-400" />
                  <span>Berkas piagam atau sertifikat resmi tidak dilampirkan.</span>
                </div>
              )}

              {/* Actions Footer */}
              <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedPrestasi(null)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-extrabold text-xs rounded-xl shadow-md cursor-pointer uppercase tracking-wider"
                >
                  Selesai
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
