import { useState } from "react";

// Components
import Header from "./components/Header";
import StepIndicator from "./components/StepIndicator";
import CanvasIcsInput from "./components/CanvasIcsInput";
import OutlookIcsListInput from "./components/OutlookIcsListInput";
import PreferencesForm from "./components/PreferencesForm";
import LoadingState from "./components/LoadingState";
import SummaryCards from "./components/SummaryCards";
import AssignmentList from "./components/AssignmentList";
import ScheduleView from "./components/ScheduleView";
import ExportButton from "./components/ExportButton";

// Services
import { generateStudyPlan } from "./services/studyPlanService";

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
  const [canvasIcsLink, setCanvasIcsLink] = useState("");
  const [outlookIcsLinks, setOutlookIcsLinks] = useState([""]);
  const [attemptedStep1Submit, setAttemptedStep1Submit] = useState(false);
  const [prefs, setPrefs] = useState({
    confidence: "medium",
    latestTime: "22:00",
    daysEarly: 2,
    maxHours: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [dataSource, setDataSource] = useState(null); // "backend" or "mock"
  const [activeTab, setActiveTab] = useState("assignments");

  // Derived state used in results view
  const allCourses = result
    ? [...new Set(result.assignments.map((a) => a.course))]
    : [];

  // ── Handlers ────────────────────────────────────────────────────────────────

  function validateIcsUrl(value) {
    const trimmed = value.trim();
    if (!trimmed) {
      return "This field is required.";
    }

    try {
      const parsed = new URL(trimmed);
      const isHttp = parsed.protocol === "http:" || parsed.protocol === "https:";
      const hasIcsExtension = parsed.pathname.toLowerCase().endsWith(".ics");

      if (!isHttp || !hasIcsExtension) {
        return "Enter a valid http(s) URL ending in .ics.";
      }

      return "";
    } catch {
      return "Enter a valid http(s) URL ending in .ics.";
    }
  }

  function getFieldError(value) {
    if (!value.trim()) {
      return attemptedStep1Submit ? "This field is required." : "";
    }
    return validateIcsUrl(value);
  }

  function updateOutlookLink(index, value) {
    setOutlookIcsLinks((prev) => prev.map((item, i) => (i === index ? value : item)));
  }

  function addOutlookLink() {
    setOutlookIcsLinks((prev) => [...prev, ""]);
  }

  function removeOutlookLink(index) {
    setOutlookIcsLinks((prev) => prev.filter((_, i) => i !== index));
  }

  function handleStep1Continue() {
    setAttemptedStep1Submit(true);
    if (!isStep1Valid) {
      return;
    }
    setStep(2);
  }

  async function handleGenerate() {
    const payload = {
      canvas_ics: canvasIcsLink.trim(),
      outlook_ics: outlookIcsLinks.map((link) => link.trim()),
    };

    console.log("Study plan request", payload);
    setLoading(true);
    setStep(4);

    try {
      const { data, source } = await generateStudyPlan(
        payload.canvas_ics,
        payload.outlook_ics,
        prefs.selectedCourse || null,
        prefs.confidence || null,
        prefs
      );

      setResult(data);
      setDataSource(source);

      // Log data source for transparency
      if (source === "backend") {
        console.info("✓ Study plan generated from live backend");
      } else {
        console.warn("⚠ Study plan generated from mock data (backend unavailable)");
      }
    } catch (error) {
      console.error("Error generating study plan:", error);
      // Even with error, we should have fallback data from the service
      setDataSource("mock");
    } finally {
      setLoading(false);
    }
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
    setCanvasIcsLink("https://example.edu/canvas_export.ics");
    setOutlookIcsLinks([
      "https://outlook.office.com/calendar_primary.ics",
      "https://outlook.office.com/calendar_club.ics",
    ]);
  }

  const canvasIcsError = getFieldError(canvasIcsLink);
  const outlookIcsErrors = outlookIcsLinks.map(getFieldError);
  const isStep1Valid =
    !canvasIcsError && outlookIcsErrors.every((error) => !error);

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header hasResult={!!result} onDownload={handleDownload} dataSource={dataSource} />

      <main className="mx-auto w-full max-w-7xl px-6 py-8 lg:px-10 lg:py-10">
        <StepIndicator currentStep={step} />

        {/* ── STEP 1: ICS Link Input ──────────────────────────────────────── */}
        {step === 1 && (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6">
              <h1 className="m-0 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                Connect your calendar links
              </h1>
              <p className="mt-2 text-sm text-slate-600 md:text-base">
                Paste one Canvas ICS link and one or more Outlook ICS links to
                get started.
              </p>
            </div>

            <div className="mb-8 space-y-6">
              <CanvasIcsInput
                value={canvasIcsLink}
                onChange={setCanvasIcsLink}
                error={canvasIcsError}
              />

              <OutlookIcsListInput
                links={outlookIcsLinks}
                errors={outlookIcsErrors}
                onChangeLink={updateOutlookLink}
                onAddLink={addOutlookLink}
                onRemoveLink={removeOutlookLink}
              />
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
                onClick={handleStep1Continue}
                disabled={!isStep1Valid}
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
                  {
                    label: "Calendars",
                    value: `Canvas + ${outlookIcsLinks.length} Outlook`,
                  },
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
