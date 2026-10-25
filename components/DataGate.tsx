"use client";

import { useLigilo } from "@/lib/data";

/** Shows loading / error / empty states before the real page renders. */
export function DataGate({ children }: { children: React.ReactNode }) {
  const { loading, error, words } = useLigilo();

  if (loading) return <p className="text-sm text-muted">読み込み中...</p>;
  if (error && words.length === 0) {
    return <p className="text-sm text-hard">読み込みに失敗しました: {error}</p>;
  }
  if (words.length === 0) {
    return (
      <p className="text-sm text-muted">
        単語がまだ登録されていません。単語データのSQLをSupabaseで実行してください。
      </p>
    );
  }
  return (
    <>
      {error && <p className="mb-4 text-sm text-hard">{error}</p>}
      {children}
    </>
  );
}
