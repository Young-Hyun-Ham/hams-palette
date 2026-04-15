"use client";

import { useRef, type ChangeEvent } from "react";

import { ContentBlocks } from "./ContentBlocks";
import type { BinaryAsset, EditorDraft } from "./shared";

type ContentEditorModalProps = {
  draft: EditorDraft;
  emojiOptions: string[];
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
  onUploadBackground,
  onUploadAttachments,
  onRemoveAttachment,
  onInsertAttachmentImage,
  onInsertAttachmentTag,
}: ContentEditorModalProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

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
      const selected = text.slice(start, end) || "텍스트";
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="flex max-h-[94vh] w-full max-w-[1120px] flex-col overflow-hidden rounded-[30px] bg-[#fcf7f1] shadow-[0_30px_90px_rgba(0,0,0,0.35)]">
        <div className="flex items-center justify-between border-b border-black/10 px-6 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[#b66537]">Content Editor</p>
            <h3 className="mt-2 text-2xl font-semibold">콘텐츠 편집</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm"
          >
            취소
          </button>
        </div>

        <div className="grid gap-5 overflow-auto px-6 py-6 lg:grid-cols-[1.45fr_0.95fr]">
          <section className="space-y-4">
            <div className="rounded-[24px] border border-black/10 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-stone-800">메모 에디터</p>
                <div className="flex flex-wrap gap-2">
                  {emojiOptions.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => onAppendEmoji(emoji)}
                      className="rounded-full border border-black/10 bg-[#faf7f1] px-3 py-1 text-sm"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => applyAlignment("left")}
                  className="rounded-full border border-black/10 bg-[#faf7f1] px-3 py-1 text-xs"
                >
                  좌측 정렬
                </button>
                <button
                  type="button"
                  onClick={() => applyAlignment("center")}
                  className="rounded-full border border-black/10 bg-[#faf7f1] px-3 py-1 text-xs"
                >
                  가운데 정렬
                </button>
                <button
                  type="button"
                  onClick={() => applyAlignment("right")}
                  className="rounded-full border border-black/10 bg-[#faf7f1] px-3 py-1 text-xs"
                >
                  우측 정렬
                </button>
                <button
                  type="button"
                  onClick={onUndo}
                  disabled={!canUndo}
                  className="rounded-full border border-black/10 bg-[#faf7f1] px-3 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Undo
                </button>
                <button
                  type="button"
                  onClick={onRedo}
                  disabled={!canRedo}
                  className="rounded-full border border-black/10 bg-[#faf7f1] px-3 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Redo
                </button>
                <button
                  type="button"
                  onClick={() => wrapSelectedText("**")}
                  className="rounded-full border border-black/10 bg-[#faf7f1] px-3 py-1 text-xs font-semibold"
                >
                  Bold
                </button>
                <button
                  type="button"
                  onClick={() => wrapSelectedText("*")}
                  className="rounded-full border border-black/10 bg-[#faf7f1] px-3 py-1 text-xs italic"
                >
                  Italic
                </button>
                <button
                  type="button"
                  onClick={() => wrapSelectedText("~~")}
                  className="rounded-full border border-black/10 bg-[#faf7f1] px-3 py-1 text-xs line-through"
                >
                  Strike
                </button>
                {sizeOptions.map((fontSize) => (
                  <button
                    key={fontSize}
                    type="button"
                    onClick={() => applyFontSize(fontSize)}
                    className="rounded-full border border-black/10 bg-[#faf7f1] px-3 py-1 text-xs"
                  >
                    {fontSize}px
                  </button>
                ))}
              </div>

              <textarea
                ref={textareaRef}
                value={draft.contentText}
                onChange={(event) =>
                  onDraftChange({
                    ...draft,
                    contentText: event.target.value,
                  })
                }
                className="mt-4 min-h-[340px] w-full rounded-[20px] border border-black/10 bg-[#fffdfa] p-4 font-mono text-sm leading-6 outline-none"
                placeholder="Markdown 또는 메모 내용을 입력하세요"
              />
            </div>

            <div className="rounded-[24px] border border-black/10 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-stone-800">파일 첨부</p>
                  <p className="mt-1 text-xs text-stone-500">
                    업로드한 파일은 바이너리 배열로 상태에 저장됩니다.
                  </p>
                </div>
                <label className="cursor-pointer rounded-full border border-black/10 bg-[#faf7f1] px-4 py-2 text-sm">
                  파일 추가
                  <input type="file" multiple className="hidden" onChange={onUploadAttachments} />
                </label>
              </div>

              <div className="mt-4 space-y-3">
                {draft.attachments.length > 0 ? (
                  draft.attachments.map((asset) => (
                    <div
                      key={asset.id}
                      className="flex items-center justify-between gap-3 rounded-[18px] border border-black/10 bg-[#fffdfa] px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-stone-800">{asset.name}</p>
                        <p className="text-xs text-stone-500">
                          {asset.type} / {asset.size.toLocaleString()} bytes / binary[{asset.bytes.length}]
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          onClick={() => onInsertAttachmentImage(asset)}
                          disabled={!asset.type.startsWith("image/")}
                          className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          이미지 삽입
                        </button>
                        <button
                          type="button"
                          onClick={() => onInsertAttachmentTag(asset)}
                          className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs"
                        >
                          태그 삽입
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemoveAttachment(asset.id)}
                          className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs"
                        >
                          제거
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[18px] border border-dashed border-black/10 px-4 py-6 text-sm text-stone-500">
                    아직 첨부된 파일이 없습니다.
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="rounded-[24px] border border-black/10 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-stone-800">배경 이미지</p>
                  <p className="mt-1 text-xs text-stone-500">
                    이미지는 바이너리 배열로 상태에 저장됩니다.
                  </p>
                </div>
                <label className="cursor-pointer rounded-full border border-black/10 bg-[#faf7f1] px-4 py-2 text-sm">
                  이미지 선택
                  <input type="file" accept="image/*" className="hidden" onChange={onUploadBackground} />
                </label>
              </div>

              <div className="mt-4 overflow-hidden rounded-[22px] border border-black/10 bg-[#f7efe5]">
                {draftBackgroundUrl ? (
                  <div
                    className="h-[220px] bg-cover bg-center"
                    style={{ backgroundImage: `url(${draftBackgroundUrl})` }}
                  />
                ) : (
                  <div className="flex h-[220px] items-center justify-center text-sm text-stone-500">
                    선택된 배경 이미지가 없습니다.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[24px] border border-black/10 bg-white p-4">
              <p className="text-sm font-semibold text-stone-800">에디터 미리보기</p>
              <div
                className="mt-4 overflow-y-auto rounded-[22px] border border-black/10 bg-[#fffdfa] p-4 font-mono text-sm leading-6"
                style={{
                  height: `${previewHeight}px`,
                  backgroundImage: draftBackgroundUrl
                    ? `linear-gradient(rgba(20,20,20,0.18), rgba(20,20,20,0.18)), url(${draftBackgroundUrl})`
                    : undefined,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <ContentBlocks
                  contentText={draft.contentText}
                  attachments={draft.attachments}
                  lineKeyPrefix="draft"
                />
              </div>
            </div>
          </section>
        </div>

        <div className="flex justify-end gap-3 border-t border-black/10 px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-black/10 bg-white px-5 py-2 text-sm"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-full bg-[#203b35] px-5 py-2 text-sm text-white"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
