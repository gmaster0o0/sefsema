"use client";

import { useActionState, useState } from "react";

import { updateProfileAction, type UserActionState } from "../actions/user";
import type { SessionUser } from "../lib/auth";

const initialState: UserActionState = { ok: false, message: "" };

type ProfileFormProps = {
  currentUser: SessionUser;
};

export default function ProfileForm({ currentUser }: ProfileFormProps) {
  const [state, formAction] = useActionState(updateProfileAction, initialState);
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const response = await fetch("/api/upload-avatar", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      setAvatarUrl(data.avatarUrl);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Feltoltes sikertelen.");
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  return (
    <section className="mt-8 rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold">Profil</h2>

      {state.message && (
        <div
          className={`mt-4 rounded-lg border px-4 py-3 text-sm ${
            state.ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {state.message}
        </div>
      )}

      <form action={formAction}>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1 text-sm">
            Felhasznalonev
            <input
              name="username"
              className="rounded-lg border border-black/10 px-3 py-2"
              placeholder="Felhasznalonev"
              defaultValue={currentUser.username}
            />
          </label>
          <label className="grid gap-1 text-sm">
            Email
            <input
              name="email"
              type="email"
              className="rounded-lg border border-black/10 px-3 py-2"
              placeholder="email@pelda.hu"
              defaultValue={currentUser.email}
            />
          </label>
          <div className="grid gap-1 text-sm sm:col-span-2">
            <label>Avatar</label>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                dragActive ? "border-[#e09849] bg-orange-50" : "border-black/10 bg-zinc-50"
              }`}
            >
              {avatarUrl && (
                <div className="mb-4 flex justify-center">
                  <img src={avatarUrl} alt="Avatar" className="h-24 w-24 rounded-full object-cover" />
                </div>
              )}
              <p className="mb-2 text-sm text-zinc-600">
                {uploading ? "Feltoltes..." : "Huzd ide a kepet, vagy kattints a gombra"}
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
                id="avatar-upload"
                disabled={uploading}
              />
              <label
                htmlFor="avatar-upload"
                className="inline-block cursor-pointer rounded-lg border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
              >
                Kep kivalasztasa
              </label>
            </div>
            <input name="avatarUrl" type="hidden" value={avatarUrl} />
          </div>
        </div>
        <button
          type="submit"
          className="mt-4 rounded-lg bg-[#e09849] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          disabled={uploading}
        >
          Mentes
        </button>
      </form>
    </section>
  );
}
