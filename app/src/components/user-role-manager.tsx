"use client";

import { useState } from "react";
import { User, UserRole } from "@/app/types/user";
import { useRouter } from "next/navigation";

interface UserRoleManagerProps {
  user: User; // user being edited
  currentUser: {
    id: string;
    role: UserRole;
  };
}

export default function UserRoleManager({
  user,
  currentUser,
}: UserRoleManagerProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(user.role);
  const router = useRouter();

  const isAdmin = currentUser.role === "admin";
  const isSelf = currentUser.id === user.id;

  // Admin cannot update self
  const canManageUser = isAdmin && !isSelf;

  const handleRoleUpdate = async () => {
    if (!canManageUser) return;
    if (selectedRole === user.role) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/admin/users/${user.id}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedRole }),
      });

      if (response.ok) {
        router.refresh();
        alert("Role updated successfully!");
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch {
      alert("Failed to update role");
    } finally {
      setIsUpdating(false);
    }
  };

  // Hide controls completely if admin is editing self
  if (!canManageUser) {
    return <span className="text-gray-400 text-sm">—</span>;
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={selectedRole}
        onChange={(e) => setSelectedRole(e.target.value as UserRole)}
        className="block w-32 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        disabled={isUpdating}
      >
        <option value="customer">Customer</option>
        <option value="team">Team</option>
        <option value="admin">Admin</option>
      </select>

      {selectedRole !== user.role && (
        <button
          onClick={handleRoleUpdate}
          disabled={isUpdating}
          className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isUpdating ? "Updating..." : "Update"}
        </button>
      )}
    </div>
  );
}
