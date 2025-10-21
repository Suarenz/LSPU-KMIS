"use client";

import { type ReactNode } from "react";
import { AuthProvider as AuthProviderImpl } from "@/lib/auth-context";

export function AuthProvider({ children }: { children: ReactNode }) {
  // Render the AuthProvider directly - it handles server/client differences internally
 return <AuthProviderImpl>{children}</AuthProviderImpl>;
}