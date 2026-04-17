"use client";

import dynamic from "next/dynamic";

import { createEmptyFormioSchema, type FormioSchema } from "../utils/shared";

const FormioForm = dynamic(async () => (await import("@formio/react")).Form, {
  ssr: false,
});

export function FormioRenderedContent({
  schema,
}: {
  schema?: FormioSchema | null;
}) {
  const resolvedSchema = schema ?? createEmptyFormioSchema();

  if ((resolvedSchema.components?.length ?? 0) === 0) {
    return null;
  }

  return (
    <div className="formio-runtime-shell rounded-[16px] border border-black/8 bg-white p-4">
      <FormioForm src={resolvedSchema as never} form={resolvedSchema as never} options={{ noAlerts: true }} />
    </div>
  );
}
