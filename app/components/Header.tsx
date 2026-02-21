"use client";

import Image from "next/image";
import Link from "next/link";
import { Dispatch, SetStateAction } from "react";
import { logoutAction } from "../actions/auth";

type HeaderProps = {
  currentUser?: { id: string; username: string; role: string } | null;
  showFilters: boolean;
  setShowFilters: Dispatch<SetStateAction<boolean>>;
};

export default function Header({ currentUser, showFilters, setShowFilters }: HeaderProps) {
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

      {/* Col 3: New Recipe button */}
      <div className="flex items-start justify-center">
        {currentUser ? (
          <Link
            href="/create"
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "#e09849" }}
          >
            + Új recept
          </Link>
        ) : null}
      </div>

      {/* Col 4: Auth section */}
      <div className="flex items-start justify-end">
        {currentUser ? (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <div>
              <p className="font-semibold text-emerald-900">{currentUser.username}</p>
              <p className="text-xs text-emerald-700">{currentUser.role}</p>
            </div>
            <form action={logoutAction}>
              <button className="rounded-lg border border-emerald-300 bg-white px-3 py-1 text-sm font-semibold text-emerald-700 hover:bg-emerald-100">
                Kijelentkezés
              </button>
            </form>
          </div>
        ) : (
          <Link
            href="/auth"
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
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
          className="flex-1 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="rounded-lg px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity whitespace-nowrap"
          style={{ backgroundColor: "#e09849" }}
        >
          Részletes keresés
        </button>
      </div>
    </header>
  );
}
