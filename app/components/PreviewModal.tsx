"use client";

import { useState } from "react";

import { ContentBlocks } from "./ContentBlocks";
import { useI18n } from "../utils/i18n";
import {
  binaryToDataUrl,
  colClass,
  findPaletteItem,
  hasTextualContent,
  resolveContentPadding,
  resolveImageBorderEnabled,
  resolveImageBorderWidth,
  type LayoutItem,
  type PaletteItem,
} from "../utils/shared";

type PreviewItem = {
  layoutItem: LayoutItem;
  paletteItem: PaletteItem;
};

type PreviewModalProps = {
  items: PreviewItem[];
  onClose: () => void;
};

function PreviewBlock({
  layoutItem,
  paletteItem,
  compact = false,
}: {
  layoutItem: LayoutItem;
  paletteItem: PaletteItem;
  compact?: boolean;
}) {
  if (!layoutItem.contentEnabled) {
    const hiddenHeight = compact ? "100%" : `${layoutItem.contentHeight}px`;

    return <div aria-hidden="true" className="rounded-[18px]" style={{ height: hiddenHeight }} />;
  }

  const backgroundUrl = binaryToDataUrl(layoutItem.backgroundImage);
  const contentPadding = resolveContentPadding(layoutItem.contentPadding);
  const imageBorderEnabled = resolveImageBorderEnabled(layoutItem.imageBorderEnabled);
  const imageBorderWidth = resolveImageBorderWidth(layoutItem.imageBorderWidth);
  const hasTextContent = hasTextualContent(layoutItem.contentText);
  const [activeTabId, setActiveTabId] = useState(
    () => layoutItem.activeTabId ?? layoutItem.tabs?.[0]?.id,
  );
  const activeTab =
    layoutItem.tabs?.find((tab) => tab.id === activeTabId) ?? layoutItem.tabs?.[0];
  const hasChildLayout = (layoutItem.childLayout?.length ?? 0) > 0;

  if (layoutItem.paletteId === "tabs") {
    return (
      <div
        className={`rounded-[18px] border border-black/10 bg-white/70 p-4 ${
          compact ? "" : paletteItem.cardClassName
        }`}
        style={{ height: compact ? "100%" : `${layoutItem.contentHeight}px` }}
      >
        <div className="flex flex-wrap gap-2">
          {(layoutItem.tabs ?? []).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTabId(tab.id)}
              className={`rounded-full px-3 py-1 text-xs ${
                activeTab?.id === tab.id
                  ? "bg-[#203b35] text-white"
                  : "border border-black/10 bg-white text-stone-700"
              }`}
            >
              {tab.title}
            </button>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-12 gap-3">
          {(activeTab?.layout ?? []).map((child) => {
            const childPalette = findPaletteItem(child.paletteId);
            if (!childPalette) {
              return null;
            }

            return (
              <div key={child.instanceId} className={colClass(child.cols)}>
                <PreviewBlock layoutItem={child} paletteItem={childPalette} compact />
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (layoutItem.paletteId === "layer" && hasChildLayout) {
    return (
      <div
        className={`${hasTextContent ? "overflow-y-auto" : "overflow-hidden"} rounded-[18px] border border-black/10 bg-white p-4`}
        style={{ height: compact ? "100%" : `${layoutItem.contentHeight}px` }}
      >
        {hasTextContent ? (
          <div
            className="mb-4 rounded-[16px] border border-black/8 bg-white font-mono text-sm leading-6"
            style={{ padding: `${contentPadding}px` }}
          >
            <ContentBlocks
              contentText={layoutItem.contentText}
              attachments={layoutItem.attachments}
              lineKeyPrefix={`${layoutItem.instanceId}-preview-layer-content`}
              imageBorderEnabled={imageBorderEnabled}
              imageBorderWidth={imageBorderWidth}
            />
          </div>
        ) : null}
        <div className="grid grid-cols-12 gap-3">
          {(layoutItem.childLayout ?? []).map((child) => {
            const childPalette = findPaletteItem(child.paletteId);
            if (!childPalette) {
              return null;
            }

            return (
              <div key={child.instanceId} className={colClass(child.cols)}>
                <PreviewBlock layoutItem={child} paletteItem={childPalette} compact />
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${hasTextContent ? "overflow-y-auto" : "overflow-hidden"} rounded-[18px] font-mono text-sm leading-6 ${paletteItem.cardClassName}`}
      style={{
        height: compact ? "100%" : `${layoutItem.contentHeight}px`,
        padding: `${contentPadding}px`,
        backgroundColor: layoutItem.backgroundColor,
        backgroundImage: backgroundUrl
          ? `linear-gradient(rgba(20,20,20,0.22), rgba(20,20,20,0.22)), url(${backgroundUrl})`
          : undefined,
        backgroundSize: backgroundUrl ? "cover" : undefined,
        backgroundPosition: backgroundUrl ? "center" : undefined,
      }}
    >
      <ContentBlocks
        contentText={layoutItem.contentText}
        attachments={layoutItem.attachments}
        lineKeyPrefix={`${layoutItem.instanceId}-preview`}
        openLinksInNewTab={layoutItem.paletteId === "menu"}
        imageBorderEnabled={imageBorderEnabled}
        imageBorderWidth={imageBorderWidth}
      />
    </div>
  );
}

export function PreviewModal({ items, onClose }: PreviewModalProps) {
  const { t } = useI18n();

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/55 p-4">
      <div className="flex max-h-[92vh] w-full max-w-[1500px] flex-col overflow-hidden rounded-[30px] bg-white shadow-[0_36px_120px_rgba(0,0,0,0.35)]">
        <div className="flex items-center justify-between border-b border-black/10 px-6 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[#b66537]">{t("preview")}</p>
            <h3 className="mt-2 text-2xl font-semibold">{t("layout preview")}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm"
          >
            {t("close")}
          </button>
        </div>

        <div className="overflow-auto px-5 py-5">
          <div className="mx-auto grid w-full max-w-[1440px] grid-cols-12 gap-3 rounded-[26px] bg-white p-4">
            {items.map(({ layoutItem, paletteItem }) => (
              <div key={layoutItem.instanceId} className={colClass(layoutItem.cols)}>
                <div className="px-5">
                  <PreviewBlock layoutItem={layoutItem} paletteItem={paletteItem} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
