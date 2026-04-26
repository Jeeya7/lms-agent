import React from "react";
import { COURSE_COLORS } from "../utils/difficultyStyles";

/**
 * Renders a single day row in the weekly schedule view.
 *
 * Props:
 *   day     {string}  – e.g. "Mon Apr 27"
 *   blocks  {array}   – study block objects for this day
 *   courses {array}   – ordered list of all unique course names (used for color mapping)
 */
export default function ScheduleDay({ day, blocks, courses }) {
  const isEmpty = blocks.length === 0;

  return (
    <div className="mb-5">
      {/* Day header */}
      <div
        className="font-semibold text-gray-700 mb-2 pb-1"
        style={{
          fontSize: 12,
          fontFamily: "'DM Mono', monospace",
          borderBottom: "1px solid #f1f5f9",
        }}
      >
        {day}
      </div>

      {isEmpty ? (
        <p className="text-gray-300 italic pl-1" style={{ fontSize: 12 }}>
          No study blocks — rest day
        </p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {blocks.map((block, i) => {
            // Match block.course (short form) against full course names
            const courseIdx = courses.findIndex((c) =>
              c.startsWith(block.course)
            );
            const cc =
              COURSE_COLORS[
                (courseIdx === -1 ? 0 : courseIdx) % COURSE_COLORS.length
              ];

            return (
              <div
                key={i}
                className="flex gap-2.5 items-start rounded-lg"
                style={{
                  padding: "8px 12px",
                  background: cc.bg,
                }}
              >
                {/* Time */}
                <div
                  className="font-semibold shrink-0 pt-px"
                  style={{
                    minWidth: 90,
                    fontSize: 11,
                    fontFamily: "'DM Mono', monospace",
                    color: cc.text,
                  }}
                >
                  {block.time}
                </div>

                {/* Block details */}
                <div className="flex-1 min-w-0">
                  <div
                    className="font-semibold text-gray-900 truncate"
                    style={{ fontSize: 13 }}
                  >
                    {block.assignment}
                  </div>
                  <div style={{ fontSize: 11, color: cc.text, marginTop: 1 }}>
                    {block.course} · {block.hours}h
                  </div>
                  <div
                    className="text-gray-500 italic mt-0.5"
                    style={{ fontSize: 11 }}
                  >
                    {block.reason}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
