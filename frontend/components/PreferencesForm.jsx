import React from "react";

const CONFIDENCE_HINTS = {
    low: "We'll add more time per assignment and prioritize harder tasks.",
    medium: "Balanced approach - standard effort estimates applied.",
    high: "We'll tighten estimates and spread work more evenly.",
};

/**
 * Step 2 form for collecting user planning preferences.
 *
 * Props:
 *   prefs    {object}   - { confidence, latestTime, daysEarly, maxHours }
 *   onChange {function} - called with the updated prefs object on any field change
 */
export default function PreferencesForm({ prefs, onChange }) {
    const set = (key, value) => onChange({ ...prefs, [key]: value });

    return (
        <div className="flex flex-col gap-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 md:p-6">
            <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Overall confidence in your courses
                </label>
                <div className="grid gap-2 sm:grid-cols-3">
                    {["low", "medium", "high"].map((level) => (
                        <button
                            key={level}
                            type="button"
                            onClick={() => set("confidence", level)}
                            className={`flex h-11 items-center justify-center rounded-xl border text-sm font-semibold transition ${prefs.confidence === level
                                    ? "border-indigo-700 bg-indigo-100 text-indigo-700"
                                    : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300"
                                }`}
                        >
                            {level === "low" ? "😅 Low" : level === "medium" ? "🙂 Medium" : "💪 High"}
                        </button>
                    ))}
                </div>
                <p className="mt-2 text-xs text-slate-500">
                    {CONFIDENCE_HINTS[prefs.confidence]}
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                        Latest I'll work at night
                    </label>
                    <input
                        type="time"
                        value={prefs.latestTime}
                        onChange={(e) => set("latestTime", e.target.value)}
                        className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 font-mono text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                </div>

                <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                        Days early to start assignments
                    </label>
                    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                        <input
                            type="range"
                            min={0}
                            max={7}
                            step={1}
                            value={prefs.daysEarly}
                            onChange={(e) => set("daysEarly", Number(e.target.value))}
                            className="h-2 flex-1 accent-indigo-700"
                        />
                        <span className="min-w-7 font-mono text-sm font-semibold text-indigo-700">
                            {prefs.daysEarly}d
                        </span>
                    </div>
                </div>
            </div>

            <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Max study hours per day <span className="font-normal text-slate-400">(optional)</span>
                </label>
                <input
                    type="number"
                    min={1}
                    max={12}
                    value={prefs.maxHours}
                    placeholder="No limit (e.g. 6)"
                    onChange={(e) => set("maxHours", e.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:w-56"
                />
            </div>
        </div>
    );
}
