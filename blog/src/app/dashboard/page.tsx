"use client";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function Dashboard() {
  const { data: session } = useSession();

  // Redirect to login if not authenticated
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center">
          Welcome, {session.user?.name}!
        </h1>
        <p className="text-center text-gray-600">
          Email: {session.user?.email}
        </p>
      </div>
    </div>
  );
}