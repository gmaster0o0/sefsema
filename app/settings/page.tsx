import Link from "next/link";

import { getCurrentUser } from "../lib/auth";
import PasswordForm from "./PasswordForm";
import ProfileForm from "./ProfileForm";
import AppearanceForm from "./AppearanceForm";

export default async function SettingsPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-zinc-50 px-6 py-12 text-zinc-900">
        <main className="mx-auto w-full max-w-3xl">
          <p className="text-center text-sm text-zinc-600">Nem vagy bejelentkezve.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-12 text-zinc-900">
      <main className="mx-auto w-full max-w-3xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Beallitasok</h1>
            <p className="mt-2 text-sm text-zinc-600">Alap beallitasok a profilhoz es a felulethez.</p>
          </div>
          <Link
            href="/"
            className="rounded-lg bg-[#e09849] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90"
          >
            Vissza a fooldalra
          </Link>
        </div>

        <ProfileForm currentUser={currentUser} />

        <PasswordForm />

        <AppearanceForm currentUser={currentUser} />
      </main>
    </div>
  );
}
