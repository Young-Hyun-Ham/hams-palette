"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";

import { createEmptyFormioSchema, type FormioSchema } from "../utils/shared";

const FormioForm = dynamic(async () => (await import("@formio/react")).Form, {
  ssr: false,
});

export function FormioRenderedContent({
  schema,
  borderEnabled,
  borderWidth,
}: {
  schema?: FormioSchema | null;
  borderEnabled?: boolean;
  borderWidth?: number;
}) {
  useEffect(() => {
    const head = document.head;
    const stylesheets = [
      { id: "formio-runtime-form-css", href: "/formio/formio.form.min.css" },
    ];
    const touched: HTMLLinkElement[] = [];

    stylesheets.forEach(({ id, href }) => {
      const existing = document.getElementById(id) as HTMLLinkElement | null;
      if (existing) {
        const nextCount = Number(existing.dataset.refCount ?? "0") + 1;
        existing.dataset.refCount = String(nextCount);
        return;
      }

      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = href;
      link.dataset.refCount = "1";
      head.appendChild(link);
      touched.push(link);
    });

    return () => {
      stylesheets.forEach(({ id }) => {
        const existing = document.getElementById(id) as HTMLLinkElement | null;
        if (!existing) {
          return;
        }

        const nextCount = Math.max(0, Number(existing.dataset.refCount ?? "1") - 1);
        if (nextCount === 0) {
          existing.remove();
          return;
        }

        existing.dataset.refCount = String(nextCount);
      });

      touched.forEach((link) => {
        if (link.isConnected && Number(link.dataset.refCount ?? "0") <= 0) {
          link.remove();
        }
      });
    };
  }, []);

  const resolvedSchema = schema ?? createEmptyFormioSchema();

  if ((resolvedSchema.components?.length ?? 0) === 0) {
    return null;
  }

  return (
    <div
      className={`formio-runtime-shell rounded-[16px] bg-white p-4 ${borderEnabled ? "border border-black/8" : ""}`}
      style={borderEnabled ? { borderWidth: `${borderWidth ?? 1}px` } : undefined}
    >
      <FormioForm src={resolvedSchema as never} form={resolvedSchema as never} options={{ noAlerts: true }} />
    </div>
  );
}
