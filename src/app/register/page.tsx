"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const body = await res.json();

    if (!res.ok) {
      setLoading(false);
      setError(body.error ?? "Erreur lors de la creation du compte.");
      return;
    }

    const signInRes = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (signInRes?.error) {
      router.push("/login");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink px-4">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-2xl font-semibold text-paper mb-1">Creer un compte</h1>
        <p className="text-mute text-sm mb-8">Gestionnaire d'achat-revente Vinted</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-mute mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-panel border border-line rounded-tag px-3 py-2 text-paper outline-none focus:border-amber"
            />
          </div>
          <div>
            <label className="block text-sm text-mute mb-1">Mot de passe (8 caracteres min.)</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-panel border border-line rounded-tag px-3 py-2 text-paper outline-none focus:border-amber"
            />
          </div>
          {error && <p className="text-clay text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber text-ink font-medium rounded-tag py-2 hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Creation..." : "Creer mon compte"}
          </button>
        </form>
        <p className="text-mute text-sm mt-6">
          Deja un compte ?{" "}
          <Link href="/login" className="text-amber hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
