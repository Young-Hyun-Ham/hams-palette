"use client";

import { useState } from "react";

import { ContentBlocks } from "./ContentBlocks";
import { binaryToDataUrl, colClass, findPaletteItem, resolveContentPadding, resolveImageBorderEnabled, resolveImageBorderWidth, type DashboardTemplate, type LayoutItem } from "../utils/shared";

function PublicBlock({
  layoutItem,
  userId,
}: {
  layoutItem: LayoutItem;
  userId: string;
}) {
  const paletteItem = findPaletteItem(layoutItem.paletteId);
  const [activeTabId, setActiveTabId] = useState(
    () => layoutItem.activeTabId ?? layoutItem.tabs?.[0]?.id,
  );

  if (!paletteItem) {
    return null;
  }

  if (!layoutItem.contentEnabled) {
    return <div aria-hidden="true" className="rounded-[22px]" style={{ minHeight: `${layoutItem.contentHeight}px` }} />;
  }

  const backgroundUrl = binaryToDataUrl(layoutItem.backgroundImage);
  const contentPadding = resolveContentPadding(layoutItem.contentPadding);
  const imageBorderEnabled = resolveImageBorderEnabled(layoutItem.imageBorderEnabled);
  const imageBorderWidth = resolveImageBorderWidth(layoutItem.imageBorderWidth);
  const hasTextContent = layoutItem.contentText ? Boolean(layoutItem.contentText.trim()) : false;
  const activeTab =
    layoutItem.tabs?.find((tab) => tab.id === activeTabId) ?? layoutItem.tabs?.[0];
  const hasChildLayout = (layoutItem.childLayout?.length ?? 0) > 0;

  const resolveLink = (href: string) => {
    if (!href.startsWith("/")) {
      return href;
    }

    if (href === "/") {
      return `/${userId}/home`;
    }

    if (href.startsWith(`/${userId}/`)) {
      return href;
    }

    return `/${userId}/${href.replace(/^\/+/, "")}`;
  };

  if (layoutItem.paletteId === "tabs") {
    return (
      <div
        className="rounded-[22px] border border-black/10 bg-white/65 p-5"
        style={{ minHeight: `${layoutItem.contentHeight}px` }}
      >
        <div className="flex flex-wrap gap-2">
          {(layoutItem.tabs ?? []).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTabId(tab.id)}
              className={`rounded-full px-4 py-2 text-sm ${
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
          {(activeTab?.layout ?? []).map((child) => (
            <div key={child.instanceId} className={colClass(child.cols)}>
              <PublicBlock layoutItem={child} userId={userId} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (layoutItem.paletteId === "layer" && hasChildLayout) {
    return (
      <div className={`${hasTextContent ? "overflow-y-auto" : "overflow-hidden"} rounded-[22px] border border-black/10 bg-white p-5`}>
        {hasTextContent ? (
          <div
            className="mb-4 rounded-[18px] border border-black/8 bg-white font-mono text-sm leading-7"
            style={{ padding: `${contentPadding}px` }}
          >
            <ContentBlocks
              contentText={layoutItem.contentText}
              attachments={layoutItem.attachments}
              lineKeyPrefix={`${layoutItem.instanceId}-published-layer-content`}
              linkResolver={resolveLink}
              imageBorderEnabled={imageBorderEnabled}
              imageBorderWidth={imageBorderWidth}
            />
          </div>
        ) : null}
        <div className="grid grid-cols-12 gap-3">
          {(layoutItem.childLayout ?? []).map((child) => (
            <div key={child.instanceId} className={colClass(child.cols)}>
              <PublicBlock layoutItem={child} userId={userId} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`overflow-y-auto rounded-[22px] font-mono text-sm leading-7 ${paletteItem.cardClassName}`}
      style={{
        minHeight: `${layoutItem.contentHeight}px`,
        padding: `${contentPadding}px`,
        backgroundColor: layoutItem.backgroundColor,
        backgroundImage: backgroundUrl
          ? `linear-gradient(rgba(20,20,20,0.14), rgba(20,20,20,0.14)), url(${backgroundUrl})`
          : undefined,
        backgroundSize: backgroundUrl ? "cover" : undefined,
        backgroundPosition: backgroundUrl ? "center" : undefined,
      }}
    >
      <ContentBlocks
        contentText={layoutItem.contentText}
        attachments={layoutItem.attachments}
        lineKeyPrefix={`${layoutItem.instanceId}-published`}
        linkResolver={resolveLink}
        imageBorderEnabled={imageBorderEnabled}
        imageBorderWidth={imageBorderWidth}
      />
    </div>
  );
}

export function PublishedTemplatePage({ template }: { template: DashboardTemplate }) {
  return (
    <main className="min-h-screen bg-white px-4 py-6 text-stone-900 lg:px-6">
      <div className="mx-auto max-w-[1880px]">
        <div className="grid grid-cols-12 gap-3 rounded-[28px] bg-white p-3">
          {template.layout.map((layoutItem) => (
            <div key={layoutItem.instanceId} className={colClass(layoutItem.cols)}>
              <PublicBlock layoutItem={layoutItem} userId={template.userId} />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
