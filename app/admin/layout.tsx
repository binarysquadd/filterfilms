import UnifiedDashboard from '../src/layout/dashboard-layout';

export default function AdminDashboard({ children }: { children: React.ReactNode }) {
  return <UnifiedDashboard>{children}</UnifiedDashboard>;
}
