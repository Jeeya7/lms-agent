export const MOCK_SCHEDULE = [
  {
    day: "Mon Apr 27",
    blocks: [
      {
        time: "9:00–9:30 AM",
        course: "MATH 4150",
        assignment: "Concept Check Quiz",
        hours: 0.5,
        reason: "Short win to start the week. Clears a deadline.",
      },
      {
        time: "10:00–11:30 AM",
        course: "CS 4780",
        assignment: "Reading: Attention Is All You Need",
        hours: 1.5,
        reason: "Due tomorrow — highest urgency after quiz.",
      },
      {
        time: "3:00–5:00 PM",
        course: "CS 4780",
        assignment: "Problem Set 4 – Backprop",
        hours: 2.0,
        reason: "First block on highest-priority assignment.",
      },
    ],
  },
  {
    day: "Tue Apr 28",
    blocks: [
      {
        time: "9:00–11:00 AM",
        course: "CS 4780",
        assignment: "Problem Set 4 – Backprop",
        hours: 2.0,
        reason: "Continues PS4. Due tomorrow — finish implementation today.",
      },
      {
        time: "2:00–3:30 PM",
        course: "MATH 4150",
        assignment: "Homework 7 – Eigenspaces",
        hours: 1.5,
        reason: "No conflicts this afternoon. Proofs need focus.",
      },
    ],
  },
  {
    day: "Wed Apr 29",
    blocks: [
      {
        time: "10:00–11:30 AM",
        course: "MATH 4150",
        assignment: "Homework 7 – Eigenspaces",
        hours: 1.5,
        reason: "Continues HW7 — 2 days before deadline, steady progress.",
      },
      {
        time: "1:00–2:30 PM",
        course: "ECON 3210",
        assignment: "Regression Lab Report",
        hours: 1.5,
        reason: "Start lab report. Run R code first, write-up later.",
      },
    ],
  },
  {
    day: "Thu Apr 30",
    blocks: [
      {
        time: "9:00–10:00 AM",
        course: "ECON 3210",
        assignment: "Weekly Quiz 9",
        hours: 1.0,
        reason: "Due today — morning review + complete.",
      },
      {
        time: "11:00 AM–12:00 PM",
        course: "MATH 4150",
        assignment: "Homework 7 – Eigenspaces",
        hours: 1.0,
        reason: "Final push on HW7. Due tomorrow.",
      },
      {
        time: "3:00–4:30 PM",
        course: "WRIT 2850",
        assignment: "Draft: API Documentation",
        hours: 1.5,
        reason: "Low-stakes — good afternoon slot for writing.",
      },
    ],
  },
  {
    day: "Fri May 1",
    blocks: [
      {
        time: "10:00–12:00 PM",
        course: "ECON 3210",
        assignment: "Regression Lab Report",
        hours: 2.0,
        reason: "Final write-up. Due today.",
      },
      {
        time: "2:00–3:00 PM",
        course: "WRIT 2850",
        assignment: "Draft: API Documentation",
        hours: 1.0,
        reason: "Finish draft. 1 day early — buffer for edits.",
      },
    ],
  },
  {
    day: "Sat May 2",
    blocks: [
      {
        time: "10:00–11:30 AM",
        course: "WRIT 2850",
        assignment: "Peer Review (2 papers)",
        hours: 1.5,
        reason:
          "Weekend morning. Low cognitive load — ideal for reviewing others' work.",
      },
    ],
  },
  {
    day: "Sun May 3",
    blocks: [
      {
        time: "11:00 AM–12:00 PM",
        course: "WRIT 2850",
        assignment: "Peer Review (2 papers)",
        hours: 0.5,
        reason: "Final review pass if needed. Due today.",
      },
    ],
  },
];
