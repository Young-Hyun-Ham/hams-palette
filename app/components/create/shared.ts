"use client";

export type BinaryAsset = {
  id: string;
  name: string;
  type: string;
  size: number;
  bytes: number[];
};

export type PaletteItem = {
  id: string;
  name: string;
  tone: string;
  sizeLabel: string;
  defaultCols: number;
  defaultContentHeight: number;
  cardClassName: string;
  defaultContent: string;
};

export type LayoutItem = {
  instanceId: string;
  paletteId: string;
  cols: number;
  contentHeight: number;
  contentEnabled: boolean;
  contentText: string;
  backgroundImage: BinaryAsset | null;
  attachments: BinaryAsset[];
};

export type EditorDraft = {
  instanceId: string;
  contentText: string;
  backgroundImage: BinaryAsset | null;
  attachments: BinaryAsset[];
};

export function colClass(cols: number) {
  const map: Record<number, string> = {
    2: "col-span-12 lg:col-span-2",
    3: "col-span-12 lg:col-span-3",
    4: "col-span-12 lg:col-span-4",
    6: "col-span-12 lg:col-span-6",
    8: "col-span-12 lg:col-span-8",
    12: "col-span-12 lg:col-span-12",
  };

  return map[cols] ?? map[12];
}

export function binaryToDataUrl(asset: BinaryAsset | null) {
  if (!asset) {
    return undefined;
  }

  let binary = "";
  const chunkSize = 0x8000;

  for (let index = 0; index < asset.bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...asset.bytes.slice(index, index + chunkSize));
  }

  return `data:${asset.type};base64,${btoa(binary)}`;
}
