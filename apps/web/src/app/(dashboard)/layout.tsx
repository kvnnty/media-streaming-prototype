"use client";

import NavBar from "@/components/Navbar";
import { getAuth } from "@/lib/auth-store";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    const { token, user } = getAuth();

    if (!token || !user) {
      router.replace("/login");
    } else {
      setIsAuthChecked(true);
    }
  }, [router]);

  if (!isAuthChecked) return null;

  return (
    <div>
      <NavBar />
      {children}
    </div>
  );
}
