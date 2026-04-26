import React from "react";
import AssignmentCard from "./AssignmentCard";
import { getCourseColor } from "../utils/difficultyStyles";

/**
 * Renders all assignments grouped by course, each group with a colored header.
 *
 * Props:
 *   assignments {array} – full list of assignment objects
 */
export default function AssignmentList({ assignments }) {
  // Build ordered unique course list (preserving first-seen order)
  const allCourses = [...new Set(assignments.map((a) => a.course))];

  return (
    <div>
      {allCourses.map((course) => {
        const courseAssignments = assignments
          .filter((a) => a.course === course)
          .sort((a, b) => b.priorityScore - a.priorityScore);

        const cc = getCourseColor(course, allCourses);

        return (
          <div key={course} className="mb-6">
            {/* Course header */}
            <div className="flex items-center gap-2 mb-2">
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: cc.accent,
                  flexShrink: 0,
                }}
              />
              <span className="font-bold text-gray-900" style={{ fontSize: 13 }}>
                {course}
              </span>
              <span className="text-gray-500" style={{ fontSize: 11 }}>
                {courseAssignments.length} assignment
                {courseAssignments.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Assignment cards */}
            <div className="flex flex-col gap-2">
              {courseAssignments.map((assignment) => (
                <AssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  courseColor={cc}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
