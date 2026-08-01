"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { ComponentType } from "react";
import { cn } from "@/lib/utils";

/**
 * "Squishy" pricing card (framer-motion). Adapted from the shadcn component to
 * TypeScript + the holographic theme: vibrant oil-slick gradients on near-black,
 * white CTA, animated translucent-white background shapes that squish on hover.
 */
export interface PricingCardProps {
  label: string;
  price: string; // e.g. "₹0" | "₹999"
  period?: string; // e.g. "/mo"
  caption?: string; // e.g. "billed yearly — save 10%"
  tagline: string;
  features: string[];
  cta: string;
  href?: string;
  featured?: boolean;
  /** Tailwind gradient classes for the card face. */
  background: string;
  BGComponent: ComponentType;
}

export const PricingCard = ({
  label,
  price,
  period,
  caption,
  tagline,
  features,
  cta,
  href = "#",
  featured = false,
  background,
  BGComponent,
}: PricingCardProps) => {
  return (
    <motion.div
      whileHover="hover"
      transition={{ duration: 1, ease: "backInOut" }}
      variants={{ hover: { scale: 1.04 } }}
      className={cn(
        "relative h-[456px] w-80 shrink-0 overflow-hidden rounded-[22px] p-7 shadow-[0_34px_70px_-28px_rgba(0,0,0,0.75)]",
        background,
      )}
    >
      {featured && (
        <span className="absolute right-6 top-7 z-20 rounded-full bg-white px-3 py-0.5 text-[11px] font-semibold text-neutral-900">
          Most popular
        </span>
      )}

      <div className="relative z-10 text-white">
        <span className="mb-4 block w-fit rounded-full border border-white/25 bg-white/15 px-3 py-0.5 text-sm font-medium backdrop-blur-sm">
          {label}
        </span>

        <motion.div
          initial={{ scale: 0.85 }}
          variants={{ hover: { scale: 1 } }}
          transition={{ duration: 1, ease: "backInOut" }}
          className="my-1 flex origin-top-left items-baseline font-mono font-black leading-none"
        >
          <span className="text-6xl">{price}</span>
          {period && <span className="ml-1 text-2xl text-white/80">{period}</span>}
        </motion.div>

        {caption && <p className="mt-2 text-xs font-medium text-white/70">{caption}</p>}
        <p className="mt-4 text-sm leading-relaxed text-white/85">{tagline}</p>

        <ul className="mt-4 space-y-2">
          {features.map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-white/90">
              <Check className="h-4 w-4 shrink-0" strokeWidth={2.6} />
              {f}
            </li>
          ))}
        </ul>
      </div>

      <a
        href={href}
        data-cursor="open"
        className="absolute inset-x-4 bottom-4 z-20 rounded-lg border-2 border-white bg-white py-2.5 text-center font-mono text-sm font-black uppercase text-neutral-900 transition-all duration-200 hover:bg-transparent hover:text-white focus:outline-none focus:ring-2 focus:ring-white/60"
      >
        {cta}
      </a>

      <BGComponent />
    </motion.div>
  );
};

/* -------------------------------------------------------------------------- */
/* Animated background shapes (squish on hover via inherited variants)        */
/* -------------------------------------------------------------------------- */

const FILL = "rgba(255,255,255,0.12)";

export const BGComponent1 = () => (
  <motion.svg
    viewBox="0 0 320 384"
    fill="none"
    preserveAspectRatio="xMidYMid slice"
    xmlns="http://www.w3.org/2000/svg"
    variants={{ hover: { scale: 1.5 } }}
    transition={{ duration: 1, ease: "backInOut" }}
    className="absolute inset-0 z-0 h-full w-full"
  >
    <motion.circle
      variants={{ hover: { scaleY: 0.5, y: -25 } }}
      transition={{ duration: 1, ease: "backInOut", delay: 0.2 }}
      cx="160.5"
      cy="114.5"
      r="101.5"
      fill={FILL}
    />
    <motion.ellipse
      variants={{ hover: { scaleY: 2.25, y: -25 } }}
      transition={{ duration: 1, ease: "backInOut", delay: 0.2 }}
      cx="160.5"
      cy="265.5"
      rx="101.5"
      ry="43.5"
      fill={FILL}
    />
  </motion.svg>
);

export const BGComponent2 = () => (
  <motion.svg
    viewBox="0 0 320 384"
    fill="none"
    preserveAspectRatio="xMidYMid slice"
    xmlns="http://www.w3.org/2000/svg"
    variants={{ hover: { scale: 1.05 } }}
    transition={{ duration: 1, ease: "backInOut" }}
    className="absolute inset-0 z-0 h-full w-full"
  >
    <motion.rect
      x="14"
      width="153"
      height="153"
      rx="15"
      fill={FILL}
      variants={{ hover: { y: 219, rotate: "90deg", scaleX: 2 } }}
      style={{ y: 12 }}
      transition={{ delay: 0.2, duration: 1, ease: "backInOut" }}
    />
    <motion.rect
      x="155"
      width="153"
      height="153"
      rx="15"
      fill={FILL}
      variants={{ hover: { y: 12, rotate: "90deg", scaleX: 2 } }}
      style={{ y: 219 }}
      transition={{ delay: 0.2, duration: 1, ease: "backInOut" }}
    />
  </motion.svg>
);

export const BGComponent3 = () => (
  <motion.svg
    viewBox="0 0 320 384"
    fill="none"
    preserveAspectRatio="xMidYMid slice"
    xmlns="http://www.w3.org/2000/svg"
    variants={{ hover: { scale: 1.25 } }}
    transition={{ duration: 1, ease: "backInOut" }}
    className="absolute inset-0 z-0 h-full w-full"
  >
    <motion.path
      variants={{ hover: { y: -50 } }}
      transition={{ delay: 0.3, duration: 1, ease: "backInOut" }}
      d="M148.893 157.531C154.751 151.673 164.249 151.673 170.107 157.531L267.393 254.818C273.251 260.676 273.251 270.173 267.393 276.031L218.75 324.674C186.027 357.397 132.973 357.397 100.25 324.674L51.6068 276.031C45.7489 270.173 45.7489 260.676 51.6068 254.818L148.893 157.531Z"
      fill={FILL}
    />
    <motion.path
      variants={{ hover: { y: -50 } }}
      transition={{ delay: 0.2, duration: 1, ease: "backInOut" }}
      d="M148.893 99.069C154.751 93.2111 164.249 93.2111 170.107 99.069L267.393 196.356C273.251 202.213 273.251 211.711 267.393 217.569L218.75 266.212C186.027 298.935 132.973 298.935 100.25 266.212L51.6068 217.569C45.7489 211.711 45.7489 202.213 51.6068 196.356L148.893 99.069Z"
      fill={FILL}
    />
    <motion.path
      variants={{ hover: { y: -50 } }}
      transition={{ delay: 0.1, duration: 1, ease: "backInOut" }}
      d="M148.893 40.6066C154.751 34.7487 164.249 34.7487 170.107 40.6066L267.393 137.893C273.251 143.751 273.251 153.249 267.393 159.106L218.75 207.75C186.027 240.473 132.973 240.473 100.25 207.75L51.6068 159.106C45.7489 153.249 45.7489 143.751 51.6068 137.893L148.893 40.6066Z"
      fill={FILL}
    />
  </motion.svg>
);
