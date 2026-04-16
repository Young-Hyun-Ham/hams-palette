"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { ContentEditorModal } from "@/app/components/ContentEditorModal";
import { ContentBlocks } from "@/app/components/ContentBlocks";
import { PreviewModal } from "@/app/components/PreviewModal";
import { useI18n } from "@/app/utils/i18n";
import { slugifyTemplateKey } from "@/app/utils/template-key";
import {
  binaryToDataUrl,
  colClass,
  findPaletteItem,
  paletteItems,
  type BinaryAsset,
  type DashboardTemplate,
  type EditorDraft,
  type LayoutItem,
  type TabPane,
} from "@/app/utils/shared";

const defaultLayoutIds = ["layer", "layer", "layer", "layer", "layer", "layer", "layer"];
const colOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const frameHeightOptions = Array.from({ length: 41 }, (_, index) => (index + 2) * 20);
const tabCountOptions = [2, 3, 4, 5];
const contentHeightOptions = Array.from({ length: 35 }, (_, index) => (index + 1) * 10);
const emojiOptions = ["😀", "😁", "😂", "😍", "😎", "🔥", "✨", "🎉", "💡", "📌", "🌿", "🚀"];
const textOptions = [":)", ":D", "<3", "*", "!", "+", "#", "~"];

function frameTitle(name: string, index: number) {
  return `${String(index + 1).padStart(2, "0")}. ${name}`;
}

function cloneAsset(asset: BinaryAsset | null) {
  return asset ? { ...asset, bytes: [...asset.bytes] } : null;
}

function cloneAssets(assets: BinaryAsset[]) {
  return assets.map((asset) => ({ ...asset, bytes: [...asset.bytes] }));
}

function cloneLayoutItems(items: LayoutItem[]): LayoutItem[] {
  return items.map((item) => ({
    ...item,
    backgroundImage: cloneAsset(item.backgroundImage),
    attachments: cloneAssets(item.attachments),
    tabs: item.tabs?.map((tab) => ({
      ...tab,
      layout: cloneLayoutItems(tab.layout),
    })),
  }));
}

function findLayoutItemById(items: LayoutItem[], instanceId: string): LayoutItem | null {
  for (const item of items) {
    if (item.instanceId === instanceId) {
      return item;
    }

    for (const tab of item.tabs ?? []) {
      const found = findLayoutItemById(tab.layout, instanceId);
      if (found) {
        return found;
      }
    }
  }

  return null;
}

function updateLayoutItemsById(
  items: LayoutItem[],
  instanceId: string,
  updater: (item: LayoutItem) => LayoutItem,
): LayoutItem[] {
  return items.map((item) => {
    if (item.instanceId === instanceId) {
      return updater(item);
    }

    if (!item.tabs?.length) {
      return item;
    }

    return {
      ...item,
      tabs: item.tabs.map((tab) => ({
        ...tab,
        layout: updateLayoutItemsById(tab.layout, instanceId, updater),
      })),
    };
  });
}

function createEmptyTabs(instanceId: string, count: number): TabPane[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `${instanceId}-tab-${index + 1}`,
    title: `Tab ${index + 1}`,
    layout: [],
  }));
}

