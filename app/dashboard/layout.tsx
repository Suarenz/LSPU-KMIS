import type React from "react"
import { RegisterServiceWorker } from "../register-sw"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <RegisterServiceWorker />
      {children}
    </>
  )
}
