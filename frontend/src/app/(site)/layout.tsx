import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { api, type RestaurantSettings } from "@/lib/api";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let settings: RestaurantSettings | null = null;
  try {
    settings = await api.get<RestaurantSettings>("/restaurant/settings");
  } catch {
    settings = null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter address={settings?.address} phone={settings?.phone} />
    </div>
  );
}
