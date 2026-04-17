"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";

import { useI18n } from "../utils/i18n";
import { createEmptyFormioSchema, type FormioSchema } from "../utils/shared";

const FormioForm = dynamic(async () => (await import("@formio/react")).Form, {
  ssr: false,
});

type FormioComponent = Record<string, unknown> & {
  type: string;
  key: string;
  label?: string;
};

type FieldDefinition = {
  id: string;
  title: string;
  description: string;
  create: (index: number) => FormioComponent;
};

const FIELD_DEFINITIONS: FieldDefinition[] = [
  {
    id: "textfield",
    title: "Input",
    description: "Single line text input",
    create: (index) => ({
      type: "textfield",
      key: `textField${index}`,
      label: "Input",
      placeholder: "Enter text",
      input: true,
      validate: { required: false },
    }),
  },
  {
    id: "email",
    title: "Email",
    description: "Email input",
    create: (index) => ({
      type: "email",
      key: `email${index}`,
      label: "Email",
      placeholder: "name@example.com",
      input: true,
      validate: { required: false },
    }),
  },
  {
    id: "number",
    title: "Number",
    description: "Numeric input",
    create: (index) => ({
      type: "number",
      key: `number${index}`,
      label: "Number",
      placeholder: "0",
      input: true,
      validate: { required: false },
    }),
  },
  {
    id: "textarea",
    title: "Textarea",
    description: "Multi line text area",
    create: (index) => ({
      type: "textarea",
      key: `textArea${index}`,
      label: "Textarea",
      placeholder: "Enter details",
      input: true,
      rows: 3,
      validate: { required: false },
    }),
  },
  {
    id: "checkbox",
    title: "Checkbox",
    description: "Single checkbox",
    create: (index) => ({
      type: "checkbox",
      key: `checkbox${index}`,
      label: "Checkbox",
      input: true,
      validate: { required: false },
    }),
  },
  {
    id: "radio",
    title: "Radio",
    description: "Single choice options",
    create: (index) => ({
      type: "radio",
      key: `radio${index}`,
      label: "Radio",
      input: true,
      values: [
        { label: "Option 1", value: "option1" },
        { label: "Option 2", value: "option2" },
      ],
      validate: { required: false },
    }),
  },
  {
    id: "select",
    title: "Selectbox",
    description: "Dropdown options",
    create: (index) => ({
      type: "select",
      key: `select${index}`,
      label: "Selectbox",
      input: true,
      dataSrc: "values",
      data: {
        values: [
          { label: "Option 1", value: "option1" },
          { label: "Option 2", value: "option2" },
        ],
      },
      template: "<span>{{ item.label }}</span>",
      validate: { required: false },
    }),
  },
  {
    id: "button",
    title: "Submit Button",
    description: "Form submit action",
    create: (index) => ({
      type: "button",
      key: `submit${index}`,
      label: "Submit",
      action: "submit",
      theme: "primary",
      disableOnInvalid: true,
      input: true,
    }),
  },
];

function cloneSchema(schema: FormioSchema) {
  return JSON.parse(JSON.stringify(schema)) as FormioSchema;
}

function slugifyKey(value: string) {
  const normalized = value
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part, index) =>
      index === 0
        ? part.charAt(0).toLowerCase() + part.slice(1)
        : part.charAt(0).toUpperCase() + part.slice(1),
    )
    .join("");

  return normalized || "field";
}

function uniqueKey(baseKey: string, components: FormioComponent[], currentKey?: string) {
  let nextKey = slugifyKey(baseKey);
  let suffix = 1;

  while (components.some((component) => component.key === nextKey && component.key !== currentKey)) {
    nextKey = `${slugifyKey(baseKey)}${suffix}`;
    suffix += 1;
  }

  return nextKey;
}

function parseOptionLines(input: string) {
  return input
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [rawLabel, rawValue] = line.split("|");
      const label = rawLabel.trim();
      const value = (rawValue ?? rawLabel).trim();
      return {
        label,
        value: slugifyKey(value),
      };
    });
}

