"use client";

export type BinaryAsset = {
  id: string;
  name: string;
  type: string;
  size: number;
  bytes: number[];
  imageBorderEnabled?: boolean;
  imageBorderWidth?: number;
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

export type FormioSchema = {
  display?: string;
  components: Record<string, unknown>[];
  [key: string]: unknown;
};

export type LayoutItem = {
  instanceId: string;
  paletteId: string;
  cols: number;
  frameHeight?: number;
  contentHeight: number;
  paletteBorderEnabled?: boolean;
  paletteBorderWidth?: number;
  contentPadding?: number;
  contentBorderEnabled?: boolean;
  contentBorderWidth?: number;
  imageBorderEnabled?: boolean;
  imageBorderWidth?: number;
  formBorderEnabled?: boolean;
  formBorderWidth?: number;
  contentEnabled: boolean;
  contentText: string;
  backgroundImage: BinaryAsset | null;
  backgroundColor?: string;
  attachments: BinaryAsset[];
  formSchema?: FormioSchema | null;
  tabCount?: number;
  activeTabId?: string;
  tabs?: TabPane[];
  childLayout?: LayoutItem[];
};

export type EditorDraft = {
  instanceId: string;
  contentHeight: number;
  contentText: string;
  contentPadding?: number;
  contentBorderEnabled?: boolean;
  contentBorderWidth?: number;
  imageBorderEnabled?: boolean;
  imageBorderWidth?: number;
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

export function createEmptyFormioSchema(): FormioSchema {
  return {
    display: "form",
    components: [],
  };
}

export const paletteItems: PaletteItem[] = [
  {
    id: "layer",
    name: "Layer Palette",
    category: "layer",
    tone: "Section Container",
    sizeLabel: "12 Col",
    defaultCols: 12,
    defaultContentHeight: 160,
    cardClassName: "bg-white text-stone-900",
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
    cardClassName: "bg-white text-stone-900",
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
    cardClassName: "bg-white text-stone-900",
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

export function resolveContentPadding(contentPadding?: number) {
  return typeof contentPadding === "number" ? contentPadding : 12;
}

export function resolvePaletteBorderEnabled(paletteBorderEnabled?: boolean) {
  return paletteBorderEnabled ?? false;
}

export function resolvePaletteBorderWidth(paletteBorderWidth?: number) {
  return typeof paletteBorderWidth === "number" ? paletteBorderWidth : 1;
}

export function resolveContentBorderEnabled(contentBorderEnabled?: boolean) {
  return contentBorderEnabled ?? false;
}

export function resolveContentBorderWidth(contentBorderWidth?: number) {
  return typeof contentBorderWidth === "number" ? contentBorderWidth : 1;
}

export function resolveImageBorderEnabled(imageBorderEnabled?: boolean) {
  return imageBorderEnabled ?? false;
}

export function resolveImageBorderWidth(imageBorderWidth?: number) {
  return typeof imageBorderWidth === "number" ? imageBorderWidth : 1;
}

export function resolveFormBorderEnabled(formBorderEnabled?: boolean) {
  return formBorderEnabled ?? false;
}

export function resolveFormBorderWidth(formBorderWidth?: number) {
  return typeof formBorderWidth === "number" ? formBorderWidth : 1;
}

const CANVAS_WIDTH = 1440;
const CANVAS_GRID_COLUMNS = 12;
const CANVAS_GRID_GAP = 12;
const CANVAS_CARD_HORIZONTAL_PADDING = 40;
const CANVAS_BLOCK_CHROME_HEIGHT = 132;

export function resolveCanvasBlockHeight(contentHeight: number) {
  return CANVAS_BLOCK_CHROME_HEIGHT + contentHeight;
}

export function resolveCanvasBlockWidth(cols: number) {
  const normalizedCols = Math.min(CANVAS_GRID_COLUMNS, Math.max(1, cols));
  const columnWidth =
    (CANVAS_WIDTH - CANVAS_GRID_GAP * (CANVAS_GRID_COLUMNS - 1)) / CANVAS_GRID_COLUMNS;

  return columnWidth * normalizedCols + CANVAS_GRID_GAP * (normalizedCols - 1);
}

export function resolveCanvasContentWidth(cols: number) {
  return Math.max(0, resolveCanvasBlockWidth(cols) - CANVAS_CARD_HORIZONTAL_PADDING);
}

const IMAGE_TAG_PATTERN = /^!\[(.*?)\]\((.*?)\)$/;
const ALIGN_TAG_PATTERN = /^\[align:(left|center|right)\](.*)\[\/align\]$/;

export function hasTextualContent(contentText: string) {
  return contentText.split("\n").some((rawLine) => {
    const trimmedLine = rawLine.trim();
    if (!trimmedLine) {
      return false;
    }

    const alignMatch = trimmedLine.match(ALIGN_TAG_PATTERN);
    const line = alignMatch ? alignMatch[2].trim() : trimmedLine;

    if (!line) {
      return false;
    }

    return !IMAGE_TAG_PATTERN.test(line);
  });
}
