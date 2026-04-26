import React from "react";

/**
 * Top navigation bar.
 * Shows the StudyPilot logo and, once a result exists, an export button.
 *
 * Props:
 *   hasResult  {boolean}  – whether to show the header export button
 *   onDownload {function} – called when the export button is clicked
 */
export default function Header({ hasResult, onDownload }) {
  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-4 lg:px-10">
        {/* Logo */}
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-700 text-white shadow-sm">
            <span className="text-base">✦</span>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-slate-900">StudyPilot</span>
              <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                AI-Powered
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Plan smarter with deadline-aware study scheduling.
            </p>
          </div>
        </div>

        {/* Header-level export button (only visible after plan is generated) */}
        {hasResult && (
          <button
            onClick={onDownload}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-indigo-700 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-800"
          >
            ↓ Export to Outlook
          </button>
        )}
      </div>
    </header>
  );
}
