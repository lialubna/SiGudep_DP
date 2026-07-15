/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Menu, Search, Sun, Moon, Bell, ChevronDown, Check, User as UserIcon, Shield } from "lucide-react";
import { UserRole } from "../types";

interface NavbarProps {
  onToggleSidebar: () => void;
  userRole: UserRole;
  userName: string;
  notifications: any[];
  onReadNotification: (id: string) => void;
  onGlobalSearch: (query: string) => void;
  darkTheme: boolean;
  onToggleTheme: () => void;
}

export default function Navbar({
  onToggleSidebar,
  userRole,
  userName,
  notifications,
  onReadNotification,
  onGlobalSearch,
  darkTheme,
  onToggleTheme
}: NavbarProps) {
  const [showNotif, setShowNotif] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchVal, setSearchVal] = useState("");

  const unreadCount = notifications.filter(n => n.Status === "Unread").length;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchVal(e.target.value);
    onGlobalSearch(e.target.value);
  };

  return (
    <header className={`sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b px-6 backdrop-blur transition-colors
      ${darkTheme 
        ? "bg-stone-950/95 border-stone-850 text-stone-100" 
        : "bg-stone-100/95 border-stone-200 text-stone-900"
      }
    `}>
      {/* Left side: Hamburger and breadcrumb */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className={`lg:hidden p-2 rounded-lg transition-colors ${darkTheme ? "hover:bg-stone-900 text-stone-300" : "hover:bg-stone-200 text-stone-600"}`}
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <div className="relative w-48 md:w-80 max-w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
          <input
            type="text"
            placeholder="Pencarian Gudep... (KTA, Peserta, SKU)"
            value={searchVal}
            onChange={handleSearchChange}
            className={`w-full pl-9 pr-4 py-1.5 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all
              ${darkTheme 
                ? "bg-stone-900 border-stone-850 text-stone-100 placeholder:text-stone-500" 
                : "bg-stone-50 border-stone-200 text-stone-900 placeholder:text-stone-400"
              }
            `}
          />
        </div>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className={`p-2 rounded-xl border transition-colors
            ${darkTheme 
              ? "border-stone-850 hover:bg-stone-900 text-yellow-400" 
              : "border-stone-200 hover:bg-stone-200 text-stone-600"
            }
          `}
          title={darkTheme ? "Ganti ke Mode Terang" : "Ganti ke Mode Gelap"}
        >
          {darkTheme ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications center */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotif(!showNotif);
              setShowUserMenu(false);
            }}
            className={`relative p-2 rounded-xl border transition-colors
              ${darkTheme 
                ? "border-stone-850 hover:bg-stone-900 text-stone-300" 
                : "border-stone-200 hover:bg-stone-200 text-stone-600"
              }
            `}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotif && (
            <div className={`absolute right-0 mt-2 w-80 rounded-2xl border p-2 shadow-xl animate-fade-in z-50
              ${darkTheme 
                ? "bg-stone-900 border-stone-850 text-stone-100" 
                : "bg-white border-stone-200 text-stone-900"
              }
            `}>
              <div className="p-2 border-b border-stone-200/10 flex justify-between items-center">
                <span className="font-bold text-xs font-sans">Notifikasi Terbaru</span>
                <span className="text-[10px] text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full font-bold">
                  {unreadCount} baru
                </span>
              </div>
              <div className="max-h-60 overflow-y-auto py-1 space-y-1 mt-2">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-stone-400">Tidak ada notifikasi baru</div>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n.NotifikasiID} 
                      className={`p-2.5 rounded-xl transition-colors text-xs flex gap-2.5 items-start
                        ${n.Status === "Unread" 
                          ? (darkTheme ? "bg-amber-950/20 text-amber-100" : "bg-amber-50 text-stone-900") 
                          : "opacity-60 text-stone-500"
                        }
                      `}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold flex justify-between">
                          <span>{n.Judul}</span>
                          <span className="text-[9px] text-stone-400">{n.Tanggal}</span>
                        </div>
                        <p className="text-[11px] mt-1 text-stone-400 leading-normal">{n.Pesan}</p>
                      </div>
                      {n.Status === "Unread" && (
                        <button 
                          onClick={() => onReadNotification(n.NotifikasiID)}
                          className="text-amber-600 hover:text-amber-700 p-0.5 rounded"
                          title="Tandai dibaca"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotif(false);
            }}
            className={`flex items-center gap-2 p-1.5 rounded-xl border transition-colors text-xs font-medium
              ${darkTheme 
                ? "border-stone-850 hover:bg-stone-900 text-stone-100" 
                : "border-stone-200 hover:bg-stone-200 text-stone-900"
              }
            `}
          >
            <div className="w-6 h-6 rounded-lg bg-amber-600 flex items-center justify-center text-white text-[11px] font-bold border border-amber-700">
              {userName ? userName[0].toUpperCase() : "U"}
            </div>
            <span className="hidden sm:inline-block max-w-[100px] truncate">{userName}</span>
            <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
          </button>

          {showUserMenu && (
            <div className={`absolute right-0 mt-2 w-48 rounded-xl border p-1 shadow-xl animate-fade-in z-50
              ${darkTheme 
                ? "bg-stone-900 border-stone-850 text-stone-100" 
                : "bg-white border-stone-200 text-stone-900"
              }
            `}>
              <div className="px-3 py-2 border-b border-stone-200/10 mb-1 text-[11px] text-stone-400">
                Logged in as <strong className="text-amber-600 dark:text-amber-400 font-bold">{userRole.toLowerCase().replace("_", " ")}</strong>
              </div>
              <div className="flex flex-col gap-1">
                <div className="px-3 py-1.5 text-xs flex items-center gap-2 text-stone-400">
                  <Shield className="w-3.5 h-3.5 text-amber-600" />
                  <span>Sistem SiGudep</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
