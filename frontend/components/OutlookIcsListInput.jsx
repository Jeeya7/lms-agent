import React from "react";
import IcsInputField from "./IcsInputField";

export default function OutlookIcsListInput({
    links,
    errors,
    onChangeLink,
    onAddLink,
    onRemoveLink,
}) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-slate-700">
                    Outlook ICS Links <span className="text-rose-500">*</span>
                </h3>
                <button
                    type="button"
                    onClick={onAddLink}
                    className="inline-flex h-9 items-center rounded-lg border border-indigo-200 bg-indigo-50 px-3 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
                >
                    + Add another calendar
                </button>
            </div>

            <div className="space-y-4">
                {links.map((link, index) => (
                    <IcsInputField
                        key={index}
                        label={`Outlook ICS Link ${index + 1}`}
                        value={link}
                        onChange={(next) => onChangeLink(index, next)}
                        placeholder="Paste your Outlook calendar ICS link"
                        error={errors[index] || ""}
                        required
                        onRemove={links.length > 1 ? () => onRemoveLink(index) : undefined}
                    />
                ))}
            </div>
        </div>
    );
}
