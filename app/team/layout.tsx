import UnifiedDashboard from "../src/layout/dashboard-layout";

export default function TeamDashboard({
  children,
}: {
  children: React.ReactNode;
}) {
  return <UnifiedDashboard>{children}</UnifiedDashboard>;
}