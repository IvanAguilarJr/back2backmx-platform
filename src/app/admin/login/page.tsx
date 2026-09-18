"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Logo from "@/components/Logo";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace("/admin");
    } catch {
      setError("Correo o contraseña incorrectos.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-1 items-center justify-center bg-bg px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-[22px] border border-line bg-bg p-8"
      >
        <Logo className="h-9" />
        <h1 className="mt-3 font-display text-2xl font-bold text-ink">
          Panel del equipo
        </h1>
        <p className="mt-1 text-sm text-muted">
          Inicia sesión para publicar y editar contenido.
        </p>

        <label className="mt-6 block text-sm font-medium text-ink">
          Correo
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-xl border border-line bg-paper-soft px-3 py-2 text-ink outline-none focus:border-ink"
          />
        </label>

        <label className="mt-4 block text-sm font-medium text-ink">
          Contraseña
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border border-line bg-paper-soft px-3 py-2 text-ink outline-none focus:border-ink"
          />
        </label>

        {error && <p className="mt-4 text-sm font-medium text-ink">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 w-full rounded-full bg-yellow px-5 py-3 font-medium text-ink transition-colors hover:bg-yellow-deep disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </main>
  );
}
