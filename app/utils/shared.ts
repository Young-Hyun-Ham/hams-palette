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
  category: "layer" | "tab" | "menu";
  tone: string;
  sizeLabel: string;
  defaultCols: number;
  defaultContentHeight: number;
  cardClassName: string;
  defaultContent: string;
  supportsTabs?: boolean;
  defaultTabCount?: number;
};

export type TabPane = {
  id: string;
  title: string;
  layout: LayoutItem[];
};

export type LayoutItem = {
  instanceId: string;
  paletteId: string;
  cols: number;
  frameHeight?: number;
  contentHeight: number;
  contentEnabled: boolean;
  contentText: string;
  backgroundImage: BinaryAsset | null;
  backgroundColor?: string;
  attachments: BinaryAsset[];
  tabCount?: number;
  activeTabId?: string;
  tabs?: TabPane[];
};

export type EditorDraft = {
  instanceId: string;
  contentText: string;
  backgroundImage: BinaryAsset | null;
  backgroundColor?: string;
  attachments: BinaryAsset[];
};

export type DashboardTemplate = {
  id: string;
  userId: string;
  templateKey: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  layout: LayoutItem[];
};

export const paletteItems: PaletteItem[] = [
  {
    id: "layer",
    name: "Layer Palette",
    category: "layer",
    tone: "Flexible Content Area",
    sizeLabel: "12 Col",
    defaultCols: 12,
    defaultContentHeight: 160,
    cardClassName: "bg-[#fff7ee] text-stone-900",
    defaultContent: "## Layer Palette",
  },
  {
    id: "tabs",
    name: "Tab Palette",
    category: "tab",
    tone: "Tabbed Content",
    sizeLabel: "12 Col",
    defaultCols: 12,
    defaultContentHeight: 240,
    cardClassName: "bg-[#f0e4d5] text-stone-900",
    defaultContent: "## Tab Palette",
    supportsTabs: true,
    defaultTabCount: 3,
  },
  {
    id: "menu",
    name: "Menu Palette",
    category: "menu",
    tone: "Navigation Menu",
    sizeLabel: "12 Col",
    defaultCols: 12,
    defaultContentHeight: 90,
    cardClassName: "bg-[#e7efe6] text-stone-900",
    defaultContent: "## Menu Palette",
  },
];

export const paletteCategoryLabels = {
  layer: "Layer Palette",
  tab: "Tab Palette",
  menu: "Menu Palette",
} as const;

export function findPaletteItem(id: string) {
  const legacyLayerIds = new Set(["hero", "intro", "visual", "program", "notice", "cta", "footer"]);
  const normalizedId = legacyLayerIds.has(id) ? "layer" : id;

  return paletteItems.find((item) => item.id === normalizedId);
}

export function colClass(cols: number) {
  const map: Record<number, string> = {
    1: "col-span-12 lg:col-span-1",
    2: "col-span-12 lg:col-span-2",
    3: "col-span-12 lg:col-span-3",
    4: "col-span-12 lg:col-span-4",
    5: "col-span-12 lg:col-span-5",
    6: "col-span-12 lg:col-span-6",
    7: "col-span-12 lg:col-span-7",
    8: "col-span-12 lg:col-span-8",
    9: "col-span-12 lg:col-span-9",
    10: "col-span-12 lg:col-span-10",
    11: "col-span-12 lg:col-span-11",
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
