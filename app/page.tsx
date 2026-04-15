import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <div className="w-full max-w-3xl rounded-[32px] border border-black/10 bg-[#fbf5ec]/90 p-8 shadow-[0_20px_80px_rgba(57,43,24,0.12)]">
        <p className="text-sm uppercase tracking-[0.28em] text-[#b86537]">
          HAMS HP Palette
        </p>
        <h1 className="mt-4 text-4xl font-semibold leading-tight text-stone-900">
          홈페이지 메인 제작 화면은 `/create` 에서 관리합니다.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-stone-600">
          프레임 분할, 블록 배치, 콘텐츠 미리보기 중심의 관리자 퍼블리싱 화면을
          별도 경로로 분리했습니다.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/create"
            className="rounded-full bg-[#1f3b35] px-5 py-3 text-sm font-medium text-white"
          >
            제작 화면 열기
          </Link>
        </div>
      </div>
    </main>
  );
}
