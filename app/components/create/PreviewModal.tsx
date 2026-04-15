"use client";

import { ContentBlocks } from "./ContentBlocks";
import { binaryToDataUrl, colClass, type LayoutItem, type PaletteItem } from "./shared";

type PreviewItem = {
  layoutItem: LayoutItem;
  paletteItem: PaletteItem;
};

type PreviewModalProps = {
  items: PreviewItem[];
  onClose: () => void;
};

export function PreviewModal({ items, onClose }: PreviewModalProps) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/55 p-4">
      <div className="flex max-h-[92vh] w-full max-w-[1500px] flex-col overflow-hidden rounded-[30px] bg-[#fbf6ef] shadow-[0_36px_120px_rgba(0,0,0,0.35)]">
        <div className="flex items-center justify-between border-b border-black/10 px-6 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[#b66537]">Preview</p>
            <h3 className="mt-2 text-2xl font-semibold">배치 결과 미리보기</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm"
          >
            닫기
          </button>
        </div>

        <div className="overflow-auto px-5 py-5">
          <div className="grid grid-cols-12 gap-3 rounded-[26px] bg-white/60 p-4">
            {items.map(({ layoutItem, paletteItem }) => {
              const backgroundUrl = binaryToDataUrl(layoutItem.backgroundImage);

              return (
                <div key={layoutItem.instanceId} className={colClass(layoutItem.cols)}>
                  <div
                    className={`overflow-y-auto rounded-[18px] p-4 font-mono text-sm leading-6 ${paletteItem.cardClassName}`}
                    style={
                      {
                        height: `${layoutItem.contentHeight}px`,
                        backgroundImage: backgroundUrl
                          ? `linear-gradient(rgba(20,20,20,0.22), rgba(20,20,20,0.22)), url(${backgroundUrl})`
                          : undefined,
                        backgroundSize: backgroundUrl ? "cover" : undefined,
                        backgroundPosition: backgroundUrl ? "center" : undefined,
                      }
                    }
                  >
                    <ContentBlocks
                      contentText={layoutItem.contentText}
                      attachments={layoutItem.attachments}
                      lineKeyPrefix={`${layoutItem.instanceId}-preview`}
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
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
