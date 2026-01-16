"use client"

import { useEffect, useState } from "react"
import { observer } from "mobx-react-lite"

import { AdminLayout } from "@/components/layout/admin-layout"
import { LoginForm } from "@/components/auth/LoginForm"
import { NoSSR } from "@/components/ui/no-ssr"
import authStore from "@/stores/authStore"

const Home = observer(() => {
  const [userRole, setUserRole] = useState<"super-admin" | "admin" | "designer">("admin")

  // Check authentication status on mount and when auth store changes
  useEffect(() => {
    if (authStore.user) {
      const role = (authStore.user as { role: "super-admin" | "admin" | "designer" }).role
      setUserRole(role)
    }
  }, [authStore.user])

  const handleLogin = (role: "super-admin" | "admin" | "designer") => {
    setUserRole(role)
  }

  const handleLogout = () => {
    authStore.logout()
  }

  // Show loading spinner while auth store is initializing
  if (!authStore.isInitialized) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    )
  }

  const authContent = !authStore.user ? (
    <LoginForm onLogin={handleLogin} />
  ) : (
    <AdminLayout userRole={userRole} onLogout={handleLogout} />
  )

  return (
    <NoSSR 
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-white text-lg">Loading...</div>
        </div>
      }
    >
      {authContent}
    </NoSSR>
  )
})

export default Home
