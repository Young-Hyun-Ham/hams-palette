import { notFound } from "next/navigation";

import { PublishedTemplatePage } from "@/app/components/PublishedTemplatePage";
import { readDashboardTemplateByRoute } from "@/app/utils/dashboard-store";

type PageProps = {
  params: Promise<{
    userId: string;
    templateKey: string;
  }>;
};

export default async function UserTemplatePage({ params }: PageProps) {
  const { userId, templateKey } = await params;
  const template = await readDashboardTemplateByRoute(userId, templateKey);

  if (!template) {
    notFound();
  }

  return <PublishedTemplatePage template={template} />;
}
