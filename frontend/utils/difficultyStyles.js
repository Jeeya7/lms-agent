/**
 * Badge styles for each difficulty level.
 */
export const DIFFICULTY_CONFIG = {
  easy:   { label: "Easy", bg: "#e8f5e9", color: "#2e7d32" },
  medium: { label: "Med",  bg: "#fff8e1", color: "#f57f17" },
  hard:   { label: "Hard", bg: "#fce4ec", color: "#c62828" },
};

/**
 * Rotating palette for course color-coding.
 * Each course gets assigned a color by its index in the unique courses list.
 */
export const COURSE_COLORS = [
  { bg: "#ede7f6", accent: "#5e35b1", text: "#4527a0" },
  { bg: "#e3f2fd", accent: "#1565c0", text: "#0d47a1" },
  { bg: "#e8f5e9", accent: "#2e7d32", text: "#1b5e20" },
  { bg: "#fff3e0", accent: "#e65100", text: "#bf360c" },
];

/**
 * Returns a color object for a given course name based on its position
 * in the list of all unique courses.
 */
export function getCourseColor(course, allCourses) {
  const idx = allCourses.indexOf(course);
  return COURSE_COLORS[idx % COURSE_COLORS.length];
}

/**
 * Returns a hex color string for a priority score.
 */
export function getPriorityColor(score) {
  if (score >= 85) return "#dc2626";
  if (score >= 65) return "#d97706";
  return "#16a34a";
}
