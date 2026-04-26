import React, { useState, useEffect } from "react";

const PHASES = [
  {
    label: "Assignment Agent",
    sub: "Reading Canvas .ics · parsing deadlines & descriptions",
  },
  {
    label: "Availability Agent",
    sub: "Reading Outlook .ics · finding free time slots",
  },
  {
    label: "Planning Agent",
    sub: "Building weekly schedule · optimizing for priority & energy",
  },
];

/**
 * Full-page loading animation shown while the study plan is being generated.
 * Animates through three agent phases automatically.
 */
export default function LoadingState() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 900);
    const t2 = setTimeout(() => setPhase(2), 1900);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-8 py-16 px-8">
      {/* Spinning icon */}
      <div className="animate-spin-slow" style={{ fontSize: 32 }}>
        ⚙
      </div>

      {/* Heading */}
      <div className="text-center">
        <div
          className="font-bold text-gray-900 mb-1.5"
          style={{ fontSize: 18 }}
        >
          Building your study plan
        </div>
        <div className="text-gray-500" style={{ fontSize: 13 }}>
          Three agents are working in parallel
        </div>
      </div>

      {/* Agent phase cards */}
      <div
        className="w-full flex flex-col gap-2.5"
        style={{ maxWidth: 440 }}
      >
        {PHASES.map((p, i) => {
          const isDone = i < phase;
          const isActive = i === phase;

          return (
            <div
              key={i}
              className="transition-all duration-400"
              style={{
                padding: "12px 16px",
                borderRadius: 10,
                background: i <= phase ? "#f5f3ff" : "#f9fafb",
                border: `1px solid ${i <= phase ? "#c4b5fd" : "#e5e7eb"}`,
              }}
            >
              <div className="flex items-center gap-2">
                {/* Step circle */}
                <div
                  className="flex items-center justify-center font-bold transition-all duration-400"
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    fontSize: 10,
                    color: "#fff",
                    background: isDone
                      ? "#3730a3"
                      : isActive
                      ? "#818cf8"
                      : "#e5e7eb",
                  }}
                >
                  {isDone ? "✓" : i + 1}
                </div>

                {/* Label */}
                <span
                  className="font-semibold"
                  style={{
                    fontSize: 13,
                    color: i <= phase ? "#3730a3" : "#9ca3af",
                  }}
                >
                  {p.label}
                </span>

                {/* "running…" badge */}
                {isActive && (
                  <span
                    className="ml-auto animate-pulse-text"
                    style={{
                      fontSize: 10,
                      color: "#818cf8",
                      fontFamily: "'DM Mono', monospace",
                    }}
                  >
                    running…
                  </span>
                )}
              </div>

              {/* Sub-description (only visible once phase is active or past) */}
              {i <= phase && (
                <div
                  className="text-gray-500 mt-1"
                  style={{ fontSize: 11, paddingLeft: 28 }}
                >
                  {p.sub}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
