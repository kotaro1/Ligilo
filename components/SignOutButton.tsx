"use client";

import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  async function signOut() {
    await createClient().auth.signOut();
    window.location.href = "/login";
  }

  return (
    <button
      onClick={signOut}
      className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
    >
      ログアウト
    </button>
  );
}
