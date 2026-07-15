/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  LayoutDashboard, Users, Award, ShieldAlert, CheckSquare, 
  Calendar, BookOpen, Boxes, FileSpreadsheet, UserCheck, 
  Bell, FileText, CreditCard, Settings, LogOut, Star, Smile, Sparkles
} from "lucide-react";
import { UserRole } from "../types";

interface SidebarProps {
  currentTab: string;
  setTab: (tab: string) => void;
  userRole: UserRole;
  userName: string;
  gudepName: string;
  gudepNumber: string;
  onLogout: () => void;
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  themeColor: string;
  darkTheme: boolean;
}

export default function Sidebar({
  currentTab,
  setTab,
  userRole,
  userName,
  gudepName,
  gudepNumber,
  onLogout,
  isOpen,
  setIsOpen,
  themeColor,
  darkTheme
}: SidebarProps) {
  
  // Custom navigation menu mapping depending on user permissions
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["SUPER_ADMIN", "ADMIN", "PEMBINA", "PESERTA_DIDIK"] },
    { id: "peserta", label: "Data Peserta", icon: Users, roles: ["SUPER_ADMIN", "ADMIN", "PEMBINA"] },
    { id: "pembina", label: "Data Pembina", icon: UserCheck, roles: ["SUPER_ADMIN", "ADMIN"] },
    { id: "sensus", label: "Master User & Log", icon: ShieldAlert, roles: ["SUPER_ADMIN", "ADMIN"] },
    { id: "sku_tkk", label: "SKU & TKK", icon: Award, roles: ["SUPER_ADMIN", "ADMIN", "PEMBINA", "PESERTA_DIDIK"] },
    { id: "aktivitas", label: "Jadwal & Absensi", icon: Calendar, roles: ["SUPER_ADMIN", "ADMIN", "PEMBINA", "PESERTA_DIDIK"] },
    { id: "materi", label: "Materi Latihan", icon: BookOpen, roles: ["SUPER_ADMIN", "ADMIN", "PEMBINA", "PESERTA_DIDIK"] },
    { id: "evaluasi", label: "Refleksi & Karakter", icon: Smile, roles: ["SUPER_ADMIN", "ADMIN", "PEMBINA", "PESERTA_DIDIK"] },
    { id: "kta", label: "KTA Digital", icon: CreditCard, roles: ["SUPER_ADMIN", "ADMIN", "PEMBINA", "PESERTA_DIDIK"] },
    { id: "inventaris", label: "Inventaris Gudep", icon: Boxes, roles: ["SUPER_ADMIN", "ADMIN"] },
    { id: "sistem", label: "Pengaturan & Backup", icon: Settings, roles: ["SUPER_ADMIN", "ADMIN"] }
  ];

  const visibleMenuItems = menuItems.filter(item => item.roles.includes(userRole));

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside 
        className={`fixed inset-y-0 left-0 z-40 w-64 transform lg:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col border-r
          ${darkTheme 
            ? "bg-stone-950 border-stone-850 text-stone-100" 
            : "bg-stone-900 border-stone-800 text-stone-100"
          }
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-stone-950 font-bold text-xl shadow-lg shadow-amber-500/20 border border-stone-950">
            ⛺
          </div>
          <div className="min-w-0">
            <h1 className="font-bold tracking-tight text-lg text-white leading-tight">SiGudep</h1>
            <p className="text-[10px] uppercase tracking-widest text-amber-400 font-bold">Gudep {gudepNumber || "03.045"}</p>
          </div>
        </div>

        {/* User Card */}
        <div className="p-4 bg-black/15 border border-white/5 mx-3 mt-3 rounded-xl flex items-center gap-3 shadow-inner">
          <div className="w-10 h-10 rounded-full bg-amber-700 flex items-center justify-center text-white font-semibold text-sm shadow-md border border-stone-700">
            {userName ? userName.slice(0, 2).toUpperCase() : "U"}
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-semibold text-white truncate">{userName}</h4>
            <span className="inline-block px-2 py-0.5 mt-1 text-[9px] font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wide">
              {userRole.replace("_", " ")}
            </span>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
          {visibleMenuItems.map(item => {
            const IconComp = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-link-${item.id}`}
                onClick={() => {
                  setTab(item.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all group relative uppercase tracking-wider
                  ${isActive 
                    ? "bg-amber-600 text-white font-extrabold border-2 border-stone-950 dark:border-white shadow-[3px_3px_0px_0px_rgba(28,25,23,1)] dark:shadow-[3px_3px_0px_0px_rgba(250,250,250,0.15)]" 
                    : "text-stone-300 hover:bg-white/5 hover:text-white"
                  }
                `}
              >
                <IconComp className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? "text-white" : "text-stone-400 group-hover:text-stone-200"}`} />
                <span>{item.label}</span>
                {isActive && (
                  <span className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer & Logout Section */}
        <div className="p-4 border-t border-white/10 space-y-3">
          <button
            onClick={() => onLogout()}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Keluar Sesi</span>
          </button>
          
          <div className="text-center text-[10px] text-slate-400 font-mono">
            SiGudep v1.0 • Stable
          </div>
        </div>
      </aside>
    </>
  );
}
