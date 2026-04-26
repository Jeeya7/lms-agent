import React from "react";
import ScheduleDay from "./ScheduleDay";

/**
 * Full 7-day schedule view. Wraps all ScheduleDay rows in a card.
 *
 * Props:
 *   schedule   {array} – array of { day, blocks[] } objects
 *   allCourses {array} – ordered list of unique course names for color mapping
 */
export default function ScheduleView({ schedule, allCourses }) {
  return (
    <div
      className="bg-white"
      style={{
        border: "1px solid #e2e8f0",
        borderRadius: 14,
        padding: "1.25rem",
      }}
    >
      {schedule.map(({ day, blocks }) => (
        <ScheduleDay
          key={day}
          day={day}
          blocks={blocks}
          courses={allCourses}
        />
      ))}
    </div>
  );
}
