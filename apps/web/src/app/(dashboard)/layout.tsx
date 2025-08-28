"use client";

import NavBar from "@/components/Navbar";
import { getToken } from "@/lib/auth-store";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div>
      <NavBar />
      {children}
    </div>
  );
}
