"use client";
import React from "react";
import dynamic from "next/dynamic";

const Next13ProgressBar = dynamic(() => import("next13-progressbar").then((mod) => mod.Next13ProgressBar), { ssr: false });

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <div>
      {children}
      <Next13ProgressBar height="4px" color="#151515" options={{ showSpinner: true }} showOnShallow />
    </div>
  );
}
