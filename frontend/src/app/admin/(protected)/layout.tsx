"use client";

import { AdminShell } from "@/components/admin/admin-shell";
import { RequireAuth } from "@/components/admin/require-auth";

export default function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth>
      <AdminShell>{children}</AdminShell>
    </RequireAuth>
  );
}
