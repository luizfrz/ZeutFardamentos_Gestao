import { RegistrationTabs } from "./registration-tabs";

export async function RegistrationContent({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { tab } = await searchParams;
  return <RegistrationTabs initialTab={tab === "responsible" ? "responsible" : "client"} />;
}
