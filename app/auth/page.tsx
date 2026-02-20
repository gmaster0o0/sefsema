import Link from "next/link";

import AuthForms from "../components/AuthForms";
import { getCurrentUser } from "../lib/auth";
import { logoutAction } from "../actions/auth";

export default async function AuthPage() {
  const currentUser = await getCurrentUser();

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-12 text-zinc-900">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-10">
        <header className="flex items-center gap-4">
          <Link href="/" className="rounded-full border border-black/10 px-4 py-2 text-sm">
            ← Back
          </Link>
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-zinc-400">Account</p>
            <h1 className="text-3xl font-semibold leading-tight">Sign up or sign in</h1>
          </div>
        </header>

        {currentUser && (
          <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
            <h2 className="text-lg font-semibold text-emerald-900">Session active</h2>
            <p className="mt-2 text-sm text-emerald-700">
              Signed in as <span className="font-semibold">{currentUser.username}</span> ({currentUser.role})
            </p>
            <form action={logoutAction} className="mt-4">
              <button className="rounded-lg border border-emerald-300 px-4 py-2 text-sm font-semibold text-emerald-700">
                Sign out
              </button>
            </form>
          </section>
        )}

        <AuthForms />
      </main>
    </div>
  );
}