function makeLayoutItem(paletteId: string, index: number): LayoutItem {
  const item = findPaletteItem(paletteId);
  const instanceId = `${paletteId}-${index + 1}`;
  const defaultTabCount = item?.defaultTabCount ?? 0;

  return {
    instanceId,
    paletteId,
    cols: item?.defaultCols ?? 12,
    frameHeight: item?.defaultContentHeight ?? 120,
    contentHeight: item?.defaultContentHeight ?? 120,
    contentEnabled: true,
    contentText: item?.defaultContent ?? "",
    backgroundImage: null,
    backgroundColor: undefined,
    attachments: [],
    tabCount: item?.supportsTabs ? defaultTabCount : undefined,
    activeTabId: item?.supportsTabs ? `${instanceId}-tab-1` : undefined,
    tabs: item?.supportsTabs ? createEmptyTabs(instanceId, defaultTabCount) : undefined,
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

function makeNewTemplate(): DashboardTemplate {
  const now = new Date().toISOString();

  return {
    id: `tpl-${Date.now()}`,
    userId: "hyh8414",
    templateKey: "home",
    title: "New Template",
    description: "",
    createdAt: now,
    updatedAt: now,
    layout: createInitialLayout(),
  };
}

function BlockPreview({
  layoutItem,
  compact = false,
}: {
  layoutItem: LayoutItem;
  compact?: boolean;
}) {
  const { t } = useI18n();
  const paletteItem = findPaletteItem(layoutItem.paletteId);
  if (!paletteItem) {
    return null;
  }
  const previewHeight = layoutItem.frameHeight ?? layoutItem.contentHeight;
  const containerHeight = compact ? `${previewHeight}px` : "100%";

  if (!layoutItem.contentEnabled) {
    return (
      <div
        className={`${compact ? "" : "mt-5 flex-1 min-h-0 rounded-[18px] border border-dashed border-current/20 bg-white/30 p-4"} overflow-y-auto`}
        style={{ height: containerHeight }}
      />
    );
  }

  const backgroundUrl = binaryToDataUrl(layoutItem.backgroundImage);
  const activeTab =
    layoutItem.tabs?.find((tab) => tab.id === layoutItem.activeTabId) ?? layoutItem.tabs?.[0];

  if (layoutItem.paletteId === "tabs") {
    return (
      <div
        className={`flex flex-col overflow-hidden rounded-[18px] border border-black/10 bg-white/60 p-4 ${compact ? "" : "mt-5 flex-1 min-h-0"}`}
        style={{ height: containerHeight }}
      >
        <div className="flex flex-wrap gap-2">
          {(layoutItem.tabs ?? []).map((tab) => (
            <span
              key={tab.id}
              className={`rounded-full px-3 py-1 text-xs ${
                activeTab?.id === tab.id
                  ? "bg-[#203b35] text-white"
                  : "border border-black/10 bg-white text-stone-700"
              }`}
            >
              {tab.title}
            </span>
          ))}
        </div>

        <div className="mt-4 grid flex-1 grid-cols-12 gap-3 overflow-y-auto">
          {(activeTab?.layout ?? []).map((child, index) => {
            const childPalette = findPaletteItem(child.paletteId);
            if (!childPalette) {
              return null;
            }

            return (
              <div key={child.instanceId} className={colClass(child.cols)}>
                <div className={`rounded-[18px] p-4 ${childPalette.cardClassName}`}>
                  <p className="text-xs uppercase tracking-[0.18em] opacity-70">
                    {frameTitle(t(childPalette.name), index)}
                  </p>
                  <BlockPreview layoutItem={child} compact />
                </div>
              </div>
            );
          })}

          {(activeTab?.layout.length ?? 0) === 0 ? (
            <div className="col-span-12 rounded-[16px] border border-dashed border-black/15 px-4 py-6 text-sm text-stone-500">
              {t("no blocks in this tab yet.")}
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${compact ? "" : "mt-5 flex-1 min-h-0 rounded-[18px] bg-black/6 p-4 backdrop-blur-[1px]"} overflow-y-auto`}
      style={
        backgroundUrl
          ? {
              height: containerHeight,
              backgroundColor: layoutItem.backgroundColor,
              backgroundImage: `linear-gradient(rgba(20,20,20,0.22), rgba(20,20,20,0.22)), url(${backgroundUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : layoutItem.backgroundColor
            ? {
                height: containerHeight,
                backgroundColor: layoutItem.backgroundColor,
              }
            : {
                height: containerHeight,
              }
      }
    >
      <ContentBlocks
        contentText={layoutItem.contentText}
        attachments={layoutItem.attachments}
        lineKeyPrefix={layoutItem.instanceId}
        openLinksInNewTab={layoutItem.paletteId === "menu"}
      />
      {layoutItem.attachments.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {layoutItem.attachments.map((asset) => (
            <span key={asset.id} className="rounded-full border border-current/15 px-3 py-1 text-xs">
              {asset.name}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function CreatePage() {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get("id");

  const [templateMeta, setTemplateMeta] = useState<DashboardTemplate>(() => makeNewTemplate());
  const [layout, setLayout] = useState<LayoutItem[]>(() => createInitialLayout());
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string>(() => createInitialLayout()[0].instanceId);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [editorDraft, setEditorDraft] = useState<EditorDraft | null>(null);
  const [editorPreviewHeight, setEditorPreviewHeight] = useState(120);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [editorHistory, setEditorHistory] = useState<{ past: EditorDraft[]; future: EditorDraft[] }>({ past: [], future: [] });

  useEffect(() => {
    let cancelled = false;

    async function loadTemplate() {
      if (!templateId) {
        const fresh = makeNewTemplate();
        if (!cancelled) {
          setTemplateMeta(fresh);
          setLayout(fresh.layout);
          setSelectedId(fresh.layout[0].instanceId);
          setStatusMessage("");
        }
        return;
      }

      setIsLoadingTemplate(true);
      setStatusMessage("");

      try {
        const response = await fetch(`/api/dashboard/${templateId}`, { cache: "no-store" });
        if (!response.ok) {
          throw new Error(t("failed to load the saved template."));
        }

        const loaded = (await response.json()) as DashboardTemplate;
        if (!cancelled) {
          setTemplateMeta(loaded);
          setLayout(loaded.layout);
          setSelectedId(loaded.layout[0]?.instanceId ?? "");
        }
      } catch (error) {
        if (!cancelled) {
          setStatusMessage(error instanceof Error ? error.message : t("failed to load the saved template."));
        }
      } finally {
        if (!cancelled) {
          setIsLoadingTemplate(false);
        }
      }
    }

    void loadTemplate();

    return () => {
      cancelled = true;
    };
  }, [templateId]);

  const selectedLayoutItem = useMemo(
    () => layout.find((item) => item.instanceId === selectedId) ?? layout[0],
    [layout, selectedId],
  );
  const selectedPaletteItem = useMemo(
    () => findPaletteItem(selectedLayoutItem?.paletteId ?? "") ?? paletteItems[0],
    [selectedLayoutItem],
  );
  const selectedTab =
    selectedLayoutItem?.tabs?.find((tab) => tab.id === selectedLayoutItem.activeTabId) ??
    selectedLayoutItem?.tabs?.[0];
  const previewItems = useMemo(
    () =>
      layout
        .map((layoutItem) => ({ layoutItem, paletteItem: findPaletteItem(layoutItem.paletteId) }))
        .filter(
          (entry): entry is { layoutItem: LayoutItem; paletteItem: (typeof paletteItems)[number] } =>
            Boolean(entry.paletteItem),
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

    const instanceId = `${paletteId}-${Date.now()}`;
    const defaultTabCount = item.defaultTabCount ?? 0;

    return {
      instanceId,
      paletteId,
      cols: item.defaultCols,
      frameHeight: item.defaultContentHeight,
      contentHeight: item.defaultContentHeight,
      contentEnabled: true,
      contentText: item.defaultContent,
      backgroundImage: null,
      backgroundColor: undefined,
      attachments: [],
      tabCount: item.supportsTabs ? defaultTabCount : undefined,
      activeTabId: item.supportsTabs ? `${instanceId}-tab-1` : undefined,
      tabs: item.supportsTabs ? createEmptyTabs(instanceId, defaultTabCount) : undefined,
    };
  };

  const updateLayoutItem = (instanceId: string, updater: (item: LayoutItem) => LayoutItem) => {
    setLayout((current) => updateLayoutItemsById(current, instanceId, updater));
  };

  const moveOrInsert = (targetIndex: number) => {
    if (!draggingId) {
      return;
    }

    const existing = layout.find((item) => item.instanceId === draggingId);
    const created = existing ? null : createLayoutFromPalette(draggingId);

    setLayout((current) => {
      const next = [...current];
      const currentIndex = next.findIndex((item) => item.instanceId === draggingId);

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

    const existing = layout.find((item) => item.instanceId === draggingId);
    const created = existing ? null : createLayoutFromPalette(draggingId);

    setLayout((current) => {
      if (existing || !created) {
        return current;
      }

      return [...current, created];
    });

    setSelectedId(existing?.instanceId ?? created?.instanceId ?? selectedId);
    setDraggingId(null);
  };

  const handleRemove = (instanceId: string) => {
    setLayout((current) => {
      const next = current.filter((item) => item.instanceId !== instanceId);
      if (selectedId === instanceId) {
        setSelectedId(next[0]?.instanceId ?? "");
      }

      return next;
    });
  };

  const updateSelected = (
    field: "cols" | "frameHeight" | "contentHeight" | "contentEnabled",
    value: number | boolean,
  ) => {
    if (!selectedLayoutItem) {
      return;
    }

    updateLayoutItem(selectedLayoutItem.instanceId, (item) => {
      if (field === "contentHeight" && typeof value === "number") {
        const nextFrameHeight =
          typeof item.frameHeight === "number" && item.frameHeight > value ? value : item.frameHeight;

        return {
          ...item,
          contentHeight: value,
          frameHeight: nextFrameHeight,
        };
      }

      return { ...item, [field]: value };
    });
  };

  const updateSelectedTabCount = (count: number) => {
    if (!selectedLayoutItem || selectedLayoutItem.paletteId !== "tabs") {
      return;
    }

    updateLayoutItem(selectedLayoutItem.instanceId, (item) => {
      const currentTabs = item.tabs ?? [];
      const nextTabs = Array.from({ length: count }, (_, index) => {
        const existing = currentTabs[index];
        return existing ?? { id: `${item.instanceId}-tab-${index + 1}`, title: `Tab ${index + 1}`, layout: [] };
      });

      return {
        ...item,
        tabCount: count,
        tabs: nextTabs,
        activeTabId: nextTabs.find((tab) => tab.id === item.activeTabId)?.id ?? nextTabs[0]?.id,
      };
    });
  };

  const updateSelectedTabTitle = (tabId: string, title: string) => {
    if (!selectedLayoutItem) {
      return;
    }

    updateLayoutItem(selectedLayoutItem.instanceId, (item) => ({
      ...item,
      tabs: item.tabs?.map((tab) => (tab.id === tabId ? { ...tab, title } : tab)),
    }));
  };

  const setActiveTab = (tabId: string) => {
    if (!selectedLayoutItem) {
      return;
    }

    updateLayoutItem(selectedLayoutItem.instanceId, (item) => ({ ...item, activeTabId: tabId }));
  };

  const appendPaletteToTab = (paletteId: string) => {
    if (!selectedLayoutItem || !selectedTab) {
      return;
    }

    const created = createLayoutFromPalette(paletteId);
    if (!created) {
      return;
    }

    updateLayoutItem(selectedLayoutItem.instanceId, (item) => ({
      ...item,
      tabs: item.tabs?.map((tab) =>
        tab.id === selectedTab.id ? { ...tab, layout: [...tab.layout, created] } : tab,
      ),
    }));
  };

  const removePaletteFromTab = (childInstanceId: string) => {
    if (!selectedLayoutItem || !selectedTab) {
      return;
    }

    updateLayoutItem(selectedLayoutItem.instanceId, (item) => ({
      ...item,
      tabs: item.tabs?.map((tab) =>
        tab.id === selectedTab.id ? { ...tab, layout: tab.layout.filter((child) => child.instanceId !== childInstanceId) } : tab,
      ),
    }));
  };

  const openEditorForItem = (instanceId: string) => {
    const target = findLayoutItemById(layout, instanceId);
    if (!target || target.paletteId === "tabs") {
      return;
    }

    setEditorDraft({
      instanceId: target.instanceId,
      contentText: target.contentText,
      backgroundImage: cloneAsset(target.backgroundImage),
      backgroundColor: target.backgroundColor,
      attachments: cloneAssets(target.attachments),
    });
    setEditorPreviewHeight(target.contentHeight);
    setEditorHistory({ past: [], future: [] });
  };

  const openEditor = () => {
    if (!selectedLayoutItem) {
      return;
    }

    openEditorForItem(selectedLayoutItem.instanceId);
  };

  const closeEditor = () => {
    setEditorDraft(null);
    setEditorHistory({ past: [], future: [] });
  };

  const updateEditorDraft = (nextDraft: EditorDraft) => {
    setEditorDraft((current) => {
      if (!current) {
        return nextDraft;
      }

      setEditorHistory((history) => ({ past: [...history.past, current], future: [] }));
      return nextDraft;
    });
  };

  const undoEditorDraft = () => {
    setEditorHistory((history) => {
      if (!editorDraft || history.past.length === 0) {
        return history;
      }

      const previousDraft = history.past[history.past.length - 1];
      setEditorDraft(previousDraft);
      return { past: history.past.slice(0, -1), future: [editorDraft, ...history.future] };
    });
  };

  const redoEditorDraft = () => {
    setEditorHistory((history) => {
      if (!editorDraft || history.future.length === 0) {
        return history;
      }

      const [nextDraft, ...remainingFuture] = history.future;
      setEditorDraft(nextDraft);
      return { past: [...history.past, editorDraft], future: remainingFuture };
    });
  };

  const confirmEditor = () => {
    if (!editorDraft) {
      return;
    }

    updateLayoutItem(editorDraft.instanceId, (item) => ({
      ...item,
      contentText: editorDraft.contentText,
      backgroundImage: cloneAsset(editorDraft.backgroundImage),
      backgroundColor: editorDraft.backgroundColor,
      attachments: cloneAssets(editorDraft.attachments),
    }));

    setEditorDraft(null);
  };

  const appendEmoji = (emoji: string) => {
    if (!editorDraft) {
      return;
    }

    updateEditorDraft({ ...editorDraft, contentText: `${editorDraft.contentText}${emoji}` });
  };

  const uploadBackground = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!editorDraft) {
      return;
    }

    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    updateEditorDraft({ ...editorDraft, backgroundImage: await toBinaryAsset(file) });
    event.target.value = "";
  };

  const updateBackgroundColor = (color: string) => {
    if (!editorDraft) {
      return;
    }

    updateEditorDraft({ ...editorDraft, backgroundColor: color });
  };

  const uploadAttachments = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!editorDraft || !event.target.files?.length) {
      return;
    }

    const assets = await Promise.all(Array.from(event.target.files).map((file) => toBinaryAsset(file)));
    updateEditorDraft({ ...editorDraft, attachments: [...editorDraft.attachments, ...assets] });
    event.target.value = "";
  };

  const removeAttachment = (assetId: string) => {
    if (!editorDraft) {
      return;
    }

    updateEditorDraft({ ...editorDraft, attachments: editorDraft.attachments.filter((asset) => asset.id !== assetId) });
  };

  const insertAttachmentImage = (asset: BinaryAsset) => {
    if (!editorDraft || !asset.type.startsWith("image/")) {
      return;
    }

    updateEditorDraft({ ...editorDraft, contentText: `${editorDraft.contentText}\n![${asset.name}](${asset.name})` });
  };

  const insertAttachmentTag = (asset: BinaryAsset) => {
    if (!editorDraft) {
      return;
    }

    updateEditorDraft({ ...editorDraft, contentText: `${editorDraft.contentText}\n[file:${asset.name}]` });
  };

  const saveTemplate = async () => {
    if (!layout.length) {
      setStatusMessage(t("there is no layout to save."));
      return;
    }

    setIsSaving(true);
    setStatusMessage("");

    const payload: DashboardTemplate = {
      ...templateMeta,
      userId: templateMeta.userId.trim() || "hyh8414",
      templateKey: slugifyTemplateKey(templateMeta.templateKey),
      title: templateMeta.title.trim() || t("new template"),
      description: templateMeta.description.trim(),
      updatedAt: new Date().toISOString(),
      layout: cloneLayoutItems(layout),
    };

    try {
      const response = await fetch("/api/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorPayload = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(errorPayload?.message || t("failed to save the template."));
      }

      const saved = (await response.json()) as DashboardTemplate;
      setTemplateMeta(saved);
      setStatusMessage(t("saved to data/dashboard.json"));
      router.replace(`/template?id=${saved.id}`);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : t("failed to save the template."));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-screen px-4 py-4 text-stone-900 lg:px-6">
      <div className="mx-auto mb-4 flex max-w-[1880px] items-center justify-between gap-3">
        <Link href="/" className="text-sm text-stone-600 underline-offset-4 hover:underline">
          {t("back to list")}
        </Link>
        {statusMessage ? <p className="text-sm text-stone-600">{statusMessage}</p> : null}
      </div>

      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-[1880px] flex-col overflow-hidden rounded-[34px] border border-black/10 bg-[#f8f1e7]/90 shadow-[0_24px_90px_rgba(57,43,24,0.14)] xl:flex-row">
        <aside className="w-full border-b border-black/10 bg-[#203b35] px-5 py-6 text-[#f7f0e6] xl:w-[320px] xl:border-r xl:border-b-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-[#f0c39f]/80">{t("template")}</p>
              <h1 className="mt-3 text-3xl font-semibold leading-tight">{t("template builder")}</h1>
            </div>
            <span className="rounded-full border border-white/15 px-3 py-1 text-xs">/template</span>
          </div>

          <div className="mt-8 rounded-[26px] border border-white/10 bg-white/7 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-white/70">{t("block palette")}</p>
              <span className="rounded-full border border-white/10 px-2 py-1 text-xs text-white/70">{t("drag")}</span>
            </div>
            <div className="mt-4 space-y-3">
              {paletteItems.map((item) => (
                <article key={item.id} draggable onDragStart={() => setDraggingId(item.id)} onDragEnd={() => setDraggingId(null)} className="cursor-grab rounded-[20px] border border-white/10 bg-white/8 p-4 active:cursor-grabbing">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-base font-semibold">{t(item.name)}</h2>
                    <span className="rounded-full border border-white/15 px-2 py-1 text-xs">{item.sizeLabel}</span>
                  </div>
                  <p className="mt-2 text-sm text-white/65">{t(item.tone)}</p>
                </article>
              ))}
            </div>
          </div>
        </aside>

        <section className="flex-1 border-b border-black/10 bg-[#eee2d2] px-4 py-5 lg:px-6 xl:border-r xl:border-b-0">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-[#b66537]">{t("layout workspace")}</p>
                <h2 className="mt-2 text-3xl font-semibold">{t("main template layout")}</h2>
              </div>
              <div className="flex flex-wrap gap-2 text-sm">
                <button type="button" onClick={() => { const next = createInitialLayout(); setLayout(next); setSelectedId(next[0].instanceId); }} className="rounded-full border border-black/10 bg-white/70 px-4 py-2">{t("reset layout")}</button>
                <button type="button" onClick={() => setIsPreviewOpen(true)} className="rounded-full border border-black/10 bg-white/70 px-4 py-2">{t("preview")}</button>
                <button type="button" onClick={saveTemplate} disabled={isSaving || isLoadingTemplate} className="rounded-full border border-black/10 bg-[#d86c3b] px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-60">{isSaving ? t("saving...") : t("save")}</button>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <label className="block rounded-[24px] border border-black/10 bg-[#fcf7f1] p-4">
                <span className="mb-2 block text-sm font-medium text-stone-700">{t("user id")}</span>
                <input value={templateMeta.userId} onChange={(event) => setTemplateMeta((current) => ({ ...current, userId: event.target.value }))} className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none" placeholder={t("enter a user id")} />
              </label>
              <label className="block rounded-[24px] border border-black/10 bg-[#fcf7f1] p-4">
                <span className="mb-2 block text-sm font-medium text-stone-700">{t("template id")}</span>
                <input value={templateMeta.templateKey} onChange={(event) => setTemplateMeta((current) => ({ ...current, templateKey: slugifyTemplateKey(event.target.value) }))} className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none" placeholder={t("enter a template id")} />
              </label>
              <label className="block rounded-[24px] border border-black/10 bg-[#fcf7f1] p-4">
                <span className="mb-2 block text-sm font-medium text-stone-700">{t("template title")}</span>
                <input value={templateMeta.title} onChange={(event) => setTemplateMeta((current) => ({ ...current, title: event.target.value }))} className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none" placeholder={t("enter a template title")} />
              </label>
              <label className="block rounded-[24px] border border-black/10 bg-[#fcf7f1] p-4">
                <span className="mb-2 block text-sm font-medium text-stone-700">{t("description")}</span>
                <input value={templateMeta.description} onChange={(event) => setTemplateMeta((current) => ({ ...current, description: event.target.value }))} className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none" placeholder={t("short description for the list screen")} />
              </label>
            </div>

            <div className="rounded-[24px] border border-black/10 bg-[#fcf7f1] p-4 text-sm text-stone-600">
              <span className="font-medium text-stone-800">{t("public url")}: </span>
              <span>/{templateMeta.userId || "hyh8414"}/{slugifyTemplateKey(templateMeta.templateKey || "home")}</span>
            </div>
          </div>

          <div className="mt-6 rounded-[30px] border border-black/10 bg-[#fcf7f1] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
            <div className="flex items-center justify-between rounded-[22px] border border-dashed border-black/10 bg-[#f6ede1] px-4 py-3 text-sm text-stone-600">
              <span>{t("canvas width 1440px")}</span>
              <span>{t("grid 12 / full content view")}</span>
            </div>

            <div className="mt-4 grid min-h-[760px] grid-cols-12 gap-3 rounded-[26px] bg-[linear-gradient(180deg,#fffdf9_0%,#f7efe5_100%)] p-3" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); appendDrop(); }}>
              {layout.map((layoutItem, index) => {
                const item = findPaletteItem(layoutItem.paletteId);
                if (!item) return null;

                const isSelected = selectedId === layoutItem.instanceId;

                return (
                  <article key={layoutItem.instanceId} draggable onClick={() => setSelectedId(layoutItem.instanceId)} onDragStart={() => setDraggingId(layoutItem.instanceId)} onDragEnd={() => setDraggingId(null)} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); event.stopPropagation(); moveOrInsert(index); }} className={`relative flex self-start flex-col overflow-hidden rounded-[24px] border border-black/8 p-5 shadow-[0_12px_24px_rgba(25,20,15,0.05)] ${colClass(layoutItem.cols)} ${item.cardClassName} ${isSelected ? "ring-2 ring-[#d86c3b]" : ""}`} style={{ height: `${layoutItem.frameHeight ?? layoutItem.contentHeight}px` }}>
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-xl font-semibold">{frameTitle(t(item.name), index)}</h3>
                      <button type="button" onClick={(event) => { event.stopPropagation(); handleRemove(layoutItem.instanceId); }} className="rounded-full border border-current/15 px-3 py-1 text-xs">{t("remove")}</button>
                    </div>
                    <p className="mt-4 text-sm leading-6 opacity-80">{t(item.tone)}</p>
                    <BlockPreview layoutItem={layoutItem} />
                  </article>
                );
              })}

              <button type="button" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); event.stopPropagation(); appendDrop(); }} className="col-span-12 rounded-[24px] border border-dashed border-black/15 bg-[#f6ede1] px-6 py-10 text-left text-stone-500">
                <p className="text-sm uppercase tracking-[0.22em] text-[#b66537]">{t("drop zone")}</p>
                <p className="mt-3 text-lg font-semibold text-stone-800">{t("drag a block here to append it to the layout.")}</p>
              </button>
            </div>
          </div>
        </section>

        <aside className="w-full bg-[#f9f4ec] px-5 py-6 xl:w-[380px]">
          <div className="rounded-[26px] border border-black/10 bg-white/70 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-[#b66537]">{t("selected block")}</p>
            <h2 className="mt-3 text-2xl font-semibold">{t(selectedPaletteItem.name)}</h2>
            <div className="mt-4 space-y-2 text-sm text-stone-600">
              <p>{t("instance")}: {selectedLayoutItem?.instanceId}</p>
              <p>{t("tone")}: {t(selectedPaletteItem.tone)}</p>
              <p>{t("attachments")}: {selectedLayoutItem?.attachments.length ?? 0}</p>
              <p>{t("background")}: {selectedLayoutItem?.backgroundImage ? t("configured") : t("none")}</p>
            </div>
          </div>

          <div className="mt-4 rounded-[26px] border border-black/10 bg-white/70 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-[#b66537]">{t("frame properties")}</p>
            <h3 className="mt-2 text-xl font-semibold">{t("frame settings")}</h3>

            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-stone-700">{t("columns")}</span>
                <select value={selectedLayoutItem?.cols ?? 12} onChange={(event) => updateSelected("cols", Number(event.target.value))} className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none">
                  {colOptions.map((option) => <option key={option} value={option}>{option} Col</option>)}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-stone-700">{t("content height")}</span>
                <select value={selectedLayoutItem?.contentHeight ?? 120} onChange={(event) => updateSelected("contentHeight", Number(event.target.value))} className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none">
                  {contentHeightOptions.map((option) => <option key={option} value={option}>{option}px</option>)}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-stone-700">{t("frame height")}</span>
                <select value={selectedLayoutItem?.frameHeight ?? selectedLayoutItem?.contentHeight ?? 120} onChange={(event) => updateSelected("frameHeight", Number(event.target.value))} className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none">
                  {frameHeightOptions.map((option) => <option key={option} value={option}>{option}px</option>)}
                </select>
              </label>

              <label className="flex items-center justify-between rounded-[20px] border border-black/10 bg-[#faf7f1] px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-stone-800">{t("enable content")}</p>
                  <p className="text-xs text-stone-500">{t("controls whether the block shows in preview.")}</p>
                </div>
                <button type="button" onClick={() => updateSelected("contentEnabled", !selectedLayoutItem?.contentEnabled)} className={`rounded-full px-3 py-2 text-xs font-medium ${selectedLayoutItem?.contentEnabled ? "bg-[#203b35] text-white" : "bg-stone-200 text-stone-700"}`}>
                  {selectedLayoutItem?.contentEnabled ? t("enabled") : t("disabled")}
                </button>
              </label>

              {selectedLayoutItem?.paletteId === "tabs" ? (
                <div className="space-y-4 rounded-[22px] border border-black/10 bg-[#faf7f1] p-4">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-stone-700">{t("tab count")}</span>
                    <select value={selectedLayoutItem.tabCount ?? 3} onChange={(event) => updateSelectedTabCount(Number(event.target.value))} className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none">
                      {tabCountOptions.map((option) => <option key={option} value={option}>{option} {t("tab")}</option>)}
                    </select>
                  </label>

                  <div className="space-y-3">
                    {(selectedLayoutItem.tabs ?? []).map((tab) => (
                      <div key={tab.id} className="rounded-[18px] border border-black/10 bg-white px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <button type="button" onClick={() => setActiveTab(tab.id)} className={`rounded-full px-3 py-1 text-xs ${selectedTab?.id === tab.id ? "bg-[#203b35] text-white" : "bg-[#f6ede1] text-stone-700"}`}>
                            {selectedTab?.id === tab.id ? t("active") : t("open")}
                          </button>
                          <span className="text-xs text-stone-500">{tab.layout.length} {t("blocks")}</span>
                        </div>
                        <input value={tab.title} onChange={(event) => updateSelectedTabTitle(tab.id, event.target.value)} className="mt-3 w-full rounded-2xl border border-black/10 bg-[#fffdfa] px-4 py-3 text-sm outline-none" placeholder={t("tab title")} />
                      </div>
                    ))}
                  </div>

                  <div className="rounded-[18px] border border-black/10 bg-white p-4">
                    <p className="text-sm font-semibold text-stone-800">{t("tab content palette")}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {paletteItems.filter((item) => item.id !== "tabs").map((item) => (
                        <button key={item.id} type="button" onClick={() => appendPaletteToTab(item.id)} className="rounded-full border border-black/10 bg-[#faf7f1] px-3 py-2 text-xs">
                          {t("add")} {t(item.name)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[18px] border border-black/10 bg-white p-4">
                    <p className="text-sm font-semibold text-stone-800">{t("active tab content")}</p>
                    <div className="mt-3 space-y-2">
                      {(selectedTab?.layout ?? []).length > 0 ? selectedTab?.layout.map((child) => {
                        const childPalette = findPaletteItem(child.paletteId);
                        return (
                          <div key={child.instanceId} onClick={() => openEditorForItem(child.instanceId)} className="flex cursor-pointer items-center justify-between gap-3 rounded-[14px] border border-black/10 px-3 py-2 text-sm transition hover:bg-[#faf7f1]">
                            <span>{childPalette ? t(childPalette.name) : child.paletteId}</span>
                            <button type="button" onClick={(event) => { event.stopPropagation(); removePaletteFromTab(child.instanceId); }} className="rounded-full border border-black/10 px-3 py-1 text-xs">{t("remove")}</button>
                          </div>
                        );
                      }) : <div className="rounded-[14px] border border-dashed border-black/10 px-4 py-5 text-sm text-stone-500">{t("no blocks in the active tab.")}</div>}
                    </div>
                  </div>
                </div>
              ) : selectedLayoutItem?.contentEnabled ? (
                <div className="rounded-[22px] border border-black/10 bg-[#faf7f1] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-stone-800">{t("content editor")}</p>
                      <p className="text-xs text-stone-500">{t("edit text, background image, and attachments.")}</p>
                    </div>
                    <button type="button" onClick={openEditor} className="rounded-full border border-black/10 bg-white px-2 py-2 text-sm">{t("open")}</button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </aside>
      </div>

      {isPreviewOpen ? <PreviewModal items={previewItems} onClose={() => setIsPreviewOpen(false)} /> : null}
      {editorDraft ? (
        <ContentEditorModal
          draft={editorDraft}
          emojiOptions={emojiOptions}
          textOptions={textOptions}
          draftBackgroundUrl={draftBackgroundUrl}
          previewHeight={editorPreviewHeight}
          canUndo={editorHistory.past.length > 0}
          canRedo={editorHistory.future.length > 0}
          onClose={closeEditor}
          onConfirm={confirmEditor}
          onDraftChange={updateEditorDraft}
          onUndo={undoEditorDraft}
          onRedo={redoEditorDraft}
          onAppendEmoji={appendEmoji}
          onBackgroundColorChange={updateBackgroundColor}
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
