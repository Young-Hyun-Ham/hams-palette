"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

import { useI18n } from "../utils/i18n";
import { paletteItems } from "../utils/shared";

const FormioForm = dynamic(async () => (await import("@formio/react")).Form, {
  ssr: false,
});

export type LayerPaletteFormValues = {
  paletteId: string;
  cols: number;
  contentHeight: number;
};

type LayerContentPaletteFormProps = {
  initialValues: LayerPaletteFormValues;
  isEditing: boolean;
  onSubmit: (values: LayerPaletteFormValues) => void;
  onCancelEdit: () => void;
};

export function LayerContentPaletteForm({
  initialValues,
  isEditing,
  onSubmit,
  onCancelEdit,
}: LayerContentPaletteFormProps) {
  const { t } = useI18n();

  const formSchema = useMemo(
    () => ({
      display: "form",
      components: [
        {
          type: "select",
          key: "paletteId",
          label: t("palette type"),
          input: true,
          dataSrc: "values",
          data: {
            values: paletteItems.map((item) => ({
              label: t(item.name),
              value: item.id,
            })),
          },
          validate: { required: true },
          defaultValue: initialValues.paletteId,
        },
        {
          type: "number",
          key: "cols",
          label: t("columns"),
          input: true,
          validate: { required: true, min: 1, max: 12 },
          defaultValue: initialValues.cols,
        },
        {
          type: "number",
          key: "contentHeight",
          label: t("content height"),
          input: true,
          validate: { required: true, min: 0 },
          defaultValue: initialValues.contentHeight,
        },
        {
          type: "button",
          key: "submit",
          label: isEditing ? t("update block") : t("add block"),
          action: "submit",
          theme: "primary",
          disableOnInvalid: true,
        },
      ],
    }),
    [initialValues.cols, initialValues.contentHeight, initialValues.paletteId, isEditing, t],
  );

  return (
    <div className="space-y-3">
      <div className="layer-formio-shell rounded-[18px] border border-black/10 bg-[#fffdfa] p-4">
        <FormioForm
          key={`${initialValues.paletteId}-${initialValues.cols}-${initialValues.contentHeight}-${isEditing ? "edit" : "add"}`}
          src={formSchema as never}
          submission={{ data: initialValues }}
          options={{ noAlerts: true }}
          onSubmit={(submission) => {
            const data = submission.data as Partial<LayerPaletteFormValues>;
            onSubmit({
              paletteId: data.paletteId ?? initialValues.paletteId,
              cols: Math.max(1, Math.min(12, Number(data.cols) || initialValues.cols)),
              contentHeight: Math.max(0, Number(data.contentHeight) || 0),
            });
          }}
        />
      </div>

      {isEditing ? (
        <button
          type="button"
          onClick={onCancelEdit}
          className="rounded-full border border-black/10 bg-white px-3 py-2 text-xs"
        >
          {t("reset form")}
        </button>
      ) : null}
    </div>
  );
}
