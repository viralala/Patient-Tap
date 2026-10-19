"use client";

// Last-resort boundary when the root layout itself fails. Must render <html>.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en-IN">
      <body style={{ margin: 0, background: "#0a0a0b", color: "#fff", fontFamily: "system-ui, sans-serif" }}>
        <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", textAlign: "center", padding: 24 }}>
          <div>
            <h1 style={{ fontSize: 32, margin: 0 }}>Patient-Tap is having trouble.</h1>
            <p style={{ opacity: 0.6, marginTop: 12 }}>Please try again. In an emergency, call 112.</p>
            <button
              onClick={reset}
              style={{ marginTop: 24, padding: "12px 24px", borderRadius: 999, border: 0, background: "#fff", color: "#000", fontSize: 14 }}
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
