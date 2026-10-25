import Link from "next/link";
import { LigiloProvider } from "@/lib/data";
import { SignOutButton } from "@/components/SignOutButton";
import { DataGate } from "@/components/DataGate";
import { LogoMark } from "@/components/Scenery";

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <LigiloProvider>
      <header className="border-b border-line/70 bg-bg/70 backdrop-blur">
        <nav className="mx-auto flex max-w-2xl items-center gap-5 px-4 py-3 text-sm">
          <Link href="/" className="flex items-center gap-2">
            <LogoMark />
            <span className="font-serif-jp text-lg font-bold">Ligilo</span>
          </Link>
          <Link href="/" className="text-muted hover:text-ink">
            ホーム
          </Link>
          <Link href="/words" className="text-muted hover:text-ink">
            単語一覧
          </Link>
          <span className="ml-auto">
            <SignOutButton />
          </span>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 pb-48">
        <DataGate>{children}</DataGate>
      </main>
    </LigiloProvider>
  );
}
