import React from "react";
import IcsInputField from "./IcsInputField";

export default function CanvasIcsInput({ value, onChange, error }) {
    return (
        <IcsInputField
            label="Canvas ICS Link"
            value={value}
            onChange={onChange}
            placeholder="Paste your Canvas calendar ICS link"
            error={error}
            required
        />
    );
}
