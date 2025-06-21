"use client";
import { useSession } from "next-auth/react";
import { useUser } from "@/app/components/UserContext";

export function AuthDebug() {
  const { data: session, status } = useSession();
  const { user, isLoading } = useUser();

  // 只在開發環境顯示
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-black bg-opacity-80 text-white p-2 rounded text-xs max-w-xs z-10 shadow-lg">
      <div className="font-bold mb-1 text-yellow-300">Auth Debug</div>
      <div>Session Status: {status}</div>
      <div>User Loading: {isLoading ? 'true' : 'false'}</div>
      <div>Has User: {user ? 'true' : 'false'}</div>
      <div>Has Session: {session ? 'true' : 'false'}</div>
      {user && <div>User Roles: {user.roles?.join(', ')}</div>}
      {session && <div>Backend Token: {(session as any).backendToken ? 'exists' : 'missing'}</div>}
    </div>
  );
}