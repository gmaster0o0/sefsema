"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import type { AuthState } from "../actions/auth";
import { loginAction, registerAction } from "../actions/auth";

const initialState: AuthState = { ok: false, message: "" };

export default function AuthForms() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [registerState, registerFormAction] = useActionState(registerAction, initialState);
  const [loginState, loginFormAction] = useActionState(loginAction, initialState);

  const isLogin = mode === "login";
  const state = isLogin ? loginState : registerState;
  const action = isLogin ? loginFormAction : registerFormAction;

  useEffect(() => {
    if (state.ok) {
      const timer = setTimeout(() => {
        window.location.href = "/";
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [state.ok]);

  return (
    <section className="mx-auto w-full max-w-lg rounded-3xl border border-black/10 bg-white p-8 shadow-sm">
      <h2 className="text-2xl font-semibold">{isLogin ? "Sign in" : "Create account"}</h2>
      <p className="mt-2 text-sm text-zinc-500">
        {isLogin ? "Use your email and password." : "Choose a username and password."}
      </p>

      <form action={action} className="mt-6 grid gap-3">
        {!isLogin ? (
          <label className="grid gap-1 text-sm">
            Username
            <input
              name="username"
              autoComplete="username"
              className="rounded-lg border border-black/10 px-3 py-2"
              required
            />
          </label>
        ) : null}
        <label className="grid gap-1 text-sm">
          Email
          <input
            name="email"
            type="email"
            autoComplete="email"
            className="rounded-lg border border-black/10 px-3 py-2"
            required
          />
        </label>
        <label className="grid gap-1 text-sm">
          Password
          <input
            name="password"
            type="password"
            autoComplete={isLogin ? "current-password" : "new-password"}
            className="rounded-lg border border-black/10 px-3 py-2"
            required
            minLength={8}
          />
        </label>
        {!isLogin ? (
          <label className="grid gap-1 text-sm">
            Confirm password
            <input
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              className="rounded-lg border border-black/10 px-3 py-2"
              required
              minLength={8}
            />
          </label>
        ) : null}
        <button className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white">
          {isLogin ? "Sign in" : "Create account"}
        </button>
        {state.message ? (
          <p className={`text-sm ${state.ok ? "text-emerald-600" : "text-red-600"}`}>{state.message}</p>
        ) : null}
      </form>

      <div className="mt-6 text-sm text-zinc-500">
        {isLogin ? "No account yet?" : "Already have an account?"}{" "}
        <button
          type="button"
          onClick={() => setMode(isLogin ? "register" : "login")}
          className="font-semibold text-zinc-900"
        >
          {isLogin ? "Create one" : "Sign in"}
        </button>
      </div>
    </section>
  );
}
