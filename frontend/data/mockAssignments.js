export const MOCK_SUMMARY = {
  totalAssignments: 8,
  totalHours: 19.5,
  hardestCourse: "CS 4780: Machine Learning",
  studyBlocks: 14,
};

export const MOCK_ASSIGNMENTS = [
  {
    id: 1,
    course: "CS 4780: Machine Learning",
    title: "Problem Set 4 – Backprop",
    dueDate: "2026-04-29",
    estimatedHours: 4.5,
    difficulty: "hard",
    priorityScore: 94,
    reasoning:
      "Due in 3 days. Heavy math + coding. Start now to leave buffer for debugging.",
  },
  {
    id: 2,
    course: "CS 4780: Machine Learning",
    title: "Reading: Attention Is All You Need",
    dueDate: "2026-04-28",
    estimatedHours: 1.5,
    difficulty: "medium",
    priorityScore: 88,
    reasoning: "Due tomorrow. Dense paper but focused scope — one sitting.",
  },
  {
    id: 3,
    course: "ECON 3210: Econometrics",
    title: "Regression Lab Report",
    dueDate: "2026-05-01",
    estimatedHours: 3.5,
    difficulty: "medium",
    priorityScore: 76,
    reasoning:
      "5 days out. Requires R output + write-up. Split across two sessions.",
  },
  {
    id: 4,
    course: "ECON 3210: Econometrics",
    title: "Weekly Quiz 9",
    dueDate: "2026-04-30",
    estimatedHours: 1.0,
    difficulty: "easy",
    priorityScore: 65,
    reasoning: "Online quiz, 4 days away. 30-min review the morning before.",
  },
  {
    id: 5,
    course: "WRIT 2850: Technical Writing",
    title: "Draft: API Documentation",
    dueDate: "2026-05-02",
    estimatedHours: 2.5,
    difficulty: "easy",
    priorityScore: 58,
    reasoning:
      "First draft — not final grade. Start mid-week to leave revision time.",
  },
  {
    id: 6,
    course: "WRIT 2850: Technical Writing",
    title: "Peer Review (2 papers)",
    dueDate: "2026-05-03",
    estimatedHours: 1.5,
    difficulty: "easy",
    priorityScore: 45,
    reasoning:
      "Due Sunday. Lightweight — schedule after your own draft is done.",
  },
  {
    id: 7,
    course: "MATH 4150: Linear Algebra",
    title: "Homework 7 – Eigenspaces",
    dueDate: "2026-05-01",
    estimatedHours: 3.0,
    difficulty: "hard",
    priorityScore: 81,
    reasoning:
      "Proofs-heavy. Needs uninterrupted focus blocks. Avoid splitting mid-problem.",
  },
  {
    id: 8,
    course: "MATH 4150: Linear Algebra",
    title: "Concept Check Quiz",
    dueDate: "2026-04-29",
    estimatedHours: 0.5,
    difficulty: "easy",
    priorityScore: 72,
    reasoning: "Short auto-graded quiz. 30 min max — do it first on Monday.",
  },
];
