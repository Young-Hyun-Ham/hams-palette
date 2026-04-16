"use client";

import { useRef, useState, type ChangeEvent } from "react";

import { ContentBlocks } from "./ContentBlocks";
import {
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BackgroundColorIcon,
  BoldIcon,
  EmojiPickerIcon,
  ImageSelectIcon,
  ItalicIcon,
  RedoIcon,
  StrikeIcon,
  UndoIcon,
} from "../utils/icons";
import { useI18n } from "../utils/i18n";
import type { BinaryAsset, EditorDraft } from "../utils/shared";

type ContentEditorModalProps = {
  draft: EditorDraft;
  emojiOptions: string[];
  textOptions: string[];
  draftBackgroundUrl?: string;
  previewHeight: number;
  canUndo: boolean;
  canRedo: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onDraftChange: (draft: EditorDraft) => void;
  onUndo: () => void;
  onRedo: () => void;
  onAppendEmoji: (emoji: string) => void;
  onBackgroundColorChange: (color: string) => void;
  onUploadBackground: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  onUploadAttachments: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  onRemoveAttachment: (assetId: string) => void;
  onInsertAttachmentImage: (asset: BinaryAsset) => void;
  onInsertAttachmentTag: (asset: BinaryAsset) => void;
};

type SelectionRange = {
  start: number;
  end: number;
};

const sizeOptions = [14, 16, 18, 20, 24, 28, 32];

