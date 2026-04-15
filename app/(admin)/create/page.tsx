"use client";

import { useMemo, useState, type ChangeEvent } from "react";

import { ContentEditorModal } from "@/app/components/create/ContentEditorModal";
import { ContentBlocks } from "@/app/components/create/ContentBlocks";
import { PreviewModal } from "@/app/components/create/PreviewModal";
import {
  binaryToDataUrl,
  colClass,
  type BinaryAsset,
  type EditorDraft,
  type LayoutItem,
  type PaletteItem,
} from "@/app/components/create/shared";

const paletteItems: PaletteItem[] = [
  {
    id: "hero",
    name: "Hero",
    tone: "Primary Visual",
    sizeLabel: "12 Col",
    defaultCols: 12,
    defaultContentHeight: 180,
    cardClassName: "bg-[#d86c3b] text-white",
    defaultContent: "# Main Hero\nKey visual headline\nCTA and notice message",
  },
  {
    id: "intro",
    name: "Intro",
    tone: "Text + Image",
    sizeLabel: "6 Col",
    defaultCols: 6,
    defaultContentHeight: 140,
    cardClassName: "bg-[#fff7ee] text-stone-900",
    defaultContent: "## Intro Section\nBrand message\nMore editable text",
  },
  {
    id: "visual",
    name: "Visual",
    tone: "Media Slot",
    sizeLabel: "6 Col",
    defaultCols: 6,
    defaultContentHeight: 160,
    cardClassName: "bg-[#1f3b35] text-white",
    defaultContent: "![cover](hero.jpg)\nVisual caption\nMedia description",
  },
  {
    id: "notice",
    name: "Notice",
    tone: "Markdown Feed",
    sizeLabel: "4 Col",
    defaultCols: 4,
    defaultContentHeight: 120,
    cardClassName: "bg-[#fbf4ea] text-stone-900",
    defaultContent: "### Notice\n- Event notice\n- Operating info\n- Markdown list",
  },
  {
    id: "program",
    name: "Program",
    tone: "Card Grid",
    sizeLabel: "4 Col",
    defaultCols: 4,
    defaultContentHeight: 120,
    cardClassName: "bg-[#fbf4ea] text-stone-900",
    defaultContent: "### Program\n- Class schedule\n- Speaker block\n- Summary",
  },
  {
    id: "cta",
    name: "CTA",
    tone: "Action Area",
    sizeLabel: "4 Col",
    defaultCols: 4,
    defaultContentHeight: 120,
    cardClassName: "bg-[#fbf4ea] text-stone-900",
    defaultContent: "### CTA\n- Reservation link\n- Inquiry button\n- Contact note",
  },
  {
    id: "footer",
    name: "Footer",
    tone: "Contact / Links",
    sizeLabel: "12 Col",
    defaultCols: 12,
    defaultContentHeight: 100,
    cardClassName: "bg-[#e5d3bc] text-stone-900",
    defaultContent: "#### Footer\nAddress / Contact / Opening hours / Links",
  },
];

const defaultLayoutIds = ["hero", "intro", "visual", "program", "notice", "cta", "footer"];
const colOptions = [2, 3, 4, 6, 8, 12];
const contentHeightOptions = Array.from({ length: 35 }, (_, index) => (index + 1) * 10);
const emojiOptions = ["😀", "🎉", "📌", "✨", "🖼️", "📝", "📎", "✅"];

function findPaletteItem(id: string) {
  return paletteItems.find((item) => item.id === id);
}

function frameTitle(name: string, index: number) {
  return `${String(index + 1).padStart(2, "0")}. ${name}`;
}

function cloneAsset(asset: BinaryAsset | null) {
  return asset ? { ...asset, bytes: [...asset.bytes] } : null;
}

function cloneAssets(assets: BinaryAsset[]) {
  return assets.map((asset) => ({ ...asset, bytes: [...asset.bytes] }));
}

function makeLayoutItem(paletteId: string, index: number): LayoutItem {
  const item = findPaletteItem(paletteId);

  return {
    instanceId: `${paletteId}-${index + 1}`,
    paletteId,
    cols: item?.defaultCols ?? 12,
    contentHeight: item?.defaultContentHeight ?? 120,
    contentEnabled: true,
    contentText: item?.defaultContent ?? "",
    backgroundImage: null,
    attachments: [],
  };
}

function createInitialLayout() {
  return defaultLayoutIds.map((id, index) => makeLayoutItem(id, index));
}

