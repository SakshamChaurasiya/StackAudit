import { ImageResponse } from "next/og";
import { selectAudit } from "@/lib/supabase/db";

export const runtime = "edge";
export const alt = "StackAudit Audit Report";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = {
  params: Promise<{ id: string }>;
};

function formatDollars(amount: number): string {
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}k`;
  }
  return `$${amount.toFixed(0)}`;
}

export default async function AuditOgImage({ params }: Props) {
  const { id } = await params;
  const result = await selectAudit(id);

  // Fallback card if audit not found
  if (!result) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #7c3aed 0%, #4c1d95 60%, #1e1b4b 100%)",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div style={{ fontSize: "48px", fontWeight: 800, color: "#fff" }}>
            ⚡ StackAudit
          </div>
          <div style={{ fontSize: "28px", color: "rgba(255,255,255,0.7)", marginTop: "16px" }}>
            AI Spend Audit Report
          </div>
        </div>
      ),
      size
    );
  }

  const { summary } = result;
  const hasSavings = summary.totalAnnualSaving > 0;
  const savingsLabel = formatDollars(summary.totalAnnualSaving);
  const spendLabel = formatDollars(summary.totalMonthlySpend);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #7c3aed 0%, #4c1d95 55%, #1e1b4b 100%)",
          padding: "64px 80px",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "auto",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "rgba(255,255,255,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
              }}
            >
              ⚡
            </div>
            <span style={{ fontSize: "26px", fontWeight: 700, color: "#ffffff" }}>
              StackAudit
            </span>
          </div>
          <div
            style={{
              fontSize: "16px",
              color: "rgba(255,255,255,0.5)",
              fontFamily: "monospace",
            }}
          >
            {id.slice(0, 8)}
          </div>
        </div>

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "center",
          }}
        >
          {hasSavings ? (
            <>
              <div
                style={{
                  fontSize: "22px",
                  color: "rgba(255,255,255,0.65)",
                  fontWeight: 500,
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  marginBottom: "16px",
                }}
              >
                Potential Annual Savings
              </div>
              <div
                style={{
                  fontSize: "120px",
                  fontWeight: 900,
                  color: "#ffffff",
                  lineHeight: 1,
                  letterSpacing: "-4px",
                }}
              >
                {savingsLabel}
              </div>
              <div
                style={{
                  fontSize: "28px",
                  color: "rgba(255,255,255,0.6)",
                  marginTop: "8px",
                  fontWeight: 400,
                }}
              >
                per year
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: "32px", color: "#86efac", fontWeight: 600, marginBottom: "16px" }}>
                ✓ Already Optimised
              </div>
              <div style={{ fontSize: "72px", fontWeight: 800, color: "#ffffff", lineHeight: 1.1 }}>
                Your AI stack
                <br />
                looks clean
              </div>
            </>
          )}
        </div>

        {/* Bottom stats bar */}
        <div
          style={{
            display: "flex",
            gap: "0",
            marginTop: "48px",
            background: "rgba(255,255,255,0.1)",
            borderRadius: "16px",
            overflow: "hidden",
          }}
        >
          {[
            { label: "Monthly Spend", value: spendLabel },
            { label: "Tools Audited", value: String(summary.toolCount) },
            { label: "Recommendations", value: String(summary.recommendationCount) },
            { label: "Savings", value: `${summary.savingsPercent}%` },
          ].map((stat, i) => (
            <div
              key={stat.label}
              style={{
                flex: 1,
                padding: "20px 28px",
                display: "flex",
                flexDirection: "column",
                borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.1)" : "none",
              }}
            >
              <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", marginBottom: "6px" }}>
                {stat.label}
              </div>
              <div style={{ fontSize: "28px", fontWeight: 700, color: "#ffffff" }}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    size
  );
}
