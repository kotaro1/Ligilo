"use client";

import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  async function signOut() {
    await createClient().auth.signOut();
    window.location.href = "/login";
  }

  return (
    <button onClick={signOut} className="text-muted hover:text-ink">
      ログアウト
    </button>
  );
}