function readOptionLines(component: FormioComponent) {
  const radioValues = Array.isArray(component.values) ? component.values : [];
  const selectValues =
    component.data && typeof component.data === "object" && Array.isArray((component.data as { values?: unknown[] }).values)
      ? ((component.data as { values: Array<{ label?: string; value?: string }> }).values ?? [])
      : [];
  const source = component.type === "radio" ? radioValues : selectValues;

  return source
    .map((item) => `${String(item.label ?? "")}|${String(item.value ?? "")}`)
    .join("\n");
}

function updateComponentAt(
  schema: FormioSchema,
  key: string,
  updater: (component: FormioComponent, components: FormioComponent[]) => FormioComponent,
) {
  const components = (schema.components ?? []) as FormioComponent[];
  return {
    ...schema,
    components: components.map((component) =>
      component.key === key ? updater(component, components) : component,
    ),
  };
}

function moveComponent(components: FormioComponent[], key: string, direction: "up" | "down") {
  const index = components.findIndex((component) => component.key === key);
  if (index < 0) {
    return components;
  }

  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= components.length) {
    return components;
  }

  const next = [...components];
  const [moved] = next.splice(index, 1);
  next.splice(targetIndex, 0, moved);
  return next;
}

export function FormioBuilderModal({
  initialSchema,
  onClose,
  onSave,
}: {
  initialSchema?: FormioSchema | null;
  onClose: () => void;
  onSave: (schema: FormioSchema) => void;
}) {
  const { t } = useI18n();
  const [schema, setSchema] = useState<FormioSchema>(initialSchema ?? createEmptyFormioSchema());
  const [selectedKey, setSelectedKey] = useState<string | null>(
    (initialSchema?.components?.[0] as FormioComponent | undefined)?.key ?? null,
  );

  const components = useMemo(
    () => ((schema.components ?? []) as FormioComponent[]),
    [schema],
  );

  const selectedComponent = useMemo(
    () => components.find((component) => component.key === selectedKey) ?? components[0] ?? null,
    [components, selectedKey],
  );

  useEffect(() => {
    const head = document.head;
    const stylesheetIds = ["formio-bootstrap-css", "formio-form-css"];
    const stylesheetHrefs = ["/formio/bootstrap.min.css", "/formio/formio.form.min.css"];
    const appended: HTMLLinkElement[] = [];

    stylesheetIds.forEach((id, index) => {
      const existing = document.getElementById(id) as HTMLLinkElement | null;
      if (existing) {
        return;
      }

      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = stylesheetHrefs[index];
      head.appendChild(link);
      appended.push(link);
    });

    return () => {
      appended.forEach((link) => link.remove());
    };
  }, []);

  useEffect(() => {
    const nextSchema = cloneSchema(initialSchema ?? createEmptyFormioSchema());
    setSchema(nextSchema);
    setSelectedKey(((nextSchema.components?.[0] as FormioComponent | undefined)?.key ?? null));
  }, [initialSchema]);

  const addField = (definition: FieldDefinition) => {
    setSchema((current) => {
      const currentComponents = (current.components ?? []) as FormioComponent[];
      const nextComponent = definition.create(currentComponents.length + 1);
      nextComponent.key = uniqueKey(nextComponent.key, currentComponents);
      const nextSchema = {
        ...current,
        display: current.display ?? "form",
        components: [...currentComponents, nextComponent],
      };
      setSelectedKey(nextComponent.key);
      return nextSchema;
    });
  };

  const updateSelectedComponent = (updater: (component: FormioComponent, components: FormioComponent[]) => FormioComponent) => {
    if (!selectedComponent) {
      return;
    }

    setSchema((current) => updateComponentAt(current, selectedComponent.key, updater));
  };

  const removeSelectedComponent = () => {
    if (!selectedComponent) {
      return;
    }

    setSchema((current) => {
      const currentComponents = (current.components ?? []) as FormioComponent[];
      const nextComponents = currentComponents.filter((component) => component.key !== selectedComponent.key);
      setSelectedKey(nextComponents[0]?.key ?? null);
      return {
        ...current,
        components: nextComponents,
      };
    });
  };

  const moveSelectedComponent = (direction: "up" | "down") => {
    if (!selectedComponent) {
      return;
    }

    setSchema((current) => ({
      ...current,
      components: moveComponent((current.components ?? []) as FormioComponent[], selectedComponent.key, direction),
    }));
  };

  const optionLines = selectedComponent ? readOptionLines(selectedComponent) : "";
  const supportsPlaceholder =
    selectedComponent &&
    ["textfield", "textarea", "email", "number"].includes(selectedComponent.type);
  const supportsOptions =
    selectedComponent &&
    ["radio", "select"].includes(selectedComponent.type);
  const supportsRequired =
    selectedComponent &&
    selectedComponent.type !== "button";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2">
      <div className="flex h-[94vh] w-full max-w-[1760px] flex-col overflow-hidden rounded-[30px] bg-[#fcf7f1] shadow-[0_30px_90px_rgba(0,0,0,0.35)]">
        <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[#b66537]">Custom Form Builder</p>
            <h3 className="mt-2 text-xl font-semibold">{t("layer form builder")}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm"
          >
            {t("close")}
          </button>
        </div>

        <div className="grid flex-1 gap-4 overflow-auto px-4 py-3 xl:grid-cols-[0.95fr_1fr_1.35fr_1.5fr]">
          <section className="flex min-h-0 flex-col rounded-[24px] border border-black/10 bg-white p-4">
            <p className="text-sm font-semibold text-stone-900">Field List</p>
            <p className="mt-1 text-xs text-stone-500">Choose a field type and add it to the layer.</p>
            <div className="mt-4 min-h-0 flex-1 space-y-3 overflow-auto pr-1">
              {FIELD_DEFINITIONS.map((definition) => (
                <button
                  key={definition.id}
                  type="button"
                  onClick={() => addField(definition)}
                  className="w-full rounded-[18px] border border-black/10 bg-white px-4 py-3 text-left transition hover:border-[#d86c3b] hover:bg-[#fff8f2]"
                >
                  <p className="text-sm font-semibold text-stone-900">{definition.title}</p>
                  <p className="mt-1 text-xs text-stone-500">{definition.description}</p>
                </button>
              ))}
            </div>
          </section>

          <section className="flex min-h-0 flex-col rounded-[24px] border border-black/10 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-stone-900">Added Fields</p>
              <span className="text-xs text-stone-500">{components.length} items</span>
            </div>
            <div className="mt-4 min-h-0 flex-1 space-y-2 overflow-auto pr-1">
              {components.length > 0 ? (
                components.map((component, index) => (
                  <button
                    key={component.key}
                    type="button"
                    onClick={() => setSelectedKey(component.key)}
                    className={`w-full rounded-[16px] border px-4 py-3 text-left transition ${
                      selectedComponent?.key === component.key
                        ? "border-[#d86c3b] bg-[#fff4eb]"
                        : "border-black/10 bg-white hover:bg-[#faf7f1]"
                    }`}
                  >
                    <p className="text-sm font-semibold text-stone-900">
                      {String(index + 1).padStart(2, "0")}. {String(component.label ?? component.key)}
                    </p>
                    <p className="mt-1 text-xs text-stone-500">
                      {component.type} / {component.key}
                    </p>
                  </button>
                ))
              ) : (
                <div className="rounded-[16px] border border-dashed border-black/10 px-4 py-6 text-sm text-stone-500">
                  No fields added yet.
                </div>
              )}
            </div>
          </section>

          <section className="flex min-h-0 flex-col rounded-[24px] border border-black/10 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-stone-900">Field Settings</p>
              {selectedComponent ? (
                <div className="flex gap-2">
                  <button type="button" onClick={() => moveSelectedComponent("up")} className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs">
                    Up
                  </button>
                  <button type="button" onClick={() => moveSelectedComponent("down")} className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs">
                    Down
                  </button>
                  <button type="button" onClick={removeSelectedComponent} className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs text-red-700">
                    Remove
                  </button>
                </div>
              ) : null}
            </div>

            <div className="mt-4 min-h-0 flex-1 overflow-auto pr-1">
              {selectedComponent ? (
                <div className="space-y-4">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-stone-700">Label</span>
                    <input
                      value={String(selectedComponent.label ?? "")}
                      onChange={(event) =>
                        updateSelectedComponent((component) => ({
                          ...component,
                          label: event.target.value,
                        }))
                      }
                      className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-stone-700">Key</span>
                    <input
                      value={String(selectedComponent.key)}
                      onChange={(event) =>
                        updateSelectedComponent((component, allComponents) => {
                          const nextKey = uniqueKey(event.target.value, allComponents, component.key);
                          setSelectedKey(nextKey);
                          return {
                            ...component,
                            key: nextKey,
                          };
                        })
                      }
                      className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none"
                    />
                  </label>

                  {supportsPlaceholder ? (
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-stone-700">Placeholder</span>
                      <input
                        value={String(selectedComponent.placeholder ?? "")}
                        onChange={(event) =>
                          updateSelectedComponent((component) => ({
                            ...component,
                            placeholder: event.target.value,
                          }))
                        }
                        className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none"
                      />
                    </label>
                  ) : null}

                  {selectedComponent.type === "textarea" ? (
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-stone-700">Rows</span>
                      <input
                        type="number"
                        min={2}
                        max={12}
                        value={Number(selectedComponent.rows ?? 3)}
                        onChange={(event) =>
                          updateSelectedComponent((component) => ({
                            ...component,
                            rows: Math.max(2, Number(event.target.value) || 3),
                          }))
                        }
                        className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none"
                      />
                    </label>
                  ) : null}

                  {supportsRequired ? (
                    <label className="flex items-center justify-between rounded-[18px] border border-black/10 bg-white px-4 py-3">
                      <span className="text-sm font-medium text-stone-700">Required</span>
                      <input
                        type="checkbox"
                        checked={Boolean((selectedComponent.validate as { required?: boolean } | undefined)?.required)}
                        onChange={(event) =>
                          updateSelectedComponent((component) => ({
                            ...component,
                            validate: {
                              ...((component.validate as Record<string, unknown> | undefined) ?? {}),
                              required: event.target.checked,
                            },
                          }))
                        }
                      />
                    </label>
                  ) : null}

                  {supportsOptions ? (
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-stone-700">Options</span>
                      <textarea
                        rows={6}
                        value={optionLines}
                        onChange={(event) =>
                          updateSelectedComponent((component) => {
                            const options = parseOptionLines(event.target.value);
                            if (component.type === "radio") {
                              return {
                                ...component,
                                values: options,
                              };
                            }

                            return {
                              ...component,
                              dataSrc: "values",
                              data: {
                                values: options,
                              },
                              template: "<span>{{ item.label }}</span>",
                            };
                          })
                        }
                        className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none"
                        placeholder={"Option 1|option1\nOption 2|option2"}
                      />
                      <p className="mt-2 text-xs text-stone-500">One option per line. Use `label|value` format.</p>
                    </label>
                  ) : null}

                  {selectedComponent.type === "button" ? (
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-stone-700">Theme</span>
                      <select
                        value={String(selectedComponent.theme ?? "primary")}
                        onChange={(event) =>
                          updateSelectedComponent((component) => ({
                            ...component,
                            theme: event.target.value,
                          }))
                        }
                        className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none"
                      >
                        <option value="primary">Primary</option>
                        <option value="secondary">Secondary</option>
                        <option value="success">Success</option>
                        <option value="danger">Danger</option>
                      </select>
                    </label>
                  ) : null}
                </div>
              ) : (
                <div className="rounded-[16px] border border-dashed border-black/10 px-4 py-6 text-sm text-stone-500">
                  Select a field from the list to edit its settings.
                </div>
              )}
            </div>
          </section>

          <section className="flex min-h-0 flex-col rounded-[24px] border border-black/10 bg-white p-4">
            <p className="text-sm font-semibold text-stone-800">{t("live preview")}</p>
            <div className="formio-runtime-shell mt-4 min-h-0 flex-1 overflow-auto rounded-[18px] border border-black/10 bg-[#fffdfa] p-4">
              <FormioForm src={schema as never} form={schema as never} options={{ noAlerts: true }} />
            </div>
          </section>
        </div>

        <div className="flex justify-end gap-3 border-t border-black/10 px-5 py-2.5">
          <button type="button" onClick={onClose} className="rounded-full border border-black/10 bg-white px-5 py-2 text-sm">
            {t("cancel")}
          </button>
          <button type="button" onClick={() => onSave(schema)} className="rounded-full bg-[#203b35] px-5 py-2 text-sm text-white">
            {t("apply")}
          </button>
        </div>
      </div>
    </div>
  );
}
