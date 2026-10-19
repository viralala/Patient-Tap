import { useMemo } from "react";
import QRCode from "qrcode";

/**
 * Renders a QR code as a single SVG path (no innerHTML, no canvas), so it is
 * crisp at any size, prints well, and is scannable straight off the screen.
 */
export function QrCode({
  value,
  size = 160,
  className,
  fg = "#0a0a0b",
  bg = "#ffffff",
  label,
}: {
  value: string;
  size?: number;
  className?: string;
  fg?: string;
  bg?: string;
  label?: string;
}) {
  const { path, count } = useMemo(() => {
    const qr = QRCode.create(value, { errorCorrectionLevel: "M" });
    const n = qr.modules.size;
    const data = qr.modules.data;
    let d = "";
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        if (data[y * n + x]) d += `M${x + 4} ${y + 4}h1v1h-1z`;
      }
    }
    return { path: d, count: n + 8 }; // 4-module quiet zone each side
  }, [value]);

  return (
    <svg
      viewBox={`0 0 ${count} ${count}`}
      width={size}
      height={size}
      shapeRendering="crispEdges"
      role="img"
      aria-label={label ?? `QR code: ${value}`}
      className={className}
    >
      <rect width={count} height={count} fill={bg} />
      <path d={path} fill={fg} />
    </svg>
  );
}
