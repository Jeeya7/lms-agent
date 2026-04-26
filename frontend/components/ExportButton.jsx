import React from "react";

/**
 * Green export banner shown at the bottom of the results view.
 *
 * Props:
 *   studyBlockCount {number}   – number of study blocks in the plan
 *   onDownload      {function} – called when the download button is clicked
 */
export default function ExportButton({ studyBlockCount, onDownload }) {
  return (
    <div
      className="flex items-center justify-between flex-wrap gap-2.5 mt-6"
      style={{
        background: "#f0fdf4",
        border: "1px solid #bbf7d0",
        borderRadius: 12,
        padding: "1rem 1.25rem",
      }}
    >
      <div>
        <div className="font-semibold" style={{ fontSize: 13, color: "#14532d" }}>
          Export to Outlook
        </div>
        <div style={{ fontSize: 12, color: "#166534" }}>
          Downloads a .ics file with {studyBlockCount} study blocks, titles, and
          agent reasoning in the event description.
        </div>
      </div>

      <button
        onClick={onDownload}
        className="text-white font-semibold border-none cursor-pointer"
        style={{
          background: "#16a34a",
          borderRadius: 9,
          padding: "10px 18px",
          fontSize: 13,
        }}
      >
        ↓ Download studypilot-schedule.ics
      </button>
    </div>
  );
}
