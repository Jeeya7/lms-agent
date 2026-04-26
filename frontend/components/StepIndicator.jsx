import React from "react";

const STEPS = ["Upload", "Preferences", "Generate", "Results"];

/**
 * Horizontal step progress indicator shown at the top of the main content area.
 *
 * Props:
 *   currentStep {number} – 1-based index of the active step
 */
export default function StepIndicator({ currentStep }) {
  return (
    <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:mb-10 md:p-5">
      <div className="flex items-center gap-1.5 md:gap-2">
        {STEPS.map((label, i) => {
          const stepNum = i + 1;
          const isDone = stepNum < currentStep;
          const isActive = stepNum === currentStep;

          return (
            <div
              key={label}
              className="flex min-w-0 flex-1 items-center"
            >
              {/* Circle + label */}
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full font-mono text-xs font-semibold transition md:h-10 md:w-10 ${isDone || isActive
                      ? "border-2 border-indigo-700 bg-indigo-700 text-white"
                      : "border border-slate-300 bg-slate-100 text-slate-500"
                    }`}
                >
                  {isDone ? "✓" : stepNum}
                </div>
                <span className={`truncate text-[11px] md:text-xs ${isDone || isActive ? "font-semibold text-indigo-700" : "text-slate-500"}`}>
                  {label}
                </span>
              </div>

              {/* Connector line */}
              {i < STEPS.length - 1 && (
                <div className={`mb-6 h-[2px] flex-1 rounded ${isDone ? "bg-indigo-700" : "bg-slate-200"} transition`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
