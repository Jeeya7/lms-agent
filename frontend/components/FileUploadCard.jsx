import React, { useState, useCallback } from "react";

/**
 * Drag-and-drop file upload zone for a single .ics file.
 *
 * Props:
 *   label    {string}   – e.g. "Upload Canvas .ics"
 *   sublabel {string}   – hint text shown before a file is loaded
 *   icon     {string}   – emoji icon
 *   file     {File|null} – the currently selected file (or null)
 *   onFile   {function} – called with the File object when one is chosen
 */
export default function FileUploadCard({ label, sublabel, icon, file, onFile }) {
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragging(false);
      const f = e.dataTransfer.files[0];
      if (f) onFile(f);
    },
    [onFile]
  );

  return (
    <label
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`group flex min-h-56 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-8 text-center transition ${dragging
          ? "border-indigo-700 bg-indigo-50"
          : file
            ? "border-indigo-300 bg-indigo-50/60"
            : "border-slate-300 bg-slate-50 hover:border-indigo-300 hover:bg-white"
        }`}
    >
      <input
        type="file"
        accept=".ics"
        className="hidden"
        onChange={(e) => e.target.files[0] && onFile(e.target.files[0])}
      />

      <span className="text-3xl">{icon}</span>

      {file ? (
        <>
          <span className="max-w-full truncate font-mono text-sm font-semibold text-indigo-800">
            {file.name}
          </span>
          <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-700">
            ✓ Loaded
          </span>
          <span className="text-xs text-slate-500">Click to replace file</span>
        </>
      ) : (
        <>
          <span className="text-base font-semibold text-slate-800">
            {label}
          </span>
          <span className="text-sm text-slate-500">
            {sublabel}
          </span>
          <span className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-slate-500 shadow-sm ring-1 ring-slate-200">
            Drag & drop or click to browse
          </span>
        </>
      )}
    </label>
  );
}
