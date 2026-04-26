import React from "react";
import { DIFFICULTY_CONFIG, getPriorityColor } from "../utils/difficultyStyles";
import { formatDate } from "../utils/formatDate";

/**
 * Card displaying a single assignment's details and AI reasoning.
 *
 * Props:
 *   assignment  {object} – assignment data object
 *   courseColor {object} – { bg, accent, text } color palette for this course
 */
export default function AssignmentCard({ assignment, courseColor }) {
  const diff = DIFFICULTY_CONFIG[assignment.difficulty];
  const scoreColor = getPriorityColor(assignment.priorityScore);

  return (
    <div
      className="bg-white flex gap-4"
      style={{
        border: "1px solid #e2e8f0",
        borderLeft: `4px solid ${courseColor.accent}`,
        borderRadius: 12,
        padding: "1rem 1.25rem",
      }}
    >
      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div
          className="font-semibold text-gray-900 mb-1 truncate"
          style={{ fontSize: 14 }}
        >
          {assignment.title}
        </div>

        {/* Badges row */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          <span
            className="font-medium"
            style={{
              fontSize: 11,
              background: courseColor.bg,
              color: courseColor.text,
              padding: "2px 8px",
              borderRadius: 20,
            }}
          >
            {assignment.course}
          </span>
          <span
            className="font-medium"
            style={{
              fontSize: 11,
              background: diff.bg,
              color: diff.color,
              padding: "2px 8px",
              borderRadius: 20,
            }}
          >
            {diff.label}
          </span>
          <span
            className="text-gray-500"
            style={{ fontSize: 11, fontFamily: "'DM Mono', monospace" }}
          >
            Due {formatDate(assignment.dueDate)}
          </span>
          <span
            className="text-gray-500"
            style={{ fontSize: 11, fontFamily: "'DM Mono', monospace" }}
          >
            ~{assignment.estimatedHours}h
          </span>
        </div>

        {/* Agent reasoning */}
        <div className="text-gray-500 italic" style={{ fontSize: 12 }}>
          "{assignment.reasoning}"
        </div>
      </div>

      {/* Priority score */}
      <div className="flex flex-col items-center justify-center" style={{ minWidth: 44 }}>
        <div
          className="font-bold"
          style={{
            fontSize: 18,
            color: scoreColor,
            fontFamily: "'DM Mono', monospace",
          }}
        >
          {assignment.priorityScore}
        </div>
        <div
          className="text-gray-400 uppercase tracking-wide"
          style={{ fontSize: 9, letterSpacing: "0.05em" }}
        >
          Priority
        </div>
      </div>
    </div>
  );
}
