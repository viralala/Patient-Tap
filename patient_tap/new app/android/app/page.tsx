"use client";
import { useEffect, useState } from "react";
import App from "@/components/App";

export default function Page() {
  // Render only after mount — the app reads localStorage (profile, PIN, tag),
  // so we avoid SSR/CSR hydration mismatches by deferring to the client.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) {
    return (
      <div className="stage">
        <div className="device" />
      </div>
    );
  }
  return <App />;
}
