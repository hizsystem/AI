import { Suspense } from "react";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { getProjectConfig } from "@/lib/client-config-storage";
import { toClientConfig } from "@/data/client-config";
import CalendarOnlyClient from "@/components/CalendarOnlyClient";
import DashboardClient from "@/components/DashboardClient";

export const dynamic = "force-dynamic";

export default async function ClientPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectConfig(slug);

  if (!project) {
    notFound();
  }

  // Admin = edit, everyone else = read-only
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("cc-admin-auth")?.value === "authenticated";
  const readOnly = !isAdmin;

  // Convert to legacy ClientConfig for existing components
  const config = toClientConfig(project);

  const isSimple =
    config.tabs.length === 1 &&
    config.tabs[0] === "calendar" &&
    !config.brands;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="flex items-center gap-3 text-gray-400">
            <svg
              className="animate-spin h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span className="text-sm">Loading...</span>
          </div>
        </div>
      }
    >
      {isSimple ? (
        <CalendarOnlyClient config={config} readOnly={readOnly} />
      ) : (
        <DashboardClient config={config} />
      )}
    </Suspense>
  );
}
