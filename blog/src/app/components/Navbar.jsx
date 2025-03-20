"use client"; // This must be at the top to use client-side features

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session, status } = useSession();

  // Show a loading state while session is being fetched
  if (status === "loading") {
    return (
      <nav style={{ padding: "1rem", backgroundColor: "#f5f5f5" }}>
        <p>Loading...</p>
      </nav>
    );
  }

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "1rem",
        backgroundColor: "#f5f5f5",
      }}
    >
      <div>
        <Link href="/" style={{ marginRight: "1rem" }}>
          Home
        </Link>
        <Link href="/dashboard" style={{ marginRight: "1rem" }}>
          Dashboard
        </Link>
      </div>

      <div>
        {session ? (
          <>
            <span style={{ marginRight: "1rem" }}>
              Signed in as {session.user?.name}
            </span>
            <button onClick={() => signOut({ callbackUrl: "/" })}>
              Sign Out
            </button>
          </>
        ) : (
          <Link href="/login">Sign In</Link>
        )}
      </div>
    </nav>
  );
}
