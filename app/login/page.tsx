"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { LogoMark } from "@/components/Scenery";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        shouldCreateUser: false,
      },
    });

    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
      return;
    }
    setStatus("sent");
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="rise w-full max-w-sm rounded-3xl border border-line bg-surface p-8 shadow-sm">
        <div className="mb-1 flex items-center gap-2">
          <LogoMark size={32} />
          <h1 className="font-serif-jp text-2xl font-bold">Ligilo</h1>
        </div>
        <p className="mb-6 text-sm text-muted">
          メールアドレスにログインリンクを送ります
        </p>

        {status === "sent" ? (
          <p className="text-sm">
            {email} 宛にログインリンクを送信しました。メールを確認してください。
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-line bg-bg px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full rounded-xl bg-primary px-3 py-2.5 text-sm font-medium text-primary-ink disabled:opacity-50"
            >
              {status === "sending" ? "送信中..." : "ログインリンクを送る"}
            </button>
            {status === "error" && (
              <p className="text-sm text-hard">{errorMessage}</p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
