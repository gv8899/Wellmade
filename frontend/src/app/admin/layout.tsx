"use client";
import { RequireAdmin } from "@/components/auth/RequireAdmin";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { AuthDebug } from "@/components/debug/AuthDebug";
import { ReactNode } from "react";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <RequireAdmin>
      <div className="min-h-screen bg-gray-50">
        {/* Admin Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900">管理後台</h1>
          </div>
        </header>
        
        {/* Admin Content */}
        <div className="flex">
          {/* Sidebar */}
          <AdminSidebar />
          
          {/* Main Content */}
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
      <AuthDebug />
    </RequireAdmin>
  );
}