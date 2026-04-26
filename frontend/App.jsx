import { useState } from "react";

// Components
import Header from "./components/Header";
import StepIndicator from "./components/StepIndicator";
import FileUploadCard from "./components/FileUploadCard";
import PreferencesForm from "./components/PreferencesForm";
import LoadingState from "./components/LoadingState";
import SummaryCards from "./components/SummaryCards";
import AssignmentList from "./components/AssignmentList";
import ScheduleView from "./components/ScheduleView";
import ExportButton from "./components/ExportButton";

// Data
import { MOCK_ASSIGNMENTS, MOCK_SUMMARY } from "./data/mockAssignments";
import { MOCK_SCHEDULE } from "./data/mockSchedule";

// Utils
import { generateICS } from "./utils/generateICS";

// ─── App ──────────────────────────────────────────────────────────────────────
// App.jsx is the single source of state. It owns:
//   - step navigation (1–4)
//   - file selections
//   - preferences
//   - result data
//   - active tab in results view
//
// All state is passed down as props. No prop drilling beyond one level.
// ─────────────────────────────────────────────────────────────────────────────

export default function App() {
  const [step, setStep] = useState(1);
  const [canvasFile, setCanvasFile] = useState(null);
  const [outlookFile, setOutlookFile] = useState(null);
  const [prefs, setPrefs] = useState({
    confidence: "medium",
    latestTime: "22:00",
    daysEarly: 2,
    maxHours: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState("assignments");

  // Derived state used in results view
  const allCourses = result
    ? [...new Set(result.assignments.map((a) => a.course))]
    : [];

  // ── Handlers ────────────────────────────────────────────────────────────────

  function handleGenerate() {
    setLoading(true);
    setStep(4);
    // Replace this timeout with your real API call.
    // Shape the response to match: { summary, assignments, schedule }
    setTimeout(() => {
      setResult({
        summary: MOCK_SUMMARY,
        assignments: MOCK_ASSIGNMENTS,
        schedule: MOCK_SCHEDULE,
      });
      setLoading(false);
    }, 3200);
  }

  function handleDownload() {
    const ics = generateICS(result.schedule);
    const blob = new Blob([ics], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "studypilot-schedule.ics";
    a.click();
    URL.revokeObjectURL(url);
  }

  function loadDemoFiles() {
    setCanvasFile({ name: "canvas_export.ics" });
    setOutlookFile({ name: "outlook_export.ics" });
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header hasResult={!!result} onDownload={handleDownload} />

      <main className="mx-auto w-full max-w-7xl px-6 py-8 lg:px-10 lg:py-10">
        <StepIndicator currentStep={step} />

        {/* ── STEP 1: File Upload ─────────────────────────────────────────── */}
        {step === 1 && (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6">
              <h1 className="m-0 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                Upload your calendars
              </h1>
              <p className="mt-2 text-sm text-slate-600 md:text-base">
                Connect your Canvas course schedule and Outlook availability to
                get started.
              </p>
            </div>

            <div className="mb-8 grid gap-5 md:grid-cols-2">
              <div>
                <div className="mb-2 text-sm font-semibold text-slate-700">
                  Canvas Calendar <span className="text-rose-500">*</span>
                </div>
                <FileUploadCard
                  label="Upload Canvas .ics"
                  sublabel="Export from Canvas → Calendar → Export"
                  icon="📚"
                  file={canvasFile}
                  onFile={setCanvasFile}
                />
              </div>

              <div>
                <div className="mb-2 text-sm font-semibold text-slate-700">
                  Outlook Calendar <span className="text-rose-500">*</span>
                </div>
                <FileUploadCard
                  label="Upload Outlook .ics"
                  sublabel="Export from Outlook → File → Save as"
                  icon="📅"
                  file={outlookFile}
                  onFile={setOutlookFile}
                />
              </div>
            </div>

            <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
              <p className="text-xs text-slate-500">
                Don't have .ics files?{" "}
                <span
                  className="cursor-pointer font-semibold text-indigo-700 underline decoration-indigo-300 underline-offset-2"
                  onClick={loadDemoFiles}
                >
                  Load demo files
                </span>
              </p>

              <button
                onClick={() => setStep(2)}
                disabled={!canvasFile || !outlookFile}
                className="inline-flex h-11 min-w-36 items-center justify-center rounded-xl bg-indigo-700 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
              >
                Continue →
              </button>
            </div>
          </section>
        )}

        {/* ── STEP 2: Preferences ─────────────────────────────────────────── */}
        {step === 2 && (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6">
              <h1 className="m-0 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                Set your preferences
              </h1>
              <p className="mt-2 text-sm text-slate-600 md:text-base">
                These help the planning agent allocate time based on your pace
                and limits.
              </p>
            </div>

            <PreferencesForm prefs={prefs} onChange={setPrefs} />

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => setStep(1)}
                className="inline-flex h-11 min-w-28 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="inline-flex h-11 min-w-36 items-center justify-center rounded-xl bg-indigo-700 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-800"
              >
                Continue →
              </button>
            </div>
          </section>
        )}

        {/* ── STEP 3: Review & Generate ───────────────────────────────────── */}
        {step === 3 && (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6">
              <h1 className="m-0 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                Ready to build your plan
              </h1>
              <p className="mt-2 text-sm text-slate-600 md:text-base">
                Three AI agents will analyze your courses and schedule a full
                week of study blocks.
              </p>
            </div>

            {/* Plan summary preview */}
            <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
              <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Plan summary
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { label: "Calendars", value: "Canvas + Outlook" },
                  {
                    label: "Confidence",
                    value:
                      prefs.confidence.charAt(0).toUpperCase() +
                      prefs.confidence.slice(1),
                  },
                  { label: "Latest work time", value: prefs.latestTime },
                  { label: "Days early", value: `${prefs.daysEarly} days` },
                  {
                    label: "Max hours/day",
                    value: prefs.maxHours ? `${prefs.maxHours}h` : "No limit",
                  },
                  { label: "Planning window", value: "Next 7 days" },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-lg border border-slate-200 bg-white px-3 py-2.5">
                    <div className="text-xs text-slate-400">
                      {label}
                    </div>
                    <div className="font-mono text-sm font-semibold text-slate-900">
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Agent explanation banner */}
            <div className="mb-6 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-900">
              <strong>What happens next:</strong> The Assignment Agent reads
              your Canvas deadlines and estimates effort. The Availability Agent
              finds free slots in your Outlook calendar. The Planning Agent
              builds a prioritized, conflict-free study schedule.
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setStep(2)}
                className="inline-flex h-11 min-w-28 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                ← Back
              </button>
              <button
                onClick={handleGenerate}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-700 to-violet-600 px-7 text-sm font-bold text-white shadow-sm transition hover:from-indigo-800 hover:to-violet-700"
              >
                <span>✦</span> Generate Study Plan
              </button>
            </div>
          </section>
        )}

        {/* ── STEP 4: Loading ─────────────────────────────────────────────── */}
        {step === 4 && loading && <LoadingState />}

        {/* ── STEP 4: Results ─────────────────────────────────────────────── */}
        {step === 4 && !loading && result && (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            {/* Results header */}
            <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="m-0 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                  Your study plan is ready ✦
                </h1>
                <p className="mt-1 text-sm text-slate-600">
                  Apr 27 – May 3 · All courses · Optimized for deadlines &
                  availability
                </p>
              </div>
              <button
                onClick={handleDownload}
                className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-indigo-700 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-800"
              >
                ↓ Export .ics
              </button>
            </div>

            {/* Summary metric cards */}
            <SummaryCards summary={result.summary} />

            {/* Tab switcher */}
            <div className="mb-5 flex gap-1 rounded-xl bg-slate-100 p-1">
              {[
                ["assignments", "Assignments"],
                ["schedule", "Weekly Schedule"],
              ].map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${activeTab === id
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {activeTab === "assignments" && (
              <AssignmentList assignments={result.assignments} />
            )}
            {activeTab === "schedule" && (
              <ScheduleView
                schedule={result.schedule}
                allCourses={allCourses}
              />
            )}

            {/* Export banner */}
            <ExportButton
              studyBlockCount={result.summary.studyBlocks}
              onDownload={handleDownload}
            />
          </section>
        )}
      </main>
    </div>
  );
}
