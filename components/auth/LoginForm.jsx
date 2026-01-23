"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Image from "next/image"
import authStore from "../../stores/authStore";
export function LoginForm({ onLogin }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [selectedRole, setSelectedRole] = useState("admin")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)



  const handleSubmit = async (e) => {
    e.preventDefault();
    await authStore.login(email, password, selectedRole, onLogin);
  };


  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="grid md:grid-cols-2 w-full max-w-5xl h-[600px] rounded-xl overflow-hidden shadow-2xl">

        {/* Left Section */}
        <div className="bg-black flex flex-col items-center justify-center p-10 space-y-2">
          <div className="relative w-52 h-52">
            <Image src="/logo.png" alt="Logo" fill className="object-contain" priority />
          </div>
          <p className="text-white text-lg font-semibold tracking-wider">Admin Panel</p>
        </div>

        {/* Right Section */}
        <div className="bg-[#141414] flex items-center justify-center p-8 md:p-12">
          <Card className="w-full max-w-md bg-[#141414] border-0 shadow-none">
            <CardContent className="space-y-6">
              <div className="text-center space-y-1">
                <h1 className="text-3xl font-bold text-white">Sign In</h1>
                <p className="text-sm text-gray-400">
                  Enter your credentials to access the admin panel
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Email</label>
                  <Input
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-[#333] border-0 text-white placeholder:text-gray-500 h-12 rounded-md focus:ring-2 focus:ring-[#E50914]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Password</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-[#333] border-0 text-white placeholder:text-gray-500 h-12 rounded-md focus:ring-2 focus:ring-[#E50914]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Role</label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger className="w-full h-12 bg-[#333] border-0 text-white focus:ring-2 focus:ring-[#E50914] focus:outline-none">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#333] border-[#333] text-white">
                      <SelectItem value="super-admin" className="focus:bg-[#E50914] focus:text-white cursor-pointer">Super Admin</SelectItem>
                      <SelectItem value="admin" className="focus:bg-[#E50914] focus:text-white cursor-pointer">Admin</SelectItem>
                      <SelectItem value="designer" className="focus:bg-[#E50914] focus:text-white cursor-pointer">Designer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* ✅ Show error if any */}
                {/* {error && (
                  <p className="text-red-500 text-center text-sm">{error}</p>
                )} */}
                {authStore.loading && <p>Loading...</p>}
                {authStore.error && <p style={{ color: "red" }}>{authStore.error}</p>}

                <Button
                  type="submit"
                  className="w-full bg-[#E50914] hover:bg-[#C40812] text-white font-bold h-12 text-lg rounded-md transition-all"
                  disabled={!email || !password || loading}
                >
                  {authStore.loading ? "Logging in..." : "Login"}

                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
