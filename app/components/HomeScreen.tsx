"use client";

import Link from "next/link";

import { useI18n } from "../utils/i18n";
import type { DashboardTemplate } from "../utils/shared";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function HomeScreen({ templates }: { templates: DashboardTemplate[] }) {
  const { t } = useI18n();
  const sortedTemplates = [...templates].sort(
    (left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
  );

  return (
    <main className="min-h-screen bg-white px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 rounded-[32px] border border-black/10 bg-white p-8 shadow-[0_24px_90px_rgba(57,43,24,0.08)] lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-[#b86537]">HAMS Palette</p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight text-stone-900">
              {t("saved template list")}
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-stone-600">
              {t("the main screen reads templates from `data/dashboard.json`.")}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/templates"
              className="inline-flex items-center justify-center rounded-full border border-black/10 bg-[#faf7f1] px-5 py-3 text-sm font-medium text-stone-800"
            >
              Saved List
            </Link>
            <Link
              href="/template"
              className="inline-flex items-center justify-center rounded-full bg-[#1f3b35] px-5 py-3 text-sm font-medium text-white"
            >
              {t("create template")}
            </Link>
          </div>
        </div>

        <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sortedTemplates.length > 0 ? (
            sortedTemplates.map((template) => (
              <article
                key={template.id}
                className="rounded-[28px] border border-black/10 bg-white p-6 shadow-[0_16px_40px_rgba(57,43,24,0.06)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-[#b66537]">
                      {t("template")}
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold text-stone-900">
                      {template.title}
                    </h2>
                  </div>
                  <span className="rounded-full border border-black/10 bg-[#f6ede1] px-3 py-1 text-xs text-stone-600">
                    {template.layout.length} {t("blocks")}
                  </span>
                </div>

                <p className="mt-4 min-h-12 text-sm leading-6 text-stone-600">
                  {template.description || t("no description")}
                </p>

                <p className="mt-3 text-xs text-stone-500">
                  /{template.userId}/{template.templateKey}
                </p>

                <div className="mt-6 flex items-center justify-between text-xs text-stone-500">
                  <span>
                    {t("updated")} {formatDate(template.updatedAt)}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={`/template?id=${template.id}`}
                    className="inline-flex items-center justify-center rounded-full border border-black/10 bg-[#faf7f1] px-4 py-2 text-sm text-stone-800"
                  >
                    Edit Template
                  </Link>
                  <Link
                    href={`/${template.userId}/${template.templateKey}`}
                    className="inline-flex items-center justify-center rounded-full bg-[#1f3b35] px-4 py-2 text-sm text-white"
                  >
                    Open Page
                  </Link>
                </div>
              </article>
            ))
          ) : (
            <div className="md:col-span-2 xl:col-span-3 rounded-[28px] border border-dashed border-black/15 bg-[#fffaf3] p-10 text-center text-stone-600">
              {t("no saved templates yet. use create template to add one.")}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
