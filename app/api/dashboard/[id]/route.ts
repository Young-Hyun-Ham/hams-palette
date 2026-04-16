import { NextResponse } from "next/server";

import { readDashboardTemplate } from "@/app/utils/dashboard-store";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_: Request, context: RouteContext) {
  const { id } = await context.params;
  const template = await readDashboardTemplate(id);

  if (!template) {
    return NextResponse.json({ message: "Template not found." }, { status: 404 });
  }

  return NextResponse.json(template);
}
