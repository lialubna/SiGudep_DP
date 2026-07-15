/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  AppConfig, User, Pembina, Peserta, MasterSKU, ProgressSKU, 
  TingkatHistory, TKKAward, AbsensiPeserta, AbsensiPembina, 
  Jadwal, KalenderKegiatan, Materi, Pengumuman, Notifikasi, 
  Inventaris, RefleksiSiswa, RefleksiPembina, PenilaianSikap, LogAktivitas 
} from "../types";

// Base API fetches helper
async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {})
    }
  });
  if (!response.ok) {
    const errText = await response.text();
    let errMsg = `Request failed: ${response.status}`;
    try {
      const errJson = JSON.parse(errText);
      errMsg = errJson.message || errMsg;
    } catch {}
    throw new Error(errMsg);
  }
  return response.json() as Promise<T>;
}

export const API = {
  // Setup database
  async setupDB(): Promise<{ success: boolean; message: string }> {
    return request("/api/setup", { method: "POST" });
  },

  // Auth Login
  async login(username: string, password: string): Promise<{ success: boolean; user: any; message?: string }> {
    return request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password })
    });
  },

  // Config
  async getConfig(): Promise<AppConfig> {
    return request("/api/config");
  },
  async updateConfig(config: Partial<AppConfig>): Promise<{ success: boolean; configs: AppConfig }> {
    return request("/api/config", {
      method: "PUT",
      body: JSON.stringify(config)
    });
  },
  async syncGoogleSheets(): Promise<{ success: boolean; message: string; configs?: AppConfig }> {
    return request("/api/sistem/sync", { method: "POST" });
  },
  async initializeGoogleSheets(): Promise<{ success: boolean; message: string }> {
    return request("/api/sistem/init", { method: "POST" });
  },

  // Users
  async getUsers(): Promise<User[]> {
    return request("/api/users");
  },
  async createUser(user: Partial<User>): Promise<{ success: boolean; user: User }> {
    return request("/api/users", {
      method: "POST",
      body: JSON.stringify(user)
    });
  },
  async updateUser(id: string, user: Partial<User>): Promise<{ success: boolean; user: User }> {
    return request(`/api/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(user)
    });
  },
  async deleteUser(id: string): Promise<{ success: boolean }> {
    return request(`/api/users/${id}`, { method: "DELETE" });
  },

  // Pembina
  async getPembina(): Promise<Pembina[]> {
    return request("/api/pembina");
  },
  async createPembina(data: Partial<Pembina>): Promise<{ success: boolean; pembina: Pembina }> {
    return request("/api/pembina", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },
  async updatePembina(id: string, data: Partial<Pembina>): Promise<{ success: boolean; pembina: Pembina }> {
    return request(`/api/pembina/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    });
  },
  async deletePembina(id: string): Promise<{ success: boolean }> {
    return request(`/api/pembina/${id}`, { method: "DELETE" });
  },

  // Peserta
  async getPeserta(): Promise<Peserta[]> {
    return request("/api/peserta");
  },
  async createPeserta(data: Partial<Peserta>): Promise<{ success: boolean; peserta: Peserta }> {
    return request("/api/peserta", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },
  async updatePeserta(id: string, data: Partial<Peserta>): Promise<{ success: boolean; peserta: Peserta }> {
    return request(`/api/peserta/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    });
  },
  async deletePeserta(id: string): Promise<{ success: boolean }> {
    return request(`/api/peserta/${id}`, { method: "DELETE" });
  },

  // Master SKU
  async getMasterSKU(): Promise<MasterSKU[]> {
    return request("/api/sku/master");
  },
  async createMasterSKU(data: Partial<MasterSKU>): Promise<{ success: boolean; sku: MasterSKU }> {
    return request("/api/sku/master", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },
  async updateMasterSKU(id: string, data: Partial<MasterSKU>): Promise<{ success: boolean; sku: MasterSKU }> {
    return request(`/api/sku/master/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    });
  },
  async deleteMasterSKU(id: string): Promise<{ success: boolean }> {
    return request(`/api/sku/master/${id}`, { method: "DELETE" });
  },

  // Progress SKU
  async getProgressSKU(): Promise<ProgressSKU[]> {
    return request("/api/sku/progress");
  },
  async saveProgressSKU(data: Partial<ProgressSKU>): Promise<{ success: boolean; progress: ProgressSKU }> {
    return request("/api/sku/progress", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },

  // TKK Awards
  async getTKK(): Promise<TKKAward[]> {
    return request("/api/tkk");
  },
  async awardTKK(data: Partial<TKKAward>): Promise<{ success: boolean; tkk: TKKAward }> {
    return request("/api/tkk", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },
  async deleteTKK(id: string): Promise<{ success: boolean }> {
    return request(`/api/tkk/${id}`, { method: "DELETE" });
  },

  // Kenaikan Tingkat
  async getTingkat(): Promise<TingkatHistory[]> {
    return request("/api/tingkat");
  },
  async promoteTingkat(data: Partial<TingkatHistory>): Promise<{ success: boolean; tingkat: TingkatHistory }> {
    return request("/api/tingkat", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },

  // Absensi
  async getAbsensiPeserta(): Promise<AbsensiPeserta[]> {
    return request("/api/absensi/peserta");
  },
  async recordAbsensiPeserta(data: Partial<AbsensiPeserta>): Promise<{ success: boolean; absensi: AbsensiPeserta }> {
    return request("/api/absensi/peserta", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },
  async getAbsensiPembina(): Promise<AbsensiPembina[]> {
    return request("/api/absensi/pembina");
  },
  async recordAbsensiPembina(data: Partial<AbsensiPembina>): Promise<{ success: boolean; absensi: AbsensiPembina }> {
    return request("/api/absensi/pembina", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },

  // Jadwal
  async getJadwal(): Promise<Jadwal[]> {
    return request("/api/jadwal");
  },
  async createJadwal(data: Partial<Jadwal>): Promise<{ success: boolean; jadwal: Jadwal }> {
    return request("/api/jadwal", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },
  async deleteJadwal(id: string): Promise<{ success: boolean }> {
    return request(`/api/jadwal/${id}`, { method: "DELETE" });
  },

  // Kalender
  async getKalender(): Promise<KalenderKegiatan[]> {
    return request("/api/kalender");
  },
  async createKalender(data: Partial<KalenderKegiatan>): Promise<{ success: boolean; kalender: KalenderKegiatan }> {
    return request("/api/kalender", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },
  async deleteKalender(id: string): Promise<{ success: boolean }> {
    return request(`/api/kalender/${id}`, { method: "DELETE" });
  },

  // Materi
  async getMateri(): Promise<Materi[]> {
    return request("/api/materi");
  },
  async createMateri(data: Partial<Materi>): Promise<{ success: boolean; materi: Materi }> {
    return request("/api/materi", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },
  async deleteMateri(id: string): Promise<{ success: boolean }> {
    return request(`/api/materi/${id}`, { method: "DELETE" });
  },

  // Pengumuman
  async getPengumuman(): Promise<Pengumuman[]> {
    return request("/api/pengumuman");
  },
  async createPengumuman(data: Partial<Pengumuman>): Promise<{ success: boolean; pengumuman: Pengumuman }> {
    return request("/api/pengumuman", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },
  async deletePengumuman(id: string): Promise<{ success: boolean }> {
    return request(`/api/pengumuman/${id}`, { method: "DELETE" });
  },

  // Inventaris
  async getInventaris(): Promise<Inventaris[]> {
    return request("/api/inventaris");
  },
  async createInventaris(data: Partial<Inventaris>): Promise<{ success: boolean; inventaris: Inventaris }> {
    return request("/api/inventaris", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },
  async updateInventaris(id: string, data: Partial<Inventaris>): Promise<{ success: boolean; inventaris: Inventaris }> {
    return request(`/api/inventaris/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    });
  },
  async deleteInventaris(id: string): Promise<{ success: boolean }> {
    return request(`/api/inventaris/${id}`, { method: "DELETE" });
  },

  // Refleksi
  async getRefleksiSiswa(): Promise<RefleksiSiswa[]> {
    return request("/api/refleksi/siswa");
  },
  async createRefleksiSiswa(data: Partial<RefleksiSiswa>): Promise<{ success: boolean; refleksi: RefleksiSiswa }> {
    return request("/api/refleksi/siswa", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },
  async getRefleksiPembina(): Promise<RefleksiPembina[]> {
    return request("/api/refleksi/pembina");
  },
  async createRefleksiPembina(data: Partial<RefleksiPembina>): Promise<{ success: boolean; refleksi: RefleksiPembina }> {
    return request("/api/refleksi/pembina", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },

  // Penilaian Sikap
  async getPenilaianSikap(): Promise<PenilaianSikap[]> {
    return request("/api/penilaian_sikap");
  },
  async createPenilaianSikap(data: Partial<PenilaianSikap>): Promise<{ success: boolean; penilaian: PenilaianSikap }> {
    return request("/api/penilaian_sikap", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },

  // Logs
  async getLogs(): Promise<LogAktivitas[]> {
    return request("/api/logs");
  },

  // Notifikasi
  async getNotifikasi(): Promise<Notifikasi[]> {
    return request("/api/notifikasi");
  },
  async readNotifikasi(id: string): Promise<{ success: boolean }> {
    return request(`/api/notifikasi/${id}`, { method: "PUT" });
  },

  // Backup / Restore
  async triggerRestore(backupData: any): Promise<{ success: boolean; message: string }> {
    return request("/api/restore", {
      method: "POST",
      body: JSON.stringify(backupData)
    });
  }
};
