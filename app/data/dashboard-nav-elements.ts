import {
  Home,
  Package,
  Calendar,
  Image,
  Users,
  Settings,
  User,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const adminNav: NavItem[] = [
  { href: "/overview", label: "Dashboard", icon: Home },
  { href: "/manage-packages", label: "Manage Packages", icon: Package },
  { href: "/manage-bookings", label: "Manage Bookings", icon: Calendar },
  { href: "/manage-gallery", label: "Manage Gallery", icon: Image },
  { href: "/manage-team", label: "Manage Team", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
];

export const customerNav: NavItem[] = [
  { href: "/customer-dashboard", label: "Dashboard", icon: Home },
  { href: "/customer-bookings", label: "My Bookings", icon: Calendar },
  { href: "/customer-profile", label: "Profile", icon: User },
  // { href: "/payments", label: "Payments", icon: CreditCard },
  // { href: "/uploads", label: "My Uploads", icon: Upload },
  // { href: "/packages", label: "Browse Packages", icon: Package },
];

export const teamNav: NavItem[] = [
  { href: "/team-dashboard", label: "Dashboard", icon: Home },
  // { href: "/bookings", label: "My Assignments", icon: Calendar },
  // { href: "/deliverables", label: "Deliverables", icon: Upload },
  // { href: "/profile", label: "Profile", icon: User },
];
