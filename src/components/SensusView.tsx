/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Plus, Edit, Trash2, Key, Search, ShieldCheck, ShieldAlert, X, Shield, Activity, Clock } from "lucide-react";
import { User, LogAktivitas, UserRole } from "../types";

interface SensusViewProps {
  usersList: User[];
  logsList: LogAktivitas[];
  onCreateUser: (data: Partial<User>) => void;
  onUpdateUser: (id: string, data: Partial<User>) => void;
  onDeleteUser: (id: string) => void;
  darkTheme: boolean;
}

export default function SensusView({
  usersList,
  logsList,
  onCreateUser,
  onUpdateUser,
  onDeleteUser,
  darkTheme
}: SensusViewProps) {
  const [subTab, setSubTab] = useState<"users" | "audit">("users");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  
  // Form states
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState("");
  const [formData, setFormData] = useState<Partial<User>>({
    Username: "", NamaLengkap: "", PasswordHash: "", Role: "PEMBINA", Status: "Aktif"
  });

  const filteredUsers = usersList.filter(u => 
    u.Username.toLowerCase().includes(search.toLowerCase()) ||
    u.NamaLengkap.toLowerCase().includes(search.toLowerCase()) ||
    u.Role.toLowerCase().includes(search.toLowerCase())
  );

  const filteredLogs = logsList.filter(l => 
    l.Nama.toLowerCase().includes(search.toLowerCase()) ||
    l.Modul.toLowerCase().includes(search.toLowerCase()) ||
    l.Aktivitas.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.Username || !formData.NamaLengkap) {
      alert("Username dan Nama Lengkap wajib diisi!");
      return;
    }
    if (isEdit) {
      onUpdateUser(editId, formData);
    } else {
      onCreateUser(formData);
    }
    setShowModal(false);
  };

  const openAddForm = () => {
    setIsEdit(false);
    setFormData({
      Username: "", NamaLengkap: "", PasswordHash: "123456", Role: "PEMBINA", Status: "Aktif"
    });
    setShowModal(true);
  };

  const openEditForm = (u: User) => {
    setIsEdit(true);
    setEditId(u.UserID);
    setFormData({
      Username: u.Username, NamaLengkap: u.NamaLengkap, Role: u.Role, Status: u.Status
    });
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans">Master Pengguna & Audit Trail</h2>
          <p className="text-xs text-slate-400 mt-1">Kelola hak akses personil Gudep (Admin, Pembina, Siswa) dan amati log kepatuhan sistem.</p>
        </div>
        <div className="flex gap-1 bg-slate-500/10 p-1 rounded-xl border border-slate-300/10 self-start sm:self-auto">
          <button
            onClick={() => { setSubTab("users"); setSearch(""); }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5
              ${subTab === "users" ? "bg-teal-500 text-white shadow" : "text-slate-400 hover:text-slate-600"}`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Hak Akses</span>
          </button>
          <button
            onClick={() => { setSubTab("audit"); setSearch(""); }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5
              ${subTab === "audit" ? "bg-teal-500 text-white shadow" : "text-slate-400 hover:text-slate-600"}`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Audit Trail</span>
          </button>
        </div>
      </div>

      {/* Search tool */}
      <div className={`p-4 rounded-2xl border flex items-center gap-3
        ${darkTheme ? "bg-slate-800/40 border-slate-700/80" : "bg-white border-slate-200"}
      `}>
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder={subTab === "users" ? "Cari pengguna..." : "Cari aksi log audit..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full pl-9 pr-4 py-1.5 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-teal-500
              ${darkTheme ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-800"}`}
          />
        </div>
        {subTab === "users" && (
          <button
            onClick={openAddForm}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-teal-500 text-white hover:bg-teal-600 transition-all flex items-center gap-1 shadow-md shadow-teal-500/10"
          >
            <Plus className="w-4 h-4" />
            <span>Buat User Baru</span>
          </button>
        )}
      </div>

      {/* TABLE DATA REPRESENTATION */}
      {subTab === "users" ? (
        <div className={`border rounded-2xl overflow-hidden shadow-sm
          ${darkTheme ? "bg-slate-800/40 border-slate-700/80" : "bg-white border-slate-200"}
        `}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className={`border-b font-semibold text-slate-400
                  ${darkTheme ? "bg-slate-800/60 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
                  <th className="p-4">Nama Lengkap</th>
                  <th className="p-4">Username</th>
                  <th className="p-4">Peranan (Role)</th>
                  <th className="p-4">Status Akun</th>
                  <th className="p-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/10">
                {filteredUsers.map(u => (
                  <tr key={u.UserID} className="hover:bg-slate-500/5 transition-colors">
                    <td className="p-4 font-bold text-teal-500">{u.NamaLengkap}</td>
                    <td className="p-4 font-mono font-medium">{u.Username}</td>
                    <td className="p-4 font-semibold uppercase">{u.Role.replace("_", " ")}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold
                        ${u.Status === "Aktif" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
                        {u.Status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => openEditForm(u)}
                          className={`p-1.5 rounded-lg border hover:bg-teal-500 hover:text-white transition-all
                            ${darkTheme ? "border-slate-700 text-slate-300" : "border-slate-200 text-slate-600"}`}
                          title="Edit User"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            const newPass = prompt(`Ganti sandi untuk ${u.Username}. Masukkan sandi baru:`);
                            if (newPass) {
                              onUpdateUser(u.UserID, { PasswordHash: newPass });
                              alert("Sandi berhasil diupdate!");
                            }
                          }}
                          className={`p-1.5 rounded-lg border hover:bg-amber-500 hover:text-white transition-all
                            ${darkTheme ? "border-slate-700 text-slate-300" : "border-slate-200 text-slate-600"}`}
                          title="Reset Sandi"
                        >
                          <Key className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteUser(u.UserID)}
                          className={`p-1.5 rounded-lg border hover:bg-red-500 hover:text-white transition-all
                            ${darkTheme ? "border-slate-700 text-slate-300" : "border-slate-200 text-slate-600"}`}
                          title="Hapus Akun"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* AUDIT TRAIL LOGS VIEW */
        <div className={`border rounded-2xl overflow-hidden shadow-sm
          ${darkTheme ? "bg-slate-800/40 border-slate-700/80" : "bg-white border-slate-200"}
        `}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className={`border-b font-semibold text-slate-400
                  ${darkTheme ? "bg-slate-800/60 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
                  <th className="p-4">Tanggal / Jam</th>
                  <th className="p-4">Nama Pelaku</th>
                  <th className="p-4">Hak Akses</th>
                  <th className="p-4">Modul</th>
                  <th className="p-4">Aksi Audit</th>
                  <th className="p-4">Detail Perubahan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/10">
                {filteredLogs.map(log => (
                  <tr key={log.LogID} className="hover:bg-slate-500/5 transition-colors">
                    <td className="p-4 font-mono font-medium whitespace-nowrap">
                      <div className="flex items-center gap-1 text-slate-400">
                        <Clock className="w-3 h-3 text-teal-500" />
                        <span>{log.Tanggal} {log.Jam}</span>
                      </div>
                    </td>
                    <td className="p-4 font-semibold">{log.Nama}</td>
                    <td className="p-4 uppercase text-slate-400 font-mono text-[10px]">{log.Role}</td>
                    <td className="p-4 font-semibold text-teal-400">{log.Modul}</td>
                    <td className="p-4 font-medium">{log.Aktivitas}</td>
                    <td className="p-4 text-slate-400 max-w-xs truncate" title={log.Keterangan}>{log.Keterangan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- CRUD MODAL USER --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-2xl p-6 shadow-2xl animate-fade-in flex flex-col
            ${darkTheme ? "bg-slate-900 border border-slate-800 text-white" : "bg-white text-slate-800"}
          `}>
            <div className="flex justify-between items-center pb-4 border-b border-slate-200/10">
              <h3 className="font-bold text-base font-sans">{isEdit ? "Ubah Akun Pengguna" : "Daftarkan Akun Baru"}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-slate-100/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="py-4 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Nama Lengkap Pemilik *</label>
                <input
                  type="text"
                  value={formData.NamaLengkap}
                  onChange={(e) => setFormData(prev => ({ ...prev, NamaLengkap: e.target.value }))}
                  className={`w-full px-3 py-2 text-xs rounded-xl border focus:ring-2 focus:ring-teal-500
                    ${darkTheme ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-800"}`}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Username *</label>
                <input
                  type="text"
                  value={formData.Username}
                  onChange={(e) => setFormData(prev => ({ ...prev, Username: e.target.value }))}
                  className={`w-full px-3 py-2 text-xs rounded-xl border
                    ${darkTheme ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`}
                  required
                  disabled={isEdit}
                />
              </div>

              {!isEdit && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Kata Sandi Awal *</label>
                  <input
                    type="password"
                    value={formData.PasswordHash}
                    onChange={(e) => setFormData(prev => ({ ...prev, PasswordHash: e.target.value }))}
                    className={`w-full px-3 py-2 text-xs rounded-xl border
                      ${darkTheme ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`}
                    required
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Peranan Akses</label>
                  <select
                    value={formData.Role}
                    onChange={(e) => setFormData(prev => ({ ...prev, Role: e.target.value as any }))}
                    className={`w-full px-3 py-2 text-xs rounded-xl border
                      ${darkTheme ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`}
                  >
                    <option value="SUPER_ADMIN">Super Admin</option>
                    <option value="ADMIN">Admin</option>
                    <option value="PEMBINA">Pembina</option>
                    <option value="PESERTA_DIDIK">Peserta Didik</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Status Akun</label>
                  <select
                    value={formData.Status}
                    onChange={(e) => setFormData(prev => ({ ...prev, Status: e.target.value as any }))}
                    className={`w-full px-3 py-2 text-xs rounded-xl border
                      ${darkTheme ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`}
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                    <option value="Ditangguhkan">Ditangguhkan</option>
                  </select>
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
                {isEdit ? "Simpan Perubahan" : "Buat Akun"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
