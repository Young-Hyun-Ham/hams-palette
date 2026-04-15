"use client";

import { binaryToDataUrl, type BinaryAsset } from "./shared";

type ContentBlocksProps = {
  contentText: string;
  attachments: BinaryAsset[];
  lineKeyPrefix: string;
};

const imageTagPattern = /^!\[(.*?)\]\((.*?)\)$/;
const alignTagPattern = /^\[align:(left|center|right)\](.*)\[\/align\]$/;

function findImageAsset(reference: string, attachments: BinaryAsset[]) {
  return attachments.find(
    (asset) => asset.type.startsWith("image/") && (asset.name === reference || asset.id === reference),
  );
}

function escapeHtml(text: string) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function formatInlineHtml(text: string) {
  let html = escapeHtml(text);

  html = html.replace(
    /\[size:(\d+)\]([\s\S]*?)\[\/size\]/g,
    (_, size: string, content: string) =>
      `<span style="font-size:${Number(size)}px">${formatInlineHtml(content)}</span>`,
  );
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  html = html.replace(/~~(.+?)~~/g, "<s>$1</s>");

  return html;
}

export function ContentBlocks({
  contentText,
  attachments,
  lineKeyPrefix,
}: ContentBlocksProps) {
  return (
    <div className="space-y-2">
      {contentText.split("\n").map((rawLine, lineIndex) => {
        const trimmedLine = rawLine.trim();
        const alignMatch = trimmedLine.match(alignTagPattern);
        const textAlign = (alignMatch?.[1] ?? "left") as "left" | "center" | "right";
        const line = alignMatch ? alignMatch[2] : rawLine;
        const imageMatch = line.trim().match(imageTagPattern);

        if (imageMatch) {
          const [, altText, imageRef] = imageMatch;
          const imageAsset = findImageAsset(imageRef, attachments);
          const imageUrl = binaryToDataUrl(imageAsset ?? null);

          if (imageUrl) {
            return (
              <div
                key={`${lineKeyPrefix}-${lineIndex}`}
                style={{ textAlign }}
              >
                <img
                  src={imageUrl}
                  alt={altText || imageAsset?.name || "attached image"}
                  className="inline-block max-h-[280px] max-w-full rounded-[14px] border border-current/10 object-contain"
                />
              </div>
            );
          }
        }

        return (
          <p
            key={`${lineKeyPrefix}-${lineIndex}`}
            style={{ textAlign: textAlign as "left" | "center" | "right" }}
            dangerouslySetInnerHTML={{
              __html: line ? formatInlineHtml(line) : "&nbsp;",
            }}
          />
        );
      })}
    </div>
  );
}
