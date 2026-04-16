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
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  layout: LayoutItem[];
};

export const paletteItems: PaletteItem[] = [
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
    id: "tabs",
    name: "Tabs",
    tone: "Tabbed Content",
    sizeLabel: "12 Col",
    defaultCols: 12,
    defaultContentHeight: 240,
    cardClassName: "bg-[#f0e4d5] text-stone-900",
    defaultContent: "",
    supportsTabs: true,
    defaultTabCount: 3,
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

export function findPaletteItem(id: string) {
  return paletteItems.find((item) => item.id === id);
}

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
