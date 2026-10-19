"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { HoloCard } from "@/components/holo/holo-card";

// three.js only ships to browsers that will actually render it.
const WristbandScene = dynamic(() => import("./wristband-scene"), { ssr: false });

function canRender3D(): boolean {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") ?? c.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * The hero's centrepiece. Renders the 3D wristband when WebGL is available
 * and motion is welcome; otherwise the holographic credential card. The
 * canvas pauses whenever it scrolls out of view.
 */
export function HeroStage({ progress }: { progress: React.RefObject<number> }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<"pending" | "3d" | "card">("pending");
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setMode(canRender3D() ? "3d" : "card");
  }, []);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "120px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrap} className="relative h-full w-full">
      {mode === "3d" && <WristbandScene progress={progress} active={visible} />}
      {mode === "card" && (
        <div className="flex h-full items-center justify-center [transform-style:preserve-3d]">
          <HoloCard />
        </div>
      )}
    </div>
  );
}
