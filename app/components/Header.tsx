"use client";

import Image from "next/image";
import Link from "next/link";
import type { Dispatch, SetStateAction } from "react";
import { useRouter } from "next/navigation";
import { logoutAction } from "../actions/auth";

type HeaderProps = {
  currentUser?: { id: string; username: string; role: string } | null;
  showFilters?: boolean;
  setShowFilters?: Dispatch<SetStateAction<boolean>>;
  searchQuery?: string;
  setSearchQuery?: Dispatch<SetStateAction<string>>;
};

export default function Header({ currentUser, showFilters, setShowFilters, searchQuery, setSearchQuery }: HeaderProps) {
  const router = useRouter();
  const userInitials = currentUser?.username
    ? currentUser.username
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("")
    : "U";

  return (
    <header className="grid grid-cols-4 gap-6 rounded-3xl border border-black/10 bg-[#3B585E] p-6 shadow-sm">
      {/* Left: Logo (spans 2 rows) */}
      <div className="row-span-2 flex items-center justify-center">
        <Image
          src="/sefsema_final_v3.png"
          alt="Séfséma logo"
          width={512}
          height={512}
          className="h-40 w-40 object-contain sm:h-48 sm:w-48"
          priority
        />
      </div>

      {/* TOP row (right side) */}
      {/* Col 2: Tagline */}
      <div className="flex items-start">
        <p className="max-w-xs text-sm text-zinc-100">Saját receptek megosztása és mások receptjeinek felfedezése</p>
      </div>

      {/* Col 3: Spacer */}
      <div className="flex items-start justify-center" />

      {/* Col 4: Auth section */}
      <div className="flex items-start justify-end gap-3">
        {currentUser ? (
          <>
            <Link
              href="/create"
              className="h-10 rounded-lg px-5 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity whitespace-nowrap"
              style={{ backgroundColor: "#e09849" }}
            >
              + Új recept
            </Link>
            <details className="relative">
              <summary className="list-none">
                <div
                  className="flex h-10 items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm whitespace-nowrap"
                  style={{ backgroundColor: "#e09849" }}
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
                    {userInitials}
                  </span>
                  <span className="max-w-[140px] truncate">{currentUser.username}</span>
                  <span className="text-xs">▾</span>
                </div>
              </summary>
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-black/10 bg-white p-2 text-sm shadow-lg">
                <Link
                  href="/settings"
                  className="block rounded-lg px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
                >
                  Beállítások
                </Link>
                <Link
                  href="/my-recipes"
                  className="block rounded-lg px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
                >
                  Receptjeim
                </Link>
                <form action={logoutAction}>
                  <button className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-zinc-700 hover:bg-zinc-50">
                    Kijelentkezés
                  </button>
                </form>
              </div>
            </details>
          </>
        ) : (
          <Link
            href="/auth"
            className="h-10 rounded-lg px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "#e09849" }}
          >
            Bejelentkezés
          </Link>
        )}
      </div>

      {/* BOTTOM row: Search (spans cols 2-4) */}
      <div className="col-span-3 flex gap-2 items-end">
        <input
          type="text"
          placeholder="Keress receptek..."
          value={searchQuery ?? ""}
          onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              // Navigate to shareable URL with query and open filters
              const term = (e.currentTarget as HTMLInputElement).value || searchQuery || "";
              if (term.trim()) {
                router.push(`/?q=${encodeURIComponent(term.trim())}`);
              }
            }
          }}
          className="flex-1 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
        <button
          onClick={() => setShowFilters && setShowFilters(!showFilters)}
          className="h-10 rounded-lg px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity whitespace-nowrap"
          style={{ backgroundColor: "#e09849" }}
        >
          Részletes keresés
        </button>
      </div>
    </header>
  );
}
