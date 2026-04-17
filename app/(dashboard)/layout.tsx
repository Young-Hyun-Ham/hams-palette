import Link from "next/link";

import { LanguageSelect } from "@/app/components/LanguageSelect";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-full flex flex-col">
      <div className="px-6 pt-6">
        <div className="mx-auto flex w-full max-w-[1880px] items-center justify-between gap-4">
          <nav className="flex flex-wrap items-center gap-2 text-sm text-stone-700">
            <Link href="/" className="rounded-full border border-black/10 bg-white px-4 py-2">
              Home
            </Link>
            <Link href="/templates" className="rounded-full border border-black/10 bg-white px-4 py-2">
              Saved List
            </Link>
            <Link href="/template" className="rounded-full border border-black/10 bg-white px-4 py-2">
              Create
            </Link>
          </nav>
          <LanguageSelect />
        </div>
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}