async function toBinaryAsset(file: File): Promise<BinaryAsset> {
  const buffer = await file.arrayBuffer();

  return {
    id: `${file.name}-${file.size}-${Date.now()}`,
    name: file.name,
    type: file.type || "application/octet-stream",
    size: file.size,
    bytes: Array.from(new Uint8Array(buffer)),
  };
}

export default function CreatePage() {
  const [layout, setLayout] = useState<LayoutItem[]>(() => createInitialLayout());
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string>(() => createInitialLayout()[0].instanceId);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [editorDraft, setEditorDraft] = useState<EditorDraft | null>(null);
  const [editorHistory, setEditorHistory] = useState<{
    past: EditorDraft[];
    future: EditorDraft[];
  }>({
    past: [],
    future: [],
  });

  const selectedLayoutItem = useMemo(
    () => layout.find((item: LayoutItem) => item.instanceId === selectedId) ?? layout[0],
    [layout, selectedId],
  );

  const selectedPaletteItem = useMemo(
    () => findPaletteItem(selectedLayoutItem?.paletteId ?? "") ?? paletteItems[0],
    [selectedLayoutItem],
  );

  const previewItems = useMemo(
    () =>
      layout
        .map((layoutItem: LayoutItem) => ({
          layoutItem,
          paletteItem: findPaletteItem(layoutItem.paletteId),
        }))
        .filter(
          (entry: {
            layoutItem: LayoutItem;
            paletteItem: PaletteItem | undefined;
          }): entry is { layoutItem: LayoutItem; paletteItem: PaletteItem } =>
            Boolean(entry.paletteItem) && entry.layoutItem.contentEnabled,
        ),
    [layout],
  );

  const draftBackgroundUrl = useMemo(
    () => binaryToDataUrl(editorDraft?.backgroundImage ?? null),
    [editorDraft],
  );

  const createLayoutFromPalette = (paletteId: string): LayoutItem | null => {
    const item = findPaletteItem(paletteId);
    if (!item) {
      return null;
    }

    return {
      instanceId: `${paletteId}-${Date.now()}`,
      paletteId,
      cols: item.defaultCols,
      contentHeight: item.defaultContentHeight,
      contentEnabled: true,
      contentText: item.defaultContent,
      backgroundImage: null,
      attachments: [],
    };
  };

  const moveOrInsert = (targetIndex: number) => {
    if (!draggingId) {
      return;
    }

    const existing = layout.find((item: LayoutItem) => item.instanceId === draggingId);
    const created = existing ? null : createLayoutFromPalette(draggingId);

    setLayout((current: LayoutItem[]) => {
      const next = [...current];
      const currentIndex = next.findIndex((item: LayoutItem) => item.instanceId === draggingId);

      if (currentIndex >= 0) {
        const [moved] = next.splice(currentIndex, 1);
        const nextIndex = currentIndex < targetIndex ? targetIndex - 1 : targetIndex;
        next.splice(nextIndex, 0, moved);
        return next;
      }

      if (!created) {
        return current;
      }

      next.splice(targetIndex, 0, created);
      return next;
    });

    setSelectedId(existing?.instanceId ?? created?.instanceId ?? selectedId);
    setDraggingId(null);
  };

  const appendDrop = () => {
    if (!draggingId) {
      return;
    }

    const existing = layout.find((item: LayoutItem) => item.instanceId === draggingId);
    const created = existing ? null : createLayoutFromPalette(draggingId);

    setLayout((current: LayoutItem[]) => {
      if (existing || !created) {
        return current;
      }

      return [...current, created];
    });

    setSelectedId(existing?.instanceId ?? created?.instanceId ?? selectedId);
    setDraggingId(null);
  };

  const handleRemove = (instanceId: string) => {
    setLayout((current: LayoutItem[]) => {
      const next = current.filter((item: LayoutItem) => item.instanceId !== instanceId);
      if (!next.length) {
        return current;
      }

      if (selectedId === instanceId) {
        setSelectedId(next[0].instanceId);
      }

      return next;
    });
  };

  const updateSelected = (
    field: "cols" | "contentHeight" | "contentEnabled",
    value: number | boolean,
  ) => {
    if (!selectedLayoutItem) {
      return;
    }

    setLayout((current: LayoutItem[]) =>
      current.map((item: LayoutItem) =>
        item.instanceId === selectedLayoutItem.instanceId ? { ...item, [field]: value } : item,
      ),
    );
  };

  const openEditor = () => {
    if (!selectedLayoutItem) {
      return;
    }

    const nextDraft = {
      instanceId: selectedLayoutItem.instanceId,
      contentText: selectedLayoutItem.contentText,
      backgroundImage: cloneAsset(selectedLayoutItem.backgroundImage),
      attachments: cloneAssets(selectedLayoutItem.attachments),
    };

    setEditorDraft(nextDraft);
    setEditorHistory({
      past: [],
      future: [],
    });
  };

  const closeEditor = () => {
    setEditorDraft(null);
    setEditorHistory({
      past: [],
      future: [],
    });
  };

  const updateEditorDraft = (nextDraft: EditorDraft) => {
    setEditorDraft((current) => {
      if (!current) {
        return nextDraft;
      }

      setEditorHistory((history) => ({
        past: [...history.past, current],
        future: [],
      }));

      return nextDraft;
    });
  };

  const undoEditorDraft = () => {
    setEditorHistory((history) => {
      if (!editorDraft || history.past.length === 0) {
        return history;
      }

      const previousDraft = history.past[history.past.length - 1];
      const nextPast = history.past.slice(0, -1);

      setEditorDraft(previousDraft);

      return {
        past: nextPast,
        future: [editorDraft, ...history.future],
      };
    });
  };

  const redoEditorDraft = () => {
    setEditorHistory((history) => {
      if (!editorDraft || history.future.length === 0) {
        return history;
      }

      const [nextDraft, ...remainingFuture] = history.future;

      setEditorDraft(nextDraft);

      return {
        past: [...history.past, editorDraft],
        future: remainingFuture,
      };
    });
  };

  const confirmEditor = () => {
    if (!editorDraft) {
      return;
    }

    setLayout((current: LayoutItem[]) =>
      current.map((item: LayoutItem) =>
        item.instanceId === editorDraft.instanceId
          ? {
              ...item,
              contentText: editorDraft.contentText,
              backgroundImage: cloneAsset(editorDraft.backgroundImage),
              attachments: cloneAssets(editorDraft.attachments),
            }
          : item,
      ),
    );

    setEditorDraft(null);
  };

  const appendEmoji = (emoji: string) => {
    if (!editorDraft) {
      return;
    }

    updateEditorDraft({
      ...editorDraft,
      contentText: `${editorDraft.contentText}${emoji}`,
    });
  };

  const uploadBackground = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!editorDraft) {
      return;
    }

    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    updateEditorDraft({
      ...editorDraft,
      backgroundImage: await toBinaryAsset(file),
    });
    event.target.value = "";
  };

  const uploadAttachments = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!editorDraft || !event.target.files?.length) {
      return;
    }

    const assets = await Promise.all(
      Array.from(event.target.files).map((file) => toBinaryAsset(file)),
    );
    updateEditorDraft({
      ...editorDraft,
      attachments: [...editorDraft.attachments, ...assets],
    });
    event.target.value = "";
  };

  const removeAttachment = (assetId: string) => {
    if (!editorDraft) {
      return;
    }

    updateEditorDraft({
      ...editorDraft,
      attachments: editorDraft.attachments.filter((asset: BinaryAsset) => asset.id !== assetId),
    });
  };

  const insertAttachmentImage = (asset: BinaryAsset) => {
    if (!editorDraft || !asset.type.startsWith("image/")) {
      return;
    }

    updateEditorDraft({
      ...editorDraft,
      contentText: `${editorDraft.contentText}\n![${asset.name}](${asset.name})`,
    });
  };

  const insertAttachmentTag = (asset: BinaryAsset) => {
    if (!editorDraft) {
      return;
    }

    updateEditorDraft({
      ...editorDraft,
      contentText: `${editorDraft.contentText}\n[file:${asset.name}]`,
    });
  };

  return (
    <main className="min-h-screen px-4 py-4 text-stone-900 lg:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-[1880px] flex-col overflow-hidden rounded-[34px] border border-black/10 bg-[#f8f1e7]/90 shadow-[0_24px_90px_rgba(57,43,24,0.14)] xl:flex-row">
        <aside className="w-full border-b border-black/10 bg-[#203b35] px-5 py-6 text-[#f7f0e6] xl:w-[320px] xl:border-r xl:border-b-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-[#f0c39f]/80">Home Creator</p>
              <h1 className="mt-3 text-3xl font-semibold leading-tight">메인 페이지 구성</h1>
            </div>
            <span className="rounded-full border border-white/15 px-3 py-1 text-xs">/create</span>
          </div>

          <div className="mt-8 rounded-[26px] border border-white/10 bg-white/7 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-white/70">블록 팔레트</p>
              <span className="rounded-full border border-white/10 px-2 py-1 text-xs text-white/70">
                Drag
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {paletteItems.map((item) => (
                <article
                  key={item.id}
                  draggable
                  onDragStart={() => setDraggingId(item.id)}
                  onDragEnd={() => setDraggingId(null)}
                  className="cursor-grab rounded-[20px] border border-white/10 bg-white/8 p-4 active:cursor-grabbing"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-base font-semibold">{item.name}</h2>
                    <span className="rounded-full border border-white/15 px-2 py-1 text-xs">
                      {item.sizeLabel}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-white/65">{item.tone}</p>
                </article>
              ))}
            </div>
          </div>
        </aside>

        <section className="flex-1 border-b border-black/10 bg-[#eee2d2] px-4 py-5 lg:px-6 xl:border-r xl:border-b-0">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-[#b66537]">Layout Workspace</p>
              <h2 className="mt-2 text-3xl font-semibold">메인 캔버스를 직접 배치합니다</h2>
            </div>
            <div className="flex flex-wrap gap-2 text-sm">
              <button
                type="button"
                onClick={() => {
                  const next = createInitialLayout();
                  setLayout(next);
                  setSelectedId(next[0].instanceId);
                }}
                className="rounded-full border border-black/10 bg-white/70 px-4 py-2"
              >
                기본 배치 복원
              </button>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(true)}
                className="rounded-full border border-black/10 bg-[#d86c3b] px-4 py-2 text-white"
              >
                미리보기
              </button>
            </div>
          </div>

          <div className="mt-6 rounded-[30px] border border-black/10 bg-[#fcf7f1] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
            <div className="flex items-center justify-between rounded-[22px] border border-dashed border-black/10 bg-[#f6ede1] px-4 py-3 text-sm text-stone-600">
              <span>Canvas Width 1440px</span>
              <span>Grid 12 / Full Content View</span>
            </div>

            <div
              className="mt-4 grid min-h-[760px] grid-cols-12 gap-3 rounded-[26px] bg-[linear-gradient(180deg,#fffdf9_0%,#f7efe5_100%)] p-3"
              onDragOver={(event) => event.preventDefault()}
              onDrop={appendDrop}
            >
              {layout.map((layoutItem, index) => {
                const item = findPaletteItem(layoutItem.paletteId);
                if (!item) {
                  return null;
                }

                const isSelected = selectedId === layoutItem.instanceId;
                const backgroundUrl = binaryToDataUrl(layoutItem.backgroundImage);

                return (
                  <article
                    key={layoutItem.instanceId}
                    draggable
                    onClick={() => setSelectedId(layoutItem.instanceId)}
                    onDragStart={() => setDraggingId(layoutItem.instanceId)}
                    onDragEnd={() => setDraggingId(null)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault();
                      moveOrInsert(index);
                    }}
                    className={`relative flex flex-col rounded-[24px] border border-black/8 p-5 shadow-[0_12px_24px_rgba(25,20,15,0.05)] ${colClass(layoutItem.cols)} ${item.cardClassName} ${
                      isSelected ? "ring-2 ring-[#d86c3b]" : ""
                    }`}
                    style={
                      backgroundUrl
                        ? {
                            backgroundImage: `linear-gradient(rgba(20,20,20,0.22), rgba(20,20,20,0.22)), url(${backgroundUrl})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }
                        : undefined
                    }
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-xl font-semibold">{frameTitle(item.name, index)}</h3>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleRemove(layoutItem.instanceId);
                        }}
                        className="rounded-full border border-current/15 px-3 py-1 text-xs"
                      >
                        제거
                      </button>
                    </div>

                    <p className="mt-4 text-sm leading-6 opacity-80">{item.tone}</p>

                    {layoutItem.contentEnabled ? (
                      <div className="mt-5 rounded-[18px] bg-black/6 p-4 backdrop-blur-[1px]">
                        <ContentBlocks
                          contentText={layoutItem.contentText}
                          attachments={layoutItem.attachments}
                          lineKeyPrefix={layoutItem.instanceId}
                        />
                        {layoutItem.attachments.length > 0 ? (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {layoutItem.attachments.map((asset) => (
                              <span
                                key={asset.id}
                                className="rounded-full border border-current/15 px-3 py-1 text-xs"
                              >
                                {asset.name}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <div className="mt-5 rounded-[18px] border border-dashed border-current/20 px-4 py-6 text-sm opacity-70">
                        콘텐츠 사용 안 함
                      </div>
                    )}
                  </article>
                );
              })}

              <button
                type="button"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  appendDrop();
                }}
                className="col-span-12 rounded-[24px] border border-dashed border-black/15 bg-[#f6ede1] px-6 py-10 text-left text-stone-500"
              >
                <p className="text-sm uppercase tracking-[0.22em] text-[#b66537]">Drop Zone</p>
                <p className="mt-3 text-lg font-semibold text-stone-800">
                  새 블록을 여기로 드래그해서 캔버스에 추가하세요
                </p>
              </button>
            </div>
          </div>
        </section>

        <aside className="w-full bg-[#f9f4ec] px-5 py-6 xl:w-[360px]">
          <div className="rounded-[26px] border border-black/10 bg-white/70 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-[#b66537]">Selected Block</p>
            <h2 className="mt-3 text-2xl font-semibold">{selectedPaletteItem.name}</h2>
            <div className="mt-4 space-y-2 text-sm text-stone-600">
              <p>인스턴스: {selectedLayoutItem?.instanceId}</p>
              <p>톤: {selectedPaletteItem.tone}</p>
              <p>첨부 파일: {selectedLayoutItem?.attachments.length ?? 0}개</p>
              <p>배경 이미지: {selectedLayoutItem?.backgroundImage ? "설정됨" : "없음"}</p>
            </div>
          </div>

          <div className="mt-4 rounded-[26px] border border-black/10 bg-white/70 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-[#b66537]">Frame Properties</p>
            <h3 className="mt-2 text-xl font-semibold">프레임 속성</h3>

            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-stone-700">컬럼 수</span>
                <select
                  value={selectedLayoutItem?.cols ?? 12}
                  onChange={(event) => updateSelected("cols", Number(event.target.value))}
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none"
                >
                  {colOptions.map((option) => (
                    <option key={option} value={option}>
                      {option} Col
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-stone-700">콘텐츠 높이</span>
                <select
                  value={selectedLayoutItem?.contentHeight ?? 120}
                  onChange={(event) => updateSelected("contentHeight", Number(event.target.value))}
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none"
                >
                  {contentHeightOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}px
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex items-center justify-between rounded-[20px] border border-black/10 bg-[#faf7f1] px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-stone-800">콘텐츠 사용</p>
                  <p className="text-xs text-stone-500">미리보기에서 이 블록을 표시합니다</p>
                </div>
                <button
                  type="button"
                  onClick={() => updateSelected("contentEnabled", !selectedLayoutItem?.contentEnabled)}
                  className={`rounded-full px-3 py-2 text-xs font-medium ${
                    selectedLayoutItem?.contentEnabled
                      ? "bg-[#203b35] text-white"
                      : "bg-stone-200 text-stone-700"
                  }`}
                >
                  {selectedLayoutItem?.contentEnabled ? "사용" : "미사용"}
                </button>
              </label>

              {selectedLayoutItem?.contentEnabled ? (
                <div className="rounded-[22px] border border-black/10 bg-[#faf7f1] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-stone-800">콘텐츠 편집</p>
                      <p className="text-xs text-stone-500">
                        메모형 에디터에서 내용, 배경 이미지, 첨부 파일을 수정합니다
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={openEditor}
                      className="rounded-full border border-black/10 bg-white px-2 py-2 text-sm"
                    >
                      변경
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </aside>
      </div>

      {isPreviewOpen ? (
        <PreviewModal items={previewItems} onClose={() => setIsPreviewOpen(false)} />
      ) : null}

      {editorDraft ? (
        <ContentEditorModal
          draft={editorDraft}
          emojiOptions={emojiOptions}
          draftBackgroundUrl={draftBackgroundUrl}
          previewHeight={selectedLayoutItem?.contentHeight ?? 120}
          canUndo={editorHistory.past.length > 0}
          canRedo={editorHistory.future.length > 0}
          onClose={closeEditor}
          onConfirm={confirmEditor}
          onDraftChange={updateEditorDraft}
          onUndo={undoEditorDraft}
          onRedo={redoEditorDraft}
          onAppendEmoji={appendEmoji}
          onUploadBackground={uploadBackground}
          onUploadAttachments={uploadAttachments}
          onRemoveAttachment={removeAttachment}
          onInsertAttachmentImage={insertAttachmentImage}
          onInsertAttachmentTag={insertAttachmentTag}
        />
      ) : null}
    </main>
  );
}
