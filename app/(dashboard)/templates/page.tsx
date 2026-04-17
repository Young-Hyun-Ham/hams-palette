import { HomeScreen } from "@/app/components/HomeScreen";
import { readDashboardTemplates } from "@/app/utils/dashboard-store";

export default async function TemplatesPage() {
  const templates = await readDashboardTemplates();

  return <HomeScreen templates={templates} />;
}
