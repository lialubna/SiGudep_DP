/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'PEMBINA' | 'PESERTA_DIDIK';

export interface AppConfig {
  NamaAplikasi: string;
  NamaGudep: string;
  NomorGudep: string;
  AlamatGudep: string;
  Logo: string;
  Favicon: string;
  ThemeColor: string;
  SpreadsheetID: string;
  FolderDriveID: string;
  ScriptURL: string;
  Versi: string;
  TahunAktif: string;
  Email: string;
  Telepon: string;
  Website: string;
  CreatedAt: string;
  UpdatedAt: string;
  GugusDepanID?: string;
  NomorPutra?: string;
  NomorPutri?: string;
  NamaMabigus?: string;
  Kwarcab?: string;
  Kwarda?: string;
  AlamatSekretariat?: string;
}

export interface User {
  UserID: string;
  Username: string;
  PasswordHash: string;
  Role: UserRole;
  NamaLengkap: string;
  PembinaID?: string;
  PesertaID?: string;
  Status: 'Aktif' | 'Nonaktif' | 'Ditangguhkan';
  LastLogin?: string;
  CreatedAt: string;
  UpdatedAt: string;
}

export interface Pembina {
  PembinaID: string;
  Foto: string;
  Nama: string;
  NomorKTA: string;
  NIP: string;
  Jabatan: string;
  Golongan: string;
  NoHP: string;
  Email: string;
  Alamat: string;
  TanggalMasuk: string;
  Status: 'Aktif' | 'Cuti' | 'Pensiun';
  CreatedAt: string;
  UpdatedAt: string;
}

export interface Peserta {
  PesertaID: string;
  NomorKTA: string;
  Foto: string;
  NamaLengkap: string;
  NamaPanggilan: string;
  NISN: string;
  TempatLahir: string;
  TanggalLahir: string;
  JenisKelamin: 'Laki-laki' | 'Perempuan';
  Agama: string;
  GolonganDarah: string;
  Alamat: string;
  Sekolah: string;
  Kelas: string;
  GolonganPramuka: 'Siaga' | 'Penggalang' | 'Penegak' | 'Pandega';
  Tingkat: string;
  Regu: string;
  NoHP: string;
  NamaAyah: string;
  NamaIbu: string;
  NoHPOrangTua: string;
  TanggalMasukGudep: string;
  Status: 'Aktif' | 'Alumni' | 'Pindah';
  CreatedAt: string;
  UpdatedAt: string;
}

export interface MasterSKU {
  SkuID: string;
  Golongan: 'Siaga' | 'Penggalang' | 'Penegak' | 'Pandega';
  Tingkat: string;
  NomorButir: number;
  Bidang: string;
  Deskripsi: string;
  Urutan: number;
  Status: 'Aktif' | 'Nonaktif';
}

export interface ProgressSKU {
  ProgressID: string;
  PesertaID: string;
  SkuID: string;
  Status: 'Belum Dinilai' | 'Proses' | 'Lulus' | 'Perlu Mengulang';
  TanggalValidasi?: string;
  PembinaID?: string;
  Catatan?: string;
  Lampiran?: string;
  CreatedAt: string;
}

export interface TingkatHistory {
  TingkatID: string;
  PesertaID: string;
  Golongan: string;
  TingkatLama: string;
  TingkatBaru: string;
  Tanggal: string;
  PembinaID: string;
  Catatan: string;
}

export interface TKKAward {
  TKKID: string;
  PesertaID: string;
  NamaTKK: string;
  Bidang: string;
  Tingkatan: 'Purwa' | 'Madya' | 'Utama';
  Tanggal: string;
  PembinaID: string;
  NomorSertifikat: string;
  Catatan: string;
}

export interface AbsensiPeserta {
  AbsensiID: string;
  PesertaID: string;
  Tanggal: string;
  JamMasuk: string;
  Status: 'Hadir' | 'Izin' | 'Sakit' | 'Alfa';
  Latitude?: number;
  Longitude?: number;
  Lokasi?: string;
  Foto?: string;
  PembinaID?: string;
}

