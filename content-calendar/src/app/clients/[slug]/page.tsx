import { Suspense } from "react";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { getProjectConfig } from "@/lib/client-config-storage";
import { toClientConfig, hasChannel } from "@/data/client-config";
import CalendarOnlyClient from "@/components/CalendarOnlyClient";
import DashboardClient from "@/components/DashboardClient";
import TokenGate from "@/components/admin/TokenGate";

export const dynamic = "force-dynamic";

export default async function ClientPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { slug } = await params;
  const { token } = await searchParams;
  const project = await getProjectConfig(slug);

  if (!project) {
    notFound();
  }

  // Token check
  if (project.accessToken) {
    const cookieStore = await cookies();
    const adminAuth = cookieStore.get("cc-admin-auth");
    const isAdmin = adminAuth?.value === "authenticated";
    const tokenValid = token === project.accessToken;

    if (!isAdmin && !tokenValid) {
      return <TokenGate clientName={project.name} />;
    }
  }

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
        <CalendarOnlyClient config={config} />
      ) : (
        <DashboardClient config={config} />
      )}
    </Suspense>
  );
}
