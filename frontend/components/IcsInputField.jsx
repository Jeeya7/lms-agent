import React from "react";

export default function IcsInputField({
    label,
    value,
    onChange,
    placeholder,
    error,
    required = false,
    onRemove,
}) {
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
                <label className="text-sm font-semibold text-slate-700">
                    {label} {required && <span className="text-rose-500">*</span>}
                </label>
                {onRemove && (
                    <button
                        type="button"
                        onClick={onRemove}
                        className="inline-flex h-8 items-center rounded-lg border border-slate-300 px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                    >
                        Remove
                    </button>
                )}
            </div>

            <input
                type="url"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={`h-11 w-full rounded-xl border bg-white px-3 text-sm text-slate-700 outline-none transition ${error
                        ? "border-rose-400 ring-2 ring-rose-100"
                        : "border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    }`}
            />

            {error && <p className="text-xs text-rose-600">{error}</p>}
        </div>
    );
}