export interface AbsensiPembina {
  AbsensiID: string;
  PembinaID: string;
  Tanggal: string;
  JamMasuk: string;
  Status: 'Hadir' | 'Izin' | 'Sakit' | 'Alfa';
  Latitude?: number;
  Longitude?: number;
  Lokasi?: string;
}

export interface Jadwal {
  JadwalID: string;
  Judul: string;
  Tanggal: string;
  Jam: string;
  Lokasi: string;
  Deskripsi: string;
  Lampiran?: string;
  CreatedBy: string;
}

export interface KalenderKegiatan {
  KalenderID: string;
  Judul: string;
  Mulai: string;
  Selesai: string;
  Jenis: 'Latihan' | 'Pelantikan' | 'Perkemahan' | 'Lomba' | 'Rapat' | 'Bakti Sosial' | 'Kegiatan Lainnya';
  Keterangan: string;
}

export interface Materi {
  MateriID: string;
  Judul: string;
  Kategori: string;
  JenisFile: 'Google Docs' | 'Google Slides' | 'Google PDF' | 'Drive PDF' | 'Video YouTube';
  Link: string;
  Embed?: string;
  Deskripsi: string;
  Tanggal: string;
  PembinaID: string;
}

export interface Pengumuman {
  PengumumanID: string;
  Judul: string;
  Isi: string;
  Tanggal: string;
  Lampiran?: string;
  Status: 'Draft' | 'Publish' | 'Arsip';
}

export interface Notifikasi {
  NotifikasiID: string;
  Judul: string;
  Pesan: string;
  Role: string; // 'ALL' or specific role
  Tanggal: string;
  Status: 'Unread' | 'Read';
}

export interface Portofolio {
  PortofolioID: string;
  PesertaID: string;
  Kategori: string;
  Judul: string;
  Deskripsi: string;
  Tanggal: string;
  Lampiran?: string;
}

export interface Prestasi {
  PrestasiID: string;
  PesertaID: string;
  NamaPrestasi: string;
  Tingkat: string;
  Penyelenggara: string;
  Tanggal: string;
  Sertifikat?: string;
}

export interface Sertifikat {
  SertifikatID: string;
  PesertaID: string;
  Nama: string;
  Nomor: string;
  Tanggal: string;
  File: string;
}

export interface Galeri {
  GaleriID: string;
  Album: string;
  Judul: string;
  DriveFileID: string;
  DriveURL: string;
  Tanggal: string;
  Uploader: string;
}

export interface Inventaris {
  InventarisID: string;
  NamaBarang: string;
  Kategori: 'Tenda' | 'Tongkat' | 'Kompas' | 'Semaphore' | 'Bendera' | 'P3K' | 'Tali' | 'Lampu' | 'Peralatan Masak' | 'Lainnya';
  KodeBarang: string;
  Jumlah: number;
  Satuan: string;
  Kondisi: 'Baik' | 'Rusak';
  Lokasi: string;
  TanggalPerolehan: string;
  Keterangan: string;
}

export interface RefleksiSiswa {
  RefleksiID: string;
  PesertaID: string;
  Tanggal: string;
  Isi: string;
  Lampiran?: string;
}

export interface RefleksiPembina {
  RefleksiID: string;
  PembinaID: string;
  PesertaID: string;
  Tanggal: string;
  Isi: string;
}

export interface PenilaianSikap {
  PenilaianID: string;
  PesertaID: string;
  PembinaID: string;
  Periode: 'Mingguan' | 'Bulanan' | 'Semester' | 'Tahunan';
  Tanggal: string;
  Disiplin: number; // 1-5
  TanggungJawab: number; // 1-5
  KerjaSama: number; // 1-5
  Kepemimpinan: number; // 1-5
  Kemandirian: number; // 1-5
  Keaktifan: number; // 1-5
  NilaiTotal: number;
  NilaiRataRata: number;
  Kategori: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Perlu Pembinaan' | 'Pembinaan Intensif';
  Catatan: string;
  CreatedAt: string;
  UpdatedAt: string;
}

export interface LogAktivitas {
  LogID: string;
  Tanggal: string;
  Jam: string;
  UserID: string;
  Nama: string;
  Role: string;
  Modul: string;
  Aktivitas: string;
  DataID: string;
  Keterangan: string;
}