export function ContentEditorModal({
  draft,
  emojiOptions,
  textOptions,
  draftBackgroundUrl,
  previewHeight,
  canUndo,
  canRedo,
  onClose,
  onConfirm,
  onDraftChange,
  onUndo,
  onRedo,
  onAppendEmoji,
  onBackgroundColorChange,
  onUploadBackground,
  onUploadAttachments,
  onRemoveAttachment,
  onInsertAttachmentImage,
  onInsertAttachmentTag,
}: ContentEditorModalProps) {
  const { t } = useI18n();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const colorInputRef = useRef<HTMLInputElement | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isBackgroundPickerOpen, setIsBackgroundPickerOpen] = useState(false);
  const [pickerTab, setPickerTab] = useState<"emoji" | "text">("emoji");
  const [fontSizeValue, setFontSizeValue] = useState("");

  const focusTextarea = (range?: SelectionRange) => {
    requestAnimationFrame(() => {
      if (!textareaRef.current) {
        return;
      }

      textareaRef.current.focus();

      if (range) {
        textareaRef.current.setSelectionRange(range.start, range.end);
      }
    });
  };

  const updateContentText = (nextContentText: string, selection?: SelectionRange) => {
    onDraftChange({
      ...draft,
      contentText: nextContentText,
    });
    focusTextarea(selection);
  };

  const withSelection = (
    transform: (text: string, start: number, end: number) => { text: string; selection?: SelectionRange },
  ) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    const result = transform(draft.contentText, textarea.selectionStart, textarea.selectionEnd);
    updateContentText(result.text, result.selection);
  };

  const wrapSelectedText = (prefix: string, suffix = prefix) => {
    withSelection((text, start, end) => {
      const selected = text.slice(start, end);
      const replacement = `${prefix}${selected}${suffix}`;

      return {
        text: `${text.slice(0, start)}${replacement}${text.slice(end)}`,
        selection: {
          start: start + prefix.length,
          end: start + prefix.length + selected.length,
        },
      };
    });
  };

  const applyFontSize = (fontSize: number) => {
    withSelection((text, start, end) => {
      const selected = text.slice(start, end) || "text";
      const replacement = `[size:${fontSize}]${selected}[/size]`;
      const nextText = `${text.slice(0, start)}${replacement}${text.slice(end)}`;
      const selectionStart = start + `[size:${fontSize}]`.length;

      return {
        text: nextText,
        selection: {
          start: selectionStart,
          end: selectionStart + selected.length,
        },
      };
    });
  };

  const applyAlignment = (alignment: "left" | "center" | "right") => {
    withSelection((text, start, end) => {
      const blockStart = text.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
      const blockEndIndex = text.indexOf("\n", end);
      const blockEnd = blockEndIndex === -1 ? text.length : blockEndIndex;
      const block = text.slice(blockStart, blockEnd);

      const normalized = block
        .split("\n")
        .map((line) => {
          const trimmed = line.trim();
          const match = trimmed.match(/^\[align:(left|center|right)\](.*)\[\/align\]$/);
          const content = match ? match[2] : line;

          return content.trim() ? `[align:${alignment}]${content}[/align]` : line;
        })
        .join("\n");

      return {
        text: `${text.slice(0, blockStart)}${normalized}${text.slice(blockEnd)}`,
        selection: {
          start: blockStart,
          end: blockStart + normalized.length,
        },
      };
    });
  };

  const pickerItems = pickerTab === "emoji" ? emojiOptions : textOptions;

  const commitFontSize = (rawValue: string) => {
    const value = Number(rawValue);
    if (!Number.isFinite(value) || value <= 0) {
      return;
    }

    applyFontSize(value);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="flex max-h-[94vh] w-full max-w-[1120px] flex-col overflow-hidden rounded-[30px] bg-[#fcf7f1] shadow-[0_30px_90px_rgba(0,0,0,0.35)]">
        <div className="flex items-center justify-between border-b border-black/10 px-6 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[#b66537]">{t("content editor")}</p>
            <h3 className="mt-2 text-2xl font-semibold">{t("edit block")}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm"
          >
            {t("close")}
          </button>
        </div>

        <div className="grid gap-5 overflow-y-auto overflow-x-visible px-6 py-6 lg:grid-cols-[1.45fr_0.95fr]">
          <section className="space-y-4">
            <div className="rounded-[24px] border border-black/10 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-stone-800">{t("memo editor")}</p>
                <div />
              </div>

              <div className="relative mt-4 flex flex-wrap gap-2">
                <button type="button" aria-label={t("align left")} onClick={() => applyAlignment("left")} className="rounded-full border border-black/10 bg-[#faf7f1] p-2 text-xs"><AlignLeftIcon className="h-4 w-4" /></button>
                <button type="button" aria-label={t("align center")} onClick={() => applyAlignment("center")} className="rounded-full border border-black/10 bg-[#faf7f1] p-2 text-xs"><AlignCenterIcon className="h-4 w-4" /></button>
                <button type="button" aria-label={t("align right")} onClick={() => applyAlignment("right")} className="rounded-full border border-black/10 bg-[#faf7f1] p-2 text-xs"><AlignRightIcon className="h-4 w-4" /></button>
                <button type="button" aria-label={t("undo")} onClick={onUndo} disabled={!canUndo} className="rounded-full border border-black/10 bg-[#faf7f1] p-2 text-xs disabled:cursor-not-allowed disabled:opacity-40"><UndoIcon className="h-4 w-4" /></button>
                <button type="button" aria-label={t("redo")} onClick={onRedo} disabled={!canRedo} className="rounded-full border border-black/10 bg-[#faf7f1] p-2 text-xs disabled:cursor-not-allowed disabled:opacity-40"><RedoIcon className="h-4 w-4" /></button>
                <button type="button" aria-label={t("bold")} onClick={() => wrapSelectedText("**")} className="rounded-full border border-black/10 bg-[#faf7f1] p-2 text-xs font-semibold"><BoldIcon className="h-4 w-4" /></button>
                <button type="button" aria-label={t("italic")} onClick={() => wrapSelectedText("*")} className="rounded-full border border-black/10 bg-[#faf7f1] p-2 text-xs italic"><ItalicIcon className="h-4 w-4" /></button>
                <button type="button" aria-label={t("strike")} onClick={() => wrapSelectedText("~~")} className="rounded-full border border-black/10 bg-[#faf7f1] p-2 text-xs line-through"><StrikeIcon className="h-4 w-4" /></button>
                <button
                  type="button"
                  onClick={() => setIsPickerOpen((current) => !current)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-[#faf7f1] text-stone-700"
                  aria-label={t("open emoji and text picker")}
                >
                  <EmojiPickerIcon className="h-6 w-6" />
                </button>
                <label className="flex items-center gap-2 rounded-full border border-black/10 bg-[#faf7f1] px-3 py-1 text-xs text-stone-700">
                  <span>{t("size")}</span>
                  <input
                    type="number"
                    min={1}
                    step={1}
                    list="font-size-options"
                    value={fontSizeValue}
                    onChange={(event) => {
                      const nextValue = event.target.value;
                      setFontSizeValue(nextValue);

                      if (sizeOptions.includes(Number(nextValue))) {
                        commitFontSize(nextValue);
                      }
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        commitFontSize(fontSizeValue);
                      }
                    }}
                    className="w-16 appearance-none border-none bg-transparent text-right outline-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    placeholder="px"
                    aria-label={t("font size")}
                  />
                  <datalist id="font-size-options">
                    {sizeOptions.map((fontSize) => (
                      <option key={fontSize} value={fontSize} />
                    ))}
                  </datalist>
                </label>

                {isPickerOpen ? (
                  <div className="absolute left-0 top-12 z-10 w-[320px] rounded-[20px] border border-black/10 bg-white p-3 shadow-[0_18px_50px_rgba(0,0,0,0.14)]">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setPickerTab("emoji")}
                        className={`rounded-full px-3 py-2 text-xs ${
                          pickerTab === "emoji"
                            ? "bg-[#203b35] text-white"
                            : "border border-black/10 bg-[#faf7f1] text-stone-700"
                        }`}
                      >
                        {t("emoji")}
                      </button>
                      <button
                        type="button"
                        onClick={() => setPickerTab("text")}
                        className={`rounded-full px-3 py-2 text-xs ${
                          pickerTab === "text"
                            ? "bg-[#203b35] text-white"
                            : "border border-black/10 bg-[#faf7f1] text-stone-700"
                        }`}
                      >
                        {t("text")}
                      </button>
                    </div>

                    <div className="mt-3 max-h-[220px] overflow-y-auto rounded-[16px] bg-[#fcf7f1] p-2">
                      <div className="flex flex-wrap gap-2">
                        {pickerItems.map((item) => (
                          <button
                            key={`${pickerTab}-${item}`}
                            type="button"
                            onClick={() => {
                              onAppendEmoji(item);
                              setIsPickerOpen(false);
                            }}
                            className={`rounded-full border border-black/10 bg-white px-3 py-2 ${
                              pickerTab === "emoji" ? "text-lg" : "text-sm"
                            }`}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              <textarea
                ref={textareaRef}
                value={draft.contentText}
                onChange={(event) => onDraftChange({ ...draft, contentText: event.target.value })}
                className="mt-4 min-h-[340px] w-full rounded-[20px] border border-black/10 bg-[#fffdfa] p-4 font-mono text-sm leading-6 outline-none"
                placeholder={t("write markdown or memo content.")}
              />
            </div>

            <div className="rounded-[24px] border border-black/10 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-stone-800">{t("attachments")}</p>
                  <p className="mt-1 text-xs text-stone-500">{t("uploaded files stay in binary array form until save.")}</p>
                </div>
                <label className="cursor-pointer rounded-full border border-black/10 bg-[#faf7f1] px-4 py-2 text-sm">
                  {t("add file")}
                  <input type="file" multiple className="hidden" onChange={onUploadAttachments} />
                </label>
              </div>

              <div className="mt-4 space-y-3">
                {draft.attachments.length > 0 ? (
                  draft.attachments.map((asset) => (
                    <div key={asset.id} className="flex items-center justify-between gap-3 rounded-[18px] border border-black/10 bg-[#fffdfa] px-4 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-stone-800">{asset.name}</p>
                        <p className="text-xs text-stone-500">
                          {asset.type} / {asset.size.toLocaleString()} {t("bytes")} / binary[{asset.bytes.length}]
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <button type="button" onClick={() => onInsertAttachmentImage(asset)} disabled={!asset.type.startsWith("image/")} className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-40">{t("insert image")}</button>
                        <button type="button" onClick={() => onInsertAttachmentTag(asset)} className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs">{t("insert tag")}</button>
                        <button type="button" onClick={() => onRemoveAttachment(asset.id)} className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs">{t("remove")}</button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[18px] border border-dashed border-black/10 px-4 py-6 text-sm text-stone-500">{t("no attachments yet.")}</div>
                )}
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="rounded-[24px] border border-black/10 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-stone-800">{t("background")}</p>
                  <p className="mt-1 text-xs text-stone-500">{t("the selected image is kept in memory until save.")}</p>
                </div>
                <div className="flex items-center gap-2">
                  <label
                    className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-black/10 bg-[#faf7f1] text-stone-700"
                    aria-label={t("select image")}
                    title={t("select image")}
                  >
                    <ImageSelectIcon className="h-5 w-5" />
                    <input type="file" accept="image/*" className="hidden" onChange={onUploadBackground} />
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsBackgroundPickerOpen((current) => !current)}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-stone-700 shadow-sm"
                      style={{ backgroundColor: draft.backgroundColor ?? "#faf7f1" }}
                      aria-label={t("open background color picker")}
                    >
                      <BackgroundColorIcon className="h-5 w-5" />
                    </button>

                    {isBackgroundPickerOpen ? (
                      <div className="absolute right-0 top-12 z-10 w-[240px] rounded-[20px] border border-black/10 bg-white p-3 shadow-[0_18px_50px_rgba(0,0,0,0.14)]">
                        <input
                          ref={colorInputRef}
                          type="color"
                          value={draft.backgroundColor ?? "#ffffff"}
                          onChange={(event) => onBackgroundColorChange(event.target.value)}
                          className="h-32 w-full cursor-pointer appearance-none rounded-[16px] border-0 bg-transparent p-0 outline-none"
                          aria-label={t("background color picker")}
                        />
                        <div className="mt-3 flex items-center gap-2">
                          <input
                            value={draft.backgroundColor ?? ""}
                            onChange={(event) => onBackgroundColorChange(event.target.value)}
                            className="w-[118px] min-w-0 rounded-full border border-black/10 bg-[#faf7f1] px-3 py-2 text-sm outline-none"
                            placeholder="#FFFFFF"
                            aria-label={t("background color hex code")}
                          />
                          <button
                            type="button"
                            onClick={() => setIsBackgroundPickerOpen(false)}
                            className="rounded-full border border-black/10 bg-[#faf7f1] px-3 py-2 text-xs"
                          >
                            {t("close")}
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="mt-4 overflow-hidden rounded-[22px] border border-black/10 bg-[#f7efe5]">
                {draftBackgroundUrl ? (
                  <div className="h-[220px] bg-cover bg-center" style={{ backgroundImage: `url(${draftBackgroundUrl})` }} />
                ) : (
                  <div className="flex h-[220px] items-center justify-center text-sm text-stone-500" style={{ backgroundColor: draft.backgroundColor }}>
                    {t("no background image selected.")}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[24px] border border-black/10 bg-white p-4">
              <p className="text-sm font-semibold text-stone-800">{t("live preview")}</p>
              <div
                className="mt-4 overflow-y-auto rounded-[22px] border border-black/10 bg-[#fffdfa] p-4 font-mono text-sm leading-6"
                style={{
                  height: `${previewHeight}px`,
                  backgroundColor: draft.backgroundColor,
                  backgroundImage: draftBackgroundUrl ? `linear-gradient(rgba(20,20,20,0.18), rgba(20,20,20,0.18)), url(${draftBackgroundUrl})` : undefined,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <ContentBlocks contentText={draft.contentText} attachments={draft.attachments} lineKeyPrefix="draft" />
              </div>
            </div>
          </section>
        </div>

        <div className="flex justify-end gap-3 border-t border-black/10 px-6 py-5">
          <button type="button" onClick={onClose} className="rounded-full border border-black/10 bg-white px-5 py-2 text-sm">{t("cancel")}</button>
          <button type="button" onClick={onConfirm} className="rounded-full bg-[#203b35] px-5 py-2 text-sm text-white">{t("apply")}</button>
        </div>
      </div>
    </div>
  );
}
