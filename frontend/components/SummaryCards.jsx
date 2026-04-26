import React from "react";

/**
 * A single metric card used in the results summary row.
 *
 * Props:
 *   label  {string} – small uppercase label above the value
 *   value  {string|number} – large displayed metric
 *   sub    {string} – small descriptive text below the value
 *   accent {string} – hex color for the top border accent
 */
function SummaryCard({ label, value, sub, accent }) {
  return (
    <div
      className="bg-white"
      style={{
        border: "1px solid #e2e8f0",
        borderRadius: 12,
        padding: "1.25rem",
        borderTop: `3px solid ${accent}`,
      }}
    >
      <div
        className="font-medium text-gray-500 uppercase tracking-wide mb-1.5"
        style={{ fontSize: 11, letterSpacing: "0.05em" }}
      >
        {label}
      </div>
      <div
        className="font-bold text-gray-900"
        style={{
          fontSize: 26,
          fontFamily: "'DM Mono', monospace",
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>
      {sub && (
        <div className="text-gray-500 mt-1" style={{ fontSize: 12 }}>
          {sub}
        </div>
      )}
    </div>
  );
}

/**
 * Grid of four summary metric cards shown at the top of the results view.
 *
 * Props:
 *   summary {object} – { totalAssignments, totalHours, hardestCourse, studyBlocks }
 */
export default function SummaryCards({ summary }) {
  return (
    <div className="grid grid-cols-4 gap-3 mb-6">
      <SummaryCard
        label="Assignments"
        value={summary.totalAssignments}
        sub="across all courses"
        accent="#3730a3"
      />
      <SummaryCard
        label="Est. hours"
        value={`${summary.totalHours}h`}
        sub="total study time"
        accent="#6d28d9"
      />
      <SummaryCard
        label="Hardest course"
        value="ML"
        sub={summary.hardestCourse}
        accent="#dc2626"
      />
      <SummaryCard
        label="Study blocks"
        value={summary.studyBlocks}
        sub="this week"
        accent="#16a34a"
      />
    </div>
  );
}
