import "server-only";

import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import { promises as fs } from "fs";
import path from "path";

import type { BinaryAsset, DashboardTemplate, LayoutItem, TabPane } from "@/app/utils/shared";

const DASHBOARD_PATH = path.join(process.cwd(), "data", "dashboard.json");
const ENCRYPTION_BLOCK_SIZE = 256;
const SECRET_SEED =
  process.env.HAMS_PALETTE_ASSET_SECRET ?? "hams-palette-dashboard-asset-secret";
const SECRET_KEY = createHash("sha256").update(SECRET_SEED).digest();

type StoredBinaryAsset = Omit<BinaryAsset, "bytes"> & {
  encryptedBytes: string;
};

type StoredLayoutItem = Omit<LayoutItem, "backgroundImage" | "attachments" | "tabs"> & {
  backgroundImage: StoredBinaryAsset | null;
  attachments: StoredBinaryAsset[];
  tabs?: StoredTabPane[];
};

type StoredTabPane = Omit<TabPane, "layout"> & {
  layout: StoredLayoutItem[];
};

type StoredDashboardTemplate = Omit<DashboardTemplate, "layout"> & {
  layout: StoredLayoutItem[];
};

function packBytes(bytes: number[]) {
  const payload = Buffer.from(bytes);
  const header = Buffer.alloc(4);
  header.writeUInt32BE(payload.length, 0);

  const withHeader = Buffer.concat([header, payload]);
  // Keep payload sizes reversible while aligning storage to 256-byte boundaries.
  const paddedLength =
    Math.ceil(withHeader.length / ENCRYPTION_BLOCK_SIZE) * ENCRYPTION_BLOCK_SIZE;
  const padded = Buffer.alloc(paddedLength);

  withHeader.copy(padded);
  return padded;
}

function unpackBytes(buffer: Buffer) {
  const originalLength = buffer.readUInt32BE(0);
  return Array.from(buffer.subarray(4, 4 + originalLength));
}

function encryptBytes(bytes: number[]) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", SECRET_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(packBytes(bytes)), cipher.final()]);
  const tag = cipher.getAuthTag();

  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

function decryptBytes(payload: string) {
  const packed = Buffer.from(payload, "base64");
  const iv = packed.subarray(0, 12);
  const tag = packed.subarray(12, 28);
  const encrypted = packed.subarray(28);
  const decipher = createDecipheriv("aes-256-gcm", SECRET_KEY, iv);

  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return unpackBytes(decrypted);
}

function serializeAsset(asset: BinaryAsset | null): StoredBinaryAsset | null {
  if (!asset) {
    return null;
  }

  return {
    id: asset.id,
    name: asset.name,
    type: asset.type,
    size: asset.size,
    encryptedBytes: encryptBytes(asset.bytes),
  };
}

function deserializeAsset(asset: StoredBinaryAsset | null): BinaryAsset | null {
  if (!asset) {
    return null;
  }

  return {
    id: asset.id,
    name: asset.name,
    type: asset.type,
    size: asset.size,
    bytes: decryptBytes(asset.encryptedBytes),
  };
}

function serializeLayoutItem(item: LayoutItem): StoredLayoutItem {
  return {
    ...item,
    backgroundImage: serializeAsset(item.backgroundImage),
    attachments: item.attachments.map((asset) => serializeAsset(asset)!),
    tabs: item.tabs?.map(serializeTabPane),
  };
}

function deserializeLayoutItem(item: StoredLayoutItem): LayoutItem {
  return {
    ...item,
    backgroundImage: deserializeAsset(item.backgroundImage),
    attachments: item.attachments
      .map((asset) => deserializeAsset(asset))
      .filter((asset): asset is BinaryAsset => Boolean(asset)),
    tabs: item.tabs?.map(deserializeTabPane),
  };
}

function serializeTabPane(tab: TabPane): StoredTabPane {
  return {
    ...tab,
    layout: tab.layout.map(serializeLayoutItem),
  };
}

function deserializeTabPane(tab: StoredTabPane): TabPane {
  return {
    ...tab,
    layout: tab.layout.map(deserializeLayoutItem),
  };
}

function serializeTemplate(template: DashboardTemplate): StoredDashboardTemplate {
  return {
    ...template,
    layout: template.layout.map(serializeLayoutItem),
  };
}

function deserializeTemplate(template: StoredDashboardTemplate): DashboardTemplate {
  return {
    ...template,
    layout: template.layout.map(deserializeLayoutItem),
  };
}

async function ensureDashboardFile() {
  await fs.mkdir(path.dirname(DASHBOARD_PATH), { recursive: true });

  try {
    await fs.access(DASHBOARD_PATH);
  } catch {
    await fs.writeFile(DASHBOARD_PATH, "[]\n", "utf8");
  }
}

async function readStoredTemplates(): Promise<StoredDashboardTemplate[]> {
  await ensureDashboardFile();

  const raw = await fs.readFile(DASHBOARD_PATH, "utf8");
  const parsed = raw.trim() ? JSON.parse(raw) : [];

  return Array.isArray(parsed) ? parsed : [];
}

async function writeStoredTemplates(templates: StoredDashboardTemplate[]) {
  await ensureDashboardFile();
  await fs.writeFile(DASHBOARD_PATH, `${JSON.stringify(templates, null, 2)}\n`, "utf8");
}

export async function readDashboardTemplates() {
  const templates = await readStoredTemplates();
  return templates.map(deserializeTemplate);
}

export async function readDashboardTemplate(id: string) {
  const templates = await readDashboardTemplates();
  return templates.find((template) => template.id === id) ?? null;
}

export async function upsertDashboardTemplate(template: DashboardTemplate) {
  const templates = await readStoredTemplates();
  const serialized = serializeTemplate(template);
  const index = templates.findIndex((entry) => entry.id === template.id);

  if (index >= 0) {
    templates[index] = serialized;
  } else {
    templates.push(serialized);
  }

  await writeStoredTemplates(templates);
  return template;
}
