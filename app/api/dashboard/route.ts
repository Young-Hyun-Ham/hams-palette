import { NextResponse } from "next/server";

import type { DashboardTemplate } from "@/app/utils/shared";
import { readDashboardTemplates, upsertDashboardTemplate } from "@/app/utils/dashboard-store";

export async function GET() {
  const templates = await readDashboardTemplates();
  return NextResponse.json(templates);
}

export async function POST(request: Request) {
  const template = (await request.json()) as DashboardTemplate;
  const saved = await upsertDashboardTemplate(template);

  return NextResponse.json(saved, { status: 201 });
}
