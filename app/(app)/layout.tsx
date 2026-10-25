import Link from "next/link";
import { LigiloProvider } from "@/lib/data";
import { SignOutButton } from "@/components/SignOutButton";
import { DataGate } from "@/components/DataGate";

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <LigiloProvider>
      <header className="border-b border-neutral-200 dark:border-neutral-800">
        <nav className="mx-auto flex max-w-2xl items-center gap-4 px-4 py-3 text-sm">
          <Link href="/" className="font-semibold">
            Ligilo
          </Link>
          <Link href="/" className="text-neutral-600 dark:text-neutral-400">
            ホーム
          </Link>
          <Link href="/words" className="text-neutral-600 dark:text-neutral-400">
            単語一覧
          </Link>
          <span className="ml-auto">
            <SignOutButton />
          </span>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
        <DataGate>{children}</DataGate>
      </main>
    </LigiloProvider>
  );
}
