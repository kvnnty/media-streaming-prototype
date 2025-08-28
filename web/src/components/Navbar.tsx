"use client";

import { clearToken } from "@/lib/auth-store";
import Link from "next/link";

export default function NavBar() {
  return (
    <nav style={{ display: "flex", justifyContent: "space-between", padding: "1rem", background: "#222", color: "#fff" }}>
      <div>
        <Link href="/live" className="underline">Live</Link> | <Link href="/videos" className="underline">VOD</Link>
      </div>
      <button
        onClick={() => {
          clearToken();
          window.location.href = "/login";
        }}>
        Logout
      </button>
    </nav>
  );
}
